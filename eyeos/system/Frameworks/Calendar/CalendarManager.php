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

define('FRAMEWORK_CALENDAR_CONFIGURATION_FILE_EXTENSION', '.xml');
define('FRAMEWORK_CALENDAR_MODEL_DIR', 'model');
define('FRAMEWORK_CALENDAR_MODEL_PATH', FRAMEWORK_CALENDAR_PATH . '/' . FRAMEWORK_CALENDAR_MODEL_DIR);
define('FRAMEWORK_CALENDAR_PROVIDERS_DIR', 'Providers');
define('FRAMEWORK_CALENDAR_PROVIDERS_PATH', FRAMEWORK_CALENDAR_PATH . '/' . FRAMEWORK_CALENDAR_PROVIDERS_DIR);

class CalendarManager implements ICalendarManager {
	const CALENDAR_KEY_ID = 'id';
	const CALENDAR_KEY_NAME = 'name';
	const CALENDAR_KEY_DESCRIPTION = 'description';
	const CALENDAR_KEY_TIMEZONE = 'timezone';
	const CALENDAR_KEY_OWNERID = 'ownerid';
	
	const EVENT_KEY_ID = 'id';
	const EVENT_KEY_SUBJECT = 'subject';
	const EVENT_KEY_LOCATION = 'location';
	const EVENT_KEY_DESCRIPTION = 'description';
	const EVENT_KEY_ISALLDAY = 'isallday';
	const EVENT_KEY_TIMESTART = 'timestart';
	const EVENT_KEY_TIMEEND = 'timeend';
	const EVENT_KEY_TYPE = 'type';
	const EVENT_KEY_PRIVACY = 'privacy';
	const EVENT_KEY_REPETITION = 'repetition';
    const EVENT_KEY_REPEATTYPE = 'repeattype';
    const EVENT_KEY_FINALTYPE = 'finaltype';
    const EVENT_KEY_FINALVALUE = 'finalvalue';
    const EVENT_KEY_EVENTGROUP = 'eventgroupid';
	const EVENT_KEY_CREATORID = 'creatorid';
	const EVENT_KEY_CALENDARID = 'calendarid';
	const EVENTGROUP_KEY_EVENTSUBJECT = 'eventsubject';
	const EVENTINEVENTGROUP_KEY_EVENTID = 'eventid';
	const EVENTINEVENTGROUP_KEY_EVENTGROUPID = 'eventgroupid';
	const MAX_REPEAT_LIMIT = 10; //
    const CALENDAR_KEY_USERNAME = 'username';
	const CALENDAR_KEY_PASSWORD = 'password';

	/**
	 * @var array(SimpleXmlElement)
	 */
	private static $ConfigurationFiles = array();
	
	private static $Instance = null;
	
	private static $Logger = null;
    private static $isRemoteCalendar = false;
	
