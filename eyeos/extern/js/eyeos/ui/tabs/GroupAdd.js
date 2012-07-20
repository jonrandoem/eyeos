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
 * This is the Item for Groups when the Groups Tab is selected
 * and context = ADD
 */
qx.Class.define('eyeos.ui.tabs.GroupAdd', {
	extend: eyeos.ui.tabs.Item,

	statics : {
		PRIVACY_OPEN: 0,
		PRIVACY_ONREQUEST: 1,
		PRIVACY_ONINVITATION: 2
	},

	properties: {
		id: {
			check: 'String'
		},
		tags: {
			init: new Array()
		},
		privacy: {
			check: [0, 1, 2],
			init: 0
		},
		role: {
			
		},
		status: {

		},
		descriptionText: {
			check: 'String'
		}
	},

	construct: function (name, description, id, status, role, privacy, tags, page) {
		this.base(arguments);
		this.setPage(page);
		if (description != null) {
			this.setDescriptionText(description);
		} else {
			this.setDescriptionText('This workgroup has no description');
		}

		this.setStatus(status);
		this.setPrivacy(privacy);		
		this.setName(name);
		this.setNameTooltip(name);
		this.setId(id);
		this.setRole(role);

		this.setImage('index.php?checknum=' + page.getChecknum() + '&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + id);

		if (tags != null) {
			this.setTags(tags);
		}

		this.addListeners();
		this._updateLayout();
	},

	members: {
		_imagePlus: 'index.php?extern=images/new.png',
		_imageAdded: 'index.php?extern=images/22x22/actions/dialog-ok-apply.png',
		_imageDelete: 'index.php?extern=/images/16x16/actions/list-remove.png',
		_imageJoin: 'index.php?extern=/images/16x16/actions/list-add.png',
		_imagePending: 'index.php?extern=/images/user-away.png',

		addListeners: function() {
			var bus = eyeos.messageBus.getInstance();

			bus.addListener('eyeos_NSGroup_userWorkgroupAssignationCreated', function () {
				this.destroy();
			}, this);
		},
		
		_updateLayout: function () {
			switch (this.getStatus()) {
				case eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER:
					this._showAsToAdd();
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_MEMBER:
					this._showAsMember();
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_PENDING:
					this._showAsPending();
					break;
			}
		},
		
		_showAsToAdd: function () {
			this.setImageCommand(this._imagePlus);
			this.setImageCommandFunction(this._joinGroup);
			this.showAsNormal();		
			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionText());
			this.setDescriptionImage(this._updateDescriptionImage());
			this.cleanContentListener();
			this.cleanMenu();
			/*
			 * Create the Menu in CommandBox
			 */
			var addMenu = new qx.ui.menu.Button('Join this group', this._imageJoin).set({
				'backgroundColor': '#ffffff'
			});
			addMenu.addListener('execute', function(e) {
				this._joinGroup();
			}, this);
			this.addToMenu(addMenu);	
		},
		
		_showAsMember: function () {
			this.setImageCommand(this._imagePlus)
			this.showAsAdded(this._imageAdded);
			
			this.setImageCommandFunction(this._functionNull);
			
			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionText());
			this.setDescriptionImage(this._updateDescriptionImage());

			this.cleanContentListener();
			this.getContent().addListener('click', this._openShare, this);
			this.cleanMenu();			
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageDelete).set({
				backgroundColor: '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);
			this.addToMenu(delMenu);
		},

		_openShare: function () {
			eyeos.execute('files', this.getPage().getChecknum(), ['workgroup://~' + this.getName()], null);
			document.eyeDesktopTabs.hideContent();
		},

		_showAsPending: function () {
			this.setImageCommand(this._imagePlus);
			this.showAsAdded(this._imagePending);
			this.setImageCommandFunction(this._functionNull);

			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionText());
			this.setDescriptionImage(this._updateDescriptionImage());
			
			this.cleanContentListener();
			this.cleanMenu();
			
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageDelete).set({
				'backgroundColor': '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);
			this.addToMenu(delMenu);
		},

		
		/**
		 *Action executed when a user press the delete/remove Button
		 */
		_removeGroup: function () {
			if (this.getRole() == eyeos.ui.tabs.GroupAll.ROLE_OWNER) {
				this._deleteGroup();
			} else {
				this._leaveGroup();
			}
		},
		
		/**
		 *Action executed when an Owner of a workgroup want to delete it
		 */
		_deleteGroup: function () {
			var op = new eyeos.dialogs.OptionPane(
				'Are you sure you want to delete this workgroup?',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				'Delete workgroup',
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						eyeos.callMessage(this.getPage().getChecknum(), '__Workgroups_deleteWorkgroup', {workgroupId: this.getId()}, function () {
							var bus = eyeos.messageBus.getInstance();
							bus.send('workgroup', 'deleteGroup', this.getId());
							this.destroy();
						}, this);
					}
				},
				this, true
			).open();
		},

		/**
		  *Action executed when someone want to leave the Group
		  */
		_leaveGroup: function () {
			eyeos.callMessage(this.getPage().getChecknum(), 'getCurrentUserId', null, function (myId) {
				var params = {
					workgroupId: this.getId(),
					userIds: [myId]
				};
				var op = new eyeos.dialogs.OptionPane(
					'Are you sure you want to leave this workgroup?',
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
					eyeos.dialogs.OptionPane.YES_NO_OPTION);
				op.createDialog(null, 'Leave workgroup', function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						eyeos.callMessage(this.getPage().getChecknum(), '__Workgroups_deleteMemberships', params, function (groups) {
							this.setStatus(eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER);
							this._updateLayout();
							var bus = eyeos.messageBus.getInstance();
							bus.send('workgroup', 'leaveGroup', this.getId());
						}, this);
					}
				},
				this, true
				).open();
			}, this);
		},

		/**
			 * Add the Groups to the user Groups
		 */
		_joinGroup: function () {
			var op = new eyeos.dialogs.OptionPane(
					'Are you sure you want to join this workgroup?',
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
					eyeos.dialogs.OptionPane.YES_NO_OPTION);
				op.createDialog(
					null,
					'Join workgroup',
					
					function (answer) {
						if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
							var params = {
									workgroupId: this.getId()
							};
							eyeos.callMessage(this.getPage().getChecknum(), '__Workgroups_requestMembership', params, function (result) {
								if (this.getPrivacy() == eyeos.ui.tabs.GroupAll.PRIVACY_OPEN){
									this.setStatus(eyeos.ui.tabs.GroupAll.STATUS_MEMBER);
									this.setRole(eyeos.ui.tabs.GroupAll.ROLE_VIEWER);
								} else {
									this.setStatus(eyeos.ui.tabs.GroupAll.STATUS_PENDING);
								}
								this._updateLayout();
								var bus = eyeos.messageBus.getInstance();
								bus.send('workgroup', 'joinGroup', [this.getName(), this.getId()]);
							}, this);
						}
					},
					this, true
			).open();
		},

		/**
		 * Function for set name properties (Override)
		 */
		_applyName: function (newValue, oldValue) {
			var myPrivacy;
			switch (this.getPrivacy()) {
				case eyeos.ui.tabs.GroupAll.PRIVACY_OPEN:
					myPrivacy = '<span style="color: green; font-size: 12px">(open)</span>';
					break;
				case eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST:
					myPrivacy = '<span style="color: green; font-size: 12px">(via request)</span>';
					break;
			}

			var value = '<b>' + newValue + '</b>  ' + myPrivacy;
			this._nameLabel.setValue(value);
		},

		_createDescriptionText: function () {
			if (this.getStatus() == eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER) {
				return this.getDescriptionText();
			} else if (this.getStatus() == eyeos.ui.tabs.GroupAll.STATUS_MEMBER){
				switch (this.getRole()) {
					case eyeos.ui.tabs.GroupAll.ROLE_VIEWER:
						return 'Viewer';
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_EDITOR:
						return 'Editor';
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_ADMIN:
						return 'Admin';
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_OWNER:
						return 'Owner';
						break;
				}
			} else if (this.getStatus() == eyeos.ui.tabs.GroupAll.STATUS_PENDING) {
				return 'Pending';
			}
		},

		_updateDescriptionImage: function () {
			if (this.getRole() == eyeos.ui.tabs.GroupAll.ROLE_OWNER) {
				return 'index.php?extern=/images/rate_on.png';
			} else {
				return '';
			}
		},

		_functionNull: function () {
			//Increase your Karma
		}
	}
});


