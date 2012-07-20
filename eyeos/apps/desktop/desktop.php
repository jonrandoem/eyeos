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

abstract class DesktopApplication extends EyeosApplicationExecutable {

	public static function __run(AppExecutionContext $context, MMapResponse $response) {
		$currentUser = $context->getProcess()->getLoginContext()->getEyeosUser();
		$files = EyeosApplicationExecutable::__callModule('FileSystem', 'browsePath', array('home:///Desktop/', null, null));
		$context->getArgs()->offsetSet(0, $currentUser->getName());
		$context->getArgs()->offsetSet(1, $files);
		if ($context->getIncludeBody()) {
			$buffer = '';

			$itemsPath = EYE_ROOT . '/' . APPS_DIR . '/desktop/';
			$buffer .= file_get_contents($itemsPath . '/desktop.WidgetManager.js');
			$buffer .= file_get_contents($itemsPath . '/desktop.SelectionManager.js');
			$buffer .= file_get_contents($itemsPath . '/desktop.actionManager.js');
			$buffer .= file_get_contents($itemsPath . '/desktop.chatManager.js');

			$buffer .= file_get_contents($itemsPath . '/widgets/desktop.widget.events.js');
			$buffer .= file_get_contents($itemsPath . '/widgets/desktop.widget.favorites.js');
			$buffer .= file_get_contents($itemsPath . '/widgets/desktop.widget.files.js');
			$buffer .= file_get_contents($itemsPath . '/widgets/desktop.widget.groups.js');
			$buffer .= file_get_contents($itemsPath . '/widgets/desktop.widget.notes.js');
			$buffer .= file_get_contents($itemsPath . '/widgets/desktop.widget.desktop.js');
			$response->appendToBody($buffer);
		}
	}

	public static function isAdministrator() {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$groups = UMManager::getInstance()->getAllGroupsByPrincipal($currentUser);

		if (($currentUser->getPrimaryGroupId() == 'eyeID_EyeosGroup_root') || ($currentUser->getPrimaryGroupId() == 'eyeID_EyeosGroup_admin')) {
			return 1;
		} else {
			foreach ($groups as $group) {
				if ($group->getId() == 'eyeID_EyeosGroup_admin') {
					return 1;
				}
			}
		}
		return 0;
	}

	public static function loadWidgets() {
		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);

