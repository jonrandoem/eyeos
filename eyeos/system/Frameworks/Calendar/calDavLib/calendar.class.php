<?php
/* $Id$ */
error_reporting(E_ALL ^ E_NOTICE);
    require_once 'caldav-client.php';
    require_once 'awl/iCalendar.php';
    require_once 'caldavresource.class.php';
    require_once 'rruleparser.class.php';
    require_once 'vevent.class.php';
    require_once 'icomponent.class.php';
//	require_once 'When.php';

    class CalendarIterator implements Iterator {
        private $list;

        function __construct(array $list) {
            $this->list = $list;
        }

        function current() {
            return current($this->list);
        }

        function next() {
            next($this->list);
        }

        function key() {
            return key($this->list);
        }

        function rewind() {
            reset($this->list);
        }

        function valid() {
            $obj = current($this->list);
            return ($obj !== FALSE);
        }

    }

    class RemoteCalendar extends CaldavRessource {

        private $calendar;

	function __construct($url, $uid = '', $pwd = '', $cal = '') {
	    //file_put_contents('/tmp/dump', "$url\n$uid\n$pwd\n$cal\n", FILE_APPEND);
            if (empty($url))
                throw new Exception("Missing URL");
            parent::__construct($url, $uid, $pwd, $cal);
        }

        private function setComponent(VTYPE $type, array $item, $new = FALSE) { 
            switch ($type->ordinal()) {
                case VTYPE::VEVENT:
                    $ical = new VEvent(
                        $item['etag'], $item['href'],
                        $type, $item['ical'], $new);
                    break;
                default:
                    throw new Exception(
                        "$type: Unsupported iRemoteCalendar component");
            }
            $this->calendar[$item['etag']] = $ical;
            //var_dump($this->calendar[$item['etag']]);
        }

        private function setResource($etag, $resource) {
            if ($resource === NULL)
                unset($this->calendar[$etag]);
            else if (isset($this->calendar[$etag]))
                $this->calendar[$etag]->setResource($resource);
            else {
                $type = new VTYPE($this->getType($resource));
                $this->setComponent($type, array(
                    'etag' => $etag,
                    'href' => NULL,
                    'ical' => $resource),
                    TRUE
                );
            }
        }

        private function getType(iRemoteCalendar $iCalendar) {
            $components = $iCalendar->component->GetComponents();
            // Find VCalender component
            foreach($components as $type) {
                try {
                    $vtype = new VTYPE($type->GetType());
                    if ($vtype->ordinal() != VTYPE::VTIMEZONE)
                        break;
                }
                catch (Exception $ex) {}
            }
            return $vtype;
        }

        private function wrapCalendar($component) {
            $cal = "BEGIN:VCALENDAR\r\n";
            $cal .= "PRODID:-//datanom.net//NONSGML WEBCAL Calendar//EN\r\n";
            $cal .= "VERSION:2.0\r\n";
            $cal .= "CALSCALE:GREGORIAN\r\n";
            $cal .= $component;
            $cal .= "END:VCALENDAR\r\n";
            
            return $cal;
        }
        
        function getComponents($start, $end) {
            $this->calendar = array();

            if (! $this->isDateTime($start) || ! $this->isDateTime($end))
                throw new Exception("[$start:$end]: Invalid DateTime format");
            $events = $this->callServer('getEvents', array($start, $end));
            foreach ($events as $k => $event) {
                $iCalendar = new iRemoteCalendar(
                    array('icalendar' => $event['data']));
                $vtype = $this->getType($iCalendar); 
                $this->setComponent($vtype, array(
                    'etag' => $event['etag'],
                    'href' => $event['href'],
                    'ical' => $iCalendar
                    )
                );
            }
        }

		function getAllComponents() {
            $this->calendar = array();           
            $events = $this->callServer('getAllEvents');           
            foreach ($events as $k => $event) {
                $iCalendar = new iRemoteCalendar(
                    array('icalendar' => $event['data']));
                $vtype = $this->getType($iCalendar); 
                $this->setComponent($vtype, array(
                    'etag' => $event['etag'],
                    'href' => $event['href'],
                    'ical' => $iCalendar
                    )
                );
            }
        }
		function getComponentByUid($uid) {
            $this->calendar = array();
            $events = $this->callServer('getbyuid', array($uid));   
            foreach ($events as $k => $event) {
                $iCalendar = new iRemoteCalendar(
                    array('icalendar' => $event['data']));
                $vtype = $this->getType($iCalendar); 
                $this->setComponent($vtype, array(
                    'etag' => $event['etag'],
                    'href' => $event['href'],
                    'ical' => $iCalendar
                    )
                );
            }
        }

        function newComponent($c_type) {
            switch (strtoupper($c_type)) {
                case 'VEVENT': $type = 'VEVENT'; break;
                default:
                    throw new Exception(
                        "$thisType: Unsupported iRemoteCalendar component");
            }
            $start = gmdate("Ymd\THis\Z");
            $end = strtotime($start) + (60*60);
            $end = gmdate("Ymd\THis\Z", $end);
            //echo "$start:$end<br/>";
            $uid = sha1(microtime() . $start . $end);
            $iCalendar = new iRemoteCalendar(array(
                    'type' => $type,
                    'DTSTART' => $start,
                    'DTEND' => $end,
                    'UID' => $uid
                )
            );
            $vtype = $this->getType($iCalendar);
            $etag = sha1("This is a new component");
            $this->setComponent($vtype, array(
                'etag' => $etag,
                'href' => NULL,
                'ical' => $iCalendar
                )
            );
            return $this->calendar[$etag];
        }
/*
        function reload($start, $end) {
            $res = $this->update();
            if (count($res) < 1) {
                $this->getComponents($start, $end);
            }
            return $res;
        }
*/
        private function updateEvent($url, $etag) { 
$msg = <<<EOF
BEGIN:VEVENT
DTSTART:20110512T000000
DTEND:20110512T010000
UID:du9mtovvnv24j08q17q5741tks@google.com
DTSTAMP:20110510T065351Z
LAST-MODIFIED:20110510T065351Z
X-WEBCAL-GENERATION:1
SUMMARY:12/5/2011
LOCATION:
DESCRIPTION:
RECURRENCE-ID;TZID=Asia/Calcutta:20110512T000000
END:VEVENT

EOF;



            $res = array();
            $resource = $this->calendar[$etag];
            
            if ($resource && $resource->isDirty()) {
                $component = $resource->getBaseComponent();
                $uid = $component->GetPValue('UID');
                $ical = $this->wrapCalendar($component->Render());
                $url = $resource->getUrl();

                if ($url) {
                    $newEtag = $this->callServer('put', 
                            array("$uid.ics", $ical, $etag));
                }
                else {
                    $newEtag = $this->callServer('put', 
                            array("$uid.ics", $ical));
                }
				
                if (is_array($newEtag))
                    array_push($res, $newEtag);
                else {
                    $resource->setEtag($newEtag);
                }
            }
            return $uid;
        }
                
        function update($url, $etag = NULL) {
            //var_dump($this->calendar);
           //$res = $this->updateEvent($url, $etag);
           //return $res;

            if (! $etag) {
                foreach($this->calendar as $id => $resource) {
                    //var_dump($resource);
                    $thisUrl = $resource->getUrl();
                    if ($thisUrl && strcasecmp($url, $thisUrl) == 0) {
                        $etag = $id;
                        break;
                    }
                }
            }
            if ($etag)
                $res = $this->updateEvent($url, $etag);
            else
                $res = array($url => 'Event does not exist');
            return $res;
        }

        function delete($url, $etag = NULL) {
            if ($etag) {
                $res = $this->callServer('delete', array($url, $etag));
            }
            else {
                $res = $this->callServer('delete', array($url));
            }
            return $res;
        }

        // inherited abstract methods from parent
        function offsetExists($etag) {
            return (is_object($this->calendar[$etag]) &&
                $this->calendar[$etag] instanceof IComponent);
        }

        function offsetGet($etag) {
            if ($this->offsetExists($etag))
                return $this->calendar[$etag]->getResource();
        }

        function offsetSet($etag, $ical) {
            $this->setResource($etag, $ical);
        }

        function offsetUnset($etag) {
            $this->setResource($etag, NULL);
        }

        function getIterator() {
            return new CalendarIterator($this->calendar);
        }
        function getAllEvents() { 
            $events = array();
         
            foreach ($this as $obj) {
               // echo "helloo2222";
                $ar=$obj->getAllBaseComponent();
                foreach($ar as $iComponent){
                  $isAllDay=false;
                  $event = array();
                  $event["exdate"] = array();
                  $props = $iComponent->getProperties();
                  $event["url"] = $obj->getUrl();
                  $event["etag"] = $obj->getEtag();
                  foreach ($props as $prop) {
                      switch ($prop->name) {
                          case "SUMMARY": $event["summary"] = $prop->content;
                              break;
                          case "DTSTART":
                              $event["dtstart"] = $prop->content;
                              $event["dtstartzone"] = $prop->parameters["TZID"];
                              $pos= strpos ($prop->rendered,'VALUE=DATE') ;
                              if($pos) {
                                  $isAllDay=true;
                              }
                              $event["isallday"]=$isAllDay;
                              break;
                          case "DTEND": $event["dtend"] = $prop->content;
                              $event["dtendzone"] = $prop->parameters["TZID"];
                              break;
                          case "RRULE": $event["rrule"] = $prop->content;
                              $start = new When();
                              $start->recur($event["dtstart"])->rrule($event["rrule"]);
                              $end = new When();
                              $end->recur($event["dtend"])->rrule($event["rrule"]);
                              $repeat=true;
                              break;
                          case "LOCATION": $event["location"] = $prop->content;
                              break;
                          case "DESCRIPTION": $event["description"] = $prop->content;
                            break;
                          case "UID": $event["uid"] = $prop->content;
                              break;
                          case "EXDATE": $event["exdate"][] = $prop->content;
                              break;
                          case "RECURRENCE-ID": $event["recurence-id"] = $prop->content;
                              break;
                      }
                  }
                  //print_r($event);
                  if ($repeat && !$event["recurence-id"]){
                      $tempEtag = $event['url'];
                      for($i=0; $i<10; $i++ )
                      {
                          $sDate=$start->next();
                          if(!is_object($sDate)){
                              break;
                          }
                          $eDate=$end->next();
                          if(!is_object($eDate)){
                              break;
                          }

                          if(in_array($sDate->format ("Ymd\THis"),$event["exdate"]) || in_array($sDate->format ("Ymd"),$event["exdate"])) {
                              continue;
                          }
                          if($event["dtstartzone"]) {
                              $event['dtstart']=	$sDate->format ("Ymd\THis");
                              $event['dtend']=	$eDate->format ("Ymd\THis");
                          } else {
                              $event['dtstart']=	$sDate->format ("Ymd");
                              $event['dtend']=	$eDate->format ("Ymd");
                          }
                          $event["eventgroupid"] = 1;
                          $event["url"] = $tempEtag.'_'.$i;
                          $events[$event['dtstart']] = $event;
                      }
                  } else {
                      $events[ $event['dtstart']] = $event;
                  }
              }
              //print_r($events);
              return $events;
          }
        }
        function getAllRecurenceIdOfEvent($obj) {
              $event = array();
                $event["etag"] = $obj->getEtag();
				$event["url"] = $obj->getUrl();
                $props = $obj->getBaseComponent()->getProperties();
                $repeated = false;
                foreach ($props as $prop) {
                    switch ($prop->name) {
                         case "RRULE":
							$event["rrule"] = $prop->content;
                            $start = new When();
							$start->recur($event["dtstart"])->rrule($event["rrule"]);
							$end = new When();
							$end->recur($event["dtend"])->rrule($event["rrule"]);
							$repeated=true;
                            break;
                     }
                }
                if($repeated){
                    $tempEtag = $event['url'];
					$maxRepeatLimit=CalendarManager::MAX_REPEAT_LIMIT;
                    for($i=0; $i<$maxRepeatLimit; $i++ ){
						$sDate=$start->next();
						if(!is_object($sDate)){
							break;
						}
						$event['dtstart']=	$sDate->format ("Ymd\THis\Z");
						$eDate=$end->next();
						if(!is_object($eDate)){
							break;
						}
						$events[] = $tempEtag.'_'.$i;
                    }
                }
                else {
                  $events[] = $event;
                }

                return $events;
        }
        
        function getAllEventsOfRecurringEvent($obj) {
                $events = array();
                $event = array();
                $event["etag"] = $obj->getEtag();
                $event["url"] = $obj->getUrl();
                $event["eventgroupid"] = 0;
                $props = $obj->getBaseComponent()->getProperties();
                $xDateArr = array();
                $repeated = false;
                foreach ($props as $prop) {
                    switch ($prop->name) {
                        case "SUMMARY": $event["summary"] = $prop->content;
                            break;
                        case "DTSTART": $event["dtstart"] = $prop->content;
                            $event["dtstartzone"] = isset($prop->parameters["TZID"])?$prop->parameters["TZID"]:"";
                            break;
                        case "DTEND": $event["dtend"] = $prop->content;
                            $event["dtendzone"] = isset($prop->parameters["TZID"])?$prop->parameters["TZID"]:"";
                            break;
                        case "RRULE":
                            $event["rrule"] = $prop->content;
                            if(!empty ($prop->content)){
                                $repeated = true;
                            }
                            $start = new When();
							$start->recur($event["dtstart"])->rrule($event["rrule"]);
							$end = new When();
							$end->recur($event["dtend"])->rrule($event["rrule"]);
                            break;
                        case "LOCATION": $event["location"] = $prop->content;
                            break;
                        case "DESCRIPTION": $event["description"] = $prop->content;
                            break;
                        case "UID": $event["uid"] = $prop->content;
                            break;
                        case "EXDATE": $event["exdate"][] = $prop->content;
                            break;
                        case "RECURRENCE-ID": $event["recurrence-id"] = $prop->content;
                            $repeated = false;
                            break;
                    }
                }
                if($repeated){
                    $tempEtag = $event['url'];
					$maxRepeatLimit=CalendarManager::MAX_REPEAT_LIMIT;
                    for($i=0; $i<$maxRepeatLimit; $i++ ){

						$sDate=$start->next();

						if(!is_object($sDate)){
							break;
						}
						$event['dtstart']=	$sDate->format ("Ymd\THis\Z");

						$eDate=$end->next();
						if(!is_object($eDate)){
							break;
						}
						$event['dtend']=	$eDate->format ("Ymd\THis\Z");

					  $event["eventgroupid"] = 1;
					  $event["url"] = $tempEtag.'_'.$i; // we appending '_$i' because in case of repeated eevents there is same id. to show event there should be different id.
					  $events[] = $event;
                    }
                }
                else {
                  $events[] = $event;
                }
                return $events;
        }
		function get_timezone_offset($remote_tz) {    
   
			$remote_dtz = new DateTimeZone($remote_tz);
		   
			$remote_dt = new DateTime("now", $remote_dtz);
			$offset = $remote_dtz->getOffset($remote_dt) ;
			return $offset;
		}

    } // End of class 
