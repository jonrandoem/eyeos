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
class FTPFileObjectsFactory implements IFileObjectsFactory {
	private static $Instance = null;
	
	/**
	 * @var array(string)
	 */
	private static $handledSchemes = array('ftp', 'ftps');
	
	protected function __construct() {}
	
	/**
	 * @param string $path
	 * @return bool
	 */
	public function checkPath($path) {
		$urlParts = AdvancedPathLib::parse_url($path);
		if (in_array(strtolower($urlParts['scheme']), self::$handledSchemes)) {
			return true;
		}
		return false;
	}
	
	/**
	 * Returns an EyeFTPFile object corresponding to the given $path.
	 * 
	 * @param string $path The path/URL of the file.
	 * @param array $params Optionnal addionnal parameters passed to the file class constructor.
	 * @return EyeFTPFile The file object if the FOF was able to create it or null otherwise.
	 * @throws EyeException If an error occured during the creation of the file object.
	 */
	public function getFile($path, $params = null) {
		return new EyeFTPFile($path, $params);
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$class = __CLASS__;
			self::$Instance = new $class;
		}
		return self::$Instance;
	}
	
}

?>
