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

class SQLRelationsProvider implements IRelationsProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);

	}

	public function storeRelation(Relation $relation) {
		try {
			$relation->setLastModification(time());
			$this->dao->create($relation);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to store Relation ' . $relation->getId(), 0, $e);
		}
	}

	public function updateRelation(Relation $relation) {
		try {
			$relation->setLastModification(time());
			$this->dao->update($relation);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to update Relation ' . $relation->getId(), 0, $e);
		}
	}

	public function deleteRelation(Relation $relation) {
		try {
			$this->dao->delete($relation);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to delete Relation ' . $relation->getId(), 0, $e);
		}
	}

	public function searchRelation(Relation $relation) {
		try {
			return current($this->dao->search($relation));
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to get search Relation ' . $relation->getId(), 0, $e);
		}
	}

	public function retrieveAllRelationsByUserId(IUser $user) {
		try {
			$transferObject = new Relation();

			$query = 'SELECT * FROM relation WHERE sourceId = :sourceid OR targetId = :targetid';
			$stmt = $this->dao->prepare($query);

			$stmt = $this->dao->execute($stmt, Array(
				'sourceid' => $user->getId(),
				'targetid' => $user->getId()
			));
			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
			$toReturn = array();

			foreach ($result as $entry) {
				$objectClass = get_class($transferObject);
				$row = new $objectClass;

				foreach ($entry as $key => $value) {
					$methodName = 'set' . ucfirst($key);
					$row->$methodName($value);
				}

				$toReturn[] = $row;
			}

			return $toReturn;
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to retrieve all relations', 0, $e);
		}
	}

	public function retrieveLastRelationsByUserId(IUser $user, $limit) {
		try {
			$transferObject = new Relation();

			$query = 'SELECT sourceId, targetId FROM relation WHERE (sourceId = :sourceid OR targetId = :targetid) AND (state != "pending") ORDER BY date DESC LIMIT :limit';
			$stmt = $this->dao->prepare($query);
			$result = $this->dao->execute($stmt, Array(
				'sourceid' => $user->getId(),
				'targetId' => $user->getId(),
				'limit' => $limit
			));

			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
			$toReturn = array();

			foreach ($result as $entry) {
				$toReturn[] = ($user->getId() == $entry['sourceId'])?$entry['targetId']:$entry['sourceId'];
			}

			return $toReturn;
		} catch (Exception $e) {
			throw new EyePeopleException($e->getMessage());
		}

	}
}
?>
