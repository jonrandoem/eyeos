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

qx.Class.define('eyeos.files.IconViewItem', {

	extend: qx.ui.core.Widget,

	construct: function (manager, file) {
		
		this.base(arguments);

		// EXTENSIONS
		this._imageExtensions = ['JPG', 'JPEG', 'PNG', 'GIF'];
		this._videoExtensions = ['FLV'];
		this._musicExtensions = ['MP3', 'M4A'];
		this._docExtensions = ['DOC', 'TXT', 'XLS', 'ODS', 'EDOC'];
		this._zipExtensions = ['ZIP'];

		// Reference and parent objects
		this.setManager(manager);
		this.setFile(file);
		this.setCurrentPath(this.getManager().getViewManager().getModel().getCurrentPath()[1]);
		// Layout and listeners
		this._buildLayout();
		this._addListeners();

		var filesQueue = eyeos.filesQueue.getInstance();

		if (this.getFile().isCutted() && filesQueue.getMoveQueue().indexOf(this.getFile())) {
			this.unselect();
			this.set({
				draggable: false,
				enabled: false,
				focusable: false,
				opacity: 0.5
			});
		} else if (this.getFile().isCutted() && !filesQueue.getMoveQueue().indexOf(this.getFile())) {
			this.getFile().setCutted(false);
		}
	},

	properties: {
		manager: {
			check: 'Object'
		},

		file: {
			check: 'Object'
		},

		currentPath: {
			check: 'String',
			init: null
		}
	},

	members: {
		_activeMenu: false,
		_editing: false,
		_file: null,
		_manager: null,
		_controller: null,
		_decoratorMouseOut: new qx.ui.decoration.Single(1, 'solid', 'transparent'),
		_decoratorMouseOver: new qx.ui.decoration.Single(1, 'solid', '#D3D3D3'),
		_decoratorMouseSelected: new qx.ui.decoration.Single(1, 'solid', '#ADCDF2').set({backgroundColor: '#EFF5FC'}),
		_decoratorDragOver: new qx.ui.decoration.Single(1, 'solid', '#74a100').set({backgroundColor: '#b9d07f'}),
		_layoutIcon: null,
		_layoutButtonSelection: null,
		_layoutButtonMenu: null,
		_selected: false,
		
		_buildLayout: function () {

			this.set({
				draggable: true,
				droppable: true,
				padding: 0,
				width: 95,
				height: 95
			});

			this.addListener('dragstart', function(e) {
				var x = e.getDocumentLeft();
				var y = e.getDocumentTop();
				y = y - 30;
				x = x + 1;
				this.clipImage = e.getTarget()._itemImage.clone();
				this.clipImage.setOpacity(0.5);
				document.eyeDesktop.add(this.clipImage);
				this.clipImage.set({
					zIndex: 100003
				});
				this.clipImage.setMarginTop(y);
				this.clipImage.setMarginLeft(x);
			}, this);

			this.addListener('drag', function(e) {
				var x = e.getDocumentLeft();
				var y = e.getDocumentTop();
				y = y - 30;
				x = x + 1;
				this.clipImage.setMarginTop(y);
				this.clipImage.setMarginLeft(x);
			}, this);

			this.addListener('dragend', function(e) {
				this.clipImage.destroy();
			}, this);

			var layout = new qx.ui.layout.Canvas();
			this._setLayout(layout);

			if (this.getCurrentPath() != 'share:///' && this.getCurrentPath() != 'workgroup:///') {
				var menu;
				if (this.getCurrentPath().substr(0, 8) != 'share://' && this.getCurrentPath() != 'workgroup://') {
					menu = [
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
							label: tr('Cut'),
							image: 'index.php?extern=images/16x16/actions/edit-cut.png',
							id: 'cutFile()'
						}, {
							label: tr('Copy'),
							image: 'index.php?extern=images/16x16/actions/edit-copy.png',
							id: 'copyFile()'
						}, {
							label: tr('Paste'),
							image: 'index.php?extern=images/16x16/actions/edit-paste.png',
							id: 'pasteFile()'
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
				} else {
					menu = [
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
							image: 'index.php?extern=images/16x16/actions/edit-paste.png',
							id: 'downloadFile()'
						}
					];
				}

				var borderMenu = new qx.ui.decoration.Single(1, 'solid', '#C3C3C3');
				this._menu = new qx.ui.menu.Menu().set({
					decorator: borderMenu,
					shadow: null,
					padding: 3,
					backgroundColor: '#F3F3F3'
				});

				for (var i = 0; i < menu.length; ++i) {
					var item = null;
					if (menu[i].id != 'separator') {
						item = new qx.ui.menu.Button(menu[i].label, menu[i].image);
						item.setUserData('id', menu[i].id);
						item._manager = this.getManager().getViewManager().getController();
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
							eval('this._manager.'+this.getUserData('id'));
						});
					} else {
						item = new qx.ui.menu.Separator();
					}
					this._menu.add(item);
				}

				this.setContextMenu(this._menu);

				this._layoutButtonSelection = new qx.ui.form.Button(null, null).set({
					padding: 0,
					margin: 0,
					decorator: null
				});
				this._add(this._layoutButtonSelection, {
					left: 5,
					top: 5
				});
				this._layoutButtonMenu = new qx.ui.form.MenuButton(null, null, this._menu).set({
					padding: 0,
					margin: 0,
					decorator: null
				});
				this._add(this._layoutButtonMenu, {
					right: 5,
					top: 5
				});

			}

			this._itemImage = new qx.ui.basic.Image().set({
				width: 48,
				height: 48,
				allowGrowY: false,
				allowGrowX: false,
				scale: true
			});

			this.updateImage();

                        var name = this.getFile().getName();
                        if(this.getFile().getExtension() == 'LNK') {
                            name = name.substr(0, name.length-4);
                        }
			this._itemLabel = new qx.ui.basic.Label().set({
				value: name,
				rich: true,
				width: 83,
				maxHeight: 40,
				textAlign: 'center'
			});

			this._itemInput = new qx.ui.form.TextField(this.getFile().getName()).set({
				width: 83,
				maxHeight: 40
			});



			this._add(this._itemImage, {top: 10, left: 20});
			this._add(this._itemLabel, {top: 60, left: 5});
			this._add(this._itemInput, {top: 60, left: 5});
			this._itemInput.setVisibility('excluded');

			this._itemInput.addListener('mousedown', function(e) {
				e.stopPropagation();
			}, this);
			this.setDecorator(this._decoratorMouseOut);
		},

		updateImage: function () {
			var image = null;
			if (this.getFile().getType() == 'folder') {
				if(this.getFile().getUserData('sharedByContacts') || this.getManager().getViewManager().getModel().getCurrentPath()[1].substr(0,8) == 'share://') {
					var checknum = this.getManager().getViewManager().getController().getApplication().getChecknum();
					image = 'index.php?checknum=' + checknum + '&message=__UserInfo_getAvatarPicture&params[userName]=' + this.getFile().getName();
					if (this.getFile().getContentSize() > 0) {
						this._add(new qx.ui.basic.Image('index.php?extern=images/shared_on.png').set({zIndex: 20}), {top: 50, left: 17});
					}
					
				} else if (this.getFile().getContentSize() == 0) {
					image = 'index.php?extern=images/48x48/places/folder.png';
				} else {
					image = 'index.php?extern=images/48x48/places/folder-documents.png';
				}
			} else {
				if (this._docExtensions.indexOf(this.getFile().getExtension()) != -1) {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/application-msword.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/application-msword.png';
					}
				} else if (this._imageExtensions.indexOf(this.getFile().getExtension()) != -1) {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/imatge.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/image-x-generic.png';
					}
				} else if (this._musicExtensions.indexOf(this.getFile().getExtension()) != -1) {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/audio.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/audio-x-generic.png';
					}
				} else if (this._videoExtensions.indexOf(this.getFile().getExtension()) != -1) {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/video.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/audio-vnd.rn-realvideo.png';
					}
				} else if (this._zipExtensions.indexOf(this.getFile().getExtension()) != -1) {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/zip.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/application-x-gzip.png';
					}
				} else if(this.getFile().getExtension() == 'LNK') {
					var info = qx.util.Json.parse(this.getFile().getContent());
					image = info.icon;
				} else if(this.getFile().getExtension() == 'PDF') {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/pdf.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/application-pdf.png';
					}
					
				}else {
					if(this.getFile().getShared() != 0) {
						image = 'index.php?extern=images/iconsshared/unknown.png';
					} else{
						image = 'index.php?extern=images/48x48/mimetypes/application-x-zerosize.png';
					}
				}
			}
			image = image + '&nocache=' + eyeos.utils.getRandomValue();
			this._itemImage.setSource(image);
		},

		_addListeners: function () {	

			this.addListener('mouseover', function (e) {
				if (!this.isSelected() && !this.getManager().isDragging() && this.isEnabled()) {
					this.setDecorator(this._decoratorMouseOver);
//					if (this.getCurrentPath() != 'share:///' && this.getCurrentPath() != 'workgroup:///') {
//						//this._layoutButtonSelection.setIcon('index.php?extern=images/add1.png');
//						//this._layoutButtonMenu.setIcon('index.php?extern=images/arrow1.png');
//					}
				}
			});

			this.addListener('mouseout', function (e) {
				if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())) {
					if (!this.isSelected() && !this.getManager().isDragging()) {
						this.setDecorator(this._decoratorMouseOut);
//						if (this.getCurrentPath() != 'share:///' && this.getCurrentPath() != 'workgroup:///') {
//							//this._layoutButtonSelection.setIcon(null);
//							//this._layoutButtonMenu.setIcon(null);
//						}
					}
				}
			});

			if (this.getCurrentPath() != 'share:///' && this.getCurrentPath() != 'workgroup:///') {
				this._itemInput.addListener('keypress', function (e) {
					if (e.getKeyIdentifier() == 'Enter') {
						this._itemInput.exclude();
					} else if (e.getKeyIdentifier() == 'Escape') {
						this.cancelEdit();
					}
				}, this);

				this._itemInput.addListener('blur', function (e) {
					this.save();
				}, this);
			}
		},

		save: function () {
			if (this.getFile().getType() == 'file') {
				var fileAtInput = this._itemInput.getValue();
				var fileAtInputSplitted = fileAtInput.split('.');
				var extension = fileAtInputSplitted[fileAtInputSplitted.length - 1];
				if (extension != '' && extension != null && fileAtInputSplitted.length >= 2) {
					if (extension.toUpperCase() != this.getFile().getExtension()) {
						var optionPane = new eyeos.dialogs.OptionPane(
							tr("Are you sure you want to change the extension to the file?"),
							eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
							eyeos.dialogs.OptionPane.YES_NO_CANCEL_OPTION);
						var dialog = optionPane.createDialog(this.getManager().getViewManager(), "Files", function(result) {
							if (result == 1) {
								this.getFile().setExtension(extension.toUpperCase());
								this.getManager().getViewManager().getController().renameFile(this._itemInput.getValue(), this._itemLabel);
							}
						}, this);
						dialog.open();
					} else {
						this.getManager().getViewManager().getController().renameFile(this._itemInput.getValue(), this._itemLabel, this);
					}
				} else {
					var optionPane = new eyeos.dialogs.OptionPane(
						tr("Are you sure you want to leave the file without extension?"),
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_CANCEL_OPTION);
					var dialog = optionPane.createDialog(this.getManager().getViewManager(), "Files", function(result) {
						if (result == 1) {
							this.getFile().setExtension(null);
							this.getManager().getViewManager().getController().renameFile(this._itemInput.getValue(), this._itemLabel);
						}
					}, this);
					dialog.open();
				}
			} else {
				this.getManager().getViewManager().getController().renameFile(this._itemInput.getValue(), this._itemLabel);
			}
			
			this.cancelEdit();
		},

		resetAllSelected: function (params) {
			var childrenList = this.getManager().getLayoutBase().getChildren();
			for (var i = 0; i < childrenList.length; ++i) {
				if (childrenList[i].isSelected()) {
					if (params == 'dragend') {
						childrenList[i].setDroppable(true);
					} else if (params == 'drop') {
						childrenList[i].destroy();
					} else {
						childrenList[i].unselect();
					}
				}
			}
		},

		setSelected: function (value) {
			this._selected = value
		},

		isSelected: function () {
			return this._selected;
		},

		getName: function () {
			return this._itemLabel.getValue();
		},

		getCurrentPanel: function () {
			return this._currentPanel;
		},

		setCurrentPanel: function (panel) {
			this._currentPanel = panel;
		},

		edit: function () {
			this._editing = true;
			this._itemInput.setValue(this._itemLabel.getValue());
			this._itemLabel.setVisibility('excluded');
			this._itemInput.setVisibility('visible');
			this._itemInput.focus();
			this._itemInput.addListener('focusin', function (e) {
				this.setTextSelection(0, this.getValue().lastIndexOf('.'));
				//this.selectAllText();
			});
		},

		cancelEdit: function () {
			this._editing = false;
			this._itemLabel.setVisibility('visible');
			this._itemInput.setVisibility('excluded');
		},

		select: function () {
			this.setDecorator(this._decoratorMouseSelected);
			if (this.getCurrentPath() != 'share:///' && this.getCurrentPath() != 'workgroup:///') {
				this._layoutButtonSelection.setIcon('index.php?extern=images/less2.png');
				this._layoutButtonMenu.setIcon('index.php?extern=images/arrow3.png');
			}
			this.setSelected(true);
			this.fireEvent('selected');
		},

		unselect: function () {
			this._editing = false;
			this._selected = false;
			this._activeMenu = false;
			this._itemLabel.setVisibility('visible');
			this._itemInput.setVisibility('excluded');
			this.setDecorator(this._decoratorMouseOut);
			if (this.getCurrentPath() != 'share:///' && this.getCurrentPath() != 'workgroup:///') {
				this._layoutButtonSelection.setIcon(null);
				this._layoutButtonMenu.setIcon(null);
			}
			this.setSelected(false);

			this.fireEvent('unselected');
		}
	}
});


