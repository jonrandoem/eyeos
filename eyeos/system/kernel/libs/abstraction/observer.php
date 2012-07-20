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
 * Defines a basic event object, providing a way to access the source object that fired it.
 * 
 * @see IEventListener
 * 
 * @package kernel-libs
 * @subpackage abstraction
 */
class EventObject {
	/**
	 * @var mixed
	 */
	private $relatedSource = null;
	
	/**
	 * @var mixed
	 */
	private $source = null;
	
	/**
	 * @var int
	 */
	private $time = null;
	
	/**
	 * Constructs an event.
	 * 
	 * @param mixed $source The source object that fired the event.
	 */
	public function __construct($source, $relatedSource = null) {
		$this->source = $source;
		$this->relatedSource = $relatedSource;
		$this->time = time();
	}
	
	/**
	 * Returns the related source of the event.
	 * 
	 * @return mixed The related source object if any.
	 */
	public function getRelatedSource() {
		return $this->relatedSource;
	}
	
	/**
	 * Returns the source of the event.
	 * 
	 * @return mixed The source object that fired the event.
	 */
	public function getSource() {
		return $this->source;
	}
	
	/**
	 * Returns the time (in seconds relative to the epoch) at which the event was created.
	 * 
	 * @return int The time at which the event was created.
	 */
	public function getTimeStamp() {
		return $this->time;
	}
}

/**
 * Defines a class that listens to events.
 * 
 * @see EventObject
 */
interface IEventListener {
	public static function getInstance();
}

/**
 * Defines an observer class.
 */
interface IObserver {
	/**
	 * This method is called whenever the observed object is changed. An
     * application calls an Observable object's notifyObservers() method
     * to have all the object's observers notified of the change.
     * 
     * @param IObservable $observable The observable object.
     * @param mixed An argument passed to the notifyObservers() method.
	 */
	public function update(IObservable $observable, $params = null);
}

/**
 * Defines an observable class (a class which objects can be observed).
 */
interface IObservable {
	//TODO
}
?>