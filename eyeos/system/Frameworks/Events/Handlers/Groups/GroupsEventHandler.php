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
 * This Class provide information and actions about each event related on Event.
 */

class GroupsEventHandler implements IQuestionEventHandler {
	private static $Instance = null;
	/**
	 * @var ArrayList(IFileListener)
	 */
	private $listeners;

	/**
	 * Retrieve the name of the user
	 *
	 * @param AbstractEventNotification $event
	 */
	public static function retrieveContactName($userId) {
		$user = UMManager::getInstance()->getUserById($userId);
		$userMeta = MetaManager::getInstance()->retrieveMeta($user);
		$username = $userMeta->get('eyeos.user.firstname') . ' ' . $userMeta->get('eyeos.user.lastname');

		return $username;
	}
	
	/**
	 * Retrieve the name of the wGroup
	 *
	 * @param string $workGroupId
	 */
	public static function retrieveWorkgroupName ($workGroupId) {
		$wGroup =  UMManager::getInstance()->getWorkgroupById($workGroupId);
		return $wGroup->getName();
	}
	

	/**
	 * Check the type of the event and fill its properties depending on the name
	 * of the event
	 *
	 * @param AbstractEventNotification $event
	 */
	public function autoFill (AbstractEventNotification $event) {
		list($category, $type) = explode('_', $event->getType(), 2);
		$eventHanlderClass = $type . 'Event';
		$eventHandler = new $eventHanlderClass();

		$eventHandler->autoFill($event);
	}

	/**
	 * Execute the action relative an event with the answer provided by the user
	 *
	 * @param map $params => array {
	 *		'id' => String
	 *		'answer' => String
	 * }
	 */
	public function handleAnswer(AbstractEventNotification $event){
		if ($event->getType() === null) {
			throw new EyeInvalidArgumentException('Missing or invalid type property');
		}

		if ($event->getAnswer() === null) {
			throw new EyeInvalidArgumentException('Missing or invalid answer property');
		}

		list($category, $type) = explode('_', $event->getType(), 2);
		$eventHanlderClass = $type . 'Event';
		$eventHandler = new $eventHanlderClass();
		
		$eventHandler->handleAnswer($event);
	}
}

