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
 * Contact is a model class for store information about a contact.
 * Main usage of Contact is related to ContactManager: every time we have to comunicate
 * changes to ContactManager we have to send a object of this class.
 *
 * This class has a field metadata that is an instance of eyeos.contacts.Metadata
 */
qx.Class.define('eyeos.contacts.Contact', {
	extend : qx.core.Object,

	statics: {
		/**
		 * Convert an eyeos.contacts.Contact in a Json Compatible
		 *
		 * @param contact {eyeos.contacts.Contact} The contact we need to convert
		 */
		toJson: function(contact) {
			return {
				id: contact.getId(),
				nickname: contact.getNickname(),
				state: contact.getState(),
				lists: contact.getLists(),
				meta: contact.getMetadataInstance().getAllMeta(),
                connected: contact.getConnected()
			};
		}
	},
	
	properties: {
		id: {
			check: 'String',
			nullable: false,
			event: 'changeId'
		},
		
		nickname: {
			check: 'String',
			nullable: false
		},

		state: {
			check: ['accepted', 'pending']
		},
		
		confirmable: {
			check: 'Boolean'
		},

		lists: {
			init: new Array()
		},

		listsName: {
			init: new Array()
		},

		metadataInstance: {
			check: 'eyeos.contacts.Metadata'
		},

		relationDate: {
			check: 'Integer'
		},

        connected: {
            check: 'Boolean',
            init: false
        }
	},

	construct: function (contact) {
		this.base(arguments);

		this.setId(contact['id']);
		this.setNickname(contact['nickname']);
		this.setState(contact['state']);
		this.setConfirmable(typeof contact['confirmable'] == 'boolean' ? contact['confirmable'] : false);
		this.setLists(contact['lists']);
		this.setListsName(contact['listsName']);
		this.setRelationDate(parseInt(contact['relationDate']));
        this.setConnected(contact['connected']);

		this.setMetadataInstance( new eyeos.contacts.Metadata());
		this.getMetadataInstance().replaceMeta(contact['meta']);
	}
});