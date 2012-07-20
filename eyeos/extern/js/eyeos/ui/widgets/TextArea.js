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
qx.Class.define('eyeos.ui.widgets.TextArea', {
	extend: qx.ui.form.TextArea,
	
	construct: function () {
		arguments.callee.base.call(this);
		this.initSupportTab();
	},
	
	properties: {
		supportTab: {
			init: true,
			check: 'Boolean',
			apply: '_applySupportTab'
		}
	},
	
	members: {
		
		_applySupportTab: function(value, old) {
			if (value) {
				this.addListener('keydown', this._onKeyDown, this);
				this.addListener('keyup', this._onKeyUp, this);
				this.addListener('keypress', this._onKeyPress, this);
			} else {
				this.removeListener('keydown', this._onKeyDown, this);
				this.removeListener('keyup', this._onKeyUp, this);
				this.removeListener('keypress', this._onKeyPress, this);
			}
		},
		
		/*
		 * TODO: Add support for selection indentation 
		 */
		_onKeyDown: function(e) {
			if (e.getKeyIdentifier() == 'Tab') {
				var originalTarget = e.getOriginalTarget();
				var selstart = originalTarget.selectionStart;
				var selend = originalTarget.selectionEnd;
				var totlen = originalTarget.textLength;
				
				this.setTextSelection(0, selstart);
				var sbefore = this.getTextSelection();
				
				this.setTextSelection(selstart, selend);
				var smiddle = this.getTextSelection();
				
				this.setTextSelection(selend);
				var send = this.getTextSelection();
				
				var sstring = sbefore + "\t" + send;
				
				this.setTextSelection(selstart, selend);
				this.setValue(sstring);
				
				e.stopPropagation();
				e.preventDefault();
			}
		},
		
		_onKeyPress: function(e) {
			if (e.getKeyIdentifier() == 'Tab') {
				e.stopPropagation();
				e.preventDefault();
			}
		},
	
		_onKeyUp: function(e) {
			if (e.getKeyIdentifier() == 'Tab') {
				e.stopPropagation();
				e.preventDefault();
			}
		}
	}
});