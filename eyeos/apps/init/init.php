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

abstract class InitApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$exception = null;
		
		$procManager = ProcManager::getInstance();
		$myProcess = $procManager->getCurrentProcess();
		$procList = $procManager->getProcessesList();
		
		// There's no "session" process in the table: we are loading a new session
		if (!in_array('session', $procList)) {			
			self::killAll();
			self::startLogin($response);
		}
		// Several active processes: we are probably reloading an existing session (refresh, etc.):
		// we have to restore all running applications from their respective processes
		else {
			try {
				// If the session restoration succeeds, we can restore all running processes
				if (self::restoreSessionProcess($response)) {
					self::restoreAllRunningProcesses($response);
				}
				// otherwise we have to kill all processes and start the login
				else {
					self::killAll();
					self::startLogin($response);
				}
			} catch (Exception $e) {
				// Hold the exception until the init process has been killed
				$exception = $e;
			}
		}
		
		// Job finished, kill our process
		$procManager->kill($myProcess);
		
		if ($exception !== null) {
			throw $exception;
		}
	}
	
	private static function killAll() {
		$procManager = ProcManager::getInstance();
		$myPid = $procManager->getCurrentProcess()->getPid();
		$procList = $procManager->getProcessesTable();
		foreach($procList as $pid => $proc) {
			if ($pid != $myPid) {
				try {
					$procManager->kill($proc);
				} catch (Exception $e) {
					Logger::getLogger('eyeos.init')->warn('Cannot kill process ' . $proc . ': ' . $e->getMessage());
				}
			}
		}
	}
	
	private static function restoreAllRunningProcesses(MMapResponse $response) {
		$procList = ProcManager::getInstance()->getProcessesTable();
		$delayedApps = array();
		foreach($procList as $proc) {
			$procName = strtolower($proc->getName());
			if($procName == 'topmenu' || $procName == 'taskbar') {
				$delayedApps[] = $proc;
			} else if($procName != 'init' && $procName != 'session') {
				// prepare context and execute application
				$currentAppDesc = new EyeosApplicationDescriptor($procName);
				$appContext = new AppExecutionContext();
				$appContext->setApplicationDescriptor($currentAppDesc);
				$appContext->setIncludeBody(true);
				$appContext->setProcess($proc);
				
				MMapGetApp::getInstance()->processRequest(MMapManager::getCurrentRequest(), $response, $appContext);
			}
		}

		//kill the delayed apps, desktop will execute it again later!
		$process = ProcManager::getInstance()->getProcessesList();
		foreach($process as $pid=>$proc) {
			if($proc == 'topmenu' || $proc == 'taskbar') {
			 ProcManager::getInstance()->kill(ProcManager::getInstance()->getProcessByPid($pid));
			}
		}

		//by now this is handled in the desktop
		//because delayed apps are only desktop dependent applications
		//that need to run before desktop
//		foreach($delayedApps as $proc) {
//			$procName = strtolower($proc->getName());
//			$currentAppDesc = new EyeosApplicationDescriptor($procName);
//			$appContext = new AppExecutionContext();
//			$appContext->setApplicationDescriptor($currentAppDesc);
//			$appContext->setIncludeBody(true);
//			$appContext->setProcess($proc);
//
//			MMapGetApp::getInstance()->processRequest(MMapManager::getCurrentRequest(), $response, $appContext);
//		}
	}
	
	private static function restoreSessionProcess(MMapResponse $response) {
		$myProcess = ProcManager::getInstance()->getCurrentProcess();
		$procList = ProcManager::getInstance()->getProcessesTable();
				
		// Restore process "session" first (it gives the login context to use for restoring processes)
		// If a process fails to restore (exception, etc.) that process needs to be killed by MMap,
		// currently running with the login context of this init process, which is empty (anonymous).
		// If we don't assign the login context of the "session" process to our process, we won't be
		// able to kill the faulty process, even if it's running with the logged user.
		foreach($procList as $proc) {
			$procName = strtolower($proc->getName());
			if($procName == 'session') {
				if ($proc->getLoginContext() === null) {
					return false;
				}
				ProcManager::getInstance()->setProcessLoginContext($myProcess->getPid(), $proc->getLoginContext());
				
				// prepare context and execute application
				$currentAppDesc = new EyeosApplicationDescriptor($procName);
				$appContext = new AppExecutionContext();
				$appContext->setApplicationDescriptor($currentAppDesc);
				$appContext->setIncludeBody(true);
				$appContext->setProcess($proc);
				
				MMapGetApp::getInstance()->processRequest(MMapManager::getCurrentRequest(), $response, $appContext);
				break;
			}
		}
		return true;
	}
	
	private static function startLogin(MMapResponse $response) {
		// start Process
		$loginProcess = new Process('login');
		ProcManager::getInstance()->execute($loginProcess);
		
		// prepare context and execute application
		$loginAppDesc = new EyeosApplicationDescriptor('login');
		$appContext = new AppExecutionContext();
		$appContext->setApplicationDescriptor($loginAppDesc);
		$appContext->setIncludeBody(true);
		$appContext->setProcess($loginProcess);
		
		MMapGetApp::getInstance()->processRequest(MMapManager::getCurrentRequest(), $response, $appContext);
	}
}
?>