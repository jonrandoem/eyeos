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
qx.Class.define('eyeos.application.usermanagement.grouppage', {
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
		_checknum: null,		//checknum of application

		_firstColumn: null,		//Gui Element
		_seconColumn: null,		//Gui Element
		
		_addMyListeners: function () {
			this._groupList.addListener('groupSelect', function (e) {
				if (e.getData()) {
					this._groupTabView.updateGui(e.getData());
				}
			}, this);


            this._groupList.addListener('unselectGroup', function (e) {
				this._groupTabView._refreshGui();
			}, this);
		},
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				allowGrowY: true
			});

			//
			//	First Column
			//
			this._firstColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox()
			});
			this.add(this._firstColumn);

			this._groupList = new eyeos.application.usermanagement.groupList(this._checknum);
			this._firstColumn.add(this._groupList, {flex: 1});

			var commandBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			this._firstColumn.add(commandBox);
			
			commandBox.add(new qx.ui.core.Spacer(), {flex: 1});
			
			var deleteButton = new qx.ui.form.Button(tr('Delete'), 'index.php?extern=images/16x16/actions/edit-delete.png');
			deleteButton.addListener('execute', function () {
				var selectedGroup = this._groupList.getSelectedGroup();
				if (selectedGroup != null) {
					var op = new eyeos.dialogs.OptionPane(
						tr('Are you sure you want to delete this group?'),
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
					op.createDialog(null, tr('Are you sure you want to delete this group?'), function (answer) {
						if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
							eyeos.callMessage(this._checknum, '__Workgroups_deleteWorkgroup', {workgroupId: selectedGroup['id']}, function() {
								this._refreshGui();
							}, this);
						}
					}, this, true).open();
				}
			}, this);
			commandBox.add(deleteButton);
			
			//
			//	Second Column
			//
			this._secondColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginLeft: 20
			});
			this.add(this._secondColumn, {flex: 1});

			this._groupTabView = new eyeos.application.usermanagement.groupTabView(this._checknum);
			this._secondColumn.add(this._groupTabView, {flex: 1});
			
		},

		_refreshGui: function () {
			this._groupList.updategroupList();
			this._groupTabView._refreshGui();
		}
	}
});
