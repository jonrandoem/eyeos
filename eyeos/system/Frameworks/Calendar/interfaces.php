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

//
//	MANAGER
//
interface ICalendarManager extends ISingleton {
	public function deleteCalendar(ICalendar $calendar);
	public function deleteEvent(ICalendarEvent $event);
	public function getAllCalendarsFromOwner(IPrincipal $principal);
	public function getAllEventsFromCalendar(ICalendar $calendar);
	public function getCalendarById($calendarId);
	public function getEventById($eventId);
	public function getAllEventsByPeriod(ICalendar $calendar, $begin, $end);
	public function getNewCalendar();
	public function getNewEvent();
	public function saveCalendar(ICalendar $calendar);
	public function saveEvent(ICalendarEvent $event);
	public function search($string, ICalendar $calendar);
}


//
//	PROVIDER
//
interface ICalendarProvider extends ISingleton {
	public function createCalendar(ICalendar $calendar);
	public function createEvent(ICalendarEvent $event);
	public function deleteCalendar(ICalendar $calendar);
	public function deleteEvent(ICalendarEvent $event);
	public function retrieveAllCalendarsFromOwner(IPrincipal $principal);
	public function retrieveAllEventsFromCalendar(ICalendar $calendar, $timeFrom = null, $timeTo = null);
	public function retrieveCalendarById($calendarId);
	public function retrieveEventById($eventId);
	public function search($string, ICalendar $calendar);
	public function updateCalendar(ICalendar $calendar);
	public function updateEvent(ICalendarEvent $event);
}


//
//	MODEL
//

interface ICalendarEvent extends IShareable, ISimpleMapObject {
	//TODO: TO BE DEFINED
	const PRIVACY_DEFAULT = 'default';
	const PRIVACY_PRIVATE = 'private';
	const PRIVACY_PUBLIC = 'public';
	
	const TYPE_MEETING = 'meeting';
	const TYPE_LUNCH = 'lunch';
	const TYPE_DINNER = 'dinner';
	const TYPE_VISIT = 'visit';
	const TYPE_CALL = 'call';
	const TYPE_BIRTHDAY = 'birthday';
	const TYPE_CONFERENCE = 'conference';
	const TYPE_TRIP = 'trip';
	const TYPE_OTHER = 'other';

	public function __toString();
	public function getSubject();
	public function setSubject($subject);
	public function getLocation();
	public function setLocation($location);
	public function getDescription();
	public function setDescription($description);
	public function getIsAllDay();
	public function setIsAllDay($allDay);
	public function getTimeStart();
	public function setTimeStart($timeStart);
	public function getTimeEnd();
	public function setTimeEnd($timeEnd);
	public function getCreatorId();
	public function setCreatorId($principalId);
	public function getType();
	public function setType($type);
	public function getRepetition();
	public function setRepetition($repetition);
    public function getRepeatType();
	public function setRepeatType($repeatType);
    public function getFinalType();
	public function setFinalType($finalType);
    public function getFinalValue();
	public function setFinalValue($finalValue);
    public function getEventGroup();
	public function setEventGroup($eventGroup);
	public function getPrivacy();
	public function setPrivacy($privacy);
	public function getCalendarId();
	public function setCalendarId($calendarId);
}

interface ICalendar extends IShareable, ISimpleMapObject {
	public function __toString();
	public function getName();
	public function setName($name);
	public function getDescription();
	public function setDescription($description);
	public function getTimezone();
	public function setTimezone($timezone);
	public function getOwnerId();
	public function setOwnerId($ownerId);
}

interface ICalendarPrefs extends ISimpleMapObject {
	public function getId();
	public function setId($id);
	public function getCalendarId();
	public function setCalendarId($calendarId);
	public function getUserId();
	public function setUserId($userId);
	public function getColor();
	public function setColor($color);
	public function getNotifications();
	public function setNotifications($notifications);
	public function getVisible();
	public function setVisible($visible);
}

