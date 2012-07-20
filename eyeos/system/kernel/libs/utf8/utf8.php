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

function lib_utf8_load() {
	// Set UTF-8 as default charset
	ini_set('default_charset', 'UTF-8');
	
	// Load UTF-8 library
	require(LIB_UTF8_PATH . '/utf8_.php');
	
	// Load UTF-8 functions
	require_once(LIB_UTF8_PATH . '/ord.php');
	require_once(LIB_UTF8_PATH . '/str_pad.php');
	require_once(LIB_UTF8_PATH . '/str_split.php');
	require_once(LIB_UTF8_PATH . '/strcasecmp.php');
	require_once(LIB_UTF8_PATH . '/strcspn.php');
	require_once(LIB_UTF8_PATH . '/stristr.php');
	require_once(LIB_UTF8_PATH . '/strrev.php');
	require_once(LIB_UTF8_PATH . '/strspn.php');
	require_once(LIB_UTF8_PATH . '/substr_replace.php');
	require_once(LIB_UTF8_PATH . '/trim.php');
	require_once(LIB_UTF8_PATH . '/ucfirst.php');
	require_once(LIB_UTF8_PATH . '/ucwords.php');
	
	// Load own UTF-8 functions
	require_once(LIB_UTF8_PATH . '/basename.php');
	require_once(LIB_UTF8_PATH . '/pathinfo.php');
	require_once(LIB_UTF8_PATH . '/wordwrap.php');
	
	// Load utf8_str_ireplace
	require_once(LIB_UTF8_PATH . '/str_ireplace.php');
	function utf8_str_ireplace($search, $replace, $subject, $count = null) {
		return utf8_ireplace($search, $replace, $subject, $count);
	}
	
	return true;
}
?>