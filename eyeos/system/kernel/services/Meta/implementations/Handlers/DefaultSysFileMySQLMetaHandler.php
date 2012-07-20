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
class DefaultSysFileMySQLMetaHandler implements IMetaDataHandler {
	protected static $Instance;
	
	
	protected function __construct() {}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$class = __CLASS__;
			self::$Instance = new $class();
		}
		return self::$Instance;
	}
	
	/**
	 * @param mixed $object
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function deleteMeta($object, $params) {
		if (!$object instanceof EyeSysFile) {
			throw new EyeInvalidArgumentException('$object must be an EyeSysFile.');
		}
		$urlParts = $object->getURLComponents();
		
		$meta = $this->retrieveMeta($object, $params);
		if ($meta !== null) {
			SecurityManager::getInstance()->checkPermission(
				$meta,
				new MetaDataPermission('delete', null, $object)
			);
		}
		
		//{
			// TODO: delete metadata from database
		//}
	}
	
	/**
	 * @param mixed $object
	 * @param String $params
	 * @return IMetaData
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function retrieveMeta($object, $params) {
		if (!$object instanceof EyeSysFile) {
			throw new EyeInvalidArgumentException('$object must be an EyeSysFile.');
		}
		$urlParts = $object->getURLComponents();
		
		//{
			$meta = null;
			// TODO: attempt to load metadata from database if it exists
		//}
		
		//if no metadata has been found, create a default one
		if ($meta === null) {
			$meta = MetaManager::getInstance()->getNewMetaDataInstance($object);
			$meta->setAll(array(
				EyeosAbstractVirtualFile::METADATA_KEY_GROUP => 'root',
				EyeosAbstractVirtualFile::METADATA_KEY_OWNER => 'root',
				EyeosAbstractVirtualFile::METADATA_KEY_PERMISSIONS => '-rwxr--r--'
			));
		}
		
		SecurityManager::getInstance()->checkPermission(
			$meta,
			new MetaDataPermission('read', null, $object)
		);
		
		return $meta;
	}
	
	/**
	 * @param mixed $object
	 * @param IMetaData $metaData
	 * @param String $params
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function storeMeta($object, IMetaData $metaData = null, $params) {
		if (!$object instanceof EyeSysFile) {
			throw new EyeInvalidArgumentException('$object must be an EyeSysFile.');
		}
		$urlParts = $object->getURLComponents();
		
		$meta = $this->retrieveMeta($object, $params);
		SecurityManager::getInstance()->checkPermission(
			$metaData,
			new MetaDataPermission('write', $meta, $object)
		);
		
		//{
			// TODO: store metadata into database
		//}
	}
	
	/**
	 * @param mixed $object
	 * @param mixed $changes
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 */
	public function updateMeta($object, $changes, $params) {
		if (!$object instanceof EyeSysFile) {
			throw new EyeInvalidArgumentException('$object must be an EyeSysFile.');
		}
		$urlParts = $object->getURLComponents();
		
		//file has been renamed
		if (isset($changes['oldName'])) {
			//{
			// TODO: update metadata
			//}
		}
	}
}

?>
