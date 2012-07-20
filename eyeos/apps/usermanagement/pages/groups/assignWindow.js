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

qx.Class.define('eyeos.application.usermanagement.assignWindow', {
	extend: qx.ui.window.Window,

	properties: {

	},
	
	construct: function (checknum, workgroupId) {
		this.base(arguments, tr('Assign users'));
		this._checknum = checknum;
		this._workgroupId = workgroupId;

		this._allUser = new Array();
		this._userInWorkgroup = new Array();
		
		eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', {workgroupId: this._workgroupId}, function (results) {
			this._buildGui();
			
			for (var i = 0; i < results.length; ++i) {
				var user = {
					id: results[i]['id'],
					name: results[i]['metadata']['eyeos.user.firstname'] + ' ' + results[i]['metadata']['eyeos.user.lastname']
				}
				this._userInWorkgroup.push(user);
			}
		}, this);
		
	},

	members: {
		_checknum: null,
		_workgroupId: null,

		_allUser: null,
		_userInWorkgroup: null,
		_assignedUserContainer: null,
		_userContainer: null,
		

		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				width: 540,
				height: 480,
				allowGrowX: false,
				allowGrowY: false,
				modal: true,
				resizable: false,
                showMinimize: false
			});
			this.center();

			this._createSearchBox();
			this._createUsersBox();
			this._createAssignCommandBox();
			this._createAssignedUserBox();
			this._createSaveCommandBox();

			eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', {workgroupId: this._workgroupId}, function (results) {
				this._populateAlreadyAssigned(results);
				this.open();
			}, this)
			
		},

		_createSearchBox: function () {
			var searchBox= new qx.ui.container.Composite().set({
				decorator : null,
				layout: new qx.ui.layout.HBox().set({
					alignX: 'right'
				}),
				marginBottom: 10
			});

			var searchInput = new qx.ui.form.TextField(tr('Search')).set({
				width: 150,
				allowGrowX: false
			});

			searchInput.addListener('keypress', function (e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					var searchText = searchInput.getValue();
					if (searchText.length > 2) {
						this._populateUsers(searchText);
					} else {
						var op = new eyeos.dialogs.OptionPane(
							tr('You should insert at least 3 chars to search a user'),
							eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
						op.createDialog(null, tr('Search')).open();
                        searchInput.setValue(tr('Search'));
					}
				}
			}, this);

			searchInput.addListener('focus', function (e) {
                this.setValue('');
			});

			searchBox.add(searchInput);
			this.add(searchBox);
		},

		_createUsersBox: function () {
			var scroll = new qx.ui.container.Scroll().set({
				decorator: new qx.ui.decoration.Single(1, 'solid', 'black')
			});
			this.add(scroll, {flex: 1});

			this._userContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Flow(),
				marginTop: 10,
				padding: 1,
				allowShrinkY: false,
				allowGrowY: true,
				allowGrowX: true
			});
			scroll.add(this._userContainer, {flex: 1});
		},
		
		_populateUsers: function (filter) {
			eyeos.callMessage(this._checknum, 'getAllUsers', {filter: filter}, function (users) {
                this._userContainer.removeAll();
				for (var i = 0; i < users.length; ++i) {
					var user = new eyeos.application.usermanagement.userItemGUI(this._checknum, users[i]);
					this._userContainer.add(user);
				}
			}, this);
		},

		_createAssignCommandBox: function () {
			var commandBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				marginTop: 10,
				marginBottom: 10,
				decorator: null
			});
			this.add(commandBox);

			var addSelectedLabel = new qx.ui.basic.Label('<u>' + tr('Add Selected') + '</u>').set({
				textColor: '#297CCE',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				cursor: 'pointer',
				marginRight: 30,
				rich: true
			});
			addSelectedLabel.addListener('click', this._addSelected, this);
			commandBox.add(addSelectedLabel);

			


			var addAllLabel = new qx.ui.basic.Label('<u>' + tr('Add All') + '</u>').set({
				textColor: '#297CCE',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				cursor: 'pointer',
				rich: true
			});
			addAllLabel.addListener('click', this._addAll, this);
			commandBox.add(addAllLabel);

			commandBox.add(new qx.ui.core.Spacer(), {flex: 1});

			var clearLabel = new qx.ui.basic.Label('<u>' + tr('Clear') + '</u>').set({
				textColor: '#297CCE',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				cursor: 'pointer',
				rich: true
			});
			clearLabel.addListener('click', this._clearAssigned, this);
			commandBox.add(clearLabel);
			
		},

		_addSelected: function () {
			var allUsers = this._userContainer.getChildren();

			for (var i = 0; i < allUsers.length; ++i) {
				if ((allUsers[i] instanceof eyeos.application.usermanagement.userItemGUI) && allUsers[i].isSelected()) {
					this._addSelectedUser(allUsers[i]);
				}
			}
		},

		_addSelectedUser: function (user) {
			var toAssignId = user.getId();
			if (!this._isAlreadyAssigned(toAssignId)) {
				var assignedUser = new eyeos.application.usermanagement.addedUserGUI(user.getId(), user.getName(), false);
				this._assignedUserContainer.add(assignedUser);
			} else {
				var assignedUser = this._retrieveAssignedUserById(user.getId());
				if (assignedUser instanceof eyeos.application.usermanagement.addedUserGUI) {
					if (assignedUser.isAlreadyPresent() && assignedUser.getVisibility() == 'excluded') {
						assignedUser.setVisibility('visible');
					}
				}
			}
		},

		_isAlreadyAssigned: function (id) {
			var assignedUser = this._assignedUserContainer.getChildren();
			for (var i = 0; i < assignedUser.length; ++i) {
				if ((assignedUser[i] instanceof eyeos.application.usermanagement.addedUserGUI) && (assignedUser[i].getId() == id)) {
					return true;
				}
			}
			return false;
		},

		_retrieveAssignedUserById: function(id) {
			var assignedUser = this._assignedUserContainer.getChildren();
			for (var i = 0; i < assignedUser.length; ++i) {
				if ((assignedUser[i] instanceof eyeos.application.usermanagement.addedUserGUI) && (assignedUser[i].getId() == id)) {
					return assignedUser[i];
				}
			}
			return null;
		},

		_addAll: function () {
			var allUsers = this._userContainer.getChildren();
			for (var i = 0; i < allUsers.length; ++i) {
				if ((allUsers[i] instanceof eyeos.application.usermanagement.userItemGUI) && !this._isAlreadyAssigned()) {
					this._addSelectedUser(allUsers[i]);
				}
			}
		},

		_clearAssigned: function () {
			var assignedUsers = this._assignedUserContainer.getChildren();
			for (var i = 0; i < assignedUsers.length; ++i) {
				if (assignedUsers[i] instanceof eyeos.application.usermanagement.addedUserGUI){
					assignedUsers[i]._delete();
				}
			}
		},

		_createAssignedUserBox: function () {
			var scroll = new qx.ui.container.Scroll().set({
				decorator: new qx.ui.decoration.Single(1, 'solid', 'black'),
				height: 100,
				allowGrowY: false
			});
			this.add(scroll, {flex: 1});

			this._assignedUserContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Flow(),
				marginTop: 10,
				padding: 1,
				allowShrinkY: false,
				allowGrowY: true,
				allowGrowX: true
			});
			scroll.add(this._assignedUserContainer, {flex: 1});
		},

		_populateAlreadyAssigned: function (results) {
			for (var i = 0; i < results.length; ++i) {
				if (results[i]['role'] != eyeos.ui.tabs.GroupAll.ROLE_OWNER) {
					var id = results[i]['id'];
					var name = results[i]['metadata']['eyeos.user.firstname'] + ' ' + results[i]['metadata']['eyeos.user.lastname'];
					var alreadyPresent = true;

					var assignedUser = new eyeos.application.usermanagement.addedUserGUI(id, name, alreadyPresent);
					this._assignedUserContainer.add(assignedUser);
				}
			}
		},

		_createSaveCommandBox: function () {
			var saveCommandBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				marginTop: 10
			});
			this.add(saveCommandBox);

			saveCommandBox.add(new qx.ui.core.Spacer(), {flex: 1});

			var cancelButton = new qx.ui.form.Button(tr('Cancel')).set({
				marginRight: 10
			});
			cancelButton.addListener('execute', this._cancel, this);
			saveCommandBox.add(cancelButton);

			var saveButton = new qx.ui.form.Button(tr('Save')).set({
				marginRight: 10
			});
			saveButton.addListener('execute', this._save, this);
			saveCommandBox.add(saveButton);
		},

		_cancel: function () {
			this.close();
		},

		_save: function () {
			var userToUnassign = new Array();
			var usersToAssign = new Array();
			
			var assignedUsers = this._assignedUserContainer.getChildren();
			for (var i = 0; i < assignedUsers.length; ++i) {
				if (assignedUsers[i] instanceof eyeos.application.usermanagement.addedUserGUI){
					if ((assignedUsers[i].isAlreadyPresent()) && (assignedUsers[i].getVisibility() == 'excluded')) {
						userToUnassign.push(assignedUsers[i].getId());
					}

					if (!assignedUsers[i].isAlreadyPresent()) {
						usersToAssign.push(assignedUsers[i].getId());
					}
				}
			}
			var paramAssign = {
				workgroupId: this._workgroupId,
				usersId: usersToAssign
			};
			var paramUnassign = {
				workgroupId: this._workgroupId,
				userIds: userToUnassign
			};

			if (usersToAssign.length && userToUnassign.length) {
				eyeos.callMessage(this._checknum, 'assignUsersToWorkgroup', paramAssign, function () {
					eyeos.callMessage(this._checknum, '__Workgroups_deleteMemberships', paramUnassign, function () {
						this.close();
					}, this);
				}, this);
			} else if (usersToAssign.length) {
				eyeos.callMessage(this._checknum, 'assignUsersToWorkgroup', paramAssign, function () {
					this.close();
				}, this);
			} else if (userToUnassign.length) {
				eyeos.callMessage(this._checknum, '__Workgroups_deleteMemberships', paramUnassign, function () {
					this.close();
				}, this);
			} else {
				this.close();
			}
		}
	}
});

