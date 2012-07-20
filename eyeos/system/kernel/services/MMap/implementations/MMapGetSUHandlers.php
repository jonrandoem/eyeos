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
 * @subpackage MMap
 */
class MMapGetSUHandlers extends Kernel implements IMMap {
	private static $Logger = null;

	public static function getInstance() {
		self::$Logger = Logger::getLogger('system.services.MMap.MMapGetApp');
		return parent::getInstance(__CLASS__);
	}

	public function checkRequest(MMapRequest $request) {
		if ($request->issetGET('getSUHandler')) {
			return true;
		}
		return false;
	}

	public function processRequest(MMapRequest $request, MMapResponse $response) {
		$status = ob_get_status();
		$handlersPath = self::getSocialUpdaterHandlersPath();
		self::createResponseFromDir($handlersPath, $response);
	}

	/**
	 * Fill an MMap Response with all javascript file concerning SocialUpdaters
	 * Handlers
	 * @param <String> $dirPath
	 * @param <MMapResponse> $response
	 */
	private static function createResponseFromDir ($dirPath, &$response) {
		$response->getHeaders()->append('Content-type: text/javascript');
		$iterator = new DirectoryIterator($dirPath);
		$buffer = '';
		foreach ($iterator as $fileInfo) {
			if ($fileInfo->getFilename() == '.' || $fileInfo->getFilename() == '..' || $fileInfo->getFilename() == '.svn') {
				continue;
			}

			if ($fileInfo->isDir()) {
				self::createResponseFromDir($dirPath . $fileInfo->getFilename() . '/', $response);
			}

			if ( $fileInfo->isFile() && self::isJavascriptFile($fileInfo) ) {
				$buffer .= file_get_contents($fileInfo->getRealPath());
			}
		}
		$response->appendToBody($buffer);
	}

	/**
	 * Check Whetever a file is a javascript file
	 * (based on extension)
	 * @param <type> $fileInfo
	 * @return <type>
	 */
	private static function isJavascriptFile($fileInfo) {
		$path = $fileInfo->getRealPath();
		$details = pathinfo($path);
		$extension = $details['extension'];

		if ($extension == 'js') {
			return true;
		}
		return false;
	}

	/**
	 * Return the path of the correct handler.
	 * Priority:
	 *  1) Some custom handler
	 *	2) default handler
	 * @return string
	 */
	private static function getSocialUpdaterHandlersPath () {
		$handlersPath = EYE_ROOT . '/' . APPS_DIR . '/files/SocialBarUpdater/handlers/';
		$directory = new DirectoryIterator($handlersPath);
		foreach ($directory as $fileInfo) {
			if ($fileInfo->isDir()) {
				if ($fileInfo->getFilename() == '..' || $fileInfo->getFilename() == '.' || $fileInfo->getFilename() == '.svn') {
					continue;
				}

				if ($fileInfo->getFilename() == 'default') {
					$return = $handlersPath . 'default/';
				} else {
					return $handlersPath . $fileInfo->getFilename() . '/';
				}
			}
		}
		if ($return) {
			return $return;
		} else {
			throw new EyeFileNotFoundException('No default Handler present in ' . $directory);
		}

	}
}

?>