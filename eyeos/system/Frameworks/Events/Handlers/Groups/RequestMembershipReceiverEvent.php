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
 * An user requested to enter to a Group, this is the message
 * sent to the owner
 *
 * Properties to set: $event: array (
 *		'type' => 'Groups_RequestMembershipReceiver'
 *		'receiver' => userId
 *		'eventData' => array (
 *			'groupId' => String the id of the group
 *			'userId' => String the id of the user in pending status
 *		)
 * )
 */

class RequestMembershipReceiverEvent implements IQuestionEventHandler{

	/**
	 * Fill the properties of the event
	 *
	 * @param <AbstractEventNotification> $event
	 */
	public function autoFill (AbstractEventNotification $event) {
		if ($event->getEventData() === null) {
			throw new EyeInvalidArgumentException('Missing or invalid eventData property');
		}
		$eventData = $event->getEventData();
		
		if (!isset($eventData['userId']) || (!is_string($eventData['userId']))) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'userId\'] property.');
		}
		$userId = $eventData['userId'];

		if (!isset($eventData['groupId']) || (!is_string($eventData['groupId']))) {
			throw new EyeInvalidArgumentException('Missing or invalid $eventData[\'groupId\'] property.');
		}
		$workGroupId = $eventData['groupId'];
		
		$userName = GroupsEventHandler::retrieveContactName($userId);
		$wGroupName = GroupsEventHandler::retrieveWorkgroupName($workGroupId);
		
		$event->setMessageInformation(array('User %s wants to join %s.', array($userName, $wGroupName)));
		$event->setIsQuestion(true);
		$event->setQuestion('Do you want to confirm?');
		$event->setAvailableAnswers('Confirm#Cancel');
	}

	/**
	 * Handle the answer provided by the user and execute the relative action
	 *
	 * @param AbstractEventNotification $event
	 */
	public function handleAnswer(AbstractEventNotification $event) {
		if (($event->getAnswer() === null) || !is_string($event->getAnswer())) {
			throw new EyeInvalidArgumentException('Missing or invalid answer property');
		}
		
        switch ($event->getAnswer()) {
            case 'Confirm':
                try {
                    $eventData = $event->getEventData();
                    $assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
                    $assignation->setUserId($eventData['userId']);
                    $assignation->setWorkgroupId($eventData['groupId']);
                    $assignation->setRole(WorkgroupConstants::ROLE_VIEWER);
                    $assignation->setStatus(WorkgroupConstants::STATUS_MEMBER);

                    UMManager::getInstance()->updateUserWorkgroupAssignation($assignation);
                } catch (Exception $e) {
                    //FIXME Need real control of error
                }
                break;
            case 'Cancel':
                try {
                    $eventData = $event->getEventData();
                    $assignation = UMManager::getInstance()->getNewUserWorkgroupAssignationInstance();
                    $assignation->setUserId($eventData['userId']);
                    $assignation->setWorkgroupId($eventData['groupId']);

                    UMManager::getInstance()->unregisterUserWorkgroupAssignation($assignation);
                } catch (Exception $e) {
                    //FIXME Need real control of error
                }
                break;
            default:
                throw new EyeInvalidArgumentException('The answer to this events is not correct');
        }
	}
}


?>
