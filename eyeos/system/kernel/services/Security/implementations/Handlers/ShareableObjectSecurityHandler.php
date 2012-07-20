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
class ShareableObjectSecurityHandler implements ISecurityHandler {
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
			self::$Logger = Logger::getLogger('system.services.Security.ShareableObjectSecurityHandler');
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
		if (!$object instanceof IShareable) {
			throw new EyeInvalidArgumentException('$object must be an IShareable.');
		}
		if ($object->getId(false) === null) {
			$this->failureException = new EyeHandlerFailureException('$object has no ID and though is probably not currently shared.');
			return false;
		}
		
		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}
		
		// General sharing actions (addCollaborator, removeCollaborator, updateCollaborator)
		$actions = $permission->getActions();
		if (in_array('addcollaborator', $actions) || in_array('removecollaborator', $actions) || in_array('updatecollaborator', $actions)) {
			// currently, only the owner can perform those actions
			if ($eyeosUser->getId() != $object->getShareOwner()->getId()) {
				self::$Logger->info('Access denied to non-owner user ' . $eyeosUser->getName() . ' for actions "' . $permission->getActionsAsString() . '" on object ' . $object->getId() . '.');
				throw new EyeAccessControlException('Only the owner of the object can perform that kind of actions (' . $permission->getActionsAsString() . ').');
			}
			self::$Logger->debug('Access granted to owner ' . $eyeosUser->getName() . ' for actions "' . $permission->getActionsAsString() . '" on object ' . $object->getId() . '.');
			return true;
		}
		
		// Object-dependant sharing actions
		try {
			$shareInfos = SharingManager::getInstance()->getAllShareInfo($object);
		} catch (Exception $e) {
			$logger = Logger::getLogger('system.services.Security.ShareableObjectSecurityHandler');
			$logger->warn('Cannot retrieve shareinfo on object with ID: ' . $object->getId(false));
			if ($logger->isDebugEnabled()) {
				$logger->debug(ExceptionStackUtil::getStackTrace($e, false));
			} else {
				$logger->warn('Exception message: ' . $e->getMessage());
			}
			$this->failureException = new EyeHandlerFailureException('Cannot retrieve shareinfo on object with ID: ' . $object->getId(false) . ': ' . $e->getMessage());
			return false;
		}
		
		foreach($shareInfos as $shareInfo) {
			$collaborator = $shareInfo->getCollaborator();
			
			//$collaborator is a group
			if ($collaborator instanceof IGroup) {
				// "is the subject in the current login context representative of the group collaborator?"
				if (in_array($collaborator, $context->getSubject()->getPrincipals())) {
					if ($shareInfo->getPermissions()->implies($permission)) {
						return true;
					} else {
						throw new EyeAccessControlException('$object permission actions (' . $shareInfo->getPermissions()->getActionsAsString() . ') '
							. 'do not imply requested permission (' . $permission->getActionsAsString() . ') for collaborator ' . $eyeosUser->getName() . '');
					}
				}
			}
			//$collaborator is a user
			else {
				if ($shareInfo->getCollaborator()->getId() == $eyeosUser->getId()) {
					if ($shareInfo->getPermissions()->implies($permission)) {
						return true;
					} else {
						throw new EyeAccessControlException('$object permission actions (' . $shareInfo->getPermissions()->getActionsAsString() . ') '
							. 'do not imply requested permission (' . $permission->getActionsAsString() . ') for collaborator ' . $eyeosUser->getName() . '');
					}
				}
			}
		}
		// No matching collaborator found => this module is not applicable to the current check => set it as FAILED
		$this->failureException = new EyeHandlerFailureException('No matching collaborator found for object with ID ' . $object->getId(false) . '.');
		return false;
	}
	
	public function getFailureException() {
		return $this->failureException;
	}
}
?>
