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
 * and context = all
 */
qx.Class.define('eyeos.ui.tabs.GroupAll', {
	extend: eyeos.ui.tabs.Item,

	statics : {
		// Workgroup privacy
		PRIVACY_OPEN: 0,
		PRIVACY_ONREQUEST: 1,
		PRIVACY_ONINVITATION: 2,
		
		// Workgroup status
		STATUS_MEMBERS_LOCKED: 0x1,
		STATUS_ACTIVITY_LOCKED: 0x2,
		
		// Member status
		STATUS_MEMBER: 0,
		STATUS_INVITED: 1,
		STATUS_PENDING: 2,
		STATUS_SUSPENDED: 3,
		STATUS_BANNED: 4,
		STATUS_NOT_MEMBER: 'false',
		
		// Member role
		ROLE_OWNER: 0,
		ROLE_ADMIN: 1,
		ROLE_EDITOR: 2,
		ROLE_VIEWER: 3
	},

	properties: {
		id: {
			check: 'String'
		},
		tags: {
			init: new Array()
		},
		role: {
			check: 'Integer'
		},
		privacy: {
			check: 'Integer'
		},
		descriptionText: {
			check: 'String'
		},
		status: {
			check: 'Integer'
		}
	},

	construct: function (name, id, description, status, role, privacy, tags, page) {
		this.base(arguments);

		this.setPage(page);
		this.setPrivacy(privacy);
		this.setRole(role);
		
		if (description != null) {
			this.setDescriptionText(description);
		} else {
			this.setDescriptionText('This workgroup has no description');
		}
		this.setStatus(status);
		this.setName(name);
		this.setNameTooltip(name);
		this.setId(id);
		this.setImage('index.php?checknum=' + page.getChecknum() + '&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + id);
		if (tags != null) {
			this.setTags(tags);
		}

		this.addListeners();
		this._updateLayout();
	},

	members: {
		_imagePlus: 'index.php?extern=/images/16x16/actions/list-add.png',
		_imageMinus: 'index.php?extern=/images/16x16/actions/list-remove.png',
		_imageConfigure: 'index.php?extern=/images/16x16/actions/configure.png',
		_imageAdded: 'index.php?extern=images/22x22/actions/dialog-ok-apply.png',
		_imagePending: 'index.php?extern=/images/user-away.png',

		addListeners: function() {
			var bus = eyeos.messageBus.getInstance();

			bus.addListener('eyeos_NSGroup_userWorkgroupAssignationDeleted', function () {
				this.destroy();
				bus.send('workgroup', 'leaveGroup', this.getId());
			}, this);


			bus.addListener('eyeos_NSGroup_userWorkgroupAssignationUpdated', function () {
				bus.send('workgroup', 'joinGroup', [this.getName(), this.getId()]);
			}, this);

			bus.addListener('eyeos_workgroup_updateGroup', function(e) {
				if(e.getData().id == this.getId()) {
					this.setImage(e.getData().image);
					this.setPrivacy(e.getData().privacy);

					// just to update the privacy label in the item
					// to force update of the privacy.
					this._applyName(this.getName());
				}
			}, this);

			bus.addListener('eyeos_workgroup_deleteGroup', function(e) {
				if(e.getData() == this.getId()) {
					this.destroy();
				}
			}, this);

			bus.addListener('eyeos_workgroup_changeOwner', function(e) {
				this.setRole(e.getData());
				this._updateLayout();
			}, this);
		},
		
		_updateLayout: function () {	
			switch (this.getStatus()) {
				case eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER:
					this._showAsToAdd();
					break;	
				case eyeos.ui.tabs.GroupAll.STATUS_MEMBER:
					switch(this.getRole()) {
						case eyeos.ui.tabs.GroupAll.ROLE_OWNER:
						case eyeos.ui.tabs.GroupAll.ROLE_ADMIN:
							this._showAsAdmin();
							break;
						
						default:
							this._showAsMember();
					}
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_PENDING:
					this._showAsPending();
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_INVITED:
					this._showAsInvited();
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED:
					this._showAsSuspended();
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_BANNED:
					this._showAsBanned();
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
			var addMenu = new qx.ui.menu.Button('Join this workgroup').set({
				'backgroundColor': '#ffffff'
			});
			addMenu.addListener('execute', this._joinGroup, this);
			this.addToMenu(addMenu);	
		},
		
		_showAsMember: function () {
			this.setImageCommand(this._imageMinus)
			this.showAsNormal();
			
			this.setImageCommandFunction(this._removeGroup);
			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionTooltipText());
			this.setDescriptionImage(this._updateDescriptionImage());
			this.cleanContentListener();
			this.getContent().addListener('click', this._openShare, this);
			this.cleanMenu();	

			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageMinus).set({
				backgroundColor: '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);

			this.addToMenu(delMenu);
		},
		
		_showAsAdmin: function () {
			this.setImageCommand(this._imageConfigure);
			this.showAsNormal();
			
			this.setImageCommandFunction(function() {
				new eyeos.ui.tabs.GroupAdminWindow(this.getPage().getChecknum(), this.getId());
			});
			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionTooltipText());
			this.setDescriptionImage(this._updateDescriptionImage());
			this.cleanContentListener();
			this.getContent().addListener('click', this._openShare, this);
			this.cleanMenu();	

			var confMenu = new qx.ui.menu.Button('Administrate', this._imageConfigure).set({
				backgroundColor: '#ffffff'
			});
			confMenu.addListener('execute', function() {
				new eyeos.ui.tabs.GroupAdminWindow(this.getPage().getChecknum(), this.getId());
			}, this);
			this.addToMenu(confMenu);
			
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageMinus).set({
				backgroundColor: '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);

			this.addToMenu(delMenu);
		},
		
		_showAsPending: function () {
			this.setImageCommand(this._imageMinus);
			this.showAsAdded(this._imagePending);
			this.setImageCommandFunction(this._removeGroup);

			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionTooltipText());
			this.setDescriptionImage(this._updateDescriptionImage());
			
			this.cleanContentListener();
			this.cleanMenu();
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageMinus).set({
				'backgroundColor': '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);
			this.addToMenu(delMenu);
		},

		/**
		 * Action executed when a user want to join to a group where he was invited
		 */
		_acceptInvite: function () {
			eyeos.callMessage(this.getPage().getChecknum(), '__Workgroups_confirmInvitation', {workgroupId: this.getId()}, function () {
				this._showAsMember();
				var bus = eyeos.messageBus.getInstance();
				bus.send('workgroup', 'joinGroup', [this.getName(), this.getId()]);
			}, this);
		},
		
		_showAsInvited: function() {
			this.setImageCommand(this._imageMinus);
			this.setImageCommandFunction(this._removeGroup);
			this.showAsAdded();

			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionTooltipText());
			this.setDescriptionImage(this._updateDescriptionImage());
			
			this.cleanContentListener();
			this.cleanMenu();

			var acceptMenu = new qx.ui.menu.Button('Accept Invite').set({
				'backgroundColor': '#ffffff'
			});
			acceptMenu.addListener('execute', this._acceptInvite, this);
			this.addToMenu(acceptMenu);
			
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageMinus).set({
				'backgroundColor': '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);
			this.addToMenu(delMenu);
		},
		
		_showAsSuspended: function () {
			this.setImageCommand(this._imageMinus);
			this.setImageCommandFunction(this._removeGroup);
			this.showAsAdded();

			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionTooltipText());
			this.setDescriptionImage(this._updateDescriptionImage());
			
			this.cleanContentListener();
			this.cleanMenu();
			
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageMinus).set({
				'backgroundColor': '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);
			this.addToMenu(delMenu);
		},
		
		_showAsBanned: function () {
			this.setImageCommand(this._imageMinus);
			this.setImageCommandFunction(this._removeGroup);
			this.showAsAdded();
			
			this.setDescription(this._createDescriptionText());
			this.setDescriptionTooltip(this._createDescriptionTooltipText());
			this.setDescriptionImage(this._updateDescriptionImage());
			
			this.cleanContentListener();
			this.cleanMenu();
			var delMenu = new qx.ui.menu.Button('Leave/remove this workgroup', this._imageMinus).set({
				'backgroundColor': '#ffffff'
			});
			delMenu.addListener('execute', this._removeGroup, this);
			this.addToMenu(delMenu);
		},

		_createDescriptionText: function () {
			var text;
			switch (this.getStatus()) {
				case eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER:
					text = this.getDescriptionText();
				case eyeos.ui.tabs.GroupAll.STATUS_MEMBER:
					switch (this.getRole()) {
						case eyeos.ui.tabs.GroupAll.ROLE_VIEWER:
							text = 'Viewer';
							break;
						case eyeos.ui.tabs.GroupAll.ROLE_EDITOR:
							text = 'Editor';
							break;
						case eyeos.ui.tabs.GroupAll.ROLE_ADMIN:
							text = 'Admin';
							break;
						case eyeos.ui.tabs.GroupAll.ROLE_OWNER:
							text = 'Owner';
							break;
					}
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_INVITED:
					text = 'Invited';
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_PENDING:
					text = 'Pending';
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED:
					text = 'Suspended';
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_BANNED:
					text = 'Banned';
					break;
			}
			return text;
		},
		
		_createDescriptionTooltipText: function () {
			switch (this.getStatus()) {
				case eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER:
					return this.getDescriptionText();
				case eyeos.ui.tabs.GroupAll.STATUS_MEMBER:
					switch (this.getRole()) {
						case eyeos.ui.tabs.GroupAll.ROLE_OWNER:
							return 'As an Owner you can:<br />'
								+ 'Manage group options and descriptions<br />'
								+ 'Manage and invite users<br />'
								+ 'Manage privileges<br />'
								+ 'Manage and edit all files<br />';
							break;
						case eyeos.ui.tabs.GroupAll.ROLE_ADMIN:
							return 'As an Administrator you can:<br />'
								+ 'Manage and invite users<br />'
								+ 'Manage privileges<br />'
								+ 'Manage and edit all files<br />';
							break;
						case eyeos.ui.tabs.GroupAll.ROLE_EDITOR:
							return 'As an Editor you can:<br />'
								+ 'Invite users<br />'
								+ 'Edit all files<br />'
								+ 'Manage own files<br />';
							break;
						case eyeos.ui.tabs.GroupAll.ROLE_VIEWER:
							return 'As an Editor you can:<br />'
								+ 'Manage and edit own files<br />';
							break;
					}
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_INVITED:
					return '<span style="color: grey; font-size: 12px">Invited</span>';
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_PENDING:
					return '<span style="color: grey; font-size: 12px">Pending</span>';
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED:
					return '<span style="color: grey; font-size: 12px">Suspended</span>';
					break;
				case eyeos.ui.tabs.GroupAll.STATUS_BANNED:
					return '<span style="color: grey; font-size: 12px">Banned</span>';
					break;
			}
		},

		_updateDescriptionImage: function () {
			if (this.getRole() == eyeos.ui.tabs.GroupAll.ROLE_OWNER) {
				return 'index.php?extern=/images/rate_on.png';
			} else {
				return '';
			}
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
		 *Action executed when an Owner of a group want to delete it
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
							var bus = eyeos.messageBus.getInstance();
							bus.send('workgroup', 'leaveGroup', this.getId());
							this.destroy();
						}, this);
					}
				},
				this, true
				).open();
			}, this);
		},

	
		/**
		 * Function for set name properties (Override)
		 */
		_applyName: function (newValue, oldValue) {
			switch (this.getPrivacy()) {
				case eyeos.ui.tabs.GroupAll.PRIVACY_OPEN:
					var myPrivacy = '<span style="color: green; font-size: 12px">(open)</span>';
					break;
				case eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST:
					var myPrivacy = '<span style="color: green; font-size: 12px">(via request)</span>';
					break;
				case eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION:
					var myPrivacy = '<span style="color: red; font-size: 12px">(private)</span>';
					break;
			}
			
			var value = '<b>' + newValue + '</b>  ' + myPrivacy;
			this._nameLabel.setValue(value);
		},
		_openShare: function () {
			eyeos.execute('files', this.getPage().getChecknum(), ['workgroup://~' + this.getName()], null);
			document.eyeDesktopTabs.hideContent();
		},
		
		_functionNull: function () {
			//Increase your Karma
		}
	}
});


