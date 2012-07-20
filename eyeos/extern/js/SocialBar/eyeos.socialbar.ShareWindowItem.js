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

qx.Class.define('eyeos.socialbar.ShareWindowItem', {
	extend: qx.ui.container.Composite,

	properties: {
		id : {
			check: 'String'
		},
		originalPrivilege: {
			check: ['Various', 'Editor', 'Viewer']
		},
		newPrivilege: {
			check: ['Editor', 'Viewer']
		},
		name: {
			
		},
		listsName: {
			init: new Array()
		},
		window: {
			
		}
	},

	/**
	 * id is the Id of the contact Show
	 */
	construct: function (window, contact, privilege) {
		this.base(arguments);
		
		this.setWindow(window);
		this.setId(contact.id);
		this.setName(contact.name);
		this.setListsName(contact.listsName);

		this.setOriginalPrivilege(privilege);
		this.setNewPrivilege(privilege);
		this._buildGui();
	},

	members: {
		_infoBox: null,
		_selectForm: null,
		_removeIcon: null,

                _otherLI: null,
                _editorLI: null,
                _viewerLI: null,
		
		_buildGui: function () {
			this.set({
				height: 38,
				allowGrowY: false,
				decorator: null,
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				})
			});
			this._createInfoBox();
			this._createPrivilegeBox();
			this._createDeleteBox();

			this._addMyListeners();
		},

		_addMyListeners: function () {
			this._removeIcon.addListener('click', function (e) {
				this.getWindow()._removeItemById(this.getId());			
			}, this);
		},

		_createInfoBox: function () {
			this._infoBox = new qx.ui.container.Composite().set({
				decorator: null,
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				})
			});
			this.add(this._infoBox, {width: '45%'});
			this._createImageBox();
			this._createDescriptionBox();
		},

		_createImageBox: function () {
			var contactImage = new qx.ui.basic.Image().set({
				source: 'index.php?checknum=' + this.getWindow().getBox().getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]=' + this.getId(),
				height: 30,
				width: 30,
				scale: true,
				decorator: new qx.ui.decoration.Single(1, 'solid', 'gray'),
				padding: 1
			});
			this._infoBox.add(contactImage);
		},

		_createDescriptionBox: function () {
			var descriptionBox = new qx.ui.container.Composite().set({
				decorator: null,
				layout: new qx.ui.layout.VBox(),
				marginLeft: 10
			});
			this._infoBox.add(descriptionBox);

			var nameLabel = new qx.ui.basic.Label().set({
				value: this.getName(),
				font: new qx.bom.Font(11, ['Helvetica', 'Arial'])
			});
			descriptionBox.add(nameLabel);

			var descriptionList = new qx.ui.basic.Label().set({
				value: this.getListsName(),
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				textColor: 'gray',
				rich: false,
				maxWidth: 150
			});
			descriptionBox.add(descriptionList);
		},

		_createPrivilegeBox: function () {
			var privilegeBox = new qx.ui.container.Composite().set({
				decorator: null,
				layout: new qx.ui.layout.VBox().set({
					alignY: 'middle'
				})
			});
			this.add(privilegeBox, {width: '42%'});

			this._selectForm = this.__createSelectForm(this.getOriginalPrivilege());
			privilegeBox.add(this._selectForm);
		},

		__createSelectForm: function (privilege) {
			var itemSelectForm = new qx.ui.form.SelectBox().set({
				decorator: null,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle'
			});

			this._otherLI = new qx.ui.form.ListItem('Various').set({
				visibility: 'excluded'
			});
			this._viewerLI = new qx.ui.form.ListItem('Viewer');
			this._editorLI = new qx.ui.form.ListItem('Editor');

			itemSelectForm.add(this._otherLI);
			itemSelectForm.add(this._viewerLI);
			itemSelectForm.add(this._editorLI);

			if (privilege != null) {
                            switch (privilege) {
                                case 'Various':
                                    this._otherLI.setVisibility('visible');
                                    itemSelectForm.setSelection([this._otherLI]);
                                    break;
                                case 'Editor':
                                    itemSelectForm.setSelection([this._editorLI]);
                                    break;
                                case 'Viewer':
                                    itemSelectForm.setSelection([this._viewerLI]);
                                    break;
                            }
			} else {
				itemSelectForm.setSelection([this._viewerLI]);
			}

			itemSelectForm.addListener('focusin', function() {
				this._otherLI.setVisibility('excluded');
			}, this);

			itemSelectForm.addListener('focusout', function() {
				this._otherLI.setVisibility('visible');
			}, this);

			itemSelectForm.addListener('changeSelection', function (e) {
				if (itemSelectForm.getSelection()[0] == this._otherLI) {
					itemSelectForm.setSelection([this._viewerLI]);
				}
				this.setNewPrivilege(itemSelectForm.getSelection()[0].getLabel());
				if (this.getWindow().getLockSelectForm() == false){
					this.getWindow().__updateMainSelectForm();
				}
			}, this);

			return itemSelectForm;
		},

		
		_createDeleteBox: function () {
			var deleteBox = new qx.ui.container.Composite().set({
				decorator: null,
				layout: new qx.ui.layout.VBox().set({
					alignX: 'center',
					alignY: 'middle'
				})
			});
			this.add(deleteBox, {width: '13%'});
			this._removeIcon = new qx.ui.basic.Image('index.php?extern=images/clear.png').set({
					padding: 10
			});
			deleteBox.add(this._removeIcon);
		},

		changePrivilege: function (privilege) {
                    switch (privilege) {
                        case 'Editor':
                            this._selectForm.setSelection([this._editorLI]);
                            break;
                        case 'Viewer':
                            this._selectForm.setSelection([this._viewerLI]);
                            break;
                        case 'Various':
                            this._selectForm.setSelection([this._otherLI]);
                            break;
                    }
		}
	}
});