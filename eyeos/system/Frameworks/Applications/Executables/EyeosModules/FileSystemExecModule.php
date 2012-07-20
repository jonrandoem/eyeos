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
 * ExecModule for the file system.
 * Provide methods to browse and manage files through the FileSystem service.
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
class FileSystemExecModule implements IEyeosExecutableModule {
	/**
	 * Assign tags to a file.
	 *
	 * @param array $params (
	 * 		path => string,
	 * 		tagIds => array(
	 *			tagId1, tagId2, ...
	 *		)
	 * )
	 */
	public function addAllTags($params) {
		if ($params === null) {
			throw new EyeInvalidArgumentException('Missing $params');
		}
		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}
		if (!isset($params['tagIds']) || !is_array($params['tagIds'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'tagIds\']');
		}
		
		$file = FSI::getFile($params['path']);
		$TM = TagManager::getInstance();

		$tags = array();
		foreach ($params['tagIds'] as $tagId) {
			$tag = new BasicTag();
			$tag->setId($tagId);
			$TM->getTag($tag);
			$tags[] = $tag;
		}

		$TM->addAllTags($file, $tags);
	}
	
	//TODO: TO BE REMOVED
	//Just here to show what is *not* to do
	public function addTag($params) {
		throw new EyeBadMethodCallException('Use ' . __CLASS__ . '::addAllTags() instead.');
	}
	
	/**
	 * Resolves the parent path from the one specified in argument and browses it.
	 * 
	 * @param array $params (
	 * 		0 => $path = "home:///",
	 * 		1 => $pattern = "*",
	 * 		2 => $options = AdvancedPathLib::GLOB_DIR_FIRST
	 * 	)
	 * @return array
	 */
	public function browseParentPath($params) {
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
		$file = FSI::getFile($path);		
		return self::browsePath(array($file->getParentPath(), $pattern, $options));
	}
	
