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
 *	eyeos.ui.tree.TreeColorFolder - Styling...
 *	Extending a qx.ui.tree.TreeFolder, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.tree.TreeColorFolder', {
	extend : qx.ui.tree.TreeFolder,

	construct : function(color) {
		if (color) {
			this.setColor(color);
		}

		this.addListener('changeColor', function() {
			this.getChildControl("colorLabel").setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, this.getColor(), 0.7, 5, 5, 5, 5)
			);
			this.getChildControl("colorLabel").setBackgroundColor(this.getColor());
		}, this);
		
		arguments.callee.base.call(this);
	},

	properties: {
		/**
		 * Color
		 */
		color: {
			init: 'black',
			check: 'String',
			event: 'changeColor'
		}
	},

	members: {
		// overridden
		_createChildControlImpl : function(id) {
			var control;

			switch(id) {
				case "label":
					control = new qx.ui.basic.Label().set({
						alignY: "middle",
						value: this.getLabel()
					});
					break;

				case "colorLabel":
					control = new qx.ui.basic.Label();
					control.setDecorator(
						new qx.ui.decoration.RoundBorderBeveled(null, this.getColor(), 0.7, 5, 5, 5, 5)
					);
					control.setMarginRight(5);
					control.setAllowGrowX(false);
					control.setAllowGrowY(false);
					control.setWidth(18);
					control.setHeight(18);
					control.setBackgroundColor(this.getColor());
					break;

				case "iconMenu":
					control = new qx.ui.basic.Image('index.php?extern=images/Arrow.png');
					control.setMargin(3);
					control.setAllowGrowX(false);
					control.setAllowGrowY(false);
					control.setWidth(14);
					control.setHeight(14);
					control.hide();

					this.addListener('mouseover', function() {
						control.show();
					}, this);

					this.addListener('mouseout', function() {
						control.hide();
					}, this);
					break;

				case "open":
					control = new qx.ui.tree.FolderOpenButton().set({
						alignY: "middle"
					});
					control.addListener("changeOpen", this._onChangeOpen, this);
					control.addListener("resize", this._updateIndent, this);
					break;
			}

			return control || this.base(arguments, id);
		},

		// overridden
		_addWidgets : function() {
			this.addSpacer();
			this.addOpenButton();
			this.addColorLabel();
			this.addLabel();
			this.addIconMenu();
		},

		// instead of addIcon, we use addColorLabel
		addColorLabel : function() {
			var colorLabel = this.getChildControl("colorLabel");
			this._add(colorLabel);
		},

		addIconMenu : function() {
			var iconMenu = this.getChildControl("iconMenu");
			this._add(iconMenu);
		}
	}
});