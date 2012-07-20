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
 * ExecModule for Events management.
 *
 * @package kernel-frameworks
 * @subpackage Application
 */

 class EventsExecModule implements IEyeosExecutableModule {
	 public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}

	/**
	 * Send (create) a new event
	 *
	 * @param array $param => array(
	 *		'id' => String
	 *		'answer' => String
	 *		'creationdate' => timestamp
	 *		'sender' => String
	 *		'receiver' => String
	 *		'question' => String
	 *		'messageInformation' => String
	 *		'availableAnswer' => JSON
	 *		'isQuestion' => Boolean
	 *		'eventData' => String
	 *		'ended' => Boolean
	 * )
	 */
	public static function sendEventByType ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		$eventManager = new EventNotificationManager();
		$myEvent = self::createEventFromJson($params);

		$eventManager->sendEventByType($myEvent);
	}


	/**
	 * Send (create) a new event
	 *
	 * @param array $param => array(
	 *		'id' => String
	 *		'answer' => String
	 *		'creationdate' => timestamp
	 *		'sender' => String
	 *		'receiver' => String
	 *		'question' => String
	 *		'messageInformation' => String
	 *		'availableAnswer' => JSON
	 *		'isQuestion' => Boolean
	 *		'eventData' => String
	 *		'ended' => Boolean
	 * )
	 */
	public static function sendCustomEvent ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}	
		
		$eventManager = new EventNotificationManager();
		$myEvent = self::createEventFromJson($params);

		$eventManager->sendCustomEvent($myEvent);
	}
	
	/**
	 * Execute the action providing the response
	 *
	 * @param $param => array(
	 *		'id' => String
	 *		'answer' => String
	 * )
	 */
	public static function handleAnswer ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		if (!isset($params['id']) || !is_int($params['id'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'id\']');
		}
		if (!isset($params['answer']) || !is_string($params['answer'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'string\']');
		}

		$eventManager = new EventNotificationManager();
		$myEvent = $eventManager->getEvent($params['id']);
		$myEvent->setAnswer($params['answer']);

		$eventManager->handleAnswer($myEvent);
	}

	/**
	 * Return all non endend Events for this user
	 * 
	 * @param <Integer> $params => array (
	 *		from: Integer,
	 *		to: Integer
	 *  )
	 * @return array(array(
	 * 		'eventInformation' => (
	 * 			'id' => id,
	 * 			{...other eventInformation attributes...}
	 * 		)
	 * ))
	 */
	public static function getNotEndedEvents ($params) {
		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;
		
		if ($params !== null) {
			if (!isset($params['from']) || !is_int($params['from'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'from\']');
			} else {
				$from = $params['from'];
			}

			if (!isset($params['to']) || !is_int($params['to'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'to\']');
			} else {
				$to = $params['to'];
			}
		}
		
		
		$result = $eventManager->getNotEndedEvents($from, $to);

		return self::toArray($result);
	}

	/**
	 * Return all non endend Events for this user
	 *
	 * @param <Integer> $params => array (
	 *		from: Integer,
	 *		to: Integer
	 *  )
	 * @return array(array(
	 * 		'eventInformation' => (
	 * 			'id' => id,
	 * 			{...other eventInformation attributes...}
	 * 		)
	 * ))
	 */
	public static function retrieveAllQuestionEvents ($params) {
		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;

		if ($params !== null) {
			if (!isset($params['from']) || !is_int($params['from'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'from\']');
			} else {
				$from = $params['from'];
			}

			if (!isset($params['to']) || !is_int($params['to'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'to\']');
			} else {
				$to = $params['to'];
			}
		}


		$result = $eventManager->getAllQuestionEvents($from, $to);

		return self::toArray($result);
	}

	/**
	 * Return all EyeosEventNotification for this user
	 * 
	 * @param <Integer> $params => array (
	 *		from: Integer,
	 *		to: Integer
	 *  )
	 * @return array(array(
	 * 		'eventInformation' => (
	 * 			'id' => id,
	 * 			{...other eventInformation attributes...}
	 * 		)
	 * ))
	 */
	public static function retrieveAllEventNotifications ($params) {
		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;

		if ($params !== null) {
			if (!isset($params['from']) || !is_int($params['from'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'from\']');
			} else {
				$from = $params['from'];
			}

			if (!isset($params['to']) || !is_int($params['to'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'to\']');
			} else {
				$to = $params['to'];
			}
		}
		
		$events = $eventManager->getAllEvents($from, $to);
//		print_r($events);
//		exit;
		return self::toArray($events);
	}
	
	/**
	 * Return all EyeosEventNotification for this user by type
	 *
	 * @param <Integer> $params => array (
	 *		from: Integer,
	 *		to: Integer,
	 *		type: String
	 *  )
	 * @return array(array(
	 * 		'eventInformation' => (
	 * 			'id' => id,
	 * 			{...other eventInformation attributes...}
	 * 		)
	 * ))
	 */
	public static function retrieveAllEventsByType ($params) {
		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;

		if ($params !== null) {
			if (isset($params['from']) && is_int($params['from'])) {
				$from = $params['from'];
			}

			if (isset($params['to']) && is_int($params['to'])) {
				$to = $params['to'];
			}

			if (!isset($params['type']) || !is_string($params['type'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'type\']');
			} else {
				$type = $params['type'];
			}
			
		} else {
			throw new EyeInvalidArgumentException('Missing $params');
		}

		$events = $eventManager->getAllEventsByType($type, $from, $to);

		return self::toArray($events);
	}

	/**
	 * Return all EyeosEventNotification for this user by date
	 *
	 * @param <Integer> $params => array (
	 *		from: Integer,
	 *		to: Integer,
	 *		numberDays: String
	 *  )
	 * @return array(array(
	 * 		'eventInformation' => (
	 * 			'id' => id,
	 * 			{...other eventInformation attributes...}
	 * 		)
	 * ))
	 */
	public static function retrieveAllEventsByDate ($params) {
		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;

		if ($params !== null) {
			if (isset($params['from']) && is_int($params['from'])) {
				$from = $params['from'];
			}

			if (isset($params['to']) && is_int($params['to'])) {
				$to = $params['to'];
			}

			if (!isset($params['numberDays']) || !is_int($params['numberDays'])) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'string\']');
			} else {
				$numberDays = $params['numberDays'];
			}

		} else {
			throw new EyeInvalidArgumentException('Missing $params');
		}

		$events = $eventManager->getAllEventsByDate($numberDays, $from, $to);

		return self::toArray($events);
	}

	/**
	 * Return all EyeosEventNotification for this user by receiver
	 *
	 * @param <Integer> $params => array (
	 *		from: Integer,
	 *		to: Integer,
	 *		sender: String	[me, other]
	 *  )
	 * @return array(array(
	 * 		'eventInformation' => (
	 * 			'id' => id,
	 * 			{...other eventInformation attributes...}
	 * 		)
	 * ))
	 */
	public static function retrieveAllEventsBySender ($params) {
		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;

		if ($params !== null) {
			if (isset($params['from']) && is_int($params['from'])) {
				$from = $params['from'];
			}

			if (isset($params['to']) && is_int($params['to'])) {
				$to = $params['to'];
			}

			if (!isset($params['sender']) || !is_string($params['sender']) || !in_array($params['sender'], array('me', 'other'))) {
				throw new EyeInvalidArgumentException('Invalid or Missing $params[\'sender\']');
			} else {
				$sender = $params['sender'];
			}

		} else {
			throw new EyeInvalidArgumentException('Missing $params');
		}

		$events = $eventManager->getAllEventsBySender($sender, $from, $to);

		return self::toArray($events);
	}
	
	/**
	 * Performs a PHP variable => JSON-compatible array conversion with objects of class EyeosEventNotification
	 * and array of EyeosEventNotification.
	 *
	 * @param public function getAttributesMap() $value
	 * @return array
	 */
	private static function toArray($value) {
		if ($value instanceof EyeosEventNotification) {
			$result = $value->getAttributesMap();
			$result = $result['eventInformation'];

			if ($result['isQuestion'] !== null) {
				if ($result['isQuestion']) {
					$result['isQuestion'] = true;
				} else {
					$result['isQuestion'] = false;
				}
			} 

			if ($result['hasEnded'] !== null) {
				if ($result['hasEnded']) {
					$result['hasEnded'] = true;
				} else {
					$result['hasEnded'] = false;
				}
			}

			return $result;
		}
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('Invalid $value must be an EyeosEventNotification or an array of EyeosEventNotification');
		}

		foreach($value as &$v) {
			$v = self::toArray($v);
		}
		//sort($value);
		return $value;
	}

	/**
	 * Return an instance of an EyeosEventNotification
	 *
	 * @param array $param => array(
	 *		'id' => String
	 *		'answer' => String
	 *		'creationdate' => timestamp
	 *		'sender' => String
	 *		'receiver' => String
	 *		'question' => String
	 *		'messageInformation' => String
	 *		'availableAnswer' => JSON
	 *		'isQuestion' => Boolean
	 *		'eventData' => String
	 *		'ended' => Boolean
	 * )
	 */
	protected static function createEventFromJson ($params) {
		if ($params !== null && !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		$event = new EyeosEventNotification();
		$event->getEventInformation()->setAll($params['eventInformation']);
		return $event;
	}

	/**
	 * Delete Events from the Framework
	 *
	 * @param array $param => array(
	 *		'id' => String or Array
	 *  )
	 */
	 public static function deleteEvents ($params) {
		if (($params === null) || !isset($params['id'])
				|| ( !is_int($params['id']) && !is_array($params['id']))){
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		//TODO: Delete the event from the database
		$eventManager = new EventNotificationManager();
		$eventManager->deleteEvents($params['id']);
	}
	

 }

?>
