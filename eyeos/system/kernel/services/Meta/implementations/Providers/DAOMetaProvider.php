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
 * @subpackage Meta
 */
class DAOMetaProvider implements ISearchableMetaDataProvider {
	const PARAM_TABLENAME = 'tableName';

	const METADATA_FIELD_ID = 'object_id';
	const METADATA_FIELD_KEY = 'name';
	const METADATA_FIELD_DATA = 'data';
	const METADATA_FIELD_CLASS = 'className';

	protected static $connection;

	/**
	 * @var string
	 */
	protected $metaDataClass = 'BasicMetaData';

	/**
	 * @var array
	 */
	protected $params = null;


	/**
	 * Constructs a new instance of DAOMetaProvider using the given $metaDataClass.
	 *
	 * @param string $metaDataClass
	 * @param array $params (PARAM_TABLENAME)
	 */
	public function __construct($metaDataClass, array $params = null) {
		if($metaDataClass) {
			$this->setMetaDataClass($metaDataClass);
		}
		
		$this->setParams($params);
	}

	public function setMetaDataClass($metaDataClass) {
		$metaDataClass = (string) $metaDataClass;

		try {
			$obj = new $metaDataClass;
			if (!$obj instanceof IMetaData) {
				throw new EyeInvalidArgumentException('Wrong argument $metaDataClass: must be the name of a class implementing IMetaData.', 0, $e);
			}

			$this->metaDataClass = $metaDataClass;
		} catch (Exception $e) {
			throw new EyeInvalidArgumentException('Wrong argument $metaDataClass: must be the name of a class implementing IMetaData.', 0, $e);
		}
	}

	public function setParams($params) {
		if (!isset($params[self::PARAM_TABLENAME]) || !is_string($params[self::PARAM_TABLENAME])) {
			throw new EyeMissingArgumentException('Missing or invalid table name argument: $params[' . self::PARAM_TABLENAME . '].');
		}
		
		$this->params = $params;
	}

	private function destroyConnection() {
		if (self::$connection) {
			unset(self::$connection);
		}
	}

	protected function getConnection() {
		if (! isset(self::$connection)) {
			$dbHandler = null;
			try {
				$dbHandler = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
				$dbHandler->send('CREATE TABLE IF NOT EXISTS ' . $this->params[self::PARAM_TABLENAME] . ' ('
						. 'id INT NOT NULL AUTO_INCREMENT, '
						. self::METADATA_FIELD_CLASS . ' VARCHAR(128) NOT NULL, '
						. self::METADATA_FIELD_ID . ' VARCHAR(128) NOT NULL, '
						. self::METADATA_FIELD_KEY . ' TEXT NOT NULL, '
						. self::METADATA_FIELD_DATA . ' TEXT NOT NULL, '
						. 'PRIMARY KEY (id) ) '
				);

				self::$connection = $dbHandler;
			} catch (Exception $e) {
				throw new EyeDBException('An error occured while getting connection to the database.', 0, $e);
			}
		}
		
		return self::$connection;
	}

	/**
	 * TODO
	 *
	 * @param string $id The identifier used to find the right data to read.
	 * @param array $params Additional params implementation-dependant.
	 * @return IMetaData
	 */
	public function retrieveMeta($id, $params = null) {
		$metaData = null;

		try {
			$dbHandler = $this->getConnection();

			$sqlQuery = 'SELECT name, data FROM ' . $this->params[self::PARAM_TABLENAME] . ' WHERE '
					. self::METADATA_FIELD_ID . ' = :' . self::METADATA_FIELD_ID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt = $dbHandler->execute($stmt, array(self::METADATA_FIELD_ID => $id));
			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);

			if ($result === false) {
				return null;
			}

			$metaDataClass = $this->metaDataClass;
			$metaData = new $metaDataClass();

			foreach($result as $value) {
				try {
					$metaData->set($value[self::METADATA_FIELD_KEY], unserialize($value[self::METADATA_FIELD_DATA]));
				} catch (Exception $e) {

				}
			}

		} catch (Exception $e) {
			throw new EyeDBException('An error occured while trying to retrieve metadata from database.', 0, $e);
		}

