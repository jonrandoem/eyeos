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

function files_application(checknum, pid, args) {
	var filesApplication = new eyeos.system.EyeApplication('files', checknum, pid);
	var filesController = new eyeos.files.Controller(filesApplication, args, 'iconview', checknum);
}

qx.Class.define('eyeos.files.Controller', {

	extend: qx.core.Object,
	
	construct: function (application, args, defaultView, checknum) {
		
		arguments.callee.base.call(this);
		
		// SETTERS
		this.setApplication(application);

		/*
		 * We fill with a default path in case none is given
		 * Init of the model and the view manager
		 */
		
		var defArgs;
		if (args[0] == undefined) {
			defArgs = ['path', 'home:///'];
		} else {
			defArgs = ['path', args[0]];
		}
		
		this.setModel(new eyeos.files.Model(defaultView, defArgs));

		/*
		 * Init of the application depending on what we have to show
		 */
		this._addListeners();
		this.setView(new eyeos.files.ViewManager(
				this,
				this.getModel(),
				this.getApplication(),
				'Files',
				'index.php?extern=/images/16x16/apps/system-file-manager.png',
				false,
				false
		));

		// Init SocialBarUpdater
		var socialBarUpdater = new eyeos.files.SUManager(this.getView()._socialBar, checknum);
		this.setSocialBarUpdater(socialBarUpdater);
		this._addSocialBarUpdaterListeners();
		
		this._browse(true);
		//this.getView().maximize();
	},

	properties: {
		application: {
			check: 'Object'
		},

		model: {
			check: 'Object'
		},
		
		view: {
			check: 'Object'
		},

		socialBarUpdater: {
			check: 'eyeos.files.SocialBarUpdater',
			init: null
		}
	},

	members: {

		_dBusListeners: new Array(),
		
		_filesQueue: eyeos.filesQueue.getInstance(),
		_dBus: eyeos.messageBus.getInstance(),

		_addListeners: function () {
//			this.addListener('selectedFile', function (e) {
//				var selected = e.getData();
//				var temp = new Array();
//				var callToUpdateContacts = true;
//				if (selected.length == 1) {
//					temp.push(selected[0].getFile());
//				} else if (selected.length > 1) {
//					for (var i = 0; i < selected.length; ++i) {
//						temp.push(selected[i].getFile());
//						callToUpdateContacts = false;
//					}
//				}
//				this.getView().updateSocialBar(temp, callToUpdateContacts);
//			});
//
//			this.addListener('cleanSocialBar', function () {
//				this.getView().cleanSocialBar();
//			});


			// DBUS Messages for syncing all "Files"

			/*
			 * eyeos_files_delete - Deletes a file from the Model in case our current path is the same as the source one and updates the view
			 *
			 * @receives {Array} [sourcePath: string, files: Array] 
			 */
			this._dBusListeners.push(this._dBus.addListener('eyeos_files_delete', function (e) {
				var sourcePath = e.getData()[0];
				var filesToDelete = e.getData()[1];
				var currentPath = this.getModel().getCurrentPath()[1];
				var currentFiles = this.getModel().getCurrentFiles();

				if(sourcePath.charAt(sourcePath.length-1) != '/') {
					sourcePath = sourcePath + '/';
				}
				if(currentPath.charAt(sourcePath.length-1) != '/') {
					currentPath = currentPath + '/';
				}
				if (sourcePath == currentPath) {
					for (var i = currentFiles.length - 1; i >= 0; --i) {
						if (filesToDelete.indexOf(currentFiles[i].getAbsolutePath()) != -1) {
							this.getModel().getCurrentFiles().splice(i, 1);
						}
					}
					this.getView().showBrowse();
				} else if (filesToDelete.indexOf(currentPath) != -1) {
					this._browsePath('home://~'+eyeos.getCurrentUserName()+'/');
				}

				//Update SocialBar
				var params = {
					path: currentPath,
					checknum: this.getApplication().getChecknum()
				}
				this.getSocialBarUpdater().directoryChanged(params);
			}, this));

			/*
			 * eyeos_files_new - Adds a file to the Model in case our current path is the same as the source one and updated the view
			 *
			 * @receives {Array} [sourcePath: string, file: Object]
			 */
			this._dBusListeners.push(this._dBus.addListener('eyeos_files_new', function (e) {

				var sourcePath = e.getData()[0];
				var fileToCreate = e.getData()[1];
				var currentPath = this.getModel().getCurrentPath()[1];

				if (sourcePath == currentPath) {
					var file = new eyeos.files.File(fileToCreate);
					this.getModel().getCurrentFiles().push(file);
					this.getView()._view.showBrowse();

                                        var items = this.getView()._view.returnAll();
                                        //en items tengo un array de IconViewItems
                                        var i = 0;
                                        var size = items.length;
                                        for(i=0;i<size;i++) {
                                            if(items[i].getFile().getName() == e.getData()[1].name) {
                                                items[i].select();
                                                this.editFile();
                                                i = size;
                                            }

                                        }
				}
			}, this));

			/*
			 * eyeos_files_cut - Directly updates the view if the source folder is our current one
			 *
			 * @receives {Array} [sourcePath: string, files: Array]
			 */
			this._dBusListeners.push(this._dBus.addListener('eyeos_files_cut', function (e) {

				var sourcePath = e.getData()[0];
				var currentPath = this.getModel().getCurrentPath()[1];

				var filesToCut = e.getData()[1];
				var filesToCutPath = new Array();
				for (var i = 0; i < filesToCut.length; ++i) {
					filesToCutPath[i] = filesToCut[i].getAbsolutePath();
				}

				if (sourcePath == currentPath) {
					var currentFiles = this.getModel().getCurrentFiles();
					var currentFilesPaths = new Array();
					for (var i = 0; i < currentFiles.length; ++i) {
						currentFilesPaths[i] = currentFiles[i].getAbsolutePath();
					}

					for (var i = 0; i < filesToCut.length; ++i) {
						var index = currentFilesPaths.indexOf(filesToCutPath[i]);
						if (index != -1) {
							currentFiles[index].setCutted(true);
						}
					}

					this.getView().showBrowse();
				} else if (filesToCutPath.indexOf(currentPath) != -1) {
					this._browsePath('home://~'+eyeos.getCurrentUserName()+'/');
				}
			}, this));

			/*
			 * eyeos_files_update - Adds/Remove information to the Files objects and updates the view
			 *
			 * @receives {Array} [sourcePath: string, files: Array]
			 */

			this._dBusListeners.push(this._dBus.addListener('eyeos_files_update', function (e) {
				var sourcePath = e.getData()[0];
				var filesToUpdate = e.getData()[1];
				var currentPath = this.getModel().getCurrentPath()[1];

				if (currentPath.substr(currentPath.length - 1) != '/') {
					currentPath += '/';
				}

				if (sourcePath.substr(sourcePath.length - 1) != '/') {
					sourcePath += '/';
				}
			
				if (sourcePath == currentPath) {

					var currentFiles = this.getModel().getCurrentFiles();
					var currentFilesPath = new Array();
					var filesToUpdatePath = new Array();

					for (var i = 0; i < filesToUpdate.length; ++i) {
						filesToUpdatePath.push(filesToUpdate[i].getAbsolutePath());
					}

					for (var i = 0; i < currentFiles.length; ++i) {
						currentFilesPath.push(currentFiles[i].getAbsolutePath());
					}

					for (var i = 0; i < filesToUpdate.length; ++i) {
						var index = currentFilesPath.indexOf(filesToUpdatePath[i]);
						if (index != -1) {
							currentFiles[index].setShared(filesToUpdate[i].getShared());
							currentFiles[index].setRating(filesToUpdate[i].getRating());
							
						}
					}

					var returnSelected = this.getView().returnSelected();
					for (var i = 0; i < returnSelected.length; ++i) {
						returnSelected[i].updateImage();
					}

//					this.getView().showBrowse();
				}
			}, this));

			/*
			 * eyeos_files_paste - Adds/Remove files to/from the Model in case our current path is the source or the target one and updates the view
			 *
			 * @receives {Array} [files: Array, action: string, sourcePath: string, targetPath: string, results: Array]
			 *
			 * (results is just used when our action is copy, it's an array containing the new names of the files in case they have been renamed
			 */

			this._dBusListeners.push(this._dBus.addListener('eyeos_files_paste', function (e) {
				var files = e.getData()[0];
				var action = e.getData()[1];
				var source = e.getData()[2];
				var target = e.getData()[3];
				var results = e.getData()[4];
				var currentPath = this.getModel().getCurrentPath()[1];
				var currentFiles = this.getModel().getCurrentFiles();

				var filesPath = new Array();
				var currentFilesPath = new Array();

				for (var i = 0; i < currentFiles.length; ++i) {
					currentFilesPath.push(currentFiles[i].getAbsolutePath());
				}

				for (var i = 0; i < files.length; ++i) {
					filesPath.push(files[i].getAbsolutePath());
				}

				if (action == 'move') {

					var toSplice = new Array();

					for (var i = files.length - 1; i >= 0; --i) {
						var index = currentFilesPath.indexOf(filesPath[i]);
						if (index != -1) {
							if (target == currentPath) {
								currentFiles[index].setCutted(false);
							} else {
								toSplice.push(index);
							}
						} else {
							if (target == currentPath) {
								var destination = target + '/' + files[i].getName();
								var index = currentFilesPath.indexOf(destination);
								if (index == -1) {
									var newFile = {
										type: files[i].getType(),
										size: files[i].getSize(),
										name: files[i].getName(),
										extension: files[i].getExtension(),
										permissions: files[i].getPermissions(),
										owner: files[i].getOwner(),
										path: target,
										absolutepath: destination,
										shared: files[i].getShared(),
										rating: files[i].getRating(),
										created: files[i].getCreated(),
										modified: files[i].getModified()
									};
									var nFile = new eyeos.files.File(newFile);
									this.getModel().getCurrentFiles().push(nFile);
								} else {
									currentFiles[index].set({
										type: files[i].getType(),
										size: files[i].getSize(),
										name: files[i].getName(),
										extension: files[i].getExtension(),
										permissions: files[i].getPermissions(),
										owner: files[i].getOwner(),
										shared: files[i].getShared(),
										rating: files[i].getRating(),
										created: files[i].getCreated(),
										modified: files[i].getModified()
									});
								}
							}
						}
					}

					if (toSplice.length >= 1) {
						for (var i = 0; i < toSplice.length; ++i) {
							this.getModel().getCurrentFiles().splice(toSplice[i], 1);
						}
					}

				} else if (action == 'copy') {
					if (target == currentPath) {
						for (var i = 0; i < results.length; ++i) {
							if (currentFilesPath.indexOf(results[i].absolutepath) == -1) {
								var futureFile = currentPath  + results[i].name;
								if (currentFilesPath.indexOf(futureFile) == -1) {
									var file = new eyeos.files.File(results[i]);
									file.setShared('0');
									this.getModel().getCurrentFiles().push(file);
								}
							}
						}
					}
				}

				this.getView().showBrowse();
				
			}, this));

			/*
			 * eyeos_files_paste - Adds/Remove files to/from the Model in case our current path is the source or the target one and updates the view
			 *
			 * @receives {Array} [files: Array, action: string, sourcePath: string, targetPath: string, results: Array]
			 *
			 * (results is just used when our action is copy, it's an array containing the new names of the files in case they have been renamed
			 */

			this._dBusListeners.push(this._dBus.addListener('eyeos_files_drop', function (e) {
				var files = e.getData()[0];
				var source = e.getData()[1];
				var target = e.getData()[2];

				if(target.charAt(target.length-1) != '/') {
					target = target + '/';
				}

				var currentPath = this.getModel().getCurrentPath()[1];

				if(currentPath.charAt(currentPath.length-1) != '/') {
					currentPath = currentPath + '/';
				}
				var currentFiles = this.getModel().getCurrentFiles();

				var filesPath = new Array();
				var currentFilesPath = new Array();

				for (var i = 0; i < currentFiles.length; ++i) {
					currentFilesPath.push(currentFiles[i].getAbsolutePath());
				}

				for (var i = 0; i < files.length; ++i) {
					filesPath.push(files[i].getAbsolutePath());
				}

				var toSplice = new Array();

				for (var i = files.length - 1; i >= 0; --i) {
					var index = currentFilesPath.indexOf(filesPath[i]);
					if (index != -1) {
						if (target != currentPath) {
							toSplice.push(index);
						}
					} else {
						if (target == currentPath) {
							var destination = target + files[i].getName();
							var index = currentFilesPath.indexOf(destination);
							if (index == -1) {
								var newFile = {
									type: files[i].getType(),
									size: files[i].getSize(),
									name: files[i].getName(),
									extension: files[i].getExtension(),
									permissions: files[i].getPermissions(),
									owner: files[i].getOwner(),
									path: target,
									absolutepath: destination,
									shared: files[i].getShared(),
									rating: files[i].getRating(),
									created: files[i].getCreated(),
									modified: files[i].getModified()
								};
								if(newFile.extension == 'LNK') {
									newFile.content = files[i].getContent();
								}
								var nFile = new eyeos.files.File(newFile);
								this.getModel().getCurrentFiles().push(nFile);
							} else {
								currentFiles[index].set({
									type: files[i].getType(),
									size: files[i].getSize(),
									name: files[i].getName(),
									extension: files[i].getExtension(),
									permissions: files[i].getPermissions(),
									owner: files[i].getOwner(),
									shared: files[i].getShared(),
									rating: files[i].getRating(),
									created: files[i].getCreated(),
									modified: files[i].getModified()
								});
							}
						}
					}
				}

				if (toSplice.length >= 1) {
					for (var i = 0; i < toSplice.length; ++i) {
						this.getModel().getCurrentFiles().splice(toSplice[i], 1);
					}
				}

				this.getView().showBrowse();

			}, this));

			/*
			 * eyeos_files_rename - Adds/Remove files to/from the Model in case our current path is the source or the target one
			 *
			 * @receives {Array} [oldName: string, sourcePath: string, results: Object containing the data of the file]
			 */

			this._dBusListeners.push(this._dBus.addListener('eyeos_files_rename', function (e) {
				var sourcePath = e.getData()[1];
				var currentPath = this.getModel().getCurrentPath()[1];
				if (sourcePath == currentPath) {
					var oldName = e.getData()[0];
					var currentFiles = this.getModel().getCurrentFiles();
					var results = e.getData()[2];
					for (var i = 0; i < currentFiles.length; ++i) {
						if (currentFiles[i].getAbsolutePath() == oldName) {
							currentFiles[i].setName(results.name);
							currentFiles[i].setAbsolutePath(results.absolutepath);
						}
					}
				}
				this.getView().showBrowse();
			}, this));

			this._dBusListeners.push(this._dBus.addListener('eyeos_file_uploadComplete', function (e) {
				var currentPath = this.getModel().getCurrentPath()[1];
				var splitted = e.getData().absolutepath.split('/');
				var path = '';
				for (var i = 0; i < splitted.length - 1; ++i) {
					if (splitted[i] != '') {
						if (i == 0) {
							path += splitted[i] + '//';
						} else {
							path += splitted[i] + '/';
						}
					}
				}

				if (currentPath.substring(currentPath.length - 1) != '/') {
					currentPath += '/';
				}

				if (path == currentPath) {
					var file = new eyeos.files.File(e.getData());
					this.getModel().getCurrentFiles().push(file);
					this.getView().showBrowse();
				}
			}
			, this));

			this._dBusListeners.push(this._dBus.addListener('eyeos_socialbar_ratingChanged', function (e) {
				var eventPath = e.getData()['path'];
				var eventFiles = e.getData()['files'];
				var currentPath = this.getModel().getCurrentPath()[1];
				
				if (eventPath == currentPath) {
					var modelFiles = this.getModel().getCurrentFiles();
					for (var i = 0; i < modelFiles.length; ++i) {
						for (var j=0; j < eventFiles.length; ++j) {
							if (modelFiles[i].getAbsolutePath() == eventFiles[j].getAbsolutePath()) {
								modelFiles[i].setRating(eventFiles[j].getRating());
							}
						}
					}
				}
			}
			, this));
		},

		_addSocialBarUpdaterListeners: function () {
			this.addListener('selectedFile', function (e) {
				var params = {
					path: this.getModel().getCurrentPath()[1],
					selected: this._getFilesFromIconViews(e.getData()),
					checknum: this.getApplication().getChecknum()
				}
				this.getSocialBarUpdater().selectionChanged(params);
			}, this);

			this.addListener('directoryChanged', function (e) {
				var params = {
					path: e.getData(),
					checknum: this.getApplication().getChecknum()
				}
				this.getSocialBarUpdater().directoryChanged(params);
			}, this);
		},

		_getFilesFromIconViews: function (iconViews) {
			var filesArray = [];
			for (var i = 0; i < iconViews.length; ++i) {
				filesArray.push(iconViews[i].getFile());
			}
			return filesArray;
		},

		_browse: function (addToHistory) {
			var currentPath = this.getModel().getCurrentPath();
			this._browsePath(currentPath[1], addToHistory);
		},

		_browsePath: function(path, addToHistory) {
			eyeos.callMessage(this.getApplication().getChecknum(), 'browsePath', [path, null, null], function (results) {
				this._browsePath_callback(results, path, addToHistory);
			}, this, null, 12000);
		},

		_browsePath_callback: function(results, path, addToHistory) {
			// Send data to the model
			this.getModel().setCurrentPath(['path', results.absolutepath]);

			if (addToHistory) {
				this._addToHistory('path');
			}

			// Empty the array with all the previous files
			this.getModel().getCurrentFiles().splice(0, this.getModel().getCurrentFiles().length);
			
			// The Cut/Copy/Paste queue
			var filesQueue = this._filesQueue.getMoveQueue();
			var action = this._filesQueue.getAction();
			var filesQueuePath = new Array();
			for (var i = 0; i < filesQueue.length; ++i) {
				filesQueuePath.push(filesQueue[i].getAbsolutePath());
			}

			// Foreach file we will create a "file object" that will contain all the data of the file
			for (var i = 0; i < results.files.length; ++i) {
				if(path == 'share:///') {
					results.files[i].sharedByContacts = true;
				}

				var item = new eyeos.files.File(results.files[i]);

				var index = filesQueuePath.indexOf(results.files[i].absolutepath);
				if (index != -1 && action == 'move') {
					item.setCutted(true);
				}

				this.getModel().getCurrentFiles().push(item);
			}

			// We call to the view controller to show the browse
			var currentPath = this.getModel().getCurrentPath()[1];
			if (currentPath.substr(0, 8) == 'share://' || currentPath == 'workgroup:///') {
				this.getView()._view.setContextMenu(null);
			} else {
				this.getView()._view.setContextMenu(this.getView()._view._menu);
			}
			this.getView().showBrowse();

			this.fireDataEvent('directoryChanged', currentPath);
		},

		_addToHistory: function (input) {
			// If we have to add this path to the history ...
			var history = this.getModel().getHistory();
			var historyIndex = this.getModel().getHistoryIndex();
			// A new position is added on the array pointing to our current path
			history[historyIndex] = [input, this.getModel().getCurrentPath()[1]];
			if (historyIndex > 0) {
				this.getModel().getHistory().splice(parseInt(historyIndex + 1), parseInt(history.length - parseInt(historyIndex + 1)));
			}
			this.getModel().setHistoryIndex(historyIndex + 1);
		},

		specialMove: function (path, selection) {
			if(selection) {
				var filesToMove = [];
				var files = [path];
				for(var i = 0; i < selection.length; i++) {
					var info = selection[i].getUserData('info');
					var pathFromFile = info.absolutepath;
					var source = pathFromFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
					var target = path;
					var content = selection[i].getUserData('content');
					files.push(pathFromFile);
					filesToMove.push({
							mPathFromFile: pathFromFile,
							mInfo: info,
							content: content,
							getAbsolutePath: function() {
								return this.mPathFromFile;
							},

							getName: function() {
								return this.mPathFromFile.replace(/^.*[\/\\]/g, '');
							},

							getType: function() {
								return this.mInfo.type;
							},

							getSize: function() {
								return this.mInfo.size;
							},

							getExtension: function() {
								return this.mInfo.extension;
							},

							getPermissions: function() {
								return this.mInfo.permissions;
							},

							getOwner: function() {
								return this.mInfo.owner;
							},

							getShared: function() {
								if(!this.mInfo.shared) {
									return "0";
								}
								return this.mInfo.shared;
							},

							getRating: function() {
								if(!this.mInfo.rating) {
									return "0";
								}
								return this.mInfo.rating;
							},

							getCreated: function() {
								try {
									var ret = this.mInfo.meta.creationTime;
								} catch (e) {
									var foo = new Date;
									var unixtime_ms = foo.getTime();
									var unixtime = parseInt(unixtime_ms / 1000);
									return unixtime;
								}
								return ret;
							},

							getModified: function() {
								try {
									var ret = this.mInfo.meta.modificationTime;
								} catch (e) {
									var foo = new Date;
									var unixtime_ms = foo.getTime();
									var unixtime = parseInt(unixtime_ms / 1000);
									return unixtime;
								}
								return ret;
							},

							getContent: function() {
								if(!this.content) {
									return "";
								} else {
									return this.content;
								}
							}
					});
				}
				eyeos.callMessage(this.getApplication().getChecknum(), 'move', files, function (results) {
						this._dBus.send('files', 'drop', [filesToMove, source, target]);
						this._browsePath(path);
						this._filesQueue.setDragQueue([]);
				}, this);
			} else {
				var filesToMove = this._filesQueue.getDragQueue();
				if (filesToMove.length >= 1) {
						var files = new Array();
						var action = this._filesQueue.getAction();
						var source = this._filesQueue.getDragSource();
						var target = path;
						for (var i = 0; i < filesToMove.length; ++i) {
								files.push(filesToMove[i].getAbsolutePath());
						}

						files.unshift(path);
						eyeos.callMessage(this.getApplication().getChecknum(), 'move', files, function (results) {
								this._dBus.send('files', 'drop', [filesToMove, source, target]);
								this._browsePath(path);
								this._filesQueue.setDragQueue([]);
						}, this);
				}
			}

		},
		
		openFile: function () {
			var filesToOpen = this.getView().returnSelected();
			var filesForViewer = new Array();
			var filesForDocuments = new Array();
			var filesForFemto = new Array();
			var foldersToOpen = new Array();
			var filesForImageViewer = new Array();
			var filesForDocPreview = new Array();
			var filesForPDFPreview = new Array();
			var filesForOpenLink = new Array();

			var extensionsForViewer = ['MP3','FLV','HTM','HTML','M4A','WAV','WMA','MOV', '3GP', '3GPP', '3G2', 'MP4', 'MPG', 'MPV', 'AVI', 'OGG', 'OGV', 'WEBM'];
			var extensionsForDocuments = ['EDOC'];
			var extensionsDocPreview = ['DOC', 'DOCX', 'ODT', 'ODS', 'OTS', 'SXC', 'XLS', 'XLT', 'XLS', 'XLSX', 'ODP', 'OTP', 'SXI', 'STI', 'PPT', 'POT', 'SXD', 'PPTX', 'PPSX', 'POTM', 'PPS', 'FODP', 'UOP'];
			var extensionsForFemto = ['TXT'];
			var extensionsForImageViewer = ['JPG', 'JPEG', 'BMP', 'GIF', 'PNG'];
			var extensionsForPDFViewer = ['PDF'];
			var extensionsForLink = ['LNK'];

			for (var i = 0; i < filesToOpen.length; ++i) {
				var type = filesToOpen[i].getFile().getType();
				var extension = filesToOpen[i].getFile().getExtension();
				if (type == 'folder') {
					foldersToOpen.push(filesToOpen[i].getFile().getAbsolutePath());
				} else {
					if (extensionsForViewer.indexOf(extension) != -1) {
						filesForViewer.push(filesToOpen[i].getFile().getAbsolutePath());
					}
					if (extensionsForImageViewer.indexOf(extension) != -1) {
						filesForImageViewer.push(filesToOpen[i].getFile().getAbsolutePath());
					}
					if (extensionsForDocuments.indexOf(extension) != -1) {
						filesForDocuments.push(filesToOpen[i].getFile().getAbsolutePath());
					}
					if (extensionsForFemto.indexOf(extension) != -1) {
						filesForFemto.push(filesToOpen[i].getFile().getAbsolutePath());
					}
					if (extensionsDocPreview.indexOf(extension) != -1) {
						filesForDocPreview.push(filesToOpen[i].getFile().getAbsolutePath());
					}
					if (extensionsForPDFViewer.indexOf(extension) != -1) {
						filesForPDFPreview.push(filesToOpen[i].getFile().getAbsolutePath());
					}
					if (extensionsForLink.indexOf(extension) != -1) {
						filesForOpenLink.push(filesToOpen[i].getFile().getAbsolutePath());
					}
				}
			}

			if (filesForViewer.length >= 1) {
				eyeos.execute('viewer', this.getApplication().getChecknum(), filesForViewer);
			}

			if (filesForImageViewer.length >= 1) {
				eyeos.execute('imageviewer', this.getApplication().getChecknum(), filesForImageViewer);
			}
			
			if (filesForDocuments.length >= 1) {
				eyeos.execute('documents', this.getApplication().getChecknum(), filesForDocuments);
			}

			if (filesForDocPreview.length >= 1) {
				eyeos.execute('docviewer', this.getApplication().getChecknum(), filesForDocPreview);
			}

			if (filesForPDFPreview.length >= 1) {
				eyeos.execute('pdfviewer', this.getApplication().getChecknum(), filesForPDFPreview);
			}

			if (filesForFemto.length >= 1) {
				eyeos.execute('notepad', this.getApplication().getChecknum(), filesForFemto);
			}
			if (filesForOpenLink.length >= 1) {
				eyeos.execute('openLink', this.getApplication().getChecknum(), filesForOpenLink);
			}

			for (var i = 0; i < foldersToOpen.length; ++i) {
				eyeos.execute('files', this.getApplication().getChecknum(), [foldersToOpen[i]]);
			}
		},

		newFile: function (extension) {
			var currentPath = this.getModel().getCurrentPath()[1];
			if (currentPath.substr(0, 8) != 'share://' && currentPath != 'workgroup://') {
				var name = null;
				switch (extension) {
					case 'txt': {
						name = tr('New File');
						break;
					}
					case 'edoc': {
						name = tr('New Document');
						break;
					}
					case 'xls': {
						name = tr('New Spreadsheet');
						break;
					}
				}

				eyeos.callMessage(this.getApplication().getChecknum(), 'createNewFile', [currentPath + '/' + name + '.' + extension], function (results) {
					this._dBus.send('files', 'new', [currentPath, results]);
				},this);
			}
		},
		newLink: function() {
		   eyeos.execute('newLink', this.getApplication().getChecknum(), [this.getModel().getCurrentPath()[1]]);
		},

		uploadFile: function() {
		   eyeos.execute('upload', this.getApplication().getChecknum(), [this.getModel().getCurrentPath()[1]]);
		},
		newFolder: function () {
			var currentPath = this.getModel().getCurrentPath()[1];
			if (currentPath.substr(0, 8) != 'share://' && currentPath != 'workgroup://') {
				var name = tr('New Folder');
				eyeos.callMessage(this.getApplication().getChecknum(), 'mkdir', new Array(currentPath, name), function (results) {
					this._dBus.send('files', 'new', [currentPath, results]);
				}, this);
			}
		},
		
		deleteFile: function () {
			var currentPath = this.getModel().getCurrentPath()[1];
			if (currentPath.substr(0, 8) != 'share://' && currentPath != 'workgroup://') {
				var filesToDelete = this.getView().returnSelected();
				var files = new Array();
				for (var i = 0; i < filesToDelete.length; ++i) {
					if(filesToDelete[i].getFile().getAbsolutePath() != 'home://~' + eyeos.getCurrentUserName() + '/Desktop') {
						files.push(filesToDelete[i].getFile().getAbsolutePath());
					}
				}
				if(files.length == 0) {
					alert('You can not deleted this folder');
					return;
				}
				eyeos.callMessage(this.getApplication().getChecknum(), 'delete', files, function (results) {
					this._dBus.send('files', 'delete', [currentPath, results]);
				}, this);
			}
		},

		cutFile: function () {
			var currentPath = this.getModel().getCurrentPath()[1];
			if (currentPath.substr(0, 8) != 'share://' && currentPath != 'workgroup://') {
				var filesToCut = this.getView().returnSelected();

				var filesToCut_files = new Array();
				for (var i = 0; i < filesToCut.length; ++i) {
					filesToCut_files.push(filesToCut[i].getFile());
				}
				this._dBus.send('files', 'cut', [currentPath, filesToCut_files]);
				this._filesQueue.fillMoveQueue('move', filesToCut, currentPath);
			}
		},

		copyFile: function () {
			var filesToCopy = this.getView().returnSelected();
			var currentPath = this.getModel().getCurrentPath()[1];
			this._filesQueue.fillMoveQueue('copy', filesToCopy, currentPath);
		},

		pasteFile: function () {
			var filesToPaste = this._filesQueue.getMoveQueue();
			if (filesToPaste.length >= 1) {
				var source = this._filesQueue.getMoveSource();
				var target = this.getModel().getCurrentPath()[1];
				var action = this._filesQueue.getAction();
				var files = new Array();

				for (var i = 0; i < filesToPaste.length; ++i) {
					if (action == 'move') {
						if (target != filesToPaste[i].getPath()) {
							files.push(filesToPaste[i].getAbsolutePath());
						}
					} else {
						files.push(filesToPaste[i].getAbsolutePath());
					}
				}

				if (files.length >= 1) {
					files.unshift(target);
					eyeos.callMessage(this.getApplication().getChecknum(), action, files, function (results) {
						this._dBus.send('files', 'paste', [filesToPaste, action, source, target, results]);
						if (action == 'move') {
							this._filesQueue.setMoveQueue([]);
							this._filesQueue.setAction('');
						}
					}, this, {"dontAutoCatchExceptions": true});
				} else {
					this._dBus.send('files', 'paste', [filesToPaste, action, source, target]);
						if (action == 'move') {
							this._filesQueue.setMoveQueue([]);
							this._filesQueue.setAction('');
						}
				}
			}
		},

		editFile: function () {
			var currentPath = this.getModel().getCurrentPath()[1];
			if (currentPath.substr(0, 8) != 'share://' && currentPath != 'workgroup://') {
				var selected = this.getView().returnSelected();
				if (selected.length == 1) {
					selected[0].edit();
				}
			}
		},

		renameFile: function (rename, object, file) {
			if(!file) {
				var selected = this.getView().returnSelected()[0];
			} else {
				var selected = file;
			}
		
			var absPath = selected.getFile().getAbsolutePath();
			var currentPath = this.getModel().getCurrentPath()[1];
			if (selected.getFile().getName() != rename) {
				eyeos.callMessage(this.getApplication().getChecknum(), 'rename', [absPath, currentPath, rename], function (results) {
					object.setValue(rename);
					this._dBus.send('files', 'rename', [absPath, currentPath, results]);
				}, this);
			}
		},

		downloadFile: function (rename) {
			var selected = this.getView().returnSelected();
			eyeos.execute('download',this.getApplication().getChecknum(), [selected[0].getFile().getAbsolutePath()]);
		},
		
		toolBarBack: function () {
			if (parseInt(this.getModel().getHistoryIndex() - 1) >= 0) {
				if (parseInt(this.getModel().getHistoryIndex() - 1) == 0) {
					this.getModel().setCurrentPath(this.getModel().getHistory()[0]);
				} else {
					this.getModel().setHistoryIndex(this.getModel().getHistoryIndex() - 1);
					this.getModel().setCurrentPath(this.getModel().getHistory()[parseInt(this.getModel().getHistoryIndex() - 1)]);
				}
				this._browse(false);
			} else {
				this.getModel().setHistoryIndex(0);
			}
		},

		toolBarForward: function () {
			if (parseInt(this.getModel().getHistoryIndex()+1) <= this.getModel().getHistory().length) {
				this.getModel().setHistoryIndex(this.getModel().getHistoryIndex() + 1);
			} else {
				this.getModel().setHistoryIndex(this.getModel().getHistory().length);
			}
			this.getModel().setCurrentPath(this.getModel().getHistory()[this.getModel().getHistoryIndex()]);
			this._browse(false);
		},

		toolBarUpload: function () {
                    eyeos.execute('upload', this.getApplication().getChecknum(), [this.getModel().getCurrentPath()[1]]);
		},

        shareURLFile: function () {
            var selected = this.getView().returnSelected();
            eyeos.execute('urlshare', this.getApplication().getChecknum(), [selected[0].getFile().getAbsolutePath(), true]);
        }
	}
});
