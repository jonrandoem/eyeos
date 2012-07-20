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

//create a new decorator with rounded corners

qx.Class.define("qx.ui.decoration.RoundBorderBeveled", {
	extend : qx.ui.decoration.Beveled,
	implement : [qx.ui.decoration.IDecorator],
	
	construct : function(outerColor, innerColor, innerOpacity, leftTopR, rightTopR, rightBottomR, leftBottomR, shadow) {
		this.base(arguments);

		this.set({
			'outerColor' : 'transparent',
			'innerColor' : 'transparent'
		});
		if (outerColor == null) {
			this.set({'outerColor': 'transparent'});
		}
		if (innerColor == null) {
			this.set({'innerColor': 'transparent'});
		}

		if (outerColor != null) {
			this.set({'outerColor': outerColor});
		}
		
		if (innerColor != null) {
			this.set({'innerColor': innerColor});	
		}

                if(shadow != null) {
                    this.setShadow(shadow);
                }
		
		if(leftTopR != null) {
			this.setLeftTopR(leftTopR);
		} else {
			this.setLeftTopR(0);
		}
		
		if(rightTopR != null) {
			this.setRightTopR(rightTopR);
		} else {
			this.setRightTopR(0);
		}
		
		if(rightBottomR != null) {
			this.setRightBottomR(rightBottomR);
		} else {
			this.setRightBottomR(0);
		}
				
		if(leftBottomR != null) {
			this.setLeftBottomR(leftBottomR);
		} else {
			this.setLeftBottomR(0);
		}
	},
	
	properties : {
	    /**
	     * The color of the inner frame.
	     */
		leftTopR :
	    {
	      check : "Number",
	      nullable : true,
	      apply : "_applyStyle"
	    },
		    
	    rightTopR :
	    {
	      check : "Number",
	      nullable : true,
	      apply : "_applyStyle"
	    },
		    
	    rightBottomR :
	    {
	      check : "Number",
	      nullable : true,
	      apply : "_applyStyle"
	    },
	    
	    leftBottomR :
	    {
	      check : "Number",
	      nullable : true,
	      apply : "_applyStyle"
	    },

            shadow :
            {
                check : "String",
                nullable : true,
                apply : "_applyStyle"
            }
	},
	
	members: {
		getMarkup: function(){
			if (this.__markup) {
				return this.__markup;
			}

			var Color = qx.theme.manager.Color.getInstance();
			var html = [];

			// Prepare border styles
			var outerStyle = "1px solid " + Color.resolve(this.getOuterColor()) + ";";
			var innerStyle = "1px solid " + Color.resolve(this.getInnerColor()) + ";";

			// Outer frame
			html.push('<div style="overflow:hidden;font-size:0;line-height:0; padding: 1px;">');

			// Background frame
			html.push('<div style="');
			html.push('border:', outerStyle);
			html.push(qx.bom.element.Opacity.compile(0.35));
			html.push('"></div>');

			// Horizontal frame
			html.push('<div style="position:absolute;top:1px;left:0px;');
			html.push('border-left:', outerStyle);
			html.push('border-right:', outerStyle);
			html.push('"></div>');

			// Vertical frame
			html.push('<div style="');
			html.push('position:absolute;top:0px;left:1px;');
			html.push('border-top:', outerStyle);
			html.push('border-bottom:', outerStyle);
			html.push('"></div>');

			// Inner background frame
			var backgroundStr = qx.ui.decoration.Util.generateBackgroundMarkup(this.getBackgroundImage(), this.getBackgroundRepeat(), 0, 0, "position:absolute;top:1px;left:1px;")

			html.push(backgroundStr.replace('style="', 'style="-moz-box-shadow:'+this.getShadow()+';-webkit-box-shadow:'+this.getShadow()+';box-shadow:'+this.getShadow()+';-webkit-border-top-left-radius:' + this.getLeftTopR() + 'px;-moz-border-radius-topleft:' + this.getLeftTopR() + 'px;-webkit-border-top-right-radius:' + this.getLeftTopR() + 'px;-moz-border-radius-topright:' + this.getRightTopR() + 'px;-webkit-border-bottom-left-radius:' + this.getLeftBottomR() + 'px;-moz-border-radius-bottomleft:' + this.getLeftBottomR() + 'px;-webkit-border-bottom-right-radius:' + this.getRightBottomR() + 'px;-moz-border-radius-bottomright:' + this.getRightBottomR() + 'px;'));

			// Inner overlay frame
			html.push('<div style="style="-moz-box-shadow:'+this.getShadow()+';-webkit-box-shadow:'+this.getShadow()+';box-shadow:'+this.getShadow()+';position:absolute;top:1px;left:1px;-webkit-border-top-left-radius:' + this.getLeftTopR() + 'px;-moz-border-radius-topleft:' + this.getLeftTopR() + 'px;-webkit-border-top-right-radius:' + this.getLeftTopR() + 'px;-moz-border-radius-topright:' + this.getRightTopR() + 'px;-webkit-border-bottom-left-radius:' + this.getLeftBottomR() + 'px;-moz-border-radius-bottomleft:' + this.getLeftBottomR() + 'px;-webkit-border-bottom-right-radius:' + this.getLeftBottomR() + 'px;-moz-border-radius-bottomright:' + this.getRightBottomR() + 'px;');
			html.push('border:', innerStyle);
			html.push(qx.bom.element.Opacity.compile(this.getInnerOpacity()));
			html.push('"></div>');

			// Outer frame
			html.push('</div>');

			// Store
			return this.__markup = html.join("");
		}
	}
});