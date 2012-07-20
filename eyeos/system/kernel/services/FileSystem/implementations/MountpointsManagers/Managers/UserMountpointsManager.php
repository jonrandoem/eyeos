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

define('SERVICE_FILESYSTEM_MOUNTPOINTS_CONF_DIR', 'mnt');
define('SERVICE_FILESYSTEM_MOUNTPOINTS_CONF_FILENAME', 'conf.xml');

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class UserMountpointsManager implements IMountpointsManager {
	private static $Instance = null;
	
	protected function __construct() {}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new UserMountpointsManager();
		}
		return self::$Instance;
	}
	
	/**
	 * @param $path
	 * @return MountpointDescriptor
	 */
	public function getMountpointDescriptor($path) {
		//{
		//	TODO: permission checks here
		//}
		
		return self::getNewProviderInstance($path)->retrieveMountpointDescriptor($path);
	}
	
	/**
	 * @param $path
	 * @return array(MountpointDescriptor)
	 */
	public function getMountpointDescriptorsList($path) {
		//{
		//	TODO: permission checks here
		//}
		
		return self::getNewProviderInstance($path)->retrieveAllMountpointDescriptors($path);
	}
	
	protected static function getNewProviderInstance($mountpointPath) {
		$urlParts = EyeosAbstractVirtualFile::parse_url($mountpointPath);
		$userMountpointConfigPath = self::getUserMountpointsPath($urlParts['principalname']);
		
		$conf = FSI::getConfiguration(EyeosAbstractVirtualFile::URL_SCHEME_USERFILES . '.scheme' . SERVICE_FILESYSTEM_CONFIGURATION_FILE_EXTENSION);
		$providerClassName = (string) $conf->mountpointsManager[0]->provider['class'];
		$params = array(
			'filePath' => $userMountpointConfigPath
		);
		return MountpointsManager::getNewMountpointDescriptorsProviderInstance($providerClassName, $params);
	}
	
	protected static function getUserMountpointsPath($username) {
		$path = UMManager::getEyeosUserDirectory($username) . '/' . USERS_CONF_DIR . '/' . SERVICE_FILESYSTEM_MOUNTPOINTS_CONF_DIR;
		if (!is_dir($path)) {
			mkdir($path, 0777, true);
		}
		if (!is_file($path . '/' . SERVICE_FILESYSTEM_MOUNTPOINTS_CONF_FILENAME)) {
			file_put_contents($path . '/' . SERVICE_FILESYSTEM_MOUNTPOINTS_CONF_FILENAME, '<conf/>');
		}
		return $path . '/' . SERVICE_FILESYSTEM_MOUNTPOINTS_CONF_FILENAME;
	}
	
	/**
	 * @param MountpointDescriptor $md
	 */
	public function saveMountpointDescriptor(MountpointDescriptor $md) {
		//{
		//	TODO: permission checks here
		//}
		
		self::getNewProviderInstance($md->getMountpointPath())->storeMountpointDescriptor($md);
	}
	
	/**
	 * @param MountpointDescriptor $md
	 */
	public function deleteMountpointDescriptor(MountpointDescriptor $md) {
		//{
		//	TODO: permission checks here
		//}
		
		self::getNewProviderInstance($md->getMountpointPath())->deleteMountpointDescriptor($md);
	}
}
?>
