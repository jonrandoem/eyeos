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

abstract class Bootstrap {
	private static $Logger = null;
	
	public static function end() {
		
	}
	
	public static function init() {
		// Get rid of magic_quotes
		if ((function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc()) || ini_get('magic_quotes_sybase')) {
			$_POST = Bootstrap::multidimensionalArrayMap('stripslashes', $_POST);
			$_REQUEST = Bootstrap::multidimensionalArrayMap('stripslashes', $_REQUEST);
			$_GET = Bootstrap::multidimensionalArrayMap('stripslashes', $_GET);
			$_COOKIE = Bootstrap::multidimensionalArrayMap('stripslashes', $_COOKIE);
		}
		if (ini_get('magic_quotes_runtime') && function_exists('set_magic_quotes_runtime')) {
			@set_magic_quotes_runtime(0);
		}
		
		// This is needed to encode json correctly, because of the floating point
		setlocale(LC_ALL, 'en_US.utf8');
		
		// Each MMap plugin should decide waht type of response needs.
		//ob_start('mb_output_handler');
		
		// The environment is safe now, start the system
		Bootstrap::load(EYE_ROOT . '/' . SYSTEM_DIR . '/' . KERNEL_DIR . '/Kernel.php');
		
		//get the priority
		$priorities = Bootstrap::loadPriorities();
		
		// Load all libraries
		Bootstrap::loadLibraries($priorities);
		
		// Initialize self::$Logger for next steps
		self::$Logger = Logger::getLogger('bootstrap.Bootstrap');
		
		// Load all services
		Bootstrap::loadServices($priorities);
		
		// Load all frameworks
		Bootstrap::loadFrameworks($priorities);
	}
	
	/**
	 * All the files are loaded through this, is a good place for debugging
	 */
	private static function load($file) {
		require_once $file;
	}
	
	private static function loadFramework($framework) {
		try {
			Bootstrap::load(FRAMEWORKS_PATH . '/' . $framework . '/' . $framework . '.php');
		} catch (Exception $e) {
			self::$Logger->error('Cannot load framework "' . $framework . '"');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw new EyeBootstrapException('Cannot load framework "' . $framework . '".', 0, $e);
		}
	}
	
	private static function loadFrameworks($priorities) {
		$allElements = self::scanFolderForElements(FRAMEWORKS_PATH);
		$frameworks = self::sortElementsByPriority($priorities['framework'], $allElements);
		
		foreach($frameworks as $framework)  {
			Bootstrap::loadFramework($framework);
		}
	}
	
	private static function loadLibraries($priorities) {
		$allElements = self::scanFolderForElements(LIBRARIES_PATH);
		$libraries = self::sortElementsByPriority($priorities['library'], $allElements);
		
		foreach($libraries as $library)  {
			Bootstrap::loadLibrary($library);
		}
	}
	
	private static function loadLibrary($library) {
		Bootstrap::load(LIBRARIES_PATH . '/' . $library . '/' . $library . '.php');
	
		if (function_exists('lib_' .$library . '_load')) {
			call_user_func('lib_' . $library . '_load');
		}
	}
	
	private static function loadPriorities() {
		$xml = new SimpleXMLElement(EYE_ROOT . '/' . SYSTEM_DIR . '/' . SYSTEM_CONF_DIR . '/bootstrap/boot.xml', null, true);
		
		$toReturn = array(
			'service' => array(),
			'library' => array(),
			'framework' => array()
		);
		
		foreach ($xml->element as $value) {
			$toReturn[strval($value->type)][intval($value->priority)][] = strval($value->name);
		}
		
		krsort($toReturn['service']);
		krsort($toReturn['library']);
		krsort($toReturn['framework']);
		return $toReturn;
	}
	
	private static function loadService($service) {
		try {
			$servicePath = SERVICES_PATH . '/' . $service . '/';
			Bootstrap::load($servicePath . 'interface.php');
			$implementationsPath = $servicePath . '/' . IMPLEMENTATIONS_DIR . '/';
			$directory = new DirectoryIterator($implementationsPath);
			
			foreach ($directory as $fileInfo) {
				if ($fileInfo->isFile()) {
//					self::$Logger->debug('Loading service "' . $fileInfo->getFilename() . '"...');
					Bootstrap::load($implementationsPath . $fileInfo->getFilename());

				}
			}
		} catch (Exception $e) {
			self::$Logger->error('Cannot load service "' . $service . '"');
			if (self::$Logger->isDebugEnabled()) {
				self::$Logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			}
			throw new EyeBootstrapException('Cannot load service "' . $service . '".', 0, $e);
		}
	}
	
	private static function loadServices($priorities) {
		$allElements = self::scanFolderForElements(SERVICES_PATH);
		$services = self::sortElementsByPriority($priorities['service'], $allElements);
		
		foreach($services as $service)  {
			Bootstrap::loadService($service);
		}
	}
	
	private static function multidimensionalArrayMap($func, $arr) {
		$newArr = array();
		
		foreach($arr as $key => $value) {
			$newArr[$key] = (is_array($value) ? Bootstrap::multidimensionalArrayMap($func, $value) : $func($value));
		}
		
		return $newArr;
	}
	
	private static function scanFolderForElements($path) {
		$elements = array();
		$directory = new DirectoryIterator($path);
		foreach ($directory as $fileInfo) {
			$fileInfoName = $fileInfo->getFileName();
			if (!$fileInfo->isDot() && $fileInfoName != '.svn') {
				$elements[] = $fileInfoName;
			}
		}
		return $elements;
	}
	
	private static function sortElementsByPriority(array $prioritizedElements, array $allElements) {
		$sortedElements = array();
		foreach($prioritizedElements as $key => $priority) {
			foreach($priority as $element) {
				$sortedElements[] = $element;
			}
		}
		foreach($allElements as $element) {
			if (!in_array($element, $sortedElements)) {
				$sortedElements[] = $element;
			}
		}
		return $sortedElements;
	}
}

?>