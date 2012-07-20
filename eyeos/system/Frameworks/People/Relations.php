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

class Relation {

	private $id;
	private $sourceId;
	private $targetId;
	private $state;
	private $lastModification;

	public function setId($id) {
		$this->id = $id;
	}

	public function getId() {
		return $this->id;
	}

	public function setSourceId($sourceId) {
		$this->sourceId = $sourceId;
	}

	public function getSourceId() {
		return $this->sourceId;
	}

	public function setTargetId($targetId) {
		$this->targetId = $targetId;
	}

	public function getTargetId() {
		return $this->targetId;
	}

	public function setState($state) {
		$this->state = $state;
	}

	public function getState() {
		return $this->state;
	}

	public function setLastModification($time) {
		$this->lastModification = $time;
	}

	public function getLastModification() {
		return $this->lastModification;
	}
}

class RelationsManager {
	private $provider = null;
	private static $Instance = null;

	function __construct() {
		if($this->provider === null) {
			$this->provider = new SQLRelationsProvider();
		}

		if (!defined('STATE_PENDING')) {
			define('STATE_PENDING', 'pending');
		}
		if (!defined('STATE_ACCEPTED')) {
			define('STATE_ACCEPTED', 'accepted');
		}
	}

	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new RelationsManager();
		}

		return self::$Instance;
	}

	public function createRelation($sourceId, $targetId) {
		try {
			$relations = $this->getAllRelationsByUserId($sourceId);
			$relationToMe = null;

			foreach ($relations as $relation) {
				if ($relation->getSourceId() == $sourceId && $relation->getTargetId() == $targetId) {
					throw new EyePeopleException('The relation already exists between the user ' . $relation->getSourceId() . ' and the user ' . $relation->getTargetId());
				} else if ($relation->getSourceId() == $targetId && $relation->getTargetId() == $sourceId) {
					$relationToMe = $relation;
					throw new EyePeopleException('The relation between the user ' . $relation->getSourceId() . ' and the user ' . $relation->getTargetId() . ' exists, and must be updated');
				}
			}

			$newRelation = new Relation();
			$newRelation->setSourceId($sourceId);
			$newRelation->setTargetId($targetId);
			$newRelation->setState(STATE_PENDING);
			$newRelation->setLastModification(time());

			$this->provider->storeRelation($newRelation);
			return $newRelation;
		} catch (EyePeopleException $e) {
			if($relationToMe) {
				$relationToMe->setState(STATE_ACCEPTED);
				$this->provider->update($relationToMe);
			} else {
				throw new EyePeopleException('Unable to create the Relation ' . $relation->getId());
			}
		}
	}

	public function removeRelation(Relation $relation) {
		try {
			$this->provider->deleteRelation($relation);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to remove the relation from the user ID "' . $relation->getSourceId() . '".', 0, $e);
		}
	}

	public function updateRelation($sourceId, $targetId) {
		try {
			$relations = $this->getAllRelationsByUserId($sourceId);

			foreach ($relations as $relation) {
				if (($relation->getSourceId() == $sourceId && $relation->getTargetId() == $targetId)
						|| ($relation->getSourceId() == $targetId && $relation->getTargetId() == $sourceId)) {
					$relation->setState(STATE_ACCEPTED);
					$this->provider->updateRelation($relation);
					break;
				}
			}
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to update the relation between the user ' . $relation->getSourceId() . ' and the user ' . $relation->getTargetId(), 0, $e);
		}
	}

	public function getRelation($sourceId, $targetId) {
		try {
			$relation = new Relation();
			$relation->setSourceId($sourceId);
			$relation->setTargetId($targetId);
			$newRelation = $this->provider->searchRelation($relation);

			if ($newRelation == null) {
				$relation->setSourceId($targetId);
				$relation->setTargetId($sourceId);
				$newRelation = $this->provider->searchRelation($relation);
			}

			return $newRelation;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to find the relation between the user ' . $relation->getSourceId() . ' and the user ' . $relation->getTargetId(), 0, $e);
		}
	}

	public function getRelationById($id) {
		try {
			$relation = new Relation();
			$relation->setId($id);
			$newRelation = $this->provider->searchRelation($relation);
			return $newRelation;
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to find the relation ' . $relation->getId(), 0, $e);
		}
	}

	public function getAllRelationsByUserId($userId) {
		try {
			$user = new EyeosUser();
			$user->setId($userId);
			
			return $this->provider->retrieveAllRelationsByUserId($user);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to retrieve all the relations from user ID "' . $userId . '".', 0, $e);
		}
	}

	public function getLastRelationsByUserId($userId, $limit) {
		try {
			$user = new EyeosUser();
			$user->setId($userId);

			return $this->provider->retrieveLastRelationsByUserId($user, $limit);
		} catch (EyePeopleException $e) {
			throw new EyePeopleException('Unable to retrieve all the relations from user ID "' . $userId . '".', 0, $e);
		}
	}

}
?>