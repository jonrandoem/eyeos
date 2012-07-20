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
 * @package kernel-services
 * @subpackage Sharing
 */
class DefaultMySQLShareInfoProvider implements IShareInfoProvider {	
	const SHAREINFO_TABLE_NAME = 'shareinfo';
	const SHAREINFO_KEY_ID = 'id';
	
	private static $Connection = null;
	
	private static $Instance = null;
	
	protected function __construct() {}
	
	private function autoCreateShareableObjectTable(PDO $dbHandler, $tableName, array $shareableObjectData) {
		try {
			if ($tableName === null || $tableName == '') {
				throw new EyeInvalidArgumentException('$tableName must be a non-empty string.');
			}
			
			$sqlQuery = 'CREATE TABLE IF NOT EXISTS ' . $tableName . ' ('. SharingManager::SHAREINFO_KEY_SHAREABLEID . ' VARCHAR(50) NOT NULL PRIMARY KEY';
			ksort($shareableObjectData);
			foreach($shareableObjectData as $key => $value) {
				if ($key != SharingManager::SHAREINFO_KEY_SHAREABLEID) {
					$sqlQuery .= ', ' . $key . ' TEXT';
				}
			}
			$sqlQuery .= ') ENGINE=InnoDB DEFAULT CHARSET=utf8;';
			$dbHandler->exec($sqlQuery);
		} catch (PDOException $e) {
			throw new EyeDBException('An error occured when attempting to create shareable objects table.', 0, $e);
		}
	}
	
	public function deleteShareInfo(AbstractEyeosPrincipal $owner, array $partialShareInfo) {
		try {
			$dbHandler = $this->getConnection();
			
			if (isset($partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME])) {
				$shareableObjectsTable = $partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME];
			} else {
				$sqlQuery = 'SELECT DISTINCT ' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ' FROM ' . self::SHAREINFO_TABLE_NAME
					. ' WHERE ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
				$stmt = $dbHandler->prepare($sqlQuery);
				$stmt->execute(array(
					SharingManager::SHAREINFO_KEY_SHAREABLEID => $partialShareInfo[SharingManager::SHAREINFO_KEY_SHAREABLEID]
				));
				$shareableObjectsTable = $stmt->fetchAll(PDO::FETCH_ASSOC);
			}
			
			//delete share info data
			$sqlQuery = 'DELETE FROM ' . self::SHAREINFO_TABLE_NAME
				.' WHERE ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID
				. ' AND ' . SharingManager::SHAREINFO_KEY_OWNERID . ' = :' . SharingManager::SHAREINFO_KEY_OWNERID;
			foreach($partialShareInfo as $key => $value) {
				$sqlQuery .= ' AND ' . $key . ' = :' . $key;
			}
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($partialShareInfo);
			
			//retrieve the new number of share info data associated to this shareableId
			$sqlQuery = 'SELECT COUNT(*) AS nbShareInfo FROM ' . self::SHAREINFO_TABLE_NAME
				.' WHERE ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID
				. ' AND ' . SharingManager::SHAREINFO_KEY_OWNERID . ' = :' . SharingManager::SHAREINFO_KEY_OWNERID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute(array(
				SharingManager::SHAREINFO_KEY_SHAREABLEID => $partialShareInfo[SharingManager::SHAREINFO_KEY_SHAREABLEID],
				SharingManager::SHAREINFO_KEY_OWNERID => $partialShareInfo[SharingManager::SHAREINFO_KEY_OWNERID]
			));
			$nbShareInfo = current($stmt->fetchAll(PDO::FETCH_ASSOC));
			$nbShareInfo = $nbShareInfo['nbShareInfo'];
			
