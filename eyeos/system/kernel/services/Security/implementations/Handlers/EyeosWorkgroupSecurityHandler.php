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
 * 
 * @package kernel-services
 * @subpackage Security
 */
class EyeosWorkgroupSecurityHandler implements ISecurityHandler {
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
	 * @throws EyeAccessControlException
	 */
	public function checkPermission($object, IPermission $permission, LoginContext $context) {
		if (!$object instanceof AbstractEyeosWorkgroup && !$object instanceof EyeosUserWorkgroupAssignation) {
			throw new EyeInvalidArgumentException('$object must be an AbstractEyeosWorkgroup or an EyeosUserWorkgroupAssignation.');
		}
		
		// $object is a Workgroup => check for actions: Create, Update, Delete
		if ($object instanceof AbstractEyeosWorkgroup) {
			$wgManagersGroups = UMManager::getInstance()->getGroupByName('wg-managers');
			
			// The user must be member of the system group "wg-managers"
			if (!$context->getSubject()->getPrincipals()->contains($wgManagersGroups)) {
				throw new EyeAccessControlException('The specified action requires privileges of group "wg-managers".');
			}
			
			// Update or Delete? Must be owner
			if (in_array('update', $permission->getActions()) || in_array('delete', $permission->getActions())) {
				try {
					$eyeosUser = $context->getEyeosUser();
				} catch (EyeNullPointerException $e) {
					$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
					return false;
				}
				
				if ($object->getOwnerId() != $eyeosUser->getId()) {
					throw new EyeAccessControlException('Only the owner of the workgroup can perform the requested action(s): ' . $permission->getActionsAsString() . '.');
				}
			}
			return true;
		}
		// ========================================================================================
		// $object is an assignation => check for actions: AddToWorkgroup, Update, RemoveFromWorkgroup
		else {
			try {
				$eyeosUser = $context->getEyeosUser();
			} catch (EyeNullPointerException $e) {
				$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
				return false;
			}
			
			try {
				$workgroup = UMManager::getInstance()->getWorkgroupById($object->getWorkgroupId());
			} catch (EyeNoSuchWorkgroupException $e) {
				throw new EyeAccessControlException('Unknown workgroup with ID "' . $object->getWorkgroupId() . '".', 0, $e);
			}
			
			// Retrieve the role of the current user in the workgroup
			$currentUserAssignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
			$currentUserAssignation->setUserId($eyeosUser->getId());
			$currentUserAssignation->setWorkgroupId($object->getWorkgroupId());
			$currentUserAssignation = current(UMManager::getInstance()->getAllUserWorkgroupAssignations($currentUserAssignation));
			
			
			foreach($permission->getActions() as $action) {
				// Add to workgroup
				if ($action == 'addtoworkgroup') {
					// If the workgroup's privacy mode is OPEN
					if ($workgroup->getPrivacyMode() === WorkgroupConstants::PRIVACY_OPEN) {
						// If the current user is the one joining the workgroup
						if ($eyeosUser->getId() == $object->getUserId()) {
							// Check for illegal role
							if (($object->getRole() === WorkgroupConstants::ROLE_OWNER && $workgroup->getOwnerId() != $object->getUserId())
								|| $object->getRole() === WorkgroupConstants::ROLE_ADMIN) {
								throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '": cannot join a workgroup as owner or admin.');
							}
							return true;
						} else {
							// If the current user is not a member, exit here
							if ($currentUserAssignation === false) {
								throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
							}
							// If the current user is the owner or an admin, he has the right to INVITE
							if ($currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_OWNER
								&& $currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_ADMIN) {
								throw new EyeAccessControlException('Access denied to non-admin of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
							}
							if ($object->getStatus() !== WorkgroupConstants::STATUS_INVITED) {
								throw new EyeAccessControlException('Access denied to admin of workgroup "' . $workgroup->getName() . '": can only invite a member into the workgroup.');
							}
							return true;
						}
					}
					// The workgroup's privacy mode is ONREQUEST
					else if ($workgroup->getPrivacyMode() === WorkgroupConstants::PRIVACY_ONREQUEST) {
						// If the current user is the one joining the workgroup
						if ($eyeosUser->getId() == $object->getUserId()) {
							// Check for illegal role
							if (($object->getRole() === WorkgroupConstants::ROLE_OWNER && $workgroup->getOwnerId() != $object->getUserId())
								|| $object->getRole() === WorkgroupConstants::ROLE_ADMIN) {
								throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '": cannot apply for membership of workgroup ' . $workgroup->getName() . ' as owner or admin.');
							}
							// The status must be PENDING
							if ($workgroup->getOwnerId() != $object->getUserId() && $object->getStatus() !== WorkgroupConstants::STATUS_PENDING) {
								throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '": can only apply for membership of workgroup ' . $workgroup->getName() . '.');
							}
							return true;
						} else {
							// If the current user is not a member, exit here
							if ($currentUserAssignation === false) {
								throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
							}
							// If the current user is the owner or an admin, he has the right to INVITE
							if ($currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_OWNER
								&& $currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_ADMIN) {
								throw new EyeAccessControlException('Access denied to non-admin of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
							}
							if ($object->getStatus() !== WorkgroupConstants::STATUS_INVITED) {
								throw new EyeAccessControlException('Access denied to admin of workgroup "' . $workgroup->getName() . '": can only invite a member into the workgroup.');
							}
							return true;
						}
					}
					// The workgroup's privacy mode is ONINVITATION
					else if ($workgroup->getPrivacyMode() === WorkgroupConstants::PRIVACY_ONINVITATION) {
						// If the current user is the one joining the workgroup
						if ($eyeosUser->getId() == $object->getUserId()) {
							// If the owner joins his workgroup (at creation), access granted
							if ($eyeosUser->getId() == $workgroup->getOwnerId()) {
								return true;
							}
							throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '": cannot apply for membership of workgroup ' . $workgroup->getName() . ', access is on invitation only.');
						} else {
							// If the current user is not a member, exit here
							if ($currentUserAssignation === false) {
								throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
							}
							// If the current user is the owner or an admin, he has the right to INVITE
							if ($currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_OWNER
								&& $currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_ADMIN) {
								throw new EyeAccessControlException('Access denied to non-admin of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
							}
							if ($object->getStatus() !== WorkgroupConstants::STATUS_INVITED) {
								throw new EyeAccessControlException('Access denied to admin of workgroup "' . $workgroup->getName() . '": can only invite a member into the workgroup.');
							}
							return true;
						}
					}
				}
				// ------------------------------------------------------------
				// Remove from workgroup
				else if ($action == 'removefromworkgroup') {
					// If the current user is the one leaving the workgroup
					if ($eyeosUser->getId() == $object->getUserId()) {
						return true;
					}
					
					// if the user is not a member, exit here
					if ($currentUserAssignation === false) {
						throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
					}
					if ($currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_OWNER
						&& $currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_ADMIN) {
						throw new EyeAccessControlException('Access denied to non-admin of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
					}
					return true;
				}
				// ------------------------------------------------------------
				// Update membership
				else if ($action == 'update') {
					// if the user is not a member, exit here
					if ($currentUserAssignation === false) {
						throw new EyeAccessControlException('Access denied to non-member of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
					}
					
					// Current user is the one from the assignation $object,
					// and the transition is from "invited" to "member" => access granted
					if ($eyeosUser->getId() == $currentUserAssignation->getUserId()
						&& $currentUserAssignation->getStatus() === WorkgroupConstants::STATUS_INVITED
						&& $object->getStatus() === WorkgroupConstants::STATUS_MEMBER) {
						return true;
					} else {
						if ($currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_OWNER
							&& $currentUserAssignation->getRole() !== WorkgroupConstants::ROLE_ADMIN) {
							throw new EyeAccessControlException('Access denied to non-admin of workgroup "' . $workgroup->getName() . '" for action(s): ' . $permission->getActionsAsString() . '.');
						}
						return true;
					}
				} else {
					// Unknown action
					$this->failureException = new EyeHandlerFailureException('Unknown action specified: ' . $action);
					return false;
				}
			}
		}
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
