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
 * This class controls access to virtual files' metadata and prevent any WRITE
 * operation if the given $principal is not the owner of the file.
 * 
 * @package kernel-services
 * @subpackage Security
 */
class EyeosFileMetaDataSecurityHandler implements ISecurityHandler {
	/**
	 * @var EyeHandlerFailureException
	 */
	private $failureException = null;
	
	/**
	 * 
	 * @param array $params Special parameters for the handler. Here none is required.
	 */
	public function __construct(array $params = null) {}
	
	/**
	 * TODO
	 * 
	 * @param mixed $object
	 * @param IPermission $permission
	 * @param LoginContext $context
	 * @return bool TRUE if the handler performed the permission check successfully, FALSE otherwise.
	 * 
	 * @throws EyeInvalidArgumentException
	 * @throws EyeUnexpectedValueException
	 * @throws EyeAccessControlException
	 */
	public function checkPermission($object, IPermission $permission, LoginContext $context) {
		if (!$object instanceof VirtualFileMetaData) {
			throw new EyeInvalidArgumentException('$object must be a VirtualFileMetaData.');
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}
		
		foreach($permission->getActions() as $action) {
			if ($action == 'delete') {
				// DELETE metadata requires WRITE access to the file
				$fileObject = $permission->getRelatedObject();
				if ($fileObject === null) {
					throw new EyeNullPointerException('$permission->getRelatedObject()');
				}
				$fileObject->checkWritePermission();
			}
			// A write access is requested, we need to check deeply what keys are going to be overwritten
			else if ($action == 'write') {
				// Retrieve old metadata (and original owner)
				$oldMetaData = $permission->getOriginalMetaData();
				if ($oldMetaData === null) {
					throw new EyeNullPointerException('$permission->getOriginalMetaData()');
				}
				$ownerName = $oldMetaData->get(EyeosAbstractVirtualFile::METADATA_KEY_OWNER);
				
				// Compare new and old meta
//				$updatedKeys = array_keys(array_diff($object->getAll(), $oldMetaData->getAll()));
				
				// Updating the following value means that we have write access on the file
//				$publicKeys = array(EyeosAbstractVirtualFile::METADATA_KEY_MODIFICATIONTIME);
//				if ($updatedKeys == $publicKeys) {
				$fileObject = $permission->getRelatedObject();
				if ($fileObject === null) {
					throw new EyeNullPointerException('$permission->getRelatedObject()');
				}
				$fileObject->checkWritePermission();
//				}
//				// Some more sensitive values have been updated: only the owner has this right
//				else if ($eyeosUser->getName() != $ownerName) {
//					throw new EyeAccessControlException('Only the owner of the file (' . $ownerName . ') can write metadata to it.');
//				}
			}
		}
		return true;
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
