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

function topmenu_application(checknum, pid, args) {
    var application = new eyeos.application.Topmenu(checknum, pid);
    application.initApplication(checknum, args);
}

qx.Class.define('eyeos.application.Topmenu', {
    extend: eyeos.system.EyeApplication,

    construct: function (checknum, pid) {
        arguments.callee.base.call(this, 'topmenu', checknum, pid);
    },

    properties: {

    },

    members: {
        initApplication: function(checknum, args) {
            var bus = eyeos.messageBus.getInstance();
            var user = bus.retrieve('user');
            var screen = bus.retrieve('screen');
            var eyeDesktop = bus.retrieve('eyeDesktop');

            var isAdmin = args[0];
            var apps = args[1];
            var decoratorTopmenu = new qx.ui.decoration.Background().set({
                    backgroundImage: 'eyeos/extern/images/Top_bar.png'
                    //backgroundRepeat: 'scale'
            });
            //	Container TabView
            var containTabs = new qx.ui.container.Composite(new qx.ui.layout.HBox());
            containTabs.setDecorator(decoratorTopmenu);
            containTabs.set ({
                'zIndex' : 500002,
                'height' : 32
            });

            //applications -----------------------

            var applicationsBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            //izquierdo: 404040
            //derecho: 262626
            var applicationsLabel = new qx.ui.basic.Label('Applications').set({
                value: '<span style="font-family:Arial;font-size:13px;text-shadow: black 0px -1px 0px;"><strong>'+tr('Applications')+'</strong></span>',
                rich: true,
                marginTop: 6,
                marginLeft: 10,
                marginRight: 10,
                textColor: '#E5E5E5'
            });

            applicationsLabel.addListener('mouseover', function() {
                applicationsLabel.setTextColor('#57A4DF');
            });

            applicationsLabel.addListener('mouseout', function() {
                applicationsLabel.setTextColor('#E5E5E5');
            });

            applicationsBox.add(applicationsLabel,{'flex' : 1});


            this.appsMenu = new qx.ui.menu.Menu();

            //desplazamiento 4px abajo, 270 grados, color negro 80%, dispersion 9px, 
            var decoratorWidgetMenu = new qx.ui.decoration.RoundBorderBeveled(null, 'white', 0, 0, 0, 5, 5, "0 5px 16px -3px black");
            this.appsMenu.set({
                    'backgroundColor': 'white',
                    'padding': 0,
                    'paddingTop' : 4,
                    'paddingBottom' : 4,
                    'decorator': decoratorWidgetMenu,
                    'marginLeft': 5,
                    'minWidth': 200,
                    'shadow' : false,
                    'blockerColor' : 'red'
            });
			var firstApps = [];
			var order = ['files', 'documents', 'calendar', 'rmail', 'notepad', 'calculator', 'sysmon'];
			order.reverse();
			
			for(var i = 0; i < apps.length; i++) {
				for(var x = 0; x < order.length; x++) {
					if(apps[i].name == order[x]) {
						firstApps[x] = apps[i];
						apps.splice(i, 1);
                        break;
					}
				}
			}

			for(var i in firstApps) {
				apps.unshift(firstApps[i]);
			}

            for(var i in apps) {
                if(apps[i].listable) {
                    var buttonApp = new qx.ui.menu.Button(apps[i].displayName, apps[i].image);
                    buttonApp.getChildControl('icon').set({
                        'scale' : true,
                        'height' : 22,
                        'width' : 22
                    });

					buttonApp.set({
						'paddingTop': 7,
						'paddingBottom': 7
					});

                    buttonApp.setUserData('appName', apps[i].name);
                    buttonApp.addListener('execute', function(e) {
                        var target = e.getTarget();
                        eyeos.execute(target.getUserData('appName'), this.getChecknum());
                    }, this);

					buttonApp.setDraggable(true);

					buttonApp.addListener('dragstart', function(e) {
						var x = e.getDocumentLeft();
						var y = e.getDocumentTop();
						y = y - 20;
						x = x + 11;
						this.clipImage = e.getTarget().getChildControl('icon').clone();
						this.clipImage.set({
							'scale': true,
							'height': 42,
							'width' : 42
						});
						document.eyeDesktop.add(this.clipImage);
						this.clipImage.set({
							zIndex: 100003
						});
						this.clipImage.setMarginTop(y);
						this.clipImage.setMarginLeft(x);
						e.stopPropagation();
					}, this);

					buttonApp.addListener('drag', function(e) {
						var x = e.getDocumentLeft();
						var y = e.getDocumentTop();
						y = y - 20;
						x = x + 11;
						this.clipImage.setMarginTop(y);
						this.clipImage.setMarginLeft(x);
					}, this);

					buttonApp.addListener('dragend', function(e) {
						this.clipImage.destroy();
					}, this);
                    this.appsMenu.add(buttonApp);
                }
            }
            
            this.appsMenu.setOpener(applicationsBox);

            applicationsBox.addListener('click', function(e) {
                e.stopPropagation();
                this.appsMenu.open();
            }, this);
            

            // -------------------------------------

            //separator ----------------------------

            var separator = new qx.ui.basic.Image();
            separator.setSource('eyeos/extern/images/Separator.png');

            // -------------------------------------

            containTabs.add(applicationsBox);
            containTabs.add(separator);

            //files -----------------------

            var filesBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            //izquierdo: 404040
            //derecho: 262626
            var filesLabel = new qx.ui.basic.Label('Files').set({
                value: '<span style="font-family:Arial;font-size:13px;text-shadow: black 0px -1px 0px;"><strong>'+tr('Files')+'</strong></span>',
                rich: true,
                marginTop: 6,
                marginLeft: 10,
                marginRight: 10,
                textColor: '#E5E5E5'
            });

            filesLabel.addListener('mouseover', function() {
                filesLabel.setTextColor('#57A4DF');
            });

            filesLabel.addListener('mouseout', function() {
                filesLabel.setTextColor('#E5E5E5');
            });

            filesBox.add(filesLabel,{'flex' : 1});

            this.filesMenu = new qx.ui.menu.Menu();

            //desplazamiento 4px abajo, 270 grados, color negro 80%, dispersion 9px,
            var decoratorWidgetMenu = new qx.ui.decoration.RoundBorderBeveled(null, 'white', 0, 0, 0, 5, 5, "0 5px 16px -3px black");
            this.filesMenu.set({
                    'backgroundColor': 'white',
                    'padding': 0,
                    'paddingTop' : 4,
                    'paddingBottom' : 4,
                    'decorator': decoratorWidgetMenu,
                    'marginLeft': 5,
                    'minWidth': 200,
                    'shadow' : false,
                    'blockerColor' : 'red'
            });

            var buttonFilesHome = new qx.ui.menu.Button(tr('Home'), 'eyeos/extern/images/22x22/places/user-home.png');
            buttonFilesHome.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonFilesHome.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});

            buttonFilesHome.addListener('execute', function(e) {
                var target = e.getTarget();
                eyeos.execute('files', this.getChecknum());
            }, this);
            this.filesMenu.add(buttonFilesHome);

            var buttonFilesDocuments = new qx.ui.menu.Button(tr('Documents'), 'eyeos/extern/images/22x22/places/folder-txt.png');
            buttonFilesDocuments.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonFilesDocuments.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});


            buttonFilesDocuments.addListener('execute', function(e) {
                var target = e.getTarget();
                eyeos.execute('files', this.getChecknum(), ['home:///Documents/']);
            }, this);
            this.filesMenu.add(buttonFilesDocuments);
            
            var buttonFilesImages = new qx.ui.menu.Button(tr('Images'), 'eyeos/extern/images/22x22/places/folder-image.png');
            buttonFilesImages.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonFilesImages.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});


            buttonFilesImages.addListener('execute', function(e) {
                var target = e.getTarget();
                eyeos.execute('files', this.getChecknum(), ['home:///Images/']);
            }, this);
            this.filesMenu.add(buttonFilesImages);

            var buttonFilesSharedByMe = new qx.ui.menu.Button(tr('Shared by me'), 'eyeos/extern/images/22x22/places/user-identity.png');
            buttonFilesSharedByMe.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonFilesSharedByMe.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});


            buttonFilesSharedByMe.addListener('execute', function(e) {
                var target = e.getTarget();
                eyeos.execute('files', this.getChecknum(), ['share://~' + eyeos.getCurrentUserName() + '/']);
            }, this);
            this.filesMenu.add(buttonFilesSharedByMe);

            var buttonFilesSharedByMyContacts = new qx.ui.menu.Button(tr('Shared by my contacts'), 'eyeos/extern/images/22x22/apps/system-users.png');
            buttonFilesSharedByMyContacts.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonFilesSharedByMyContacts.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});


            buttonFilesSharedByMyContacts.addListener('execute', function(e) {
                var target = e.getTarget();
                eyeos.execute('files', this.getChecknum(), ['share:///']);
            }, this);
            this.filesMenu.add(buttonFilesSharedByMyContacts);


            this.filesMenu.setOpener(filesBox);

            filesBox.addListener('click', function(e) {
                e.stopPropagation();
                this.filesMenu.open();
            }, this);


            // -------------------------------------

            //separator ----------------------------

            var separator = new qx.ui.basic.Image();
            separator.setSource('eyeos/extern/images/Separator.png');

            // -------------------------------------

            containTabs.add(filesBox);
            containTabs.add(separator);

            //people -----------------------

            var peopleBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            //izquierdo: 404040
            //derecho: 262626
            var peopleLabel = new qx.ui.basic.Label('People').set({
                value: '<span style="font-family:Arial;font-size:13px;text-shadow: black 0px -1px 0px;"><strong>'+tr('People')+'</strong></span>',
                rich: true,
                marginTop: 6,
                marginLeft: 10,
                marginRight: 10,
                textColor: '#E5E5E5'
            });

            peopleLabel.addListener('mouseover', function() {
                peopleLabel.setTextColor('#57A4DF');
            });

            peopleLabel.addListener('mouseout', function() {
                peopleLabel.setTextColor('#E5E5E5');
            });

            peopleBox.add(peopleLabel, {'flex' : 1});

            this.peopleMenu = new qx.ui.menu.Menu();
           //desplazamiento 4px abajo, 270 grados, color negro 80%, dispersion 9px,
            this.peopleMenu.set({
                    'backgroundColor': 'white',
                    'padding': 0,
                    'paddingBottom' : 4,
                    'decorator': decoratorWidgetMenu,
                    'marginLeft': 5,
                    'minWidth': 200,
                    'shadow' : false,
                    'blockerColor' : 'red'
            });

			eyeos.messageBus.getInstance().addListener('eyeos_people_confirmContact', function() {
				var childrens = this.peopleMenu.getChildren();
				var toRemove = [];
				for(var i = 0; i < childrens.length; i++) {
					if(i > 0) {
						toRemove.push(childrens[i]);
					}
				}
				for(var i = 0;i < toRemove.length; i++) {
					this.peopleMenu.remove(toRemove[i]);
				}
				this.fillWithContacts();
				return;
			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_people_deleteContact', function() {
				var childrens = this.peopleMenu.getChildren();
				var toRemove = [];
				for(var i = 0; i < childrens.length; i++) {
					if(i > 0) {
						toRemove.push(childrens[i]);
					}
				}
				for(var i = 0;i < toRemove.length; i++) {
					this.peopleMenu.remove(toRemove[i]);
				}
				this.fillWithContacts();
				return;
			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_people_userConnected', function() {
				var childrens = this.peopleMenu.getChildren();
				var toRemove = [];
				for(var i = 0; i < childrens.length; i++) {
					if(i > 0) {
						toRemove.push(childrens[i]);
					}
				}
				for(var i = 0;i < toRemove.length; i++) {
					this.peopleMenu.remove(toRemove[i]);
				}
				this.fillWithContacts();
				return;
			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_people_userDisconnected', function() {
				var childrens = this.peopleMenu.getChildren();
				var toRemove = [];
				for(var i = 0; i < childrens.length; i++) {
					if(i > 0) {
						toRemove.push(childrens[i]);
					}
				}
				for(var i = 0;i < toRemove.length; i++) {
					this.peopleMenu.remove(toRemove[i]);
				}
				this.fillWithContacts();
				return;
			}, this);

            var searchBox = new qx.ui.menu.SearchBox('Home');

			searchBox.addListener('doSearch', function(e) {
				var text = e.getData();
				text = text.replace(/^\s*|\s*$/g,"");
				if(text == "" ) {
					var childrens = this.peopleMenu.getChildren();
					var toRemove = [];
					for(var i = 0; i < childrens.length; i++) {
						if(i > 0) {
							toRemove.push(childrens[i]);
						}
					}
					for(var i = 0;i < toRemove.length; i++) {
						this.peopleMenu.remove(toRemove[i]);
					}
					this.fillWithContacts();
					return;
				}
				
				eyeos.callMessage(this.getChecknum(), "searchPeople", text, function(e){
					var childrens = this.peopleMenu.getChildren();
					var toRemove = [];
					for(var i = 0; i < childrens.length; i++) {
						if(i > 0) {
							toRemove.push(childrens[i]);
						}
					}
					for(var i = 0;i < toRemove.length; i++) {
						this.peopleMenu.remove(toRemove[i]);
					}
					this.fillWithContacts(text);
					var delimiter = new qx.ui.menu.customMessage('Other people in this network');
					delimiter.addListener('mouseover', function(e) {
						e.stopPropagation();
					});

					this.peopleMenu.add(delimiter);
					for(var i=0; i<e.length; i++) {
						if(!e[i]['state'] || e[i]['state'] == 'pending') {
							var searchResult = new qx.ui.menu.Userbox();
							var username = e[i]['realName'];
							var icon = 'index.php?checknum=' + this.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]='+e[i]['userId'];
							
							if(e[i]['state'] == 'pending') {
								var actionIcon = 'eyeos/extern/images/Pending_contact.png';
							} else {
								var actionIcon = 'eyeos/extern/images/list-add-user.png';
								searchResult.addListener('executeAction', function(e) {
									var userId = this.getUserData('userId');
									var optionPane = new eyeos.dialogs.OptionPane(
										"<b>"+tr("Are you sure you want to add")+' '+this.getUserData('name')+' '+tr("as a contact?")+"</b>",
										eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
										eyeos.dialogs.OptionPane.YES_NO_OPTION);
										var dialog = optionPane.createDialog(document.eyeDesktop, tr("Create new contact"), function(result) {
											if (result == 0) {
												var contactManager = eyeos.contacts.ContactManager.getInstance();
												this.setActionIcon('eyeos/extern/images/Pending_contact.png');
												contactManager.requestRelationship(userId, function () {});
											}
										}, this);
									dialog.open();
								});
							}

							searchResult.fill(username, icon, actionIcon, 140);
							searchResult.setUserData('userId', e[i]['userId']);
							searchResult.setUserData('name', e[i]['realName']);

							this.peopleMenu.add(searchResult);
						}
					}
				}, this);
			}, this);

            this.peopleMenu.add(searchBox);

			this.fillWithContacts();

            this.peopleMenu.setOpener(peopleBox);

            peopleBox.addListener('click', function(e) {
                e.stopPropagation();
                this.peopleMenu.open();
            }, this);

            // -------------------------------------

            //separator ----------------------------

            var separator = new qx.ui.basic.Image();
            separator.setSource('eyeos/extern/images/Separator.png');

            // -------------------------------------

            containTabs.add(peopleBox);
            containTabs.add(separator);

            //groups -----------------------

            var groupsBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            //izquierdo: 404040
            //derecho: 262626
            var groupsLabel = new qx.ui.basic.Label('Groups').set({
                value: '<span style="font-family:Arial;font-size:13px;text-shadow: black 0px -1px 0px;"><strong>'+tr('Groups')+'</strong></span>',
                rich: true,
                marginTop: 6,
                marginLeft: 10,
                marginRight: 10,
                textColor: '#E5E5E5'
            });

            groupsLabel.addListener('mouseover', function() {
                groupsLabel.setTextColor('#57A4DF');
            });

            groupsLabel.addListener('mouseout', function() {
                groupsLabel.setTextColor('#E5E5E5');
            });

            groupsBox.add(groupsLabel,{'flex' : 1});

            this.groupsMenu = new qx.ui.menu.Menu();
           //desplazamiento 4px abajo, 270 grados, color negro 80%, dispersion 9px,
            this.groupsMenu.set({
                    'backgroundColor': 'white',
                    'padding': 0,
                    'paddingBottom' : 4,
                    'decorator': decoratorWidgetMenu,
                    'marginLeft': 5,
                    'minWidth': 300,
                    'shadow' : false,
                    'blockerColor' : 'red'
            });

            //18 de alto + 6 + 6 (paddings top y bottom) + 1px borde arriba y abajo
            var searchBoxGroup = new qx.ui.menu.SearchBox('Groups');

			eyeos.messageBus.getInstance().addListener('eyeos_workgroup_deleteGroup', function(e) {
				var childrens = this.groupsMenu.getChildren();
				var toRemove = [];
				for(var i = 0; i < childrens.length; i++) {
					if(i > 0) {
						toRemove.push(childrens[i]);
					}
				}
				for(var i = 0;i < toRemove.length; i++) {
					this.groupsMenu.remove(toRemove[i]);
				}

				this.fillWithGroups();
			}, this);

			searchBoxGroup.addListener('doSearch', function(e) {
				var text = e.getData();
				var childrens = this.groupsMenu.getChildren();
				var toRemove = [];
				for(var i = 0; i < childrens.length; i++) {
					if(i > 0) {
						toRemove.push(childrens[i]);
					}
				}
				for(var i = 0;i < toRemove.length; i++) {
					this.groupsMenu.remove(toRemove[i]);
				}
				if(text == "") {
					this.fillWithGroups();
				} else {
					this.fillWithGroups(text, function(e) {
						var delimiter = new qx.ui.menu.Button(tr('Other groups in this network'));
						delimiter.addListener('mouseover', function(e) {
							e.stopPropagation();
						});

						this.groupsMenu.addAt(delimiter);

						//now search other groups in the network
						eyeos.callMessage(this._checknum, '__Workgroups_searchWorkgroups', {
							pattern: text
						}, function (groups) {
							var myId = eyeos.getCurrentUserData().id;
							for (var i = 0; i < groups.length; ++i) {
									if ((groups[i]['workgroup'].privacyMode != eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION)
										&& (groups[i].status == eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER)
										&& (groups[i]['workgroup'].ownerId) != myId){


										//createMyGroupItem(groups[i]['workgroup'].name, groups[i]['workgroup'].id);
										var searchResult = new qx.ui.menu.Userbox();
										var icon = 'index.php?checknum=' + this.getChecknum() + '&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + groups[i]['workgroup'].id + '&refresh=' + new Date().getTime();
										
										var actionIcon = 'eyeos/extern/images/16x16/actions/list-add.png';

										searchResult.fill(groups[i]['workgroup'].name, icon, actionIcon, 240);
										this.groupsMenu.add(searchResult);

										searchResult.setUserData('name', groups[i]['workgroup'].name);
										searchResult.setUserData('id', groups[i]['workgroup'].id);

										var self = this;
										
										searchResult.addListener('click', function(e) {

										});

										var self = this;
										searchResult.addListener('executeAction', function(e) {

											var op = new eyeos.dialogs.OptionPane(
													tr('Are you sure you want to join this workgroup?'),
													eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
													eyeos.dialogs.OptionPane.YES_NO_OPTION);
												op.createDialog(
													null,
													tr('Join workgroup'),
													function (answer) {
														if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
															var params = {
																	workgroupId: this.getUserData('id')
															};
															eyeos.callMessage(self.getChecknum(), '__Workgroups_requestMembership', params, function (result) {
																var bus = eyeos.messageBus.getInstance();
																bus.send('workgroup', 'joinGroup', [this.getName(), this.getId()]);
															}, this);
														}
													},
													this, true
											).open();
										});
									}
							}
						}, this);


					}, this);
				}
			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_NSGroup_userWorkgroupAssignationCreated', function() {
					var childrens = this.groupsMenu.getChildren();
					var toRemove = [];
					for(var i = 0; i < childrens.length; i++) {
						if(i > 0) {
							toRemove.push(childrens[i]);
						}
					}
					for(var i = 0;i < toRemove.length; i++) {
						this.groupsMenu.remove(toRemove[i]);
					}
					this.fillWithGroups();
					return;
			}, this);

			eyeos.messageBus.getInstance().addListener('eyeos_NSGroup_confirmMembership', function() {
					var childrens = this.groupsMenu.getChildren();
					var toRemove = [];
					for(var i = 0; i < childrens.length; i++) {
						if(i > 0) {
							toRemove.push(childrens[i]);
						}
					}
					for(var i = 0;i < toRemove.length; i++) {
						this.groupsMenu.remove(toRemove[i]);
					}
					this.fillWithGroups();
					return;
			}, this);
			
			eyeos.messageBus.getInstance().addListener('eyeos_workgroup_createGroup', function() {
					var childrens = this.groupsMenu.getChildren();
					var toRemove = [];
					for(var i = 0; i < childrens.length; i++) {
						if(i > 0) {
							toRemove.push(childrens[i]);
						}
					}
					for(var i = 0;i < toRemove.length; i++) {
						this.groupsMenu.remove(toRemove[i]);
					}
					this.fillWithGroups();
					return;
			}, this);

			searchBoxGroup.addListener('createGroup', function(e) {
				var newWindow = new eyeos.ui.tabs.NewGroupWindow(this.getChecknum());

				var bus = eyeos.messageBus.getInstance();
				bus.addListener('eyeos_groups_newGroupWindowDone', function() {

				});
			}, this);


			
            this.groupsMenu.add(searchBoxGroup);

			this.fillWithGroups();

            this.groupsMenu.setOpener(groupsBox);

            groupsBox.addListener('click', function(e) {
                e.stopPropagation();
                this.groupsMenu.open();
            }, this);

            // -------------------------------------

            //separator ----------------------------

            var separator = new qx.ui.basic.Image();
            separator.setSource('eyeos/extern/images/Separator.png');

            // -------------------------------------

            containTabs.add(groupsBox);
            containTabs.add(separator);

            //add containTabs to eyeDesktop.
            //it is added to eyeDesktop instead of screen because tabs can be on top of windows.
            //window are places inside eyeDesktop because is the desktop manager.
            //the height 50% is because tabs fill half of the screen when displayed, not more.
            screen.addAt(containTabs, 0);
        },

		fillWithContacts : function(filter) {
            //now, fill with the contacts
            eyeos.contacts.ContactManager.getInstance().getAllContacts('accepted', function(e) {
				for(var i=0; i<e.length; i++) {
						var searchResult = new qx.ui.menu.Userbox();
						searchResult.setUserData('userId',e[i].getId());
						eyeos.contacts.ContactManager.getInstance().getContactsByIds([e[i].getId()], function (data) {
							searchResult.setUserData('userObject', data[0]);
						}, searchResult);
						searchResult.setUserData('name',e[i].getNickname());
						var username = e[i].getNickname();
						if(filter && username.indexOf(filter) == -1) {
							continue;
						}
						var icon = 'index.php?checknum=' + this.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]='+e[i].getId();
						var actionIcon = 'eyeos/extern/images/Delete_contact.png';
						searchResult.fill(username, icon, actionIcon, 140, e[i].getConnected());
						searchResult.addListener('executeAction', function(e) {
							var userId = this.getUserData('userId');
							var optionPane = new eyeos.dialogs.OptionPane(
								"<b>"+tr("Are you sure you want to delete")+' '+this.getUserData('name')+' '+tr("as a contact?")+"</b>",
								eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
								eyeos.dialogs.OptionPane.YES_NO_OPTION);
								var dialog = optionPane.createDialog(document.eyeDesktop, tr("Delete a contact"), function(result) {
									if (result == 0) {
										var contactManager = eyeos.contacts.ContactManager.getInstance();
										this.destroy();
										contactManager.deleteContact(userId, function () {});
									}
								}, this);
							dialog.open();
						});
						var self = this;
						searchResult.addListener('click', function(e) {
							var username = this.getUserData('name');
							qx.ui.menu.Manager.getInstance().hideAll();
							eyeos.execute('files',self.getChecknum(), ['share://~'+username+'/']);
						});
						this.peopleMenu.add(searchResult);
				}
            }, this);
		},

		fillWithGroups : function(filter, callback, context) {
			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllWorkgroupsByUser', {
                includeMeta: 'true'
            }, function (groups) {
                for (var i = 0; i < groups.length; ++i) {
					//createMyGroupItem(groups[i]['workgroup'].name, groups[i]['workgroup'].id);
					var searchResult = new qx.ui.menu.Userbox();
					if(filter && groups[i]['workgroup'].name.indexOf(filter) == -1) {
						continue;
					}

					// If status is pending do not show the workgroup
					if (groups[i].status != 0) {
						continue;
					}
					var icon = 'index.php?checknum=' + this.getChecknum() + '&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + groups[i]['workgroup'].id + '&refresh=' + new Date().getTime();
					var self = this;
					searchResult.setUserData('id', groups[i]['workgroup'].id);
					if (groups[i].role < 2) {
						var actionIcon = 'eyeos/extern/images/16x16/actions/configure.png';
						searchResult.addListener('executeAction', function(e) {
							qx.ui.menu.Manager.getInstance().hideAll();
							new eyeos.ui.tabs.GroupAdminWindow(self.getChecknum(), this.getUserData('id'));
						});
					} else {
						var actionIcon = 'eyeos/extern/images/Delete_contact.png';
						searchResult.addListener('executeAction', function(e) {
							var op = new eyeos.dialogs.OptionPane(
									tr('Are you sure you want to leave this workgroup?'),
									eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
									eyeos.dialogs.OptionPane.YES_NO_OPTION);
								op.createDialog(
									null,
									tr('Join workgroup'),
									function (answer) {
										if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
											var params = {
												workgroupId: this.getUserData('id'),
												userIds: [eyeos.getCurrentUserData().id]
											};
											eyeos.callMessage(self.getChecknum(), '__Workgroups_deleteMemberships', params, function (result) {
												searchResult.destroy();
											}, this);
										}
									},
									this, true
							).open();
						});
					}

					searchResult.fill(groups[i]['workgroup'].name, icon, actionIcon, 240);
					this.groupsMenu.add(searchResult);

					searchResult.setUserData('name', groups[i]['workgroup'].name);

					var self = this;
					searchResult.addListener('click', function(e) {
						var group = this.getUserData('name');
						qx.ui.menu.Manager.getInstance().hideAll();
						eyeos.execute('files',self.getChecknum(), ['workgroup://~'+group+'/']);
					});
                }
				if (callback) {
					if (context) {
						callback.call(context);
					} else {
						callback();
					}
				}
            }, this);
		}
    }
});

