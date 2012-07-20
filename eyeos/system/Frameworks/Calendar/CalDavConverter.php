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

abstract class CalDavConverter  {

	protected function __construct() {}
	
	public static function toCalDavDate($timeStamp,$isAllDay,$gmtTimeDiffrence=0) {	
	
	$str=$timeStamp+$gmtTimeDiffrence*3600;	
		//echo 	date('Ymd::His',$str); die;
		if ($isAllDay){
			return date('Ymd',$str); 
		}
		return date("Ymd\THis\Z",$timeStamp); 
		//return str_replace('::','T',$str); 
		
	}
	public static function toCalDavDateNew($timeStamp,$isAllDay,$gmtTimeDiffrence=0) {		
	
	$str=$timeStamp+$gmtTimeDiffrence*3600;	
		//echo 	date('Ymd::His',$str); die;
		if ($isAllDay){
			return date('Ymd',$str); 
		}
		return  date("Ymd\THis",$str);
		//return str_replace('::','T',$str); 
		
	}
	
	public static function eventsFromCalDav($events) {
        $eyeosEvents = array();
        foreach($events as $event) {
            $eyeosEvent = array();
            $eyeosEvent['id'] = $event["url"];
            $eyeosEvent['subject'] = $event["summary"];
            $eyeosEvent['description'] = $event["description"];
            $eyeosEvent['location'] = $event["location"];
            $eyeosEvent['isallday'] = $event["isallday"];
            $eyeosEvent['timestart'] = self::dateCalDavToEyeos($event['dtstart']);
            $eyeosEvent['timeend'] = self::dateCalDavToEyeos($event['dtend']);
            $repetitionArr = self::repetitionCalDavToEyeos($event['rrule']);
            $eyeosEvent['repeattype'] = $repetitionArr['repeatType'];
            $eyeosEvent['repetition'] = $repetitionArr['repetition'];
            $eyeosEvent['finaltype'] = $repetitionArr['finalType'];
            $eyeosEvent['finalvalue'] = $repetitionArr['finalType'];
            $eyeosEvent['creatorid'] = 'cis.dev22@gmail.com';
            $eyeosEvent['eventgroupid'] = $event["eventgroupid"];
            $eyeosEvent['calendarid'] = 'fcppicqrfm5f5s6a5dltrkjbu4';
            $eyeosEvent['type'] = 'other';
            $eyeosEvent['privacy'] = 'private';
            $eyeosEvents[] = $eyeosEvent;
        }
        return $eyeosEvents;

	}
    public  static function dateCalDavToEyeos($date) {
        $dateArr = explode("T",$date);
        $year = substr($dateArr[0],0,4);
        $month = substr($dateArr[0],4,2);
        $day = substr($dateArr[0],6,2);
        if($dateArr[0]) {
            $hour = substr($dateArr[1],0,2);
            $minute = substr($dateArr[1],2,2);
            $second = substr($dateArr[1],4,2);
        } else {
            $hour = 0;
            $minute = 0;
            $second = 0;
        }
        //echo "$hour,$minute,$second,$month,$day,$year <br />";
        $timeStamp = mktime($hour,$minute,$second,$month,$day,$year);
        //echo "temestamp: ".$timeStamp;
        return $timeStamp;
    }

    public  static function dateEyeosToCalDav($timeStamp) {
        $date = date("d/m/Y/H/i/s",$timeStamp);
        $dateArr = explode("/",$date);
        //echo "date: ".$date;

        $datePart = $dateArr[2].$dateArr[1].$dateArr[0];
        $timePart = $dateArr[3].$dateArr[4].'00';

        if($dateArr[3] > 0 || $dateArr[4] > 0) {
            $calDavDate = $datePart."T".$timePart;
        } else {
             $calDavDate = $datePart;
        }
        return $calDavDate;
    }

    public  static function repetitionCalDavToEyeos($rrule) {
        $repetitionArr = array();
        $rruleArr = explode(";",$rrule);
        foreach ($rruleArr as $rule) {
            $ruleArr = explode("=", $rule);
            switch($ruleArr[0]) {
              case 'FREQ':
                    $repetitionArr['repeatType'] = self::repeatTypeCalDavToEyeos($ruleArr[1]);
                    $repetitionArr['repetition'] = self::repetitionTypeCalDavToEyeos($ruleArr[1]);
                    break;
              case 'COUNT':
                    $repetitionArr['finalType'] = '3';
                    $repetitionArr['finalValue'] = $ruleArr[1];
                    break;
              case 'UNTIL':
                    $repetitionArr['finalType'] = '2';
                    $repetitionArr['finalValue'] = self::dateCalDavToEyeos($ruleArr[1]);
            }
        }
        return $repetitionArr;
    }
   public  static function repeatTypeCalDavToEyeos($value) {
        switch($value) {
          case 'DAILY':
              return 'd';
              break;
          case 'WEEKLY':
              return 'w';
               break;
          case 'MONTHLY':
              return 'm';
              break;
          case 'YEAERLY':
              return 'y';
              break;
        }
   }
   public  static function repetitionTypeCalDavToEyeos($value) {
        switch($value) {
          case 'DAILY':
              return 'EveryDay';
              break;
          case 'WEEKLY':
              return 'EveryWeek';
               break;
          case 'MONTHLY':
              return 'EveryMonth';
              break;
          case 'YEAERLY':
              return 'EveryYear';
              break;
        }
   }
   public static function get_timezone_offset($remote_tz) { 
   
		$remote_dtz = new DateTimeZone($remote_tz);
	   
		$remote_dt = new DateTime("now", $remote_dtz);
		$offset = $remote_dtz->getOffset($remote_dt) ;
		return $offset;
	}

}
?>