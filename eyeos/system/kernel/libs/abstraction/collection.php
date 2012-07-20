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
 * Defines a "collection": a set of ordered or non-ordered elements.
 * It adds some useful methods to the collections classes provided by the SPL.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface ICollection {
	/**
	 * Appends the $value to the collection.
	 * 
	 * @param mixed $value
	 * @param bool TRUE if the element has been appended successfully
	 */
	public function append($value);
	
	/**
	 * Appends all the elements contained in the $values argument to the collection.
	 * 
	 * @param mixed $values The set of values to append. Must be an iterable element (array, Traversable, ...)
	 */
	public function appendAll($values);
	
	/**
	 * Removes all the elements from the collection.
	 */
	public function clear();
	
	/**
	 * Checks if the collection contains the given element.
	 * 
	 * @param mixed $value
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function contains($value, $strict = false);
	
	/**
	 * Checks if the collection is empty or not.
	 * 
	 * @return bool TRUE if the collection does not contain any element, FALSE otherwise.
	 */
	public function isEmpty();
	
	/**
	 * Sets the value at the specified $index to $value.
	 * 
	 * @param mixed $index
	 * @param mixed $value
	 * @return bool TRUE if the value has been set successfully
	 */
	public function offsetSet($index, $value);
	
	/**
	 * Removes the given element from the collection if it is found.
	 * 
	 * @param mixed $value
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function remove($value, $strict = false);
	
	/**
	 * Removes all the elements contained in the given argument from the collection.
	 * 
	 * @param mixed $values The set of values to remove. Must be an iterable element (array, Traversable, ...)
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function removeAll($values, $strict = false);
}

/**
 * Defines a collection that cannot contain more than once an element.
 * It insures that every value within the collection is unique.
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
interface ISet extends ICollection {
	// nothing more here...
}

/**
 * Defines a class extending ArrayObject provided by the SPL, adding some useful methods
 * to manage elements.
 * 
 * @see ArrayObject (SPL)
 * @see ICollection
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class ArrayList extends ArrayObject implements ICollection {	
	/**
	 * Appends the $value to the collection.
	 * 
	 * @param mixed $value
	 * @param bool TRUE if the element has been appended successfully
	 */
	public function append($value) {
		parent::append($value);
		return true;
	}
	
	/**
	 * Appends all the elements contained in the $values argument at the end of the collection.
	 * <b>Warning</b>: The keys of the array in argument will be ignored.
	 * 
	 * @param mixed $values The set of values to append. Must be an iterable element (array, Traversable, ...)
	 */
	public function appendAll($values) {
		foreach($values as $value) {
			$this->append($value);
		}
	}
	
	/**
	 * Removes all the elements from the collection.
	 */
	public function clear() {
		$this->exchangeArray(array());
	}
	
	/**
	 * Checks if the collection contains the given element.
	 * 
	 * @param mixed $value
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function contains($value, $strict = false) {
		foreach($this as $currentValue) {
			if ($strict) {
				if ($currentValue === $value) {
					return true;
				}
			} else {
				if ($currentValue == $value) {
					return true;
				}
			}
		}
		return false;
	}
	
	/**
	 * Returns the index of the given $value if present in the collection, of FALSE if
	 * the element is not found.
	 * 
	 * @return mixed The index of $value if found, or FALSE otherwise
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function getIndex($value, $strict = false) {
		foreach($this as $key => $currentValue) {
			if ($strict) {
				if ($currentValue === $value) {
					return $key;
				}
			} else {
				if ($currentValue == $value) {
					return $key;
				}
			}
		}
		return false;
	}
	
	/**
	 * Checks if the collection is empty or not.
	 * 
	 * @return bool TRUE if the collection does not contain any element, FALSE otherwise.
	 */
	public function isEmpty() {
		return $this->count() == 0;
	}
	
	/**
	 * Gets the value at the specified $index.
	 * 
	 * @param mixed $index
	 * @param mixed $value
	 * @return mixed The value at the specified index
	 * @throws RangeException If the index cannot be found
	 */
	public function offsetGet($index) {
		if (isset($this[$index])) {
			return parent::offsetGet($index);
		} else {
			throw new RangeException('Undefined index: ' . $index);
		}
	}
	
	/**
	 * Sets the value at the specified $index to $value.
	 * 
	 * @param mixed $index
	 * @param mixed $value
	 * @return bool TRUE if the value has been set successfully
	 */
	public function offsetSet($index, $value) {
		parent::offsetSet($index, $value);
		return true;
	}
	
	/**
	 * Removes the given element from the collection if it is found.
	 * 
	 * @param mixed $value
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function remove($value, $strict = false) {
		$done = false;
		$index = $this->getIndex($value, $strict);
		while ($index !== false) {
			$this->offsetUnset($index);
			$index = $this->getIndex($value);
			$done = true;
		}
		return $done;
	}
	
	/**
	 * Removes all the elements contained in the given argument from the collection.
	 * 
	 * @param mixed $values The set of values to remove. Must be an iterable element (array, Traversable, ...)
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function removeAll($values, $strict = false) {
		if ($values === null) {
			throw new EyeNullPointerException('Argument must be an iterable variable.');
		}
		foreach($values as $value) {
			$this->remove($value, $strict);
		}
	}
}

/**
 * Defines a basic Set class using ArrayList and implementing ISet.
 * This implementation uses by default the non-strict equality (==) to ensure that each
 * value is unique. You may change that behaviour by passing Set::STRICT_COMP to the
 * $flags argument in the constructor.
 * 
 * @see ArrayList
 * @see ISet
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class Set extends ArrayList implements ISet {
	const STRICT_COMP = 128;
	
	private $strict = false;
	
	
	public function __construct($input = null, $flags = 0, $iteratorClass = null) {
		if ($input !== null) {
			if ($flags !== 0) {
				if ($flags & self::STRICT_COMP !== 0) {
					$this->strict = true;
				}
				if ($iteratorClass !== null) {
					parent::__construct($input, $flags, $iteratorClass);
				} else {
					parent::__construct($input, $flags);
				}
			} else {
				parent::__construct($input);
			}
		} else {
			parent::__construct();
		}		
		$this->cleanSet();
	}
	
	/**
	 * Appends the $value to the collection.
	 * 
	 * @param mixed $value
	 * @param bool TRUE if the element has been appended successfully
	 */
	public function append($value) {
		if (!$this->contains($value, $this->strict)) {
			parent::append($value);
			return true;
		}
		return false;
	}
	
	/**
	 * Cleans the set and remove all doublets from it.
	 */
	private function cleanSet() {
		$keysToBeRemoved = array();
		$thisArray = $this->getArrayCopy();
		foreach($thisArray as $value) {
			$res = array_keys($thisArray, $value, $this->strict);
			$keysToBeRemoved = array_merge($keysToBeRemoved, array_slice($res, 1));
		}
		$keysToBeRemoved = array_unique($keysToBeRemoved);
		foreach($keysToBeRemoved as $key) {
			$this->offsetUnset($key);
		}
	}
	
	/**
	 * Sets the value at the specified $index to $value.
	 * 
	 * @param mixed $index
	 * @param mixed $value
	 * @return bool TRUE if the value has been set successfully
	 */
	public function offsetSet($index, $newval) {
		if (!$this->contains($newval, $this->strict)) {
			parent::offsetSet($index, $newval);
			return true;
		}
		return false;
	}
}

