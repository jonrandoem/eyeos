<?php

abstract class FilesApplication extends EyeosApplicationExecutable {
	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		//if ($context->getIncludeBody()) {
			$buffer = '';

			$itemsPath = EYE_ROOT . '/' . APPS_DIR . '/files';
			$dir = new DirectoryIterator($itemsPath);
			foreach($dir as $file) {
				$fileName = $file->getBasename();
				if (!$file->isDot() && $fileName{0} != '.' && strchr($fileName, '.js') && $fileName != 'eyeos.js') {
					$buffer .= file_get_contents($itemsPath . '/' . $fileName);
				}
			}

			$buffer .= file_get_contents($itemsPath . '/SocialBarUpdater/interfaces.js');
			$buffer .= file_get_contents($itemsPath . '/SocialBarUpdater/eyeos.files.ASocialBarHandler.js');
			$buffer .= file_get_contents($itemsPath . '/SocialBarUpdater/eyeos.files.SUHandlerManager.js');
			$buffer .= file_get_contents($itemsPath . '/SocialBarUpdater/eyeos.files.SUManager.js');
			$buffer .= file_get_contents($itemsPath . '/SocialBarUpdater/eyeos.files.SUPathManager.js');
			$response->appendToBody($buffer);
		//}
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
	
	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static final function browsePath($params) {
		
		if (isset($params[0]) && $params[0] !== null) {
			$path = $params[0];
		} else {
			$path = 'home:///';
		}
		if (isset($params[1]) && $params[1] !== null) {
			$pattern = $params[1];
		} else {
			$pattern = '*';
		}
		if (isset($params[2]) && $params[2] !== null) {
			$options = (int) $params[2] | AdvancedPathLib::GLOB_DIR_FIRST;
		} else {
			$options = AdvancedPathLib::GLOB_DIR_FIRST;
		}

		$leafFolder = FSI::getFile($path);
		
		//files list
		$filesList = array();
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);

		foreach($leafFolder->listFiles($pattern, $options) as $currentFile) {
			$filesList[] = self::getFileInfo($currentFile, $settings);
		}

		$return = array(
			'absolutepath' => $leafFolder->getAbsolutePath(),
			'files' => $filesList
		);

