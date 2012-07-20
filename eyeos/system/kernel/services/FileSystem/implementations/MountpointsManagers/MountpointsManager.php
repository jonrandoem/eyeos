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

define('SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_MANAGERS_DIR', 'Managers');
define('SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_MANAGERS_PATH', SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PATH . '/' . SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_MANAGERS_DIR);

define('SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PROVIDERS_DIR', 'Providers');
define('SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PROVIDERS_PATH', SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PATH . '/' . SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PROVIDERS_DIR);

/**
 * 
 * @package kernel-services
 * @subpackage FileSystem
 */
class MountpointsManager implements IMountpointsManager {
	private static $Instance = null;
	
	/**
	 * @var array(scheme => IMountpointManager)
	 */
	private static $LoadedManagers = array();
	
	/**
	 * @var array(providerClassNames)
	 */
	private static $LoadedProviders = array();
	
	
	protected function __construct() {}
	
	/**
	 * @param MountpointDescriptor $md
	 */
	public function deleteMountpointDescriptor(MountpointDescriptor $md) {
		$manager = self::getMountpointManagerInstance($md->getMountpointPath());
		$manager->deleteMountpointDescriptor($md);
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new MountpointsManager();
		}
		return self::$Instance;
	}
	
	/**
	 * @param $path
	 * @return MountpointDescriptor
	 */
	public function getMountpointDescriptor($path) {
		$manager = self::getMountpointManagerInstance($path);
		return $manager->getMountpointDescriptor($path);
	}
	
	/**
	 * @param $path
	 * @return array(MountpointDescriptor)
	 */
	public function getMountpointDescriptorsList($path) {
		$manager = self::getMountpointManagerInstance($path);
		return $manager->getMountpointDescriptorsList($path);
	}
	
	protected static function getMountpointManagerInstance($path) {
		$moutpointScheme = AdvancedPathLib::parse_url($path);
		$moutpointScheme = $moutpointScheme['scheme'];
		
		if (!isset(self::$LoadedManagers[$moutpointScheme])) {
			if (!in_array($moutpointScheme, EyeosAbstractVirtualFile::$VirtualFileSchemes)) {
				throw new EyeInvalidArgumentException($path . ' does not represent an EyeosAbstractVirtualFile.');
			}
			$configFile = $moutpointScheme . '.scheme' . SERVICE_FILESYSTEM_CONFIGURATION_FILE_EXTENSION;
			$conf = FSI::getConfiguration($configFile);
			
			$managerClassName = (string) $conf->mountpointsManager['class'];
			
			if (!$managerClassName) {
				throw new EyeMissingConfigurationException('No manager class found in configuration file ' . $configFile);
			}
			if (!is_file(SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_MANAGERS_PATH . '/' . $managerClassName . '.php')) {
				throw new EyeFileNotFoundException(SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_MANAGERS_PATH . '/' . $managerClassName . '.php');
			}
			require SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_MANAGERS_PATH . '/' . $managerClassName . '.php';
			$instance = call_user_func(array($managerClassName, 'getInstance'));
			if (!$instance instanceof IMountpointsManager) {
				throw new EyeUnexpectedValueException($managerClassName . ' does not implement IMountpointsManager.');
			}
			self::$LoadedManagers[$moutpointScheme] = $instance;
		}
		return self::$LoadedManagers[$moutpointScheme];
	}
	
	public static function getNewMountpointDescriptorsProviderInstance($className, $params) {
		if (!in_array($className, self::$LoadedProviders)) {
			if (!is_file(SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PROVIDERS_PATH . '/' . $className . '.php')) {
				throw new EyeFileNotFoundException(SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PROVIDERS_PATH . '/' . $className . '.php');
			}
			require SERVICE_FILESYSTEM_MOUNTPOINTSMANAGERS_PROVIDERS_PATH . '/' . $className . '.php';
			if (!class_exists($className)) {
				throw new EyeClassNotFoundException($className);
			}
			self::$LoadedProviders[] = $className;
		}
		return new $className($params);
	}
	
	/**
	 * @param MountpointDescriptor $md
	 */
	public function saveMountpointDescriptor(MountpointDescriptor $md) {
		$manager = self::getMountpointManagerInstance($md->getMountpointPath());
		$manager->saveMountpointDescriptor($md);
	}
}

interface IMountpointDescriptorProvider {
	/**
	 * 
	 * @param array $params Optional parameters depending on the implementation.
	 */
	public function __construct(array $params = null);
	
	/**
	 * Deletes given mountpoint descriptor.
	 * 
	 * @param MountpointDescriptor $md
	 */
	public function deleteMountpointDescriptor(MountpointDescriptor $md);
	
	/**
	 * Returns the mountpoint descriptors that is located at the given path.
	 * 
	 * @return MountpointDescriptor
	 */
	public function retrieveMountpointDescriptor($path);
	
	/**
	 * Returns the list of all the mountpoint descriptors that are located in
	 * the given path or one of its subfolders.
	 * 
	 * @return array(MountpointDescriptor)
	 */
	public function retrieveAllMountpointDescriptors($path);
	
	/**
	 * Stores given mountpoint descriptor.
	 * 
	 * @param MountpointDescriptor $md
	 */
	public function storeMountpointDescriptor(MountpointDescriptor $md);
}
?>
