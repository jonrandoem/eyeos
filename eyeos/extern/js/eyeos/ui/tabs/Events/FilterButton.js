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

qx.Class.define('eyeos.ui.tabs.Events.FilterButton', {
	extend: qx.ui.container.Composite,

	properties: {
		filter: {
			check: 'Integer'
		},
		clicked: {
			check: 'Boolean',
			init: false
		},
		label: {
			check: 'String'
		}
	},
	
	construct: function (sidebar, label, filter) {
		this.base(arguments);
		
		this._sidebar = sidebar;
		this.setFilter(filter);
		this.setLabel(label);
		
		this._buildGui();
		this._addMyListeners();
	},

	members: {
		_sidebar: null,		/* The reference to the sidebar		*/
		_label: null,		/* The label of the Button			*/
		
		_addMyListeners: function () {
			this.addListener('click', this.clickButton, this);

			this._sidebar.addListener('selectFilter', function (e) {
				var filterSelected = e.getData();
				if ( this.getFilter() != filterSelected && this.isClicked()) {
					this.setClicked(false);
					this._showAsNormal();
				}
			}, this);
		},

		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				width: 170,
				height: 25,
				allowGrowX: false,
				allowGrowY: false,
				decorator: new qx.ui.decoration.Single(1, 'solid', '#D6D6D6').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				}),
				paddingLeft: 5
			});

			// Create Label
			this._createLabel();
		},

		/**
		 * Actions executed when there is a click on the button
		 */
		clickButton: function () {
			if (!this.isClicked()) {
				this.setClicked(true);
				this._showAsClicked();
				this._sidebar.fireDataEvent('selectFilter', this.getFilter());
			}
		},

		_showAsClicked: function () {
			this.setBackgroundColor('#0088CD');
			this._label.setTextColor('white');
		},

		_showAsNormal: function () {
			this.setBackgroundColor('#FFFFFF');
			this._label.setTextColor('#858585');
		},

		_createLabel: function () {
			this._label = new qx.ui.basic.Label(this.getLabel()).set({
				paddingLeft: this.__getPaddingLabel(),
				font: new qx.bom.Font(12, ['Lucida Grande', 'Verdana']),
				textColor: '#858585',
				rich: false
			});
			this.add(this._label);
		},

		__getPaddingLabel: function () {
			var padding = null;
			switch (this.getFilter()) {
				case eyeos.ui.tabs.Events.Page.FILTER_ALL:
					return 5;
				default:
					return 5;
			}

			this.setPaddingLeft(padding);
		}
	}
});