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
class DefaultEyeosWorkgroupXMLMetaHandler implements IMetaDataHandler {
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
		if (!$object instanceof EyeosWorkgroup) {
			throw new EyeInvalidArgumentException('$object must be an EyeosWorkgroup.');
		}
		
		$meta = $this->retrieveMeta($object, $params);
		if ($meta !== null) {
			SecurityManager::getInstance()->checkPermission(
				$meta,
				new MetaDataPermission('delete', null, $object)
			);
		}
		
		return @unlink($this->getWorkgroupSettingsPath($object));
	}
	
	protected function getWorkgroupSettingsPath(EyeosWorkgroup $workgroup) {
		$path = UMManager::getEyeosWorkgroupDirectory($workgroup) . '/' . WORKGROUPS_CONF_DIR . '/' . WORKGROUPS_META_DIR . '/' . WORKGROUPS_META_SETTINGS_FILENAME;
		if (!is_dir(dirname($path))) {
			mkdir(dirname($path), 0777, true);
		}
		return $path;
	}
	
	/**
	 * @param mixed $object
	 * @param String $params
	 * @return IMetaData
	 * @throws EyeException
	 * @throws EyeErrorException
	 */
	public function retrieveMeta($object,  $params) {
		if (!$object instanceof EyeosWorkgroup) {
			throw new EyeInvalidArgumentException('$object must be an EyeosWorkgroup.');
		}
		$filepath = $this->getWorkgroupSettingsPath($object);
		
		$provider = new SimpleXMLMetaProvider((string) $params, array(
			SimpleXMLMetaProvider::PARAM_FILEPATH => $filepath
		));
		$meta = $provider->retrieveMeta(null);
		if ($meta === null) {
			return MetaManager::getInstance()->getNewMetaDataInstance($object);
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
		if (!$object instanceof EyeosWorkgroup) {
			throw new EyeInvalidArgumentException('$object must be an EyeosWorkgroup.');
		}
		
		$meta = $this->retrieveMeta($object, $params);
		SecurityManager::getInstance()->checkPermission(
			$metaData,
			new MetaDataPermission('write', $meta, $object)
		);
		
		$filepath = $this->getWorkgroupSettingsPath($object);
		$dir = dirname($filepath);
		if (!is_dir($dir)) {
			if (!mkdir($dir, 0777, true)) {
				throw new EyeIOException('Unable to create necessary directories for meta file ' . $filepath . '.');
			}
		}
		
		$provider = new SimpleXMLMetaProvider((string) $params, array(
			SimpleXMLMetaProvider::PARAM_FILEPATH => $filepath,
			SimpleXMLMetaProvider::PARAM_FORMATOUTPUT => true
		));
		$provider->storeMeta(null, $metaData);
	}
	
	/**
	 * @param mixed $object
	 * @param mixed $changes
	 * @param String $params
	 * @return boolean
	 * @throws EyeException
	 */
	public function updateMeta($object, $changes, $params) {
		throw new EyeNotImplementedException(__METHOD__);
	}
}
?>
