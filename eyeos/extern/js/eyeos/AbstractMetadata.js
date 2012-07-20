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
 * Metadata is a class that complete the information of a Contact in
 * eyeos.contacts.Contact.
 * It provides set/get method for dynamic attributes.
 */
qx.Class.define('eyeos.AbstractMetadata', {
	extend : qx.core.Object,
	type: 'abstract',

	properties: {
		metadata: {
			init: {}
		}
	},

	construct: function () {
		this.base(arguments);
	},

	members: {
		/**
		 * Set a meta.
		 * To reach the value of a meta, sometimes you need to specify more key
		 * (just to reach the right level), so the first arguments is an array of key
		 *
		 * @param keys {array} The key of the metadata to set
		 * @param value {Sting} The new value for the metadata
		 */
		setMeta: function (keys, value) {
			var myMetas = this.getMetadata();

			var currentMeta = myMetas;
			for (var i = 0; i < keys.length; ++i) {
				if (i == keys.length - 1) {
					currentMeta[keys[i]] = value;
				} else {
					if (currentMeta[keys[i]] == undefined) {
						currentMeta[keys[i]] = {};
					}
					currentMeta = currentMeta[keys[i]];
				}
			}
		},

		/**
		 * Replace all meta.
		 * 
		 * @param meta {Array} An associative array with metadata.
		 */
		replaceMeta: function (meta) {
			this.setMetadata(meta);
		},
		
		/**
		 * Get a meta.
		 * To reach the value of a meta, sometimes you need to specify more key
		 * (just to reach the right level), so the first arguments is an array of key
		 *
		 * @param keys {array} The key of the metadata to set
		 */
		getMeta: function (keys) {
			var myMetas = this.getMetadata();

			for (var i = 0; i < keys.length - 1; ++i) {
				if (myMetas[keys[i]] != undefined) {
					myMetas = myMetas[keys[i]];
				} else {
					return null;
				}

			}

			return myMetas[keys[keys.length - 1]];
		},

		getAllMeta: function () {
			return this.getMetadata();
		},

		/**
		 * Delete a meta.
		 * To reach the value of a meta, sometimes you need to specify more key
		 * (just to reach the right level), so the first arguments is an array of key
		 *
		 * @param keys {array} The key of the metadata to set
		 */
		deleteMeta: function (keys) {
			var myMetas = this.getMetadata();

			var currentMeta = myMetas;
			for (var i = 0; i < keys.length; ++i) {
				if (i == keys.length - 1) {
					delete currentMeta[keys[i]];
				} else {
					if (currentMeta[keys[i]] != undefined){
						currentMeta = currentMeta[keys[i]];
					} else {
						return ;
					}
				}
			}
		}
	}

});