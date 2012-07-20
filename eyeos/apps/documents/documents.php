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
 * eyeos.application.Document - the eyeOS word processor.
 * the php side of the Document Application.
 */
//require_once('/documents/libs/diff_match_patch.php');

abstract class DocumentsApplication extends EyeosApplicationExecutable {
    /**
    * eyeDocs program entrypoint
    *
    * @author        Jordi Rubio
    * @access        public
    * @package       eyeDocs
    * @param         AppExecutionContext    $context
    * @param         MMapResponse           $response
    * @since         1.0
    */
    public static function __run(AppExecutionContext $context, MMapResponse $response) {
		self::singleInstanceCheck();
        if ($context->getIncludeBody()) {
            self::insertNeededJS($response);
        }
        //ExecModule::registerCallback('changesOnFile', $_SERVER['SCRIPT_NAME']);
        $myCometManager= new CometManager();
        $myCometManager->registerCallback('DocumentsApplication::reciveMessagesFromNetSync', __FILE__);

	}
    public static function applyPatchToSharedFile($message) {
        $filename = $message->getTo();
        $diff = $message->getData();
        $Logger = Logger::getLogger('system.Application.Documents.applyPatchToSharedFile');
        $sharedFileName = '/tmp/diff_' . $filename .'_'. md5(uniqid(time()));
        $fd = fopen($sharedFileName, 'w');
        if (!$fd) {
            $Logger->debug("Unable to write file: " . $sharedFileName);
            return;
        }
        $patch = json_decode($diff);
        $patch = trim($patch, '"');
		$patch = str_replace(',@@ ', '@@ ', $patch);
		$patch = str_replace('\\n', '\n', $patch);
        $Logger->debug("PATCH AFTER: " . $patch);
        fwrite($fd, $patch);
        fclose($fd);
        $duid = explode('_', $filename);
        $tempFilename = "/tmp/doc_" . $duid[1];
        $command = 'python ' . EYE_ROOT . '/' . APPS_DIR . '/documents/libs/patch.py ' . escapeshellarg($tempFilename) . ' ' . escapeshellarg($sharedFileName);
        system($command);
        unlink($sharedFileName);

    }
    public static function reciveMessagesFromNetSync($message)
    {
        $Logger = Logger::getLogger('system.Application.Documents.reciveMessagesFromNetSync');
        $Logger->debug("Searching for messages related of documents:");
        $identifier = "document_";
        if ( 0 == strncmp($identifier, $message->getTo(), strlen($identifier) ) ) {
            $Logger->debug("New Documents related data obtained!");
            $Logger->debug($message);
            $Logger->debug("data: " . $message->getData());
            switch($message->getName()) {
                case 'refresh':
                    $Logger->debug("@TODO write refresh code");
                    $Logger->debug("@TODO write refresh code");
                    $Logger->debug("@TODO write refresh code");
                    $Logger->debug("@TODO write refresh code");
                    $Logger->debug("@TODO write refresh code");
                case 'change':
                    DocumentsApplication::applyPatchToSharedFile($message);
                    // horrible Hack!
                    $temp2 = Array();
                    $patch = json_decode($message->getData());
                    $patch = trim($patch, '"');
                    $patch = str_replace(',@@ ', '@@ ', $patch);
                    $patch = str_replace('\\n', '\n', $patch);

                    $temp2['data'] = $patch;
                    $temp2['from'] = $message->getFrom();
                    $message->setData($temp2);
                    break;
                default:
                    $Logger->debug("@TODO unknown message");
                    $Logger->debug("@TODO unknown message");
                    $Logger->debug("@TODO unknown message");
                    $Logger->debug("@TODO unknown message");
                    $Logger->debug("@TODO unknown message");
            }
        }
        return $message;
    }

    /**
    * check if the program is running
    *
    * @author        Jordi Rubio
    * @access        private
    * @package       eyeDocs
    * @since         1.0
    */
    private static function singleInstanceCheck() {
		$procList = ProcManager::getInstance()->getProcessesList();
		$counter = 0;
		foreach($procList as $proc) {
			if($proc == 'documents') {
				$counter++;
			}
		}

		if($counter > 1) {
			$currentProc = ProcManager::getInstance()->getCurrentProcess();
			ProcManager::getInstance()->kill($currentProc);
		}
    }

