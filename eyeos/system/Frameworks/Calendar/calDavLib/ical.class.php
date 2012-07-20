<?php
/* $Id$ */

$msg = <<<EOF
BEGIN:VCALENDAR
PRODID:-//davical.org//NONSGML AWL Calendar//EN
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTAMP:20070417T195323Z
ORGANIZER:MAILTO:
X-PILOTID:12451851
X-PILOTSTAT:0
CREATED:20050814T160951Z
UID:libkcal-1123041440.757
SEQUENCE:0
LAST-MODIFIED:20070124T213448Z
SUMMARY:møde carl christian\, hovedopgave
CLASS:PUBLIC
PRIORITY:3
RRULE:FREQ=DAILY;UNTIL=20020528T153000Z;INTERVAL=14
EXDATE;VALUE=DATE:20020402
DTSTART:20020219T163000Z
DTEND:20020219T180000Z
TRANSP:OPAQUE
BEGIN:VALARM
DESCRIPTION:
ACTION:DISPLAY
TRIGGER;VALUE=DURATION:-P1D
END:VALARM
END:VEVENT
END:VCALENDAR
BEGIN:VCALENDAR
PRODID:-//davical.org//NONSGML AWL Calendar//EN
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTAMP:20070417T195323Z
ORGANIZER:MAILTO:
X-PILOTID:12451851
X-PILOTSTAT:0
CREATED:20050814T160951Z
UID:libkcal-1123041440.757
SEQUENCE:0
LAST-MODIFIED:20070124T213448Z
SUMMARY:event number 2
CLASS:PUBLIC
PRIORITY:3
RRULE:FREQ=DAILY;UNTIL=20020528T153000Z;INTERVAL=14
EXDATE;VALUE=DATE:20020402
DTSTART:20020219T163000Z
DTEND:20020219T180000Z
TRANSP:OPAQUE
BEGIN:VALARM
DESCRIPTION:
ACTION:DISPLAY
TRIGGER;VALUE=DURATION:-P1D
END:VALARM
END:VEVENT
END:VCALENDAR
EOF;

require_once 'caldav-client.php';

interface IRemoteCalendar {
    function getProperty($name);
    function setProperty($name, $value);
    function getAllProperties();
    function setAllProperties(array $assoc_array);
    function isChanged();
}

class VEvent implements IRemoteCalendar {
    private $attendee;
    private $class;
    private $created;
    private $dtstamp;
    private $description;
    private $dtend;
    private $dtstart;
    private $duration;
    private $exdate;
    private $lastmodified;
    private $location;
    private $organizer;
    private $priority;
    private $rrule;
    private $sequence;
    private $status;
    private $summary;
    private $transp;
    private $uid;
    private $xprop = array();
    // Properties must not contain hypens in their name
    private static $translate = array(
        'lastmodified' => 'last-modified',
        'xprop' => 'x-prop'
    );
    private $changed;

    function __construct($values = array()) {
        if (! is_array($values))
            throw new Exception("Attribute to constructor must be an array");
        $this->setProperties($values);
        $this->changed = FALSE;
    }

    private function setProperties(array $props) {
        foreach ($props as $k => $v) {
            switch (strtoupper($k)) {
                case 'DTSTAMP':
                    $this->dtstamp = $v;
                    break;
                case 'ORGANIZER':
                    $this->organizer = $v;
                    break;
                case 'CREATED':
                    $this->created = $v;
                    break;
                case 'UID':
                    $this->uid = $v;
                    break;
                case 'SEQUENCE':
                    $this->sequence = $v;
                    break;
                case 'LAST-MODIFIED':
                    $this->lastmodified = $v;
                    break;
                case 'SUMMARY':
                    $this->summary = $v;
                    break;
                case 'CLASS':
                    $this->class = $v;
                    break;
                case 'PRIORITY':
                    $this->priority = $v;
                    break;
                case 'RRULE':
                    $this->rrule = $v;
                    break;
                case 'EXDATE':
                    $this->exdate = $v;
                    break;
                case 'DTSTART':
                    $this->dtstart = $v;
                    break;
                case 'DTEND':
                    $this->dtend = $v;
                    break;
                case 'TRANSP':
                    $this->transp = $v;
                    break;
                case 'ATTENDEE':
                    $this->attendee = $v;
                    break;
                case 'DURATION':
                    $this->duration = $v;
                    break;
                case 'LOCATION':
                    $this->location = $v;
                    break;
                case 'STATUS':
                    $this->status = $v;
                    break;
                case 'DESCRIPTION':
                    $this->description = $v;
                    break;
                default:
                    if (($k[0] == 'x' || $k[0] == 'X') && $k[1] == '-')
                        $this->xprop[$k] = $v;
                    else
                        throw new Exception("[$k,$v]: Unknown attribute");
            }
        }
    }