qx.Class.define('eyeos.application.usermanagement.userItemGUI', {
	extend: eyeos.ui.tabs.Item,

	properties: {
		id: {
			check: 'String',
			init: null
		}
	},

	construct: function (checknum, user) {
		this.base(arguments);

		this._checknum = checknum;

		this.setId(user['id']);
		this.setName(user['name']);
		this.setDescription(user['username']);

		this.setImage('index.php?checknum=' + this._checknum + '&message=__UserInfo_getAvatarPicture&params[userId]=' + this.getId());
		this.setImageCommand(this._imageCheckNormal);
		this.setImageCommandFunction(this._changeSelection);
	},

	members: {
		_checknum: null,
		_imageCheckNormal: 'index.php?extern=/images/tick.png',
		_imageCheckSelected: 'index.php?extern=/images/tick2.png',

		_changeSelection: function () {
			this.toggleSelected();
			this.toggleShowAsSelected();
			if (this.isSelected()) {
				this.setImageCommand(this._imageCheckSelected);
			} else {
				this.setImageCommand(this._imageCheckNormal);
			}
		}

	}

});

qx.Class.define('eyeos.application.usermanagement.addedUserGUI', {
	extend: qx.ui.container.Composite,

	properties: {
		id : {
			check: 'String',
			init: null
		},

		name: {
			check: 'String',
			init: null
		},

		alreadyPresent: {
			check: 'Boolean',
			init: false
		}
		
	},
	
	construct: function (id, name, alreadyPresent) {
		this.base(arguments);
		this.setId(id);
		this.setName(name);
		this.setAlreadyPresent(alreadyPresent);

		this._buildGui();
	},
	
	members: {
		_deleteImage: 'index.php?extern=/images/clear.png',
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				margin: 3,
				backgroundColor: '#516074',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				height: 20,
				allowGrowY: false,
			});

			var labelName = new qx.ui.basic.Label('<b>' + this.getName() + '</b>'	).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				textColor: 'white',
				rich: true
			});
			this.add(labelName);

			var deleteImage = new qx.ui.basic.Image(this._deleteImage).set({
				padding: 5,
				cursor: 'pointer'
			});

			deleteImage.addListener('click', this._delete, this);
			this.add(deleteImage);
		},

		_delete: function () {
			if (this.isAlreadyPresent()) {
				this.setVisibility('excluded');
			} else {
				this.destroy();
			}
		}
	}

});