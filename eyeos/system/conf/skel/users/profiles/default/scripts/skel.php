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

// you can use $user here, representing the eyeosAbstractUser in the system.

$sqlQuery = "INSERT INTO `eyeosmetadata` (`id`, `className`, `object_id`, `name`, `data`) VALUES
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.desktop.widgets', 'a:7:{s:7:\"desktop\";a:4:{s:5:\"title\";s:7:\"Desktop\";s:9:\"installed\";s:5:\"false\";s:6:\"column\";s:1:\"1\";s:8:\"position\";s:1:\"1\";}s:5:\"files\";a:5:{s:5:\"title\";s:5:\"Files\";s:9:\"installed\";s:4:\"true\";s:6:\"column\";i:1;s:8:\"position\";i:0;s:9:\"minimized\";b:0;}s:6:\"groups\";a:5:{s:5:\"title\";s:9:\"My Groups\";s:9:\"installed\";s:4:\"true\";s:6:\"column\";i:1;s:8:\"position\";i:1;s:9:\"minimized\";b:0;}s:6:\"events\";a:6:{s:5:\"title\";s:6:\"Events\";s:9:\"installed\";s:4:\"true\";s:5:\"items\";s:1:\"5\";s:6:\"column\";i:3;s:8:\"position\";i:1;s:9:\"minimized\";b:0;}s:9:\"favorites\";a:5:{s:5:\"title\";s:22:\"Favorites Applications\";s:9:\"installed\";s:4:\"true\";s:6:\"column\";i:3;s:8:\"position\";i:0;s:9:\"minimized\";b:0;}s:5:\"notes\";a:5:{s:5:\"title\";s:5:\"Notes\";s:9:\"installed\";s:4:\"true\";s:6:\"column\";i:3;s:8:\"position\";i:2;s:9:\"minimized\";b:0;}i:1;a:3:{s:6:\"column\";i:1;s:8:\"position\";i:0;s:9:\"minimized\";b:0;}}'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.applications.installed', 'a:6:{s:10:\"calculator\";s:1:\"0\";s:4:\"mail\";s:1:\"0\";s:5:\"files\";s:1:\"0\";s:8:\"calendar\";s:1:\"0\";s:9:\"documents\";s:1:\"0\";s:7:\"notepad\";s:1:\"0\";}'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.applications.favorite', 'a:5:{s:10:\"calculator\";s:1:\"0\";s:5:\"files\";s:1:\"0\";s:8:\"calendar\";s:1:\"0\";s:9:\"documents\";s:1:\"0\";s:7:\"notepad\";s:1:\"0\";}'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.desktop.wallpaperId', 's:6:\"nature\";'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.language', 's:2:\"en\";'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.desktop.mode', 's:7:\"classic\";'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.desktop.dashboard.nbcolumns', 's:1:\"3\";'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.desktop.wallpaperMode', 's:5:\"image\";'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.desktop.backgroundColors', 'a:9:{s:7:\"#E6E6E6\";s:4:\"true\";s:7:\"#CCDADA\";s:5:\"false\";s:7:\"#A1C4E0\";s:5:\"false\";s:7:\"#A7AFC4\";s:5:\"false\";s:7:\"#999999\";s:5:\"false\";s:7:\"#6293BB\";s:5:\"false\";s:7:\"#679966\";s:5:\"false\";s:7:\"#787B9A\";s:5:\"false\";s:7:\"#6E829A\";s:5:\"false\";}'),
(NULL, 'EyeosUser', '" . $user->getId() . "', 'eyeos.user.desktop.wallpaper', 's:50:\"sys:///extern/images/wallpapers/nature/default.jpg\";');";

$dao = StorageManager::getInstance()->getHandler(SQL_DAOHANDLER);
$dao->send($sqlQuery);

?>