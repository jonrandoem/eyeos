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
 * ==================================================================================
 * 			EXPERIMENTAL - HIGHLY INCOMPLETE - NOT TO BE USED
 * ==================================================================================
 * 
 * @package kernel-services
 * @subpackage Security
 */
class WorkgroupObjectSecurityHandler implements ISecurityHandler {
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
		// Retrieve the related workgroup in a "hard" way
		// ## DEPRECATED ##
		$workgroup = null;
		/*try {
			if (method_exists($object, 'getOwnerId')) {
				$workgroup = UMManager::getInstance()->getPrincipalById($object->getOwnerId());
			}
		} catch (EyeNoSuchPrincipalException $e) {}
		try {
			if (!method_exists($object, 'getOwner')) {
				$workgroup = $object->getOwner();
				if (!$workgroup instanceof AbstractEyeosWorkgroup) {
					$workgroup = UMManager::getInstance()->getPrincipalByName($workgroup);
				}
			}
		} catch (EyeNoSuchPrincipalException $e) {}*/
		
		if (!$workgroup instanceof AbstractEyeosWorkgroup) {
			$this->failureException = new EyeHandlerFailureException('');
			return false;
		}
		
		// Check if the current context contains our workgroup
		$wgIdx = $context->getSubject()->getPrincipals()->getIndex($workgroup);
		if ($wgIdx === false) {
			throw new EyeAccessControlException('The specified action requires privileges of workgroup "' . $workgroup->getName . '".');
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			self::$Logger->warn('Can\'t check permissions for object of class' . get_class($object) . ': no EyeosUser found in login context. Operation cancelled.');
			return false;
		}
		
		// The current user is member of the workgroup, retrieve his permissions
		$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$assignation->setUserId($eyeosUser->getId());
		$assignation->setWorkgroupId($workgroup->getId());
		$assignation = current(UMManager::getInstance()->getAllUserWorkgroupAssignations($assignation));
		if (!$assignation instanceof EyeosUserWorkgroupAssignation) {
			return false;
		}
		
		//if (in_array(''))
		
		
		//{
		//		TODO
		//}
		
		return true;
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
