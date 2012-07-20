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
class MMapPath extends Kernel implements IMMap {
	private static $Logger = null;
	
	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapMsg');
		return parent::getInstance(__CLASS__);
	}
	 
	public function checkRequest(MMapRequest $request) {
		if ($request->issetSERVER('PATH_INFO') && $request->getSERVER('PATH_INFO')) {
			return true;
		}
		
		return false;
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
		$data = explode('/', $request->getSERVER('PATH_INFO'));
		if(count($data) < 3) {
			self::$Logger->error('Invalid PATH_INFO: ' . $request->getSERVER('PATH_INFO') . '. Cannot route request to final MMapManager.');
			return;
		}
		
		// => MMapExtern
		if($data[1] == 'extern') {
			$path = '';
			for($i = 2; $i < count($data); $i++) {
				if(empty($path)) {
					$path = $data[$i];
				} else {
					$path .= '/' . $data[$i];
				} 
			}
			$request->setGET('extern', $path);
			MMapExtern::getInstance()->processRequest($request, $response);	
		}
		// => MMapExternApp
		elseif($data[1] == 'externApplication') {
			$path = '';
			for($i = 4; $i < count($data); $i++) {
				if(empty($path)) {
					$path = $data[$i];
				} else {
					$path .= '/' . $data[$i];
				} 
			}

			$request->setGET('checknum', $data[2]);
			$request->setGET('appName', $data[3]);
			$request->setGET('appFile', $path);
			MMapExternApp::getInstance()->processRequest($request, $response);
		}
		// => MMapMsg
		elseif($data[1] == 'msg') {
			$request->setGET('checknum', $data[2]);
			$request->setGET('message', $data[3]);
			$request->setPOST('params', $data[4]);

			MMapMsg::getInstance()->processRequest($request, $response);
		}
	}
}
?>