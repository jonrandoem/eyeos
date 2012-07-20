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
 * ExecModule for workgroups management.
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
class WorkgroupsExecModule implements IEyeosExecutableModule {
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}
	
	/**
	 * @param array $params(
	 * 		'name' => name
	 * )
	 */
	public function checkWorkgroupName($params) {		
		if (!isset($params['name']) || !is_string($params['name'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'name\'].');
		}
		
		// Is this name already assigned?
		try {
			UMManager::getInstance()->getWorkgroupByName($params['name']);
		} catch(EyeNoSuchWorkgroupException $e) {
			
			//FIXME: should be abstracted by UMManager
			EyeosSQLPrincipalsManager::checkPrincipalName($params['name']);
			
			return;
		}
		throw new EyePrincipalAlreadyExistsException('Workgroup "' . $params['name'] . '"');
	}
	
	/**
	 * @see WorkgroupConstants
	 * 
	 * @param array $params(
	 * 		'workgroupId' => workgroupId
	 * )
	 */
	public function confirmInvitation($params) {		
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		
		$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$assignation->setUserId($user->getId());
		$assignation->setWorkgroupId($params['workgroupId']);
		$assignation->setStatus(WorkgroupConstants::STATUS_MEMBER);
		UMManager::getInstance()->updateUserWorkgroupAssignation($assignation);
	}
	
	/**
	 * @param array $params(
	 * 		'name' => name,
	 * 		['masterGroupId' => masterGroupId],			//primary group of the owner if none provided
	 * 		['privacyMode' => privacyMode]				// OPEN/PUBLIC by default
	 * )
	 * @return string The ID of the new workgroup
	 */
	public function createWorkgroup($params) {
		if (!isset($params['name']) || !is_string($params['name'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'name\'].');
		}
		
		$owner = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		
		if (!isset($params['masterGroupId']) || !is_string($params['masterGroupId'])) {
			$masterGroupId = $owner->getPrimaryGroupId();
		} else {
			$masterGroupId = $params['masterGroupId'];
		}
		if (!isset($params['masterGroupId']) || !is_string($params['masterGroupId'])) {
			$masterGroupId = $owner->getPrimaryGroupId();
		} else {
			$masterGroupId = $params['masterGroupId'];
		}
		
		$workgroup = UMManager::getInstance()->getNewWorkgroupInstance();
		$workgroup->setOwnerId($owner->getId());
		$workgroup->setName($params['name']);
		$workgroup->setMasterGroupId($masterGroupId);
		if (isset($params['privacyMode']) && is_numeric($params['privacyMode'])) {
			$workgroup->setPrivacyMode($params['privacyMode']);
		}		
		UMManager::getInstance()->createWorkgroup($workgroup);
		
		return $workgroup->getId();
	}
	
	/**
	 * @param array $params(
	 * 		'workgroupId' => workgroupId,
	 * 		'userIds' => array(
	 * 			userId,
	 * 			...
	 * 		)
	 * )
	 */
	public function deleteMemberships($params) {
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		if (!isset($params['userIds']) || !is_array($params['userIds'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'userIds\'].');
		}
		
		// Check existence
		$workgroup = UMManager::getInstance()->getWorkgroupById($params['workgroupId']);
		
		foreach($params['userIds'] as $userId) {
			if (!is_string($userId)) {
				throw new EyeInvalidArgumentException('Invalid $params[\'userIds\']: must be an array of strings.');
			}
			
			$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
			$assignation->setUserId($userId);
			$assignation->setWorkgroupId($params['workgroupId']);
			
			UMManager::getInstance()->unregisterUserWorkgroupAssignation($assignation);
		}
	}
	
	/**
	 * @param array $params(
	 * 		'workgroupId' => workgroupId
	 * )
	 */
	public function deleteWorkgroup($params) {
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		
		$workgroup = UMManager::getInstance()->getWorkgroupById($params['workgroupId']);
		UMManager::getInstance()->deletePrincipal($workgroup);
	}
	
	/**
	 * @param array $params(
	 * 		'workgroupId' => workgroupId,
	 * 		['role' => role,]
	 * 		['status' => status]
	 * )
	 */
	public function getAllMembersFromWorkgroup($params) {
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		if (isset($params['role']) && !is_numeric($params['role'])) {
			throw new EyeInvalidArgumentException('Invalid $params[\'role\'].');
		}
		if (isset($params['status']) && !is_numeric($params['status'])) {
			throw new EyeInvalidArgumentException('Invalid $params[\'status\'].');
		}
		
		$filter = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$filter->setWorkgroupId($params['workgroupId']);
		if (isset($params['role']) && is_numeric($params['role'])) {
			$filter->setRole($params['role']);
		}
		if (isset($params['status']) && is_numeric($params['status'])) {
			$filter->setStatus($params['status']);
		}
		
		$assignations = UMManager::getInstance()->getAllUserWorkgroupAssignations($filter);

		$result = array();
		foreach($assignations as $assignation) {
			$user = UMManager::getInstance()->getUserById($assignation->getUserId());
			$userMeta = MetaManager::getInstance()->retrieveMeta($user);
			$user = self::toArray($user);

			$user['metadata'] = array();
			if ($userMeta !== null) {
				$user['metadata'] = $userMeta->getAll();
			}

			$user['role'] = $assignation->getRole();
			$user['status'] = $assignation->getStatus();

			$result[] = $user;
		}
		return $result;
	}
	
	/**
	 * @param array $params(
	 * 		['includeMeta' => FALSE/true]
	 * )
	 * @return array(array(
	 * 		'workgroup' => (
	 * 			'id' => id,
	 * 			{...other workgroup attributes...}
	 * 			['metadata' => ...]
	 * 		)
	 * 		'role' => role = false,
	 * 		'status' => status = false
	 * ))
	 */
	public function getAllWorkgroups($params) {
		if (isset($params['includeMeta']) && !is_string($params['includeMeta'])) {
			throw new EyeInvalidArgumentException('Invalid $params[\'includeMeta\'].');
		}
		
		$workgroups = UMManager::getInstance()->getAllWorkgroups();
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		
		$filter = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$filter->setUserId($currentUser->getId());
		
		$result = array();
		foreach($workgroups as $workgroup) {
			$workgroupData = self::toArray($workgroup);
			if (isset($params['includeMeta']) && strcasecmp($params['includeMeta'], 'true') === 0) {
				$meta = MetaManager::getInstance()->retrieveMeta($workgroup);
				
				$workgroupData['metadata'] = array();
				if ($meta !== null) {
					foreach($meta->getAll() as $key => $value) {
						$workgroupData['metadata'][$key] = $value;
					}
				}
			}
			
			$workgroupUserInfo = array();
			
			// Search for membership (role & status if any)
			$filter->setId(null);
			$filter->setWorkgroupId($workgroup->getId());
			$assignation = current(UMManager::getInstance()->getAllUserWorkgroupAssignations($filter));
			if ($assignation === false) {
				$workgroupUserInfo['role'] = 'false';
				$workgroupUserInfo['status'] = 'false';
			} else {
				$workgroupUserInfo['role'] = $assignation->getRole();
				$workgroupUserInfo['status'] = $assignation->getStatus();
			}
			
			$workgroupUserInfo['workgroup'] = $workgroupData;
			
			$result[] = $workgroupUserInfo;
		}
		
		return $result;
	}
	/*
	 * @param array $params(
	 * 		userId => 'String'
	 *		pattern => 'String'
	 *
	 * )
	 */

	public function searchWorkgroups($params) {
		if (isset($params['userId'])) {
			$results = $this->getAllWorkgroupsByUser(array('userId' => $params['userId'], 'includeMeta' => 'true' ));
		} else {
			$results = $this->getAllWorkgroups(array('includeMeta' => 'true'));
		}

		if (($params['pattern'] == '')) {
			return $results;
		}

		$return = array();
		foreach ($results as $result) {
			$groupName = $result['workgroup']['name'];
			$description = $result['workgroup']['metadata']['eyeos.workgroup.description'];

			if ((stristr($groupName, $params['pattern'])) || (stristr($description, $params['pattern']))) {
				$return[] = $result;
			}
		}

		return $return;
	}
	
	/**
	 * @param array $params(
	 * 		['userId' => userId],					// Current user ID by default
	 * 		['includeMeta' => FALSE/true]
	 * )
	 * @return array(array(
	 * 		'workgroup' => (
	 * 			'id' => id,
	 * 			{...other workgroup attributes...}
	 * 			['metadata' => ...]
	 * 		)
	 * 		'role' => role,
	 * 		'status' => status
	 * ))
	 */
	public function getAllWorkgroupsByUser($params) {
		if (!isset($params['userId'])) {
			$params['userId'] = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		} else if (!is_string($params['userId'])) {
			throw new EyeInvalidArgumentException('Invalid $params[\'userId\'].');
		}
		if (isset($params['includeMeta']) && !is_string($params['includeMeta'])) {
			throw new EyeInvalidArgumentException('Invalid $params[\'includeMeta\'].');
		}
		
		$user = UMManager::getInstance()->getUserById($params['userId']);
		
		$filter = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$filter->setUserId($params['userId']);		
		$assignations = UMManager::getInstance()->getAllUserWorkgroupAssignations($filter);
		
		$result = array();
		foreach($assignations as $assignation) {
			$workgroup = UMManager::getInstance()->getWorkgroupById($assignation->getWorkgroupId());

			$workgroupData = self::toArray($workgroup);
			if (isset($params['includeMeta']) && strcasecmp($params['includeMeta'], 'true') === 0) {
				$meta = MetaManager::getInstance()->retrieveMeta($workgroup);
				
				$workgroupData['metadata'] = array();
				if ($meta !== null) {
					foreach($meta->getAll() as $key => $value) {
						$workgroupData['metadata'][$key] = $value;
					}
				}
			}
			
			$result[] = array_merge(
				self::toArray($assignation),
				array('workgroup' => $workgroupData)
			);
		}		
		return $result;
	}
	
	/**
	 * @param array $params(
	 * 		'userId' => userId,
	 * 		'workgroupId' => workgroupId
	 * )
	 * @return array(
	 * 		'id' => id,
	 * 		'name' => name,
	 * 		{...other user attributes...},
	 * 		'role' => role,
	 * 		'status' => status
	 * )
	 */
	public function getMember($params) {
		if (!isset($params['userId']) || !is_string($params['userId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'userId\'].');
		}
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		
		$user = UMManager::getInstance()->getUserById($params['userId']);
		
		$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$assignation->setUserId($params['userId']);
		$assignation->setWorkgroupId($params['workgroupId']);
		$assignation = UMManager::getInstance()->getAllUserWorkgroupAssignations($assignation);
		if (count($assignation) == 0) {
			throw new EyeUnexpectedValueException('User ' . $user->getName() . ' is not member of specified workgroup.');
		}
		
		$userMap = self::toArray($user);
		$userMap['role'] = $assignation->getRole();
		$userMap['status'] = $assignation->getStatus();
		
		return $userMap;
	}
	
	/**
	 * @param array $params(
	 * 		['id' => id,]
	 * 		['name' => name,]
	 * 		['includeMeta' => FALSE/true]
	 * )
	 *
	 * @return array(
	 * 		'workgroup' => (
	 * 			'id' => id,
	 * 			{...other workgroup attributes...}
	 * 			['metadata' => ...]
	 * 		)
	 * 		'role' => role,
	 * 		'status' => status
	 * )
	 */
	public function getWorkgroup($params) {
		if (isset($params['id']) && is_string($params['id'])) {
			$workgroup = UMManager::getInstance()->getWorkgroupById($params['id']);
		} else if (isset($params['name']) && is_string($params['name'])) {
			$workgroup = UMManager::getInstance()->getWorkgroupByName($params['name']);
		} else {
			throw new EyeMissingArgumentException('Missing or invalid $params[\'id\'] or $params[\'name\'].');
		}

		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$filter = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$filter->setUserId($currentUserId);
		$filter->setWorkgroupId($params['id']);
		$assignations = UMManager::getInstance()->getAllUserWorkgroupAssignations($filter);
		$assignation = array_shift($assignations);

		$result = self::toArray($workgroup);
		if (isset($params['includeMeta']) && strcasecmp($params['includeMeta'], 'true') === 0) {
			$meta = MetaManager::getInstance()->retrieveMeta($workgroup);

			$result['metadata'] = array();
				if ($meta !== null) {
					foreach($meta->getAll() as $key => $value) {
						$result['metadata'][$key] = $value;
					}
				}
		}

		// cis team
		$resultsGroupCalendar = CalendarManager::getInstance()->getAllCalendarsFromOwner($workgroup);

		$resultsGroupCalendar = self::toArrayCalendar($resultsGroupCalendar);
		$i=0;
		foreach ($resultsGroupCalendar as $key => $value){
			$resultsGroupCalendar['calendars'][$i]['name']=$value['name'];
			$resultsGroupCalendar['calendars'][$i]['id']=$value['id'];
			$resultsGroupCalendar['calendars'][$i]['update']=1;
			$i++;
		}
			//$resultsGroupCalendar['calendars']['id']=$value['id'];
		$arrayAssignation = self::toArray($assignation);
		$arrayAssignation = $arrayAssignation ? $arrayAssignation : Array();
		return array_merge(
				$arrayAssignation,
				$result,
				$resultsGroupCalendar
				);
		// cis team
	}
	/**
	 * @param array(
	 * 		'workgroupId' => workgroupId
	 * )
	 */
	public function getWorkgroupPicture($params) {
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		
		$workgroup = UMManager::getInstance()->getWorkgroupById($params['workgroupId']);
		
		$settings = MetaManager::getInstance()->retrieveMeta($workgroup);
		$file = null;
		if ($settings->get('eyeos.workgroup.picture.url') !== null) {
			$file = FSI::getFile($settings->get('eyeos.workgroup.picture.url'));
		}
		if ($file === null || !$file->isReadable()) {
			$file = FSI::getFile('sys:///extern/images/workgroup-empty.png');
		}
		
		$response = MMapManager::getCurrentResponse();
		$bodyrenderer = new FileReaderBodyRenderer($file->getInputStream());
		
		// Set headers
		$response->getHeaders()->append('Content-Type: image/' . $file->getExtension());
		$response->getHeaders()->append('Content-Length: ' . $file->getSize());
		$response->getHeaders()->append('Accept-Ranges: bytes');
		$response->getHeaders()->append('X-Pad: avoid browser bug');
		
		$response->setBodyRenderer($bodyrenderer);
	}

	/**
	 * @param array $params(
	 * 		['id' => id,]
	 * 		['name' => name]
	 * )
	 */

	public function isWorkgroupPresent($params) {
		if (isset($params['id']) && is_string($params['id'])) {
			try {
				$result = UMManager::getInstance()->getWorkgroupById();
			} catch (EyeNoSuchWorkgroupException $e) {
				return 0;
			}
		} else if (isset($params['name']) && is_string($params['name'])) {
			try {
				$result = UMManager::getInstance()->getWorkgroupByName($params['name']);
			} catch (EyeNoSuchWorkgroupException $e) {
				return 0;
			}
		} else {
			throw new EyeMissingArgumentException('Missing or invalid $params[\'id\'] or $params[\'name\'].');
		}

		return 1;
	}
	
	/**
	 * @see WorkgroupConstants
	 * 
	 * @param array $params(
	 * 		'workgroupId' => workgroupId,
	 * 		'membersInfo' => array(array(
	 * 			'userId' => userId,
	 * 			['role' => role]
	 * 		))
	 * )
	 */
	public function inviteUsers($params) {
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		if (!isset($params['membersInfo']) || !is_array($params['membersInfo'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'membersInfo\'].');
		}
		
		foreach($params['membersInfo'] as $memberInfo) {
			if (!is_array($memberInfo)) {
				throw new EyeInvalidArgumentException('Invalid $params[\'$memberInfo\']: must be an array of arrays.');
			}
			if (!isset($memberInfo['userId']) || !is_string($memberInfo['userId'])) {
				throw new EyeInvalidArgumentException('Missing or invalid $params[\'userId\'].');
			}
			if (!isset($memberInfo['role']) || !is_numeric($memberInfo['role'])) {
				$memberInfo['role'] = WorkgroupConstants::ROLE_VIEWER;
			}
			if (!isset($memberInfo['status']) || !is_numeric($memberInfo['status'])) {
				$memberInfo['status'] = WorkgroupConstants::STATUS_INVITED;
			}
			
			$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
			$assignation->setUserId($memberInfo['userId']);
			$assignation->setWorkgroupId($params['workgroupId']);
			$assignation->setRole($memberInfo['role']);
			$assignation->setStatus($memberInfo['status']);

			UMManager::getInstance()->registerUserWorkgroupAssignation($assignation);
		}
	}
	
	/**
	 * @param array $params(
	 * 		'workgroupId' => workgroupId,
	 * 		['userId' => userId]
	 * )
	 */
	public function requestMembership($params) {
		if (!isset($params['userId']) || !is_string($params['userId'])) {
			$params['userId'] = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		}
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		
		$workgroup = UMManager::getInstance()->getWorkgroupById($params['workgroupId']);
		
		$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
		$assignation->setUserId($params['userId']);
		$assignation->setWorkgroupId($params['workgroupId']);
		
		if ($workgroup->getPrivacyMode() == WorkgroupConstants::PRIVACY_OPEN) {
			$assignation->setStatus(WorkgroupConstants::STATUS_MEMBER);
		} else if ($workgroup->getPrivacyMode() == WorkgroupConstants::PRIVACY_ONREQUEST) {
			$assignation->setStatus(WorkgroupConstants::STATUS_PENDING);
		} else {
			throw new EyeSecurityException('Cannot request membership on a private workgroup.');
		}
		UMManager::getInstance()->registerUserWorkgroupAssignation($assignation);
	}
	
	/**
	 * @param array(
	 * 		'filePath' => filePath,
	 * 		'workgroupId' => workgroupId
	 * )
	 */
	public function setWorkgroupPicture($params) {
		if (!isset($params['filePath']) || !is_string($params['filePath'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'filePath\'].');
		}
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		
		$workgroup = UMManager::getInstance()->getWorkgroupById($params['workgroupId']);
		
		$file = FSI::getFile($params['filePath']);
		if (!$file->isReadable()) {
			throw new EyeIOException('Unable to read file at ' . $params['filePath'] . '.');
		}
		
		$extension = $file->getExtension() ? '.' . $file->getExtension() : '';
		$destFile = FSI::getFile('workgroup-conf://~' . $workgroup->getName() . '/public/avatarpic' . $extension);
		
		$file->copyTo($destFile);
		
		// Update settings (metadata)
		$settings = MetaManager::getInstance()->retrieveMeta($workgroup);
		$settings->set('eyeos.workgroup.picture.url', $destFile->getAbsolutePath());
		MetaManager::getInstance()->storeMeta($workgroup, $settings);
	}
	
	/**
	 * Performs a PHP variable => JSON-compatible array conversion with objects of class IWorkgroup,
	 * IUserWorkgroupAssignation, IUser, and arrays of the previous types.
	 * 
	 * @param mixed $value
	 * @return array
	 */
	private static function toArray($value) {
		if (!isset($value)) {
			return null;
		}
		if ($value instanceof IMetaData) {
			return $value->getAll();
		}
		if ($value instanceof IWorkgroup || $value instanceof IUserWorkgroupAssignation || $value instanceof IUser) {
			return $value->getAttributesMap();
		}
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('$value must be an IWorkgroup, IUserWorkgroupAssignation, IUser, IMetaData or an array of one of the previous classes.');
		}
		
		foreach($value as &$v) {
			$v = self::toArray($v);
		}
		sort($value);
		return $value;
	}
	
	/**
	 * @see WorkgroupConstants
	 * 
	 * @param array $params(array(
	 * 		'workgroupId' => workgroupId,
	 * 		'membersInfo' => array(
	 * 			'userId' => userId,
	 * 			['role' => newRole,]
	 * 			['status' => newStatus]
	 * 		)
	 * ))
	 */
	public function updateMembers($params) {
		if (!isset($params['workgroupId']) || !is_string($params['workgroupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'workgroupId\'].');
		}
		if (!isset($params['membersInfo']) || !is_array($params['membersInfo'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'membersInfo\'].');
		}
		
		foreach($params['membersInfo'] as $memberInfo) {
			$assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
			$assignation->setUserId($memberInfo['userId']);
			$assignation->setWorkgroupId($params['workgroupId']);
			
			if (!isset($memberInfo['role']) || !is_numeric($memberInfo['role'])) {
				$memberInfo['role'] = null;
			} else {
				$assignation->setRole($memberInfo['role']);
			}

			if (!isset($memberInfo['status']) || !is_numeric($memberInfo['status'])) {
				$memberInfo['status'] = null;
			} else {
				$assignation->setStatus($memberInfo['status']);
			}
			
			UMManager::getInstance()->updateUserWorkgroupAssignation($assignation);
		}
	}
	
	/**
	 * @param array $params(
	 * 		'id' => id,
	 * 		['masterGroupId' => masterGroupId,]
	 * 		['ownerId' => ownerId,]
	 * 		['privacyMode' => privacyMode,]
	 * 		['metadata' => {Map}]
	 * 		['status' => status]
	 * )
	 */
	public function updateWorkgroup($params) {
		if (!isset($params['id']) || !is_string($params['id'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'id\'].');
		}
		
		if (!isset($params['masterGroupId']) || !is_string($params['masterGroupId'])) {
			$params['masterGroupId'] = null;
		}
		if (!isset($params['ownerId']) || !is_string($params['ownerId'])) {
			$params['ownerId'] = null;
		}
		if (!isset($params['privacyMode']) || !is_numeric($params['privacyMode'])) {
			$params['privacyMode'] = null;
		}
		if (!isset($params['status']) || !is_numeric($params['status'])) {
			$params['status'] = null;
		}
		
		$newWorkgroup = UMManager::getInstance()->getWorkgroupById($params['id']);
		if ($params['masterGroupId'] !== null) {
			$newWorkgroup->setMasterGroupId($params['masterGroupId']);
		}
		if ($params['ownerId'] !== null) {
			$newWorkgroup->setOwnerId($params['ownerId']);
		}
		if ($params['privacyMode'] !== null) {
			$newWorkgroup->setPrivacyMode($params['privacyMode']);
		}
		if ($params['status'] !== null) {
			$newWorkgroup->setStatus($params['status']);
		}
		UMManager::getInstance()->updatePrincipal($newWorkgroup);
		
		if (isset($params['metadata']) && is_array($params['metadata'])) {
			$meta = MetaManager::getInstance()->retrieveMeta($newWorkgroup);
			if ($meta === null) {
				$meta = MetaManager::getInstance()->getNewMetaDataInstance($newWorkgroup);
			}
			$meta->setAll($params['metadata']);
			
			MetaManager::getInstance()->storeMeta($newWorkgroup, $meta);
		}
	}
	
	public function createGroupCalendar($params) {
		
		
		
			if (!isset($params['name']) || !is_string($params['name'])) {
				throw new EyeMissingArgumentException('Missing or invalid $params[\'name\'].');
			}
			
		
					
			$newCalendar = CalendarManager::getInstance()->getNewCalendar();
			
			$newCalendar->setName($params['name']);
			$newCalendar->setTimezone(0);
		
			$newCalendar->setOwnerId($params['workgroupId']); 
			CalendarManager::getInstance()->saveCalendar($newCalendar);
		
	
		
	}
	
	
	public function deleteCalendar($params) {
		if (!isset($params['calendarId']) || !is_string($params['calendarId'])) {
			throw new EyeMissingArgumentException('Missing or invalid $params[\'calendarId\'].');
		}
		
		$cal = CalendarManager::getInstance()->getCalendarById($params['calendarId']);
		CalendarManager::getInstance()->deleteCalendar($cal);
	}
	// cis team
	private static function toArrayCalendar($value) {
		if ($value instanceof ICalendar || $value instanceof ICalendarEvent || $value instanceof ICalendarPrefs) {
			return $value->getAttributesMap();
		}
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('$value must be an ICalendar, ICalendarEvent, ICalendarPrefs, or an array of one of the previous classes (' . gettype($value) . ' given).');
		}
		
		foreach($value as &$v) {
			$v = self::toArrayCalendar($v);
		}
		return $value;
	}
	// cis team
}
?>
