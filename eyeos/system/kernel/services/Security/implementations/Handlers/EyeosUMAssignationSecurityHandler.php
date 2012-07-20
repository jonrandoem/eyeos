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
class EyeosUMAssignationSecurityHandler implements ISecurityHandler {
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
		if (!$object instanceof EyeosPrincipalGroupAssignation) {
			throw new EyeInvalidArgumentException('$object must be a EyeosPrincipalGroupAssignation.');
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}
		
		try {
			$principal = UMManager::getInstance()->getPrincipalById($object->getPrincipalId());
		} catch (EyeNoSuchPrincipalException $e) {
			$actions = $permission->getActions();
			if (in_array('removefromgroup', $actions)) {
				// The principal we want to remove from the group is not found
				// => we can delete assignation safely, whoever we are
				return true;
			}
		}
		
		$group = UMManager::getInstance()->getPrincipalById($object->getGroupId());
		
		// Special processing for workgroup/master group assignations
		if ($principal instanceof IWorkgroup) {
			foreach($permission->getActions() as $action) {
				switch ($action) {
					case 'addtogroup':
						if (!$context->getSubject()->getPrincipals()->contains($group)) {
							throw new EyeAccessControlException('Cannot add workgroup "' . $principal->getName() . '" to group ' . $group->getName() . ': insufficient permissions.)');
						}
						break;
						
					case 'removefromgroup':
						if ($principal->getOwnerId() != $eyeosUser->getId()) {
							throw new EyeAccessControlException('Cannot remove workgroup "' . $principal->getName() . '" from group ' . $group->getName() . ': insufficient permissions.)');
						}
						break;
				}
			}
			return true;
		}
		throw new EyeAccessControlException('Access denied to UM assignation (actions: ' . $permission->getActionsAsString() . ')');
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