/*
$cal = new Calendar(
    'http://calendar.datanom.net/caldav.php/mir/home/',
    'uid',
    'pwd'
);
$cal->getComponents("20030830T000000Z","20031201T000000Z");
//print_r($cal);
$i = 0;
foreach($cal as $obj) {
    $i++;
    print "========= [$i] =========\n";
    //print_r($obj);
    //print_r ($obj->getAlarm());
    print_r($obj->getActiveDates("20031014T000000Z","20031114T000000Z"));
    //print "{$obj->isUTCTime()}\n";
    //$obj->getActiveDates();
}
print "Found $i event(s)\n";

//print_r ($cal->getUrlByEtag($cal->getEtagFromUid('KOrganizer-1670268771.406')));
$time = time();
print "time: $time\n";
$dt = $cal->timestamp2ICal($time, TRUE);
print "dt: $dt\n";
$time = $cal->iCal2Timestamp($dt);
print "time: $time\n";
$dt = $cal->timestamp2ICal($time, FALSE);
print "dt: $dt\n";
$time = $cal->iCal2Timestamp(substr($dt, 0, strpos($dt, 'T')));
$dt = $cal->timestamp2ICal($time, TRUE);
print "dt: $dt\n";
$r = new RRuleParser(
    'FREQ=HOURLY;INTERVAL=3;UNTIL=20070101T170000Z',
    '20070101T090000Z', '20070101T090000Z');
$r = new RRuleParser(
    'FREQ=WEEKLY;COUNT=12;INTERVAL=2',
    '20070101T140000Z', '20070101T120000Z');
print "$r\n";
print_r($r->getEventDates('20070301T140000Z','20070501T140000Z'));
$r = new RRuleParser(
    'FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=-1',
    '20070101T000100Z', '20070101T001100Z');
//DTSTART;TZID=US-Eastern:19970105T083000
print "$r\n";
$r = new RRuleParser(
    'FREQ=YEARLY;INTERVAL=2;BYMONTH=1;BYDAY=SU;BYHOUR=8,9;BYMINUTE=30',
    '20070101T000100Z', '20070101T001100Z');
print "$r\n";
print_r ($r->getEventDates('20060101T000100Z', '20060101T001100Z'));
$r = new RRuleParser(
    'FREQ=DAILY;COUNT=10;INTERVAL=2',
    '20070101T000100Z', '20070101T001100Z');
print "$r\n";
//foreach ($cal as $obj)
//    var_dump($obj->getBaseComponent());
//$bak = $cal['3ba46312e910765bf7059a53909d149b'];
//print_r($bak);
//print_r(new Icalendar(array('SUMMARY' => 'test')));
//$cal['3ba46312e910765bf7059a53909d149b'] = new Icalendar(array('SUMMARY' => 'test'));
//print_r($cal['3ba46312e910765bf7059a53909d149b']);
//unset($cal['3ba46312e910765bf7059a53909d149b']);
//var_dump($cal['3ba46312e910765bf7059a53909d149b']);
//$cal['3ba46312e910765bf7059a53909d149b'] = $bak;
//var_dump($cal['3ba46312e910765bf7059a53909d149b']);
//$cal->update();
//print_r($cal['3ba46312e910765bf7059a53909d149b']);*/
