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

AdvancedPathLib::parse_url_registerFragment2PathProtocol(array(EyeosAbstractVirtualFile::URL_SCHEME_USERCONF));

/**
 * This class ...
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeUserConfFile extends EyeosAbstractVirtualFile {	
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
	
	public static function autocompletePath($path) {
		if (is_array($path)) {
			$urlParts &= $path;
		} else {
			$urlParts = EyeosAbstractVirtualFile::parse_url($path);
		}
		if ($urlParts['scheme'] != self::URL_SCHEME_USERCONF) {
			throw new EyeInvalidArgumentException($urlParts['scheme'] . ' is not a valid scheme for user conf file, expecting ' . self::URL_SCHEME_USERCONF . '.');
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
		$path = EyeosAbstractVirtualFile::buildUrl($urlParts);
		return $path;
	}
	
	public function addFileListener(IFileListener $listener) {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}
	
	/**
	 * @param mixed $newGroup The group name or group number or an object representing the group.  
	 * @param bool $recursive
	 * @return boolean TRUE if the group has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chgrp($newGroup, $recursive = false) {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}
	
	/**
	 * @param int $newMode The new mode (octal value). 
	 * @param bool $recursive
	 * @return boolean TRUE if the mode has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeInvalidArgumentException
	 */
	public function chmod($newMode, $recursive = false) {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}
	
	/**
	 * @param mixed $newGroup The user name or user number or an object representing the user. 
	 * @param bool $recursive
	 * @return boolean TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 */
	public function chown($newOwner, $recursive = false) {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}
	
	/**
	 * @param IFile $target The target file the link will point to
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created, FALSE otherwise
	 */
	public function createNewLink(IFile $target, $overwrite = false) {
		throw new EyeUnsupportedOperationException(__METHOD__);
	}
	
	/**
	 * @return array(IFileListener) The listeners objects for this file.
	 */
	public function getAllFileListeners() {
		return array();
	}
	
	/**
	 * @return string The group of the file
	 */
	public function getGroup() {
		return SERVICE_UM_DEFAULTUSERSGROUP;
	}
	
	/**
	 * @return string The owner of the file
	 */
	public function getOwner() {
		$urlParts = $this->getURLComponents();
		if (!isset($urlParts['principalname'])) {
			throw new EyeUnexpectedValueException('Unable to get owner for file ' . $this->path . ': inconsistency of the filesystem detected.');
		}
		return $urlParts['principalname'];
	}
	
	/**
	 * @return string The permissions of the file
	 */
	public function getPermissions($octal = true) {
		if (!$this->exists()) {
			throw new EyeFileNotFoundException('File ' . $this->path . ' does not exist.');
		}
		if ($this->isDirectory()) {
			$perm = self::PERMISSIONS_MASK_DIR & ~$this->getUMask();
		} else if ($this->isLink()) {
			$perm = self::PERMISSIONS_VALUE_LINK;
		} else {
			$perm = self::PERMISSIONS_MASK_FILE & ~$this->getUMask();
		}
		if (!$octal) {
			$perm = AdvancedPathLib::permsToUnix($perm);
		}
		return $perm;
	}
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask() {
		return 0077;
	}
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise
	 */
	public function isLink() {
		return false;
	}
}
?>