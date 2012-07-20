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
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IMetaAssociable {
	/**
	 * @return void
	 */
	public function deleteMeta();
	
	/**
	 * @return IMetaData The metadata associated to the current object.
	 */
	public function getMeta();
	
	/**
	 * @param IMetaData $metaData The metadata to be associated
	 *        to the current object.
	 */
	public function setMeta(IMetaData $metaData = null);
}


/**
 * Specifies a metadata holder.
 * MetaData work like associative arrays, which means that they associate a value to
 * each key. A key is always unique in each metadata instance. The types of the values
 * that can be stored in a metadata holder may depend on the implementation, but it
 * would usually be:
 * - string, integer, double as keys
 * - string, integer, double, arrays as values
 * An additional processing or access control can also be performed on the values
 * (here again, depending on the implementation).
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IMetaData {
	/**
	 * Constructs a new IMetadata by copying the values stored in the given parameter if any,
	 * or an empty one otherwise.
	 * 
	 * @param IMetaData $metaData
	 */
	public function __construct(IMetaData $metaData = null);
	
	/**
	 * Checks if a value is associated to the given $key. 
	 * 
	 * @param mixed $key
	 * @return bool
	 */
	public function exists($key);
	
	/**
	 * Returns the value associated to the given $key, or NULL if the key does not exist.
	 * 
	 * @param mixed $key
	 * @return mixed
	 */
	public function get($key);
	
	/**
	 * Returns all the values from the current instance as an array.
	 * 
	 * @return array(mixed => mixed)
	 */
	public function getAll();
	
	/**
	 * Assigns given $value to the specified $key. If the key already exists
	 * its value will be overwritten.
	 * 
	 * @param mixed $key
	 * @param mixed $value
	 */
	public function set($key, $value);
	
	/**
	 * Set all the values from $metaData to the current instance.
	 * Existing values will be overwritten.
	 * 
	 * @param array(mixed => mixed)
	 */
	public function setAll(array $metaDatas);
}

/**
 * Defines a basic metadata holder, that accepts:
 * - strings, integers, doubles as keys,
 * - strings, integers, doubles and arrays as values.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class BasicMetaData implements IMetaData {
	/**
	 * @var array(string => mixed)
	 */
	protected $metaDatas = array();
	
	/**
	 * Constructs a new IMetadata by copying the values stored in the given parameter if any,
	 * or an empty one otherwise.
	 * 
	 * @param IMetaData $metaData
	 */
	public function __construct(IMetaData $metaData = null) {
		if ($metaData !== null) {
			$this->setAll($metaData->getAll());
		}
	}
	
	/**
	 * Checks if a value is associated to the given $key. 
	 * 
	 * @param mixed $key
	 * @return bool
	 */
	public function exists($key) {
		return isset($this->metaDatas[$key]);
	}
	
	/**
	 * Returns the value associated to the given $key, or NULL if the key does not exist.
	 * 
	 * @param mixed $key
	 * @return mixed
	 */
	public function get($key) {
		if (isset($this->metaDatas[$key])) {
			return $this->metaDatas[$key];
		}
		return null;
	}
	
	/**
	 * Returns all the values from the current instance as an array.
	 * 
	 * @return array(mixed => mixed)
	 */
	public function getAll() {
		return $this->metaDatas;
	}	
	
	/**
	 * Set all the values from $metaData to the current instance.
	 * Existing values will be overwritten.
	 * Passing a NULL as value will unset the corresponding key.
	 * 
	 * @param string $key
	 * @param mixed $value
	 * @throws EyeNullPointerException If $key is NULL
	 * @throws EyeInvalidArgumentException If $key or $value is not of a supported type
	 */
	public function set($key, $value) {
		if ($key === null) {
			throw new EyeNullPointerException('$key cannot be null.');
		}
		if ($value === null) {
			unset($this->metaDatas[$key]);
			return;
		}
		switch(gettype($key)) {
			case 'array':
			case 'object':
			case 'resource':
			case 'unknown type':
				throw new EyeInvalidArgumentException('$key must be one of these types: string, integer, double. Given: ' . gettype($key) . '.');
		}
		switch(gettype($value)) {
			case 'object':
			case 'resource':
			case 'unknown type':
				throw new EyeInvalidArgumentException('$value must be one of these types: string, integer, double, array. Given: ' . gettype($value) . '.');
		}
		$key = (string) $key;
		$value = $value;
		$this->metaDatas[$key] = $value;
	}
	
	/**
	 * Set all the values from $metaData to the current instance.
	 * Existing values will be overwritten.
	 * 
	 * @param array(mixed => mixed)
	 */
	public function setAll(array $metaDatas) {
		foreach($metaDatas as $key => $value) {
			$this->set($key, $value);
		}
	}
}
?>
