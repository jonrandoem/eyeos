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

class EventNotificationManager {
	
	private $provider;

	public function __construct() {
		$this->provider = new SqlEventNotificationProvider();
	}

	public function getEvent($id) {
		$event = new EyeosEventNotification();
		$info = new EventNotificationInformation();
		$info->setId($id);
		$this->getProvider()->retrieveEventNotification($info);
		$event->setEventInformation($info);
		return $event;
	}

	public function searchEvents (EyeosEventNotification $event) {
		return $this->getProvider()->searchEvents($event);
	}
	
	/**
	 * Send an event providing the type so we can use the relative Handler to
	 * autofill missing arguments, and provide a method for automatic handling of
	 * the answer
	 *
	 * @param <EyeosEventNotification> $event
	 */
	public function sendEventByType ($event) {
		if (($event->getType() === null) || (!is_string($event->getType()))) {
			throw new EyeInvalidArgumentException('Need to specify a type for the event to send event by type');
		}
		//Fill some basic properties
		self::autoFill($event);

		//Fill some properties depending on the category or the specific Event
		list($category, $type) = explode('_', $event->getType(), 2);
		$myHandlerClass = $category . 'EventHandler';
		$myHandler = new $myHandlerClass();

		if ($myHandler === null) {
			throw new EyeNoSuchHandlerException('The Handler for the category ' . $category . 'doesn\'t exist');
		}
		$myHandler->autoFill($event);

		//Send the event
		self::sendEvent($event);
	}

	/**
	 * Execute the action relative an event with the answer provided by the user
	 *
	 * @param <EyeosEventNotification> $event
	 */

	public function handleAnswer ($event) {
		if ($event->getType() === null) {
			throw new EyeInvalidArgumentException('Need to specify a type for the event to handle the answer');
		}

		list($category, $type) = explode('_', $event->getType(), 2);
		$myHandlerClass = $category . 'EventHandler';
		$myHandler = new $myHandlerClass();

		if ($myHandler === null) {
			throw new EyeNoSuchHandlerException('The Handler for the category ' . $category . 'doesn\'t exist');
		}
		$myHandler->handleAnswer($event);

//		//Set event to Ended and update it
		$event->setHasEnded(true);
		self::getProvider()->updateEventNotification($event);
	}

	public function updateEventNotification ($event) {
		self::getProvider()->updateEventNotification($event);

		//Notify to destination user to update his events information
        $NetSyncMessage = new NetSyncMessage('events', 'updateEvent', $event->getReceiver());
        NetSyncController::getInstance()->send($NetSyncMessage);
	}

	/**
	 * Fill some basic properties automatically.
	 *
	 * @param <EyeosEventNotification> $event
	 */

	private function autoFill ($event) {
		if ($event->getSender() === null) {
			$event->setSender(ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId());
		}
		$event->setCreationDate(time());
		if ($event->getReceiver() === null) {
			//this message is going to myself
			$event->setReceiver(ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId());
		}
		$event->setHasEnded(false);
	}

	/**
	 * Send a custom event
	 *
	 * @param <EyeosEventNotification> $event
	 */
	public function sendCustomEvent($event) {
		self::sendEvent($event);
	}

	/**
	 * Store an event on the database
	 * 
	 * @param <EyeosEventNotification> $event
	 */
	public function sendEvent($event) {
		$this->getProvider()->storeEventNotification($event);
		
        //Notify to destination user to update his events information
		$data = $event->getAttributesMap();
		if(isset($data['eventInformation'])) {
			$data = $data['eventInformation'];
		}
        $NetSyncMessage = new NetSyncMessage('events', 'newEvent', $event->getReceiver(), $data);
        NetSyncController::getInstance()->send($NetSyncMessage);
	}

	public function getNotEndedEvents($from, $to) {
		$infos = $this->getProvider()->retrieveAllEventNotificationsNotEnded($from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
	}

	public function getEndedEvents($from, $to) {
		$infos = $this->getProvider()->retrieveAllEventNotificationsEnded($from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
	}

	public function getAllEvents($from, $to) {
		$infos = $this->getProvider()->retrieveAllEventNotifications($from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
	}

	public function getAllQuestionEvents($from, $to) {
		$infos = $this->getProvider()->retrieveAllQuestionEvents($from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
		
	}

	public function getAllEventsByType($type, $from, $to) {
		$infos = $this->getProvider()->retrieveAllEventNotificationsByType($type, $from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
	}

	public function getAllEventsByDate($numberDays, $from, $to) {
		$infos = $this->getProvider()->retrieveAllEventNotificationsByDate($numberDays, $from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
	}

	public function getAllEventsBySender($sender, $from, $to) {
		$infos = $this->getProvider()->retrieveAllEventNotificationsBySender($sender, $from, $to);
		if(!is_array($infos)) {
			throw new EyeUnexpectedValueException('Returned value from Database should be an array');
			return false;
		}
		$events = array();
		foreach($infos as $info) {
			$event = new EyeosEventNotification();
			$event->setEventInformation($info);
			$events[] = $event;
		}
		return $events;
	}

	public function deleteEvents($ids) {
		if (is_int($ids)) {
			self::deleteEvent($ids);
		} else {
			foreach ($ids as $id) {
				self::deleteEvent($id);
			}
		}
	}

	public function deleteEvent($id) {
		$event = new EyeosEventNotification();
		$info = new EventNotificationInformation();
		$info->setId($id);
		$event->setEventInformation($info);
		$this->getProvider()->deleteEventNotification($event);
	}

	private function getProvider() {
		return $this->provider;
	}
}

?>