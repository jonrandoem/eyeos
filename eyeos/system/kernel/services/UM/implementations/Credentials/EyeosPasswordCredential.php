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

require_once dirname(__FILE__) . '/SimplePasswordCredential.php';

/**
 * 
 * @package kernel-services
 * @subpackage UM
 */
class EyeosPasswordCredential extends SimplePasswordCredential {	
	public function __construct($username = null, $password = null, $encrypt = true) {
		if ($username !== null) {
			$this->setUsername($username);
		}
		if ($password !== null) {
			$this->setPassword($password, $encrypt);
		}
	}
	
	public function setPassword($password, $encrypt = true) {
		if (!is_string($password)) {
			throw new EyeInvalidArgumentException('$password must be a string (' . gettype($password) . ' given).');
		}
		if ($encrypt) {
			parent::setPassword(self::encryptPassword($password));
		} else {
			parent::setPassword($password);
		}
	}
	
	private static function encryptPassword($password) {
		return sha1($password . sha1($password));			//FIXME: should be centralized somewhere (see also EyeosUser class)
	}
}
?>
