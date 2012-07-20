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

define('FRAMEWORK_APPLICATION_EXECUTABLES_EYEOSMODULES_DIR', 'EyeosModules');
define('FRAMEWORK_APPLICATION_EXECUTABLES_EYEOSMODULES_PATH', FRAMEWORK_APPLICATION_EXECUTABLES_PATH . '/' . FRAMEWORK_APPLICATION_EXECUTABLES_EYEOSMODULES_DIR);

/**
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
interface IEyeosExecutableModule {
	public function checkExecutePermission();
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
abstract class EyeosApplicationExecutable implements IApplicationExecutable {
	/**
	 * 
	 * @param string $moduleName The name of the module, without suffix ("FileSystem", "UserInfo", ...)
	 * @param string $moduleMethod
	 */
	public static function __callModule($moduleName, $moduleMethod, $params) {
		$moduleName .= 'ExecModule';
		
		if (!class_exists($moduleName)) {
			self::loadModule($moduleName);
		}
		
		$module = new $moduleName();
		if (!is_callable(array($module, $moduleMethod))) {
			throw new EyeInvalidArgumentException($moduleName . '::' . $moduleMethod . '() is not a valid callback.');
		}
		
		// Check permissions first
		$module->checkExecutePermission();
		
		return $module->$moduleMethod($params);
	}
	
	/**
	 * To be overriden by extended classes.
	 */
	public static function __run(AppExecutionContext $context, MMapResponse $response) {}
	
	public static function close($params) {
		//clean the memory
		MemoryManager::getInstance()->free();
		$myProcManager = ProcManager::getInstance();
		$myProcess = $myProcManager->getCurrentProcess();
		$myProcManager->kill($myProcess);
	}
	
	private static function loadModule($moduleName) {
		$path = FRAMEWORK_APPLICATION_EXECUTABLES_EYEOSMODULES_PATH . '/' . utf8_basename($moduleName) . '.php';
		if (!is_file($path) || !is_readable($path)) {
			throw new EyeFileNotFoundException('File not found or not readable for module "' . $moduleName . '".');
		}
		require $path;
	}
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
final class EyeosJavascriptApplicationExecutable extends EyeosApplicationExecutable {
	// nothing here
}

/**
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
class EyeosRestrictedApplicationExecutable extends EyeosApplicationExecutable {
	/**
	 * 
	 * @param string $moduleName The name of the module, without suffix ("FileSystem", "UserInfo", ...)
	 * @param string $moduleMethod
	 */
	public final static function __callModule($moduleName, $moduleMethod, $params) {
		throw new EyeAccessControlException('ExecModules are not available on a restricted application.');
	}
}
?>
