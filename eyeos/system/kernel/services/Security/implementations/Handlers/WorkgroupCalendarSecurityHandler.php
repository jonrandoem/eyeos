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
 * This class controls access to workgroup files (scheme "workgroup://") and
 * configuration files (scheme "workgroup-conf://") using roles defined between
 * the workgroup and the user from the login context.
 * 
 * @package kernel-services
 * @subpackage Security
 */
class WorkgroupCalendarSecurityHandler implements ISecurityHandler {
	/**
	 * @var EyeHandlerFailureException
	 */
	private $failureException = null;
	
	private static $Logger = null;
	
	/**
	 * 
	 * @param array $params Special parameters for the handler. None is required here.
	 */
	public function __construct(array $params = null) {
		if (self::$Logger === null) {
			self::$Logger = Logger::getLogger('system.services.Security.WorkgroupCalendarSecurityHandler');
		}
	}
	
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
		if (!$object instanceof CalendarManager ) {
			throw new EyeInvalidArgumentException('$object must be an CalendarManager.');
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}
		
		$workgroup = $object->getWorkgroup();
		
		// if calendar not belongs to any group do not apply any security checks
		if(!count($workgroup)){ 
			return true;
		}
			
		// The current user is the owner of the workgroup => access granted
		if ($workgroup->getOwnerId() == $eyeosUser->getId()) {
			return true;
		}
		
		// Retrieve the role of the current user inside the workgroup (if member)
		$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$assignation->setUserId($eyeosUser->getId());
		$assignation->setWorkgroupId($workgroup->getId());
		$assignation = current(UMManager::getInstance()->getAllUserWorkgroupAssignations($assignation));
		if ($assignation === false || $assignation->getStatus() == WorkgroupConstants::STATUS_INVITED) {
			throw new EyeAccessControlException('Access denied to user ' . $eyeosUser->getName() . ' (not member of the workgroup).');
		}
		
		$refPermissionActions = array();
		
		// Check access to a workgroup:// file
		if ($object instanceof CalendarManager) {
			// The workgroup has its activity locked => write access denied
			if (in_array('write', $permission->getActions()) && $workgroup->getStatus() & AbstractEyeosWorkgroup::STATUS_ACTIVITY_LOCKED) {
				throw new EyeAccessControlException('Access denied to the specified calendar: the activity of the workgroup ' . $workgroup->getName() . ' is currently locked.');
			}
			
			switch ($assignation->getRole()) {
				case WorkgroupConstants::ROLE_ADMIN:
					return true;
				
				case WorkgroupConstants::ROLE_EDITOR:
					$refPermissionActions = array('read', 'write');
					break;
					
				case WorkgroupConstants::ROLE_VIEWER:
					$refPermissionActions = array('read');
					break;
			}
		}		
	 	else {
			$this->failureException = new EyeHandlerFailureException('Unknown $object class.');
			return false;
		}
		$refPermission = new GroupCalendarPermission('', $refPermissionActions); 
		
		if ($refPermission->implies($permission)) {
			return true;
		}
		throw new EyeAccessControlException('Access denied to user ' . $eyeosUser->getName() .  ' (insufficient permissions).');
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
