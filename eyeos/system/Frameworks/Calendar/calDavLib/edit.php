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
        $newComponet = $cal1->newComponent("VEVENT");
        $newComponet->update($_POST,$cal1);

        //$thisEvent->update($_POST,$cal1);
}
?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
    <head>
        <title>Google Caldav Sample</title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>
      <form id="frm1" method="post" action = "" >
        <table border="1">
            <tr>
                <th>Date Ini</th>
                <?php     echo "<td><input type='text' name='dtstart' value='".$_POST["dtstart"]."' /></td>"; ?>
            </tr>
            <tr>
                <th>TZ Ini</th>
                <?php     echo "<td><input type='text' name='dtstartzone' value='".$_POST["dtstartzone"]."' readonly='readonly' /></td>"; ?>
            </tr>
            <tr>
                <th>DateEnd</th>
                 <?php     echo "<td><input type='text' name='dtend' value='".$_POST["dtend"]."' readonly='readonly' /></td>"; ?>
            </tr>
            <tr>
                <th>TZ End</th>
                 <?php     echo "<td><input type='text' name='tdendzone' value='".$_POST["tdendzone"]."' readonly='readonly' /></td>"; ?>
            </tr>
            <tr>
                <th>name</th>
                 <?php     echo "<td><input type='text' name='summary' value='".$_POST["summary"]."' /></td>"; ?>
            </tr>
            <tr>
                <th>Location</th>
                 <?php     echo "<td><input type='text' name='location' value='".$_POST["location"]."' /></td>"; ?>
            </tr>
            <tr>
                <th>Description</th>
                 <?php     echo "<td><input type='text' name='description' value='".$_POST["description"]."' /></td>"; ?>
            </tr>
            <tr>
                <th>Repetition Rule</th>
                 <?php     echo "<td><input type='text' name='rrule' value='".$_POST["rrule"]."' /></td>"; ?>
            </tr>
            <tr>
                <?php
                        if(!empty($_POST["rrule"])) {
                ?>
                              <td><input type="submit" name="action" value="Update All" /> </td>
                              <td><input type="submit" name="action" value="Update Only This" /> </td>
                <?php
                        } else {
                ?>
                                <td><input type="submit" name="action" value="Update" /> </td>
                              <td></td>
                <?php
                        }
                ?>
            </tr>
        </table>
                      <input type='hidden' name='uid' value='<?php echo $_POST["uid"]; ?>' />
                      <input type='hidden' name='url' value='<?php echo $_POST["url"]; ?>' />
                      <input type='hidden' name='etag' value='<?php echo $_POST["etag"]; ?>' />
                      <input type='hidden' name='uid' value='<?php echo $_POST["uid"]; ?>' />
                      <input type='hidden' name='recurrence-id' value='<?php echo $_POST["recurrence-id"]; ?>' />
      </form>
      <a href="index.php" >Back</a>
    </body>
</html>