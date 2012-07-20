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
qx.Class.define('eyeos.application.usermanagement.system', {
	extend: qx.ui.tabview.Page,

	properties: {

	},

	construct: function (label, icon, checknum) {
		this.base(arguments, label);
		this._checknum = checknum;

		this._buildGui();
		this._addMyListeners();
	},

	members: {
		_checknum: null,
		_body: null,
		_registerOptionsManager: null,

		_addMyListeners: function () {

		},

		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				allowGrowY: true
			});

			this._createBody();
		},

		_refreshGui: function () {
			this._groupList.updategroupList();
			this._groupTabView._refreshGui();
		},

		_createBody: function () {
			this._body = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginLeft: 20
			});
			
			this.add(this._body, {flex: 1});

			this._createTabViews();
			this._createCommands();
		},

		_createTabViews: function () {
			this._tabView = new qx.ui.tabview.TabView('left');
			this._body.add(this._tabView, {flex: 1});

			this._createRegisterTab();
		},

		_createRegisterTab: function () {
			var registerTab = new qx.ui.tabview.Page(tr('Register')).set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
			
			this._tabView.add(registerTab);

			 var box = new qx.ui.groupbox.GroupBox('Register enable / disable: ').set({
				layout: new qx.ui.layout.VBox()
			 });
			 registerTab.add(box);

			 var yesOption = new qx.ui.form.RadioButton(tr('Yes ( it will be possible for a new user to register itself )'));
			 yesOption.setUserData('id', 'true');
			 box.add(yesOption);

			 var noOption = new qx.ui.form.RadioButton(tr('No  ( just the admin can add a new user )'));
			 noOption.setUserData('id', 'false');
			 box.add(noOption);
			 
			 this._registerOptionsManager = new qx.ui.form.RadioGroup(yesOption, noOption);

			eyeos.callMessage(this._checknum, 'isRegisterActive', null, function(result) {
				if(result) {
					this._registerOptionsManager.setSelection([yesOption]);
				} else {
					this._registerOptionsManager.setSelection([noOption]);
				}
			}, this);
		},

		_createCommands: function () {
            var saveButtonBox = new qx.ui.container.Composite().set({
                decorator: null,
                layout: new qx.ui.layout.HBox()
            });
            this._body.add(saveButtonBox);

            saveButtonBox.add(new qx.ui.core.Spacer(), {flex: 1});

            this._saveButton = new qx.ui.form.Button(tr('Save')).set({
                width: 130,
				margin: 2
			});

			this._saveButton.addListener('execute', function () {
				this._save();
			}, this);

			saveButtonBox.add(this._saveButton);
		},

		_save: function () {
			var param = this._registerOptionsManager.getSelection()[0].getUserData('id');

			eyeos.callMessage(this._checknum, 'saveRegisterXML', param, function() {
			}, this);
		}
	}
});
