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
interface IUM {
	/**
	 * @return IPrincipalsManager
	 */
	public static function getInstance();
	
	/**
	 * @return string
	 */
	public static function getGroupClassName();
	
	/**
	 * @return string
	 */
	public static function getUserClassName();
	
	/**
	 * @return string
	 */
	public static function getWorkgroupClassName();
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface IWorkgroup extends IGroup {
	public function getMasterGroupId();
	public function getOwnerId();
	public function getPrivacyMode();
	public function setMasterGroupId($groupId);
	public function setOwnerId($ownerId);
	public function setPrivacyMode($privacyMode);
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface IUserWorkgroupAssignation extends ISimpleMapObject {
	public function getId();
	public function getRole();
	public function getStatus();
	public function getUserId();
	public function getWorkgroupId();
	public function setId($id);
	public function setRole($role);
	public function setStatus($status);
	public function setUserId($userId);
	public function setWorkgroupId($workgroupId);
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
abstract class AuthConfiguration {
	private static $Configuration = null;
	
	public abstract function __clone();
	
	/**
	 * @return array
	 */
	public abstract function getAppConfigurationEntry($name);
	
	public static function getConfiguration() {
		return self::$Configuration;
	}
	
	public abstract function refresh();
	
	public static function setConfiguration(AuthConfiguration $configuration) {
		self::$Configuration = $configuration;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class AppConfigurationEntry {
	const CONTROLFLAG_REQUIRED = 'required';
	const CONTROLFLAG_REQUISITE = 'requisite';
	const CONTROLFLAG_SUFFICIENT = 'sufficient';
	const CONTROLFLAG_OPTIONAL = 'optional';
	
	private $loginModuleName = null;
	private $controlFlag = null;
	private $options = array();
	
	/**
	 * @param string $loginModuleName
	 * @param string $controlFlag
	 * @param string/array $options
	 */
	public function __construct($loginModuleName, $controlFlag, $options = '') {
		if (!is_string($loginModuleName) || $loginModuleName == '') {
			throw new EyeInvalidArgumentException('$loginModuleName must be a non-empty string (' . gettype($loginModuleName) . ' given).');
		}
		if (!is_string($controlFlag)) {
			throw new EyeInvalidArgumentException('$controlFlag must be a string (' . gettype($controlFlag) . ' given).');
		}
		if (!is_string($options) && !is_array($options)) {
			throw new EyeInvalidArgumentException('$options must be a string or an array (' . gettype($options) . ' given).');
		}
		$this->loginModuleName = $loginModuleName;
		$this->controlFlag = $controlFlag;
		
		if (is_array($options)) {
			$this->options = $options;
		} else if (!empty($options)) {
			$this->options = array();
			$options_tmp = explode(' ', $options);
			foreach($options_tmp as $option_tmp) {
				if (preg_match('/^(.*)=(.*)$/', $option_tmp, $matches)) {
					$this->options[$matches[1]] = $matches[2];
				} else {
					throw new EyeUnexpectedValueException('Invalid option statement "' . $option_tmp . '".');
				}
			}
		}
	}
	
	public function getControlFlag() {
		return $this->controlFlag;
	}
	
	public function getLoginModuleName() {
		return $this->loginModuleName;
	}
		
	public function getOptions() {
		return $this->options;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface IPrincipalsManager {
	/**
	 * Assigns a principal to a group.
	 *
	 * @param IPrincipal $principal
	 * @param IGroup $group
	 * @throws EyeNoSuchPrincipalException User not found or group not found.
	 */
	public function addToGroup(IPrincipal $principal, IGroup $group);
	
	/**
	 * Creates a group.
	 *
	 * @param IGroup $group
	 * @throws EyeGroupAlreadyExistsException Group already exists.
	 */
	public function createGroup(IGroup $group);
	
	/**
	 * Creates a user.
	 *
	 * @param IUser $user
	 * @throws EyeUserAlreadyExistsException User already exists.
	 */
	public function createUser(IUser $user);
	
	/**
	 * Creates a workgroup.
	 *
	 * @param IWorkgroup $workgroup
	 * @throws EyeWorkgroupAlreadyExistsException Workgroup already exists.
	 */
	public function createWorkgroup(IWorkgroup $workgroup);
	
	/**
	 * Deletes a principal.
	 *
	 * @param IPrincipal $principal
	 * @throws EyeNoSuchPrincipalException Principal not found.
	 */
	public function deletePrincipal(IPrincipal $principal);
	
	/**
	 * Gets a list of all groups.
	 *
	 * @return array(IGroup)
	 */
	public function getAllGroups();
	
	/**
	 * Gets a list of groups where the principal is included.
	 *
	 * @param IPrincipal $principal
	 * @param int $depth Specify at which maximum depth (in parent groups) groups must be returned.
	 * @return array(IGroup)
	 * @throws EyeNoSuchPrincipalException Principal not found.
	 */
	public function getAllGroupsByPrincipal(IPrincipal $principal, $depth = -1);
	
	/**
	 * Gets a list of groups that are included in the group.
	 *
	 * @param IGroup $group
	 * @param int $depth Specify at which maximum depth (in parent groups) groups must be returned.
	 * @return array(IGroup)
	 * @throws EyeNoSuchGroupException Group not found.
	 */
	public function getAllGroupsFromGroup(IGroup $group, $depth = -1);
	
	/**
	 * Gets a list of principals that are included in the group.
	 *
	 * @param IGroup $group
	 * @param int $depth Specify at which maximum depth (in subgroups) groups must be returned.
	 * @return array(IPrincipal)
	 * @throws EyeNoSuchGroupException Group not found.
	 */
	public function getAllPrincipalsFromGroup(IGroup $group, $depth = -1);
	
	/**
	 * Gets a list of all users.
	 *
	 * @return array
	 */
	public function getAllUsers();
	
	/**
	 * Gets a list of users that are included in the group.
	 *
	 * @param IGroup $group
	 * @param int $depth Specify at which maximum depth (in subgroups) groups must be returned.
	 * @return array(IUser)
	 * @throws EyeNoSuchGroupException Group not found.
	 */
	public function getAllUsersFromGroup(IGroup $group, $depth = -1);
	
	/**
	 * Gets a list of users that are included in the workgroup.
	 *
	 * @param IWorkgroup $workgroup
	 * @return array(IUser)
	 * @throws EyeNoSuchWorkgroupException Group not found.
	 */
	public function getAllUsersFromWorkgroup(IWorkgroup $workgroup);
	
	/**
	 * Gets all assignations user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $filter An optional filter. All the values set in the
	 *        given object will be used as filters for the returned values.
	 * @return array(IUserWorkgroupAssignation)
	 */
	public function getAllUserWorkgroupAssignations(IUserWorkgroupAssignation $filter = null);
	
	/**
	 * Gets a list of all workgroups.
	 *
	 * @return array(IWorkgroup)
	 */
	public function getAllWorkgroups();
	
	/**
	 * Gets a list of workgroups where the user is included.
	 *
	 * @param IUser $user
	 * @return array(IWorkgroup)
	 * @throws EyeUMException User not found.
	 */
	public function getAllWorkgroupsByUser(IUser $user);
	
	/**
	 * Gets the group from its ID.
	 *
	 * @param string $id
	 * @return IGroup
	 * @throws EyeNoSuchGroupException Group not found.
	 */
	public function getGroupById($id);
	
	/**
	 * Gets the group from its name.
	 *
	 * @param string $name
	 * @return IGroup
	 * @throws EyeNoSuchGroupException Group not found.
	 */
	public function getGroupByName($name);
	
	/**
	 * Creates a new instance of a group.
	 * 
	 * @return IGroup
	 */
	public function getNewGroupInstance();
	
	/**
	 * Creates a new instance of a user.
	 * 
	 * @return IUser
	 */
	public function getNewUserInstance();
	
	/**
	 * Creates a new instance of a user/workgroup assignation.
	 * 
	 * @return IUserWorkgroupAssignation
	 */
	public function getNewUserWorkgroupAssignationInstance();
	
	/**
	 * Creates a new instance of a workgroup.
	 * 
	 * @return IWorkgroup
	 */
	public function getNewWorkgroupInstance();
	
	/**
	 * Gets the principal (user or group) from its ID.
	 *
	 * @param string $id
	 * @return IPrincipal
	 * @throws EyeNoSuchPrincipalException Principal not found.
	 */
	public function getPrincipalById($id);
	
	/**
	 * Gets the user from its ID.
	 *
	 * @param string $id
	 * @return IUser
	 * @throws EyeNoSuchUserException User not found.
	 */
	public function getUserById($id);
	
	/**
	 * Gets the user from its name.
	 *
	 * @param string $name
	 * @return IUser
	 * @throws EyeNoSuchUserException User not found.
	 */
	public function getUserByName($name);
	
	/**
	 * Gets the workgroup from its ID.
	 *
	 * @param string $name
	 * @return IWorkgroup
	 * @throws EyeNoSuchWorkgroupException Workgroup not found.
	 */
	public function getWorkgroupById($id);
	
	/**
	 * Gets the workgroup from its name.
	 *
	 * @param string $name
	 * @return IWorkgroup
	 * @throws EyeNoSuchWorkgroupException Workgroup not found.
	 */
	public function getWorkgroupByName($name);
	
	/**
	 * Checks if a principal is member (directly or not) of the specified group.
	 * 
	 * @param IPrincipal $principal
	 * @param IGroup $group
	 * @param int $depth Specifies at which maximum depth (in parent groups) the principal can be considered as in the group.
	 * @throws EyeNoSuchPrincipalException User not found or group not found.
	 */
	public function isPrincipalInGroup(IPrincipal $principal, IGroup $group, $depth = -1);
	
	/**
	 * Checks if a user is member of the specified workgroup.
	 * 
	 * @param IUser $user
	 * @param IWorkgroup $workgroup
	 * @throws EyeNoSuchPrincipalException User not found or group not found.
	 */
	public function isUserInWorkroup(IUser $user, IWorkgroup $workgroup);
	
	/**
	 * Registers a new assignation user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $assignation
	 * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
	 */
	public function registerUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation);
	
	/**
	 * Removes a principal from a group.
	 *
	 * @param IPrincipal $principal
	 * @param IGroup $group
	 * @throws EyeNoSuchPrincipalException User not found or group not found.
	 */
	public function removeFromGroup(IPrincipal $principal, IGroup $group);
	
	/**
	 * Unregisters a new assignation user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $assignation
	 * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
	 */
	public function unregisterUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation);
	
	/**
	 * Updates the information of a principal.
	 *
	 * @param IPrincipal $principal
	 * @throws EyeNoSuchPrincipalException Principal not found.
	 */
	public function updatePrincipal(IPrincipal $principal);
	
	/**
	 * Updates a new assignation user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $assignation
	 * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
	 */
	public function updateUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation);
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface ILoginModule {	
	/**
	 * @return boolean
	 */
	public function abort();
	
	/**
	 * @return boolean
	 */
	public function commit();
	
	/**
	 * @return void
	 */
	public function initialize(Subject $subject, ArrayObject $sharedState, array $options = null);
	
	/**
	 * @return boolean
	 */
	public function login();
	
	/**
	 * @return boolean
	 */
	public function logout();
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
abstract class AbstractEyeosPrincipal implements IPrincipal, EyeObject, ISimpleMapObject {
	private $id = null;
	private $name = null;
	private $status = null;
	
	public function __construct($name = null) {
		if (is_string($name) && $name != '') {
			$this->name = $name;
		}
	}
	
	public function __toString() {
		$props = $this->getAttributesMap();
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
	
	public function getAttributesMap() {
		return get_object_vars($this);
	}
	
	/**
	 * Gets the ID and automatically generates one if it has none.
	 * 
	 * @return string
	 */
	public final function getId($forceGeneration = true) {
		if ($this->id === null && $forceGeneration) {
			ObjectIdGenerator::assignId($this);
		}
		return $this->id;
	}
	
	/**
	 * Gets the name of the principal.
	 *
	 * @return string
	 */
	public function getName() {
		return $this->name;
	}
	
	/**
	 * Gets the status of the principal (represented by an integer).
	 *
	 * @return int
	 */
	public function getStatus() {
		return $this->status;
	}
	
	/**
	 * Sets the ID.
	 * 
	 * @param string
	 */
	public final function setId($id) {
		if ($this->id !== null && $id != $this->id) {
			throw new EyeBadMethodCallException('Cannot overwrite existing ID "' . $this->id . '" with "' . $id . '".');
		}
		$this->id = $id;
	}
	
	/**
	 * Sets the name of the principal.
	 *
	 * @param string
	 */
	public function setName($name) {
		if (!is_string($name) || $name == '') {
			throw new EyeInvalidArgumentException('$name must be a non-empty string.');
		}
		if ($this->name !== null) {
			throw new EyeBadMethodCallException('Cannot overwrite existing name ' . $this->name . '.');
		}
		$this->name =$name;
	}
	
	/**
	 * Sets the status of the principal (represented by an integer).
	 *
	 * @param int
	 */
	public function setStatus($status) {
		if ($status === null) {
			$this->status = null;
			return;
		}
		if (!is_numeric($status)) {
			throw new EyeInvalidArgumentException('$status must be NULL or a numeric value (' . gettype($status) .' given).');
		}
		$this->status = (int) $status;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
abstract class AbstractEyeosUser extends AbstractEyeosPrincipal implements IUser, IMetaAssociable {	
	const STATUS_LOCKED = 0x1;
	
	protected $primaryGroupId = null;
	
	/**
	 * @return void
	 */
	public function deleteMeta() {
		MetaManager::getInstance()->deleteMeta($this);
	}
	
	/**
	 * @return IMetaData The metadata associated to the current object.
	 */
	public function getMeta() {
		return MetaManager::getInstance()->retrieveMeta($this);
	}

	/**
	 * @return string
	 */
	public function getPrimaryGroupId() {
		return $this->primaryGroupId;
	}
		
	/**
	 * @param IMetaData $metaData The metadata to be associated
	 *        to the current object.
	 */
	public function setMeta(IMetaData $metaData = null) {
		MetaManager::getInstance()->storeMeta($this, $metaData);
	}
	
	/**
	 * @param string $id
	 */
	public function setPrimaryGroupId($id) {
		$this->primaryGroupId = $id;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
abstract class AbstractEyeosGroup extends AbstractEyeosPrincipal implements IGroup {	
	// nothing more here
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
abstract class AbstractEyeosWorkgroup extends AbstractEyeosPrincipal implements IWorkgroup, IMetaAssociable {	
	const STATUS_MEMBERS_LOCKED = 0x1;
	const STATUS_ACTIVITY_LOCKED = 0x2;
	
	protected $masterGroupId = null;
	protected $ownerId = null;
	protected $privacyMode = null;
	
	
	protected static function checkPrivacyModeValue($privacyMode) {
		$constants = get_class_constants('WorkgroupConstants');
		foreach($constants as $name => $value) {
			if (strpos($name, 'PRIVACY_') === 0 && $privacyMode == $value) {
				return;
			}
		}
		throw new EyeInvalidArgumentException($privacyMode . ' is not a valid value for a privacy mode. See WorkgroupConstants for more information.');
	}
	
	/**
	 * @return void
	 */
	public function deleteMeta() {
		MetaManager::getInstance()->deleteMeta($this);
	}
	
	public function getMasterGroupId() {
		return $this->masterGroupId;
	}
	
	/**
	 * @return IMetaData The metadata associated to the current object.
	 */
	public function getMeta() {
		return MetaManager::getInstance()->retrieveMeta($this);
	}
	
	public function getOwnerId() {
		return $this->ownerId;
	}
	
	public function getPrivacyMode() {
		return $this->privacyMode;
	}
	
	public function setMasterGroupId($masterGroupId) {
		$this->masterGroupId = $masterGroupId;
	}
		
	/**
	 * @param IMetaData $metaData The metadata to be associated
	 *        to the current object.
	 */
	public function setMeta(IMetaData $metaData = null) {
		MetaManager::getInstance()->storeMeta($this, $metaData);
	}
	
	public function setOwnerId($ownerId) {
		$this->ownerId = $ownerId;
	}
	
	public function setPrivacyMode($privacyMode) {
		self::checkPrivacyModeValue($privacyMode);
		$this->privacyMode = (int) $privacyMode;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface WorkgroupConstants {
	const ROLE_OWNER = 0;
	const ROLE_ADMIN = 1;
	const ROLE_EDITOR = 2;
	const ROLE_VIEWER = 3;
	
	const STATUS_MEMBER = 0;
	const STATUS_INVITED = 1;
	const STATUS_PENDING = 2;
	const STATUS_SUSPENDED = 3;
	const STATUS_BANNED = 4;
	
	const PRIVACY_OPEN = 0;
	const PRIVACY_ONREQUEST = 1;
	const PRIVACY_ONINVITATION = 2;
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class LoginContext {
	const INIT_METHOD = 'initialize';
	const LOGIN_METHOD = 'login';
	const COMMIT_METHOD = 'commit';
	const ABORT_METHOD = 'abort';
	const LOGOUT_METHOD = 'logout';
	
	const OTHER = 'other';
	
	const APPENTRY = 'appEntry';
	const MODULE = 'loginModule';
	
	private $name;
	private $subject = null;
	private $config = null;
	private $sharedState = null;
	
	private $loginSucceeded = false;
	private $moduleIndex = 0;
	/**
	 * @var array(array(AppConfigurationEntry, ILoginModule))
	 */
	private $moduleStack = null;
	private $firstError = null;
	private $firstRequiredError = null;
	private $success = false;
	
	// Cache values
	private $eyeosUser = null;
	private $eyeosGroup = null;
	
	
	/**
	 * Constructs a new LoginContext that can be used to perform a login with the given $subject
	 * and retrieve its principals.
	 * 
	 * @param string $name The name of 
	 * @param Subject $subject
	 * @param AuthConfiguration $config
	 */
	public function __construct($name, Subject $subject = null, AuthConfiguration $config = null) {
		if ($config === null) {
			$config = AuthConfiguration::getConfiguration();
		}
		$this->name = $name;
		$this->subject = $subject;
		$this->config = clone $config;
		$this->sharedState = new ArrayList();
		
		$this->initModuleStack();
	}
	
	public function __clone() {
		if ($this->subject !== null) {
			$this->subject = clone $this->subject;
		}
		if ($this->config !== null) {
			$this->config = clone $this->config;
		}
		$this->sharedState = clone $this->sharedState;
		foreach($this->moduleStack as $key => $moduleItem) {
			$this->moduleStack[$key] = array(
				self::APPENTRY => clone $moduleItem[self::APPENTRY],
				self::MODULE => $moduleItem[self::MODULE] === null ? null : clone $moduleItem[self::MODULE],
			);
		}
	}
	
	private function clearState() {
		$this->moduleIndex = 0;
		$this->firstError = null;
		$this->firstRequiredError = null;
		$this->success = false;
	}
	
	/**
	 * Returns the primary group of this login context, i.e. the primary group of the user retrieved
	 * using getEyeosUser().
	 * 
	 * @see LoginContext::getEyeosUser()
	 * 
	 * @return AbstractEyeosGroup The group object or NULL.
	 * @throws EyeNullPointerException If no subject or no user can be found in this login context.
	 */
	public function getEyeosGroup() {
		if ($this->eyeosGroup === null) {
			$this->eyeosGroup = UMManager::getInstance()->getGroupById($this->getEyeosUser()->getPrimaryGroupId());
		}
		return $this->eyeosGroup;
	}
	
	/**
	 * Returns the primary user of this login context.
	 * 
	 * Throwing an exception replaces the regular behaviour that would return NULL in that case. But
	 * doing so prevents calling a method on a NULL object too easily, and thus prevents PHP from
	 * raising a Fatal Error that would crash the script. It's the responsibility for the calling context
	 * to surround each call to this method by a try/catch block if necessary.
	 * 
	 * @return AbstractEyeosUser The user object.
	 * @throws EyeNullPointerException If no subject or no user can be found in this login context.
	 */
	public function getEyeosUser() {
		if ($this->eyeosUser === null) {
			if ($this->subject === null) {
				throw new EyeNullPointerException('No subject has been defined.');
			}
			foreach($this->subject->getPrincipals() as $principal) {
				if ($principal instanceof AbstractEyeosUser) {
					$this->eyeosUser = $principal;
				}
			}
			if ($this->eyeosUser === null) {
				throw new EyeNullPointerException('No eyeos user can be found in current LoginContext.');
			}
		}
		return $this->eyeosUser;
	}

	public function setEyeosUser(AbstractEyeosUser $user) {
		$this->eyeosUser = $user;
	}

	public function getName() {
		return $this->name;
	}
	
	private function initModuleStack() {
		$appEntries = null;
		try {
			$appEntries = $this->config->getAppConfigurationEntry($this->name);
		} catch (EyeMissingConfigurationException $e) {
			try {
				$appEntries = $this->config->getAppConfigurationEntry(self::OTHER);
			} catch (EyeMissingConfigurationException $e) {
				throw new EyeLoginException('No usable configuration entry can be found in the specified configuration.', 0, $e);
			}
		}
		
		$this->moduleStack = array();
		//clone all the entries from the configuration
		foreach($appEntries as $key => $appEntry) {
			$this->moduleStack[$key] = array(
				self::APPENTRY => new AppConfigurationEntry($appEntry->getLoginModuleName(), $appEntry->getControlFlag(), $appEntry->getOptions()),
				self::MODULE => null
			);
		}
	}
	
	public function getSubject() {
		return $this->subject;
	}

	public function setSubject(Subject $subject) {
		$this->subject = $subject;
	}

	private function invoke($methodName) {
		for($i = $this->moduleIndex; $i <  count($this->moduleStack); $i++, $this->moduleIndex++) {
			$appEntry = $this->moduleStack[$i][self::APPENTRY];
			try {
				if ($this->moduleStack[$i][self::MODULE] === null) {
					//instanciate module class
					$loginModuleName = $appEntry->getLoginModuleName();
					if (!class_exists($loginModuleName)) {
						throw new EyeClassNotFoundException($loginModuleName);
					}
					$this->moduleStack[$i][self::MODULE] = new $loginModuleName;
					if (!$this->moduleStack[$i][self::MODULE] instanceof ILoginModule) {
						throw new EyeUnexpectedValueException('Invalid LoginModule: "' . $loginModuleName . '". Must implement ILoginModule.');
					}
					
					//initialize module object
					$this->moduleStack[$i][self::MODULE]->initialize($this->subject, $this->sharedState, $appEntry->getOptions());					
				}
				$module = $this->moduleStack[$i][self::MODULE];
				
				//invoke method
				$status = call_user_func(array($module, $methodName), $module);
				
				if ($status) {
					if ($methodName != self::ABORT_METHOD
						&& $methodName != self::LOGOUT_METHOD
						&& $appEntry->getControlFlag() == AppConfigurationEntry::CONTROLFLAG_SUFFICIENT
						&& $this->firstRequiredError === null) {
						$this->clearState();
						return;
					}
					$this->success = true;
				}
			} catch (EyeLoginException $e) {
				if ($appEntry->getControlFlag() == AppConfigurationEntry::CONTROLFLAG_REQUISITE) {
					// a REQUISITE module failed: immediately throw an exception
					if ($methodName == self::ABORT_METHOD || $methodName == self::LOGOUT_METHOD) {
						if ($this->firstRequiredError === null) {
							$this->firstRequiredError = $e;
						}
					} else {
						$this->throwException($this->firstRequiredError, $e);
					}
				} else if ($appEntry->getControlFlag() == AppConfigurationEntry::CONTROLFLAG_REQUIRED) {					
					//mark down that a REQUIRED module failed
					if ($this->firstRequiredError === null) {
						$this->firstRequiredError = $e;
					}
				} else {
					//mark down that an OPTIONAL module failed
					if ($this->firstError === null) {
						$this->firstError = $e;
					}
				}
			} catch (EyeException $e) {
				$this->throwException(null, $e);
			}
		}
		if ($this->firstRequiredError !== null) {
			//a REQUIRED module failed
			$this->throwException($this->firstRequiredError, null);
		} else if (!$this->success && $this->firstError !== null) {
			//no module succeeded: return the first error
			$this->throwException($this->firstError, null);
		} else if (!$this->success) {
			$this->throwException(new EyeLoginException('Login failure: all modules ignored.'), null);
		} else {
			$this->clearState();
			return;
		}
	}
	
	public function login() {
		$logger = Logger::getLogger('system.services.UM');
		$this->loginSucceeded = false;
		if ($this->subject === null) {
			$this->subject = new Subject();
		}
		if ($this->config === null) {
			throw new EyeMissingConfigurationException('No configuration provided for ' . $this->name . '.');
		}
		
		try {
			$this->invoke(self::LOGIN_METHOD);
			$this->invoke(self::COMMIT_METHOD);
			$this->loginSucceeded = true;
			
			// invalidate cache
			$this->eyeosUser = null;
			$this->eyeosGroup = null;
			
			// log success
			if ($logger->isDebugEnabled()) {
				$username = null;
				foreach($this->subject->getPrincipals() as $principal) {
					if ($principal instanceof EyeosUser) {
						$username = $principal->getName();
					}
				}
				if ($username !== null) {
					$logger->debug('Login successful: ' . $username);
				} else {
					$logger->debug('Login successful');
				}
			}
		} catch (EyeLoginException $e) {
			// log reason of failure
			if ($logger->isDebugEnabled()) {
				$username = null;
				foreach($this->subject->getPrivateCredentials() as $cred) {
					if ($cred instanceof EyeosPasswordCredential) {
						$username = $cred->getUsername();
					}
				}
				if ($username !== null) {
					$logger->debug('Login failed: ' . $username . ' (Cause: ' . $e->getMessage() . ')');
				} else {
					$logger->info('Login failed (Cause: ' . $e->getMessage() . ')');
				}
			} else {
				$logger->info('Login failed (Cause: ' . $e->getMessage() . ')');
			}
			
			try {
				$this->invoke(self::ABORT_METHOD);
			} catch (EyeLoginException $e2) {
				throw $e;
			}
			throw $e;
		}
	}
	
	public function logout() {
		if ($this->subject === null) {
			throw new EyeLoginException('Subject is null. Logout called before login.');
		}
		$this->invoke(self::LOGOUT_METHOD);
		// invalidate cache
		$this->eyeosUser = null;
		$this->eyeosGroup = null;
	}
	
	public function setEyeosGroup(AbstractEyeosGroup $group) {
		try {
			$principals = $this->subject->getPrincipals();
			foreach($principals as $principal) {
				if ($principal instanceof AbstractEyeosGroup && $principal->getId() == $group->getId()) {
					$this->eyeosGroup = $group;
					return;
				}
			}
			throw new EyeNoSuchGroupException('Specified group not found in context principals.');
		} catch (EyeException $e) {
			throw new EyeInvalidArgumentException('Invalid group.', 0, $e);
		}
	}
	
	private function throwException($originalError, $error) {
		$this->clearState();
		$e = $originalError === null ? $error : $originalError;
		throw $e;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface IUMListener extends IEventListener {
	// Groups (system groups)
	public function groupBeforeDeletion(UMEvent $e);
	public function groupCreated(UMEvent $e);
	public function groupDeleted(UMEvent $e);
	public function groupUpdated(UMEvent $e);
	
	// Users
	public function userBeforeDeletion(UMEvent $e);
	public function userCreated(UMEvent $e);
	public function userDeleted(UMEvent $e);
	public function userUpdated(UMEvent $e);
	
	// User/workgroup assignations
	public function userWorkgroupAssignationBeforeDeletion(UMEvent $e);
	public function userWorkgroupAssignationCreated(UMEvent $e);
	public function userWorkgroupAssignationDeleted(UMEvent $e);
	public function userWorkgroupAssignationUpdated(UMEvent $e);
	
	// Workgroups
	public function workgroupBeforeDeletion(UMEvent $e);
	public function workgroupCreated(UMEvent $e);
	public function workgroupDeleted(UMEvent $e);
	public function workgroupUpdated(UMEvent $e);
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
abstract class AbstractUMAdapter implements IUMListener {
	// Groups (system groups)
	public function groupBeforeDeletion(UMEvent $e) {}
	public function groupCreated(UMEvent $e) {}
	public function groupDeleted(UMEvent $e) {}
	public function groupUpdated(UMEvent $e) {}
	
	// Users
	public function userBeforeDeletion(UMEvent $e) {}
	public function userCreated(UMEvent $e) {}
	public function userDeleted(UMEvent $e) {}
	public function userUpdated(UMEvent $e) {}
	
	// User/workgroup assignations
	public function userWorkgroupAssignationBeforeDeletion(UMEvent $e) {}
	public function userWorkgroupAssignationCreated(UMEvent $e) {}
	public function userWorkgroupAssignationDeleted(UMEvent $e) {}
	public function userWorkgroupAssignationUpdated(UMEvent $e) {}
	
	// Workgroups
	public function workgroupBeforeDeletion(UMEvent $e) {}
	public function workgroupCreated(UMEvent $e) {}
	public function workgroupDeleted(UMEvent $e) {}
	public function workgroupUpdated(UMEvent $e) {}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
interface IObservableUMManager {
	public function addUMListener(IUMListener $listener, $currentRequestOnly = true);
	public function fireEvent($type, UMEvent $event);
	public function getAllUMListeners();
	public function removeUMListener(IUMListener $listener);
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class UMEvent extends EventObject {
	private $skel;

	public function __construct($user, $relatedSource = null) {
		parent::__construct($user, $relatedSource);
		$this->skel = null;
	}

	public function setSkel($skel) {
		$this->skel = $skel;
	}

	public function getSkel() {
		return $this->skel;
	}
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class PrincipalMetaData extends BasicMetaData {
	// nothing more here
}

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class WorkgroupMetaData extends BasicMetaData {
	// nothing more here
}
?>