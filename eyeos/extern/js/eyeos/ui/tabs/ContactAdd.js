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
qx.Class.define('eyeos.ui.tabs.ContactAdd', {
	extend: eyeos.ui.tabs.Item,

	properties: {
		id: {
			check: 'String'
		},
		tags: {
			init: new Array()
		},
		realDescription: {
			check: 'String'
		},
		state: {
			check: 'String',
			init: null
		}
	},

	construct: function (name, id, description, page, state) {
		this.base(arguments);
		
		this.setName(name);
		this.setId(id);
		this._description = description;

		this.setImage('index.php?checknum=' + page.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]=' + id);
		this.setPage(page);
		this.setState(state);

		this._updateLayout();
		this.addMyListeners();
	},

	members: {
		_description: null,
		_imageAdd: 'index.php?extern=images/new.png',
		_imagePending: 'index.php?extern=/images/user-away.png',
		_imageDelete: 'index.php?extern=/images/16x16/actions/list-remove.png',
		_imageAdded: 'index.php?extern=images/22x22/actions/dialog-ok-apply.png',
		_requestListener: null,
		_deleteContactListener: null,
		_confirmListener: null,
		
		addMyListeners: function () {
			var bus = eyeos.messageBus.getInstance();

			this._requestListener = bus.addListener('eyeos_people_requestRelationship', function(e) {
				var myContact = e.getData();
				if (myContact.getId() == this.getId()) {
					this.setState('pending');
					this._showAsPendingContact();
				}
			}, this);

			this._confirmListener = bus.addListener('eyeos_people_confirmContact', function(e) {
				var myContact = e.getData();
				if (myContact.getId() == this.getId()) {
					this.setState('accepted');
					this._showAsAddedContact();
				}
			}, this);

			this._deleteContactListener = bus.addListener('eyeos_people_deletePending', function(e) {
				var contactId = e.getData();
				if (contactId == this.getId()){
					this.setState('');
					this._showAsToAdd();
				}
			}, this);

			this._deleteContactListener = bus.addListener('eyeos_people_deleteContact', function(e) {
				var contactId = e.getData();
				if (contactId == this.getId()){
					this.setState('');
					this._showAsToAdd();
				}
			}, this);
		},

		_updateLayout: function () {
			/*
			 * Update Command Image and Function related to Click event
			 */
			this.setRealDescription(this._description);
			this.setDescription(this._description);
			this.setDescriptionTooltip(this._description);
			
			this.setImageCommand(this._imageAdd);
			this._updateMenuNormal();
			this.setImageCommandFunction(this._addContact);
			this.setDescription(this.getRealDescription());

			if (this.getState() == 'accepted') {
				this._showAsAddedContact();
			} else if (this.getState() == 'pending') {
				this._showAsPendingContact();
			}
		},

		_updateMenuNormal: function () {
			this.cleanMenu();
			var addContactMenu = new qx.ui.menu.Button('Add Contact', this._imageAdd).set({
				'backgroundColor': '#ffffff'
			});
			addContactMenu.addListener('execute', this._addContact, this);
			this.addToMenu(addContactMenu);
		},

		_showAsToAdd: function () {
			this.showAsNormal();
			this._updateLayout();
		},

		_showAsAddedContact: function () {
			this.showAsNormal();
			this.showAsAdded(this._imageAdded);
			this.setImageCommandFunction(this._functionNull);
			this.cleanMenu();
			
			var deleteContact = new qx.ui.menu.Button('Remove Contact', this._imageDelete).set({
				'backgroundColor': '#ffffff'
			});
			deleteContact.addListener('execute', function (e) {
				this._deletePending();
			}, this);
			this.addToMenu(deleteContact);

			this.setDescription(this._description);
			this.setDescriptionTooltip(this._description);

		},

		
		_showAsPendingContact: function () {
			this.showAsAdded(this._imagePending);
			this.setImageCommandFunction(this._functionNull);
			this.cleanMenu();
			
			var deleteContact = new qx.ui.menu.Button('Remove Contact', this._imageDelete).set({
				'backgroundColor': '#ffffff'
			});
			deleteContact.addListener('execute', function (e) {
				this._deletePending();
			}, this);
			this.addToMenu(deleteContact);
			
			this.setDescription('Pending.');
			this.setDescriptionTooltip('Pending.');
			
		},
		
		_functionNull: function () {
			//Just increase your karma
		},
		
		_addContact: function () {
			var text =  'Add Contact: ' + this.getName();
			var description = 'Are you sure you want to add ' + this.getName() + ' to your contact list?<br /><br />Remember, ' + this.getName() + ' has to accept your pending friendship request. You can find this user in your Pending List!'
			var op = new eyeos.dialogs.OptionPane(
				description,
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				text,

				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var contactManager = eyeos.contacts.ContactManager.getInstance();
						contactManager.requestRelationship(this.getId(), function () {

							}, this);
					//			eyeos.callMessage(this.getPage().getChecknum(), 'addNewContact', this.getId(), function () {
					//				this._showAsPendingContact();
					//			}, this);
					}
				},
				this, true
				).open();
		},

		/**
		 * This function delete the contact from the layout and remove the
		 * relationship in the System when we are in pending state
		 */
		_deletePending: function () {
			var text =  'Delete Contact: ' + this.getName();
			var description = 'Are you sure you want to delete ' + this.getName() + ' ?';
			var op = new eyeos.dialogs.OptionPane(
				description,
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				text,
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var contactManager = eyeos.contacts.ContactManager.getInstance();
						contactManager.deletePending(this.getId(), function () {}, this);
					}
				},
				this, true
			).open();
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
			op.createDialog(
				null,
				text,
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var contactManager = eyeos.contacts.ContactManager.getInstance();
						contactManager.deleteContact(this.getId(), function () {}, this);
					}
				},
				this, true
			).open();
		}
	}
});


