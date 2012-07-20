<?php
class DefaultMySQLTagProvider implements ITagProvider {
	const TAGS_TABLE_NAME = 'tag';
	const TAGGEDOBJECTS_TABLE_NAME = 'taggedobject';
	const TAGOBJECTASSIGNATIONS_TABLE_NAME = 'tagobjectassignation';
	
	/**
	 * @var Logger
	 */
	private static $Logger = null;
	
	/**
	 * @var PDO
	 */
	private static $Connection = null;
	
	private static $Instance = null;
	
	protected function __construct() {
		self::$Logger = Logger::getLogger('system.frameworks.Tags.DefaultMySQLTagProvider');
	}
	
	public function addAllTags(array $objectData, $handlerClassName, array $tags) {
		try {
			$dbHandler = $this->getConnection();
			
			if ($this->autoInsertTaggableObject($objectData, $handlerClassName)) {
				self::$Logger->debug('New taggable object inserted (ID=' . $objectData[TagManager::KEY_TAGGABLEID] . ', handlerClassName=' . $handlerClassName . ')');
			}
			
			$sqlQuery = 'INSERT INTO ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME . '(' . TagManager::KEY_TAGGABLEID . ', ' . TagManager::KEY_TAGID . ')'
				. ' VALUES (:' . TagManager::KEY_TAGGABLEID . ', :' . TagManager::KEY_TAGID . ')';
			$stmt = $dbHandler->prepare($sqlQuery);
			$data = array(
				TagManager::KEY_TAGGABLEID => $objectData[TagManager::KEY_TAGGABLEID]
			);
			
			foreach ($tags as $tag) {
				$data[TagManager::KEY_TAGID] = $tag->getId();
				$stmt->execute($data);
				
				if ($stmt->rowCount() !== 1) {
					throw new EyeTagException('Incorrect number of rows inserted: ' . $stmt->rowCount() . '. Should be 1.');
				}
			}
		} catch (Exception $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while attempting to add tags to object.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	/**
	 * 
	 * @return boolean TRUE if the object has been inserted, FALSE if it was already present.
	 */
	private function autoInsertTaggableObject(array $objectData, $handlerClassName) {
		if (!is_string($handlerClassName)) {
			throw new EyeInvalidArgumentException('$handlerClassName must be a string.');
		}
		$dbHandler = $this->getConnection();
		
		// Check existence
		$sqlQuery = 'SELECT count(*) AS nbObjects FROM ' . self::TAGGEDOBJECTS_TABLE_NAME
			. ' WHERE ' . TagManager::KEY_TAGGABLEID . ' = :' . TagManager::KEY_TAGGABLEID;
		$stmt = $dbHandler->prepare($sqlQuery);
		$stmt->execute(array(
			TagManager::KEY_TAGGABLEID => $objectData[TagManager::KEY_TAGGABLEID]
		));
		$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
		if ($results[0]['nbObjects'] > 0) {
			return false;
		}
		
		// Object is not in base, insert it
		$objectId = $objectData[TagManager::KEY_TAGGABLEID];
		unset($objectData[TagManager::KEY_TAGGABLEID]);
		$data = array(
			TagManager::KEY_TAGGABLEID => $objectId,
			TagManager::KEY_OBJECTDATA => serialize($objectData),
			TagManager::KEY_HANDLERCLASSNAME => $handlerClassName
		);
		$sqlQuery = 'INSERT INTO ' . self::TAGGEDOBJECTS_TABLE_NAME . ' VALUES ('
			. ' :' . TagManager::KEY_TAGGABLEID . ','
			. ' :' . TagManager::KEY_OBJECTDATA . ','
			. ' :' . TagManager::KEY_HANDLERCLASSNAME . ')';
		$stmt = $dbHandler->prepare($sqlQuery);
		$stmt->execute($data);
		
		return true;
	}
	
	// Principal2Tags
	public function createTag($principalId, ITag $tag) {
		try {
			$dbHandler = $this->getConnection();
			
			$data = array(
				TagManager::KEY_PRINCIPALID => $principalId,
				TagManager::KEY_LABEL => $tag->getLabel(),
				TagManager::KEY_COLOR => $tag->getColor()
			);
			$sqlQuery = 'INSERT INTO ' . self::TAGS_TABLE_NAME
				. ' (' . TagManager::KEY_TAGID . ', '
				. TagManager::KEY_PRINCIPALID . ', '
				. TagManager::KEY_COLOR . ', '
				. TagManager::KEY_LABEL
				. ') VALUES (NULL,'
				. ' :' . TagManager::KEY_PRINCIPALID . ','
				. ' :' . TagManager::KEY_COLOR . ','
				. ' :' . TagManager::KEY_LABEL . ')';
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
			
			$id = $dbHandler->lastInsertId();
			if ($id) {
				$tag->setId($id);
			}
		} catch (PDOException $e) {
			$this->destroyConnection();
			if ($e->errorInfo[0] == '23000' && $e->errorInfo[1] == 1062) {
				throw new EyeTagAlreadyExistsException('Tag "' . $tag . '" already exists.', 0, $e);
			}
			throw new EyeTagException('An error occured while attempting to store tag data into the database.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	public function deleteTag(ITag $tag) {
		try {
			$dbHandler = $this->getConnection();
			
			$data = array(
				TagManager::KEY_TAGID => $tag->getId()
			);
			$sqlQuery = 'DELETE FROM ' . self::TAGS_TABLE_NAME
				. ' WHERE ' . TagManager::KEY_TAGID . ' = :' . TagManager::KEY_TAGID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
			
			if ($stmt->rowCount() === 0) {
				throw new EyeTagException('Unable to delete: no such tag "' . $tag . '" found.');
			}
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while deleting tag "' . $tag . '" from the database.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	private function destroyConnection() {
		if (self::$Connection instanceof PDO) {
			self::$Connection = null;
		}
	}
	
	public function getAllTags($principalId, $objectId = null) {
		// All tags from principal
		if ($objectId === null) {
			$data = array(
				TagManager::KEY_PRINCIPALID => $principalId
			);
			$sqlQuery = 'SELECT ' . TagManager::KEY_TAGID . ', ' . TagManager::KEY_LABEL . ', ' . TagManager::KEY_COLOR
				. ' FROM ' . self::TAGS_TABLE_NAME
				. ' WHERE ' . TagManager::KEY_PRINCIPALID . ' = :' . TagManager::KEY_PRINCIPALID;
		}
		// All tags from principal & object
		else {
			$data = array(
				TagManager::KEY_PRINCIPALID => $principalId,
				TagManager::KEY_TAGGABLEID => $objectId
			);
			$sqlQuery = 'SELECT ' . self::TAGS_TABLE_NAME . '.' . TagManager::KEY_TAGID . ', ' . TagManager::KEY_LABEL . ', ' . TagManager::KEY_COLOR
				. ' FROM ' . self::TAGS_TABLE_NAME . ', ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME
				. ' WHERE ' . TagManager::KEY_PRINCIPALID . ' = :' . TagManager::KEY_PRINCIPALID
				. ' AND ' . TagManager::KEY_TAGGABLEID . ' = :' . TagManager::KEY_TAGGABLEID
				. ' AND ' . self::TAGS_TABLE_NAME . '.' . TagManager::KEY_TAGID . ' = ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME . '.' . TagManager::KEY_TAGID;
		}
		
		try {
			$dbHandler = $this->getConnection();
			
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
			$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			$return = array();
			foreach($results as $result) {
				$tag = new BasicTag($result[TagManager::KEY_LABEL], $result[TagManager::KEY_COLOR]);
				$tag->setId($result[TagManager::KEY_TAGID]);
				$return[] = $tag;
			}
			return $return;
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while retrieving tags from the database.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	private function getConnection() {
		if (! isset(self::$Connection)) {
			$dbHandler = null;
			try {
				$dbHandler = new PDO(SQL_CONNECTIONSTRING, SQL_USERNAME, SQL_PASSWORD);
				$dbHandler->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			} catch (PDOException $e) {
				throw new EyeTagException('An error occured while getting connection to the database.', 0, $e);
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
	
	public function getTag($principalId, ITag $tag) {
		$sqlQuery = 'SELECT ' . TagManager::KEY_TAGID . ', ' . TagManager::KEY_LABEL . ', ' . TagManager::KEY_COLOR
			. ' FROM ' . self::TAGS_TABLE_NAME
			. ' WHERE ' . TagManager::KEY_PRINCIPALID . ' = :' . TagManager::KEY_PRINCIPALID
			. ' AND ' . TagManager::KEY_LABEL . ' = :' . TagManager::KEY_LABEL;
		
		$data = array(
			TagManager::KEY_PRINCIPALID => $principalId,
			TagManager::KEY_LABEL => $tag->getLabel(),
		);
		
		try {
			$dbHandler = $this->getConnection();
			
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
			$result = current($result);
			if ($result === false) {
				throw new EyeNoSuchTagException('Unknown tag "' . $tag . '".');
			}
			$tag->setId($result[TagManager::KEY_TAGID]);
			$tag->setColor($result[TagManager::KEY_COLOR]);
			
			return $tag;
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while retrieving tag "' . $tag . '" from the database.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	public function removeAllTags(array $objectData, array $tags) {
		try {
			$dbHandler = $this->getConnection();
			
			$sqlQuery = 'DELETE FROM ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME
				. ' WHERE ' . TagManager::KEY_TAGGABLEID . ' = :' . TagManager::KEY_TAGGABLEID
				. ' AND ' . TagManager::KEY_TAGID . ' = :' . TagManager::KEY_TAGID;
			$data = array(
				TagManager::KEY_TAGGABLEID => $objectData[TagManager::KEY_TAGGABLEID]
			);
			$stmt = $dbHandler->prepare($sqlQuery);
			
			foreach($tags as $tag) {
				$data[TagManager::KEY_TAGID] = $tag->getId();
				$stmt->execute($data);
			}
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while removing tags from the database.', 0, $e);
		}
		$this->destroyConnection();
	}
	
	/**
	 * 
	 * @param string $string
	 * @param array $principalIds
	 * @return array(objectData)
	 */
	public function search($string, array $principalIds = null) {
		try {
			$dbHandler = $this->getConnection();
			
			$sqlQuery = 'SELECT ' . TagManager::KEY_OBJECTDATA . ', ' . TagManager::KEY_HANDLERCLASSNAME . ', ' . self::TAGGEDOBJECTS_TABLE_NAME . '.' . TagManager::KEY_TAGGABLEID
				. ' FROM ' . self::TAGS_TABLE_NAME . ', ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME . ', ' . self::TAGGEDOBJECTS_TABLE_NAME
				. ' WHERE ' . TagManager::KEY_LABEL . ' LIKE :queryString'
				. ' AND ' . self::TAGS_TABLE_NAME . '.' . TagManager::KEY_TAGID . ' = ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME . '.' . TagManager::KEY_TAGID
				. ' AND ' . self::TAGGEDOBJECTS_TABLE_NAME . '.' . TagManager::KEY_TAGGABLEID . ' = ' . self::TAGOBJECTASSIGNATIONS_TABLE_NAME . '.' . TagManager::KEY_TAGGABLEID;
			
			$data = array(
				'queryString' => $string
			);
			if ($principalIds !== null) {
				$sqlQuery .= ' AND ' . TagManager::KEY_PRINCIPALID . ' IN (';
				for($i = 0; $i < count($principalIds); $i++) {
					$sqlQuery .= ':' . $i;
				}
				$sqlQuery .= ')';
				$data = array_merge($data, $principalIds);
			}
		
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
			$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			return $results;
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while searching tagged objects from the database (query string = "' . $string . '").', 0, $e);
		}
		$this->destroyConnection();
	}
	
	public function updateTag(ITag $tag, ITag $newTag) {
		try {
			$dbHandler = $this->getConnection();
			
			$sqlQuery = 'UPDATE ' . self::TAGS_TABLE_NAME
				. ' SET ' . TagManager::KEY_LABEL . ' = :new' . TagManager::KEY_LABEL . ', '
				. TagManager::KEY_COLOR . ' = :new' . TagManager::KEY_COLOR
				. ' WHERE ' . TagManager::KEY_TAGID . ' = :' . TagManager::KEY_TAGID;
			$data = array(
				TagManager::KEY_TAGID => $tag->getId(),
				'new' . TagManager::KEY_LABEL => $newTag->getLabel(),
				'new' . TagManager::KEY_COLOR => $newTag->getColor(),
			);
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
			
			if ($stmt->rowCount() === 0) {
				throw new EyeTagException('Unable to perform update: no such tag "' . $tag . '" found.');
			}
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeTagException('An error occured while updating tag "' . $tag . '" from the database.', 0, $e);
		}
		$this->destroyConnection();
	}
}
?>
