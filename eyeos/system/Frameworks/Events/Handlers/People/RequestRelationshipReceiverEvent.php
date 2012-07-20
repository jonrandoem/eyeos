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
 * ConfirmContact event
 *
 * Properties to set: $event: array (
 *		'type' => 'People_RequestRelationshipReceiver'
 *		'receiver' => userId
 * )
 *
 * MessageBus Events
 * eyeos_event_confirmContact
 * eyeos_event_deleteContact
 *
 * Events
 * People_CancelRequest sender->sender
 * People_ConfirmContact sender->receiver
 * People_ConfirmContact receiver->sender
 */

class RequestRelationshipReceiverEvent implements IQuestionEventHandler{

	/**
	 * Fill the properties of the event
	 *
	 * @param <AbstractEventNotification> $event
	 */
	public function autoFill (AbstractEventNotification $event) {
		if (($event->getSender() === null) || !is_string($event->getSender())) {
			throw new EyeInvalidArgumentException('Missing or invalid sender property');
		}
		$username = PeopleEventHandler::retrieveContactName($event->getSender());
		$event->setMessageInformation(array('User %s would like to add you to his/her eyeOS Network.', array($username)));
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
		$peopleController = PeopleController::getInstance();
		switch ($event->getAnswer()) {
			case 'Confirm':
				try {
					//Action for add the contact
					$myProcManager = ProcManager::getInstance();
					$currentUser = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser();
					$peopleController = PeopleController::getInstance();
					$peopleController->confirmContact($currentUser, $user = UMManager::getInstance()->getUserById($event->getSender()));

					//Send message to the BUS
					$message = new ClientBusMessage('events', 'confirmContact', $event->getSender());
					ClientMessageBusController::getInstance()->queueMessage($message);
				} catch (Exception $e) {
					//FIXME There should be real control on exception
				}
				break;
			case 'Cancel':
				try {
					//Action for delete the contact
					$contact = $peopleController->getContact($event->getReceiver(), $event->getSender());
					$peopleController->removeContact($contact);

					//Send message to the bus
					$message = new ClientBusMessage('events', 'deleteContact', $event->getSender());
					ClientMessageBusController::getInstance()->queueMessage($message);
				} catch (Exception $e) {
					//FIXME There should be real control on exception
				}
				break;
			default:
				throw new EyeInvalidArgumentException('The answer to this events is not correct');
		}
	}

}


?>
