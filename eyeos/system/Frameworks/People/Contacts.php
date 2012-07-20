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

class Contact {
	private $impression;
	private $relation;

	public function setImpression(ImpressionTO $impression) {
		$this->impression = $impression;
	}

	public function getImpression() {
		return $this->impression;
	}

	public function setRelation(Relation $relation) {
		$this->relation = $relation;
	}

	public function getRelation() {
		return $this->relation;
	}
}

class ContactManager {
	private $relationsManager;
	private $impressionsManager;
	private $provider = null;
	private static $Instance = null;

	function __construct() {
		if($this->provider === null) {
			$this->provider = new SQLContactsProvider();
		}

		$this->relationsManager = RelationsManager::getInstance();
		$this->impressionsManager = ImpressionsManager::getInstance();
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new ContactManager();
		}

		return self::$Instance;
	}

	public function searchContacts($text) {
		try {
			return $this->provider->searchContacts($text);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function addNewContact($sourceId, $targetId) {
		try {
			$relation = $this->relationsManager->createRelation($sourceId, $targetId);
			$impressionTO = $this->impressionsManager->createImpression($sourceId, $targetId);
			
			$contact = new Contact();
			$contact->setImpression($impressionTO);
			$contact->setRelation($relation);

			return $contact;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeContact(Contact $contact) {
		try {
			$sourceId = $contact->getRelation()->getSourceId();
			$targetId = $contact->getRelation()->getTargetId();
			$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
			$otherUser = ($sourceId == $currentUserId) ? $targetId : $sourceId;

			if ($contact->getRelation() != null) {
				$this->relationsManager->removeRelation($contact->getRelation());
			}
			if ($contact->getImpression() != null) {
				$this->impressionsManager->removeImpression($contact->getImpression());
			}
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function confirmContact($source, $target) {
		try {
			$this->impressionsManager->createImpression($source, $target);
			$this->relationsManager->updateRelation($source, $target);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getContact($sourceId, $targetId) {
		try {
			$relation = $this->relationsManager->getRelation($sourceId, $targetId);
			if ($relation === false) {
				throw new EyeNoSuchContactException('Source: ' . $sourceId. ', Target: ' . $targetId);
			}

			$impressionTO = $this->impressionsManager->getImpression($sourceId, $targetId);

			$contact = new Contact();
			if ($impressionTO != null) {
				$contact->setImpression($impressionTO);
			}

			$contact->setRelation($relation);
			return $contact;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllContacts($userId) {
		try {
			$contacts = array();
			$relations = $this->relationsManager->getAllRelationsByUserId($userId);

			foreach ($relations as $relation) {
				if ($relation->getState() != 'pending') {
					$contact = new Contact();
					$contact->setRelation($relation);

					if ($relation->getSourceId() == $userId) {
						$otherUserId = $relation->getTargetId();
					} else {
						$otherUserId = $relation->getSourceId();
					}

					$impressionTO = $this->impressionsManager->getImpressionTOByTargetId($userId, $otherUserId);
					$contact->setImpression($impressionTO);
					$contacts[] = $contact;
				}
			}

			return $contacts;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllContactsInPending($userId) {
		try {
			$contacts = array();
			$relations = $this->relationsManager->getAllRelationsByUserId($userId);

			foreach ($relations as $relation) {
				if ($relation->getState() == 'pending') {
					$contact = new Contact();
					$contact->setRelation($relation);
					$contacts[] = $contact;
				}
			}

			return $contacts;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function addTagToContact(PeopleTag $tag, Contact $contact) {
		try {
			$this->impressionsManager->addTagToImpression($tag, $contact->getImpression());
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeTagToContact(PeopleTag $tag, Contact $contact) {
		try {
			$this->impressionsManager->removeTagToImpression($tag, $contact->getImpression());
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function createTag($name, $userId) {
		try {
			return $this->impressionsManager->createTag($name, $userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function editTag(PeopleTag $tag) {
		try {
			$this->impressionsManager->editTag($tag);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function removeTag(PeopleTag $tag) {
		try {
			$this->impressionsManager->removeTag($tag);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getAllTags($userId) {
		try {
			return $this->impressionsManager->getAllTags($userId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}

	public function getTagName($tagId) {
		try {
			return $this->impressionsManager->getTagName($tagId);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException($e->getMessage());
		}
	}
}
?>