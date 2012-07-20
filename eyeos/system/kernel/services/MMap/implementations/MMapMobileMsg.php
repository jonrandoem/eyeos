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
class MMapMobileMsg extends Kernel implements IMMap {
	public static function getInstance() {
		return parent::getInstance(__CLASS__);
	}

	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('checknum') && $request->issetGET('message') && $request->issetGET('mobile')) {
			return true;
		}
		return false;
	}

	public function processRequest(MMapRequest $request, MMapResponse $response) {
		ob_start('mb_output_handler');
		MMapManager::startSession();

		//check if the session has expired
		MMapManager::checkSessionExpiration();

		$return = null;
		$dataManager = DataManager::getInstance();

		// restore current process using checknum
		$myProcManager = ProcManager::getInstance();
		$myProcess = $myProcManager->getProcessByChecknum($request->getGET('checknum'));
		$myProcManager->setCurrentProcess($myProcess);

		$appDesc = new EyeMobileApplicationDescriptor($myProcess->getName());

		$POST = $request->getPOST();

		$params = array();
		if (isset($POST['params'])) {
			$params = $dataManager->doInput($POST['params']);
		} else {
			if($request->issetGET('params')) {
				$params = $request->getGET('params');
			}
		}

		$methodName = $request->getGET('message');

		// calling an ExecModule
		if (strpos($methodName, '__') === 0) {
			$moduleName = explode('_', substr($methodName, 2));

			$methodName = $moduleName[1];		//ex: "FileChooser"
			$moduleName = $moduleName[0];		//ex: "browsePath"

			$return = call_user_func_array(
				array($appDesc->getApplicationClassName(), '__callModule'),
				array($moduleName, $methodName, $params)
			);
		}
		// regular application method call
		else {
			if($appDesc->isJavascriptOnlyApplication()) {
				$return = call_user_func(array('EyeosJavascriptApplicationExecutable', $methodName), $params);
			} else {
				if (method_exists($appDesc->getApplicationClassName(), $methodName)) {
					$return = call_user_func(array($appDesc->getApplicationClassName(), $methodName), $params);
				} else {
					//If no function is present, call the NOT mobile function
					MMapMsg::getInstance()->processRequest($request, $response);
					return;
				}
//				try {
//					$return = call_user_func(array($appDesc->getApplicationClassName(), $methodName), $params);
//				} catch (Exception $e) {
//					//If no function is present, call the NOT mobile function
//					MMapMsg::getInstance()->processRequest($request, $response);
//					return;
//				}
				
			}
		}
		if ($response->getBodyRenderer() === null && $response->getBody() == '') {
			$response->setBodyRenderer(new DataManagerBodyRenderer($return));
		}
	}
}
?>