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
class UMManager extends Kernel implements IUM, IPrincipalsManager, IObservableUMManager {
	private static $Instance = null;
	
	private static $ConfigurationFiles = array();
	
	private static $PrincipalsManager = null;
	
	private $logger = null;
	
	/**
	 * @var ArrayList(IFileListener)
	 */
	private $listeners;
	
	
	protected function __construct() {
		$this->listeners = new ArrayList();
		$this->logger = Logger::getLogger('services.UM.UMManager');
	}

	/**
	 * @param mixed $user An AbstractEyeosUser object or a username
	 */
	public static function getEyeosUserDirectory($user) {
		if (!is_dir(USERS_PATH)) {
			mkdir(USERS_PATH, 0777, true);
		}
		$username = $user;
		if ($user instanceof AbstractEyeosUser) {
			$username = $user->getName();
		} else if (!is_string($user)) {
			throw new EyeInvalidArgumentException('$user must be an instance of AbstractEyeosUser or a string.');
		}
		if (utf8_strpos($username, '_') === 0) {
			throw new EyeInvalidArgumentException('System users cannot have directory.');
		}
		return USERS_PATH . '/' . utf8_basename($username);
	}
	
	/**
	 * @param mixed $workgroup An AbstractEyeosWorkgroup object or a workgroup name
	 */
	public static function getEyeosWorkgroupDirectory($workgroup) {
		if (!is_dir(WORKGROUPS_PATH)) {
			mkdir(WORKGROUPS_PATH, 0777, true);
		}
		$workgroupName = $workgroup;
		if ($workgroupName instanceof AbstractEyeosWorkgroup) {
			$workgroupName = $workgroup->getName();
		} else if (!is_string($workgroupName)) {
			throw new EyeInvalidArgumentException('$user must be an instance of AbstractEyeosWorkgroup or a string.');
		}
		return WORKGROUPS_PATH . '/' . utf8_basename($workgroupName);
	}
	

	/**
	 * Assigns a principal to a group.
	 *
	 * @param IPrincipal $principal
	 * @param IGroup $group
	 * @throws EyeUMException User not found or group not found.
	 */
	public function addToGroup(IPrincipal $principal, IGroup $group) {
		self::getPrincipalsManagerInstance()->addToGroup($principal, $group);
		
		$this->logger->info('Principal ' . $principal . ' has been added to group ' . $group);
	}
	
	public function addUMListener(IUMListener $listener, $currentRequestOnly = true) {
		if (!$currentRequestOnly) {
			throw new EyeNotImplementedException(__METHOD__ . ' ($currentRequestOnly = false)');
		}
		$this->listeners->append($listener);
	}

	/**
	 * Creates a group.
	 *
	 * @param IGroup $group
	 * @throws EyeUMException Group already exists.
	 */
	public function createGroup(IGroup $group) {
		self::getPrincipalsManagerInstance()->createGroup($group);
		
		$this->logger->info('Group created: ' . $group);
		
		$event = new UMEvent($group);
		$this->fireEvent('groupCreated', $event);
	}

	/**
	 * Creates a user.
	 *
	 * @param IUser $user
	 * @throws EyeUMException User already exists.
	 */
	public function createUser(IUser $user, $skel = 'default') {
		self::getPrincipalsManagerInstance()->createUser($user);
		
		$this->logger->info('User created: ' . $user);
		
		$event = new UMEvent($user);
		$event->setSkel($skel);
		$this->fireEvent('userCreated', $event);
	}
	
	/**
	 * Creates a workgroup.
	 *
	 * @param IWorkgroup $workgroup
	 * @throws EyeWorkgroupAlreadyExistsException Workgroup already exists.
	 */
	public function createWorkgroup(IWorkgroup $workgroup) {
		self::getPrincipalsManagerInstance()->createWorkgroup($workgroup);
		
		$this->logger->info('Workgroup created: ' . $workgroup);
		
		$event = new UMEvent($workgroup);
		$this->fireEvent('workgroupCreated', $event);
	}

