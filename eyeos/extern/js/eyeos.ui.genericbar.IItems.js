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
 *	eyeos.ui.genericbar.IItems - Interface
 *	Interface which has to be extended when we want to create a class
 *	to provide our customized {@see eyeos.ui.genericbar.IConf#items}.
 *	{@see eyeos.ui.menubar.MenuBar#menuBarConf}.
 */
qx.Interface.define('eyeos.ui.genericbar.IItems', {

	properties: {
		/**
		 *	the JSON Object containing the whole menuBar struct we want to
		 *	be created automatically by the {@see eyeos.ui.menubar.MenuBar}.
		 *	This variable must be formatted as follow:
		 *		[{item}, {item}, {item}]
		 *
		 *	if implementing a {@see eyeos.ui.menubar.MenuBar#menuBarConf},
		 *	each item can have the follow fields:
		 *	name: the value of the label of this menu item.
		 *	type: if it's not defined, it will be an {@see eyeos.ui.menubar.Button}
		 *	in case of menu item, or an {@see eyeos.ui.menu.Button} in case of
		 *	sub-menu item. If defined, it can specify the object we want:
		 *		- 'Separator': an {@see eyeos.ui.menubar.Separator}
		 *		- 'CheckBox': an {@see eyeos.ui.menubar.CheckBox}
		 *		- 'SwitchButton': an {@see eyeos.ui.menu.SwitchButton}
		 *	image: the icon's path, to set the item's icon.
		 *	cmd: the name of the function, contained in the 'actions' property,
		 *		 which we want to be executed when we click on this item, or
		 *		 'dynamics' to provide a dynamic menu implemented in
		 *		 {@see eyeos.ui.generic.IActions#dynamicsActions}.
		 *	subMenu: it defines the {@see eyeos.ui.menu.Menu} sub-menu of the
		 *			 current item, so it is another JSON Object: formatted
		 *			 like defined above, which will recursively created by the
		 *			 {@see eyeos.ui.menubar.MenuBar}.
		 *
		 *	if implementing a {@see eyeos.ui.toolbar.ToolBar#toolBarConf},
		 *	each item can have the follow fields:
		 *	name: the value of the label of this toolBar item.
		 *	type: if it's not defined, it will be an {@see eyeos.ui.toolbar.Button}
		 *	in case of a simple item, or an {@see eyeos.ui.toolbar.MenuButton} in case of
		 *	sub-menu item. If defined, it can specify the object we want:
		 *		- to be documented!!!!
		 *	image: the icon's path, to set the item's icon.
		 *	cmd: the name of the function, contained in the 'actions' property,
		 *		 which we want to be executed when we click on this item.
		 *	subMenu: it defines the {@see eyeos.ui.menu.Menu} sub-menu of the
		 *			 current item, so it is another JSON Object: formatted
		 *			 like defined above, which will recursively created by the
		 *			 {@see eyeos.ui.toolbar.ToolBar}.
		 *	mode: 'advanced', if we want to hide/show this element, depending
		 *			on the {@see eyeos.ui.toolbar.Header} changing mode.
		 */
		items: {
			init: null
		}
	},

	members: {
		/**
		 *	Here you can directly declare the JSON Object which will be setted
		 *	to {@see this#items}, or implement a method to obtain the JSON Object
		 *	from another source.
		 *	Don't forget to call:
		 *		this.setItems(this.items)
		 *	after the member 'item' is implemented!!
		 */
		items: null
	}
});