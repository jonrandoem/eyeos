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
class EyeosFileSecurityHandler implements ISecurityHandler {
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
			self::$Logger = Logger::getLogger('system.services.Security.EyeosFileSecurityHandler');
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
		if (!$object instanceof IFile) {
			throw new EyeInvalidArgumentException('$object must be an IFile.');
		}

		if($object instanceof EyeUserFile) {
			$name = $object->getName();
			if($name == '.htaccess') {
				throw new EyeAccessControlException('You cannot access that kind of file (.HTACCESS).');
			}
			if( '' == $name ) {
				throw new EyeAccessControlException('Empty filename not allowed');
			}
			if( strstr($name,'?') ) {
				throw new EyeAccessControlException('Invalid character ? on filename');
			}
			if( strstr($name,'#') ) {
				throw new EyeAccessControlException('Invalid character # on filename');
			}
			
			if( strstr($name,'&') ) {
				throw new EyeAccessControlException('Invalid character & on filename');
			}
			
			if( strstr($name,'<') ) {
				throw new EyeAccessControlException('Invalid character < on filename');
			}
			
			if( strstr($name,'>') ) {
				throw new EyeAccessControlException('Invalid character > on filename');
			}
		}

		// If the target file does not exist or we are requesting a deletion permission,
		// we must check write permissions on the parent folder, to know whether the current
		// user is allowed or not to manipulate files within it.
		if (!$object->exists() || in_array('delete', $permission->getActions())) {
			$parentFolder = $object->getParentFile();
			if (!$parentFolder->equals($object)) {
				$parentFolder->checkWritePermission();
				return true;
			}
		}



		try {
			$eyeosUser = $context->getEyeosUser();
		} catch (EyeNullPointerException $e) {
			$this->failureException = new EyeHandlerFailureException('No eyeos user found in login context.');
			return false;
		}

		$objectPermissions = $object->getPermissions(true);
		if (!is_int($objectPermissions)) {
			$this->failureException = new EyeHandlerFailureException('"' . $objectPermissions . '" is not a valid octal UNIX permission for file ' . $object->getPath() . '.');
			return false;
		}

		try {
			$owner = UMManager::getInstance()->getUserByName($object->getOwner());
		} catch (EyeNoSuchUserException $e) {
			//This is a workaround: when the owner of a workgroup file not longer exist
	        //we have to set a new owner for that file, otherwise we have an exception
	        //when we try to access to load owner informations.
			if (get_class($object) == 'EyeWorkgroupFile') {
				$object->fixOwner();
				$owner = UMManager::getInstance()->getUserByName($object->getOwner());
			} else {
				throw $e;
			}
		}
		$group = UMManager::getInstance()->getGroupByName($object->getGroup());

		$accessGranted = false;
		$actionText = '';
		foreach($permission->getActions() as $action) {
			if ($action == 'admin') {
				if ($eyeosUser->getName() != $object->getOwner()) {
					throw new EyeAccessControlException('Only the owner ' . $object->getOwner() . ' has admin rights for file ' . $object->getPath() . '.');
				}
				continue;
			} else if ($action == 'read') {
				$ref = 0400;
				$actionText = 'Read';
			} else if ($action == 'write') {
				$ref = 0200;
				$actionText = 'Write';
			} else if ($action == 'execute') {
				$ref = 0100;
				$actionText = 'Execution';
			} else {
				// the given action is not supported by this handler
				$this->failureException = new EyeHandlerFailureException('Unknown action received: ' . $action . '. Wrong configuration?');
				return false;
			}

			//owner
			if ($eyeosUser->getId() == $owner->getId()) {
				if ($ref & $objectPermissions) {
					$accessGranted = true;
					continue;
				} else {
					throw new EyeAccessControlException($actionText . ' access denied to user ' . $eyeosUser->getName() . ' for file ' . $object->getPath() . ' (insufficient permissions).');
				}
			} else {
				$ref = $ref >> 3;
				//group
				if ($context->getSubject()->getPrincipals()->contains($group)) {
					if ($ref & $objectPermissions) {
						$accessGranted = true;
						continue;
					} else {
						throw new EyeAccessControlException($actionText . ' access denied to user ' . $eyeosUser->getName() . ' for file ' . $object->getPath() . ' (insufficient permissions).');
					}
				} else {
					$ref = $ref >> 3;
					//others
					if ($ref & $objectPermissions) {
						$accessGranted = true;
						continue;
					} else {
						throw new EyeAccessControlException($actionText . ' access denied to user ' . $eyeosUser->getName() . ' for file ' . $object->getPath() . ' (insufficient permissions).');
					}
				}
			}
		}
		if (self::$Logger->isInfoEnabled()) {
			self::$Logger->info('Access granted to user ' . $eyeosUser->getName() . ' for actions "' . $permission->getActionsAsString() . '" on file ' . $object->getPath() . '.');
		}
		return true;
	}

	public function getFailureException() {
		return $this->failureException;
	}
}
?>
