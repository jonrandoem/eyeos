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
 * ContactManager is system of cache for contacts implemented by  a singleton class.
 * Main Advantage to use ContactManager is an huge riduction of systemCall on
 * the PHP side
 */


qx.Class.define('eyeos.contacts.ContactManager', {
	type : 'singleton',
	extend : qx.core.Object,

	statics: {
		init: function () {
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.setChecknum(null);

			var bus = eyeos.messageBus.getInstance();

            bus.addListener('eyeos_status_online', function (e) {
                var userId = e.getData();

				//Update the internal data struct and return the new Contact
				var myContact = this.__changeConnected(userId, true);

				if (myContact == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'userConnected', myContact);
				}
			}, contactManager);

            bus.addListener('eyeos_status_offline', function (e) {
                var userId = e.getData();
				//Update the internal data struct and return the new Contact
				var myContact = this.__changeConnected(userId, false);

				if (myContact == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'userDisconnected', myContact);
				}
			}, contactManager);

			bus.addListener('eyeos_events_confirmContact', function (e) {
				var userId = e.getData();

				//Update the internal data struct and return the new Contact
				var myContact = this.__confirmContact(userId);

				if (myContact == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'confirmContact', myContact);
				}
			}, contactManager);

			bus.addListener('eyeos_NSPeople_confirmContact', function (e) {
				var userId = e.getData();
				
				//Update the internal data struct and return the new Contact
				var myContact = this.__confirmContact(userId);

				if (myContact == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'confirmContact', myContact);
				}
			}, contactManager);

			bus.addListener('eyeos_NSPeople_requestRelationship', function (e) {
				var userId = e.getData();
				eyeos.callMessage(this.getChecknum(), '__Contacts_getContactById', userId, function (result) {
					var myContact = new eyeos.contacts.Contact(result);
					this.__requestRelationship(myContact);

					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'requestRelationship', myContact);
				}, this);
			}, contactManager);

			bus.addListener('eyeos_events_deleteContact', function (e) {
				var userId = e.getData();
				
				//Update the internal data struct
				if (this.__removeContact(userId) == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'deleteContact', userId);
				}
			}, contactManager);

			bus.addListener('eyeos_ummanager_userDeleted', function (e) {
				var userId = e.getData();

				//Update the internal data struct
				if (this.__removeContact(userId) == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'deleteContact', userId);
				}
			}, contactManager);

			bus.addListener('eyeos_NSPeople_deleteContact', function (e) {
				var userId = e.getData();

				//Update the internal data struct
				if (this.__removeContact(userId) == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'deleteContact', userId);
				}
			}, contactManager);

			bus.addListener('eyeos_NSPeople_deletePending', function (e) {
				var message = e.getData();
				var userId = message['from'];
				
				//Update the internal data struct
				if (this.__removeContact(userId) == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'deleteContact', userId);
				}
			}, contactManager);
		}	
	},
	
	properties: {
		contacts: {
			init: new Array()
		},
		toRefresh: {
			check: 'Boolean',
			init: true
		},
		checknum: {
			init: null,
			nullable: true,
			apply: '_applyChecknum'
		}
	},

	members: {
		__isLocked: false,
		__pendingRequests: new Array(),

		/**
		 * Say to the contact Manager that before to do the next request should update
		 * the cachè.
		 * This is useful for example when there is an update on the name of a tag.
		 */
		refreshCache: function () {
			this.setToRefresh(true);
		},
		
		/**
		 * Execute the callback function with the contacts of the user.
		 * The first time we retrieve contacts from the server, we store in a
		 * cache system so next call to this function will be faster
		 *
		 * @param filter {String} The state you want to filter ['accepted', 'pending']
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		getAllContacts: function (filter, callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateContacts(function() {
					if (typeof callback == 'function') {
						callback.call(callbackContext, this.__filterContactsByState(filter));
					}
				}, this);
			} else {
				if (typeof callback == 'function') {
					callback.call(callbackContext, this.__filterContactsByState(filter));
				}
			}
		},

		/**
		 * Search the contacts by name providining a pattern and execute the callback
		 *
		 * @param numberOfDays {name} The Patter to search
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		searchContactsByName: function (name, callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateContacts(function() {
					if (typeof callback == 'function') {
						callback.call(callbackContext, this.__filterContactsByName(name));
					}
				}, this);
			} else {
				if (typeof callback == 'function') {
					callback.call(callbackContext, this.__filterContactsByName(name));
				}
			}
		},

		/**
		 * Execute the callback function with the contacts added in the last 'numberOfDays'.
		 *
		 * @param numberOfDays {Integer} The number of days 
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		getRecentlyAddedContacts: function (numberOfDays, callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateContacts(function() {
					var filterContacts = this.__filterContactsByLastDays(numberOfDays);
					callback.call(callbackContext, filterContacts);
				}, this);
			} else {
				var filterContacts = this.__filterContactsByLastDays(numberOfDays);
				callback.call(callbackContext, filterContacts);
			}
		},

		
		/**
		 * The same of getAllContacts, but is possible to specify an array to contact
		 * to retrieve
		 *
		 * @param contactIds {Array] The array of ids for the contact to retrieve
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		getContactsByIds: function (contactIds, callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateContacts(function() {
					var filterContacts = this.__filterContactsByIds(contactIds);
					callback.call(callbackContext, filterContacts);
				}, this);
			} else {
				var filterContacts = this.__filterContactsByIds(contactIds);
				callback.call(callbackContext, filterContacts);
			}
		},

		/**
		 * The same of getAllContacts, but is possible to specify an array to contact
		 * to retrieve
		 *
		 * @param contactIds {Array] The array of ids for the contact to retrieve
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		getContactsByNicknames: function (nicknames, callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateContacts(function() {
					var filterContacts = this.__filterContactsByNicknames(nicknames);
					callback.call(callbackContext, filterContacts);
				}, this);
			} else {
				var filterContacts = this.__filterContactsByNicknames(nicknames);
				callback.call(callbackContext, filterContacts);
			}
		},

		/**
		 * Execute the callback function with the number of contacts
		 *
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		getNumberOfContacts: function (callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateContacts(function() {
					callback.call(callbackContext, this.getContacts().length);
				});
			} else {
				callback.call(callbackContext, this.getContacts().length);
			}
		},
		
		/**
		 * Update information about a user and return the new Contact
		 *
		 * @param modifiedContact {eyeos.contacts.Contact} The object of the contact modified
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		updateContact: function (modifiedContact, callback, callbackContext) {
			eyeos.callMessage(this.getChecknum(), '__Contacts_updateContact', eyeos.contacts.Contact.toJson(modifiedContact), function(actions) {
				this.__replaceContact(modifiedContact);
				this.__sendEvents(modifiedContact.getId(), actions);
				callback.call(callbackContext, actions);
			}, this);
		},

		/**
		 * Delete a user that is on pending state
		 * (Actually is almost a clone of removeContact, we need just to separate
		 * the events)
		 *
		 * @param userId {String} The object of the contact modified
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		deletePending: function (userId, callback, callbackContext) {
			eyeos.callMessage(this.getChecknum(), '__Contacts_removeContact', userId, function() {
				//Remove the element from the internal datastruct
				if (this.__removeContact(userId) == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'deletePending', userId);
					
					callback.call(callbackContext);
				}
			}, this);
		},
		
		/**
		 * Delete a contact from the cache and send events with the messageBus
		 *
		 * @param userId {String} The object of the contact modified
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callbackve
		 */
		deleteContact: function (userId, callback, callbackContext) {
			eyeos.callMessage(this.getChecknum(), '__Contacts_removeContact', userId, function() {
				// Remove the contact from the internal DataStruct
				if (this.__removeContact(userId) == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'deleteContact', userId);

					callback.call(callbackContext);
				}
			}, this);
		},
		
		/**
		 * Confirm the Request of Relationship and update the state of the contact
		 *
		 * @param userId {String} The id of the contact confirmed
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		confirmContact: function(userId, callback, callbackContext) {
			eyeos.callMessage(this.getChecknum(), '__Contacts_confirmContact', userId, function() {
				//Update the internal data struct and return the new Contact
				var myContact = this.__confirmContact(userId);

				if (myContact == null) {
					this.refreshCache();
				} else {
					//Send Message with the DBUS
					var bus = eyeos.messageBus.getInstance();
					bus.send('people', 'confirmContact', myContact);

					//Call the callback
					callback.call(callbackContext);
				}
				
			}, this);
		},
		
		/**
		 * Request the relationship to other user
		 *
		 * @param userId {String} The id of the contact we are requesting relationship
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		requestRelationship: function (userId, callback, callbackContext) {
			eyeos.callMessage(this.getChecknum(), '__Contacts_requestRelationship', userId, function(user) {
				//Update the internal data struct and return the new Contact
				var myContact = new eyeos.contacts.Contact(user);
				this.__requestRelationship(myContact);

				//Send Message with the DBUS
				var bus = eyeos.messageBus.getInstance();
				bus.send('people', 'requestRelationship', myContact);

				//Call the callback
				callback.call(callbackContext);
			}, this);
		},

		/**
		 * Update the state of a contact in 'accepted' because we accept the request
		 * of relationship and the contact is not more 'pending'
		 *
		 * @param newContact {eyeos.contacts.Contact} The contact to be added
		 */
		__confirmContact: function (userId) {
			var myContact = this.__filterContactsByIds([userId]);
			if (myContact[0] && myContact[0].getState() == 'pending') {
				myContact[0].setState('accepted');
				return myContact[0];
			} else {
				return null;
			}
		},

        /**
		 * Update the properties connected of a user. This property indicate
         * if a user is connected or not on the system
		 *
		 * @param newContact {eyeos.contacts.Contact} The contact to be added
		 */
        __changeConnected: function (userId, connected) {
            var myContact = this.__filterContactsByIds([userId]);

			if (myContact[0]) {
				myContact[0].setConnected(connected);
				return myContact[0];
			} else {
				return null;
			}
        },

		/**
		 * Add a contact in the internal structure
		 *
		 * @param newContact {eyeos.contacts.Contact} The contact to be added
		 */
		__requestRelationship: function (newContact) {
			var myContacts = this.getContacts();

			//Check if the user is already Present
			for (var i = 0; i < myContacts.length; ++i) {
				if (myContacts[i].getId() == newContact.getId()) {
					return;
				}
			}

			//Add the Contact
			myContacts.push(newContact);

			//Sort the array of contact
			this._sortByName(myContacts);
		},

		/**
		 * Delete the user in the internal structure
		 *
		 * @param userId {String} The userId of the contact to remove
		 */
		__removeContact: function (userId) {
			var myContact = this.getContacts();
			for (var i = 0; i < myContact.length; ++i) {
				if (myContact[i].getId() == userId) {
					myContact.splice(i, 1);
					return userId;
				}
			}
			return null;
		},
		
		/**
		 * Replace the user in the internal structure
		 *
		 * @param modifiedContact {eyeos.contacts.Contact] The object of the contact modified
		 */
		__replaceContact: function (modifiedContact) {
			var myContact = this.getContacts();
			for (var i = 0; i < myContact.length; ++i) {
				if (modifiedContact.getId() == myContact[i].getId()) {
					myContact[i].setLists(this.__cloneArray(modifiedContact.getLists()));
					myContact[i].setListsName(this.__cloneArray(modifiedContact.getListsName()));
					myContact[i].setMetadataInstance(modifiedContact.getMetadataInstance());
				}
			}
		},

		/**
		 * Send the events when there are changes in actions trough the Bus and
		 * to the event Framework
		 *
		 * @param userId {String} The id of the contact to update
		 * @param actions {Obejct} An Object that rapresent the change to communicate
		 */
		__sendEvents: function (userId, actions) {
			var bus = eyeos.messageBus.getInstance();
			//Send add Tag Events
			var addActions = actions['add'];
			if (addActions.length > 0) {
				for (var i = 0; i < addActions.length; ++i) {
					bus.send('people', 'assignTag', [userId, addActions[i]]);

					//Send Event to Event Framework
					var event = new eyeos.events.Event({
						type: 'People_AssignList',
						eventData: {
							usersId: userId,
							listId: addActions[i]
						}
					});
					var eventJson = eyeos.events.Event.toJson(event);
					eyeos.callMessage(this.getChecknum(), '__Events_sendEventByType', eventJson);
				}
			}
			
			//Send delete Tag Events
			var deleteActions = actions['delete'];
			if (deleteActions.length > 0) {
				for (i = 0; i < deleteActions.length; ++i) {
					bus.send('people', 'unassignTag', [userId, deleteActions[i]]);

					//Send Event to Event Framework
					var event = new eyeos.events.Event({
						type: 'People_UnassignList',
						eventData: {
							usersId: userId,
							listId: deleteActions[i]
						}
					});
					var eventJson = eyeos.events.Event.toJson(event);
					eyeos.callMessage(this.getChecknum(), '__Events_sendEventByType', eventJson);
				}
			}
		},
		
		/**
		 * return the contacts those names match a string
		 *
		 * @param name {String} The pattern to search
		 */
		__filterContactsByName: function (name) {
			var myContacts = this.getContacts();
			var results = new Array();
			name = name.toLowerCase();
			for (var i = 0; i < myContacts.length; ++i) {
				var metadata = myContacts[i].getMetadataInstance();
				var contactName = metadata.getMeta(['eyeos.user.firstname']) + ' ' + metadata.getMeta(['eyeos.user.lastname']);
				contactName = contactName.toLowerCase();
				if (contactName.indexOf(name) != -1 ) {
					results.push(myContacts[i]);
				}
			}
			return results;
		},

		/**
		 * Return the information for the contact in contactsIds.
		 *
		 * @param contactIds {Array} The array of ids for the contact to retrieve
		 */
		__filterContactsByIds: function (contactIds) {
			var myContacts = this.getContacts();
			var results = new Array();
			for (var i = 0; i < myContacts.length; ++i) {
				for (var j = 0; j < contactIds.length; ++j) {
					if (myContacts[i].getId() == contactIds[j]) {
						results.push(myContacts[i]);
					}
				}
			}
			return results;
		},

		/**
		 * Return the information for the contact in nicknames.
		 *
		 * @param nicknames {Array} The array of ids for the contact to retrieve
		 */
		__filterContactsByNicknames: function (nicknames) {
			var myContacts = this.getContacts();
			var results = new Array();
			for (var i = 0; i < myContacts.length; ++i) {
				for (var j = 0; j < nicknames.length; ++j) {
					if (myContacts[i].getNickname() == nicknames[j]) {
						results.push(myContacts[i]);
					}
				}
			}
			return results;
		},

		/**
		 * Return the information for the contact added in the last numOfDays
		 *
		 * @param numOfDays {Integer} The number of days
		 */
		__filterContactsByLastDays: function (numOfDays) {
			var myContacts = this.__cloneArray(this.getContacts());
			this._sortByDate(myContacts);

			var results = new Array();
			var cTime = parseInt(new Date().getTime() / 1000);
			for (var i = 0; i < myContacts.length; ++i) {
				if (myContacts[i].getState() == 'accepted') {
					if ((cTime - myContacts[i].getRelationDate()) <= numOfDays * 24 * 60 * 60) {
						results.push(myContacts[i]);
					} else {
						break;
					}
				}
			}
			return results;
		},

		/**
		 * Return the information for the contact with this state
		 *
		 * @param state {String} The state to filter
		 */
		__filterContactsByState: function (state) {
			var myContacts = this.getContacts();
			var results = new Array();
			for (var i = 0; i < myContacts.length; ++i) {
				if (myContacts[i].getState() == state) {
					results.push(myContacts[i]);
				}
			}
			return results;
		},
		
		/**
		 * Populate the internal caché when is not yet charged.
		 *
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		__populateContacts: function (callback, callbackContext) {
			var newRequest = {
				callback: callback,
				callbackContext: callbackContext
			};
			this.__pendingRequests.push(newRequest);

			if (this.__isLocked == true || this.getChecknum() == null) {
				return;
			} else {
				this.__isLocked = true;
			}

			eyeos.callMessage(this.getChecknum(), '__Contacts_getAllContacts', null, function (results) {
				this.setContacts([]);
				
				//Update the internal Cache
				var myContacts = this.getContacts();
				var Contact = eyeos.contacts.Contact;
				for (var i = 0; i < results.length; ++i) {
					myContacts.push(new Contact(results[i]));
				}
				this._sortByName(myContacts);
				this.setToRefresh(false);
				this.__isLocked = false;

				this._processPendingRequest();
			}, this);
		},

		/**
		 * Sort the internal array with contacts
		 */
		_sortByName: function (myContacts) {
			myContacts.sort(this.__cmpByName);
		},

		/**
		 * Comparation function to sort contacts by name
		 */
		__cmpByName: function (a, b) {
			var metaA = a.getMetadataInstance();
			var metaB = b.getMetadataInstance();

			var nameA = metaA.getMeta(['eyeos.user.firstname']) + ' ' + metaA.getMeta(['eyeos.user.lastname']);
			var nameB = metaB.getMeta(['eyeos.user.firstname']) + ' ' + metaB.getMeta(['eyeos.user.lastname']);

			nameA = nameA.toLowerCase();
			nameB = nameB.toLowerCase();
			return ((nameA < nameB) ? -1 : ((nameA > nameB) ? 1 : 0));;
		},

		/**
		 * Sort the internal array By Date
		 */
		_sortByDate: function (myContacts) {
			myContacts.sort(this.__cmpByDate);
		},

		/**
		 * Comparation function to sort contacts by creation date of the relation
		 */
		__cmpByDate: function (a, b) {
			var dateA = a.getRelationDate();
			var dateB = b.getRelationDate();

			return ((dateA < dateB) ? 1 : ((dateA > dateB) ? -1 : 0));;
		},


		/**
		 * Return a copy of the array
		 *
		 * @param oldArray {array} The array to clone
		 * @return {array} The copy of the array
		 */
		 __cloneArray: function (oldArray) {
			 var newArray = new Array();

			 for (var i = 0; i < oldArray.length; ++i) {
				 newArray.push(oldArray[i]);
			 }
			 return newArray;
		 },

		 /**
		  * Function launched when we set the Checknum
		  */
		_applyChecknum: function (newValue){
			if (newValue != null){
				this._processPendingRequest();
			}
		},

		/**
		  * Process all the request in pending. A process is on pending when
		  * we are executing a callmessage or we don't have a valid checknum
		  */
		_processPendingRequest: function () {
			if (this.__isLocked != true && this.getChecknum() != null) {
				while (this.__pendingRequests.length > 0) {
					var request = this.__pendingRequests.shift();
					try{
						if (this.isToRefresh()) {
								this.__populateContacts(request['callback'], request['callbackContext']);
								break;
						} else {
								request['callback'].call(request['callbackContext'], this.getContacts());
						}
					} catch (e){
						eyeos.consoleWarn('Unable to execute the callback while processing getAllContacts()');
					}
				}
			}
		}

	}

});