	private $provider = null;
	private static $CalendarID = 0;
	private $ProviderLocation='local';
	protected function __construct() {}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
			self::init();
		}
		return self::$Instance;
	}
	
	public function deleteCalendar(ICalendar $calendar) {
		//TODO: add permission checks
		
	
		//SecurityManager::getInstance()->checkDelete($calendar);
	
		$this->getProvider()->deleteCalendar($calendar);
		
		//TODO: fire calendarDeleted event    !! + events deleted !! ?
	}
	
	public function deleteEvent(ICalendarEvent $event) {

		$workGroupId=$this->getProvider()->getGroupIdByCalendarId($event->getCalendarId());
		$this->setCalendarId($event->getCalendarId());
		// check if event belogs to group calendar
		if(count($workGroupId)) {
			SecurityManager::getInstance()->checkDelete($event);
            //SecurityManager::getInstance()->checkGrooupDelete($this);
		}
		$this->getProvider()->deleteEvent($event);
	}
	public function deleteRemoteEvent($params) {
		return $this->getProvider()->deleteEvent($params);
	}

	public function getAllCalendarsFromOwner(IPrincipal $principal) {
		return $this->getProvider()->retrieveAllCalendarsFromOwner($principal);
	}
	
	public function getAllEventsFromCalendar(ICalendar $calendar) {
		return $this->getProvider()->retrieveAllEventsFromCalendar($calendar);
	}
	
	public function getCalendarById($calendarId) {
		return $this->getProvider()->retrieveCalendarById($calendarId);
	}
	
	public function getCalendarPreferences($userId, $calendarId) {
		$prefs = null;
		try {
			$prefs = $this->getProvider()->retrieveCalendarPreferences($userId, $calendarId);
		} catch (EyeCalendarPrefsNotFoundException $e) {
			$prefs = new CalendarPrefs();
			$prefs->setUserId($userId);
			$prefs->setCalendarId($calendarId);
			$prefs->setColor(CalendarPrefs::DEFAULT_COLOR);
		}
		return $prefs;
	}
	
	public static function getConfiguration($filename) {
		if (!is_string($filename)) {
			throw new EyeInvalidArgumentException($filename . ' is not a valid filename.');
		}
		if (!isset(self::$ConfigurationFiles[$filename])) {
			$filename .= FRAMEWORK_CALENDAR_CONFIGURATION_FILE_EXTENSION;
			if (!is_file(FRAMEWORK_CALENDAR_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeFileNotFoundException($filename . ' does not exist.');
			}
			if (!$xmlObject = simplexml_load_file(FRAMEWORK_CALENDAR_CONFIGURATION_PATH . '/' . $filename)) {
				throw new EyeIOException('Unable to load configuration file ' . $filename);
			}
			self::$ConfigurationFiles[$filename] = $xmlObject;
		}
		return self::$ConfigurationFiles[$filename];
	}
	
	public function getEventById($eventId) {
		return $this->getProvider()->retrieveEventById($eventId);
	}
	
	public function getAllEventsByPeriod(ICalendar $calendar, $begin, $end) {
		return $this->getProvider()->retrieveAllEventsFromCalendar($calendar, $begin, $end);
	}
	
	public function getNewCalendar() {
		return new Calendar();
	}
	
	public function getNewEvent() {
		return new CalendarEvent();
	}
    public function setProvider($val = false) {
        self::$isRemoteCalendar = $val;
    }

    /**
	 * Returns an instance of the provider specified in the config file.
	 * 
	 * @return ICalendarProvider
	 */
	protected function getProvider() {
		if ($this->provider === null) {
			$xmlConf= null;
			try {
				$xmlConf = self::getConfiguration(get_class($this));
			} catch (EyeException $e) {
				$xmlConf = self::getConfiguration(__CLASS__);
			}
			
			if($this->ProviderLocation=='remote'){ 
				$providerClassName = (string) $xmlConf->providerClassName[1];
			}else{
				$providerClassName = (string) $xmlConf->providerClassName[0];
			}
			
			if ($providerClassName == '') {
				throw new EyeUnexpectedValueException('No CalendarProvider class has been specified in the configuration file.');
			}
			if (!is_file(FRAMEWORK_CALENDAR_PROVIDERS_PATH . '/' . $providerClassName . '.php')) {
				throw new EyeFileNotFoundException('Unable to find specified CalendarProvider class file: ' . $providerClassName . '.php.');
			}
			require_once FRAMEWORK_CALENDAR_PROVIDERS_PATH . '/' . $providerClassName . '.php';
			if (!class_exists($providerClassName)) {
				throw new EyeClassNotFoundException('Unable to find ' . $providerClassName);
			}
			try {
				$this->provider = call_user_func(array($providerClassName, 'getInstance'));
				if ($this->provider === false) {
					throw new EyeBadMethodCallException('Unable to create instance of the CalendarProvider class ' . $providerClassName);
				}
			} catch(EyeErrorException $e) {
				throw new EyeCalendarException('Unable to create instance of the CalendarProvider class ' . $providerClassName, 0, $e);
			}
		}

		return $this->provider;
	}
	
	protected static function init() {
		self::$Logger = Logger::getLogger('system.frameworks.Calendar.CalendarManager');
		$dir = new DirectoryIterator(FRAMEWORK_CALENDAR_MODEL_PATH);
		foreach($dir as $fileInfo) {
			if ($fileInfo->isFile()) {
              require_once FRAMEWORK_CALENDAR_MODEL_PATH . '/' . $fileInfo->getFilename();
			}
		}
	}
	
	public function saveCalendar(ICalendar $calendar) {
		try {
			try {
				$this->getProvider()->retrieveCalendarById($calendar->getId());
			} catch (EyeCalendarNotFoundException $e) {
				$this->getProvider()->createCalendar($calendar);
				
				self::$Logger->info('Calendar created: ' . $calendar);
				return;
			}
			$this->getProvider()->updateCalendar($calendar);
			
			self::$Logger->info('Calendar updated: ' . $calendar);
			
		} catch (Exception $e) {
			throw new EyeCalendarException('An error occured while saving calendar with ID ' . $calendar->getId() . ' (' . $calendar->getName() . ').', 0, $e);
		}
	}
	public function saveRemoteCalendar(ICalendar $calendar) {
          try{
            $this->getProvider()->createCalendar($calendar);
          } catch (EyeCalendarNotFoundException $e) {
              throw new EyeCalendarException('An error occured while saving calendar with ID ' . $calendar->getId() . ' (' . $calendar->getName() . ').', 0, $e);
          }
    }
	public function saveCalendarPreferences(ICalendarPrefs $calendarPrefs) {
		try {
			try {
				$tempObj = $this->getProvider()->retrieveCalendarPreferences($calendarPrefs->getUserId(), $calendarPrefs->getCalendarId());
				
				// If the object has been found, get its ID for update process
				$calendarPrefs->setId($tempObj->getId());
			} catch (EyeCalendarPrefsNotFoundException $e) {
				$this->getProvider()->createCalendarPreferences($calendarPrefs);
				return;
			}
			$this->getProvider()->updateCalendarPreferences($calendarPrefs);
		} catch (Exception $e) {
			throw new EyeCalendarException('An error occured while saving preferences for calendar with ID ' . $calendarPrefs->getCalendarId() . '.', 0, $e);
		}
	}
	
	public function saveEvent(ICalendarEvent $event) {
			try {
				$this->getProvider()->retrieveCalendarById($event->getCalendarId());
				$this->setCalendarId($event->getCalendarId()); 
			} catch (EyeCalendarNotFoundException $e) {
				throw new EyeIntegrityConstraintViolationException('Cannot add an event to the unknown calendar "' . $event->getCalendarId() . '".', 0, $e);
			}
			
			try {
				$this->getProvider()->retrieveEventById($event->getId());
			} catch (EyeEventNotFoundException $e) {
				SecurityManager::getInstance()->checkWrite($this); 
				$eventId=$this->getProvider()->createEvent($event);
				self::$Logger->info('CalendarEvent created: ' . $event);
				return $eventId;
			}

			SecurityManager::getInstance()->checkWrite($this);
			$this->getProvider()->updateEvent($event);		
			self::$Logger->info('CalendarEvent updated: ' . $event);
	}
	
	public function search($string, ICalendar $calendar) {
		throw new EyeNotImplementedException(__METHOD__);
	}
	public function getAllGroupCalendarsFromOwner(IPrincipal $principal) {
		
		return $this->getProvider()->retrieveAllGroupCalendarsFromOwner($principal);
	}
	public function getAllRemoteCalendarsFromOwner($params) {
		return $this->getProvider()->retrieveAllRemoteCalendarsFromOwner($params);
	}
	public function getWorkgroup() {
		// return the work group of the saved calendar
           
		$calendarId = $this->getCalendarId();
		if (!$calendarId) {
			throw new EyeInvalidArgumentException('Unable to find which workgroup.');
		}

		$workGroupId=$this->getProvider()->getGroupIdByCalendarId($calendarId);
		
		if(count($workGroupId))
			return UMManager::getInstance()->getWorkgroupById($workGroupId[0]['workgroupid']);
		else
			return array(); // if calendar not belongs to any group
	}
	public function setCalendarId($calendarId) {
		
		self::$CalendarID=$calendarId;
	}
	public function getCalendarId() {
		return self::$CalendarID;
	}	
	public function saveEventGroup($eventSubject) {
		
		return $this->getProvider()->saveEventGroup($eventSubject);
	}
	public function saveEventInEventGroup($eventId,$eventGroupId) {
		
		$this->getProvider()->saveEventInEventGroup($eventId,$eventGroupId);
	}
        public function getGroupEvents($groupId) {
		return $this->getProvider()->retrieveGroupEvents($groupId);
	}

        public function deleteEventGroup($groupId) {
		return $this->getProvider()->deleteEventGroup($groupId);
	}
        public function deleteEventInEventGroup($eventId, $groupId) {
		return $this->getProvider()->deleteEventInEventGroup($eventId, $groupId);
	}
     	
	public function saveAllEvent(ICalendarEvent $event) {
		try {
			try {
				$this->getProvider()->retrieveCalendarById($event->getCalendarId());
				$this->setCalendarId($event->getCalendarId());
			} catch (EyeCalendarNotFoundException $e) {
				throw new EyeIntegrityConstraintViolationException('Cannot add an event to the unknown calendar "' . $event->getCalendarId() . '".', 0, $e);
			}

			try {
				$this->getProvider()->retrieveEventById($event->getId());
			} catch (EyeEventNotFoundException $e) {
				SecurityManager::getInstance()->checkWrite($this);
				$eventId=$this->getProvider()->createEvent($event);
				self::$Logger->info('CalendarEvent created: ' . $event);
				return $eventId;
			}
			// + prevent updating creatorId (and calendarId if insufficient permission on target one)
			SecurityManager::getInstance()->checkWrite($this);
			$this->getProvider()->updateAllEvent($event);
			self::$Logger->info('CalendarEvent updated: ' . $event);
		} catch (Exception $e) {
			throw new EyeCalendarException('An error occured while saving event with ID ' . $event->getId() . ' (' . $event->getSubject() . ').', 0, $e);
		}
	}
    public function getFirstEventOfGroup($groupId) {
            return $this->getProvider()->getFirstEventOfGroup($groupId);
    }
    public function deleteAllGroupEvents($event,$groupId) {
		$this->setCalendarId($event->getCalendarId());
		SecurityManager::getInstance()->checkDelete($event);
		$this->getProvider()->deleteAllGroupEvents($groupId);
	}
	public function getMaxEventLimit() {
		return self::MAX_REPEAT_LIMIT;
	}
 	public function updateRemoteEvent($params) {
          return $this->getProvider()->updateEvent($params);
    }
	public function setProviderLocation($value) {
		$this->ProviderLocation=$value;
	}
	public function getProviderLocation() {
		return $this->ProviderLocation;
	}
	public function getNewRemoteCalendar() {
		return new EyeRemoteCalendar();
	}
	
	
}
?>