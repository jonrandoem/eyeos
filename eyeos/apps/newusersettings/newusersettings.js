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

function newusersettings_application(checknum, pid, args) {
	var myApp = new eyeos.application.NewUserSettings(checknum, pid, args);
	myApp.init();
}

qx.Class.define('eyeos.gui.form.RadioButton', {

	extend: qx.ui.form.RadioButton,

	construct: function (label, id, app) {
		this.base(arguments, label);
		this.setId(id);
		this.setApp(app);
		this.set({
			marginTop: 7,
			marginBottom: 7
		});
		this._addButton();
	},

	properties: {
		id: {
			check: 'Integer',
			init: 0
		},
		
		app: {
			check: 'Object',
			init: null
		}
	},

	members: {
		_addButton: function () {
			this.getChildControl('label').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				textColor: '#666666',
				marginRight: 6
			});

			var botton = new qx.ui.basic.Image('index.php?extern=images/16x16/actions/window-close.png').set({
				maxWidth: 13,
				maxHeight: 13,
				minWidth: 13,
				maxWidth: 13,
				scale: true
			});
			
			this._add(botton);

			botton.addListener('click', function () {
				this.getApp().fireDataEvent('deleteMail', [this.getId()])
			}, this);
		}
	}
});


qx.Class.define('eyeos.gui.auxiliar.loginApplication', {

	extend: qx.ui.container.Composite,

	construct: function (app, name, executable, color) {
		this.base(arguments);
		this.setLayout(new qx.ui.layout.HBox());
		this.setName(name);
		this.setApp(app);
		this.setExecutable(executable);
		this.setBackgroundColor(color);
		this.setOldColor(color);
		this.init();
	},

	properties: {
		name: {
			check: 'String',
			init: null
		},

		selected: {
			check: 'Boolean',
			init: false
		},

		app: {
			check: 'Object',
			init: null
		},

		executable: {
			check: 'String',
			init: null
		},

		oldColor: {
			check: 'String',
			init: null
		}
	},

	members: {
		init: function () {

			this.set({
				padding: 3,
				height: 30,
				maxHeight: 30,
				minHeight: 30
			});
			
			this._label = new qx.ui.basic.Label(tr(this.getName())).set({
				marginTop: 5,
				marginLeft: 3,
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				rich: true,
				textColor: '#666666'
			});

			var composite = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			composite.add(this._label);
			//var delButton = new qx.ui.form.Button('X').set({maxWidth: 30, width: 30});
			this.add(composite, {flex: 1});
			//this.add(delButton);

			var self = this;

			this.addListener('click', function (e) {
				if (!this.isSelected() && this.getApp().getMetaKey()) {
					this.select();
				} else if (!this.isSelected() && !this.getApp().getMetaKey()) {
					this.unselectAll();
					this.select();
				} else if (this.isSelected() && this.getApp().getMetaKey()) {
					this.unselect();
				} else {
					this.unselectAll(this);
					//this.unselect();
				}
			});
			
//			delButton.addListener('click', function (e) {
//				this._deleteLoginApplication(self.getName());
//			}, this.getApp());
		},

		select: function ()  {
			this.setSelected(true);
			this.getApp().fireDataEvent('loginAppSelected');
			this._label.setTextColor('#F0F0F0');
			this.setBackgroundColor('#000080');
		},

		unselectAll: function (params) {
			var childrens = this.getApp()._loginApplicationsList.getChildren();
			for (var i = 0; i < childrens.length; ++i) {
				if (this != childrens[i]) {
					if (params != null) {
						if (childrens[i] != params) {
							childrens[i].unselect();
						}
					} else {
						childrens[i].unselect();
					}
				}
			}
		},

		unselect: function () {
			this.setSelected(false);
			this.getApp().fireDataEvent('loginAppUnselected');
			this._label.setTextColor('#666666');
			this.setBackgroundColor(this.getOldColor());
		}
	}
});

