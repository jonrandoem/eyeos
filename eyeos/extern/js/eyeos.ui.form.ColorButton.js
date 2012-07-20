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
 *	eyeos.ui.form.ColorButton - Styling...
 *	Extending a qx.ui.form.MenuButton, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.form.ColorButton', {
	extend : qx.ui.form.MenuButton,

	construct : function() {
		arguments.callee.base.call(this, '');
		this._setEyeosStyle();
	},

	properties: {
		/**
		 *	The menu instance to show when clicking on the button
		 */
		menu : {
			check : 'eyeos.ui.control.ColorPopup',
			nullable : true,
			refine: true,
			apply : '_applyMenu',
			event : 'changeMenu'
		},

		/**
		 *	the current selected color, which fires an event
		 *	to keep the label's color up to date.
		 */
		color: {
			init: '#FFF',
			event: 'changeColor'
		}
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function() {
			this.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#333333', 0.7, 5, 5, 5, 5)
			);
			
			this.setAllowGrowY(false);
			this.setHeight(22);
			this.setWidth(80);

			this.setMenu(new eyeos.ui.control.ColorPopup());
			this.getMenu().addListener('changeValue', function (e) {
				this.setColor(e.getData());
			}, this);

			var label = this.getChildControl('label');
			label.setHeight(12);
			label.setWidth(70);

			this.addListener('changeColor', new Function('foo',
				'this.getChildControl("label").setBackgroundColor(this.getColor())'));
		}
	}
});