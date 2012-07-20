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
 * This interface defines an object inside the eyeos system that can be represented with a unique ID.
 * This ID <b>must be created and associated to the object with ObjectIdGenerator</b>, if possible
 * using this syntax:
 * 
 * <pre>ObjectIdGenerator::assignId($object);</pre>
 * 
 * @see ObjectIdGenerator
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface EyeObject {
	/**
	 * Returns the unique identifier for this object.
	 * 
	 * @param bool $forceGeneration Set to FALSE if you don't want the object to auto-assign an ID if it's missing.
	 * 				In this case, you may get NULL as the returned value.
	 * @return string The ID.
	 */
	public function getId($forceGeneration = true);
	
	/**
	 * Assigns an ID to this object IF IT HAS NOT ALREADY ONE.
	 * 
	 * @param string $id
	 * @throws EyeBadMethodCallException if this object already has an ID assigned.
	 */
	public function setId($id);
}

/**
 * Defines a singleton. A class implementing this interface must ensure
 * that only one instance maximum of its kind will be created while processing a request.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface ISingleton {
	public static function getInstance();
}

/**
 * Defines an object that can produce a representation of itself by generating
 * a map (associative array) of its attributes.
 * This interface is particularly useful for transfer objects that only contain
 * simple datatypes as attributes.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface ISimpleMapObject {
	/**
	 * @return array
	 */
	public function getAttributesMap();
}
?>
