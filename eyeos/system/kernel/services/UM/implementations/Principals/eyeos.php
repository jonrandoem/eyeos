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
 * @subpackage UM
 */
class EyeosUser extends AbstractEyeosUser {
	/**
	 * @var string
	 */
	protected $password;
	
	
	public function getAttributesMap() {
		$vars = array_merge(parent::getAttributesMap(), get_object_vars($this));
		unset($vars['password']);
		return $vars;
	}
	
	/**
	 * Gets the encrypted password of the user.
	 *
	 * @return string
	 */
	public function getPassword() {
		return $this->password;
	}
	
	/**
	 * Sets the user password.
	 *
	 * @param string $password
	 * @param bool $encrypt If true, the password will be encrypted with sha1 algorithm
	 */
	public function setPassword($password, $encrypt = false) {
		if ($encrypt) {
			$this->password = sha1($password . sha1($password));	//FIXME: should be centralized somewhere (see also EyeosPasswordCredential class)
		} else {
			$this->password = $password;
		}
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class EyeosGroup extends AbstractEyeosGroup {
	public function getAttributesMap() {
		return array_merge(parent::getAttributesMap(), get_object_vars($this));
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class EyeosPrincipalGroupAssignation {
	private $id;
	protected $principalId;
	protected $groupId;
	
	public function getGroupId() {
		return $this->groupId;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function getPrincipalId() {
		return $this->principalId;
	}
	
	public function setGroupId($groupId) {
		$this->groupId = $groupId;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function setPrincipalId($principalId) {
		$this->principalId = $principalId;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class EyeosWorkgroup extends AbstractEyeosWorkgroup implements IWorkgroup {
	public function getAttributesMap() {
		return array_merge(parent::getAttributesMap(), get_object_vars($this));
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class EyeosUserWorkgroupAssignation implements IUserWorkgroupAssignation {
	private $id = null;
	protected $role = null;
	protected $status = null;
	protected $userId = null;
	protected $workgroupId = null;
	
	
	public function __construct() {}
	
	protected static function checkRoleValue($role) {
		$constants = get_class_constants('WorkgroupConstants');
		foreach($constants as $name => $value) {
			if (strpos($name, 'ROLE_') === 0 && $role == $value) {
				return;
			}
		}
		throw new EyeInvalidArgumentException($role . ' is not a valid value for a role. See WorkgroupConstants for more information.');
	}
	
	protected static function checkStatusValue($status) {
		$constants = get_class_constants('WorkgroupConstants');
		foreach($constants as $name => $value) {
			if (strpos($name, 'STATUS_') === 0 && $status == $value) {
				return;
			}
		}
		throw new EyeInvalidArgumentException($status . ' is not a valid value for a status. See WorkgroupConstants for more information.');
	}
	
	public function getAttributesMap() {
		return get_object_vars($this);
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function getRole() {
		return $this->role;
	}
	
	public function getStatus() {
		return $this->status;
	}
	
	public function getUserId() {
		return $this->userId;
	}
	
	public function getWorkgroupId() {
		return $this->workgroupId;
	}
	
	public function setId($id) {
		$this->id = $id;
	}	
	
	public function setRole($role) {
		self::checkRoleValue($role);
		$this->role = (int) $role;
	}
	
	public function setStatus($status) {
		self::checkStatusValue($status);
		$this->status = (int) $status;
	}
	
	public function setUserId($userId) {
		if ($this->id !== null && $this->userId !== null && $this->userId != $userId) {
			throw new EyeBadMethodCallException('Cannot overwrite user ID.');
		}
		$this->userId = $userId;
	}
	
	public function setWorkgroupId($workgroupId) {
		if ($this->id !== null && $this->workgroupId !== null && $this->workgroupId != $workgroupId) {
			throw new EyeBadMethodCallException('Cannot overwrite workgroup ID.');
		}
		$this->workgroupId = $workgroupId;
	}
}
?>
