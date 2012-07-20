<?php
/*
*                 eyeos - The Open Source Cloud's Web Desktop
*                               Version 2.0
*                   Copyright (C) 2007 - 2010 eyeos Team 
* 
* This program is free software; you can redistribute it and/or modify it under
* the terms of the GNU Affero General Public License version 3 as published by the
* Free Software Foundation.
* 
* This program is distributed in the hope that it will be useful, but WITHOUT
* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
* FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
* details.
* 
* You should have received a copy of the GNU Affero General Public License
* version 3 along with this program in the file "LICENSE".  If not, see 
* <http://www.gnu.org/licenses/agpl-3.0.txt>.
* 
* See www.eyeos.org for more details. All requests should be sent to licensing@eyeos.org
* 
* The interactive user interfaces in modified source and object code versions
* of this program must display Appropriate Legal Notices, as required under
* Section 5 of the GNU Affero General Public License version 3.
* 
* In accordance with Section 7(b) of the GNU Affero General Public License version 3,
* these Appropriate Legal Notices must retain the display of the "Powered by
* eyeos" logo and retain the original copyright notice. If the display of the 
* logo is not reasonably feasible for technical reasons, the Appropriate Legal Notices
* must display the words "Powered by eyeos" and retain the original copyright notice. 
*/

/**
 * Implements the IProc instance using the default MemoryManager service as memory.
 * 
 * @package kernel-services
 * @subpackage Proc
 */
class ProcManager extends Kernel implements IProcManager {
	const MINPIDNUMBER = 1000;
	const MAXPIDNUMBER = 9999;
	const MINCHECKNUMNUMBER = 100000000;
	const MAXCHECKNUMNUMBER = 999999999;
	
	/**
	 * @var ArrayList(IProcListener)
	 */
	private $listeners = null;
	
	private $memoryManager;
	private $currentProcess = null;
	private $logger = null;
	
	/**
	 * Protected constructor to avoid external instanstation outside of the kernel singleton.
	 * 
	 */
	protected function __construct() {
		$this->logger = Logger::getLogger('system.services.Proc.ProcManager');
		$this->memoryManager = MemoryManager::getInstance();
		$this->listeners = new ArrayList();
	}
	
	/**
	 * @param IProcListener $listener
	 */
	public function addListener(IProcListener $listener) {
		$this->listeners->append($listener);
	}
	
	/**
	 * Kill the current process, and remove it from the process table.
	 * This method calls to kill() with the current pid as argument.
	 * Is intended to be used by applications, when closing.
	 *
	 * @throws EyeNullPointerException If there is no current process defined
	 */
	public function end() {
		if ($this->currentProcess == null) {
			throw new EyeNullPointerException('Current process is not defined.');
		}
		
		$this->kill($this->currentProcess);
		$this->currentProcess = null;
	}
	
