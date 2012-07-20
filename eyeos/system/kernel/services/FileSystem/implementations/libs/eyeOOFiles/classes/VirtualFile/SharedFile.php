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
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeSharedFile extends EyeosAbstractVirtualFile {
	
	/**
	 * @param string $path The path to the file (MUST BE A VALID URL)
	 * @param mixed $params Additional arguments (could be useful for derivated classes)
	 * @throws EyeInvalidArgumentException
	 * @throws EyeMissingArgumentException
	 * @throws EyeNullPointerException
	 */
	public function __construct($path, $params = null) {
		try {
			$urlParts = EyeosAbstractVirtualFile::parse_url($path);
			if ($urlParts['scheme'] != self::URL_SCHEME_SHARE) {
				throw new EyeInvalidArgumentException($urlParts['scheme'] . ' is not a valid scheme for user file, expecting ' . self::URL_SCHEME_SHARE . '.');
			}
		} catch (EyeException $e) {
			throw new EyeInvalidArgumentException($path . ' is not a valid path value.', 0, $e);
		}
		if (isset($urlParts['principalname']) && $urlParts['path'] != '/') {
			throw new EyeInvalidArgumentException($path . ' is not a valid URL value: the path part should be empty.');
		}
		
		try {
			parent::__construct($path, $params);
		} catch (EyeException $e) {
			throw new EyeException('Unable to create ' . __CLASS__ . '.', 0, $e);
		}
	}
	
	public function deleteMeta() {
		if ($this->realFile === null) {
			// do nothing
			return;
		}
		
		return parent::deleteMeta();
	}
	
	public function exists($forceCheck = false) {
		// We assume that a file of that class always exists (it's not taking a big risk)
		if ($this->realFile === null) {
			return true;
		}
		
		return parent::exists($forceCheck);
	}
	
	public function getMeta() {
		if ($this->realFile === null) {
			$loginContext = ProcManager::getInstance()->getCurrentProcess()->getLoginContext();
			
			$meta = new VirtualFileMetaData();
			$meta->setAll(array(
				self::METADATA_KEY_OWNER => $loginContext->getEyeosUser()->getName(),
				self::METADATA_KEY_GROUP => SERVICE_UM_DEFAULTUSERSGROUP,
				self::METADATA_KEY_PERMISSIONS => '-rwx------'
			));
			return $meta;
		}
		return parent::getMeta();
	}
	
	public function getName() {
		$urlParts = $this->getURLComponents();
		if (!isset($urlParts['principalname'])) {
			return '/';
		}
		return $urlParts['principalname'];
	}
	
	public function getSize($recursive = false) {
		$size = 0;
		if ($this->isDirectory()) {
			if ($recursive) {
				foreach($this->listFiles() as $subFile) {
					$size += $subFile->getSize(true);
				}
			}
		} else {
			$size = parent::getSize(false);
		}
		return $size;
	}
	
	public function getUMask() {
		return 0777;
	}
	
	public function isDirectory() {
		if ($this->realFile === null) {
			return true;
		}
		return parent::isDirectory();
	}
	
	public function isFile() {
		if ($this->realFile === null) {
			return false;
		}
		
		return parent::isFile();
	}
	
	public function isLink() {
		if ($this->realFile === null) {
			return false;
		}
		
		return parent::isLink();
	}
	
	public function isReadable() {
		if ($this->realFile === null) {
			return true;
		}
		
		return parent::isReadable();
	}
	
	public function isWritable() {
		if ($this->realFile === null) {
			//FIXME: Not sure! It depends on the role of the user in the workgroup!
			return true;
		}
		
		return parent::isWritable();
	}
	
	public function listFiles($pattern = '*', $flags=AdvancedPathLib::GLOB_NORMAL) {
		$files = array();
		
		$urlParts = $this->getURLComponents();
		$isRoot = false;
		if (!isset($urlParts['principalname'])) {
			$isRoot = true;
			
			if ($urlParts['path'] != '/') {
				throw new EyeBadMethodCallException('Cannot list files: ' . $this->path . ' is not a (handled) directory.');
			}
		}
		
		// ROOT (share://): list the owners sharing files with the current user
		if ($isRoot) {
			//--- Legacy code [I'd like to keep this part of the code in case some people change suddenly their minds, once again...]
			/*$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
			$shareInfo = SharingManager::getInstance()->getAllShareInfoFromCollaborator($currentUser, null, 'IShareableFile');
			
			// Build an array(ownerId => ownerName)
			$owners = array();
			foreach($shareInfo as $shareInfoData) {
				try {
					$currentOwner = $shareInfoData->getOwner();
					if (!isset($owners[$currentOwner->getId()])) {
						$owners[$currentOwner->getId()] = $currentOwner->getName();
					}
				} catch (Exception $e) {
					Logger::getLogger('system.services.FileSystem.EyeSharedFile')->warn('Cannot retrieve ShareInfo components from shared file: "' . $shareInfoData->getShareable() . '", skipping.');
				}
			}
			sort($owners);
			
			foreach($owners as $ownerName) {
				$files[] = new EyeSharedFile(self::URL_SCHEME_SHARE . '://' . self::URL_LOCATOR_CHAR . $ownerName . '/');
			}*/
			//--- Legacy code
			
			$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
			$peopleController = PeopleController::getInstance();
			$contacts = $peopleController->getAllContacts($currentUser->getId());
			
			foreach($contacts as $contact) {
				if ($contact->getRelation()->getSourceId() == $currentUser->getId()) {
					$otherUser = UMManager::getInstance()->getUserById($contact->getRelation()->getTargetId());
				} else {
					$otherUser = UMManager::getInstance()->getUserById($contact->getRelation()->getSourceId());
				}
				$files[] = new EyeSharedFile(self::URL_SCHEME_SHARE . '://' . self::URL_LOCATOR_CHAR . $otherUser->getName() . '/');
			}
		} else {
			if ($flags & AdvancedPathLib::GLOB_ONLY_DIR) {
				// Folders are not shareable yet
				return array();
			}
			
			$ownerName = $urlParts['principalname'];
			$owner = UMManager::getInstance()->getUserByName($ownerName);
			$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
			
			// CURRENT USER ROOT (share://~currentUser/): Show the list of all the files that are currently
			// shared by the current user 
			if ($owner == $currentUser) {
				$shareInfo = SharingManager::getInstance()->getAllShareInfoFromOwner($currentUser, 'IShareableFile');
			}
			// OTHER OWNER ROOT (share://~otherUser/): Show the list of the files that are currently shared by
			// the owner specified in the URL with the current user
			else {
				$shareInfo = SharingManager::getInstance()->getAllShareInfoFromCollaborator($currentUser, $owner, 'IShareableFile');
			}
			
			// Special temporary array for files IDs to avoid duplication in the returned array
			$fileIds = array();
			foreach($shareInfo as $shareInfoData) {
				$sharedFile = $shareInfoData->getShareable();
				$id = $sharedFile->getId();
				if (!isset($fileIds[$id])) {
					$fileIds[$id] = 0;				// Arbitrary value (we only use keys in this array)
					$files[] = $sharedFile;
				}
			}
		}
		return $files;
	}
	
	public function setMeta(IMetaData $metaData = null) {
		// nothing here
	}
}
?>