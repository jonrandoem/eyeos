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

class LDAPPrincipalsManager extends Kernel implements IPrincipalsManager {
    const PRINCIPALNAME_VALIDATION_REGEXP = '[^_][a-zA-Z0-9ÑñáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙüÜ\'"çÇñÑäëïöüÜÏâêîôûÂÊÎÔÛ ·.\-_]{2,40}';

    private $currentUser = null;
    /**
     *
     * @var resource
     */
    protected $eyeosLDAP;
    protected $eyeosDAO;


    protected function __construct() {

        /**
         * establim la connexió a base de dades
         */
        $this->eyeosDAO = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);


        /**
         * Connect to LDAP host
         */
        $this->eyeosLDAP = ldap_connect(LDAP_HOSTNAME, LDAP_PORT)
                or $this->sendError("Can't connect to " . LDAP_HOSTNAME . " LDAP Server.");

        /**
         * set LDAP version
         */
        ldap_set_option($this->eyeosLDAP, LDAP_OPT_PROTOCOL_VERSION, LDAP_OPT_PROTOCOL_VERSION_VALUE)
                or $this->sendError("Can't establish LDAP Protocol Version to " . LDAP_OPT_PROTOCOL_VERSION_VALUE);
        /**
         * If there is connection parms, link with them, if not, as anonimous
         */
        if (defined('LDAP_BIND_RDN')) {
            ldap_bind($this->eyeosLDAP, LDAP_BIND_RDN, LDAP_BIND_PASSWORD)
                    or $this->sendError("Can't bind to " . LDAP_HOSTNAME . " LDAP Server with user " . LDAP_BIND_RDN);
        } else {
            ldap_bind($this->eyeosLDAP)
                    or $this->sendError("Can't bind to " . LDAP_HOSTNAME . " LDAP Server.");
        }
    }

    /**
     *
     * @param string $errorMsg
     * @param int $errorCode
     * @param Exception $triggerException
     * @param string $typeException
     */
    protected function sendError($errorMsg, $errorCode = 0, $triggerException = null, $typeException = 'EyeUMException') {
        throw new $typeException($errorMsg, $errorCode, $triggerException);
    }

    /**
     * Assigns a principal to a group.
     *
     * @param IPrincipal $principal
     * @param IGroup $group
     * @throws EyeUMException User not found or group not found.
     */
    public function addToGroup(IPrincipal $principal, IGroup $group) {
        if (!$principal instanceof AbstractEyeosPrincipal) {
            throw new EyeInvalidArgumentException($principal);
        }
        if (!$group instanceof AbstractEyeosGroup) {
            throw new EyeInvalidArgumentException($group);
        }

        // Check that the $group is not already in the $principal (if $principal is also a group)
        if ($principal instanceof AbstractEyeosGroup && $this->isPrincipalInGroup($group, $principal)) {
            throw new EyeUMException('Cannot add principal "' . $principal->getName() . '" to group "' . $group->getName() . '": the reverse assignation already exists.');
        }

        $assignation = new EyeosPrincipalGroupAssignation();
        $assignation->setPrincipalId($principal->getId());
        $assignation->setGroupId($group->getId());

        SecurityManager::getInstance()->checkPermission(
                $assignation,
                new SimplePermission($group->getName(), array('addToGroup'))
        );

        try {
            $this->eyeosDAO->create($assignation);
        } catch (Exception $e) {
            throw new EyeUMException('Assignation already exists for "' . $principal->getName() . '" to group "' . $group->getName() . '".', 0, $e);
        }
    }

    public static function checkPrincipalName($principalName) {
        if (!is_string($principalName)) {
            throw new EyeInvalidPrincipalNameException('$principalName must be a string.');
        }
        if (preg_match('/^' . self::PRINCIPALNAME_VALIDATION_REGEXP . '$/i', $principalName) === 1) {
            return;
        }
        throw new EyeInvalidPrincipalNameException('"' . $principalName . '" is not a valid name (valid characters: [a-z 0-9 - _], min. length: 2, max length: 40)');
    }

    /**
     * Creates a group.
     *
     * @param IGroup $group
     * @throws EyeUMException Group already exists.
     */
    public function createGroup(IGroup $group) {
        try {
            if (!$group instanceof AbstractEyeosGroup) {
                throw new EyeInvalidArgumentException($group);
            }
            if ($group->getName() == '') {
                throw new EyeInvalidArgumentException('Cannot create a group with an empty name.');
            }
            self::checkPrincipalName($group->getName());

            SecurityManager::getInstance()->checkPermission(
                    $group,
                    new SimplePermission('', array('create'))
            );

            try {
                $this->eyeosDAO->create($group);
            } catch (EyeIntegrityConstraintViolationException $e) {
                throw new EyeGroupAlreadyExistsException('Group "' . $group->getName() . '" already exists.', 0, $e);
            }
        } catch (Exception $e) {
            //{
            //TODO: rollback
            //}
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to create group "' . $group->getName() . '".', 0, $e);
        }
    }

    /**
     * Creates a user.
     *
     * @param IUser $user
     * @throws EyeUMException User already exists.
     */
    public function createUser(IUser $user) {
        if (!$user instanceof AbstractEyeosUser) {
            throw new EyeInvalidArgumentException($user);
        }
        if ($user->getName() == '') {
            throw new EyeInvalidArgumentException('Cannot create a user with an empty name.');
        }
        self::checkPrincipalName($user->getName());

        SecurityManager::getInstance()->checkPermission(
                $user,
                new SimplePermission('', array('create'))
        );

        $primaryGroupId = $user->getPrimaryGroupId();
        if ($primaryGroupId === null) {
            throw new EyeInvalidArgumentException('Cannot create user "' . $user->getName() . '" without a primary group.');
        } else {
            try {
                $this->getGroupById($primaryGroupId);
            } catch (EyeNoSuchGroupException $e) {
                throw new EyeInvalidArgumentException('Given primary group ID "' . $primaryGroupId . '" does not match any existing group.');
            }
        }

        try {
            try {
                $this->eyeosDAO->create($user);
            } catch (EyeIntegrityConstraintViolationException $e) {
                throw new EyeUserAlreadyExistsException('User "' . $user->getName() . '" already exists.', 0, $e);
            }

            $primaryGroup = $this->getGroupById($primaryGroupId);
            $this->addToGroup($user, $primaryGroup);

            //add to default groups
            $conf = UMManager::getConfiguration(__CLASS__);
            foreach ($conf->defaultGroups->group as $group) {
                $groupName = (string) $group['name'];

                $secondaryGroup = $this->getGroupByName($groupName);
                $this->addToGroup($user, $secondaryGroup);
            }
        } catch (Exception $e) {
            //{
            //TODO: rollback
            //}
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to create user "' . $user->getName() . '".', 0, $e);
        }
    }

    /**
     * Creates a workgroup.
     *
     * @param IWorkgroup $workgroup
     * @throws EyeWorkgroupAlreadyExistsException Workgroup already exists.
     */
    public function createWorkgroup(IWorkgroup $workgroup) {
        if (!$workgroup instanceof AbstractEyeosWorkgroup) {
            throw new EyeInvalidArgumentException($workgroup);
        }
        if ($workgroup->getName() == '') {
            throw new EyeInvalidArgumentException('Cannot create a workgroup with an empty name.');
        }
        self::checkPrincipalName($workgroup->getName());

        SecurityManager::getInstance()->checkPermission(
                $workgroup,
                new SimplePermission('', array('create'))
        );

        $masterGroupId = $workgroup->getMasterGroupId();
        if ($masterGroupId === null) {
            // By default, taking the primary group of the owner
            $owner = $this->getUserById($workgroup->getUserId());
            $workgroup->setMasterGroupId($owner->getPrimaryGroupId());
        } else {
            try {
                $this->getGroupById($masterGroupId);
            } catch (EyeNoSuchGroupException $e) {
                throw new EyeInvalidArgumentException('Given master group ID "' . $masterGroupId . '" does not match any existing group.');
            }
        }
        if ($workgroup->getPrivacyMode() === null) {
            $workgroup->setPrivacyMode(WorkgroupConstants::PRIVACY_OPEN);
        }

        try {
            try {
                $this->eyeosDAO->create($workgroup);
            } catch (EyeIntegrityConstraintViolationException $e) {
                throw new EyeWorkgroupAlreadyExistsException('Workgroup "' . $workgroup->getName() . '" already exists.', 0, $e);
            }

            // Add the new workgroup to its master group
            $masterGroup = $this->getGroupById($masterGroupId);
            $this->addToGroup($workgroup, $masterGroup);

            // Register the assignation owner/workgroup
            $ownerAssignation = $this->getNewUserWorkgroupAssignationInstance();
            $ownerAssignation->setUserId($workgroup->getOwnerId());
            $ownerAssignation->setWorkgroupId($workgroup->getId());
            $ownerAssignation->setStatus(WorkgroupConstants::STATUS_MEMBER);
            $ownerAssignation->setRole(WorkgroupConstants::ROLE_OWNER);
            $this->registerUserWorkgroupAssignation($ownerAssignation);
        } catch (Exception $e) {
            //{
            //TODO: rollback
            //}
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to create workgroup "' . $workgroup->getName() . '" (' . $workgroup->getId() . ').', 0, $e);
        }
    }

    /**
     * Deletes a principal.
     *
     * @param IPrincipal $principal
     * @throws EyeUMException Group not found.
     */
    public function deletePrincipal(IPrincipal $principal) {
        if (!$principal instanceof AbstractEyeosPrincipal) {
            throw new EyeInvalidArgumentException($principal);
        }

        SecurityManager::getInstance()->checkPermission(
                $principal,
                new SimplePermission('', array('delete'))
        );

        $parentGroups = $this->getAllGroupsByPrincipal($principal, 0);

        if ($principal instanceof AbstractEyeosGroup) {
            if (count($this->getAllPrincipalsFromGroup($principal, 0)) > 0) {
                throw new EyeNonEmptyGroupException($principal->getName());
            }
        }

        $includedPrincipals = array();
        if ($principal instanceof AbstractEyeosWorkgroup) {
            $includedPrincipals = $this->getAllUsersFromWorkgroup($principal);
        }

        try {
            $this->eyeosDAO->delete($principal);

            // remove assignations with parent groups
            foreach ($parentGroups as $group) {
                $this->removeFromGroup($principal, $group);
            }

            // remove assignations with children principals
            // AUTOMATIC => ON DELETE CASCADE
        } catch (Exception $e) {
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to delete "' . $principal->getName() . '".', 0, $e);
        }
    }

    /**
     * Gets a list of all groups.
     *
     * @return array(IGroup)
     */
    public function getAllGroups() {
        try {
            $groups = $this->eyeosDAO->readAll($this->getNewGroupInstance());
            $return = array();
            foreach ($groups as $group) {
                $return[$group->getId()] = $group;
            }
            return $return;
        } catch (Exception $e) {
            throw new EyeUMException('Unable to retrieve all the groups.', 0, $e);
        }
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
        if (!$principal instanceof AbstractEyeosPrincipal) {
            throw new EyeInvalidArgumentException($principal);
        }
        try {
            $this->getUserById($principal->getId());
        } catch (EyeNoSuchUserException $e) {
            try {
                $this->getGroupById($principal->getId());
            } catch (EyeNoSuchGroupException $e) {
                try {
                    $this->getWorkgroupById($principal->getId());
                } catch (EyeNoSuchWorkgroupException $e) {
                    throw new EyeNoSuchPrincipalException($principal);
                }
            }
        }

        $groups = array();
        try {
            $this->getAllGroupsByPrincipal_private($principal, $groups, $depth);
        } catch (Exception $e) {
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to retrieve groups from principal "' . $principal->getName() . '".', 0, $e);
        }
        return $groups;
    }

    private function getAllGroupsByPrincipal_private(IPrincipal $principal, & $groups, $depth) {
        $assignation = new EyeosPrincipalGroupAssignation();
        $assignation->setPrincipalId($principal->getId());
        $assignations = $this->eyeosDAO->search($assignation);

        foreach ($assignations as $assignation) {
            $group = $this->getNewGroupInstance();
            $group->setId($assignation->getGroupId());

            $groupFound = true;
            try {
                $this->eyeosDAO->read($group);
            } catch (EyeResultNotFoundException $e) {
                $groupFound = false;
            }

            if ($groupFound) {
                if (!isset($groups[$group->getId()])) {
                    $groups[$group->getId()] = $group;

                    if ($depth !== 0) {
                        $this->getAllGroupsByPrincipal_private($group, $groups, $depth - 1);
                    }
                }
            }
        }
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
        if (!$group instanceof AbstractEyeosGroup) {
            throw new EyeInvalidArgumentException($group);
        }
        // check existence
        $this->getGroupById($group->getId());

        $subGroups = array();
        try {
            $this->getAllGroupsFromGroup_private($group, $subGroups, $depth);
        } catch (Exception $e) {
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to retrieve groups from group "' . $group->getName() . '".', 0, $e);
        }
        return $subGroups;
    }

    private function getAllGroupsFromGroup_private(IGroup $group, & $subGroups, $depth) {
        $assignation = new EyeosPrincipalGroupAssignation();
        $assignation->setGroupId($group->getId());
        $assignations = $this->eyeosDAO->search($assignation);

        foreach ($assignations as $assignation) {
            $subGroup = $this->getNewGroupInstance();
            $subGroup->setId($assignation->getPrincipalId());

            $subGroupFound = true;
            try {
                $this->eyeosDAO->read($subGroup);
            } catch (EyeResultNotFoundException $e) {
                $subGroupFound = false;
            }

            if ($subGroupFound) {
                if (!isset($subGroups[$subGroup->getId()])) {
                    $subGroups[$subGroup->getId()] = $subGroup;

                    if ($depth !== 0) {
                        $this->getAllGroupsFromGroup_private($subGroup, $subGroups, $depth - 1);
                    }
                }
            }
        }
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
        if (!$group instanceof AbstractEyeosGroup) {
            throw new EyeInvalidArgumentException($group);
        }
        // check existence
        $this->getGroupById($group->getId());

        $principals = $this->getAllUsersFromGroup($group, $depth);
        $principals = array_merge($principals, $this->getAllGroupsFromGroup($group, $depth));
        return $principals;
    }

    /**
     * Gets a list of users that are included in the workgroup.
     *
     * @param IWorkgroup $workgroup
     * @return array(IUser)
     * @throws EyeNoSuchWorkgroupException Group not found.
     */
    public function getAllUsersFromWorkgroup(IWorkgroup $workgroup) {
        // check existence
        $this->getWorkgroupById($workgroup->getId());

        try {
            $refAssignation = $this->getNewUserWorkgroupAssignationInstance();
            $refAssignation->setWorkgroupId($workgroup->getId());

            $assignations = $this->getAllUserWorkgroupAssignations($refAssignation);

            $return = array();
            foreach ($assignations as $assignation) {
                $return[$assignation->getUserId()] = $this->getUserById($assignation->getUserId());
            }
            return $return;
        } catch (Exception $e) {
            throw new EyeUMException('Unable to retrieve all the users from workgroup ' . $workgroup->getName() . ' (' . $workgroup->getId() . ').', 0, $e);
        }
    }

    /**
     * Gets all assignations user/workgroup.
     *
     * @param IUserWorkgroupAssignation $filter An optional filter. All the values set
     *        in the given object will be used as filters for the returned values.
     * @return array(IUserWorkgroupAssignation)
     */
    public function getAllUserWorkgroupAssignations(IUserWorkgroupAssignation $filter = null) {
        try {
            if ($filter === null) {
                $assignations = $this->eyeosDAO->readAll($this->getNewUserWorkgroupAssignationInstance());
            } else {
                $assignations = $this->eyeosDAO->search($filter);
            }
            $return = array();
            foreach ($assignations as $assignation) {
                $return[$assignation->getId()] = $assignation;
            }
            return $return;
        } catch (Exception $e) {
            throw new EyeUMException('Unable to retrieve user/workgroup assignations.', 0, $e);
        }
    }

    /**
     * Gets a list of all users.
     *
     * @return array
     */
    public function getAllUsers() {
        try {
            $users = $this->eyeosDAO->readAll($this->getNewUserInstance());
            $return = array();
            foreach ($users as $user) {
                $return[$user->getId()] = $user;
            }
            return $return;
        } catch (Exception $e) {
            throw new EyeUMException('Unable to retrieve all the users.', 0, $e);
        }
    }

    /**
     * Gets a list of users that are included in the group.
     *
     * @param IGroup $group
     * @param int $depth Specify at which maximum depth (in subgroups) groups must be returned.
     * @return array(userId => IUser)
     * @throws EyeUMException Group not found.
     */
    public function getAllUsersFromGroup(IGroup $group, $depth = -1) {
        if (!$group instanceof AbstractEyeosGroup) {
            throw new EyeInvalidArgumentException($group);
        }
        // check existence
        $this->getGroupById($group->getId());

        $users = array();
        try {
            $this->getAllUsersFromGroup_private($group, $users, $depth);
        } catch (Exception $e) {
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to retrieve groups from group "' . $group->getName() . '".', 0, $e);
        }
        return $users;
    }

    private function getAllUsersFromGroup_private(IGroup $group, & $users, $depth) {
        $assignation = new EyeosPrincipalGroupAssignation();
        $assignation->setGroupId($group->getId());
        $assignations = $this->eyeosDAO->search($assignation);
        $principals = array();

        // Search all assignations using $group
        foreach ($assignations as $assignation) {
            $user = $this->getNewUserInstance();
            $user->setId($assignation->getPrincipalId());

            // Check if the principal of the assignation is a user
            $userFound = true;
            try {
                $this->eyeosDAO->read($user);
            } catch (EyeResultNotFoundException $e) {
                $userFound = false;
            }

            // current principal in assignation is a user => add it to the return array
            if ($userFound) {
                if (!isset($users[$user->getId()])) {
                    $users[$user->getId()] = $user;
                }
            }
            // current principal in assignation is a group => search into it if $depth allows it
            else {
                if ($depth !== 0) {
                    $subGroup = $this->getNewGroupInstance();
                    $subGroup->setId($assignation->getPrincipalId());
                    $this->eyeosDAO->read($subGroup);
                    $this->getAllUsersFromGroup_private($subGroup, $users, $depth - 1);
                }
            }
        }
    }

    /**
     * Gets a list of all workgroups.
     *
     * @return array(IWorkgroup)
     */
    public function getAllWorkgroups() {
        try {
            $workgroups = $this->eyeosDAO->readAll($this->getNewWorkgroupInstance(), 20);
            $return = array();
            foreach ($workgroups as $workgroup) {
                $return[$workgroup->getId()] = $workgroup;
            }
            return $return;
        } catch (Exception $e) {
            throw new EyeUMException('Unable to retrieve all the workgroups.', 0, $e);
        }
    }

    /**
     * Gets a list of workgroups where the user is included.
     *
     * @param IUser $user
     * @return array(IWorkgroup)
     * @throws EyeUMException User not found.
     */
    public function getAllWorkgroupsByUser(IUser $user) {
        // check existence
        $this->getUserById($user->getId());

        try {
            $refAssignation = $this->getNewUserWorkgroupAssignationInstance();
            $refAssignation->setUserId($user->getId());

            $assignations = $this->getAllUserWorkgroupAssignations($refAssignation);

            $return = array();
            foreach ($assignations as $assignation) {
                $return[$assignation->getWorkgroupId()] = $this->getWorkgroupById($assignation->getWorkgroupId());
            }
            return $return;
        } catch (Exception $e) {
            throw new EyeUMException('Unable to retrieve all the workgroups from user ' . $user->getName() . '.', 0, $e);
        }
    }

    /**
     * Gets the group from its ID.
     *
     * @param string $id
     * @return IGroup
     * @throws EyeNoSuchGroupException Group not found.
     */
    public function getGroupById($id) {
        $group = $this->getNewGroupInstance();
        try {
            $group->setId($id);
            $this->eyeosDAO->read($group);
        } catch (Exception $e) {
            throw new EyeNoSuchGroupException('Unable to retrieve group from ID "' . $id . '".', 0, $e);
        }
        return $group;
    }

    /**
     * Gets the group from its name.
     *
     * @param string $name
     * @return IGroup
     * @throws EyeNoSuchGroupException Group not found.
     */
    public function getGroupByName($name) {
        $group = $this->getNewGroupInstance();
        try {
            $group->setName($name);
            $group = $this->eyeosDAO->search($group);
            if (count($group) == 0 || current($group) === false) {
                throw new EyeResultNotFoundException();
            }
            $group = current($group);
        } catch (EyeResultNotFoundException $e) {
            throw new EyeNoSuchGroupException('Unable to retrieve group from name "' . $name . '".', 0, $e);
        }
        return $group;
    }

    /**
     * Creates a new instance of a group.
     *
     * This is used because each implementation uses its own type of Group.
     *
     * @return IGroup
     */
    public function getNewGroupInstance() {
        $groupClass = UMManager::getGroupClassName();
        return new $groupClass;
    }

    /**
     * Creates a new instance of a user.
     *
     * This is used because each implementation uses its own type of User.
     *
     * @return IUser
     */
    public function getNewUserInstance() {
        $userClass = UMManager::getUserClassName();
        return new $userClass;
    }

    /**
     * Creates a new instance of a user/workgroup assignation.
     *
     * @return IUserWorkgroupAssignation
     */
    public function getNewUserWorkgroupAssignationInstance() {
        $assignationClass = UMManager::getUserWorkgroupAssignationClassName();
        return new $assignationClass;
    }

    /**
     * Creates a new instance of a workgroup.
     *
     * @return IWorkgroup
     */
    public function getNewWorkgroupInstance() {
        $workgroupClass = UMManager::getWorkgroupClassName();
        return new $workgroupClass;
    }

    /**
     * Gets the principal (user or group) from its ID.
     * Please not that this function is provided for convenience and must be replaced by dedicated
     * methods (getUserById/getGroupById/getWorkgroupById) when the type of the principal is known,
     * for performance reasons.
     *
     * @param string $id
     * @return IPrincipal
     * @throws EyeNoSuchPrincipalException Principal not found.
     */
    public function getPrincipalById($id) {
        $principal = null;
        try {
            $principal = $this->getUserById($id);
        } catch (EyeNoSuchUserException $e) {
            try {
                $principal = $this->getGroupById($id);
            } catch (EyeNoSuchGroupException $e) {
                try {
                    $principal = $this->getWorkgroupById($id);
                } catch (EyeNoSuchWorkgroupException $e) {
                    throw new EyeNoSuchPrincipalException('Unable to retrieve principal from ID "' . $id . '".');
                }
            }
        }
        return $principal;
    }

    /**
     * Gets the user from its ID.
     *
     * @param string $id
     * @return IUser
     * @throws EyeNoSuchUserException User not found.
     */
    public function getUserById($id) {
        $user = $this->getNewUserInstance();
        try {
            $user->setId($id);
            $this->eyeosDAO->read($user);
        } catch (Exception $e) {
            throw new EyeNoSuchUserException('Unable to retrieve user from ID "' . $id . '".', 0, $e);
        }
        return $user;
    }

    /**
     * Gets the user from its name.
     *
     * @param string $name
     * @return IUser
     * @throws EyeNoSuchUserException User not found.
     */
    public function getUserByName($name) {
        $user = $this->getNewUserInstance();
        try {
            $user->setName($name);
            $user = $this->eyeosDAO->search($user);
            if (count($user) == 0 || current($user) === false) {
                /**
                 * no existeix l'usuari, l'anem a buscar a l'LDAP
                 * @todo planificar una actualització de dades de l'LDAP en background
                 */
                $lRes = ldap_search($this->eyeosLDAP, LDAP_BASE_DN, LDAP_UID_ATTRIBUTE_NAME . "={$name}")
                        or $this->sendError("Can't find uid {$name} in LDAP Directory");

                $entries = ldap_get_entries($this->eyeosLDAP, $lRes);

                /**
                 * Si no existeix tampoc al directori LDAP, donem un error
                 */
                if (!isset($entries['count']) or $entries['count'] == '0') {
                    throw new EyeResultNotFoundException();
                }
            }
            $user = current($user);
        } catch (EyeResultNotFoundException $e) {
            throw new EyeNoSuchUserException('Unable to retrieve user from name "' . $name . '".', 0, $e);
        }
        return $user;
    }

    /**
     * Gets the workgroup from its ID.
     *
     * @param string $name
     * @return IWorkgroup
     * @throws EyeNoSuchWorkgroupException Workgroup not found.
     */
    public function getWorkgroupById($id) {
        $workgroup = $this->getNewWorkgroupInstance();
        try {
            $workgroup->setId($id);
            $this->eyeosDAO->read($workgroup);
        } catch (Exception $e) {
            throw new EyeNoSuchWorkgroupException('Unable to retrieve workgroup from ID "' . $id . '".', 0, $e);
        }
        return $workgroup;
    }

    /**
     * Gets the workgroup from its name.
     *
     * @param string $name
     * @return IWorkgroup
     * @throws EyeNoSuchWorkgroupException Workgroup not found.
     */
    public function getWorkgroupByName($name) {
        $workgroup = $this->getNewWorkgroupInstance();
        try {
            $workgroup->setName($name);
            $workgroup = $this->eyeosDAO->search($workgroup);
            if (count($workgroup) == 0 || current($workgroup) === false) {
                throw new EyeResultNotFoundException();
            }
            $workgroup = current($workgroup);
        } catch (Exception $e) {
            throw new EyeNoSuchWorkgroupException('Unable to retrieve workgroup from name "' . $name . '".', 0, $e);
        }
        return $workgroup;
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
        if (!$principal instanceof AbstractEyeosPrincipal) {
            throw new EyeInvalidArgumentException($principal);
        }
        if (!$group instanceof AbstractEyeosGroup) {
            throw new EyeInvalidArgumentException($group);
        }
        return $this->isPrincipalInGroup_private($principal, $group);
    }

    private function isPrincipalInGroup_private(IPrincipal $principal, IGroup $group) {
        $principalGroups = $this->getAllGroupsByPrincipal($principal);

        //search all groups from first level
        foreach ($principalGroups as $principalGroup) {
            if ($principalGroup->getId() == $group->getId()) {
                return true;
            }
        }

        //search all groups from higher levels
        foreach ($principalGroups as $principalGroup) {
            if ($this->isPrincipalInGroup_private($principalGroup, $group)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if a user is member of the specified workgroup.
     *
     * @param IUser $user
     * @param IWorkgroup $workgroup
     * @throws EyeNoSuchPrincipalException User not found or group not found.
     */
    public function isUserInWorkroup(IUser $user, IWorkgroup $workgroup) {
        $principalWorkgroups = $this->getAllWorkgroupsByUser($user);

        foreach ($principalWorkgroups as $principalWorkgroup) {
            if ($principalWorkgroup->getId() == $workgroup->getId()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Registers a new assignation user/workgroup.
     *
     * @param IUserWorkgroupAssignation $assignation
     * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
     */
    public function registerUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation) {
        if (!$assignation instanceof EyeosUserWorkgroupAssignation) {
            throw new EyeInvalidArgumentException($assignation);
        }
        if ($assignation->getId() !== null) {
            throw new EyeInvalidArgumentException('Assignation ID must be null.');
        }
        if ($assignation->getUserId() === null) {
            throw new EyeNullPointerException('$assignation->getUserId()');
        }
        if ($assignation->getWorkgroupId() === null) {
            throw new EyeNullPointerException('$assignation->getWorkgroupId()');
        }
        if ($assignation->getRole() === null) {
            $assignation->setRole(WorkgroupConstants::ROLE_VIEWER);
        }
        if ($assignation->getStatus() === null) {
            throw new EyeNullPointerException('$assignation->getStatus()');
        }

        SecurityManager::getInstance()->checkPermission(
                $assignation,
                new SimplePermission('', array('addToWorkgroup'))
        );

        try {
            $this->eyeosDAO->create($assignation);
        } catch (Exception $e) {
            throw new EyeUMException('Unable to register user/workgroup assignation between user ID "' . $assignation->getUserId() . '" and workgroup ID "' . $assignation->getWorkgroupId() . '".', 0, $e);
        }
    }

    /**
     * Remove a principal from a group.
     *
     * @param IPrincipal $principal
     * @param IGroup $group
     * @throws EyeUMException User not found or group not found.
     */
    public function removeFromGroup(IPrincipal $principal, IGroup $group) {
        if (!$principal instanceof AbstractEyeosPrincipal) {
            throw new EyeInvalidArgumentException($principal);
        }
        if (!$group instanceof AbstractEyeosGroup) {
            throw new EyeInvalidArgumentException($group);
        }

        if (($principal instanceof IUser) && $group->getId() == $principal->getPrimaryGroupId()) {
            $userExists = true;
            try {
                $this->getUserById($principal->getId());
            } catch (EyeNoSuchUserException $e) {
                $userExists = false;
            }
            if ($userExists) {
                throw new EyeUnsupportedOperationException('Cannot unassign a user from its primary group, try updating instead.');
            }
        }

        $assignation = new EyeosPrincipalGroupAssignation();
        $assignation->setPrincipalId($principal->getId());
        $assignation->setGroupId($group->getId());
        $assignation = current($this->eyeosDAO->search($assignation));

        SecurityManager::getInstance()->checkPermission(
                $assignation,
                new SimplePermission($group->getName(), array('removeFromGroup'))
        );

        try {
            $this->eyeosDAO->delete($assignation);
        } catch (Exception $e) {
            throw new EyeUMException('Unable to remove principal "' . $principal->getName() . '" from group "' . $group->getName() . '".', 0, $e);
        }
    }

    /**
     * Unregisters a new assignation user/workgroup.
     *
     * @param IUserWorkgroupAssignation $assignation The assignation object whether (by priority) with
     *        its ID filled in, or the workgroup ID and user ID filled in.
     * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
     */
    public function unregisterUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation) {
        // We create a new instance of assignation to avoid filtering by status and/or role when checking existence
        $filterAssignation = $this->getNewUserWorkgroupAssignationInstance();

        if ($assignation->getId() === null) {
            if ($assignation->getWorkgroupId() === null || $assignation->getUserId() === null) {
                throw new EyeInvalidArgumentException('You must provide at least the ID of the assignation or the user + workgroup IDs in the object.');
            }
            $filterAssignation->setWorkgroupId($assignation->getWorkgroupId());
            $filterAssignation->setUserId($assignation->getUserId());
        } else {
            $filterAssignation->setId($assignation->getId());
            $filterAssignation->setWorkgroupId(null);
            $filterAssignation->setUserId(null);
        }

        // Now check existence
        $oldAssignation = $this->getAllUserWorkgroupAssignations($filterAssignation);

        if (count($oldAssignation) === 0) {
            throw new EyeNoSuchAssignationException('No existing assignation matches given argument.');
        }
        $assignation = current($oldAssignation);

        try {
            $workgroup = $this->getWorkgroupById($assignation->getWorkgroupId());
            if ($workgroup->getOwnerId() === $assignation->getUserId()) {
                throw new EyeUnsupportedOperationException('Cannot remove the workgroup\'s owner from the workgroup.');
            }
        } catch (EyeNoSuchWorkgroupException $e) {
            // If the workgroup does not exist, it means that it has been deleted, so in this case only
            // it's possible to unregister the owner from its own workgroup
        }

        SecurityManager::getInstance()->checkPermission(
                $assignation,
                new SimplePermission('', array('removeFromWorkgroup'))
        );

        try {
            $this->eyeosDAO->delete($assignation);
        } catch (Exception $e) {
            throw new EyeUMException('Unable to unregister user/workgroup assignation between user ID "' . $assignation->getUserId() . '" and workgroup ID "' . $assignation->getWorkgroupId() . '".', 0, $e);
        }
    }

    /**
     * Updates the information of a principal.
     *
     * @param IPrincipal $principal
     * @throws EyeUMException Principal not found.
     */
    public function updatePrincipal(IPrincipal $principal) {
        if (!$principal instanceof AbstractEyeosPrincipal) {
            throw new EyeInvalidArgumentException($principal);
        }

        SecurityManager::getInstance()->checkPermission(
                $principal,
                new SimplePermission('', array('update'))
        );

        $originalPrimaryGroupId = false;
        $originalMasterGroupId = false;
        $originalOwnerId = false;
        if ($principal instanceof IUser) {
            $originalUser = $this->getUserById($principal->getId());
            $originalPrimaryGroupId = $originalUser->getPrimaryGroupId();
        } else if ($principal instanceof IWorkgroup) {
            $originalWorkgroup = $this->getWorkgroupById($principal->getId());

            $originalMasterGroupId = $originalWorkgroup->getMasterGroupId();
            $originalOwnerId = $originalWorkgroup->getOwnerId();
        } else {
            // check existence only
            $this->getGroupById($principal->getId());
        }

        $this->eyeosDAO->beginTransaction();
        try {
            $this->eyeosDAO->update($principal);

            //in the case of a user, update the primary group assignation if needed
            if ($originalPrimaryGroupId) {
                //if the primary group has changed
                if ($principal->getPrimaryGroupId() != $originalPrimaryGroupId) {
                    $userGroups = $this->getAllGroupsByPrincipal($principal);
                    $assignationChangeRequired = true;
                    foreach ($userGroups as $userGroup) {
                        //if the new primary group is one of the current secondary groups, nothing has to be changed
                        //(an assignation already exists to both groups)
                        if ($userGroup->getId() == $principal->getPrimaryGroupId()) {
                            $assignationChangeRequired = false;
                            break;
                        }
                    }
                    if ($assignationChangeRequired) {
                        $newPrimaryGroup = $this->getGroupById($principal->getPrimaryGroupId());
                        $this->removeFromGroup($principal, $this->getGroupById($originalPrimaryGroupId));
                        $this->addToGroup($principal, $newPrimaryGroup);
                    }
                }
            } else {
                if ($originalMasterGroupId) {
                    //if the master group has changed
                    if ($principal->getMasterGroupId() != $originalMasterGroupId) {
                        $newMasterGroup = $this->getGroupById($principal->getMasterGroupId());
                        $this->removeFromGroup($principal, $this->getGroupById($originalMasterGroupId));
                        $this->addToGroup($principal, $newMasterGroup);
                    }
                }
                if ($originalOwnerId) {
                    //if the owner has changed
                    if ($principal->getOwnerId() != $originalOwnerId) {
                        // check existence of new owner
                        try {
                            $newOwner = $this->getUserById($principal->getOwnerId());
                        } catch (EyeNoSuchUserException $e) {
                            throw new EyeNoSuchUserException('Cannot change owner of workgroup "' . $principal->getName() . '": new owner is an unknown ID.');
                        }

                        $oldOwnerAssignation = $this->getNewUserWorkgroupAssignationInstance();
                        $oldOwnerAssignation->setUserId($originalOwnerId);
                        $oldOwnerAssignation->setWorkgroupId($principal->getId());
                        $oldOwnerAssignation = current($this->getAllUserWorkgroupAssignations($oldOwnerAssignation));
                        if ($oldOwnerAssignation === false || $oldOwnerAssignation->getRole() !== WorkgroupConstants::ROLE_OWNER) {
                            throw new EyeNoSuchAssignationException('Wrong owner assignation.');
                        }

                        $newOwnerAssignation = $this->getNewUserWorkgroupAssignationInstance();
                        $newOwnerAssignation->setUserId($principal->getOwnerId());
                        $newOwnerAssignation->setWorkgroupId($principal->getId());
                        $newOwnerAssignation = current($this->getAllUserWorkgroupAssignations($newOwnerAssignation));
                        if ($newOwnerAssignation === false) {
                            throw new EyeNoSuchAssignationException('The new owner "' . $newOwner->getName() . '" must be a member of the workgroup "' . $principal->getName() . '" before taking its ownership.');
                        }

                        // Update new owner assignation
                        $newOwnerAssignation->setRole(WorkgroupConstants::ROLE_OWNER);
                        $newOwnerAssignation->setStatus(WorkgroupConstants::STATUS_MEMBER);   //Force status
                        $this->updateUserWorkgroupAssignation_private($newOwnerAssignation);

                        // Update old owner assignation
                        $oldOwnerAssignation->setRole(WorkgroupConstants::ROLE_ADMIN);
                        $this->updateUserWorkgroupAssignation_private($oldOwnerAssignation);
                    }
                }
            }
            $this->eyeosDAO->commit();
        } catch (Exception $e) {
            $this->eyeosDAO->rollback();
            if ($e instanceof EyeUMException) {
                throw $e;
            }
            throw new EyeUMException('Unable to update principal "' . $principal->getName() . '".', 0, $e);
        }
    }

    /**
     * Updates a new assignation user/workgroup.
     *
     * @param IUserWorkgroupAssignation $assignation
     * @throws EyeInvalidArgumentException If some mandatory fields are missing in the given argument.
     */
    public function updateUserWorkgroupAssignation(IUserWorkgroupAssignation $assignation) {
        if (!$assignation instanceof EyeosUserWorkgroupAssignation) {
            throw new EyeInvalidArgumentException($assignation);
        }

        // We create a new instance of assignation to avoid filtering by status and/or role when checking existence
        $filterAssignation = $this->getNewUserWorkgroupAssignationInstance();

        if ($assignation->getId() === null) {
            if ($assignation->getWorkgroupId() === null || $assignation->getUserId() === null) {
                throw new EyeInvalidArgumentException('You must provide at least the ID of the assignation or the user + workgroup IDs in the object.');
            }
            $filterAssignation->setWorkgroupId($assignation->getWorkgroupId());
            $filterAssignation->setUserId($assignation->getUserId());
        } else {
            $filterAssignation->setId($assignation->getId());
        }

        // Now check existence
        $oldAssignation = $this->getAllUserWorkgroupAssignations($filterAssignation);

        if (count($oldAssignation) === 0) {
            throw new EyeNoSuchAssignationException('No existing assignation matches given argument.');
        }
        $oldAssignation = current($oldAssignation);

        // Role can only be changed if not OWNER
        if ($oldAssignation->getRole() !== $assignation->getRole()
                && ($oldAssignation->getRole() === WorkgroupConstants::ROLE_OWNER || $assignation->getRole() === WorkgroupConstants::ROLE_OWNER)) {
            throw new EyeUMException('Cannot change owner by updating assignation. Change owner ID in workgroup instead.');
        }

        // FIXME: it does not care about failed operations right now!!!!!!!
        $event = new UMEvent($assignation, $oldAssignation);
        UMManager::getInstance()->fireEvent('userWorkgroupAssignationUpdated', $event);

        if ($assignation->getRole() !== null) {
            $oldAssignation->setRole($assignation->getRole());
        }

        if ($assignation->getStatus() !== null) {
            $oldAssignation->setStatus($assignation->getStatus());
        }

        $this->updateUserWorkgroupAssignation_private($oldAssignation);
    }

    private function updateUserWorkgroupAssignation_private(IUserWorkgroupAssignation $assignation) {
        SecurityManager::getInstance()->checkPermission(
                $assignation,
                new SimplePermission('', array('update'))
        );

        try {
            $this->eyeosDAO->update($assignation);
        } catch (Exception $e) {
            //{
            //TODO: rollback
            //}
            throw new EyeUMException('Unable to update user/workgroup assignation between user ID "' . $assignation->getUserId() . '" and workgroup ID "' . $assignation->getWorkgroupId() . '".', 0, $e);
        }
    }

}

?>