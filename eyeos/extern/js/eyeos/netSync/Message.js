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


/**
 *	eyeos.netSync.Message is used to be sent on NetSync. Basically is a container
 *	of a few informations.
 */
qx.Class.define('eyeos.netSync.Message', {
	extend: qx.core.Object,

	statics: {
		/**
		 * Convert an eyeos.netSync.Message in a Json Compatible
		 *
		 * @param message {eyeos.netSync.Message} The message to convert
		 */
		toJSon: function (message) {
			return qx.util.Json.stringify({
				from: message.getFrom(),
				type: message.getType(),
				name: message.getName(),
				data: qx.util.Json.stringify(message.getData()),
				to: message.getTo()
			});
		},
                toObject: function(message) {
                    var msgObj = qx.util.Json.parse(message);
                    console.log(msgObj);
                    var msgData = qx.util.Json.parse(msgObj.data);
                    msgObj.data = msgData
                    return msgObj;

                }
	},
	
	properties: {
		from: {
			check: 'String',
			init: null
		},
		type: {
			check: 'String',
			init: null
		},
		name: {
			check: 'String',
			init: null
		},
		data : {
			init: null
		},
		to: {
			check: 'String',
			init: null
		}
	},

	/**
	 * @param params {map} {
	 *		type {String} type of the message
	 *		name {String} name of the message
	 *		data {Object} A Json stringify object
	 *		to {String} The id of the receiver
	 * }
	 */
	construct: function (params) {
		this.base(arguments);

		if (params != null) {
			if (params['type'] != null) {
				this.setType(params['type']);
			}

			if (params['name'] != null) {
				this.setName(params['name']);
			}

			if (params['data'] != null) {
				this.setData(params['data']);
			}

			if (params['to'] != null) {
				this.setTo(params['to']);
			}
		}
		
	}
});