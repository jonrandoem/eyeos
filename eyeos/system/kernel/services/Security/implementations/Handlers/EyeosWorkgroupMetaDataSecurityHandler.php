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
 * This class controls access to workgroups metadata and prevent any WRITE
 * operation if the given $principal is not the owner or an admin of the workgroup.
 * 
 * @package kernel-services
 * @subpackage Security
 */
class EyeosWorkgroupMetaDataSecurityHandler implements ISecurityHandler {
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
		if (!$object instanceof WorkgroupMetaData) {
			throw new EyeInvalidArgumentException('$object must be a PrincipalMetaData.');
		}
		if (!$permission instanceof MetaDataPermission) {
			throw new EyeInvalidArgumentException('$permission must be a MetaDataPermission.');
		}
		
		$reqActions = $permission->getActions();
		
		// WRITE and DELETE require special privileges (owner or admin)
		if (in_array('delete', $reqActions) || in_array('write', $reqActions)) {
			$workgroup = $permission->getRelatedObject();
			
			try {
				$eyeosUser = $context->getEyeosUser();
			} catch (EyeNullPointerException $e) {
				$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
				return false;
			}
			
			// The current user is not the owner, search for the assignation to find his role
			if ($workgroup->getOwnerId() != $eyeosUser->getId()) {
				
				// First of all, is the current user member of the workgroup?
				if (!$context->getSubject()->getPrincipals()->contains($workgroup)) {
					throw new EyeAccessControlException('Access denied to the metadata of workgroup "' . $workgroup->getName() . '": not a member.');
				}
				
				$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
				$assignation->setUserId($eyeosUser->getId());
				$assignation->setWorkgroupId($workgroup->getId());
				$assignation = current(UMManager::getInstance()->getAllUserWorkgroupAssignations($assignation));
				if ($assignation === false) {
					throw new EyeUnexpectedValueException('Wrong assignation.');
				}
				
				if ($assignation->getRole() != WorkgroupConstants::ROLE_ADMIN) {
					throw new EyeAccessControlException('Access denied: Only the owner or the admin of the workgroup can write or delete specified resource.');
				}
			}
		}
			
		return true;
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
