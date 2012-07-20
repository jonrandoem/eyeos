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

abstract class NewLinkApplication extends EyeosApplicationExecutable {
    public static function createLink($params) {
        $structure = array();
        $structure['url'] = $params[0];
        $structure['width'] = $params[1];
        $structure['height'] = $params[2];
        $structure['icon'] = str_replace('eyeos/extern/', 'index.php?extern=', $params[5]);

       $structure['openInNewWindow'] = $params[6];

       $structure['type'] = 'web';
        $linkName = utf8_basename($params[3]);

        $info = pathinfo($linkName);
        if(!isset($info['extension']) || $info['extension'] != 'lnk') {
            $linkName .= '.lnk';
        }
        
        $path = $params[4];


        $text = json_encode($structure);
		$linkName = str_replace('?','_', $linkName);
		$linkName = str_replace('#','_', $linkName);

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