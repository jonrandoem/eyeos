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
 *	eyeos.ui.toolbar.Header - Styling...
 *	Extending a qx.ui.toolbar.Part, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.toolbar.Header', {
	extend : eyeos.ui.toolbar.Part,

	construct : function(icon) {
		arguments.callee.base.call(this, null);
		this.setIcon(icon);
		this._setEyeosStyle();
	},

	properties: {
		/**
		 * the widget's icon.
		 */
		icon: {
			init: null
		},
		
		/**
		 * the widget's mode.
		 * Allows the {@see eyeos.ui.toolbar.ToolBar} to switches
		 * between two differents modes.
		 */
		mode: {
			init: false,
			check: 'Boolean',
			event: 'changeMode'
		}
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function() {
			this.setMaxHeight(50);

			this.setDecorator(null);
			var menu = new eyeos.ui.menu.Menu();

			var basicMode = new eyeos.ui.menu.Button({name: 'Basic mode', id: 'BasicMode'});
			basicMode.addListener('execute', function() {
				this.setMode(false);
			}, this);
			menu.add(basicMode);

			var advancedMode = new eyeos.ui.menu.Button({name: 'Advanced mode', id: 'AdvancedMode'});
			advancedMode.addListener('execute', function() {
				this.setMode(true);
			}, this);
			menu.add(advancedMode);

			var toggleMode = new qx.ui.toolbar.MenuButton('', this.getIcon(), menu);
			toggleMode.setGap(0);
			toggleMode.setIconPosition('top');
			this.removeAll();
			this.add(toggleMode);
		}
	}
});