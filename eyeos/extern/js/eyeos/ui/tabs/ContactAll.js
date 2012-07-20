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
 * This is the Item for Contact when a Contacts Tabs is selected
 */
qx.Class.define('eyeos.ui.tabs.ContactAll', {
	extend: eyeos.ui.tabs.Item,

	properties: {
		id: {
			check: 'String'
		},
		tags: {
			init: new Array()
		},
		contactModel: {
			
		},
		// added because this class, if used in NewGroupWindow.populateContacts
		// should not try to open the eyeFile!!!!
		atomic: {
			check: 'Boolean',
			init: false
		}
	},

	construct: function (contact, page) {
		this.base(arguments);

		this.setContactModel(contact);
		var metadata = contact.getMetadataInstance();
		var name = metadata.getMeta(['eyeos.user.firstname']) + ' ' + metadata.getMeta(['eyeos.user.lastname']);
		this.setName(name);
		this.setId(contact.getId());
		this.setImage('index.php?checknum=' + page.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]=' + contact.getId());
		
		var myLists = this.__cloneArray(contact.getLists());	
		this.setTags(myLists);
		this.setPage(page);

		this._updateLayout();

	},

	members: {
		_imageCheckNormal: 'index.php?extern=/images/tick.png',
		_imageCheckSelected: 'index.php?extern=/images/tick2.png',
		_imageDelete: 'index.php?extern=/images/16x16/actions/list-remove.png',
		_deleteContactListener: null,
		_deleteTagListener: null,
		_addTagListener: null,
		_subMenu: null,
		
		_updateLayout: function () {
			this.setImageCommand(this._imageCheckNormal);
			this.setImageCommandFunction(this._changeSelection);
			this._updateDescription();
			this.updateMenu();
			this.addMyListeners();
		},
		
		addMyListeners: function () {
			this.getContent().addListener('click', function (e) {
				if (!this.isAtomic()) {
					eyeos.execute('files', this.getPage().getChecknum(), ['share://~' + this.getContactModel().getNickname()], null);
					document.eyeDesktopTabs.hideContent();
				}
				else {
					this._changeSelection();
				}
			}, this);

			var bus = eyeos.messageBus.getInstance();
			this._addTagListener = bus.addListener('eyeos_people_assignTag', function(e) {
				var contactId = e.getData()[0];
				if (contactId == this.getId()){
					var tag = e.getData()[1] + '';
					var myTags = this.getTags();

					//Search if the tag is already present
					var position = myTags.indexOf(tag);
					//If the tag is not present I push it
					if (position == -1) {
						myTags.push(tag);
						this._updateMenuCheckbox();
						this._updateDescription();
					}
					
				}
			}, this);

			this._deleteTagListener = bus.addListener('eyeos_people_unassignTag', function(e) {
				var contactId = e.getData()[0];
				if (contactId == this.getId()){
					var tag = e.getData()[1] + '';
					var myTags = this.getTags();
					var position = myTags.indexOf(tag);
					if (position != -1) {
						myTags.splice(position, 1);
						this._updateMenuCheckbox();
						this._updateDescription();
					}
				}
			}, this);

		this._deleteContactListener = bus.addListener('eyeos_people_deleteContact', function(e) {
				var contactId = e.getData();
				if (contactId == this.getId()){
					//Remove the listener of the bus 
					bus.removeListenerById(this._deleteTagListener);
					bus.removeListenerById(this._addTagListener);
					bus.removeListenerById(this._deleteContactListener);
					//Destroy the object
					this.destroy();
				}
			}, this);
			
		},

		updateMenu: function () {
			this.cleanMenu();
			
			var deleteContact = new qx.ui.menu.Button('Remove Contact', this._imageDelete).set({
				'backgroundColor': '#ffffff'
			});
			deleteContact.addListener('execute', function (e) {
				this._deleteContact();
			}, this);
			this.addToMenu(deleteContact);

			var menuTags = this._createMenuTags();
			this.addToMenu(menuTags);
		},
		
		_createMenuTags: function () {
			var currentLists = this.getPage().getTags();
			this._subMenu = new qx.ui.menu.Menu();
			for (var i in currentLists) {
				if (currentLists[i].id != 0 && currentLists[i].id != -1 ) {
					var checkbox = new qx.ui.menu.CheckBox(currentLists[i].name);
					if (this.getTags().indexOf(currentLists[i].id) != -1) {
						checkbox.setValue(true);
					}
					checkbox.setUserData('id', currentLists[i].id);
					var self = this;
					checkbox.addListener('mousedown', function(e) {
						if (this.isValue()) {
							self._removeTagToItem(this.getUserData('id'));
							if (this.getUserData('id') == self.getPage()._selectedTag) {
								self.setVisibility('excluded');
							}
						} else {
							self._addTagToItem(this.getUserData('id'));
						}
					});

					this._subMenu.add(checkbox);
				}
			}

			var subMenuButton = new qx.ui.menu.Button('Lists', null, null, this._subMenu);
			return subMenuButton;
		},

		_updateMenuCheckbox: function() {
			var myCheckboxes = this._subMenu.getChildren();
			for (var i = 0; i < myCheckboxes.length; ++i) {
				if (this.getTags().indexOf(myCheckboxes[i].getUserData('id')) != -1) {
					myCheckboxes[i].setValue(true);
				} else {
					myCheckboxes[i].setValue(false);
				}
			}
		},

		_addTagToItem: function (tag) {
			var myTags = this.getContactModel().getLists();
			var myTagsName = this.getContactModel().getListsName();
			var position = myTags.indexOf(tag);
			if (position == -1) {
				// Find the name of the tag
				var pageTags = this.getPage().getTags();
				for (var i = 0; i < pageTags.length; ++i) {
						if (pageTags[i].id == tag){
							var tagName = pageTags[i].name;
						}
				}
				// Updating model
				myTags.push(tag + '');
				myTagsName.push(tagName);
				
				var contactManager = eyeos.contacts.ContactManager.getInstance();
				contactManager.updateContact(this.getContactModel(), function () {}, this);
			}
		},

		_removeTagToItem: function (tag) {
			var myTags = this.getContactModel().getLists();
			var myTagsName = this.getContactModel().getListsName();
			var position = myTags.indexOf(tag);

			if (position != -1) {
				myTags.splice(position, 1);
				myTagsName.splice(position, 1);
				this.getTags().splice(position, 1);
				var contactManager = eyeos.contacts.ContactManager.getInstance();
				contactManager.updateContact(this.getContactModel(), function () {}, this);
				this.updateMenu();
				this._updateDescription();
			}
		},

		_updateDescription: function () {
			var contactTags = this.getTags();
			var pageTags = this.getPage().getTags();

			var firstConcat = true;
			for (var i = 0; i < contactTags.length; ++i) {
				for (var j = 0; j < pageTags.length; ++j) {
					if (contactTags[i] == pageTags[j].id) {
						if (firstConcat) {
							var description = pageTags[j].name;
							firstConcat = false;
						} else {
							description = description + ', ' + pageTags[j].name;
						}
						
					}
				}
			}

			description = (description && description.length) ? '' + description : '';
			this.setDescription(description);
			this.setDescriptionTooltip(description);
		},

		/**
		 * This function delete the contact from the layout and remove the
		 * relationship in the System
		 */ 
		_deleteContact: function () {
			var text =  'Delete Contact: ' + this.getName();
			var description = 'Are you sure you want to delete ' + this.getName() + ' from your contact?';
			var op = new eyeos.dialogs.OptionPane(
				description,
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(null, text, function (answer) {
				if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
					var contactManager = eyeos.contacts.ContactManager.getInstance();
					contactManager.deleteContact(this.getId(), function () {}, this);
//					eyeos.callMessage(this.getPage().getChecknum(), 'removeContact', this.getId(), function (results) {
//						this.destroy();
//					}, this);
				}
			}, this, true).open();
		},

		/**
		 * TODO: Implement Share for Contacts
		 */
		_share: function () {
			alert('Not Yet Implemented');
		},

		_changeSelection: function() {
			this.toggleSelected();
			this.toggleShowAsSelected();
			if (this.isSelected()) {
				this.setImageCommand(this._imageCheckSelected);
			} else {
				this.setImageCommand(this._imageCheckNormal);
			}
		 },

		 __cloneArray: function (oldArray) {
			 var newArray = new Array();

			 for (var i = 0; i < oldArray.length; ++i) {
				 newArray.push(oldArray[i] + '');
			 }
			 return newArray;
		 }

	}
});


