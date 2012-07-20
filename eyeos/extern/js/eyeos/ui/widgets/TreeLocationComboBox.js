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

/**
 * TODO
 */
qx.Class.define('eyeos.ui.widgets.TreeLocationComboBox', {
	extend: qx.ui.form.ComboBox,
	
	/**
	 * @param int appChecknum The checknum of the parent application.
	 */
	construct: function (appChecknum, initialPath) {
		arguments.callee.base.call(this);
		if (!appChecknum) {
			throw '[eyeos.ui.widgets.LocationComboBox] Missing appChecknum argument';
		}
		this._checknum = appChecknum;
		
		// Remove listener installed by the parent class (too restrictive)...
		this.removeListener('blur', this.close, this);
		// ...and replace it with a more adapted one
		this.addListener('blur', function(e) {
			if(e.getRelatedTarget() instanceof qx.ui.tree.Tree) {
				this.fireDataEvent('changeValue', e.getRelatedTarget().getSelection()[0].getLabel());
			}
			
			if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())
				&& !qx.ui.core.Widget.contains(this.getChildControl('popup'), e.getRelatedTarget())) {
				this.close();
			}
		}, this);
		
		if (initialPath) {
			this.setValue(initialPath);
		} else {
			this.setValue('');
		}
		
		this.__init();
	},
	
	members: {
		
		_checknum: null,
		_isReady: false,
		
		
		__init: function() {			
			this.set({
				enabled: this._isReady
			});
			
			eyeos.callMessage(this._checknum, '__FileSystem_getFilesAsTree', {leaf: this.getValue(), options: {depth: 1}}, function(data) {
				this._loadFolders(this.getChildControl('list').getRoot(), data);
				this.setEnabled(true);
			}, this);
		},
		
		// overridden
		_createChildControlImpl : function(id) {
			var control;
		
			switch(id) {
				case 'list':
					/**
					 * TODO: This FilesTree should be moved outside of this class in order to
					 * be reusable by more components and/or applications.
					 */
					control = new qx.ui.tree.Tree().set({
						quickSelection: true
					});
					
					var root = new qx.ui.tree.TreeFolder('root').set({
						open: true,
						icon: 'index.php?extern=/images/16x16/mimetypes/inode-directory.png'
					});
					control.setRoot(root);
					
					control.addListener('blur', this.close, this);
					break;
					
				case 'popup':
					control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
					control.setAutoHide(false);
					control.setKeepActive(true);
					control.add(this.getChildControl('list'));
					
					control.addListener('blur', this.close, this);
					control.addListener('changeVisibility', this._onPopupChangeVisibility, this);
					break;
			}
			
			return control || this.base(arguments, id);
		},
		
		_loadFolders: function(treeFolder, foldersData) {
			var that = this;
			foldersData.forEach(function(folderData, i) {
				var subFolder = new qx.ui.tree.TreeFolder(folderData.name).set({
					model: folderData,
					open: that.getValue().indexOf(folderData.absolutepath) != -1 ? true : false,
					icon: 'index.php?extern=/images/16x16/mimetypes/inode-directory.png'
				});

				subFolder.addListener('click', function(e) {
					that.setValue(subFolder.getModel().absolutepath);
					that.close();
				}, that);
				
				// The tree continues but the items have not been loaded
				if (folderData.subFolders === false) {
					subFolder.setOpenSymbolMode('always');
					
					subFolder.addListener('changeOpen', function(e) {
						if (e.getData()) {
							subFolder.setEnabled(false);
							
							// Load subfolders
							eyeos.callMessage(that._checknum, '__FileSystem_getFilesAsTree', {
								roots: [folderData['absolutepath']],
								options: {includeRoot: 'false', depth: 1}
							}, function(data) {
								that._loadFolders(subFolder, data);
								subFolder.setEnabled(true);
								subFolder.setOpenSymbolMode('auto');
							}, this);
						}
					}, that);
				}
					
				if (folderData.subFolders instanceof Array && folderData.subFolders.length > 0) {
					that._loadFolders(subFolder, folderData.subFolders);
				}
				treeFolder.add(subFolder);
			});
		},
		
		// overridden
		_onPopupChangeVisibility : function(e) {
			var popup = this.getChildControl('popup');
			if (!popup.isVisible()) {
				this.tabFocus();
			}
			
			// In all cases: Remove focused state from button
			this.getChildControl('button').removeState('selected');
		},
		
		// overridden
		_onTextFieldChangeValue : function(e) {
			var value = e.getData();

//			if (this._isReady) {
//				var valueUrlParts = eyeos.utils.ParseUri.parse(value);
//
//				var treeRoot = this.getChildControl('list').getChildren()[0];
//
//				var found = false;
//				var schemeFound = false;
//				var nodes = treeRoot.getChildren();		//root's children
//				var currentNode;
//				while (nodes.length > 0 && !found) {
//					currentNode = nodes.shift();
//
//					var currentNodeUrlParts = eyeos.utils.ParseUri.parse(currentNode.getModel().absolutepath);
//					if (currentNodeUrlParts.protocol.toLowerCase() == valueUrlParts.protocol.toLowerCase()) {
//						schemeFound = true;
//					}
//
//					// The current node seems to lead to the path represented by the new value of the textfield
//					if (value.indexOf(currentNode.getModel().absolutepath) === 0) {
//						currentNode.setOpen(true);
//						if (value == currentNode.getModel().absolutepath) {
//							found = true;
//						} else {
//							nodes = currentNode.getChildren();
//						}
//					}
//				}
//
//				if (!found && !schemeFound) {
//					var newSchemeRoot = new qx.ui.tree.TreeFolder(valueUrlParts.protocol + '://').set({
//						model: {
//							absolutepath: valueUrlParts.protocol + '://'
//						},
//						icon: 'index.php?extern=/images/16x16/mimetypes/inode-directory.png'
//					});
//					treeRoot.add(newSchemeRoot);
//
//
//				}
//			}

			// Fire event
			this.fireDataEvent('changeValue', value, e.getOldData());
		}
	}
});