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
 * NetSync is a system of message for direct communication between user
 * of the same eyeos Network. It use websocket (trough kaazing gateway),
 * activeMQ and the stomp protocol. Once a message is received from other user,
 * it will be sended into the messageBus.
 */
qx.Class.define('eyeos.netSync.old_NetSync', {
	type: 'singleton',
	extend: qx.core.Object,
	members: {
		_stompClient: null,		// StompClient instance
		_passwd: null,			// Password to connect on activeMQ
		_userId: null,			// UserId of the user
		_url: null,				// ActiveMQ URL
		_channel: null,			// The channel we are listening

		init: function (checknum) {
			this._stompClient = new StompClient();
						
			eyeos.callMessage(checknum, 'getNetSyncCredential', null, function(credential) {
				this._userId = credential['id'];
				this._passwd = credential['password'];
				this._url = credential['url'];
				this._channel = credential['channel'];

				this.__addStompListeners();
				this._connect();
			}, this);
		},

		/**
		 * Send a Message to a user
		 *
		 * @param message {eyeos.netSync.Message}
		 */
		send: function (message) {
			if (message instanceof eyeos.netSync.Message
				&& message.getTo() != null &&	message.getType() != null
				&& message.getName() != null) {

				message.setFrom(this._userId);

				var destChannel = this._channel + '' + message.getTo();
				eyeos.consoleInfo('[LOG]SEND: ');
				eyeos.consoleInfo(message);
				this._stompClient.send(eyeos.netSync.Message.toJSon(message), destChannel);
			}
		},
		
		
		/**
		 *	Initialize the listeners for the stomp client
		 */
		__addStompListeners: function () {
			var self = this;
			this._stompClient.onopen = function(headers) {
				self._onOpen(headers);
			}

			this._stompClient.onmessage = function(headers, body) {
				self._onMessage(headers, body);
			}

			this._stompClient.onerror = function(headers, body) {
				self._onError(headers, body);
			}
		},

		/**
		 * Function executed when a message is received
		 */
		_onMessage: function (headers, body) {
			var message = qx.util.Json.parse(body);
			message['data'] = qx.util.Json.parse(message['data']);
			var bus = eyeos.messageBus.getInstance();
			bus.send(message['type'], message['name'], message);
		},

		/**
		 *	Function executed when the client is open
		 */
		_onOpen: function (headers) {
			eyeos.consoleInfo('[STOMP] Socket connection opened');
			this._subscribe();
		},

		/**
		 *	Function executed when something wrong occurred
		 */
		_onError: function (headers, body) {
			eyeos.consoleInfo('[STOMP] Something gone wrong :'+ body);
		},
		
		/**
		 * Connect
		 * Create an instance of StompClient
		 */
		_connect: function () {
			eyeos.consoleInfo('[LOG] Opening socket connection');
			this._stompClient.connect(this._url, {});
		},

		/**
		 * Subscribe a stomp client on a channel.
		 * All the message from this channel will be fired on the messageBus
		 */
		_subscribe: function () {
			var channel = this._channel + '' + this._userId;
			eyeos.consoleInfo('[LOG] Subscribing to : '+ channel);
			this._stompClient.subscribe(channel);
		},

		/**
		 * Subscrive a stomp client to a custom channel
		 * Only for specific purpose
		 */
		subscribe: function (channel) {
			var customChannel = this._channel + '' + channel;
			eyeos.consoleInfo('[LOG] Subscribing to : '+customChannel);
			this._stompClient.subscribe(customChannel);
		},

		/**
		 * Unsubscrive a stomp client from a channel
		 * Only for specific purpose
		 */
		unsubscribe: function (channel) {
			var customChannel = this._channel + '' + channel;
			eyeos.consoleInfo('[LOG] Unsubscribing from : '+ customChannel);
			this._stompClient.unsubscribe(customChannel);
		},

                /**
                         * Disconnect
                         * Destroy an instance of StompClient
                         */
                disconnect: function () {
                    if(this._stompClient) {
                        eyeos.consoleInfo('[LOG] Closing socket connection');
                        this._stompClient.disconnect();
                    }

                }
            }
});

