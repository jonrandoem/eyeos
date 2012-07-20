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
function chat_application(checknum, pid, args) {
	var app = new eyeos.application.Chat(checknum, pid, args);
	app.drawGUI();
}

qx.Class.define('eyeos.application.Chat', {
	extend: eyeos.system.EyeApplication,

	construct: function(checknum, pid, args) {
		arguments.callee.base.call(this, 'chat', checknum, pid);
	},

	members: {
		drawGUI: function() {
			var mainWindow = new eyeos.ui.Window(this, tr('Instant Messaging')).set({
				contentPadding:0
			});
			
			mainWindow.setWidth(300);
			mainWindow.setHeight(460);
			var winLayout = new qx.ui.layout.VBox();
			mainWindow.setLayout(winLayout);
			mainWindow.open();
			mainWindow.toggleShowStatusbar();
			
			var search = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			var decoratorSearch = new qx.ui.decoration.Background().set({
					backgroundImage: 'eyeos/extern/images/Search_background.png',
					backgroundRepeat: 'repeat-x'
			});
			search.setDecorator(decoratorSearch);
			search.set({
				paddingTop:2,
				height: 30
			});

			this.searchField = new qx.ui.form.TextField();
			var decoratorWidgetMenu = new qx.ui.decoration.RoundBorderBeveled(null, 'white', 0, 10, 10, 10, 10);
			this.searchField.setDecorator(decoratorWidgetMenu);

			this.searchField.set({
				width: 180,
				backgroundColor: 'white',
				shadow: null
			});

			this.searchField.addListener('input', function(e) {
				var childrens = this.connectionList.getChildren();
				for(var i in childrens) {
					if(childrens[i].getUserData('contact').getNickname()  && childrens[i].getUserData('contact').getNickname().indexOf(this.searchField.getValue()) != -1) {
						childrens[i].show();
					} else {
						childrens[i].exclude();
					}
				}
			}, this);
			this.searchField.setPlaceholder('Search...');
			
			search.add(this.searchField, {flex:true});

			this.connectionList = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			var scroller = new qx.ui.container.Scroll();
			scroller.add(this.connectionList);

			eyeos.contacts.ContactManager.getInstance().getAllContacts('accepted', function(e) {
				if(e.length == 0 || !e) {
					this.connectionList.add(new qx.ui.core.Spacer(), {flex: true});
					this.connectionList.add(new qx.ui.basic.Label().set({
						value: '<div style="font-size:13px;color:#777777;font-weight:bold"><center>There are no online contacts right now in your eyeOS Network. You can add new contacts from the People menu</center></div>',
						rich: true
					}), {flex: true});
					this.connectionList.add(new qx.ui.core.Spacer(), {flex: true});
				} else {
					for(var i=0; i<e.length; i++) {
						this.createContact(e[i]);
					}
				}

			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_people_userDisconnected', function(e) {
				var childrens = this.connectionList.getChildren();
				e = e.getData();
				for(var i in childrens) {
					if(childrens[i].getUserData('contact').getNickname() && childrens[i].getUserData('contact').getNickname() == e.getNickname()) {
						childrens[i].destroy();
					}
				}
				this.createContact(e);
			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_people_userConnected', function(e) {
				e = e.getData();
				var childrens = this.connectionList.getChildren();
				for(var i in childrens) {
					if(childrens[i].getUserData('contact').getNickname() && childrens[i].getUserData('contact').getNickname() == e.getNickname()) {
						childrens[i].destroy();
					}
				}
				this.createContact(e);
			}, this);
			mainWindow.add(search);
			mainWindow.add(scroller, {flex:true});
		},

		createContact: function(e) {
			var user = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				cursor:'Pointer',
				height: 54
			});

			user.addListener('appear', function(e) {
				var ele = e.getTarget().getContainerElement().getDomElement().style.borderBottom = '1px solid #CCCCCC';
			}, this);
			
			user.addListener('mouseover', function(e) {
				this.setBackgroundColor('#5f83b9')
			});

			user.addListener('mouseout', function(e) {
				this.setBackgroundColor('transparent');
			});
			var displayName = e.getMetadataInstance().getAllMeta()['eyeos.user.firstname'] + ' ' + e.getMetadataInstance().getAllMeta()['eyeos.user.lastname'];
			user.setUserData('contact',e);
			var infobox = new qx.ui.container.Composite(new qx.ui.layout.VBox());

			if(e.getConnected()) {
				var label = new qx.ui.basic.Label().set({
					value:displayName,
					font: new qx.bom.Font(16, ['Arial']),
					textColor: '#333333',
					marginTop:11
				});

				var labelInfo = new qx.ui.basic.Label().set({
					value:'On-line',
					font: new qx.bom.Font(12, ['Arial']),
					textColor: '#6F8E0D',
					marginTop:0
				});
			} else {
				var label = new qx.ui.basic.Label().set({
					value:displayName,
					font: new qx.bom.Font(16, ['Arial']),
					textColor: '#999999',
					marginTop:11
				});

				var labelInfo = new qx.ui.basic.Label().set({
					value:'Off-line',
					font: new qx.bom.Font(12, ['Arial']),
					textColor: '#999999',
					marginTop:0
				});
			}
			
			

			infobox.add(label);
			infobox.add(labelInfo);
			var image = new qx.ui.basic.Image('index.php?checknum=' + this.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]='+e.getId());
			image.set({
				scale: true,
				width: 32,
				height: 32,
				marginRight:4,
				marginLeft:10,
				marginTop:10
			});
			
			user.add(image);
			user.add(infobox);
			if(e.getConnected()) {
				this.connectionList.addAt(user, 0);
				user.addListener('click', function(e) {
					var dbus = eyeos.messageBus.getInstance();
					dbus.send('chat', 'requestchat', this.getUserData('contact'));
				});
			} else {
				this.connectionList.add(user);
				user.addListener('click', function(e) {
					alert('It\'s not possible to chat with offline contacts');
				});
			}
		}
	}
});