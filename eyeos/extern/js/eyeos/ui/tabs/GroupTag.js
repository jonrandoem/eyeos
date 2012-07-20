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
 * GroupTag is an object that show a simple label with the tame of the tag
 * and an icon to delete it from Layout
 */

qx.Class.define('eyeos.ui.tabs.GroupTag', {
	extend: qx.ui.container.Composite,

	properties: {
		name: {
			check: 'String'
		},
		window: {
			
		}
	},

	construct: function (name, window) {
		this.base(arguments);
		this.setName(name);
		this.setWindow(window);
		this.set({
			backgroundColor: '#516074',
			height: 20,
			padding: 2,
			allowGrowY: false,
			allowGrowX: true,
			layout: new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})
		});

		this._label = new qx.ui.basic.Label('<b>' + name + '</b>').set({
			font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
			backgroundColor: '#516074',
			rich: true,
			textColor: 'white'
		});

		this._icon = new qx.ui.basic.Image('index.php?extern=/images/clear.png').set({
			visibility: 'hidden',
			marginLeft: 4
		});
		
		this.add(this._label);
		this.add(this._icon);
		
		this._addMyListeners();
	},

	members: {
		_addMyListeners: function () {
			this.addListener('mouseover', function (e) {
				this._icon.setVisibility('visible');
			});
			this.addListener('mouseout', function (e) {
				this._icon.setVisibility('hidden');
			});

			this._icon.addListener('click', function () {
				this.getWindow().fireDataEvent('destroyTag', this.getName());
				this.destroy();
			}, this);
		}
	}
});