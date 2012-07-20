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
 * Users is invited
 *
 * Properties to set: $event: array (
 *		'type' => "Groups_InvitedUsersSender"
 *		'eventData' => array (
 *			usersId: array of userIds or just a string with an userId
 *			groupId: String	the id of the group
 *		)
 * )
 */

class InvitedUsersSenderEvent implements ISimpleEventHandler {
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
		if (!isset($eventData['usersId']) || (!is_string($eventData['usersId']) && !is_int($eventData['usersId']))) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'usersId\']');
		}
		if (!isset($eventData['groupId']) || !is_string($eventData['groupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'groupId\']');
		}
		$userIds = $eventData['usersId'];
		$wGroupId = $eventData['groupId'];
		$wGroupName = GroupsEventHandler::retrieveWorkgroupName($wGroupId);
		if (!is_array($userIds)) {
			$username = GroupsEventHandler::retrieveContactName($userIds);
			$event->setMessageInformation(array('User %s was invited in %s group.', array($username, $wGroupName)));
		} else {
			$usernames = array();
			foreach ($userIds as $userId) {
				$usernames[] = GroupsEventHandler::retrieveContactName($userId);
			}

			$usernamesString = implode(', ', $usernames);
			$event->setMessageInformation(array('Users %s were invited in %s group', array($usernamesString, $wGroupName)));
		}
		$event->setIsQuestion(false);
	}
}

?>
