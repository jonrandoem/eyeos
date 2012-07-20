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

qx.Class.define('desktop.WidgetManager', {
	type: 'singleton',
	extend: qx.core.Object,

	properties: {
		widgets: {
			deferredInit: true
		}
	},
    
	members: {
		loadWidgets: function(checknum) {
			this.checknum = checknum;
			this.setWidgets([]);
			//modified to stackable
			eyeos.callMessage(checknum, 'loadWidgets', null, function(widgets) {
				for(var widgetName in widgets) {
					var isInstalled = (widgets[widgetName].installed === 'true' || widgets[widgetName].installed === true);
					if(isNaN(widgetName) && isInstalled) {
						var widget = eval('new desktop.widget.'+widgetName+'('+checknum+', "'+widgetName+'");');
						widget.setSettings(widgets[widgetName]);
						this.getWidgets().push({
							create: widget.createWidget(),
							widget: widget.getInternalWidget(),
							checknum: checknum,
							title: widget.getTitle(),
							value: widgetName
						});
					}
				}

				var bus = eyeos.messageBus.getInstance();
				//backward compatibility...everyone should use the manager instead of this
				bus.store('widgets', this.getWidgets());
				bus.send('desktop', 'widgetsLoaded');
			}, this);
		},

		addWidget: function(widget) {
			var widget = eval('new desktop.widget.'+widget+'('+this.checknum+', "'+widget+'");');
			widget.setSettings(widget);
			document.widgets.push({
				create: widget.createWidget(),
				widget: widget.getInternalWidget(),
				checknum: this.checknum,
				title: widget.getTitle(),
				value: widget
			});
		},

        getFileMenu: function() {
            var menu = [
                    {
                            label: tr('Open'),
                            image: 'index.php?extern=images/16x16/actions/document-open.png',
                            id: 'openFile()'
                    }, {
                            label: tr('Rename'),
                            image: 'index.php?extern=images/16x16/actions/edit-rename.png',
                            id: 'editFile()'
                    }, {
                            label: tr('Separator'),
                            id: 'separator'
                    }, {
                            label: tr('Delete'),
                            image: 'index.php?extern=images/16x16/actions/edit-delete.png',
                            id: 'deleteFile()'
                    }, {
                            label: tr('Download'),
                            image: 'index.php?extern=images/16x16/actions/edit-paste.png',
                            id: 'downloadFile()'
                    }, {
                            label: tr('Share by URL'),
                            image: 'index.php?extern=images/16x16/categories/applications-internet.png',
                            id: 'shareURLFile()'
                    }
            ];

			return this.processMenu(menu);
		},
		getFolderMenu: function() {
			var menu = [
			{
				label: tr('Open'),
				image: 'index.php?extern=images/16x16/actions/document-open.png',
				id: 'openFile()'
			}, {
				label: tr('Rename'),
				image: 'index.php?extern=images/16x16/actions/edit-rename.png',
				id: 'editFile()'
			}, {
				label: tr('Separator'),
				id: 'separator'
			}, {
				label: tr('Delete'),
				image: 'index.php?extern=images/16x16/actions/edit-delete.png',
				id: 'deleteFile()'
			}
			];

			return this.processMenu(menu);
		},

		getDesktopContextMenu : function() {
			var menu = 	[
			{
				label: tr('Upload file'),
				image: 'index.php?extern=images/16x16/actions/window-new.png',
				id: 'uploadFile()'
			}, {
				label: tr('Separator'),
				id: 'separator'
			}, {
				label: tr('New folder'),
				image: 'index.php?extern=images/16x16/places/folder.png',
				id: 'newFolder()'
			}, {
				label: tr('New simple document'),
				image: 'index.php?extern=images/16x16/mimetypes/text-x-generic.png',
				id: 'newFile(\'txt\')'
			}, {
				label: tr('New document'),
				image: 'index.php?extern=images/16x16/mimetypes/application-msword.png',
				id: 'newFile(\'edoc\')'
			}, {
				label: tr('New link'),
				image: 'index.php?extern=images/16x16/mimetypes/application-x-mswinurl.png',
				id: 'newLink()'
			}, {
				label: tr('Separator'),
				id: 'separator'
			}, {
				label: tr('Settings'),
				image: 'index.php?extern=images/16x16/actions/configure.png',
				id: 'openSettings()'
			}
			];

			return this.processMenu(menu);
		},

		processMenu: function(menu) {
			var borderMenu = new qx.ui.decoration.Single(1, 'solid', '#C3C3C3');
			var omenu = new qx.ui.menu.Menu().set({
				decorator: borderMenu,
				shadow: null,
				padding: 3,
				backgroundColor: '#F3F3F3'
			});

			omenu.addListener('appear', function(e) {
				var opener = this.getOpener();
				if(opener.classname == 'qx.ui.basic.Atom' &&
					(!desktop.SelectionManager.getInstance().hasSelection() || desktop.SelectionManager.getInstance().getSelection().length < 2)) {
					desktop.SelectionManager.getInstance().singleSelect(opener);
				} else if (!(opener.classname == 'qx.ui.basic.Atom')) {
					desktop.SelectionManager.getInstance().clearSelection();
				}
			});
			
			for (var i = 0; i < menu.length; ++i) {
				var item = null;
				if (menu[i].id != 'separator') {
					item = new qx.ui.menu.Button(menu[i].label, menu[i].image);
					item.setUserData('id', menu[i].id);

					item.addListener('appear', function (e) {
						this.setBackgroundColor(null);
						this.setDecorator(null);
						this.setTextColor('#4A4A4A');
					});

					item.addListener('mouseover', function (e) {
						this.setBackgroundColor('#D3D3D3');
						this.setTextColor('#404040');
					});
					item.addListener('mouseout', function (e) {
						this.setDecorator(null);
						this.setBackgroundColor(null);
					});

					item.addListener('execute', function (e) {
						eval('desktop.actionManager.getInstance().'+this.getUserData('id'));
					});
				} else {
					item = new qx.ui.menu.Separator();
				}
				omenu.add(item);
			}

			return omenu;
		},
        
		createDesktopWidgetAlone: function(checknum, files) {
			var dbus = eyeos.messageBus.getInstance();
			var eyeDashBoard = dbus.retrieve('eyeDashBoard');
			var self = this;

			this.checknum = checknum;
			var widget = new eyeos.dashboard.Widget(tr('Desktop'), 'files', 'files', true, checknum).set({
				icon: 'index.php?extern=/images/16x16/apps/system-file-manager.png'
			});

			this.widgetContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
				'allowShrinkY': false,
				padding: 5
			});

			this.widgetContainer.setDroppable(true);

			this.widgetContainer.addListener('mousedown', function(e) {
				if(this.selector) {
					this.selector.destroy();
					this.selector = null;
				}
				if(e.getButton() != 'left' || e.getTarget() != this.widgetContainer) {
					return;
				}
				var x = e.getDocumentLeft();
				var y = e.getDocumentTop();
				y = y - 85;
				x = x - 15;
				this.selecting = true;
				this.selector = new qx.ui.container.Composite();
				this.selector.set({
					opacity: 0.1,
					backgroundColor: 'blue',
					width:0,
					height:0,
					marginLeft:x,
					marginTop:y
				});
                
				this.selectorY = y;
				this.selectorX = x;
				this.widgetContainer.add(this.selector);
			}, this);

			this.widgetContainer.addListener('mousemove', function(e) {
				if(this.selecting && this.selector ) {
					var x = e.getDocumentLeft();
					var y = e.getDocumentTop();
					y = y - 85;
					x = x - 15;
					if(x > this.selectorX) {
						this.selector.setWidth(x-this.selectorX);
					} else {
						this.selector.setWidth(this.selectorX-x);
						this.selector.setMarginLeft(x);
					}

					if(y > this.selectorY) {
						this.selector.setHeight(y-this.selectorY);
					} else {
						this.selector.setHeight(this.selectorY-y);
						this.selector.setMarginTop(y);
					}
					desktop.SelectionManager.getInstance().clearSelection();
					var box = new Object();
					if(x > this.selectorX) {
						box.x = this.selectorX;
						box.width = x-this.selectorX;
					} else {
						box.x = x;
						box.width = this.selectorX-x;
					}

					if(y > this.selectorY) {
						box.y = this.selectorY;
						box.height = y-this.selectorY;
					} else {
						box.y = y;
						box.height = this.selectorY-y;
					}

                    var childrens = this.widgetContainer.getChildren();
                    for(var i = 0; i < childrens.length; i++) {
                        if(childrens[i].classname == 'qx.ui.basic.Atom') {
                            var bounds = childrens[i].getBounds();
                            if(parseInt(bounds.top)+parseInt(bounds.height) > box.y
                                && parseInt(bounds.top) < box.y + box.height
                                && parseInt(bounds.left)+parseInt(bounds.width) > box.x
                                && parseInt(bounds.left) < box.x + box.width
                                ) {
                                desktop.SelectionManager.getInstance().addToSelection(childrens[i]);
                            }
                        }
                    }
                } else {
                    if(this.selector) {
                        this.selector.destroy();
                        this.selector = null;
                    }
                }
            }, this);

			this.widgetContainer.addListener('mouseup', function(e) {
				if(!this.controlKeyPressed) {
					desktop.SelectionManager.getInstance().clearSelection();
				}
				if(this.selector) {
					this.selector.destroy();
					var x = e.getDocumentLeft();
					var y = e.getDocumentTop();
					y = y - 85;
					x = x - 15;
					//now, we need to calculate what are the icons inside the box
					//so first, go calculate the box :)

					var box = new Object();
					if(x > this.selectorX) {
						box.x = this.selectorX;
						box.width = x-this.selectorX;
					} else {
						box.x = x;
						box.width = this.selectorX-x;
					}

					if(y > this.selectorY) {
						box.y = this.selectorY;
						box.height = y-this.selectorY;
					} else {
						box.y = y;
						box.height = this.selectorY-y;
					}

                    var childrens = this.widgetContainer.getChildren();
                    for(var i in childrens) {
                        if(childrens[i].classname == 'qx.ui.basic.Atom') {
                            var bounds = childrens[i].getBounds();
                            if(parseInt(bounds.top)+parseInt(bounds.height) > box.y
                                && parseInt(bounds.top) < box.y + box.height
                                && parseInt(bounds.left)+parseInt(bounds.width) > box.x
                                && parseInt(bounds.left) < box.x + box.width
                                ) {
                                desktop.SelectionManager.getInstance().addToSelection(childrens[i]);
                            }
                        }
                    }
                }
                this.selector = null;
                this.selecting = false;
            }, this);

			this.widgetContainer.setContextMenu(this.getDesktopContextMenu());

            this.widgetContainer.addListener('drop', function(e) {
                var dbus = eyeos.messageBus.getInstance();
                var item = e.getRelatedTarget();
                var x = e.getDocumentLeft();
                var y = e.getDocumentTop();
                y = y - 40;
                x = x - 11;
                if(eyeos.files && item.classname == 'eyeos.files.IconViewItem') {
                    //here start the real coupling
                    var selection = item.getManager().returnSelected();
                   
					if(selection && selection.length > 0) {
						var movements = [];
						var paths = [];
						var desktopHeight = this.widgetContainer.getBounds().height;
						for(var i = 0; i < selection.length; i++) {
							item = selection[i];
							if(item.getFile().getPath().charAt(item.getFile().getPath().length-1) != '/') {
								path = item.getFile().getPath()+'/'+item.getFile().getName();
							} else {
								path = item.getFile().getPath()+item.getFile().getName();
							}
							
							
							movements.push([x, y, path]);
							paths.push(path);
							//calculate x and y
							y = y + 80;
							if(y + 70 > desktopHeight) {
								y = 0;
								x = x + 80;
							}
						}

						if (this.__isShareOrWorkgroupFile(path)) {
							eyeos.callMessage(checknum, 'copyFile', ['home://~' + eyeos.getCurrentUserData().name + '/Desktop', path], function(e) {
								for (var i = 0; i < e.length; ++i) {
									this.createInnerContent(this.widgetContainer, e[i], true);
								}
							}, this);
						} else {
							dbus.send('files', 'delete', [item.getFile().getPath(), paths]);
							eyeos.callMessage(checknum, 'moveFileToDesktop', movements, function(e) {
								for(var i in e) {
									this.createInnerContent(this.widgetContainer, e[i], true);
								}
							}, this);
						}
						
					} else {
						path = item.getFile().getPath()+'/'+item.getFile().getName();
						if (this.__isShareOrWorkgroupFile(path)) {
							eyeos.callMessage(checknum, 'copyFile', ['home://~' + eyeos.getCurrentUserData().name + '/Desktop', path], function(e) {
								this.createInnerContent(this.widgetContainer, e[0], true);
							}, this);
						} else {
							dbus.send('files', 'delete', [item.getFile().getPath(), [path]]);
							eyeos.callMessage(checknum, 'moveFileToDesktop', [[x, y, path]], function(e) {
								this.createInnerContent(this.widgetContainer, e[0], true);
							}, this);
						}
					}

				} else {
					if(item.classname == 'qx.ui.menu.Button') {
						//create shortcut
						var appName = item.getUserData('appName');
						eyeos.callMessage(checknum, "createLink", [appName, x , y], function(e){
							eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [tr('New shortcut created in the desktop')]);
							this.createInnerContent(this.widgetContainer, e, true);
						}, this);
					} else {
						var selection = desktop.SelectionManager.getInstance().getSelection();
						if(selection.length > 1) {
							//check if there is a selection!
							var offsetX = x - item.getBounds().left;
							var offsetY = y - item.getBounds().top;
							for(var i = 0; i < selection.length; i++) {
								var bounds = selection[i].getBounds();
								selection[i].setUserBounds(parseInt(bounds.left) + parseInt(offsetX), parseInt(bounds.top) + parseInt(offsetY), 76, 92);
								var path = selection[i].getUserData('path');
								selection[i].setContextMenu(this.getFileMenu());
								eyeos.callMessage(checknum, 'saveIconPosition', [parseInt(bounds.left) + parseInt(offsetX), parseInt(bounds.top) + parseInt(offsetY), path], function(e) {

									}, this);
							}
						} else {
							item.setUserBounds(x, y, 76, 92);
							var path = item.getUserData('path');
							item.setContextMenu(this.getFileMenu());
							eyeos.callMessage(checknum, 'saveIconPosition', [x, y, path], function(e) {

								}, this);
						}
					}
				}

			}, this);


			//the first time it loads, the widget need events waiting for the
			//dashboard to be shown, to be able to get its height and
			//resize himself to fill all the dashboard
			//however, if we switch between desktop and dashboard, with the
			//dashboard loaded, this events will never get fired, and the bounds
			//are already available just here.
			//so, we try to get the bounds, if we are unable, just wait for the events
			var bounds = eyeDashBoard.getBounds();
			if(bounds) {
				self.widgetContainer.setHeight(bounds.height);
			}
			eyeDashBoard.addListener('appear', function(e) {
				var bounds = this.getBounds();
				self.widgetContainer.setHeight(bounds.height);
			});

			eyeDashBoard.addListener('resize', function(e) {
				var bounds = this.getBounds();
				self.widgetContainer.setHeight(bounds.height);
			});

           
			widget.setUserData('container', this.widgetContainer);
			widget.addContent(this.widgetContainer);
			createContent(checknum, 'home://~' + eyeos.getCurrentUserName() + '/Desktop', files);

			function createContent(checknum, path, files) {
				self.widgetContainer.setUserData('path', path);

				if(!files) {
					eyeos.callMessage(
						checknum,
						"__FileSystem_browsePath",
						new Array(path, null, this._browseOptions),
						function (results) {
							self.widgetContainer.removeAll();
							var files = results.files;
							for (var i = 0; i < files.length; ++i) {
								self.createInnerContent(self.widgetContainer, files[i], true);
							}
						});
				} else {
					var items = files.files;
					for (var i = 0; i < items.length; ++i) {
						self.createInnerContent(self.widgetContainer, items[i], true);
					}
				}
			}

			widget.openAndPlace(eyeDashBoard.getFirstContainer(),0);
			widget.toggleBackground();

			dbus.addListener('eyeos_files_new', function (e) {
				var sourcePath = e.getData()[0];
				var newFiles = e.getData()[1];
				if (this.getUserData('path') == sourcePath) {
					self.createInnerContent(this, newFiles, true);
				}
			}, this.widgetContainer);

			dbus.addListener('eyeos_files_rename', function (e) {
				var originalFile = e.getData()[0];
				var newFile = e.getData()[2];

				var widgetChildrens = this.getChildren();

				for (var i = 0; i < widgetChildrens.length; ++i) {
					if(widgetChildrens[i].getUserData('path') == originalFile) {
						var tooltiptext = widgetChildrens[i].getToolTipText();
						tooltiptext = tooltiptext.replace('id="name">'+widgetChildrens[i].getLabel(), 'id="name">'+newFile.name);
						widgetChildrens[i].setToolTipText(tooltiptext);
						widgetChildrens[i].setLabel(newFile.name);
						widgetChildrens[i].setUserData('path',newFile.absolutepath);
					}
				}
			}, this.widgetContainer);

			dbus.addListener('eyeos_file_uploadComplete', function (e) {
				//console.log(e.getData());
				//console.log(this.getUserData('path'));
				//console.log(e.getData().path);
				
				if (this.getUserData('path') == e.getData().path) {
					self.createInnerContent(this, e.getData(), true);
				}
			}, this.widgetContainer);

			dbus.addListener('eyeos_files_delete', function (e) {
				var sourcePath = e.getData()[0];
				var newFiles = e.getData()[1];
				var widgetChildrens = this.getChildren();
				var widgetPaths = new Array();

				for (var i = 0; i < widgetChildrens.length; ++i) {
					widgetPaths.push(widgetChildrens[i].getUserData('path'));
				}

				for (var i = 0; i < newFiles.length; ++i) {
					var index = widgetPaths.indexOf(newFiles[i]);
					if (index != -1 && widgetChildrens[index] != undefined) {
						widgetChildrens[index].destroy();
					}
				}
			}, this.widgetContainer);

			dbus.addListener('eyeos_files_drop', function (e) {
				var files = e.getData()[0];
				var source = e.getData()[1];
				var target = e.getData()[2];
				if(source == 'home://~' + eyeos.getCurrentUserName() + '/Desktop') {
					for (var i = 0; i < files.length; ++i) {
						var widgetChildrens = this.getChildren();
						for (var x = 0; x < widgetChildrens.length; ++x) {
							if(widgetChildrens[x].getUserData('path') == files[i].getAbsolutePath()) {
								widgetChildrens[x].destroy();
							}
						}
					}
				}
			}, this.widgetContainer);

			document.screen.addListener('keydown', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'control') {
					this.controlKeyPressed = true;
				}
			}, this);

			document.screen.addListener('keyup', function(e) {
				this.controlKeyPressed = false;
			}, this);

            //create html5 drag and drop area
            document.eyeDesktop.addListener('appear', function(e) {
                var dropbox = document.eyeDesktop.getContentElement().getDomElement();
				if(navigator.appName != 'Opera') {
					dropbox.addEventListener("dragenter", function(evt) {
						var bus = eyeos.messageBus.getInstance();
						var eyePanel = bus.retrieve('eyePanel');
						var domEle = eyePanel.getContainerElement().getDomElement();
						domEle.style.boxShadow = '0 5px 50px 0px blue';
						domEle.style.MozBoxShadow = '0 5px 50px 0px blue';
						domEle.style.webkitBoxShadow = '0 5px 50px 0px blue';
						evt.stopPropagation();
						evt.preventDefault();
					}, false);

					dropbox.addEventListener("dragexit", function(evt) {
						var bus = eyeos.messageBus.getInstance();
						var eyePanel = bus.retrieve('eyePanel');
						var domEle = eyePanel.getContainerElement().getDomElement();
						domEle.style.boxShadow = '0 2px 25px 0px black';
						domEle.style.MozBoxShadow = '0 2px 25px 0px black';
						domEle.style.webkitBoxShadow = '0 2px 25px 0px black';
						evt.stopPropagation();
						evt.preventDefault();
					}, false);
				}

				dropbox.addEventListener("dragover", function(evt) {
					evt.stopPropagation();
					evt.preventDefault();
				}, false);
                
				dropbox.addEventListener("drop", function(evt) {
					var bus = eyeos.messageBus.getInstance();
					if(navigator.appName != 'Opera') {
						var eyePanel = bus.retrieve('eyePanel');
						var domEle = eyePanel.getContainerElement().getDomElement();
						domEle.style.boxShadow = '0 2px 25px 0px black';
						domEle.style.MozBoxShadow = '0 2px 25px 0px black';
						domEle.style.webkitBoxShadow = '0 2px 25px 0px black';
					}
                    evt.stopPropagation();
                    evt.preventDefault();
                    var files = evt.dataTransfer.files;
                    var count = files.length;
                    if(count > 0) {
                       var data = evt.dataTransfer;

						var boundary = '------multipartformboundary' + (new Date).getTime();
						var dashdash = '--';
						var crlf     = '\r\n';

						/* Build RFC2388 string. */
						var builder = '';

						builder += dashdash;
						builder += boundary;
						builder += crlf;

						/* For each dropped file. */
						for (var i = 0; i < data.files.length; i++) {
							var file = data.files[i];
							/* Generate headers. */
							builder += 'Content-Disposition: form-data; name="Filedata[]"';
							if (file.fileName) {
								builder += '; filename="' + file.fileName + '"';
							}
							builder += crlf;

							builder += 'Content-Type: application/octet-stream';
							builder += crlf;
							builder += crlf;

							/* Append binary data. */
							try {
								builder += file.getAsBinary();
							}
							catch (e) {
								alert(tr('Dragging a file from your computer to eyeOS it is only supported in Mozilla Firefox by now'));
								return;
							}
							builder += crlf;

							/* Write boundary. */
							builder += dashdash;
							builder += boundary;
							builder += crlf;
						}
						
						//						builder += 'Content-Disposition: form-data; name="UPLOAD_IDENTIFIER"';
						//						builder += crlf
						//						builder += crlf
						//						builder += 'ID_UPLOAD_HERE';
						//						builder += crlf;
						//						/* Write boundary. */
						//						builder += dashdash;
						//						builder += boundary;
						//						builder += crlf;



						/* Mark end of the request. */
						builder += dashdash;
						builder += boundary;
						builder += dashdash;
						builder += crlf;

						document.uploadDrop = builder;
						document.boundary = boundary;
						eyeos.execute('upload', checknum, ['home:///Desktop/', true]);
					}
				}, false);
			});
			document.screen.activate();
		},

		__isShareOrWorkgroupFile: function (path) {
			if (path.indexOf('workgroup://') != -1) {
				return true;
			}

			var exp = new RegExp(/^home:\/\/~([^_][a-zA-Z0-9 .\-_]{2,40})\/.*$/);
			if (path.match(exp)) {
				var username = RegExp.$1;
				if (username != eyeos.getCurrentUserData().name) {
					return true;
				}
			}
			return false;
		},

		createInnerContent: function (widgetContainer, file, alone) {
			var checknum = this.checknum;
			var imageExtensions = ['JPG', 'JPEG', 'PNG', 'GIF'];
			var videoExtensions = ['FLV'];
			var musicExtensions = ['MP3', 'M4A'];
			var docExtensions = ['EDOC', 'DOC', 'TXT', 'XLS', 'ODS'];
			var zipExtensions = ['ZIP'];
			var image = null;
			var lnk = null;
            
			if (file.type == 'folder') {
				image = 'index.php?extern=images/48x48/places/folder.png';
			} else if (docExtensions.indexOf(file.extension) != -1) {
				image = 'index.php?extern=images/48x48/mimetypes/application-msword.png';
			} else if (imageExtensions.indexOf(file.extension) != -1) {
				image = 'index.php?extern=images/48x48/mimetypes/image-x-generic.png';
			} else if (musicExtensions.indexOf(file.extension) != -1) {
				image = 'index.php?extern=images/48x48/mimetypes/audio-x-generic.png';
			} else if (videoExtensions.indexOf(file.extension) != -1) {
				image = 'index.php?extern=images/48x48/mimetypes/audio-vnd.rn-realvideo.png';
			}else if (zipExtensions.indexOf(file.extension) != -1) {
				image = 'index.php?extern=images/48x48/mimetypes/application-x-gzip.png';
			} else if(file.extension == 'LNK') {
				var info = qx.util.Json.parse(file.content);
				image = info.icon;
				lnk = true;
			} else if(file.extension == 'PDF') {
				image = 'index.php?extern=images/48x48/mimetypes/application-pdf.png';
			}else {
				image = 'index.php?extern=images/48x48/mimetypes/application-x-zerosize.png';
			}

			var name = file.name;
			if(file.extension == 'LNK') {
				name = name.substr(0, name.length-4);
			}

			var size = file.size;
			var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
			var i = 0;
			while(size >= 1024) {
				size /= 1024;
				++i;
			}
			size = size.toFixed(1) + ' ' + units[i];
			// name don't need translation is a filename
			var tooltiptext = "<div>"+tr('Name')+": <b id=\"name\">"+name+"</b></div>";
			tooltiptext += "<div>"+tr('Size')+": <b>"+size+"</b></div>";
			var atom = new qx.ui.basic.Atom(name, image).set({
				'iconPosition': 'top',
				//'font': new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
				//'textColor': '#FFFFFF',
				//                'width': 76,
				'padding': 5,
				//decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5)
				'toolTipText' : tooltiptext
			});

			var label = atom.getChildControl('label');
			label.set({
				allowGrowX: true,
				allowGrowY: true,
				rich: true,
				wrap:true
			});

			if(lnk) {
				atom.setUserData('content', file.content);
			}

			atom.setDraggable(true);
			// atom.setContextMenu(this.getFileMenu());
			if (file.type == 'folder') {
				atom.setContextMenu(this.getFolderMenu());
			} else {
				atom.setContextMenu(this.getFileMenu());
			}

			atom.addListener('dragstart', function(e) {
				var x = e.getDocumentLeft();
				var y = e.getDocumentTop();
				y = y - 30;
				x = x + 1;
				this.clipImage = e.getTarget().clone();
				if(desktop.SelectionManager.getInstance().hasSelection() && desktop.SelectionManager.getInstance().getSelection().length > 1) {
					this.clipImage.setIcon('eyeos/extern/images/48x48/places/document-multiple.png');
					this.clipImage.setLabel(desktop.SelectionManager.getInstance().getSelection().length+ ' ' +tr('files'))
				}
				this.clipImage.setOpacity(0.5);
				document.eyeDesktop.add(this.clipImage);
				this.clipImage.set({
					zIndex: 100003
				});
				this.clipImage.setMarginTop(y);
				this.clipImage.setMarginLeft(x);
				e.stopPropagation();
			}, this);

			atom.addListener('drag', function(e) {
				var x = e.getDocumentLeft();
				var y = e.getDocumentTop();
				y = y - 30;
				x = x + 1;
				this.clipImage.setMarginTop(y);
				this.clipImage.setMarginLeft(x);
			}, this);

			atom.addListener('dragend', function(e) {
				this.clipImage.destroy();
			}, this);

			atom.addListener('drop', function(e) {
				var item = e.getRelatedTarget();
				if (!item) {
					e.stopPropagation();
					return;
				}
				var path = item.getUserData('path');
				var topath = file.absolutepath;
				var dbus = eyeos.messageBus.getInstance();
				//dirname from php.js
				dbus.send('files', 'delete', [path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, ''), [path]]);
				eyeos.callMessage(checknum, 'moveFile', [path, topath], function(e) {

					}, this);
				e.stopPropagation();
			}, this);

			if (alone) {
				atom.addListener('appear', function (e) {
					var domele = this.getChildControl('label').getContainerElement().getDomElement();
					domele.childNodes[0].style.fontFamily = 'Arial, Helvetica, Lucida Grande';
					//                    domele.childNodes[0].style.fontSize = '12px';
					domele.childNodes[0].style.textShadow =  '#000000 0px 1px 1px';
					domele.childNodes[0].style.color = '#FFFFFF';
					domele.childNodes[0].style.fontWeight = 'bold';
				});
			}

			atom.setUserData('path', file.absolutepath);
			atom.setUserData('info', file);
			if (file.type == 'folder') {
				atom.setDroppable(true);
				atom.addListener('dblclick', function () {
					eyeos.execute('files', checknum, [this.getUserData('path')]);
				});
			} else {
				var listenerFunction =  function () {
					eyeos.openFile(this.getUserData('path'), checknum);
				};
				atom.addListener('dblclick', listenerFunction);
			}

			//selecting stuff
			atom.addListener('click', function(e) {
				if(!this.controlKeyPressed) {
					desktop.SelectionManager.getInstance().singleSelect(e.getTarget());
				} else {
					desktop.SelectionManager.getInstance().addToSelection(e.getTarget());
				}
			}, this);

			atom.addListener('mousedown', function(e) {
				if(!this.controlKeyPressed) {
					desktop.SelectionManager.getInstance().singleSelect(e.getTarget());
				} else {
					desktop.SelectionManager.getInstance().addToSelection(e.getTarget());
				}
			});

            
			//we need a hack here...because there is nothing draw on the screen, but we need to calculate!
			//so, we are going through dom...
			var h = 0;
			if(document.innerHeight) {
				h=document.innerHeight;
			} else if(document.documentElement.clientHeight) {
				h=document.documentElement.clientHeight;
			} else if(document.body) {
				h=document.body.clientHeight;
			}

			var w = 0;
			if(document.innerWidth) {
				w=document.innerWidth;
			} else if(document.documentElement.clientWidth) {
				w=document.documentElement.clientWidth;
			} else if(document.body) {
				w=document.body.clientWidth;
			}
			w = w-100; //we need some extra space for bars etc
			
			if(file.meta && file.meta.iconPositionY && file.meta.iconPositionX) {
				widgetContainer.add(atom);
				var positionX = file.meta.iconPositionX;
				var positionY = file.meta.iconPositionY;

				if(positionX > w) {
					positionX = w - 90;
				}

				if(positionY > h) {
					positionY = h - 220;
				}
				
				atom.setUserBounds(positionX, positionY, 76, 92);
				atom.setUserData('manualPosition', true);
			} else {
				var childrens = widgetContainer.getChildren();
				var x = 0;
				var y = 0;
				


				


				for(var i in childrens) {
					if(childrens[i].classname == 'qx.ui.basic.Atom') {
						if(!childrens[i].getUserData('manualPosition')) {
							y = y + 102; //92 + 10
							if(y + 150 > h)
							{
								y = 0;
								x = x + 86; //76 + 10
							}
						}
					}
				}

				atom.setUserBounds(x, y, 76, 92);

				widgetContainer.add(atom);
			}
		}
	}
});

qx.Interface.define('desktop.widget.IWidget', {
	members: {
		/**
		 *	This method should implement a manager which, using a switch case,
		 *	should be able to call the appropiate method for this items which
		 *	are declared as 'dynamics' cmd defined in the
		 *	{@see eyeos.ui.genericbar.IItems} extending class.
		 */
		getTitle: function(){}
	}
});
