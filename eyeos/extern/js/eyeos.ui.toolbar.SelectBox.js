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
 *	eyeos.ui.toolbar.SelectBox - Styling...
 *	Extending a qx.ui.form.SelectBox, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.toolbar.SelectBox', {
	extend : qx.ui.form.SelectBox,

	construct : function(item, actions) {
		arguments.callee.base.call(this);
		this.setItems(item.subMenu);

		if(item.id) {
			this.setId(item.id);
		}

		this._setEyeosStyle(item, actions);
	},

	properties: {
		/**
		 *	the items we want to be in the selectBox object.
		 */
		items: {
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
			this.getChildControl('popup').setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 5, 5, 5, 5)
			);

			this.setHeight(24);
			this.setMarginTop(3);
			this.setMarginBottom(3);
			this.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 5, 5, 5, 5)
			);
				
			if (this.getItems()) {
				this.getItems().forEach(function (subItem) {
					var listItem = new eyeos.ui.toolbar.ListItem(subItem)
					this.add(listItem);
					if (item.defaultId == subItem.id) {
						this.setSelection([listItem]);
					}
				}, this);
			}

			if (item.cmd) {
				this.actions = actions;
				this.addListener('changeSelection', new Function('foo', 'this.blocked == true ? null : this.actions.' + item.cmd + '(foo);'));
			}
		}
	}
});