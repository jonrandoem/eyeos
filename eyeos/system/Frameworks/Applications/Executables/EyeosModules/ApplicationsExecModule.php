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
 * ExecModule for applications management.
 * 
 * This module will progressively replace the functions currently located in desktop.php.
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
class ApplicationsExecModule implements IEyeosExecutableModule {
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}
	
	/**
	 * Performs a PHP variable => JSON-compatible array conversion with objects of class EyeosApplicationDescriptor,
	 * and arrays of EyeosApplicationDescriptors.
	 * 
	 * @param mixed $value
	 * @return array
	 */
	private static function toArray($value) {
		if ($value instanceof EyeosApplicationDescriptor) {
			return $value->getAttributesMap();
		}
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('$value must be an EyeosApplicationDescriptor or an array of one of EyeosApplicationDescriptors.');
		}
		
		foreach($value as &$v) {
			$v = self::toArray($v);
		}
		sort($value);
		return $value;
	}
	
	/**
	 * 
	 * @return [
	 * 		{
	 * 			name: ...,
	 * 			javascriptOnly: "true"/"false",
	 * 			meta: {Map}
	 * 		},
	 * 		...
	 * ]
	 */
	public static function getAllInstalledApplications() {
		$myApplicationsManager = new EyeosApplicationsManager();
		$applications = $myApplicationsManager->getAllInstalledApplications();
		$return = array();
		foreach($applications as $appDesc) {
			$jsonAppDesc = self::toArray($appDesc);
			
			// Translate icon URL to enable caching
			if (isset($jsonAppDesc['meta']['eyeos.application.iconUrl'])) {
				$extUrl = FSI::toExternalUrl($jsonAppDesc['meta']['eyeos.application.iconUrl']);
				if ($extUrl) {
					$jsonAppDesc['meta']['eyeos.application.iconUrl'] = $extUrl;
				}
			}
			
			$sysParams = $jsonAppDesc['meta']['eyeos.application.systemParameters'];
			if ($sysParams['listable'] == 'true') {
				$return[] = $jsonAppDesc;
			}
		}
		return $return;
	}
}
?>