		return $metaData;
	}

	/**
	 * TODO
	 *
	 * @param string $id The identifier used to be able to retrieve data to be written afterwards.
	 * @param IMetaData The metadata to be written.
	 * @param array $params Additional params implementation-dependant.
	 */
	public function storeMeta($id, IMetaData $metaData, $params = null) {
		try {
			$dbHandler = $this->getConnection();

			// checking for the existence of some oldest entries...
			$sqlQuery = 'SELECT COUNT(*) AS id_exists FROM ' . $this->params[self::PARAM_TABLENAME] . ' WHERE '
					. self::METADATA_FIELD_ID . ' = :' . self::METADATA_FIELD_ID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt = $dbHandler->execute($stmt, array(self::METADATA_FIELD_ID => $id));
			$result = current($stmt->fetchAll());

			// if they exists, we delete them...
			if ($result['id_exists'] > 0) {
				$this->deleteMeta($id);
			}

			// now we can insert the new metaData...
			$className = explode('_', $id);
			$className = $className[1];
			
			$sqlQuery = 'INSERT INTO ' . $this->params[self::PARAM_TABLENAME] . ' VALUES ('
					. 'NULL, "' . $className . '", '
					. ':' . self::METADATA_FIELD_ID . ', ';

			foreach($metaData->getAll() as $key => $value) {
				$customQuery = $sqlQuery . ':' . self::METADATA_FIELD_KEY . ', :' . self::METADATA_FIELD_DATA . ')';
				$stmt = $dbHandler->prepare($customQuery);

				$preparedArray = array(
						self::METADATA_FIELD_ID => $id,
						self::METADATA_FIELD_KEY => $key,
						self::METADATA_FIELD_DATA => serialize($value),
				);

				$stmt->execute($preparedArray);
			}
		} catch (Exception $e) {
			throw new EyeDBException('An error occured while trying to store metadata into database.', 0, $e);
		}
	}

	public function deleteMeta($id, $params = null) {
		try {
			$dbHandler = $this->getConnection();

			$sqlQuery = 'DELETE FROM ' . $this->params[self::PARAM_TABLENAME] . ' WHERE '
					. self::METADATA_FIELD_ID . ' = :' . self::METADATA_FIELD_ID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$dbHandler->execute($stmt, array(self::METADATA_FIELD_ID => $id));
		} catch (Exception $e) {
			throw new EyeDBException('An error occured while trying to delete metadata from database.', 0, $e);
		}
	}

	public function searchMeta($id, IMetaData $metaData) {
		try {
			// setting up className...
			$className = explode('_', $id);
			$className = $className[1];

			// retrieving all setted MetaDatas from $metaData object...
			$metaDatas = $metaData->getAll();

			// if just one meta is setted, we search for a single meta in the database...
			if(count($metaDatas) == 1) {
				$result = $this->searchSingleMeta($className, key($metaDatas), current($metaDatas));
			}
			// else, we search for multiples meta in the database...
			else {
				$result = $this->searchMultipleMetas($className, $metaDatas);
			}

			// the search returns empty values, we return null and quit the function...
			if ($result === false) {
				return null;
			}

			// else we prepare the array $return, and we fill it with object's ids.
			$return = array();
			foreach($result as $value) {
				$return[] = $value[self::METADATA_FIELD_ID];
			}
		} catch (Exception $e) {
			throw new EyeDBException('An error occured while trying to retrieve metadata from database.', 0, $e);
		}

		return $return;
	}

	private function searchSingleMeta($className, $key, $value) {
		$dbHandler = $this->getConnection();

		$sqlQuery = 'SELECT object_id FROM ' . $this->params[self::PARAM_TABLENAME] . ' WHERE '
					. self::METADATA_FIELD_CLASS . ' = :' . self::METADATA_FIELD_CLASS . ' AND '
					. self::METADATA_FIELD_KEY . ' = :' . self::METADATA_FIELD_KEY . ' AND '
				. self::METADATA_FIELD_DATA . ' LIKE :' . self::METADATA_FIELD_DATA;

		$stmt = $dbHandler->prepare($sqlQuery);
		$stmt = $dbHandler->execute($stmt, array(self::METADATA_FIELD_CLASS => $className,
							 self::METADATA_FIELD_KEY => $key,
							 self::METADATA_FIELD_DATA => serialize($value)));

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		return $result;
	}

	private function searchMultipleMetas($className, $metaDatas) {
		$dbHandler = $this->getConnection();
		$sqlQuery = 'SELECT DISTINCT m1.' . self::METADATA_FIELD_ID . ' FROM ';

		$followSqlQueryPart = '';
		$lastSqlQueryPart = '';
		$index = 1;
		foreach($metaDatas as $key => $value) {
			$sqlQuery .= $this->params[self::PARAM_TABLENAME] . ' m' . $index . ', ';

			$nextIndex = $index + 1;
			if($nextIndex <= count($metaDatas)) {
				$followSqlQueryPart .= 'm' . $index . '.' . self::METADATA_FIELD_ID . ' = ' . 'm' . $nextIndex . '.' . self::METADATA_FIELD_ID . ' AND ';
			}

			$lastSqlQueryPart .= 'm' . $index . '.' . self::METADATA_FIELD_KEY . ' = :' . $key . ' AND ' . 'm' . $index . '.' . self::METADATA_FIELD_DATA . ' = :' . $key . '_value AND ';
			$index++;
		}

		$sqlQuery = substr($sqlQuery, 0, -2);
		$sqlQuery .= ' WHERE ' . $followSqlQueryPart . substr($lastSqlQueryPart, 0, -5);

		$stmt = $dbHandler->prepare($sqlQuery);
		$bindParam = Array();
		foreach($metaDatas as $key => $value) {
			$bindParam[$key] = $key;
			$bindParam[$key . '_value'] = serialize($value);
		}
		$stmt = $dbHandler->execute($stmt, $bindParam);

		$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
		return $result;
	}
}

?>