    public function getProperty($name) {
        $prop = strtolower($name);
        if (($trans = array_search($prop, self::$translate)) !== false)
            $prop = $trans;
        if (! property_exists($this, $prop)) {
            // Support for PHP 5 < 5.3
            $obj = new ReflectionClass(get_class($this));
            if (! $obj->hasProperty($prop))
                throw new Exception("$name: Unknown property");
        }
        return $this->$prop;
    }

    public function setProperty($name, $value) {
        $prop = strtolower($name);
        if (($trans = array_search($prop, self::$translate)) !== false)
            $prop = $trans;
        if (! property_exists($this, $prop)) {
            // Support for PHP 5 < 5.3
            $obj = new ReflectionClass(get_class($this));
            if (! $obj->hasProperty($prop))
                throw new Exception("$name: Unknown property");
        }
        $this->$prop = $value;
        $this->changed = TRUE;
    }

    function getAllProperties() {
        $props = array();
        $p = get_object_vars($this);
        foreach ($p as $k => $v){
            if ($k == 'changed')
                continue;
            if (array_key_exists($k, self::$translate))
                $k = strtoupper(self::$translate[$k]);
            else
                $k = strtoupper($k);
            $props[$k] = $v;
        }
        return $props;
    }

    function setAllProperties(array $assoc_array) {
        $props = array();
        foreach ($assoc_array as $k => $v){
            $k = strtolower($k);
            if (is_array($v)) {
                foreach ($v as $k1 => $v1)
                    $props[$k1] = $v1;
            }
            else
                $props[$k] = $v;
        }
        $this->setProperties($props);
        $this->changed = TRUE;
    }

    function isChanged() {
        return $this->changed;
    }

}

class VAlarm implements IRemoteCalendar {
    private $action;
    private $description;
    private $duration;
    private $repeat;
    private $trigger;
    // Properties must not contain hypens in their name
    private static $translate = array();
    private $changed;

    function __construct($values = array()) {
        if (! is_array($values))
            throw new Exception("Attribute to constructor must be an array");
        $this->setProperties($values);
        $this->changed = FALSE;
    }

    private function setProperties(array $props) {
        foreach ($props as $k => $v) {
            switch (strtoupper($k)) {
                case 'ACTION':
                    $this->action = $v;
                    break;
                case 'DESCRIPTION':
                    $this->description = $v;
                    break;
                case 'DURATION':
                    $this->duration = $v;
                    break;
                case 'REPEAT':
                    $this->repeat = $v;
                    break;
                case 'TRIGGER':
                    $this->trigger = $v;
                    break;
                default:
                    throw new Exception("$k: Unknown attribute");
            }
        }
    }

    public function getProperty($name) {
        $prop = strtolower($name);
        if (($trans = array_search($prop, self::$translate)) !== false)
            $prop = $trans;
        if (! property_exists($this, $prop)) {
            // Support for PHP 5 < 5.3
            $obj = new ReflectionClass(get_class($this));
            if (! $obj->hasProperty($prop))
                throw new Exception("$name: Unknown property");
        }
        return $this->$prop;
    }

    public function setProperty($name, $value) {
        $prop = strtolower($name);
        if (($trans = array_search($prop, self::$translate)) !== false)
            $prop = $trans;
        if (! property_exists($this, $prop)) {
            // Support for PHP 5 < 5.3
            $obj = new ReflectionClass(get_class($this));
            if (! $obj->hasProperty($prop))
                throw new Exception("$name: Unknown property");
        }
        $this->$prop = $value;
        $this->changed = TRUE;
    }

