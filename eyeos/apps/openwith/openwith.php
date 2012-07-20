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

abstract class OpenwithApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$args = $context->getArgs();
		if (!isset($args[0]) || !is_string($args[0])) {
			throw new EyeMissingArgumentException('Missing filename to open.');
		}
		
		try {
			$file = FSI::getFile($args[0]);
		} catch (Exception $e) {
			throw new EyeInvalidArgumentException('args[0] must be a valid path to a file.', 0, $e);
		}
		
		$appName = false;
		if ($file->isDirectory()) {
			$appName = 'files';
		} else {
			$extension = utf8_strtolower($file->getExtension());
			
			// TODO: Currently hard-coded here but in the future associations will be read from a DB.
			// We must have general entries, common to all the users of the system, that will be used
			// as default, and then user-customized entries with a higher priority on the general ones.
			switch ($extension) {
				//
				//	VIEWER
				//
				case 'jpg':
				case 'gif':
				case 'jpeg':
				case 'png':
				case 'htm':
				case 'html':
				case 'flv':
				case 'm4a':
				case 'mp3':
					$appName = 'viewer';
					break;
				
				//
				//	EDITOR
				//
				case 'txt':
				case 'xml':
				case 'ini':
				case 'js':
				case 'sql':
				case 'log':
					$appName = 'femto';
					break;
			}
		}
		
		// Association found: execute matching application
		if ($appName) {
			$myProcess = ProcManager::getInstance()->getCurrentProcess();
			
			// prepare context and execute application
			$currentAppDesc = new EyeosApplicationDescriptor($appName);
			$appContext = new AppExecutionContext();
			$appContext->setParentProcess($myProcess);
			$appContext->setApplicationDescriptor($currentAppDesc);
			$appContext->setArgs(clone $args);
			MMapGetApp::getInstance()->processRequest(MMapManager::getCurrentRequest(), $response, $appContext);
			
			// Kill our process
			$context->setExecuteJavascript(false);
			ProcManager::getInstance()->kill($myProcess);
			return;
		}
		
		// Otherwise, show the OpenWith dialog
	}
	
	/**
	 * 
	 * @return TODO
	 */
	public static function getApplicationsList() {
		//TODO
	}
}
?>