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
class ShareableCalendarsHandler implements IShareableObjectsHandler {	
	const OBJECTDATA_KEY_ID = 'calendarId';
	
	private static $Instance = null;
	
	protected function __construct() {}
	
	/**
	 * @param string A type/classname
	 * @return boolean
	 */
	public function checkType($classType) {
		return is_child_of($classType, 'ICalendar');
	}
	
	public function createShareableObject(array $shareableObjectData) {
		if (!isset($shareableObjectData[self::OBJECTDATA_KEY_ID])) {
			throw new EyeInvalidArgumentException('Given $shareableObjectData is not valid (missing "' . self::OBJECTDATA_KEY_ID . '" key).');
		}
		return CalendarManager::getInstance()->getCalendarById($shareableObjectData[self::OBJECTDATA_KEY_ID]);
	}
	
	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
		}
		return self::$Instance;
	}
	
	public function & getShareableObjectData(IShareable $object, array & $shareableObjectData) {
		if (!($object instanceof ICalendar)) {
			throw new EyeInvalidClassException('$object must be an instance of ICalendar.');
		}
		try {
			CalendarManager::getInstance()->getCalendarById($object->getId());
		} catch (EyeCalendarNotFoundException $e) {
			throw new EyeSharingException('Unable to share non-existing calendar ' . $object->getId() . '.', 0, $e);
		}
		$shareableObjectData[self::OBJECTDATA_KEY_ID] = $object->getId();
		return $shareableObjectData;
	}
	
	public function notifySharingStarted(IShareable $object) {
		//TODO
		/*if (!($object instanceof ICalendar)) {
			throw new EyeInvalidClassException('$object must be an instance of ICalendar.');
		}
		$object->addFileListener(SharedFileListener::getInstance());*/
	}
	
	public function notifySharingStopped(IShareable $object) {
		//TODO
		/*if (!($object instanceof ICalendar)) {
			throw new EyeInvalidClassException('$object must be an instance of ICalendar.');
		}
		$object->removeFileListener(SharedFileListener::getInstance());*/
	}
}
?>