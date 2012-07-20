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
* */

/**
 * ShareUrl is a Framework that allow users to share a file trough an url.
 */

class UrlMailManager implements IUrlMailManager {
	private static $Instance = null;
	private static $Logger = null;
	private $provider = null;

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
		self::$Logger = Logger::getLogger('system.frameworks.UrlShare.UrlMailManager');
	}

	protected function getProvider() {
		if ($this->provider === null) {
			$this->provider = UrlMailSqlProvider::getInstance();
		}
		return $this->provider;
	}

	public function createMail(IUrlMail $mail) {
		try {
			$this->getProvider()->createMail($mail);
			self::$Logger->info('UrlMail Created');
			return $mail;
		} catch (Exception $e) {
			self::$Logger->error('Error while creating UrlMail');
			throw $e;
		}
	}
	public function updateMail(IUrlMail $mail) {
		try {
			$this->getProvider()->updateMail($mail);
			self::$Logger->info('UrlMail Updated');
			return $mail;
		} catch (Exception $e) {
			self::$Logger->error('Error while updating UrlMail');
			throw $e;
		}
	}
	public function deleteMail(IUrlMail $mail) {
		try {
			$this->getProvider()->deleteMail($mail);
			self::$Logger->info('UrlMail Deleted');
		} catch (Exception $e) {
			self::$Logger->error('Error while deleting UrlMail');
			throw $e;
		}
	}
	public function searchMail(IUrlMail $mail) {
		try {
			$returnMail = $this->getProvider()->searchMail($mail);
			self::$Logger->info('UrlMail searched');
			return $returnMail;
		} catch (Exception $e) {
			self::$Logger->error('Error while searching UrlMail');
			throw $e;
		}
	}
	public function readMail(IUrlMail $mail) {
		try {
			$this->getProvider()->readMail($mail);
			self::$Logger->info('UrlMail readed');
		} catch (Exception $e) {
			self::$Logger->error('Error while reading UrlMail');
			throw $e;
		}
	}
}
?>