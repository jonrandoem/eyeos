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
 *	eyeos.ui.menu.SwitchButton - Styling...
 *	Extending an eyeos.ui.menu.CheckBox, to implement the eyeos look 
 *	and feel behaviour.
 *	This widget remove the default wooxdoo check icon, and allows to
 *	set two different labels, which will change changing the checkbox state.
 */
qx.Class.define('eyeos.ui.menu.SwitchButton', {
	extend : qx.ui.menu.CheckBox,

	construct : function(item, iconsPath, actions) {
		arguments.callee.base.call(this, tr(item.name), null);

		if (item.image) {
			this.setIcon(iconsPath + item.image);
		}

		this.setDefaultLabel(tr(item.name));
		this.setCheckedLabel(tr(item.checkedLabel));
		this.setId(item.id);

		this._setEyeosStyle(item, actions);
	},

	properties : {
		/**
		 *	The value of the button's label, which is shown when the
		 *	CheckBox is not checked.
		 */
		defaultLabel: {
			init: null
		},
		
		/**
		 *	The value of the button's label, which is shown when the
		 *	CheckBox is checked.
		 */
		checkedLabel: {
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
			this.setIcon(null);
			this.setHeight(32);

			this.addListener('changeValue', function () {
				if (this.isValue()) {
					this.setLabel(this.getCheckedLabel());
				} else {
					this.setLabel(this.getDefaultLabel());
				}
			});

			if (item.cmd) {
				this.actions = actions;
				this.addListener('changeValue', new Function('foo',
					'this.actions.' + item.cmd + '(foo);'));
			}
		}
	}
});