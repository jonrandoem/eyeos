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
class MMapAPI extends Kernel implements IMMap {
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}
	 
	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('api') && $request->issetPOST('module') && $request->issetPOST('name')) {
			return true;
		}
		
		return false;
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
                ob_start('mb_output_handler');

		$return = null;
		$dataManager = DataManager::getInstance();
		
		$POST = $request->getPOST();
		
		$params = array();
		if (isset($POST['params'])) {
			$params = $dataManager->doInput($POST['params']);
		} else {
			if($request->issetGET('params')) {
				$params = $request->getGET('params');
			}
		}

                //login in the system and get a valid login context
                $subject = new Subject();
                $loginContext = new LoginContext('eyeos-login', $subject);
                $cred = new EyeosPasswordCredential();
                $cred->setUsername($_REQUEST['username']);
                $cred->setPassword($_REQUEST['password'], true);
                $subject->getPrivateCredentials()->append($cred);
                $loginContext->login();

                //now create fake process called api
                Kernel::enterSystemMode();

                $appProcess = new Process('api');
                $appProcess->setPid('31337');
                $mem = MemoryManager::getInstance();
                $processTable = $mem->get('processTable', array());
                $processTable[31337] = $appProcess;
                $mem->set('processTable', $processTable);

                $appProcess->setLoginContext($loginContext);
                ProcManager::getInstance()->setCurrentProcess($appProcess);
                kernel::exitSystemMode();

                $return = call_user_func_array(
                        array('EyeosApplicationExecutable', '__callModule'),
                        array($request->getPOST('module'), $request->getPOST('name'), $params)
                );

                //try to force mime type. If there is a previous mime type defined at application level
		//this have no effect
                if ( !headers_sent() ) {
                    $response->getHeaders()->append('Content-type:text/plain');
                }

		if ($response->getBodyRenderer() === null && $response->getBody() == '') {
			$response->setBodyRenderer(new DataManagerBodyRenderer($return));
		}
	}
}
?>