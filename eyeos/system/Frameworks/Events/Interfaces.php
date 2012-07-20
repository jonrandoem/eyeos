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

interface IEventNotification {
	public function getSender();
	public function getReceiver();
	public function getCreationDate();
	public function getType();
	public function isQuestion();
	public function getAvailableAnswers();
	public function getQuestion();
	public function getMessageInformation();
	public function setEventData($eventData);
	public function setAnswer($answer);
	//mark the notification as ended, with true or false, a not ended notification can have special
	//user interface to request atention from the user
	public function setHasEnded($ended);
}

interface IEventNotificationAnswer {
	public function getValue();
	//there should be checks at setValue
	public function setValue($value);
}

interface IEventNotificationProvider {
	public function storeEventNotification(AbstractEventNotification $event);
	public function updateEventNotification(AbstractEventNotification $event);
	public function retrieveAllEventNotifications($from, $to);
	public function retrieveEventNotification($id);
	public function deleteEventNotification($id);
	public function retrieveAllEventNotificationsByType($type, $from, $to);
	public function retrieveAllEventNotificationsEnded($from, $to);
	public function retrieveAllEventNotificationsNotEnded($from, $to);
}

interface ISimpleEventHandler {
	public function autoFill(AbstractEventNotification $event);
}

interface IQuestionEventHandler extends ISimpleEventHandler {
	public function handleAnswer(AbstractEventNotification $event);
}
?>