	/**
	 * Deletes a principal.
	 *
	 * @param IPrincipal $principal
	 * @throws EyeInvalidArgumentException First argument is not an instance of Group.
	 * @throws EyeUMException Group not found.
	 */
	public function deletePrincipal(IPrincipal $principal) {
		$event = new UMEvent($principal);
		if ($principal instanceof IUser) {
			$this->fireEvent('userBeforeDeletion', $event);
		} else if ($principal instanceof IWorkgroup) {
			$this->fireEvent('workgroupBeforeDeletion', $event);
		} else if ($principal instanceof IGroup) {
			$this->fireEvent('groupBeforeDeletion', $event);
		}
		
		self::getPrincipalsManagerInstance()->deletePrincipal($principal);
		
		$event = new UMEvent($principal);
		if ($principal instanceof IUser) {
			$this->logger->info('User deleted: ' . $principal);
			$this->fireEvent('userDeleted', $event);
		} else if ($principal instanceof IWorkgroup) {
			$this->logger->info('Workgroup deleted: ' . $principal);
			$this->fireEvent('workgroupDeleted', $event);
		} else if ($principal instanceof IGroup) {
			$this->logger->info('Group deleted: ' . $principal);
			$this->fireEvent('groupDeleted', $event);
		}
	}
	
	public function fireEvent($type, UMEvent $event) {
		foreach($this->listeners as $listener) {
			if (is_callable(array($listener, $type))) {
				try {
					$listener->$type($event);
				} catch (Exception $e) {
					$this->logger->warn('Exception while trying to fire ' . $type . ' event on listener ' . get_class($listener) . ': ' . $e->getMessage());
				}
			}
		}
	}
	
	/**
	 * Gets a list of all groups.
	 *
	 * @return array(IGroup)
	 */
	public function getAllGroups() {
		return self::getPrincipalsManagerInstance()->getAllGroups();
	}

	/**
	 * Gets a list of groups where the principal is included.
	 *
	 * @param IPrincipal $principal
	 * @param int $depth Specify at which maximum depth (in parent groups) groups must be returned.
	 * @return array(IGroup)
	 * @throws EyeUMException User not found.
	 */
	public function getAllGroupsByPrincipal(IPrincipal $principal, $depth = -1) {
		return self::getPrincipalsManagerInstance()->getAllGroupsByPrincipal($principal, $depth);
	}
	
	/**
	 * Gets a list of groups that are included in the group.
	 *
	 * @param IGroup $group
	 * @param int $depth Specify at which maximum depth (in parent groups) groups must be returned.
	 * @return array(IGroup)
	 * @throws EyeUMException Group not found.
	 */
	public function getAllGroupsFromGroup(IGroup $group, $depth = -1) {
		return self::getPrincipalsManagerInstance()->getAllGroupsFromGroup($group, $depth);
	}
	
	/**
	 * Gets a list of principals that are included in the group.
	 *
	 * @param IGroup $group
	 * @param int $depth Specify at which maximum depth (in subgroups) groups must be returned.
	 * @return array(IPrincipal)
	 * @throws EyeUMException Group not found.
	 */
	public function getAllPrincipalsFromGroup(IGroup $group, $depth = -1) {
		return self::getPrincipalsManagerInstance()->getAllPrincipalsFromGroup($group, $depth);
	}
	
	public function getAllUMListeners() {
		return $this->listeners;
	}

	/**
	 * Gets a list of all users.
	 *
	 * @return array
	 */
	public function getAllUsers() {
		return self::getPrincipalsManagerInstance()->getAllUsers();
	}
	
	/**
	 * Gets a list of users that are included in the group.
	 *
	 * @param IGroup $group
	 * @param int $depth Specify at which maximum depth (in subgroups) groups must be returned.
	 * @return array(IUser)
	 * @throws EyeUMException Group not found.
	 */
	public function getAllUsersFromGroup(IGroup $group, $depth = -1) {
		return self::getPrincipalsManagerInstance()->getAllUsersFromGroup($group, $depth);
	}
	