    function getAllProperties() {
        $props = array();
        $p = get_object_vars($this);
        foreach ($p as $k => $v){
            if ($k == 'changed')
                continue;
            if (array_key_exists($k, self::$translate))
                $k = strtoupper(self::$translate[$k]);
            else
                $k = strtoupper($k);
            $props[$k] = $v;
        }
        return $props;
    }

    function setAllProperties(array $assoc_array) {
        $props = array();
        foreach ($assoc_array as $k => $v){
            $k = strtolower($k);
            if (is_array($v)) {
                foreach ($v as $k1 => $v1)
                    $props[$k1] = $v1;
            }
            else
                $props[$k] = $v;
        }
        $this->setProperties($props);
        $this->changed = TRUE;
    }

    function isChanged() {
        return $this->changed;
    }

}

class VTimezone implements IRemoteCalendar {

    private $tzid;
    private $xprop;
    private $standard;
    private $daylight;

    // Properties must not contain hypens in their name
    private static $translate = array();
    private $changed;

    function __construct($values = array()) {
        if (! is_array($values))
            throw new Exception("Attribute to constructor must be an array");
        $this->setProperties($values);
        $this->changed = FALSE;
    }

    private function setProperties(array $props) {
        foreach ($props as $k => $v) {
            switch (strtoupper($k)) {
                case 'TZID':
                    $this->tzid = $v;
                    break;
                default:
                    if (($k[0] == 'x' || $k[0] == 'X') && $k[1] == '-')
                        $this->xprop[$k] = $v;
                    else
                        throw new Exception("[$k,$v]: Unknown attribute");
            }
        }
    }

    function getProperty($name){}
    function setProperty($name, $value) {
        $prop = strtolower($name);
        if (($trans = array_search($prop, self::$translate)) !== false)
            $prop = $trans;
        if (! property_exists($this, $prop)) {
            // Support for PHP 5 < 5.3
            $obj = new ReflectionClass(get_class($this));
            if (! $obj->hasProperty($prop))
                throw new Exception("$name: Unknown property");
        }
        $this->$prop = $value;
        if (
            $this->$prop == 'standard' && ! isset($this->standard) ||
            $this->$prop == 'daylight' && ! isset($this->daylight)
        ) {
            // we are constructing the object
        }
        else
            $this->changed = TRUE;
    }
    function getAllProperties(){}
    function setAllProperties(array $assoc_array){}
    function isChanged(){}
}

class VCalendar {
    private $calscale;
    private $prodid;
    private $version;
    private $objects;

    function __construct($values = array()) {
        if (! is_array($values))
            throw new Exception("Attribute to constructor must be an array");
        $this->objects = array();
        //print_r($values);
        foreach ($values as $k => $v) {
            switch (strtoupper($k)) {
                case 'CALSCALE':
                    $this->calscale = $v;
                    break;
                case 'PRODID':
                    $this->prodid = $v;
                    break;
                case 'VERSION':
                    $this->version = $v;
                    break;
                default:
                    throw new Exception("$k: Unknown attribute");
            }
        }
    }

    public function addObject(IRemoteCalendar $object) {
        $this->objects[get_class($object)] = $object;
    }

    public function getObject($name) {
        if (isset($this->objects[$name]))
            return $this->objects[$name];
        else
            return null;
    }

    public function getObjects() {
        return $this->objects;
    }

}

class IcalParserIterator implements Iterator {
    private $icalParser;
    private $pos;

    function __construct(IcalParser $icalParser) {
        if (! $icalParser instanceof IcalParser)
            throw new Exception(get_class($icalParser) . ': Can only handle instances of class IcalParser');
        $this->icalParser = $icalParser;
        $this->pos = 0;
    }

    public function current() {
        return $this->icalParser->getIcal($this->pos);
    }

    public function key() {
        return $this->pos;
    }

    public function next() {
        $this->pos++;
    }

    public function rewind() {
        $this->pos = 0;
    }

    public function valid() {
        return $this->icalParser->peek($this->pos);
    }

}

class IcalParser implements IteratorAggregate {
//    private $elements = array('VCALENDAR', 'VEVENT', 'VALARM', 'VTIMEZONE');
//    private $subelem = array('VTIMEZONE' => array('STANDARD', 'DAYLIGHT'));
    private $items;