    /**
    * insert required JavaScript to the stdout
    *
    * @author        Jordi Rubio
    * @access        private
    * @package       eyeDocs
    * @param         MMapResponse           $response
    * @since         1.0
    */
    private static function insertNeededJS(MMapResponse $response) {
        // output buffer
        $buffer = '';
        // initial path for inclusion
        $itemsPath = EYE_ROOT . '/' . APPS_DIR;
        // list of files to include
        $filesToInclude = Array('/documents/conf/genericbar.both.Actions.js',
                                '/documents/conf/genericbar.menubar.Items.js',
                                '/documents/conf/genericbar.toptoolbar.Items.js',
                                '/documents/conf/genericbar.bottomtoolbar.basic.Items.js',
                                '/documents/conf/genericbar.bottomtoolbar.advanced.Items.js',
                                '/documents/libs/diff_match_patch.js',
                                '/documents/libs/utils.js',
                                '/documents/libs/file.js',
                                '/documents/libs/edit.js',
                                '/documents/libs/view.js',
                                '/documents/libs/insert.js',
                                '/documents/libs/format.js',
                                '/documents/libs/table.js',
                                '/documents/libs/tools.js',
                                '/documents/libs/help.js',
                                '/documents/libs/updates.js',
                                '/documents/libs/windows_dialogs.js');
        // include all
        foreach ($filesToInclude as $file) {
            $buffer .= file_get_contents($itemsPath . $file);
        }
        $response->appendToBody($buffer);
    }

    public static function getUserTags($path) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);

		if($settings->exists('tagNames')) {
			$tags = array();
			$tagNames = $settings->get('tagNames');
			$tagColors = $settings->get('tagColors');
			foreach($tagNames as $key => $value) {
				$tags[] = array($value, $tagColors[$key]);
			}
		} else {
			$tags = null;
		}

		return $tags;
	}

	private static final function object_to_array($mixed) {
		if(is_object($mixed)) $mixed = (array) $mixed;
		if(is_array($mixed)) {
			$new = array();
			foreach($mixed as $key => $val) {
				$key = preg_replace("/^\\0(.*)\\0/",'',$key);
				$new[$key] = self::object_to_array($val);
			}
		}
		else $new = $mixed;
		return $new;
	}

	public static function getFileInfo ($path) {
		$currentFile = FSI::getFile($path);
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);

		$shared = '0';
		$viewers = array();
		$editors = array();
		if($currentFile instanceof IShareableFile) {
			$temp = $currentFile->getAllShareInfo();
			if (count($temp) >= 1) {
				$shared = self::object_to_array($temp);
			}

			$shareInfo = $currentFile->getAllShareInfo();
			foreach($shareInfo as $share) {
				$colaborator = $share->getCollaborator()->getId();
				$permissions = $share->getPermissions()->getActions();

				$writable = false;
				foreach($permissions as $perm) {
					if($perm == 'write') {
						$writable = true;
					}
				}

				if($writable) {
					$editors[] = $colaborator;
				} else {
					$viewers[] = $colaborator;
				}
			}
		}

		$meta = $currentFile->getMeta();
		$size = $currentFile->getSize();

		if ($meta === null) {
			$rating = 0;
			$fileTags = null;
			$created = 0;
			$modified = 0;
		} else {
			if($meta->exists('rating')) {
				$rating = $meta->get('rating');
			} else {
				$rating = 0;
			}

			if($meta->exists('tags')) {
				$fileTags = $meta->get('tags');
			} else {
				$fileTags = null;
			}

			if($meta->exists('creationTime')) {
				$created = $meta->get('creationTime');
				$created = date('j/n/Y',$created);
			} else {
				$created = 0;
			}

			if($meta->exists('modificationTime')) {
				$modified = $meta->get('modificationTime');
				$modified = date('j/n/Y',$modified);
			} else {
				$modified = 0;
			}
		}

		if($settings->exists('tagNames')) {
			$tags = array();
			$tagNames = $settings->get('tagNames');
			$tagColors = $settings->get('tagColors');
			foreach($tagNames as $key => $value) {
				$tags[] = array($value, $tagColors[$key]);
			}
		} else {
			$tags = null;
		}

		$unim = array("B","KB","MB","GB","TB","PB");
		$c = 0;
		while ($size>=1024) {
			$c++;
			$size = $size/1024;
		}
		$size = number_format($size,($c ? 2 : 0),",",".")." ".$unim[$c];

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
				'tags' => $fileTags,
				'allTags' => $tags,
				'path' => $currentFile->getParentPath(),
				'shared' => $shared,
				'viewers' => $viewers,
				'editors' => $editors,
				'absolutepath' => $currentFile->getAbsolutePath()
		);

		if ($return['type'] == 'folder') {
			$return['contentsize'] = count($currentFile->listFiles());
		}

		return $return;
	}

