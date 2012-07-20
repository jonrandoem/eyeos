<?php
/* $Id$ */

    require_once 'awl/iCalendar.php';
    require_once 'caldavresource.class.php';
    require_once 'icomponent.class.php';
    require_once 'rruleparser.class.php';

    class VEvent extends IComponent {

        private $rulesParser;

        function __construct($etag, $url, VTYPE $type, iRemoteCalendar $item, $new) {
            parent::__construct($etag, $url, $type, $item, $new);
            $this->rulesParser = new RRuleParser();
        }

        function isActive($start, $end) {
            $res = FALSE;
            if (!($start && $end))
                return TRUE;
            if (! CaldavRessource::isDateTime($start) ||
                ! CaldavRessource::isDateTime($end))
                throw new Exception(
                    "[$start,$end] Invalid CalDAV DateTime format");
            $event = $this->getBaseComponent();
            if ($start && !$end) {
                if (CaldavRessource::datecmp(
                    $start, $event->GetPValue('DTSTART')) < 0)
                    $res = TRUE;
            }
            else {
                if (CaldavRessource::datecmp(
                        $start, $event->GetPValue('DTSTART')) < 0 &&
                    CaldavRessource::datecmp(
                        $end, $event->GetPValue('DTEND')) > 0)
                    $res = TRUE;
            }
            return $res;
        }

        function getActiveDates($range_start = NULL, $range_end = NULL) {
            $res = array();
            $event = $this->getBaseComponent();
            $start = $event->GetPValue('DTSTART');
            $end = $event->GetPValue('DTEND');
            //print "$start:$end<br/>";
            if (! ($start && $end))
                return $res;
            $rrule = $event->GetPValue('RRULE');
            if ($rrule) { 
                $this->rulesParser->setRule($rrule, $start, $end);  
                //print $this->rulesParser->__toString()."\n";
                $res = $this->rulesParser->getEventDates($range_start, $range_end);
           }
            else {
                if ($this->isActive($range_start, $range_end))
                    array_push($res, $start);
            }
            //var_dump($res);
            return $res;
        }

        function getRRule() {
            return $this->rulesParser;
        }

        function getAlarm() {
            $alarm = $this->getComponent(VTYPE::VALARM);
            if ($alarm)
                $alarm = $alarm[0];
            return $alarm;
        }
        function setAllProperties($newValues) {
          foreach ($newValues as $key=>$value) {
            $this->setProperty($key,$value);
          }
        }
        function setProperty($name, $value) {

            $component = $this->getBaseComponent();
            $properties = $component->GetProperties();
            $match = FALSE;
            $update = FALSE;
            
            if (count($properties) > 0) {
                foreach ($properties as $property) {
                    //echo "B: " . $property->Name(). ":" . $property->Value() . "<br/>";
                    $test1 = explode(';', $name);
                    $test2 = explode(';', $property->Name());
                    if (strcasecmp($test1[0], $test2[0]) === 0) {
                        if (strcmp($property->Value(), $value) !== 0) {
                            $property->Value($value);
                            //echo "B: " . $property->Name(). ":" . $property->Value() . "<br/>";
                            $update = TRUE;
                        }
                        $match = TRUE;
                    }
                }
            }
            if ($match == FALSE) {
                $component->AddProperty(strtoupper($name), $value);
                $update = TRUE;
            }
            else {
                if ($update)
                    $component->SetProperties($properties);
            }
            if ($update) {
                $this->addDefault($component);
                $this->setDirty();
            }
            //$properties = $component->GetProperties();
            //foreach ($properties as $property) {
            //    echo "A: " . $property->Name(). ":" . $property->Value() . "<br/>";
            //}
            //echo "<br/>";
            //exit;
        }
        function addProperty($name, $value,$parameters=NULL) {
                $component = $this->getBaseComponent();
                $component->AddProperty(strtoupper($name), $value,$parameters);
                $this->addDefault($component);
                $this->setDirty();
        }
        
        private function AddDefault(iCalComponent $component) {
            $properties = $component->GetProperties();;
            $now = gmdate("Ymd\THis\Z");
            $a = array(1,1,1);
            foreach ($properties as $property) {
                //echo "D: " . $property->Name(). ":" . $property->Value() . "<br/>";
                if (strcasecmp('DTSTAMP', $property->Name()) === 0) {
                    $property->Value($now);
                    $a[0] = 0;
                }
                if (strcasecmp('LAST-MODIFIED', $property->Name()) === 0) {
                    $property->Value($now);
                    $a[1] = 0;
                }
                if (strcasecmp('X-WEBCAL-GENERATION', $property->Name()) === 0) {
                    $property->Value('1');
                    $a[2] = 0;
                }
            }
            for ($i = 0; $i < count($a); $i++) {
                //echo $i.':'.$a[$i]."<br/>";
                if ($a[$i]) {
                    switch ($i) {
                        case 0: $c['DTSTAMP'] = $now; break;
                        case 1: $c['LAST-MODIFIED'] = $now; break;
                        case 2: $c['X-WEBCAL-GENERATION'] = 1; break;
                        default: continue;
                    }
                    $key = key($c);
                    $val = $c[$key];
                    $component->AddProperty($key, $val);
                    $c = NULL;
                }
            }
        }

        function delete($params,$cal) {
                if ($params['isDeleteAll'] == '1') {
                           $cal->delete($this->getUrl(),$this->getEtag());
                } else if($params['groupId']>0) {
                          if(!empty($params['dtstartzone'])) {
                                $this->addProperty('EXDATE',$params['dtstart'],array('TZID'=>$params['dtstartzone']));
                          } else {
                                $this->addProperty('EXDATE',$params['dtstart'],array('VALUE'=>'DATE'));
                          }
                          $cal->update($this->getUrl(),$this->getEtag());
                }
                else {
                        $cal->delete($this->getUrl(),$this->getEtag());
                }
        }

        function update($params,$cal) { //print_r($params); die;
			
				$uids=explode('_',$params['id']);
				$uid=substr($uids[0],0,-4);   
				$uid=str_replace('%40','@', $uid); 
				//echo html_entity($uid); die;
                if (!$params['isEditAll'] && $params['eventGroup'] > 0) { 
				
				
                           $newValues = array('DTSTART'=> CalDavConverter::toCalDavDateNew($params['timeStart'],$params['isAllDay'],$params['gmtTimeDiffrence']),'DTEND'=> CalDavConverter::toCalDavDateNew($params['timeEnd'],$params['isAllDay'],$params['gmtTimeDiffrence']),'UID'=>$uid,'SUMMARY'=>$params['subject'],'LOCATION'=>$params['location'],'DESCRIPTION'=>$params['description']);
                           $this->setAllProperties($newValues);
					
                           if(!empty ($params['dtstartzone'])) {
                                   $this->addProperty('RECURRENCE-ID', CalDavConverter::toCalDavDateNew($params['timeStart'],$params['isAllDay'],$params['gmtTimeDiffrence']), array('TZID'=>$params['dtstartzone']));
                           } else {
                                   $this->addProperty('RECURRENCE-ID', CalDavConverter::toCalDavDateNew($params['timeStart'],$params['isAllDay'],$params['gmtTimeDiffrence']), array('VALUE'=>'DATE'));
                           }
						   foreach($cal as $obj){
						   	//print_r($obj->getBaseComponent()->Render());
						   
						   }
						   //echo $this->getUrl().'---'.$this->getEtag();
                           $cal->update($this->getUrl(),$this->getEtag());
                } else {
                              $newValues = array('DTSTART'=> CalDavConverter::toCalDavDate($params['timeStart'],$params['isAllDay'],$params['gmtTimeDiffrence']),'DTEND'=> CalDavConverter::toCalDavDate($params['timeEnd'],$params['isAllDay'],$params['gmtTimeDiffrence']),'UID'=>$uid,'SUMMARY'=>$params['subject'],'LOCATION'=>$params['location'],'DESCRIPTION'=>$params['description']);
                              $this->setAllProperties($newValues);
							 $cal->update($this->getUrl(),$this->getEtag());
							  
                              //$cal->update($this->getUrl(),$this->getEtag());
                }
        }
    }
