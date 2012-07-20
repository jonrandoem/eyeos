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
 * @package kernel-libs
 * @subpackage abstraction
 */
abstract class AbstractDataHolder {
	private $type = null;
	protected $value = null;
	
	protected abstract function _setValue($value);
	public abstract function getType();
	public abstract function getValue();
	public abstract function setType(IDataType $type);
	
	public final function setValue($value) {
		if ($this->type !== null) {
			$this->type->checkValue($value);
		}
		$this->_setValue($value);
	}
}

/**
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IDataType {
	public function checkValue($value);
	public function getCategoryName();
	public function getDefault();
	public function getLength();
	public function getMimeType();
	public function getName();
	public function getProperties();
}

/**
 * @package kernel-libs
 * @subpackage abstraction
 */
interface IDataTypeCategory {
	const STRING = 'string';
	const NUMERIC = 'numeric';
	const DATETIME = 'date-time';
}


//=============================================================================
//							BASIC TYPES DEFINITIONS
//=============================================================================

/**
 * @package kernel-libs
 * @subpackage abstraction
 */
class VarcharDataType implements IDataType {
	public function __construct() {}
	
	public function checkValue($value) {
		if (!is_string($value)) {
			throw new EyeInvalidArgumentException('Invalid value provided: "' . $value . '" is not a string.');
		}
	}
	
	public function getCategoryName() {
		return IDataTypeCategory::STRING;
	}
	
	public function getDefault() {
		return '';
	}
	
	public function getLength() {
		return -1;
	}
	
	public function getMimeType() {
		return 'text/plain';
	}
	
	public function getName() {
		return __CLASS__;
	}
	
	public function getProperties() {
		return array();
	}
}

/**
 * @package kernel-libs
 * @subpackage abstraction
 */
class NumberDataType implements IDataType {
	public function __construct() {}
	
	public function checkValue($value) {
		if (!is_numeric($value)) {
			throw new EyeInvalidArgumentException('Invalid value provided: "' . $value . '" is not a numeric value.');
		}
	}
	
	public function getCategoryName() {
		return IDataTypeCategory::NUMERIC;
	}
	
	public function getDefault() {
		return 0;
	}
	
	public function getLength() {
		return -1;
	}
	
	public function getMimeType() {
		return 'text/plain';
	}
	
	public function getName() {
		return __CLASS__;
	}
	
	public function getProperties() {
		return array();
	}
}

/**
 * @package kernel-libs
 * @subpackage abstraction
 */
class BooleanDataType implements IDataType {
	public function __construct() {}
	
	public function checkValue($value) {
		if (!is_bool($value)) {
			throw new EyeInvalidArgumentException('Invalid value provided: "' . $value . '" is not a boolean value.');
		}
	}
	
	public function getCategoryName() {
		return IDataTypeCategory::NUMERIC;
	}
	
	public function getDefault() {
		return false;
	}
	
	public function getLength() {
		return 1;
	}
	
	public function getMimeType() {
		return 'text/plain';
	}
	
	public function getName() {
		return __CLASS__;
	}
	
	public function getProperties() {
		return array();
	}
}

/**
 * @package kernel-libs
 * @subpackage abstraction
 */
class DefaultDateTimeDataType implements IDataType {
	public function __construct() {}
	
	public function checkValue($value) {
		if (strtotime($value) === false) {
			throw new EyeInvalidArgumentException('Invalid value provided: "' . $value . '" is not a correct date value.');
		}
	}
	
	public function getCategoryName() {
		return IDataTypeCategory::DATETIME;
	}
	
	public function getDefault() {
		return time();
	}
	
	public function getLength() {
		return -1;
	}
	
	public function getMimeType() {
		return 'text/plain';
	}
	
	public function getName() {
		return __CLASS__;
	}
	
	public function getProperties() {
		return array();
	}
}
?>