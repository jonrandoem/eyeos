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


class PeopleController implements IObservablePeopleManager {
	private $contactManager = null;
	private $listeners = null;
	private static $Instance = null;

	function __construct() {
		if($this->listeners === null) {
			$this->listeners = new ArrayList();
		}
		
		$this->contactManager = ContactManager::getInstance();
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new PeopleController();
		}

		return self::$Instance;
	}

	public function addPeopleListener(IPeopleListener $listener, $currentRequestOnly = true) {
		if (!$currentRequestOnly) {
			throw new EyeNotImplementedException(__METHOD__ . ' ($currentRequestOnly = false)');
		}

		$this->listeners->append($listener);
	}

	public function fireEvent($type, PeopleEvent $event) {
		foreach($this->listeners as $listener) {
			if (is_callable(array($listener, $type))) {
				try {
					$listener->$type($event);
				} catch (Exception $e) {
					var_dump('Exception while trying to fire ' . $type . ' event on listener ' . get_class($listener) . ': ' . $e->getMessage()); exit;
					//$this->logger->warn('Exception while trying to fire ' . $type . ' event on listener ' . get_class($listener) . ': ' . $e->getMessage());
				}
			}
		}
	}

	public function getAllPeopleListeners() {
		return $this->listeners;
	}

	public function removePeopleListener(IPeopleListener $listener) {
		$this->listeners->remove($listener);
	}

	public function searchContacts($text) {
		try {
			return $this->contactManager->searchContacts($text);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getContact($sourceId, $targetId) {
		try {
			return $this->contactManager->getContact($sourceId, $targetId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllContacts($userId) {
		try {
			return $this->contactManager->getAllContacts($userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllContactsInPending($userId) {
		try {
			return $this->contactManager->getAllContactsInPending($userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function addNewContact($sourceId, $targetId) {
		try {
			$contact = $this->contactManager->addNewContact($sourceId, $targetId);

			$event = new PeopleEvent($contact);
			$this->fireEvent('contactCreated', $event);

			return $contact;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function confirmContact(AbstractEyeosUser $source, AbstractEyeosUser $target) {
		try {
			$this->contactManager->confirmContact($source->getId(), $target->getId());

			$event = new PeopleEvent($source->getId(), $target->getId());
			$this->fireEvent('contactConfirmed', $event);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeContact(Contact $contact) {
		try {
			$event = new PeopleEvent($contact);
			$this->fireEvent('contactBeforeDeletion', $event);
			
			$this->contactManager->removeContact($contact);
			
			$event = new PeopleEvent($contact);
			$this->fireEvent('contactDeleted', $event);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function addTagToContact(PeopleTag $tag, Contact $contact) {
		try {
			$this->contactManager->addTagToContact($tag, $contact);

			$event = new PeopleEvent($tag, $contact);
			$this->fireEvent('tagAddedToContact', $event);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeTagToContact(PeopleTag $tag, Contact $contact) {
		try {
			$event = new PeopleEvent($tag, $contact);
			$this->fireEvent('beforeTagDeletionToContact', $event);

			$this->contactManager->removeTagToContact($tag, $contact);

			$event = new PeopleEvent($tag, $contact);
			$this->fireEvent('tagDeletedToContact', $event);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function createTag($name, $userId) {
		try {
			$tag = $this->contactManager->createTag($name, $userId);

			$event = new PeopleEvent($name);
			$this->fireEvent('tagCreated', $event);

			return $tag;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function editTag(PeopleTag $tag) {
		try {
			$this->contactManager->editTag($tag);

			$event = new PeopleEvent($tag);
			$this->fireEvent('tagModified', $event);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeTag(PeopleTag $tag) {
		try {
			$event = new PeopleEvent($tag);
			$this->fireEvent('beforeTagDeletion', $event);

			$this->contactManager->removeTag($tag);

			$event = new PeopleEvent($tag);
			$this->fireEvent('tagRemoved', $event);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllTags($userId) {
		try {
			return $this->contactManager->getAllTags($userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getTagName($tagId) {
		try {
			return $this->contactManager->getTagName($tagId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}
}
?>