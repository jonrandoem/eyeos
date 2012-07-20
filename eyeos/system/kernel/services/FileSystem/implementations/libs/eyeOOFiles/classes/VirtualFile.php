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
 * This class ...
 * 
 * @see Important initialization directive after class definition (AdvancedPathLib::parse_url_registerFragment2PathProtocol())
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
abstract class EyeosAbstractVirtualFile extends AbstractFile implements IMetaAssociable, IVirtualFile, ISecurableFile, IObservableFile {
	const URL_LOCATOR_CHAR = '~';
	const URL_SCHEME_USERFILES = 'home';
	const URL_SCHEME_USERCONF = 'user-conf';
	const URL_SCHEME_USERTRASH = 'trash';
	const URL_SCHEME_SHARE = 'share';
	const URL_SCHEME_APPCONF = 'app-conf';
	const URL_SCHEME_SYSTEM = 'sys';
	const URL_SCHEME_GROUPFILES = 'group';
	const URL_SCHEME_GROUPCONF = 'group-conf';
	const URL_SCHEME_WORKGROUPFILES = 'workgroup';
	const URL_SCHEME_WORKGROUPCONF = 'workgroup-conf';
	const URL_SCHEME_EYEOS = 'eyeos';
	
	const METADATA_KEY_CREATIONTIME = 'creationTime';
	const METADATA_KEY_GROUP = 'group';
	const METADATA_KEY_LINKTARGET = 'linkTarget';
	const METADATA_KEY_MODIFICATIONTIME = 'modificationTime';
	const METADATA_KEY_OWNER = 'owner';
	const METADATA_KEY_PERMISSIONS = 'permissions';
	const METADATA_KEY_LISTENERS = 'listeners';
	
	const PERMISSIONS_MASK_FILE = 0666;
	const PERMISSIONS_MASK_DIR = 0777;
	const PERMISSIONS_VALUE_LINK = 0777;
	
	/**
	 * @var Logger
	 */
	protected static $Logger;
	
	/**
	 * @var string
	 */
	protected $path;
	
	/**
	 * @var IMetaData
	 */
	protected $metaData = null;
	
	/**
	 * @var IFile
	 */
	protected $realFile = null;
	
	/**
	 * @var ArrayList(IFileListener)
	 */
	protected $listeners = null;
	
	/**
	 * Cache to improve performances on these extremely used data.
	 * 
	 * @var array
	 */
	protected $urlParts = null;
	
	/**
	 * Note: Should be const, but still impossible with PHP
	 * @var array
	 */
	public static $VirtualFileSchemes = array(
		self::URL_SCHEME_USERFILES,
		self::URL_SCHEME_USERCONF,
		self::URL_SCHEME_USERTRASH,
		self::URL_SCHEME_SHARE,
		self::URL_SCHEME_APPCONF,
		self::URL_SCHEME_SYSTEM,
		self::URL_SCHEME_GROUPFILES,
		self::URL_SCHEME_GROUPCONF,
		self::URL_SCHEME_WORKGROUPFILES,
		self::URL_SCHEME_WORKGROUPCONF,
		self::URL_SCHEME_EYEOS
	);
	
	public function __construct($path, $params = null) {
		if (isset($params['realFile']) && $params['realFile'] !== null && !$params['realFile'] instanceof IFile) {
			$type = get_class($params['realFile']) ? get_class($params['realFile']) : gettype($params['realFile']);
			throw new EyeInvalidArgumentException('Invalid argument $params[\'realFile\']: was ' . $type . ', expecting IFile.');
		}
		$this->path = $path;
		$this->realFile = $params['realFile'];
		
		if (self::$Logger === null) {
			self::$Logger = Logger::getLogger('fileSystem.VirtualFile');
		}
	}
	
	public function __clone() {
		$this->realFile = $this->realFile ? clone $this->realFile : null;
	}
	
	public function addFileListener(IFileListener $listener) {
		if ($listener instanceof EyeosGlobalFileEventsDispatcher) {
			return;		//this class is *always* listening
		}
		$listenerClassName = get_class($listener);
		$registeredListeners = $this->getAllFileListenersClasses();
		foreach($registeredListeners as $listener) {
			if ($listenerClassName == $listener) {
				return;
			}
		}
		$registeredListeners[] = $listenerClassName;
		if ($this->listeners !== null) {
			$this->listeners[] = $listener;
		}
		$this->saveListeners($registeredListeners);
	}
	
	/**
	 * To be overriden by subclasses.
	 * Useful to automatically transform "home:///" into "home://~currentUser/" for example.
	 * 
	 * @param string/array $path The path as a string or the corresponding URL parts in an array (see parse_url()).
	 * @return string The autocompleted path if possible.
	 * @throws Exception
	 */
	public static function autocompletePath($path) {
		if (is_array($path)) {
			$path = self::buildUrl($path);
		}
		return $path;
	}
	
	public static function buildUrl(array $urlParts) {
		//FIXME This part has been commented following some unwanted behaviour of path resolution on file instanciation
		// Is it still needed or not?
		/*if (isset($urlParts['principalname'])) {
			$urlParts['path'] = '/' . self::URL_LOCATOR_CHAR . $urlParts['principalname'] . $urlParts['path'];
			if (isset($urlParts['host']) && strpos($urlParts['host'], self::URL_LOCATOR_CHAR) === 0) {
				unset($urlParts['host']);
			}
		}*/
		return AdvancedPathLib::buildUrl($urlParts);
	}
	
