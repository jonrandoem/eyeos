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
class UrlShareController implements ISingleton {
	private static $Instance = null;
	private static $Logger = null;
	private $urlShareManager = null;
	private $urlFileManager = null;
	private $urlMailManager = null;
	private $urlMailSentManager = null;

	protected function __construct() {}

	public static function getInstance() {
		if (self::$Instance === null) {
			$thisClass = __CLASS__;
			self::$Instance = new $thisClass;
			self::init();
		}
		return self::$Instance;
	}

	protected static function init() {
		self::$Logger = Logger::getLogger('system.frameworks.UrlShare.UrlShareController');
	}

	protected function getUrlShareManager() {
		if ($this->urlShareManager === null) {
			$this->urlShareManager = UrlShareManager::getInstance();
		}
		return $this->urlShareManager;
	}

	protected function getUrlFileManager() {
		if ($this->urlFileManager === null) {
			$this->urlFileManager = UrlFileManager::getInstance();
		}
		return $this->urlFileManager;
	}

	protected function getUrlMailManager() {
		if ($this->urlMailManager === null) {
			$this->urlMailManager = UrlMailManager::getInstance();
		}
		return $this->urlMailManager;
	}
	
	protected function getUrlMailSentManager() {
		if ($this->urlMailSentManager === null) {
			$this->urlMailSentManager = urlMailSentManager::getInstance();
		}
		return $this->urlMailSentManager;
	}

	public function createUrl(IUrlShare $url) {
		return $this->getUrlShareManager()->createUrl($url);
	}
	public function updateUrl(IUrlShare $url) {
		return $this->getUrlShareManager()->updateUrl($url);
	}
	public function deleteUrl(IUrlShare $url) {
		$this->getUrlShareManager()->deleteUrl($url);
	}
	public function searchUrl(IUrlShare $url) {
		return $this->getUrlShareManager()->searchUrl($url);
	}
	public function readUrl(IUrlShare $url) {
		$this->getUrlShareManager()->readUrl($url);
	}

	public function createFile(IUrlFile $file) {
		return $this->getUrlFileManager()->createFile($file);
	}
	public function updateFile(IUrlFile $file) {
		return $this->getUrlFileManager()->updateFile($file);
	}
	public function deleteFile(IUrlFile $file) {
		$this->getUrlFileManager()->deleteFile($file);
	}
	public function readFile(IUrlFile $file) {
		return $this->getUrlFileManager()->readFile($file);
	}
	
	public function searchFile(IUrlFile $file) {
		return $this->getUrlFileManager()->searchFile($file);
	}

	public function createMail(IUrlMail $mail) {
		return $this->getUrlMailManager()->createMail($mail);
	}
	public function updateMail(IUrlMail $mail) {
		return $this->getUrlMailManager()->updateMail($mail);
	}
	public function deleteMail(IUrlMail $mail) {
		$this->getUrlMailManager()->deleteMail($mail);
	}
	public function searchMail(IUrlMail $mail) {
		return $this->getUrlMailManager()->searchMail($mail);
	}
	public function readMail(IUrlMail $mail) {
		return $this->getUrlMailManager()->readMail($mail);
	}
	
	public function createMailSent(IUrlMailSent $mailSent) {
		return $this->getUrlMailSentManager()->createMailSent($mailSent);
	}
	public function updateMailSent(IUrlMailSent $mailSent) {
		return $this->getUrlMailSentManager()->updateMailSent($mailSent);
	}
	public function deleteMailSent(IUrlMailSent $mailSent) {
		$this->getUrlMailSentManager()->deleteMailSent($mailSent);
	}
	public function searchMailSent(IUrlMailSent $mailSent) {
		return $this->getUrlMailSentManager()->searchMailSent($mailSent);
	}
}
?>
