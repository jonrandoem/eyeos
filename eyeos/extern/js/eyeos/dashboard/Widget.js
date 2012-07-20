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
 * eyeos.dashboard.AbstractWidget
 *
 */
qx.Class.define('eyeos.dashboard.Widget', {
	extend: qx.core.Object,
	type: 'abstract',

	construct: function(title, icon , application) {
		arguments.callee.base.apply(this, arguments);

		if(title) {
			this.setTitle(title);
		}

		if(icon) {
			this.setIcon(icon);
		}

		if(application) {
			this.setApplication(application);
		}
	},

	properties: {
		title: {
			init: 'Eyeos Widget',
			check: 'String',
			event: 'changeTitle'
		},

		icon: {
			init: 'index.php?extern=images/widgetIcon.png',
			check: 'String',
			event: 'changeIcon'
		},

		application: {
			init: null,
			check: ' eyeos.system.EyeApplication'
		},

		views: {
			init: new qx.type.Array(),
			check: 'qx.type.Array',
			event: 'changeViews'
		},

		minimizable: {
			init: true,
			check: 'Boolean',
			event: 'changeMinimizable',
			apply: '_applyMinimizable'
		},

		closable: {
			init: true,
			check: 'Boolean',
			event: 'changeClosable',
			apply: '_applyClosable'
		},

		visible: {
			init: true,
			check: 'Boolean',
			event: 'changeVisible',
			apply: '_applyVisible'
		}
	},

	members: {
		_currentView: null,

		_createView: function() {
			return new eyeos.ui.dashboard.WidgetView();
		},

		addView: function(view) {
			if (view && view instanceof eyeos.ui.dashboard.WidgetView) {
				this.getViews().push(view);
			}
			else {
				this.getViews().push(this._createView());
			}
			
			this._currentView = this.getViews().length - 1;
		},

		removeView: function() {
			
		},

		getCurrentView: function() {
			return this.getViews()[this._currentView];
		},

		setCurrentView: function(index) {
			if(index >= 0 && index < this.getViews().length) {
				this._currentView = index;
			}
		},
		
		_applyMinimizable: function() {

		},

		_applyClosable: function() {

		},

		_applyVisible: function() {

		}
	}
});