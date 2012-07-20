<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

abstract class NewusersettingsApplication extends EyeosApplicationExecutable {

	public static function loadSettings() {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);

		if($settings === null) {
			$settings = MetaManager::getInstance()->getNewMetaDataInstance($currentUser);
		}
		$settings->set('eyeos.user.id', $currentUser->getId());
		$settings->set('eyeos.user.nickname', $currentUser->getName());

		return $settings->getAll();
	}
	
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
		session_write_close();
		$info = GetImageSize($fileName);
		$width = $info[0];
		$height = $info[1];
		$mime = $info['mime'];

		// hardcoded (and nasty!) size
		$newHeight = 50;
		$newWidth = 50;



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

	public static function saveSettings($params) {
		$params = (array) $params;
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);

		unset($params['eyeos.user.id']);
		unset($params['eyeos.user.nickname']);
		$params['eyeos.user.firstname'] = strip_tags($params['eyeos.user.firstname']);
		$params['eyeos.user.lastname'] = strip_tags($params['eyeos.user.lastname']);
		if($settings === null) {
			$settings = MetaManager::getInstance()->getNewMetaDataInstance($currentUser);
		}
		$settings->setAll($params);
		MetaManager::getInstance()->storeMeta($currentUser, $settings);

		return $params;
	}

	public static function savePositionsWidget($params) {
		$widgets = $params;

		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$widgetsXML = $meta->get('eyeos.user.desktop.widgets');

		foreach($widgets as $widget) {
			$widgetsXML[$widget['id']]['column'] = $widget['column'];
			$widgetsXML[$widget['id']]['position'] = $widget['position'];
			$widgetsXML[$widget['id']]['minimized'] = $widget['minimized'];
		}

		$meta->set('eyeos.user.desktop.widgets', $widgetsXML);
		MetaManager::getInstance()->storeMeta($currentUser, $meta);
	}

	public static function changePassword($params) {
		$oldPassword = $params[0];
		$newPassword = $params[1];

		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();

		$fakeUser = UMManager::getInstance()->getNewUserInstance();
		$fakeUser->setName($currentUser->getName(), true);
		$fakeUser->setPassword($oldPassword, true);

		try {
			$tmpSubject = new Subject();
			$tmpSubject->getPrivateCredentials()->append(new EyeosPasswordCredential($currentUser->getName(), $oldPassword));
			$tmpLoginContext = new LoginContext('eyeos-login', $tmpSubject);
			$tmpLoginContext->login();

			unset($tmpSubject);
			unset($tmpLoginContext);
		} catch (EyeLoginException $e) {
			throw new EyeLoginException('The old password supplied is not correct');
			//return false;
		}

		// Here we need to apply the new password on a copy of the object: in case the update fails
		// we don't want the login context to be in an inconsistent state (user with unsynchronized password)
		$currentUserCopy = clone $currentUser;
		$currentUserCopy->setPassword($newPassword, true);
		UMManager::getInstance()->updatePrincipal($currentUserCopy);

		//If and only if the update process is successful, we can update the object in the login context
		$currentUser->setPassword($newPassword, true);
		return true;
//		return md5($newPassword . $newPassword . $newPassword);
	}

	public static function verifyPath($params) {
        $Logger = Logger::getLogger('app.trololo');
		// exists path images?
		$existsImages = FSI::getFile($params[0]);
		$Logger->debug("AAAAAAAAAA: " . $existsImages->isDirectory()?'true':'false');
		if (!$existsImages->isDirectory()) {
			try {
				$existsImages->mkdir();
			}
			catch (Exception $e) {
				// do nothing
			}
		}
	}
	public static function copy($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		$target = FSI::getFile($params[0]);
		$results = array();
		for($i = 1; $i < count($params); $i++) {
			$source = FSI::getFile($params[$i]);
			//$name = split("\.", $source->getName());
			$name = explode(".", $source->getName());
			$extension = (string) $name[count($name) - 1];
			$theName = substr($source->getName(), 0, strlen($source->getName()) - strlen($extension) - 1);
			$nameForCheck = $theName;
			$nameForCheck .= '.' . $extension;
			$i = 1;
			$newFile = FSI::getFile($params[0] . "/" . $nameForCheck);
			while ($newFile->exists()) {
				$futureName = Array($theName, $i);
				$nameForCheck = implode(' ', $futureName);
				$nameForCheck .= '.' . $extension;
				$i++;
				$newFile = FSI::getFile($params[0] . "/" . $nameForCheck);
			}
			$source->copyTo($newFile);
		}
	}

	/*
	 * Remove an User from the system
     * @param String $params The id of the user to remove
     */
    public static function deleteUser () {
        $myUManager = UMManager::getInstance();
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
        $myUManager->deletePrincipal($myUManager->getUserById($currentUserId));
    }

    public static function ShowHideWidget($params) {
            // sanitize input
            $cleanInput = false;
            if ( is_array($params) ) {
                    if ( 2 <= count($params) )
                    {
                            if (isset($params[0]) && isset($params[1]) )
                            {
                                    $widget = $params[0];
                                    $value = $params[1];
                                    $cleanInput = true;
                            }
                    }
            }
            // is input correct?
            if ( !$cleanInput ) {
                    // simply exit
                    return;
            }
            $currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
            $meta = MetaManager::getInstance()->retrieveMeta($currentUser);
            $widgets = $meta->get('eyeos.user.desktop.widgets');

            $widgets[$widget]['installed'] = $value;

            $meta->set('eyeos.user.desktop.widgets', $widgets);
            MetaManager::getInstance()->storeMeta($currentUser, $meta);
    }
}

?>
