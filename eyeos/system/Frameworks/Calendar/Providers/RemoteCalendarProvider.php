<?php

define('FRAMEWORK_CALENDAR_CALDAV_DIR', 'calDavLib');
define('FRAMEWORK_CALENDAR_CALDAV_LIB_PATH', FRAMEWORK_CALENDAR_PATH . '/' . FRAMEWORK_CALENDAR_CALDAV_DIR);

require_once FRAMEWORK_CALENDAR_CALDAV_LIB_PATH . '/calendar.class.php';
require_once FRAMEWORK_CALENDAR_CALDAV_LIB_PATH . '/When.php';

class RemoteCalendarProvider  {
	const REMOTE_CALENDAR_TABLE_NAME = 'calendarremote';
	/**
	 * @var PDO
	 */
    private static $Connection = null;
	private static $emailid = null;
    private static $password = null;

	private static $Instance = null;

	public function __construct() {}

	protected static function convertResultsToCalendarObjects(array $results) {
		$return = array();
		foreach($results as $result) {
			$obj = new EyeRemoteCalendar();
			$obj->setId($result[CalendarManager::CALENDAR_KEY_ID]);
			$obj->setName($result[CalendarManager::CALENDAR_KEY_NAME]);
			$obj->setDescription($result[CalendarManager::CALENDAR_KEY_DESCRIPTION]);
            $obj->setUsername($result[CalendarManager::CALENDAR_KEY_USERNAME]);
			$obj->setPassword($result[CalendarManager::CALENDAR_KEY_PASSWORD]);
			$obj->setTimezone($result[CalendarManager::CALENDAR_KEY_TIMEZONE]);
			$obj->setOwnerId($result[CalendarManager::CALENDAR_KEY_OWNERID]);
			$return[] = $obj;
		}
		return $return;
	}

	protected static function convertResultsToCalendarPrefsObjects(array $results) {
		$return = array();
		foreach($results as $result) {
			$obj = new CalendarPrefs();
			$obj->setId($result[CalendarManager::CALENDARPREFS_KEY_ID]);
			$obj->setUserId($result[CalendarManager::CALENDARPREFS_KEY_USERID]);
			$obj->setCalendarId($result[CalendarManager::CALENDARPREFS_KEY_CALENDARID]);
			$obj->setColor($result[CalendarManager::CALENDARPREFS_KEY_COLOR]);
			$obj->setNotifications($result[CalendarManager::CALENDARPREFS_KEY_NOTIFICATIONS]);
			$obj->setVisible($result[CalendarManager::CALENDARPREFS_KEY_VISIBLE]);
			$return[] = $obj;
		}
		return $return;
	}

	protected static function convertResultsToEventObjects(array $results) {
		$return = array();
		foreach($results as $result) {
			$obj = new CalendarEvent();
			$obj->setId($result[CalendarManager::EVENT_KEY_ID]);
			$obj->setSubject($result[CalendarManager::EVENT_KEY_SUBJECT]);
			$obj->setLocation($result[CalendarManager::EVENT_KEY_LOCATION]);
			$obj->setDescription($result[CalendarManager::EVENT_KEY_DESCRIPTION]);
			$obj->setIsAllDay($result[CalendarManager::EVENT_KEY_ISALLDAY]? true : false);
			$obj->setTimeStart($result[CalendarManager::EVENT_KEY_TIMESTART]);
			$obj->setTimeEnd($result[CalendarManager::EVENT_KEY_TIMEEND]);
			$obj->setType($result[CalendarManager::EVENT_KEY_TYPE]);
			$obj->setPrivacy($result[CalendarManager::EVENT_KEY_PRIVACY]);
			$obj->setRepetition($result[CalendarManager::EVENT_KEY_REPETITION]);
            $obj->setRepeatType($result[CalendarManager::EVENT_KEY_REPEATTYPE]);
            $obj->setFinalType($result[CalendarManager::EVENT_KEY_FINALTYPE]);
            $obj->setFinalValue($result[CalendarManager::EVENT_KEY_FINALVALUE]);
            $obj->setEventGroup($result[CalendarManager::EVENT_KEY_EVENTGROUP]);
			$obj->setCreatorId($result[CalendarManager::EVENT_KEY_CREATORID]);
			$obj->setCalendarId($result[CalendarManager::EVENT_KEY_CALENDARID]);
			$return[] = $obj;
		}
		return $return;
	}

