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
class MMapUrlShareDownload extends Kernel implements IMMap {

    private static $Logger = null;

    public static function getInstance() {
        self::$Logger = Logger::getLogger('system.services.MMap.MMapUrlShareDownload');
        return parent::getInstance(__CLASS__);
    }

    public function checkRequest(MMapRequest $request) {
        if ($request->issetGET('download')) {
            return true;
        }

        return false;
    }

    public function processRequest(MMapRequest $request, MMapResponse $response) {
        $urlName = $request->getGET('download');
		if(is_array($urlName)) {
			exit;
		}
        $urlShare = new UrlShare();
        $urlShare->setName($urlName);
        $urlShareController = UrlShareController::getInstance();
        $urlShare = current($urlShareController->searchUrl($urlShare));

        if ($urlShare) {
                if ($urlShare->getExpirationDate() < time()) {
                    self::renderErrorMessage($response, 'Url Expired');
                    return;
                }
                $file = new UrlFile();
                $file->setId($urlShare->getFileId());
                $urlShareController->readFile($file);

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
                    if ($request->issetGET('wrongPassword')) {
                        $wrongPassword = $request->getGET('wrongPassword');
                    } else {
                        $wrongPassword = 0;
                    }

                    Kernel::exitSystemMode();
                    self::renderFoundFile($fileName, $size, $urlName, $response, $urlShare->getPassword(), $wrongPassword);
                } else {
                    self::renderErrorMessage($response, 'File not available');
                }
            } else {
                self::renderErrorMessage($response, 'File not available');
            }
    }

	private function renderFoundFile($fileName, $fileSize, $urlName, $response, $hasPassword, $wrongPassword) {
		$response->getHeaders()->append('Content-type: text/html');
		$htmlString =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
					<link rel="icon" type="image/png" href="images/favicon.png" />
					<title>Downloading eyeOS file</title>
					<style type="text/css">
						html, body,center {
							padding: 0px;
							margin: 0px;
							background-color: #dfdfdf;
							width: 100%;
							height: auto;
						}
						#centerdiv {
							width: 790px;
							margin-top: 30px;
						}
						#logo_eyeos {
							float: left;
							margin-left: 80px;
						}
						#shadow {
							clear: both
						}
						#main {
							width: 630px;
							padding: 20px 80px;
						}
						#file_info {
							width: 226px;
							padding: 40px;
							float: left;
							border: 2px solid #b5b5b5;
							background-color: #f4f4f4;
						}
						#file_info_logo {
							max-width: 48px;
							max-height: 48px;
							float: left;
						}
						#file_info_desc {
							width: 160px;
							float: right;
							overflow: hidden;
							text-overflow: ellipsis;
							text-align: left;
							font: normal 16px Arial;
							color: #242424;
						}
						#file_password {
							width: 160px;
							float: right;
							margin-top:10px;
							font: normal 12px Arial;
							color: #242424;
						}
						#file_password_field {
							width: 140px;
							float: right;
							margin-top:10px;
							font: normal 12px Arial;
							color: #242424;
						}
						#password_incorrect {
							width: 180px;
							float: right;
							margin-top:5px;
							font: normal 12px Arial;
							color: red;
							font-weight: bold;
						}
						#eyeos_info {
							width: 290px;
							padding: 10px;
							float: right;
							border: 1px solid #b5b5b5;
							text-align: left;
						}
						#eyeos_info h1 {
							margin: 0x;
							padding: 0x;
							font: normal 16px Arial;
							color: #4a5257;
						}
						#eyeos_info p {
							margin: 0x;
							padding: 0x;
							font: normal 13px Arial;
							color: #4a5257;
							text-align: justify;
						}
						#eyeos_info a {
							font: normal 13px Arial;
							color: #003990;
							text-decoration: none;
						}
						#download {
							width: 150px;
							height: 32px;
							float: left;
							background-color: #c8c8c8;
							margin-top: 10px;
							cursor: pointer;
						}
						#download span {
							float: left;
							padding: 7px 0px 7px 20px;
							font: normal 16px Arial;
							color: #4a5257;
						}
						#download img {
							float: right;
							margin: 10px 20px 0px 0px;
						}
					</style>
				</head>
				<body>
				<form id="downForm" name="downForm" method="post" action="index.php?downloadFile=' . $urlName . '">
				<center>
					<div id="centerdiv">
						<img id="logo_eyeos" src="index.php?extern=images/urlsharedownload/logo_eyeos.png" alt="logo_eyeos" /><br />
						<img id="shadow" src="index.php?extern=images/urlsharedownload/line.png" alt="logo_eyeos" /><br />
						<div id="main">
							<div id="file_info">
								<img id="file_info_logo" alt="logo of the file" src="index.php?extern=images/48x48/mimetypes/image-x-generic.png" />
								<div id="file_info_desc" >' . htmlentities(self::prepareFileName($fileName), ENT_QUOTES, 'UTF-8') . '</div>';
		if ($hasPassword) {
			$htmlString.=
								'<div id="file_password">Insert URL password:&nbsp;</div>
								<div id="file_password_field"><input type="password"  id="password" name="password" size="17"></div>';
		}

		if ($wrongPassword) {
			$htmlString.=
								'<div id="password_incorrect">Wrong Password</div>';
		}

			$htmlString.=
								'<div style="clear: both"></div>
						</div>
						<div id="eyeos_info">
							<h1>More about eyeOS</h1>
							<p>eyeOS is a Cloud Desktop: the Gateway to your digital World. All your files, contacts and applications follow you wherever you are.<br />
							You only need a browser and a Web-enabled device, you don\'t need to install any software on any of your devices, just open the browser and you are home.</p>
							<a href="http://www.eyeos.org" target="_blank">Website</a><br />
							<a href="http://www.eyeos.org/services/" target="_blank">Professional services </a><br />
							<a href="http://www.eyeos.org/what-is-eyeos/try-eyeos-now/" target="_blank">Try now</a><br />
							<a href="http://sourceforge.net/projects/eyeos/" target="_blank">Download</a><br />
						</div>
						<div id="download" onClick="javascript:document.getElementById(\'downForm\').submit()">
							<span>Download</span>
							<img src="index.php?extern=images/urlsharedownload/arrow.png" alt="download" />
						</div>
						<div style="clear: both"></div>
					</div>
				</div>
			</center>
			</form>
			</body>
		</html>';
        $response->appendToBody($htmlString);
    }


    private function prepareFileName($fileName){
        if(strlen($fileName)<22){
            return $fileName;
        }
        $resultFileName = "";
        for($i=0;$i<strlen($fileName);$i++){
            if($i>0 && ($i%22)==0){
                $resultFileName.=substr($fileName,$i,1)." ";
            }
            else{
                 $resultFileName.=substr($fileName,$i,1);
            }

        }
        return $resultFileName;
    }

    private function renderErrorMessage($response, $message) {
        $response->getHeaders()->append('Content-type: text/html');
        $htmlString =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
			 <html xmlns="http://www.w3.org/1999/xhtml">
				<head>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<link rel="icon" type="image/png" href="images/favicon.png" />
				<title>Downloading eyeOS file</title>
				<style type="text/css">
					html, body,center {
						padding: 0px;
						margin: 0px;
						background-color: #dfdfdf;
						width: 100%;
						height: auto;
					}
					#centerdiv {
						width: 790px;
						margin-top: 30px;
					}
					#logo_eyeos {
						float: left;
						margin-left: 80px;
					}
					#shadow {
						clear: both
					}
					#main {
						width: 630px;
						padding: 20px 80px;
					}
					#file_info {
						width: 226px;
						padding: 40px;
						float: left;
						border: 2px solid #b5b5b5;
						background-color: #f4f4f4;
					}
					#file_info_logo {
						max-width: 48px;
						max-height: 48px;
						float: left;
					}
					#file_info_desc {
						width: 160px;
						float: right;
						overflow: hidden;
						text-overflow: ellipsis;
						text-align: left;
						font: normal 16px Arial;
						color: #242424;
					}
					#file_password {
						width: 160px;
						float: right;
						margin-top:10px;
						font: normal 12px Arial;
						color: #242424;
					}
					#file_password_field {
						width: 140px;
						float: right;
						margin-top:10px;
						font: normal 12px Arial;
						color: #242424;
					}
					#password_incorrect {
						width: 180px;
						float: right;
						margin-top:5px;
						font: normal 12px Arial;
						color: red;
						font-weight: bold;
					}
					#eyeos_info {
						width: 290px;
						padding: 10px;
						float: right;
						border: 1px solid #b5b5b5;
						text-align: left;
					}
					#eyeos_info h1 {
						margin: 0x;
						padding: 0x;
						font: normal 16px Arial;
						color: #4a5257;
					}
					#eyeos_info p {
						margin: 0x;
						padding: 0x;
						font: normal 13px Arial;
						color: #4a5257;
						text-align: justify;
					}
					#eyeos_info a {
						font: normal 13px Arial;
						color: #003990;
						text-decoration: none;
					}
					#download {
						width: 150px;
						height: 32px;
						float: left;
						background-color: #c8c8c8;
						margin-top: 10px;
						cursor: pointer;
					}
					#download span {
						float: left;
						padding: 7px 0px 7px 20px;
						font: normal 16px Arial;
						color: #4a5257;
					}
					#download img {
						float: right;
						margin: 10px 20px 0px 0px;
					}
				</style>
				</head>
				<body>
				<center>
					<div id="centerdiv">
						<img id="logo_eyeos" src="index.php?extern=images/urlsharedownload/logo_eyeos.png" alt="logo_eyeos" /><br />
						<img id="shadow" src="index.php?extern=images/urlsharedownload/line.png" alt="logo_eyeos" /><br />
						<div id="main">
							<div id="file_info">
								<img id="file_info_logo" alt="logo of the file" src="index.php?extern=images/48x48/mimetypes/unknown.png" />
								<div id="file_info_desc" >The file is not available or has expired</div>
								<div style="clear: both"></div>

							</div>
							<div id="eyeos_info">
								<h1>More about eyeOS</h1>
								<p>eyeOS is a Cloud Desktop: the Gateway to your digital World. All your files, contacts and applications follow you wherever you are.<br />
								You only need a browser and a Web-enabled device, you don\'t need to install any software on any of your devices, just open the browser and you are home.</p>
								<a href="http://www.eyeos.org" target="_blank">Website</a><br />
								<a href="http://www.eyeos.org/services/" target="_blank">Professional services </a><br />
								<a href="http://www.eyeos.org/what-is-eyeos/try-eyeos-now/" target="_blank">Try now</a><br />
								<a href="http://sourceforge.net/projects/eyeos/" target="_blank">Download</a><br />
							</div>
							<div style="clear: both"></div>
						</div>
					</div>
				</center>
				</body>
			</html>';
        $response->appendToBody($htmlString);
    }

}

?>
