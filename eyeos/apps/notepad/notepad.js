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
function notepad_application(checknum, pid, args) {
	var myApp = new eyeos.application.notepad(checknum, pid, args);
	myApp.open();
}

qx.Class.define('eyeos.application.notepad', {
    extend: eyeos.system.EyeApplication,
    
    statics: {
		DEFAULT_WIDTH: 600,
		DEFAULT_HEIGHT: 400
	},
    
    construct: function(checknum, pid, args) {
	    arguments.callee.base.call(this, 'notepad', checknum, pid);
	    
	    this._fileChooser = new eyeos.dialogs.FileChooser(checknum);
	    this._fileChooser.setFilters([
			{desc: 'Text files', 		patterns: ['*.txt'], 						defaultExt: 'txt'},
			{desc: 'PHP files', 		patterns: ['*.php', '*.php3', '*.php5'], 	defaultExt: 'php'},
			{desc: 'Javascript files', 	patterns: ['*.js'], 						defaultExt: 'js'},
			{desc: 'XML files', 		patterns: ['*.xml'], 						defaultExt: 'xml'},
			{desc: 'Log files', 		patterns: ['*.log'], 						defaultExt: 'log'}]
		);
	    
	 this._drawGUI();
	    
	    
	    this._appearListener = this._window.addListenerOnce('appear', function(e) {
	    	if (args.length) {
	    		this._doOpen(args[0]);
		    } else {
		    	this._onNew();
		    }
			this._window.removeListenerById(this._appearListener);
	    }, this);
	    
	    this._window.addListener('keypress', function(e) {
	    	if (e.isCtrlPressed()) {
	    		if (e.getKeyIdentifier() == 'S') {
	    			this._onSave(null);
	    			e.preventDefault();
	    		} else if (e.getKeyIdentifier() == 'N') {
	    			this._onNew();
	    			e.preventDefault();
	    		} else if (e.getKeyIdentifier() == 'W') {
	    			this._onClose();
	    			e.preventDefault();
	    		}
	    	}
	    }, this);
    

		this._window.addListener('beforeClose', function(e) {
				// dirty dirty hack
				if (null != this._fileChooser._window) {
					this._fileChooser._window.close();
					this._fileChooser._window.destroy();
				}
				
				if (this._exitConfirmed == false) {
					this._exitConfirmed = true;
					var changed = false;
					for (var tabnum=0;tabnum<this._tabView.getChildren().length;++tabnum) {
						if (this._tabView.getChildren()[tabnum].getStatus()=='changed') {
							e.preventDefault();
							var changed = true;
							var optionPane = new eyeos.dialogs.OptionPane(
								"<b>"+tr("Some documents aren't saved. Do you want to proceed? \n Any changes may be lost.")+"</b>",
								eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
								eyeos.dialogs.OptionPane.YES_NO_OPTION);
							var dialog = optionPane.createDialog(this._window, tr("Unsaved Documents"), function(result) {
								if (result == 0) {     // YES
									this._window.close();
								} else {                // NO
									this._exitConfirmed = false;
								}
							}, this);
							dialog.open();
							break;
						}
					}
					if (changed == false) {
						this._window.close();
					}
				}
			}, this);
		},
    
    members: {
    	
    	_window: null,
    	_tabView: null,
    	_currentDocumentPath: null,
    	_fileChooser: null,
    	_lastFilepath: null,
		_exitConfirmed: false,
    	
    	
    	_doOpen: function(path) {
	    	eyeos.callMessage(this._checknum, '__FileSystem_getFileContent', {path: path}, function(result) {
	    		var newPage = new eyeos.notepad.Page().set({
	    			filepath: path,
	    			text: result.data,
	    			status: 'unchanged'
	    		});
	    		
	    		this._lastFilepath = path;
	    		this._tabView.add(newPage);
	    		this._tabView.setSelection([newPage]);
	    		//this._window.setStatus('Editing: ' + path);
	    	}, this);
	    },
	    
	    _doSave: function(path, page) {
	    	var text = this._tabView.getSelection()[0].getText();
	    	eyeos.callMessage(this._checknum, '__FileSystem_setFileContent', {path: path, data: text}, function() {
	    		page.set({
	    			filepath: path,
	    			status: 'unchanged'
	    		});

                eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [tr('File saved successfully')]);
	    		
	    		//this._currentDocumentPath = path;
	    		//this._window.setStatus('Document saved as ' + path);
	    		
	    		/*qx.event.Timer.once(function(e) {
	    			if (this._tabView.getSelection()[0].getFilepath() == path) {
	    				this._window.setStatus('Editing: ' + path);
	    			}
	    		}, this, 4000);*/
	    		}, this, {
				onException: function(e) {

					if(e.__eyeos_specialControlMessage_body.name=="EyeAccessControlException"){
						var op = new eyeos.dialogs.OptionPane(
							tr('Insufficent permission'),
							eyeos.dialogs.OptionPane.ERROR_MESSAGE,
							null,
							null,
							[e.__eyeos_specialControlMessage_body.message]);
						var d = op.createDialog(this._window, tr('Impossible to save document'), function(result, inputValue) {
							eyeos.consoleInfo(result);
							eyeos.consoleInfo(inputValue);
						});
						d.open();
					}

				}
			});
	    },
	    
	    _drawGUI: function() {
	    	this._window = new eyeos.ui.Window(this, 'notepad Text Editor', 'index.php?extern=/images/16x16/apps/accessories-text-editor.png').set({
	    		width: this.self(arguments).DEFAULT_WIDTH,
	    		height: this.self(arguments).DEFAULT_HEIGHT,
	    		contentPadding: 0,
	    		showStatusbar: true
	    	});
	    	var windowLayout = new qx.ui.layout.VBox(5);
	    	this._window.setLayout(windowLayout);
	    	
	    	//
	    	// TOOLBAR
	    	//
	    	var toolbarBox = new qx.ui.toolbar.ToolBar();
	    	this._window.add(toolbarBox);
	    	
	    	var newButton = new qx.ui.toolbar.Button(tr('New'), 'index.php?extern=images/16x16/actions/document-new.png');
	    	newButton.addListener('execute', this._onNew, this);
	    	toolbarBox.add(newButton);
	    	
	    	var openButton = new qx.ui.toolbar.Button(tr('Open'), 'index.php?extern=images/16x16/actions/document-open.png');
	    	openButton.addListener('execute', this._onOpen, this);
	    	toolbarBox.add(openButton);
	    	
	    	var closeButton = new qx.ui.toolbar.Button(tr('Close'), 'index.php?extern=images/16x16/actions/document-close.png');
	    	closeButton.addListener('execute', this._onClose, this);
	    	toolbarBox.add(closeButton);
	    	
	    	var saveButton = new qx.ui.toolbar.Button(tr('Save'), 'index.php?extern=images/16x16/actions/document-save.png');
	    	saveButton.addListener('execute', this._onSave, this);
	    	toolbarBox.add(saveButton);
	    	
	    	var saveAsButton = new qx.ui.toolbar.Button(tr('Save As'), 'index.php?extern=images/16x16/actions/document-save-as.png');
	    	saveAsButton.addListener('execute', this._onSaveAs, this);
	    	toolbarBox.add(saveAsButton);
	    	
	    	//
	    	//	TABVIEW
	    	//
	    	this._tabView = new qx.ui.tabview.TabView('top').set({
	    		contentPadding: 0
	    	});
	    	this._tabView.addListener('changeSelection', this._onPageChange, this);
	    	this._window.add(this._tabView, {flex: 1});
	    },
	    
	    _onClose: function(e) {
	    	
	    	/*var op = new eyeos.dialogs.OptionPane(
				'There are unsaved changes on this file. Do you want to save them?',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				this._window,
				'Unsaved changes',
				function(a) {
					if (a == eyeos.dialogs.OptionPane.YES_OPTION) {
						
					}
				},
				this
			).open();*/
	    	
	    	this._tabView.remove(this._tabView.getSelection()[0]);
	    	
	    	if (this._tabView.getChildren().length < 1) {
	    		this._onNew();
	    	}
	    	//this._window.setStatus('Create a new file or open an existing one using the buttons in the toolbar.');
	    },
	    
	    _onNew: function(e) {
	    	this._tabView.add(new eyeos.notepad.Page().set({
	    		status: 'changed'
	    	}));
	    },
	    
	    _onOpen: function(e) {
	    	this._fileChooser.showOpenDialog(this._window, function(choice, path) {
	    		if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
	    			this._doOpen(path);
	    		}
	    	}, this, this._lastFilepath);
	    },
	    
	    _onPageChange: function(e) {
	    	var page;
	    	if (e) {
	    		page = e.getData();
	    	} else {
	    		page = this._tabView.getSelection()[0];
	    	}
	    	
	    	/*switch(page.getStatus()) {
	    		case 'unchanged':
					this._textArea.setEnabled(true);
					this.getChildControl('button').setLabel(this.getFilename());
					break;
					
				case 'changed':
					this._textArea.setEnabled(true);
					this.getChildControl('button').setLabel('*' + this.getFilename());
					break;
					
				case 'readonly':
					this._textArea.setEnabled(false);
					this.getChildControl('button').setLabel(this.getFilename() + '(r-o)');
					break;
	    	}*/
	    },
	    
	    _onSave: function(e) {
	    	var currentPage = this._tabView.getSelection()[0];
	    	if (currentPage.getFilepath() === null) {
	    		this._onSaveAs(e, currentPage);
	    	} else {
	    		this._doSave(currentPage.getFilepath(), currentPage);
	    	}
	    },
	    
	    _onSaveAs: function(e, page) {
	    	if (!page) {
	    		page = this._tabView.getSelection()[0];
	    	}
	    	this._fileChooser.showSaveDialog(this._window, function(choice, path) {
	    		if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
	    			this._doSave(path, page);
	    			this._lastFilepath = path;
	    		}
	    	}, this, page.getFilepath());
	    },
	    
	    open: function() {
	    	this._window.open();
	    }
    }
});