	public function createCalendar(ICalendar $calendar) {
		try {
			$dbHandler = $this->getConnection();

			$data = array(
				CalendarManager::CALENDAR_KEY_ID => $calendar->getId(),
				CalendarManager::CALENDAR_KEY_NAME => $calendar->getName(),
				CalendarManager::CALENDAR_KEY_DESCRIPTION => $calendar->getDescription(),
				CalendarManager::CALENDAR_KEY_TIMEZONE => $calendar->getTimezone(),
				CalendarManager::CALENDAR_KEY_OWNERID => $calendar->getOwnerId(),
                CalendarManager::CALENDAR_KEY_USERNAME => $calendar->getUsername(),
				CalendarManager::CALENDAR_KEY_PASSWORD => $calendar->getPassword()
			);

			$sqlQuery = 'INSERT INTO ' . self::REMOTE_CALENDAR_TABLE_NAME . ' VALUES ('
				. ' :' . CalendarManager::CALENDAR_KEY_ID . ','
				. ' :' . CalendarManager::CALENDAR_KEY_NAME . ','
				. ' :' . CalendarManager::CALENDAR_KEY_DESCRIPTION . ','
				. ' :' . CalendarManager::CALENDAR_KEY_TIMEZONE . ','
				. ' :' . CalendarManager::CALENDAR_KEY_OWNERID . ','
                . ' :' . CalendarManager::CALENDAR_KEY_USERNAME . ','
				. ' :' . CalendarManager::CALENDAR_KEY_PASSWORD . ')';

           // print_r($sqlQuery);

			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while attempting to store calendar data.', 0, $e);
		}

	}

	public function createCalendarPreferences(ICalendarPrefs $calendarPrefs) {
		$dao = StorageManager::getInstance()->getHandler('SQL/EyeosDAO');
		$dao->create($calendarPrefs);
		unset($dao);
	}

