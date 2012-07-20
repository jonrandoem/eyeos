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

qx.Class.define('eyeos.application.usermanagement.userList', {
	extend: qx.ui.container.Composite,

	events: {
		/**
		 * Fired when a user is selected, data =>  the id of the
		 * selected user
		 */
		userSelect: 'qx.event.type.Data'
	},

	properties: {

	},
	construct: function (checknum) {
		this.base(arguments);
		this._checknum = checknum;

		this._buildGui();
	},
	
	members: {
		_userList: null,			//Gui Element

		getSelectedUser: function () {
			if (this._userList.getSelection() && this._userList.getSelection()[0]) {
				var listItem = this._userList.getSelection()[0];
				return {
					id: listItem.getUserData('id'),
					name: listItem.getLabel()
				};
			} else {
				return null;
			}
		},
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				width: 150,
				allowGrowX: false
			});

			var mainLabel = new qx.ui.basic.Label(tr('Users:')).set({
				marginBottom: 5
			});
			this.add(mainLabel);
			this._createSearchBox();

			this._createUserList();
			this.updateUserList();
		},

		_createSearchBox: function () {
			var searchBox = new qx.ui.form.TextField(tr('Search')).set({
				marginBottom: 8
			});
			searchBox.addListener('changeValue', function (e){
				var filter = searchBox.getValue();
				this._filterUserByName(filter);
			}, this);

			searchBox.addListener('focus', function (e){
				//Set Selection to all text
				this.setTextSelection(0);
			});
			this.add(searchBox);
		},

		_filterUserByName: function (filter) {
			this.updateUserList(filter);
		},

		_createUserList: function () {
			this._userList = new qx.ui.form.List().set({
				marginBottom: 10
			});

			this._userList.addListener('changeSelection', function (e) {
				if (e.getData() && e.getData()[0]){
					this.fireDataEvent('userSelect', e.getData()[0].getUserData('id'));
				}
			}, this);
			this.add(this._userList, {flex: 1});
		},

		updateUserList: function (filter) {
			var param = null;
			if (filter && filter.length) {
				param = {
					filter: filter
				};
			}
			eyeos.callMessage(this._checknum, 'getAllUsers', param, function(results) {
				this._userList.removeAll();
				for (var i = 0; i < results.length; ++i) {
					var result = results[i];
					var listItem = null;
					if(result['name'] != ' ') {
						listItem = new qx.ui.form.ListItem(result['name']);
					} else {
						listItem = new qx.ui.form.ListItem(result['username']);
					}
					
					listItem.setUserData('id', result['id']);

					this._userList.add(listItem);

                    // Select the first one
                    if (i == 0) {
                        this._userList.setSelection([listItem]);
                    }
				}
				
			}, this);

            
		}
		
	}
});