	/**
	 * Gets a list of users that are included in the workgroup.
	 *
	 * @param IWorkgroup $workgroup
	 * @return array(IUser)
	 * @throws EyeNoSuchWorkgroupException Group not found.
	 */
	public function getAllUsersFromWorkgroup(IWorkgroup $workgroup) {
		return self::getPrincipalsManagerInstance()->getAllUsersFromWorkgroup($workgroup);
	}
	
	/**
	 * Gets all assignations user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $filter An optional filter. All the values set in the
	 *        given object will be used as filters for the returned values.
	 * @return array(IUserWorkgroupAssignation)
	 */
	public function getAllUserWorkgroupAssignations(IUserWorkgroupAssignation $filter = null) {
		return self::getPrincipalsManagerInstance()->getAllUserWorkgroupAssignations($filter);
	}
	
	/**
	 * Gets a list of all workgroups.
	 *
	 * @return array(IWorkgroup)
	 */
	public function getAllWorkgroups() {
		return self::getPrincipalsManagerInstance()->getAllWorkgroups();
	}
	
	/**
	 * Gets a list of workgroups where the user is included.
	 *
	 * @param IUser $user
	 * @return array(IWorkgroup)
	 * @throws EyeUMException User not found.
	 */
	public function getAllWorkgroupsByUser(IUser $user) {
		return self::getPrincipalsManagerInstance()->getAllWorkgroupsByUser($user);
	}
	
