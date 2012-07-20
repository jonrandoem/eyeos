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
 *	eyeos.ui.toolbar.ImageMenuButton - Styling...
 *	Extending a qx.ui.toolbar.MenuButton, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.toolbar.ImageMenuButton', {
	extend : qx.ui.toolbar.MenuButton,

	construct : function(item, iconsPath, actions) {
		arguments.callee.base.call(this, tr(item.name), iconsPath + item.subMenu[0].image);
		var menu = this.__createMenu(item.subMenu, iconsPath, actions);
		this.setMenu(menu);
		this.setId(item.id);
		this._setEyeosStyle(item);
	},

	properties: {
		/**
		 * Used to keep a common reference between items and their toolbar.Part.
		 * Needed by the {@see eyeos.ui.toolbar.ToolBar}
		 * for switching between the two modes.
		 */
		groupName: {
			init: null,
			check: 'String'
		},

		id: {
			init: null
		}
	},

	members : {
		/*
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function(item) {
			this.setMaxHeight(50);
			
			var layout = new qx.ui.layout.Dock();
			layout.setSort('x');
			this._setLayout(layout);

			if (item.hideLabel) {
				this.setShow('icon');
			}


		},

		/**
		 *	Overriding parent's function, to provide the
		 *	eyeos style and look.
		 */
		_createChildControlImpl : function(id) {
			var control;

			switch(id) {
				case 'label':
					control = new qx.ui.basic.Label(this.getLabel());
					control.setAnonymous(true);
					control.setRich(this.getRich());
					this._add(control, {
						edge:'south'
					});
					if (this.getLabel() == null || this.getShow() === "icon") {
						control.exclude();
					}
					break;
				case 'icon':
					control = new qx.ui.basic.Image(this.getIcon());
					control.setAlignX('center');
					control.setAnonymous(true);
					this._add(control, {
						edge:'north',
						flex: 1
					});
					if (this.getIcon() == null || this.getShow() === "label") {
						control.exclude();
					}
					break;
				case 'arrow':
					control = new qx.ui.basic.Image();
					control.setPaddingLeft(5);
					control.setAlignY('middle');
					control.setAnonymous(true);
					this._add(control, {
						edge:'east',
						flex: 1
					});
					break;
			}

			return control;
		},

		/**
		 *	Create the Menu for this widget.
		 */
		__createMenu: function(menuItems, iconsPath, actions) {
			if (menuItems) {
				var subMenu = new eyeos.ui.menu.Menu();

				var item = null;
				for (var i = 0; i < menuItems.length; ++i) {
					if (menuItems[i].type == 'Separator') {
						item = new eyeos.ui.menu.Separator();
					}
					else {
						item = new eyeos.ui.menu.Button(menuItems[i], iconsPath, null, actions);

						if (menuItems[i].cmd) {
							item.addListener('execute', function(e) {
								this.setIcon(e.getTarget().getIcon());
							}, this);
						}
					}
					subMenu.add(item);
				}
				return subMenu;
			}
			else {
				return null;
			}
		}
	}
});