	public function checkAdminPermission() {
		// nothing here, checks are performed directly through the Meta service
	}
	
	public function checkDeletePermission() {
		SecurityManager::getInstance()->checkDelete($this);
	}
	
	public function checkReadPermission() {
		SecurityManager::getInstance()->checkRead($this);
	}
	
	public function checkWritePermission() {
		SecurityManager::getInstance()->checkWrite($this);
	}
	
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group. 
	 * @param bool $recursive
	 * @return bool TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeSecurityException
	 */
	public function chgrp($newGroup, $recursive = false) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($recursive) {
			//TODO recursive chgrp
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		//$this->checkAdminPermission();			//not necessary here, will be done in setMeta()
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('Unable to retrieve metadata for file ' . $this->path);
		}
		$groupName = null;
		if ($newGroup instanceof AbstractEyeosGroup) {
			$groupName = $newGroup->getName();
		} else if (is_string($newGroup)) {
			$groupName = $newGroup;
		} else {
			throw new EyeInvalidArgumentException($newGroup . ' is not a valid value for $newGroup. Expecting: AbstractEyeosGroup, string.');
		}
		//check existence
		UMManager::getInstance()->getGroupByName($groupName);
		
		$meta->set(self::METADATA_KEY_GROUP, $groupName);
		$this->setMeta($meta);
		return true;
	}
	
	/**
	 * @param int $newMode The new mode (octal value).
	 * @param bool $recursive
	 * @return bool TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 * @throws EyeSecurityException
	 */
	public function chmod($newMode, $recursive = false) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($recursive) {
			//TODO recursive chmod
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		if(!is_int($newMode)) {
			throw new EyeInvalidArgumentException($newMode . ' is not a valid octal value for $newMode.');
		}
		//$this->checkAdminPermission();			//not necessary here, will be done in setMeta()
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('Unable to retrieve metadata for file ' . $this->path);
		}
		$perms = AdvancedPathLib::permsToUnix($newMode);
		$oldMode = $meta->get(self::METADATA_KEY_PERMISSIONS);
		$meta->set(self::METADATA_KEY_PERMISSIONS, $perms);
		$this->setMeta($meta);
		
		//notify listeners
		$this->fireEvent('modeChanged', new FileEvent($this, null, $oldMode));
		return true;
	}
	
	/**
	 * @param mixed $newOwner The user name or user number or an object representing the user.
	 * @param bool $recursive
	 * @return bool TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeSecurityException
	 */
	public function chown($newOwner, $recursive = false) {		
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($recursive) {
			//TODO recursive chown
			throw new EyeNotImplementedException(__METHOD__ . ': $recursive = true');
		}
		//$this->checkAdminPermission();			//not necessary here, will be done in setMeta()
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('Unable to retrieve metadata for file ' . $this->path);
		}
		$oldOwnerName = $meta->get(self::METADATA_KEY_OWNER);
		$userName = null;
		if ($newOwner instanceof AbstractEyeosUser) {
			$userName = $newOwner->getName();
		} else if (is_string($newOwner)) {
			$userName = $newOwner;
		} else {
			throw new EyeInvalidArgumentException($newOwner . ' is not a valid value for $newOwner. Expecting: AbstractEyeosUser, string.');
		}
		//check existence
		UMManager::getInstance()->getUserByName($userName);
		
		$meta->set(self::METADATA_KEY_OWNER, $userName);
		$this->setMeta($meta);
		
		//notify listeners
		$this->fireEvent('ownerChanged', new FileEvent($this, null, $oldOwnerName));
		return true;
	}
	
	/**
	 * @param IFile $file The source file to copy from
	 * @return bool TRUE if the file has been successfully copied from $file, FALSE otherwise
	 * @throws EyeSecurityException
	 */
	protected function copyFrom(IFile $file, $overwrite = true) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		// No metadata here please!
		return $this->copyFromAndKeepOGP($file, false, $overwrite);
	}
	
	/**
	 * Special copy operation for virtual files.
	 * 
	 * @param IFile $file The source file to copy data from.
	 * @param bool $keepOGP Set to TRUE to force keeping the Owner-Group-Permissions of the current file (target),
	 * 				FALSE to overwrite them with the ones from the source file ($file)
	 * @param bool $overwrite Set to TRUE to overwrite the current file (target)
	 */
	protected function copyFromAndKeepOGP(IFile $file, $keepOGP = false, $overwrite = true) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		//if the destination ($this) is a a directory AND: the source is not a directory OR is a directory with a different name
		if ($this->isDirectory() && (!$file->isDirectory() || $this->getName() != $file->getName())) {
			if ($this->getName() != '/' || $file->getName() != '/') {
				//we redirect the copy operation to a file located within the destination directory ($this)
				return $this->getChildFile($file->getName())->copyFromAndKeepOGP($file, $keepOGP, $overwrite);
			}
		}
		if ($file instanceof ISecurableFile) {
			$file->checkReadPermission();
		}
		
		// $this file exists => check write permissions
		if ($this->realFile->exists()) {
			$this->checkWritePermission();
			if (!$overwrite) {
				throw new EyeIOException('Unable to copy: File ' . $this->path . ' exists but overwrite option is not enabled.');
			}
		}
		// $this file does not exist => check WRITE permissions on the parent folder (for file creation)
		else {
			$this->getParentFile()->checkWritePermission();
		}
		
		//are we trying to copy a file to itself?
		if ($this->equals($file)) {
			throw new EyeIOException('Unable to copy ' . $file->getPath() . ': source and target are the same.');
		}
		
		//checks ok, we can start the copy process
		$success = true;
		try {
			//use the "real" file instead of the virtual one for next steps
			if ($file instanceof IVirtualFile) {
				$realFile = $file->getRealFile();
			} else {
				$realFile = $file;
			}
			
			//file to file
			//@todo Find which of these functions creates metadata
			if ($file->isFile()) {
				$fileCreated = false;
				if (!$this->exists()) {
					$this->createNewFile();
					$fileCreated = true;
				}
				if ($this->realFile->copyFrom($realFile, $overwrite)) {
					// using metadata converter
					$newMetaData = MetaDataConverter::getInstance()->convertThis($file, $this);
					$this->setMeta($newMetaData);
					//process metadata
					/*
					$meta = null;
					if ($file instanceof IMetaAssociable) {
						// ----------------------------------------------------
						// FIXME: We need Metadata Converter
						$sourceFile = $file->realFile;
						$destFile = FSI::getFile($this->path);
						if ($sourceFile instanceof LocalFile && $destFile instanceof EyeWorkgroupFile) {
							$meta = $file->getMeta();
							$meta->set('activity', null);
							$meta->set('id', null);
							// END OF FIXME
						// ----------------------------------------------------
						} else {
							//Assign owner metadata to current User
							$meta = $file->getMeta();
							if ($meta->get('owner')) {
								$meta->set('owner', ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName());
								$meta->set('group', ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup()->getName());
								$meta->set('permissions', null);
							}
							$meta = MetaManager::getInstance()->getNewMetaDataInstance($this, $meta);
						}
					}
					if ($meta !== null) {
						if (!$keepOGP && !$fileCreated) {
							$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
							$group = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup();
							$meta->set(self::METADATA_KEY_OWNER, $currentUser->getName());
							$meta->set(self::METADATA_KEY_GROUP, $group->getName());
							$meta->set(self::METADATA_KEY_PERMISSIONS, AdvancedPathLib::permsToUnix(self::PERMISSIONS_MASK_FILE & ~$this->getUMask()));
						}
						$this->setMeta($meta);
					}
					 */
				} else {
					$success = false;
				}
			}
			//directory to directory
			else if ($file->isDirectory()) {
				//create destination directory if needed
				if (!$this->exists()) {
					$this->mkdirs();
				}
				//copy subfiles one by one (needed for metadata)
				foreach($file->listFiles() as $subFile) {
					//create child path
					$urlParts = $this->getURLComponents();
					$urlParts['path'] .= '/' . $subFile->getName();
					$params = array('realFile' => $this->realFile->getChildFile($subFile->getName()));
					
					//instantiate new file object
					$thisClass = get_class($this);
					$thisSubFile = new $thisClass(AdvancedPathLib::buildURL($urlParts), $params);
					
					if ($thisSubFile instanceof EyeosAbstractVirtualFile) {
						$success = $success && $thisSubFile->copyFromAndKeepOGP($subFile, $keepOGP, $overwrite);
					} else {
						$success = $success && $thisSubFile->copyFrom($subFile, $overwrite);
					}
				}
				
				//process metadata
				$meta = null;
				if ($file instanceof IMetaAssociable) {
					$meta = MetaManager::getInstance()->getNewMetaDataInstance($this, $file->getMeta());
				} else {
					$meta = MetaManager::getInstance()->getNewMetaDataInstance($this);
				}
				if($meta !== null) {
					/*
					if (!$keepOGP) {
						$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
						$group = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup();
						$meta->set(self::METADATA_KEY_OWNER, $currentUser->getName());
						$meta->set(self::METADATA_KEY_GROUP, $group->getName());
						$meta->set(self::METADATA_KEY_PERMISSIONS, AdvancedPathLib::permsToUnix(self::PERMISSIONS_MASK_DIR & ~$this->getUMask()));
					}
					 */
					//$this->setMeta($meta);
				}
			}
			//link to link
			else if ($file->isLink()) {
				$linkTarget = $file->getLinkTarget();
				if ($linkTarget === null) {
					throw new EyeNullPointerException('Unable to get link\'s target for ' . $file->getPath() . '.');
				}
				$this->createNewFile($overwrite);
				/*
				$meta = $file->getMeta();
				if (!$keepOGP) {
					$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
					$group = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup();
					$meta->set(self::METADATA_KEY_OWNER, $currentUser->getName());
					$meta->set(self::METADATA_KEY_GROUP, $group->getName());
					$meta->set(self::METADATA_KEY_PERMISSIONS, AdvancedPathLib::permsToUnix(self::PERMISSIONS_MASK_LINK & ~$this->getUMask()));
					$meta->set(self::METADATA_KEY_LINKTARGET, $linkTarget);
				}
				 */
				//$this->setMeta($meta);
			}
		} catch (EyeErrorException $e) {
			throw new EyeIOException('Unable to copy ' . $file->getPath() . ' to ' . $this->path . '.', 0, $e);
		} catch (EyeException $e) {
			throw new EyeIOException('Unable to copy ' . $file->getPath() . ' to ' . $this->path . '.', 0, $e);
		}
		if ($success) {
			return true;
		}
		throw new EyeUnknownErrorException('Unable to (entirely) copy ' . $file->getPath() . ' to ' . $this->path . '.');
	}
	
	/**
	 * @param bool $overwrite Set to TRUE to try overwriting the file if it already exists
	 * @return bool
	 * @throws EyeIOException
	 */
	public function createNewFile($overwrite = false) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		if ($this->isRoot()) {
			throw new EyeIOException($this->path . ' is the root folder.');
		}
		if ($this->exists()) {
			if (!$overwrite) {
				throw new EyeFileAlreadyExistsException($this->path . ' already exists.');
			} else {
				$this->delete();
			}
		} else {
			$this->getParentFile()->checkWritePermission();
		}
		try {
			if ($this->realFile->createNewFile($overwrite)) {
				MetaManager::getInstance()->deleteMeta($this);
				$meta = MetaManager::getInstance()->getNewMetaDataInstance($this);
				if($meta !== null) {
					$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
					$group = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup();
					$meta->set(self::METADATA_KEY_OWNER, $currentUser->getName());
					$meta->set(self::METADATA_KEY_GROUP, $group->getName());
					$meta->set(self::METADATA_KEY_CREATIONTIME, time());
					$meta->set(self::METADATA_KEY_MODIFICATIONTIME, time());
					$meta->set(self::METADATA_KEY_PERMISSIONS, AdvancedPathLib::permsToUnix(self::PERMISSIONS_MASK_FILE & ~$this->getUMask()));
					$this->setMeta($meta);
				}
				//notify listeners
				$this->fireEvent('fileCreated', new FileEvent($this));
				return true;
			}
		} catch (EyeIOException $e) {
			throw new EyeIOException('Unable to create virtual file at '.$this->path, 0, $e);
		}
		throw new EyeUnknownErrorException('Unable to create file at ' . $this->path . '.');
	}
	
	/**
	 * @param IFile $target The target file the link will point to
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created, FALSE otherwise
	 */
	public function createNewLink(IFile $target, $overwrite = false) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		$this->createNewFile($overwrite);
		try {
			$meta = MetaManager::getInstance()->getNewMetaDataInstance($this);
			if($meta !== null) {
				$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
				$group = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup();
				$meta->set(self::METADATA_KEY_LINKTARGET, $target->getAbsolutePath());
				$meta->set(self::METADATA_KEY_OWNER, $currentUser->getName());
				$meta->set(self::METADATA_KEY_GROUP, $group->getName());
				$meta->set(self::METADATA_KEY_CREATIONTIME, time());
				$meta->set(self::METADATA_KEY_MODIFICATIONTIME, time());
				$meta->set(self::METADATA_KEY_PERMISSIONS, AdvancedPathLib::permsToUnix(self::PERMISSIONS_VALUE_LINK));
				$this->setMeta($meta);
			}
			
			//notify listeners
			$this->fireEvent('fileCreated', new FileEvent($this));
			return true;
		} catch (EyeException $e) {
			$this->deleteImpl();
			throw new EyeIOException('Unable to create new link ' . $this->path, 0, $e);
		}
	}
	
	/**
	 * @param bool $recursive
	 * @param bool $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise
	 */
	public function delete($recursive = false, $onlyContents = false) {
		return $this->deleteImpl($recursive, $onlyContents, true);
	}
	
	/**
	 * @param boolean $recursive
	 * @param boolean $onlyContents In the case of a directory, only delete the files it contains if TRUE
	 * or the entire directory otherwise
	 * @param boolean $fireEvent
	 * @return bool TRUE if the file has been successfully deleted, FALSE otherwise
	 */
	protected function deleteImpl($recursive = false, $onlyContents = false, $fireEvent = true) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($this->isRoot()) {
			throw new EyeIOException('Cannot delete the root folder.');
		}
		$this->checkDeletePermission();
		
		$success = true;
		try {
			if ($this->isDirectory()) {
				//FIXME: the permissions of each child are not checked using this way
				$meta = $this->getMeta();
				$success = $this->realFile->delete($recursive, $onlyContents);
				MetaManager::getInstance()->deleteMeta($this);
				if ($onlyContents) {
					$this->setMeta($meta);
				}
			} else {
				if ($fireEvent) {
					// Ensure the "listeners" property has been initialized *before* deleting the file
					$this->getAllFileListeners();
				}
				
				$this->realFile->delete();
				
				//notify listeners
				if ($fireEvent) {
					$this->fireEvent('fileDeleted', new FileEvent($this));
				}
				
				$this->deleteMeta();
			}
		} catch (EyeFileNotFoundException $e) {
			throw new EyeFileNotFoundException($this->path . ' does not exist.', 0, $e);
		} catch (EyeIOException $e) {
			throw new EyeIOException('Cannot delete ' . $this->path . '.', 0, $e);
		}
		if ($success) {
			if ($fireEvent) {
				//notify listeners on the parent directory
				$this->getParentFile()->fireEvent('fileDeleted', new FileEvent($this));
			}
		}
		return $success;
	}
	
	public function deleteMeta() {
		MetaManager::getInstance()->deleteMeta($this);
	}
	
	/**
	 * @param bool $forceCheck TRUE to force clearing the cache before checking the file's existence
	 * @return bool TRUE if the file/folder/link exists, FALSE otherwise
	 */
	public function exists($forceCheck = false) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		$Logger = Logger::getLogger('virtualFile.exists');
		$Logger->debug("Exists type: " . get_class($this->realFile));
		return $this->realFile->exists($forceCheck);
	}
	
	/**
	 * Forces fetching stats from the current file now (if supported).
	 * @return bool
	 */
	public function fetchStats() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		return $this->realFile->fetchStats();
	}
	
	/**
	 * Dispatches an event to all the listeners on the current file object.
	 * 
	 * @param string $type
	 * @param 
	 */
	public function fireEvent($type, FileEvent $event) {
		foreach($this->getAllFileListeners() as $listener) {
			if (is_callable(array($listener, $type))) {
				try {
					$listener->$type($event);
				} catch (Exception $e) {
					self::$Logger->warn('Exception while trying to fire ' . $type . ' event on listener ' . get_class($listener) . ': ' . $e->getMessage());
				}
			}
		}
	}
	
	/**
	 * @return string
	 */
	public function getAbsolutePath() {
		return AdvancedPathLib::getCanonicalURL($this->getURLComponents(), AdvancedPathLib::OS_UNIX);
	}
	
	/**
	 * @return array(IFileListener) The listeners objects for this file.
	 */
	public function getAllFileListeners() {
		if ($this->listeners === null) {
			$classes = $this->getAllFileListenersClasses();
			$this->listeners = new ArrayList();
			foreach($classes as $class) {
				$this->listeners[] = call_user_func(array($class, 'getInstance'));
			}
		}
		return $this->listeners;
	}
	
	/**
	 * @return array(string) The class names of the listeners for this file.
	 */
	private function getAllFileListenersClasses() {
		$meta = $this->getMeta();
		$registeredListenersArray = array('EyeosGlobalFileEventsDispatcher');
		if ($meta === null) {
			return $registeredListenersArray;
		}
		$registeredListeners = $meta->get(self::METADATA_KEY_LISTENERS);
		if ($registeredListeners !== null) {
			$registeredListenersArray = array_merge($registeredListenersArray, $registeredListeners);
		}
		return $registeredListenersArray;
	}
	
	/**
	 * The object returned will either represent a file located in the directory if the current
	 * file exists and is a directory, or a file located in the same directory as the current
	 * file otherwise.
	 * @param string $fileName The name of the file
	 * @return IFile
	 */
	public function getChildFile($fileName, $params = null) {
		if ($this->isLink() && $this->getLinkTarget()->isDirectory()) {
			return $this->getLinkTarget()->getChildFile($fileName, $params);
		}
		if ($this->isDirectory()) {
			return FSI::getFile($this->path . '/' . $fileName, $params);
		} else {
			return FSI::getFile($this->getParentPath() . '/' . $fileName, $params);
		}
	}
	
	/**
	 * NOTE: in the case of a link, the data is read from its target.
	 * @return mixed The content of the file or FALSE if an error occured
	 */
	public function getContents() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if (!$this->exists()) {
			throw new EyeFileNotFoundException('Unable to read content from file: ' . $this->path . ' does not exist.');
		}
		$this->checkReadPermission();
		try {
			$target = $this->realFile;
			if ($this->isLink() && $this->getLinkTarget()->isFile()) {
				$target = $this->getLinkTarget();
			}
			//notify listeners
			$this->fireEvent('fileRead', new FileEvent($this));
			
			return $target->getContents();
		} catch (EyeBadMethodCallException $e) {
			throw new EyeBadMethodCallException('Unable to read content from file: ' . $this->path . ' is a directory ', 0, $e);
		} catch (EyeFileNotFoundException $e) {
			throw new EyeFileNotFoundException('Unable to read content from file: ' . $this->path . ' does not exist.', 0, $e);
		} catch (Exception $e) {
			throw new EyeIOException('Unable to read content from file ' . $this->path . '.', 0, $e);
		}
	}
	
	/**
	 * @return string The extension of the file
	 */
	public function getExtension() {
		return pathinfo($this->getAbsolutePath(), PATHINFO_EXTENSION);
	}
	
	/**
	 * @return string The group of the file
	 */
	public function getGroup() {
		if (!$this->exists()) {
			throw new EyeFileNotFoundException('File ' . $this->path . ' does not exist.');
		}
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('No metadata found for ' . $this->path);
		}
		if ($meta->get(self::METADATA_KEY_GROUP !== null) || $meta->get(self::METADATA_KEY_GROUP) == '') {
			$ownerPrimaryGroupId = UMManager::getInstance()->getUserByName($this->getOwner())->getPrimaryGroupId();
			return UMManager::getInstance()->getGroupById($ownerPrimaryGroupId)->getName();
		}
		return $meta->get(self::METADATA_KEY_GROUP);
	}
	
	/**
	 * @param array Special parameters for FileInputStream::__construct() (see FileInputStream constants)
	 * @return FileInputStream
	 */
	public function getInputStream($params = null) {
		$this->checkReadPermission();
		return new VirtualFileInputStream($this, $params);
	}
	
	/**
	 * @return IFile The target file pointed by the link, or FALSE if an error occured
	 */
	public function getLinkTarget() {
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeUnsupportedOperationException($this->path . ' is not a link.');
		}
		$linkTarget = $meta->get(self::METADATA_KEY_LINKTARGET);
		if ($linkTarget === null) {
			throw new EyeUnsupportedOperationException($this->path . ' is not a link.');
		}
		return FSI::getFile($linkTarget);
	}
		
	/**
	 * @return VirtualFileMetaData The metadata associated to the current object.
	 */
	public function getMeta() {
		return MetaManager::getInstance()->retrieveMeta($this);
	}
	
	/**
	 * @return string The MIME type of the file.
	 */
	public function getMimeType() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		return $this->realFile->getMimeType();
	}
	
	/**
	 * @return string The name of the file
	 */
	public function getName() {
		if ($this->isRoot()) {
			return '/';
		}
		$pathInfo = utf8_pathinfo($this->getAbsolutePath());
		return $pathInfo['basename'];
	}
	
	/**
	 * @param array Special parameters for FileOutputStream::__construct() (see FileOutputStream constants)
	 * @return FileOutputStream
	 */
	public function getOutputStream($params = null) {
		$this->checkWritePermission();
		return new VirtualFileOutputStream($this, $params);
	}
	
	/**
	 * @return string The owner of the file
	 */
	public function getOwner() {
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('No metadata found for ' . $this->path);
		}
		$owner = $meta->get(self::METADATA_KEY_OWNER);
		if ($owner === null) {
			$urlParts = $this->getURLComponents();
			if (!isset($urlParts['principalname'])) {
				throw new EyeUnexpectedValueException('Unable to get owner for file ' . $this->path . ': inconsistency of the filesystem detected.');
			}
			$owner = $urlParts['principalname'];
		}
		return $owner;
	}
	
	/**
	 * @return string The path of the file's parent directory
	 */
	public function getParentPath() {
		if ($this->isRoot()) {
			return $this->path;
		}
		$urlParts = $this->getURLComponents();
		$urlParts['path'] = AdvancedPathLib::dirname($urlParts['path']);
		return AdvancedPathLib::buildUrl($urlParts);
	}
	
	/**
	 * @return VirtualFile The file corresponding to the file's parent directory
	 */
	public function getParentFile() {
		if ($this->isRoot()) {
			return clone $this;
		}
		return FSI::getFile($this->getParentPath());
	}
	
	/**
	 * @return string
	 */
	public function getPath() {
		return $this->path;
	}
	
	/**
	 * @return string
	 */
	public function getPathFromRoot() {
		$urlParts = $this->getURLComponents();
		return AdvancedPathLib::realpath($urlParts['path'], false);
	}
	
	/**
	 * @return array('dirname' => ..., 'basename' => ..., 'extension' => ..., 'filename' => ...)
	 */
	public function getPathInfo() {
		$pathinfo = $this->realFile->getPathInfo();
		$pathinfo['dirname'] = $this->getParentPath();
		return $pathinfo;
	}
	
	/**
	 * @return string The permissions of the file
	 */
	public function getPermissions($octal = true) {
		$meta = $this->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('No metadata found for ' . $this->path);
		}
		$perm = $meta->get(self::METADATA_KEY_PERMISSIONS);
		if ($perm === null) {
			if ($this->isDirectory()) {
				$perm = self::PERMISSIONS_MASK_DIR & ~$this->getUMask();
			} else if ($this->isLink()) {
				$perm = self::PERMISSIONS_VALUE_LINK;
			} else {
				$perm = self::PERMISSIONS_MASK_FILE & ~$this->getUMask();
			}
			if (!$octal) {
				return AdvancedPathLib::permsToUnix($perm);
			}
			return $perm;
		}
		if ($octal) {
			return AdvancedPathLib::permsToOctal($perm);
		} else {
			return $perm;
		}
	}
	
	/**
	 * @return IFile
	 */
	public function getRealFile() {
		return $this->realFile;
	}
	
	/**
	 * @return IFile
	 */
	public function getRoot() {
		$urlParts = $this->getURLComponents();
		$urlParts['path'] = '/';
		return FSI::getFile(AdvancedPathLib::buildURL($urlParts));
	}
	
	/**
	 * @return int The size of the file (in KB)
	 */
	public function getSize($recursive = false) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		return $this->realFile->getSize($recursive);
	}
	
	/**
	 * @return array The result of the function AdvancedPathLib::parse_url() on the path
	 */
	public function getURLComponents() {
		if ($this->urlParts === null) {
			$this->urlParts = self::parse_url($this->path);
		}
		return $this->urlParts;
	}
	
	/**
	 * @return bool TRUE if the file is a directory, FALSE otherwise
	 */
	public function isDirectory() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		return $this->realFile->isDirectory();
	}
	
	/**
	 * @return bool TRUE if the file can be executed by the current user, FALSE otherwise
	 */
	public function isExecutable() {
		return false;
	}
	
	/**
	 * @return bool TRUE if the file is a normal file, FALSE otherwise
	 */
	public function isFile() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		return $this->realFile->isFile();
	}
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise
	 */
	public function isLink() {
		$meta = $this->getMeta();
		if ($meta !== null) {
			$linkTarget = $meta->get(self::METADATA_KEY_LINKTARGET); 
			if ($linkTarget !== null) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * @return bool TRUE if the file can be read by the current user, FALSE otherwise
	 */
	public function isReadable() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		try {
			$this->checkReadPermission();
			return $this->realFile->isReadable();
		} catch (EyeSecurityException $e) {
			return false;
		}
	}
	
	/**
	 * @return bool TRUE if the file can be written by the current user, FALSE otherwise
	 */
	public function isWritable() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		try {
			$this->checkWritePermission();
			return $this->realFile->isWritable();
		} catch (EyeSecurityException $e) {
			return false;
		}
	}
	
	/**
	 * @return bool TRUE if the file represents the root of the virtual filesystem, FALSE otherwise
	 */
	public function isRoot() {
		if (!isset($this->statsCache['isRoot']) || $this->statsCache['isRoot'] === null) {
			$urlParts = $this->getURLComponents();
			if ($urlParts['path'] == '' || $urlParts['path'] == '/') {
				$this->statsCache['isRoot'] = true;
			} else {
				$this->statsCache['isRoot'] = false;
			}
		}
		return $this->statsCache['isRoot'];
	}
	
	/**
	 * @return array(IFile) The list of the files contained in the "file" itself if this
	 * one is a directory, or the files contained in the parent directory if this one is
	 * a normal file
	 */
	public function listFiles($pattern = '*', $flags=AdvancedPathLib::GLOB_NORMAL) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($this->isLink() && $this->getLinkTarget()->isDirectory()) {
			return $this->getLinkTarget()->listFiles($pattern, $flags);
		}
		if (!$this->isDirectory()) {
			throw new EyeBadMethodCallException('Cannot list files: ' . $this->getPath() . ' is not a directory.');
		}
		$this->checkReadPermission();
		$myVirtualPath = $this->getAbsolutePath();
		$realFiles = $this->realFile->listFiles($pattern, $flags);
		
		$return = array();
		$params = array();
		$thisClass = get_class($this);
		foreach($realFiles as $realFile) {
			$return[] = FSI::getFile($myVirtualPath . '/' . $realFile->getName(), $params);
		}
		
		//notify listeners
		$this->fireEvent('fileRead', new FileEvent($this));
		
		return $return;
	}
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory has been successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function mkdir($mode = null) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($mode === null) {
			$mode = 0777 & ~$this->getUMask();
		}
		if(!is_int($mode)) {
			throw new EyeInvalidArgumentException($mode . ' is not a valid octal value for $mode.');
		}
		$this->getParentFile()->checkWritePermission();
		if($this->realFile->mkdir()) {
			MetaManager::getInstance()->deleteMeta($this);
			$meta = MetaManager::getInstance()->getNewMetaDataInstance($this);
			if($meta !== null) {
				$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
				$group = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosGroup();
				$meta->set(self::METADATA_KEY_OWNER, $currentUser->getName());
				$meta->set(self::METADATA_KEY_GROUP, $group->getName());
				$meta->set(self::METADATA_KEY_CREATIONTIME, time());
				$meta->set(self::METADATA_KEY_MODIFICATIONTIME, time());
				$meta->set(self::METADATA_KEY_PERMISSIONS, AdvancedPathLib::permsToUnix($mode));
				$this->setMeta($meta);
			}
			
			//notify listeners on the parent directory
			$this->getParentFile()->fireEvent('directoryCreated', new FileEvent($this));
			
			return true;
		}
		return false;
	}
	
	/**
	 * @param int $mode The mode. Default is 0777 - umask.
	 * @return bool TRUE if the directory and all the needed parent ones have been
	 * successfully created, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function mkdirs($mode = null) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		$parentFile = $this->getParentFile();
		if (!$parentFile->getRealFile()->isDirectory()) {
			$parentFile->mkdirs($mode);
		}
		return $this->mkdir($mode);
	}
	
	/**
	 * @return bool TRUE if the file has been successfully moved, FALSE otherwise
	 */
	public function moveTo(IFile $file) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if ($this->isRoot()) {
			throw new EyeUnsupportedOperationException('Cannot move root folder ' . $this->path . '.');
		}
		//if the destination ($file) is a a directory AND: the source is not a directory OR is a directory with a different name
		if ($file->isDirectory() && (!$this->isDirectory() || $file->getName() != $this->getName())) {
			if ($file->getName() != '/' || $this->getName() != '/') {
				//we redirect the move operation to a file located within the destination directory ($file)
				return $this->moveTo($file->getChildFile($this->getName()));
			}
		}
		$this->checkReadPermission();
		$parentFile = $file->getParentFile();
		if ($parentFile instanceof ISecurableFile) {
			$parentFile->checkWritePermission();
		}
		if ($file->exists()) {
			$file->checkWritePermission();
		}
		try {
			$success = false;
			if ($file instanceof EyeosAbstractVirtualFile) {
				$success = $file->copyFromAndKeepOGP($this, true);
			} else {
				$success = $this->copyTo($file);
			}
			if ($success) {
				// Ensure the "listeners" property has been initialized *before* deleting the file
				$this->getAllFileListeners();
				
				// Delete file *without firing deletion event* (from outside, file has been moved, not deleted)
				if ($this->deleteImpl(true, false, false)) {
					//notify listeners
					$this->fireEvent('fileMoved', new FileEvent($this, $file));
					return true;
				}
			}
		} catch (EyeException $e) {
			throw new EyeIOException('Cannot move ' . $this->path . ' to ' . $file->getPath() . '.', 0, $e);
		}
		throw new EyeIOException('Cannot move ' . $this->path . ' to ' . $file->getPath() . ' (Unknown error).');
	}
	
	/**
	 * Parses a URL and return its components "eyeos style", but keeping a certain compatibility
	 * with classical URL analyzer.
	 * 
	 * Example: home://~john/myDir/myDocument.ext
	 * Result:
	 * - scheme: "home"
	 * - host: "~john"
	 * - principalname: "john"
	 * - path: "/myDir/myDocument.ext"
	 * 
	 * @see AdvancedPathLib::parse_url()
	 * @return array
	 */
	public static function parse_url($path, $flags = AdvancedPathLib::NONE) {
		$urlParts = AdvancedPathLib::parse_url($path, $flags);

		if (isset($urlParts['host']) && strpos($urlParts['host'], self::URL_LOCATOR_CHAR) === 0) {
			$urlParts['principalname'] = utf8_substr($urlParts['host'], 1);
		} else if (preg_match('`^/(' . self::URL_LOCATOR_CHAR . '(' . EyeosSQLPrincipalsManager::PRINCIPALNAME_VALIDATION_REGEXP . ').*)`', $urlParts['path'], $matches)) {
			$urlParts['host'] = $matches[1];
			$urlParts['principalname'] = $matches[2];
//						  This code has NO SENSE
//                        if(isset($matches[3])) {
//                            $urlParts['path'] = $matches[3];
//                        } else {
//                            $urlParts['path'] = '/';
//                        }
		}
		
		// Currently those parts are not supported, so we remove them to avoid any confusion
		unset($urlParts['user']);
		unset($urlParts['pass']);
		return $urlParts;
	}
	
	/**
	 * @param mixed $data The data to be written to the file.
	 * @param int $flags FILE_APPEND | LOCK_EX (FILE_TEXT | FILE_BINARY only for PHP 6)
	 * @return int The number of bytes written to the file.
	 * @throws EyeBadMethodCallException
	 * @throws EyeIOException
	 */
	public function putContents($data, $flags = 0) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if (!$this->exists()) {
			$this->createNewFile();
		} else {
			$this->checkWritePermission();
		}
		try {
			$target = $this->realFile;
			if ($this->isLink() && $this->getLinkTarget()->isFile()) {
				$target = $this->getLinkTarget();
			}
			$nbBytes = $target->putContents($data, $flags);
			if ($nbBytes !== false) {
				//notify listeners
				$this->fireEvent('fileWritten', new FileEvent($this));
			}
			return $nbBytes;
		} catch (EyeBadMethodCallException $e) {
			throw new EyeBadMethodCallException('Unable to write content to file ' . $this->path . '.', 0, $e);
		} catch (Exception $e) {
			throw new EyeIOException('Unable to write content to file ' . $this->path . '.', 0, $e);
		}
	}
	
	public function removeFileListener(IFileListener $listener) {
		if ($listener instanceof EyeosGlobalFileEventsDispatcher) {
			return;		//this class is *always* listening
		}
		$listenerClassName = get_class($listener);
		$registeredListeners = $this->getAllFileListenersClasses();
		foreach($registeredListeners as $key => $currentListener) {
			if ($listenerClassName == $currentListener) {
				unset($registeredListeners[$key]);
				$this->saveListeners($registeredListeners);
			}
		}
		if ($this->listeners !== null) {
			$this->listeners->remove($listener);
		}
	}
	
	/**
	 * @return bool TRUE if the file has been successfully renamed, FALSE otherwise
	 */
	public function renameTo($newName) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}
		
		if (!$this->exists()) {
			throw new EyeFileNotFoundException($this->path . ' does not exist.');
		}
		if ($this->isRoot()) {
			throw new EyeUnsupportedOperationException('Cannot rename the root folder.');
		}
		$oldName = $this->getName();
		$oldPath = $this->getAbsolutePath();
		$this->getParentFile()->checkWritePermission();
		$newFile = FSI::getFile(dirname($oldPath).'/'.$newName);
		$newFile->checkWritePermission();
		try {
			if ($this->realFile->renameTo($newName)) {
				//change internal name in URL
				$urlParts = $this->getURLComponents();
				$dirname = dirname($urlParts['path']);
				$urlParts['path'] = $dirname . '/' . $newName;
				$this->path = AdvancedPathLib::buildUrl($urlParts);
				
				//Update URL components cache
				$this->urlParts = $urlParts;
				
				//update metadata
				MetaManager::getInstance()->updateMeta($this, array('oldName' => $oldName));
				
				$oldFile = FSI::getFile($oldPath);
				
				//notify listeners
				$this->fireEvent('fileRenamed', new FileEvent($oldFile, $this));
				
				return true;
			}
		} catch (EyeFileNotFoundException $e) {
			throw new EyeFileNotFoundException($this->path . ' does not exist.', 0, $e);
		} catch (EyeException $e) {
			throw new EyeIOException('Unable to rename file ' . $this->path . '.', 0, $e);
		}
		throw new EyeIOException('Unable to rename file ' . $this->path . '.');
	}
	
	/**
	 * Saves the given list of listeners to metadata.
	 * No merge is done. The given list replaces the current one.
	 * 
	 * @param array(string) $listeners
	 */
	private function saveListeners(array $listeners) {
		$meta = $this->getMeta();
		if ($meta === null) {
			$meta = MetaManager::getInstance()->getNewMetaDataInstance($this);
		}
		if($meta === null) {
			throw new EyeNullPointerException('Unable to save listeners: no metadata support has been found for file ' . $file->getPath() . '.');
		}
		$meta->set(self::METADATA_KEY_LISTENERS, $listeners);
		$this->setMeta($meta);
	}
	
	/**
	 * @param VirtualFileMetaData $metaData The metadata to be associated
	 *        to the current object.
	 */
	public function setMeta(IMetaData $metaData = null) {
		if (!$metaData instanceof VirtualFileMetaData) {
			throw new EyeInvalidArgumentException('$metaData must be a VirtualFileMetaData.');
		}
		if (!$this->exists()) {
			throw new EyeFileNotFoundException('Cannot set meta on the non-existing file ' . $this->path . '.');
		}
		MetaManager::getInstance()->storeMeta($this, $metaData);
	}
	
	protected function setURLComponents(array $urlParts) {
		$this->urlParts = $urlParts;
	}
}

//we need to place this line here because the class EyeosAbstractVirtualFile must be defined before
AdvancedPathLib::parse_url_registerFragment2PathProtocol(EyeosAbstractVirtualFile::$VirtualFileSchemes);

?>
