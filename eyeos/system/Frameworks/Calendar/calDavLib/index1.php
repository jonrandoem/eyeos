<? 
include_once("calendar.class.php");
$cal = new Calendar(
                        'https://www.google.com/calendar/dav/cis.dev22@gmail.com/events/',
                        'cis.dev22@gmail.com',
                        'cis123@@'
        );
$cal->getComponents("20090830T000000Z", "20111201T000000Z");
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
foreach ($cal as $obj)
    var_dump($obj->getBaseComponent());
$bak = $cal['3ba46312e910765bf7059a53909d149b'];
print_r($bak);
print_r(new Icalendar(array('SUMMARY' => 'test')));
$cal['3ba46312e910765bf7059a53909d149b'] = new Icalendar(array('SUMMARY' => 'test'));
print_r($cal['3ba46312e910765bf7059a53909d149b']);
unset($cal['3ba46312e910765bf7059a53909d149b']);
var_dump($cal['3ba46312e910765bf7059a53909d149b']);
$cal['3ba46312e910765bf7059a53909d149b'] = $bak;
var_dump($cal['3ba46312e910765bf7059a53909d149b']);
$cal->update();
print_r($cal['3ba46312e910765bf7059a53909d149b']);
?>