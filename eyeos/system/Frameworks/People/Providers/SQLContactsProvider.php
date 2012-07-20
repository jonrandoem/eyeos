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

class SQLContactsProvider {
	private $dao;

	function __construct () {
		$this->dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
	}

	public function searchContacts($text) {
		try {
			$text = str_replace('_', '\_', $text);

			// looking for username in database...
			$sqlQuery = 'SELECT id FROM eyeosuser WHERE name LIKE :text0 AND id != \'eyeID_EyeosUser_register\'';
			
			
			$bindParam = Array(
				'text0' => $text
			);
			$text = explode(' ', $text);
			for($i = 0; $i < count($text); $i++) {
				$sqlQuery = $sqlQuery . ' OR name LIKE :text' . ($i + 1);
				$bindParam['text' . ($i + 1)] = '%' . $text[$i] . '%';
			}

			$sqlQuery .= ' LIMIT 20';

			$stmt = $this->dao->prepare($sqlQuery);
			$stmt = $this->dao->execute($stmt, $bindParam);

			$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			// preparing the array the function will return...
			$return = array();
			foreach($results as $result) {
				$return[] = $result['id'];
			}

			if(count($return) >= 20) {
				return $return;
			}
			
			$userObj = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
			$metaToLookFor = array('eyeos.user.firstname', 'eyeos.user.lastname', 'eyeos.user.email');
			for($i = 0; $i < count($text); $i++) {
				foreach($metaToLookFor as $metaValue) {
					$searchForMetas = new PrincipalMetaData();
					$searchForMetas->set($metaValue, $text[$i]);
					$results = MetaManager::getInstance()->searchMeta($userObj, $searchForMetas);
					$results = array_diff($results, $return);

					if(count($results) > 0) {
						foreach($results as $result) {
							$return[] = $result;
						}
					}
				}
			}

			return $return;
		} catch (Exception $e) {
			throw new EyePeopleException('Unable to search contacts for text ' . $text, 0, $e);
		}
		
	}
}
?>
