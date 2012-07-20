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

AdvancedPathLib::parse_url_registerFragment2PathProtocol(array(EyeosAbstractVirtualFile::URL_SCHEME_USERFILES));

/**
 * This class ...
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeUserFile extends EyeosAbstractVirtualFile implements IShareableFile, ITaggable {	
	const METADATA_KEY_ID = 'id';
	
	/**
	 * @param string $path The path to the file (MUST BE A VALID URL)
	 * @param mixed $params Additional arguments (could be useful for derivated classes)
	 * @throws EyeInvalidArgumentException
	 * @throws EyeMissingArgumentException
	 * @throws EyeNullPointerException
	 */
	public function __construct($path, $params = null) {
		try {
			$path = self::autocompletePath($path);
		} catch (EyeException $e) {
			throw new EyeInvalidArgumentException($path . ' is not a valid path value.', 0, $e);
		}
		try {
			parent::__construct($path, $params);
		} catch (EyeException $e) {
			throw new EyeException('Unable to create ' . __CLASS__ . '.', 0, $e);
		}
	}
	
	public function addCollaborator(AbstractEyeosPrincipal $collaborator, SharePermission $permissions) {
		SharingManager::getInstance()->addCollaborator($this, $collaborator, $permissions);
	}
	
	/**
	 * 
	 * @param ITag $tag
	 */
	public function addTag(ITag $tag) {
		TagManager::getInstance()->addTag($this, $tag);
	}
	
	public static function autocompletePath($path) {
		if (is_array($path)) {
			$urlParts &= $path;
		} else {
			$urlParts = EyeosAbstractVirtualFile::parse_url($path);
		}
		if ($urlParts['scheme'] != self::URL_SCHEME_USERFILES) {
			throw new EyeInvalidArgumentException($urlParts['scheme'] . ' is not a valid scheme for user file, expecting ' . self::URL_SCHEME_USERFILES . '.');
		}
		if (!isset($urlParts['principalname'])) {
			try {
				$currentProc = ProcManager::getInstance()->getCurrentProcess();
				if ($currentProc !== null) {
					$logionContext = $currentProc->getLoginContext();
					if ($logionContext !== null) {
						$user = $logionContext->getEyeosUser();
						if ($user !== null) {
							$urlParts['host'] = self::URL_LOCATOR_CHAR . $user->getName();
							$urlParts['principalname'] = $user->getName();
						} else {
							throw new EyeNullPointerException('No EyeosUser found in current login context.');
						}
					} else {
						throw new EyeNullPointerException('No login context available.');
					}
				} else {
					throw new EyeNullPointerException('No current process found.');
				}
			} catch (Exception $e) {
				throw new EyeInvalidArgumentException('Unable to find which username to use for given path "' . $path . '".');
			}
		}
		return EyeosAbstractVirtualFile::buildUrl($urlParts);
	}
	
	public function getAllCollaborators() {
		$shareInfos = SharingManager::getInstance()->getAllShareInfo($this);
		$collaborators = array();
		foreach($shareInfos as $shareInfo) {
			$collaborators[$shareInfo->getCollaborator()->getId()] = $shareInfo->getCollaborator();
		}
		return $collaborators;
	}
	
	public function getAllEditors() {
		$shareInfos = SharingManager::getInstance()->getAllShareInfo($this);
		$collaborators = array();
		foreach($shareInfos as $shareInfo) {
			if (in_array(SecurityConstants::WRITE_ACTION, $shareInfo->getPermissions()->getActions())) {
				$collaborators[$shareInfo->getCollaborator()->getId()] = $shareInfo->getCollaborator();
			}
		}
		return $collaborators;
	}
	
	public function getAllShareInfo() {
		return SharingManager::getInstance()->getAllShareInfo($this);
	}
	
	/**
	 * 
	 * @param AbstractEyeosPrincipal $principal
	 * @return array(ITag)
	 */
	public function getAllTags(AbstractEyeosPrincipal $principal = null) {
		return TagManager::getInstance()->getAllTags($principal, $this);
	}
	
	public function getAllViewers() {
		$shareInfos = SharingManager::getInstance()->getAllShareInfo($this);
		$collaborators = array();
		foreach($shareInfos as $shareInfo) {
			if (in_array(SecurityConstants::READ_ACTION, $shareInfo->getPermissions()->getActions())) {
				$collaborators[$shareInfo->getCollaborator()->getId()] = $shareInfo->getCollaborator();
			}
		}
		return $collaborators;
	}
	
	public function getId($forceGeneration = true) {
		$meta = $this->getMeta();
		$id = null;
		if ($meta !== null) {
			$id = $meta->get(self::METADATA_KEY_ID);
		}
		if ($id === null && $forceGeneration) {
			$id = ObjectIdGenerator::assignId($this);
		}
		return $id;
	}
	
	public function getShareOwner() {
		return UMManager::getInstance()->getUserByName($this->getOwner());
	}
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask() {
		return 0077;
	}
	
	public function removeCollaborator(AbstractEyeosPrincipal $collaborator) {
		SharingManager::getInstance()->removeCollaborator($this, $collaborator);
	}
	
	/**
	 * 
	 * @param ITag $tag
	 */
	public function removeTag(ITag $tag) {
		TagManager::getInstance()->removeTag($this, $tag);
	}
	
	public function setId($id) {
		if (!is_string($id)) {
			throw new EyeInvalidArgumentException('$id must be a string (' . gettype($id) . ' given).');
		}
		$meta = $this->getMeta();
		if ($meta === null) {
			$meta = MetaManager::getInstance()->getNewMetaDataInstance($this);
		}
		$existingId = $meta->get(self::METADATA_KEY_ID);
		if ($existingId !== null) {
			throw new EyeBadMethodCallException('Cannot overwrite existing id for file ' . $this->path . '.');
		}
		$meta->set(self::METADATA_KEY_ID, $id);
		$this->setMeta($meta);
	}
	
	public function updateCollaboratorPermission(AbstractEyeosPrincipal $collaborator, SharePermission $permission) {
		SharingManager::getInstance()->updateCollaboratorPermission($this, $collaborator, $permission);
	}
}
?>