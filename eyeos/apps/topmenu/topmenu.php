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

abstract class TopmenuApplication extends EyeosApplicationExecutable {

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

        //get the applications
        $myApplicationsManager = new EyeosApplicationsManager();
        $applications = $myApplicationsManager->getAllApplications();

        $return = array();
        foreach ($applications as $appDesc) {
            $appMeta = $appDesc->getMeta();

            $systemParameters = $appMeta->get('eyeos.application.systemParameters');
            $currentApplicationGroup = 'eyeID_EyeosGroup_' . $systemParameters['group'];
            $currentUserGroup = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser()->getPrimaryGroupId();

            if( ($currentUserGroup == 'eyeID_EyeosGroup_users' && $currentApplicationGroup == 'eyeID_EyeosGroup_users') ||
                   $currentUserGroup != 'eyeID_EyeosGroup_users') {
                $sysParams = $appMeta->get('eyeos.application.systemParameters');

                $imagePath = $appMeta->get('eyeos.application.iconUrl');
                $imageIsValid = true;
                $imagePath = str_replace('48x48', '22x22', $imagePath);
                $imagePath = str_replace('64x64', '22x22', $imagePath);
                try {
                    $file = FSI::getFile($imagePath);
                } catch (Exception $e) {
                    $imageIsValid = false;
                }
                if ($imageIsValid && !$file->isReadable()) {
                    $imageIsValid = false;
                }
                if (!$imageIsValid) {
                    $imagePath = 'sys:///extern/images/22x22/apps/preferences-desktop-default-applications.png';
                }
                $return[] = array(
                    'name' => $appDesc->getName(),
                    'displayName' => $appMeta->get('eyeos.application.name') !== null ? $appMeta->get('eyeos.application.name') : $appDesc->getName(),
                    'app' => $appDesc->getName(),
                    'shortDescription' => $appMeta->get('eyeos.application.description'),
                    'image' => FSI::toExternalUrl($imagePath),
                    'favorite' => $myApplicationsManager->isApplicationFavorite($appDesc) ? 1 : 0,
                    'lists' => $appMeta->get('eyeos.application.category'),
                    'listable' => $sysParams['listable'] == 'true' ? 1 : 0,
                );
             }
        }
        $context->getArgs()->offsetSet(1, $return);
    }

	public static function searchPeople($params) {

		//Buscar en Provider con consulta rollo LIKE etc...
		$peopleController = PeopleController::getInstance();
		$resultsSearch = $peopleController->searchContacts($params);

		$myProcManager = ProcManager::getInstance();
		$currentUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();
		//$peopleController = new PeopleController();

		$results = Array();
		foreach($resultsSearch as $result) {
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

}

?>