    function __construct($message = NULL) {
        $this->items = array();
        if ($message)
            $this->setMessage($message);
    }

    function setMessage($message) {
        $this->split_message($message);
    }

    private function remove_value(array &$array, $key) {
        $tmp = array();
        $val;

        foreach ($array as $k => $v) {
            if ($k == $key)
                $val = $v;
            else
                $tmp[$k] = $v;
        }
        $array = $tmp;
        return $val;
    }

    private function newObject($name, $props = array()) {
        try {
            $obj = new ReflectionClass($name);
        }
        catch (ReflectionException $ex) {
            print $ex->getMessage();
            throw new Exception("$name: Class not found");
        }
        $obj = NULL;
        return new $name($props);
    }

    private function split_message($message) {
        $data = null;
        $elem_data = array();
        $data_list = array();
        $elem_list = array();

        if (empty($message))
            return;
        //print "$message\n";
        $lines = explode("\n", $message);
        foreach ($lines as $line) {
            $a = explode(":", $line);
            //print_r($a);
            $item = strtoupper($a[0]);
            if (count($a) > 2) {
                $elem = '';
                for ($i = 1; $i < count($a); $i++) {
                    if ($elem != '')
                        $elem .= ':';
                    $elem .= $a[$i];
                }
                //print "elem: $elem\n";
            }
            else
                $elem = $a[1];
            switch ($item) {
                case 'BEGIN':
                    /*if (! in_array($elem, $this->elements)) {
                        $found = TRUE;
                        if (($sub = end($elem_list)) !== FALSE) {
                            if (! array_key_exists($sub, $this->subelem))
                                $found = FALSE;
                        }
                        else
                            $found = FALSE;
                        reset($elem_list);
                        if (! $found)
                            break;
                    }*/
                    if (count($data) > 0) {
                        if (count($elem_list) > 0) {
                            /*$name = array_pop($elem_list);
                            if (array_key_exists($name, $this->subelem)) {
                                print "BEGIN: $name\n";
                                print_r($data);
                            }*/
                            $elem_data[array_pop($elem_list)] = $data;
                        }
                        else
                            $elem_data[$elem] = $data;
                    }
                    array_push($elem_list, $elem);
                    $data = array();
                    break;
                case 'END':
                    if (count($elem_list) > 0) {
                        /*$name = array_pop($elem_list);
                        if (array_key_exists($name, $this->subelem)) {
                            print "END: $name\n";
                            print_r($data);
                        }*/
                        $elem_data[array_pop($elem_list)] = $data;
                    }
                    $data = array();
                    if ($elem == 'VCALENDAR' && count($elem_data) > 1) {
                        array_push($data_list, $elem_data);
                        $elem_data = array();
                        $elem_list = array();
                    }
                    break;
                default:
                    if (! is_array($data))
                        throw new Exception("Message is not valid [missing 'BEGIN']");
                    if (($pos = strpos($item, ';')) !== false) {
                        $head = substr($item, 0, $pos);
                        $elem = substr($item, $pos + 1) . ';' . $elem;
                        $item = $head;
                        //print "Ny elem: $item:$elem\n";
                    }
                    $data[$item] = $elem;
            }
        }
        //print_r($data_list);
        foreach ($data_list as $item) {
            $c = $this->remove_value($item, 'VCALENDAR');
            $calendar = new VCalendar($c);
            foreach ($item as $k => $v) {
                if ($k == 'DAYLIGHT' || $k == 'STANDARD') {
                    $object = $calendar->getObject('VTimezone');
                    if (! is_object($object)) {
                        $object = $this->newObject('VTimezone');
                        $calendar->addObject($object);
                    }
                    $object->setProperty($k, $v);
                }
                else {
                    if (($object = $calendar->getObject($k)) == NULL) {
                        $object = $this->newObject($k, $v);
                        $calendar->addObject($object);
                    }
                    else {
                        $object->setAllProperties($v);
                    }
                }
            }
            array_push($this->items, $calendar);
        }
    }

    public function getIterator() {
        return new IcalParserIterator($this);
    }

    public function getIcal($id) {
        if ($this->peek($id))
            return $this->items[$id];
        else
            throw new Exception("Index out of bounds");
    }

    public function peek($id) {
        return isset($this->items[$id]);
    }

}

?>