	public function createEvent(ICalendarEvent $event) {  
	
	
	$filter = array(
			CalendarManager::CALENDAR_KEY_ID => $event->getCalendarid()
			);
		$calendarData=self::retrieveCalendarData($filter);
				
          $cal = self::getRemoteCalendar($calendarData);
	
	
	
	$data = array(			
			//'DTSTAMP' => $event->getSubject(),
			//'ORGANIZER' => $event->getLocation(),
			//'CREATED' => $event->getDescription(),
			//'UID' => $event->getId(),
			//'SEQUENCE' => $event->getTimeStart(),
			//'LAST-MODIFIED' => $event->getTimeEnd(),
			'SUMMARY' => $event->getSubject(),
			//'CLASS' => $event->getPrivacy(),
			//'PRIORITY' => $event->getRepetition(),
			//'RRULE' => $event->getRepeatType(),
			//'EXDATE' => $event->getFinalType(),
			//'DTSTART' => CalDavConverter::toCalDavDate($event->getTimeStart()),
			//'DTEND' => CalDavConverter::toCalDavDate($event->getTimeEnd()),
			//'DTSTART' => "20110430T000000",
			//'DTEND' => "20110430T235959",
			//'TRANSP' => $event->getCalendarId(),				
			//'ATTENDEE' => $event->getRepeatType(),
			//'DURATION' => $event->getFinalType(),
			'LOCATION' => $event->getLocation(),
		   // 'STATUS' => $event->getCreatorId(),
			'DESCRIPTION' => $event->getDescription()
		);
	$gmtTimeDiffrence=$event->getGmtTimeDiffrence();
	
	$ev = $cal->newComponent('VEVENT');
	$ev->setAllProperties($data);
 	
	$isAllDay=$event->getIsAllDay();
	if($isAllDay){	
		$ev->getBaseComponent()->addProperty('DTSTART' , CalDavConverter::toCalDavDate($event->getTimeStart(),$isAllDay,$gmtTimeDiffrence),array('VALUE' => 'DATE'));
		$ev->getBaseComponent()->addProperty('DTEND' , CalDavConverter::toCalDavDate($event->getTimeStart()+86400,$isAllDay,$gmtTimeDiffrence),array('VALUE' => 'DATE'));
	}else{
		$ev->getBaseComponent()->addProperty('DTSTART' , CalDavConverter::toCalDavDate($event->getTimeStart(),$isAllDay,$gmtTimeDiffrence));
		$ev->getBaseComponent()->addProperty('DTEND' , CalDavConverter::toCalDavDate($event->getTimeEnd(),$isAllDay,$gmtTimeDiffrence));
	}
	
	if($event->getRepeatType()=='d'){
		if($event->getFinalType()==1){
			$rrule='FREQ=DAILY';
			
		} else if($event->getFinalType()==2){		
			$rrule='FREQ=DAILY;UNTIL='.CalDavConverter::toCalDavDate($event->getFinalValue(),1 ,$gmtTimeDiffrence) ;
			
		} else if($event->getFinalType()==3){
			$rrule='FREQ=DAILY;COUNT='.$event->getFinalValue();
			
		}
		$ev->getBaseComponent()->addProperty('RRULE' , $rrule);
	}else if ($event->getRepeatType()=='w'){
		$finalTS=$event->getFinalValue()+$gmtTimeDiffrence*3600;
		$weekday=strtoupper(substr(date('l',$finalTS),0,2));
		
		if($event->getFinalType()==1){						
			$rrule='FREQ=WEEKLY;BYDAY='.$weekday;
			
		} else if($event->getFinalType()==2){
			$rrule='FREQ=WEEKLY;UNTIL='.CalDavConverter::toCalDavDate($event->getFinalValue(),0,$gmtTimeDiffrence ).';BYDAY='.$weekday;
			
		} else if($event->getFinalType()==3){
			$rrule='FREQ=WEEKLY;COUNT='.$event->getFinalValue().';BYDAY='.$weekday;
			
		}
		$ev->getBaseComponent()->addProperty('RRULE' , $rrule);
	}else if ($event->getRepeatType()=='m'){
		$finalTS=$event->getTimeStart()+$gmtTimeDiffrence*3600;
		$monthday=date('d',$finalTS);
		
		if($event->getFinalType()==1){						
			$rrule='FREQ=YEARLY;BYMONTHDAY='.$monthday;
			
		} else if($event->getFinalType()==2){
			$rrule='FREQ=YEARLY;UNTIL='.CalDavConverter::toCalDavDate($event->getFinalValue(),0 ,$gmtTimeDiffrence).';BYMONTHDAY='.$monthday;
			
		} else if($event->getFinalType()==3){
			$rrule='FREQ=YEARLY;COUNT='.$event->getFinalValue().';BYMONTHDAY='.$monthday;
			
		}
		$ev->getBaseComponent()->addProperty('RRULE' , $rrule);
	}else if ($event->getRepeatType()=='y'){
		$finalTS=$event->getTimeStart()+$gmtTimeDiffrence*3600;
		$monthday=date('d',$finalTS);
		
		if($event->getFinalType()==1){						
			$rrule='FREQ=YEARLY';
			
		} else if($event->getFinalType()==2){
			$rrule='FREQ=YEARLY;UNTIL='.CalDavConverter::toCalDavDate($event->getFinalValue(),0,$gmtTimeDiffrence );
			
		} else if($event->getFinalType()==3){
			$rrule='FREQ=YEARLY;COUNT='.$event->getFinalValue();
			
		}
		$ev->getBaseComponent()->addProperty('RRULE' , $rrule);
	}
	
		
		$etag=$ev->getEtag();
		//$eventIdArr =  $cal->getAllRecurenceIdOfEvent($ev); 
		
		$updatedEvent=$cal->update($ev->getUrl(),$ev->getEtag()); 
		$updatedUrl=$updatedEvent.'.ics';
		//print_r($updatedEvent);
		
		/*$calUpdated = self::getRemoteCalendar($calendarData);
		
		foreach ($calUpdated as $updatedCal){
			//echo $updatedCal->getEtag().'=='.$etag;
			if($updatedCal->getEtag()==$etag){
				$updatedUrl=$updatedCal->getUrl();
			
			}
		
		}*/
		
		
		$startDate=  date("Ymd\THis\Z",$event->getTimeStart());  
		$endDate=  date("Ymd\THis\Z",$event->getTimeEnd()); 
		
		 
		$creator = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		  
		$start = new When();
		$start->recur($startDate)->rrule($rrule);
		
		$end = new When();
		$end->recur($endDate)->rrule($rrule);
		
		$repeated=false;
		if($event->getRepeatType()!='n'){
			$repeated=true;
		}
		
		$maxRepeatLimit=CalendarManager::MAX_REPEAT_LIMIT;
		if($repeated){ 
			for($i=0; $i<$maxRepeatLimit; $i++ ){ 	
					
					$sDate=$start->next(); 
					
					if(!is_object($sDate)){	
						break;
					}			
					$timeStart=	$sDate->getTimestamp (); 
					
					$eDate=$end->next(); 			
					$timeEnd=	$eDate->getTimestamp (); 
					
										
					$newEvent = CalendarManager::getInstance()->getNewEvent();
					
					$eventId=$updatedUrl.'_'.$i;  
					$newEvent->setId($eventId);
					$newEvent->setSubject($event->getSubject());
					$newEvent->setTimeStart($timeStart);
					$newEvent->setTimeEnd($timeEnd);
					$newEvent->setCalendarId($event->getCalendarId());
					$newEvent->setIsAllDay($event->getIsAllDay());
					$newEvent->setRepetition($event->getRepetition());
					$newEvent->setRepeatType($event->getRepeatType());
					$newEvent->setLocation($event->getLocation());
					$newEvent->setDescription($event->getDescription());
					$newEvent->setFinalType($event->getFinalType());
					$newEvent->setFinalValue($event->getFinalValue());
					//$newEvent->seteventGroup(1);	// its repeat event so we need to set it to greater then 0
					$newEvent->setCreatorId($creator->getId());
					$newEvent->setEventGroup(1);
					$newRepeatEventArr[] = $newEvent;
					
					
				}
			}else{
				$event->reSetId($updatedUrl);
				$newRepeatEventArr[] = $event;	
			}
         // print_r($newRepeatEventArr); die;
         return $newRepeatEventArr;
	}

