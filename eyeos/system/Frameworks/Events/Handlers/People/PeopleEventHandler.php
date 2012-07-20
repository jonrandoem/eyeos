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

class PeopleEventHandler implements IQuestionEventHandler {

	/**
	 * Retrieve the name of the user
	 *
	 * @param <AbstractEventNotification> $event
	 */
	public static function retrieveContactName($userId) {
		$user = UMManager::getInstance()->getUserById($userId);
		$userMeta = MetaManager::getInstance()->retrieveMeta($user);
		$username = $userMeta->get('eyeos.user.firstname') . ' ' . $userMeta->get('eyeos.user.lastname');

		return $username;
	}

	/**
	 * Check the type of the event and fill its properties depending on the name
	 * of the event
	 * 
	 * @param <AbstractEventNotification> $event
	 */
	public function autoFill(AbstractEventNotification $event){
		if ($event->getType() === null) {
			throw new EyeInvalidArgumentException('Missing or invalid type property');
		}
		
		list($category, $type) = explode('_', $event->getType(), 2);
		$eventHanlderClass = $type . 'Event';
		$eventHandler = new $eventHanlderClass();

		$eventHandler->autoFill($event);
	}

	/**
	 * Execute the action relative an event with the answer provided by the user
	 * 
	 * @param <map> $params => array {
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
	
	/**
	  * Retrieve the name of a tag by its id
	  */
	public static function getListName($listId) {
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$peopleController = PeopleController::getInstance();
		return $peopleController->getTagName($listId);
	}
}

class EyeosPeopleEventsContactManagerAdapter extends AbstractPeopleAdapter {
	private static $Instance = null;

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new EyeosPeopleEventsContactManagerAdapter();
		}
		return self::$Instance;
	}

	public function contactCreated(PeopleEvent $e) {
		$targetId = $e->getSource()->getRelation()->getTargetId();
		$sourceId = $e->getSource()->getRelation()->getSourceId();

		// Send Event to Sender...
		$info = new EyeosEventNotification();
		$info->setType('People_RequestRelationshipSender');
		$info->setEventData($targetId);
		$info->setSender($targetId);
		$info->setReceiver($sourceId);

		$eventManager = new EventNotificationManager();
		$eventManager->sendEventByType($info);


		// Send Event to Receiver...
		$info = new EyeosEventNotification();
		$info->setType('People_RequestRelationshipReceiver');
		$info->setSender($sourceId);
		$info->setReceiver($targetId);

		$eventManager = new EventNotificationManager();
		$eventManager->sendEventByType($info);
	}

	public function contactConfirmed(PeopleEvent $e) {
		$sourceId = $e->getSource();
		$targetId = $e->getRelatedSource();

		// Send Event to Sender...
		$info = new EyeosEventNotification();
		$info->setType('People_ConfirmContactSender');
		$info->setEventData($targetId);

		$eventManager = new EventNotificationManager();
		$eventManager->sendEventByType($info);


		// Send Event to Receiver...
		$info = new EyeosEventNotification();
		$info->setType('People_ConfirmContactReceiver');
		$info->setSender($sourceId);
		$info->setReceiver($targetId);

		$eventManager = new EventNotificationManager();
		$eventManager->sendEventByType($info);

		// Closing the relatives events...
		$info = new EyeosEventNotification();
		$info->setType('People_RequestRelationshipReceiver');
		$info->setSender($targetId);
		$info->setReceiver($sourceId);
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

	public function contactBeforeDeletion(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function contactDeleted(PeopleEvent $e) {
		$contact = $e->getSource();
		$sourceId = $contact->getRelation()->getSourceId();
		$targetId = $contact->getRelation()->getTargetId();
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$otherUser = ($sourceId == $currentUserId) ? $targetId : $sourceId;

		$state = $contact->getRelation()->getState();
		if ($state == 'pending') {
			// Send Event to Receiver...
			$info = new EyeosEventNotification();
			$info->setType('People_CancelRequest');
			$info->setEventData($otherUser);

			$eventManager = new EventNotificationManager();
			$eventManager->sendEventByType($info);
		} else if ($state == 'accepted') {
			// end Event to Receiver...
			$info = new EyeosEventNotification();
			$info->setType('People_DeleteContact');
			$info->setEventData($otherUser);

			$eventManager = new EventNotificationManager();
			$eventManager->sendEventByType($info);
		}

		// Closing the relatives events...
		$info = new EyeosEventNotification();
		$info->setType('People_RequestRelationshipReceiver');
		$info->setSender($sourceId);
		$info->setReceiver($targetId);
		$info->setIsQuestion(1);

		$eventManager = new EventNotificationManager();
		$eventsToRemove = $eventManager->searchEvents($info);
		
		foreach($eventsToRemove as $event) {
			$eventManager->deleteEvent($event->getId());
		}
	}

	public function tagAddedToContact(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function beforeTagDeletionToContact(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagDeletedToContact(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagCreated(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagModified(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function beforeTagDeletion(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagRemoved(PeopleEvent $e) {
		// nothing to do for the moment....
	}
}

// Register singleton listener on the target dispatcher
PeopleController::getInstance()->addPeopleListener(EyeosPeopleEventsContactManagerAdapter::getInstance());
?>
