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

qx.Class.define('eyeos.application.usermanagement.groupManagePage', {
	extend: qx.ui.tabview.Page,

	construct: function (checknum) {
		this.base(arguments, tr('Manage'));
		this._checknum = checknum;

		this._buildGui();
	},

	members: {
		_userContainer: null,		// Gui Element
		_workgroupId: null,			// Id of the workgroup showed
		_buttonsManager: null,		// Gui Element
		_buttonsInfo: null,			// Gui Element
        _searchBox: null,           // Gui Element
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});

			this._createFirstRow();
			this._createSecondRow();
			this._createThirdRow();
		},

		_createFirstRow: function () {
			var firstRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null
			});
			this.add(firstRow);

			var createButton = new qx.ui.form.Button(tr('Assign Users'), 'index.php?extern=images/16x16/actions/list-add.png');
			createButton.addListener('execute', function () {
				this._assignUsers();
			}, this);
			firstRow.add(createButton);

			firstRow.add(new qx.ui.core.Spacer(), {flex: 1});

			this._searchBox = new qx.ui.form.TextField(tr('Search')).set({
				marginBottom: 8
			});
			this._searchBox.addListener('changeValue', function (e){
				var filter = this._searchBox.getValue();
				this._filterUsersByName(filter);
			}, this);

			this._searchBox.addListener('focus', function (e){
				//Set Selection to all text
				this.setTextSelection(0);
			});
			firstRow.add(this._searchBox);
		},

		_createSecondRow: function () {
			var secondRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null
			});
			this.add(secondRow);
			
			this._buttonsManager = new qx.ui.form.RadioGroup().set({
				allowEmptySelection: false
			});

			this._buttonsInfo =
					[
							{id: 'All', label: tr('All')}, {id: 'Admins', label: tr('Admins')},
							{id: 'Editors', label: tr('Editors')}, {id: 'Members', label: tr('Viewers')},
							{id: 'Banned', label: tr('Banned')}
					];
					
			for (var i = 0; i < this._buttonsInfo.length; ++i) {
				var button = new qx.ui.toolbar.RadioButton().set({
					label: this._buttonsInfo[i]['label'],
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 2,
					alignX: 'center',
					alignY: 'middle'
				});
				button.setUserData('id', this._buttonsInfo[i]['id']);
				secondRow.add(button);
				this._buttonsManager.add(button);

				if ( button.getUserData('id') == 'All' ) {
					this._buttonsManager.setSelection([button]);
				}
			}

			this._buttonsManager.addListener('changeSelection', function (e) {
				var buttonSelected = e.getData()[0];
				if (buttonSelected instanceof qx.ui.toolbar.RadioButton){
					this._filterUserByRoleStatus(buttonSelected.getUserData('id'));
				}
			}, this);
		},

		_createThirdRow: function () {
			var scroll = new qx.ui.container.Scroll();
			this.add(scroll, {flex: 1});

			this._userContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginTop: 10,
				padding: 1,
				allowShrinkY: false,
				allowGrowY: true,
				allowGrowX: true,
				backgroundColor: 'white'
			});
			scroll.add(this._userContainer, {flex: 1});
		},

		_assignUsers: function () {
			if (this._workgroupId) {
				var assignWindow = new eyeos.application.usermanagement.assignWindow(this._checknum, this._workgroupId);
				assignWindow.addListener('close', this._reloadUsersList, this);
			}
		},
		
		_filterUsersByName: function (name) {
			this._userContainer.removeAll();
			this._populateAll(name);
		},

		_filterUserByRoleStatus: function (roleStatus) {
			this._userContainer.removeAll();
			if (this._workgroupId) {
				switch (roleStatus) {
					case 'All':
						this._populateAll();
						break;
					case 'Admins':
						this._populateAdmins();
						break;
					case 'Editors':
						this._populateEditors();
						break;
					case 'Members':
						this._populateMembers();
						break;
					case 'Banned':
						this._populateBanned();
						break;
				}
			}
			
		},


		_populateBanned: function() {
			var param = new Array();
			param = {
				workgroupId: this._workgroupId,
				status: eyeos.ui.tabs.GroupAll.STATUS_BANNED
			};

			eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					var item = this._createBannedItem(result);
					this._userContainer.add(item);
				}, this);
			}, this);
		},

		_createBannedItem: function(assignation) {
			var name = assignation.metadata['eyeos.user.firstname'] + ' ' + assignation.metadata['eyeos.user.lastname'];
			var id = assignation.id;
			
			var bannedItem = new qx.ui.container.Composite().set({
				height: 33,
				allowGrowY: false,
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});
			bannedItem.setUserData('id', id);

			var itemName = new qx.ui.basic.Label(name).set({
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			bannedItem.add(itemName);
			bannedItem.add(new qx.ui.core.Spacer(), {flex: 1});

			var removeBanButton = new qx.ui.form.Button(tr('Remove ban')).set({
				alignX: 'center',
				alignY: 'middle',
				height: 30,
				allowGrowY: false
			});
			removeBanButton.addListener('execute', function() {
				var op = new eyeos.dialogs.OptionPane(
					tr('Are you sure you want to remove the banned condition for this member?'),
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
				op.createDialog(
				null,
				tr('Remove ban'),
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var params = {
							workgroupId: this._workgroupId,
							membersInfo: [{
									userId: id,
									status: eyeos.ui.tabs.GroupAll.STATUS_MEMBER
								}]
						};
						eyeos.callMessage(this._checknum, '__Workgroups_updateMembers', params, function () {
							this._removeBannedById(id);
						}, this);
					}
				},this).open();
			}, this);
			bannedItem.add(removeBanButton);

			return bannedItem;
		},

		_removeBannedById: function (id) {
			var banUsers = this._userContainer.getChildren();
			for (var i = 0; i < banUsers.length; ++i) {
				if (banUsers[i].getUserData('id') == id){
					banUsers[i].destroy();
					return;
				}
			}
		},

		_populateEditors: function () {
			var param = new Array();
			param = {
				workgroupId: this._workgroupId
			};

			eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED) &&
						(result.role == eyeos.ui.tabs.GroupAll.ROLE_EDITOR)) {

						var item = this._createGenericItem(result);
							if(item.getUserData('isOwner')) {
								this._userContainer.addAt(item, 0);
							}
							else {
								this._userContainer.add(item);
							}
					}
				}, this);
			}, this);
		},
		
		_populateAdmins: function() {
			var param = new Array();
			param = {
				workgroupId: this._workgroupId
			};

			eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED) &&
						(result.role == eyeos.ui.tabs.GroupAll.ROLE_ADMIN)) {

						var item = this._createGenericItem(result);
							if(item.getUserData('isOwner')) {
								this._userContainer.addAt(item, 0);
							}
							else {
								this._userContainer.add(item);
							}
					}
				}, this);
			}, this);
		},

		_populateMembers: function () {
			var param = new Array();
			param = {
				workgroupId: this._workgroupId
			};

			eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED) &&
						(result.role == eyeos.ui.tabs.GroupAll.ROLE_VIEWER)) {

						var item = this._createGenericItem(result);
							if(item.getUserData('isOwner')) {
								this._userContainer.addAt(item, 0);
							}
							else {
								this._userContainer.add(item);
							}
					}
				}, this);
			}, this);
		},


		_populateAll: function (filter) {
			if (this._workgroupId) {
				var param = new Array();
				param = {
					workgroupId: this._workgroupId
				};

				eyeos.callMessage(this._checknum, '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
                    var toShow = true;
                    for (var i = 0; i < results.length; ++i) {
                        var result = results[i];
                        
                        if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
                            (result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
                            (result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED)){

                            //Eventually filter the user
                            if (filter != null) {
                                var name = result.metadata['eyeos.user.firstname'] + ' ' + result.metadata['eyeos.user.lastname'];
                                if (name.indexOf(filter) == -1) {
                                    toShow = false;
                                } else {
                                    toShow = true;
                                }
                            }

                            if (toShow) {
                                var item = this._createGenericItem(result);
                                if(item.getUserData('isOwner')) {
                                    this._userContainer.addAt(item, 0);
                                }
                                else {
                                    this._userContainer.add(item);
                                }
                            }
							
                        }
                    }
                }, this);
            }

		},

		updateGui: function (workgroupId) {
			this._workgroupId = workgroupId;
			this.__selectAllFilter();
            this._searchBox.setValue(tr('Search'));
			this._filterUserByRoleStatus('All');
		},

		__selectAllFilter: function () {
			var buttons = this._buttonsManager.getChildren();
			for (var i = 0; i < buttons.length; ++i) {
				if ( buttons[i].getUserData('id') == 'All' ) {
					this._buttonsManager.setSelection([buttons[i]]);
				}
			}
		},

		_createGenericItem: function(assignation) {
			var id = assignation.id;
			var name = assignation.metadata['eyeos.user.firstname'] + ' ' + assignation.metadata['eyeos.user.lastname'];
			var role = assignation.role;
			var status = assignation.status;
			
			var genericItem = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				decorator: new qx.ui.decoration.Single(1, 'solid', '#A4A4A4').set({
					styleTop: null,
					styleRight: null,
					styleLeft: null
				}),
				allowGrowX: true,
				height: 33,
				allowGrowY: false
			});
			genericItem.setUserData('id', id);


			var itemName = new qx.ui.basic.Label(name).set({
				alignY: 'middle',
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			genericItem.add(itemName, {width: '30%'});

			if(role == eyeos.ui.tabs.GroupAll.ROLE_OWNER) {
				genericItem.setUserData('isOwner', true);
				var ownerLabel = new qx.ui.basic.Label().set({
					value: tr('Owner'),
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				genericItem.add(ownerLabel, {width: '25%'});

				var changeOwnerLabel = new qx.ui.basic.Label().set({
					value: tr('Change Owner'),
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				changeOwnerLabel.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				changeOwnerLabel.addListener('mouseout', function() {
					this.setCursor('default');
				});
				changeOwnerLabel.addListener('click', function() {
					this._changeOwnerGroup();
				}, this);
				genericItem.add(changeOwnerLabel, {width: '25%'});

				var leaveGroupLabel = new qx.ui.basic.Label().set({
					value: tr('Leave group'),
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				leaveGroupLabel.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				leaveGroupLabel.addListener('mouseout', function() {
					this.setCursor('default');
				});
				leaveGroupLabel.addListener('click', function() {
					this._leaveGroup(genericItem.getUserData('id'));
				}, this);
				genericItem.add(leaveGroupLabel, {width: '20%'});
			}
			else {
				genericItem.setUserData('isOwner', false);
				var privilegeSelectBox = new eyeos.ui.form.SelectBox([
					{name: tr('Admin'), id: eyeos.ui.tabs.GroupAll.ROLE_ADMIN},
					{name: tr('Editor'), id: eyeos.ui.tabs.GroupAll.ROLE_EDITOR},
					{name: tr('Viewer'), id: eyeos.ui.tabs.GroupAll.ROLE_VIEWER},
				]).set({
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				genericItem.add(privilegeSelectBox, {width: '25%'});
				genericItem.setUserData('privilege', privilegeSelectBox);

				var itemRole = null;
				switch(role) {
					case eyeos.ui.tabs.GroupAll.ROLE_ADMIN:
						itemRole = privilegeSelectBox.getChildren()[0];
						privilegeSelectBox.setSelection([itemRole]);
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_EDITOR:
						itemRole = privilegeSelectBox.getChildren()[1];
						privilegeSelectBox.setSelection([itemRole]);
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_VIEWER:
						itemRole = privilegeSelectBox.getChildren()[2];
						privilegeSelectBox.setSelection([itemRole]);
						break;
				}

				privilegeSelectBox.addListener('changeSelection', function (e) {
					var selected = e.getData()[0];
					if (selected instanceof eyeos.ui.toolbar.ListItem) {
						var newRole = selected.getId();
						var param = {
							workgroupId: this._workgroupId,
							membersInfo: [{
									userId: id,
									role: newRole
							}]
						};
						eyeos.callMessage(this._checknum, '__Workgroups_updateMembers', param, function () {});
					}
					
				}, this);

				var accessSelectBox = new eyeos.ui.form.SelectBox([
					{name: tr('Allowed'), id: eyeos.ui.tabs.GroupAll.STATUS_MEMBER},
					{name: tr('Blocked'), id: eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED}
				]).set({
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				genericItem.add(accessSelectBox, {width: '25%'});
				genericItem.setUserData('access', accessSelectBox);

				accessSelectBox.addListener('changeSelection', function (e) {
					var selected = e.getData()[0];
					if (selected instanceof eyeos.ui.toolbar.ListItem) {
						var newStatus = selected.getId();
						var param = {
							workgroupId: this._workgroupId,
							membersInfo: [{
								userId: id,
								status: newStatus
							}]
						};
						eyeos.callMessage(this._checknum, '__Workgroups_updateMembers', param, function () {});
					}
				}, this);

				var itemStatus = null;
				switch(status) {
					case eyeos.ui.tabs.GroupAll.STATUS_MEMBER:
						itemStatus = accessSelectBox.getChildren()[0];
						accessSelectBox.setSelection([itemStatus]);
						break;
					case eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED:
						itemStatus = accessSelectBox.getChildren()[1];
						accessSelectBox.setSelection([itemStatus]);
						break;
				}

				var remove = new qx.ui.basic.Label().set({
					value: tr('Remove'),
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				remove.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				remove.addListener('mouseout', function() {
					this.setCursor('default');
				});
				remove.addListener('click', function() {
					var op = new eyeos.dialogs.OptionPane(
						tr('Are you sure you want to remove that member?'),
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
					op.createDialog(
						null,
						tr('Remove') + ': ' + name,
						function (answer) {
							if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
								var params = {
									workgroupId: this._workgroupId,
									userIds: new Array()
								};

								params.userIds.push(id);
								eyeos.callMessage(this._checknum, '__Workgroups_deleteMemberships', params, function () {
									genericItem.destroy();
								}, this);
							}
						},this).open();
				}, this);
				genericItem.add(remove);

				genericItem.add(new qx.ui.toolbar.Separator().set({
					alignY: 'middle'
				}));

				var ban = new qx.ui.basic.Label().set({
					value: tr('Ban'),
					alignY: 'middle',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				ban.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				ban.addListener('mouseout', function() {
					this.setCursor('default');
				});
				ban.addListener('click', function() {
					var op = new eyeos.dialogs.OptionPane(
						tr('Banning a member will prevent that person from joining your group. Are you sure you want to ban that member?'),
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
					op.createDialog(
						null,
						tr('Ban') + ': ' + name,
						function (answer) {
							if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
								var params = {
									workgroupId: this._workgroupId,
									membersInfo: new Array()
								};

								params.membersInfo.push({userId: id, status: eyeos.ui.tabs.GroupAll.STATUS_BANNED});
								eyeos.callMessage(this._checknum, '__Workgroups_updateMembers', params, function () {
									genericItem.destroy();
								}, this);
							}
						},this).open();
				}, this);
				genericItem.add(ban);
			}

			return genericItem;
		},

		_leaveGroup: function(userId) {
			var op = new eyeos.dialogs.OptionPane(
				tr('To leave the group, first select a new owner. You may not select pending or banned members.'),
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);

			op.createDialog(
				null,
				tr('Before leaving this Group...'),
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						this._changeOwnerGroup(userId, true);
					}
				},this).open();
		},

		_changeOwnerGroup: function(userId, deleteAfter) {
			var op = new eyeos.dialogs.OptionPane(
				tr('Once you delegate the ownership to another user, you will can’t change it back. Are you sure?'),
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				tr('Change Owner'),
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var members = this._userContainer.getChildren();

						members.forEach(function(member) {
							if(member.getUserData('isOwner') == false) {
								member.getChildren()[3].setVisibility('excluded');
								member.getChildren()[4].setVisibility('excluded');
								member.getChildren()[5].setVisibility('excluded');

								var setAsOwner = new qx.ui.basic.Label().set({
									value: tr('Set as Owner'),
									alignX: 'center',
									alignY: 'middle',
									margin: 5,
									font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
									textColor: '#A4A4A4',
									marginRight: 15
								});

								setAsOwner.addListener('mouseover', function() {
									this.setCursor('pointer');
								});

								setAsOwner.addListener('mouseout', function() {
									this.setCursor('default');
								});

								setAsOwner.addListener('click', function() {
									var params = {
										id: this._workgroupId,
										ownerId: member.getUserData('id')
									};

									eyeos.callMessage(this._checknum, '__Workgroups_updateWorkgroup', params, function () {
										

										var bus = eyeos.messageBus.getInstance();
										bus.send('workgroup', 'changeOwner', eyeos.ui.tabs.GroupAll.ROLE_ADMIN);

										if(deleteAfter) {
											var op = new eyeos.dialogs.OptionPane(
												tr('Are you sure you want to leave this group?'),
												eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
												eyeos.dialogs.OptionPane.YES_NO_OPTION);

											op.createDialog(
												null,
												tr('Leave Group'),
												function (answer) {
													if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
														var toBeDeleted = new Array();

														toBeDeleted = {
															workgroupId: this._workgroupId,
															userIds: new Array()
														};

														toBeDeleted.userIds.push(userId);

														eyeos.callMessage(this._checknum, '__Workgroups_deleteMemberships', toBeDeleted, function () {
															this._reloadUsersList();
														}, this);
													}
												},this).open();
										} else {
											this._reloadUsersList();
										}
									}, this);
								}, this);

								member.add(setAsOwner);
							}
							else {
								member.setVisibility('excluded');
							}
						}, this);
					}
				},this).open();
		},

		_reloadUsersList: function () {
			var selected = this._buttonsManager.getSelection()[0];
			if (selected instanceof qx.ui.toolbar.RadioButton) {
				this._filterUserByRoleStatus(selected.getUserData('id'));
			}
		},

        _refreshGui: function () {
            this._workgroupId = null;
            this.__selectAllFilter();
            this._searchBox.setValue(tr('Search'));
            this._userContainer.removeAll();
        }
	}
});
