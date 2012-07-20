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
class MMapExternApp extends Kernel implements IMMap {
	private static $Logger = null;
	
	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapExternApp');
		return parent::getInstance(__CLASS__);
	}
	 
	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('checknum') && $request->issetGET('appName') && $request->issetGET('appFile')) {
			return true;
		}
		
		return false;
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
        
		ob_start('mb_output_handler');
		MMapManager::startSession();
		
		// restore process context
		$myProcManager = ProcManager::getInstance();
		$myProcess = $myProcManager->getProcessByChecknum($request->getGET('checknum'));
		$myProcManager->setCurrentProcess($myProcess);
		
		// process request
		$externFile = FSI::getFile('sys:///' . APPS_DIR . '/' . $request->getGET('appName') . '/' . $request->getGET('appFile'));
		$type = $request->issetGET('type') ? $request->getGET('type') : '';
		if (strpos($externFile->getAbsolutePath(), 'sys:///' . APPS_DIR . '/') === 0) {
			$myExt = $externFile->getExtension();
			
			if ($externFile->isReadable()) {
				$len = $externFile->getSize();
				
				if ($type == 'text') {
					$response->getHeaders()->append('Content-type: text/plain');
				} else if($type == 'js' || $myExt == 'js') {
					$response->getHeaders()->append('Content-type: text/javascript');
				} else if($myExt == 'htm' || $myExt == 'html' || $myExt == 'xhtml') {
					$response->getHeaders()->append('Content-type: text/html');
				} else if ( ($type == 'image' && !empty($myExt) ) || $myExt == 'png' || $myExt == 'jpg' || $myExt == 'gif') {
					$response->getHeaders()->append('Content-Type: image/' . $myExt);
				} else if ($type == 'download') {
					$response->getHeaders()->append('Content-Type: application/force-download');
					$response->getHeaders()->append('Content-Description: File Transfer');
					$response->getHeaders()->append('Content-Disposition: attachment; filename="' . $externFile->getName() . '"');
				} else if ($type == 'css' || $myExt == 'css') {
					$response->getHeaders()->append(array('Content-type: text/css', true));
				} else if ($type == 'xml' || $myExt == 'xml' || $myExt == 'xsl') {
					$response->getHeaders()->append('Content-type: text/xml');
				} else if($type == 'swf'  || $myExt == 'swf'){
					$response->getHeaders()->append('Content-type: application/x-shockwave-flash');
				} else if($type == 'mp3' || $myExt == 'mp3') {
					$response->getHeaders()->append('Content-type: audio/mpeg3');
				} else if($type == 'mp4' || $myExt == 'mp4') {
					$response->getHeaders()->append('Content-type: video/mp4');
				} else if($type == 'flv' || $myExt == 'flv') {
					$response->getHeaders()->append('Content-type: video/x-flv');
				}
				
				$response->getHeaders()->append('Content-Length: ' . $len);
				$response->getHeaders()->append('Accept-Ranges: bytes');
				$response->getHeaders()->append('X-Pad: avoid browser bug');

				$response->getHeaders()->append('Cache-Control: ');
				$response->getHeaders()->append('pragma: ');
				
				if (self::$Logger->isDebugEnabled()) {
					self::$Logger->debug('Preparing to output file: ' . $externFile->getAbsolutePath());
				}
				$response->setBodyRenderer(new FileReaderBodyRenderer($externFile->getInputStream()));
			}
		} else {
			self::$Logger->warn('Illegal path given: ' . $externFile->getAbsolutePath() . '. Operation cancelled.');
		}
	}
}
?>