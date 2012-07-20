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

class mailaccounts {
    private $accountid;
    private $userid;
    private $imap_server;
    private $imap_user;
    private $imap_password;
    private $smtp_server;
    private $smtp_user;
    private $smtp_password;
	private $name;
	private $email;
	private $description;
	
	public function getName() {
	 return $this->name;
	}

	public function setName($name) {
	 $this->name = $name;
	}

	public function getEmail() {
	 return $this->email;
	}

	public function setEmail($email) {
	 $this->email = $email;
	}

	public function getDescription() {
	 return $this->description;
	}

	public function setDescription($description) {
	 $this->description = $description;
	}

	public function getAccountid() {
        return $this->accountid;
    }

    public function setAccountid($accountid) {
        $this->accountid = $accountid;
    }

    public function getUserid() {
        return $this->userid;
    }

    public function setUserid($userid) {
        $this->userid = $userid;
    }

    public function getImap_server() {
        return $this->imap_server;
    }

    public function setImap_server($imap_server) {
        $this->imap_server = $imap_server;
    }

    public function getImap_user() {
        return $this->imap_user;
    }

    public function setImap_user($imap_user) {
        $this->imap_user = $imap_user;
    }

    public function getImap_password() {
        return $this->imap_password;
    }

    public function setImap_password($imap_password) {
        $this->imap_password = $imap_password;
    }

    public function getSmtp_server() {
        return $this->smtp_server;
    }

    public function setSmtp_server($smtp_server) {
        $this->smtp_server = $smtp_server;
    }

    public function getSmtp_user() {
        return $this->smtp_user;
    }

    public function setSmtp_user($smtp_user) {
        $this->smtp_user = $smtp_user;
    }

    public function getSmtp_password() {
        return $this->smtp_password;
    }

    public function setSmtp_password($smtp_password) {
        $this->smtp_password = $smtp_password;
    }
}

?>