qx.Class.define('eyeos.notepad.Page', {
	extend: qx.ui.tabview.Page,
	
	construct: function() {
		this._filename = 'New document';
		arguments.callee.base.call(this, this._filename, 'index.php?extern=images/16x16/mimetypes/text-plain.png');
		
		this.set({
			layout: new qx.ui.layout.VBox(),
			showCloseButton: true
		});
		
		var myButton = this.getChildControl('button');
		myButton.set({
			paddingLeft: 6,
			paddingRight: 6
		});
		myButton.getChildControl('close-button').setIcon('index.php?extern=images/Close.png');
		
		// Our textarea
		this._textArea = new eyeos.ui.widgets.TextArea().set({
			font: this.getTextFont()
		});
		this._textArea.addListener('keydown', function(e) {
			this.setStatus('changed');
		}, this);
		this.add(this._textArea, {flex: 1});
	},
	
	properties: {
		filepath: {
			init: null,
			check: 'String',
			apply: '_applyFilepath'
		},
	
		textFont: {
			init: new qx.bom.Font(14, ['Monospace']),
			check: 'qx.bom.Font',
			apply: '_applyTextFont'
		},
		
		status: {
			init: null,
			check: ['unchanged', 'changed', 'readonly'],
			apply: '_applyStatus'
		}
	},
	
	members: {
		
		_textArea: null,
		_filename: null,
		
		
		_applyFilepath: function(value, old) {
			var urlParts = eyeos.utils.ParseUri.parse(value);
    		this._filename = urlParts.file;
    		var status = this.getStatus();
			
    		this._applyStatus(status);
		},
		
		_applyTextFont: function(value, old) {
			this._textArea.setFont(value);
		},
		
		_applyStatus: function(value, old) {
			switch(value) {
				case 'unchanged':
					this._textArea.setEnabled(true);
					this.setLabel(this._filename);
					break;
					
				case 'changed':
					this._textArea.setEnabled(true);
					this.setLabel('*' + this._filename);
					break;
					
				case 'readonly':
					this._textArea.setEnabled(false);
					this.setLabel('+' + this._filename);
					break;
			}
		},
		
		/*_onPageClose: function(e) {
			if (e.getData().getStatus() == 'changed') {
				
			}
		},*/
		
		getText: function() {
			return this._textArea.getValue();
		},
		
		setText: function(text) {
			this._textArea.setValue(text);
		}
	}
});