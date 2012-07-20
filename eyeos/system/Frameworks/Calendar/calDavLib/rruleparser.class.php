<?php
/* $Id$ */
error_reporting(E_ALL ^ E_NOTICE);
    require_once 'caldavresource.class.php';

    define ('FREQUENCE', 'HOURLY,DAILY,WEEKLY,MONTHLY,YEARLY');

    /**
     * Unsupported: SECONDLY, MINUTELY, YEARLY,
     * BYSECOND, BYMINUTE, BYSETPOS, WKST
     * Also preceeding where preceeding is allowed is not
     * supported either.
     */
    class RRuleParser {

        private $rules;
        private $start;
        private $end;
        private $range_start;
        private $range_end;
        private $freq;

        function __construct($rrule = NULL, $start = NULL, $end = NULL) {
            $this->freq = preg_split("/[\s,]+/", FREQUENCE);
            if ($rrule)
                $this->setRule($rrule, $start, $end);
        }

        function setRule($rrule, $start, $end) {
            if (!($start && $end))
                throw new Exception("Missing values for DTSTART and/or DTEND");
            //print "$start:$end<br/>";
            //print var_export($rrule, TRUE) . "<br/>";
            $this->start = CaldavRessource::iCal2Timestamp($start);
            $this->end = CaldavRessource::iCal2Timestamp($end);
            //print CaldavRessource::timestamp2ICal($this->start, TRUE).":".CaldavRessource::timestamp2ICal($this->end, TRUE)."<br/>";
            $rules = explode(';', $rrule);
            //print_r($rules);
            if (count($rules) < 2) {
                foreach ($rules as $rule) {
                    $pair = explode('=', $rule);
                    if (count($pair) < 2 || !in_array($pair[1], $this->freq)) {
                        $this->rules = array();
                        throw new Exception("$rrule: Invalid RRULE");
                    }
                    $this->rules[strtolower($pair[0])] = explode(',', $pair[1]);
                }
            }
            else {
                foreach ($rules as $rule) {
                    $pair = explode('=', $rule);
                    $this->rules[strtolower($pair[0])] = explode(',', $pair[1]);
                }
            }
/*
            if (isset($this->rules['until']) &&  $this->rules['until'][0] && $this->rules['count'][0]) {
                $this->rules = array();
                throw new Exception("COUNT and UNTIL cannot be present at the same time");
            }
 */
            if (!in_array($this->rules['freq'][0], $this->freq)) {
                trigger_error(
                    "[{$this->rules['freq'][0]}] Unsupported FREQ",
                    E_USER_NOTICE);
                $this->rules = array();
            }
        }

        private function getEnd($freq) {
            $count = $this->getCount();
            $until = $this->getUntil();
            //print "$until<br/>";
            if ($count) {
                $int = $this->getInterval();
                $count = ($int) ? $int * $count : $count;
                switch ($freq) {
                    case 'HOURLY': $str = "+$count hour"; break;
                    case 'DAILY': $str = "+$count day"; break;
                    case 'WEEKLY': $str = "+$count week"; break;
                    case 'MONTHLY': $str = "+$count month"; break;
                    case 'YEARLY': $str = "+$count year"; break;
                }
                $end = strtotime($str, $this->start);
                return ($this->range_end && $this->range_end < $end) ?
                    $this->range_end : $end;
            }
            else if ($until) {
                /*
                 * UNTIL has first occurrence at end time and
                 * last ocurrence ending at start time
                 */
                //print "$until:".$this->start."<br/>";
                $u_s = explode("T", CaldavRessource::timestamp2ICal($this->end));
                $time_s = (int) substr($u_s[1], 0, 2);
                $u_e = explode("T", $until);
                $time_e = (int) substr($u_e[1], 0, 2);
                $until = ($time_s != $time_e) ? "{$u_e[0]}T{$u_s[1]}" : $until;
                //print "$time_s:$time_e:$until<br/>";
                $end = CaldavRessource::iCal2Timestamp($until);
                //print CaldavRessource::timestamp2ICal($end)."<br/>";
                return ($this->range_end && $this->range_end < $end) ?
                    $this->range_end : $end;
            }
            else
                return $this->range_end;
        }

        private function except($ts) {
            $byhour = $this->getByHour();
            if ($byhour) {
                $res = TRUE;
                $match = gmdate('G', $ts);
                foreach ($byhour as $hour) {
                    if ($match == $hour)
                        $res = FALSE;
                    if (! $res)
                        return FALSE;
                }
                return TRUE;
            }
            $byday = $this->getByDay();
            if ($byday) {
                $res = TRUE;
                $match = substr(strtolower(gmdate('D', $ts)), 0, 2);
                foreach ($byday as $day) {
                    //print "$match:$day\n";
                    if ($match == strtolower($day))
                        $res = FALSE;
                    if (! $res)
                        return FALSE;
                }
                return TRUE;
            }
            $bymonth = $this->getByMonth();
            if ($bymonth) {
                $res = TRUE;
                $match = gmdate('n', $ts);
                foreach ($bymonth as $month) {
                    if ($match == $month)
                        $res = FALSE;
                    if (! $res)
                        return FALSE;
                }
                return TRUE;
            }
            $bymonthday = $this->getByMonthDay();
            if ($bymonthday) {
                $res = TRUE;
                $match = gmdate('j', $ts);
                foreach ($bymonthday as $monthday) {
                    if ($match + 1 == $monthday)
                        $res = FALSE;
                    if (! $res)
                        return FALSE;
                }
                return TRUE;
            }
            $byweekno = $this->getByWeekNo();
            if ($byweekno) {
                $res = TRUE;
                // Missing to handle Anglo week numbers
                // (week start on Sunday)
                $match = gmdate('W', $ts);
                foreach ($byweekno as $weekno) {
                    if ($match == $weekno)
                        $res = FALSE;
                    if (! $res)
                        return FALSE;
                }
                return TRUE;
            }
            $byyearday = $this->getByYearDay();
            if ($byyearday) {
                $res = TRUE;
                $match = gmdate('z', $ts);
                foreach ($byyearday as $yearday) {
                    if ($match == $yearday)
                        $res = FALSE;
                    if (! $res)
                        return FALSE;
                }
                return TRUE;
            }
            return FALSE;
        }

        private function hourly() {
            $res = array();
            $end = $this->getEnd('HOURLY');
            if (! $end) {
                /**
                 * we will maximum handle one month at a time unless
                 * a specific end date specifies otherwise
                 */
                $end = strtotime('+1 month', $this->start);
            }
            $int = ($this->getInterval()) ? $this->getInterval() : 1;
            $c = $this->start;
            for (; $c < $end; $c = strtotime("+$int hour", $c)) {
                if (! $this->except($c))
                    array_push($res, CaldavRessource::timestamp2ICal($c));
            }
            return $res;
        }

        private function daily() {
            $res = array();
            $end = $this->getEnd('DAILY');
            if (! $end) {
                /**
                 * we will maximum handle one month at a time unless
                 * a specific end date specifies otherwise
                 */
                $end = strtotime('+1 month', $this->start);
            }
            $int = ($this->getInterval()) ? $this->getInterval() : 1;
            $c = $this->start;
            for (; $c < $end; $c = strtotime("+$int day", $c)) {
                if (! $this->except($c))
                    array_push($res, CaldavRessource::timestamp2ICal($c));
            }
            return $res;
        }

        private function weekly() {
            $res = array();
            $end = $this->getEnd('WEEKLY');
            //print "start: ".CaldavRessource::timestamp2ICal($this->start)." end: ".CaldavRessource::timestamp2ICal($end)."\n";
            if (! $end) {
                /**
                 * we will maximum handle 12 weeks at a time unless
                 * a specific end date specifies otherwise
                 */
                $end = strtotime('+12 week', $this->start);
            }
            $int = ($this->getInterval()) ? $this->getInterval() : 1;
            $c = $this->start;
            for (; $c < $end; $c = strtotime("+$int week", $c)) {
            //print "$c<br/>";
                if (! $this->except($c))
                    array_push($res, CaldavRessource::timestamp2ICal($c));
            }
            //print_r($res);
            return $res;
        }

        private function monthly() {
            $res = array();
            $end = $this->getEnd('MONTHLY');
            if (! $end) {
                /**
                 * we will maximum handle 12 months at a time unless
                 * a specific end date specifies otherwise
                 */
                $end = strtotime('+12 month', $this->start);
            }
            $int = ($this->getInterval()) ? $this->getInterval() : 1;
            $c = $this->start;
            for (; $c < $end; $c = strtotime("+$int month", $c)) {
                if (! $this->except($c))
                    array_push($res, CaldavRessource::timestamp2ICal($c));
            }
            return $res;
        }

        private function yearly() {
            $res = array();
            $end = $this->getEnd('YEARLY');
            if (! $end) {
                /**
                 * we will maximum handle 12 years at a time unless
                 * a specific end date specifies otherwise
                 */
                $end = strtotime('+12 year', $this->start);
            }
            $int = ($this->getInterval()) ? $this->getInterval() : 1;
            $c = $this->start;
            for (; $c < $end; $c = strtotime("+$int year", $c)) {
                if (! $this->except($c))
                    array_push($res, CaldavRessource::timestamp2ICal($c));
            }
            return $res;
        }

        private function limitRange($dates) {
            $res = array();
            if (!$this->range_start && !$this->range_end) {
                $res = $dates;
            }
            else if ($this->range_start && !$this->range_end) {
                $start = CaldavRessource::timestamp2ICal($this->range_start);
                foreach ($dates as $date) {
                    if (CaldavRessource::datecmp($start, $date) < 0)
                        array_push($res, $date);
                }
            }
            else {
                $start = CaldavRessource::timestamp2ICal($this->range_start);
                $end = CaldavRessource::timestamp2ICal($this->range_end);
                foreach ($dates as $date) {
                    if (CaldavRessource::datecmp($start, $date) < 0 &&
                        CaldavRessource::datecmp($end, $date) > 0)
                        array_push($res, $date);
                }
            }
            return $res;
        }

        function getFreq() {
            return strtoupper($this->rules['freq'][0]);
        }

        function getUntil() {
            if(isset($this->rules['until'])) {
              return strtoupper($this->rules['until'][0]);
            }
        }

        function getCount() {
            return strtoupper($this->rules['count'][0]);
        }

        function getInterval() {
            return strtoupper($this->rules['interval'][0]);
        }

        function getBySecond() {
            $l = $this->rules['bysecond'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByMinute() {
            $l = $this->rules['byminute'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByHour() {
            $l = $this->rules['byhour'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByDay() {
            $l = $this->rules['byday'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByMonthDay() {
            $l = $this->rules['bymonthday'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByYearDay() {
            $l = $this->rules['byyearday'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByWeekNo() {
            $l = $this->rules['byweekno'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getByMonth() {
            $l = $this->rules['bymonth'];
            if ($l) {
                foreach ($l as $val)
                    $list[] = strtoupper($val);
            }
            return $list;
        }

        function getBySetPos() {
            return strtoupper($this->rules['bysetpos'][0]);
        }

        function getWKST() {
            return strtoupper($this->rules['wkst'][0]);
        }

        function getAll() {
            return $this->rules;
        }

        function getEventDates($startDate = NULL, $endDate = NULL) {
            $dates  = array();

            $freq = $this->getFreq();
            //print "$freq\n";
            if (! in_array($freq, $this->freq))
                return $dates;
            if ($startDate && $endDate) {
                $this->range_start = CaldavRessource::iCal2Timestamp($startDate);
                $this->range_end = CaldavRessource::iCal2Timestamp($endDate);
                if ($this->start > $this->range_end)
                    return $dates;
            }
            else if ($startDate) {
                $this->range_start = CaldavRessource::iCal2Timestamp($startDate);
                $this->range_end = NULL;
            }
            else {
                $this->range_start = NULL;
                $this->range_end = NULL;
            }
            switch ($freq) {
                case 'HOURLY': $dates = $this->hourly(); break;
                case 'DAILY': $dates = $this->daily(); break;
                case 'WEEKLY': $dates = $this->weekly(); break;
                case 'MONTHLY': $dates = $this->monthly(); break;
                case 'YEARLY': $dates = $this->yearly(); break;
                default: break;
            }
            //print_r($dates);
            return (count($dates) > 0) ? $this->limitRange($dates) : $dates;
        }

        function getStartAndEnd() {
            $res['start'] = $this->start;
            $res['end'] = $this->end;
            
            return $res;
        }
        
        function __toString() {
            $str = "FREQ=" . $this->getFreq();
            $until = $this->getUntil();
            $count = $this->getCount();
            if ($until)
                $str .= ';UNTIL=' . $until;
            if ($count)
                $str .= ';COUNT=' . $count;
            foreach ($this->rules as $k => $v) {
                if ($k == 'freq' || $k == 'count' || $k == 'until')
                    continue;
                $str .= ';' . strtoupper($k) . '=';
                foreach($v as $rule) {
                    if ($str[strlen($str) - 1] != '=')
                        $str .= ',';
                    $str .=  strtoupper($rule);
                }
            }
            return $str;
        }

    }
