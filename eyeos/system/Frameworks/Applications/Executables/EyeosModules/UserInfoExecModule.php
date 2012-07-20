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
 * ExecModule for manipulating user information.
 * 
 * @package kernel-frameworks
 * @subpackage Application
 */
class UserInfoExecModule implements IEyeosExecutableModule {
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}
	
	/**
	 * FIXME: use string keys instead
	 * 
	 * @return array(
	 * 		0 => name,
	 * 		1 => path
	 * )
	 */
	public function getUserFavoritePlaces($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		
		if ($settings === null || !$settings->exists('eyeos.user.files.places')) {
			//return default one (only the Home folder)
			return array(
				array(
					'name' => 'Home',
					'path' => 'home://~' . $currentUser->getName()
				)
			);
		}
		$return = $settings->get('eyeos.user.files.places');
		foreach($return as $key => $placeInfo) {
			$return[$key] = unserialize($placeInfo);
		}
		return $return;
	}
	
	/**
	 * @param array(
	 * 		['userId' => userId],
	 * 		['userName' => userName]
	 * )
	 */
	// FIXME: REVISION: better with SecurityManager
	public function getAvatarPicture($params) {
		if (isset($params['userId']) && is_string($params['userId'])) {
			$user = UMManager::getInstance()->getUserById($params['userId']);
		} else if (isset($params['userName']) && is_string($params['userName'])) {
			$user = UMManager::getInstance()->getUserByName($params['userName']);
		} else {
			$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		}

		$settings = MetaManager::getInstance()->retrieveMeta($user);
		$file = null;

		$loginContext = ProcManager::getInstance()->getCurrentProcess()->getLoginContext();
		$oldUser = $loginContext->getEyeosUser();

		if(ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId() != 'eyeID_EyeosUser_root') {
			$loginContext->setEyeosUser($user);
		}

		try {
			if($oldUser->getId() != 'eyeID_EyeosUser_root') {
				$procManager = ProcManager::getInstance();
				$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $loginContext);
			}

			if ($settings->get('eyeos.user.picture.url') !== null) {
				$file = FSI::getFile($settings->get('eyeos.user.picture.url'));
			}

			if ($file === null || !$file->isReadable()) {
				$file = FSI::getFile('sys:///extern/images/empty_profile.png');
			}

			// Set headers
			header('Content-Type: ' . $file->getMimeType());
			header('Content-Length: ' . $file->getSize());
			header('Accept-Ranges: bytes');
			header('X-Pad: avoid browser bug');
			echo $file->getContents();

			if($oldUser->getId() != 'eyeID_EyeosUser_root') {
				$loginContext->setEyeosUser($oldUser);
				$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $loginContext);
			}
		} catch (Exception $e) {
			if($oldUser->getId() != 'eyeID_EyeosUser_root') {
				$loginContext->setEyeosUser($oldUser);
				$procManager->setProcessLoginContext($procManager->getCurrentProcess()->getPid(), $loginContext);
			}
		}
	}
	
	/**
	 * @return array(
	 * 		user attributes ...
	 * 		...
	 * 		'metadata' => array(
	 * 			... metadata ...
	 * 		)
	 * )
	 */
	public function getCurrentUserInfo($params) {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		
		$meta = $currentUser->getMeta();
		$meta = $meta !== null ? $meta->getAll() : array();
		
		$return = $currentUser->getAttributesMap();
		$return['metadata'] = $meta;
		
		return $return;
	}
	
	/**
	 * FIXME: use string keys instead
	 * 
	 * @param array(
	 * 		0 => name,
	 * 		1 => path
	 * )
	 */
	public function setUserFavoritePlaces($params) {
		if (!is_array($params)) {
			throw new EyeInvalidArgumentException('$params must be an array.');
		}
		
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$settings = MetaManager::getInstance()->retrieveMeta($currentUser);
		
		if ($settings === null) {
			$settings = MetaManager::getInstance()->getNewMetaDataInstance($currentUser);
		}
		foreach($params as $key => $param) {
			$params[$key] = serialize($param);
		}
		$settings->set('eyeos.user.files.places', $params);
		
		MetaManager::getInstance()->storeMeta($currentUser, $settings);
	}
	
	/**
	 * @param array(
	 * 		'filePath' => filePath,
	 * 		['userId' => userId],
	 * 		['userName' => userName]
	 * )
	 */
	public function setAvatarPicture($params) {
		if (!isset($params['filePath']) || !is_string($params['filePath'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'filePath\'].');
		}
		if (isset($params['userId']) && is_string($params['userId'])) {
			$user = UMManager::getInstance()->getUserById($params['userId']);
		} else if (isset($params['userName']) && is_string($params['userName'])) {
			$user = UMManager::getInstance()->getUserByName($params['userName']);
		} else {
			$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		}
		
		$file = FSI::getFile($params['filePath']);
		if (!$file->isReadable()) {
			throw new EyeIOException('Unable to read file at ' . $params['filePath'] . '.');
		}
		
		$extension = $file->getExtension() ? '.' . $file->getExtension() : '';
		$destFile = FSI::getFile('user-conf://~' . $user->getName() . '/public/avatarpic' . $extension);
		
		$file->copyTo($destFile);
		
		// Update settings (metadata)
		$settings = MetaManager::getInstance()->retrieveMeta($user);
		$settings->set('eyeos.user.picture.url', $destFile->getAbsolutePath());
		MetaManager::getInstance()->storeMeta($user, $settings);
	}

	/**
	 * Create a system tag for this user, providing a label and a HTML color (TODO: yet to implement)
	 * @param array(
	 * 		'label' => String
	 *		'color' => String
	 * )
	 */
	public function createTag($params) {
		if ($params === null)  {
			throw new EyeInvalidArgumentException('Missing $params');
		}
		if (!isset($params['label']) || !is_string($params['label'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'label\']');
		}
		if (!isset($params['color']) || !is_string($params['color'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'color\']');
		}

		$tag = new BasicTag($params['label'], $params['color']);
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();

		TagManager::getInstance()->createTag($currentUser, $tag);
	}

	/**
	 * Delete a system tag for this user
	 * @param array(
	 * 		'label' => String
	 * )
	 */
	public function deleteTag($params) {
		if ($params === null) {
			throw new EyeInvalidArgumentException('Missing $params');
		}
		if (!isset($params['label']) || !is_string($params['label'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'label\']');
		}
		
		$tag = new BasicTag($params['label']);
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();

		TagManager::getInstance()->deleteTag($currentUser, $tag);
	}

	/**
	 * Update a system tag for this user
	 * @param array(
	 * 		oldTag => array(
	 *			label => String,
	 *			color => String,
	 *		),
	 *		newTag => array(
	 *			label => String,
	 *			color => String
	 *		)
	 * )
	 */
	public function updateTag($params) {
		if ($params === null) {
			throw new EyeInvalidArgumentException('Missing $params');
		}
		if (!isset($params['oldTag']) || !is_array($params['oldTag'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'oldTag\']');
		}
		if (!isset($params['newTag']) || !is_array($params['newTag'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $params[\'newTag\']');
		}
		$oldTag = $params['oldTag'];
		$newTag = $params['newTag'];
		
		if (!isset($oldTag['label']) || !is_string($oldTag['label'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $oldTag[\'label\']');
		}
		if (!isset($newTag['label']) || !is_string($newTag['label'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $newTag[\'label\']');
		}
		if (!isset($oldTag['color']) || !is_string($oldTag['color'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $oldTag[\'color\']');
		}
		if (!isset($newTag['color']) || !is_string($newTag['color'])) {
			throw new EyeInvalidArgumentException('Missing or invalid $newTag[\'color\']');
		}

		$oldTag = new BasicTag($oldTag['label'], $oldTag['color']);
		$newTag = new BasicTag($newTag['label'], $newTag['color']);
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();

		TagManager::getInstance()->updateTag($currentUser, $oldTag, $newTag);
	}
}
?>
