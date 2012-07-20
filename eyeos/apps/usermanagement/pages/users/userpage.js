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

qx.Class.define('eyeos.application.usermanagement.userpage', {
	extend: qx.ui.tabview.Page,

	statics: {
		NEWUSERMAILSUBJECT: tr('Your new eyeOS account was created'),
		NEWUSERMAILBODY: tr('Welcome,\n A new eyeOS account was created for you on %s\nThis is your information to log on:\n Username: %s\nPassword: %s\n URL: %s\nPlease do not forget to change your password the first time you login.\n\n Sincerely,\n%s')
	},
	
	properties: {
		
	},
	
	construct: function (label, icon, checknum) {
		this.base(arguments, label);
		this._checknum = checknum;

		this._buildGui();
		this._addMyListeners();
	},
	
	members: {
		_checknum: null,		//checknum of application
		_action: '',			// Action: view, new

		// CONTANCT INFO
		_imagePath: null,		// Path of the image
		_usernameInput: null,	// Username
		_infoLabel: null,			// Id of the user
		_firstNameInput: null,	// Name of the user
		_lastNameInput: null,	// Last name of the user
		_passwordInput: null,	// password
		_passwordChangingResultLabel: null,
		_profileInput: null,
		_emailInput: null,		// email of the user
		_passwordBox: null,
		_profileBox: null,

		_userList: null,		//Gui element
		_firstColumn: null,		//Gui element
		_image: null,			//Gui element
		_secondLineBox: null,	//Gui element
		_saveButton: null,		//Gui element

		_addMyListeners: function () {
			this._userList.addListener('userSelect', function (e) {
				var userId = e.getData();
				this._showUser(userId);
			}, this);
		},

		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				allowGrowY: true
			});

			//
			//	First Column
			//
			this._firstColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox()
			});
			this.add(this._firstColumn);

			this._userList = new eyeos.application.usermanagement.userList(this._checknum);
			this._firstColumn.add(this._userList, {flex: 1});

			this._createUserCommandButtonBox();

			//
			//	Main Content
			//
			this._createMainContent();
			this._refreshGui('');
		},

		_createMainContent: function () {
			this._mainContent = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginLeft: 20
			});
			this.add(this._mainContent, {flex: 1});

			//
			//	First Line
			//
			var firstLineBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				backgroundColor: '#D0D0D0',
				height: 38,
				allowGrowY: false,
				padding: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#D0D0D0', 1, 5, 5, 5, 5)
			});
			this._mainContent.add(firstLineBox);

			this._infoLabel = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			firstLineBox.add(this._infoLabel);

			firstLineBox.add(new qx.ui.core.Spacer(), {flex: 1});
			//
			//	Second Line
			//
			this._secondLineBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				backgroundColor: '#D0D0D0',
				padding: 5,
				marginTop: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#D0D0D0', 1, 5, 5, 5, 5)
			});
			this._mainContent.add(this._secondLineBox, {flex: 1});

			this._createImageBox();

			this._createUserInfoBox();

			
		},

		_createImageBox: function () {
			var imageBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				decorator: null,
				width: 80,
				height: 120,
				allowGrowX: false,
				allowGrowY: false
			});
			this._secondLineBox.add(imageBox);

			this._image = new qx.ui.basic.Image().set({
				width: 70,
				height: 70,
				allowGrowX: false,
				allowGrowY: false,
				scale: true,
				decorator: new qx.ui.decoration.Single(1, 'solid', 'black')
			});
			imageBox.add(this._image);

			this.addListener('imageFromFile', function(e) {
				var imagePath = e.getData();
				if (imagePath != null || imagePath != '') {
					var newSource = 'index.php?checknum=' + this._checknum + '&message=__FileSystem_readFile&params[path]=' + imagePath;
					this._image.setSource(newSource);
					this._imagePath = imagePath;
				}
			});
		},

		_createUserInfoBox: function () {
			//
			//	Username
			//
			var userNameBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null,
				marginBottom: 4
			});
			this._secondLineBox.add(userNameBox);

			var usernameLabel = new qx.ui.basic.Label(tr('Username')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			userNameBox.add(usernameLabel, {width: '20%'});
			this._usernameInput = new qx.ui.form.TextField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				enabled: false
			});
			this._usernameInput.addListener('keypress', function () {
				this._saveButton.setEnabled(true);
			}, this);
			userNameBox.add(this._usernameInput, {width: '40%'});

			//
			//	Name
			//
			var nameBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null,
				marginBottom: 4
			});
			this._secondLineBox.add(nameBox);

			var nameLabel = new qx.ui.basic.Label(tr('First Name')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			nameBox.add(nameLabel, {width: '20%'});
			this._firstNameInput = new qx.ui.form.TextField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._firstNameInput.addListener('keypress', function () {
				this._saveButton.setEnabled(true);
			}, this);
			nameBox.add(this._firstNameInput, {width: '40%'});

			//
			//	Last Name
			//
			var lastNameBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null,
				marginBottom: 4
			});
			this._secondLineBox.add(lastNameBox);

			var lastNameLabel = new qx.ui.basic.Label(tr('Last Name')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			lastNameBox.add(lastNameLabel, {width: '20%'});
			this._lastNameInput = new qx.ui.form.TextField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._lastNameInput.addListener('keypress', function () {
				this._saveButton.setEnabled(true);
			}, this);
			lastNameBox.add(this._lastNameInput, {width: '40%'});

			//
			//	email
			//
			var emailBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null,
				marginBottom: 4
			});
			this._secondLineBox.add(emailBox);

			var emailLabel = new qx.ui.basic.Label(tr('Email')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			emailBox.add(emailLabel, {width: '20%'});
			this._emailInput = new qx.ui.form.TextField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._emailInput.addListener('keypress', function () {
				this._saveButton.setEnabled(true);
			}, this);
			emailBox.add(this._emailInput, {width: '40%'});

			//
			//	Password
			//
			this._passwordBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null,
				marginBottom: 4
			});
			this._secondLineBox.add(this._passwordBox);

			var passwordLabel = new qx.ui.basic.Label(tr('Password')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._passwordBox.add(passwordLabel, {width: '20%'});
			this._passwordInput = new qx.ui.form.PasswordField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._passwordInput.addListener('keypress', function () {
				this._saveButton.setEnabled(true);
			}, this);
			this._passwordBox.add(this._passwordInput, {width: '40%'});

			this._passwordButton = new qx.ui.form.Button(tr('change the password!')).set({
				visibility: 'excluded'
			});
			this._passwordBox.add(new qx.ui.core.Spacer(10));
			this._passwordBox.add(this._passwordButton);
			this._passwordChangingResultLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				visibility: 'excluded'
			}, this);
			this._passwordBox.add(new qx.ui.core.Spacer(10));
			this._passwordBox.add(this._passwordChangingResultLabel);
			this._passwordButton.addListener('click', function() {
				if(this._passwordInput.getValue() != null) {
					var password = this._passwordInput.getValue();
					var userId = this._userList.getSelectedUser().id;
					if((password != null) && (password != '')) {
						eyeos.callMessage(this._checknum, 'changePassword', [userId, password], function (results) {
							if(results == true) {
								this._passwordChangingResultLabel.setTextColor('green');
								this._passwordChangingResultLabel.setValue(tr('Done!!'));
								this._passwordChangingResultLabel.setVisibility('visible');
							} else {
								this._passwordChangingResultLabel.setTextColor('red');
								this._passwordChangingResultLabel.setValue(tr('Error!!'));
								this._passwordChangingResultLabel.setVisibility('visible');
							}
						}, this);
					} else {
						var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field password, you should provide a valid password, which could not be empty.'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
						op.createDialog(null, tr('Empty password')).open();
					}
				}
			}, this);

			this._passwordCheckBox = new qx.ui.form.CheckBox(tr('auto-generate the password.')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				visibility: 'excluded',
				value: false
			});
			this._passwordBox.add(this._passwordCheckBox);
			this._passwordCheckBox.addListener('changeValue', function() {
				if(this._passwordCheckBox.getValue()) {
					this._passwordInput.setEnabled(false);
				} else {
					this._passwordInput.setEnabled(true);
				}
			}, this);

			//
			//	Profile
			//
			this._profileBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null,
				marginBottom: 4,
				visibility: 'excluded'
			});
			this._secondLineBox.add(this._profileBox);

			var profileLabel = new qx.ui.basic.Label(tr('Profile')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._profileBox.add(profileLabel, {width: '20%'});
			this._profileInput = new qx.ui.form.SelectBox().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif'])
			});
			this._profileInput.addListener('appear', function() {
				eyeos.callMessage(this._checknum, 'getProfiles', null, function (results) {
					for(var i = 0; i < results.length; ++i) {
						var item = new qx.ui.form.ListItem(results[i]);
						this._profileInput.add(item);
					}
				}, this);
			}, this);
			this._profileInput.addListener('changeValue', function () {
				this._saveButton.setEnabled(true);
			}, this);
			this._profileBox.add(this._profileInput, {width: '40%'});

            this._secondLineBox.add(new qx.ui.core.Spacer(), {flex: 1});

            var saveButtonBox = new qx.ui.container.Composite().set({
                decorator: null,
                layout: new qx.ui.layout.HBox()
            });
            this._secondLineBox.add(saveButtonBox);

            saveButtonBox.add(new qx.ui.core.Spacer(), {flex: 1});
            
            this._saveButton = new qx.ui.form.Button(tr('Save')).set({
				enabled: false,
                width: 130
			});
			this._saveButton.addListener('execute', function () {
				this._save();
			}, this);
			saveButtonBox.add(this._saveButton);

			
		},
		_createUserCommandButtonBox: function () {
			var buttonBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());

			var createUserButton = new qx.ui.form.Button(tr('Create'), 'index.php?extern=images/16x16/actions/list-add.png');
			createUserButton.addListener('execute', function() {
				this._setNewMode();
			}, this);
			buttonBox.add(createUserButton);

			buttonBox.add(new qx.ui.core.Spacer(), {
				flex: 1
			});

			var deleteUserButton = new qx.ui.form.Button(tr('Delete'), 'index.php?extern=images/16x16/actions/edit-delete.png');
			buttonBox.add(deleteUserButton);

			deleteUserButton.addListener('execute', function () {
				var selectedUser = this._userList.getSelectedUser();
				if (selectedUser != null) {
					var op = new eyeos.dialogs.OptionPane(
						tr('Are you sure you want to delete this user?'),
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
					op.createDialog(null, tr('Are you sure you want to delete this user?'), function (answer) {
						if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
							eyeos.callMessage(this._checknum, 'deleteUser', selectedUser['id'], function() {
								this._refreshGui(tr('User deleted'));
							}, this);
						}
					}, this, true).open();
				}
			}, this);

			this._firstColumn.add(buttonBox);
		},

		/**
		 * Refresh all the element of the Gui
		 */
		_refreshGui: function (message) {
			this._userList.updateUserList();
			this._action = '';
			
			this._infoLabel.setValue(message);
			this._image.setSource('');
			this._usernameInput.set({
				value: '',
				enabled: false
			});
			this._firstNameInput.set({
				value: '',
				enabled: false
			});
			this._lastNameInput.set({
				value: '',
				enabled: false
			});
			this._emailInput.set({
				value: '',
				enabled: false
			});
			this._passwordInput.set({
				value: '',
				enabled: false
			});

			this._saveButton.setEnabled(false);
		},

		/**
		 * Show Information about an user
		 */
		_showUser: function (id) {
			eyeos.callMessage(this._checknum, 'getUserById', id, function(user) {
				this._setShowMode(user);
			}, this);
		},

		_setShowMode: function (user) {
			this._action = 'show';

			this._infoLabel.setValue(user['name'] + ' ' + user['surname']);
			this._infoLabel.setUserData('id', user['id']);
			this._image.setSource('index.php?checknum=' + this._checknum + '&message=__UserInfo_getAvatarPicture&params[userId]=' + user['id']);
			
			this._usernameInput.set({
				value: user['username'],
				enabled: false
			});
			this._firstNameInput.set({
				value: user['name'],
				enabled: true
			});
			this._lastNameInput.set({
				value: user['surname'],
				enabled: true
			});
			this._emailInput.set({
				value: user['mail'],
				enabled: true
			});
			this._passwordInput.set({
				value: '',
				enabled: true
			});
			this._passwordButton.set({
				label: '',
				enabled: true,
				visibility: 'visible'
			});
			this._passwordCheckBox.set({
				visibility: 'exclued',
				value: false
			});
			this._passwordBox.set({
				visibility: 'visible'
			});
			this._passwordChangingResultLabel.set({
				value: '',
				visibility: 'excluded'
			});
			this._profileBox.set({
				visibility: 'excluded'
			});
			
			this._saveButton.setEnabled(false);
		},

		_setNewMode: function () {
			this._action = 'new';

			this._infoLabel.setValue('New User');
			this._image.setSource('');
			this._usernameInput.set({
				value: '',
				enabled: true
			});
			this._firstNameInput.set({
				value: '',
				enabled: true
			});
			this._lastNameInput.set({
				value: '',
				enabled: true
			});
			this._emailInput.set({
				value: '',
				enabled: true
			});
			this._profileBox.set({
				visibility: 'visible'
			});
			this._passwordBox.set({
				visibility: 'visible'
			});
			this._passwordButton.set({
				label: '',
				enabled: false,
				visibility: 'excluded'
			});
			this._passwordCheckBox.set({
				visibility: 'visible'
			});
			this._passwordInput.set({
				value: '',
				enabled: true
			});
			this._saveButton.setEnabled(false);
		},

		_save: function () {
			switch (this._action) {
				case 'new':
					this._saveNewUser();
					break;
				case 'show':
					this._updateUser();
					break;
			}
		},

		_updateUser: function () {
			// Check email is present
			if (this._emailInput.getValue() == ''){
				var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field email, you should provide a valid mail'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					op.createDialog(null, tr('Empty mail')).open();
					return;
			}

			// Check the mail is correct
			var regt = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
			var re = new RegExp(regt);
			if (!this._emailInput.getValue().match(re)) {
				var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field email, you should provide a valid mail\nAn email with an autogenerated password will be sent to created user.'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					op.createDialog(null, tr('Incorrect mail')).open();
					return;
			}

			var params = {
				'id': this._infoLabel.getUserData('id'),
				'eyeos.user.firstname': this._firstNameInput.getValue(),
				'eyeos.user.lastname': this._lastNameInput.getValue(),
				'eyeos.user.email': this._emailInput.getValue()
			};

			eyeos.callMessage(this._checknum, 'updateUser', params, function() {
				this._refreshGui(tr('User Updated'));
			}, this);
		},

		_saveNewUser: function () {
			// Check Username is present
			if (this._usernameInput.getValue() == ''){
				var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field username, you should provide a valid username'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					op.createDialog(null, tr('Incorrect username')).open();
					return;
			}

			// Check email is present
			if (this._emailInput.getValue() == ''){
				var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field email, you should provide a valid mail'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					op.createDialog(null, tr('Empty mail')).open();
					return;
			}

			// Check the mail is correct
			var regt = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
			var re = new RegExp(regt);
			if (!this._emailInput.getValue().match(re)) {
				var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field email, you should provide a valid mail\nAn email with an autogenerated password will be sent to created user.'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					op.createDialog(null, tr('Incorrect mail')).open();
					return;
			}

			// Check password is present
			if ((this._passwordInput.getValue() == '') && (this._passwordCheckBox.getValue() == false)){
				var op = new eyeos.dialogs.OptionPane(
							tr('Incorrect field password, you should provide a valid password, which could not be empty.'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					op.createDialog(null, tr('Empty password')).open();
					return;
			}

			var params = {
				firstName: this._firstNameInput.getValue(),
				lastName: this._lastNameInput.getValue(),
				userName: this._usernameInput.getValue(),
				email: this._emailInput.getValue(),
				password: this._passwordCheckBox.getValue() ? null : this._passwordInput.getValue(),
				profile: this._profileInput.getSelection()[0].getLabel(),
				emailBody: eyeos.application.usermanagement.userpage.NEWUSERMAILBODY,
				emailSubject: eyeos.application.usermanagement.userpage.NEWUSERMAILSUBJECT
			};

			eyeos.callMessage(this._checknum, 'createUser', params, function() {
				this._refreshGui(tr('User created'));
			}, this);

			
		}
	}
});