qx.Class.define("qx.ui.menu.SearchBox", {
  extend : qx.ui.menu.Button,
  construct : function(label, icon, command, menu) {
    this.base(arguments);
        var decoratorSearch = new qx.ui.decoration.Background().set({
                backgroundImage: 'eyeos/extern/images/Search_background.png',
                backgroundRepeat: 'repeat-x'
        });
        this.setDecorator(decoratorSearch);
        this.set({
            height: 30
        });
        this.addListener('mouseover', function(e) {
            e.stopPropagation();
        }, this);

        this.addListener('mouseout', function(e) {
            e.stopPropagation();
        }, this);

        this.getChildControl('icon').destroy();
        this.getChildControl('label').destroy();
        this.searchField = new qx.ui.form.TextField();
        var decoratorWidgetMenu = new qx.ui.decoration.RoundBorderBeveled(null, 'white', 0, 10, 10, 10, 10);
        this.searchField.setDecorator(decoratorWidgetMenu);

        this.searchField.set({
            width: 180,
            backgroundColor: 'white',
            shadow: null
        });

		this.timer = new qx.event.Timer(500);
		this.searchField.addListener('input', function(e) {
			this.timer.stop();
			this.timer.start();
		}, this);

		this.timer.addListener('interval', function(e) {
			this.timer.stop();
			this.fireDataEvent('doSearch', this.searchField.getValue());
		}, this);

        this.searchField.setPlaceholder('Search...');

		this.searchField.addListener('appear', function(e) {
			this.searchField.focus();
		}, this);
        
        this.add(this.searchField , {column: 0});

		var buttonAdd = new qx.ui.form.Button(tr('Create group'));
		buttonAdd.set({
			marginLeft:170,
			shadow:null
		});

		buttonAdd.addListener('execute', function(e) {
			this.fireEvent('createGroup');
		}, this);
		this.add(buttonAdd, {column: 1});
  },

  members: {
		add : function(w, o) {
		  this._add(w, o);
		},

		_onMouseUp : function() {

		}
  }
});

