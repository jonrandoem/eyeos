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
 * Defines a file system manager that is able to create File objects representing paths.
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IFileSystem {
	/**
	 * Returns an IFile object corresponding to the given $path.
	 * 
	 * @param string $path The path/URL of the file.
	 * @param array $params Optionnal addionnal parameters passed to the file class constructor.
	 * @return IFile The file object matching given $path.
	 * @throws EyeException If an error occured during the creation of the file object.
	 */
	public static function getFile($path, $params = null);
	
	/**
	 * Returns an IInputStream object corresponding to the given $path.
	 * 
	 * @param string $path The path/URL of the file.
	 * @param array $params Optionnal addionnal parameters passed to the file class constructor.
	 * @param array $streamParams Optionnal addionnal parameters passed to the stream class constructor.
	 * @return FileInputStream The file input stream.
	 * @throws EyeException If an error occured during the creation of the file stream.
	 */
	public static function getFileInputStream($path, $params = null, $streamParams = null);
	
	/**
	 * Returns an IOutputStream object corresponding to the given $path.
	 * 
	 * @param string $path The path/URL of the file.
	 * @param array $params Optionnal addionnal parameters passed to the file class constructor.
	 * @param array $streamParams Optionnal addionnal parameters passed to the stream class constructor.
	 * @return FileOutputStream The file output stream.
	 * @throws EyeException If an error occured during the creation of the file stream.
	 */
	public static function getFileOutputStream($path, $params = null, $streamParams = null);
}

/**
 * Defines a FileFactory, internally used by the FileSystem service to resolve paths
 * and build File objects.
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IFileObjectsFactory extends ISingleton {
	/**
	 * Checks whether this FOF is able to handle that type of path or not.
	 * 
	 * @param string $path THe path/URL of the file.
	 * @return bool TRUE if this FOF is able to handle that type of path, FALSE otherwise.
	 */
	public function checkPath($path);
	
	/**
	 * Returns an IFile object corresponding to the given $path.
	 * 
	 * @param string $path The path/URL of the file.
	 * @param array $params Optionnal addionnal parameters passed to the file class constructor.
	 * @return AbstractFile The file object if the FOF was able to create it or null otherwise.
	 * @throws EyeAccessControlException If the security manager denied the current context accessing this path.
	 * @throws EyeException If an error occured during the creation of the file object.
	 */
	public function getFile($path, $params = null);
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IMountpointsManager extends ISingleton {
	/**
	 * @param $path
	 * @return MountpointDescriptor
	 */
	public function getMountpointDescriptor($path);
	
	/**
	 * @param $path
	 * @return array(MountpointDescriptor)
	 */
	public function getMountpointDescriptorsList($path);
	
	/**
	 * @param MountpointDescriptor $md
	 */
	public function saveMountpointDescriptor(MountpointDescriptor $md);
	
	/**
	 * @param MountpointDescriptor $md
	 */
	public function deleteMountpointDescriptor(MountpointDescriptor $md);
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
final class MountpointDescriptor {
	/**
	 * var bool
	 */
	private $active = true;
	
	/**
	 * var string
	 */
	private $mountpointPath = null;
	
	/**
	 * var string
	 */
	private $targetPath = null;
	
	
	public function __construct($mountpointPath, $targetPath, $isActive = true) {
		$this->setMountpointPath($mountpointPath);
		$this->setTargetPath($targetPath);
		$this->setIsActive($isActive);
	}
	
	public function getIsActive() {
		return $this->active;
	}
	
	public function getMountpointPath() {
		return $this->mountpointPath;
	}
	
	public function getTargetPath() {
		return $this->targetPath;
	}
	
	public function setIsActive($isActive) {
		$this->active = $isActive ? true : false;
	}
	
	public function setMountpointPath($mountpointPath) {
		$this->mountpointPath = AdvancedPathLib::getCanonicalURL($mountpointPath);
	}
	
	public function setTargetPath($targetPath) {
		$this->targetPath = $targetPath;
	}
}

interface IUrlTranslator {
	/**
	 * @param string $internalUrl
	 * @return mixed The URL to access the target file from outside, if available, or the input string.
	 */
	public static function toExternalUrl($internalUrl);
	
	/**
	 * @param string $externalUrl
	 * @return mixed The URL to access the target file from inside, if available, or the input string.
	 */
	public static function toInternalUrl($externalUrl);
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IFileListener extends IEventListener {
	public function directoryCreated(FileEvent $e);
	public function fileAccessed(FileEvent $e);
	public function fileCreated(FileEvent $e);
	public function fileDeleted(FileEvent $e);
	public function fileMoved(FileEvent $e);
	public function fileRead(FileEvent $e);
	public function fileRenamed(FileEvent $e);
	public function fileWritten(FileEvent $e);
	public function groupChanged(FileEvent $e);
	public function modeChanged(FileEvent $e);
	public function ownerChanged(FileEvent $e);
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
abstract class AbstractFileAdapter implements IFileListener {
	public function directoryCreated(FileEvent $e) {}
	public function fileAccessed(FileEvent $e) {}
	public function fileCreated(FileEvent $e) {}
	public function fileDeleted(FileEvent $e) {}
	public function fileMoved(FileEvent $e) {}
	public function fileRead(FileEvent $e) {}
	public function fileRenamed(FileEvent $e) {}
	public function fileWritten(FileEvent $e) {}
	public function groupChanged(FileEvent $e) {}
	public function modeChanged(FileEvent $e) {}
	public function ownerChanged(FileEvent $e) {}
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface IObservableFile {
	public function addFileListener(IFileListener $listener);
	public function getAllFileListeners();
	public function removeFileListener(IFileListener $listener);
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class FileEvent extends EventObject {
	/**
	 * @var mixed
	 */
	private $changes = null;
	
	public function __construct($source, $relatedSource = null, $changes = null) {
		parent::__construct($source, $relatedSource);
		$this->changes = $changes;
	}
	
	public function getChanges() {
		return $this->changes;
	}
}
?>
