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
 * @package kernel-libs
 * @subpackage abstraction
 */
interface SecurityConstants {
	const READ = 0x4;
	const WRITE = 0x2;
	const EXECUTE = 0x1;
	
	const ACCESS_ACTION = 'access';
	const ADMIN_ACTION = 'admin';
	const CONNECT_ACTION = 'connect';
	const DELETE_ACTION = 'delete';
	const EXECUTE_ACTION = 'execute';
	const LISTEN_ACTION = 'listen';
	const READ_ACTION = 'read';
	const WRITE_ACTION = 'write';
	
	const ACTIONS_DELIMITER = ',';
	const PARAMS_VALUES_DELIMITER = ',';
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IObjectGuard {
	/**
	 * Checks the guard on the given $object, and throws a EyeSecurityException
	 * if access is denied.
	 * 
	 * @param mixed $object
	 * @throws EyeSecurityException
	 */
	public function checkGuard($object);
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IMemberGuard {
	/**
	 * Checks the guard on the member defined by the name of given GuardPermission $perm, and
	 * throws a EyeSecurityException if access is denied.
	 * 
	 * @param GuardPermission $perm
	 * @throws EyeSecurityException
	 */
	public function checkMemberGuard(GuardPermission $perm);
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IMemberGuardedObject {
	/**
	 * Sets the given MemberGuard to this object.
	 * 
	 * @param IMemberGuard $guard
	 * @param EyeSecurityException If a guard is already assigned to this object.
	 */
	public function setMemberGuard(IMemberGuard $guard);
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class BasicMemberGuard implements IMemberGuard {
	/**
	 * @var GuardPermissionCollection
	 */
	protected $permissions = null;
	
	/**
	 * 
	 * @param array(GuardPermission) $permissions 
	 */
	public function __construct(GuardPermissionCollection $permissions) {
		$this->permissions = $permissions;
	}
	
	/**
	 * Checks the guard on the member defined by the name of given GuardPermission $perm, and
	 * throws a EyeSecurityException if access is denied.
	 * 
	 * @param GuardPermission $perm
	 * @throws EyeSecurityException
	 */
	public function checkMemberGuard(GuardPermission $perm) {
		if (!$this->permissions->implies($perm)) {
			throw new EyeSecurityException('Cannot access member "' . $perm->getName() . '": permission denied.');
		}
	}
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class GuardedObject {
	/**
	 * @var IObjectGuard
	 */
	protected $guard = null;
	
	/**
	 * @var mixed
	 */
	protected $object = null;
	
	public function __construct($object, IObjectGuard $guard = null) {
		$this->object = $object;
		$this->guard = $guard;
	}
	
	public function getObject() {
		if ($this->guard !== null) {
			$this->guard->checkGuard($this->object);
		}
		return $this->object;
	}
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IPermission {	
	/**
	 * Returns a string representation of the object.
	 */
	public function __toString();
	
	/**
	 * Returns the actions as an array of strings.
	 * Example: array('read', 'write', 'execute')
	 * Actions are <b>always lowercase</b>.
	 * 
	 * @return array(string)
	 */
	public function getActions();
	
	/**
	 * Returns the actions as a string.
	 * Example: 'read,write,execute'
	 * Actions are <b>always lowercase</b>.
	 * 
	 * @return string
	 */
	public function getActionsAsString();
	
	/**
	 * Returns the related object this permission is associated with (if any)
	 * or NULL.
	 * 
	 * @return mixed
	 */
	public function getRelatedObject();
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
abstract class AbstractPermission implements IPermission {
	/**
	 * @var string The name of this permission.
	 */
	protected $name = null;
	
	/**
	 * Constructs a permission with the specified name.
	 * @param string $name The name of this permission.
	 */
	public function __construct($name) {
		$this->name = $name;
	}
	
	/**
	 * Returns a string representation of the object.
	 */
	public function __toString() {
		$string = get_class($this) . '[';
		if ($this->name !== null) {
			$string .= 'name=' . $this->name . ',';
		}
		try {
			$string .= 'actions=' . $this->getActionsAsString() . ']';
		} catch (Exception $e) {
			$string .= 'actions=##INVALID_ACTIONS##]';
		}
		return $string;
	}
	
	/**
	 * Parses the given $actions as a string or array and returns a unique, alphabetically sorted
	 * array of the actions, all lowercase.
	 * 
	 * @param mixed $actions Array of strings or comma-separated strings of actions
	 * @return array
	 */
	protected static function explodeActions($actions) {
		if (is_string($actions)) {
			$actions = array_map('trim', explode(SecurityConstants::ACTIONS_DELIMITER, $actions));
		}
		if (!is_array($actions)) {
			throw new EyeInvalidArgumentException('$actions must be a string or an array.');
		}
		
		foreach($actions as $key => $action) {
			$actions[$key] = strtolower($action);
		}
		sort($actions, SORT_STRING);
		return $actions;
	}
	
	/**
	 * Returns the actions as a string.
	 * Example: 'read,write,execute'
	 * @return string
	 */
	public function getActionsAsString() {
		$myActions = $this->getActions();
		$actions = '';
		$last = count($myActions);
		$i = 0;
		foreach($myActions as $action) {
			$actions .= $action . ((++$i < $last) ? SecurityConstants::ACTIONS_DELIMITER : '');
		}
		return $actions;
	}
	
	/**
	 * Returns the name of the permission.
	 * @return string The name of the permission.
	 */
	public function getName() {
		return $this->name;
	}
	
	/**
	 * Returns NULL. (not available in this class)
	 * 
	 * @return mixed
	 */
	public function getRelatedObject() {
		return null;
	}
	
	/**
	 * Checks if the specified permission's actions are "implied by" this object's actions.
	 * @param Permission $permission
	 * @return boolean
	 */
	public function implies(IPermission $permission) {
		$myActions = $this->getActions();
		foreach($permission->getActions() as $reqAction) {
			if (!in_array($reqAction, $myActions)) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 * Returns an empty collection of permissions of type of this class.
	 * 
	 * @abstract
	 * @return IPermissionCollection
	 */
	public static function newPermissionCollection() {
		// Cannot use abstract static functions anymore in PHP, so here's the workaround...
		throw new EyeNotImplementedException(__METHOD__);
	}
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class SimplePermission extends AbstractPermission {
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
	public function __construct($name, $actions = '', $relatedObject = null) {
		parent::__construct($name);
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
	 * Returns the additional object this permission is associated with (if any)
	 * or NULL.
	 * 
	 * @return mixed
	 */
	public function getRelatedObject() {
		return $this->relatedObject;
	}
	
	/**
	 * Checks if the specified permission's actions are "implied by" this object's actions.
	 * @param Permission $permission
	 * @return boolean
	 */
	public function implies(IPermission $permission) {
		if ($this->name != $permission->getName()) {
			return false;
		}
		return parent::implies($permission);
	}
	
	/**
	 * Returns and empty collection of permission of type of this class.
	 * @return PermissionCollection
	 */
	public static function newPermissionCollection() {
		return new SimplePermissionCollection();
	}
}

/**
 * Interface representing a collection of IPermission objects.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IPermissionCollection {
	/**
	 * Adds given permission to the collection.
	 * @param IPermission $permission
	 */
	public function add(IPermission $permission);
	
	/**
	 * Checks if the specified permission's actions are "implied by" the collection's actions.
	 * @param IPermission $permission
	 * @return boolean
	 */
	public function implies(IPermission $permission);
	
	/**
	 * Sets this permission collection as read-only. No more element can be added.
	 */
	public function setReadOnly();
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class SimplePermissionCollection implements IPermissionCollection {
	/**
	 * @var array(SimplePermission)
	 */
	private $elements = null;
	
	private $readOnly = false;
	
	
	public function __construct() {
		$this->elements = new Set();
	}
	
	/**
	 * Adds given permission to the collection.
	 * @param IPermission $permission
	 */
	public function add(IPermission $permission) {
		if ($this->readOnly) {
			throw new EyeSecurityException('Cannot add permission to a read-only collection.');
		}
		if (! $permission instanceof SimplePermission) {
			throw new EyeInvalidClassException('$permission must be an instance of SimplePermission.');
		}
		$this->elements->append($permission);
	}
	
	/**
	 * Checks if the specified permission's actions are "implied by" the collection's actions.
	 * @param IPermission $permission
	 * @return boolean
	 */
	public function implies(IPermission $permission) {
		foreach($this->elements as $element) {
			if ($element->implies($permission)) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Sets this permission collection as read-only. No more element can be added.
	 */
	public function setReadOnly() {
		$this->readOnly = true;
	}
}

class GuardPermission extends SimplePermission {
	/**
	 * @param string $name
	 * @param mixed $actions Array of string containing the actions for this permission.
	 */
	public function __construct($name = '', $actions = '') {
		parent::__construct($name, $actions, null);
	}
	
	/**
	 * Returns and empty collection of permission of type of this class.
	 * @return PermissionCollection
	 */
	public static function newPermissionCollection() {
		return new GuardPermissionCollection();
	}
}

/**
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class GuardPermissionCollection implements IPermissionCollection {
	/**
	 * @var array(GuardPermission)
	 */
	private $elements = null;
	
	private $readOnly = false;
	
	
	public function __construct() {
		$this->elements = new Set();
	}
	
	/**
	 * Adds given permission to the collection.
	 * @param IPermission $permission
	 */
	public function add(IPermission $permission) {
		if ($this->readOnly) {
			throw new EyeSecurityException('Cannot add permission to a read-only collection.');
		}
		if (! $permission instanceof GuardPermission) {
			throw new EyeInvalidClassException('$permission must be an instance of GuardPermission.');
		}
		$this->elements->append($permission);
	}
	
	/**
	 * Checks if the specified permission's actions are "implied by" the collection's actions.
	 * @param IPermission $permission
	 * @return boolean
	 */
	public function implies(IPermission $permission) {
		foreach($this->elements as $element) {
			if ($element->implies($permission)) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * Sets this permission collection as read-only. No more element can be added.
	 */
	public function setReadOnly() {
		$this->readOnly = true;
	}
}
?>