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

define('SERVICE_SECURITY_CONFIGURATION_FILE_EXTENSION', '.xml');

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
interface ISecurityManager {
	/**
	 * Throws a SecurityException if the requested access, specified by the given permission,
	 * is not permitted based on the security policy currently in effect.
	 * @param mixed $object The object to be checked.
	 * @param IPermission $permission The permission to check.
	 * @throws EyeSecurityException If the security manager denied given permission to the given $object.
	 */
	public function checkPermission($object, IPermission $perm);
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
interface IBasicSecurityManager extends ISecurityManager {
	/**
	 * @param mixed $object The object to be checked for access rights.
	 * @return boolean TRUE if the security manager allowed the object to be accessed.
	 * @throws EyeSecurityException If the security manager denied access to the given $object.
	 */
	public function checkAccess($object);
	
	/**
	 * @param mixed $object The object to be checked for admin rights.
	 * @return boolean TRUE if the security manager allowed the object to be accessed.
	 * @throws EyeSecurityException If the security manager denied access to the given $object.
	 */
	public function checkAdmin($object);
	
	/**
	 * @param mixed $object The object to be checked for deletion rights.
	 * @return boolean TRUE if the security manager allowed the object to be deleted.
	 * @throws EyeSecurityException If the security manager denied deletion of the given $object.
	 */
	public function checkDelete($object);
	
	/**
	 * @param mixed $object The object to be checked for access rights.
	 * @return boolean TRUE if the security manager allowed the object to be accessed.
	 * @throws EyeSecurityException If the security manager denied access to the given $object.
	 */
	public function checkExecute($object);
	
	/**
	 * @param mixed $object The object to be checked for read access rights.
	 * @return boolean TRUE if the security manager allowed the object to be read.
	 * @throws EyeSecurityException If the security manager denied read access to the given $object.
	 */
	public function checkRead($object);
	
	/**
	 * @param mixed $object The object to be checked for write access rights.
	 * @return boolean TRUE if the security manager allowed the object to be writen.
	 * @throws EyeSecurityException If the security manager denied write access to the given $object.
	 */
	public function checkWrite($object);
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
interface INetworkSecurityManager extends ISecurityManager {
	/**
	 * @param mixed The object containing the connection information (host, port).
	 * @return boolean TRUE if the security manager allowed the connection.
	 * @throws EyeSecurityException If the security manager denied write access to the given $object.
	 */
	public function checkConnect($object);
	
	/**
	 * @param mixed The object containing the connection information (host, port).
	 * @return boolean TRUE if the security manager allowed the connection.
	 * @throws EyeSecurityException If the security manager denied write access to the given $object.
	 */
	public function checkListen($object);
}

/**
 * 
 * @package kernel-services
 * @subpackage Security
 */
interface ISecurityHandler {
	/**
	 * 
	 * @param array $params Special parameters for the handler, depending on its type and implementation.
	 */
	public function __construct(array $params = null);
	
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
	public function checkPermission($object, IPermission $permission, LoginContext $context);
	
	
	/**
	 * Returns the cause of the failure if any.
	 * 
	 * @return EyeHandlerFailureException
	 */
	public function getFailureException();
}
?>