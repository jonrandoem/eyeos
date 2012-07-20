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
class DefaultUserFileLocator implements IVirtualFileLocator {
	/**
	 * @param string $path
	 * @param SimpleXMLElement $xmlConf
	 * @return AbstractFile
	 */
	public static function getRealFile($path, $xmlParams = null, $params = null) {
		$urlParts = EyeosAbstractVirtualFile::parse_url($path, AdvancedPathLib::OS_UNIX);
		if (!isset($urlParts['principalname'])) {
			throw new EyeInvalidArgumentException('Missing username in given path "' . $path . '".');
		}
		$userFilesPath = UMManager::getEyeosUserDirectory($urlParts['principalname']) . '/'. USERS_FILES_DIR;
		if (!is_dir($userFilesPath)) {
			try {
				if (!mkdir($userFilesPath, 0777, true)) {
					throw new EyeIOException('Unable to create user files directory ' . $userFilesPath);
				}
			} catch (EyeErrorException $e) {
				throw new EyeIOException('Unable to create user files directory ' . $userFilesPath . '.', 0, $e);
			}
		}
		return new LocalFile($userFilesPath . $urlParts['path'], $params);
	}
}
?>
