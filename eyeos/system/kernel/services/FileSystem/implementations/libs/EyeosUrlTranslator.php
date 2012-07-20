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
 * @subpackage FileSystem
 */
class EyeosUrlTranslator implements IUrlTranslator {	
	/**
	 * @param string $internalUrl
	 * @return mixed The URL to access the target file from outside, if available, or FALSE.
	 */
	public static function toExternalUrl($internalUrl) {
		$currentProc = ProcManager::getInstance()->getCurrentProcess();
		if ($currentProc) {
			$checknum = $currentProc->getChecknum();
		} else {
			$checknum = -1;
		}
		
		$urlParts = AdvancedPathLib::parse_url($internalUrl);
		if ($urlParts === false) {
			return $internalUrl;
		}
		
		if ($urlParts['scheme'] === EyeosAbstractVirtualFile::URL_SCHEME_SYSTEM) {
			// EXTERN
			try {
				$externPath = AdvancedPathLib::resolvePath($urlParts['path'], '/extern', AdvancedPathLib::OS_UNIX | AdvancedPathLib::RESOLVEPATH_RETURN_REFDIR_RELATIVE);
				return 'index.php?extern=' . $externPath;
			} catch (Exception $e) {}
			
			// APPS
			try {
				$appPath = AdvancedPathLib::resolvePath($urlParts['path'], '/apps', AdvancedPathLib::OS_UNIX | AdvancedPathLib::RESOLVEPATH_RETURN_REFDIR_RELATIVE);
				$appName = utf8_substr($appPath, 1, utf8_strpos($appPath, '/', 1));
				$appFile = utf8_substr($appPath, utf8_strlen($appName) + 1);
				
				return 'index.php?checknum=' . $checknum . '&appName=' . $appName . '&appFile=' . $appFile;
			} catch (Exception $e) {}
			
			return $internalUrl;
		}
		
		//TODO
		
		return $internalUrl;
	}
	
	/**
	 * @param string $externalUrl
	 * @return mixed The URL to access the target file from inside, if available, or FALSE.
	 */
	public static function toInternalUrl($externalUrl) {
		//TODO
		return $externalUrl;
	}
}
?>