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
qx.Class.define('eyeos.netSync.NetSync', {
	type: 'singleton',
	extend: qx.core.Object,
	members: {
                delayIfError: 5000,
                socketRecycleTimeout: 20000,
                response: false,
                type: 'singleton',
                _checknum: null,
                init: function (checknum) {
                            this._checknum = checknum;
                },
                send: function (message) {
                    if (message instanceof eyeos.netSync.Message) {
                        eyeos.callMessage(this._checknum, '__NetSync_send', eyeos.netSync.Message.toJSon(message), null);
                        return true;
                    }
                    return false;
                },
                subscribe: function (fromChannel, password) {
                    this.response = false;
                    eyeos.callMessage(this._checknum, '__NetSync_subscribe', {channel: fromChannel, password: password}, function(response) {
                        this.response = response;
                    }, this, { async: false });
                    return this.response;
                },
                unsubscribe: function (fromChannel) {
                    this.response = false;
                    eyeos.callMessage(this._checknum, '__NetSync_unsubscribe', {channel: fromChannel}, function(response) {
                        this.response = response;
                    }, this, { async: false });
                    return this.response;
                },
                listen: function () {
                    var foo = this;
                    console.log("listen begin");
                    $.ajax({
                        url: 'index.php?checknum=' + this._checknum + '&message=__NetSync_receive&nocache=' + eyeos.utils.getRandomValue(),
                        context: document.body,
                        //timeout: this.socketRecycleTimeout,
                        success: function(data) {
                            var haveError = 0;
                            try {
                                var bus = eyeos.messageBus.getInstance();
								if (data == 'forceRefresh') {
									bus.send('netsync', 'forceRefresh');
									return;
								}
								var messages = data;
                               
                                $.each(messages, function(key, value) {
                                    var newMessage = eyeos.netSync.Message.toObject(value.data);
                                    bus.send(newMessage.type, newMessage.name, newMessage.data);
                                });
                            } catch (e) {
                                console.log("catch! " + e);
                                setTimeout(function(){foo.listen(foo._checknum)}, foo.delayIfError);
                                haveError = 1;
                            }
                            if ( haveError == 0 ) {
                                setTimeout(function(){foo.listen(foo._checknum)}, 500);
                            }
                        },
                        error: function() {
                            console.log("error in netsync");
                            //console.log("error");
                            setTimeout(function(){foo.listen(foo._checknum)}, foo.delayIfError);
                        }
                    });
                    //console.log("listen end");
                }
        }
});
