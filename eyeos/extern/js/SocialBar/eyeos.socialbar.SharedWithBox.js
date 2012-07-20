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
 * SharedWith is a socialbar box to show information about the Share
 * and allow some managements of the share, like change the permission of
 * a contact, or delete the share with a contact
 */

qx.Class.define('eyeos.socialbar.SharedWithBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,


	events: {
		/**
		 * Event Fired when a share is deleted for a user
		 */
		deleteShare: 'qx.event.type.Data',

		/**
		 * Event Fired when a privilege is changed
		 */
		 changePrivilege: 'qx.event.type.Data'

	},

	properties: {
		checknum: {
			check: 'Integer'
		},
		name: {
			check: 'String',
			init: null
		},
		shareds: {
			init: new Array()
		},
		contacts: {
			init: new Array()
		}
	},

	construct: function (checknum, shareds) {
		this.base(arguments);

		this.setChecknum(checknum);
		this.setShareds(shareds);
		this.setContacts(this.__getContactsFromShareds());

		this._buildGui();
		this._addMyListeners();
	},
	
	members: {
		_layoutContentScroll: null,
		_layoutContentBox: null,
		
		/**
		 * LAYOUT PART
		 */
		_buildGui: function () {
			this.set({
				decorator: null,
				layout: new qx.ui.layout.VBox()
			});
			this._createHeader();
			this._createBody();
			this._updateBodyContent();
			this._addMyListeners();
		},

		_addMyListeners: function () {
			var dBus = eyeos.messageBus.getInstance();
			dBus.addListener('eyeos_socialbar_sharesUpdated', function (e) {
				this.setShareds(e.getData());
				this.setContacts(this.__getContactsFromShareds());
				this._updateBodyContent();
			}, this);

			this._generalContactSelectForm.addListener('changeSelection', function (e) {
				var childrens = this._layoutContentBox.getChildren();
				for (var i = 0; i < childrens.length; ++i) {
					this.changeUserPrivilege(childrens[i].getId(), this._generalContactSelectForm.getSelection()[0].getLabel());
				}
				this._updateBodyContent();
			}, this);
		},
		
		_createHeader: function () {
			var firstRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				decorator: null,
				paddingTop: 5,
				paddingLeft: 3,
				paddingRight: 3,
				paddingBottom: 5
			});
			this.add(firstRow);

			var sharedLabel = new qx.ui.basic.Label('<b>' + tr('Shared with') + '</b>').set({
				marginLeft: 10,
				marginBottom: 10,
				font: new qx.bom.Font(14, ['Helvetica', 'Arial']),
				rich: true
			});
			firstRow.add(sharedLabel);

			//Spacer
			firstRow.add(new qx.ui.core.Spacer(), {
				flex: 1
			});

//			var labelManage = new eyeos.socialbar.Label(tr('manage'), 'link');
//			labelManage.set({
//				marginTop: -50,
//				allowGrowX: true,
//				TextAlign: 'right'
//			});
//			labelManage.setCursor('pointer');
//			labelManage.addListener('click', function (e) {
//				this._openManage();
//			}, this);
//			firstRow.add(labelManage);

			var secondRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				})
			});

			this.add(secondRow);
			var manageAllLabel = new qx.ui.basic.Label(tr('Manage All')).set({
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				marginLeft: 12,
				marginRight: 3
			});

			this._generalContactSelectForm = new qx.ui.form.SelectBox().set({
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				//decorator: null, //new qx.ui.decoration.RoundBorderBeveled(null, '#A3A3A3', 1, 5, 5, 5, 5),
				allowGrowX: false,
				width: 75,
				//marginLeft: -7,
				textColor: '#AAAAAA'
			});

			var noAction = new qx.ui.form.ListItem('No Action');
			var viewer = new qx.ui.form.ListItem('Viewer');
			var editor = new qx.ui.form.ListItem('Editor');

			this._generalContactSelectForm.add(noAction);
			this._generalContactSelectForm.add(viewer);
			this._generalContactSelectForm.add(editor);

			secondRow.add(manageAllLabel);
			secondRow.add(this._generalContactSelectForm);
		},

		_createBody: function () {
			this._layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true,
				allowStretchX: true
			});
			this.add(this._layoutContentScroll, {flex: 1});

			this._layoutContentBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				allowStretchY: true
			});
			this._layoutContentScroll.add(this._layoutContentBox, {flex: 1});
		},

		_updateBodyContent: function () {
			this._layoutContentBox.removeAll();
			var myContactsShare = this.getContacts();
			for (var i = 0; i < myContactsShare.length; ++i) {
				var layoutItem = new eyeos.socialbar.SharedWithContact(myContactsShare[i], this._getPrivilegeById(myContactsShare[i]), this);
				this._layoutContentBox.add(layoutItem, {
					flex: 1
				});
			}
		},

		_getPrivilegeById: function (id) {
			var shareds = this.getShareds();
			var isEditor = true;
			var isViewer = true;
			for (var i = 0; i < shareds.length; ++i) {
				var editors = shareds[i].getEditors();
				isEditor = isEditor && (editors.indexOf(id) != -1)?(true):(false);
				var viewers = shareds[i].getViewers();
				isViewer = isViewer && (viewers.indexOf(id) != -1)?(true):(false);
			}
			if (isEditor && !isViewer){
				return 'Editor';
			}
			if (isViewer && !isEditor){
				return 'Viewer';
			}
			return 'Various';
		},

		/**
		 * Open the Manage window for the Share
		 */
		_openManage: function () {
			var manageWindow = new eyeos.socialbar.ShareWindow(this, this.getShareds(), this.getContacts());
		},
		/**
		 * Get the contacts by the information stored in Shareds
		 */
		__getContactsFromShareds: function () {
			var uniqueContacts = new Array();
			var shareds = this.getShareds();

			for (var i = 0; i < shareds.length; ++i) {
				var viewers = shareds[i].getViewers();
				uniqueContacts = qx.lang.Array.unique(viewers.concat(uniqueContacts));

				var editors = shareds[i].getEditors();
				uniqueContacts = qx.lang.Array.unique(editors.concat(uniqueContacts));
			}

			return uniqueContacts;
		},

		deleteUserShare: function (id) {
//			Delete reference to this user in the internal Data structure
			var myShareds = this.getShareds();
			for (var i = 0; i < myShareds.length; ++i) {
					myShareds[i].deleteUser(id);
			}
			this.setShareds(myShareds);

			//FIRE EVENT
			this.fireDataEvent('deleteShare', id);
		},

		changeUserPrivilege: function (id, privilege) {
			if(privilege == 'No Action') {
				return;
			}

			//Update reference to this user in the internal Data structure
			var myShareds = this.getShareds();
			for (var i = 0; i < myShareds.length; ++i) {
				if (privilege == 'Viewer'){
					myShareds[i].addViewer(id);
				} else if (privilege == 'Editor') {
					myShareds[i].addEditor(id);
				}
			}
			this.setShareds(myShareds);

			//FIRE EVENT
			this.fireDataEvent('changePrivilege', [id, privilege]);
		}
	}
});



