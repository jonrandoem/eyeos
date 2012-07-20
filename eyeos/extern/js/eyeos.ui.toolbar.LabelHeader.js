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
 *	eyeos.ui.toolbar.LabelHeader - Styling...
 *	Extending a eyeos.ui.toolbar.ImageHeader, to implement the eyeos
 *	look and feel behaviour.
 *	The two labels will be top-bottom aligned as default, but it can be changed
 *	using the {@see this#order}.
 */
qx.Class.define('eyeos.ui.toolbar.LabelHeader', {
	extend : eyeos.ui.toolbar.ImageHeader,

	construct : function(leftLabel, rightLabel) {
		arguments.callee.base.call(this, null, null);
		this.setLeftLabel(leftLabel);
		this.setRightLabel(rightLabel);
		
		this._setEyeosStyle();
	},

	properties: {
		/**
		 *	the widget's left label.
		 */
		leftLabel: {
			init: null
		},

		/**
		 *	the widget's right label.
		 */
		rightLabel: {
			init: null
		}
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function() {
			this.getChildrenContainer().setLayout(new qx.ui.layout.VBox());
			this.setDecorator(null);
			this.removeAll();

			var leftButton = new qx.ui.toolbar.Button(tr(this.getLeftLabel()));
			leftButton.addListener('execute', function() {
				this.setMode(false);
			}, this);
			this.add(leftButton);

			var rightButton = new qx.ui.toolbar.Button(tr(this.getRightLabel()));
			rightButton.addListener('execute', function() {
				this.setMode(true);
			}, this);
			this.add(rightButton);

			this.addListener('changeOrder', function() {
				switch (this.getOrder()) {
					case 'left-right':
						this.getChildrenContainer().setLayout(new qx.ui.layout.HBox());
					case 'top-bottom':
						this.getChildrenContainer().setLayout(new qx.ui.layout.VBox());
				}
			}, this);
		}
	}
});