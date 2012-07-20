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
 * ActivityBox is a Box that show informations about last Activity of the selected
 * item. There are 4 kind of activity : Modifications, Notes, Sharings and Others.
 * Normally an Activity box is the only box placed on Activity Tab.
 * 
 * Modifications of an item can be reverted.
 */

qx.Class.define('eyeos.socialbar.ActivityBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,

	properties: {
		name: {
			check: 'String'
		},
		checknum: {
			check: 'Integer'
		}
	},
	events: {
		/**
		 * Fired when a user want to revert a change of an item
		 */
		revertItem: 'qx.event.type.Data',
		/**
		 * Fired when a user want to preview an Object
		 */
		previewItem: 'qx.event.type.Data'
	},

	construct: function () {
		this.base(arguments);

		this._buildGui();
	},

	members: {
		_layoutMenuBox: null,
		_layoutSearchBox: null,
		_layoutContentScroll: null,
		_layoutContentBox: null,
		_activityBackgroundColor: '#FFFFFF',

		addActivity: function(activity){
			activity.setBox(this);
			this._layoutContentBox.add(activity);
			activity.setBackgroundColor(this._activityBackgroundColor);
			this._activityBackgroundColor = (this._activityBackgroundColor == '#FFFFFF')?('#E0E0E0'):('#FFFFFF');
		},
		
		_buildGui: function () {
			this._buildMenuBox();
			this._buildSearchBox();
			this._buildContentBox();
		},

		cleanActivities: function () {
			this._layoutContentBox.removeAll();
		},

		_buildMenuBox: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});

			this._layoutMenuBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single(2, 'solid', '#A4A4A4').set({
					styleTop: null,
					styleRight: null,
					styleLeft: null,
					styleBottom: 'solid'
				}),
				paddingRight: 10,
				paddingBottom: 10,
				alignY: 'middle'
			});

			var label = new qx.ui.basic.Label().set({
				value: '<span style=\'text-align:left; color: #8E8E97;\'; margin: 0; padding: 0\'>' + tr('View') + ': </span>',
				rich: true,
				paddingTop: 3,
				marginRight: 8
			});

			this._layoutMenuBox.add(label);
			
			var selectBox = new qx.ui.form.SelectBox().set({
				decorator: new qx.ui.decoration.RoundBorderBeveled('#93999F', '#E5E5E5', 1, 5, 5, 5, 5)
			});

			var selectAll = new qx.ui.form.ListItem(tr('All'));
			var selectModifications = new qx.ui.form.ListItem(tr('Modifications'));
			var selectNotes = new qx.ui.form.ListItem(tr('Notes'));
			var selectSharings = new qx.ui.form.ListItem(tr('Sharings'));
			var selectOthers = new qx.ui.form.ListItem(tr('Others'));

			selectBox.add(selectAll);
			selectBox.add(selectModifications);
			selectBox.add(selectNotes);
			selectBox.add(selectSharings);
			selectBox.add(selectOthers);

			selectBox.addListener("changeSelection", function(e) {
				var type = e.getData()[0].getLabel();
				switch (type) {
					case 'All':
						this._filterActivityByType(type);
						break;
					default :
						type = type.substring(0, type.length - 1);
						this._filterActivityByType(type);
						break;
				}
			}, this);

			this._layoutMenuBox.add(selectBox, {flex: 1});

			this.add(this._layoutMenuBox);
		},

		_buildSearchBox: function () {
			this._layoutSearchBox = new qx.ui.container.Composite().set({
				decorator : new qx.ui.decoration.Single(2, 'solid', '#86BADE').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				}),
				layout: new qx.ui.layout.HBox()
			});

			var searchInput = new qx.ui.form.TextField(tr('Search')).set({
				padding: 0,
				paddingBottom: 4,
				margin: 0,
				decorator: null
			});

			searchInput.addListener('input', function (e) {
				var textValue = e.getValue();
				this._filterActivityByName(textValue);
			}, this);

			searchInput.addListener('focus', function (e) {
				this.setValue('');
			});

			this._layoutSearchBox.add(searchInput, {flex: 1});
			this.add(this._layoutSearchBox);
		},

		_buildContentBox: function () {
			this._layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true,
				allowStretchX: true
			});
			this.add(this._layoutContentScroll, {flex: 1});

			this._layoutContentBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				allowStretchY: true
			});
			this._layoutContentScroll.add(this._layoutContentBox, {flex: 1});
			
		},

		_filterActivityByType: function (type) {
			var activities = this._layoutContentBox.getChildren();
			for (var i = 0; i < activities.length; ++i) {
				if (type == 'All' || activities[i].getType().match(type)){
					activities[i].setVisibility('visible');
					activities[i].setShow(true);
				} else {
					activities[i].setVisibility('excluded');
					activities[i].setShow(false);
				}
			}
		},

		_filterActivityByName: function (name) {
			var activities = this._layoutContentBox.getChildren();
			if (name != ''){
				for(var i = 0; i < activities.length; ++i){
					if (
						activities[i].isShow()
						&& (
							activities[i].getRealName().indexOf(name) != -1
							|| activities[i].getDate().indexOf(name) != -1
							|| activities[i].getRealDate().indexOf(name) != -1
							)
						) {
						activities[i].setVisibility('visible');
					} else {
						activities[i].setVisibility('excluded');
					}
				}
			}
		}
	}
});