	public function deleteCalendar(ICalendar $calendar) {
		try {
			$dbHandler = $this->getConnection();		
			
			// then delete calendar it self
			$data = array(
				CalendarManager::EVENT_KEY_ID => $calendar->getId()
			);
			$sqlQuery = 'DELETE FROM ' . self::REMOTE_CALENDAR_TABLE_NAME
				.' WHERE ' . CalendarManager::CALENDAR_KEY_ID . ' = :' . CalendarManager::CALENDAR_KEY_ID;
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($data);
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while deleting event from base.', 0, $e);
		}
		$this->destroyConnection();
	}

	

	private function destroyConnection() {
		if (self::$Connection instanceof PDO) {
			self::$Connection = null;
		}
	}

	private function getConnection() {
		if (! isset(self::$Connection)) {
			$dbHandler = null;
			try {
				$dbHandler = new PDO(SQL_CONNECTIONSTRING, SQL_USERNAME, SQL_PASSWORD);
				$dbHandler->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			} catch (PDOException $e) {
				throw new EyeDBException('An error occured while getting connection to the database.', 0, $e);
			}
			self::$Connection = $dbHandler;
		}
		return self::$Connection;
	}
	
	
	public function deleteEvent($params) { 
          $eventIdArr = null;
		  $filter = array(
			CalendarManager::CALENDAR_KEY_ID => $params['calendarId']
          );
          $calendarData=self::retrieveCalendarData($filter);
          $cal = self::getRemoteCalendar($calendarData);
          $thisEvent = null; 
          $curEtagArr = explode("_",$params["eventId"]); 
          foreach ($cal as $obj1) {	
                if($curEtagArr[0] == $obj1->getUrl()) {
                      $thisEvent = $obj1;
                }
          }
          $props = $thisEvent->getBaseComponent()->getProperties();
          $event = array();
          foreach ($props as $prop) {
              switch ($prop->name) {
                  case "DTSTART": 
                      $params["dtstartzone"] = isset($prop->parameters["TZID"])?$prop->parameters["TZID"]:"";
                      break;
                  case "DTEND": 
                      $params["dtendzone"] = isset($prop->parameters["TZID"])?$prop->parameters["TZID"]:"";
                      break;
                  case "UID": $params["uid"] = $prop->content;
                      break;
              }
          }
          if($params['isDeleteAll'] == '1') {
                $eventIdArr =  $cal->getAllRecurenceIdOfEvent($thisEvent);
          }
          $params['dtstart'] = CalDavConverter:: dateEyeosToCalDav($params['dtstart']);
          $thisEvent->delete($params,$cal);
          return $eventIdArr;
          
	}
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
		}
		return self::$Instance;
	}
	public function retrieveAllEventsFromCalendar(ICalendar $calendar, $timeFrom = null, $timeTo = null) {
		$filter = array(
			CalendarManager::CALENDAR_KEY_ID => $calendar->getId()
		);
		if ($timeFrom !== null) {
			$filter[CalendarManager::EVENT_KEY_TIMESTART] = array('>', $timeFrom);
		}
		if ($timeTo !== null) {
			$filter[CalendarManager::EVENT_KEY_TIMEEND] = array('<', $timeTo);
		}
		return self::convertResultsToEventObjects($this->retrieveAllEventsWithFilter($filter));
 
	}
    
	protected function retrieveAllEventsWithFilter(array $filter = null) { 
		try {
			if ($filter === null) {
				$filter = array();
			}
			
			$dbHandler = $this->getConnection();
			$sqlFilter = array();
			$sqlQuery = "SELECT * FROM " . self::REMOTE_CALENDAR_TABLE_NAME. " WHERE 1" ;
				foreach($filter as $key => $filterData) {
				// complex filter (=> more than a simple "=")
					if (is_array($filterData)) {
					if (!is_string($filterData[0])) {
					throw new EyeInvalidArgumentException('$filterData[0] must be string representing a SQL operator (LIKE, >, <, <=, ...).');
					}
					$operator = $filterData[0];
					$value = $filterData[1];
				} else {
					$operator = '=';
					$value = $filterData;
				}
				
				$sqlQuery .= ' AND ' . $key . ' ' . $operator . ' :' . $key;
				$sqlFilter[$key] = $value;
			}
				
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($filter);
			$remoteCalendar= $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			$filter['calendarId']= $remoteCalendar[0]['id'];
			$filter['username']= $remoteCalendar[0]['username'];
			$filter['password']= $remoteCalendar[0]['password'];
			
			$cal = self::getRemoteCalendar($filter); 
			$events = $cal->getAllEvents();
			return CalDavConverter::eventsFromCalDav($events);			
		 
			} catch (PDOException $e) {
				$this->destroyConnection();
				throw new EyeDBException('An error occured while retrieving data from base.', 0, $e);
			}
			$this->destroyConnection();
	}
    
    protected  function sortByDate($a, $b) {
            return strcmp($a["dtstart"], $b["dtstart"]);
    }

	public function retrieveCalendarById($calendarId) {
      if (!is_string($calendarId) || $calendarId == '') {
			throw new EyeInvalidArgumentException('$calendarId must be a non-empty string.');
		}

		$cal = $this->retrieveAllCalendarsWithFilter(array(
			CalendarManager::CALENDAR_KEY_ID => $calendarId
		));
		$this->destroyConnection();
		if (count($cal) === 0) {
			throw new EyeCalendarNotFoundException('Unknown calendar with ID "' . $calendarId . '".');
		}
		return current(self::convertResultsToCalendarObjects($cal));


       // $cal = array(array('id'=>'fcppicqrfm5f5s6a5dltrkjbu4','name'=>'pCalendar 0222','description'=>'Test Cal','timezone'=>'Asia/Calcutta','ownerid'=>'cis.dev22@gmail.com'));
		return current(self::convertResultsToCalendarObjects($cal));
	}
    
    protected function retrieveAllCalendarsWithFilter(array $filter = null) {
		try {
			if ($filter === null) {
				$filter = array();
			}
			$dbHandler = $this->getConnection();

			$sqlQuery = 'SELECT * FROM ' . self::REMOTE_CALENDAR_TABLE_NAME . ' WHERE 1';
			foreach($filter as $key => $value) {
				$sqlQuery .= ' AND ' . $key . ' = :' . $key;
			}
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($filter);
			return $stmt->fetchAll(PDO::FETCH_ASSOC);
		} catch (PDOException $e) {
			$this->destroyConnection();
			throw new EyeDBException('An error occured while retrieving data from base.', 0, $e);
		}
	}

	public function retrieveCalendarPreferences($userId, $calendarId) {
		if (!is_string($userId) || $userId == '') {
			throw new EyeInvalidArgumentException('$userId must be a non-empty string.');
		}
		if (!is_string($calendarId) || $calendarId == '') {
			throw new EyeInvalidArgumentException('$calendarId must be a non-empty string.');
		}

		$dao = StorageManager::getInstance()->getHandler('SQL/EyeosDAO');

		$calendarPrefs = new CalendarPrefs();
		$calendarPrefs->setUserId($userId);
		$calendarPrefs->setCalendarId($calendarId);

		$calendarPrefs = $dao->search($calendarPrefs);
		unset($dao);
		if (count($calendarPrefs) === 0) {
			throw new EyeCalendarPrefsNotFoundException('Unknown calendar preferences with user ID "' . $userId . '" and calendar ID "' . $calendarId . '".');
		}
		return current($calendarPrefs);
 
	}

	public function retrieveEventById($eventId) {/*
	if (!is_string($eventId) || $eventId == '') {
			throw new EyeInvalidArgumentException('$eventId must be a non-empty string.');
		}
		
		$events = $this->retrieveAllEventsWithFilter(array(
			CalendarManager::EVENT_KEY_ID => $eventId
		));
		$this->destroyConnection();
		if (count($events) === 0) {
			throw new EyeEventNotFoundException('Unknown event with ID "' . $eventId . '"');
		}
		return current(self::convertResultsToEventObjects($events));
 */
 		throw new EyeEventNotFoundException('Unknown event with ID "' . $eventId . '"');
	}
	public function updateEvent($params) {  
	
		$filter = array(
			CalendarManager::CALENDAR_KEY_ID => $params['calendarId']
		);
		$calendarData=self::retrieveCalendarData($filter);
		
		$cal = self::getRemoteCalendar($calendarData);
		$urls=explode('_',$params['id']);
		$url=$urls[0];
		foreach ($cal as $obj1) {	
                if($url == $obj1->getUrl()) {
                      $thisEvent = $obj1;
                }
         }
		 $props = $thisEvent->getBaseComponent()->getProperties();
		 
		  foreach ($props as $prop) {
                if($prop->name=="DTSTART"){                       
					$dtstartzone = isset($prop->parameters["TZID"])?$prop->parameters["TZID"]:"";
					$params['dtstartzone']=$dtstartzone;
					$dtStartForAll=$prop->content;
				}
				if($prop->name=="DTEND"){                       
					$dtEndForAll=$prop->content;
				}		                          
           }
        
		
		
		//if (!$params['isEditAll'] && $params['eventGroup'] > 0) 
		if (!$params['isEditAll'] ) 
		{  // edit on only this.
			$thisEvent = $cal->newComponent('VEVENT');			
			$thisEvent->update($params,$cal);
			$repeated=false;
			/*$startDate=  date("Ymd\THis\Z",$params['timeStart']);  
			$endDate=  date("Ymd\THis\Z",$params['timeEnd']); */
			
			$startDate=  date("Ymd\THis\Z",CalDavConverter::dateCalDavToEyeos($dtStartForAll)-$params['gmtTimeDiffrence']*3600);  
			$endDate=  date("Ymd\THis\Z",CalDavConverter::dateCalDavToEyeos($dtEndForAll)-$params['gmtTimeDiffrence']*3600); 
		
		} else {// edit all events			
			$newValues = array('DTSTART'=>$params['dtstart'],'DTEND'=>$params['dtend'],'SUMMARY'=>$params['subject'],'LOCATION'=>$params['location'],'DESCRIPTION'=>$params['description']);
			$thisEvent->setAllProperties($newValues);
			$cal->update($thisEvent->getUrl(),$thisEvent->getEtag());	
			$repeated=true;	
			$startDate=  date("Ymd\THis\Z",CalDavConverter::dateCalDavToEyeos($dtStartForAll)-$params['gmtTimeDiffrence']*3600);  
			$endDate=  date("Ymd\THis\Z",CalDavConverter::dateCalDavToEyeos($dtEndForAll)-$params['gmtTimeDiffrence']*3600); 
		}
		
		$creator = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		  
		$start = new When();
		$start->recur($startDate)->rrule($rrule);
		
		$end = new When();
		$end->recur($endDate)->rrule($rrule);
		
		/*$repeated=false;
		if($params['repeatType']!='n'){
			$repeated=true;
		}*/
		
		$maxRepeatLimit=CalendarManager::MAX_REPEAT_LIMIT;
		$repeated=true;
		if($repeated){ 
			for($i=0; $i<$maxRepeatLimit; $i++ ){ 	
					
					$sDate=$start->next(); 
					
					if(!is_object($sDate)){	
						break;
					}			
					$timeStart=	$sDate->getTimestamp (); 
					
					$eDate=$end->next(); 			
					$timeEnd=	$eDate->getTimestamp (); 
					
										
					$newEvent = CalendarManager::getInstance()->getNewEvent();
					
					$eventId=$url.'_'.$i;  
					$newEvent->setId($eventId);
					$newEvent->setSubject($params['subject']);
					$newEvent->setTimeStart($timeStart);
					$newEvent->setTimeEnd($timeEnd);
					$newEvent->setCalendarId($params['calendarId']);
					$newEvent->setIsAllDay($params['isAllDay']);
					$newEvent->setRepetition($params['repetition']);
					$newEvent->setRepeatType($params['repeatType']);
					$newEvent->setLocation($params['location']);
					$newEvent->setDescription($params['description']);
					$newEvent->setFinalType($params['finalType']);
					$newEvent->setFinalValue($params['finalValue']);
					//$newEvent->seteventGroup(1);	// its repeat event so we need to set it to greater then 0
					$newEvent->setCreatorId($creator->getId());
					$newEvent->setEventGroup(1);
					$newRepeatEventArr[] = $newEvent;
					
					
				}
			}else{
				$newEvent = CalendarManager::getInstance()->getNewEvent();
					
					$eventId=$url;  
					$newEvent->setId($eventId);
					$newEvent->setSubject($params['subject']);
					$newEvent->setTimeStart($params['timeStart']);
					$newEvent->setTimeEnd($params['timeEnd']);
					$newEvent->setCalendarId($params['calendarId']);
					$newEvent->setIsAllDay($params['isAllDay']);
					$newEvent->setRepetition($params['repetition']);
					$newEvent->setRepeatType($params['repeatType']);
					$newEvent->setLocation($params['location']);
					$newEvent->setDescription($params['description']);
					$newEvent->setFinalType($params['finalType']);
					$newEvent->setFinalValue($params['finalValue']);
					//$newEvent->seteventGroup(1);	// its repeat event so we need to set it to greater then 0
					$newEvent->setCreatorId($creator->getId());
					$newEvent->setEventGroup(0);
					$newRepeatEventArr[] = $newEvent;
					
				
			}
			//print_r($newRepeatEventArr);
			return $newRepeatEventArr;
	}

	public function search($string, ICalendar $calendar) {
		throw new EyeNotImplementedException(__METHOD__);
	}
	public function retrieveAllRemoteCalendarsFromOwner($params) {

            $cal = $this->retrieveAllCalendarsWithFilter();
            $this->destroyConnection();

            foreach($cal as $c) {
                
            }

            return self::convertResultsToCalendarObjects($cal);

           // $cal = array(array('id'=>'fcppicqrfm5f5s6a5dltrkjbu4','name'=>'pCalendar 0222','description'=>'Test Cal','timezone'=>'Asia/Calcutta','ownerid'=>'cis.dev22@gmail.com'));
            //return self::convertResultsToCalendarObjects($cal);
	}


    
    public function  getRemoteCalendar($params) {
		
	
		/*$params['calendarId']='https://www.google.com/calendar/dav/2f972snsoj4tv9qo4j44eflhmo@group.calendar.google.com/events/';
                        $params['username']='cis.dev22@gmail.com';
                        $params['password']='cis123@@';*/
						
          $cal = new RemoteCalendar(
                       
                        $params['calendarId'],
                        $params['username'],
                        $params['password']
        );
        $cal->getAllComponents();
        
        //$cal->getComponents("20090830T000000Z", "20501201T000000Z");
		return $cal;
    }
   public function retrieveAllCalendarsFromOwner(IPrincipal $principal) {
		return self::convertResultsToCalendarObjects($this->retrieveAllCalendarsWithFilter(array(
			CalendarManager::CALENDAR_KEY_OWNERID => $principal->getId()
		)));
	}
	protected function retrieveCalendarData(array $filter = null) { 
		try {
			if ($filter === null) {
				$filter = array();
			}
			
			$dbHandler = $this->getConnection();
			$sqlFilter = array();
			$sqlQuery = "SELECT * FROM " . self::REMOTE_CALENDAR_TABLE_NAME. " WHERE 1" ;
				foreach($filter as $key => $filterData) {
				// complex filter (=> more than a simple "=")
					if (is_array($filterData)) {
					if (!is_string($filterData[0])) {
					throw new EyeInvalidArgumentException('$filterData[0] must be string representing a SQL operator (LIKE, >, <, <=, ...).');
					}
					$operator = $filterData[0];
					$value = $filterData[1];
				} else {
					$operator = '=';
					$value = $filterData;
				}
				
				$sqlQuery .= ' AND ' . $key . ' ' . $operator . ' :' . $key;
				$sqlFilter[$key] = $value;
			}
				
			$stmt = $dbHandler->prepare($sqlQuery);
			$stmt->execute($filter);
			$remoteCalendar= $stmt->fetchAll(PDO::FETCH_ASSOC);
			
			$returnArray['calendarId']= $remoteCalendar[0]['id'];
			$returnArray['username']= $remoteCalendar[0]['username'];
			$returnArray['password']= $remoteCalendar[0]['password'];		
			
			return $returnArray;			
		 
			} catch (PDOException $e) {
				$this->destroyConnection();
				throw new EyeDBException('An error occured while retrieving data from base.', 0, $e);
			}
			$this->destroyConnection();
	}
	
}
?>