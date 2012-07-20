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
class UrlShareExecModule implements IEyeosExecutableModule {
	public function checkExecutePermission() {
		SecurityManager::getInstance()->checkExecute($this);
	}

	public function createUrl($params) {
		$path = $params['path'];
		$searchFile= new UrlFile();
		$searchFile->setPath($path);
		$files = UrlShareController::getInstance()->searchFile($searchFile);

		if (!is_array($files) || count($files) == 0) {
			$newFile = UrlShareController::getInstance()->createFile($searchFile);
		} else {
			$newFile = current($files);
		}

		$url = new UrlShare();
		$url->setFileId($newFile->getId());
		$url = UrlShareController::getInstance()->createUrl($url);
		$url->setName(self::idToHash($url->getId()));
		$url->setPublicationDate(time());
		$url->setExpirationDate($url->getPublicationDate() + 60 * 60 * 24 * 31);

		$returnUrl = UrlShareController::getInstance()->updateUrl($url);
		return $returnUrl->getAttributesMap();
	}

	private function createNewUrlMessageText ($fileName, $urlString) {
		$mailText = URLSHARE_MAIL;
		$mailText = preg_replace('/%%FILENAME%%/', $fileName, $mailText);
		$mailText = preg_replace('/%%URL%%/', $urlString, $mailText);

		return $mailText;
	}
	
	private static function idToHash($id) {
        $charArray = array("A","B","C","E","G","I","K","M","O","S","U","V","W","X","Y","Z");
        $randomValue= rand();
        $binId = str_pad(decbin($id) , 32,'0',STR_PAD_LEFT);
        $binRandom = str_pad(decbin($randomValue) , 32,'0',STR_PAD_LEFT);
        $resultString ="";
        for($i=0;$i<16;$i++){
            $binStr = substr($binId,$i*2,2).substr($binRandom,$i*2,2);
            $intValue = bindec($binStr);
            $resultString .= $charArray[$intValue];
        }
        return $resultString;
	}

	public static function getUrlInfo($params) {
		$urlShareId = $params['urlId'];

		$urlShare = new UrlShare();
		$urlShare->setId($urlShareId);
		UrlShareController::getInstance()->readUrl($urlShare);
        if (basename($_SERVER['HTTP_REFERER'])=='index.php') {
            $urlShare->setName($_SERVER['HTTP_REFERER'].'?download=' . $urlShare->getName());
        } else {
            $urlShare->setName($_SERVER['HTTP_REFERER'].'index.php?download=' . $urlShare->getName());
        }
		return array(
			"urlInformation" => $urlShare->getAttributesMap(),
		);
	}

	public static function getShareURLSByFilePath($filePath) {
		$UrlShareController = UrlShareController::getInstance();
		$fileToSearch = new UrlFile();
		$fileToSearch->setPath($filePath);
		$urlFile = $UrlShareController->searchFile($fileToSearch);

		if ($urlFile === null || count($urlFile) < 1) {
			return null;
		}
		$urlFile = current($urlFile);
		$fileId = $urlFile->getId();

		$urlShareToSearch = new UrlShare();
		$urlShareToSearch->setFileId($fileId);
		$urlShares = $UrlShareController->searchUrl($urlShareToSearch);

		return self::toArray($urlShares);
	}

	public static function deleteURL($urlId) {
		$urlShare = new UrlShare();
		$urlShare->setId($urlId);
		UrlShareController::getInstance()->deleteUrl($urlShare);
	}

	public static function updateURL($params) {
		$urlId = $params['id'];
		$password = $params['password'];
		$expirationDate = $params['expirationDate'];

		$myProcManager = ProcManager::getInstance();
		$myUserId = $myProcManager->getCurrentProcess()->getLoginContext()->getEyeosUser()->getId();

		$UrlShareController = UrlShareController::getInstance();
		$urlShare = new UrlShare();
		$urlShare->setId($urlId);
		$UrlShareController->readUrl($urlShare);

		$urlShare->setPassword($password);
		$urlShare->setExpirationDate($expirationDate);

		$UrlShareController->updateURL($urlShare);

		$urlFile = new UrlFile();
		$urlFile->setId($urlShare->getFileId());
		$UrlShareController->readFile($urlFile);

		
		$fileName = basename($urlFile->getPath());

	}


	/**
	 * Performs a PHP variable => JSON-compatible array conversion with objects of class IWorkgroup,
	 * IUserWorkgroupAssignation, IUser, and arrays of the previous types.
	 *
	 * @param mixed $value
	 * @return array
	 */
	private static function toArray($value) {
		if (!isset($value)) {
			return null;
		}
		if ($value instanceof IMetaData) {
			return $value->getAll();
		}
		if ($value instanceof ISimpleMapObject) {
			return $value->getAttributesMap();
		}
		if (!is_array($value)) {
			throw new EyeInvalidArgumentException('$value must be implement an ISimpleMapObject');
		}

		foreach($value as &$v) {
			$v = self::toArray($v);
		}
		return $value;
	}
}

?>
