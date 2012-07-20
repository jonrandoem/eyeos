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
class EyeosApplicationSecurityHandler implements ISecurityHandler {
	/**
	 * @var EyeHandlerFailureException
	 */
	private $failureException = null;
	
	private static $Logger = null;
	
	/**
	 * 
	 * @param array $params Special parameters for the handler. Here none is required.
	 */
	public function __construct(array $params = null) {
		if (self::$Logger === null) {
			self::$Logger = Logger::getLogger('system.services.Security.EyeosApplicationSecurityHandler');
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
		if (!$object instanceof EyeosApplicationDescriptor) {
			throw new EyeInvalidArgumentException('$object must be an EyeosApplicationDescriptor.');
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}
		
		$meta = $object->getMeta();
		if ($meta === null) {
			throw new EyeNullPointerException('$meta cannot be null.');
		}
		$sysParams = $meta->get('eyeos.application.systemParameters');
		
		// Extract owner, group and permissions from application's metadata
		try {
			$owner = UMManager::getInstance()->getUserByName($sysParams['owner']);
		} catch (EyeNoSuchPrincipalException $e) {
			$this->failureException = new EyeHandlerFailureException('Unknown owner "' . $owner . '".');
			return false;
		}
		try {
			$group = UMManager::getInstance()->getGroupByName($sysParams['group']);
		} catch (EyeNoSuchPrincipalException $e) {
			$this->failureException = new EyeHandlerFailureException('Unknown group "' . $group . '".');
			return false;
		}
		try {
			$perms = AdvancedPathLib::permsToOctal($sysParams['permissions']);
		} catch (Exception $e) {
			$this->failureException = new EyeHandlerFailureException('"' . $perms . '" is not a valid octal UNIX permission for application ' . $object->getName() . '.');
			return false;
		}
		
		// Loop on actions (but here we currently know the action "execute" only)
		$accessGranted = false;
		$actionText = '';
		foreach($permission->getActions() as $action) {
			if ($action == 'execute') {
				$ref = 0100;
				$actionText = 'Execution';
			} else {
				// the given action is not supported by this handler
				$this->failureException = new EyeHandlerFailureException('Unknown action received: ' . $action . '.');
				return false;
			}
			
			//owner
			if ($eyeosUser->getId() == $owner->getId()) {
				if ($ref & $perms) {
					$accessGranted = true;
					continue;
				} else {
					throw new EyeAccessControlException($actionText . ' access denied to user ' . $eyeosUser->getName() . ' for application ' . $object->getName() . ' (insufficient permissions).');
				}
			} else {
				$ref = $ref >> 3;
				//group
				if ($context->getSubject()->getPrincipals()->contains($group)) {
					if ($ref & $perms) {
						$accessGranted = true;
						continue;
					} else {
						throw new EyeAccessControlException($actionText . ' access denied to user ' . $eyeosUser->getName() . ' for application ' . $object->getName() . ' (insufficient permissions).');
					}
				} else {
					$ref = $ref >> 3;
					//others
					if ($ref & $perms) {
						$accessGranted = true;
						continue;
					} else {
						throw new EyeAccessControlException($actionText . ' access denied to user ' . $eyeosUser->getName() . ' for application ' . $object->getName() . ' (insufficient permissions).');
					}
				}
			}
		}
		if (self::$Logger->isInfoEnabled()) {
			self::$Logger->info('Access granted to user ' . $eyeosUser->getName() . ' for actions "' . $permission->getActionsAsString() . '" on application ' . $object->getName() . '.');
		}
		return true;
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
