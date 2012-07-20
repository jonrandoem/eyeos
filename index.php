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

if(count(ob_get_status(true)) > 0) {
    ob_end_clean();  
}

error_reporting(E_ALL); 

// Disable register_globals
if (ini_get('register_globals')) {
	$requestKeys = array_keys($_REQUEST);
	
	foreach ($requestKeys as $key) {
		if ($_REQUEST[$key] === $$key) {
			unset($$key);
		}
	}
}

if(file_exists('settings-local.php')) {
	require_once('settings-local.php');
}

require 'settings.php';

if(!defined('SQL_DAOHANDLER')) {
	define('SQL_DAOHANDLER', 'SQL/EyeosDAO');
}

//change current working directory, eyeOS works from EYE_ROOT
changeCWD();

//keep our sessions just for ourselves
session_save_path('./tmp/');

session_set_cookie_params(0, null, null, false, true);
//make sure that garbage collector is running!
ini_set('session.gc_probability', 1);

$__startTime = microtime(true);
$__startMemory = memory_get_usage();

try {
	//Load bootstrap script
	require './' . SYSTEM_DIR . '/' . BOOT_DIR . '/Bootstrap.php';

	//Startup
	Bootstrap::init();
	
	$__endBootstrapTime = microtime(true);
	$__endBootstrapMemory = memory_get_usage();
	//Process incoming request through MMap
	$request = new MMapRequest();
	MMapManager::getInstance()->processRequest($request, new MMapResponse());
	// Temporary - Should be moved into a function
	$__endRequestTime = microtime(true);
	$__endRequestMemory = memory_get_usage();
	$logger = Logger::getLogger('root.metrics');
	if ($logger->isInfoEnabled()) {
		$logger->info('Time: ' . sprintf('%01.2f', $__endRequestTime - $__startTime) . 's / Mem.: '
			. sprintf('%01.2f', ($__endRequestMemory - $__startMemory) / 1024) . 'KB (Bootstrap Time: '
			. sprintf('%01.2f', $__endBootstrapTime - $__startTime) . 's / Mem: '
			. sprintf('%01.2f', ($__endBootstrapMemory - $__startMemory) / 1024) . 'KB) ['
			. $request->getUrl() . ']');
	}
	
} catch (Exception $e) {
	// Log and display the exception that reached this section
	// (this should normally *not* happen in a fully set-up production environment)
	
	// Log with log4php if available
	if (class_exists('Logger')) {
		$logger = Logger::getRootLogger();
		$logger->fatal('Uncaught exception detected in the root page! It is likely to come from the bootstrap.');
		$logger->fatal(ExceptionStackUtil::getStackTrace($e, false));
	}
	
	echo 'There is an error in this eyeOS installation, please contact the system administrator';
	exit;
}

//shutdown
Bootstrap::end();

/*
 *Changes the current work directory to EYE_ROOT
 */
function changeCWD() {
	//since index.php is always below eyeROOT, we can do this instead to be includable from third party code
	$basedir = dirname(__FILE__) . '/';
	//change directory to EYE_ROOT
	chdir($basedir . REAL_EYE_ROOT);
	//Loaded before kernel for kernel utf8 compatibility
}

?>