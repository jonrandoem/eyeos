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

abstract class TaskbarApplication extends EyeosApplicationExecutable {
    public static function __run(AppExecutionContext $context, MMapResponse $response) {
        $currentUser = $context->getProcess()->getLoginContext()->getEyeosUser();

        $groups = UMManager::getInstance()->getAllGroupsByPrincipal($currentUser);

        $isAdmin = 0;
        if (($currentUser->getPrimaryGroupId() == 'eyeID_EyeosGroup_root') || ($currentUser->getPrimaryGroupId() == 'eyeID_EyeosGroup_admin')) {
            $isAdmin = 1;
        } else {
            foreach ($groups as $group) {
                if ($group->getId() == 'eyeID_EyeosGroup_admin') {
                    $isAdmin = 1;
                }
            }
        }

        $context->getArgs()->offsetSet(0, $isAdmin);

		$eventManager = new EventNotificationManager();

		$from = 0;
		$to = 1000;
		
		$result = $eventManager->getAllQuestionEvents($from, $to);
		$result = self::toArray($result);
		$context->getArgs()->offsetSet(1, $result);
	}

	/**
	 * Performs a PHP variable => JSON-compatible array conversion with objects of class EyeosEventNotification
	 * and array of EyeosEventNotification.
	 *
	 * @param public function getAttributesMap() $value
	 * @return array
	 */
	private static function toArray($value) {
		if ($value instanceof EyeosEventNotification) {
			$result = $value->getAttributesMap();
			$result = $result['eventInformation'];

			if ($result['isQuestion'] !== null) {
				if ($result['isQuestion']) {
					$result['isQuestion'] = true;
				} else {
					$result['isQuestion'] = false;
				}
			}

			if ($result['hasEnded'] !== null) {
				if ($result['hasEnded']) {
					$result['hasEnded'] = true;
				} else {
					$result['hasEnded'] = false;
				}
			}

			return $result;
		}
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('Invalid $value must be an EyeosEventNotification or an array of EyeosEventNotification');
		}

		foreach($value as &$v) {
			$v = self::toArray($v);
		}
		//sort($value);
		return $value;
	}
}

?>