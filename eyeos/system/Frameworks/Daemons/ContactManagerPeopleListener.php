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
 *
 * @package kernel-frameworks
 * @subpackage Daemons
 */
class ContactManagerPeopleListener extends AbstractPeopleAdapter {
	private static $Instance = null;

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new ContactManagerPeopleListener();
		}
		return self::$Instance;
	}

	public function contactCreated(PeopleEvent $e) {
		$targetId = $e->getSource()->getRelation()->getTargetId();
		$sourceId = $e->getSource()->getRelation()->getSourceId();

		$NetSyncMessage = new NetSyncMessage('NSPeople', 'requestRelationship', $targetId, $sourceId);
		NetSyncController::getInstance()->send($NetSyncMessage);
	}

	public function contactConfirmed(PeopleEvent $e) {
		$sourceId = $e->getSource();
		$targetId = $e->getRelatedSource();
		
		$NetSyncMessage = new NetSyncMessage('NSPeople', 'confirmContact', $targetId, $sourceId);
		NetSyncController::getInstance()->send($NetSyncMessage);
	}

	public function contactBeforeDeletion(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function contactDeleted(PeopleEvent $e) {
		$sourceId = $e->getSource()->getRelation()->getSourceId();
		$targetId = $e->getSource()->getRelation()->getTargetId();
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$otherUser = ($sourceId == $currentUserId) ? $targetId : $sourceId;

		$NetSyncMessage = new NetSyncMessage('NSPeople', 'deleteContact', $otherUser, $currentUserId);
		NetSyncController::getInstance()->send($NetSyncMessage);
	}

	public function tagAddedToContact(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function beforeTagDeletionToContact(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagDeletedToContact(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagCreated(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagModified(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function beforeTagDeletion(PeopleEvent $e) {
		// nothing to do for the moment....
	}

	public function tagRemoved(PeopleEvent $e) {
		// nothing to do for the moment....
	}
}

// Register singleton listener on the target dispatcher
PeopleController::getInstance()->addPeopleListener(ContactManagerPeopleListener::getInstance());
?>
