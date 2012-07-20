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
 * @subpackage Sharing
 */
class FileActivityListener extends AbstractFileAdapter implements ISharingListener {
	private static $Instance = null;

	protected function __construct() {}
	
	
	private static function checkFile($file) {
		if (!$file instanceof EyeosAbstractVirtualFile) {
			throw new EyeInvalidClassException('Source object must be an instance of EyeosAbstractVirtualFile.');
		}
	}
	
	public function collaboratorAdded(SharingEvent $e) {
		$shareInfo = $e->getSource();
		$file = $shareInfo->getShareable();
		
		$meta = null;
		$activity = null;
		$by = null;
		self::initContext($file, $meta, $activity, $by);
		
		$activity[] = array(
			'type' => 'startsharing',
			'by' => $by->getId(),
			'with' => $shareInfo->getCollaborator()->getId(),
			'time' => $e->getTimeStamp()
		);
		
		$meta->set('activity', $activity);
		$file->setMeta($meta);
	}
	
	public function collaboratorPermissionUpdated(SharingEvent $e) {
		$shareInfo = $e->getSource();
		$file = $shareInfo->getShareable();
		
		$meta = null;
		$activity = null;
		$by = null;
		self::initContext($file, $meta, $activity, $by);
		
		$activity[] = array(
			'type' => 'updatesharing',
			'by' => $by->getId(),
			'with' => $shareInfo->getCollaborator()->getId(),
			'time' => $e->getTimeStamp()
		);
		
		$meta->set('activity', $activity);
		$file->setMeta($meta);
	}
	
	public function collaboratorRemoved(SharingEvent $e) {
		$shareInfo = $e->getSource();
		$file = $shareInfo->getShareable();
		
		$meta = null;
		$activity = null;
		$by = null;
		self::initContext($file, $meta, $activity, $by);
		
		$activity[] = array(
			'type' => 'stopsharing',
			'by' => $by->getId(),
			'with' => $shareInfo->getCollaborator()->getId(),
			'time' => $e->getTimeStamp()
		);
		
		$meta->set('activity', $activity);
		$file->setMeta($meta);
	}
	
	public function fileCreated(FileEvent $e) {
		$file = $e->getSource();
		
		$meta = null;
		$activity = null;
		$by = null;
		self::initContext($file, $meta, $activity, $by);
		
		$activity[] = array(
			'type' => 'creation',
			'by' => $by->getId(),
			'time' => $e->getTimeStamp()
		);
		
		$meta->set('activity', $activity);
		$file->setMeta($meta);
	}
	
	public function fileWritten(FileEvent $e) {
		$file = $e->getSource();
		
		$meta = null;
		$activity = null;
		$by = null;
		self::initContext($file, $meta, $activity, $by);
		
		// On virtual files, creating a file by adding content consist in 2 different operations and
		// therefore may create 2 different activities, so we avoid that by the following condition
		// checking that the creation of the file has been performed more than 5 seconds ago.
		$lastActivity = end($activity);
		if (is_array($lastActivity) && $lastActivity['type'] == 'creation' && $e->getTimeStamp() - $lastActivity['time'] < 5) {
			return;
		}
		
		$activity[] = array(
			'type' => 'edition',
			'by' => $by->getId(),
			'time' => $e->getTimeStamp()
		);
		
		$meta->set('activity', $activity);
		$meta->set(EyeosAbstractVirtualFile::METADATA_KEY_MODIFICATIONTIME, $e->getTimeStamp());
		
		$file->setMeta($meta);
	}
	
	private static function initContext(EyeosAbstractVirtualFile $file, &$meta, &$activity, &$by) {
		self::checkFile($file);
		
		// Metadata
		$meta = $file->getMeta();
		if ($meta === null) {
			$meta = MetaManager::getInstance()->getNewMetaDataInstance();
		}
		
		// Activity node
		if ($meta->exists('activity')) {
			$activity = $meta->get('activity');
		} else {
			$activity = array();
		}
		
		// Current user ("by")
		$by = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			self::$Instance = new FileActivityListener();
		}
		return self::$Instance;
	}
}

// Register singleton listener on the target dispatchers
EyeosGlobalFileEventsDispatcher::getInstance()->addListener(FileActivityListener::getInstance());
SharingManager::getInstance()->addListener(FileActivityListener::getInstance());
?>