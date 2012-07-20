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
 * Offers a simple and efficient way to select a folder in the form of a select box.
 * The user can also use the special item "Browse more..." to open a FileChooser dialog
 * in order to select a folder which is not listed by this component by default, or type
 * directly a path in the textfield provided by the combobox.
 */
qx.Class.define('eyeos.ui.widgets.LocationComboBox', {
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
		
		if (this._favoritePlaces == null) {
			eyeos.callMessage(appChecknum, '__UserInfo_getUserFavoritePlaces', null, function(response) {
				this._favoritePlaces = response;
				this.__init();
			}, this);
		} else {
			this.__init();
		}
		if (initialPath) {
			this.setPath(initialPath);
		}
	},
	
	members: {
		
		_checknum: null,
		_customizedItem: null,
		_favoritePlaces: null,
		_isReady: false,
		
		
		__init: function() {			
			for(var i = 0; i < this._favoritePlaces.length; i++) {
				this.add(new qx.ui.form.ListItem(this._favoritePlaces[i].path));
			}
			this.add(new qx.ui.form.ListItem('Browse more...').set({
				model: '///browseMore///'
			}));
			this._isReady = true;
		},
	
		__openSelectFolderDialog: function() {
			var fc = new eyeos.dialogs.FileChooser(this._checknum);
			var parentWindow = this.__searchParentWindow();
			fc.showSelectFolderDialog(parentWindow, this.__openSelectFolderDialog_callback, this);
		},
		
		__openSelectFolderDialog_callback:function(userChoice, folderPath) {
			if (userChoice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
				this.setPath(folderPath);
			}
		},
	
		__searchParentWindow: function() {
			var parentComponent = this.getLayoutParent();
			var maxRecursion = 12;
			while(!(parentComponent instanceof qx.ui.window.Window)) {
				parentComponent = parentComponent.getLayoutParent();
				maxRecursion--;
				if (maxRecursion == 0) {
					eyeos.consoleWarn('[eyeos.ui.widgets.LocationComboBox] Unable to find parent window!');
					return null;
				}
			}
			return parentComponent;
		},
		
		_onClick: function(e) {
			if (this._isReady) {
				this.base(arguments, e);
			} else {
				eyeos.consoleWarn('[eyeos.ui.widgets.LocationComboBox] Not ready!');
			}
		},
		
		fireDataEvent: function(type, data, oldData, cancelable) {
			if (type == 'changeValue') {
				if (data == 'Browse more...') {
					this.__openSelectFolderDialog();
					return;
				}
			}
			this.base(arguments, type, data, oldData, cancelable);
		},
		
		getFavoritePlaceInfoFromPath: function(path) {
			if (!this._favoritePlaces) {
				throw '[eyeos.ui.widgets.LocationComboBox] No places found in the current object';
			}
			for(var i = 0; i < this._favoritePlaces.length; i++) {
				if (this._favoritePlaces[i].path == path) {
					return this._favoritePlaces[i];
				}
			}
			return null;
		},
		
		setPath: function(path) {
			this.setValue(path);
		}
	}
});