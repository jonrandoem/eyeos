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

abstract class UploadApplication extends EyeosApplicationExecutable {

    public static function getHtmlCode($params) {
		$langTitle = $params['langTitle'];
		$langUpload = $params['langUpload'];
		$langText = $params['langText'];
		$path = $params['path'];
		$stringPost = $params['stringPost'];

		$buffer = '';
		$basePath = EYE_ROOT . '/' . APPS_DIR . '/upload';
		$buffer .= file_get_contents($basePath . '/multifile.js');
		$currentProc = ProcManager::getInstance()->getCurrentProcess();
        $id = md5(uniqid());
        ?>
            <html>
                <head>
				<style type="text/css">
					.btnDelete
					{
						float:right;
						padding:5px;
					}
					.divFileName
					{
						font-family:Verdana, Sans, FreeSans, Helvetica;
						font-size:12px;
						padding:10px;
					}
				</style>
				<script language="JavaScript"> <?php echo $buffer; ?></script>
                <script>
                function startProgress() {
                    document.getElementById("fileForm").style.display = "none";
                    document.getElementById("progressbar").style.display = "block";
                    
                    var http_request = false;
                    var url = "index.php";
                    if (window.XMLHttpRequest) {
                            http_request = new XMLHttpRequest();
                    } else if (window.ActiveXObject && ActiveXObject) {
                            try {
                                    http_request = new ActiveXObject("Msxml2.XMLHTTP");
                            } catch (err) {
                                    try {
                                            http_request = new ActiveXObject("Microsoft.XMLHTTP");
                                    } catch (error) {}
                            }
                    }
                    if (!http_request) {
                            alert(tr("Sorry, but eyeOS only works with AJAX capable browsers!"));
                            return false;
                    }

                    http_request.onreadystatechange = function() {
						if (http_request.readyState == 4) {
							var rtext = http_request.responseText;
							var myObject = eval('(' + rtext + ')');
							var percent =  myObject.bytes_uploaded / myObject.bytes_total * 100;
							if(isNaN(percent)) {
								percent = 0;
							}
							var newWidth = parseInt(percent * 4.1) + "px";
							
							document.getElementById("internal").style.width = newWidth;
							document.getElementById("internalText").innerHTML = "<center>"+parseInt(percent)+"%</center>";
							setTimeout("startProgress();", 1000);
							if(myObject.speed_last) {
								document.getElementById("speed").innerHTML = "Transfer rate: "+bytesToSize(myObject.speed_last);
							}
							if(myObject.est_sec) {
								document.getElementById("time").innerHTML = "Estimated time: "+getHumanTime(myObject.est_sec);
							}
						}
                    };
                    var checknum = "<? echo $currentProc->getChecknum(); ?>";
                    http_request.open("POST", url+"?checknum=" + checknum + "&message=getProgress", true);
                    http_request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;");
                    setTimeout(function() {
                        http_request.send("params=" + encodeURIComponent(document.getElementById("progress_key").value));

                    }, 500);
                }

                function bytesToSize(bytes, precision) {
                        var kilobyte = 1024;
                        var megabyte = kilobyte * 1024;
                        var gigabyte = megabyte * 1024;
                        var terabyte = gigabyte * 1024;

                        if ((bytes >= 0) && (bytes < kilobyte)) {
                                return bytes + " b/s";

                        } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
                                return (bytes / kilobyte).toFixed(precision) + " kb/s";

                        } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
                                return (bytes / megabyte).toFixed(precision) + " mb/s";

                        } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
                                return (bytes / gigabyte).toFixed(precision) + " gb/s";

                        } else if (bytes >= terabyte) {
                                return (bytes / terabyte).toFixed(precision) + " tb/s";

                        } else {
                                return bytes + " b/s";
                        }
                }

                function getHumanTime(s) {
                        var m = s / 60;
                        h = s / 3600;
                        d = s / 86400;
                        if (m > 1) {
                                if (h > 1) {
                                        if (d > 1) {
                                                return parseInt(d)+" days";
                                        } else {
                                                return parseInt(h)+" hours";
                                        }
                                } else {
                                        return parseInt(m)+" minutes";
                                }
                        } else {
                                return parseInt(s)+" seconds";
                        }
                }

                function uploadDragAndDrop() {
					document.getElementById("progressbar").style.display = "block";
                    var data = window.parent.document.uploadDrop;
					//data = data.replace("ID_UPLOAD_HERE", "'.$id.'");
                    var boundary = window.parent.document.boundary;
                    var xhr = new XMLHttpRequest();

					xhr.upload.onprogress=updateProgress;
                    xhr.open("POST", "index.php?message=submitFile&checknum=<?php echo $currentProc->getChecknum(); ?>&params=<?php echo urlencode($path); ?>", true);
                    xhr.setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
					xhr.setRequestHeader("If-Modified-Since", "Mon, 26 Jul 1997 05:00:00 GMT");
					xhr.setRequestHeader("Cache-Control", "no-cache");
                    xhr.sendAsBinary(data);
                    xhr.onload = function(event) {
                        /* If we got an error display it. */
                        if (xhr.responseText) {
                            document.body.innerHTML = xhr.responseText;
                            var re = /<script\b[\s\S]*?>([\s\S]*?)<\//ig;
                            var match;
                            while (match = re.exec(xhr.responseText)) {
                                eval(match[1]);
                            }
                        }      
                    };
                }

				function updateProgress(e) {
					var percent =  (e.position / e.totalSize)*100;
					if(isNaN(percent)) {
						percent = 0;
					}
					var newWidth = parseInt(percent * 4.1) + "px";
					document.getElementById("internal").style.width = newWidth;
					document.getElementById("internalText").innerHTML = "<center>"+parseInt(percent)+"%</center>";
				}
                </script>
                </head>
                <body onload="<?php
                if($stringPost == 'true') {
                    echo "uploadDragAndDrop();";
                }
				?>">
                <div style="margin-left:12px;font-family:Helvetica, Arial, Verdana, Sans, FreeSans;font-size:15px;">
				<img style="position:relative;top:5px;" src="eyeos/extern/images/22x22/actions/arrow-up-double.png" />&nbsp;<?php echo $langTitle; ?>
                </div>
                <div id="progressbar" style="margin-top:60px;display:none;">
					<div style="margin-bottom:6px;font-family:Helvetica, Arial, Verdana, Sans, FreeSans"><center><?php echo $langText; ?> ...</center></div>
                    <div id="wrapper" style="width:410px;border:1px solid black;height:18px;margin-left:10px">
                        <div id="internal" style="width:0px; background-repeat: repeat-x; height: 18px; background-image: url('index.php?extern=images/bg_progress.png')"></div>
                        <div id="internalText" style="width:410px;height:18px;position:relative;top:-17px;"></div>
                    </div>
                    <div id="informationText" style="margin-left:12px;margin-top:10px;font-family:Helvetica, Arial, Verdana, Sans, FreeSans;font-size:12px;">
                        <div id="speed"></div>
                        <div id="time"></div>
                    </div>
                </div>

                <form id="fileForm" style="<?php
                if($stringPost == 'true') {
                    echo 'display:none;';
                }
				?>margin-top:20px;margin-left:10px" action="index.php?message=submitFile&checknum=<?php echo $currentProc->getChecknum() . '&params=' . urlencode($path); ?>" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="UPLOAD_IDENTIFIER" id="progress_key"  value="<?php echo $id; ?>" />
                    <div id="filedatas" style="overflow:auto">
                    <input type="file" name="Filedata[0]" size="22" id="Filedata[0]" />
                    </div>
                    <div id="files_list" style="overflow:auto;border: 1px solid grey;height:230px;margin-top:10px;margin-right:10px">
                    </div>
					<script>
						var multi_selector = new MultiFiles( document.getElementById( "files_list" ));
						multi_selector.addElement( document.getElementById( "Filedata[0]" ) );
					</script>
                    <div>
                    <input type="submit" onclick="startProgress()" value="<?php echo $langUpload; ?>" style="position:absolute;bottom:5px;right:9px;"/>
                    </div>
                </form>
            </html>
	<?php
		exit;
    }

    public static function submitFile($path) {
        try {
            if(!isset($_FILES['Filedata'])) {
                echo '<div style="font-size:20px;font-family:Helvetica, Arial, Verdana, Sans, FreeSans;margin-top:80px;margin-right:15px;"><center>&nbsp;&nbsp;<img style="position:relative;top:15px"src="index.php?extern=/images/48x48/actions/dialog-close.png" />Error uploading files</center>';
                exit;
            }
			$Logger = Logger::getLogger('application.upload');
            foreach($_FILES['Filedata']['name'] as $k=>$v) {
                if(!empty($v)) {
                    $filename = $_FILES['Filedata']['name'][$k];
					if(!isset($_POST['UPLOAD_IDENTIFIER'])) {
						$filename = utf8_encode($filename);
					}
                    $tmpPath = $_FILES['Filedata']['tmp_name'][$k];
					$Logger->debug("Filename: " .$filename);
					if (!is_uploaded_file($tmpPath)) {
                        throw new EyeFileNotFoundException('Uploaded file not found at "' . $tmpPath . '".');
                    }

                    $request = MMapManager::getCurrentRequest();

                    $destPath = $path;
					$filename = str_replace('?','_', $filename);
					$filename = str_replace('#','_', $filename);

					$tmp = pathinfo($filename);
					if (isset($tmp['extension']) && "lnk" ==  $tmp['extension'] ) {
                        throw new EyeFileNotFoundException('This file cannot be uploaded (file type banned)');
					}
					/*
					if ( '?' == $filename{0} ) {
						$filename{0} = "_";
					}
					*/
                    $destFile = FSI::getFile($destPath . '/' . $filename);

                    //The uploaded file is necessarily on the local filesystem and we want to avoid any
                    //permission check through EyeLocalFile, so we use LocalFile directly
                    $tmpFile = new LocalFile($tmpPath);

                    $num = 1;
                    $extension = AdvancedPathLib::pathinfo($filename, PATHINFO_EXTENSION);
                    $filename = AdvancedPathLib::pathinfo($filename, PATHINFO_FILENAME);
					$Logger->debug("CLASS: " . get_class($destFile));
					$Logger->debug("Exists: " . $destFile->exists());
					//exit();
                    while ($destFile->exists()) {
                        $newBasename = $filename . ' (' . $num++ . ')' . ($extension ? '.' . $extension : '');
                        $destFile = FSI::getFile($destPath . '/' . $newBasename);
                    }
                    $destFile->checkWritePermission();

                    $tmpFile->moveTo($destFile);
                    $currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
                    $settings = MetaManager::getInstance()->retrieveMeta($currentUser);
                    $message = new ClientBusMessage('file', 'uploadComplete', self::getFileInfo($destFile, $settings));
                    ClientMessageBusController::getInstance()->queueMessage($message);
                }
            }
            register_shutdown_function('endRequestUpload');
        } catch (EyeException $e) {
            echo '<div style="font-size:20px;font-family:Helvetica, Arial, Verdana, Sans, FreeSans;margin-top:80px;margin-right:15px;"><center>&nbsp;&nbsp;<img style="position:relative;top:15px"src="index.php?extern=/images/48x48/actions/dialog-close.png" />Error uploading files: '.$e->getMessage().'</center>';
            exit;
        }
    }

    public static function getFileInfo($currentFile, $settings) {
        $shared = '0';
        if ($currentFile instanceof IShareableFile) {
            $temp = $currentFile->getAllShareInfo();
            if (count($temp) >= 1) {
                $shared = self::object_to_array($temp);
            }
        }

        // META (rating, tags, dates, tags and sizes)
        $meta = $currentFile->getMeta();
        $size = $currentFile->getSize();

        if ($meta === null) {
            $rating = 0;
            $fileTags = null;
            $created = 0;
            $modified = 0;
        } else {
            $rating = 0;
            $fileTags = null;
            if ($meta->exists('creationTime')) {
                $created = $meta->get('creationTime');
                $created = date('j/n/Y', $created);
            } else {
                $created = 0;
            }

            if ($meta->exists('modificationTime')) {
                $modified = $meta->get('modificationTime');
                $modified = date('j/n/Y', $modified);
            } else {
                $modified = 0;
            }
        }

        $return = array(
            'type' => $currentFile->isDirectory() ? 'folder' : 'file',
            'name' => $currentFile->getName(),
            'extension' => utf8_strtoupper($currentFile->getExtension()),
            'size' => $size,
            'permissions' => $currentFile->getPermissions(false),
            'owner' => $currentFile->getOwner(),
            'rating' => $rating,
            'created' => $created,
            'modified' => $modified,
            'path' => $currentFile->getParentPath(),
            'shared' => $shared,
            'absolutepath' => $currentFile->getAbsolutePath()
        );

        if ($return['type'] == 'folder') {
            $return['contentsize'] = count($currentFile->listFiles());
        }

        return $return;
    }
    
    public static function getProgress($params) {
          $name = basename($params);
          $dir = ini_get('uploadprogress.file.filename_template');
          $dir = sprintf($dir, $name);
          if(!file_exists($dir)) {
              echo "[]";
              exit;
          }
          $content = file_get_contents($dir);

          $lines = explode("\n", $content);

          $config = array();
          foreach($lines as $line) {
            $parts = explode('=', $line);
            if(isset($parts[1])) {
                $config[$parts[0]] = $parts[1];
            }
          }

          echo json_encode($config);
          exit;
    }
}

function endRequestUpload() {
    $status = ob_get_contents();
    ob_end_clean();
    header('Content-type:text/html');
    echo '<script>window.parent.eyeos.handleControlMessage(window.parent.qx.util.Json.parse("'.str_replace('"','\\"', $status).'"));</script>';
    echo '<div style="font-size:20px;font-family:Helvetica, Arial, Verdana, Sans, FreeSans;margin-top:80px;margin-right:15px;"><center>&nbsp;&nbsp;<img style="position:relative;top:15px"src="index.php?extern=/images/48x48/actions/mail-mark-notjunk.png" />Uploaded successfully</center>';
    exit;
}