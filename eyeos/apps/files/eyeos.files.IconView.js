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

qx.Class.define('eyeos.files.IconView', {

	extend: qx.ui.container.Scroll,

	construct: function (manager) {
		this.base(arguments);
		this.setViewManager(manager);
		this.setDragging(false);
		this._buildLayout();
		this._addListeners();
	},
	
	properties: {
		viewManager: {
			check: 'Object'
		},

		model: {
			check: 'Object'
		},

		dragging: {
			check: 'Boolean'
		}
	},

	members: {
		
		_layoutBase: null,
		_activeIcon: null,
		
		getLayoutBase: function () {
			return this._layoutBase;
		},

		_addListeners: function () {
			var currentPath = this.getViewManager().getModel().getCurrentPath()[1];
			if (currentPath != 'share:///' && currentPath != 'workgroup:///') {
				this._layoutBase.addListener('drop', function (e) {
					if(!e.getRelatedTarget().getUserData('info')) {
						var fileDropped = e.getRelatedTarget().getFile();
						var pathFromFile = fileDropped.getAbsolutePath();
						var type = fileDropped.getType();
						var dirPath = fileDropped.getPath();
						var currentPath = this.getViewManager().getModel().getCurrentPath()[1];
						if (currentPath.substr(0,8) != 'share://' && currentPath != 'workgroup:///') {
							if (dirPath != currentPath && type != 'folder') {
								this.getViewManager().getController().specialMove(currentPath);
							} else if (type == 'folder' && currentPath != dirPath && currentPath.search(new RegExp(pathFromFile, 'gi')) == -1) {
								this.getViewManager().getController().specialMove(currentPath);
							} else {
								var filesQueue = eyeos.filesQueue.getInstance();
								filesQueue.setDragQueue([]);
								filesQueue.setAction('');
							}
							this.setDragging(false);
							e.stopPropagation();
						}
					} else {
						//check if there is a selection
						var sm = desktop.SelectionManager.getInstance();
						if(sm.hasSelection() && sm.getSelection().length > 0) {
							var selection = sm.getSelection();
						} else {
							var selection = [e.getRelatedTarget()];
						}

						var info = selection[0].getUserData('info');
						var type = info.type;
						var pathFromFile = info.absolutepath;
						//dirname() from php.js
						var dirPath = pathFromFile.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
						var currentPath = this.getViewManager().getModel().getCurrentPath()[1];
						if (currentPath.substr(0,8) != 'share://' && currentPath != 'workgroup:///') {
							if (dirPath != currentPath && type != 'folder') {
								this.getViewManager().getController().specialMove(currentPath, selection);
							} else if (type == 'folder' && currentPath != dirPath && currentPath.search(new RegExp(pathFromFile, 'gi')) == -1) {
								this.getViewManager().getController().specialMove(currentPath, selection);
							} else {
								var filesQueue = eyeos.filesQueue.getInstance();
								filesQueue.setDragQueue([]);
								filesQueue.setAction('');
							}
							this.setDragging(false);
							e.stopPropagation();
						}

					}
				}, this);

				this.addListener('click', function (e) {
					var selected = this.returnSelected();
					if (selected.length >= 1) {
						if(this.rangeBefore && this.rangeBefore == 1) {
							this.rangeBefore = 0;
						} else {
							this.resetAllSelected();
						}
						
					//						this.getViewManager().getController().fireEvent('cleanSocialBar');
					}
				});
				
				this.addListener('contextmenu', function (e) {
					e.stopPropagation();
					e.preventDefault();
				});

				var mousemovecallback = function(e) {
					if(this.selecting) {
						var x = e.getDocumentLeft();
						var y = e.getDocumentTop();
						y = y - 35; //topmenu + borders

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
					//
					//						var selected = this.returnSelected();
					//						if (selected.length >= 1) {
					//							this.resetAllSelected();
					//						}
					//
					//						var box = new Object();
					//						if(x > this.selectorX) {
					//							box.x = this.selectorX;
					//							box.width = x-this.selectorX;
					//						} else {
					//							box.x = x;
					//							box.width = this.selectorX-x;
					//						}
					//
					//						if(y > this.selectorY) {
					//							box.y = this.selectorY;
					//							box.height = y-this.selectorY;
					//						} else {
					//							box.y = y;
					//							box.height = this.selectorY-y;
					//						}
					//
					//						//this is because the window can be moved in the screen!!!!
					//						box.y = box.y - this.windowOffsetTop;
					//						box.x = box.x - this.windowOffsetLeft;
					//
					//						box.y = box.y - 165; //top part of the window... hardcoded :(
					//						box.x = box.x - 190; //left part of the window... hardcoded :(
					//
					//						var childrens = this._layoutBase.getChildren();
					//						for(var i in childrens) {
					//							if(childrens[i] instanceof eyeos.files.IconViewItem) {
					//								var bounds = childrens[i].getBounds();
					////								console.log(bounds);
					////								console.log(box);
					//								if(parseInt(bounds.top)+parseInt(bounds.height) > box.y
					//									&& parseInt(bounds.top) < box.y + box.height
					//									&& parseInt(bounds.left)+parseInt(bounds.width) > box.x
					//									&& parseInt(bounds.left) < box.x + box.width
					//									) {
					//									childrens[i].select();
					//								}
					//							}
					//						}
					} else {
						if(this.selector) {
							this.selector.destroy();
							this.selector = null;
						}
					}

					e.stopPropagation();
				};

				var mouseupcallback = function(e) {
					var x = e.getDocumentLeft();
					var y = e.getDocumentTop();
					y = y - 35; //topmenu + borders

					if(this.selector) {
						this.selector.destroy();
						//						var x = e.getDocumentLeft();
						//						var y = e.getDocumentTop();
						//						y = y - 85;
						//						x = x - 15;
						//						//now, we need to calculate what are the icons inside the box
						//						//so first, go calculate the box :)
						//
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

						//this is because the window can be moved in the screen!!!!
						box.y = box.y - this.windowOffsetTop;
						box.x = box.x - this.windowOffsetLeft;

						//and what about the scroll? :)

						box.y = box.y + this.getScrollY();

						box.y = box.y - 165; //top part of the window... hardcoded :(
						box.x = box.x - 190; //left part of the window... hardcoded :(


						var childrens = this._layoutBase.getChildren();
						for(var i in childrens) {
							if(childrens[i] instanceof eyeos.files.IconViewItem) {
								var bounds = childrens[i].getBounds();
								//								console.log(bounds);
								//								console.log(box);
								if(parseInt(bounds.top)+parseInt(bounds.height) > box.y
									&& parseInt(bounds.top) < box.y + box.height
									&& parseInt(bounds.left)+parseInt(bounds.width) > box.x
									&& parseInt(bounds.left) < box.x + box.width
									) {
									childrens[i].select();
									this.rangeBefore = 1;
								}
							}
						}
					}
					this.selector = null;
					this.selecting = false;
				};
				
				//--------------- multiple select
				this._layoutBase.addListener('mousedown', function(e) {

					if(e.getButton() != 'left' || e.getTarget() != this._layoutBase) {
						return;
					}
					this.resetAllSelected();
					if(this.selector) {
						this.selector.destroy();
						this.selector = null;
					}
					var x = e.getDocumentLeft();
					var y = e.getDocumentTop();
					y = y - 35; //topmenu + borders
					this.selecting = true;
					this.selector = new qx.ui.container.Composite();
					this.selector.addListener('mousemove', mousemovecallback, this);
					this.selector.addListener('mouseup', mouseupcallback, this);
					this.selector.set({
						opacity: 0.1,
						backgroundColor: 'blue',
						width:0,
						height:0,
						marginLeft:x,
						marginTop:y,
						zIndex: 9000000
					});

					this.selectorY = y;
					this.selectorX = x;
					this.windowOffsetTop = this.getViewManager().getBounds().top;
					this.windowOffsetLeft = this.getViewManager().getBounds().left;
					document.eyeDesktop.add(this.selector);
				}, this);
				
				this._layoutBase.addListener('mousemove', mousemovecallback, this);
				this._layoutBase.addListener('mouseup', mouseupcallback, this);
			}
		},

		_addItem: function (item) {
			this._addListenersToItem(item);
			this._layoutBase.add(item);
		},

		_addListenersToItem: function (item) {
			
			var self = this;

			/**
			 * Click events
			 */

			item.addListener('selected', function (e) {
				self.getViewManager().getController().fireDataEvent('selectedFile', self.returnSelected());	
			}, this);
			
			item.addListener('click',  function (e) {
				if (!this._editing && !this._buttonSelectionActive) {
					if (this.isSelected() && this.getManager().getViewManager().isKeyPress()) {
						this.unselect();
					} else if (!this.isSelected() && this.getManager().getViewManager().isKeyPress()) {
						this.select();
					} else {
						if(e.getButton() == 'left') {
							this.resetAllSelected();
							this.select();
						}

					}
				}
				
				// In case our flag is true ... the click has popped, flag should return to false
				// Now we use the stop propagation to avoid the click on the manager
				e.stopPropagation();
				this._buttonSelectionActive = false;
			});

			item.addListener('dblclick', function () {
				var file = this.getFile();
				var absolutePath = file.getAbsolutePath();
				if (file.getType() == 'folder') {
					this.getManager().getViewManager().getController()._browsePath(absolutePath, true);
				} else {
					var checknum = this.getManager().getViewManager().getController().getApplication().getChecknum();
					eyeos.openFile(absolutePath, checknum);
				}
			});

			item.addListener('unselected', function () {
				var selected = item.getManager().returnSelected();
				if (selected.length == 0) {
					self.getViewManager().getController().fireDataEvent('directoryChanged', this.getViewManager().getModel().getCurrentPath()[1]);
				}
			}, this);
			
			var currentPath = this.getViewManager().getModel().getCurrentPath()[1];
			
			if (currentPath.substr(0, 8) != 'share://' && currentPath != 'workgroup:///') {
				item.getContextMenu().addListener('appear', function (e) {
					var childrens = this.getContextMenu().getChildren();
					var selected = this.getManager().returnSelected();
					for (var i = 0; i < childrens.length; ++i) {
						//						console.log(childrens[i]);
						childrens[i].setEnabled(true);
						if (childrens[i].getUserData('id') == 'pasteFile()' && this.getFile().getType() == 'file') {
							childrens[i].setEnabled(false);
						}

						if (childrens[i].getUserData('id') == 'editFile()' && selected.length >= 2) {
							childrens[i].setEnabled(false);
						}
					}
				}, item);

				item._layoutButtonSelection.addListener('click', function (e) {
					if (!this._editing) {
						if (this.isSelected()) {
							this.unselect();
						} else {
							this.select();
						}
						self.getViewManager().getController().fireDataEvent('selectedFile', self.returnSelected());

						// We have to set a flag due to stopPropagation doesn't work properly'
						// e.stopPropagation();
						item._buttonSelectionActive = true;
						e.stopPropagation();
					}
				}, item);

				item.addListener('contextmenu', function (e) {
					if (!this.isSelected()) {
						self.resetAllSelected();
						this.select();
					}
					e.stopPropagation();
				});

				item._layoutButtonMenu.addListener('click', function (e) {
					if (!this.isSelected()) {
						self.resetAllSelected();
						this.select();
					//this._layoutButtonMenu.setIcon('index.php?extern=images/arrow4.png');
					}
					e.stopPropagation();
				}, item);


				/**
				 * Drag and drop events
				 */

				item.addListener('dragstart', function (e) {

					e.addAction('move');

					// Multiple Selection on dragstart to select all the items

					var childrenList = this.getManager().getLayoutBase().getChildren();
					var alreadyDone = false;

					// If there is more than one we will select it

					for (var i = 0; i < childrenList.length; ++i) {
						if (childrenList[i].isSelected()) {
							childrenList[i].setDroppable(false);
							alreadyDone = true;
						}
					}

					// If not, do it now

					if (!alreadyDone) {
						this.select();
						this.setDroppable(false);
					}

					this.getManager().setDragging(true);

					var filesToMove = self.returnSelected();
					var currentPath = self.getViewManager ().getModel().getCurrentPath()[1];
					var filesToPreMove = new Array();

					for (var i = 0; i < filesToMove.length; ++i) {
						filesToPreMove.push(filesToMove[i]);
					}

					var filesQueue = eyeos.filesQueue.getInstance();
					filesQueue.fillDragQueue(filesToPreMove, currentPath);

				//					var rootChildrens = qx.core.Init.getApplication().getRoot().getChildren();
				//					for (var i = rootChildrens.length - 1; i >= 0; --i) {
				//						if (rootChildrens[i] instanceof qx.ui.core.DragDropCursor) {
				//							rootChildrens[i].getContentElement().resetSource();
				//							i = 0;
				//							//TO-DO: The 'replaced' image gets stuck sometimes
				//							//rootChildrens[i].getContentElement().setSource('qx/decoration/Modern/menu/checkbox.gif');
				//						}
				//					}
				});

				item.addListener('dragover', function (e) {
					this.getManager().setDragging(true);
					if (this.getManager().isDragging() && !this.isSelected() && this.getFile().getType() == 'folder') {
						var movingFile = e.getRelatedTarget();
						if (movingFile != null && movingFile instanceof eyeos.files.IconViewItem) {
							this.setDecorator(this._decoratorDragOver);
						}
					}
				});

				item.addListener('dragleave', function (e) {
					this.setDecorator(this._decoratorMouseOut);
				});

				item.addListener('dragend', function (e) {
					this.getManager().setDragging(false);
					this.getManager().getViewManager()._places.setDragging(false);
					this.getManager().getViewManager()._shared.setDragging(false);
					this.getManager().getViewManager()._workgroups.setDragging(false);
					this.getManager().getViewManager()._header.setDragging(false);
					this.setDecorator(this._decoratorMouseOut);
					this.resetAllSelected();
					var filesQueue = eyeos.filesQueue.getInstance();
					filesQueue.setDragQueue([]);
				});


				item.addListener('drop', function (e) {
					var item = e.getRelatedTarget();
					if(item instanceof eyeos.files.IconViewItem) {
						var droppedFile = item.getFile();
						var droppedPath;
						if (droppedFile.getType() == 'folder') {
							droppedPath = droppedFile.getAbsolutePath();
						} else {
							droppedPath = droppedFile.getPath();
						}
						if (this.getFile().getType() == 'folder') {
							if (droppedFile.getType() == 'folder' && droppedFile.getAbsolutePath() != this.getFile().getAbsolutePath() && droppedFile.getPath() != this.getFile().getAbsolutePath() && this.getFile().getAbsolutePath().search(new RegExp(droppedFile.getAbsolutePath(), 'gi')) == -1) {
								this.getManager().getViewManager().getController().specialMove(this.getFile().getAbsolutePath());
							}

							if (droppedFile.getType() != 'folder' && droppedFile.getPath() != this.getFile().getAbsolutePath()) {
								this.getManager().getViewManager().getController().specialMove(this.getFile().getAbsolutePath());
							}
						} else {
							var filesQueue = eyeos.filesQueue.getInstance();
							filesQueue.setDragQueue([]);
						}
						this.getManager().setDragging(false);
						e.stopPropagation();
					}
				});
			}
		},

		_buildLayout: function (e) {

			this._layoutBase = new qx.ui.container.Composite(new qx.ui.layout.Flow(5,5)).set({
				droppable: true,
				padding: 10,
				backgroundColor: '#FFFFFF',
				allowShrinkY: false,
				allowGrowX: true,
				allowGrowY: true
			});

			var borderMenu = new qx.ui.decoration.Single(1, 'solid', '#C3C3C3');
			this._menu = new qx.ui.menu.Menu().set({
				decorator: borderMenu,
				shadow: null,
				padding: 3,
				backgroundColor: '#F3F3F3'
			});

			var menu = this.self(arguments).MENU;
			
			for (var i = 0; i < menu.length; ++i) {
				var item = null;
				if (menu[i].id != 'separator') {
					item = new qx.ui.menu.Button(menu[i].label, menu[i].image);
					item.setUserData('id', menu[i].id);
					item._manager = this.getViewManager().getController();
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
						if (!qx.ui.core.Widget.contains(item, e.getRelatedTarget())) {
							this.setDecorator(null);
							this.setBackgroundColor(null);
						}
						
					});
					item.addListener('execute', function (e) {
						eval('this._manager.'+this.getUserData('id'));
					});
				} else {
					item = new qx.ui.menu.Separator();
				}
				this._menu.add(item);
			}
			
			this.add(this._layoutBase,  {
				flex: 1
			});
		},

		showBrowse: function () {
			this._layoutBase.removeAll();
			var files = this.reorder(this.getViewManager().getModel().getCurrentFiles());
			for (var i = 0; i < files.length; ++i) {
				var item = new eyeos.files.IconViewItem(this, files[i]);
				this._addItem(item);
			}
		},

		filterBrowse: function(filter) {
			this._layoutBase.removeAll();
			var files = this.reorder(this.getViewManager().getModel().getCurrentFiles());
			for (var i = 0; i < files.length; ++i) {
				if(files[i].getName().toUpperCase().indexOf(filter.toUpperCase()) >= 0) {
					var item = new eyeos.files.IconViewItem(this, files[i]);
					this._addItem(item);
				}
			}
		},

		reorder: function (filesToOrder) {
			var folders = new Array();
			var files = new Array();
			var filesOrdered = new Array();

			for (var i = 0; i < filesToOrder.length; ++i) {
				if (filesToOrder[i].getType() == 'folder') {
					folders.push(filesToOrder[i]);
				} else {
					files.push(filesToOrder[i]);
				}
			}


			filesOrdered = folders.concat(files);

			return filesOrdered;
		},

		returnAll: function () {
			return this._layoutBase.getChildren();
		},

		returnSelected: function () {
			var selected = new Array();
			var childrens = this._layoutBase.getChildren();
			for (var i = 0; i < childrens.length; ++i) {
				if (childrens[i].isSelected()) {
					selected.push(childrens[i]);
				}
			}
			return selected;
		},

		resetAllSelected: function () {
			var childrenList = this.returnSelected();
			for (var i = 0; i < childrenList.length; ++i) {
				if (childrenList[i].isSelected()) {
					childrenList[i].unselect();
					childrenList[i]._clicked = false;
				}
			}
		}
	},

	statics: {
		MENU: [
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
			label: tr('Paste'),
			image: 'index.php?extern=images/16x16/actions/edit-paste.png',
			id: 'pasteFile()'
		}
		],

		MENU_ALTERNATIVE: [
		{
			label: tr('Open'),
			image: 'index.php?extern=images/16x16/actions/document-open.png',
			id: 'openFile()'
		}, {
			label: tr('Copy'),
			image: 'index.php?extern=images/16x16/actions/edit-copy.png',
			id: 'copyFile()'
		}, {
			label: tr('Download'),
			image: 'index.php?extern=images/16x16/actions/go-down.png',
			id: 'downloadFile()'
		}
		]
	}
});


