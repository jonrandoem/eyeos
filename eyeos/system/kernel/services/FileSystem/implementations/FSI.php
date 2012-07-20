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

define('SERVICE_FILESYSTEM_CONFIGURATION_FILE_EXTENSION', '.xml');

define('SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_DIR', 'FileObjectsFactories');
define('SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_PATH', SERVICE_FILESYSTEM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_DIR);

define('SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_DIR', 'MountpointsManagers');
define('SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PATH', SERVICE_FILESYSTEM_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_DIR);

require SERVICE_FILESYSTEM_FILEOBJECTSFACTORIES_PATH . '/FileObjectsFactory.php';
require SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PATH . '/MountpointsManager.php';

// Load FOF (will load object files libraries located in /libs/eyeOOFiles and /libs/ooFiles)
FileObjectsFactory::init();

// Load libraries from /libs
$directory = new DirectoryIterator(dirname(__FILE__) . '/libs');
foreach ($directory as $fileInfo) {
	if ($fileInfo->isFile()) {
		require $fileInfo->getPathname();
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
abstract class FSI extends Kernel implements IFileSystem, IUrlTranslator {
	private static $Logger;
	private static $configurationFiles = array(
		//filename => SimpleXMLElement
	);
	
	public static function getFile($path, $params = null) {
		self::$Logger = Logger::getLogger('Kernel.FSI');
		self::$Logger->debug("getFile called with path: \"" . $path . "\" and params: " . $params );
		return FileObjectsFactory::getInstance()->getFile($path, $params);
	}
	
	public static function getFileInputStream($path, $params = null, $streamParams = null) {
		return self::getFile($path, $params)->getInputStream($streamParams);
	}
	
	public static function getFileOutputStream($path, $params = null, $streamParams = null) {
		return self::getFile($path, $params)->getOutputStream($streamParams);
	}
	
	/**
	 * @param string $filename
	 * @return SimpleXMLElement
	 * @throws EyeFileNotFoundException
	 * @throws EyeIOException
	 */
	public static function getConfiguration($filename) {
		if (!is_string($filename)) {
			throw new EyeInvalidArgumentException($filename . ' is not a valid filename.');
		}
		if (!isset(self::$configurationFiles[$filename])) {
			$filename .= SERVICE_FILESYSTEM_CONFIGURATION_FILE_EXTENSION;
			if (!is_file(SERVICE_FILESYSTEM_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException(SERVICE_FILESYSTEM_CONFIGURATION_PATH . '/' . $filename . ' does not exist.');
			}
			if (!$xmlObject = simplexml_load_file(SERVICE_FILESYSTEM_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$configurationFiles[$filename] = $xmlObject;
		}
		return self::$configurationFiles[$filename];
	}
	
	/**
	 * @param string $internalUrl
	 * @return mixed The URL to access the target file from outside, if available, or the input string.
	 */
	public static function toExternalUrl($internalUrl) {
		return EyeosUrlTranslator::toExternalUrl($internalUrl);
	}
	
	/**
	 * @param string $externalUrl
	 * @return mixed The URL to access the target file from inside, if available, or the input string.
	 */
	public static function toInternalUrl($externalUrl) {
		return EyeosUrlTranslator::toInternalUrl($externalUrl);
	}
}

/**
 * Global listener associated to the eyeos virtual filesystem and able to
 * dispatch all events from it to all attached listeners.
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeosGlobalFileEventsDispatcher implements IFileListener {
	/**
	 * @var EyeosGlobalFileEventsDispatcher
	 */
	private static $Instance = null;
	private static $Logger;
	
	/**
	 * @var ArrayList(IFileListener)
	 */
	private $listeners = null;
	
	protected function __construct() {
		$this->listeners = new ArrayList();
		if (self::$Logger === null) {
			self::$Logger = Logger::getLogger('fsi.EyeosGlobalFileEventsDispatcher');
		}
	}
	
	/**
	 * @param IFileListener $listener
	 */
	public function addListener(IFileListener $listener, $currentRequestOnly = true) {
		if (!$currentRequestOnly) {
			throw new EyeNotImplementedException(__METHOD__ . ' ($currentRequestOnly = false)');
		}
		$this->listeners->append($listener);
	}
	
	public function directoryCreated(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->directoryCreated($e);
		}
	}
	
	public function fileAccessed(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->fileAccessed($e);
		}
	}
	
	public function fileCreated(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->fileCreated($e);
		}
	}
	
	public function fileDeleted(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->fileDeleted($e);
		}
	}
	
	public function fileMoved(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->directoryCreated($e);
		}
	}
	
	public function fileRead(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->fileRead($e);
		}
	}
	
	public function fileRenamed(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->fileRenamed($e);
		}
	}
	
	public function fileWritten(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->fileWritten($e);
		}
	}
	
	/**
	 * @return array(IFileListener)
	 */
	public function getAllListeners() {
		return $this->listeners->getArrayCopy();
	}
	
	/**
	 * @return EyeosGlobalFileEventsDispatcher
	 */
	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new EyeosGlobalFileEventsDispatcher();
		}
		return self::$Instance;
	}
	
	public function groupChanged(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->directoryCreated($e);
		}
	}
	
	public function modeChanged(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->modeChanged($e);
		}
	}
	
	public function ownerChanged(FileEvent $e) {
		foreach($this->listeners as $listener) {
			$listener->ownerChanged($e);
		}
	}
	
	/**
	 * @param IFileListener $listener
	 */
	public function removeListener(IFileListener $listener) {
		$this->listeners->remove($listener);
	}
} 

?>