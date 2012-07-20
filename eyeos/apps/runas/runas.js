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
 * @param int checknum
 * @param int pid
 * @param string user
 * @param Array args [appName, title, message, username]
 */
function runas_application(checknum, pid, args) {
	var myApp = new eyeos.application.RunAs(checknum, pid, args);
	myApp.openDialog();
}

qx.Class.define('eyeos.application.RunAs', {
	extend: eyeos.system.EyeApplication,
	
	construct: function (checknum, pid, args) {
		arguments.callee.base.call(this, 'runas', checknum, pid);
		if (args && args[0]) {
			this._appNameToRun = args[0];
		}
		if (args && args[1]) {
			this._title = args[1];
		} else {
			if (this._appNameToRun) {
				this._title = 'Run "' + this._appNameToRun + '" As...';
			} else {
				this._title = tr('Run An Application As...');
			}
		}
		if (args && args[2] && args[2] != '') {
			this._message = args[2];
		} else {
			this._message = tr('Select an application in the list then enter the login and password to use for its execution.');
		}
		if (args && args[3] && args[3] != '') {
			this._username = args[3];
		} else {
			this._username = '';
		}
	},
	
	members: {
	
		_appNameToRun: null,
		_appsComboBox: null,
		_dialog: null,
		_loginTextField: null,
		_message: null,	
		_passwordTextField: null,
		_title: null,
		_username: null,
		
		
		_loginAndRun: function() {
			var params = new Array(this._loginTextField.getValue(), this._passwordTextField.getValue());
			eyeos.callMessage(this._checknum, 'login', params, this._loginAndRun_callback, this);
		},
		
		_loginAndRun_callback: function(data) {
			if (!data) {
				var effect = new qx.fx.effect.combination.Shake(this._dialog.getContainerElement().getDomElement());
				effect.start();
				return;
			}
			eyeos.execute(this._appsComboBox.getValue(), this._checknum, null, this.close, this);
		},
		
		_loadAppList: function() {
			eyeos.callMessage(this._checknum, 'getApplicationsList', null, this._loadAppList_callback, this);
		},
		
		_loadAppList_callback: function(data) {
			for(var i = 0; i < data.length; i++) {
				this._appsComboBox.add(new qx.ui.form.ListItem(data[i]));
			}
			if (this._appNameToRun) {
				this._appsComboBox.setValue(this._appNameToRun);
			} else {
				this._appsComboBox.setEnabled(true);
			}
		},
		
		close: function () {
			if (this._dialog != null) {
				this._dialog.close();
			}
			this.base(arguments);
		},
		
		openDialog: function(title, message) {
			this._dialog = new eyeos.dialogs.Dialog(this._title).set({
				internalIcon: 'index.php?extern=images/48x48/status/dialog-password.png',
				height: 220,
				resizable: false,
				allowMinimize: false,
				allowMaximize: false
			});
			
			var mainContainer = this._dialog.getMainContainer();

			//
			// MESSAGE + APPLICATIONS LIST + LOGIN/PASSWORD FIELDS (right)
			//
			var eastContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10)).set({
				padding: 10
			});
			eastContainer.getLayout().setColumnFlex(1, 1);
			var messageLabel = new qx.ui.basic.Label(this._message).set({
				paddingTop: 10,
				rich: true
			});
			eastContainer.add(messageLabel, {column: 0, row: 0, colSpan: 2});
			
			//applications list combobox
			var appLabel = new qx.ui.basic.Label(tr('Application: '));
			eastContainer.add(appLabel, {column: 0, row: 2});
			this._appsComboBox = new qx.ui.form.ComboBox().set({
				enabled: false
			});
			eastContainer.add(this._appsComboBox, {column: 1, row: 2});
			
			eastContainer.add(new qx.ui.menu.Separator(), {column: 0, row: 3, colSpan: 2});
			
			//login textfield
			var loginLabel = new qx.ui.basic.Label(tr('Login:'));
			eastContainer.add(loginLabel, {column: 0, row: 4});
			this._loginTextField = new qx.ui.form.TextField().set({
				value: this._username,
				enabled: !(this._username && this._username != '')
			});
			this._loginTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._loginAndRun();
				}
			}, this);
			eastContainer.add(this._loginTextField, {column: 1, row: 4});
			
			//password textfield
			var passwordLabel = new qx.ui.basic.Label(tr('Password:'));
			eastContainer.add(passwordLabel, {column: 0, row: 5});
			this._passwordTextField = new qx.ui.form.PasswordField();
			this._passwordTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._loginAndRun();
				}
			}, this);
			eastContainer.add(this._passwordTextField, {column: 1, row: 5});
			
			
			mainContainer.add(eastContainer, {edge: 'east', flex: 1});
			
			//
			// ACTION BUTTONS (bottom)
			//
			var southContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5)).set({
				padding: 4
			});
			southContainer.getLayout().setColumnFlex(0, 1);
			var okButton = new qx.ui.form.Button(tr('Ok')).set({
				minWidth: 60
			});
			okButton.addListener('execute', this._loginAndRun, this);
			southContainer.add(okButton, {column: 1, row: 0});
			var cancelButton = new qx.ui.form.Button(tr('Cancel')).set({
				minWidth: 60
			});
			cancelButton.addListener('execute', this.close, this);
			southContainer.add(cancelButton, {column: 2, row: 0});
					
			mainContainer.add(southContainer, {edge: 'south'});
			
			this._loadAppList();
			
			this._dialog.open();
		}
	}
});