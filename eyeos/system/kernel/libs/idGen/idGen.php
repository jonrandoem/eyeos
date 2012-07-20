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
 * @package kernel-libs
 * @subpackage idGen
 */
abstract class ObjectIdGenerator {	
	/**
	 * Calculates and assigns an ID to an object.
	 * 
	 * @param object $object
	 * @return string The generated ID.
	 */
	public static final function assignId(EyeObject $object) {
		$id = self::generateId(get_class($object) . '_');
		$object->setId($id);
		return $id;
	}
	
	/**
	 * Generates an eyeos unique ID using given $prefix.
	 * 
	 * @param string $prefix
	 * @return string 
	 */
	public static final function generateId($prefix = '') {
		return 'eyeID_' . $prefix . self::getNextId();
	}
	
	private static final function getNextId() {	
		try {
			$mutex = new MutexCompat();
			
			$mutex->init(LIB_IDGEN_SEMAPHORE_KEY, LIB_IDGEN_CONFIGURATION_PATH . '/idGen.lock');
			$mutex->acquire();
			
			if(file_exists(LIB_IDGEN_CONFIGURATION_PATH . '/idGen.txt')) {
				$id = (string) file_get_contents(LIB_IDGEN_CONFIGURATION_PATH . '/idGen.txt');
				if('' !== $id) {
					$intVal = hexdec($id);
				} else {
					$intVal = 1;
				}
				
			} else {
				$intVal = 1;
			}
			
			
			if ($intVal == PHP_INT_MAX) {
				throw new EyeOverflowException('Cannot generate ID: integer limit reached!');
			}
			$newId = dechex($intVal + 1);
			file_put_contents(LIB_IDGEN_CONFIGURATION_PATH . '/idGen.txt', $newId);
			
			$mutex->release();
			unset($mutex);
			return $newId;
		} catch (Exception $e) {
			$logger = Logger::getLogger('system.libs.idGen');
			$logger->fatal('Unable to generate eyeID');
			$logger->fatal(ExceptionStackUtil::getStackTrace($e, false));
			throw $e;
		}
	}

	
}
?>
