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
 * Users is confirmed in a group
 *
 * Properties to set: $event: array (
 *		'type' => "Groups_BannedUser"
 *		'eventData' => array (
 *			userId: Id of the banned user
 *			groupId: String	the id of the group
 *		)
 * )
 */

class JoinedUserEvent implements ISimpleEventHandler {
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
		if (!isset($eventData['userId']) || (!is_string($eventData['userId']))) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'userId\']');
		}
		if (!isset($eventData['groupId']) || !is_string($eventData['groupId'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'groupId\']');
		}
		$userId = $eventData['userId'];
		$wGroupId = $eventData['groupId'];
		$wGroupName = GroupsEventHandler::retrieveWorkgroupName($wGroupId);

		if ($userId == $event->getReceiver()) {
			$event->setMessageInformation(array('You now are a memberof the group %s.', array($wGroupName)));
		} else {
			$userName = GroupsEventHandler::retrieveContactName($userId);
			$event->setMessageInformation(array('User %s is now member of your group %s.', array($userName, $wGroupName)));
		}
		$event->setIsQuestion(false);
	}
}

?>
