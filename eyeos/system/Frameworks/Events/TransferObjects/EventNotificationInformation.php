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

class EventNotificationInformation implements ISimpleMapObject {
	protected $answer;
	protected $creationDate;
	protected $sender;
	protected $receiver;
	protected $type;
	protected $question;
	protected $messageInformation;
	protected $availableAnswers;
	protected $isQuestion = false;
	protected $eventData;
	protected $hasEnded;
	protected $id;
	
	/**
	 * Set all properties
	 *
	 * @param array $param => array {
	 *		'id' => String
	 *		'answer' => String
	 *		'creationDate' => timestamp
	 *		'type' => String
	 *		'sender' => String
	 *		'receiver' => String
	 *		'question' => String
	 *		'messageInformation' => String
	 *		'availableAnswer' => JSON
	 *		'isQuestion' => Boolean
	 *		'eventData' => String
	 *		'hasEnded' => Boolean
	 *	}
	 */
	public function setAll ($params) {
		if (isset($params['id'])) {
			$this->setId($params['id']);
		}

		if (isset($params['answer'])) {
			$this->setAnswer($params['answer']);
		}

		if (isset($params['creationDate'])) {
			$this->setCreationDate($params['creationDate']);
		}

		if (isset($params['sender'])) {
			$this->setSender($params['sender']);
		}

		if (isset($params['type'])) {
			$this->setType($params['type']);
		}

		if (isset($params['receiver'])) {
			$this->setReceiver($params['receiver']);
		}

		if (isset($params['question'])) {
			$this->setQuestion($params['question']);
		}

		if (isset($params['messageInformation'])) {
			$this->setMessageInformation($params['messageInformation']);
		}

		if (isset($params['availableAnswers'])) {
			$this->setAvailableAnswers($params['availableAnswers']);
		}

		if (isset($params['isQuestion'])) {
			$this->setIsQuestion($params['isQuestion']);
		}

		if (isset($params['eventData'])) {
			$this->setEventData($params['eventData']);
		}

		if (isset($params['hasEnded'])) {
			$this->setHasEnded($params['hasEnded']);
		}
	}

	public function getAttributesMap(){
		return get_object_vars($this);
	}
	
	public function getAnswer() {
		return $this->answer;
	}

	public function setAnswer($answer) {
		$this->answer = $answer;
	}

	public function getCreationDate() {
		return $this->creationDate;
	}

	public function setCreationDate($date) {
		$this->creationDate = $date;
	}

	public function getSender() {
		return $this->sender;
	}

	public function setSender($sender) {
		$this->sender = $sender;
	}

	public function getReceiver() {
		return $this->receiver;
	}

	public function setReceiver($receiver) {
		$this->receiver = $receiver;
	}

	public function getType() {
		return $this->type;
	}

	public function setType($type) {
		$this->type = $type;
	}

	public function getQuestion() {
		return $this->question;
	}

	public function setQuestion($question) {
		$this->question = $question;
	}

	public function getMessageInformation() {
		return $this->messageInformation;
	}

	public function setMessageInformation($messageInformation) {
		$this->messageInformation = $messageInformation;
	}

	public function getAvailableAnswers() {
		return $this->availableAnswers;
	}

	public function setAvailableAnswers($availableAnswers) {
		$this->availableAnswers = $availableAnswers;
	}

	public function getIsQuestion() {
		return $this->isQuestion;
	}

	public function setIsQuestion($isQuestion) {
		$this->isQuestion = $isQuestion ? true : false;
	}

	public function getEventData() {
		return $this->eventData;
	}

	public function setEventData($eventData) {
		$this->eventData = $eventData;
	}

	public function getHasEnded() {
		return $this->hasEnded;
	}

	public function setHasEnded($hasEnded) {
		$this->hasEnded = $hasEnded ? true : false;
	}

	public function getId() {
		return $this->id;
	}

	public function setId($id) {
		$this->id = $id;
	}


}
?>