	/**
	 * Reads the XML file with specified name $filename and located in the directory
	 * SERVICE_META_CONFIGURATION_PATH and keeps the result in an internal cache to
	 * speed up next request for the same file. 
	 * 
	 * @param string $filename
	 * @return SimpleXMLElement
	 * @throws EyeFileNotFoundException
	 * @throws EyeIOException
	 */
	public static function getConfiguration($filename) {
		if (!is_string($filename)) {
			throw new EyeInvalidArgumentException($filename . ' is not a valid filename.');
		}
		if (!isset(self::$ConfigurationFiles[$filename])) {
			$filename .= '.xml';
			if (!is_file(SERVICE_UM_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException($filename . ' does not exist.');
			}
			if (!$xmlObject = simplexml_load_file(SERVICE_UM_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$ConfigurationFiles[$filename] = $xmlObject;
		}
		return self::$ConfigurationFiles[$filename];
	}

	/**
	 * Gets the group from its ID.
	 *
	 * @param string $id
	 * @return IGroup
	 * @throws EyeUMException Group not found.
	 */
	public function getGroupById($id) {
		return self::getPrincipalsManagerInstance()->getGroupById($id);
	}

	/**
	 * Gets the group from its name.
	 *
	 * @param string $name
	 * @return IGroup
	 * @throws EyeUMException Group not found.
	 */
	public function getGroupByName($name) {
		return self::getPrincipalsManagerInstance()->getGroupByName($name);
	}
	
	public static function getGroupClassName() {
		return SERVICE_UM_GROUP_CLASSNAME;
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			$className = __CLASS__;
			self::$Instance = new $className;
		}
		return self::$Instance;
	}

	/**
	 * Creates a new instance of a group.
	 *
	 * @return IGroup
	 */
	public function getNewGroupInstance() {
		return self::getPrincipalsManagerInstance()->getNewGroupInstance();
	}

	/**
	 * Creates a new instance of a user.
	 *
	 * @return IUser
	 */
	public function getNewUserInstance() {
		return self::getPrincipalsManagerInstance()->getNewUserInstance();
	}
	
	/**
	 * Creates a new instance of a user/workgroup assignation.
	 * 
	 * @return IUserWorkgroupAssignation
	 */
	public function getNewUserWorkgroupAssignationInstance() {
		return self::getPrincipalsManagerInstance()->getNewUserWorkgroupAssignationInstance();
	}
	
	/**
	 * Creates a new instance of a workgroup.
	 *
	 * @return IWorkgroup
	 */
	public function getNewWorkgroupInstance() {
		return self::getPrincipalsManagerInstance()->getNewWorkgroupInstance();
	}

	private static function getPrincipalsManagerInstance() {
		if (self::$PrincipalsManager === null) {
			self::$PrincipalsManager = parent::getInstance(SERVICE_UM_PRINCIPALSMANAGER);
		}
		return self::$PrincipalsManager;
	}

	/**
	 * Gets the principal (user or group) from its ID.
	 *
	 * @param string $id
	 * @return IPrincipal
	 * @throws EyeUMException Principal not found.
	 */
	public function getPrincipalById($id) {
		return self::getPrincipalsManagerInstance()->getPrincipalById($id);
	}

	/**
	 * Gets the user from its ID.
	 *
	 * @param string $id
	 * @return IUser
	 * @throws EyeUMException User not found.
	 */
	public function getUserById($id) {
		return self::getPrincipalsManagerInstance()->getUserById($id);
	}

	/**
	 * Gets the user from its name.
	 *
	 * @param string $name
	 * @return IUser
	 * @throws EyeUMException User not found.
	 */
	public function getUserByName($name) {
		return self::getPrincipalsManagerInstance()->getUserByName($name);
	}
	
	public static function getUserClassName() {
		return SERVICE_UM_USER_CLASSNAME;
	}
	
	public static function getUserWorkgroupAssignationClassName() {
		return SERVICE_UM_USERWORKGROUPASSIGNATION_CLASSNAME;
	}
	
	/**
	 * Gets the workgroup from its ID.
	 *
	 * @param string $name
	 * @return IWorkgroup
	 * @throws EyeNoSuchWorkgroupException Workgroup not found.
	 */
	public function getWorkgroupById($id) {
		return self::getPrincipalsManagerInstance()->getWorkgroupById($id);
	}
	
	/**
	 * Gets the workgroup from its name.
	 *
	 * @param string $name
	 * @return IWorkgroup
	 * @throws EyeNoSuchWorkgroupException Workgroup not found.
	 */
	public function getWorkgroupByName($name) {
		return self::getPrincipalsManagerInstance()->getWorkgroupByName($name);
	}
	
	public static function getWorkgroupClassName() {
		return SERVICE_UM_WORKGROUP_CLASSNAME;
	}
	
	/**
	 * Initialize the UM service by loading all necessary classes.
	 * @see bottom of this file
	 */
	public static function init() {
		//load AuthConfigurations classes
		$dir = new DirectoryIterator(SERVICE_UM_AUTHCONFIGURATIONS_PATH);
		foreach ($dir as $file) {
			if ($file->isFile()) {
				require SERVICE_UM_AUTHCONFIGURATIONS_PATH . '/' . $file;
			}
		}

		//load Credentials classes
		$dir = new DirectoryIterator(SERVICE_UM_CREDENTIALS_PATH);
		foreach ($dir as $file) {
			if ($file->isFile()) {
				require_once SERVICE_UM_CREDENTIALS_PATH . '/' . $file;
			}
		}

		//load LoginModules classes
		$dir = new DirectoryIterator(SERVICE_UM_LOGINMODULES_PATH);
		foreach ($dir as $file) {
			if ($file->isFile()) {
				require_once SERVICE_UM_LOGINMODULES_PATH . '/' . $file;
			}
		}

		//load Principals classes
		$dir = new DirectoryIterator(SERVICE_UM_PRINCIPALS_PATH);
		foreach ($dir as $file) {
			if ($file->isFile()) {
				require SERVICE_UM_PRINCIPALS_PATH . '/' . $file;
			}
		}

		//load PrincipalsManagers classes
		$dir = new DirectoryIterator(SERVICE_UM_PRINCIPALSMANAGERS_PATH);
		foreach ($dir as $file) {
			if ($file->isFile()) {
				require SERVICE_UM_PRINCIPALSMANAGERS_PATH . '/' . $file;
			}
		}

		$config = new XMLAuthConfiguration(SERVICE_UM_AUTHCONFIGURATION_DEFAULTCONF_PATH);
		AuthConfiguration::setConfiguration($config);
		
		$logger = Logger::getLogger('system.services.UM.UMManager');
		if ($logger->isDebugEnabled()) {
			$logger->debug('UM service initiliazed with configuration ' . SERVICE_UM_AUTHCONFIGURATION_DEFAULTCONF_PATH);
		}
	}
	
	/**
	 * Checks if a principal is member (directly or not) of the specified group.
	 * 
	 * @param IPrincipal $principal
	 * @param IGroup $group
	 * @param int $depth Specifies at which maximum depth (in parent groups) the principal can be considered as in the group.
	 * @throws EyeUMException User not found or group not found.
	 */
	public function isPrincipalInGroup(IPrincipal $principal, IGroup $group, $depth = -1) {
		return self::getPrincipalsManagerInstance()->isPrincipalInGroup($principal, $group, $depth);
	}
	
	/**
	 * Checks if a user is member of the specified workgroup.
	 * 
	 * @param IUser $user
	 * @param IWorkgroup $workgroup
	 * @throws EyeNoSuchPrincipalException User not found or group not found.
	 */
	public function isUserInWorkroup(IUser $user, IWorkgroup $workgroup) {
		return self::getPrincipalsManagerInstance()->isUserInWorkroup($user, $workgroup);
	}
	
	/**
	 * Registers a new assignation user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $assignation
	 * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
	 */
	public function registerUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation) {
		self::getPrincipalsManagerInstance()->registerUserWorkgroupAssignation($assignation);
		
		$event = new UMEvent($assignation);
		$this->fireEvent('userWorkgroupAssignationCreated', $event);
	}

	/**
	 * Remove a principal from a group.
	 *
	 * @param IPrincipal $principal
	 * @param IGroup $group
	 * @throws EyeUMException User not found or group not found.
	 */
	public function removeFromGroup(IPrincipal $principal, IGroup $group) {
		self::getPrincipalsManagerInstance()->removeFromGroup($principal, $group);
		
		$this->logger->info('Principal ' . $principal . ' has been removed from group ' . $group);
	}
	
	public function removeUMListener(IUMListener $listener) {
		$this->listeners->remove($listener);
	}

	/**
	 * Unregisters a new assignation user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $assignation
	 * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
	 */
	public function unregisterUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation) {
		$event = new UMEvent($assignation);
		$this->fireEvent('userWorkgroupAssignationBeforeDeletion', $event);
		
		self::getPrincipalsManagerInstance()->unregisterUserWorkgroupAssignation($assignation);
		
		$this->fireEvent('userWorkgroupAssignationDeleted', $event);
	}

