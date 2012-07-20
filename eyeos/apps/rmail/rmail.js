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
//TODO -> no account: crash deleting a tag...
//TODO -> delete last account: refresh right GUI...
//TODO -> accountSettings: dispose AccontObject when finished...
//TODO -> move the generic.actions function to external classes...

/**
 * eyeos.application.Mail - the eyeOS Mail Client.
 * @param checknum {Number} the process checknum
 * @param pid {Number} the process id
 * @param args {Array} the input arguments
 */
function rmail_application(checknum, pid, args) {
	var application = new eyeos.applications.Rmail(checknum, pid, args);
	application.initApplication(args);
}

qx.Class.define('eyeos.applications.Rmail', {
	extend: eyeos.system.EyeApplication,

	construct: function (checknum, pid, args) {
		arguments.callee.base.call(this, 'rmail', checknum, pid);
	},

	members: {
		initApplication: function(args) {
			mailChecknum = this.getChecknum();
			eyeos.callMessage(this.getChecknum(), 'checkForAccount', null, function(result) {
				if(result == 'firstTime') {
					this.createAccount();
				} else {
					this.createIframe();
				}
			}, this);
		},

		createAccount: function() {
			var newAccount = new eyeos.applications.mail.NewAccountWindow(this.getChecknum());
			newAccount.getAccountObject().addListener('accountCreated', function() {
			    eyeos.execute('rmail', this.getChecknum());
			}, this);
		},

		createIframe: function() {
				this._window = new eyeos.ui.Window(this, tr('Mail'), 'index.php?extern=images/16x16/apps/preferences-desktop-user.png');
				this._window.setWidth(950);
				this._window.setHeight(650);
				this._window.setContentPadding(0);

				var winLayout = new qx.ui.layout.Grow();
				this._window.setLayout(winLayout);

				//
				var iframe = new qx.ui.embed.Iframe("index.php?message=getHTMLforLogin&checknum="+this.getChecknum());
				this._window.add(iframe);
				this._window.open();

		}
	}
});

