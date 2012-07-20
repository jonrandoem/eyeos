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
function openwith_application(checknum, pid, args) {
	var myApp = new eyeos.application.OpenWith(checknum, pid, args);
	myApp.drawGUI();
}

qx.Class.define('eyeos.application.OpenWith', {
	extend: eyeos.system.EyeApplication,
	
	statics: {
		DEFAULT_WIDTH: 300,
		DEFAULT_HEIGHT: 400,
		
		SortApplications: function(a, b) {
			if (a['meta']['eyeos.application.name'] < b['meta']['eyeos.application.name']) {
				return -1;
			} else if (a['meta']['eyeos.application.name'] > b['meta']['eyeos.application.name']) {
				return 1;
			} else {
				return 0;
			}
		}
	},
	
	construct: function(checknum, pid, args) {
		arguments.callee.base.call(this, 'openwith', checknum, pid);
		this._originalArgs = args;
	},
	
	members: {
		
		_appsList: null,
		_appCommandTextField: null,
		_originalArgs: null,
		_window: null,
    	
    	
    	_doOpen: function() {
			var selectedAppName = this._appCommandTextField.getValue();
			if (!selectedAppName) {
				if (this._appsList.getSelection().length === 0) {
					eyeos.alert('Please select an application from the list.');
					return;
				} else {
					selectedAppName = this._appsList.getSelection()[0].getModel();
				}
			}
		
			eyeos.execute(selectedAppName, this._checknum, this._originalArgs);
			this._window.close();
	    },
	    
	    drawGUI: function() {
	    	this._window = new eyeos.ui.Window(this, 'Open With...', this._name, true).set({
    		width: this.self(arguments).DEFAULT_WIDTH,
    		height: this.self(arguments).DEFAULT_HEIGHT,
    		contentPadding: 5
			});
			var windowLayout = new qx.ui.layout.VBox(5);
			this._window.setLayout(windowLayout);
			
			this._appsList = new qx.ui.form.List();			
			this._window.add(this._appsList, {flex: 1});
			
			var bottomContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({
				alignY: 'middle'
			}));
			this._window.add(bottomContainer);
			bottomContainer.add(new qx.ui.basic.Label('Command: '));
			this._appCommandTextField = new qx.ui.form.TextField().set({
				minWidth: 40
			});
			this._appCommandTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._doOpen();
				}
			}, this);
			bottomContainer.add(this._appCommandTextField, {flex: 1});
			
			var openButton = new qx.ui.form.Button('Open').set({
				minWidth: 40
			});
			openButton.addListener('execute', function(e) {
				this._doOpen();
			}, this);
			bottomContainer.add(openButton);
			
			eyeos.callMessage(this._checknum, '__Applications_getAllInstalledApplications', null, this.populateApplications, this);
			
			this._window.open();
	    },
	    
	    populateApplications: function(appList) {
	    	appList.sort(this.self(arguments).SortApplications);
	    	
	    	for(var i = 0; i < appList.length; i++) {
	    		var appName = appList[i]['meta']['eyeos.application.name'];
	    		var iconUrl = null;
	    		if (appList[i]['meta']['eyeos.application.iconUrl']) {
	    			iconUrl = appList[i]['meta']['eyeos.application.iconUrl'];
	    		} else {
	    			iconUrl = 'index.php?extern=images/48x48/mimetypes/application-x-executable.png';
	    		}
	    		var item = new qx.ui.form.ListItem(appName, iconUrl).set({
	    			model: appList[i]['name']
	    		});
	    		this._appsList.add(item);
	    	}
	    }
	}
});