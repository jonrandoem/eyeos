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

require_once APPS_DIR . '/rmail/Providers/sqlMailAccount.php';
require_once APPS_DIR . '/rmail/TransferObjects/mailaccounts.php';

abstract class RmailApplication extends EyeosApplicationExecutable {
	public static function close($params) {
		setcookie('roundcube_sessid', 'invalid', 0, '/');
		EyeosApplicationExecutable::close($params);
	}

    public static function checkForAccount() {
        $provider = new sqlMailAccount();
        $accounts = $provider->getAccounts();

        if(!$accounts) {
            return 'firstTime';
        } else {
            return 'accountexist'; //TODO: a better way to select the 'default identity'
        }
    }

    public static function createAccount($params) {
	    $provider = new sqlMailAccount();
	    if($params[8] == 'Yes') {
		    $params[6] = 'ssl://'.$params[6];
	    }

	    if($params[14] == 'Yes') {
		    $params[12] = 'ssl://'.$params[12];
	    }
	    $accounts = $provider->createAccount($params[6], $params[4], $params[5], $params[12], $params[10], $params[11], $params[1], $params[0], $params[2]);
    }

    public static function getHTMLforLogin() {
	    $provider = new sqlMailAccount();
		$accounts = $provider->getAccounts();
	    $account = $accounts[0];
	    $html = '<html>
	    <head>
		<script src="./eyeos/extern/js/php.full.namespaced.min.js"></script>
		<script src="./eyeos/extern/js/security.js"></script>
	    <script>
	    function send() {
			var phpjs = new PHP_JS();
//			document.getElementById("_pass").value = decrypt(phpjs.base64_decode(document.getElementById("_pass").value), window.parent.document.secretkey);
//			document.getElementById("smtp_pass").value = decrypt(phpjs.base64_decode(document.getElementById("smtp_pass").value), window.parent.document.secretkey);
			document.getElementById("formul").submit();
	    }
	    </script>
	    </head>
	    <body onload="send();">
		    <div style="margin-top:200px;">
			<center><img src="index.php?extern=images/loading.gif" /><p>Loading Mail...</center>
		    </div>
		    <form action="eyeos/apps/rmail/webmail/index.php" method="post" id="formul" >
			    <input type="hidden" name="_timezone" value="_default_" />
			    <input type="hidden" name="_url" />
			    <input type="hidden" name="_action" value="login" />
			    <input type="hidden" name="_token" value="faketoken" />
			    <input type="hidden" name="_user" value="'.$account->getImap_user().'" />
			    <input type="hidden" id="_pass" name="_pass" value="'.$account->getImap_password().'" />
			    <input type="hidden" name="_host" value="'.$account->getImap_server().'" />
			    <input type="hidden" name="smtp_user" value="'.$account->getSmtp_user().'" />
			    <input type="hidden" id="smtp_pass" name="smtp_pass" value="'.$account->getSmtp_password().'" />
			    <input type="hidden" name="smtp_host" value="'.$account->getSmtp_server().'" />
		    </form>
	    </body>
</html>';
	    echo $html;
	    exit;
    }
}

?>