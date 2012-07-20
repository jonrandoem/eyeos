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
 * This class controls access to workgroup virtual files' metadata and
 * provides special behaviour when user is owner or admin (always allow).
 * 
 * @package kernel-services
 * @subpackage Security
 */
class EyeosWorkgroupFileMetaDataSecurityHandler implements ISecurityHandler {
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
		
		// This handler is only for workgroup files, so check that we are dealing with metadata of that kind
		$fileObject = $permission->getRelatedObject();
		if ($fileObject === null || !$fileObject instanceof EyeWorkgroupFile) {
			$this->failureException = new EyeHandlerFailureException('Can only work with metadata of workgroup files.');
			return false;
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}
		
		$UM = UMManager::getInstance();
		$workgroup = $fileObject->getWorkgroup();
		
		// Retrieve current user / file's workgroup assignation
		$assignation = $UM->getNewUserWorkgroupAssignationInstance();
		$assignation->setUserId($eyeosUser->getId());
		$assignation->setWorkgroupId($workgroup->getId());
		$assignation = current($UM->getAllUserWorkgroupAssignations($assignation));
		
		// No assignation found => user is not member of the group
		if ($assignation === false) {
			throw new EyeAccessControlException('Only members of workgroup "' . $workgroup . '" can access workgroup files.');
		}
		
		// Owner and admins have *all* permissions
		if ($assignation->getRole() === WorkgroupConstants::ROLE_OWNER
			|| $assignation->getRole() === WorkgroupConstants::ROLE_ADMIN
			|| $assignation->getRole() === WorkgroupConstants::ROLE_EDITOR) {
			return true;
		}
		
		// Don't perform further checks. Default behaviour will be handled by EyeosFileMetaDataSecurityHandler
		// using UNIX-like permissions of files. We just needed a special processing for owner and admins.
		
		$this->failureException = new EyeHandlerFailureException('User is not the owner nor an admin of workgroup "' . $workgroup . '".');
		return false;
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
