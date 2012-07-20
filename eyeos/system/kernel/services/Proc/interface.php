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
 * Defines a generic interface for every Process Manager implementation.
 * 
 * @package kernel-services
 * @subpackage Proc
 */
interface IProcManager {
	/**
	 * Kill the current process, and remove it from the process table.
	 * This method calls to kill() with the current pid as argument.
	 * Is intended to be used by applications, when closing.
	 *
	 * @throws EyeNullPointerException If there is no current process defined
	 */
	public function end();
	
	/**
	 * Execute a new process, and add it to the process table.
	 * This function do not return any value, it fills the object Process received in the arguments
	 * with the information of the new process.
	 * 
	 * @param Process $proc The process to be executed, the attribute <b>name</b> should be filled with the application name to execute
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 */
	public function execute(Process $proc);
	
	/**
	 * Returns the current process
	 * 
	 * @throws EyeNullPointerException If there is no current Process
	 */
	public function getCurrentProcess();
	
	/**
	 * @param int $checknum
	 * @return Process
	 */
	public function getProcessByChecknum($checknum);
	
	/**
	 * @param int $pid
	 * @return Process
	 */
	public function getProcessByPid($pid);
	
	/**
	 * Get the current process Table
	 * 
	 * @return array Associative array with PID as array keys, and the process name as content
	 */
	public function getProcessesList();
	
	/**
	 * Get the current process Table
	 * 
	 * @return array(Process)
	 */
	public function getProcessesTable();
	
	/**
	 * Kill a process, and remove it from the process table.
	 *
	 * @param Process $proc the process to be killed, the attribute <b>pid</b> should be filled with the process pid to kill
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 * @throws EyeProcException If there is no such process with the given pid
	 */
	public function kill(Process $proc);
	
	/**
	 * Set the current process.
	 * 
	 * @param Process $proc the process to set as current,  the attribute <b>pid</b> should be filled with the process pid.
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 * @throws EyeProcException If there is no such process with the given pid
	 */			
	public function setCurrentProcess(Process $proc = null);
	
	/**
	 * Change the LoginContext associated with an existing process
	 * 
	 * @param int $pid
	 * @param LoginContext $loginContext
	 * @throws EyeInvalidArgumentException If the arguments are incorrect
	 * @throws EyeProcException If there is no such process with the given pid
	 */
	public function setProcessLoginContext($pid, LoginContext $loginContext);
}

/**
 * 
 * @package kernel-services
 * @subpackage Proc
 */
interface IApplicationExecutable {
	/**
	 * Calls a method on a child module and returns its result.
	 * 
	 * @param string $moduleName The name of the module, without suffix ("FileChooser", "UserInfo", ...)
	 * @param string $moduleMethod
	 * @param mixed $params
	 * @return mixed
	 */
	public static function __callModule($moduleName, $moduleMethod, $params);
	
	/**
	 * "Runs" the application executable under the specified $context, and -if needed-
	 * writing required Javascript code to the $response.
	 * 
	 * @param AppExecutionContext $context
	 * @param MMapResponse $response
	 * @return void
	 */
	public static function __run(AppExecutionContext $context, MMapResponse $response);
	
	/**
	 * Handles the "close" signal received from the application. Should generally kill
	 * its process and clean the memory.
	 * 
	 * @param mixed $params
	 * @return mixed
	 */
	public static function close($params);
}

/**
 * Represents a system process.
 * 
 * @package kernel-services
 * @subpackage Proc
 */
class Process implements ISimpleMapObject {
	protected $name;
	protected $pid = null;
	protected $loginContext = null;
	protected $checknum = null;
	protected $time = null;
	protected $args = null;
	
	
	public function __construct($name = null) {
		$this->name = $name;
		$this->args = new ArrayList();
	}
	
	public function __clone() {
		$this->setLoginContext($this->getLoginContext());
	}
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
	
	public function getAttributesMap() {
		$props = get_object_vars($this);
		$props['loginContext'] = array(
			'user' => '<none>',
			'group' => '<none>'
		);
		if ($this->loginContext !== null) {
			try {
				$props['loginContext']['user'] = $this->loginContext->getEyeosUser()->getName();
				$props['loginContext']['group'] = $this->loginContext->getEyeosGroup()->getName();
			} catch (EyeNullPointerException $e) {}
		}
		return $props;
	}
	
	public function getArgs() {
		return $this->args;
	}
	
	public function getChecknum() {
		return $this->checknum;
	}
	
	public function getLoginContext() {
		return $this->loginContext;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function getPid() {
		return $this->pid;
	}
	
	public function getTime() {
		return $this->time;
	}
	
	public function setArgs(ArrayList $args) {
		$this->args = $args;
	}
	
	public function setChecknum($checknum) {
		$this->checknum = $checknum;
	}
	
	public function setLoginContext(LoginContext $loginContext = null) {
		$this->loginContext = $loginContext;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function setPid($pid) {
		$this->pid = $pid;
	}
	
	public function setTime($time) {
		$this->time = $time;
	}
}


/**
 * 
 * @package kernel-services
 * @subpackage Proc
 */
interface IProcListener extends IEventListener {
	public function loginContextChanged(ProcEvent $e);
	public function processKilled(ProcEvent $e);
	public function processStarted(ProcEvent $e);
}

/**
 * 
 * @package kernel-services
 * @subpackage Proc
 */
abstract class AbstractProcAdapter implements IProcListener {
	public function loginContextChanged(ProcEvent $e) {}
	public function processKilled(ProcEvent $e) {}
	public function processStarted(ProcEvent $e) {}
}

/**
 * 
 * @package kernel-services
 * @subpackage Proc
 */
class ProcEvent extends EventObject {
	// nothing more
}
?>