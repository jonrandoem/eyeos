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

AdvancedPathLib::parse_url_registerFragment2PathProtocol(array(EyeosAbstractVirtualFile::URL_SCHEME_SYSTEM));

/**
 * This class ...
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class EyeSysFile extends EyeosAbstractVirtualFile {
	
	/**
	 * @param string $path The path to the file (MUST BE A VALID URL)
	 * @param mixed $params Additional arguments (could be useful for derivated classes)
	 * @throws EyeInvalidArgumentException
	 * @throws EyeMissingArgumentException
	 * @throws EyeNullPointerException
	 */
	public function __construct($path, $params = null) {
		try {
			$urlParts = AdvancedPathLib::parse_url($path);
			if ($urlParts['scheme'] != self::URL_SCHEME_SYSTEM) {
				throw new EyeInvalidArgumentException($urlParts['scheme'] . ' is not a valid scheme for system file, expecting ' . self::URL_SCHEME_SYSTEM . '.');
			}
		} catch (EyeException $e) {
			throw new EyeInvalidArgumentException($path . ' is not a valid path value.', 0, $e);
		}
		try {
			parent::__construct($path, $params);
		} catch (EyeException $e) {
			throw new EyeException('Unable to create ' . __CLASS__, 0, $e);
		}
	}
	
	/**
	 * @param mixed $newOwner The user name or user number or an object representing the user.
	 * @param bool $recursive
	 * @return bool TRUE if the owner has been successfully modified, FALSE otherwise.
	 * @throws EyeIOException
	 * @throws EyeSecurityException
	 */
	public function chown($newOwner, $recursive = false) {		
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
	 * @param IFile $target The target file the link will point to
	 * @param bool $overwrite
	 * @return bool TRUE if the link has been successfully created, FALSE otherwise
	 */
	public function createNewLink(IFile $target, $overwrite = false) {
		throw new EyeUnsupportedOperationException('Unable to create links in ' . self::URL_SCHEME_SYSTEM . '://');
	}
	
	/**
	 * @return IFile The target file pointed by the link, or FALSE if an error occured
	 */
	public function getLinkTarget() {
		throw new EyeUnsupportedOperationException($this->path . ' is not a link.');
	}
	
	/**
	 * @return int The umask to apply when creating new files/link/folders
	 */
	public function getUMask() {
		return 0022;
	}
	
	/**
	 * @return bool TRUE if the file is a link, FALSE otherwise
	 */
	public function isLink() {
		return false;
	}
}
?>