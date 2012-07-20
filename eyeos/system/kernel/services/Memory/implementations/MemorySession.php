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
 * 
 * @package kernel-services
 * @subpackage Memory
 */
class MemorySession extends Kernel implements IMemory {
	protected function __construct() {
		if(!isset($_SESSION['memory'])) {
			$_SESSION['memory'] = array(
				0 => array('regenerated' => 1)
			);
		}
	}
	
	/**
	 * Gets a saved variable.
	 *
	 * @param string $variableName
	 * @param mixed $defaultValue
	 */
	public function get($variableName, $defaultValue = 0) {
		$pid = MemorySession::getCurrentPid();
		MemorySession::setContext($pid);
		
		if (!isset($_SESSION['memory'][$pid][$variableName])) {
			return $defaultValue;
		}
		
		return $_SESSION['memory'][$pid][$variableName];
	}
	
	/**
	 * Gets the pid of the current process.
	 *
	 * @return int
	 */
	private static function getCurrentPid() {
		if (Kernel::inSystemMode()) {
			return 0;
		}
		
		$process = ProcManager::getInstance()->getCurrentProcess();
		return $process->getPid();
	}
	
	/**
	 * Sets a variable.
	 *
	 * @param string $variableName
	 * @param mixed $variableValue
	 */
	public function set($variableName, $variableValue) {
		$pid = MemorySession::getCurrentPid();
		MemorySession::setContext($pid);
		$_SESSION['memory'][$pid][$variableName] = $variableValue;
	}

	public function free() {
		$pid = MemorySession::getCurrentPid();
		MemorySession::setContext($pid);
		unset($_SESSION['memory'][$pid]);
	}
	
	/**
	 * Reset the memory content
	 */
	public function reset() {
		$_SESSION['memory'] = array();
	}
	
	/**
	 * Sets the context for the given pid.
	 *
	 * @param int $pid
	 */
	private static function setContext($pid) { 
		if (!isset($_SESSION['memory'][$pid]) || !is_array($_SESSION['memory'][$pid])) {
			$_SESSION['memory'][$pid] = array();
		}
	}
}
?>