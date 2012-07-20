<?php

/*
 +-----------------------------------------------------------------------+
 | program/steps/mail/spell.inc                                          |
 |                                                                       |
 | This file is part of the RoundCube Webmail client                     |
 | Licensed under the GNU GPL                                            |
 |                                                                       |
 | PURPOSE:                                                              |
 |   Invoke the configured or default spell checking engine.             |
 |                                                                       |
 +-----------------------------------------------------------------------+
 | Author: Kris Steinhoff <steinhof@umich.edu>                           |
 +-----------------------------------------------------------------------+

 $Id: spell.inc 3223 2010-01-25 19:05:05Z alec $

*/

if ($spell_engine = $RCMAIL->config->get('spellcheck_engine', 'googie')) {
    include('spell_'.$spell_engine.'.inc');
}

header('HTTP/1.1 404 Not Found');
exit;

?>
