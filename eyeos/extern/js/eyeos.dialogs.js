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
 * OptionPane makes it easy to pop up a standard dialog box that prompts users
 * for a value or informs them of something.
 * 
 * STILL INCOMPLETE - WILL BE IMPROVED
 */
qx.Class.define('eyeos.dialogs.OptionPane', {
	extend: qx.core.Object,
	
	statics: {
		DEFAULT_WIDTH: 400,
		DEFAULT_HEIGHT: 160,
		MIN_WIDTH: 400,
		MIN_HEIGHT: 160,
		
		//optionType
		DEFAULT_OPTION: -1,
		YES_NO_OPTION: 0,
		YES_NO_CANCEL_OPTION: 1,
		OK_CANCEL_OPTION: 2,
		
		//return values
		YES_OPTION: 0,
		NO_OPTION: 1,
		CANCEL_OPTION: 2,
		OK_OPTION: 0,
		CLOSED_OPTION: -1,
		
		//messageType
		ERROR_MESSAGE: 0,
		INFORMATION_MESSAGE: 1,
		WARNING_MESSAGE: 2,
		QUESTION_MESSAGE: 3,
		PLAIN_MESSAGE: -1,
		
		//options
		DETAILLEDMESSAGE_OPTION: 0,
		INPUT_OPTION: 1
	},
	
	/**
	 * @param string message
	 * @param int messageType
	 * @param int optionType
	 * @param string icon The URL of the icon
	 * @param Array options {optionKey: value, ...}
	 * @param initialValue
	 */
	construct: function (message, messageType, optionType, icon, options, initialValue) {
		arguments.callee.base.call(this);
		
		this._iconPath = icon;
		this._message = message;
		this._options = options;
		this._initialValue = initialValue;
		this._messageType = messageType;
		this._optionType = optionType;
	},
	
	members: {
		
		_iconPath: null,
		_message: null,
		_options: null,
		_initialValue: null,
		_messageType: null,
		_optionType: null,
		_value: null,
		_selectionValues: null,
		
		_inputTextField: null,
		
		
		/**
		 * @return eyeos.dialogs.Dialog
		 */
		createDialog: function(parentWindow, title, callback, callbackContext, isTabChild) {
			if (this._iconPath == null) {
				switch (this._messageType) {
					case this.self(arguments).ERROR_MESSAGE:
						this._iconPath = 'index.php?extern=images/48x48/status/dialog-error.png';
						break;
					
					case this.self(arguments).INFORMATION_MESSAGE:
						this._iconPath = 'index.php?extern=images/48x48/status/dialog-information.png';
						break;

					case this.self(arguments).WARNING_MESSAGE:
						this._iconPath = 'index.php?extern=images/48x48/status/dialog-warning.png';
						break;
					
					case this.self(arguments).QUESTION_MESSAGE:
						this._iconPath = 'index.php?extern=images/48x48/categories/system-help.png';
						break;
					
					default:
						this._iconPath = null;
				}
			}
			if (this._optionType == null) {
				switch (this._messageType) {
					case this.self(arguments).QUESTION_MESSAGE:
						this._optionType = this.self(arguments).YES_NO_OPTION;
						break;
					
					default:
						//keep null
				}
			}
			var dialog = new eyeos.dialogs.Dialog(title).set({
				parentWindow: parentWindow,
				internalIcon: this._iconPath,
				centerMethod: parentWindow ? 'parentWindow' : 'screen',
				modal: true,
				allowClose: false,
				allowMinimize: false,
				allowMaximize: false,
				width: eyeos.dialogs.OptionPane.DEFAULT_WIDTH,
				//height: eyeos.dialogs.OptionPane.DEFAULT_HEIGHT,
				contentPadding: 3,
				allowGrowX: true,
				resizable: false,
				tabChild: isTabChild ? isTabChild : false
			});
			
			//
			// MAIN CONTAINER (icon + message + buttons)
			//
			var mainContainer = dialog.getMainContainer();
			mainContainer.addListener('appear', function(e) {
				var myBounds = this.getBounds();
				this.setMaxHeight(myBounds.height);			//avoid auto-resizing when opening/closing the "details" area on the bottom, if any
			}, mainContainer);
			
			var eastContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
				padding: 4
			});
			
			//
			// MESSAGE (top right)
			//
			var messageContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0, 'top')).set({
				minHeight: 30
			});
			var messageLabel = new qx.ui.basic.Label(this._message).set({
				paddingTop: 20,
				rich: true
			});
			messageContainer.add(messageLabel);
			
			eastContainer.add(messageContainer, {flex: 1});
			
			//
			// INPUT/PASSWORD FIELD (middle right)
			//
			this._inputTextField = new qx.ui.form.TextField(null).set({
				margin: 5
			});
			if (this._options) {
				if (this._options[this.self(arguments).INPUT_OPTION] == 'text') {
					eastContainer.add(this._inputTextField, {flex: 1});
					this._inputTextField.focus();
				} else if (this._options[this.self(arguments).INPUT_OPTION] == 'password') {
					this._inputTextField = new qx.ui.form.PasswordField().set({
						margin: 5
					});
					eastContainer.add(this._inputTextField, {flex: 1});
					this._inputTextField.focus();
				}
			}
			
			
			mainContainer.add(eastContainer, {edge: 'east', flex: 1});
			
			
			//
			// ACTION BUTTONS + DETAILS (bottom)
			//
			var southContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
				padding: 4
			});
			
			var buttonsContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5));
			buttonsContainer.getLayout().setColumnFlex(1, 1);
			var buttons = new Array();
			switch (this._optionType) {
				case this.self(arguments).YES_NO_OPTION:
					buttons[0] = new qx.ui.form.Button('No').set({minWidth: 60});
					buttons[0].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.NO_OPTION, this._inputTextField.getValue());
					}, this);	
					buttons[1] = new qx.ui.form.Button('Yes').set({minWidth: 60});
					buttons[1].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.YES_OPTION, this._inputTextField.getValue());
					}, this);	
					break;
				
				case this.self(arguments).YES_NO_CANCEL_OPTION:
					buttons[0] = new qx.ui.form.Button('No').set({minWidth: 60});
					buttons[0].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.YES_OPTION, this._inputTextField.getValue());
					}, this);	
					buttons[1] = new qx.ui.form.Button('Cancel').set({minWidth: 60});
					buttons[1].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.CANCEL_OPTION, this._inputTextField.getValue());
					}, this);	
					buttons[2] = new qx.ui.form.Button('Yes').set({minWidth: 60});
					buttons[2].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.NO_OPTION, this._inputTextField.getValue());
					}, this);	
					break;
				
				case this.self(arguments).OK_CANCEL_OPTION:
					buttons[0] = new qx.ui.form.Button('Ok').set({minWidth: 60});
					buttons[0].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.OK_OPTION, this._inputTextField.getValue());
					}, this);
					buttons[1] = new qx.ui.form.Button('Cancel').set({minWidth: 60});
					buttons[1].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.CANCEL_OPTION, this._inputTextField.getValue());
					}, this);
					break;
				
				default:
					buttons[0] = new qx.ui.form.Button('Ok').set({minWidth: 60});
					buttons[0].addListener('execute', function(e) {
						this._returnValueAndClose(dialog, callback, callbackContext, eyeos.dialogs.OptionPane.OK_OPTION, this._inputTextField.getValue());
					}, this);
			}
			for(var i = 0; i < buttons.length; i++) {
				buttonsContainer.add(buttons[i], {column: i + 2, row:0});
			}
			southContainer.add(buttonsContainer);
			
			
			//"Details >>" button
			var detailsButton = null;
			if (this._options && this._options[eyeos.dialogs.OptionPane.DETAILLEDMESSAGE_OPTION]) {
				detailsButton = new qx.ui.form.ToggleButton('Details >>');
				buttonsContainer.add(detailsButton, {column: 0, row:0});
				
				//
				// DETAILS TEXTAREA (expandable)
				//
				var separator = new qx.ui.menu.Separator().set({
					visibility: 'excluded'
				});
				dialog.add(separator);
				var detailsTextArea = new qx.ui.form.TextArea(this._options[eyeos.dialogs.OptionPane.DETAILLEDMESSAGE_OPTION]).set({
					enabled: false,
					visibility: 'excluded'
				});
				
				detailsButton.addListener('changeValue', function(e) {
					if (e.getData()) {
						dialog.setHeight(dialog.getHeight() + 160);
						separator.setVisibility('visible');
						detailsTextArea.setVisibility('visible');
					} else {
						dialog.setHeight(dialog.getHeight() - 160);
						separator.setVisibility('excluded');
						detailsTextArea.setVisibility('excluded');
					}
				});
				dialog.add(detailsTextArea, {flex: 1});
			}
			
			mainContainer.add(southContainer, {edge: 'south'});
			
			//
			//	KEY LISTENERS
			//
			dialog.addListener('keypress', function(e) {
				//TODO must define a default button that will be pressed when typing <Escape>
				/*if (e.getKeyIdentifier().toLowerCase() == 'escape') {
					this.close();
					return;
				}*/
				if (e.getKeyIdentifier().toLowerCase() == 'space') {
					if (detailsButton) {
						detailsButton.toggleValue();
					}
					return;
				}
			});
			
			return dialog;
		},
		
		_returnValueAndClose: function(dialog, callback, callbackContext, value, inputValue) {
			if (callback) {
				if (callbackContext) {
					callback.call(callbackContext, value, inputValue);
				} else {
					callback(value, inputValue);
				}
			}
			dialog.close();
		}
	}
});