qx.Class.define('eyeos.applications.mail.NewAccountWindow', {
	extend: qx.ui.window.Window,

	properties: {
		/**
		 * checknum: the checknum of the calling application.
		 * {@see eyeos.applications.Mail}
		 */
		checknum: {
			init: null
		},

		/**
		 * status: the current status of Window.
		 */
		status: {
			check: ['Account', 'ReceivingServer', 'SendingServer'],
			init: 'Account'
		},

		/**
		 * accountObject: the reference to {@see eyeos.applications.mail.Account}
		 */
		accountObject: {
			deferredInit: true
		}
	},

	construct: function (checknum) {
		this.base(arguments);
		this.setChecknum(checknum);
		this.initAccountObject(new eyeos.applications.mail.Account());

		this.set({
			layout: new qx.ui.layout.VBox(),
			decorator: null,
			modal: true,
			resizable: false,
			showStatusbar: false,
			showMaximize: false,
			showMinimize: false,
			movable: false,
			backgroundColor: '#FFFFFF',
			width: 535,
			height: 340
		});

		this.center();
		this.open();

		this._buildGui();
	},

	members: {
		_headerLayout: null,
		_accountHeader: null,
		_headerArrow1: null,
		_receivingServerHeader: null,
		_headerArrow2: null,
		_sendingServerHeader: null,
		_headerArrow3: null,
		_bodyLayout: null,
		_accountMail: null,
		_accountName: null,
		_accountDescription: null,

		_receivingUserName: null,
		_receivingPassword: null,
		_receivingServerName: null,
		_receivingServerPort: null,
		_receivingServerSecure: null,
		_receivingServerType: null,

		_sendingUserName: null,
		_sendingPassword: null,
		_sendingServerName: null,
		_sendingServerPort: null,
		_sendingServerSecure: null,
		_sendingServerType: null,
		_footerLayout: null,
		_nextButton: null,
		_previousButton: null,
		_cancelButton: null,

		_arrow0: 'index.php?extern=/images/seta-0.png',
		_arrow1: 'index.php?extern=/images/seta-1.png',
		_arrow2: 'index.php?extern=/images/seta-2.png',
		_arrow3: 'index.php?extern=/images/seta-3.png',
		_arrow4: 'index.php?extern=/images/seta-4.png',

		_headerFont: new qx.bom.Font(12, ['Helvetica', 'Arial']).set({
			bold: true
		}),

		_textFont: new qx.bom.Font(11, ['Helvetica', 'Arial']).set({
			bold: true
		}),

		_buildGui: function () {
			this._buildHeader();
			this._buildBody();
			this._buildFooter();
			this._addMyListeners();

			this._changeState('Account');
		},

		_buildHeader: function () {
			this._headerLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				decorator: null,
				height: 40,
				allowGrowY: false
			});
			this.add(this._headerLayout, {
				flex: 1
			});

			var createHeader = new qx.ui.basic.Label('Creating a new account').set({
				font: this._headerFont,
				textColor: 'white',
				backgroundColor: '#939393',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(createHeader, {
				flex: 1
			});

			this._headerArrow1 = new qx.ui.basic.Image(this._arrow2);
			this._headerLayout.add(this._headerArrow1);

			this._accountHeader = new qx.ui.basic.Label('Account Settings').set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._accountHeader, {
				flex: 1
			});

			this._headerArrow2 = new qx.ui.basic.Image(this._arrow0);
			this._headerLayout.add(this._headerArrow2);

			this._receivingServerHeader = new qx.ui.basic.Label('IMAP Server').set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._receivingServerHeader, {
				flex: 1
			});

			this._headerArrow3 = new qx.ui.basic.Image(this._arrow0);
			this._headerLayout.add(this._headerArrow3);

			this._sendingServerHeader = new qx.ui.basic.Label('SMTP Server').set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._sendingServerHeader, {
				flex: 1
			});
		},

		_buildBody: function () {
			this._bodyLayout = new qx.ui.container.Composite().set({
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 5, 5, 5, 5),
				layout: new qx.ui.layout.VBox(),
				margin: 5
			});

			this.add(this._bodyLayout, {
				flex: 1
			});
		},

		_buildFooter: function () {
			this._footerLayout =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'right'
				}),
				decorator: null,
				allowGrowY: false
			});
			this.add(this._footerLayout, {
				flex: 1
			});

			this._cancelButton = new qx.ui.form.Button('Cancel').set({
				width: 73,
				marginRight: 20
			});
			this._footerLayout.add(this._cancelButton);

			this._previousButton = new qx.ui.form.Button('Previous').set({
				width: 73,
				marginRight: 5
			});
			this._footerLayout.add(this._previousButton);

			this._nextButton = new qx.ui.form.Button('Next').set({
				width: 73
			});
			this._footerLayout.add(this._nextButton);
		},

		_addMyListeners: function () {
			this._cancelButton.addListener('execute', this.close, this);
			this._previousButton.addListener('execute', this._previousState, this);
			this._nextButton.addListener('execute', this._nextState, this);
		},

		_changeState: function (newStatus) {
			this.setStatus(newStatus);
			this._updateHeader();
			this._updateBody();
			this._updateFooter();
		},

		_updateHeader: function () {
			this._resetHeader();

			switch (this.getStatus()) {
				case 'Account':
					this._headerArrow1.setSource(this._arrow1);
					this._accountHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow2.setSource(this._arrow3);
					break;
				case 'ReceivingServer':
					this._receivingServerHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow2.setSource(this._arrow4);
					this._headerArrow3.setSource(this._arrow3);
					break;
				case 'SendingServer':
					this._sendingServerHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow3.setSource(this._arrow4);
					break;
			}
		},

		_resetHeader: function () {
			this._accountHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow1.setSource(this._arrow2);

			this._receivingServerHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow2.setSource(this._arrow0);
			this._sendingServerHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow3.setSource(this._arrow0);
		},

		_updateBody: function () {
			this._resetBody();
			switch (this.getStatus()) {
				case 'Account':
					this._updateBodyAccount();
					break;
				case 'ReceivingServer':
					this._updateBodyReceivingServer();
					break;
				case 'SendingServer':
					this._updateBodySendingServer();
					break;
			}
		},

		_resetBody: function () {
			this._bodyLayout.removeAll();
		},

		_createGroupBox: function(label) {
			var groupbox = new qx.ui.groupbox.GroupBox(label).set({
				padding: 5,
				width: 400,
				allowGrowX: false,
				layout: new qx.ui.layout.VBox(),
				alignX: 'center',
				alignY: 'middle'
			});
			return groupbox;
		},

		_createLabel: function(value) {
			var label = new qx.ui.basic.Label(value).set({
				alignY: 'middle',
				font: this._textFont
			});
			return label;
		},

		_updateBodyAccount: function () {
			var accountBox = this._createGroupBox('Your mail address and your account name');
			this._bodyLayout.add(accountBox);

			this._accountMailLabel = this._createLabel('your mail address:');
			accountBox.add(this._accountMailLabel);
			this._accountMail = new qx.ui.form.TextField();
			this._accountMail.setValue(this.getAccountObject().getAccountMail());
			this._accountMail.addListener('changeValue', function() {
				this.getAccountObject().setAccountMail(this._accountMail.getValue());
				if (this._accountMail.getValue()) {
					this._accountMailLabel.setTextColor('black');
				}
			}, this);
			accountBox.add(this._accountMail, {
				flex: 1
			});

			this._accountNameLabel = this._createLabel('your name:');
			accountBox.add(this._accountNameLabel);
			this._accountName = new qx.ui.form.TextField();
			this._accountName.setValue(this.getAccountObject().getAccountName());
			this._accountName.addListener('changeValue', function() {
				this.getAccountObject().setAccountName(this._accountName.getValue());
				if (this._accountName.getValue()) {
					this._accountNameLabel.setTextColor('black');
				}
			}, this);
			accountBox.add(this._accountName, {
				flex: 1
			});

			var descriptionBox = this._createGroupBox('A short description of the account');
			this._bodyLayout.add(descriptionBox);

			this._accountDescriptionLabel = this._createLabel('Description:');
			descriptionBox.add(this._accountDescriptionLabel);
			this._accountDescription = new qx.ui.form.TextField();
			this._accountDescription.setValue(this.getAccountObject().getAccountDescription());
			this._accountDescription.addListener('changeValue', function() {
				this.getAccountObject().setAccountDescription(this._accountDescription.getValue());
				if (this._accountDescription.getValue()) {
					this._accountDescriptionLabel.setTextColor('black');
				}
			}, this);
			descriptionBox.add(this._accountDescription, {
				flex: 1
			});
		},

		_updateBodyReceivingServer: function () {
			var accountBox = this._createGroupBox('Account');
			this._bodyLayout.add(accountBox);

			this._receivingUserNameLabel = this._createLabel('Username:');
			accountBox.add(this._receivingUserNameLabel);
			this._receivingUserName = new qx.ui.form.TextField();
			this._receivingUserName.addListener('changeValue', function() {
				this.getAccountObject().setReceivingUserName(this._receivingUserName.getValue());
				if (this._receivingUserName.getValue()) {
					this._receivingUserNameLabel.setTextColor('black');
				}
			}, this);
			this._receivingUserName.setValue(this.getAccountObject().getAccountMail());
			accountBox.add(this._receivingUserName, {
				flex: 1
			});

			this._receivingPasswordLabel = this._createLabel('Password:');
			accountBox.add(this._receivingPasswordLabel);
			this._receivingPassword = new qx.ui.form.PasswordField();
			this._receivingPassword.addListener('changeValue', function() {
				this.getAccountObject().setReceivingPassword(this._receivingPassword.getValue());
				if (this._receivingPassword.getValue()) {
					this._receivingPasswordLabel.setTextColor('black');
				}
			}, this);
			this._receivingPassword.setValue(this.getAccountObject().getReceivingPassword());
			accountBox.add(this._receivingPassword, {
				flex: 1
			});

			var mailServerBox = this._createGroupBox('IMAP Server');
			this._bodyLayout.add(mailServerBox);

			var upContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					spacing: 5
				}),
				padding: 5
			});
			mailServerBox.add(upContainer);

			this._receivingServerNameLabel = this._createLabel('Server name:');
			upContainer.add(this._receivingServerNameLabel);
			this._receivingServerName = new qx.ui.form.TextField();
			this._receivingServerName.setValue(this.getAccountObject().getReceivingServerName());
			this._receivingServerName.addListener('changeValue', function() {
				this.getAccountObject().setReceivingServerName(this._receivingServerName.getValue());
				if (this._receivingServerName.getValue()) {
					this._receivingServerNameLabel.setTextColor('black');
				}
			}, this);
			upContainer.add(this._receivingServerName, {
				flex: 1
			});

			this._receivingServerPortLabel = this._createLabel('Server port:');
			upContainer.add(this._receivingServerPortLabel);
			this._receivingServerPort = new qx.ui.form.TextField().set({
				width: 35,
				allowGrowX: false,
				value: '995'
			});
			this.getAccountObject().setReceivingServerPort('995');
			this._receivingServerPort.addListener('changeValue', function() {
				this.getAccountObject().setReceivingServerPort(this._receivingServerPort.getValue());
				if (this._receivingServerPort.getValue()) {
					this._receivingServerPortLabel.setTextColor('black');
				}
			}, this);
			upContainer.add(this._receivingServerPort);

			var downContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					spacing: 5
				}),
				padding: 5
			});
			mailServerBox.add(downContainer);

			this._receivingServerSecureLabel = this._createLabel('Secure Connection:');
			downContainer.add(this._receivingServerSecureLabel);
			this._receivingServerSecure = new qx.ui.form.SelectBox().set({
				width: 60,
				allowGrowX: false
			});
			this._receivingServerSecure.add(new qx.ui.form.ListItem('Yes'));
			this._receivingServerSecure.add(new qx.ui.form.ListItem('No'));
			this.getAccountObject().setReceivingServerSecure('Yes');
			this._receivingServerSecure.addListener('changeValue', function() {
				this.getAccountObject().setReceivingServerSecure(this._receivingServerSecure.getSelection()[0].getLabel());
				if (this._receivingServerSecure.getSelection()[0].getLabel()) {
					this._receivingServerSecureLabel.setTextColor('black');
				}
			}, this);
			downContainer.add(this._receivingServerSecure);

			this._receivingServerTypeLabel = this._createLabel('Type:');
			downContainer.add(this._receivingServerTypeLabel);
			this._receivingServerType = new qx.ui.form.SelectBox().set({
				width: 60,
				allowGrowX: false
			});
			this._receivingServerType.add(new qx.ui.form.ListItem('IMAP'));
			this.getAccountObject().setReceivingServerType('IMAP');
			this._receivingServerType.addListener('changeValue', function() {
				this.getAccountObject().setReceivingServerType(this._receivingServerType.getSelection()[0].getLabel());
				if (this._receivingServerType.getSelection()[0].getLabel()) {
					this._receivingServerTypeLabel.setTextColor('black');
				}
			}, this);
			downContainer.add(this._receivingServerType);
		},

		_updateBodySendingServer: function () {
			var accountBox = this._createGroupBox('Account');
			this._bodyLayout.add(accountBox);

			this._sendingUserNameLabel = this._createLabel('Username:');
			accountBox.add(this._sendingUserNameLabel);
			this._sendingUserName = new qx.ui.form.TextField();
			this._sendingUserName.addListener('changeValue', function() {
				this.getAccountObject().setSendingUserName(this._sendingUserName.getValue());
				if (this._sendingUserName.getValue()) {
					this._sendingUserNameLabel.setTextColor('black');
				}
			}, this);
			this._sendingUserName.setValue(this.getAccountObject().getAccountMail());
			accountBox.add(this._sendingUserName, {
				flex: 1
			});

			this._sendingPasswordLabel = this._createLabel('Password:');
			accountBox.add(this._sendingPasswordLabel);
			this._sendingPassword = new qx.ui.form.PasswordField();
			this._sendingPassword.setValue(this._receivingPassword.getValue());
			this._sendingPassword.addListener('changeValue', function() {
				this.getAccountObject().setSendingPassword(this._sendingPassword.getValue());
				if (this._sendingPassword.getValue()) {
					this._sendingPasswordLabel.setTextColor('black');
				}
			}, this);
			this._sendingPassword.setValue(this.getAccountObject().getSendingPassword());
			accountBox.add(this._sendingPassword, {
				flex: 1
			});

			var mailServerBox = this._createGroupBox('SMTP Server');
			this._bodyLayout.add(mailServerBox);

			var upContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					spacing: 5
				}),
				padding: 5
			});
			mailServerBox.add(upContainer);

			this._sendingServerNameLabel = this._createLabel('Server name:');
			upContainer.add(this._sendingServerNameLabel);
			this._sendingServerName = new qx.ui.form.TextField();
			this._sendingServerName.setValue(this.getAccountObject().getSendingServerName());
			this._sendingServerName.addListener('changeValue', function() {
				this.getAccountObject().setSendingServerName(this._sendingServerName.getValue());
				if (this._sendingServerName.getValue()) {
					this._sendingServerNameLabel.setTextColor('black');
				}
			}, this);
			upContainer.add(this._sendingServerName, {
				flex: 1
			});

			this._sendingServerPortLabel = this._createLabel('Server port:');
			upContainer.add(this._sendingServerPortLabel);
			this._sendingServerPort = new qx.ui.form.TextField().set({
				width: 35,
				allowGrowX: false,
				value: '587'
			});
			this.getAccountObject().setSendingServerPort('587');
			this._sendingServerPort.addListener('changeValue', function() {
				this.getAccountObject().setSendingServerPort(this._sendingServerPort.getValue());
				if (this._sendingServerPort.getValue()) {
					this._sendingServerPortLabel.setTextColor('black');
				}
			}, this);
			upContainer.add(this._sendingServerPort);

			var downContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					spacing: 5
				}),
				padding: 5
			});
			mailServerBox.add(downContainer);

			this._sendingServerSecureLabel = this._createLabel('Secure Connection:');
			downContainer.add(this._sendingServerSecureLabel);
			this._sendingServerSecure = new qx.ui.form.SelectBox().set({
				width: 60,
				allowGrowX: false
			});
			this._sendingServerSecure.add(new qx.ui.form.ListItem('Yes'));
			this._sendingServerSecure.add(new qx.ui.form.ListItem('No'));
			this.getAccountObject().setSendingServerSecure('Yes');
			this._sendingServerSecure.addListener('changeValue', function() {
				this.getAccountObject().setSendingServerSecure(this._sendingServerSecure.getSelection()[0].getLabel());
				if (this._sendingServerSecure.getSelection()[0].getLabel()) {
					this._sendingServerSecureLabel.setTextColor('black');
				}
			}, this);
			downContainer.add(this._sendingServerSecure);

			this._sendingServerTypeLabel = this._createLabel('Type:');
			downContainer.add(this._sendingServerTypeLabel);
			this._sendingServerType = new qx.ui.form.SelectBox().set({
				width: 70,
				allowGrowX: false
			});
			this._sendingServerType.add(new qx.ui.form.ListItem('SMTP'));
			this.getAccountObject().setSendingServerType('SMTP');
			this._sendingServerType.addListener('changeValue', function() {
				this.getAccountObject().setSendingServerType(this._sendingServerType.getSelection()[0].getLabel());
				if (this._sendingServerType.getSelection()[0].getLabel()) {
					this._sendingServerTypeLabel.setTextColor('black');
				}
			}, this);
			downContainer.add(this._sendingServerType);
		},

		_updateFooter: function () {
			switch (this.getStatus()) {
				case 'Account':
					this._previousButton.set({
						enabled: false
					});
					break;
				case 'ReceivingServer':
					this._previousButton.set({
						enabled: true
					});
					this._nextButton.set({
						label: 'Next'
					});
					break;
				case 'SendingServer':
					this._nextButton.set({
						label: 'Accept'
					});
					break;
			}
		},

		_previousState: function () {
			switch (this.getStatus()) {
				case 'ReceivingServer':
					this._changeState('Account');
					break;
				case 'SendingServer':
					this._changeState('ReceivingServer');
					break;
			}
		},

		_checkNextState: function() {
			var check = null;
			switch (this.getStatus()) {
				case 'Account':
					check = new Array();
					if (this._accountMail.getValue()) {
						check.push(true);
					}
					else {
						this._accountMailLabel.setTextColor('red');
						check.push(false);
					}

					if (this._accountName.getValue()) {
						check.push(true);
					}
					else {
						this._accountNameLabel.setTextColor('red');
						check.push(false);
					}

					if (this._accountDescription.getValue()) {
						check.push(true);
					}
					else {
						this._accountDescriptionLabel.setTextColor('red');
						check.push(false);
					}

					break;
				case 'ReceivingServer':
					check = new Array();
					if (this._receivingUserName.getValue()) {
						check.push(true);
					}
					else {
						this._receivingUserNameLabel.setTextColor('red');
						check.push(false);
					}

					if (this._receivingPassword.getValue()) {
						check.push(true);
					}
					else {
						this._receivingPasswordLabel.setTextColor('red');
						check.push(false);
					}

					if (this._receivingServerName.getValue()) {
						check.push(true);
					}
					else {
						this._receivingServerNameLabel.setTextColor('red');
						check.push(false);
					}

					if (this._receivingServerPort.getValue()) {
						check.push(true);
					}
					else {
						this._receivingServerPortLabel.setTextColor('red');
						check.push(false);
					}
					break;
				case 'SendingServer':
					check = new Array();
					if (this._sendingUserName.getValue()) {
						check.push(true);
					}
					else {
						this._sendingUserNameLabel.setTextColor('red');
						check.push(false);
					}

					if (this._sendingPassword.getValue()) {
						check.push(true);
					}
					else {
						this._sendingPasswordLabel.setTextColor('red');
						check.push(false);
					}

					if (this._sendingServerName.getValue()) {
						check.push(true);
					}
					else {
						this._sendingServerNameLabel.setTextColor('red');
						check.push(false);
					}

					if (this._sendingServerPort.getValue()) {
						check.push(true);
					}
					else {
						this._sendingServerPortLabel.setTextColor('red');
						check.push(false);
					}
					break;
			}

			if (check.indexOf(false) >= 0) {
				return false;
			}
			else {
				return true;
			}
		},

		_nextState: function () {
			switch (this.getStatus()) {
				case 'Account':
					if (this._checkNextState()) {
						this._changeState('ReceivingServer');
					}
					break;
				case 'ReceivingServer':
					if (this._checkNextState()) {
						this._changeState('SendingServer');
					}
					break;
				case 'SendingServer':
					if (this._checkNextState()) {
						this._finish();
					}
					break;
			}
		},

		_finish: function () {
			var secret = document.secretkey; //TODO24 what happens with retrieve dbus?
			var params = new Array();
			var phpjs = new PHP_JS();

			params.push(this.getAccountObject().getAccountMail());
			params.push(this.getAccountObject().getAccountName());
			params.push(this.getAccountObject().getAccountDescription());

			params.push(this.getAccountObject().getReceivingServerType());
			params.push(this.getAccountObject().getReceivingUserName());
			//xtea +b64 here
			var recPass = this.getAccountObject().getReceivingPassword();
//			recPass = phpjs.base64_encode(encrypt(recPass, secret));
			params.push(recPass);
			params.push(this.getAccountObject().getReceivingServerName());
			params.push(this.getAccountObject().getReceivingServerPort());
			params.push(this.getAccountObject().getReceivingServerSecure());

			params.push(this.getAccountObject().getSendingServerType());
			params.push(this.getAccountObject().getSendingUserName());
			//xtea +b64 here
			var sendPass = this.getAccountObject().getSendingPassword();
//			sendPass = phpjs.base64_encode(encrypt(sendPass, secret));
			params.push(sendPass);
			params.push(this.getAccountObject().getSendingServerName());
			params.push(this.getAccountObject().getSendingServerPort());
			params.push(this.getAccountObject().getSendingServerSecure());

			this.close();
			this.getAccountObject().createAccount(this.getChecknum(), params);
		}
	}
});


