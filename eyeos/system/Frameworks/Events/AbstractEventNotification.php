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

abstract class AbstractEventNotification implements IEventNotification, ISimpleMapObject  {
	protected $eventNotificationInformation;
	
	function __construct() {
		$this->eventNotificationInformation = new EventNotificationInformation();
	}

	public function getAttributesMap() {
		$result['eventInformation'] = $this->getEventInformation()->getAttributesMap();
		return $result;
	}

	public function setSender($sender) {
		$this->getEventInformation()->setSender($sender);
	}

	public function getSender() {
		return $this->getEventInformation()->getSender();
	}

	public function getId() {
		return $this->getEventInformation()->getId();
	}

	public function setReceiver($receiver) {
		$this->getEventInformation()->setReceiver($receiver);
	}
	
	public function getReceiver() {
		return $this->getEventInformation()->getReceiver();
	}

	public function setCreationDate ($date) {
		$this->getEventInformation()->setCreationDate($date);
	}

	public function getCreationDate() {
		return $this->getEventInformation()->getCreationDate();
	}

	public function setType($type) {
		$this->getEventInformation()->setType($type);
	}
	
	public function getType() {
		return $this->getEventInformation()->getType();
	}

	public function isQuestion() {
		return $this->getEventInformation()->getIsQuestion();
	}

	public function setIsQuestion ($isQuestion) {
		$this->getEventInformation()->setIsQuestion($isQuestion);
	}
	
	public function getAvailableAnswers() {
		return $this->getEventInformation()->getAvailableAnswers();
	}

	public function setAvailableAnswers($answers) {
		$this->getEventInformation()->setAvailableAnswers($answers);
	}

	public function getQuestion() {
		return $this->getEventInformation()->getQuestion();
	}

	public function getMessageInformation() {
		return $this->getEventInformation()->getMessageInformation();
	}

	public function setQuestion($question) {
		$this->getEventInformation()->setQuestion($question);
	}

	public function setMessageInformation($information) {
                $information = json_encode($information);
		$this->getEventInformation()->setMessageInformation($information);
	}

	public function setEventData($eventData) {
		$this->getEventInformation()->setEventData($eventData);
	}

	public function getEventData() {
		//return $this->getEventInformation()->getEventData();
		return $this->getEventInformation()->getEventData();
	}

	public function setAnswer( $answer) {
		$this->getEventInformation()->setAnswer($answer);
	}

	public function getAnswer() {
		return $this->getEventInformation()->getAnswer();
	}

	public function setHasEnded($ended) {
		$this->getEventInformation()->setHasEnded($ended);
	}

	public function getHasEnded() {
		return $this->getEventInformation()->getHasEnded();
	}

	public function getEventInformation() {
		return $this->eventNotificationInformation;
	}

	public function setEventInformation($info) {
		$this->eventNotificationInformation = $info;
	}
}
?>