qx.Class.define('eyeos.dialogs.Dialog', {
	extend: qx.ui.window.Window,
	
	statics: {
		DEFAULT_WIDTH: 400,
		DEFAULT_HEIGHT: 200
	},
	
	construct: function (caption, icon) {
		arguments.callee.base.call(this, caption, icon);		
		this._init();
	},
	
	properties: {
		internalIcon: {
			init: null,
			nullable: true,
			check: 'Image',
			apply: '_applyInternalIcon'
		},
		
		centerMethod: {
			init: 'screen',
			check: ['screen', 'parentWindow', 'none']
		},
		
		parentWindow: {
			init: null,
			nullable: true,
			check: 'qx.ui.Window'
		},
		
		destroyOnClose: {
			init: true,
			check: 'Boolean'
		},

		tabChild: {
			init: false,
			check: 'Boolean',
			apply: '_applyTabChild'
		}
	},

	members: {
		
		__westContainer: null,
		_internalIcon: null,
		_mainContainer: null,
		_parentWindow: null,

		_applyTabChild: function() {
			if(this.isTabChild()) {
				this.setMovable(false);

				this.addListener('appear', function() {
					this.getContentElement().getDomElement().className = 'notHideTab';
				}, this);
			} else {
				this.setMovable(true);
				this.addListener('appear', function() {
					this.getContentElement().getDomElement().className = null;
				}, this);
			}

		},
		
		_applyInternalIcon: function(value, old) {
			this.__westContainer.removeAll();
			this.__westContainer.add(new qx.ui.basic.Image(value).set({
				paddingLeft: 20,
				paddingTop: 20
			}));
		},
		
		_centerInParentWindow: function() {
			if(this.getParentWindow() != null) {
				var parentBounds = this.getParentWindow().getBounds();
				var myBounds = {
						left: parentBounds.left + ((parentBounds.width - this.getWidth()) / 2),
						top: parentBounds.top + ((parentBounds.height - this.getHeight()) / 2)
				};
				this.setUserBounds(myBounds.left, myBounds.top, this.getWidth(), this.getHeight());
				return true;
			}
			return false;
		},
		
		_init: function() {
			var myLayout = new qx.ui.layout.VBox(5);
			this.setLayout(myLayout);
			
			var mainContainerLayout = new qx.ui.layout.Dock(5, 5).set({sort: 'y'});
			this._mainContainer = new qx.ui.container.Composite(mainContainerLayout);
			this.add(this._mainContainer, {flex: 1});
			
			//
			// ICON (left)
			//
			this.__westContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0, 'top')).set({
				width: 80
			});
			this._mainContainer.add(this.__westContainer, {edge: 'west'});
		},
		
		_onResize: function(e) {
			if (this.getCenterMethod() == 'screen') {
				this.center();
			} else if (this.getCenterMethod() == 'parentWindow') {
				// If no parent window has been defined, force centering to screen
				if(this.getParentWindow() == null) {
					this.center();
					return;
				}
				this._centerInParentWindow();
			}
		},
		
		getMainContainer: function() {
			if (this._mainContainer == null) {
				return this;
			}
			return this._mainContainer;
		},
		
		close: function() {
			this.base(arguments);
			if (this.isDestroyOnClose()) {
				this.destroy();
			}
		},
		
		open: function() {
			this.addListenerOnce('resize', this._onResize, this);
			this.base(arguments);
			if (!this.getWidth()) {
				this.setWidth(this.self(arguments).DEFAULT_WIDTH);
			}
			if (!this.getHeight()) {
				this.setHeight(this.self(arguments).DEFAULT_HEIGHT);
			}
		},
		
		setMainContainer: function(container) {
			if (container == null) {
				return;
			}
			this._mainContainer = container;
		}		
	}
});