qx.Class.define("qx.ui.menu.customMessage", {
  extend : qx.ui.menu.Button,
  construct : function(label, icon, command, menu) {
    arguments.callee.base.call(this, label, icon, command, menu);
  },

  members: {
		_onMouseUp : function() {

		}
  }
});

qx.Class.define("qx.ui.menu.Userbox", {
  extend : qx.ui.menu.Button,
  construct : function(label, icon, command, menu) {
    arguments.callee.base.call(this, label, icon, command, menu);
  },

  members: {
		add : function(w, o) {
			this._add(w, o);
		},

		_onMouseUp : function() {

		},

		fill : function(text, icon, actionIcon, marginLeft, status) {
				text = escapeHtml(text);
				var user = new qx.ui.basic.Label(text);
				user.set({
					padding:6,
					paddingLeft: 8,
					rich: true
				});
				var image = new qx.ui.basic.Image();
				image.set({
					'scale' : true,
					'height' : 22,
					'width' : 22
				});
				image.setSource(icon);

				this.actionImage = new qx.ui.basic.Image();
				this.actionImage.setSource(actionIcon);

				var composite = new qx.ui.container.Composite();
				composite.setLayout(new qx.ui.layout.Canvas());
				this.add(image,{column:0});
				this.add(composite,{column:1});
				composite.add(user, {left: 0});
				this.statusImage = new qx.ui.basic.Image();
				if(!status) {
					this.statusImage.exclude();
				} else {
					user.setValue('<span style="color:green;font-weight:bold">'+text+'</span>')
				}
				this.statusImage.setSource('eyeos/extern/images/16x16/actions/view-process-users.png');
				composite.add(this.statusImage, {left:marginLeft-22, top:5});
				composite.add(this.actionImage, {left: marginLeft, top:5});

				this.statusImage.addListener('click', function(e) {
					var dbus = eyeos.messageBus.getInstance();
					dbus.send('chat', 'requestchat', this.getUserData('userObject'));
					e.stopPropagation();
				}, this);

				this.addListener('mouseover', function(e) {
					this.getLayoutParent().setSelectedButton(this);
					e.stopPropagation();
				}, this);

				this.actionImage.addListener('click', function(e) {
					this.fireEvent('executeAction');
					e.stopPropagation();
				}, this);
		},

		setActionIcon : function(icon) {
			this.actionImage.setSource(icon);
		}
  }
});