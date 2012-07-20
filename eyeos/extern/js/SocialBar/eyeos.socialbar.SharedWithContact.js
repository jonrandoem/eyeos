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
 * SharedWithContact is a single line in SharedWith box.
 * It display information about the share of a contact and some actions
 * like change permission of the contact or stop the share.
 */

qx.Class.define('eyeos.socialbar.SharedWithContact', {
	extend: qx.ui.container.Composite,

	events: {

	},

	properties: {
		privilege: {
			check: ['Viewer', 'Editor']
		},
		box: {
			
		},
		id: {
			
		},
		keepFocused: {
			check: 'Boolean',
			init: false
		}
	},

	construct: function (userId, privilege, box) {
		this.base(arguments);
		
		this.setPrivilege(privilege);
		this.setId(userId);
		this.setBox(box);
		
		this._buildGui();
	},
	members: {
		_sharedOffImage: 'index.php?extern=images/shared_off.png',
		_menuImage: 'index.php?extern=images/row.png',
		
		_image: null,
		_infoColumn: null,
			_labelName: null,
			_contactSelectForm: null,
		_commandColumn: null,
		
		_buildGui: function () {
			this.set({
				marginLeft: 13,
				decorator: null,
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				height: 34,
				allowGrowY: false,
				marginBottom: 2
			});

			this._createImage();
			this._createInfoColumn();
			this._createCommandColumn();

			this._addMyListeners();
		},

		_addMyListeners: function () {
//			this.addListener('mouseover', function () {
//				this._commandColumn.setVisibility('visible');
//			}, this);
//
//			this.addListener('mouseout', function () {
//				if (this.getKeepFocused() == false) {
//					this._commandColumn.setVisibility('hidden');
//				}
//			}, this);
//			this._menu.addListener('appear', function (e) {
//				this.setKeepFocused(true);
//			}, this);
//
//			this._menu.addListener('disappear', function (e) {
//				this.setKeepFocused(false);
//				this._commandColumn.setVisibility('hidden');
//			}, this);
		},

		_createImage: function () {
			this._image = new qx.ui.basic.Image().set({
				source: 'index.php?checknum=' + this.getBox().getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]=' + this.getId(),
				height: 32,
				width: 32,
				scale: true,
				decorator: new qx.ui.decoration.Single(1, 'solid', 'gray')
			});
			this.add(this._image);
		},

		_createInfoColumn: function () {
			this._infoColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				marginLeft: 5
			});
			this.add(this._infoColumn, {width: '60%'});

			this._createNameLabel();
			this._createSelectForm();
		},

		_createNameLabel: function () {
			this._labelName = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
				textColor: '#666666',
				marginTop: 3
			});
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.getContactsByIds([this.getId()], function(results){
				if (results[0]) {
					var metadata = results[0].getMetadataInstance();
					var name = metadata.getMeta(['eyeos.user.firstname']) + ' ' + metadata.getMeta(['eyeos.user.lastname']);
					this._labelName.setValue(name);
				}
			}, this);
			
//			eyeos.callMessage(this.getBox().getChecknum(), '__SocialBar_getFirstLastNameOfUser', this.getId(), function(userName){
//				this._labelName.setValue(userName);
//			}, this);
			this._infoColumn.add(this._labelName);

		},

		_createSelectForm: function () {
			this._contactSelectForm = new qx.ui.form.SelectBox().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				decorator: null, //new qx.ui.decoration.RoundBorderBeveled(null, '#A3A3A3', 1, 5, 5, 5, 5),
				allowGrowX: false,
				marginLeft: -7,
				textColor: '#AAAAAA'
			});

			this._viewerLI = new qx.ui.form.ListItem('Viewer');
			this._editorLI = new qx.ui.form.ListItem('Editor');
//			this._variousLI = new qx.ui.form.ListItem('Various');
			
			this._contactSelectForm.add(this._viewerLI);
			this._contactSelectForm.add(this._editorLI);
//			this._contactSelectForm.add(this._variousLI);

                        switch (this.getPrivilege()) {
                            case 'Viewer':
                                this._contactSelectForm.setSelection([this._viewerLI]);
                                break;
                            case 'Editor':
                                this._contactSelectForm.setSelection([this._editorLI]);
                                break;
                        }

            this._contactSelectForm.addListener('changeSelection', function (e) {
				if (this._contactSelectForm.getSelection()[0] == this._otherLI) {
					this._contactSelectForm.setSelection(this._viewerLI);
				}
				//this.getBox().fireDataEvent('changePrivilege', [this.getId(), this._contactSelectForm.getValue()]);
				this.getBox().changeUserPrivilege(this.getId(), this._contactSelectForm.getSelection()[0].getLabel());
			}, this);
			this._infoColumn.add(this._contactSelectForm);
		},

		_createCommandColumn: function () {
			this._commandColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				decorator: null,
				height: 34,
				allowGrowY: false
			});
			this.add(this._commandColumn, {flex: 1});

			//this._createCommandMenu();
			this._createStopButton();
			//this._createCheckBox();
		},

		_createCommandMenu: function () {
			this._menu = new qx.ui.menu.Menu();

			var shareButton = new qx.ui.menu.Button(tr('Open share'));
			shareButton.addListener('execute', function(e) {
				var contactManager = eyeos.contacts.ContactManager.getInstance();
				contactManager.getContactsByIds([this.getId()], function(results) {
					eyeos.execute('files', this.getBox().getChecknum(), ['share://~' + results[0].getNickname()], null);
				}, this);
			}, this);
			this._menu.add(shareButton);
			
			var menuButton = new qx.ui.form.MenuButton(null, this._menuImage, this._menu).set({
				decorator: null,
				paddingTop: 3
			});
			this._commandColumn.add(menuButton);
		},

		/*_createCheckBox: function () {
			var checkBox = new qx.ui.form.CheckBox();
			this._commandColumn.add(checkBox);
		},*/

		_createStopButton: function () {
			var stopButton = new qx.ui.basic.Image(this._sharedOffImage).set({
				decorator: null
			});
			stopButton.addListener('click', function (e) {
				this._stopShare();
			}, this);
			this._commandColumn.add(stopButton);
		},

		_stopShare: function () {
			var op = new eyeos.dialogs.OptionPane(
				tr('Are you sure you want to delete share with this contact?'),
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(null, tr('Delete share'), function (answer) {
				if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
					// Update internal Data struct and send event
					this.getBox().deleteUserShare(this.getId());
					//Delete element from layout
					this.destroy();
				}
			},
			this
			).open();		
		}
	}
});



