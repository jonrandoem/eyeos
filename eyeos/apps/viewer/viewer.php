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

abstract class ViewerApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		//if ($context->getIncludeBody()) {
			$buffer = '';

			$itemsPath = EYE_ROOT . '/' . APPS_DIR . '/viewer/library';
			$dir = new DirectoryIterator($itemsPath);
			foreach($dir as $file) {
				$fileName = $file->getBasename();
				if (!$file->isDot() && $fileName{0} != '.' && strchr($fileName, '.js')) {
					$buffer .= file_get_contents($itemsPath . '/' . $fileName);
				}
			}
			
			$response->appendToBody($buffer);
		//}
		
		$instance = MemoryManager::getInstance();
		$instance->set('playList', $context->getArgs()->getArrayCopy());
	}

	public static function getId3tags($params) {
		try {
			require_once EYE_ROOT . '/' . APPS_DIR . '/viewer/library/id3.class.php';
			$tags = array();
			foreach($params as $song) {
				$myFile = FSI::getFile($song);
				$myFile->checkReadPermission();
				$myRealFile = $myFile->getRealFile();
				if (!$myRealFile instanceof LocalFile) {
					$tags[] = array(
						$song,
						array(
							'artist' => 'N/A',
							'album' => 'N/A',
							'gender' => 'N/A',
							'title' => 'N/A',
							'year' => 'N/A',
							'duration' => 'N/A'
						)
					);
				} else {
					$fileName = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getAbsolutePath());
					//FIXME: seems like AudioFile does not work when using non-virtual files: find why!
					$AF = new AudioFile;
					$AF->loadFile($fileName);

					$tags[] = array(
						$song,
						array(
							'artist' => $AF->id3_artist? $AF->id3_artist : 'N/A',
							'album' => $AF->id3_album? $AF->id3_album : 'N/A',
							'gender' => $AF->id3_genre? $AF->id3_genre : 'N/A',
							'title' => $AF->id3_title? $AF->id3_title : 'N/A',
							'year' => $AF->id3_year? $AF->id3_year : 'N/A',
							'duration' => shell_exec('exiftool -b -Duration ' . escapeshellarg($fileName))
						)
					);
				}

			}
		}
		catch (Except $e) {
			$tags[] = array(
					$song,
					array(
						'artist' => 'N/A',
						'album' => 'N/A',
						'gender' => 'N/A',
						'title' => 'N/A',
						'year' => 'N/A',
						'duration' => 'N/A'
					)
				);
		}
		return $tags;
	}

	public static function getCover($params) {
		$instance = MemoryManager::getInstance();
		$plist = $instance->get('playList');

		$myFile = FSI::getFile($plist[$params]);
		$myFile->checkReadPermission();
		$myRealFile = $myFile->getRealFile();
			
		$data = '';
		
		if ($myRealFile instanceof LocalFile) {
			$extern = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getAbsolutePath());
			$data = shell_exec('exiftool -Picture -b ' . escapeshellarg($extern));
		}
		
		$request = MMapManager::getCurrentRequest();
		$response = MMapManager::getCurrentResponse();
		
		// setting headers
		if(empty($data)) {
			$file = FSI::getFile('sys:///' . EXTERN_DIR .'/images/viewer/musicbg.png');
			$data = $file->getContents();
			$response->getHeaders()->append('Content-Type: image/png');
		} else {
			$response->getHeaders()->append('Content-Type: image/jpeg');
		}

		$response->getHeaders()->append('Content-Length: ' . strlen($data));
		$response->getHeaders()->append('Accept-Ranges: bytes');
		$response->getHeaders()->append('X-Pad: avoid browser bug');

		// preparing the rendering of the response (with the content of cover file)
		$response->setBody($data);
	}

	public static function getFile($params) {
		$instance = MemoryManager::getInstance();
		$request = MMapManager::getCurrentRequest();
		$response = MMapManager::getCurrentResponse();

		$plist = $instance->get('playList');
		$myFile = FSI::getFile($plist[$params]);
		$myFile->checkReadPermission();

		$myExt = strtolower($myFile->getExtension());
		$type = $request->issetGET('type') ? $request->getGET('type') : '';

		$myRealFile = $myFile->getRealFile();
		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		//Convert file to a supported FLV
		if($type == 'convert2FLV'||$myExt == 'mov'||$myExt ==  '3gp'||$myExt=='wav'||$myExt=='wma'||$myExt == '3gpp'||$myExt == '3g2'||$myExt == 'mp4'||$myExt == 'mpg'||$myExt == 'mpv'||$myExt ==  'avi'||$myExt ==  'ogg'||$myExt ==  'ogv'||$myExt ==  'webm') {
Logger::getLogger('VIEWEEER')->debug('$fileNameDestination before transcode: '.$myExt);
			$mediaConverter = new MediaConverter();
			$fileNameDestination = $mediaConverter->Convert($fileNameDestination, 'FLV');
			$type = 'flv';
Logger::getLogger('VIEWEEER')->debug('$fileNameDestination after transcode: '.$fileNameDestination);
		}
		
		// setting headers
		if ($type == 'image' || $myExt == 'png' || $myExt == 'jpg' || $myExt == 'gif') {
			header('Content-Type: image/' . $myExt);
		} else if($type == 'mp4' || $myExt == 'mp4') {
			header('Content-type: video/mp4');
		} else if($type == 'flv' || $myExt == 'flv') {
			header('Content-type: video/x-flv');
		} else if($type == 'mp3' || $myExt == 'mp3') {
			header('Content-type: audio/mpeg3');
		} else if($type == 'm4a' || $myExt == 'm4a') {
			header('Content-type: audio/mp4a-latm');
		} else if (method_exists ( $myFile , 'getMimeType' )) {
			header('Content-type: '.$myFile->getMimeType());
		}

		$len = filesize($fileNameDestination);
		header('Content-Length: ' . $len);
		header('Accept-Ranges: bytes');
		header('X-Pad: avoid browser bug');

		session_write_close();
		readFile($fileNameDestination);
		exit;
	}

	public static function getDocument($params) {
		$instance = MemoryManager::getInstance();
		$plist = $instance->get('playList');
		$filepath = $plist[$params];
		$info = utf8_pathinfo($filepath);
		
		//TODO: maybe fsi has better things than pathinfo
		if(strtolower($info['extension']) == 'odt' || strtolower($info['extension']) == 'doc' ||
			strtolower($info['extension']) == 'xls' || strtolower($info['extension']) == 'ods' ) {
			$myConverter = new Converter();
			$path = $myConverter->Convert($filepath, 'HTML (StarWriter)');
			$md5 = utf8_basename($path);

			if(!$path || !file_exists($path)) {
				return array($filepath,'Unable to convert office file, maybe this system does not have office support installed?');
			}

			//TODO: we are having problems with FSI and hidden folders
			$data = file_get_contents($path);
			$data = str_replace('<IMG SRC="','<IMG SRC="index.php/externMsg/' . ProcManager::getInstance()->getCurrentProcess()->getChecknum() . '/viewTempImg/',$data);
			return array($filepath, $data);
		}

		$myFile = FSI::getFile($filepath);
		$data = $myFile->getContents();
		return array($filepath, $data);
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

	public static function importToDocuments($params) {
		return self::fileSaveAs(self::getDocument($params));
	}

	public static function fileSaveAs(array $datas) {
		$foo = explode(".", $datas[0]);
		$datas[0] = $foo[0] . '.edoc';

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
						$fileNameOriginal = USERS_PATH . '/' . $userName . '/files/.office/' . ProcManager::getInstance()->getCurrentProcess()->getPid() . '/' . utf8_basename($filename);
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

	public static function viewTempImg($params) {
		$parts = explode('_', $params);
		$filepath = 'home:///';
		$myFile = FSI::getFile($filepath);
		$myFile->checkWritePermission();
		$myRealFile = $myFile->getRealFile();
		$fileNameDestination = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
		$fileNameDestination .= '/.office/' . utf8_basename($parts[0]) . '/' . utf8_basename($params);

		$info = pathinfo($fileNameDestination);
		$myExt = strtolower($info['extension']);
		$response = MMapManager::getCurrentResponse();
		header('Content-Type: image/' . $myExt);
		header('Content-Length: ' . filesize($fileNameDestination));
		header('Accept-Ranges: bytes');
		header('X-Pad: avoid browser bug');

		readfile($fileNameDestination);
		exit;
	}
}
?>
