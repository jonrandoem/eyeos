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
 *	eyeos.ui.menubar.MenuBar
 *	Extending a qx.ui.menubar.MenuBar, adding a menubar builder,
 *	which is able, using configurations classes implementing
 *		{@see eyeos.ui.genericbar.IConf}
 *		{@see eyeos.ui.genericbar.IItems}
 *		{@see eyeos.ui.genericbar.IActions}
 *	to create an entire menuBar.
 */
qx.Class.define('eyeos.ui.menubar.MenuBar', {
	extend: qx.ui.menubar.MenuBar,

	construct: function() {
		arguments.callee.base.call(this);
		this._setEyeosStyle();
	},

	properties: {
		/**
		 *	Defines a comon icon path.
		 *	All the 'image' field defined in {@see eyeos.ui.genericbar.IItems}
		 *	will be searched here.
		 */
		iconsPath: {
			init: null
		},

		/**
		 *	a reference to a class implementing the {@see eyeos.ui.genericbar.IItems}
		 *	interface.
		 */
		items: {
			init: null,
			check: 'eyeos.ui.genericbar.IItems'
		},

		/**
		 *	a reference to a class implementing the {@see eyeos.ui.genericbar.IItems}
		 *	interface.
		 */
		actions: {
			init: null,
			check: 'eyeos.ui.genericbar.IActions'
		}
	},

	members: {
		/**
		 * Creates an entire menuBar, adding buttons and subMenus as defined in the
		 */
		createMenuBar: function() {
			var menuBarItems = this.getItems();
			for (var i = 0; i < menuBarItems.length; ++i) {
				var menuBarItemSubMenu = this.__createSubMenus(menuBarItems[i].subMenu);
				var menuBarItem = new eyeos.ui.menubar.Button(menuBarItems[i].name, menuBarItems[i].id, '', menuBarItemSubMenu);
				this.add(menuBarItem);
			}
		},

		/**
		 *	Create the subMenus for each item which has one.
		 */
		__createSubMenus: function(menuItems) {
			if (menuItems) {
				var menu = new eyeos.ui.menu.Menu();
				
				for (var i = 0; i < menuItems.length; ++i) {
					if(menuItems[i]) {
						var subMenu = this.__createSubMenus(menuItems[i].subMenu);

						var subMenuItem = null;

						switch (menuItems[i].type) {
							case 'Separator':
								subMenuItem = new eyeos.ui.menu.Separator();
								break;
							case 'CheckBox':
								subMenuItem = new eyeos.ui.menu.CheckBox(menuItems[i], this.getIconsPath(), this.getActions());
								break;
							case 'SwitchButton':
								subMenuItem = new eyeos.ui.menu.SwitchButton(menuItems[i], this.getIconsPath(), this.getActions());
								break;
							default:
								subMenuItem = new eyeos.ui.menu.Button(menuItems[i], this.getIconsPath(), subMenu, this.getActions());
						}
					
						menu.add(subMenuItem);
					}
				}
				return menu;
			}
			return null;
		},

		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function() {
			this.setDecorator(null);
			this.setBackgroundColor('#F2F2F3');
			this.setFont(new qx.bom.Font(13, ['Helvetica', 'Arial']));
		}
	}
});