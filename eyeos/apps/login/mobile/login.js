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

function login_application(checknum, pid, args) {
//	try {
//		eyeosmobile.cleanSession();
//	} catch (e) {
//		eyeosmobile.consoleWarn(e);
//	}
//	
	// Restoring a session (refresh): reassign values to the eyeos global object
	if (args && args[0]) {
		eyeosmobile.setCurrentUserData(args[0].username);
	//...
	}
	var applicationName = 'Login';
	var loginApp = new eyeosMobileApplication(applicationName, checknum, pid, {
		theme: "b",
		backButtonEnabled: false
	});
	loginApp.createPage();
	createLoginFieldset();
	addEvents();
	switchPage();
	
	/**
	 *	Add events to submit and cancel Buttons:
	 *	
	 *	1) Login Button
	 *	2) Key event with button "Enter" only if login button is enabled (if not we are already
	 *	tryng to login)
	 *	3) Clear Button
	 */
	function addEvents() {
		$('#login_submit').click(function () {
			sendForm();
		});
		$('#login_password, #login_user').keypress(function (e) {
			if(e.keyCode == 13 && $('#login_submit').attr('disabled') == false) {
				sendForm();
			}
		});
		
		//Clear fields
		$('#login_clear').click(function () {
			$('#login_user').val('');
			$('#login_password').val('');
		});
	}

	

	/**
	 * Change Page to login.
	 * It should be invoked when all elements we want to show are loaded on the dom
	 */
	function switchPage () {
		var pageId = loginApp.getPageId();
		$.mobile.changePage('#' + pageId, 'fade', false, true);
	}

	/**
	 * Create Login Form and append to body
	 */
	function createLoginFieldset() {
		var fieldset = $('<fieldset id="login_fieldset">\n\
						<center>\n\
							<img src="index.php?extern=images/eyeos_login.png" alt="" id="login_image" /><br />\n\
							\n\
							<label for="login_user">User:</label>\n\
							<input type="user" name="user" id="login_user" value="" placeholder="user" />\n\
							\n\
							 <label for="login_password">Password:</label>\n\
							 <input type="password" name="password" id="login_password" value="" placeholder="password"/><br />\n\
							 \n\
							<input id="login_submit" type="button" value="Login" data-role="button" data-inline="true"/>\n\
							<input id="login_clear" type="button" value="Clear" data-role="button" data-inline="true"/>\n\
						</center>\n\
					</fieldset>\n\
				 ');

		loginApp.getContent().append(fieldset);
	}

	/**
	 * Send username and password to login function.
	 * Everytime we send a form, we temporaly disable submit/clear buttons
	 */
	function sendForm() {
		disableButtons();
		var username = $('#login_user').val();
		var password = $('#login_password').val();
		var options = {
			onException: function(data) {
				eyeosmobile.openErrorDialog('Incorrect Login');
				enableButtons();
			},
			hideException: true
		};
		eyeosmobile.callMessage(loginApp.getChecknum(), 'login', [username, password], function (result) {
			eyeosmobile.execute('session', loginApp.getChecknum());
		}, this, options);
	}

	/**
	 * Enable submit/clear Buttons
	 */
	function enableButtons() {
		$('#login_submit').attr('disabled', false);
		$('#login_clear').attr('disabled', false);
	}

	/**
	 * Disable submit/clear Buttons
	 */
	function disableButtons() {
		$('#login_submit').attr('disabled', true);
		$('#login_clear').attr('disabled', true);
	}
}