<?php
/* $Id$ */

    require_once 'caldavresource.class.php';

    abstract class IComponent {

        public  $type;
        private $component;
        private $url;
        private $etag;
        private $dirty;

        function __construct($etag, $url, VTYPE $type,
           iRemoteCalendar $component, $new) {
            $this->etag = $etag;
            $this->url = $url;
            $this->component = $component;
            $this->type = $type;
            $this->dirty = $new;
        }

        public function isDirty() {
            return $this->dirty;
        }

        public function setDirty() {
            $this->dirty = TRUE;
        }
        
        public function getResource() {
            return $this->component;
        }

        public function setResource(iRemoteCalendar $component) {
            $this->component = $component;
            $this->dirty = TRUE;
        }

        public function getBaseComponent() {
            return $this->getComponent($this->type);
        }
        public function getAllComponent($type) {
            $ref = $this->component;
          // print_r($ref);
            if ($this->component === NULL)
                $ical = NULL;
            else if ($type instanceof VTYPE && $type->ordinal() == VTYPE::VTIMEZONE) {
                $ical = $ref->component->GetComponents('VTIMEZONE');
            }
            else {
                //$theType = sprintf("%s", $this->type);
                //print "self: $theType\n";
                $component = $ref->component->GetComponents($this->type);

                if (! $type instanceof VTYPE)
                    $type = new VTYPE($type);
                //$theType = sprintf("%s", $type);
                //print "instance: $theType\n";
                if (count($component) > 0)
                    $ical = $component;
                if ($type->ordinal() != $this->type->ordinal() && $ical) {
                    $ical = $ical->GetComponents($type);
                }
            }
            return $ical;
        }
        
        public function getAllBaseComponent() {
            return $this->getAllComponent($this->type);
        }
        public function getUrl() {
            return $this->url;
        }

        public function getEtag() {
            return $this->etag;
        }

        public function setEtag($etag) {
            $this->etag = $etag;
        }
        
        public function getComponent($type) {
            $ref = $this->component;
            //print_r($ref);
            if ($this->component === NULL)
                $ical = NULL;
            else if ($type instanceof VTYPE && $type->ordinal() == VTYPE::VTIMEZONE) {
                $ical = $ref->component->GetComponents('VTIMEZONE');
            }
            else {
                //$theType = sprintf("%s", $this->type);
                //print "self: $theType\n";
                $component = $ref->component->GetComponents($this->type);
                //print_r($component);
                if (! $type instanceof VTYPE)
                    $type = new VTYPE($type);
                //$theType = sprintf("%s", $type);
                //print "instance: $theType\n";
                if (count($component) > 0)
                    $ical = $component[0];
                if ($type->ordinal() != $this->type->ordinal() && $ical) {
                    $ical = $ical->GetComponents($type);
                }
            }
            return $ical;
        }

        public function isUTCTime() {
            $event = $this->getBaseComponent();
            $start = $event->GetPValue('DTSTART');
            $end = $event->GetPValue('DTEND');

            if (! ($start && $end))
                throw new Exception("Not a valid iCal component");
            return ($start[strlen($start) - 1] == 'Z' ||
                    $nd[strlen($end) - 1] == 'Z');
        }

        public function getDetails() {
            $event = $this->getBaseComponent();
            $start = strtotime($event->GetPValue('DTSTART'));
            $start = date("Y-m-d H:m", $start);
            $end = strtotime($event->GetPValue('DTEND'));
            $end = date("Y-m-d H:m", $end);
            $title = $event->GetPValue('SUMMARY');
            
            return "$start-$end: $title";
        }
        
        public function getTZID() {
            $res = 'UTC';

            if (! $this->isUTCTime()) {
                $timezone = $this->getTimeZone();
                if ($timezone) {
                    $res = $timezone->GetPValue('TZID');
                }
                // timezone not given assume TZID = server's timezone
                // servers default timezone is UTC
            }
            return $res;
        }

        function getTimeZone() {
            $timezone = $this->getComponent(VTYPE::VTIMEZONE);
            if ($timezone)
                $timezone = $timezone[0];
            return $timezone;
        }

        public function __toString() {
            return $this->type->__toString();
        }

        /**
         * The following functions should be overloaded in
         * the child classes if the have specific functionality
         */

        function isActive($start, $end) {
            return FALSE;
        }

        function getActiveDates() {
            return array();
        }

        function getAlarm() {
            return NULL;
        }

    }
