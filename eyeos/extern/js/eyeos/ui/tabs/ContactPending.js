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
qx.Class.define('eyeos.ui.tabs.ContactPending', {
	extend: eyeos.ui.tabs.Item,

	properties: {
		id: {
			check: 'String'
		},
		confirmable: {
			check: 'Boolean'
		},
		contactModel: {
			
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
		this.setPage(page);
		
		this.setConfirmable(contact.getConfirmable());

		this._updateLayout();
		
		this.addMyListeners();
	},

	members: {
		_imageAdd: 'index.php?extern=images/new.png',
		_imagePending: 'index.php?extern=/images/user-away.png',
		_imageDelete: 'index.php?extern=/images/16x16/actions/list-remove.png',
		_deleteContactListener: null,
		_confirmContactListener: null,
		
		addMyListeners: function () {
			var bus = eyeos.messageBus.getInstance();
			this._deleteContactListener = bus.addListener('eyeos_people_deletePending', function(e) {
				var contactId = e.getData();
				if (contactId == this.getId()){
					//Remove the listener of the bus
					bus.removeListenerById(this._deleteContactListener);
					bus.removeListenerById(this._confirmContactListener);
					//Destroy the object
					this.destroy();
				}
			}, this);

			this._confirmContactListener = bus.addListener('eyeos_people_confirmContact', function(e) {
				var contact = e.getData();
				var contactId = contact.getId();

				if (contactId == this.getId()){
					//Remove the listener of the bus
					bus.removeListenerById(this._confirmContactListener);
					bus.removeListenerById(this._deleteContactListener);
					//Destroy the object
					this.destroy();
				}
			}, this);
		},

		_updateLayout: function () {
			/*
			 * Update Command Image and Function related to Click event
			 */
			this.setDescription('Pending');
			this.setDescriptionTooltip('Pending');

			this.showAsAdded(this._imagePending);
			if (this.isConfirmable()) {
				this.setImageCommand(this._imageAdd);
				this.setImageCommandFunction(this._confirmContact);
				this._updateMenuConfirmable();
			} else {
				this.setImageCommand(this._imageDelete);
				this.setImageCommandFunction(this._delContact);
				this._updateMenuNormal();
			}

		},

		_updateMenuNormal: function () {
			this.cleanMenu();
			var delContactMenu = new qx.ui.menu.Button('Delete Contact', this._imageDelete).set({
				'backgroundColor': '#ffffff'
			});
			delContactMenu.addListener('execute', this._delContact, this);
			this.addToMenu(delContactMenu);
		},
		
		_updateMenuConfirmable: function () {
			this.cleanMenu();
			var confirmContactMenu = new qx.ui.menu.Button('Confirm Contact', this._imageAdd).set({
				'backgroundColor': '#ffffff'
			});
			confirmContactMenu.addListener('execute', this._confirmContact, this);
			this.addToMenu(confirmContactMenu);
			
			var delContactMenu = new qx.ui.menu.Button('Delete Contact', this._imageDelete).set({
				'backgroundColor': '#ffffff'
			});
			delContactMenu.addListener('execute', this._delContact, this);
			this.addToMenu(delContactMenu);
		},

		_confirmContact: function () {
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.confirmContact(this.getId(), function () {
			}, this);
		},


		_delContact: function () {
			var op = new eyeos.dialogs.OptionPane(
				'Are you sure you want to delete this contact?',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(null, 'Delete user', function (answer) {
				if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
					var contactManager = eyeos.contacts.ContactManager.getInstance();
					contactManager.deletePending(this.getId(), function () {}, this);
				}
			},
			this, true
			).open();
		},

		_functionNull: function () {
			//Just increase your Karma
		}

	}
});