	/**
	 * Browses the path specified in argument.
	 * 
	 * @param array $params (
	 * 		0 => $path = "home:///",
	 * 		1 => $pattern = "*",
	 * 		2 => $options = AdvancedPathLib::GLOB_DIR_FIRST
	 * 	)
	 * @return array(
	 * 		'absolutepath' => string,
	 * 		'paths' => array([root, subFolder, ...,] $path),
	 * 		'files' => array(
	 * 			{file1},							//@see self::toArray()
	 * 			{file2},
	 * 			...
	 * 		)
	 * )
	 */
	public function browsePath($params) {
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
		
		//paths for combobox
		$paths = array();
		$currentFile = $leafFolder = FSI::getFile($path);
		
		if ($leafFolder->exists() && !$leafFolder->isDirectory()) {
			$currentFile = $leafFolder = $leafFolder->getParentFile();
		}
		
		$paths[] = $currentFile->getPath();
		while (!$currentFile->isRoot()) {
			$currentFile = $currentFile->getParentFile();
			$paths[] = $currentFile->getPath();
		}
		$paths = array_reverse($paths);
		
		$filesList = self::toArray($leafFolder->listFiles($pattern, $options));
		
		$return = array(
			'absolutepath' => $leafFolder->getAbsolutePath(),
			'paths' => $paths,
			'files' => $filesList
		);
		
		return $return;
	}
	/**
	 *
	 * @param array $params (
	 * 		'userId' => String,
	 *		'files'	=> Array
	 * 	)
	 * @return <Array>
	 */
	public static function changePrivilege($params) {
		$toBeRemoved = false;
		$user = UMManager::getInstance()->getUserById($params['userId']);

		if ($params['operation'] == 'Viewer') {
			$perms = new SharePermission('read');
		} else if ($params['operation'] == 'Editor') {
			$perms = new SharePermission('read, write');
		} else if ($params['operation'] == 'Remove') {
			$toBeRemoved = true;
		}

		$files = Array();
		$paramsFiles = $params['files'];
		for ($i = 0; $i < count($paramsFiles); $i++) {
			$trueFile = FSI::getFile($paramsFiles[$i]);
			if($toBeRemoved) {
				SharingManager::getInstance()->removeCollaborator($trueFile, $user);
				$files[] = self::getSharedInfo($trueFile);
			} else {
				try {
					SharingManager::getInstance()->addCollaborator($trueFile, $user, $perms);
					$files[] = self::getSharedInfo($trueFile);

					$info = new EyeosEventNotification();
					$info->setType('Share_NewShare');
					$info->setReceiver($params['userId']);

					$eventManager = new EventNotificationManager();
					$eventManager->sendEventByType($info);
				} catch (EyeDBException $e) {
					SharingManager::getInstance()->updateCollaboratorPermission($trueFile, $user, $perms);
					$files[] = self::getSharedInfo($trueFile);
				}
			}
		}

		return $files;
	}
	
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}
	
	/**
	 * @param array $params(
	 * 		'parentFolderPath' => string,
	 * 		'newFolderName' => string
	 * )
	 */
	public function createNewFolder($params) {
		if (!isset($params['parentFolderPath']) || !is_string($params['parentFolderPath'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'parentFolderPath\'].');
		}
		if (!isset($params['newFolderName']) || !is_string($params['newFolderName'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'newFolderName\'].');
		}
		$newFolderName = basename($params['newFolderName']);
		
		$newFolder = FSI::getFile($params['parentFolderPath'] . '/' . $newFolderName);
		$newFolder->mkdir();
	}
	
	/**
	 * Get All System Tags OR all tags for an object tag(s) to object(s)
	 *
	 * @param array $params (
	 * 		[path => string],
	 * )
	 * @return array(
	 * 		[tag1], [tag2], ...
	 * )
	 */
	public function getAllTags($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$TM = TagManager::getInstance();
		
		// All tags from user
		if (!$params || !isset($params['path'])) {
			$tags = $TM->getAllTags($currentUser);
		}
		// Invalid call 
		else if (!is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}
		// All tags from file
		else {
			$file = FSI::getFile($params['path']);
			$tags = $TM->getAllTags($currentUser, $file);
		}
		
		$return = array();
		foreach($tags as $tag) {
			$return[] = $tag->getAttributesMap();
		}
		
		return $return;
	}
	
	/**
	 * Returns the content of a file.
	 * TODO: We could add transcoding support
	 * 
	 * @param array $params (
	 * 		'path' => string
	 * )
	 * @return array (
	 * 		'encoding' => string,
	 * 		'data' => mixed
	 * )
	 */
	public function getFileContent($params) {
		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\'].');
		}
		
		$file = FSI::getFile($params['path']);
		$data = $file->getContents();
		return array(
			'encoding' => mb_detect_encoding($data),
			'data' => $data
		);
	}
	
	/**
	 * Returns the metadata (if available) of the specified file.
	 * 
	 * @param array $params (
	 * 		'path' => string
	 * )
	 * @return array The metadata as an associative array or NULL if no metadata
	 * is present for the specified file, or 'false' if the filesystem does not
	 * support metadata.
	 */
	public function getFileMetaData($params) {
		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\'].');
		}
		
		$file = FSI::getFile($params['path']);
		if (!$file instanceof IMetaAssociable) {
			return 'false';
		}
		
		$meta = $file->getMeta();
		if ($meta === null) {
			return null;
		}
		
		return $meta->getAll();
	}
	
	/**
	 * Browses the path specified in argument.
	 * TODO: should also be used to return not only folders but also files.
	 * 
	 * @param array $params (
	 * 		['roots' => array(home:///, share:///, workgroup:///)],
	 * 		['leaf' => string],
	 * 		['options' => array(
	 * 			['depth' => int,]										// How many levels of folders to show from the roots
	 * 			['includeRoot' => 'TRUE'/'false']					// FALSE is only valid if one single root is provided
	 * 		)]
	 * 	)
	 * @return array(
	 * 		//TODO
	 * )
	 */
	public function getFilesAsTree($params) {
		$defaultRoots = array('home:///', 'share:///', 'workgroup:///');
		
		// Process arguments and default values
		if (is_array($params)) {
			if (isset($params['roots']) && is_array($params['roots'])) {
				$roots = $params['roots'];
			} else {
				$roots = $defaultRoots;
			}
			$leaf = isset($params['leaf']) && $params['leaf'] !== '' ? $params['leaf'] : null;
			
			$options = array();
			if (isset($params['options']) && is_array($params['options'])) {
				$options['depth'] = isset($params['options']['depth']) ? intval($params['options']['depth']) : 1;
				$options['includeRoot'] = isset($params['options']['includeRoot']) ? $params['options']['includeRoot'] !== 'false' : 'false';
				if (!$options['includeRoot'] && count($roots) > 1) {
					throw new EyeInvalidArgumentException('Cannot use options[includeRoot]=false with multiple roots.');
				}
			} else {
				$options = array('depth' => 1);
			}
		} else {
			$roots = $defaultRoots;
			$leaf = '';
			$options = array(
				'depth' => 1,
				'includeRoot' => true
			);
		}
		
		//====
		//	TODO: check that leaf is inside root(s)
		//====
		
		// Resolve roots & leaf (check also validity)
		foreach($roots as &$root) {
			$root = FSI::getFile($root);
		}
		if ($leaf !== null) {
			$leaf = FSI::getFile($leaf);
		}
		
		$depth = $options['depth'];
		
		// Do not include root in the returned tree => only one root
		if (!$options['includeRoot']) {
			$roots = self::getFilesAsTree_private($roots[0], $leaf, $depth);
		} else {
			$depth -= 1;
			
			foreach($roots as &$currentRoot) {
				try {
					$folders = self::getFilesAsTree_private($currentRoot, $leaf, $depth);
				} catch (Exception $e) {
					$folders = self::toArray(false);
				}
				
				$currentRoot = self::toArray($currentRoot);
				$currentRoot['subFolders'] = $folders;
			}
		}
		
		return $roots;
	}
	
	/**
	 * TODO: a good algorithm with a stack would be much better here...
	 * 
	 * @param IFile $root
	 * @param IFile $leaf
	 * @param int $depth
	 * @return mixed An array of serialized IFiles (see self::toArray),
	 *         or FALSE if the maximum depth has been reached.
	 */
	private static function getFilesAsTree_private(IFile $root, IFile $leaf = null, $depth) {
		if ($depth < 0) {
			if ($leaf === null || stripos($leaf->getAbsolutePath(), $root->getAbsolutePath()) !== 0) {
				//We're not in the branch leading to the specified leaf: stop recursion here
				return false;
			}
		}
		
		$folders = array();
		foreach($root->listFiles('*', AdvancedPathLib::GLOB_ONLY_DIR) as $folder) {
			try {
				$subFolders = self::getFilesAsTree_private($folder, $leaf, $depth - 1);
			} catch (Exception $e) {
				$subFolders = array(self::toArray(false));
			}
			$folder = self::toArray($folder);
			$folder['subFolders'] = $subFolders;
			$folders[] = $folder;
		}
		return $folders;
	}

	private static function getSharedInfo ($currentFile) {
		$temp = $currentFile->getAllShareInfo();
		$shared = NULL;
		if (count($temp) >= 1) {
			$shared = self::object_to_array($temp);
		} else {
			$shared = '0';
		}
		return $shared;
	}

	private static final function object_to_array($mixed) {
		if(is_object($mixed)) $mixed = (array) $mixed;
		if(is_array($mixed)) {
			$new = array();
			foreach($mixed as $key => $val) {
				$key = preg_replace("/^\\0(.*)\\0/",'',$key);
				$new[$key] = self::object_to_array($val);
			}
		} else {
			$new = $mixed;
		}
		return $new;
	}
	
	/**
	 * @param array $params(
	 * 		'path' => string,
	 * 		['mimetype' => string]
	 * )
	 */
	public function readFile($params) {
		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\'].');
		}
		
		$file = FSI::getFile($params['path']);
		$size = $file->getSize();
		$bodyrenderer = new FileReaderBodyRenderer($file->getInputStream());
		
		$response = MMapManager::getCurrentResponse();
		
		// Set mimetype header (optional)
		if (isset($params['mimetype']) && is_string($params['mimetype'])) {
			$response->getHeaders()->append('Content-Type: ' . $params['mimetype']);
		} else {
			$mimetype = $file->getMimeType();
			$response->getHeaders()->append('Content-type: ' . $mimetype);
		}
		// Set other headers
		$response->getHeaders()->append('Content-Length: ' . $size);
		$response->getHeaders()->append('Accept-Ranges: bytes');
		$response->getHeaders()->append('X-Pad: avoid browser bug');
		
		$response->setBodyRenderer($bodyrenderer);
	}

	/**
	 * Unassign tags from a file.
	 *
	 * @param array $params (
	 * 		path => string,
	 * 		tagIds => array(
	 *			tagId1, tagId2, ...
	 *		)
	 * )
	 */
	public function removeAllTags($params) {
		if ($params === null) {
			throw new EyeInvalidArgumentException('Missing $params');
		}
		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}
		if (!isset($params['tagIds']) || !is_array($params['tagIds'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'tagIds\']');
		}
		
		$file = FSI::getFile($params['path']);
		$TM = TagManager::getInstance();

		$tags = array();
		foreach ($params['tagIds'] as $tagId) {
			$tag = new BasicTag();
			$tag->setId($tagId);
			$TM->getTag($tag);
			$tags[] = $tag;
		}

		$TM->removeAllTags($file, $tags);
	}

	//TODO: TO BE REMOVED
	//Just here to show what is *not* to do
	public function removeTag($params) {
		throw new EyeBadMethodCallException('Use ' . __CLASS__ . '::removeAllTags() instead.');
	}
	
	/**
	 * Returns the content of a file.
	 * TODO: We could add transcoding support
	 * 
	 * @param array $params (
	 * 		'path' => string,
	 * 		['data' => mixed]
	 * )
	 */
	public function setFileContent($params) {
		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\'].');
		}
		
		$file = FSI::getFile($params['path']);
		$file->putContents($params['data']);
	}

	/**
	 * Return the scaled version of image.
	 *
	 * @param Array $params = (
	 *		maxHeight => integer,		Max Height of output image
	 *		maxWidth => integer,		Max Width of output image
	 *		path => string				Path of input image
	 * )
	 */
	public static function getScaledImage($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}

		if (!isset($params['path']) || !is_string($params['path'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'path\']');
		}

		$path = $params['path'];
		$maxHeight = isset($params['maxHeight']) ? intval($params['maxHeight']) : null;
		$maxWidth = isset($params['maxWidth']) ? intval($params['maxWidth']) : null;
		$response = MMapManager::getCurrentResponse();

		$myFile = FSI::getFile($params['path']);
		if (method_exists ( $myFile , 'getRealFile' )) {
			$fileName = AdvancedPathLib::getPhpLocalHackPath($myFile->getRealFile()->getAbsolutePath());
		} else {
			$fileName = $params['path'];
		}

		$info = GetImageSize($fileName);
		$width = $info[0];
		$height = $info[1];
		$mime = $info['mime'];

		//Calculate new dimensions
		$newDimensions = self::calculateDimensions(Array(
					'height' => $height,
					'width' => $width,
					'maxHeight' => $maxHeight,
					'maxWidth' => $maxWidth
		));

		$newHeight = $newDimensions['height'];
		$newWidth = $newDimensions['width'];



		if (($newHeight == $height) && ($newWidth == $width)) {
			//No resize is necessary
			$imageData = $myFile->getContents();
		} else {
			// What sort of image?
			$type = substr(strrchr($mime, '/'), 1);
			switch ($type) {
				case 'jpeg':
					$image_create_func = 'ImageCreateFromJPEG';
					$image_save_func = 'ImageJPEG';
					$new_image_ext = 'jpg';
					break;
				case 'png':
					$image_create_func = 'ImageCreateFromPNG';
					$image_save_func = 'ImagePNG';
					$new_image_ext = 'png';
					break;
				case 'bmp':
					$image_create_func = 'ImageCreateFromBMP';
					$image_save_func = 'ImageBMP';
					$new_image_ext = 'bmp';
					break;
				case 'gif':
					$image_create_func = 'ImageCreateFromGIF';
					$image_save_func = 'ImageGIF';
					$new_image_ext = 'gif';
					break;
				case 'vnd.wap.wbmp':
					$image_create_func = 'ImageCreateFromWBMP';
					$image_save_func = 'ImageWBMP';
					$new_image_ext = 'bmp';
					break;
				case 'xbm':
					$image_create_func = 'ImageCreateFromXBM';
					$image_save_func = 'ImageXBM';
					$new_image_ext = 'xbm';
					break;
				default:
					$image_create_func = 'ImageCreateFromJPEG';
					$image_save_func = 'ImageJPEG';
					$new_image_ext = 'jpg';
			}

			// Create blank image with new dimensions
			$imageData = ImageCreateTrueColor($newWidth, $newHeight);

			$originalImage = $image_create_func($fileName);
			ImageCopyResampled($imageData, $originalImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
			$image_save_func($imageData);
		}

		$imagevariable = ob_get_contents();
		ob_end_clean();
		header('Content-Type:' . $mime);
		header('Content-Length: ' . strlen($imagevariable));
		header('Accept-Ranges: bytes');
		header('X-Pad: avoid browser bug');


		echo $imagevariable;
		exit;
	}

	/**
	 * Calculate new image dimension depending of maxHeight and maxWidth respecting proportions
	 *
	 * @param Array $params = (
	 *		height => integer,			Height of input image
	 *		width => integer,			Width of input image
	 *		maxHeight => integer,		Max Height of output image (not mandatory)
	 *		maxWidth => integer,		Max Width of output image  (not mandatory)
	 * )
	 *
	 * return Array (
	 *		height => integer,
	 *		width => integer
	 * )
	 */
	private static function calculateDimensions ($params) {
		if ($params === null || !is_array($params)) {
			throw new EyeInvalidArgumentException('Missing or invalid $params');
		}
		if (!isset($params['height']) || !is_int($params['height'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'height\']');
		}
		if (!isset($params['width']) || !is_int($params['width'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'width\']');
		}
		if (isset($params['maxWidth'])) {
			$maxWidth = intval($params['maxWidth']);
		} else {
			$maxWidth = null;
		}
		if (isset($params['maxHeight'])) {
			$maxHeight = intval($params['maxHeight']);
		} else {
			$maxHeight = null;
		}

		$width = $params['width'];
		$height = $params['height'];

		// Only maxHeight is setted
		if ($maxHeight != null && $maxWidth == null) {
			if ($height > $maxHeight) {
				return Array(
					'height' => $maxHeight,
					'width' => round(($maxHeight / $height) * $width)
				);
			}
		}

		// Only maxWidth is setted
		if ($maxWidth != null && $maxHeight == null) {
			if ($width > $maxWidth) {
				return Array(
					'height' => round(($maxWidth / $width) * $height),
					'width' => $maxWidth
				);
			}
		}

		// Both are setted
		if ($maxWidth != null && $maxHeight != null) {
			if ($width > $maxWidth) {
				// We fix width
				$newHeight = round(($maxWidth / $width) * $height);
				$newWidth = $maxWidth;

				//Is Height ok?
				if ($newHeight > $maxHeight) {
					$newHeight = $maxHeight;
					$newWidth = round(($maxHeight / $newHeight) * $newWidth);
				}

				return Array (
					'height' => $newHeight,
					'width' => $newWidth
				);
			} else {
				// Width is ok, just control height
				if ($height > $maxHeight) {
					$newHeight = $maxHeight;
					$newWidth = round(($maxHeight / $newHeight) * $width);
					return Array(
						'height' => $newHeight,
						'width' => $newWidth
					);
				}
			}
		}

		// If none of previous conditions, we don't need to modify height nor width
		return Array(
			'height' => $height,
			'width' => $width
		);

	}
	
	private static function toArray($value) {
		if ($value instanceof IFile) {
			// IFile

			$return = array(
				'class' => get_class($value),
				'type' => $value->isDirectory() ? 'folder' : ($value->isLink() ? 'link' : 'file'),
				'extension' => utf8_strtoupper($value->getExtension()),
				'size' => $value->isDirectory() ? 0 : $value->getSize(),
				'permissions' => $value->getPermissions(false),
				'owner' => $value->getOwner(),
				'group' => $value->getGroup(),
				'absolutepath' => $value->getAbsolutePath(),
                                'meta' => $value->getMeta()->getAll()
			);

                        if($return['extension'] == 'LNK') {
                            $return['content'] = $value->getContents();
                        }
			$return['name'] = $value->getName() != '/' ? $value->getName() : $return['absolutepath'];
			
			if ($value instanceof EyeosAbstractVirtualFile) {
				$return['virtual'] = 'true';
			} else {
				$return['virtual'] = 'false';
			}
			return $return;
		}
		
		if ($value === false) {
			return array(
				'class' => '',
				'type' => 'none',
				'name' => '<Error browsing this folder>',
				'extension' => '',
				'size' => 0,
				'permissions' => '',
				'owner' => '',
				'group' => '',
				'absolutepath' => '',
				'virtual' => 'true'
			);
		}
		
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('$value must be an IFile, or an array of one of IFile objects.');
		}
		
		foreach($value as &$v) {
			$v = self::toArray($v);
		}
		return $value;
	}
}
?>
