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
 * ExecModule for SocialBar management.
 *
 * @package kernel-frameworks
 * @subpackage Application
 */
class SocialBarExecModule implements IEyeosExecutableModule {
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}

	public static function getCurrentUserId($params) {
		return ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
	}

	/**
	 * TODO: To remove, only used by eyeos.socialbar-ShareWindow.
	 * use contact manager instead
	 *
	 *
	 * @param <type> $params
	 * @return <type>
	 */
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

	public static function setRating ($params) {
		$value = $params[0];
		for ($i = 1; $i < count($params); $i++) {
			self::setFileRating(Array($params[$i], $value));
		}
	}

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
}

?>
