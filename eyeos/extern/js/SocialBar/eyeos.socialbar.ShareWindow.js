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

qx.Class.define('eyeos.socialbar.ShareWindow', {
	extend: qx.ui.window.Window,

	properties: {
		box: {

		},
		shareds: {
			init: new Array()
		},
		contacts: {
			init: new Array()
		},
		lockSelectForm: {
			check: 'Boolean',
			init: false
		}
	},

	events: {
		/**
		 * Fired when a item should appear selected on the application
		 */
		totalSharesUpdated: 'qx.event.type.Data'
	},

	construct: function (box, shareds, contactsId) {
		this.base(arguments, tr('Sharing'));
		this.setBox(box);
		this.setShareds(shareds);
		this.setContacts(contactsId);

		this._buildGui();
		this._populate();
	},

	members: {
		_layoutTitleBox: null,
		_layoutMainContentBox: null,
		_mainSelectForm: null,
		_layoutContentScroll: null,
		_layoutContentBox: null,
		_layoutButtonBox: null,
			_buttonAccept: null,
                _viewerLI: null,                    // Viewer List Item
                _editorLI: null,                    // Editor List Item
                _otherLI: null,                     // Other List Item



		_populate: function () {
			this._layoutContentBox._removeAll();
			if (this.getContacts().length == 0) {
				return;
			}
			eyeos.callMessage(this.getBox().getChecknum(), '__SocialBar_getContacts', this.getContacts(), function(contacts) {
				for (var i = 0; i < contacts.length; ++i) {
					var privilege = this._evalPrivilege(contacts[i].id);
					var contactLayout = new eyeos.socialbar.ShareWindowItem(this, contacts[i], privilege);
					this._layoutContentBox.add(contactLayout, {flex: 1});
				}
					this.__updateMainSelectForm();
			}, this);
			
		},
                
		_buildGui: function () {
			this.open();
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				modal: true,
				resizable: false,
				showStatusbar: false,
				showMaximize: false,
				showMinimize: false,
				backgroundColor: '#FFFFFF',
				width: 400,
				height: 340,
				allowGrowX: true,
				allowGrowY: false
			});

			this._createTitleBox();
			this._createContentBox();
			this._createButtonBox();
			this.center();
			this._addMyListeners();
		},

		_addMyListeners: function () {
			this._buttonAccept.addListener('execute', function () {
				var toBeDeleted = new Array();
				var toBeUpdated = new Array();
				var allItems = this._layoutContentBox.getChildren();
				var f = 0;
				for (var i = 0; i < allItems.length; ++i) {
					if(allItems[i].getVisibility() == 'excluded') {
						toBeDeleted.push(allItems[i].getId());
					}
					else {
						if (allItems[i].getOriginalPrivilege() != allItems[i].getNewPrivilege() || allItems[i].getNewPrivilege() == "Viewer"){
							toBeUpdated.push([allItems[i].getId(), allItems[i].getNewPrivilege()]);
						}
					}
					f = i;
				}

				this.getBox().fireDataEvent('totalSharesUpdated', i);

				if (toBeUpdated.length > 0) {
					for (var j = 0; j < toBeUpdated.length; ++j) {
						this.getBox().changeUserPrivilege(toBeUpdated[j][0], toBeUpdated[j][1]);
					}
				}
				
				if (toBeDeleted.length > 0) {
					for (var j = 0; j < toBeDeleted.length; ++j) {
						this.getBox().deleteUserShare(toBeDeleted[j]);
					}	
				}
				this.getBox()._updateBodyContent();
				this.close();
			}, this);

			var bus = eyeos.messageBus.getInstance();
			bus.addListener('eyeos_people_confirmContact', function(e) {
				this._populate();
			}, this);
			bus.addListener('eyeos_people_deleteContact', function(e) {
				this._populate();
			}, this);
		},

		_createTitleBox: function () {
			this._layoutTitleBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single(2, 'solid', '#A4A4A4').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				}),
				padding: 10,
				marginBottom: 20
			});
			this.add(this._layoutTitleBox);

			var label = this.__createTitleLabel();
			this._layoutTitleBox.add(label);
		},

		__createTitleLabel: function () {
			var numbersOfItems = this.getShareds().length;
			if (numbersOfItems == 1) {
				var textLabel = this.getShareds()[0].getObject();
			} else {
				var textLabel = numbersOfItems + ' ' + tr('Items');
			}
			return new eyeos.socialbar.Label(textLabel, 'titleWindow');
		},

		_createContentBox: function () {
			 this._layoutMainContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
			this.add(this._layoutMainContentBox, {flex: 1});

			this._createHeaderContent();
			this._createItemContent();
		},

		_createHeaderContent: function () {
			var header = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				paddingLeft: 10,
				paddingRight: 10
			});
			this._layoutMainContentBox.add(header);

			//First Label
			var contentLabel = this.__createContentLabel();
			header.add(contentLabel, {width: '45%'});

			//Second Column
			var privilegeFormBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			header.add(privilegeFormBox, {width: '40%'});

			var privilegeLabel = new eyeos.socialbar.Label(tr('Privilege') + ':', 'windowLabel').set({
				paddingRight: 10
			});
			privilegeFormBox.add(privilegeLabel);

			this._mainSelectForm = this.__createSelectForm();
			this._mainSelectForm.addListener('changeSelection', function (e) {
				if (this._mainSelectForm.getSelection()[0] == this._otherLI) {
                                    //Nothing to do Here
				} else {
                                    this._setPrivilegeToAll(this._mainSelectForm.getSelection()[0].getLabel());
				}
			}, this);
			privilegeFormBox.add(this._mainSelectForm);

			//THIRD COLUMN
			var removeLabel = new eyeos.socialbar.Label(tr('Remove'), 'windowLabel');
			header.add(removeLabel, {width: '15%'});
	
		},

		_createItemContent: function () {
			this._layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true,
				margin: 10
			});
			this._layoutMainContentBox.add(this._layoutContentScroll, {flex: 1});

			this._layoutContentBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				decorator: new qx.ui.decoration.Single(1, 'solid', 'black'),
				allowStretchY: true,
				padding: 10
			});
			this._layoutContentScroll.add(this._layoutContentBox, {flex: 1});
		},

		_createButtonBox: function () {
			this._layoutButtonBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'right'
				}),
				decorator: null
			});
			this.add(this._layoutButtonBox);

			var buttonCancel = new qx.ui.form.Button(tr('Cancel')).set({
				paddingRight: 10,
				paddingLeft: 10,
				marginRight: 10
			});

			buttonCancel.addListener('click', function (e){
				this.close();
				this.destroy();
			}, this);
			this._layoutButtonBox.add(buttonCancel);

			this._buttonAccept = new qx.ui.form.Button(tr('Accept')).set({
				paddingRight: 20,
				paddingLeft: 20,
				marginRight: 10
			});
			this._layoutButtonBox.add(this._buttonAccept);
		},

		__createSelectForm: function () {
			var itemSelectForm = new qx.ui.form.SelectBox().set({
				decorator: null,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle'
			});

			this._otherLI = new qx.ui.form.ListItem(tr('Various')).set({
				visibility: 'excluded'
			});
			this._viewerLI = new qx.ui.form.ListItem('Viewer');
			this._editorLI = new qx.ui.form.ListItem('Editor');

			this._otherLI.deactivate();
                        
			itemSelectForm.add(this._otherLI);
			itemSelectForm.add(this._viewerLI);
			itemSelectForm.add(this._editorLI);

			itemSelectForm.addListener('focusin', function() {
				this._otherLI.setVisibility('excluded');
			}, this);

			itemSelectForm.addListener('focusout', function() {
				this._otherLI.setVisibility('visible');
			}, this);
			
//			if (privilege != null) {
//				if(privilege == 'Various') {
//					other.setVisibility('visible');
//				}
//				console.log(privilege);
//				itemSelectForm.setValue(privilege);
//			}

			return itemSelectForm;
		},

		__createContentLabel: function () {
			var numOfElements = this.getContacts().length;
			return new eyeos.socialbar.Label(tr('People') + ': ' + numOfElements, 'titleWindow').set({
				marginLeft: 10
			});
		},

		__updateMainSelectForm: function () {
			if (this.getLockSelectForm() == true) {
				return;
			}
			
			var items = this._layoutContentBox.getChildren();
			var privileges = new Array();
			for (var i = 0; i < items.length; ++i) {
				privileges.push(items[i].getNewPrivilege());
			}

			if (privileges.length == 1){
				var privilege = privileges.shift();
                                switch (privilege) {
                                case 'Viewer':
                                    this._mainSelectForm.setSelection([this._viewerLI]);
                                    break;
                                case 'Editor':
                                    this._mainSelectForm.setSelection([this._editorLI]);
                                    break;
                            }
			} else {
				var firstValue = privileges.shift();
				var flag = true;
				for (i = 0; i < privileges.length; ++i){
					if (firstValue != privileges[i]) {
						this._otherLI.setVisibility('visible');
						this._mainSelectForm.setSelection([this._otherLI]);
						flag = false;
					}
                        }
                        if (flag){
                            switch (firstValue) {
                                case 'Viewer':
                                    this._mainSelectForm.setSelection([this._viewerLI]);
                                    break;
                                case 'Editor':
                                    this._mainSelectForm.setSelection([this._editorLI]);
                                    break;
                            }
                        }
                    }
                },

		_evalPrivilege: function (id) {
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
			return 'Viewer';
		},

		_setPrivilegeToAll: function (privilege) {
			this.setLockSelectForm(true);
			var items = this._layoutContentBox.getChildren();
			for (var i = 0; i < items.length; ++i) {
				items[i].changePrivilege(privilege);
			}
			this.setLockSelectForm(false);
		},
		
		_removeItemById: function (id) {
			var items = this._layoutContentBox.getChildren();
			for (var i = 0; i < items.length; ++i) {
				if (items[i].getId() == id) {
					//items[i].destroy();
					items[i].setVisibility('excluded');
					this._checkIfIsToClose();
					return;
				}
			}
		},

		_checkIfIsToClose: function () {
			var items = this._layoutContentBox.getChildren();
			if (items.length == 0) {
				//this.close();
				//this._buttonAccept.setEnabled(false);
			}
		}
	}
});