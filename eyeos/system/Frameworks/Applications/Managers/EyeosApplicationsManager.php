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
 * ! Temporary design !
 * Will probably change in the future.
 * 
 * @package kernel-frameworks
 * @subpackage Applications
 */
class EyeosApplicationsManager implements IApplicationsManager {
	public function compareInstalledApps (EyeosApplicationDescriptor $a, EyeosApplicationDescriptor $b){
		return strcasecmp($a->getName(), $b->getName());
		/*$valueA = $a->getApplicationInformation()->getInstalled();
		$valueB = $b->getApplicationInformation()->getInstalled();
		if ($valueA == -1) {
			return -1;
		}
		if ($valueB == -1) {
			return 1;
		}

		return $valueB - $valueA;*/
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
		}
		return self::$Instance;
	}
	
	public function getAllApplications() {
		$directory = new DirectoryIterator(EYE_ROOT . '/' . APPS_DIR);
		$applications = array();
		foreach ($directory as $fileInfo) {
			$fileInfoName = $fileInfo->getFilename();

			if ($fileInfo->isDir() && $fileInfoName{0} != '.') {
				$applications[] = new EyeosApplicationDescriptor($fileInfoName);
			}
		}
		return $applications;
	}
	
	public function getAllFavoriteApplications() {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$favorites = $meta->get('eyeos.user.applications.favorite');
		$return = array();
		if(is_array($favorites)) {
			foreach($favorites as $key => $value) {
				$return[$key] = new EyeosApplicationDescriptor($key);
			}
		}
		return $return;
	}
	
	public function getAllInstalledApplications() {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$installedMeta = $meta->get('eyeos.user.applications.installed');
		$return = array();
		if(is_array($installedMeta)) {
			foreach($installedMeta as $key => $value) {
				$return[$key] = new EyeosApplicationDescriptor($key);
			}
		}
		return $return;
	}
	
	public function getAllNotInstalledApplications() {
		$allApplications = $this->getAllApplications();
		$allAppsName = array();
		foreach ($allApplications as $app) {
			$allAppsName[] = $app->getName();
		}

		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$installedMeta = $meta->get('eyeos.user.applications.installed');
		$installedAppsName = array();
		if(is_array($installedMeta)) {
			foreach($installedMeta as $key => $value) {
				$installedAppsName[$key] = $key;
			}
		}
		$notInstalledName = array_diff($allAppsName, $installedAppsName);

		$return = array();
		foreach($notInstalledName as $key => $value){
			$return[$value] = new EyeosApplicationDescriptor($value);
		}

		return $return;

	}
	
	public function getAllRecentlyInstalledApplications() {
		$installedApps = $this->getAllInstalledApplications();
		usort($installedApps, array(__CLASS__, 'compareInstalledApps'));
		$installedApps = array_slice($installedApps, 0, 10);

		return $installedApps;

	}
	
	public function getApplicationsFromCategory($category) {
		//TODO
	}
	
	public function isApplicationFavorite(IApplicationDescriptor $appDesc) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$installedMeta = $meta->get('eyeos.user.applications.favorite');
		
		$appName = strtolower($appDesc->getName());
		
		if(is_array($installedMeta)) {
			foreach($installedMeta as $key => $value) {
				if ($key == $appName) {
					return true;
				}
			}
		}
		return false;
	}
	
	public function isApplicationInstalled(IApplicationDescriptor $appDesc) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$installedMeta = $meta->get('eyeos.user.applications.installed');
		
		$appName = strtolower($appDesc->getName());
		
		if(is_array($installedMeta)) {
			foreach($installedMeta as $key => $value) {
				if ($key == $appName) {
					return true;
				}
			}
		}
		return false;
	}

	public function searchApplication($input){
	    $directory = new DirectoryIterator(EYE_ROOT . '/' . APPS_DIR);
		$searchResults = array();
		foreach ($directory as $fileInfo) {
			$fileInfoName = $fileInfo->getFilename();

			if ($fileInfo->isDir() && $fileInfoName{0} != '.') {
                                if(!empty($input)) {
                                    $app = new EyeosApplicationDescriptor($fileInfoName);
                                    $meta = $app->getMeta();
                                    if(stristr($fileInfoName, $input) || stristr($meta->get('eyeos.application.name'), $input) 
                                            || stristr($meta->get('eyeos.application.description'), $input) ) {
                                            $searchResults[] = $app;
                                    }
                                } else {
                                    $searchResults[] = new EyeosApplicationDescriptor($fileInfoName);
                                }
			}
		}
		return $searchResults;
	}
	
	public function setFavoriteApplication(IApplicationDescriptor $application, $favorite = true) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$favorites = $meta->get('eyeos.user.applications.favorite');
		if($favorite) {
			$favorites[$application->getName()] = time();
		} else {
			unset($favorites[$application->getName()]);
		}
		$meta->set('eyeos.user.applications.favorite', $favorites);
		MetaManager::getInstance()->storeMeta($currentUser, $meta);
	}

	public function setInstalledApplication(IApplicationDescriptor $application, $installed = true) {
	    $currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
	    $meta = MetaManager::getInstance()->retrieveMeta($currentUser);
	    $installedMeta = $meta->get('eyeos.user.applications.installed');
	    if($installed) {
			$installedMeta[$application->getName()] = time();
	    } else {
			unset($installedMeta[$application->getName()]);
	    }
	    $meta->set('eyeos.user.applications.installed', $installedMeta);
	    MetaManager::getInstance()->storeMeta($currentUser, $meta);
	}
}
?>