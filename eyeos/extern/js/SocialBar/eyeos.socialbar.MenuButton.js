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
qx.Class.define('eyeos.socialbar.MenuButton', {
	extend: qx.ui.menu.Button,
	construct : function(label, icon, command, menu)
	{
		this.base(arguments);

		// Add command listener
		this.addListener("changeCommand", this._onChangeCommand, this);

		// Initialize with incoming arguments
		if (label != null) {
			this.setMyLabel(label);
		}

		if (icon != null) {
			this.setMyIcon(icon);
		}

		if (command != null) {
			this.setMyCommand(command);
		}

		if (menu != null) {
			this.setMyMenu(menu);
		}
	},

	properties :
	{
		/** The label text of the button */
		myLabel :
		{
			check : "String",
			apply : "_applyLabel",
			nullable : true
		},

		/** Whether a sub menu should be shown and which one */
		myMenu :
		{
			check : "qx.ui.menu.Menu",
			apply : "_applyMenu",
			nullable : true
		},

		/** The icon to use */
		myIcon :
		{
			check : "String",
			apply : "_applyIcon",
			themeable : true,
			nullable : true
		},

		/** The status of the button */
		selected: {
			check: 'Boolean'
		}
	},
	members: {
		//Override
		_createChildControlImpl : function(id)
		{
			var control;

			switch(id)
			{

				case "label":
					control = new qx.ui.basic.Label;
					control.setAnonymous(true);
					this._add(control, {
						column: 0
					});
					break;

				case "icon":
					control = new qx.ui.basic.Image;
					control.setAnonymous(true);
					this._add(control, {
						column: 2
					});
					break;
					
				case "shortcut":
					control = new qx.ui.basic.Label;
					control.setAnonymous(true);
					this._add(control, {
						column: 1
					});
					break;

				case "arrow":
					control = new qx.ui.basic.Image;
					control.setAnonymous(true);
					this._add(control, {
						column: 3
					});
					break;
			}

			return control || this.base(arguments, id);
		},

		getChildrenSizes : function()
		{
			var iconWidth=0, labelWidth=0, shortcutWidth=0, arrowWidth=0;

			if (this._isChildControlVisible("icon"))
			{
				var icon = this.getChildControl("icon");
				iconWidth = icon.getMarginLeft() + icon.getSizeHint().width + icon.getMarginRight();
			}

			if (this._isChildControlVisible("label"))
			{
				var label = this.getChildControl("label");
				labelWidth = label.getMarginLeft() + label.getSizeHint().width + label.getMarginRight();
			}

			if (this._isChildControlVisible("shortcut"))
			{
				var shortcut = this.getChildControl("shortcut");
				shortcutWidth = shortcut.getMarginLeft() + shortcut.getSizeHint().width + shortcut.getMarginRight();
			}

			if (this._isChildControlVisible("arrow"))
			{
				var arrow = this.getChildControl("arrow");
				arrowWidth = arrow.getMarginLeft() + arrow.getSizeHint().width + arrow.getMarginRight();
			}

			return [ iconWidth, labelWidth, shortcutWidth, arrowWidth ];
		}
	}
});
