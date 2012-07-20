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

abstract class ToptabsApplication extends EyeosApplicationExecutable {

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

    public static function createLink($params) {
        $structure = array();
        $structure['app'] = $params[0];
        $structure['icon'] = str_replace('eyeos/extern/', 'index.php?extern=', $params[1]);
        $structure['type'] = 'application';
        $linkName = utf8_basename($params[2]);

        $info = pathinfo($linkName);
        if (!isset($info['extension']) || $info['extension'] != 'lnk') {
            $linkName .= '.lnk';
        }

        $path = $params[3];


        $text = json_encode($structure);

        $newFile = FSI::getFile($path . '/' . $linkName);
        $newFile->createNewFile();
        $newFile->putContents($text);
        $currentUser = ProcManager::getInstance()->getCurrentProcess()->getLoginContext()->getEyeosUser();
        $settings = MetaManager::getInstance()->retrieveMeta($currentUser);
        //TODO: better message?
        $message = new ClientBusMessage('file', 'uploadComplete', self::getFileInfo($newFile, $settings));
        ClientMessageBusController::getInstance()->queueMessage($message);
    }


    public static function getFileInfo($currentFile, $settings) {
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
            $rating = 0;
            $fileTags = null;
            if ($meta->exists('creationTime')) {
                $created = $meta->get('creationTime');
                $created = date('j/n/Y', $created);
            } else {
                $created = 0;
            }

            if ($meta->exists('modificationTime')) {
                $modified = $meta->get('modificationTime');
                $modified = date('j/n/Y', $modified);
            } else {
                $modified = 0;
            }
        }

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
}

?>