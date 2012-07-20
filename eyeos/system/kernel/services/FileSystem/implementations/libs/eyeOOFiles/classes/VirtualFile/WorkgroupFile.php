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

AdvancedPathLib::parse_url_registerFragment2PathProtocol(array(EyeosAbstractVirtualFile::URL_SCHEME_WORKGROUPFILES));

/**
 * This class ...
 *
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeWorkgroupFile extends EyeosAbstractVirtualFile implements IShareableFile {
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
			parent::__construct($path, $params);
		} catch (EyeException $e) {
			throw new EyeException('Unable to create ' . __CLASS__ . '.', 0, $e);
		}
	}

	public function addCollaborator(AbstractEyeosPrincipal $collaborator, SharePermission $permissions) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}

		SharingManager::getInstance()->addCollaborator($this, $collaborator, $permissions);
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

	/**
	 * Sets as a owner for the file, the owner of the workgroup.
	 * This is a workaround: when the owner of a workgroup file not longer exist
	 * we have to set a new owner for that file, otherwise we have an exception
	 * when we try to access to load owner informations.
	 */
	public function fixOwner() {
		$workgroup = $this->getWorkgroup();
		$ownerId = $workgroup->getOwnerId();
		$userName = UMManager::getInstance()->getUserById($ownerId)->getName();
		$meta = $this->getMeta();
		$meta->set('owner', $userName);
		$this->setMeta($meta);
	}

	public function getAllCollaborators() {
		if ($this->realFile === null) {
			return array();
		}

		$shareInfos = SharingManager::getInstance()->getAllShareInfo($this);
		$collaborators = array();
		foreach($shareInfos as $shareInfo) {
			$collaborators[$shareInfo->getCollaborator()->getId()] = $shareInfo->getCollaborator();
		}
		return $collaborators;
	}

	public function getAllEditors() {
		if ($this->realFile === null) {
			return array();
		}

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
		if ($this->realFile === null) {
			return array();
		}

		return SharingManager::getInstance()->getAllShareInfo($this);
	}

	public function getAllViewers() {
		if ($this->realFile === null) {
			return array();
		}

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
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}

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
		if ($urlParts['path'] == '/') {
			if (!isset($urlParts['principalname'])) {
				return '/';
			} else {
				return $urlParts['principalname'];
			}
		}
		return parent::getName();
	}

	public function getShareOwner() {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}

		return UMManager::getInstance()->getWorkgroupByName($this->getOwner());
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

	/**
	 * @return IWorkgroup The workgroup this file belongs to.
	 */
	public function getWorkgroup() {
		$urlParts = $this->getURLComponents();
		if (!isset($urlParts['principalname'])) {
			throw new EyeInvalidArgumentException('Unable to find which workgroup to use for path "' . $this->getPath() . '".');
		}
		return UMManager::getInstance()->getWorkgroupByName($urlParts['principalname']);
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
		}

		// ROOT (workgroup://): list the workgroups the current user is member of
		if ($isRoot) {
			$UM = UMManager::getInstance();

			$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();

			// Retrieve all user/workgroup assignations with current user
			$refAssignation = $UM->getNewUserWorkgroupAssignationInstance();
			$refAssignation->setUserId($currentUser->getId());
			$assignations = $UM->getAllUserWorkgroupAssignations($refAssignation);

			// Build an array(workgroupId => workgroupName) only with workgroups the user is MEMBER of
			$workgroups = array();
			foreach($assignations as &$assignation) {
				$status = $assignation->getStatus();
				if ($status === WorkgroupConstants::STATUS_MEMBER) {
					$workgroups[] = $UM->getWorkgroupById($assignation->getWorkgroupId())->getName();
				}
			}
			sort($workgroups);

			foreach($workgroups as $workgroupName) {
				$files[] = FSI::getFile(self::URL_SCHEME_WORKGROUPFILES . '://' . self::URL_LOCATOR_CHAR . $workgroupName . '/');
			}
		} else {
			$files = parent::listFiles($pattern, $flags);
		}
		return $files;
	}

	public function removeCollaborator(AbstractEyeosPrincipal $collaborator) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}

		SharingManager::getInstance()->removeCollaborator($this, $collaborator);
	}

	public function setId($id) {
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}

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
		if ($this->realFile === null) {
			throw new EyeUnsupportedOperationException(__METHOD__ . ' on ' . $this->path);
		}

		SharingManager::getInstance()->updateCollaboratorPermission($this, $collaborator, $permission);
	}
}
?>