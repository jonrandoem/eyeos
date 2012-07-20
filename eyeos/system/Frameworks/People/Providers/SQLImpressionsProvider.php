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


class SQLImpressionsProvider implements IImpressionsProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

	public function storeImpressionTO(ImpressionTO $impressionTO) {
		try {
			$this->dao->create($impressionTO);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to store impressionTO ' . $impressionTO->getId(), 0, $e);
		}
	}
	
	public function deleteImpressionTO(ImpressionTO $impressionTO) {
		try {
			$this->dao->delete($impressionTO);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to delete impressionTO ' . $impressionTO->getId(), 0, $e);
		}
	}

	public function retrieveAllImpressionsTO(ImpressionTO $impressionTO) {
		try {
			$this->dao->readAll($impressionTO);
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to retrieve all ImpressionTO ', 0, $e);
		}
	}

	public function retrieveImpressionTOByTarget($sourceId, $targetId) {
		try {
			$transferObject = new ImpressionTO();

			$query = 'SELECT * FROM impressionto WHERE sourceId = :sourceid AND targetId = :targetid LIMIT 1';
			$stmt = $this->dao->prepare($query);
			$stmt = $this->dao->execute($stmt, Array(
				'sourceid' => $sourceId,
				'targetid' => $targetId
			));

			$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
			$toReturn = null;

			foreach ($result as $entry) {
				$objectClass = get_class($transferObject);
				$row = new $objectClass;

				foreach ($entry as $key => $value) {
					$methodName = 'set' . ucfirst($key);
					$row->$methodName($value);
				}

				$toReturn = $row;
			}

			return $toReturn;
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to retrieve impressionTOByTarget ' . $targetId, 0, $e);
		}
	}
}
?>