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
 *	eyeos.ui.menu.CheckBox - Styling...
 *	Extending a qx.ui.menu.CheckBox, to change the default qooxdoo
 *	icon with the one we want, and implement the eyeos look and feel behaviour.
 */
qx.Class.define('eyeos.ui.menu.CheckBox', {
	extend : qx.ui.menu.CheckBox,

	construct : function(item, iconsPath, actions) {
		arguments.callee.base.call(this, tr(item.name), null);

		if (item.image) {
			this.setEyeosIcon(iconsPath + item.image);
		}

		this.setId(item.id);

		this._setEyeosStyle(item, actions);
	},

	properties : {
		/**
		 *	The icon we want to be shown when the button is in an active state.
		 */
		eyeosIcon: {
			init: null
		},

		id: {
			init: null
		}
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function(item, actions) {
			this.setHeight(32);

			this.addListener('changeValue', function () {
				if (this.isValue()) {
					this.setIcon(this.getEyeosIcon());
				} else {
					this.setIcon(null);
				}
			});

			if (item.cmd) {
				this.actions = actions;
				this.addListener('changeValue', new Function('foo',
					'this.actions.' + item.cmd + '(foo);'));
			}

			if(item.active) {
				this.setValue(true);
			}
		}
	}
});