interface ICalendarEventPrefs extends ISimpleMapObject {
	public function getId();
	public function setId($id);
	public function getEventId();
	public function setEventId($eventId);
	public function getUserId();
	public function setUserId($userId);
	//...
}


//
//	PERMISSIONS
//

class AbstractCalendarEventPermission extends SharePermission {
	const VIEW_LIST = 'view_list';
	const INVITE_OTHERS = 'invite';
	const EDIT = 'edit';
	const ALL = 'view_list,invite,edit';
}

class AbstractCalendarPermission extends SharePermission {
	const SHARE = 'share';
	const EDIT = 'edit';
	const SEE = 'see';
	const SEE_DETAILS = 'see_details';
	const ALL = 'see_details,edit,share';
}


//
//	MODEL ABSTRACT CLASSES
//

abstract class AbstractCalendarEvent implements ICalendarEvent {	
	private $id;
	private $subject;
	private $location;
	private $description;
	private $isAllDay;
	private $timeStart;
	private $timeEnd;
	private $creatorId;
	private $type;
	private $calendarId;
	private $privacy;
	private $repetition;
	private $repeatType;
	private $finalType;
	private $finalValue;
    private $eventGroup;
	private $gmtTimeDiffrence;
    
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				// Adaptation for dates, for a more readable format
				if ($name == 'timeStart' || $name == 'timeEnd') {
					$string .= $value . '(' . gmdate('M d Y H:i:s', $value) . '),';
				} else {
					$string .= $name . '=' . $value . ',';
				}
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
	
	public function getId($forceGeneration = true) {
		if ($this->id === null && $forceGeneration) {
			$this->id = ObjectIdGenerator::assignId($this);
		}
		return $this->id;
	}
	
	public function setId($id) {
		if ($this->id !== null) {
			throw new EyeBadMethodCallException('Cannot overwrite existing ID for event ' . $this->id . '.');
		}
		$this->id = $id;
	}
	
	public function getSubject() {
		return $this->subject;
	}
	
	public function setSubject($subject) {
		$this->subject = $subject;
	}
	
	public function getLocation() {
		return $this->location;
	}
	
	public function setLocation($location) {
		$this->location = $location;
	}
	
	public function getDescription() {
		return $this->description;
	}
	
	public function setDescription($description) {
		$this->description = $description;
	}
	
	public function getIsAllDay() {
		return $this->isAllDay;
	}
	
	public function setIsAllDay($isAllDay) {
		$this->isAllDay = $isAllDay;
	}
	
	/**
	 * @return int The UNIX timestamp (in seconds).
	 */
	public function getTimeStart() {
		return $this->timeStart;
	}
	
	/**
	 * @param int $timeStart The UNIX timestamp (in seconds).
	 */
	public function setTimeStart($timeStart) {
		$this->timeStart = $timeStart;
	}
	
	/**
	 * @return int The UNIX timestamp (in seconds).
	 */
	public function getTimeEnd() {
		return $this->timeEnd;
	}
	
	/**
	 * @param int $timeStart The UNIX timestamp (in seconds).
	 */
	public function setTimeEnd($timeEnd) {
		$this->timeEnd = $timeEnd;
	}
	
	
	public function getCreatorId() {
		return $this->creatorId;
	}
	
	public function setCreatorId($principalId) {
		$this->creatorId = $principalId;
	}
	
	
	public function getType() {
		return $this->type;
	}
	
	public function setType($type) {
		$this->type = $type;
	}
	
	public function getCalendarId() {
		return $this->calendarId;
	}
	
	public function setCalendarId($calendarId) {
		$this->calendarId = $calendarId;
	}
	
	public function getPrivacy() {
		return $this->privacy;
	}
	
	public function setPrivacy($privacy) {
		$this->privacy = $privacy;
	}
	
