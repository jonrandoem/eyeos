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
 * Defines some convenient methods to manage sharing directly from the shareable objects.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IShareable extends EyeObject {
	public function addCollaborator(AbstractEyeosPrincipal $collaborator, SharePermission $permission);
	public function getAllCollaborators();
	public function getAllShareInfo();
	public function getShareOwner();
	public function removeCollaborator(AbstractEyeosPrincipal $collaborator);
	public function updateCollaboratorPermission(AbstractEyeosPrincipal $collaborator, SharePermission $permission);
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IShareInfo {
	/**
	 * @return AbstractEyeosPrincipal
	 */
	public function getCollaborator();
	
	/**
	 * @return string
	 */
	public function getHandlerClassName();
	
	/**
	 * @return AbstractEyeosUser
	 */
	public function getOwner();
	
	/**
	 * @return IPermission
	 */
	public function getPermissions();
	
	/**
	 * @return IShareable
	 */
	public function getShareable();
}

/**
 * Provides a basic implementation for IShareInfo.
 * 
 * @see IShareInfo
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class BasicShareInfo implements IShareInfo {
	protected $owner;
	protected $shareable;
	protected $collaborator;
	protected $permissions;
	protected $handlerClassName;
	
	/**
	 * Contructs a new BasicShareInfo with given $owner, $shareable object, $collaborator and $permission.
	 * Given $handlerClassName must matches a class that is able to convert given $shareable to a minimal
	 * amount of data, and then take this minimal amount of data to recreate the $shareable identical.
	 * 
	 * @param AbstractEyeosUser $owner
	 * @param IShareable $shareable
	 * @param AbstractEyeosPrincipal $collaborator
	 * @param IPermission $permissions
	 * @param string $handlerClassName
	 */
	public function __construct(AbstractEyeosUser $owner, IShareable $shareable, AbstractEyeosPrincipal $collaborator, IPermission $permissions, $handlerClassName) {
		$this->owner = $owner;
		$this->shareable = $shareable;
		$this->collaborator = $collaborator;
		$this->permissions = $permissions;
		$this->handlerClassName = $handlerClassName;
	}
	
	public function getCollaborator() {
		return $this->collaborator;
	}
	
	public function getHandlerClassName() {
		return $this->handlerClassName;
	}
	
	public function getOwner() {
		return $this->owner;
	}
	
	public function getPermissions() {
		return $this->permissions;
	}
	
	public function getShareable() {
		return $this->shareable;
	}
}
?>
