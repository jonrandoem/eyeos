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

ob_start();

if(!isset($_GET['step'])) {
    $step = 'introduction';
} else {
    $step = basename($_GET['step']);
}

require_once('steps/'.$step.'.php');

echo '<?xml version="1.0" encoding="UTF-8" ?>';

?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                <link rel="stylesheet" type="text/css" media="all" href="style.css"/>
		<title>eyeOS 2 installation</title>
	</head>
	<body>
            <div id="wrapper" class="wrapper">
                <div id="topbar" class="topbar">
                    <img src="logo-eyeos.png" id="logo" class="logo" />
                    <div id="logotext" class="logotext">
                        <? echo toptext(); ?>
                    </div>
                </div>
                <span id="sidebar" class="sidebar">
                    <ul class="sidelist">
                        <?php
                            if($step == 'introduction') {
                                echo '<li class="selected">Introduction</li>';
                            } else {
                                echo '<li>Introduction</li>';
                            }

                            if($step == 'requirements') {
                                echo '<li class="selected">Requirements</li>';
                            } else {
                                echo '<li>Requirements</li>';
                            }
                            if($step == 'configuration') {
                                echo '<li class="selected">Configuration</li>';
                            } else {
                                echo '<li>Configuration</li>';
                            }

                            if($step == 'end') {
                                echo '<li class="selected">End</li>';
                            } else {
                                echo '<li>End</li>';
                            }
                        ?>
                    </ul>
                </span>
                <span id="content" class="content">
                      <?php getContent(); ?>
                </span>
            </div>
	</body>
</html>