	public function getRepetition() {
		return $this->repetition;
	}
	public function setRepetition($repetition) {
		$this->repetition = $repetition;
	}
    public function getRepeatType() {
		return $this->repeatType;
	}
	public function setRepeatType($repeatType) {
		$this->repeatType = $repeatType;
	}
        public function getFinalType() {
		return $this->finalType;
	}
	public function setFinalType($finalType) {
		$this->finalType = $finalType;
	}
    public function getFinalValue() {
		return $this->finalValue;
	}
	public function setFinalValue($finalValue) {
		$this->finalValue = $finalValue;
	}
    public function getEventGroup() {
		return $this->eventGroup;
	}
	public function setEventGroup($eventGroup) {
		$this->eventGroup = $eventGroup;
	}
	public function getAttributesMap() {
		return get_object_vars($this);
	}
	// for remote calendars	
	public function reSetId($id) {	
		$this->id = $id;
	}
	public function setGmtTimeDiffrence($value) {	
		$this->gmtTimeDiffrence = $value;
	}
	public function getGmtTimeDiffrence() {	
		return $this->gmtTimeDiffrence;
	}
}

abstract class AbstractCalendar implements ICalendar {	
	private $id = null;
	private $name;
	private $description;
	private $timezone;
	private $ownerId;
   
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
	
	public function getId($forceGeneration = true) {
		if ($this->id === null && $forceGeneration) {
			$this->id = ObjectIdGenerator::assignId($this);
		}
		return $this->id;
	}
	
	public function setId($id) {
		if ($this->id !== null) {
			throw new EyeBadMethodCallException('Cannot overwrite existing ID for calendar ' . $this->id . '.');
		}
		$this->id = $id;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getDescription() {
		return $this->description;
	}
	
	public function setDescription($description) {
		$this->description = $description;
	}
	
	public function getTimezone() {
		return $this->timezone;
	}
	
	public function setTimezone($timezone) {
		$this->timezone = $timezone;
	}
	
	public function getOwnerId() {
		return $this->ownerId;
	}
	
	public function setOwnerId($ownerId) {
		$this->ownerId = $ownerId;
	}
	
	public function getAttributesMap() {
		return get_object_vars($this);
	}
	
}

abstract class AbstractRemoteCalendar implements ICalendar {	
	private $id = null;
	private $name;
	private $description;
	private $timezone;
	private $ownerId;
   /* private $username;
    private $password;*/
	
	public function __toString() {
		$props = get_object_vars($this);
		$string = get_class($this) . '[';
		foreach($props as $name => $value) {
			if (!is_object($value) && $value !== null) {
				$string .= $name . '=' . $value . ',';
			}
		}
		$string = utf8_substr($string, 0, -1) . ']';
		return $string;
	}
	
	public function getId($forceGeneration = true) {
		if ($this->id === null && $forceGeneration) {
			$this->id = ObjectIdGenerator::assignId($this);
		}
		return $this->id;
	}
	
	public function setId($id) {
		if ($this->id !== null) {
			throw new EyeBadMethodCallException('Cannot overwrite existing ID for calendar ' . $this->id . '.');
		}
		$this->id = $id;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getDescription() {
		return $this->description;
	}
	
	public function setDescription($description) {
		$this->description = $description;
	}
	
	public function getTimezone() {
		return $this->timezone;
	}
	
	public function setTimezone($timezone) {
		$this->timezone = $timezone;
	}
	
	public function getOwnerId() {
		return $this->ownerId;
	}
	
	public function setOwnerId($ownerId) {
		$this->ownerId = $ownerId;
	}
	
	public function getAttributesMap() {
		return get_object_vars($this);
	}
    public function getUsername() {
		return $this->username;
	}
	public function setUsername($username) {
		$this->username = $username;
	}
    public function getPassword() {
		return $this->password;
	}
	public function setPassword($password) {
		$this->password = $password;
	}
}	
?>