qx.Class.define('eyeos.application.NewUserSettings', {

    extend: eyeos.system.EyeApplication,

    construct: function(checknum, pid, args) {
	    arguments.callee.base.call(this, 'newusersettings', checknum, pid);

		eyeos.callMessage(this.getChecknum(), '__Applications_getAllInstalledApplications', null, function (results) {
			this.setAllApplications(results);
			eyeos.callMessage(checknum, 'loadSettings', null, function (results) {
				this.setUserId(results['eyeos.user.id']);
				this.setFirstName(results['eyeos.user.firstname']);
				this.setLastName(results['eyeos.user.lastname']);
				this.setUserName(results['eyeos.user.nickname']);
				this.setMails(
					[{
						mailName: results['eyeos.user.email'],
						mailId: 1,
						confirmed: true,
						userId: results['eyeos.user.id']
					}]
					);

				if (results['eyeos.user.language'] != undefined) {
					this.setLanguage(results['eyeos.user.language']);
				} else {
					this.setLanguage('en');
				}

				if (results['eyeos.user.desktop.wallpaperMode'] != undefined) {
					this.setWallpaperMode(results['eyeos.user.desktop.wallpaperMode']);
				} else {
					this.setWallpaperMode('color');
				}

				if (results['eyeos.user.desktop.wallpaperId'] != undefined) {
					this.setWallpaperId(results['eyeos.user.desktop.wallpaperId']);
				} else {
					this.setWallpaperId(7);
				}

				if (results['eyeos.user.desktop.backgroundColors'] != undefined) {
					this.setBackgroundColors(results['eyeos.user.desktop.backgroundColors']);
				} else {
					this.setBackgroundColors({
						'#000000': 'false',
						'#808080': 'false',
						'#A0A0A0': 'true',
						'#FF0000': 'false',
						'#00FF00': 'false',
						'#0000FF': 'false'
					});
				}

				if (results['eyeos.user.applications.onLogin'] != undefined) {
					var installedApps = this.getAllApplications();
					this.setLoginApplications(results['eyeos.user.applications.onLogin']);
					var loginApps = this.getLoginApplications();
					for (var f in loginApps) {
						var found = false;
						for (var i = 0; i < installedApps.length; ++i) {
							if (installedApps[i].name == f) {
								found = true;
							}
						}
						if (!found) {
							delete(loginApps[f]);
						}
					}

					for (var i = 0; i < installedApps.length; ++i) {
						var found = false;
						for (var f in loginApps) {
							if (f == installedApps[i].name) {
								found = true;
							}
						}

						if (!found) {
							this.getLoginApplications()[installedApps[i].name] = 'false';
						}
					}

				} else {
					var apps = results['eyeos.user.applications.installed'];
					var obj = new Object();
					for (var i in apps) {
						obj[i] = 'false';
					}
					this.setLoginApplications(obj);
				}

				if (results['eyeos.user.picture.url'] != undefined) {
					this.setUserImage(results['eyeos.user.picture.url']);
				}

				if (results['eyeos.user.desktop.wallpaper'] != undefined) {
					this.setWallpaper(results['eyeos.user.desktop.wallpaper']);
				}

				if (results['eyeos.desktop.mode'] != undefined) {
					this.setDesktopMode(results['eyeos.desktop.mode']);
				} else {
					this.setDesktopMode('dashboard');
				}

				if (results['eyeos.desktop.dashboard.nbcolumns'] != undefined) {
					this.setDashboardColumns(parseInt(results['eyeos.desktop.dashboard.nbcolumns']));
				} else {
					this.setDashboardColumns(2);
				}

				this.initApp();
			}, this);
		}, this);
	},

	members: {
		init: function () {
			this.setWindow(new eyeos.ui.Window(this, 'User Settings', 'index.php?extern=/images/16x16/apps/accessories-text-editor.png').set({
				width: 660,
				height: 555,
				contentPadding: 0,
				layout: new qx.ui.layout.Canvas()
			}));
			this.getWindow().open();
		},
		
		initApp: function () {
			//this.setLoginApplications(this.self(arguments).loginApps);
			this._buildGui();
			this.initValues();
			this._addListeners();
		},

		initValues: function() {

			var childsInfoRadioGroup = this._desktopTabInfoRadioGroup.getChildren();
			if (this.getDesktopMode() == 'dashboard') {
				this._desktopTabInfoRadioGroup.setSelection([childsInfoRadioGroup[1]]);
			} else {
				this._desktopTabInfoRadioGroup.setSelection([childsInfoRadioGroup[0]]);
			}

			var childs = this._desktopTabColumnsRadioGroup.getChildren();
			for (var i = 0; i < childs.length; ++i) {
				if (childs[i].getModel() == this.getDashboardColumns()) {
					this._desktopTabColumnsRadioGroup.setSelection([childs[i]]);
					i = childs.length + 1;
				}
			}

			if (this.getWallpaperMode() == 'image') {
				var childs = this._listItem.getChildren();
				for (var i = 0; i < childs.length; ++i) {
					if (childs[i] instanceof qx.ui.form.ListItem && childs[i].getModel().id == this.getWallpaperId()) {
						this._listItem.setSelection([childs[i]]);
						if (childs[i].getModel().path != undefined) {
							eyeos.callMessage(this.getChecknum(), '__FileSystem_browsePath', [childs[i].getModel().path, null, null], function (results) {
								this._populateWallpapers(results);
							}, this);
						}
					}
				}
			} else {
				this._selectDesktopUserColors();
				this._populateColors();
			}

			if (this.getUserImage() != null) {
				this._inputImage.setSource('index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=' + this.getUserImage());
			} else {
				this._inputImage.setSource('index.php?extern=images/empty_profile.png');
			}
		},

//		_applyActiveMail: function (newValue, oldValue) {
//			var childrens = this._radioGroup.getChildren();
//			for (var i = 0; i < childrens.length; ++i) {
//				if (childrens[i].getUserData('id') == newValue) {
//					this._radioGroup.setSelection([childrens[i]]);
//					i = childrens.length + 1;
//				}
//			}
//		},

		_addListeners: function () {

			var dbus = eyeos.messageBus.getInstance();

			this._tabView.addListener('appear', function () {
				this.getWindow().center();
			}, this)

			this.getWindow().addListener('keydown', function (e) {
				if (e.getKeyIdentifier() == 'Shift') {
					this.setMetaKey(true);
				}
			}, this);

			this.getWindow().addListener('keyup', function (e) {
				if (e.getKeyIdentifier() == 'Shift') {
					this.setMetaKey(false);
				}
			}, this);

			this.getWindow().addListener('resize', function (e) {
				this._tabView.setWidth(this.getWindow().getBounds().width - 10);
			}, this);

			this._buttonSaveAndClose.addListener('click', function (e) {
				this._saveAndClose();
			}, this);

			this._mailBoxAddMail.addListener('click', function (e) {
				this._addNewMail();
			}, this);

			this._buttonDeleteAccount.addListener('click', function (e) {
				this._deleteAccount();
			}, this);

			this._buttonChangePassword.addListener('click', function (e) {
				this._changePassword();
			}, this);

			this.addListener('deleteMail', function (e) {
				this._deleteMailAccount(e.getData());
			});

			this._desktopTabInfoRadioGroup.addListener('changeSelection', function (e) {
				if (e.getData()[0].getModel() == 'dashboard') {
					this._columnsBox.setEnabled(true);
					this._widgetsBox.setEnabled(true);
					dbus.send('desktop', 'changesDashboard', ['dashboard', 'classic', this._desktopTabColumnsRadioGroup.getSelection()[0].getModel()]);
				} else {
					this._columnsBox.setEnabled(false);
					this._widgetsBox.setEnabled(false);
					dbus.send('desktop', 'changesDashboard', ['classic', 'dashboard', this._desktopTabColumnsRadioGroup.getSelection()[0].getModel()]);
				}
			}, this);

			this._desktopTabColumnsRadioGroup.addListener('changeSelection', function (e) {
				dbus.send('desktop', 'changesDashboard', ['dashboard', 'dashboard', this._desktopTabColumnsRadioGroup.getSelection()[0].getModel()]);
			}, this);

			this._buttonAddColor.addListener('click', function (e) {
				this._addNewColor();
			}, this);

			this._buttonChangeImage.addListener('click', function (e) {
				this._fileChooser.showOpenDialog(this.getWindow(), function(choice, path) {
					if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
						this.setUserImage(path);
						this._inputImage.setSource('index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=' + path);
					}
				}, this);
			}, this);

			this._buttonDeleteImage.addListener('click', function (e) {
				this._inputImage.setSource('index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=sys:///extern/images/empty_profile.png');
			}, this);

			this._buttonAddFile.addListener('click', function (e) {
				this._selectDesktopUserImages();
				this._fileChooser.showOpenDialog(this.getWindow(), function(choice, path) {
					if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
						eyeos.callMessage(this.getChecknum(), 'copy', ['home://~' + eyeos.getCurrentUserName() + '/Images/', path], function (results) {
							eyeos.callMessage(this.getChecknum(), '__FileSystem_browsePath', ['home://~'+eyeos.getCurrentUserName()+'/Images/', null, null], function (results) {
								this._populateWallpapers(results);
							}, this);
						}, this);
					}
				}, this);
			}, this);

			this._buttonUploadFile.addListener('click', function (e) {
				this._selectDesktopUserImages();
				eyeos.execute('upload', this.getChecknum(), ['home://~' + eyeos.getCurrentUserName() + '/Images', {allowChangePath: 'false'}]);
			}, this);

			this.addListener('loginAppSelected', function (e) {
				if (!this._buttonDelApplication.isEnabled()) {
					this._buttonDelApplication.setEnabled(true);
				}
			});

			this.addListener('loginAppUnselected', function (e) {
				var childrens = this._loginApplicationsList.getChildren();
				var f = 0;
				for (var i = 0; i < childrens.length; ++i) {
					if (childrens[i].isSelected()) {
						f++;
					}
				}
				
				if (f <= 0) {
					this._buttonDelApplication.setEnabled(false);
				}
			});

			dbus.addListener('eyeos_file_uploadComplete', function (e) {
				var splitted = e.getData().absolutepath.split('home://~'+eyeos.getCurrentUserName()+'/Images/');
				if (splitted[1] != undefined) {
					var toCheck = splitted[1].split('/');
					if (toCheck.length == 1) {
						this._populateWallpaper(e.getData(), 'home://~'+eyeos.getCurrentUserName()+'/Images');
					}
				}
			}, this);

			dbus.addListener('eyeos_desktop_widgetsLoaded', function (e) {
				this._populateWidgets();
			}, this);
		},

		_selectDesktopUserImages: function () {
			var children = this._listItem.getChildren();
			for (var i = 0; i < children.length; ++i) {
				if (children[i] instanceof qx.ui.form.ListItem && children[i].getModel().id == 'user') {
					this._listItem.setSelection([children[i]]);
				}
			}
		},

		_selectDesktopUserColors: function () {
			var children = this._listItem.getChildren();
			for (var i = 0; i < children.length; ++i) {
				if (children[i] instanceof qx.ui.form.ListItem && children[i].getModel().id == 'color') {
					this._listItem.setSelection([children[i]]);
				}
			}
		},

		_buildGui: function () {

			this._buildTabs();
			this._buildEmergentWindow();
			this._fileChooser = new eyeos.dialogs.FileChooser(this.getChecknum());
			this._fileChooser.setFilters([
				{desc: 'Image files', patterns: ['*.png', '*.gif', '*.jpg', '*.jpeg', '*.bmp'], defaultExt: 'png'},
			]);
			var buttonBox = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignX: 'right'
			}));
			this._buttonSaveAndClose = new qx.ui.form.Button(tr('Save & close')).set({
				marginRight: 1,
				marginTop: 30,
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				marginBottom: 10
			});
			buttonBox.add(this._buttonSaveAndClose);
			this.getWindow().add(buttonBox, {bottom: 5, right: 5});

		},

		_buildEmergentWindow: function () {

			this._windowEmergent = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				width: 500,
				backgroundColor: '#E7E7E7',
				shadow: new qx.ui.decoration.Single(1, 'solid', '#333333'),
				padding: 10
			});

			this._windowEmergentContent = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			this._windowEmergentButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignX: 'right'
			})).set({
				height: 25,
				maxHeight: 25
			});

			this._windowEmergentButtonCancel = new qx.ui.form.Button('Cancel');
			this._windowEmergentButtonAccept = new qx.ui.form.Button('Save');
			this._windowEmergentButtons.add(this._windowEmergentButtonCancel);
			this._windowEmergentButtons.add(this._windowEmergentButtonAccept);
			this._windowEmergent.add(this._windowEmergentContent, {flex: 1});
			this._windowEmergent.add(this._windowEmergentButtons);

			this._windowEmergentButtonCancel.addListener('click', function () {
				this._hideEmergentWindow();
				if (this._listenerPassButton) {
					this.removeListenerById(this._listenerPassButton);
				}
			}, this);

			this.getWindow().add(this._windowEmergent, {top: -51, left: 90});
		},

		_buildTabs: function () {
			var window = this.getWindow();
			this._tabView = new qx.ui.tabview.TabView('left').set({marginBottom: 45});
			window.add(this._tabView, {top: 5, left: 5});
			var tabs = this.self(arguments).general_tabs;
			for (var i = 0; i < tabs.length; ++i) {
				var page = new qx.ui.tabview.Page(tabs[i].name);
				page.setLayout(new qx.ui.layout.VBox());
				page.setUserData('id', tabs[i].id);
				this._tabView.add(page);
				this._buildInnerContentForTab(tabs[i].id);
			}
		},

		_buildInnerContentForTab: function (id) {
			var tab = this._getTabById(id);
			switch (id) {

				/*
				 * General Tab
				 */
				case 1: {
					// INFO
					var infoBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					var infoContainerBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var infoGeneralBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
						marginRight: 20
					});
					var infoImageBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
						marginLeft: 20,
						decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5').set({
							styleRight: null,
							styleTop: null,
							styleBottom: null
						}),
						paddingLeft: 20
					});
					var infoImageButtonsBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var infoTitle = new qx.ui.basic.Label(tr('Info')).set({
						font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']).set({bold: true}),
						textColor: '#333333',
						marginTop: 7,
						marginBottom: 15
					});
					var infoBoxFirstName = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var infoBoxLastName = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var infoBoxUserName = new qx.ui.container.Composite(new qx.ui.layout.HBox());

					var labelFirstName = new qx.ui.basic.Label(tr('First name') + ':').set({
						paddingTop: 3,
						marginRight: 10,
						width: 80,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					var labelLastName = new qx.ui.basic.Label(tr('Last name') + ':').set({
						paddingTop: 3,
						marginRight: 10,
						width: 80,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					var labelUserName = new qx.ui.basic.Label(tr('Username') + ':').set({
						paddingTop: 3,
						marginRight: 10,
						width: 80,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});

					this._inputFirstName = new qx.ui.form.TextField().set({
						width: 200,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						marginBottom: 7,
						textColor: '#404040'
					});
					this._inputLastName = new qx.ui.form.TextField().set({
						width: 200,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						marginBottom: 7,
						textColor: '#404040'
					});
					this._inputUserName = new qx.ui.form.TextField().set({
						width: 200,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						marginBottom: 7,
						textColor: '#404040'
					});
					this._inputUserName.setEnabled(false);

					this._inputImage = new qx.ui.basic.Image().set({
						width: 85,
						height: 85,
						allowGrowX: false,
						allowGrowY: false,
						marginBottom: 6,
						padding: 7,
						scale: true,
						decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5')
					});

					this._buttonChangeImage = new qx.ui.form.Button(tr('Change')).set({
						height: 15,
						margin: 0,
						padding: 1,
						font: new qx.bom.Font(11, ['Helvetica', 'Arial', 'Sans-serif']),
						allowGrowY: false
					});
					this._buttonDeleteImage = new qx.ui.form.Button(tr('Delete')).set({
						height: 15,
						marginLeft: 2,
						padding: 1,
						font: new qx.bom.Font(11, ['Helvetica', 'Arial', 'Sans-serif']),
						allowGrowY: false
					});

					infoBoxFirstName.add(labelFirstName);
					infoBoxFirstName.add(this._inputFirstName);
					infoBoxLastName.add(labelLastName);
					infoBoxLastName.add(this._inputLastName);
					infoBoxUserName.add(labelUserName);
					infoBoxUserName.add(this._inputUserName);
					infoBox.add(infoTitle);
					infoGeneralBox.add(infoBoxFirstName);
					infoGeneralBox.add(infoBoxLastName);
					infoGeneralBox.add(infoBoxUserName);
					infoImageBox.add(this._inputImage);
					infoImageButtonsBox.add(this._buttonChangeImage);
					infoImageButtonsBox.add(this._buttonDeleteImage);
					infoImageBox.add(infoImageButtonsBox);
					infoContainerBox.add(infoGeneralBox);
					//infoContainerBox.add(new qx.ui.toolbar.Separator());
					infoContainerBox.add(infoImageBox);
					infoBox.add(infoContainerBox);
					tab.add(infoBox);

					// MAIL

					var mailBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					var mailTitle = new qx.ui.basic.Label(tr('Mail')).set({
						font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']).set({bold: true}),
						textColor: '#333333',
						marginTop: 7,
						marginBottom: 15
					});
					this._mailBoxContent = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					this._mailBoxAddMail = new qx.ui.form.Button(tr('Add New e-Mail')).set({
						marginTop: 10,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						marginBottom: 15,
						maxWidth: 150,
						width: 150,
						height: 20
					});

					mailBox.add(mailTitle);
					mailBox.add(this._mailBoxContent);
//					mailBox.add(this._mailBoxAddMail);
					tab.add(mailBox);
					this._buildMails();

					// Language
					var langItems = new Object();
					langItems['ca'] = 'Català';
					langItems['en'] = 'English';
					langItems['ar'] = 'Arab';
					langItems['bg'] = 'Bulgarian';
					langItems['fr'] = 'French';
					langItems['ja'] = 'Japanese';
					langItems['es'] = 'Spanish';
					langItems['sv'] = 'Swedish';
					langItems['thai'] = 'Thai';
					langItems['vn'] = 'Vietnamese';
					langItems['pt-br'] = 'Brazilian portuguese'
					langItems['lt'] = 'Lithuanian';
					langItems['sk'] = 'Slovak';
					langItems['de'] = 'German';
					langItems['pt'] = 'Portuguese';
					langItems['cn'] = 'Chinese simplified';
					langItems['pl'] = 'Polish';
					langItems['tc'] = 'Traditional chinese';
					langItems['fi'] = 'Suomi';
					langItems['hu'] = 'Hungarian';
					langItems['sr'] = 'Serbian';
					langItems['ro'] = 'Romanian';
					langItems['id'] = 'Indonesian';
					langItems['ru'] = 'Russian';
					langItems['bn'] = 'Bengali';
					langItems['no'] = 'Norvegian';
					langItems['fa'] = 'Persian';
					langItems['it'] = 'Italian';
					langItems['mn'] = 'Mongolian';
					langItems['tr'] = 'Turkish';
					langItems['si'] = 'Sinhala';
					langItems['hi'] = 'Hindi';
					langItems['sl'] = 'Slovene';
					langItems['pa'] = 'Punjabi';
					langItems['el'] = 'Greek';
					langItems['nl'] = 'Dutch';
					langItems['ko'] = 'Korean';
					langItems['he'] = 'Hebrew';
					langItems['ka'] = 'Georgian';
					langItems['cs'] = 'Czech';
					langItems['ta'] = 'Tamil';

					var items = new Array();

					this._languageSelector = new qx.ui.form.SelectBox();

					var i = 0;
					for (var f in langItems) {
						var item = new qx.ui.form.ListItem(langItems[f]);
						item.set({model: f});
						items.push(item);
						this._languageSelector.add(items[items.length -1]);
						if (this.getLanguage() == f) {
							this._languageSelector.setSelection([items[items.length -1]]);
						}
						i++;
					}

					var langBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
						marginBottom: 15
					});
					var langTitle = new qx.ui.basic.Label(tr('Language')).set({
						font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']).set({bold: true}),
						textColor: '#333333',
						marginTop: 7,
						marginBottom: 15
					});
					var langSelect = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var langLabel = new qx.ui.basic.Label(tr('Select your language: ')).set({
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666',
						marginTop: 7
					});
					
					langBox.add(langTitle);
					langSelect.add(langLabel);
					langSelect.add(this._languageSelector);
					langBox.add(langSelect);
					var separator = new qx.ui.menu.Separator();
					tab.add(langBox);
					tab.add(separator);
					

					// Final Buttons

					var buttonBox = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
						alignX: 'left'
					}));
					this._buttonDeleteAccount = new qx.ui.form.Button(tr('Delete Account')).set({
						marginTop: 10,
						marginBottom: 15,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						marginRight: 15,
						maxWidth: 150,
						width: 150,
						height: 20
					});

					this._buttonChangePassword = new qx.ui.form.Button(tr('Change Password')).set({
						marginTop: 10,
						marginBottom: 15,
						maxWidth: 150,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						width: 150,
						height: 20
					});

					buttonBox.add(this._buttonDeleteAccount);
					buttonBox.add(this._buttonChangePassword);
					tab.add(buttonBox);

					// FILL PART
					this._inputFirstName.setValue(this.getFirstName());
					this._inputLastName.setValue(this.getLastName());
					this._inputUserName.setValue(this.getUserName());

					break;
				}

				/*
				 * Desktop & Dashboard
				 */
				case 2: {
					var tabView = new qx.ui.tabview.TabView('top').set({marginTop: 5, contentPadding: 0});
					tabView.getChildControl('bar').set({marginLeft: 140});
					tabView.getChildControl('pane').set({decorator: null, decorator: new qx.ui.decoration.Single(1, 'solid', '#666666').set({styleBottom: null, styleRight: null, styleLeft: null})});
					tab.add(tabView);
					// View Tab
					var viewTab = new qx.ui.tabview.Page(tr('View')).set({
						layout: new qx.ui.layout.VBox()
					});
					tabView.add(viewTab);

					var infoBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					var infoTitle = new qx.ui.basic.Label(tr('Info')).set({
						font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']).set({bold: true}),
						textColor: '#333333',
						marginTop: 15,
						marginBottom: 15
					});
					var infoBoxClassicDesktop = new qx.ui.form.RadioButton(tr('Classic Desktop')).set({
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					var infoBoxDashboard = new qx.ui.form.RadioButton(tr('Dashboard')).set({
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					infoBoxClassicDesktop.set({model: 'classic'});
					infoBoxDashboard.set({model: 'dashboard'});
					this._desktopTabInfoRadioGroup = new qx.ui.form.RadioButtonGroup();
					this._desktopTabInfoRadioGroup.add(infoBoxClassicDesktop);
					this._desktopTabInfoRadioGroup.add(infoBoxDashboard);
					infoBox.add(infoTitle);
					infoBox.add(this._desktopTabInfoRadioGroup);
					viewTab.add(infoBox);

					var separator = new qx.ui.menu.Separator().set({
						marginTop: 15,
						marginBottom: 7
					});
					viewTab.add(separator);

					this._columnsBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					var columnsTitle = new qx.ui.basic.Label(tr('Columns')).set({
						font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']).set({bold: true}),
						textColor: '#333333',
						marginTop: 7,
						marginBottom: 15
					});
					this._desktopTabColumnsRadioGroup = new qx.ui.form.RadioButtonGroup(new qx.ui.layout.HBox());
					var columnsLabel2Columns = new qx.ui.form.RadioButton(tr('2 Columns')).set({
						width: 150,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666',
						model: 2
					});
					var columnsLabel3Columns = new qx.ui.form.RadioButton(tr('3 Columns')).set({
						width: 150,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666',
						model: 3
					});
					var columnsLabel4Columns = new qx.ui.form.RadioButton(tr('4 Columns')).set({
						width: 150,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666',
						model: 4
					});
					this._desktopTabColumnsRadioGroup.add(columnsLabel2Columns);
					this._desktopTabColumnsRadioGroup.add(columnsLabel3Columns);
					this._desktopTabColumnsRadioGroup.add(columnsLabel4Columns);

					var columnsImagesContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					for (var i = 0; i < 3; ++i) {
						columnsImagesContainer.add(this._constructDashBoardColumnsImage(i+1));
					}

					this._columnsBox.add(columnsTitle);
					this._columnsBox.add(this._desktopTabColumnsRadioGroup);
					this._columnsBox.add(columnsImagesContainer);
					viewTab.add(this._columnsBox);
					var separator2 = new qx.ui.menu.Separator().set({
						marginTop: 15,
						marginBottom: 7
					});
					viewTab.add(separator2);

					this._widgetsBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					var widgetsTitle = new qx.ui.basic.Label(tr('Widgets')).set({
						font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']).set({bold: true}),
						textColor: '#333333',
						marginTop: 7,
						marginBottom: 15
					});
					this._widgetsBox.add(widgetsTitle);
					
					var item = null;

					if (eyeos.getCurrentUserData().metadata['eyeos.desktop.mode'] == 'dashboard') {
						this._populateWidgets();
					}
					
					viewTab.add(this._widgetsBox);

					if (eyeos.getCurrentUserData().metadata['eyeos.desktop.mode'] == 'classic') {
						this._columnsBox.setEnabled(false);
						this._widgetsBox.setEnabled(false);
					}

					// BACKGROUND & WALLPAPER

					var backgroundTab = new qx.ui.tabview.Page(tr('Background')).set({
						layout: new qx.ui.layout.HBox()
					});
					tabView.add(backgroundTab);

					this._listItem = new qx.ui.form.List().set({marginTop: 15, maxWidth: 135, width: 135, marginRight: 15});
					backgroundTab.add(this._listItem);

					var imagesForWallPaper = new qx.ui.container.Composite(new qx.ui.layout.VBox());
					backgroundTab.add(imagesForWallPaper, {flex: 1});

					this._layoutScroll = new qx.ui.container.Scroll().set({
						marginTop: 15,
						width: 320,
						decorator: new qx.ui.decoration.Single(1, 'solid', '#666666'),
						scrollbarY: 'on'
					});
					this._layoutFlow = new qx.ui.container.Composite(new qx.ui.layout.Flow(5,5)).set({
						paddingTop: 5,
						paddingLeft: 5,
						allowShrinkY: false,
						allowGrowX: true,
						allowGrowY: true
					});
					this._layoutScroll.add(this._layoutFlow, {flex: 1});
					imagesForWallPaper.add(this._layoutScroll, {flex: 1});

					var itemsForList =
						[{
							name: 'Nature',
							model: {
								id: 'nature',
								path: 'sys:///extern/images/wallpapers/nature'
							}
						},{
							name: 'Community',
							model: {
								id: 'community',
								path: 'sys:///extern/images/wallpapers/community'
							}
						}, {
							name: 'Separator',
							model: {
								id: 'separator'
							}
						}, {
							name: 'Color',
							model: {
								id: 'color'
							}
						},{
							name: 'User images',
							model: {
								id: 'user',
								path: 'home://~' + eyeos.getCurrentUserName() + '/Images/'
							}
						}];

					for (var i = 0; i < itemsForList.length; ++i) {
						var item;
						if (itemsForList[i].model.id == 'separator') {
							item = new qx.ui.menu.Separator().set({
								textColor: '#666666'
							});
							//item.set({model: itemsForList[i].model});
						} else {
							item = new qx.ui.form.ListItem(itemsForList[i].name);
							item.set({model: itemsForList[i].model});
						}
						this._listItem.add(item);
					}

					this._buttonAddFile = new qx.ui.form.Button(tr('Add from account')).set({maxWidth: 150, marginTop: 5, marginBottom: 5});
					this._buttonUploadFile = new qx.ui.form.Button(tr('Add from computer')).set({maxWidth: 150, marginTop: 5, marginBottom: 5});
					this._buttonAddColor = new qx.ui.form.Button(tr('Add color')).set({maxWidth: 150, marginTop: 5, marginBottom: 5});
					this._buttonAddColor.setVisibility('excluded');

					imagesForWallPaper.add(this._buttonAddColor);
					imagesForWallPaper.add(this._buttonAddFile);
					imagesForWallPaper.add(this._buttonUploadFile);

					this._listItem.addListener('changeSelection', function (e) {
						if (e.getData()[0] instanceof qx.ui.form.ListItem) {
							if (e.getData()[0].getModel().id == 'color') {
								this._buttonAddColor.setVisibility('visible');
								this._buttonAddFile.setVisibility('excluded');
								this._buttonUploadFile.setVisibility('hidden');
								this._populateColors();
							} else {
								this._buttonAddColor.setVisibility('excluded');
								this._buttonAddFile.setVisibility('visible');
								this._buttonUploadFile.setVisibility('visible');
								eyeos.callMessage(this.getChecknum(), 'verifyPath', [e.getData()[0].getModel().path], function (results) {
									eyeos.callMessage(this.getChecknum(), '__FileSystem_browsePath', [e.getData()[0].getModel().path, null, null], function (results) {
										this._populateWallpapers(results);
									}, this);
								}, this);
							}
						}
					}, this);

					break;
				}

				case 4: {
					var tabView = new qx.ui.tabview.TabView('top').set({marginTop: 5, contentPadding: 0});
					tabView.getChildControl('bar').set({marginLeft: 140});
					tabView.getChildControl('pane').set({decorator: null, decorator: new qx.ui.decoration.Single(1, 'solid', '#666666').set({styleBottom: null, styleRight: null, styleLeft: null})});
					tab.add(tabView);

					// System Tab
					var systemTab = new qx.ui.tabview.Page(tr('System')).set({layout: new qx.ui.layout.VBox()});
					var systemChangesProfile = new qx.ui.form.CheckBox(tr('Changes in my profile')).set({
						marginTop: 10,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					var systemChangesLocalFile = new qx.ui.form.CheckBox(tr('Changes in my local files')).set({
						marginTop: 10,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					var systemChangesSharedFile = new qx.ui.form.CheckBox(tr('Changes in my shared files')).set({
						marginTop: 10,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#666666'
					});
					systemTab.add(systemChangesProfile);
					systemTab.add(systemChangesLocalFile);
					systemTab.add(systemChangesSharedFile);
					tabView.add(systemTab);

					// Applications Tab
					var appsTab = new qx.ui.tabview.Page(tr('Applications')).set({layout: new qx.ui.layout.VBox()});
					tabView.add(appsTab);
					break;
				}

				case 7: {
					var scroll = new qx.ui.container.Scroll();
					this._loginApplicationsList = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
						decorator: new qx.ui.decoration.Single(1, 'solid', '#AAAAAA')
					});
					var buttonsBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var button = new qx.ui.form.Button('+').set({marginTop: 5, marginBottom: 5, padding: 2, maxWidth: 23, minWidth: 23, maxHeight: 23, minHeight: 23});
					button.addListener('click', function (e) {
						this._addLoginApplication();
					}, this);
					this._buttonDelApplication = new qx.ui.form.Button('-').set({marginTop: 5, marginBottom: 5, marginLeft: 5, padding: 2, maxWidth: 23, minWidth: 23, maxHeight: 23, minHeight: 23, enabled: false});
					this._buttonDelApplication.addListener('click', function (e) {
						this._deleteLoginApplication();
					}, this);
					scroll.add(this._loginApplicationsList, {flex: 1});
					tab.add(scroll, {flex: 1});
					buttonsBox.add(button);
					buttonsBox.add(this._buttonDelApplication);
					tab.add(buttonsBox);
					this._rebuildLoginApplications();
					break;
				}
			}
		},

		_populateWidgets: function () {
			this._widgetsBox.removeAll();
			this._items = new Array();
                        //TODO24: joca: we need to retrieve this from the server!!!
                        var allwidgets = [
                            {
                                'name':'desktop',
                                'title': 'Desktop'
                            },{
                                'name':'events',
                                'title': 'Events'
                            },{
                                'name':'favorites',
                                'title': 'Favorites'
                            },{
                                'name':'files',
                                'title': 'Files'
                            },{
                                'name':'groups',
                                'title': 'My Groups'
                            },{
                                'name':'notes',
                                'title': 'Notes'
                            },
                        ];
			for(var i in allwidgets) {
				var item = new qx.ui.form.CheckBox(tr(allwidgets[i].title));
				this._items.push(item);
				this._widgetsBox.add(item);

                                for(var x in document.widgets) {
                                    if(document.widgets[x].value == allwidgets[i].name) {
                                        item.setValue(true);
                                        item.setUserData('widget', document.widgets[x]);
                                    }
                                    
                                }

                                item.setUserData('wValue', allwidgets[i].name);
                                
                                //I prefer to use self to save this pointer
                                //instead of maintaining the context, and use getTarget().
                                var self = this;
				item.addListener('changeValue', function(e) {
					var obj = item.getUserData('obj');
					if (this.getValue()) {
						eyeos.callMessage(self.getChecknum(), 'ShowHideWidget', [this.getUserData('wValue'), 'true'], function() {});
                                                desktop.WidgetManager.getInstance().addWidget(this.getUserData('wValue'));
					} else {
						eyeos.callMessage(self.getChecknum(), 'ShowHideWidget', [this.getUserData('wValue'), 'false'], function() {});
						this.getUserData('widget').widget.close();
                                                for(var x in document.widgets) {
                                                    if(document.widgets[x].value == this.getUserData('wValue')) {
                                                        document.widgets.splice(x, 1);
                                                    }
                                                }
					}
				});
			}
		},

		_populateWallpaper: function(result, path) {
			var meta = eyeos.getCurrentUserData().metadata;
			var pathToCheck = 'home://~' + eyeos.getCurrentUserName() + '/Images';
			var url;
			var img;
			var postData;
			img = 'index.php?checknum='+this.getChecknum()+'&message=getScaledImage&params[path]='+ result.absolutepath;

			var itemBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				decorator: new qx.ui.decoration.Single(2, 'solid', '#606060')
			});

			var item = new qx.ui.basic.Image(img).set({
				width: 50,
				height: 50,
				minWidth: 50,
				minHeight: 50,
				allowShrinkY: false,
				allowShrinkX: false,
				scale: true,
				decorator: new qx.ui.decoration.Single(2, 'solid', 'transparent')
			});

			//				if (files[i].absolutepath == this.getWallpaper() && meta['eyeos.user.desktop.wallpaperMode'] == 'image') {
			//					item.setDecorator(new qx.ui.decoration.Single(1, 'dotted', '#808080'));
			//				}

			item.setUserData('path', result.absolutepath);

			//				item.addListener('mouseover', function (e) {
			//					if (this.getUserData('path') != meta['eyeos.user.desktop.wallpaper']) {
			//						this.setDecorator(new qx.ui.decoration.Single(1, 'solid', '#000080'));
			//					}
			//				});
			//
			//				item.addListener('mouseout', function (e) {
			//					if (this.getUserData('path') != meta['eyeos.user.desktop.wallpaper']) {
			//						this.setDecorator(new qx.ui.decoration.Single(1, 'solid', 'transparent'));
			//					}
			//				});

			var self = this;
			//if (item instanceof qx.ui.form.ListItem ) {
			item.addListener('click', function (e) {
				self.setWallpaperMode('image');
				self.setWallpaper(this.getUserData('path'));
				self.setWallpaperId(self._listItem.getSelection()[0].getModel().id);
				var dbus = eyeos.messageBus.getInstance();
				dbus.send('desktop', 'changeWallpaper', [self.getWallpaperMode(), self.getWallpaper()]);
				var childrens = self._layoutFlow.getChildren();
				for (var i = 0; i < childrens.length; ++i) {
					if (childrens[i].getChildren()[0].toString() == this.toString()) {
						this.getLayoutParent().set({
							decorator: new qx.ui.decoration.Single(4, 'solid', '#000080')
						});
					} else {
						childrens[i].set({
							decorator: new qx.ui.decoration.Single(2, 'solid', '#808080')
						});
					}
				}
			});
			//}
			itemBox.add(item);
			this._layoutFlow.add(itemBox);
		},

		_populateWallpapers: function (results) {
			var imagesExtensions = ['JPG', 'GIF', 'PNG'];
			this._layoutFlow.removeAll();
			var path = results.absolutepath;
			var files = results.files;
			for (var i = 0; i < files.length; ++i) {
				if (imagesExtensions.indexOf(files[i].extension.toUpperCase()) != -1) {
					this._populateWallpaper(files[i], path);
				}
			}
		},

		_populateColors: function () {
			var colors = this.getBackgroundColors();
			var meta = eyeos.getCurrentUserData().metadata;
			this._layoutFlow.removeAll();
			var self = this;
			for (var i in colors) {
				var itemBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
					padding: 1,
					decorator: new qx.ui.decoration.Single(2, 'solid', '#606060')
				});
				var item = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
					width: 50,
					height: 50,
					allowGrowX: false,
					allowGrowY: false,
					backgroundColor: i,
					decorator: new qx.ui.decoration.Single(2, 'solid', 'transparent')
				});

