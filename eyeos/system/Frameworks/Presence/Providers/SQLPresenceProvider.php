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

class SQLPresenceProvider implements IPresenceProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

	public function storePresence(Presence $presence) {
		try {
			$this->dao->create($presence);
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to store the Presence', 0, $e);
		}
	}

	public function updatePresence(Presence $presence) {
		try {
			$this->dao->update($presence);
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to update the Presence', 0, $e);
		}
	}


	public function deletePresence(Presence $presence) {
		try {
			$searchPresence = new Presence();
			$searchPresence->setUserId($presence->getUserId());

			$results = $this->dao->search($searchPresence);

			if (isset($results) && is_array($results)  && count($results)) {
				$deletePresence = current($results);
				
				$this->dao->delete($deletePresence);
			}
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to delete the Presence', 0, $e);
		}
	}
	public function retrieveAllPresences() {
		try {
			return $this->dao->readAll(new Presence());
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to retrieve all the presences', 0, $e);
		}
	}


	public function retrievePresence(Presence $presence) {
		try {
			$this->dao->read($presence);
		} catch (Exception $e) {
			throw new EyeDAOException('Unable to retrieve the presence', 0, $e);
		}
	}

	public function retrievePresencesByUsersId($usersId) {
		if (!isset($usersId) || !is_array($usersId)) {
			throw new EyeInvalidArgumentException('Invalid $ids, $ids should be an array', 0, $e);
		}

		$myQuery = 'SELECT * FROM presence WHERE userId IN (';
		for ($i = 0; $i < count($usersId); $i++) {
			if ($i == 0) {
				$myQuery.= '?';
			} else {
				$myQuery.= ', ?';
			}
		}
		$myQuery.= ')';

		$dbh = $this->dao->getConnection();
		$stmt = $dbh->prepare($myQuery);

		for ($i = 0; $i < count($usersId); $i++) {
			$stmt->bindParam(($i+1), $usersId[$i], PDO::PARAM_STR);
		}

		if (!$stmt->execute()) {
			$errorInfo = $stmt->errorInfo();
			throw new EyeDAOException($e->getMessage());
		}

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		$toReturn = array();
		foreach ($result as $entry) {
			$row = new Presence();
			foreach ($entry as $key => $value) {
				$methodName = 'set' . ucfirst($key);
				$row->$methodName($value);
			}
			$toReturn[] = $row;
		}

		return $toReturn;
	}
}

?>