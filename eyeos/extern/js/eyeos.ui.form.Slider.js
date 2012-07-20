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
 *	eyeos.ui.form.Slider - Styling...
 *	Extending a qx.ui.form.Slider, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.form.Slider', {
	extend : qx.ui.form.Slider,

	construct : function(min, max, orientation) {
		arguments.callee.base.call(this, orientation);
		this._setEyeosStyle(min, max);
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function(min, max) {
			if (min) {
				this.setMinimum(min);
			}
			else {
				this.setMinimum(0);
			}

			if (max) {
				this.setMaximum(max);
			}
			else {
				this.setMaximum(100);
			}

			this.setSingleStep(1);
			this.setPageStep(10);
			this.setValue(50);

			this.setWidth(100);
			this.setAllowGrowX(false);
			this.setHeight(10);
			this.setAllowGrowY(false);
			
			this.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#000', 0.7, 5, 5, 5, 5)
				);

			this.getChildControl("knob").setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#000', 0.7, 5, 5, 5, 5)
				);
			this.getChildControl("knob").setBackgroundColor('#000');
			this.getChildControl("knob").setAllowGrowX(false);
		},

		createSliderGroup : function() {
			var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

			var group = {
				slider: this,
				minimum: new qx.ui.basic.Label(this.getMinimum().toString()),
				maximum: new qx.ui.basic.Label(this.getMaximum().toString())
			};

			container.add(group.minimum, {top: 12, left: 0});
			container.add(group.maximum, {top: 12, left: 80});
			container.add(group.slider, {top: 0, left: 0});

			return container;
		}

	}
});