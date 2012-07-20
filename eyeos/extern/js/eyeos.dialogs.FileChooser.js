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
 * 
 * TO BE MERGED WITH EYEOS.DIALOGS.DIALOG
 */
qx.Class.define('eyeos.dialogs.FileChooser', {
	extend: qx.core.Object,
	
	statics: {
		CANCEL_OPTION: 0,	
		APPROVE_OPTION: 1,
		
		DEFAULT_WIDTH: 500,
		DEFAULT_HEIGHT: 330,
		MIN_HEIGHT: 330,
		MIN_WIDTH: 500,
		
		OPEN_DIALOG: 0,
		SAVE_DIALOG: 1,
		SELECT_FOLDER_DIALOG: 2,
		
		DEFAULT: 2,
		FOLDERS_ONLY: 1,			//@see AdvancedPathLib::GLOB_ONLY_DIR
		DIR_IGNORE_PATTERN: 2,
		CASE_INSENSITIVE: 16,
		FORCE_EXTENSION: 128
	},
	
	construct: function (appChecknum) {
		arguments.callee.base.call(this);
		this._checknum = appChecknum;
	},
	
	properties: {
		destroyOnClose: {
			init: true,
			check: 'Boolean'
		},
		
		/**
		 * Example:
		 * [
		 * 		{
		 * 			// The description, displayed to the user
		 * 			desc: "Images",
		 * 			
		 * 			// The list of patterns matching the required filetype
		 * 			patterns: ["*.gif", "*.jpg", "*.png"],
		 * 			
		 * 			// If present, the following extension will be automatically appended to the filename if none has been
		 * 			//provided by the user (only when a saving file)
		 * 			[defaultExt: 'jpg']
		 * 		}, {
		 * 			desc: "Configuration files",
		 * 			patterns: ["config.*"]
		 * 		},
		 * 		...
		 * ]
		 */
		filters: {
			init: [],
			check: 'Array'
		},
		
		acceptAllFile: {
			init: true,
			check: 'Boolean'
		},
		
		fileSelectionMode: {
			init: 'all',
			check: ['files', 'directories']
		}
	},
			
	members: {
		
		browseOptions: 0,
		
		_checknum: null,
		_window: null,
		
		_type: null,
		_currentPath: '',
		_selectedRow: null,
		_browseInProgress: false,
		
		//components
		_pathsList: null,
		_filesTable: null,
		_filenameTextField: null,
		_filetypeSelectBox: null,
		_okButton: null,
		
		//arguments
		_callback: null,
		_callbackContext: null,
		
		
		_browsePath: function(path) {
			if (this._browseInProgress) {
				eyeos.consoleWarn('[eyeos.dialogs.FileChooser] _browsePath(): Operation already in progress, aborting.');
				return;
			}
			this._browseInProgress = true;
			
			if(!path) {
				path = this._currentPath;
			}
			
			var patterns = this._filetypeSelectBox.getSelection()[0].getModel().patterns;
			
			this._window.setEnabled(false);
			eyeos.callMessage(
				this._checknum,													//checknum
				'__FileSystem_browsePath',										//signal
				new Array(path, patterns, this.browseOptions),					//params
				this._browsePath_callback,										//callback
				this,															//callback context
				{																//options
					onException: function(data) {
						this._browsePath_callback(data, true);
					},
					timeout: 12000
				}
			);
		},
		
		_browsePath_callback: function(returnData, error) {
			if (error) {
				this._window.setEnabled(true);
				this._browseInProgress = false;
				return;
			}
			
			this._currentPath = returnData['absolutepath'];
			
			this._selectedRow = null;
			this._pathsList.setValue(returnData['absolutepath']);
			
			var data = new Array();
			for(var i = 0; i < returnData['files'].length; i++) {
				var iconUrl;
				if (returnData['files'][i]['type'] == 'folder') {
					iconUrl = 'index.php?extern=images/16x16/mimetypes/inode-directory.png';
				} else {
					iconUrl = 'index.php?extern=images/16x16/mimetypes/application-x-zerosize.png';
				}
				data[i] = new Array(
						'<img src="' + iconUrl + '" />',			//Image renderer does not work (why?)
						returnData['files'][i]['name'],
						returnData['files'][i]['extension'],
						returnData['files'][i]['size'],
						returnData['files'][i]['owner'],
						returnData['files'][i]['permissions'],
						returnData['files'][i]['absolutepath'],
						returnData['files'][i]['type']
				);
			}

			this._filesTable.getSelectionModel().resetSelection();
			this._filesTable.getTableModel().setData(data);
			
			this._window.setEnabled(true);
			this._browseInProgress = false;
		},
		
		_browseParentPath: function() {
			if (this._browseInProgress) {
				eyeos.consoleWarn('[eyeos.dialogs.FileChooser] _browseParentPath(): Operation already in progress, aborting.');
				return;
			}
			this._browseInProgress = true;
			this._window.setEnabled(false);
			
			var patterns = this._filetypeSelectBox.getSelection()[0].getModel().patterns;
			
			eyeos.callMessage(
				this._checknum,													//checknum
				'__FileSystem_browseParentPath',								//signal
				new Array(this._currentPath, patterns, this.browseOptions),		//params
				this._browsePath_callback,										//callback
				this,															//callback context
				{																//options
					onException: function(data) {
						this._browsePath_callback(data, true);
					},
					timeout: 12000
				}
			);
		},
		
		_getWindow: function(title, icon) {
			this._window = new qx.ui.window.Window(title, icon).set({
				//modal: true,
				showMinimize: false,
				showMaximize: false,
				width: this.self(arguments).DEFAULT_WIDTH,
				height: this.self(arguments).DEFAULT_HEIGHT,
				contentPadding: 3,
				minWidth: this.self(arguments).MIN_WIDTH,
				minHeight: this.self(arguments).MIN_HEIGHT,
				enabled: false
			});
			
			var windowLayout = new qx.ui.layout.VBox(5);
			this._window.setLayout(windowLayout);
			
			
			//
			// 1st box (paths list, home, create new folder, ...)
			//
			var firstBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({alignY: 'middle'}));
			var folderLabel = new qx.ui.basic.Label('Folder:').set({paddingLeft: 2});
			firstBox.add(folderLabel);
			
			this._pathsList = new eyeos.ui.widgets.TreeLocationComboBox(this._checknum);
			this._pathsList.addListener('changeValue', this._onPathChangeValue, this);
			firstBox.add(this._pathsList, {flex: 1});
			
			var parentFolderButton = new qx.ui.form.Button(null, 'index.php?extern=images/16x16/actions/go-up.png');
			parentFolderButton.addListener('execute', this._browseParentPath, this);
			firstBox.add(parentFolderButton);
			var homeButton = new qx.ui.form.Button(null, 'index.php?extern=images/16x16/places/user-home.png');
			homeButton.addListener('execute', function(e) {
				this._browsePath('home://');
			}, this);
			firstBox.add(homeButton);
			var newFolderButton = new qx.ui.form.Button(null, 'index.php?extern=images/16x16/actions/folder-new.png');
			newFolderButton.addListener('execute', this._onNewFolderButtonClick, this);
			firstBox.add(newFolderButton);
			var uploadButton = new qx.ui.form.Button(null, 'index.php?extern=images/eyefiles/upload.png');
			firstBox.add(uploadButton);

			// FIXME: workaround, must be solved better...
			var bus = eyeos.messageBus.getInstance();
			uploadButton.addListener('execute', function() {
				eyeos.execute('upload', this._checknum, [this._currentPath]);
				this._window.setVisibility('excluded');
				bus.send('fileChooser', 'hideModal');
			}, this);

			bus.addListener('eyeos_upload_uploadFinished', function() {
				this._window.setVisibility('visible');
				bus.send('fileChooser', 'showModal');
			}, this);
			
			bus.addListener('eyeos_upload_uploadClosed', function() {
				this._window.setVisibility('visible');
				bus.send('fileChooser', 'showModal');
			}, this);
			
			this._window.add(firstBox);
			
			
			//
			// 2nd box (files list)
			//
			var secondBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			var tableModel = new qx.ui.table.model.Simple();
			tableModel.setColumns(new Array('',
			                       'Name',
			                       'Extension',
			                       'Size (B)',
			                       'Owner',
			                       'Permissions',
			                       'absolutepath(hidden)',
			                       'type(hidden)'
			));
			
			var custom = {
				tableColumnModel: function(obj) {
					return new qx.ui.table.columnmodel.Basic(obj);
				}
			};
			this._filesTable = new qx.ui.table.Table(tableModel, custom).set({
				columnVisibilityButtonVisible: false,
				statusBarVisible: false,
				showCellFocusIndicator: false
			});
			
			//var iconRenderer = new qx.ui.table.cellrenderer.Image(16, 16);		// does not work
			var iconRenderer = new qx.ui.table.cellrenderer.Html();
			var tcm = this._filesTable.getTableColumnModel();
			tcm.setDataCellRenderer(0, iconRenderer);
			tcm.setColumnWidth(0, 28);
			tcm.setColumnWidth(1, 160);
			tcm.setCellEditorFactory(1, new qx.ui.table.celleditor.TextField());
			tcm.setColumnWidth(2, 70);
			tcm.setColumnVisible(6, false);
			tcm.setColumnVisible(7, false);
			
			this._filesTable.addListener('cellClick', this._onCellClick, this);
			this._filesTable.addListener('cellDblclick', this._onCellDblClick, this);
			secondBox.add(this._filesTable, {flex: 1});
			
			this._window.add(secondBox, {flex: 1});
			
			
			//
			// 3rd box (Selected filename, filetypes combo)
			//
			var thirdBox = new qx.ui.container.Composite(new qx.ui.layout.Grid(3, 3));
			thirdBox.getLayout().setColumnFlex(1, 1);
			var filenameLabel = new qx.ui.basic.Label('File name:').set({paddingLeft: 2});
			thirdBox.add(filenameLabel, {column: 0, row: 0});
			this._filenameTextField = new qx.ui.form.TextField();
			this._filenameTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._validateSelection();
				}
			}, this);
			thirdBox.add(this._filenameTextField, {column: 1, row: 0});
			
			var filetypesLabel = new qx.ui.basic.Label('Files of type:').set({paddingLeft: 2});
			thirdBox.add(filetypesLabel, {column: 0, row: 1});
			this._filetypeSelectBox = new qx.ui.form.SelectBox();
			
			var filters = this.getFilters();
			var item = null;
			for(var i = 0; i < filters.length; i++) {
				if(filters[i] != undefined) {
					var label = filters[i].desc + ' (';
					for(var j = 0; j < filters[i].patterns.length; j++) {
						label += filters[i].patterns[j] + ', ';
					}
					label = label.substr(0, label.length - 2);
					label += ')';

					item = new qx.ui.form.ListItem(label).set({
						model: filters[i]
					});
					this._filetypeSelectBox.add(item);

					if (i == 0) {
						this._filetypeSelectBox.setSelection([item]);
					}
				}
			}
			if (this.isAcceptAllFile()) {
				item = new qx.ui.form.ListItem('All Files (*)').set({
					model: {patterns: ['*']}
				});
				this._filetypeSelectBox.add(item);
				
				if (filters.length == 0) {
					this._filetypeSelectBox.setSelection([item]);
				}
			}
			this._filetypeSelectBox.addListener('changeValue', function(e) {
				this._browsePath();
			}, this);
			
			thirdBox.add(this._filetypeSelectBox, {column: 1, row: 1});
			
			this._window.add(thirdBox);
			
			
			//
			// 4th box (Ok / Cancel buttons)
			//
			var fourthBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(3));
			var spacer = new qx.ui.core.Spacer(50);
			fourthBox.add(spacer, {flex: 5});
			var cancelButton = new qx.ui.form.Button('Cancel');
			cancelButton.addListener('execute', function(e) {
				if (this._callback != null) {
					this._callback.call(this._callbackContext, eyeos.dialogs.FileChooser.CANCEL_OPTION);
				}
				this.close();
			}, this);
			fourthBox.add(cancelButton, {flex: 1});
			this._okButton = new qx.ui.form.Button('Ok');
			this._okButton.addListener('execute', this._validateSelection, this);
			fourthBox.add(this._okButton, {flex: 1});
			
			this._window.add(fourthBox);
			
			this._browsePath(this._currentPath);

			var dBus = eyeos.messageBus.getInstance();
			dBus.addListener('eyeos_file_uploadComplete', function (e) {
				this._browsePath(this._currentPath);
			}, this);

			return this._window;
		},
		
		_onCellClick: function(e) {
			var row = this._filesTable.getTableModel().getData()[e.getRow()];
			var filename = row[1];

			// workaround: needs to avoid setting the textField with a directory label...
			if(row[0] != '<img src="index.php?extern=images/16x16/mimetypes/inode-directory.png" />') {
				this._filenameTextField.setValue(filename);
			}
			
			this._selectedRow = row;
		},
		
		_onCellDblClick: function(e) {
			var row = this._filesTable.getTableModel().getData()[e.getRow()];
			var absolutePath = row[6];
			var type = row[7];
			
			if (type == 'folder') {
				this._browsePath(absolutePath);
			} else {
				this._validateSelection();
			}
		},
		
		_onNewFolderButtonClick: function(e) {
			this._filesTable.setShowCellFocusIndicator(true);
			this._filesTable.addListenerOnce('dataEdited', this._onNewFolder_doCreate, this);
			var tableModel = this._filesTable.getTableModel();
			tableModel.addRows(
				[['', 'New folder', '', '', '', '', '', '', '']],
				0
			);
			tableModel.setColumnEditable(1, true);
			this._filesTable.setFocusedCell(1, 0);
			this._filesTable.scrollCellVisible(1, 0);
			this._filesTable.startEditing();
		},
		
		_onNewFolder_doCreate: function(e) {
			this._filesTable.setShowCellFocusIndicator(false);
			var tableModel = this._filesTable.getTableModel();
			tableModel.setColumnEditable(1, true);
			
			var newFolderName = e.getData().value;
			eyeos.callMessage(
				this._checknum,
				'__FileSystem_createNewFolder',
				{
					parentFolderPath: this._currentPath,
					newFolderName: newFolderName
				},
				function(e) {
					this._browsePath(this._currentPath);
				},
				this
			);
		},
		
		_onPathChangeValue: function(e) {
			this._browsePath(e.getData());
		},
		
		_validateSelection: function() {
			var returnPath = null;
			switch(this._type) {
			case this.self(arguments).OPEN_DIALOG:
				if (this._selectedRow == null || this._selectedRow[7] == 'folder') {
					alert('Please select a file.');
					return;
				}
				eyeos.consoleInfo('OPENING FILE: ' + this._selectedRow[6]);
				returnPath = this._selectedRow[6];
				break;
			case this.self(arguments).SAVE_DIALOG:
				var filename = this._filenameTextField.getValue();
				if (!filename) {
					alert('Please enter a filename.');
					return;
				}
				
				// Add default extension if needed
				if (filename.indexOf('.') == -1) {
					if (this._filetypeSelectBox.getSelection()[0].getModel().defaultExt) {
						filename += '.' + this._filetypeSelectBox.getSelection()[0].getModel().defaultExt;
					}
				}
				
				eyeos.consoleInfo('SAVING FILE: ' + this._currentPath + '/' + filename);
				
				returnPath = this._currentPath + '/' + filename;
				break;
			case this.self(arguments).SELECT_FOLDER_DIALOG:
				//TODO
				
				
				eyeos.consoleInfo('SELECTING FOLDER: ' + this._currentPath);
				returnPath = this._currentPath;
			}
			if (this._callback != null) {
				this._callback.call(this._callbackContext, this.self(arguments).APPROVE_OPTION, returnPath);
			}
			this.close();
		},
		
		_centerInParentWindow: function(myWindow, parentWindow) {
			if(parentWindow != null) {
				var parentBounds = parentWindow.getBounds();
				var myBounds = {
						left: parseInt(parentBounds.left + ((parentBounds.width - myWindow.getWidth()) / 2)),
						top: parseInt(parentBounds.top + ((parentBounds.height - myWindow.getHeight()) / 2))
				};
				myBounds.left = myBounds.left > 0 ? myBounds.left : 0 ;
				myBounds.top = myBounds.top > 0 ? myBounds.top : 0 ;
				myWindow.setUserBounds(myBounds.left, myBounds.top, myWindow.getWidth(), myWindow.getHeight());
			}
		},
		
		
		close: function() {
			this._window.close();
			if (this.isDestroyOnClose()) {
				this._window.destroy();
			}
		},
		
		getSelectedFile: function() {
			return this._selectedRow[6];		//absolutepath
		},
		
		getSelectedFiles: function() {
			//TODO
			return new Array();
		},
		
		setFileTypesFilter: function(filter) {
			//TODO
		},
		
		showOpenDialog: function(parentWindow, callback, callbackContext, initialPath) {
			this._type = this.self(arguments).OPEN_DIALOG;
			this._callback = callback;
			this._callbackContext = callbackContext;
			this._currentPath = initialPath;
			this.browseOptions |= this.self(arguments).DEFAULT;
			
			var win = this._getWindow('Open', 'index.php?extern=images/16x16/actions/document-open.png');
			this._okButton.setLabel('Open');
			this._centerInParentWindow(win, parentWindow);
			win.open();
		},
	
		showSaveDialog: function(parentWindow, callback, callbackContext, initialPath, title) {
			if(title == null) {
				title = 'Save as';
			}

			this._type = this.self(arguments).SAVE_DIALOG;
			this._callback = callback;
			this._callbackContext = callbackContext;
			this._currentPath = initialPath;
			this.browseOptions |= this.self(arguments).DEFAULT;
			
			var win = this._getWindow(title, 'index.php?extern=images/16x16/actions/document-save.png');
			this._okButton.setLabel('Save');
			this._centerInParentWindow(win, parentWindow);
			win.open();
		},
		
		showSelectFolderDialog: function(parentWindow, callback, callbackContext, initialPath) {
			this._type = this.self(arguments).SELECT_FOLDER_DIALOG;
			this._callback = callback;
			this._callbackContext = callbackContext;
			this._currentPath = initialPath;
			this.browseOptions |= this.self(arguments).FOLDERS_ONLY | this.self(arguments).DIR_IGNORE_PATTERN;
			
			var win = this._getWindow('Select folder', 'index.php?extern=images/16x16/actions/document-open-folder.png');
			this._okButton.setLabel('Select');
			this._centerInParentWindow(win, parentWindow);
			win.open();
		}
	}
});