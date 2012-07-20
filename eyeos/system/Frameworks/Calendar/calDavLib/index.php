<?php
  include_once("calendar.class.php");
  if(isset ($_POST['action'])){
     $cal1 = new Calendar(
                        'https://www.google.com/calendar/dav/fcppicqrfm5f5s6a5dltrkjbu4@group.calendar.google.com/events/', // for pCalendar 0222
                        //'https://www.google.com/calendar/dav/2f972snsoj4tv9qo4j44eflhmo@group.calendar.google.com/events/', // for kamal's calendar
                        'cis.dev22@gmail.com',
                        'cis123@@'
        );
       $cal1->getComponents("20090830T000000Z", "20501201T000000Z");
       $thisEvent = null;
        foreach ($cal1 as $obj1) {
              if($_POST['etag'] == $obj1->getEtag()) {
                    $thisEvent = $obj1;
              }
        }
        $thisEvent->delete($_POST,$cal1);
}



?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
    <head>
        <title>Google Caldav Sample</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>

<?php
        $cal = new Calendar(
                         'https://www.google.com/calendar/dav/fcppicqrfm5f5s6a5dltrkjbu4@group.calendar.google.com/events/', // for pCalendar 0222
                        // 'https://www.google.com/calendar/dav/2f972snsoj4tv9qo4j44eflhmo@group.calendar.google.com/events/', // for kamal's calendar
                        'cis.dev22@gmail.com',
                        'cis123@@'
        );
       
        //Date Ini and Date End in YYYYMMDDTHHMMSSZ format
        $cal->getComponents("20090830T000000Z", "20501201T000000Z");
        $events = $cal->showAllEvents();
        usort($events, "sortByDate");

        //print_r($cal->getAllComponents());

        //$newVal = array('SUMMARY' => "55555555555555555", 'LOCATION' => '55555555555555' ) ;
        //$ev = $cal->newComponent('VEVENT');
        //$ev->setAllProperties($newVal);
        //$cal->update($ev->getUrl(),$ev->getEtag());


        function sortByDate($a, $b) {
            return strcmp($a["dtstart"], $b["dtstart"]);
        }
        ?>
        <table border="1">
            <tr>
                <th>Date Ini</th>
                <th>TZ Ini</th>
                <th>DateEnd</th>
                <th>TZ End</th>
                <th>name</th>
                <th>Location</th>
                <th>Description</th>
                <th>Repetition Rule</th>
                <th>Action</th>
            </tr>
            
            <?php
            $i = 0;
                foreach ($events as $event){
                    //print_r($event['exdate']);
                    $exDates = (!empty($event["exdate"]))?implode(",",$event["exdate"]): "";
                    echo '<form id="frm1_'.$i.'" method="post" action = "" >';
                    $location=isset($event["location"])?$event["location"]:"&nbsp;";
                    $description=isset($event["description"])?$event["description"]:"&nbsp;";
                    $rrule=isset($event["rrule"])?$event["rrule"]:"";
                    $recurrence_id = ($event['recurence-id'])? $event['recurence-id']:'';
                    
                    echo "<tr>";
                        echo "<td> ".$event["dtstart"]."<input type='hidden' name='dtstart' value='".$event["dtstart"]."' /></td>";
                        echo "<td> ".$event["dtstartzone"]."<input type='hidden' name='dtstartzone' value='".$event["dtstartzone"]."' /></td>";
                        echo "<td> ".$event["dtend"]."<input type='hidden' name='dtend' value='".$event["dtend"]."' /></td>";
                        echo "<td> ".$event["dtendzone"]."<input type='hidden' name='tdendzone' value='".$event["dtendzone"]."' /></td>";
                        echo "<td> ".$event["summary"];
                        echo "<input type='hidden' name='summary' value='".$event["summary"]."' /></td>";
                        echo "<td> ".$location;
                        echo "<input type='hidden' name='location' value='".$location."' /></td>";
                        echo "<td> ".$description;
                        echo "<input type='hidden' name='description' value='".$description."' /></td>";
                        echo "<td> ".$rrule."<input type='hidden' name='rrule' value='".$rrule."' /></td>";
                        echo "<td> <input type='hidden' name='uid' value='".$event["uid"]."' />";
                        echo "<input type='hidden' name='url' value='".$event["url"]."' />";
                        echo "<input type='hidden' name='etag' value='".$event["etag"]."' />";
                        echo "<input type='hidden' name='uid' value='".$event["uid"]."' />";
                        echo "<input type='hidden' name='recurrence-id' value='".$recurrence_id."' />";
                        echo "<input type='hidden' name='exdate' value='".$exDates."' />";
                        //echo "<input type='hidden' name='calObj' value='".(string)$cal."' />";
                       // echo "<input type='hidden' name='eventObj' value='".(string)$event["eventObj"]."' />";

                        //echo "<input type='submit' name='action' value='Update' />";
                        if(!empty($rrule)) {
                              echo "<input type='submit' name='action' value='Delete All' />";
                              echo "<input type='submit' name='action' value='Delete Only This' />";
                        } else
                        {
                              echo "<input type='button' name='action' value='Delete' />";
                        }
                        echo "<input type='button' name='action' value='Edit' onclick='document.getElementById(\"frm1_".$i."\").action=\"edit.php\";document.getElementById(\"frm1_".$i."\").submit(); ' /></td>";
                    echo "</tr>";
                    echo ' </form>';
                    $i++;
                }
                
            ?>
        </table>

    </body>
</html>