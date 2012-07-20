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
 * This interface represents the abstract notion of a principal, which can be used
 * to represent any entity, such as an individual, a corporation, and a login id.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IPrincipal {
	/**
	 * Returns a printable version of the object.
	 * 
	 * @return string
	 */
	public function __toString();
	
	/**
	 * Gets the name of the principal.
	 * 
	 * @return string The name.
	 */
	public function getName();
}

/**
 * This interface represents the abstract notion of a group, which can be used
 * to represent any entity composed by entities itself.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IGroup extends IPrincipal {
	// nothing for the moment, maybe later...
}

/**
 * This interface represents the abstract notion of a user, which can be used
 * to represent any atomic entity.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IUser extends IPrincipal {
	// nothing for the moment, maybe later...
}

/**
 * A Subject represents a grouping of related information for a single entity, such as a person.
 * Such information includes the Subject's identities as well as its security-related attributes
 * (passwords and cryptographic keys, for example).
 * 
 * Implementation based on javax.security.auth.Subject (JDK)
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
final class Subject {
	private $principals;
	private $publicCredentials;
	private $privateCredentials;
	
	public function __construct() {
		$this->principals = new Set();
		$this->publicCredentials = new ArrayList();
		$this->privateCredentials = new ArrayList();
	}
	
	public function __clone() {
		$this->principals = clone $this->principals;
		$this->publicCredentials = clone $this->publicCredentials;
		$this->privateCredentials = clone $this->privateCredentials;
	}
	
	/**
	 * Username, ID, ...
	 * 
	 * @return Set
	 */
	public function getPrincipals() {
		return $this->principals;
	}
	
	/**
	 * Passwords, private keys, ...
	 * 
	 * @return ArrayList
	 */
	public function getPrivateCredentials() {
		return $this->privateCredentials;
	}
	
	/**
	 * Public keys, ...
	 * 
	 * @return ArrayList
	 */
	public function getPublicCredentials() {
		return $this->publicCredentials;
	}
}
?>