//	public static function getFileInformation($path) {
//		$file = FSI::getFile($path);
//		$size = $file->getSize();
//		$meta = $file->getMeta();
//		$meta->get('creationTime');
//
//		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
//		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
//
//		if($meta->exists('rating')) {
//			$rating = $meta->get('rating');
//		} else {
//			$rating = 0;
//		}
//
//		if($meta->exists('tags')) {
//			$fileTags = $meta->get('tags');
//		} else {
//			$fileTags = null;
//		}
//
//		if($meta->exists('creationTime')) {
//			$created = $meta->get('creationTime');
//			$created = date('j/n/Y',$created);
//		} else {
//			$created = 0;
//		}
//
//		if($meta->exists('modificationTime')) {
//			$modified = $meta->get('modificationTime');
//			$modified = date('j/n/Y',$modified);
//		} else {
//			$modified = 0;
//		}
//
//		if($settings->exists('tagNames')) {
//			$tags = array();
//			$tagNames = $settings->get('tagNames');
//			$tagColors = $settings->get('tagColors');
//			foreach($tagNames as $key => $value) {
//				$tags[] = array($value, $tagColors[$key]);
//			}
//		} else {
//			$tags = null;
//		}
//
//		$unim = array("B","KB","MB","GB","TB","PB");
//		$c = 0;
//		while ($size>=1024) {
//			$c++;
//			$size = $size/1024;
//		}
//		$size = number_format($size,($c ? 2 : 0),",",".")." ".$unim[$c];
//
//		$col = null;
//		$perms = null;
//
//		if($file instanceof IShareableFile) {
//			$shareInfo = $file->getAllShareInfo();
//			foreach($shareInfo as $share) {
//				$col[] = $share->getCollaborator()->getId();
//				$permissions = $share->getPermissions()->getActions();
//				$writable = false;
//				foreach($permissions as $perm) {
//					if($perm == 'write') {
//						$writable = true;
//					}
//				}
//				if($writable) {
//					$perms[] = 'editor';
//				} else {
//					$perms[] = 'viewer';
//				}
//
//			}
//		}
//
//
//		return array(
//				$size,
//				$rating,
//				$created,
//				$modified,
//				$tags,
//				$fileTags,
//				$col,
//				$perms
//		);
//	}

	public static function setFileRating($info) {
		$path = $info[0];
		$rating = (int)$info[1];
		if($rating < 0 || $rating > 5) {
			return false;
		}
		$file = FSI::getFile($path);
		$meta = $file->getMeta();
		$meta->set('rating', $rating);
		$file->setMeta($meta);
	}

	public static function setFileTag($tag) {
		if(!$tag[0]) {
			return;
		}
		$file = FSI::getFile($tag[0]);
		$meta = $file->getMeta();
		$tags = $meta->get('tags');
		$tags[] = intval($tag[1][1]);
		$meta->set('tags', $tags);
		$file->setMeta($meta);
	}

	public static function removeFileTag($tag) {
		if(!$tag[0]) {
			return;
		}

		$file = FSI::getFile($tag[0]);
		$meta = $file->getMeta();
		$tags = $meta->get('tags');

		foreach($tags as $key=>$value) {
			if($value == $tag[1][1]) {
				unset($tags[$key]);
			}
		}

		$meta->set('tags', $tags);
		$file->setMeta($meta);
	}

	public static function setUserTag($tag) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$tagNames = $settings->get('tagNames');
		$tagColors = $settings->get('tagColors');
		$tagNames[] = $tag[0];
		$tagColors[] = $tag[1];
		$settings->set('tagNames', $tagNames);
		$settings->set('tagColors', $tagColors);
		MetaManager::getInstance()->storeMeta($currentUser, $settings);
	}

	public static function getCurrentUsername() {
		$myProcManager = ProcManager::getInstance();
		return $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName();
	}

	public static function reOpen($path) {
		$file = FSI::getFile($path);
		if(strtolower($file->getExtension()) == 'edoc') {
			$file->checkReadPermission();
			//we have to extract etc etc
			$filepath = 'home:///';
			$myFile = FSI::getFile($filepath);
			$myRealFile = $myFile->getRealFile();
			$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
			$fileNameDestination .= '/.office/documents/' . ProcManager::getInstance()->getCurrentProcess()->getPid();

			if(!file_exists(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/')) {
				mkdir(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/');
			} else {
				$cmd = 'rm -fr ' . escapeshellarg(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/documents/');
				shell_exec($cmd);
			}

			mkdir(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/documents/');

			if(file_exists($fileNameDestination)) {
				AdvancedPathLib::rmdirs($fileNameDestination);
			}

			mkdir($fileNameDestination);
			$myRealFile = $file->getRealFile();
			$originalFile = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
			$cmd = 'unzip  -d ' . escapeshellarg($fileNameDestination) . ' ' . escapeshellarg($originalFile);
			shell_exec($cmd);
		}			
	}
    private static function createSharedFile($channel, $fileNameDestination, $documentUniqueId) {
	$Logger = Logger::getLogger('system.Application.Documents.createSharedFile');
        $Logger->debug("Creating shared file with data:");
        $Logger->debug("\$channel: " . $channel);
        $Logger->debug("\$fileNameDestination: " . $fileNameDestination);
        $Logger->debug("\$documentUniqueId: " . $documentUniqueId);
        try {
            $content = file_get_contents($fileNameDestination);
        }
        catch(Exception $e) {
            $content = "";
        }
        $sharedFileName = '/tmp/doc_' . $documentUniqueId;
        $fd = fopen($sharedFileName, 'w');
        if (!$fd) {
            $Logger->debug("Unable to write file: " . $sharedFileName);
            return;
        }
        fwrite($fd, $content);
        fclose($fd);
        $Logger->debug($sharedFileName. " ready for share");

    }
	// function which given a path, return the content of a file...
	public static function fileOpen($path) {
		$file = FSI::getFile($path);
		$memory = MemoryManager::getInstance();
		if(strtolower($file->getExtension()) == 'edoc') {
			$file->checkReadPermission();
			//we have to extract etc etc
			$filepath = 'home:///';
			$myFile = FSI::getFile($filepath);
			$myRealFile = $myFile->getRealFile();
			$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
			$fileNameDestination .= '/.office/documents/' . ProcManager::getInstance()->getCurrentProcess()->getPid();

			if(!file_exists(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/')) {
				mkdir(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/');
			} else {
				$cmd = 'rm -fr ' . escapeshellarg(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/documents/');
				shell_exec($cmd);
			}

			mkdir(AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/.office/documents/');

			if(file_exists($fileNameDestination)) {
				AdvancedPathLib::rmdirs($fileNameDestination);
			}

			mkdir($fileNameDestination);
			$myRealFile = $file->getRealFile();
			$originalFile = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
			$cmd = 'unzip  -d ' . escapeshellarg($fileNameDestination) . ' ' . escapeshellarg($originalFile);
			shell_exec($cmd);
			if (isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false)) {
				$isIE = true;
			} else {
				$isIE = false;
			}

			$documentUniqueId = file_get_contents($fileNameDestination . '/duid');
			
			if(!$isIE) {
					$channel = '/topic/document_'.$documentUniqueId;

				if(!file_exists('/tmp/doc_'.basename($documentUniqueId))) {
                    /* @todo  */
					//exec('nohup python ' . EYE_ROOT . '/' . APPS_DIR . '/documents/libs/listener.py ' . escapeshellarg($channel) . ' ' . escapeshellarg($fileNameDestination) . '/document.html' . ' ' . escapeshellarg($documentUniqueId). ' | at now');
					DocumentsApplication::createSharedFile($channel, $fileNameDestination . '/document.html' , $documentUniqueId);
				} else {
					$manager = new CometManager();
                                        $subscriptions = $manager->getSubscriptions($channel);
					if(!$subscriptions) {
						DocumentsApplication::createSharedFile($channel, $fileNameDestination . '/document.html' , $documentUniqueId);
					}
				}

				$content = file_get_contents('/tmp/doc_'.$documentUniqueId);
				$checknum = ProcManager::getInstance()->getCurrentProcess()->getChecknum();
				// var_dump($checknum, $content); exit;
				$content = str_replace('CHECKNUM_HERE', $checknum, $content);
			} else {
				$content = file_get_contents($fileNameDestination . '/document.html');
			}

			$return[] = $content;
			$return[] = $file->getName();
			$return[] = $documentUniqueId;
		} else {
			$return[] = $file->getContents();
			$return[] = $file->getName();
		}

		$memory->set('currentDocument', $path);
		//var_dump($return);exit;
		return $return;
	}
    
	public static function getChanges($path) {
        $Logger = Logger::getLogger('system.Application.Documents.getChanges');
		$file = FSI::getFile($path);
		$file->checkReadPermission();
		$myRealFile = $file->getRealFile();
		$originalFile = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		$sharedCopyDir = '/tmp/' . md5($originalFile);

		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$fp = fopen($sharedCopyDir . '/document.html', 'r');
		$open = false;
		//Waiting until file is unlocked
		while (!$open) {
			$open = flock($fp, LOCK_EX);
		}

		$changes = shell_exec('python ' . EYE_ROOT . '/' . APPS_DIR . '/documents/libs/compare.py ' . $sharedCopyDir . '/versions/' . $currentUserId . ' ' . $sharedCopyDir . '/document.html');
		$changes = trim($changes);
		if(!empty($changes)) {
			copy($sharedCopyDir . '/document.html', $sharedCopyDir . '/versions/' . $currentUserId);
			return base64_encode($changes);
		}
		fclose($fp);
	}

	public static function sendChanges($params) {
		$path = $params[0];
		$diff = $params[1];
		//first, we need to create the real path using the file path
		$file = FSI::getFile($path);
		$file->checkReadPermission();
		$myRealFile = $file->getRealFile();
		$originalFile = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		$sharedCopyDir = '/tmp/' . md5($originalFile);

		$fp = fopen($sharedCopyDir . '/document.html', 'r');
		$open = false;
		//Waiting until file is unlocked
		while (!$open) {
			$open = flock($fp, LOCK_EX);
		}

		$patch = base64_decode($diff);
		$patch = str_replace(',@@ ', '@@ ', $patch);


		//now we have the patch, lets apply it!
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$changes = shell_exec('python ' . EYE_ROOT . '/' . APPS_DIR . '/documents/libs/compare.py ' . $sharedCopyDir . '/versions/' . $currentUserId . ' ' . $sharedCopyDir . '/document.html');

		file_put_contents($sharedCopyDir . '/data.diff', $patch);

		system('python ' . EYE_ROOT . '/' . APPS_DIR . '/documents/libs/patch.py ' . escapeshellarg($sharedCopyDir . '/document.html') . ' ' . escapeshellarg($sharedCopyDir . '/data.diff'));

		copy($sharedCopyDir . '/document.html', $sharedCopyDir . '/versions/' . $currentUserId);
		fclose($fp);
		$changes = trim($changes);
		if(!empty($changes)) {
			return base64_encode($changes);
		}
	}

	public static function fileSave(array $params) {
        $Logger = Logger::getLogger('system.Application.Documents.fileSave');
		// setting the extension, if not exists...
		$info = pathinfo($params[0]);
		if(!array_key_exists('extension', $info)) {
			$params[0] .= '.edoc';
		}

		// retrieving the existing file....
		$myFile = FSI::getFile($params[0]);
		$myFile->checkWritePermission();

		// taking the real file path...
		$myRealFile = $myFile->getRealFile();
		$fileNameOriginal = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

		// changing directory, to use unzip command and save the data we need to store in the new copy of the file
		$oldDir = getcwd();

		$newDir = dirname(substr($fileNameOriginal, strlen($oldDir . '/')));
		chdir($newDir);

		$dir = 'tmp_' . md5(uniqid(time()));
		mkdir($dir);
		$cmd = 'unzip -d ./' . $dir . '/ ' . escapeshellarg($fileNameOriginal);
        shell_exec($cmd);

		// deleting old datas...
		$cmd = 'rm -fr ' . $dir . '/document.html';
		shell_exec($cmd);

		// creating an images directory, and saving all the images contained
		// in the document...
		if(file_exists($dir.'/images_new/')) {
		    $Logger->debug(shell_exec('rm -fr '.$dir.'/images_new/'));
		}
		mkdir($dir . '/images_new/');
		chdir($oldDir);
		preg_match_all('/<img src="([^"]+)"/', $params[1], $matches);
		if(is_array($matches) && is_array($matches[1])) {
			foreach($matches[1] as $value) {
				if(strpos($value, 'params=')) {
					$filename = substr($value, strpos($value, 'params=') + 7);
					$md5 = md5($value);
					$myFile = FSI::getFile($filename);
					$myFile->checkReadPermission();

					if($myFile instanceof EyeUserFile) {
						$myRealFile = $myFile->getRealFile();
						$fileNameImage = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
					} else {
						$userName = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName();
						$fileNameImage = USERS_PATH . '/' . $userName . '/files/.office/documents/' . ProcManager::getInstance()->getCurrentProcess()->getPid() . '/' . $filename;
					}
					copy($fileNameImage, $oldDir . '/' . $newDir . '/' . $dir . '/images_new/' . $md5 . '.' . $myFile->getExtension());
					$params[1] = str_replace($value,'index.php?checknum=CHECKNUM_HERE&message=getImg&params=images/' . $md5 . '.' . $myFile->getExtension(), $params[1]);
				}
			}
		}
		$cmd = 'rm -fr ' . $oldDir . '/' . $newDir . '/' . $dir . '/images';
		shell_exec($cmd);

		$cmd = 'mv ' . $oldDir . '/' . $newDir . '/' . $dir . '/images_new ' . $oldDir . '/' . $newDir . '/' . $dir . '/images';
		shell_exec($cmd);
		
		$params[1] = preg_replace('/class="mceNonEditable editor_[^"]+" style="[^"]+"/', 'style="border: 0px solid black; padding-left: 0px; margin-left: 0px;"', $params[1]);
		file_put_contents($oldDir . '/' . $newDir . '/' . $dir . '/document.html', $params[1]);
		
		chdir($oldDir . '/' . $newDir . '/' . $dir);
		$cmd = 'zip -r '. escapeshellarg($fileNameOriginal) . ' ./';
		shell_exec($cmd);

		chdir($oldDir . '/' . $newDir);
		$cmd = 'rm -fr ' . $dir;
        shell_exec($cmd);
		chdir($oldDir);

		return $params[0];
	}

	public static function fileSaveAs(array $datas) {
		// setting the extension...
		$info = pathinfo($datas[0]);
		if(!array_key_exists('extension', $info)) {
			$datas[0] .= '.edoc';
		}

		// creating a tmp directory...
		$rand = md5(uniqid(time()));
		mkdir('/tmp/'.$rand);

		// creating an images directory, and saving all the images contained
		// in the document...
		mkdir('/tmp/'.$rand.'/images/');

		preg_match_all('/<img src="([^"]+)"/', $datas[1], $matches);
		if(is_array($matches) && is_array($matches[1])) {
			foreach($matches[1] as $value) {
				if(strpos($value, 'params=')) {
					$filename = substr($value, strpos($value, 'params=') + 7);
					$md5 = md5($value);
					$myFile = FSI::getFile($filename);
					$myFile->checkReadPermission();

					if($myFile instanceof EyeUserFile) {
						$myRealFile = $myFile->getRealFile();
						$fileNameOriginal = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
					} else {
						$userName = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getName();
						$fileNameOriginal = USERS_PATH . '/' . $userName . '/files/.office/documents/' . ProcManager::getInstance()->getCurrentProcess()->getPid() . '/' . $filename;
					}

					copy($fileNameOriginal, '/tmp/'.$rand.'/images/'.$md5.'.'.$myFile->getExtension());
					$datas[1] = str_replace($value,'index.php?checknum=CHECKNUM_HERE&message=getImg&params=images/' . $md5 . '.' . $myFile->getExtension(), $datas[1]);
				}
			}
		}

		$datas[1] = preg_replace('/<p class="mceNonEditable editor_[^"]+" style="[^"]+"/', '<p style="border: 0px solid black; padding-left: 0px; margin-left: 0px;"', $datas[1]);
		file_put_contents('/tmp/' . $rand . '/document.html', $datas[1]);

		if(!isset($datas[2]) || !$datas[2]) {
			$datas[2] = uniqid();
		}
		file_put_contents('/tmp/' . $rand . '/duid', $datas[2]);
		$myFile = FSI::getFile($datas[0] . '_tmp');

		$myFile->checkWritePermission();
		$myRealFile = $myFile->getRealFile();
		$fileNameOriginal = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());

		//this is REALLY annoying to be forced to do this, but zip command line util is a mess
		$oldDir = getcwd();
		chdir('/tmp/'.$rand);
		$cmd = 'zip -r '.escapeshellarg($fileNameOriginal).' ./';
		shell_exec($cmd);

		//we return into the normal directory...this is ugly
		chdir($oldDir);
		AdvancedPathLib::rmdirs('/tmp/'.$rand);

		// creating a fake file trought FSI, so we can have our nice xml :)
		$newFile = FSI::getFile($datas[0]);
		$newFile->createNewFile(true);
		$newFile->putContents($myFile->getContents());
		$myFile->delete(true);
		return $datas[0];
	}

	public static function getImg($path) {
		if(dirname($path) == 'images') {
			$name = utf8_basename($path);
			$info = pathinfo($path);
			$filepath = 'home:///';
			$myFile = FSI::getFile($filepath);
			$myRealFile = $myFile->getRealFile();
			$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
			$fileNameDestination .= '/.office/documents/' . ProcManager::getInstance()->getCurrentProcess()->getPid();
			$fileNameDestination .= '/images/'.$name;
			header('Content-Type: image/' . $info['extension']);
			header('Content-Length: ' . filesize($fileNameDestination));
			header('Accept-Ranges: bytes');
			header('X-Pad: avoid browser bug');

			readfile($fileNameDestination);
			exit;
		} else {
			$myFile = FSI::getFile($path);
			$len = $myFile->getSize();

			$response = MMapManager::getCurrentResponse();

			$myExt = strtolower($myFile->getExtension());

			// setting headers
			$response->getHeaders()->append('Content-Type: image/' . $myExt);
			$response->getHeaders()->append('Content-Length: ' . $len);
			$response->getHeaders()->append('Accept-Ranges: bytes');
			$response->getHeaders()->append('X-Pad: avoid browser bug');

			// preparing the rendering of the response (with the content of target file)
			$response->setBodyRenderer(new FileReaderBodyRenderer($myFile->getInputStream()));
		}
	}

	public static function writeDefaultSettings(array $params) {
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$fileName = USERS_PATH . '/' . $user->getName() . '/' . USERS_CONF_DIR . '/' . utf8_basename($params['setting_file']);
		$fileHandle = fopen($fileName, 'w');
		fwrite($fileHandle, $params['datas']);
		fclose($fileHandle);
	}

	public static function readDefaultSettings($setting_file) {
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$fileName = USERS_PATH . '/' . $user->getName() . '/' . USERS_CONF_DIR . '/' . utf8_basename($setting_file);
		$fileHandle = fopen($fileName, 'a+');

		$fileContents = null;
		if (filesize($fileName)) {
			$fileContents = fread($fileHandle, filesize($fileName));
		}

		fclose($fileHandle);
		return $fileContents;
	}

	// function which read the openRecent file to load its entries...
	public static function dynamicsReadOpenRecent() {
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$fileName = USERS_PATH . '/' . $user->getName() . '/' . USERS_CONF_DIR . '/openRecent';
		$fileHandle = fopen($fileName, 'a+');
		if (filesize($fileName)) {
			$fileContents = fread($fileHandle, filesize($fileName));
		}
		else {
			$fileContents = '[]';
		}
		fclose($fileHandle);
		return $fileContents;
	}

	public static function dynamicsWriteOpenRecent($stream) {
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$fileName = USERS_PATH . '/' . $user->getName() . '/' . USERS_CONF_DIR . '/openRecent';
		$fileHandle = fopen($fileName, 'w+');
		fwrite($fileHandle, $stream);
		fclose($fileHandle);
	}


	public static function getCurrentUserId($params) {
		return ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
	}

	public static function getFirstLastNameOfUser($params) {
		$userId = $params;
		$myId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		if ($myId == $userId) {
			return 'Me';
		} else {
			$otherUser = UMManager::getInstance()->getUserById($userId);
			$settings = MetaManager::getInstance()->retrieveMeta($otherUser);

			return $settings->get('eyeos.user.firstname') . ' ' . $settings->get('eyeos.user.lastname');
		}
	}

	public static function getContacts($params) {
		$myProcManager = ProcManager::getInstance();
		$peopleController = PeopleController::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$results = array();
		foreach ($params as $userId) {
			$otherUser = UMManager::getInstance()->getUserById($userId);
			$settings = MetaManager::getInstance()->retrieveMeta($otherUser);

			$myRelation = $peopleController->getContact($currentUserId, $userId);

			$lists = array();
			$listsName = array();

			$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($myRelation->getImpression());
			foreach ($tagsPerImpression as $tagPerImpression) {
				$lists[] = $tagPerImpression->getTagId();
				$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
			}

			$result[] = array(
					'id' => $userId,
					'name' => $settings->get('eyeos.user.firstname') . ' ' . $settings->get('eyeos.user.lastname'),
					'listsName' => $listsName,
			);

		}

		return $result;
	}

	public static function getAllContacts($params) {
		$peopleController = PeopleController::getInstance();

		$myProcManager = ProcManager::getInstance();
		$currentUserId= $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$tempResults = $peopleController->getAllContacts($currentUserId);
		$results = array();
		foreach ($tempResults as $result) {
			if ($result->getRelation()->getSourceId() != $currentUserId) {
				$contactId = $result->getRelation()->getSourceId();
			} else {
				$contactId = $result->getRelation()->getTargetId();
			}

			$lists = array();
			$listsName = array();

			$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($result->getImpression());
			foreach ($tagsPerImpression as $tagPerImpression) {
				$lists[] = $tagPerImpression->getTagId();
				$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
			}

			$otherUser = UMManager::getInstance()->getUserById($contactId);
			$settings = MetaManager::getInstance()->retrieveMeta($otherUser);

			$nameOfUser = utf8_encode($otherUser->getName());
			$pathImage = 'index.php?extern=images/48x48/apps/system-users.png';

			if ($settings != null) {
				if ($settings->get('eyeos.user.picture.url') != null) {
					$pathImage = $settings->get('eyeos.user.picture.url');
				}
				if ($settings->get('eyeos.user.firstname') != null && $settings->get('eyeos.user.lastname') != null) {
					$nameOfUser = utf8_encode($settings->get('eyeos.user.firstname') . ' ' . $settings->get('eyeos.user.lastname'));
				}
			}

			$results[] = array(
					'userId' => $contactId,
					'userName' => $nameOfUser,
					'image' => $pathImage,
					'lists' => $lists,
					'listsName' => $listsName,
					'icon' => $pathImage
			);
		}

		return $results;
	}

	public static function close($params) {
		EyeosApplicationExecutable::close($params);
	}

	public static function changePrivilege($params) {
		$toBeRemoved = false;
		$user = UMManager::getInstance()->getUserById($params[1]);

		if ($params[0] == 'Viewer') {
			$perms = new SharePermission('read');
		} else if ($params[0] == 'Editor') {
			$perms = new SharePermission('read, write');
		} else if ($params[0] == 'Remove') {
			$toBeRemoved = true;
		}

		$files = Array();
		for ($i = 2; $i < count($params); $i++) {
			$trueFile = FSI::getFile($params[$i]);
			if($toBeRemoved) {
				SharingManager::getInstance()->removeCollaborator($trueFile, $user);
				$files[] = self::getSharedInfo($trueFile);
			} else {
				try {
					SharingManager::getInstance()->addCollaborator($trueFile, $user, $perms);
					$files[] = self::getSharedInfo($trueFile);
				} catch (EyeDBException $e) {
					SharingManager::getInstance()->updateCollaboratorPermission($trueFile, $user, $perms);
					$files[] = self::getSharedInfo($trueFile);
				}
			}
		}

		return $files;
	}

	public static function getSharedInfo ($currentFile) {
		$temp = $currentFile->getAllShareInfo();
		$shared = NULL;
		if (count($temp) >= 1) {
			$shared = self::object_to_array($temp);
		} else {
			$shared = '0';
		}
		return $shared;
	}

	public static function fileExport(array $params) {
		$destinationFile = $params[0];
		$originalFile = $params[1];
		$format = $params[2];
		
	   	if($format == 'PDF') {
			$extension = 'pdf';
			$format = 'writer_pdf_Export';					
		} elseif($format == 'Doc') {
		  	$extension = 'doc';
			$format = 'MS Word 97';
		} elseif($format == 'Open Office') {
		  	$extension = 'odt';
			$format = 'writer8';
		} elseif($format == 'HTML') {
		  	$extension = 'html';
			$format = 'HTML (StarWriter)';
		} elseif($format == 'RTF') {
		  	$extension = 'rtf';
			$format = 'Rich Text Format';
		} elseif($format == 'TXT') {
			$extension = 'txt';
			$format = 'Text (encoded)';
		}

		$destinationFile .= '.' . $extension;
		
		$file = FSI::getFile($originalFile);
		$memory = MemoryManager::getInstance();
		$file->checkReadPermission();

		$to = 'home:///';
		//then, check the destination file
		$myFileDest = FSI::getFile($to);
		$myFileDest->checkWritePermission();
		$myRealFile = $myFileDest->getRealFile();

		$partName = '.office/' . uniqid(time()) . '_conversion/';

		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath()) . '/' . $partName;
		mkdir($fileNameDestination);
		$myRealFile = $file->getRealFile();

		$originalFile = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		$cmd = 'unzip  -d ' . escapeshellarg($fileNameDestination) . ' ' . escapeshellarg($originalFile);
		shell_exec($cmd);

		$myConverter = new Converter();
		$fileName = $myConverter->Convert($to.$partName.'/document.html', $format);
		shell_exec('rm -rf '.escapeshellarg($fileNameDestination));

		if(!file_exists($fileName)) {
			return false;
		}
		$content = file_get_contents($fileName);
		$newFile = FSI::getFile($destinationFile);
		$newFile->createNewFile(true);
		$newFile->putContents($content);
		return $destinationFile;
	}
}
?>
