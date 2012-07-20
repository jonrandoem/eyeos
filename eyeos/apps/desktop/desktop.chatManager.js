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

qx.Class.define('desktop.chatManager', {
	type: 'singleton',
	extend: qx.core.Object,

	properties: {
		checknum: {
			init: null
		},
		hasFocus: {
			init: true
		}
	},

	members: {
		registerListeners: function(app) {
			var self = this;
			this.timer = null;
			window.onblur = function(){
				self.setHasFocus(false);
			}

			window.onfocus = function(){
				self.setHasFocus(true);
				clearInterval(self.timer);
				document.title = eyeos.getCurrentUserName() +' @ eyeOS ' + eyeos.version;
			}
			
			this.activeChats = {};
			this.app = app;
			var dbus = eyeos.messageBus.getInstance();
			dbus.addListener('eyeos_chat_requestchat', function (e) {
				if(!this.activeChats[e.getData().getNickname()]) {
					this.createChat(e.getData());
				} else {
			//this.activeChats.focus();
			}
			}, this);

			dbus.addListener('eyeos_chat_message', function (e) {
				var data = qx.util.Json.parse(e.getData());
				var who = data[0];
				//extract user info with CM
				var text = data[1];
				eyeos.contacts.ContactManager.getInstance().getContactsByNicknames([who], function(e) {
					var infoUser = e[0];
					if(!this.activeChats[who]) {
						this.createChat(infoUser, text);
						document.audio.play();
						if(this.getHasFocus()) {
							eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [who + ': ' + text]);
						} else {
							this.oldTitle = eyeos.getCurrentUserName() +' @ eyeOS ' + eyeos.version; //copuling here, there are problems
							//with some browsers getting document.title
							var self = this;
							clearInterval(this.timer);
							this.timer = setInterval(function() {
								if(document.title == self.oldTitle) {
									document.title = who+ ' is messaging you';
								} else {
									document.title = self.oldTitle;
								}
							}, 1000);
						}

					} else {
						if(!this.activeChats[who].isActive() && this.getHasFocus()) {
							document.audio.play();
							eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [who + ': ' + text]);
						}

						if(!this.getHasFocus()) {
							document.audio.play();
							this.oldTitle = eyeos.getCurrentUserName() +' @ eyeOS ' + eyeos.version; //copuling here, there are problems
							clearInterval(this.timer);																	//with some browsers getting document.title
							var self = this;
							this.timer = setInterval(function() {
								if(document.title == self.oldTitle) {
									document.title = who+ ' is messaging you';
								} else {
									document.title = self.oldTitle;
								}
							}, 1000);
						}

						var messagesText = this.activeChats[who].getUserData('messages');
						var safeText = this.htmlEntities(text);
						var exp = /(\b(https?:\/\/|ftp:\/\/|file:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
						safeText = safeText.replace(exp,"<a target='_new' href='$1'>$1</a>"); 
						safeText = safeText.replace("<a target='_new' href='www", "<a target='_new' href='http://www");
						if(messagesText.getUserData('last') == who) {
							var message = '<div style="color:#222222;padding-left:6px">'+safeText+'</div>';
						} else {
							//change roles!
							//leave a little space between last message
							var message = '<div style="color:#222222;padding-left:6px;padding-top:6px"><strong style="padding-bottom:6px">'+this.htmlEntities(who)+': </strong><div>'+safeText+'</div></div>';
						}
						messagesText.setUserData('last', who);
						messagesText.setValue(messagesText.getValue()+message);
						messagesText.getLayoutParent().getLayoutParent().scrollByY(900000);
					}
				}, this);
			}, this);

			dbus.addListener('eyeos_people_userDisconnected', function (e) {
				var contactName = e.getData().getNickname();

				if (this.activeChats[contactName]) {
					this.disableChat(this.activeChats[contactName]);
				}
			}, this);

			dbus.addListener('eyeos_people_userConnected', function (e) {
				var contactName = e.getData().getNickname();

				if (this.activeChats[contactName]) {
					this.enableChat(this.activeChats[contactName]);
				}
			}, this);
		},

		createChat: function(principal, text) {
			var displayName = principal.getMetadataInstance().getAllMeta()['eyeos.user.firstname'] + ' ' + principal.getMetadataInstance().getAllMeta()['eyeos.user.lastname'];
			var mainWindow = new eyeos.ui.ChatWindow(this.app, tr('Chat with') + ' ' + displayName).set({
				width: 300,
				height: 460,
				layout: new qx.ui.layout.VBox(),
				contentPadding:10
			});
			
			this.activeChats[principal.getNickname()] = mainWindow;
			mainWindow.addListener('beforeClose', function(e) {
				this.activeChats[principal.getNickname()] = null;
			}, this);

			var messagesArea = new qx.ui.container.Composite(new qx.ui.layout.VBox());

			var value = "";
			var messagesText = new qx.ui.basic.Label().set({
				rich: true,
				selectable: true
			});
			mainWindow.setUserData('messages', messagesText);
			mainWindow.setUserData('chatEnabled', true);
			

			if(text) {
				var safeText = this.htmlEntities(text);
				var exp = /(\b(https?:\/\/|ftp:\/\/|file:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
				safeText = safeText.replace(exp,"<a target='_new' href='$1'>$1</a>"); 
				safeText = safeText.replace("<a target='_new' href='www", "<a target='_new' href='http://www");
				messagesText.setUserData('last', principal.getNickname());
				value += '<div style="color:#222222;padding-left:6px;padding-top:6px"><strong style="padding-bottom:6px">' + this.htmlEntities(principal.getNickname()) + ': </strong><div>' + safeText + '</div></div>';
			}
			messagesText.setValue(value);
			messagesArea.add(messagesText, {
				flex: 1
			});
			var writeArea = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				height:50
			});

			var tarea = new qx.ui.form.TextArea();
			mainWindow.setUserData('textArea', tarea);

			var sendButton = new qx.ui.form.Button(tr('Send')).set({
				marginTop:2,
				marginBottom:2,
				shadow:null
			});
			mainWindow.setUserData('sendButton', sendButton)
			var scroller = new qx.ui.container.Scroll(messagesArea).set({
				marginBottom: 7,
				decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5')
			});
			var self = this;
			var sendMessage = function() {
				var origmessage = tarea.getValue();
				tarea.setValue("");
				if(origmessage == "" || mainWindow.getUserData('chatEnabled') == false ) {
					return;
				}
				
				var safeText = self.htmlEntities(origmessage);
				var exp = /(\b(https?:\/\/|ftp:\/\/|file:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
				safeText = safeText.replace(exp,"<a target='_new' href='$1'>$1</a>");
				safeText = safeText.replace("<a target='_new' href='www", "<a target='_new' href='http://www");
				//first, show it in the messagesArea
				if(messagesText.getUserData('last') == eyeos.getCurrentUserName()) {
					message = '<div style="background-color:#E6E6E6;color:#222222;padding-left:6px">' + safeText + '</div>';
				} else {
					message = '<div style="background-color:#E6E6E6;color:#222222;padding-left:6px;padding-top:6px"><strong style="padding-bottom:6px">' + self.htmlEntities(eyeos.getCurrentUserName()) + ': </strong><div>' + safeText + '</div></div>';
				}
				
				messagesText.setUserData('last', eyeos.getCurrentUserName());
				messagesText.setValue(messagesText.getValue()+message);
				scroller.scrollByY(900000);

				var dest = principal.getId();
				var netSync = eyeos.netSync.NetSync.getInstance();
				var message = new eyeos.netSync.Message({
					type: 'chat',
					name: 'message',
					to: dest,
					data: [eyeos.getCurrentUserName(), origmessage]
				});
				netSync.send(message);
				tarea.focus();
			}
			
			tarea.addListener('keyup', function(e) {
				if (e.getKeyIdentifier() == 'Enter') {
					sendMessage();
				}
			}, this);

			sendButton.addListener('click', sendMessage, this);

			var infoArea = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				});

			var userId = eyeos.getCurrentUserData().id;
			var image = new qx.ui.basic.Image('index.php?checknum=' + this.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]='+principal.getId());
			image.set({
				scale: true,
				width: 50,
				height: 50,
				marginRight:4,
				marginBottom:10
			});

			//user part
			var userBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());

			var label = new qx.ui.basic.Label().set({
				value:displayName,
				font: new qx.bom.Font(16, ['Arial']),
				textColor: '#333333'
			});

			this.labelInfo = new qx.ui.basic.Label().set({
				value:'On-line',
				font: new qx.bom.Font(12, ['Arial']),
				textColor: '#6F8E0D',
				marginTop:0
			});

			userBox.add(label);
			userBox.add(this.labelInfo);
			this.userBox = userBox;
			infoArea.add(image);
			infoArea.add(userBox);
			writeArea.add(tarea, {
				flex:1
			});
			writeArea.add(sendButton);
			mainWindow.add(infoArea);
			mainWindow.add(scroller, {
				flex:1
			});
			mainWindow.add(writeArea);
			mainWindow.open();
			tarea.focus();
			
			//size
			scroller.addListener('appear', function(e) {
				var bounds = e.getTarget().getBounds();
				var offset = 2; //2 = 1+1 px border from right and left

				messagesArea.setMinWidth(bounds.width-offset); 
				messagesText.setMinWidth(bounds.width-offset);
			}, this);
			
			scroller.getChildControl('scrollbar-y').addListener('appear', function(e) {
				var bounds = scroller.getBounds();
				var offset = e.getTarget().getBounds().width+2;
				messagesArea.setMinWidth(bounds.width-offset); 
				messagesText.setMinWidth(bounds.width-offset);
			}, this);
			
			scroller.addListener('resize', function(e) {
				var bounds = e.getTarget().getBounds();
				var offset = 2; //2 = 1+1 px border from right and left
				if(e.getTarget().getChildControl('scrollbar-y').getVisibility() == 'visible') {
					offset = e.getTarget().getChildControl('scrollbar-y').getBounds().width+2;
				}
				messagesArea.setMinWidth(bounds.width-offset); 
				messagesText.setMinWidth(bounds.width-offset);
			}, this);
		},

		disableChat: function (chatWindow) {
			if (chatWindow.getUserData('chatEnabled') == true) {
				chatWindow.setUserData('chatEnabled', false);
				var messageArea = chatWindow.getUserData('messages');
				var message = '<div style="color:red"><i>User goes offline</i></div>';
				messageArea.setValue(messageArea.getValue() + message);

				var sendButton = chatWindow.getUserData('sendButton');
				sendButton.setEnabled(false);
				
				this.labelInfo.destroy();
				this.labelInfo = new qx.ui.basic.Label().set({
					value:'Off-line',
					font: new qx.bom.Font(12, ['Arial']),
					textColor: '#999999',
					marginTop:0
				});
				this.userBox.add(this.labelInfo);
			}
			
		},

		enableChat: function (chatWindow) {
			if (chatWindow.getUserData('chatEnabled') == false) {
				chatWindow.setUserData('chatEnabled', true);
				var messageArea = chatWindow.getUserData('messages');
				var message = '<div style="color:green"><i>User is now online</i></div>';
				messageArea.setValue(messageArea.getValue() + message);
				
				var sendButton = chatWindow.getUserData('sendButton');
				sendButton.setEnabled(true);
				
				this.labelInfo.destroy();
				this.labelInfo = new qx.ui.basic.Label().set({
					value:'On-line',
					font: new qx.bom.Font(12, ['Arial']),
					textColor: '#6F8E0D',
					marginTop:0
				});
				this.userBox.add(this.labelInfo);
			}
		},
		htmlEntities: function (text) {
			return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
		}

	}
});

qx.Class.define('eyeos.ui.ChatWindow', {
	extend: eyeos.ui.Window,

	/**
	 * @param application {eyeos.system.EyeApplication}
	 * @param caption {String}
	 * @param icon {String}
	 * @param fakeMinimize {Boolean ? false}
	 * @param fakeClose {Boolean ? false}
	 */
	construct: function(application, caption, icon, fakeMinimize, fakeClose) {
		arguments.callee.base.call(this, application, caption, icon, fakeMinimize, fakeClose);
	},

	members: {
		_onClose: function(e) {

		}
	}
});