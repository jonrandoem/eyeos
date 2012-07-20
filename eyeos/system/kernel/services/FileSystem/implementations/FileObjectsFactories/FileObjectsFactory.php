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
 * @subpackage FileSystem
 */
class FileObjectsFactory implements IFileObjectsFactory {
	private static $Instance = null;
	
	private static $Logger = null;
	
	private static $Factories = null;
	
	protected function __construct() {
		self::$Logger = Logger::getLogger('fileSystem.FileObjectFactory');
		
		//load necessary libraries
		require SERVICE_FILESYSTEM_LIBRARIES_PATH . '/ooFiles/main.php';
		lib_ooFiles_load();
		require SERVICE_FILESYSTEM_LIBRARIES_PATH . '/eyeOOFiles/main.php';
		lib_eyeOOFiles_load();
		
		self::$Logger->debug('FileObjectsFactory initialized successfully');
	}
	
	public function checkPath($path) {
		return false;
	}
	
	protected function getAllFileObjectsFactories() {
		if (self::$Factories === null) {
			$directory = new DirectoryIterator(SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_PATH);
			self::$Factories = array();
			foreach ($directory as $fileInfo) {
	    		if($fileInfo->isFile() && $fileInfo->getFilename() != basename(__FILE__)) {
	    			require SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_PATH . '/' . $fileInfo->getFilename();
	    			self::$Factories[] = $fileInfo->getBasename('.php');
	    		}
			}
		}
		return self::$Factories;
	}
	
	/**
	 * @param string $path
	 * @param array $params
	 * @throws EyeAccessControlException If the security manager denied the current context accessing this path.
	 */
	public function getFile($path, $params = null) {
		$Logger = Logger::getLogger('fileObjectsFactory.getFile');
		$Logger->debug("file name: " . $path);

		if ($path == '') {
			throw new EyeInvalidArgumentException('$path cannot be an empty string.');
		}
		foreach($this->getAllFileObjectsFactories() as $fileObjectsFactoryName) {
			$factory = call_user_func(array($fileObjectsFactoryName, 'getInstance'));
			if($factory->checkPath($path)) {
				self::$Logger->debug('FileObjectFactory ' . $fileObjectsFactoryName . ' found for path ' . $path);
				$file = $factory->getFile($path, $params);
				self::$Logger->debug('File object of class ' . get_class($file) . '(' . $file->getPath() . ') created successfully for path ' . $path);
				return $file;
			}
		}
		self::$Logger->warn('Unable to find a FileObjectsFactory handler for ' . $path);
		throw new EyeHandlerNotFoundException('Unable to find a FileObjectsFactory handler for ' . $path);
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$class = __CLASS__;
			self::$Instance = new $class;
		}
		return self::$Instance;
	}
	
	public static function init() {
		self::getInstance();
	}
}

?>
