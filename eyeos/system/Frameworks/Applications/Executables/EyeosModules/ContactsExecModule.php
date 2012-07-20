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
 * ExecModule for contacts management.
 *
 * @package kernel-frameworks
 * @subpackage Application
 */
class ContactsExecModule implements IEyeosExecutableModule {
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}

	/**
	 * Get a contact providing his userId
	 * 
	 * @param <String> $params userId of the contact to retrieve
	 */
	public static function getContactById($params) {
		if (($params === null) || !is_string($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid \$params');
		}
		$userId = $params;
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$peopleController = PeopleController::getInstance();
		$contact = $peopleController->getContact($currentUserId, $userId);

		$lists = array();
		$listsName = array();
		$date = 0;

		$myRelationManager = RelationsManager::getInstance();
		$relation = $contact->getRelation();
		$state = ($relation != null) ? $relation->getState() : null;

		if ($state == 'accepted') {
			$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($contact->getImpression());
			foreach ($tagsPerImpression as $tagPerImpression) {
				$lists[] = $tagPerImpression->getTagId();
				$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
			}
		}

		$date = $contact->getRelation()->getLastModification();

		//retrieve information about the meta
		if ($contact->getRelation()->getSourceId() != $currentUserId) {
			$contactId = $contact->getRelation()->getSourceId();
			$confirmable = true;
		} else {
			$contactId = $contact->getRelation()->getTargetId();
			$confirmable = false;
		}
		
		$myContact = UMManager::getInstance()->getUserById($contactId);
		$metaObject = MetaManager::getInstance()->retrieveMeta($myContact);

		if ($metaObject == null) {
			$meta = array();
		} else {
			$meta = $metaObject->getAll();
		}

        $presenceManager = new PresenceManager();
        $connected = $presenceManager->checkPresenceByUserId($contactId);

		return array(
			'id' => $contactId,
			'nickname' => $myContact->getName(),
			'state' => $state,
			'confirmable' => $confirmable,
			'lists' => $lists,
			'listsName' => $listsName,
			'meta' => $meta,
			'relationDate' => $date,
            'connected' => $connected
		);
	}
	
	/**
	 * Return the contacts in the cache
	 */
	public static function getAllContacts($params) {
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$peopleController = PeopleController::getInstance();
		$contacts = $peopleController->getAllContacts($currentUserId);
		$contacts = array_merge($contacts, $peopleController->getAllContactsInPending($currentUserId));
		$results = array();
		foreach($contacts as $contact) {
			// Retrieve List information
			$lists = array();
			$listsName = array();
			$date = 0;

			$myRelationManager = RelationsManager::getInstance();
			$relation = $contact->getRelation();
			$state = ($relation != null) ? $relation->getState() : null;

			if ($state == 'accepted') {
				$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($contact->getImpression());
				foreach ($tagsPerImpression as $tagPerImpression) {
					$lists[] = $tagPerImpression->getTagId();
					$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
				}
			}

			$date = $contact->getRelation()->getLastModification();
			
			//retrieve information about the meta
			if ($contact->getRelation()->getSourceId() != $currentUserId) {
				$contactId = $contact->getRelation()->getSourceId();
				$confirmable = true;
			} else {
				$contactId = $contact->getRelation()->getTargetId();
				$confirmable = false;
			}
			$myContact = UMManager::getInstance()->getUserById($contactId);
			$metaObject = MetaManager::getInstance()->retrieveMeta($myContact);

			if ($metaObject == null) {
				$meta = array();
			} else {
				$meta = $metaObject->getAll();
			}
			$manager = new CometManager();
            $connected = $manager->isUserConnected($contactId);

			$results[] = array(
					'id' => $contactId,
					'nickname' => $myContact->getName(),
					'state' => $state,
					'confirmable' => $confirmable,
					'lists' => $lists,
					'listsName' => $listsName,
					'meta' => $meta,
					'relationDate' => $date,
                    'connected' => $connected
			);
		}

		return $results;

	}
	
	/**
	 * Confirm a Contact that request our friendship
	 *
	 * @param <String> $params The id of the contact to confirm
	 */
	public static function confirmContact($params) {
		$myProcManager = ProcManager::getInstance();
		$currentUser = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser();

		$user = UMManager::getInstance()->getUserById($params);

		$peopleController = PeopleController::getInstance();
		$peopleController->confirmContact($currentUser, $user);
	}

	/**
	 * Request a Membership of a user
	 *
	 * @param <String> $params The id of the contact to request the relationship
	 */
	public static function requestRelationship($params) {
		$peopleController = PeopleController::getInstance();
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$newContact = $peopleController->addNewContact($currentUserId, $params);

		$contactId = $newContact->getRelation()->getTargetId();

		$lists = array();
		$listsName = array();

		$otherUser = UMManager::getInstance()->getUserById($contactId);
		$metaObject = MetaManager::getInstance()->retrieveMeta($otherUser);

		if ($metaObject == null) {
			$meta = array();
		} else {
			$meta = $metaObject->getAll();
		}

        $presenceManager = new PresenceManager();
        $connected = $presenceManager->checkPresenceByUserId($params);

		$results = array(
				'id' => $params,
				'nickname' => $otherUser->getName(),
				'state' => 'pending',
				'lists' => $lists,
				'listsName' => $listsName,
				'meta' => $meta,
				'relationDate' => $newContact->getRelation()->getLastModification(),
                'connected' => $connected
		);

		return $results;
	}

	/**
	 *
	 * @param <string> $params the Id of the user to delete
	 */
	public static function removeContact($params) {
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$peopleController = PeopleController::getInstance();
		$contactToDelete = $peopleController->getContact($currentUserId, $params);

		$peopleController->removeContact($contactToDelete);
	}
	
	/**
	 * Update all the information of the contact
	 *
	 * @param array $params = (
	 *			'id' => string,			The id of the contact
	 *			'lists' => array		The new list of the tag
	 *			'meta' => map			The new map of metadata
	 * )
	 *
	 * @return array $results = (
	 *				'add' = array(),
	 *				'delete' = array()
	 *			),
	 * )
	 */
	public static function updateContact ($params) {
		return self::syncLists($params['id'], $params['lists']);
	}

	/**
	 * Update the Lists of a Contact whit a new one and return a list of changes
	 *
	 * @param string $contactId The id of the contact involved in the changes
	 * @param array $newLists The array with the new list of the contact
	 *
	 * @return array $results = (
	 *			'add' => array,			The list of the id that was added
	 *			'delete' => array		The list of the id that was removed
	 * )
	 *
	 */
	private static function syncLists ($contactId, $newLists) {
		$myProcManager = ProcManager::getInstance();
		$peopleController = PeopleController::getInstance();

		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$contact = $peopleController->getContact($currentUserId, $contactId);
		
		//Retrive the old list
		$oldLists = array();
		$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($contact->getImpression());
		foreach ($tagsPerImpression as $tagPerImpression) {
			$oldLists[] = $tagPerImpression->getTagId();
		}
		
		//Check if we have to add Tags
		$results = array('add' => array(), 'delete' => array());
		foreach ($newLists as $newTagId) {
			if (!in_array($newTagId, $oldLists)) {
				//Add the tag to the contact
				$tag = new PeopleTag();
				$tag->setId($newTagId);
				$tag->setName($peopleController->getTagName($newTagId));
				$tag->setUserId($currentUserId);
				$peopleController->addTagToContact($tag, $contact);

				//Update the return value
				$results['add'][] = (int)$newTagId;
			}
		}
		
		//Check if we have to delete Tags
		foreach ($oldLists as $oldTagId) {
			if (!in_array($oldTagId, $newLists)) {
				//Add the tag to the contact
				$tag = new PeopleTag();
				$tag->setId($oldTagId);
				$tag->setName($peopleController->getTagName($oldTagId));
				$tag->setUserId($currentUserId);
				$peopleController->removeTagToContact($tag, $contact);

				//Update the return value
				$results['delete'][] = (int)$oldTagId;
			}
		}
		return $results;
	}
}
?>