//				if (colors[i] == 'true' && meta['eyeos.user.desktop.wallpaperMode'] == 'color') {
//					item.setDecorator(new qx.ui.decoration.Single(1, 'dotted', '#808080'))
//				}

				item.addListener('click', function (e) {
					var colors = self.getBackgroundColors();
					self.setWallpaperMode('color');
					var dbus = eyeos.messageBus.getInstance();
					dbus.send('desktop', 'changeWallpaper', [self.getWallpaperMode(), this.getBackgroundColor()]);
					var f = 0;
					var childrens = self._layoutFlow.getChildren();
					for (var i in colors) {
						childrens[f].setDecorator(new qx.ui.decoration.Single(2, 'solid', '#808080'));
						if (i == this.getBackgroundColor()) {
							colors[i] = 'true';
							childrens[f].setDecorator(new qx.ui.decoration.Single(4, 'solid', '#000080'));
						} else {
							colors[i] = 'false';
						}
						f++;
					}
				});
				itemBox.add(item);
				this._layoutFlow.add(itemBox);
			}
		},

		_addNewColor: function () {
			var colorSelector = new qx.ui.control.ColorPopup();
			colorSelector.placeToWidget(this._buttonAddColor);
			colorSelector.show();

			colorSelector.addListener('changeValue', function (e) {
				this.getBackgroundColors()[e.getData()] = 'false';
				this._populateColors();
			}, this)
		},

		_addNewMail: function () {
			this._windowEmergentContent.removeAll();
			var newMailContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			var label = new qx.ui.basic.Label(tr('New e-mail'));
			this._newMailInput = new qx.ui.form.TextField().set({
				width: 250
			});

			newMailContainer.add(label);
			newMailContainer.add(this._newMailInput);
			this._windowEmergentContent.add(newMailContainer, {flex: 1});
			this._newMailInput.focus();
			this._newMailInput.selectAllText();
			
			this._windowEmergentButtonAccept.addListenerOnce('click', this.__addMail, this);

			this._showEmergentWindow();
		},

		__addMail: function () {
			// Check e-mail address
			var re = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
			if (!this._newMailInput.getValue().match(re)) {
				this._windowEmergentButtonAccept.addListenerOnce('click', this.__addMail, this);
				eyeos.alert(tr('Given mail is not correct.'));
				return;
			}

			this.getMails().push({mailName: this._newMailInput.getValue(), mailId: Math.floor(Math.random()*11), confirmed: false, userId: 'fake_eyeos_userID'});
			this._hideEmergentWindow();
			this._buildMails();
		},

		_changePassword: function () {
			this._windowEmergentContent.removeAll();
			var oldPassContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({marginBottom: 15});
			var newPassContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({marginBottom: 5});
			var verPassContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({marginBottom: 5});

			var oldPassLabel = new qx.ui.basic.Label(tr('Old password') + ':').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				paddingTop: 3,
				marginLeft: 10,
				marginRight: 10,
				width: 120,
				textColor: '#666666'
			});
			var newPassLabel = new qx.ui.basic.Label(tr('New password') + ':').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				width: 120,
				paddingTop: 3,
				marginLeft: 10,
				marginRight: 10,
				textColor: '#666666'
			});
			var verPassLabel = new qx.ui.basic.Label(tr('Verify password') + ':').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				width: 120,
				paddingTop: 3,
				marginLeft: 10,
				marginRight: 10,
				textColor: '#666666'
			});

			this._oldPassInput = new qx.ui.form.PasswordField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				width: 180,
				textColor: '#999999'
			});
                        this._oldPassInput.setTabIndex(1);
			this._newPassInput = new qx.ui.form.PasswordField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				width: 180,
				textColor: '#999999'
			});
                        this._newPassInput.setTabIndex(1);
			this._verPassInput = new qx.ui.form.PasswordField().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				width: 180,
				textColor: '#999999'
			});
                        this._verPassInput.setTabIndex(1);

			this._oldPassInput.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._saveNewPassword();
				}
			}, this);

			this._newPassInput.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._saveNewPassword();
				}
			}, this);

			this._verPassInput.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._saveNewPassword();
				}
			}, this);

			oldPassContainer.add(oldPassLabel);
			oldPassContainer.add(this._oldPassInput);
			newPassContainer.add(newPassLabel);
			newPassContainer.add(this._newPassInput);
			verPassContainer.add(verPassLabel);
			verPassContainer.add(this._verPassInput);

			this._windowEmergentContent.add(oldPassContainer);
			this._windowEmergentContent.add(newPassContainer);
			this._windowEmergentContent.add(verPassContainer);

			this._showEmergentWindow();
			if (!this._listenerPassButton) {
				this._listenerPassButton = this._windowEmergentButtonAccept.addListener('click', this._saveNewPassword, this);
			}
		},

		_saveNewPassword: function () {
			if (!this._newPassInput.getValue() || !this._verPassInput.getValue()) {
				var op = new eyeos.dialogs.OptionPane(
					tr("The new password cannot be empty."),
					eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
				op.createDialog(null, tr('User Settings')).open();
				return;
			}

			// Feedback for password changed should be added
			if (this._newPassInput.getValue() == this._verPassInput.getValue()) {
				eyeos.callMessage(this.getChecknum(), 'changePassword', [this._oldPassInput.getValue(), this._newPassInput.getValue()], function (results) {
//					var bus = eyeos.messageBus.getInstance();
//					bus.store('secretkey', results);
					var op = new eyeos.dialogs.OptionPane(
						tr("The passwords has been changed correctly"),
						eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
					op.createDialog(null, tr('User Settings')).open();
					this._hideEmergentWindow();
					this.removeListenerById(this._listenerPassButton);
				}, this, {
					onException:
					function () {
						var op = new eyeos.dialogs.OptionPane(
							tr("The old password you've just entered is not correct"),
							eyeos.dialogs.OptionPane.WARNING_MESSAGE);
						op.createDialog(null, tr('User Settings')).open();
					},
					hideException: true
				});
			} else {
				var op = new eyeos.dialogs.OptionPane(
					tr("The passwords that you inserted didn't match"),
					eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
				op.createDialog(null, tr('User Settings')).open();
			}
		},

		_deleteAccount: function () {
			this._windowEmergentContent.removeAll();
			var labelQuestion = new qx.ui.basic.Label(tr('Are you sure you want to delete the account?')).set({
				font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']),
				rich: true,
				marginBottom: 5,
				textColor: '#666666'
			});
			var labelLost = new qx.ui.basic.Label(tr('All your files and contacts will be lost and you won\'t be able to go back.')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				rich: true,
				marginBottom: 10,
				textColor: '#999999'
			});
			this._windowEmergentContent.add(labelQuestion);
			this._windowEmergentContent.add(labelLost);
			this._windowEmergentButtonAccept.setLabel(tr('Delete & Log-me out'))
			this._windowEmergentButtonAccept.addListenerOnce('click', function () {
				this._deleteAccountOK();
			}, this);
			this._showEmergentWindow();
		},

		_deleteAccountOK: function () {
			try {
				eyeos.callMessage(this.getChecknum(), 'deleteUser', null, function (e) {
				    eyeos.execute('logout', this.getChecknum());
				}, this);
			} catch (e) {
				eyeos.consoleLog(e);
			}
		},

		_deleteMailAccount: function (id) {
			this._windowEmergentContent.removeAll();
			var label = new qx.ui.basic.Label(tr('Are you sure you want to remove this email account?')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				rich: true,
				marginBottom: 10,
				textColor: '#999999'
			});
			this._windowEmergentContent.add(label);
			this._windowEmergentButtonAccept.addListenerOnce('click', function () {
				this._deleteMailAccountOK(id);
			}, this);
			this._showEmergentWindow();
		},

		_deleteMailAccountOK: function (id) {
			var mails = this.getMails();
			for (var i = 0; i < mails.length; ++i) {
				if (mails[i].mailId == id) {
					mails = mails.splice(i, 1);
					i = mails.length + 1;
				}
			}
			this._hideEmergentWindow();
			this._buildMails();
		},

		_addLoginApplication: function () {
			this._windowEmergentContent.removeAll();
			var labelQuestion = new qx.ui.basic.Label(tr('Select the applications to add: ')).set({
				font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']),
				rich: true,
				marginBottom: 5,
				textColor: '#666666'
			});
			
			var list = new qx.ui.form.List().set({selectionMode: 'additive'});

			var items = this.getLoginApplications();
			for (var i in items) {
				if (items[i] == 'false') {
					var item = new qx.ui.form.ListItem(this._returnApplicationName(i));
					item.set({model: i});
					list.add(item);
				}
			}

			this._windowEmergentContent.add(labelQuestion);
			this._windowEmergentContent.add(list);
			this._windowEmergentButtonAccept.addListenerOnce('click', function () {
				this._addLoginApplicationsOK(list.getSelection());
			}, this);
			this._showEmergentWindow();
		},

		_addLoginApplicationsOK: function (data) {
			var items = this.getLoginApplications();
			for (var i = 0; i < data.length; ++i) {
				for (var f in items) {
					if (f == data[i].getModel()) {
						items[f] = 'true';
					}
				}
			}
			this._rebuildLoginApplications();
			this._hideEmergentWindow();
		},

		_deleteLoginApplication: function(application) {
			this._windowEmergentContent.removeAll();
			var labelQuestion = new qx.ui.basic.Label(tr('Are you sure you want to delete this applications?')).set({
				font: new qx.bom.Font(14, ['Helvetica', 'Arial', 'Sans-serif']),
				rich: true,
				marginBottom: 5,
				textColor: '#666666'
			});
			this._windowEmergentContent.add(labelQuestion);
			this._windowEmergentButtonAccept.setLabel(tr('Accept'))
			this._windowEmergentButtonAccept.addListenerOnce('click', function () {
				this._deleteLoginApplicationOK();
			}, this);
			this._showEmergentWindow();
		},

		_deleteLoginApplicationOK: function () {
			var childrens = this.getLoginApplications();
			var appChildrens = this._loginApplicationsList.getChildren();
			for (var i = 0; i < appChildrens.length; ++i) {
				if (appChildrens[i].isSelected()) {
					for (var f in childrens) {
						if (appChildrens[i].getExecutable() == f) {
							childrens[f] = 'false';
						}
					}
				}
			}
			
			this._rebuildLoginApplications();
			this._hideEmergentWindow();
			
			if (appChildrens.length == 0) {
				this._buttonDelApplication.setEnabled(false);
			}
		},

		_rebuildLoginApplications: function () {
			this._loginApplicationsList.removeAll();

			var items = this.getLoginApplications();
			var f = 0;
			for (var i in items) {
				if (items[i] == 'true') {
					var color;
					if (f % 2 == 0) {
						//color = '#EDEDED'
						color = '#FFFFFF'
					} else {
						color = '#ECECEC'
					}
					var name = this._returnApplicationName(i);
					var realName = i;
					var item = new eyeos.gui.auxiliar.loginApplication(this, name, realName, color);
					this._loginApplicationsList.add(item, {flex: 1});
					f++;
				}
			}
		},

		_returnApplicationName: function (name) {
			var apps = this.getAllApplications();
			for (var i = 0; i < apps.length; ++i) {
				if (apps[i].name == name) {
					return apps[i].meta['eyeos.application.name'];
				}
			}
		},

		_constructDashBoardColumnsImage: function (howMany) {
			var columnsImage = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				width: 130,
				decorator: new qx.ui.decoration.Single(1, 'solid', '#666666'),
				height: 90,
				marginRight: 20,
				marginTop: 5
			});
			columnsImage.setUserData('model', howMany+1);
			var columnsImageColumn = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				backgroundColor: '#999999'
			});
			for (var i = 0; i <= howMany; ++i) {
				var columnsImageColumn = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
					backgroundColor: '#999999',
					margin: 5
				});
				columnsImage.add(columnsImageColumn, {flex: 1});
			}
			var self = this._desktopTabColumnsRadioGroup;
			columnsImage.addListener('click', function (e) {
				var childrens = self.getChildren();
				for (var i = 0; i < childrens.length; ++i) {
					if (childrens[i] instanceof qx.ui.form.ListItem && childrens[i].getModel() == this.getUserData('model')) {
						self.setSelection([childrens[i]]);
					}
				}
			});
			return columnsImage;
		},

		_buildMails: function () {
			var mails = this.getMails();
			this._mailBoxContent.removeAll();
			this._radioGroup = new qx.ui.form.RadioButtonGroup();
			this._mailBoxContent.add(this._radioGroup);
			for (var i = 0; i < mails.length; ++i) {
				console.log(mails[i]); 
				if (mails[i].confirmed == true) {
					if (i > 0) {
						var item = new eyeos.gui.form.RadioButton(mails[i].mailName, mails[i].mailId, this);
					} else {
						var item = new qx.ui.form.RadioButton(mails[i].mailName);
						item.getChildControl('label').set({
							font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
							textColor: '#666666'
						});
					}
					item.setUserData('id', mails[i].mailId);
					this._radioGroup.add(item);
				} else {
					var item = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
						marginTop: 7,
						marginBottom: 7,
						padding: 10,
						decorator: new qx.ui.decoration.Single(1, 'solid', '#4D4D4D'),
						backgroundColor: '#F3F3F3'
					});
					item.setUserData('id', mails[i].mailId);
					var label = new qx.ui.basic.Label(tr('<span style="line-height: 20px;">You have requested the email address <span style="font-style: italic">') + mails[i].mailName + '</span>. ' + tr('An email has been sent there to make sure it is a valid address.</span>')).set({
						rich: true,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#333333',
						marginBottom: 7
					});
					item.add(label);
					var mails = this.getMails();
					var mailBar = new qx.ui.container.Composite(new qx.ui.layout.HBox());
					var confMail = new qx.ui.form.Button(tr('Resend confirmation mail')).set({
						marginRight: 5,
						marginLeft: -7,
						decorator: null,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#00204D',
						cursor: 'pointer'
					});

					var separator = new qx.ui.toolbar.Separator().set({
						minHeight: 15,
						height: 15,
						margin: 0,
						padding: 0,
						maxHeight: 15,
						textColor: '#00204D'
					});

					var cancReq = new qx.ui.form.Button(tr('Cancel request')).set({
						marginLeft: 5,
						decorator: null,
						font: new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
						textColor: '#00204D',
						cursor: 'pointer'
					});

					var self = this;

					cancReq.addListener('click', function (e) {
						self._deleteMailAccount(this.getUserData('id'));
					}, item);
					
					mailBar.add(confMail);
					mailBar.add(separator);
					mailBar.add(cancReq);

					item.add(mailBar);
					this._mailBoxContent.add(item);
				}
			}

			this._radioGroup.addListener('changeSelection', function (e) {
				var selectedItem = e.getData()[0];
				this._windowEmergentContent.removeAll();
				var label = new qx.ui.basic.Label(tr('Are you sure that you want to make this account the default one?'));
				this._windowEmergentContent.add(label);
				this._showEmergentWindow();

				this._windowEmergentButtonAccept.addListenerOnce('click', function () {
					var mails = this.getMails();
					var index = 0;
					for (var i = 0; i < mails.length; ++i) {
						if (mails[i].mailId == selectedItem.getUserData('id')) {
							index = i;
							i = mails.length + 1;
						}
					}
					this._hideEmergentWindow();
					var statusConfirmed = mails[index].confirmed;
					this.getMails().splice(index, 1);
					this.getMails().unshift({mailName: selectedItem.getLabel(), confirmed: statusConfirmed, mailId: selectedItem.getUserData('id'), userId: 'elquetoque'});
					this._buildMails();
					//this.setActiveMail(selectedItem.getUserData('id'))
				}, this);

				this._windowEmergentButtonCancel.addListenerOnce('click', function () {
					this._buildMails();
				}, this);			
			}, this);
		},

		_getTabById: function (id) {
			var tabs = this._tabView.getChildren();
			for (var i = 0; i < tabs.length; ++i) {
				if (tabs[i].getUserData('id') == id) {
					return tabs[i];
				}
			}
		},

		_showEmergentWindow: function () {
			var bounds = this._windowEmergent.getBounds();
			var move = new qx.fx.effect.core.Move(this._windowEmergent.getContainerElement().getDomElement()).set({
				duration: 0.15
			});
			move.setY(bounds.height);
			move.setX(0);
			this.setActiveWindowEmergent(true);
			move.start();
//			this._tabView.setEnabled(false);
		},

		_hideEmergentWindow: function () {
			var bounds = this._windowEmergent.getBounds();
			var move = new qx.fx.effect.core.Move(this._windowEmergent.getContainerElement().getDomElement()).set({
				duration: 0.15
			});
			move.setY(parseInt(-1*bounds.height));
			this.setActiveWindowEmergent(false);
			move.start();
			move.addListener('finish', function () {
				this._windowEmergentButtonAccept.setLabel(tr('Accept'));
				this._windowEmergentButtonAccept.setVisibility('visible');
				this._windowEmergentButtonCancel.setVisibility('visible');
			}, this);
			this._tabView.setEnabled(true);
		},

		close: function () {
			if (!this._saved) {
				var meta = eyeos.getCurrentUserData().metadata;
				var dbus = eyeos.messageBus.getInstance();
				var item;
				if (meta['eyeos.user.desktop.wallpaperMode'] == 'color') {
					var colors =  meta['eyeos.user.desktop.backgroundColors'];
					for (var i in colors) {
						if (colors[i] == 'true') {
							item = i;
						}
					}
				} else {
					item = meta['eyeos.user.desktop.wallpaper'];
				}

                                if(meta['eyeos.desktop.mode'] != this._desktopTabInfoRadioGroup.getSelection()[0].getModel()) {
                                    dbus.send('desktop', 'changesDashboard', [meta['eyeos.desktop.mode'], this._desktopTabInfoRadioGroup.getSelection()[0].getModel(), meta['eyeos.desktop.dashboard.nbcolumns']]);
                                }
				dbus.send('desktop', 'changeWallpaper', [meta['eyeos.user.desktop.wallpaperMode'], item]);
			}
			this.base(arguments);
		},

		_saveAndClose: function () {

			this.setFirstName(this._inputFirstName.getValue());
			this.setLastName(this._inputLastName.getValue());
			this.setUserName(this._inputUserName.getValue());
			this.setLanguage(this._languageSelector.getSelection()[0].getModel())
			var dbus = eyeos.messageBus.getInstance();
			var meta = eyeos.getCurrentUserData().metadata;

			if (this._desktopTabInfoRadioGroup.getSelection()[0].getModel() != this.getDesktopMode() || this._desktopTabColumnsRadioGroup.getSelection()[0].getModel() != this.getDashboardColumns()) {
				this.setDesktopMode(this._desktopTabInfoRadioGroup.getSelection()[0].getModel());
				this.setDashboardColumns(this._desktopTabColumnsRadioGroup.getSelection()[0].getModel());
				dbus.send('desktop', 'changesDashboard', [this.getDesktopMode(), meta['eyeos.desktop.mode'], this.getDashboardColumns()]);
			}

			var toSave = {
				'eyeos.user.email': this.getMails()[0].mailName,
				'eyeos.user.firstname': this.getFirstName(),
				'eyeos.user.id': this.getUserId(),
				'eyeos.user.lastname': this.getLastName(),
				'eyeos.user.nickname': this.getUserName(),
				'eyeos.user.language': this.getLanguage(),
				'eyeos.user.picture.url': this.getUserImage(),
				'eyeos.desktop.mode': this.getDesktopMode(),
				'eyeos.user.desktop.wallpaperMode': this.getWallpaperMode(),
				'eyeos.user.desktop.wallpaper': this.getWallpaper(),
				'eyeos.desktop.dashboard.nbcolumns': this.getDashboardColumns(),
				'eyeos.user.desktop.backgroundColors': this.getBackgroundColors(),
				'eyeos.user.applications.onLogin': this.getLoginApplications(),
				'eyeos.user.desktop.wallpaperId': this.getWallpaperId()
			}

			var diffLang = false;
			if (this.getLanguage() != meta['eyeos.user.language']) {
				diffLang = true;
			}

			for (var i in toSave) {
				eyeos.getCurrentUserData().metadata[i] = toSave[i];
			}

			eyeos.callMessage(this.getChecknum(), 'saveSettings', toSave, function (results) {
				this._saved = true;
				this.getWindow().close();
				if (diffLang) {
					var op = new eyeos.dialogs.OptionPane(tr("To apply the new language you must restart your session."), eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
					op.createDialog(null, tr('User Settings')).open();
				}
			}, this);

			var positions = document.eyeDashBoard.getAllWidgetsPositions();
			eyeos.callMessage(this.getChecknum(), 'savePositionsWidget', positions);
		}
	},

	properties: {
		allApplications: {
			check: 'Array',
			init: new Array()
		},
		window: {
			check: 'Object',
			init: null
		},

		userId: {
			check: 'String',
			init: null
		},

		language: {
			check: 'String',
			init: null
		},

		backgroundColors: {
			check: 'Object',
			init: null
		},

		activeWindowEmergent: {
			check: 'Boolean',
			init: false
		},

		mails: {
			check: 'Array',
			init: new Array()
		},

		firstName: {
			check: 'String',
			init: null
		},

		lastName: {
			check: 'String',
			init: null
		},

		userName: {
			check: 'String',
			init: null
		},

		userImage: {
			check: 'String',
			init: null
		},

		password: {
			check: 'String',
			init: null
		},

		loginApplications: {
			check: 'Array',
			init: new Array()
		},

		dashboardColumns: {
			check: 'Integer',
			init: null
		},

		desktopMode: {
			check: 'String',
			init: null
		},

		metaKey: {
			check: 'Boolean',
			init: false
		},

		wallpaperId: {
			check: 'Integer',
			init: null
		},

		wallpaperMode: {
			check: 'String',
			init: null
		},

		wallpaper: {
			check: 'String',
			init: null
		}
	},

	statics: {		
		general_tabs:
			[{
				name: 'General',
				id: 1
			}, {
				name: 'Desktop/Dashboard',
				id: 2
			}
//			{
//				name: 'Login aplications',
//				id: 7
//			}
			]
	}

});