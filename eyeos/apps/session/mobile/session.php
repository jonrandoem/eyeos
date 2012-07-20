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

abstract class SessionMobileApplication extends EyeosApplicationExecutable {
	private static $initApps = array('desktop');
	
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		// Kill "login" process if any
		$PM = ProcManager::getInstance();
		$procList = $PM->getProcessesTable();
		foreach($procList as $proc) {
			switch ($proc->getName()) {
				case 'init':
					break;
				case 'session':
					break;
				default:
					try {
						$PM->kill($proc);
					} catch (Exception $e) {
						Logger::getLogger('eyeosmobile.session')->warn('Cannot kill login process ' . $proc . ': ' . $e->getMessage());
					}
					break;
			}
		}
		
		$args = $context->getArgs();
		
		// User information (cached in eyeos.js)
		$args[0] = EyeosApplicationExecutable::__callModule('UserInfo', 'getCurrentUserInfo', array());
		
		// Initial application(s) to launch (= static list $initApps excluding already running processes)
//		$procList = ProcManager::getInstance()->getProcessesList();
		//$args[1] = array_diff(self::$initApps, $procList);
//        $args[1] = array_values(array_diff(self::$initApps, $procList));

		//For the moment we just restore init application
		$args[1] = self::$initApps;
	}
}
?>