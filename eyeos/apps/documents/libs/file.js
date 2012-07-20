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

qx.Class.define('eyeos.application.documents.File', {
	statics: {
		fileNew: function(object) {
			this.dynamicsWriteOpenRecent(object);
			object.getApplication().getWindow().close();
			eyeos.execute('documents', object.getApplication().getChecknum());
		},

		fileOpen: function(object) {
			var fc = new eyeos.dialogs.FileChooser(object.getApplication().getChecknum());
			fc.showOpenDialog(object.getApplication().getWindow(), function(choice, path) {
				if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
					this.dynamicsUpdateOpenRecent(eyeos.application.documents.Utils.getBasename(path), path);

					if (object.__currentDoc.path) {
						this.dynamicsWriteOpenRecent(object);
						object.getApplication().getWindow().close();
						eyeos.execute('documents', object.getApplication().getChecknum(), [path]);
					}
					else {
						object.setInitialFile(path);

						if(object.isSocialBarVisible()) {
							object.getApplication().updateSocialBar(path);
						}
					}
				}
			}, object);
		},

		fileOpenRecent: function(object, e) {
			if (object.__currentDoc.path) {
				object.getApplication().getWindow().close();
				eyeos.execute('documents', object.getApplication().getChecknum(), [e.getTarget().path]);
			}
			else {
				object.setInitialFile(e.getTarget().path);
			}

			object.__dynamics.recentDocs.subMenu.remove(e.getTarget());
			object.__dynamics.recentDocs.subMenu.addAt(e.getTarget(), 0);
		},

		fileSave: function(object) {
		    if (object.__currentDoc.path) {
			    var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			    eyeos.callMessage(object.getApplication().getChecknum(), 'fileSave',
				    [object.__currentDoc.path, tinyMCE.getInstanceById(tinymceId).getContent()], function() {
					    object.fireEvent('fileSaved');
					    object.__currentDoc.checksum = eyeos.application.documents.Utils.crc32(tinyMCE.getInstanceById(tinymceId).getContent());
					    if (object.__closeFlag) {
						    object.__closeFlag = false;
						    object.getApplication().getWindow().close();
					    }

					    if(object.isSocialBarVisible()) {
						    object.getApplication().updateSocialBar(object.__currentDoc.path);
					    }
				    }, object);
		    } else {
			    object.fileSaveAs();
		    }
		},

		fileSaveAs: function(object) {
			var fc = new eyeos.dialogs.FileChooser(object.getApplication().getChecknum());
			fc.showSaveDialog(object.getApplication().getWindow(), function(choice, path) {
				object.getApplication().getWindow().setCaption('Documents - ' + path);
				if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
					var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
					eyeos.callMessage(object.getApplication().getChecknum(), 'fileSaveAs',
						[path, tinyMCE.getInstanceById(tinymceId).getContent(), object.__currentDoc.duid], function(newPath) {
							object.fireEvent('fileSaved');
							if (!object.__closeFlag) {
								eyeos.callMessage(object.getApplication().getChecknum(), 'getFileInfo', newPath, function (fileInfo) {
									var index = newPath.lastIndexOf('/');
									var currentPath = newPath.substr(0, index);
									eyeos.messageBus.getInstance().send('files', 'new', [currentPath, fileInfo]);
								}, this);
							}

							object.__currentDoc.path = newPath;
							object.__currentDoc.checksum = eyeos.application.documents.Utils.crc32(tinyMCE.getInstanceById(tinymceId).getContent());
							if (object.__closeFlag) {
								object.__closeFlag = false;
								object.getApplication().getWindow().close();
							} else {
								if(object.isSocialBarVisible()) {
									this.getApplication().updateSocialBar(object.__currentDoc.path);
								}						
							}

							eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [tr('Document saved successfully')]);
						}, object);
				}
			}, object, null, 'Save file as...');
		},

		isFileSaved: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var content = tinyMCE.getInstanceById(tinymceId).getContent();
			var checksum = eyeos.application.documents.Utils.crc32(content);
			if (checksum == object.__currentDoc.checksum) {
				return true;
			}
			return false;
		},

		setInitialFile: function(object, path) {
			eyeos.callMessage(object.getApplication().getChecknum(), 'fileOpen', path, function(datas) {
				var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
				tinyMCE.getInstanceById(tinymceId).setContent(datas[0], {no_events : 1});

				object.getApplication().setFilePath(path);
				object.__currentDoc.path = path;
				object.__currentDoc.checksum = eyeos.application.documents.Utils.crc32(tinyMCE.getInstanceById(tinymceId).getContent());
				object.__currentDoc.duid = datas[2];
				tinyMCE.getInstanceById(tinymceId).duid = datas[2];
				object.getApplication().setDuid(datas[2]);
				object.getApplication().getWindow().setCaption('Document - ' + datas[1]);

				//subscribe to document channel
				var netSync = eyeos.netSync.NetSync.getInstance();
				netSync.subscribe('document_'+datas[2]);

				//FIXME: PLACE IT INSIDE AN OBJECT!!!
				originalContent = tinyMCE.getInstanceById(tinymceId).getContent();
				if(originalContent != datas[0]) {
				    object.addListener('fileSaved', function() {
					eyeos.callMessage(object.getApplication().getChecknum(), 'reOpen',object.__currentDoc.path, function() {
					    var netSync = eyeos.netSync.NetSync.getInstance();
					    var message = new eyeos.netSync.Message({
						    type: 'documents',
						    name: 'refresh',
						    to: 'document_'+object.__currentDoc.duid,
						    data: "refresh"
					    });
					    netSync.send(message);
					}, this);
				    }, this);
				    this.fileSave(object);
				}
			}, object);
		},

		dynamicsWriteOpenRecent: function(object) {
			if (object.__dynamics.recentDocs.subMenu) {
				var items = object.__dynamics.recentDocs.subMenu.getChildren();
				if (items.length) {
					var recentDocs = new Array();
					for (var i = 0; i < items.length; ++i) {
						recentDocs.push({
							name: items[i].getLabel(),
							id: items[i].getId(),
							path: items[i].path,
							cmd: 'fileOpenRecent'
						});
					}
					eyeos.callMessage(object.getApplication().getChecknum(), 'dynamicsWriteOpenRecent', qx.util.Json.stringify(recentDocs));
				}
			}
		},

		dynamicsUpdateOpenRecent: function(object, entry, path) {
			if (!object.__dynamics.recentDocs.subMenu) {
				object.dynamicsReadOpenRecent(object.__dynamics.recentDocs.node, entry, path);
			}
			else {
				var items = object.__dynamics.recentDocs.subMenu.getChildren();

				var isPresent = null;
				for (var i = 0; i < items.length; ++i) {
					if (items[i].getId() == entry) {
						isPresent = items[i];
						break;
					}
				}

				if (!isPresent) {
					if (items.length == genericbar.both.Actions.MAX_RECENT_DOCS) {
						object.__dynamics.recentDocs.subMenu.remove(items[items.length-1]);
					}

					var button = new eyeos.ui.menu.Button({
						name: entry,
						id: entry,
						cmd: 'fileOpenRecent'
					},
					'index.php?extern=images/documents/', null, object);
					button.path = path;
					object.__dynamics.recentDocs.subMenu.addAt(button, 0);
				}
				else {
					object.__dynamics.recentDocs.subMenu.remove(items[i]);
					object.__dynamics.recentDocs.subMenu.addAt(items[i], 0);
				}
			}
		},

		dynamicsReadOpenRecent: function(object, node, entry, path) {
			eyeos.callMessage(object.getApplication().getChecknum(), 'dynamicsReadOpenRecent', null, function(datas) {
				var button = null;
				var subMenu = new eyeos.ui.menu.Menu();
				var entries = qx.util.Json.parse(datas);

				for (var i = 0; i < entries.length; i++) {
					button = new eyeos.ui.menu.Button(entries[i], 'index.php?extern=images/documents/', null, object);
					button.path = entries[i].path;
					subMenu.add(button);
				}

				node.setMenu(subMenu);
				object.__dynamics.recentDocs.subMenu = subMenu;

				if (entry && path) {
					object.dynamicsUpdateOpenRecent(entry, path);
				}
			}, object);
		},

		fileDocumentInfos: function(object, e) {
			eyeos.application.documents.WindowsAndDialogs.fileDocumentInfosWindow(object);
		},

		fileExport: function(object, e) {
			var format = e.getTarget().getId();
			var fc = new eyeos.dialogs.FileChooser(object.getApplication().getChecknum());
			fc.showSaveDialog(object.getApplication().getWindow(), function(choice, path) {
				if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
					var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
					eyeos.callMessage(object.getApplication().getChecknum(), 'fileExport',
						[path, object.__currentDoc.path, format], function(savedPath) {
							if(savedPath) {
								alert('File exported');
								eyeos.callMessage(object.getApplication().getChecknum(), 'getFileInfo', savedPath, function (fileInfo) {
									var index = path.lastIndexOf('/');
									var currentPath = path.substr(0, index);
									eyeos.messageBus.getInstance().send('files', 'new', [currentPath, fileInfo]);
								}, this);
							} else {
								alert('Error exporting file, please contact your system administrator');
							}
						}, object);
				}
			}, object, null, 'Export file as...');
		},

		filePreview: function(object, e) {
			alert('filePreview: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		filePrint:function(object, e) {
			alert('filePrint: ' + e.getTarget().getId() + ' (to be implemented...)');
		}
	}
});
