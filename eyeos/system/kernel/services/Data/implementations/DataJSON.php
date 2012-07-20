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
 * @subpackage Data
 */
class DataJSON extends Kernel implements IData {
	public static function encodeToUTF8(&$item, $key)
	{
		if ( is_array($item) ) {
			array_walk($item, 'self::encodeToUTF8');
		}
		else if ( is_string($item) ) {
			$item = utf8_encode($item);
		}
	}
	public function doOutput($value) {
        $Logger = Logger::getLogger('kernel.services.DataJSON');
		/*
		if ( is_array($value) ) {
			// transform all strings to utf8
			array_walk($value, 'self::encodeToUTF8');
		}*/
		// return utf8 value to json
		return json_encode($value);
	}
	
	public function doInput($value) {
		$return = json_decode($value, true);
		if ($return === null && strcasecmp(trim($value), 'null') != 0) {
			return $value;
		}
		return $return;
	}
}
?>