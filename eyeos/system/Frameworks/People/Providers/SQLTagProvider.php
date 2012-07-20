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

class SQLImpressionTagProvider implements IImpressionTagProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

	public function storeTagPerImpressionTO(TagPerImpressionTO $tagPerImpression) {
		try {
			$this->dao->create($tagPerImpression);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to store TagPerImpressionTO ' . $tagPerimpression->getId(), 0, $e);
		}
	}

	public function deleteTagPerImpressionTO(TagPerImpressionTO $tagPerImpressionTO) {
		try {
			$this->dao->delete($tagPerImpressionTO);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to delete TagPerImpressionTO ' . $tagPerImpressionTO->getId(), 0, $e);
		}
	}

	public function retrieveAllTagPerImpressionTO($impressionId) {
		try {
			$transferObject = new TagPerImpressionTO();

			$query = 'SELECT * FROM tagperimpressionto WHERE impressionId = :id';
			$stmt = $this->dao->prepare($query);
			$result = $this->dao->execute($stmt, Array(
				'id' => $impressionId
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
			throw new EyePeopleException('Unable to retrieve All tagPerImpressionTO', 0, $e);
		}
	}
}

class SQLPeopleTagProvider implements IPeopleTagProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

	public function storeTag(PeopleTag $tag) {
		try {
			$this->dao->create($tag);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to store tag ' . $tag->getName(), 0, $e);
		}
	}

	public function deleteTag(PeopleTag $tag) {
		try {
			$this->dao->delete($tag);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to delete tag ' . $tag->getName(), 0, $e);
		}
	}

	public function updateTag(PeopleTag $tag) {
		try {
			$this->dao->update($tag);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to update tag ' . $tag->getId(), 0, $e);
		}
	}

	public function retrieveAllTags($userId) {
		try {
			$transferObject = new PeopleTag();

			$stmt = $this->dao->prepare('SELECT * FROM peopletag WHERE userId = :userid');
			$stmt = $this->dao->execute($stmt, Array(
				'userid' => $userId
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
			throw new EyePeopleException('Unable to retrieve all tags ', 0, $e);
		}
	}

	public function getTagName($tagId) {
		try {
			$tag = new PeopleTag();
			$tag->setId($tagId);
			$this->dao->read($tag, $tagId);
			return $tag->getName();
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to get tag name of tag ' . $tagId, 0, $e);
		}
	}
}
?>