	/**
	 * Updates the information of a principal.
	 *
	 * @param IPrincipal $principal
	 * @throws EyeUMException Principal not found.
	 */
	public function updatePrincipal(IPrincipal $principal) {
		$oldPrincipal = self::getPrincipalById($principal->getId());
		
		self::getPrincipalsManagerInstance()->updatePrincipal($principal);
		
		$event = new UMEvent($principal, $oldPrincipal);
		if ($principal instanceof IUser) {
			$this->logger->info('User updated: ' . $principal);
			$this->fireEvent('userUpdated', $event);
		} else if ($principal instanceof IWorkgroup) {
			$this->logger->info('Workgroup updated: ' . $principal);
			$this->fireEvent('workgroupUpdated', $event);
		} else if ($principal instanceof IGroup) {
			$this->logger->info('Group updated: ' . $principal);
			$this->fireEvent('groupUpdated', $event);
		}
	}
	
	/**
	 * Updates a new assignation user/workgroup.
	 * 
	 * @param IUserWorkgroupAssignation $assignation
	 * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
	 */
	public function updateUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation) {
		self::getPrincipalsManagerInstance()->updateUserWorkgroupAssignation($assignation);
		
		// userWorkgroupAssignationUpdated event is fired from the implementation class
		// (the old assignation is the relatedSource of the event object)
	}
}

UMManager::init();
?>