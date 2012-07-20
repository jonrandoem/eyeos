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

define('SERVICE_STORAGE_HANDLERS_DIR', 'Handlers');
define('SERVICE_STORAGE_HANDLERS_PATH', SERVICE_STORAGE_PATH . '/' . IMPLEMENTATIONS_DIR . '/' . SERVICE_STORAGE_HANDLERS_DIR);

/**
 * 
 * @package kernel-services
 * @subpackage Storage
 */
final class StorageManager extends Kernel {
	private $handlers = array();
	
	/**
	 * Get the instance for the StorageManager class, managed by the singleton.
	 * 
	 * @return StorageManager
	 */
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}
	
	/**
	 * 
	 * @param string $handlerId The ID of the handler to return (e.g. "SQL/EyeosDAO").
	 * @param IStorageHandler
	 */
	public function getHandler($handlerId, array $params = null) {
		//TODO need a resolution of the ID here (remove leading slashes, ".." occurrences, etc.)
		
		if (!isset($this->handlers[$handlerId])) {
			if (!is_file(SERVICE_STORAGE_HANDLERS_PATH . '/' . $handlerId . '.php')) {
				throw new EyeFileNotFoundException(SERVICE_STORAGE_HANDLERS_PATH . '/' . $handlerId . '.php');
			}
			require SERVICE_STORAGE_HANDLERS_PATH . '/' . $handlerId . '.php';
			$this->handlers[$handlerId] = utf8_basename($handlerId, '.php');
		}
		$className = $this->handlers[$handlerId];
		
		try {
			$obj = new $className($params);
			if ($obj === false) {
				throw new EyeBadMethodCallException('Unable to create instance of class ' . $className);
			}
		} catch(Exception $e) {
			throw new EyeRuntimeException('Unable to create instance of the security manager class ' . $className, 0, $e);
		}
		return $obj;
	}
}
?>