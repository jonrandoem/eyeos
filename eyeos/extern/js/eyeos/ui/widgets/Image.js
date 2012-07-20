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
 * 
 */
qx.Class.define('eyeos.ui.widgets.Image', {
	extend: qx.ui.basic.Image,
	
	construct: function (source) {
		this.base(arguments, source);
	},
	
	properties: {
		/*height: {
			check : 'Integer',
			nullable : true,
			apply : '_applyHeight',
			init : null,
			themeable : true
		},*/
		
		forceRatio: {
			init: 'disabled',
			check: ['disabled', 'height', 'width', 'auto'],
			apply: '_applyForceRatio'
		}/*,
		
		width: {
			check : 'Integer',
			nullable : true,
			apply : '_applyWidth',
			init : null,
			themeable : true
		}*/
	},
	
	members: {
		
		/*_applyHeight: function(value, old) {
			this._applyDimension();
			this._doApplyRatio();
		},*/
		
		_applyDimension: function(value, old) {
			this.base(arguments, value);
			this._doApplyRatio();
		},
		
		_applyForceRatio: function(value, old) {
			this._doApplyRatio();
		},
		
		// overridden
		_applySource : function(value) {
			this.base(arguments, value);
			this._doApplyRatio();
		},
		
		/*_applyWidth: function(value, old) {
			this._applyDimension();
			this._doApplyRatio();
		},*/
		
		_doApplyRatio: function() {
			var source = this.getSource();
			if (!qx.io.ImageLoader.isLoaded(source)) {
				qx.io.ImageLoader.load(source, this._doApplyRatio, this);
				return;
			}
			
			var fixedWidth = this.getWidth();
			var fixedHeight = this.getHeight();
			var originalHeight = qx.io.ImageLoader.getHeight(source);
			var originalWidth = qx.io.ImageLoader.getWidth(source);
			
			switch(this.getForceRatio()) {
				case 'height':
					if (!fixedWidth) {
						this.setHeight(originalHeight);
					} else {
						var newHeight = fixedWidth * originalHeight / originalWidth;
						this.setHeight(newHeight);
					}
					break;
					
				case 'width':
					if (!fixedHeight) {
						this.setWidth(originalWidth);
					} else {
						var newWidth = fixedHeight * originalWidth / originalHeight;
						this.setWidth(newWidth);
					}
					break;
				
				case 'auto':
					var newHeight;
					if (fixedWidth) {
						newHeight = fixedWidth * originalHeight / originalWidth;
					}
					var newWidth;
					if (fixedHeight) {
						newWidth = fixedHeight * originalWidth / originalHeight;
					}
					
					if (fixedHeight && newHeight > fixedHeight) {
						this.setWidth(newWidth);
					} else if (fixedWidth) {
						this.setHeight(newHeight);
					}
					break;
			}
		}
	}
});