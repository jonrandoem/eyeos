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
 * 
 * @package kernel-services
 * @subpackage MMap
 */
class MMapExternLogin extends Kernel implements IMMap {
	private static $Logger = null;
	
	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapExternLogin');
		return parent::getInstance(__CLASS__);
	}
	 
	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('externLogin')) {
			return true;
		}
		
		return false;
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
		ob_start('mb_output_handler');
		MMapManager::startSession();

		MMapManager::checkSessionExpiration();

		$username = $request->issetPOST('username') ? $request->getPOST('username') : '';
		$password = $request->issetPOST('password') ? $request->getPOST('password') : '';
		$loginPage =  $request->issetPOST('loginPage') ? $request->getPOST('loginPage') : '';
		$subject = new Subject();
		$loginContext = new LoginContext('eyeos-login', $subject);
		$cred = new EyeosPasswordCredential();
		$cred->setUsername($username);
		$cred->setPassword($password, true);
		$subject->getPrivateCredentials()->append($cred);
		try{
		    $loginContext->login();
		    $memoryManager = MemoryManager::getInstance();

		    Kernel::enterSystemMode();
		    $memoryManager->set('isExternLogin', 1);
		    $memoryManager->set('username', $username);
		    $memoryManager->set('password', $password);
		    $memoryManager->set('loginPage', $loginPage);
		    Kernel::exitSystemMode();
		    header ("Location: index.php");
		}
		catch(Exception $e){		  
		    header ("Location:".$loginPage."?errorLogin=1");
		}
	}
}
?>