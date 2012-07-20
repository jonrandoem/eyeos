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
 * Defines a sharing manager.
 * 
 * @package kernel-services
 * @subpackage Sharing
 */
interface ISharingManager {
	/**
	 * Adds given $collaborator with given $permission to the list of collaborators of $object.
	 * 
	 * @param IShareable $object
	 * @param AbstractEyeosPrincipal $collaborator
	 * @param IPermission $permission
	 */
	public function addCollaborator(IShareable $object, AbstractEyeosPrincipal $collaborator, IPermission $permission);
	
	/**
	 * Returns all the share info from $object.
	 * 
	 * @param IShareable $object
	 * @return array(IShareInfo)
	 */
	public function getAllShareInfo(IShareable $object);
	
	/**
	 * Returns all the share info from $owner (optionnally of type $type).
	 * 
	 * @param AbstractEyeosUser $owner
	 * @param mixed $classType The type/classname or an object to use as a filter
	 * @return array(IShareInfo)
	 */
	public function getAllShareInfoFromOwner(AbstractEyeosUser $owner, $classType = null);
	
	/**
	 * Returns all the share info from $owner with $collaborator (optionnally of type $type).
	 * 
	 * @param AbstractEyeosPrincipal $collaborator
	 * @param AbstractEyeosUser $owner
	 * @param mixed $classType The type/classname or an object to use as a filter
	 * @return array(IShareInfo)
	 */
	public function getAllShareInfoFromCollaborator(AbstractEyeosPrincipal $collaborator, AbstractEyeosUser $owner = null, $classType = null);
	
	/**
	 * Returns the share info of $collaborator on $object.
	 * 
	 * @param IShareable $object
	 * @param AbstractEyeosPrincipal $collaborator
	 * @return array(IShareInfo)
	 */
	public function getShareInfo(IShareable $object, AbstractEyeosPrincipal $collaborator);
	
	/**
	 * Notifies the sharing manager that $object has been deleted.
	 * This can be used to remove all associated information to $object from the sharing system.
	 * 
	 * @param IShareable $object
	 */
	public function notifyShareableObjectDeleted(IShareable $object);
	
	/**
	 * Notifies the sharing manager that $object has been updated.
	 * This can be used to update all associated information to $object in the sharing system.
	 * 
	 * @param IShareable $object
	 */
	public function notifyShareableObjectUpdated(IShareable $object);
	
	/**
	 * Removes $collaborator from the list of collaborators of $object.
	 * 
	 * @param IShareable $object
	 * @param AbstractEyeosPrincipal $collaborator
	 */
	public function removeCollaborator(IShareable $object, AbstractEyeosPrincipal $collaborator);
	
	/**
	 * Updates the $collaborator's permission on $object with the new $permission.
	 * 
	 * @param IShareable $object
	 * @param AbstractEyeosPrincipal $collaborator
	 * @param IPermission $permission
	 */
	public function updateCollaboratorPermission(IShareable $object, AbstractEyeosPrincipal $collaborator, IPermission $permission);
}

/**
 * Defines a class taht is able to store sharing information on a support and
 * then access them through different methods.
 * 
 * [ShareInfo/ShareableObject data] <=> [storage support]
 * 
 * @package kernel-services
 * @subpackage Sharing
 */
interface IShareInfoProvider extends ISingleton {
	/**
	 * Deletes all shareinfo that match given $partialShareInfo.
	 * 
	 * @param AbstractEyeosPrincipal $owner
	 * @param array $partialShareInfo
	 */
	public function deleteShareInfo(AbstractEyeosPrincipal $owner, array $partialShareInfo);
	
	/**
	 * Returns all shareinfo that match given $partialShareInfo.
	 * 
	 * @param array $partialShareInfo
	 */
	public function retrieveShareInfo(array $partialShareInfo);
	
	/**
	 * Saves given $shareInfo and $shareableObjectData that belong to given $owner.
	 * 
	 * @param AbstractEyeosPrincipal $owner
	 * @param array $shareInfo
	 * @param array $shareableObjectData
	 */
	public function storeShareInfo(AbstractEyeosPrincipal $owner, array $shareInfo, array $shareableObjectData);
	
	/**
	 * Updates already existing shareinfo with given $partialShareInfo.
	 * 
	 * @param AbstractEyeosPrincipal $owner
	 * @param array $partialShareInfo
	 */
	public function updateShareInfo(AbstractEyeosPrincipal $owner, array $partialShareInfo);
	
	/**
	 * Updates sharebale object data with given $shareableObjectData.
	 * 
	 * @param AbstractEyeosPrincipal $owner
	 * @param array $shareableObjectData
	 */
	public function updateShareableObjectsData(AbstractEyeosPrincipal $owner, array $shareableObjectData);
}

/**
 * Defines a class that is able to manage sharing for a particular type of objects.
 * A class that implements this interface may know how exactly works the type of objects
 * it manipulates, in order to keep data consistency, etc.
 * 
 * [ShareableObject] <=> [ShareableObject data]
 * 
 * @package kernel-services
 * @subpackage Sharing
 */
interface IShareableObjectsHandler extends ISingleton {
	public function checkType($classType);
	public function createShareableObject(array $shareableObjectData);
	public function & getShareableObjectData(IShareable $object, array & $shareableObjectData);
	public function notifySharingStarted(IShareable $object);
	public function notifySharingStopped(IShareable $object);
}

/**
 * Defines a permission type for shareable objects.
 * 
 * @package kernel-services
 * @subpackage Sharing
 */
class SharePermission extends AbstractPermission {
	/**
	 * @var array(string)
	 */
	private $actions = array();
	
	/**
	 * @var mixed
	 */
	private $relatedObject = null;
	
	
	/**
	 * @param string $name
	 * @param mixed $actions Array of string containing the actions for this permission.
	 */
	public function __construct($actions, $relatedObject = null) {
		parent::__construct('');
		$this->actions = self::explodeActions($actions);
		$this->relatedObject = $relatedObject;
	}
	
	/**
	 * Returns the actions as an array of strings.
	 * Example: array('read','write','execute')
	 * @return array(string)
	 */
	public function getActions() {
		return $this->actions;
	}
	
	/**
	 * Returns an empty collection of permissions of type of this class.
	 * @return IPermissionCollection
	 */
	public static function newPermissionCollection() {
		throw new EyeNotImplementedException(__METHOD__);
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
interface ISharingListener extends IEventListener {
	public function collaboratorAdded(SharingEvent $e);
	public function collaboratorPermissionUpdated(SharingEvent $e);
	public function collaboratorRemoved(SharingEvent $e);
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
abstract class AbstractSharingAdapter implements ISharingListener {
	public function collaboratorAdded(SharingEvent $e) {}
	public function collaboratorPermissionUpdated(SharingEvent $e) {}
	public function collaboratorRemoved(SharingEvent $e) {}
}

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class SharingEvent extends EventObject {
	// nothing more
}
?>
