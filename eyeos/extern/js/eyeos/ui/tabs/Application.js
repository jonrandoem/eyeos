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
 * This is the Item for Application when Application Tabs is selected
 */
qx.Class.define('eyeos.ui.tabs.Application', {
	extend: eyeos.ui.tabs.Item,

	properties: {
		realName: {
			check: 'String'
		},
		favorite: {
			check: 'Boolean',
			event: 'toggleFavorite'
		},
		installed: {
			check: 'Boolean'
		},
		originalName: {
			check: 'String'
		},
		imagePath: {
			check: 'String'
		}
	},

	construct: function (name, realName, description, imagePath, status, page) {
		this.base(arguments);

		//adding "BETA" to name of applications
//		var warningApps = ['Calendar','Documents','Mail Client', 'Spreadsheets', 'Editor'];
//		if (warningApps.indexOf(name) >= 0 ) {
//			name = name + ' <span style="color: red">(beta)</span>';
//		}

		this.setOriginalName(name)
		this.setName(name);
		this.setRealName(realName);
		this.setDescription(description);
		this.setDescriptionTooltip(description);

		imagePath = imagePath +'&nocache=' + eyeos.utils.getRandomValue();
		this.setImagePath(imagePath);
		this.setPage(page);
		this.setImage(imagePath);
		
		if (page.getContext() == 'All'){
			this.setFavorite(status);
		} else {
			this.setInstalled(status);
		}

		this._updateLayout();
		
	},

	members: {
		_imageStarFull: 'index.php?extern=images/rate_on.png',
		_imageStarEmpty: 'index.php?extern=images/rate_off.png',
		_imagePlus: 'index.php?extern=images/new.png',
		_imageAdded: 'index.php?extern=images/22x22/actions/dialog-ok-apply.png',
		
		_updateLayout: function () {
			if (this.getPage().getContext() == 'All'){
				this._updateLayoutAdded();
			} else {
				this._updateLayoutToAdd();
			}
		},

		/**
		 * Update the Layout according to the status All
		 */
		_updateLayoutAdded: function () {
			/*
			 * Update Command Image and Function related to Click event
			 */
			this.setImageCommand((this.isFavorite()) ? (this._imageStarFull) : (this._imageStarEmpty));
			this.setImageCommandFunction(this._changeFavorite);

			/*
			 * Create the Menu in CommandBox
			 */
			this.cleanMenu();	
			var removeApp = new qx.ui.menu.Button('Remove Application', 'index.php?extern=/images/16x16/actions/edit-delete.png').set({
				'backgroundColor': '#ffffff'
			});
			
			var toggleFavorite = new qx.ui.menu.Button('Add/Remove Favorite', 'index.php?extern=/images/rate_on.png').set({
				'backgroundColor': '#ffffff'
			});

			var createDesktopIcon = new qx.ui.menu.Button('Create Desktop Shortcut', 'index.php?extern=/images/new.png').set({
				'backgroundColor': '#ffffff'
			});
			
			//			var getInfo = new qx.ui.menu.Button('Info...').set({
			//				'backgroundColor': '#ffffff'
			//			});
			//
			removeApp.addListener('execute', this._removeApplication, this);
			toggleFavorite.addListener('execute', this._changeFavorite, this);
                        createDesktopIcon.addListener('execute', this._createDesktopIcon, this);
			//			getInfo.addListener('execute', this._getInfo, this);
			this.addToMenu(removeApp);
			this.addToMenu(toggleFavorite);
                        this.addToMenu(createDesktopIcon);
			//			this.addToMenu(getInfo);
			
			this.getContent().addListener('click', function (e) {
				eyeos.execute(this.getRealName(), this.getPage().getChecknum(), null, null);
				document.eyeDesktopTabs.hideContent();
			}, this);

		},
		/**
		 * Update the Layout according to the status Add
		 */
		_updateLayoutToAdd: function () {
			/*
			 * Update Command Image and Function related to Click event
			 */
			this.setImageCommand(this._imagePlus);

			if (this.isInstalled()) {
				this.showAsAdded(this._imageAdded);
				var removeApp = new qx.ui.menu.Button('Add Application').set({
					'backgroundColor': '#ffffff'
				});
				removeApp.addListener('execute', this._removeApplication, this);
				this.addToMenu(removeApp);
			} else {
				this.cleanMenu();	
				this.setImageCommandFunction(this._installApplication);
				var installApp = new qx.ui.menu.Button('Add Application').set({
					'backgroundColor': '#ffffff'
				});
				installApp.addListener('execute', this._installApplication, this);
				this.addToMenu(installApp);
			}

		//			var getInfo = new qx.ui.menu.Button('Info...').set({
		//				'backgroundColor': '#ffffff'
		//			});
		//			getInfo.addListener('execute', this._getInfo, this);
		//			this.addToMenu(getInfo);
		},
		
		/**
		 * Update the Layout and the system information when the value of
		 * favorite Change
		 */
		_changeFavorite: function () {
			if (this.isFavorite()) {
				eyeos.callMessage(this.getPage().getChecknum(), 'removeFavorite', this.getRealName());
			}
			else {
				eyeos.callMessage(this.getPage().getChecknum(), 'addFavorite', this.getRealName());
			}

			this.toggleFavorite();

			this.setImageCommand((this.isFavorite()) ? (this._imageStarFull) : (this._imageStarEmpty));
		},

		/**
		 * Update the Layout and the system information when a application is
		 * removed
		 */
		_removeApplication: function () {
			var op = new eyeos.dialogs.OptionPane(
				'Are you sure you want to remove the application "' + this.getName() + '"?<br />You will not be able to use it anymore until you reinstall it.',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				'Uninstall Application',
					
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						eyeos.callMessage(this.getPage().getChecknum(), 'removeInstalled', this.getRealName(), function () {
							if (this.getPage().getContext() == 'All') {
								this.setFavorite(false);
								eyeos.callMessage(this.getPage().getChecknum(), 'removeFavorite', this.getRealName());
								this.destroy();
							} else {
								this.showAsAdded(this._imageAdded);
							}
						}, this);
					}
				},
				this, true
				).open();
		},

                _createDesktopIcon: function() {
                    var appName = this.getRealName();
                    var imagePath = this.getImagePath();

                    eyeos.callMessage(this.getPage().getChecknum(), "createLink", [appName, imagePath, appName, 'home:///Desktop/'], function(){
                        eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [tr('New shortcut created in the desktop')]);
                    });
                },
		
		/**
		 * Update the Layout and the system information when a application is
		 * installed
		 */
		_installApplication: function () {
			var warningApps = ['Calendar','Documents','Mail Client', 'Spreadsheets', 'Editor'];
			var text = '';
			if (warningApps.indexOf(this.getOriginalName()) >= 0 ) {
				text = text + '<span style="color: red">WARNING<BR>Please, be aware of this application is not stable and it\'s not ready for production usage yet.</span><BR><BR>';
			}
			text = text + 'Are you sure you want to install the application "' + this.getOriginalName() + '"?';
			var op = new eyeos.dialogs.OptionPane(
				text,
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				'Install Application',

				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						eyeos.callMessage(this.getPage().getChecknum(), 'addInstalled', this.getRealName(), function () {
							this.showAsAdded(this._imageAdded);
							this.cleanMenu();

							var removeApp = new qx.ui.menu.Button('Remove Application').set({
								'backgroundColor': '#ffffff'
							});
							removeApp.addListener('execute', this._removeApplication, this);
							this.addToMenu(removeApp);

						//								var getInfo = new qx.ui.menu.Button('Info...').set({
						//									'backgroundColor': '#ffffff'
						//								});
						//								getInfo.addListener('execute', this._getInfo, this);
						//								this.addToMenu(getInfo);

						}, this);
					}
				},
				this, true
				).open();
		}
	}
});