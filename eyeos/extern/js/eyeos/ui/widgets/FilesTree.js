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
qx.Class.define('eyeos.ui.widgets.FilesTree', {
	extend: qx.ui.tree.Tree,
	
	/**
	 * @param int appChecknum The checknum of the parent application.
	 */
	construct: function (appChecknum) {
		arguments.callee.base.call(this);
		if (!appChecknum) {
			throw '[eyeos.ui.widgets.LocationComboBox] Missing appChecknum argument';
		}
		this._checknum = appChecknum;
		
		// ## TODO ##
		/*if (initialPath) {
			this.setValue(initialPath);
		} else {
			this.setValue('');
		}*/
		
		this.__init();
	},
	
	properties: {
		path: {
			init: '',
			check: 'String',
			apply: '_applyPath',
			event: 'changePath'
		},
		
		fetchDepth: {
			init: 1,
			check: function(v) {  return v >= 0; }
		},
	},
	
	members: {
		
		_checknum: null,
		_isReady: false,
		
		
		__init: function() {			
			this.set({
				enabled: this._isReady
			});
			
			this.setRoot(new qx.ui.tree.TreeFolder('root')).set({
				selectable: false,
				open: true,
				icon: 'index.php?extern=/images/16x16/mimetypes/inode-directory.png'
			});
			
			this.addListener('appear', function(e) {
				eyeos.callMessage(this._checknum, '__FileSystem_getFilesAsTree', {leaf: this.getPath(), options: {depth: this.getFetchDepth()}}, function(data) {
					this._buildFoldersTree(this.getRoot(), data);
					this.setEnabled(true);
				}, this);
			}, this);
		},
		
		_applyPath: function(value, old) {
			//TODO
			eyeos.consoleWarn('FilesTree.setPath() NOT IMPLEMENTED');
		},
		
		_buildFoldersTree: function(rootFolder, foldersData) {
			var that = this;
			foldersData.forEach(function(folderData, i) {
				var subFolder = new qx.ui.tree.TreeFolder(folderData.name).set({
					model: folderData,
					open: that.getPath().indexOf(folderData.absolutepath) != -1 ? true : false,
					icon: 'index.php?extern=/images/16x16/mimetypes/inode-directory.png'
				});
				
				subFolder.addListener('click', function(e) {
					that.setPath(subFolder.getModel().absolutepath);
				}, that);
				
				// The tree continues but the items have not been loaded
				if (folderData.subFolders === false) {
					subFolder.setOpenSymbolMode('always');
					
					subFolder.addListenerOnce('changeOpen', function(e) {
						if (e.getData()) {
							subFolder.setEnabled(false);
							
							// Load subfolders
							eyeos.callMessage(that._checknum, '__FileSystem_getFilesAsTree', {
								roots: [folderData['absolutepath']],
								options: {includeRoot: 'false', depth: this.getFetchDepth()}
							}, function(data) {
								that._buildFoldersTree(subFolder, data);
								subFolder.setEnabled(true);
								subFolder.setOpenSymbolMode('auto');
							}, this);
						}
					}, that);
				}
					
				if (folderData.subFolders instanceof Array && folderData.subFolders.length > 0) {
					that._buildFoldersTree(subFolder, folderData.subFolders);
				}
				rootFolder.add(subFolder);
			});
		}
	}
});