qx.Class.define('eyeos.applications.mail.Account', {
	extend: qx.core.Object,

	construct: function () {
		arguments.callee.base.call(this);
	},

	properties: {
		/**
		 * accounts: Array[] of account objects.
		 */
		accounts: {
			init: null,
			event: 'changeAccounts'
		},

		/**
		 * accountId: the id of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		accountId: {
			init: null
		},

		/**
		 * accountMail: the mail of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		accountMail: {
			init: null
		},

		/**
		 * accountName: the name of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		accountName: {
			init: null
		},

		/**
		 * accountDescription: the description of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		accountDescription: {
			init: null
		},

		/**
		 * receivingUserName: the pop/imap username of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		receivingUserName: {
			init: null
		},

		/**
		 * receivingPassword: the pop/imap password of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		receivingPassword: {
			init: null
		},

		/**
		 * receivingServerName: the pop/imap server name of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		receivingServerName: {
			init: null
		},

		/**
		 * receivingServerPort: the pop/imap server port of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		receivingServerPort: {
			init: null
		},

		/**
		 * receivingServerSecure: the pop/imap SSL server connection of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		receivingServerSecure: {
			init: null
		},

		/**
		 * receivingServerType: the pop/imap server type of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		receivingServerType: {
			init: null
		},

		/**
		 * sendingUserName: the smtp username of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		sendingUserName: {
			init: null
		},

		/**
		 * sendingPassword: the smtp password of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		sendingPassword: {
			init: null
		},

		/**
		 * sendingServerName: the smtp server name of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		sendingServerName: {
			init: null
		},

		/**
		 * sendingServerPort: the smtp server port of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		sendingServerPort: {
			init: null
		},

		/**
		 * sendingServerSecure: the smtp SSL server connection of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		sendingServerSecure: {
			init: null
		},

		/**
		 * sendingServerType: the smtp SSL server type of a given account.
		 * {@see this#accounts}
		 * {@see this#retrieveAccount}
		 */
		sendingServerType: {
			init: null
		}
	},

	members: {
		/**
		 * createAccount: create a new account, given all the needed params.
		 * @param checknum {Number} the process checknum
		 * @param params {Array} the array of params needed to create a new account
		 */
		createAccount: function (checknum, params) {
			eyeos.callMessage(checknum, 'createAccount', params, function (id) {
				this.setAccountId(id);
				this.fireEvent('accountCreated');
			}, this);
		},

		/**
		 * editAccount: edit an account, given all the needed params to be changed.
		 * @param checknum {Number} the process checknum
		 * @param params {Array} the array of params to be changed
		 */
		editAccount: function (checknum, params) {
			eyeos.callMessage(checknum, 'editAccount', params, function () {
				this.fireEvent('accountEdited');
			}, this);
		},

		/**
		 * removeAccount: remove an account, given the account's id to be removed.
		 * @param checknum {Number} the process checknum
		 * @param params {Array} the account's id to be removed
		 */
		removeAccount: function (checknum, params) {
			eyeos.callMessage(checknum, 'removeAccount', params, function () {
				this.fireEvent('accountRemoved');
			}, this);
		},

		/**
		 * getAllAccounts: retrieve all the accounts from the database, and sets
		 * the {@see this#accounts} with the retrieved array of datas.
		 * @param checknum {Number} the process checknum
		 * @param init {Boolean} true, if we want to update the GUI in the init phase.
		 */
		getAllAccounts: function (checknum, init) {
			eyeos.callMessage(checknum, 'getAllAccounts', null, function (results) {
				this.setAccounts(results);
				if (init) {
					this.fireEvent('AccountSettingsRetrieved');
				}
			}, this);
		},

		/**
		 * retrieveAccount: retrieve an accountfrom {@see this#accounts},
		 * given a valid index.
		 * @param index {Number} a valid index in the range [0..this.getAccounts().length
		 */
		retrieveAccount: function (index) {
			if (this.getAccounts()) {
				this.setAccountId(this.getAccounts()[index].id);
				this.setAccountMail(this.getAccounts()[index].mail);
				this.setAccountName(this.getAccounts()[index].name);
				this.setAccountDescription(this.getAccounts()[index].description);

				this.setReceivingUserName(this.getAccounts()[index].mbusername);
				this.setReceivingPassword(this.getAccounts()[index].mbpassword);
				this.setReceivingServerName(this.getAccounts()[index].mbserver);
				this.setReceivingServerPort(this.getAccounts()[index].mbport);
				this.setReceivingServerSecure(this.getAccounts()[index].mbsecure);
				this.setReceivingServerType(this.getAccounts()[index].typemailbox);

				this.setSendingUserName(this.getAccounts()[index].senderusername);
				this.setSendingPassword(this.getAccounts()[index].senderpassword);
				this.setSendingServerName(this.getAccounts()[index].senderserver);
				this.setSendingServerPort(this.getAccounts()[index].senderport);
				this.setSendingServerSecure(this.getAccounts()[index].sendersecure);
				this.setSendingServerType(this.getAccounts()[index].typesender);
			}
		}
	}
});