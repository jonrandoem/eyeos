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

/**
 * Loads the exception library and all its classes.
 */
function lib_exceptions_load() {
	if(!defined('PHP_VERSION_ID')) {
	    $version = PHP_VERSION;
	    define('PHP_VERSION_ID', ($version{0} * 10000 + $version{2} * 100 + $version{4}));
	}

	require LIB_EXCEPTIONS_PATH.'/IChainableException.php';

	// if PHP < 5.3.0, load compatibility exception classes
	if (PHP_VERSION_ID < 50300) {
		require LIB_EXCEPTIONS_PATH . '/EyeException_compat.php';
		require LIB_EXCEPTIONS_PATH . '/EyeErrorException_compat.php';
	} else {
		require LIB_EXCEPTIONS_PATH . '/EyeException.php';
		require LIB_EXCEPTIONS_PATH . '/EyeErrorException.php';
	}
	
	//load subclasses exceptions
	$subClassesFiles = scandir(LIB_EXCEPTIONS_SUBCLASSES_PATH);
	foreach($subClassesFiles as $currentSubClassFile) {
		if (is_file(LIB_EXCEPTIONS_SUBCLASSES_PATH . '/' . $currentSubClassFile)) {
			require LIB_EXCEPTIONS_SUBCLASSES_PATH . '/' . $currentSubClassFile;
		}
	}
	
	//load error handler
	lib_exceptions_loadErrorHandler();
}

/**
 * Error handler used to convert PHP E_NOTICE and E_WARNING into Exceptions.
 * 
 * @access private
 * @param int $severity The severity of the error
 * @param string $message The error message
 * @param string $filename The filename that the error was raised in
 * @param int $lineno The line number the error was raised at
 * @return boolean
 */
function __lib_exceptions_error_handler($severity, $message, $filename, $lineno, $context = null) { 
	if (error_reporting() & $severity) { 
		throw new EyeErrorException($message, 0, $severity, $filename, $lineno, $context);
	}
}

/**
 * Loads the error handler used to convert E_NOTICEs and E_WARNINGs to exceptions.
 * 
 * @param int $errorTypes Can be used to mask the triggering of the error_handler function
 *        just like the error_reporting ini setting controls which errors are shown. Without
 *        this mask set the error_handler will be called for every error regardless to the
 *        setting of the error_reporting setting. (Default: E_ALL | E_STRICT)
 * @see __exceptions_error_handler()
 */
function lib_exceptions_loadErrorHandler($errorTypes = null) {
	if ($errorTypes === null) {
		$errorTypes = E_ALL | E_STRICT;
	}
	set_error_handler('__lib_exceptions_error_handler', $errorTypes);
}

/**
 * Restores the previous error handler.
 */
function lib_exceptions_unloadErrorHandler() {
	restore_error_handler();
}

?>