class EyeosGroupsEventsUMAdapter extends AbstractUMAdapter {
	private static $Instance = null;
	private static $workgroupMembers = array();

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new EyeosGroupsEventsUMAdapter();
		}
		return self::$Instance;
	}

	public function workgroupCreated(UMEvent $e) {
		if ($e->getSource() instanceof AbstractEyeosWorkgroup) {
			$event = new EyeosEventNotification();
			$event->setType('Groups_CreatedGroup');
			$event->setEventData($e->getSource()->getName());

			$eventManager = new EventNotificationManager();
			$eventManager->sendEventByType($event);
		}
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

		$info = new EyeosEventNotification();
		$info->setType('Groups_RequestMembershipReceiver');
		$info->setEventData($workgroupId);
		$info->setIsQuestion(1);

		$eventsToRemove = $eventManager->searchEvents($info);

		$info->setType('Groups_InvitedUsersReceiver');
		if(count($eventsToRemove)) {
			$eventsToRemove[] = $eventManager->searchEvents($info);
		} else {
			$eventsToRemove = $eventManager->searchEvents($info);
		}
		
		foreach ($eventsToRemove as $event) {
			$eventManager->deleteEvent($event->getId());
		}

		if ($e->getSource() instanceof AbstractEyeosWorkgroup) {
			$members = self::$workgroupMembers[$workgroupId]['members'];
			//Send notification to each members of the workgroup
			foreach ($members as $member) {
				$event = new EyeosEventNotification();
				$event->setType('Groups_DeletedGroup');
				$event->setEventData(self::$workgroupMembers[$workgroupId]['name']);
				$event->setReceiver($member);
				
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event);
				
			}
			unset(self::$workgroupMembers[$workgroupId]);
		}
	}

	public function workgroupUpdated(UMEvent $e) {
		if ($e->getSource() instanceof AbstractEyeosWorkgroup && $e->getRelatedSource() instanceof AbstractEyeosWorkgroup) {
			$oldGroup = $e->getRelatedSource();
			$newGroup = $e->getSource();

			if ($oldGroup->getName() !== $newGroup->getName()) {
				$event = new EyeosEventNotification();
				$event->setType('Groups_EditedNameGroup');
				$event->setEventData( array(
						'oldGroupName' => $oldGroup->getName(),
						'newGroupName' => $newGroup->getName()
				));

				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event);
			}
		}
	}

	public function userWorkgroupAssignationDeleted(UMEvent $e) {
		if ($e->getSource() instanceof IUserWorkgroupAssignation) {
			$assignation = $e->getSource();

			$userId = $assignation->getUserId();
			$groupId = $assignation->getWorkgroupId();

			// closing event in case of membership request...
			$eventData = serialize(array('groupId' => $groupId, 'userId' => $userId));

			$info = new EyeosEventNotification();
			$info->setType('Groups_RequestMembershipReceiver');
			$info->setEventData($eventData);
			$info->setIsQuestion(1);

			$eventManager = new EventNotificationManager();
			$eventsToRemove = $eventManager->searchEvents($info);

			foreach($eventsToRemove as $event) {
				// should we create a new event to advise the group's owner
				// about the user who is leaving the group??
				$eventManager->deleteEvent($event->getId());

				$NetSyncMessage = new NetSyncMessage('events', 'updateEvent', $event->getReceiver());
				NetSyncController::getInstance()->send($NetSyncMessage);
			}

			// closing event in case of membership invitation...
			$eventData = serialize(array('groupId' => $groupId));

			$info = new EyeosEventNotification();
			$info->setType('Groups_InvitedUsersReceiver');
			$info->setEventData($eventData);
			$info->setIsQuestion(1);

			$eventManager = new EventNotificationManager();
			$eventsToRemove = $eventManager->searchEvents($info);

			foreach($eventsToRemove as $event) {
				// should we create a new event to advise the group's owner
				// about the user who is leaving the group??
				$eventManager->deleteEvent($event->getId());

				$NetSyncMessage = new NetSyncMessage('events', 'updateEvent', $event->getReceiver());
				NetSyncController::getInstance()->send($NetSyncMessage);
			}

			$NetSyncMessage = new NetSyncMessage('NSGroup', 'userWorkgroupAssignationDeleted', $userId, $groupId);
			NetSyncController::getInstance()->send($NetSyncMessage);
		}
	}

	public function userWorkgroupAssignationCreated(UMEvent $e) {
		if ($e->getSource() instanceof IUserWorkgroupAssignation) {
			$assignation = $e->getSource();
			$userId = $assignation->getUserId();
			$groupId = $assignation->getWorkgroupId();

			// User Invited event
			if ($assignation->getStatus() === WorkgroupConstants::STATUS_INVITED) {
				$event1 = new EyeosEventNotification();
				$event1->setType('Groups_InvitedUsersSender');
				$event1->setEventData(array(
						'usersId'=> $userId,
						'groupId'=> $groupId
				));
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event1);

				//TODO: Create Event for other User
				$event2 = new EyeosEventNotification();
				$event2->setType('Groups_InvitedUsersReceiver');
				$event2->setReceiver($userId);
				$event2->setEventData(array(
						'groupId'=> $groupId
				));
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event2);
			}

			//User Request to enter a workgroup
			if ($assignation->getStatus() === WorkgroupConstants::STATUS_PENDING) {
				//Message sended to the user who request the membership
				$event1 = new EyeosEventNotification();
				$event1->setType('Groups_RequestMembershipSender');
				$event1->setEventData($groupId);
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event1);

				//Message sended to the owner of the group
				$event2 = new EyeosEventNotification();
				$event2->setType('Groups_RequestMembershipReceiver');
				$event2->setEventData( array(
					'groupId' => $groupId,
					'userId' => $userId
				));
				$wGroup = UMManager::getInstance()->getWorkgroupById($groupId);
				$owner = $wGroup->getOwnerId();
				$event2->setReceiver($owner);
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event2);
			}

			if ($assignation->getStatus() === WorkgroupConstants::STATUS_MEMBER) {
				//Message sended to the user who request the membership
				$event1 = new EyeosEventNotification();
				$event1->setType('Groups_JoinedUser');
				$event1->setEventData(array (
					'userId' => $userId,
					'groupId' => $groupId
				));
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event1);

				//Message sended to the owner of the group
				$event2 = new EyeosEventNotification();
				$event2->setType('Groups_JoinedUser');
				$event2->setEventData( array(
					'groupId' => $groupId,
					'userId' => $userId
				));
				$wGroup = UMManager::getInstance()->getWorkgroupById($groupId);
				$owner = $wGroup->getOwnerId();
				$event2->setReceiver($owner);
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event2);
			}

			$NetSyncMessage = new NetSyncMessage('NSGroup', 'userWorkgroupAssignationCreated', $userId, $groupId);
			NetSyncController::getInstance()->send($NetSyncMessage);
		}
	}

	public function userWorkgroupAssignationUpdated (UMEvent $e) {
		if ($e->getSource() instanceof IUserWorkgroupAssignation) {
			$assignation = $e->getSource();
			$oldAssignation = $e->getRelatedSource();
			$userId = $assignation->getUserId();
			$groupId = $assignation->getWorkgroupId();
                        
			if ($assignation->getStatus() === WorkgroupConstants::STATUS_BANNED) {
				$event1 = new EyeosEventNotification();
				$event1->setType('Groups_BannedUser');
				$event1->setEventData(array(
						'userId'=> $userId,
						'groupId'=> $groupId
				));
				$eventManager = new EventNotificationManager();
				//Send event to the owner
				$eventManager->sendEventByType($event1);

				//Send event to the banned user
				$event2 = new EyeosEventNotification();
				$event2->setType('Groups_BannedUser');
				$event2->setEventData(array(
						'userId'=> $userId,
						'groupId'=> $groupId
				));
				$event2->setReceiver($userId);
				$eventManager->sendEventByType($event2);
			}

			if ((($oldAssignation->getStatus() === WorkgroupConstants::STATUS_PENDING) || ($oldAssignation->getStatus() === WorkgroupConstants::STATUS_INVITED))
					&& ($assignation->getStatus() === WorkgroupConstants::STATUS_MEMBER)) {
				$event = new EyeosEventNotification();
				$event->setType('Groups_ConfirmedUser');
				$event->setEventData($groupId);
				$event->setReceiver($userId);
				$eventManager = new EventNotificationManager();
				$eventManager->sendEventByType($event);

				// Closing the relatives events in case of pending request...
				$eventData = serialize(array('groupId' => $groupId, 'userId' => $userId));

				$info = new EyeosEventNotification();
				$info->setType('Groups_RequestMembershipReceiver');
				$info->setEventData($eventData);
				$info->setIsQuestion(1);

				$eventManager = new EventNotificationManager();
				$eventsToRemove = $eventManager->searchEvents($info);

				foreach($eventsToRemove as $event) {
					$abstractEvent = new EyeosEventNotification();
					$abstractEvent->setEventInformation($event);
					$abstractEvent->setHasEnded(true);
					$eventManager->updateEventNotification($abstractEvent);
				}

				// Closing the relatives events in case of invited request...
				$eventData = serialize(array('groupId' => $groupId));

				$info = new EyeosEventNotification();
				$info->setType('Groups_InvitedUsersReceiver');
				$info->setEventData($eventData);
				$info->setIsQuestion(1);
				
				$eventManager = new EventNotificationManager();
				$eventsToRemove = $eventManager->searchEvents($info);

				foreach($eventsToRemove as $event) {
					$abstractEvent = new EyeosEventNotification();
					$abstractEvent->setEventInformation($event);
					$abstractEvent->setHasEnded(true);
					$eventManager->updateEventNotification($abstractEvent);
				}
			}

			$NetSyncMessage = new NetSyncMessage('NSGroup', 'userWorkgroupAssignationUpdated', $userId, $groupId);
			NetSyncController::getInstance()->send($NetSyncMessage);
		}
	}
}

UMManager::getInstance()->addUMListener(EyeosGroupsEventsUMAdapter::getInstance());
?>