		$widgets = $meta->get('eyeos.user.desktop.widgets');
		return $widgets;
	}

	public static function ShowHideWidget($params) {
		// sanitize input
		$cleanInput = false;
		if (is_array($params)) {
			if (2 <= count($params)) {
				if (isset($params[0]) && isset($params[1])) {
					$widget = $params[0];
					$value = $params[1];
					$cleanInput = true;
				}
			}
		}
		// is input correct?
		if (!$cleanInput) {
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

	public static function saveSettingsWidget($params) {
		// sanitize input
		$cleanInput = false;
		if (is_array($params)) {
			if (2 <= count($params)) {
				if (isset($params['widget']) && isset($params['settings'])) {
					$widget = $params['widget'];
					$settings = $params['settings'];
					$cleanInput = true;
				}
			}
		}
		// is input correct?
		if (!$cleanInput) {
			// simply exit
			return;
		}

		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$widgets = $meta->get('eyeos.user.desktop.widgets');

		foreach ($settings as $key => $value) {
			$widgets[$widget][$key] = $value;
		}

		$meta->set('eyeos.user.desktop.widgets', $widgets);
		MetaManager::getInstance()->storeMeta($currentUser, $meta);
	}

	public static function savePositionsWidget($params) {
		$widgets = $params;

		$currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$meta = MetaManager::getInstance()->retrieveMeta($currentUser);
		$widgetsXML = $meta->get('eyeos.user.desktop.widgets');

		foreach ($widgets as $widget) {
			$widgetsXML[$widget['id']]['column'] = $widget['column'];
			$widgetsXML[$widget['id']]['position'] = $widget['position'];
			$widgetsXML[$widget['id']]['minimized'] = $widget['minimized'];
		}

		$meta->set('eyeos.user.desktop.widgets', $widgetsXML);
		MetaManager::getInstance()->storeMeta($currentUser, $meta);
	}

	//
	//		if($widgets) {
	//			$widgets[$application->getName()] = true;
	//		} else {
	//			unset($favorites[$application->getName()]);
	//		}
	//		$meta->set('eyeos.user.applications.favorite', $favorites);
	//		MetaManager::getInstance()->storeMeta($currentUser, $meta);
	//		var_dump($meta);

	/*
	 * ***********************
	 * 			NETSYNC
	 * ***********************
	 */

	/**
	 * Returns the params necessary to connect NetSync
	 *
	 * @param <type> $params
	 * @return <type>
	 */
	public static function getNetSyncCredential($params) {
		$currentUserId = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		return array(
			'id' => $currentUserId,
			'password' => '',
			'url' => ACTIVEMQ_DESTINATION_URL,
			'channel' => ACTIVEMQ_CHANNEL_PREFIX
		);
	}

	/*
	 * ***********************
	 * 			TAGS
	 * ***********************
	 */

	public static function getAllTags($params) {
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$peopleController = PeopleController::getInstance();
		$tempResults = $peopleController->getAllTags($currentUserId);
		$results = array();
		foreach ($tempResults as $result) {
			$results[] = array(
				'id' => $result->getId(),
				'userId' => $result->getUserId(),
				'name' => $result->getName()
			);
		}
		//print_r($results);
		return $results;
	}

	public static function removeTag($params) {
		// $params = id of the tag to remove
		$params = (int) $params;

		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$tagToRemove = new PeopleTag();
		$tagToRemove->setId($params);
		$tagToRemove->setUserId($currentUserId);
		$peopleController = PeopleController::getInstance();
		$peopleController->removeTag($tagToRemove);
	}

	public static function editTag($params) {

		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		//$currentUserId = 'eyeID_EyeosUser_61a'; //TODO: this should be a call to proc to get the currentUser.
		//I supose params = Array (idTag, newName)
		$tagToEdit = new PeopleTag();
		$tagToEdit->setId($params[0]);
		$tagToEdit->setUserId($currentUserId);
		$tagToEdit->setName($params[1]);
		$peopleController = PeopleController::getInstance();
		$peopleController->editTag($tagToEdit);
	}

	public static function createTag($params) {
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		//$currentUserId = 'eyeID_EyeosUser_61a'; //TODO: this should be a call to proc to get the currentUser.
		// I supose params = $nameOfNewTag
		$peopleController = PeopleController::getInstance();
		//return a new Tag with name sended
		$newTag = $peopleController->createTag($params, $currentUserId);

		$results[] = array(
			'id' => $newTag->getId(),
			'userId' => $newTag->getUserId(),
			'name' => $newTag->getName(),
		);

		return $results;
	}

	/*
	 * ***********************
	 * 			CONTACTS
	 * ***********************
	 */

	public static function getCurrentUserId() {
		$myProcManager = ProcManager::getInstance();
		$results = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		return $results;
	}

	public static function searchPeople($params) {

		//Buscar en Provider con consulta rollo LIKE etc...
		$peopleController = PeopleController::getInstance();
		$resultsSearch = $peopleController->searchContacts($params);

		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		//$peopleController = new PeopleController();

		$results = Array();

		foreach ($resultsSearch as $result) {
			if (($result != $currentUserId)) { // I don't want to search myself
				try {
					$user = UMManager::getInstance()->getUserById($result);
				} catch (Exception $e) {
					continue;
				}

				$settings = MetaManager::getInstance()->retrieveMeta($user);

				$nameOfUser = $user->getName();

				$realName = $nameOfUser;
				$description = 'No description';
				$pathImage = 'index.php?extern=images/48x48/apps/system-users.png';

				if ($settings != null) {
					if ($settings->get('eyeos.user.firstname') != null && $settings->get('eyeos.user.lastname') != null) {
						$realName = $settings->get('eyeos.user.firstname') . ' ' . $settings->get('eyeos.user.lastname');
					}
					if ($settings->get('eyeos.user.currentlife.city') != null) {
						$description = $settings->get('eyeos.user.currentlife.city');
					}
				}

				$myRelationManager = RelationsManager::getInstance();
				$relation = $myRelationManager->getRelation($result, $currentUserId);
				$state = ($relation != null) ? $relation->getState() : null;

				$results[] = array(
					'userId' => $result,
					'description' => $nameOfUser,
					'realName' => $realName,
					'state' => $state,
				);
			}
		}
		return $results;
	}

	/*
	 * ********************************
	 * 			TAGS & CONTACTS
	 * ********************************
	 */

	public static function addTagToContact($params) {
		// I supose params = TagId, ContactId
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$peopleController = PeopleController::getInstance();

		$tag = new PeopleTag();
		$tag->setId($params[0]);
		$tag->setName($peopleController->getTagName($params[0]));
		$tag->setUserId($currentUserId);

		$contact = new Contact();
		$contact = $peopleController->getContact($currentUserId, $params[1]);

		$peopleController->addTagToContact($tag, $contact);

		$listsName = array();

		$state = $contact->getRelation()->getState();
		if ($state == 'pending') {
			$listsName[] = 'pending';
		}

		$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($contact->getImpression());
		foreach ($tagsPerImpression as $tagPerImpression) {
			$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
		}

		return $listsName;
	}

	public static function removeTagToContact($params) {
		// I supose params = TagId
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$peopleController = PeopleController::getInstance();

		$tag = new PeopleTag();
		$tag->setId($params[0]);
		$tag->setName($peopleController->getTagName($params[0]));
		$tag->setUserId($currentUserId);

		$contact = $peopleController->getContact($currentUserId, $params[1]);
		//print_r($contact); exit;

		$peopleController->removeTagToContact($tag, $contact);

		$listsName = array();

		$state = $contact->getRelation()->getState();
		if ($state == 'pending') {
			$listsName[] = 'pending';
		}

		$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($contact->getImpression());
		foreach ($tagsPerImpression as $tagPerImpression) {
			$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
		}

		return $listsName;
	}

	public static function getDescription($params) {
		// I supose params = ContactId
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		$peopleController = PeopleController::getInstance();

		$contact = $peopleController->getContact($currentUserId, $params);

		$listsName = array();

		$state = $contact->getRelation()->getState();
		if ($state == 'pending') {
			$listsName[] = 'pending';
		}

		$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($contact->getImpression());
		foreach ($tagsPerImpression as $tagPerImpression) {
			$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
		}

		return $listsName;
	}

	public static function getRecentsContacts($params) {
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$myRelationManager = RelationsManager::getInstance();
		$lastRelationIds = $myRelationManager->getLastRelationsId($currentUserId, $params);

		$results = array();
		$peopleController = PeopleController::getInstance();
		foreach ($lastRelationIds as $resultId) {
			$result = $peopleController->getContact($currentUserId, $resultId);
			if ($result->getRelation()->getSourceId() != $currentUserId) {
				$contactId = $result->getRelation()->getSourceId();
			} else {
				$contactId = $result->getRelation()->getTargetId();
			}

			$state = $result->getRelation()->getState();

			$lists = array();
			$listsName = array();

			$tagsPerImpression = ImpressionsManager::getInstance()->getTagsPerImpression($result->getImpression());
			foreach ($tagsPerImpression as $tagPerImpression) {
				$lists[] = $tagPerImpression->getTagId();
				$listsName[] = $peopleController->getTagName($tagPerImpression->getTagId());
			}

			$otherUser = UMManager::getInstance()->getUserById($contactId);
			$meta = MetaManager::getInstance()->retrieveMeta($otherUser)->getAll();

			$results[] = array(
				'id' => $contactId,
				'nickname' => $otherUser->getName(),
				'lists' => $lists,
				'listsName' => $listsName,
				'state' => $state,
				'meta' => $meta
			);
		}

		return $results;
	}

	/*
	 * ********************************
	 * 			SEARCH
	 * ********************************
	 */

	public static function search($params) {
		$searchController = new SearchController();
		$results = $searchController->search($params);
		return $results;
	}

	/*
	 * ********************************
	 * 			APPLICATIONS
	 * ********************************
	 */

	//FIXME should be moved to an ExecModule
	public static function getFavoriteApplications($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$favorites = $myApplicationsManager->getAllFavoriteApplications();
		$return = array();
		foreach ($favorites as $appDesc) {
			$appMeta = $appDesc->getMeta();
			$sysParams = $appMeta->get('eyeos.application.systemParameters');

			$imagePath = $appMeta->get('eyeos.application.iconUrl');
			$imageTaskBarPath = $appMeta->get('eyeos.application.taskBarIconUrl');

			$imageIsValid = true;
			try {
				$file = FSI::getFile($imagePath);
				$other_file = FSI::getFile($imageTaskBarPath);
			} catch (Exception $e) {
				$imageIsValid = false;
			}
			if ($imageIsValid && !$file->isReadable() && !$other_file->isReadable()) {
				$imageIsValid = false;
			}
			if (!$imageIsValid) {
				$imagePath = 'sys:///extern/images/48x48/apps/preferences-desktop-default-applications.png';
				$imageTaskBarPath = 'sys:///extern/images/16x16/apps/preferences-desktop-default-applications.png';
			}
			$return[] = array(
				'name' => $appDesc->getName(),
				'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
				'listable' => $sysParams['listable'] == 'true' ? 1 : 0, //FIXME: why integers here?
				'category' => $appMeta->get('eyeos.application.category'),
				'author' => $appMeta->get('eyeos.application.author'),
				'version' => $appMeta->get('eyeos.application.version'),
				'license' => $appMeta->get('eyeos.application.license'),
				'shortDescription' => $appMeta->get('eyeos.application.description'),
				'installed' => $myApplicationsManager->isApplicationInstalled($appDesc) ? 1 : 0, //FIXME: why integers here?
				'imagePath' => FSI::toExternalUrl($imagePath),
				'smallImagePath' => FSI::toExternalUrl($imageTaskBarPath)
			);
		}
		return $return;
	}

	public static function getAllRecentlyInstalledApplications($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$applications = $myApplicationsManager->getAllRecentlyInstalledApplications($params);

		$return = null;
		foreach ($applications as $appDesc) {
			$appMeta = $appDesc->getMeta();
			$sysParams = $appMeta->get('eyeos.application.systemParameters');

			$imagePath = $appMeta->get('eyeos.application.iconUrl');
			$imageIsValid = true;
			try {
				$file = FSI::getFile($imagePath);
			} catch (Exception $e) {
				$imageIsValid = false;
			}
			if ($imageIsValid && !$file->isReadable()) {
				$imageIsValid = false;
			}
			if (!$imageIsValid) {
				$imagePath = 'sys:///extern/images/48x48/apps/preferences-desktop-default-applications.png';
			}

			$return[] = array(
				'name' => $appDesc->getName(),
				'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
				'app' => $appDesc->getName(),
				'shortDescription' => $appMeta->get('eyeos.application.description'),
				'image' => FSI::toExternalUrl($imagePath),
				'favorite' => $myApplicationsManager->isApplicationFavorite($appDesc) ? 1 : 0, //FIXME: why integers here?																				//FIXME
				'lists' => $appMeta->get('eyeos.application.category'),
				'listable' => $sysParams['listable'] == 'true' ? 1 : 0,
				'installed' => $myApplicationsManager->isApplicationInstalled($appDesc) ? 1 : 0  //FIXME: why integers here?
			);
		}

		return $return;
	}

	public static function getAllNotInstalledApplications($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$applications = $myApplicationsManager->getAllNotInstalledApplications($params);

		$return = null;
		foreach ($applications as $appDesc) {
			$appMeta = $appDesc->getMeta();
			$sysParams = $appMeta->get('eyeos.application.systemParameters');

			$imagePath = $appMeta->get('eyeos.application.iconUrl');
			$imageIsValid = true;
			try {
				$file = FSI::getFile($imagePath);
			} catch (Exception $e) {
				$imageIsValid = false;
			}
			if ($imageIsValid && !$file->isReadable()) {
				$imageIsValid = false;
			}
			if (!$imageIsValid) {
				$imagePath = 'sys:///extern/images/48x48/apps/preferences-desktop-default-applications.png';
			}
			$return[] = array(
				'name' => $appDesc->getName(),
				'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
				'app' => $appDesc->getName(),
				'shortDescription' => $appMeta->get('eyeos.application.description'),
				'image' => FSI::toExternalUrl($imagePath),
				'favorite' => $myApplicationsManager->isApplicationFavorite($appDesc) ? 1 : 0, //FIXME: why integers here?																				//FIXME
				'lists' => $appMeta->get('eyeos.application.category'),
				'listable' => $sysParams['listable'] == 'true' ? 1 : 0,
				'installed' => $myApplicationsManager->isApplicationInstalled($appDesc) ? 1 : 0  //FIXME: why integers here?
			);
		}

		return $return;
	}

	/**
	 * @param $params array(
	 * 		['category' => categoryName]
	 * )
	 */
	public static function getAllApplications($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$applications = $myApplicationsManager->getAllApplications();
		$categoryFilter = isset($params['category']) && is_string($params['category']) ? $params['category'] : null;

		$return = array();
		foreach ($applications as $appDesc) {
			$appMeta = $appDesc->getMeta();

			$systemParameters = $appMeta->get('eyeos.application.systemParameters');
			$currentApplicationGroup = 'eyeID_EyeosGroup_' . $systemParameters['group'];
			$currentUserGroup = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getPrimaryGroupId();

			// FIXME: must be improved, and better developed...
			if ($currentUserGroup == 'eyeID_EyeosGroup_users') {
				if ($currentUserGroup != $currentApplicationGroup) {
					continue;
				}
			}

			// Filter on category if requested
			if ($categoryFilter !== null && $appMeta->get('eyeos.application.category') != $categoryFilter) {
				continue;
			}

			$sysParams = $appMeta->get('eyeos.application.systemParameters');

			$imagePath = $appMeta->get('eyeos.application.iconUrl');
			$imageIsValid = true;
			try {
				$file = FSI::getFile($imagePath);
			} catch (Exception $e) {
				$imageIsValid = false;
			}
			if ($imageIsValid && !$file->isReadable()) {
				$imageIsValid = false;
			}
			if (!$imageIsValid) {
				$imagePath = 'sys:///extern/images/48x48/apps/preferences-desktop-default-applications.png';
			}
			$return[] = array(
				'name' => $appDesc->getName(),
				'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
				'app' => $appDesc->getName(),
				'shortDescription' => $appMeta->get('eyeos.application.description'),
				'image' => FSI::toExternalUrl($imagePath),
				'favorite' => $myApplicationsManager->isApplicationFavorite($appDesc) ? 1 : 0, //FIXME: why integers here?																				//FIXME
				'lists' => $appMeta->get('eyeos.application.category'),
				'listable' => $sysParams['listable'] == 'true' ? 1 : 0,
				'installed' => $myApplicationsManager->isApplicationInstalled($appDesc) ? 1 : 0  //FIXME: why integers here?
			);
		}
		return $return;
	}

	public static function searchApplication($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$applications = $myApplicationsManager->searchApplication($params);

		$return = array();
		foreach ($applications as $appDesc) {
			$appMeta = $appDesc->getMeta();
			$sysParams = $appMeta->get('eyeos.application.systemParameters');

			$imagePath = $appMeta->get('eyeos.application.iconUrl');
			$imageIsValid = true;
			try {
				$file = FSI::getFile($imagePath);
			} catch (Exception $e) {
				$imageIsValid = false;
			}
			if ($imageIsValid && !$file->isReadable()) {
				$imageIsValid = false;
			}
			if (!$imageIsValid) {
				$imagePath = 'sys:///extern/images/48x48/apps/preferences-desktop-default-applications.png';
			}

			$return[] = array(
				'name' => $appDesc->getName(),
				'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
				'app' => $appDesc->getName(),
				'shortDescription' => $appMeta->get('eyeos.application.description'),
				'image' => FSI::toExternalUrl($imagePath),
				'favorite' => $myApplicationsManager->isApplicationFavorite($appDesc) ? 1 : 0, //FIXME: why integers here?																				//FIXME
				'lists' => $appMeta->get('eyeos.application.category'),
				'listable' => $sysParams['listable'] == 'true' ? 1 : 0,
				'installed' => $myApplicationsManager->isApplicationInstalled($appDesc) ? 1 : 0  //FIXME: why integers here?
			);
		}
		return $return;
	}

	public static function getAllInstalledApplications($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$applications = $myApplicationsManager->getAllInstalledApplications($params);
		$return = array();
		foreach ($applications as $appDesc) {
			$appMeta = $appDesc->getMeta();
			$sysParams = $appMeta->get('eyeos.application.systemParameters');

			$imagePath = $appMeta->get('eyeos.application.iconUrl');
			$imageIsValid = true;
			try {
				$file = FSI::getFile($imagePath);
			} catch (Exception $e) {
				$imageIsValid = false;
			}
			if ($imageIsValid && !$file->isReadable()) {
				$imageIsValid = false;
			}
			if (!$imageIsValid) {
				$imagePath = 'sys:///extern/images/48x48/apps/preferences-desktop-default-applications.png';
			}

			$return[] = array(
				'name' => $appDesc->getName(),
				'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
				'app' => $appDesc->getName(),
				'shortDescription' => $appMeta->get('eyeos.application.description'),
				'image' => FSI::toExternalUrl($imagePath),
				'favorite' => $myApplicationsManager->isApplicationFavorite($appDesc) ? true : false, // FIXME!! - it should be 'true' or 'false'
				'lists' => $appMeta->get('eyeos.application.category'),
				'listable' => $sysParams['listable'] == 'true' ? 1 : 0,
				'installed' => $myApplicationsManager->isApplicationInstalled($appDesc) ? true : false // FIXME!! - it should be 'true' or 'false'
);
		}
		return $return;
	}

	public static function removeFavorite($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$myApplicationsManager->setFavoriteApplication(new EyeosApplicationDescriptor($params), false);
	}

	public static function addFavorite($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$myApplicationsManager->setFavoriteApplication(new EyeosApplicationDescriptor($params), true);
	}

	public static function removeInstalled($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$myApplicationsManager->setInstalledApplication(new EyeosApplicationDescriptor($params), false);
	}

	public static function addInstalled($params) {
		$myApplicationsManager = new EyeosApplicationsManager();
		$myApplicationsManager->setInstalledApplication(new EyeosApplicationDescriptor($params), true);
	}

	public static function getImg($path) {
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

	//function to see all new conversations in Mail, to use in a widget
	public static function getConversationsInInbox($params) {

		$results = array();
		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		require_once APPS_DIR . '/mail/MailAppController.php';
		$mailController = new MailAppController($currentUserId);

		$provider = new LabelManager();
		$inbox = $provider->getFoldersByName('INBOX', $currentUserId);

		$folders = array();
		if (count($inbox) > 1) {
			foreach ($inbox as $currentInbox) {
				$folders[] = $currentInbox->getId();
			}
			$tempResults = $mailController->getConversationsInFolder($folders, 1);
			if (count($tempResults) == 0) {
				return 'no mails';
			} else {
				$i = 0;
				foreach ($tempResults as $result) {
					$results[] = array(
						'id' => $result->getId(),
						'star' => $result->getStarred(),
						'date' => date("j.n.Y H:i", $result->getDate()),
						'from' => $result->getFrom(),
						'tags' => $result->getTags(),
						'tagsNames' => $result->getTagsNames(),
						'subject' => $result->getSubject(),
						'attachments' => $result->getAttachments(),
						'unread' => $result->getUnreadMessages(),
						'messages' => $result->getNumberOfMessages()
					);
					$i++;
					if ($i == 5) {
						break;
					}
				}
			}
		} else {
			return null;
		}

		return $results;
	}

	// function which read the openRecent file to load its entries...
	public static function readNotesWidget() {
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$fileName = USERS_PATH . '/' . $user->getName() . '/' . USERS_CONF_DIR . '/notesWidget';
		$fileHandle = fopen($fileName, 'a+');
		if (filesize($fileName)) {
			$fileContents = fread($fileHandle, filesize($fileName));
		} else {
			$fileContents = 'You can write your notes here';
		}
		fclose($fileHandle);
		return $fileContents;
	}

	// function which write the openRecent file to save its entries...
	public static function writeNotesWidget($stream) {
		$user = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
		$fileName = USERS_PATH . '/' . $user->getName() . '/' . USERS_CONF_DIR . '/notesWidget';
		$fileHandle = fopen($fileName, 'w+');
		fwrite($fileHandle, $stream);
		fclose($fileHandle);
	}

	public static function saveIconPosition($params) {
		$x = $params[0];
		$y = $params[1];
		$path = $params[2];
		$file = FSI::getFile($path);

		$meta = $file->getMeta();
		$meta->set('iconPositionX', $x);
		$meta->set('iconPositionY', $y);
		$file->setMeta($meta);
	}

	public function moveFile($params) {
		$path = $params[0];
		$newpath = $params[1];
		$file = FSI::getFile($path);

		$name = $file->getName();

		$file->moveTo(FSI::getFile($newpath));
	}

	public function copyFile($params) {
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

			$j = $i -1;
			
			$return[$j] = array(
				'class' => get_class($newFile),
				'type' => $newFile->isDirectory() ? 'folder' : ($newFile->isLink() ? 'link' : 'file'),
				'extension' => utf8_strtoupper($newFile->getExtension()),
				'size' => $newFile->isDirectory() ? 0 : $newFile->getSize(),
				'permissions' => $newFile->getPermissions(false),
				'owner' => $newFile->getOwner(),
				'group' => $newFile->getGroup(),
				'absolutepath' => $newFile->getAbsolutePath(),
				'meta' => $newFile->getMeta()->getAll()
			);

			if ($return[$j]['extension'] == 'LNK') {
				$return[$j]['content'] = $newFile->getContents();
			}
			$return[$j]['name'] = $newFile->getName() != '/' ? $newFile->getName() : $return[$j]['absolutepath'];

			if ($newFile instanceof EyeosAbstractVirtualFile) {
				$return[$j]['virtual'] = 'true';
			} else {
				$return[$j]['virtual'] = 'false';
			}
		
		}
		return $return;
	}

	public function moveFileToDesktop($params) {
		$i = 0;
		foreach ($params as $item) {
			$x = $item[0];
			$y = $item[1];
			$path = $item[2];
			$file = FSI::getFile($path);

			$name = $file->getName();

			$file->moveTo(FSI::getFile('home:///Desktop/'));

			$newfile = FSI::getFile('home:///Desktop/' . $name);
			$meta = $newfile->getMeta();
			$meta->set('iconPositionX', $x);
			$meta->set('iconPositionY', $y);
			$newfile->setMeta($meta);

			//TODO24 joca: we need something more than execmodules...somethings like internal modules
			$return[$i] = array(
				'class' => get_class($newfile),
				'type' => $newfile->isDirectory() ? 'folder' : ($newfile->isLink() ? 'link' : 'file'),
				'extension' => utf8_strtoupper($newfile->getExtension()),
				'size' => $newfile->isDirectory() ? 0 : $newfile->getSize(),
				'permissions' => $newfile->getPermissions(false),
				'owner' => $newfile->getOwner(),
				'group' => $newfile->getGroup(),
				'absolutepath' => $newfile->getAbsolutePath(),
				'meta' => $newfile->getMeta()->getAll()
			);

			if ($return[$i]['extension'] == 'LNK') {
				$return[$i]['content'] = $newfile->getContents();
			}
			$return[$i]['name'] = $newfile->getName() != '/' ? $newfile->getName() : $return[$i]['absolutepath'];

			if ($newfile instanceof EyeosAbstractVirtualFile) {
				$return[$i]['virtual'] = 'true';
			} else {
				$return[$i]['virtual'] = 'false';
			}
			$i++;
		}
		return $return;
	}

	public static function createLink($params) {
		$structure = array();
		$structure['app'] = $params[0];
		$structure['type'] = 'application';

		//we need to fill $structure['icon'] with the application icon!
		$app = new EyeosApplicationDescriptor(utf8_basename($params[0]));
		$icon = FSI::toExternalUrl($app->getMeta()->get('eyeos.application.iconUrl'));
		$structure['icon'] = str_replace('eyeos/extern/', 'index.php?extern=', $icon);
		$linkName = utf8_basename($params[0]);

		$info = pathinfo($linkName);
		if (!isset($info['extension']) || $info['extension'] != 'lnk') {
			$linkName .= '.lnk';
		}

		$path = 'home:///Desktop/';


		$text = json_encode($structure);

		$newFile = FSI::getFile($path . '/' . $linkName);
		$newFile->createNewFile();
		$newFile->putContents($text);

		$newfile = FSI::getFile($path . '/' . $linkName);
		$meta = $newfile->getMeta();
		$meta->set('iconPositionX', $params[1]);
		$meta->set('iconPositionY', $params[2]);
		$newfile->setMeta($meta);

		$return = array(
			'class' => get_class($newfile),
			'type' => $newfile->isDirectory() ? 'folder' : ($newfile->isLink() ? 'link' : 'file'),
			'extension' => utf8_strtoupper($newfile->getExtension()),
			'size' => $newfile->isDirectory() ? 0 : $newfile->getSize(),
			'permissions' => $newfile->getPermissions(false),
			'owner' => $newfile->getOwner(),
			'group' => $newfile->getGroup(),
			'absolutepath' => $newfile->getAbsolutePath(),
			'meta' => $newfile->getMeta()->getAll()
		);

		if ($return['extension'] == 'LNK') {
			$return['content'] = $newfile->getContents();
		}
		$return['name'] = $newfile->getName() != '/' ? $newfile->getName() : $return['absolutepath'];

		if ($newfile instanceof EyeosAbstractVirtualFile) {
			$return['virtual'] = 'true';
		} else {
			$return['virtual'] = 'false';
		}
		return $return;
	}

	public static function deleteFiles($params) {
		$params = array_unique($params);
		foreach ($params as $param) {
			$file = FSI::getFile($param);
			$file->delete();
		}
	}

	public static function createFolder($params) {
		$number = 1;
		$newfile = FSI::getFile($params[0]);
		while ($newfile->exists()) {
			$newfile = FSI::getFile($params[0] . $number);
			$number++;
		}

		$newfile->mkdir();

		$return = array(
			'class' => get_class($newfile),
			'type' => $newfile->isDirectory() ? 'folder' : ($newfile->isLink() ? 'link' : 'file'),
			'extension' => utf8_strtoupper($newfile->getExtension()),
			'size' => $newfile->isDirectory() ? 0 : $newfile->getSize(),
			'permissions' => $newfile->getPermissions(false),
			'owner' => $newfile->getOwner(),
			'group' => $newfile->getGroup(),
			'absolutepath' => $newfile->getAbsolutePath(),
			'meta' => $newfile->getMeta()->getAll()
		);

		if ($return['extension'] == 'LNK') {
			$return['content'] = $newfile->getContents();
		}
		$return['name'] = $newfile->getName() != '/' ? $newfile->getName() : $return['absolutepath'];

		if ($newfile instanceof EyeosAbstractVirtualFile) {
			$return['virtual'] = 'true';
		} else {
			$return['virtual'] = 'false';
		}

		return $return;
	}

	public static function createFile($params) {
		$number = 1;
		$newfile = FSI::getFile($params[0]);
		$info = pathinfo($params[0]);
		while ($newfile->exists()) {
			$newfile = FSI::getFile($info['dirname'] . '/' . $info['filename'] . ' ' . $number . '.' . $info['extension']);
			$number++;
		}

		if (strtoupper($info['extension']) == 'EDOC') {
			$rand = md5(uniqid(time()));
			mkdir('/tmp/' . $rand);
			$uniqid = uniqid();
			shell_exec('touch /tmp/' . $rand . '/document.html');
			file_put_contents('/tmp/' . $rand . '/duid', $uniqid);
			$myFile = FSI::getFile($params[0] . '_tmp');
			$myFile->checkWritePermission();
			$myRealFile = $myFile->getRealFile();
			$fileNameOriginal = AdvancedPathLib::getPhpLocalHackPath($myRealFile->getPath());
			//this is REALLY annoying to be forced to do this, but zip command line util is a mess
			$oldDir = getcwd();
			chdir('/tmp/' . $rand);
			$cmd = 'zip -r ' . escapeshellarg($fileNameOriginal) . ' ./';
			shell_exec($cmd);
			//we return into the normal directory...this is ugly
			chdir($oldDir);
			AdvancedPathLib::rmdirs('/tmp/' . $rand);
			// creating a fake file trought FSI, so we can have our nice xml :)
			$newfile->createNewFile(true);
			$newfile->putContents($myFile->getContents());
			unlink($fileNameOriginal); // FIXME!!!!!
		} else {
			$newfile->createNewFile();
		}

		$return = array(
			'class' => get_class($newfile),
			'type' => $newfile->isDirectory() ? 'folder' : ($newfile->isLink() ? 'link' : 'file'),
			'extension' => utf8_strtoupper($newfile->getExtension()),
			'size' => $newfile->isDirectory() ? 0 : $newfile->getSize(),
			'permissions' => $newfile->getPermissions(false),
			'owner' => $newfile->getOwner(),
			'group' => $newfile->getGroup(),
			'absolutepath' => $newfile->getAbsolutePath(),
			'meta' => $newfile->getMeta()->getAll()
		);

		if ($return['extension'] == 'LNK') {
			$return['content'] = $newfile->getContents();
		}
		$return['name'] = $newfile->getName() != '/' ? $newfile->getName() : $return['absolutepath'];

		if ($newfile instanceof EyeosAbstractVirtualFile) {
			$return['virtual'] = 'true';
		} else {
			$return['virtual'] = 'false';
		}

		return $return;
	}

	public static function renameFile($params) {
		$number = 1;
		$source = FSI::getFile($params[0]);
		$target = FSI::getFile($params[1]);
		if ($target->exists()) {
			return "duplicated";
		}
		$source->moveTo($target);
	}

}

?>