/**
 * 
 * 
 * @see ArrayList
 * @see ISet
 * @see GuardedObject
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class SecuredSet implements IteratorAggregate, ISet, IMemberGuardedObject {
	/**
	 * @var Set
	 */
	private $set = null;
	
	/**
	 * @var IMemberGuard
	 */
	private $guard = null;
	
	
	public function __construct($input = null, $flags = 0, $iteratorClass = null) {
		$this->set = new Set($input, $flags, $iteratorClass);
	}
	
	protected function __clone() {
		$this->set = clone $this->set;
		$this->guard = clone $this->guard;
	}
	
	/**
	 * Appends the $value to the collection.
	 * 
	 * @param mixed $value
	 * @param bool TRUE if the element has been appended successfully
	 */
	public function append($value) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->append($value);
	}
	
	/**
	 * Appends all the elements contained in the $values argument to the collection.
	 * 
	 * @param mixed $values The set of values to append. Must be an iterable element (array, Traversable, ...)
	 */
	public function appendAll($values) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->appendAll($values);
	}
	
	/**
	 * Removes all the elements from the collection.
	 */
	public function clear() {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->clear();
	}
	
	/**
	 * Checks if the collection contains the given element.
	 * 
	 * @param mixed $value
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function contains($value, $strict = false) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		return $this->set->contains($value, $strict);
	}
	
	// From Countable
	public function count() {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		return $this->set->count();
	}
	
	// From ArrayObject
	public function exchangeArray($input) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		return $this->set->exchangeArray($input);
	}
	
	/**
	 * Checks if the collection is empty or not.
	 * 
	 * @return bool TRUE if the collection does not contain any element, FALSE otherwise.
	 */
	public function isEmpty() {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		return $this->set->isEmpty();
	}
	
	// From ArrayObject
	public function getArrayCopy() {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		return $this->set->getArrayCopy();
	}
	
	// From IteratorAggregate
	public function getIterator() {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		return $this->set->getIterator();
	}
	
	/**
	 * Sets the value at the specified $index to $value.
	 * 
	 * @param mixed $index
	 * @param mixed $value
	 * @return bool TRUE if the value has been set successfully
	 */
	public function offsetSet($index, $value) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->offsetSet($index, $value);
	}
	
	// From ArrayAccess
	public function offsetUnset($index, $value) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->offsetUnset($index, $value);
	}
	
	/**
	 * Removes the given element from the collection if it is found.
	 * 
	 * @param mixed $value
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function remove($value, $strict = false) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->remove($value, $strict);
	}
	
	/**
	 * Removes all the elements contained in the given argument from the collection.
	 * 
	 * @param mixed $values The set of values to remove. Must be an iterable element (array, Traversable, ...)
	 * @param bool $strict Use a strict comparison (===) if TRUE
	 */
	public function removeAll($values, $strict = false) {
		if ($this->guard !== null) {
			$this->guard->checkMemberGuard(new GuardPermission(__FUNCTION__, 'call'));
		}
		$this->set->removeAll($values, $strict);
	}
	
	public function setMemberGuard(IMemberGuard $guard) {
		if ($this->guard !== null) {
			throw new EyeSecurityException('Guard is already set and cannot be overwritten.');
		}
		$this->guard = $guard;
	}
}
?>