		return $return;
	}
	
	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function getMyFiles($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$filesList = array();
		for ($i = 0; $i < count($params); $i++) {
			$currentFile = FSI::getFile($params[$i]);
			$filesList[] = self::getFileInfo($currentFile, $settings);
		}
		return $filesList;
	}

	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function getFileInfo ($currentFile, $settings) {
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

//		$unim = array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
//		$c = 0;
//		while ($size>= 1024) {
//			$c++;
//			$size = $size / 1024;
//		}
//		$size = number_format($size, ($c ? 2 : 0), ',', '.') . ' ' . $unim[$c];

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
			'absolutepath' => $currentFile->getAbsolutePath()
		);
                
                if($return['extension'] == 'LNK') {
                    if($return['extension'] == 'LNK') {
                        $return['content'] = $currentFile->getContents();
                    }
                }
		
		if ($return['type'] == 'folder') {
			$return['contentsize'] = count($currentFile->listFiles());
		}
		
		return $return;
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
	
	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function copy($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$target = FSI::getFile($params[0]);
		$results = array();
		for($i = 1; $i < count($params); $i++) {
			$source = FSI::getFile($params[$i]);
			if (!$source->isDirectory()) {
				$name = explode(".", $source->getName());
				$extension = (string) $name[count($name) - 1];
				$theName = substr($source->getName(), 0, strlen($source->getName()) - strlen($extension) - 1);
			} else {
				$theName = $source->getName();
			}

			$nameForCheck = $theName;

			if (!$source->isDirectory()) {
				$nameForCheck .= '.' . $extension;
			}

			$number = 1;
			$newFile = FSI::getFile($params[0] . "/" . $nameForCheck);
			
			while ($newFile->exists()) {
				$futureName = Array($theName, $number);
				$nameForCheck = implode(' ', $futureName);
				if (!$source->isDirectory()) {
					$nameForCheck .= '.' . $extension;
				}
				$number++;
				$newFile = FSI::getFile($params[0] . "/" . $nameForCheck);
			}
			
			$source->copyTo($newFile);
			$results[] = self::getFileInfo($newFile, $settings);
		}
		return $results;
	}

	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function createNewFile($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$newFile = FSI::getFile($params[0]);
		$name = explode(".", $newFile->getName());
		$extension = (string) $name[count($name) - 1];
		if ($newFile->exists()) {
			$name = explode(".", $newFile->getName());
			$path = str_replace($newFile->getName(), '', $newFile->getPath());
			$extension = (string) $name[count($name) - 1];
			$theName = substr($newFile->getName(), 0, strlen($newFile->getName()) - strlen($extension) - 1);
			$futureName = Array($theName, 1);
			$nameForCheck = implode(' ', $futureName);
			$nameForCheck .= '.' . $extension;
			$newFile = FSI::getFile($path . "/" . $nameForCheck);
			while ($newFile->exists()) {
				$futureName[1] += 1;
				$nameForCheck = implode(' ', $futureName);
				$nameForCheck .= '.' . $extension;
				$newFile = FSI::getFile($path . "/" . $nameForCheck);
			}
		}
		
		if ($extension == 'edoc') {
			$rand = md5(uniqid(time()));
			mkdir('/tmp/'.$rand);
			$uniqid = uniqid();
			shell_exec('touch /tmp/'.$rand.'/document.html');
			file_put_contents('/tmp/'.$rand.'/duid', $uniqid);
			$myFile = FSI::getFile($params[0] . '_tmp');
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
			$newFile->createNewFile(true);
			$newFile->putContents($myFile->getContents());
			unlink($fileNameOriginal); // FIXME!!!!!
		} else {
			$newFile->createNewFile();
		}
		return self::getFileInfo($newFile, $settings);
	}

	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function delete($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$filesInfo = array();
		foreach ($params as $param) {
			$fileToRemove = FSI::getFile($param);
			$filesInfo[] = $fileToRemove->getAbsolutePath();
			$fileToRemove->delete(true);
			self::removeUrlShareInfo($param);
		}
		return $filesInfo;
	}

	/**
	 * Remove urlShare info (if any) when we delete a file
	 * @param <String> $filename
	 */
	protected static function removeUrlShareInfo ($filename) {
		/**
		 * Execute a search to detect if this file has Url
		 */
		$urlShareController = UrlShareController::getInstance();
		$filepath = $filename;

		$shareFile = new UrlFile();
		$shareFile->setPath($filepath);

		$founded = $urlShareController->searchFile($shareFile);
		if ($founded) {
			$founded = current($founded);
		} else {
			return;
		}

		$urlFileId = $founded->getId();
		$urlShareController->deleteFile($founded);
	}

	public static function mkdir($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$dirToCreate = FSI::getFile($params[0] . '/' . $params[1]);
		if ($dirToCreate->exists()) {
			$name = Array($params[1], 1);
			$futureName = implode(' ', $name);
			$dirToCreate = FSI::getFile($params[0] . '/' . $futureName);
			while ($dirToCreate->exists()) {
				$name[1] += 1;
				$futureName = implode(' ', $name);
				$dirToCreate = FSI::getFile($params[0] . '/' . $futureName);
			}
		}
		$dirToCreate->mkdir();
		$return = self::getFileInfo($dirToCreate, $settings);
		return $return;
	}

	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function move($params) {
		$target = FSI::getFile($params[0]);
		for($i = 1; $i < count($params); $i++) {
			$x = 1;
			$nameForCheck = utf8_basename($params[$i]);
			$renamed = FSI::getFile($params[0] . '/' . $nameForCheck);
			while ($renamed->exists()) {
				$name = explode(".", utf8_basename($params[$i]));
				$extension = (string) $name[count($name) - 1];
				$futureName = Array($name[0]);
				
				$nameForCheck = implode(' ', $futureName);
				$nameForCheck .= ' '.$x;
				if(!$renamed->isDirectory()) {
					$nameForCheck .= '.' . $extension;
				}
				$x++;

				$renamed = FSI::getFile($params[0] . '/' . $nameForCheck);
			}

			$source = FSI::getFile($params[$i]);
			$source->moveTo($renamed);
			//check if the file already exists
			
			$filename = basename($params[$i]);
			//TODO24: it should use fsi listeners
			self::updateUrlShare($params[$i], $target->getPath() . '/' . $filename);
			/*
			if(get_class($target) == 'EyeWorkgroupFile'){
				$meta = $target->getMeta();
				$meta->set('id', null);
				$meta->set('listeners', null);
				$target->setMeta($meta);
			}
			 */
		}
	}

	/**
	 * Update urlShare info (if any) when we move/rename a file
	 * @param <String> $filename
	 */
	protected static function updateUrlShare ($source, $target) {
		/**
		 * Execute a search to detect if this file has Url
		 */
		$urlShareController = UrlShareController::getInstance();
		$filepath = $source;
		$filename = basename($filepath);

		$shareFile = new UrlFile();
		$shareFile->setPath($filepath);

		$founded = $urlShareController->searchFile($shareFile);
		if ($founded) {
			$founded = current($founded);
		} else {
			return;
		}

		$founded->setPath($target);
		$urlShareController->updateFile($founded);
	}
	
	/**
	 * TODO: Will need to be moved/merged to/with FileSystemExecModule
	 */
	public static function rename($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$fileToRename = FSI::getFile($params[0]);

		$i = 1;
		$nameForCheck = $params[2];
		$renamed = FSI::getFile($params[1] . '/' . $params[2]);
		while ($renamed->exists()) {
			$name = explode(".", $params[2]);
			$extension = (string) $name[count($name) - 1];
			$futureName = Array($name[0], $i);
			$nameForCheck = implode(' ', $futureName);
			
			if (!$fileToRename->isDirectory()) {
				$nameForCheck .= '.' . $extension;
			}
			$i++;
			$renamed = FSI::getFile($params[1] . '/' . $nameForCheck);
		}
		
		$fileToRename->renameTo($nameForCheck);
		self::updateUrlShare($params[0], $renamed->getPath());
		$return = self::getFileInfo($fileToRename, $settings);
		return $return;
	}

	

	/**
	 * Return an associative Array with tree file structure of socialBarUpdater
	 * handlers
	 * @return array
	 */
	public static function getSocialUpdaterHandlers () {
		$handlersPath = self::getSocialUpdaterHandlersPath();
		$arrayTree = Array();
		self::createStructFromDir($handlersPath, $arrayTree);
		$arrayTree = self::simplifyStruct($arrayTree);
		return $arrayTree;
	}

	/**
	 * SimplifyStruct flat array data struct to just 2 level and remove all not
	 * javascript file
	 * A = (
	 *		B = (
	 *			1.js,
	 *			2.c,
	 *			C = (
	 *				3.js,
	 *				4.js,
	 *				5.js,
	 *				D = (
	 *					null
	 *				)
	 *			)
	 *		)
	 * )
	 *
	 * Will Become
	 *
	 * A= (
	 *	B = (
	 *		1.js,
	 *		3.js,
	 *		4.js,
	 *		5.js
	 *	)
	 * )
	 *
	 *
	 * @param <Array> $arrayTree
	 * @return <Array>
	 */
	private static function simplifyStruct($arrayTree) {
		$newStruct = Array();
		foreach ($arrayTree as $key => $leaf) {
			if (is_array($leaf)) {
				$newStruct[$key] = Array();
				self::array_values_recursive($leaf, $newStruct[$key]);
				$newStruct[$key] = array_filter($newStruct[$key], 'self::filterJavascript');
			}
		}
		return $newStruct;
	}
	/**
	 * Callback for array_filter
	 * 
	 * @param <mixed> $item
	 * @return <Boolean>
	 */
	private static function filterJavascript ($item) {
		if ($item == null || !is_string($item) || !substr(strrchr($item, '.'), 1) == 'js') {
			return false;
		} else {
			return true;
		}
	}
	/**
	 * Flat an array to just on level
	 * 
	 * @param <Array> $array
	 * @param <Array> $result
	 */
	private static function array_values_recursive($array, &$result) {
		foreach ($array as $element) {
			if (is_array($element)) {
				self::array_values_recursive($element, $result);
			} else {
				$result[] = $element;
			}
		}
	}

	/**
	 * Create an associative array with the struct of the directory tree
	 *
	 * @param <String> $dirPath
	 * @return Array
	 */
	private static function createStructFromDir ($dirPath, &$arrayTree) {
		$iterator = new DirectoryIterator($dirPath);
		foreach ($iterator as $fileInfo) {
			if ($fileInfo->getFilename() == '.' || $fileInfo->getFilename() == '..' || $fileInfo->getFilename() == '.svn') {
				continue;
			}

			if ($fileInfo->isDir()) {
				self::createStructFromDir($dirPath . $fileInfo->getFilename() . '/', $arrayTree[$fileInfo->getFilename()]);
			}

			if ($fileInfo->isFile()) {
				$arrayTree[] = $fileInfo->getFilename();
			}

		}
	}

	/**
	 * Return the path of the correct handler.
	 * Priority:
	 *  1) Some custom handler
	 *	2) default handler
	 * @return string
	 */
	private static function getSocialUpdaterHandlersPath () {
		$handlersPath = EYE_ROOT . '/' . APPS_DIR . '/files/SocialBarUpdater/handlers/';
		$directory = new DirectoryIterator($handlersPath);
		foreach ($directory as $fileInfo) {
			if ($fileInfo->isDir()) {
				if ($fileInfo->getFilename() == '..' || $fileInfo->getFilename() == '.' || $fileInfo->getFilename() == '.svn') {
					continue;
				}

				if ($fileInfo->getFilename() == 'default') {
					$return = $handlersPath . 'default/';
				} else {
					return $handlersPath . $fileInfo->getFilename() . '/';
				}
			}
		}
		if ($return) {
			return $return;
		} else {
			throw new EyeFileNotFoundException('No default Handler present in ' . $directory);
		}

	}
}
?>
