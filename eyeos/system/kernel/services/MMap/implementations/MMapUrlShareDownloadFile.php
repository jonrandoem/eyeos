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
class MMapUrlShareDownloadFile extends Kernel implements IMMap {
	private static $Logger = null;
	
	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapUrlShareDownloadFile');
		return parent::getInstance(__CLASS__);
	}
	 
	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('downloadFile')) {
			return true;
		}
		
		return false;
	}
	
	public function processRequest(MMapRequest $request, MMapResponse $response) {
        $urlName = $request->getGET('downloadFile');
        $urlShare = new UrlShare();
        $urlShare->setName($urlName);
        $urlShareController = UrlShareController::getInstance();
        $urlShare = current($urlShareController->searchUrl($urlShare));


        if ($urlShare) {
                $passwordUrl = $urlShare->getPassword();
                if ($passwordUrl) {
                    $file = new UrlFile();
                    $file->setId($urlShare->getFileId());
                    $urlShareController->readFile($file);

                    $passwordRequest = $request->getPOST('password');
                    if ($passwordRequest == $passwordUrl) {
                        if ($file) {
                            self::downloadFile($file->getPath(), $request, $response);
                            self::registerDownload($urlShare);
                        } else {
                            self::renderNotFoundFile($response);
                        }
                    } else {
                        if ($file) {
                            $fileName = basename($file->getPath());
                            $currentFile = FSI::getFile($file->getPath());
                            $size = $currentFile->getSize();
                            $unim = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
                            $c = 0;
                            while ($size >= 1024) {
                                $c++;
                                $size = $size / 1024;
                            }
                            $size = number_format($size, ($c ? 2 : 0), ',', '.') . ' ' . $unim[$c];
                            self::renderWrongPassword($fileName, $size, $urlName, $response, $urlShare->getPassword());
                        } else {
                            self::renderNotFoundFile($response);
                        }
                    }
                } else {
                    $file = new UrlFile();
                    $file->setId($urlShare->getFileId());
                    $urlShareController->readFile($file);
                    if ($file) {
                        self::downloadFile($file->getPath(), $request, $response);
                        self::registerDownload($urlShare);
                    } else {
                        self::renderNotFoundFile($response);
                    }
                }
        } else {
            self::renderNotFoundFile($response);
        }
    }

    private function downloadFile($filePath,$request,$response){
		$myFile = FSI::getFile($filePath);
		$len = $myFile->getSize();
		$filename = $myFile->getName();
		$mimetype = $myFile->getMimeType();

		$filename = str_replace("\n","", $filename);
		$filename = str_replace("\r","", $filename);

		header('Content-Length: ' . $len);
		header('Content-Type: ' . $mimetype);
		header('Accept-Ranges: bytes');
		header('X-Pad: avoid browser bug');
		header('Content-Disposition: attachment; filename="' . $filename . '"');

		$myRealFile = $myFile->getRealFile();
		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		session_write_close();
		readFile($fileNameDestination);
		exit;
	}

	private function renderWrongPassword($fileName,$fileSize,$urlName,$response,$hasPassword){
		header ("Location: index.php?download=".$urlName."&wrongPassword=1");
		exit();
	}

	private function renderNotFoundFile($response,$urlName){
		header ("Location: index.php?download=".$urlName);
		exit();
	}

	private function registerDownload($urlShare){
		$urlShareController = UrlShareController::getInstance();
		$urlShare->setLastDownloadDate(time());
		$urlShareController->updateUrl($urlShare);
	}

	private function renderNotEnabledFile($response){
		header ("Location: index.php?download=".$urlName);
		exit();
	}
}
?>