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

qx.Class.define('eyeos.socialbar.Label', {
	extend: qx.ui.basic.Label,

	properties: {
		selected: {
			check: 'Boolean',
			init: false
		},
		color: {
			init: '#000000'
		},
		id: {
			check: 'Integer'
		},
		type: {
			check: 'String'
		}
	},
	
	statics: {
		FONTLABEL: new qx.bom.Font(14, ['Helvetica']),
		FONTLINK: new qx.bom.Font(12, ['Helvetica']).set({
			decoration: 'underline'
		}),
		FONTTAG: new qx.bom.Font(14, ['Helvetica']),
		FONTNOTAG: new qx.bom.Font(14, ['Helvetica']).set({
			italic: true
		}),
		FONTCOMMA: new qx.bom.Font(14, ['Helvetica']),
		FONTDATE: new qx.bom.Font(12, ['Helvetica']),
		FONTREVISION: new qx.bom.Font(12, ['Helvetica']),
		FONTCONFIRMMESSAGE: new qx.bom.Font(16, ['Helvetica']),
		FONTSHAREDNAME: new qx.bom.Font(12, ['Helvetica']),
		FONTSHAREDLISTS: new qx.bom.Font(12, ['Helvetica']),
		FONTSHAREDITEMS: new qx.bom.Font(12, ['Helvetica']),
		FONTTITLEWINDOW: new qx.bom.Font(18, ['Helvetica']),
		FONTLABELWINDOW: new qx.bom.Font(18, ['Helvetica'])
	},
	
	construct: function (string, type, color, id) {
		this.base(arguments);
		this.setRich(true);
		if (string){
			this.setValue(string);
		} else {
			this.setValue(' ');
		}
		this.setType(type);
		if (type){
			switch (type) {
				case 'label':
					this.setFont(eyeos.socialbar.Label.FONTLABEL);
					break;
				case 'link':
					this.setTextColor('#297CCE');
					this.setFont(eyeos.socialbar.Label.FONTLINK);
					break;
				case 'tag':
					this.setColor(color);
					this.setId(id);
					this.setFont(eyeos.socialbar.Label.FONTTAG);
					break;
				case 'notag':
					this.setFont(eyeos.socialbar.Label.FONTNOTAG);
					this.setTextColor('gray');
					break;
				case 'comma':
					this.setFont(eyeos.socialbar.Label.FONTCOMMA);
					break;
				case 'date':
					this.setFont(eyeos.socialbar.Label.FONTDATE);
					this.setTextColor('gray');
					break;
				case 'revision':
					this.setFont(eyeos.socialbar.Label.FONTREVISION);
					this.setTextColor('blue');
					break;
				case 'confirmMessage':
					this.setFont(eyeos.socialbar.Label.FONTCONFIRMMESSAGE);
					break;
				case 'sharedName':
					this.setFont(eyeos.socialbar.Label.FONTSHAREDNAME);
					this.setTextColor('gray');
					break;
				case 'sharedLists':
					this.setFont(eyeos.socialbar.Label.FONTSHAREDLISTS);
					this.setTextColor('#C5AFAF');
					break;
				case 'sharedItems':
					this.setFont(eyeos.socialbar.Label.FONTSHAREDITEMS);
					this.setTextColor('#0080D5');
					break;
				case 'titleWindow':
					this.setFont(eyeos.socialbar.Label.FONTTITLEWINDOW);
					this.setTextColor('gray');
					break;
				case 'windowLabel':
					this.setFont(eyeos.socialbar.Label.FONTLABELWINDOW);
					this.setTextColor('gray');
					break;
			}
		} else {
			this.setFont(eyeos.socialbar.Label.FONTLABEL);
		}

		if (color) {
			this.setTextColor(color);
		}
	},

	members: {
		selectedLabel: function (tagBox) {
			if (this.isSelected()) {
				this.set({
					backgroundColor: this.getLayoutParent().getBackgroundColor(),
					textColor: this.getColor()
				});
				tagBox.fireDataEvent('unselectTag', this.getId());
			} else {
				this.set({
					backgroundColor: this.getColor(),
					textColor: 'white'
				})
				tagBox.fireDataEvent('selectTag', this.getId());
			}

			this.toggleSelected();
		},

		onMouseOver: function () {
			if (!this.isSelected()) {
				this.set({
					backgroundColor: this.getColor(),
					textColor: 'white'
				});
			}
		},

		onMouseOut: function () {
			if (!this.isSelected()) {
				this.set({
					backgroundColor: this.getLayoutParent().getBackgroundColor(),
					textColor: this.getColor()
				});
			}
		}

	}
});
