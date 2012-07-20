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
 *	eyeos.ui.toolbar.ToolBar
 *	Extending a qx.ui.toolbar.ToolBar, adding a toolbar builder,
 *	which is able, using configurations classes implementing
 *		{@see eyeos.ui.genericbar.IConf}
 *		{@see eyeos.ui.genericbar.IItems}
 *		{@see eyeos.ui.genericbar.IActions}
 *	to create an entire toolBar, able to switch between two differents modes.
 *	If you need to add or remove some buttons from the toolBar,
 *	use the 'adding'{@see this#mode}.
 *	If you need a toolBar able to switch between two totally different bars,
 *	use the 'switching' {@see this#mode}.
 */
qx.Class.define('eyeos.ui.toolbar.ToolBar', {
	extend: qx.ui.toolbar.ToolBar,

	construct: function() {
		arguments.callee.base.call(this);
		this.initAdvancedButtons(new qx.type.Array());
		this.initNeedAManager(new qx.type.Array());
		this.initNeedUpdates(new qx.type.Array());
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
		},

		/**
		 * a reference to an Array, containing the items which are defined in the
		 * {@see this#items} with the 'advanced' mode.
		 * {@see eyeos.ui.genericbar.IItems}.
		 */
		advancedButtons: {
			deferredInit: true
		},

		/**
		 * The toolbar's header, it's a button which allow you to switch the
		 * toolbar mode.
		 * It must be an {@see eyeos.ui.toolbar.Header}, or a class extending
		 * this one.
		 */
		header: {
			init: null,
			apply: '__applyHeader',
			check: 'eyeos.ui.toolbar.Header'
		},

		/**
		 *	The mode of the switch:
		 *		- 'adding': adds/removes the Items marked as 'advanced'
		 *			in the {@see eyeos.ui.genericbar.IItems}.
		 *		- 'switching': totally switches the Parts marked as 'advanced',
		 *				in the {@see eyeos.ui.genericbar.IItems}, and
		 *				temporanely removes the others.
		 */
		mode: {
			init: 'adding',
			check: ['adding', 'switching']
		},

		/**
		 *	the toolbar's layout, could be 'default', which means HBox,
		 *	or 'custom', which is a Canvas, and requires the field 'position'
		 *	to be defined in the in the {@see eyeos.ui.genericbar.IItems} class.
		 */
		layout: {
			init: 'default',
			check: ['default', 'custom']
		},

		/**
		 *	buttons which needs a manager
		 */
		needAManager: {
			deferredInit: true
		},

		/**
		 *	buttons which needs to be updated
		 */
		needUpdates: {
			deferredInit: true
		}
	},

	members: {
		__currentMode: false,

		/**
		 *	Private function to link the {@see eyeos.ui.toolbar.Header}
		 *	to the {@see eyeos.ui.toolbar.ToolBar}, and add a listener
		 *	so when the header changes its mode, the toolBar is able to
		 *	catch this event and switch it self.
		 */
		__applyHeader: function() {
			this.getHeader().addListener('changeMode', function(e) {
				this.__switchToolBarMode(e.getTarget().getMode());
			}, this);
			this.addAt(this.getHeader(), 0);
		},

		/**
		 *	Creates an entire toolBar, adding buttons and subMenus as defined in the
		 */
		createToolBar: function() {
			var toolBarGroup = null;
			var toolBarItems = this.getItems();

			for (var i = 0; i < toolBarItems.length; ++i) {
				toolBarGroup = this.__createGroup(toolBarItems[i].name, toolBarItems[i].Group, toolBarItems[i].advanced);
				if (toolBarGroup) {
					this.add(toolBarGroup);
				}
			}
		},

		/**
		 *	Create the Groups, dividing them in differents
		 *	{@see eyeos.ui.toolbar.Part}.
		 */
		__createGroup: function(groupName, groupItems, mode) {
			var manager = new qx.ui.form.RadioGroup();
			var toolBarGroup = null;

			if (this.getLayout() == 'default') {
				toolBarGroup = new eyeos.ui.toolbar.Part(groupName, this);
			}
			else if (this.getLayout() == 'custom') {
				toolBarGroup = new eyeos.ui.toolbar.Part.Grid(groupName, this);
			}

			for (var i = 0; i < groupItems.length; ++i) {
				var groupItem = null;
				if(groupItems[i]) {
					switch (groupItems[i].type) {
						case 'TypeButton':
							groupItem = new eyeos.ui.toolbar.TypeButton(
								groupItems[i], this.getIconsPath(), this.getActions()
							);
							break;
						case 'ToggleButton':
							groupItem = new eyeos.ui.toolbar.ToggleButton(
								groupItems[i], this.getIconsPath(), this.getActions()
							);
							break;
						case 'CheckBox':
							groupItem = new eyeos.ui.toolbar.CheckBox(
								groupItems[i], this.getActions()
							);
							break;
						case 'ImageMenuButton':
							groupItem = new eyeos.ui.toolbar.ImageMenuButton(
								groupItems[i], this.getIconsPath(), this.getActions()
							);
							break;
						case 'SelectBox':
							groupItem = new eyeos.ui.toolbar.SelectBox(groupItems[i], this.getActions());
							break;
						case 'Spinner':
							groupItem = new eyeos.ui.toolbar.Spinner(
								groupItems[i], this.getIconsPath(), this.getActions()
							);
							break;
						case 'ColorButton':
							groupItem = new eyeos.ui.toolbar.ColorButton(
								groupItems[i], this.getIconsPath(), this.getActions()
							);
							break;
						default:
							if (groupItems[i].subMenu) {
								groupItem = new eyeos.ui.toolbar.MenuButton(
									groupItems[i], this.getIconsPath(), this.getActions()
								);
							}
							else {
								groupItem = new eyeos.ui.toolbar.Button(
									groupItems[i], this.getIconsPath(), this.getActions()
								);
							}
					}

					if (groupItems[i].needAManager) {
						this.getNeedAManager().push(groupItem);
						manager.add(groupItem);
						groupItem.manager = manager;

						if (groupItems[i].allowEmptySelection) {
							manager.getSelection()[0].toggleValue();
							manager.setAllowEmptySelection(true);
						}
					}

					if (groupItems[i].needUpdates) {
						this.getNeedUpdates().push(groupItem);
					}

					if (groupItems[i].advanced) {
						groupItem.setGroupName(toolBarGroup.getGroupName());
						this.getAdvancedButtons().push(groupItem);
					}
					else {
						if (this.getLayout() == 'default') {
							toolBarGroup.add(groupItem);
						}
						else if (this.getLayout() == 'custom') {
							toolBarGroup.add(groupItem, groupItems[i].position);
						}
					}
				}
			}

		if (mode) {
			this.getAdvancedButtons().push(toolBarGroup);
			return null;
		}
		else {
			return toolBarGroup;
		}
	},

	/**
		 *	Takes care about switching between the two differents modes.
		 */
	__switchToolBarMode: function (mode) {
		if (mode != this.__currentMode) {
			var groups = null;
			if (this.getMode() == 'adding') {
				groups = this.getChildren();
				groups.forEach(function(group) {
					this.getAdvancedButtons().forEach(function (item) {
						if (item.getGroupName() == group.getGroupName()) {
							if (mode) {
								group.add(item);
							}
							else {
								group.remove(item);
							}
						}
					}, this);
				}, this);
			}
			else {
				groups = this.getAdvancedButtons().clone();
				this.getAdvancedButtons().removeAll();

				var children = this.getChildren();
				var header = children.shift();
				this.getAdvancedButtons().append(children);

				this.removeAll();
				this.add(header);
				groups.forEach(function (group) {
					this.add(group);
				}, this);
			}
				
			this.__currentMode = mode;
		}
	},

	/**
		 *	Apply the eyeos look and feel.
		 */
	_setEyeosStyle: function() {
		this.setDecorator(null);
		this.setAllowGrowY(false);
		this.setBackgroundColor('#F2F2F3');
		this.setFont(new qx.bom.Font(11, ['Helvetica', 'Arial']));
	}
}
});