			//delete shareableObject data only if no more related shareInfo can be found
			if ($nbShareInfo === '0') {
				//delete shareableObject data
				$sqlQuery = 'DELETE FROM ' . $shareableObjectsTable
					. ' WHERE ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
				$stmt = $dbHandler->prepare($sqlQuery);
				$stmt->execute(array(
					SharingManager::SHAREINFO_KEY_SHAREABLEID => $partialShareInfo[SharingManager::SHAREINFO_KEY_SHAREABLEID]
				));
				$this->destroyConnection();
				return true;
			} else {
				$this->destroyConnection();
				return false;
			}
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while deleting data from base.', 0, $e);
		}
	}
	
	private function destroyConnection() {
		if (self::$Connection instanceof PDO) {
			self::$Connection = null;
		}
	}
	
	private function getConnection() {
        if (!isset(self::$Connection)) {
            $dbHandler = null;
            try {
                $dbHandler = new PDO(SQL_CONNECTIONSTRING, SQL_USERNAME, SQL_PASSWORD);
                $dbHandler->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                $sqlQuery = 'CREATE TABLE IF NOT EXISTS ' . self::SHAREINFO_TABLE_NAME . ' ('
                        . self::SHAREINFO_KEY_ID . ' INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, '
                        . SharingManager::SHAREINFO_KEY_OWNERID . ' VARCHAR(128) NOT NULL, '
                        . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' VARCHAR(128) NOT NULL, '
                        . SharingManager::SHAREINFO_KEY_COLLABORATORID . ' VARCHAR(128) NOT NULL, '
                        . SharingManager::SHAREINFO_KEY_PERMISSIONACTIONS . ' VARCHAR(128) NOT NULL, '
                        . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ' VARCHAR(128) NOT NULL,
					KEY `shareinfo_ibfk_1` (' . SharingManager::SHAREINFO_KEY_COLLABORATORID . '))'
                        . ' ENGINE=InnoDB DEFAULT CHARSET=utf8;
					ALTER TABLE ' . self::SHAREINFO_TABLE_NAME . ' ADD CONSTRAINT `shareinfo_ibfk_1` FOREIGN KEY (' . SharingManager::SHAREINFO_KEY_COLLABORATORID . ') REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;';
                $stmt = $dbHandler->prepare($sqlQuery);

                $stmt->execute(array());
                $stmt->closeCursor();
            } catch (PDOException $e) {
                throw new EyeDBException('An error occured while getting connection to the database.', 0, $e);
            }
            self::$Connection = $dbHandler;
        }
        return self::$Connection;
    }
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
		}
		return self::$Instance;
	}
	
	protected function retrieveShareableObjectsData(PDO $dbHandler, AbstractEyeosPrincipal $owner, array $partialShareInfo) {
		if (!isset($partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME])) {
			throw new EyeNotImplementedException('null $partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME]');
		}
		$shareableObjectsTable = $partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME];
		$partialShareInfo = array(
			SharingManager::SHAREINFO_KEY_SHAREABLEID => $partialShareInfo[SharingManager::SHAREINFO_KEY_SHAREABLEID]
		);
		
		$sqlQuery = 'SELECT * FROM ' . $shareableObjectsTable
			.' WHERE ' .SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
		$stmt = $dbHandler->prepare($sqlQuery);
		$stmt->execute($partialShareInfo);
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		return current($results);
	}
	
	public function retrieveShareInfo(array $partialShareInfo) {
		$results = array();
		try {
			$dbHandler = $this->getConnection();
			
			//shareableObject table is known
			if (isset($partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME])) {
				$shareableObjectsTable = $partialShareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME];
				$sqlQuery = 'SELECT * FROM ' . self::SHAREINFO_TABLE_NAME . ', ' . $shareableObjectsTable
					.' WHERE ' . self::SHAREINFO_TABLE_NAME . '.' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = ' . $shareableObjectsTable . '.' .SharingManager::SHAREINFO_KEY_SHAREABLEID;
				
				foreach($partialShareInfo as $key => $value) {
					if ($key == SharingManager::SHAREINFO_KEY_SHAREABLEID) {
						$sqlQuery .= ' AND ' . self::SHAREINFO_TABLE_NAME . '.' . $key . ' = :' . $key;
					} else {
						$sqlQuery .= ' AND ' . $key . ' = :' . $key;
					}
				}
				$stmt = $dbHandler->prepare($sqlQuery);
				$stmt->closeCursor();
				$stmt->execute($partialShareInfo);
				$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
			}
			//shareableObject table is NOT known (different types of objects may be returned)
			else {
				//create a temporary table holding the filtered share info
				$temporaryTableName = self::SHAREINFO_TABLE_NAME . uniqid();
				$sqlQuery = 'CREATE TEMPORARY TABLE ' . $temporaryTableName . ' AS SELECT * FROM ' . self::SHAREINFO_TABLE_NAME . ' WHERE 1';
				foreach($partialShareInfo as $key => $value) {
					$sqlQuery .= ' AND ' . $key . ' = :' . $key;
				}
				$sqlQuery .= ' ORDER BY ' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ', ' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
				$stmt = $dbHandler->prepare($sqlQuery);
				$stmt->closeCursor();
				$stmt->execute($partialShareInfo);
				
				//retrieve all the handlerClassNames (= names of the shareable objects tables)
				$stmt = $dbHandler->query('SELECT DISTINCT ' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ' FROM ' . self::SHAREINFO_TABLE_NAME);
				$handlersNames = $stmt->fetchAll(PDO::FETCH_ASSOC);
				
				//join the results of the temporary table with all the shareable objects data
				foreach($handlersNames as $handlerName) {
					$handlerName = $handlerName[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME];
					//fetch all shareable object data from current table
					$stmt = $dbHandler->prepare('SELECT * FROM ' . $temporaryTableName . ', ' . $handlerName
						. ' WHERE ' . $temporaryTableName . '.' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = ' . $handlerName . '.' . SharingManager::SHAREINFO_KEY_SHAREABLEID
						. ' ORDER BY ' . $handlerName . '.' . SharingManager::SHAREINFO_KEY_SHAREABLEID);
					$stmt->execute();
					$results = array_merge($results, $stmt->fetchAll(PDO::FETCH_ASSOC));
				}
			}
		} catch (PDOException $e) {
			// Table or view does not exist => OK, return an empty result
			if ($e->errorInfo[0] == '42S02') {
				$this->destroyConnection();
				$results = array();
			} else {
				$this->destroyConnection();
				throw new EyeDBException('An error occured while fetching data from base.', 0, $e);
			}
		}
		$this->destroyConnection();
		return $results;
	}
	
	public function storeShareInfo(AbstractEyeosPrincipal $owner, array $shareInfo, array $shareableObjectData) {
		try {
			if ($owner->getId() == $shareInfo[SharingManager::SHAREINFO_KEY_COLLABORATORID]) {
				throw new EyeInvalidArgumentException('The owner cannot be a collaborator at the same time on the same object.');
			}
			
			$dbHandler = $this->getConnection();
			$shareableObjectTable = $shareInfo[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME];
			$this->autoCreateShareableObjectTable($dbHandler, $shareableObjectTable, $shareableObjectData);
			
			//check that the given (ownerId, shareableId, collaboratorId) tuple does not already exist
			$sqlQuery = 'SELECT COUNT(*) AS nbTuples FROM ' . self::SHAREINFO_TABLE_NAME
				.' WHERE ' . SharingManager::SHAREINFO_KEY_OWNERID . ' = :' . SharingManager::SHAREINFO_KEY_OWNERID
				.' AND ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID
				.' AND ' . SharingManager::SHAREINFO_KEY_COLLABORATORID . ' = :' . SharingManager::SHAREINFO_KEY_COLLABORATORID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute(array(
				SharingManager::SHAREINFO_KEY_OWNERID => $shareInfo[SharingManager::SHAREINFO_KEY_OWNERID],
				SharingManager::SHAREINFO_KEY_SHAREABLEID => $shareInfo[SharingManager::SHAREINFO_KEY_SHAREABLEID],
				SharingManager::SHAREINFO_KEY_COLLABORATORID => $shareInfo[SharingManager::SHAREINFO_KEY_COLLABORATORID]
			));
			$results = current($stmt->fetchAll(PDO::FETCH_ASSOC));
			if (((int) $results['nbTuples']) > 0) {
				throw new EyeDBException('Given share info data (ownerId, shareableId, collaboratorId) already exists.');
			}
			
			//store shareable object data
			try {
				$sqlQuery = 'INSERT INTO ' . $shareableObjectTable . ' VALUES (:' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
				ksort($shareableObjectData);
				foreach($shareableObjectData as $key => $value) {
					if ($key != SharingManager::SHAREINFO_KEY_SHAREABLEID) {
						$sqlQuery .= ', :' . $key;
					}
				}
				$sqlQuery .= ')';
				$stmt = $dbHandler->prepare($sqlQuery);
				$stmt->execute($shareableObjectData);
			} catch (PDOException $e) {
				//throw all but "primary key must be unique"
				if ($e->errorInfo[0] != '23000' && $e->errorInfo[1] != 1062) {
					$this->destroyConnection();
					throw $e;
				}
			}
			
			//store share info data
			$sqlQuery = 'INSERT INTO ' . self::SHAREINFO_TABLE_NAME . ' VALUES (NULL,'
				. ' :' . SharingManager::SHAREINFO_KEY_OWNERID . ','
				. ' :' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ','
				. ' :' . SharingManager::SHAREINFO_KEY_COLLABORATORID . ','
				. ' :' . SharingManager::SHAREINFO_KEY_PERMISSIONACTIONS . ','
				. ' :' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ')';
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($shareInfo);
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while attempting to store share info data.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	public function updateShareableObjectsData(AbstractEyeosPrincipal $owner, array $shareableObjectData) {
		try {
			$dbHandler = $this->getConnection();
			
			//retrieve shareable object table
			$sqlQuery = 'SELECT DISTINCT ' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ' FROM ' . self::SHAREINFO_TABLE_NAME
				. ' WHERE ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute(array(SharingManager::SHAREINFO_KEY_SHAREABLEID => $shareableObjectData[SharingManager::SHAREINFO_KEY_SHAREABLEID]));
			$shareableObjectTable = current($stmt->fetchAll());
			if ($shareableObjectTable === false) {
				throw new EyeNoSuchSharedObjectException($shareableObjectData[SharingManager::SHAREINFO_KEY_SHAREABLEID]);
			}
			$shareableObjectTable = $shareableObjectTable[SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME];
			
			//check shareable objects table
			$this->autoCreateShareableObjectTable($dbHandler, $shareableObjectTable, $shareableObjectData);
			
			$sqlQuery = 'UPDATE ' . $shareableObjectTable . ' SET ';
			foreach($shareableObjectData as $key => $value) {
				if ($key != SharingManager::SHAREINFO_KEY_SHAREABLEID) {
					$sqlQuery .= $key . ' = :' . $key;
				}
			}
			$sqlQuery .= ' WHERE ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($shareableObjectData);			
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while attempting to update shareable object data.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	public function updateShareInfo(AbstractEyeosPrincipal $currentOwner, array $partialShareInfo) {
		try {
			$partialShareInfo['old_' . SharingManager::SHAREINFO_KEY_OWNERID] = $currentOwner->getId();
			
			$dbHandler = $this->getConnection($currentOwner->getName());
			
			//this array contains the columns names of which values are not updatable
			$fixedColumns = array(
				SharingManager::SHAREINFO_KEY_SHAREABLEID => '',
				SharingManager::SHAREINFO_KEY_COLLABORATORID => '',
				SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME => '',
			);
			
			//in the following $variableColumns array, only the editable columns are present
			$variableColumns = array_diff_key($partialShareInfo, $fixedColumns);
			$sqlQuery = 'UPDATE ' . self::SHAREINFO_TABLE_NAME . ' SET ';
			$i = 0;
			foreach($variableColumns as $key => $value) {
				if ($key != 'old_' . SharingManager::SHAREINFO_KEY_OWNERID) {
					$sqlQuery .= $key . ' = :' . $key . ', ';
				}
			}
			$sqlQuery = substr($sqlQuery, 0, -2);
			$sqlQuery .= ' WHERE ' . SharingManager::SHAREINFO_KEY_OWNERID . ' = :old_' . SharingManager::SHAREINFO_KEY_OWNERID
				. ' AND ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID
				. ' AND ' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ' = :' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME;
			if (isset($partialShareInfo[SharingManager::SHAREINFO_KEY_COLLABORATORID])) {
				$sqlQuery .= ' AND ' . SharingManager::SHAREINFO_KEY_COLLABORATORID . ' = :' . SharingManager::SHAREINFO_KEY_COLLABORATORID;
			}
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($partialShareInfo);
			
			//in case we updated the owner, reverse the relation owner/collaborator if it exists (the former owner becomes a collaborator)
			if ($currentOwner->getId() != $partialShareInfo[SharingManager::SHAREINFO_KEY_OWNERID]) {
				$partialShareInfo[SharingManager::SHAREINFO_KEY_COLLABORATORID] = $partialShareInfo[SharingManager::SHAREINFO_KEY_OWNERID];
				$sqlQuery = 'UPDATE ' . self::SHAREINFO_TABLE_NAME . ' SET '
					. SharingManager::SHAREINFO_KEY_COLLABORATORID . ' = :old_' . SharingManager::SHAREINFO_KEY_OWNERID;
				$sqlQuery .= ' WHERE ' . SharingManager::SHAREINFO_KEY_OWNERID . ' = :' . SharingManager::SHAREINFO_KEY_OWNERID
					. ' AND ' . SharingManager::SHAREINFO_KEY_SHAREABLEID . ' = :' . SharingManager::SHAREINFO_KEY_SHAREABLEID
					. ' AND ' . SharingManager::SHAREINFO_KEY_COLLABORATORID . ' = :' . SharingManager::SHAREINFO_KEY_COLLABORATORID
					. ' AND ' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME . ' = :' . SharingManager::SHAREINFO_KEY_HANDLERCLASSNAME;
				$stmt = $dbHandler->prepare($sqlQuery);
				$stmt->execute($partialShareInfo);
			}
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while attempting to update share info data.', 0, $e);
		}
		$this->destroyConnection();
	}
}
?>