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
 * A list is assugned to a contact
 *
 * Properties to set: $event: array (
 *		'type' => "People_AssignList"
 *		'eventData' => array (
 *			usersId: array of userIds or just a string with an userId
 *			listId: String	the id of the list assigned
 *		)
 * )
 */

class AssignListEvent implements ISimpleEventHandler {
	/**
	 * Fill the properties of the event
	 *
	 * @param <AbstractEventNotification> $event
	 */
	public function autoFill (AbstractEventNotification $event) {
		if ($event->getEventData() === null) {
			throw new EyeInvalidArgumentException('You must specify the eventData property');
		}
		$eventData = $event->getEventData();
		if (!isset($eventData['usersId']) || !is_string($eventData['usersId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'usersId\']');
		}
		if (!isset($eventData['listId']) || !is_int($eventData['listId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'listId\']');
		}
		
		$userIds = $eventData['usersId'];
		$listName = PeopleEventHandler::getListName($eventData['listId']);
		if (!is_array($userIds)) {
			$username = PeopleEventHandler::retrieveContactName($userIds);
			$event->setMessageInformation(array('User %s was added in %s list.', array($username, $listName)));
		} else {
			$usernames = array();
			foreach ($userIds as $userId) {
				$usernames[] = PeopleEventHandler::retrieveContactName($userId);	
			}

			$usernamesString = implode(', ', $usernames);
			$event->setMessageInformation(array('Users %s were added in %s list.', array($usernamesString, $listName)));
		}
		$event->setIsQuestion(false);
	}
}

?>
