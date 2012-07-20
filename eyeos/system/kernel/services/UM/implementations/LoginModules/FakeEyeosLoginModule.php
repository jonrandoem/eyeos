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
 * @subpackage UM
 */
class FakeEyeosLoginModule implements ILoginModule {
	private $succeeded = false;
	private $commitSucceeded = false;
	private $subject = null;
	private $sharedState = null;
	private $options = null;
	private $loadedPrincipals = null;
	private $loadedPublicCredentials = null;
	
	
	public function abort() {
		if (!$this->succeeded) {
			return false;
		}
		if ($this->succeeded && !$this->commitSucceeded) {
			$this->loadedPrincipals = null;
			$this->loadedPublicCredentials = null;
			$this->succeeded = false;
		} else {
			//authentication succeeded but another module failed
			$this->logout();
		}
		return true;
	}
	
	public function commit() {
		if (!$this->succeeded) {
			return false;
		} else {
			$this->subject->getPrincipals()->appendAll($this->loadedPrincipals);
			$this->commitSucceeded = true;
			return true;
		}
	}
	
	public function initialize(Subject $subject, ArrayObject $sharedState, array $options = null) {
		$this->subject = $subject;
		$this->sharedState = $sharedState;
		$this->options = $options;
	}
	
	public function login() {
		$username = 'fakeUser';
		foreach($this->subject->getPrivateCredentials() as $cred) {
			if ($cred instanceof FakeEyeosCredential) {
				$username = $cred->getUsername();
			}
		}
		$user = new FakeEyeosUser($username);
		
		$this->loadedPrincipals = array($user);
		
		$this->succeeded = true;
		return true;
	}
	
	public function logout() {
		$this->subject->getPrincipals()->removeAll($this->loadedPrincipals);
		
		$this->succeeded = false;
		$this->commitSucceeded = false;
		$this->loadedPrincipals = null;
		$this->loadedPublicCredentials = null;
		return true;
	}
}

class FakeEyeosCredential {
	private $username;
	
	public function __construct($username) {
		$this->username = $username;
	}
	
	public function getUsername() {
		return $this->username;
	}
}

class FakeEyeosUser extends AbstractEyeosUser {
	public function getAttributesMap() {
		return get_object_vars($this);
	}
}

class FakeEyeosGroup extends AbstractEyeosGroup {
	public function getAttributesMap() {
		return get_object_vars($this);
	}
}
?>
