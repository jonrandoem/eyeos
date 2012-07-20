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
 * Context Button Used on Shared Box
 */

qx.Class.define('eyeos.socialbar.ContextButton', {
	extend: qx.ui.form.ToggleButton,

	properties: {
		selected: {
			check: 'Boolean'
		}
	},

	construct: function (caption, sharedBox) {
		this.base(arguments, tr(caption));
		
		if (caption == 'People') {
			var myDecorator = new qx.ui.decoration.RoundBorderBeveled(null, '#AFAFAF', 1, 7, 0, 0, 7);
			var mySelected = true;
		} else if (caption == 'Groups') {
			var myDecorator = new qx.ui.decoration.RoundBorderBeveled(null, '#AFAFAF', 1, 0, 7, 7, 0);
			var mySelected = false;
		}
		
		this.set({
			selected: mySelected,
			decorator: myDecorator,
			backgroundColor: (caption == 'People') ? '#3579D5' : '#FFFFFF',
			textColor: (caption == 'People')?  '#FFFFFF' : '#3579D5',
			paddingRight: 15,
			paddingLeft: 15,
			marginTop: 5,
			marginBottom: 5,
			marginRight: (caption == 'People') ? 0 : 5,
			marginLeft: (caption == 'People') ? 5 : 0
		});

		this.addListener('click', function (e) {
			if (!this.isSelected()) {
				this.changeContext();
				this.fireEvent('changeContext');
			}
		});
		
	},
	members: {
		changeContext: function () {
			if (!this.isSelected()) {
				this.set({
					selected: true,
					backgroundColor: '#3579D5',
					textColor: '#FFFFFF'
				});
			} else {
				this.set({
					selected: false,
					backgroundColor: '#FFFFFF',
					textColor: '#3579D5'
				});
			}
		} 
	}
	
});


