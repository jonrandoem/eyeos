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

define('SERVICE_FILESYSTEM_OOFILESLIB_DIR', 'ooFiles');
define('SERVICE_FILESYSTEM_OOFILESLIB_PATH', SERVICE_FILESYSTEM_LIBRARIES_PATH.'/'.SERVICE_FILESYSTEM_OOFILESLIB_DIR);

define('SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_DIR', 'req');
define('SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_PATH', SERVICE_FILESYSTEM_OOFILESLIB_PATH.'/'.SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_DIR);

define('SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_DIR', 'classes');
define('SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_PATH', SERVICE_FILESYSTEM_OOFILESLIB_PATH.'/'.SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_DIR);


/**
 * Loads the ooFiles library and all its classes.
 */
function lib_ooFiles_load() {
	//load abstract class
	$preReqFiles = scandir(SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_PATH);
	foreach($preReqFiles as $currentPreReqFile) {
		if (is_file(SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_PATH.'/'.$currentPreReqFile)) {
			require_once SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_PATH.'/'.$currentPreReqFile;
			$subPreReqFilename = AdvancedPathLib::pathinfo($currentPreReqFile, PATHINFO_FILENAME);
			if (is_dir(SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_PATH.'/'.$subPreReqFilename)) {
				__ooFiles_loadSubFiles(SERVICE_FILESYSTEM_OOFILESLIB_PREREQ_PATH.'/'.$subPreReqFilename);
			}
		}
	}
	
	$classesFiles = scandir(SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_PATH);
	foreach($classesFiles as $currentClassFile) {
		if (is_file(SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_PATH.'/'.$currentClassFile)) {
			require_once SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_PATH.'/'.$currentClassFile;
			$subClassFilename = AdvancedPathLib::pathinfo($currentClassFile, PATHINFO_FILENAME);
			if (is_dir(SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_PATH.'/'.$subClassFilename)) {
				__ooFiles_loadSubFiles(SERVICE_FILESYSTEM_OOFILESLIB_CLASSES_PATH.'/'.$subClassFilename);
			}
		}
	}
}

function __ooFiles_loadSubFiles($subFilesDir) {
	$subClassesFiles = scandir($subFilesDir);
	foreach($subClassesFiles as $currentSubClassFile) {
		if (is_file($subFilesDir.'/'.$currentSubClassFile)) {
			require_once $subFilesDir.'/'.$currentSubClassFile;
			$subClassFilename = AdvancedPathLib::pathinfo($currentSubClassFile, PATHINFO_FILENAME);
			if (is_dir($subFilesDir.'/'.$subClassFilename)) {
				__ooFiles_loadSubFiles($subFilesDir.'/'.$subClassFilename);
			}
		}
	}
}

?>