	/**
	 * Execute a new process, and add it to the process table.
	 * This function do not return any value, it fills the object Process received in the arguments
	 * with the information of the new process.
	 * 
	 * @param Process $proc The process to be executed, the attribute <b>name</b> should be filled with the application name to execute
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 */
	public function execute(Process $proc) {
		try {
			$processTable = $this->getProcessesTable();
			
			do {
				$pid = mt_rand(ProcManager::MINPIDNUMBER, ProcManager::MAXPIDNUMBER);
			} while (array_key_exists($pid, $processTable));
			
			$proc->setPid($pid);
			$proc->setTime(time());
			$proc->setChecknum(mt_rand(ProcManager::MINCHECKNUMNUMBER, ProcManager::MAXCHECKNUMNUMBER));
			
			//Check if we are in a context
			//if given process has no login context, default is to copy the current process' one
			if ($proc->getLoginContext() === null) {
				if ($this->currentProcess !== null) {
					$currentLoginContext = $this->currentProcess->getLoginContext();
					if ($currentLoginContext !== null) {
						$proc->setLoginContext(clone $currentLoginContext);
					} else {
					    //FIXME: TODO: move to a metadata!!!!
					    if($proc->getName() != 'login' && $proc->getName() != 'init' && $proc->getName() != 'register') {
						throw new EyeProcException('Cannot execute this application without a valid login context');
					    }
					}
				}
			}
	
			Kernel::enterSystemMode();
	
			//when executing the first process, we need to tell the system
			//that our session has been activated. So regenerated is 0
			if(count($processTable) == 0) {
				$this->memoryManager->set('regenerated', 0);
			}
	
			$processTable[$pid] = $proc;
			$this->currentProcess = $proc;
			
			
			$this->memoryManager->set('processTable', $processTable);
			Kernel::exitSystemMode();
			
			$this->logger->debug('Process execution started: ' . $proc);
			
			$this->fireEvent('processStarted', new ProcEvent($proc));
		} catch (Exception $e) {
			$this->logger->warn('Error executing process: ' . $proc . ' (' . $e->getMessage() . ')');
			if ($this->logger->isDebugEnabled()) {
				$this->logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	public function fireEvent($type, ProcEvent $event) {
		foreach($this->listeners as $listener) {
			if (is_callable(array($listener, $type))) {
				try {
					$listener->$type($event);
				} catch (Exception $e) {
					$this->logger->warn('Exception while trying to fire ' . $type . ' event on listener ' . get_class($listener) . ': ' . $e->getMessage());
				}
			}
		}
	}
	
	/**
	 * @return ArrayList(IProcListener)
	 */
	public function getAllListeners() {
		return $this->listeners;
	}
	
	/**
	 * Returns the current process
	 * 
	 * @throws EyeNullPointerException If there is no current Process
	 */	
	public function getCurrentProcess() {		
		if ($this->currentProcess == null) {
			throw new EyeNullPointerException('Current process is not defined.');
		}
		return clone $this->currentProcess;
	}
	
	/**
	 * Get the instance for the ProcManager class, managed by the singleton.
	 * 
	 * @return ProcManager
	 */
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}
	
	/**
	 * Get the current process Table
	 * 
	 * @return array(Process)
	 */
	public function getProcessesTable() {
		Kernel::enterSystemMode();
		$processTable = $this->memoryManager->get('processTable', array());
		Kernel::exitSystemMode();
		return $processTable;
	}
	
	/**
	 * Get the current process Table
	 * 
	 * @return array Associative array with PID as array keys, and the process name as content
	 */
	public function getProcessesList() {
		$processTable = $this->getProcessesTable();
		$processList = array();

		foreach ($processTable as $pid => $process) {
			$processList[$pid] = $process->getName();
		}
		return $processList;
	}
	
	/**
	 * @param int $checknum
	 * @return Process
	 */
	public function getProcessByChecknum($checknum) {
		$processTable = $this->getProcessesTable();			
		if ($checknum === null) {
			throw new EyeNullPointerException();
		}

		foreach($processTable as $process) {
			if ($process->getChecknum() == $checknum) {
				return clone $process;
			}
		}
		throw new EyeProcException('Process $proc with checknum ' . $checknum . ' not found.');
	}
	
	/**
	 * @param int $pid
	 * @return Process
	 */
	public function getProcessByPid($pid) {
		$processTable = $this->getProcessesTable();			
		if ($pid === null) {
			throw new EyeNullPointerException();
		}
		
		foreach($processTable as $process) {
			if ($process->getPid() == $pid) {
				return clone $process;
			}
		}
		throw new EyeProcException('Process $proc with PID ' . $pid . ' not found.');
	}
	
	/**
	 * Kill a process, and remove it from the process table.
	 *
	 * @param Process $proc the process to be killed, the attribute <b>pid</b> should be filled with the process pid to kill
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 * @throws EyeProcException If there is no such process with the given pid
	 */
	public function kill(Process $proc) {		
		try {
			$processTable = $this->getProcessesTable();
			$pid = $proc->getPid();
			
			if (!isset($processTable[$pid])) {
				throw new EyeProcException('Process $proc with PID ' . $pid . ' not found.');
			}
			
			SecurityManager::getInstance()->checkPermission($proc, new SimplePermission('', array('kill')));
			
			unset($processTable[$pid]);
			
			Kernel::enterSystemMode();
			$this->memoryManager->set('processTable', $processTable);
			Kernel::exitSystemMode();
			
			if ($this->currentProcess->getPid() == $pid) {
				$this->currentProcess = null;
			}
			
			$this->logger->debug('Process killed: ' . $proc);
			
			$this->fireEvent('processKilled', new ProcEvent($proc));
		} catch (Exception $e) {
			$this->logger->warn('Error killing process: ' . $proc . ' (' . $e->getMessage() . ')');
			if ($this->logger->isDebugEnabled()) {
				$this->logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw $e;
		}
	}
	
	/**
	 * @param IProcListener $listener
	 */
	public function removeListener(IProcListener $listener) {
		$this->listeners->remove($listener);
	}
	
	/**
	 * Set the current process.
	 * 
	 * @param Process $proc the process to set as current,  the attribute <b>pid</b> should be filled with the process pid.
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 * @throws EyeProcException If there is no such process with the given pid
	 */	
	public function setCurrentProcess(Process $proc = null) {
		if ($proc !== null) {		
			$processTable = $this->getProcessesTable();
			$pid = $proc->getPid();
			
			if (!isset($processTable[$pid])) {
				throw new EyeProcException('Process $proc with PID ' . $pid . ' not found.');
			}
		}
		$this->currentProcess = $proc;
	}
	
	/**
	 * Change the LoginContext associated with an existing process
	 * 
	 * @param int $pid
	 * @param LoginContext $loginContext
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 * @throws EyeProcException If there is no such process with the given pid
	 */
	public function setProcessLoginContext($pid, LoginContext $loginContext) {		
		$processTable = $this->getProcessesTable();

		if (!isset($processTable[$pid])) {
			throw new EyeProcException('Process $proc with PID ' . $pid . ' not found.');
		}
		
		$processTable[$pid]->setLoginContext($loginContext);
		if ($this->currentProcess->getPid() == $pid) {
			$this->currentProcess = $processTable[$pid];
		}
		
		Kernel::enterSystemMode();
		$this->memoryManager->set('processTable', $processTable);
		Kernel::exitSystemMode();
		
		$this->fireEvent('loginContextChanged', new ProcEvent($processTable[$pid]));
	}
}

?>