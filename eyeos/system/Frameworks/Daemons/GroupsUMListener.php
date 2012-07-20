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

class GroupUMListener extends AbstractUMAdapter {
	private static $Instance = null;
	private static $workgroupMembers = array();
	private static $Logger = null;

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new GroupUMListener();
			self::$Logger = Logger::getLogger('system.daemons.groups');
		}
		return self::$Instance;
	}

	public function workgroupBeforeDeletion(UMEvent $e) {
		if ($e->getSource() instanceof AbstractEyeosWorkgroup) {
			$workgroupId = $e->getSource()->getId();
			$filter = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
			$filter->setWorkgroupId($workgroupId);

			//We need to save the members of a wgroup before we remove it (for send notification Event later)
			$members = UMManager::getInstance()->getAllUserWorkgroupAssignations($filter);
			$membersId = array();
			foreach($members as $member) {
				$membersId[] = $member->getUserId();
			}
			self::$workgroupMembers[$workgroupId] = array(
				'members' => $membersId,
				'name' => GroupsEventHandler::retrieveWorkgroupName($workgroupId)
			);
		}
	}

	public function workgroupDeleted(UMEvent $e) {
		// We need to remove the flag isQuestion to events on DB that have actions
		$eventManager = new EventNotificationManager();
		$workgroupId = $e->getSource()->getId();

		if ($e->getSource() instanceof AbstractEyeosWorkgroup) {
			$members = self::$workgroupMembers[$workgroupId]['members'];
			//Send notification to each members of the workgroup
			foreach ($members as $member) {
				$NetSyncMessage = new NetSyncMessage('NSGroup', 'deletedWorkgroup', $userId, $workgroupId);
				NetSyncController::getInstance()->send($NetSyncMessage);
			}
			unset(self::$workgroupMembers[$workgroupId]);
		}
	}

	public function workgroupUpdated(UMEvent $e) {
		if ($e->getSource() instanceof AbstractEyeosWorkgroup && $e->getRelatedSource() instanceof AbstractEyeosWorkgroup) {
			$oldGroup = $e->getRelatedSource();
			$newGroup = $e->getSource();
			$workgroupId = $newGroup->getId();

			if ($oldGroup->getName() !== $newGroup->getName()) {
				$filter = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
				$filter->setWorkgroupId($workgroupId);

				//We need to save the members of a wgroup before we remove it (for send notification Event later)
				$members = UMManager::getInstance()->getAllUserWorkgroupAssignations($filter);
				foreach ($members as $member) {
					$NetSyncMessage = new NetSyncMessage('NSGroup', 'nameChanged', $member, Array('workgroupId' => $workgroupId, 'name' => $newGroup->getName()));
					NetSyncController::getInstance()->send($NetSyncMessage);
				}
			}
		}
	}

	public function userWorkgroupAssignationCreated(UMEvent $e) {
		if ($e->getSource() instanceof IUserWorkgroupAssignation) {
			$assignation = $e->getSource();
			$userId = $assignation->getUserId();
			$groupId = $assignation->getWorkgroupId();

			// User Invited event
			if ($assignation->getStatus() === WorkgroupConstants::STATUS_INVITED) {
				$NetSyncMessage = new NetSyncMessage('NSGroup', 'invitedWorkgroup', $userId, $groupId);
				NetSyncController::getInstance()->send($NetSyncMessage);
			}

			//User Request to enter a workgroup
			if ($assignation->getStatus() === WorkgroupConstants::STATUS_PENDING) {
				$NetSyncMessage = new NetSyncMessage('NSGroup', 'pendingdWorkgroup', $userId, $groupId);
				NetSyncController::getInstance()->send($NetSyncMessage);
			}

						//User Request to enter a workgroup
			if ($assignation->getStatus() === WorkgroupConstants::STATUS_MEMBER) {
				$NetSyncMessage = new NetSyncMessage('NSGroup', 'memberWorkgroup', $userId, $groupId);
				NetSyncController::getInstance()->send($NetSyncMessage);
			}
		}
	}

	public function userWorkgroupAssignationUpdated (UMEvent $e) {
		if ($e->getSource() instanceof IUserWorkgroupAssignation) {
			$assignation = $e->getSource();
			$oldAssignation = $e->getRelatedSource();
			$userId = $assignation->getUserId();
			$groupId = $assignation->getWorkgroupId();

			if ($assignation->getStatus() === WorkgroupConstants::STATUS_BANNED) {
				$NetSyncMessage = new NetSyncMessage('NSGroup', 'bannedFromWorkgroup', $userId, $groupId);
				NetSyncController::getInstance()->send($NetSyncMessage);
			}

			if ((($oldAssignation->getStatus() === WorkgroupConstants::STATUS_PENDING) || ($oldAssignation->getStatus() === WorkgroupConstants::STATUS_INVITED))
					&& ($assignation->getStatus() === WorkgroupConstants::STATUS_MEMBER)) {
				$NetSyncMessage = new NetSyncMessage('NSGroup', 'confirmMembership', $userId, $groupId);
				NetSyncController::getInstance()->send($NetSyncMessage);

			}
		}
	}
}
UMManager::getInstance()->addUMListener(GroupUMListener::getInstance());
?>