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
 * The Sidebar of the events tabs ( eyeos.ui.tabs.Events.Page )
 *
 */

qx.Class.define('eyeos.ui.tabs.Events.Sidebar', {
	extend: qx.ui.container.Composite,

	properties: {
		selectedFilter: {
			check: 'Integer',
			init: eyeos.ui.tabs.Events.Page.FILTER_ALL
		}
	},

	events: {
		/**
		 * Fired when a tag is selected, return the id of the Tag
		 */
		selectFilter: 'qx.event.type.Data'
	},

	construct: function (page) {
		this.base(arguments);
		this._page = page;

		this._buildGui();
		this.__addMyListeners();
		
		// Click the All button
		this._filterButtonAll.clickButton();
	},

	members: {
		_page: null,			/* The Event Page reference */
		_layoutContent: null,	/* The Content Layout		*/
		_arrowRightImage: 'index.php?extern=/images/events/arrowHeader.png',
		_arrowBottomImage: 'index.php?extern=/images/events/arrowHeader_dn.png',

		/**
		 *	Build the gui of the sidebar
		 */
		_buildGui: function () {
			this._buildContentLayout();

			this._buildPrimaryFilterLayout();
			this._buildSecondaryFiltersLayout();

			//Select the main button
			this._filterButtonAll.clickButton();
		},

		__addMyListeners: function () {
			this.addListener('selectFilter', function (e) {
				var filterSelected = e.getData();
				this.setSelectedFilter(filterSelected);
			}, this);
		},

		/**
		 * Craeate a Scroll Item, and a Layout Content
		 */
		_buildContentLayout: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				width: 200,
				allowGrowX: false
			});
			
			var layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true
			});
			this.add(layoutContentScroll, {flex: 1});

			this._layoutContent = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				allowStretchY: true
			});
			layoutContentScroll.add(this._layoutContent, {flex: 1});
		},

		_buildPrimaryFilterLayout: function () {
			//Main Label
			var mainLabel = new qx.ui.basic.Atom(tr('Events')).set({
				decorator: new qx.ui.decoration.RoundBorderBeveled('#E0E0E0', null, 1, 5, 5, 5, 5),
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				width: 170,
				height: 40,
				allowGrowX: false,
				allowGrowY: false,
				backgroundColor: '#D0D0D0',
				paddingLeft: 5
			});
			this._layoutContent.add(mainLabel);

			this._filterButtonAll = new eyeos.ui.tabs.Events.FilterButton(this, tr('All events'), eyeos.ui.tabs.Events.Page.FILTER_ALL);
			this._layoutContent.add(this._filterButtonAll);

			var filterButtonAnswer = new eyeos.ui.tabs.Events.FilterButton(this, tr('Pending Confirmation'), eyeos.ui.tabs.Events.Page.FILTER_ISQUESTION);
			this._layoutContent.add(filterButtonAnswer);
			
		},

		_buildSecondaryFiltersLayout: function () {
			this._buildByMethodFilter();
			this._buildBySectionsFilter();
			this._buildByDateFilter();
		},

		_buildByMethodFilter: function () {
			//By Method
			var methodLabel = new qx.ui.basic.Atom(tr('By Method'), this._arrowRightImage ).set({
				decorator: new qx.ui.decoration.RoundBorderBeveled('#E0E0E0', null, 1, 5, 5, 5, 5),
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				width: 170,
				height: 40,
				allowGrowX: false,
				allowGrowY: false,
				backgroundColor: '#D0D0D0',
				paddingLeft: 5,
				marginTop: 4
			});
			methodLabel.setUserData('open', false);
			this._layoutContent.add(methodLabel);

			var filterFromOther = new eyeos.ui.tabs.Events.FilterButton(this, tr('Received'), eyeos.ui.tabs.Events.Page.FILTER_FROMOTHER);
			this._layoutContent.add(filterFromOther);

			var filterFromMe = new eyeos.ui.tabs.Events.FilterButton(this, tr('Sent by me'), eyeos.ui.tabs.Events.Page.FILTER_FROMME);
			this._layoutContent.add(filterFromMe);

			filterFromMe.setVisibility('excluded');
			filterFromOther.setVisibility('excluded');
					
			methodLabel.addListener('click', function () {
				if ( methodLabel.getUserData('open') == true ) {
					methodLabel.setUserData('open', false);
					methodLabel.setIcon(this._arrowRightImage);
					filterFromMe.setVisibility('excluded');
					filterFromOther.setVisibility('excluded');
				} else {
					methodLabel.setUserData('open', true);
					methodLabel.setIcon(this._arrowBottomImage);
					filterFromMe.setVisibility('visible');
					filterFromOther.setVisibility('visible');
				}
			}, this);
		},

		_buildBySectionsFilter: function () {
			//By Sections
			var sectionsLabel = new qx.ui.basic.Atom(tr('By Sections'), this._arrowRightImage ).set({
				decorator: new qx.ui.decoration.RoundBorderBeveled('#E0E0E0', null, 1, 5, 5, 5, 5),
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				width: 170,
				height: 40,
				allowGrowX: false,
				allowGrowY: false,
				backgroundColor: '#D0D0D0',
				paddingLeft: 5,
				marginTop: 4
			});
			sectionsLabel.setUserData('open', false);
			this._layoutContent.add(sectionsLabel);

			var filterFiles = new eyeos.ui.tabs.Events.FilterButton(this, tr('Files'), eyeos.ui.tabs.Events.Page.FILTER_FILES);
			this._layoutContent.add(filterFiles);

			var filterSettings = new eyeos.ui.tabs.Events.FilterButton(this, tr('Settings'), eyeos.ui.tabs.Events.Page.FILTER_SETTINGS);
			this._layoutContent.add(filterSettings);

			var filterDashboard = new eyeos.ui.tabs.Events.FilterButton(this, tr('Dashboard'), eyeos.ui.tabs.Events.Page.FILTER_DASHBOARD);
			this._layoutContent.add(filterDashboard);

			var filterApplication = new eyeos.ui.tabs.Events.FilterButton(this, tr('Applications'), eyeos.ui.tabs.Events.Page.FILTER_APPLICATIONS);
			this._layoutContent.add(filterApplication);

			var filterPeople = new eyeos.ui.tabs.Events.FilterButton(this, tr('People'), eyeos.ui.tabs.Events.Page.FILTER_PEOPLE);
			this._layoutContent.add(filterPeople);
			
			var filterGroups = new eyeos.ui.tabs.Events.FilterButton(this, tr('Groups'), eyeos.ui.tabs.Events.Page.FILTER_GROUPS);
			this._layoutContent.add(filterGroups);

			filterFiles.setVisibility('excluded');
			filterSettings.setVisibility('excluded');
			filterDashboard.setVisibility('excluded');
			filterApplication.setVisibility('excluded');
			filterPeople.setVisibility('excluded');
			filterGroups.setVisibility('excluded');
					
			sectionsLabel.addListener('click', function () {
				if ( sectionsLabel.getUserData('open') == true ) {
					sectionsLabel.setUserData('open', false);
					sectionsLabel.setIcon(this._arrowRightImage);
					filterFiles.setVisibility('excluded');
					filterSettings.setVisibility('excluded');
					filterDashboard.setVisibility('excluded');
					filterApplication.setVisibility('excluded');
					filterPeople.setVisibility('excluded');
					filterGroups.setVisibility('excluded');
				} else {
					sectionsLabel.setUserData('open', true);
					sectionsLabel.setIcon(this._arrowBottomImage);
					filterFiles.setVisibility('visible');
					//filterSettings.setVisibility('visible');
					//filterDashboard.setVisibility('visible');
					//filterApplication.setVisibility('visible');
					filterPeople.setVisibility('visible');
					filterGroups.setVisibility('visible');
				}
			}, this);
		},

		_buildByDateFilter: function () {
			//By Date
			var dateLabel = new qx.ui.basic.Atom(tr('By Date'), this._arrowRightImage ).set({
				decorator: new qx.ui.decoration.RoundBorderBeveled('#E0E0E0', null, 1, 5, 5, 5, 5),
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				width: 170,
				height: 40,
				allowGrowX: false,
				allowGrowY: false,
				backgroundColor: '#D0D0D0',
				paddingLeft: 5,
				marginTop: 4
			});
			dateLabel.setUserData('open', false);
			this._layoutContent.add(dateLabel);

			var filterToday = new eyeos.ui.tabs.Events.FilterButton(this, tr('Today'), eyeos.ui.tabs.Events.Page.FILTER_TODAY);
			this._layoutContent.add(filterToday);

			var filterYesterday = new eyeos.ui.tabs.Events.FilterButton(this, tr('Yesterday'), eyeos.ui.tabs.Events.Page.FILTER_YESTERDAY);
			this._layoutContent.add(filterYesterday);

			var filterWeek = new eyeos.ui.tabs.Events.FilterButton(this, tr('This week'), eyeos.ui.tabs.Events.Page.FILTER_WEEK);
			this._layoutContent.add(filterWeek);

			var filterMonth = new eyeos.ui.tabs.Events.FilterButton(this, tr('This month'), eyeos.ui.tabs.Events.Page.FILTER_MONTH);
			this._layoutContent.add(filterMonth);

			filterToday.setVisibility('excluded');
			filterYesterday.setVisibility('excluded');
			filterWeek.setVisibility('excluded');
			filterMonth.setVisibility('excluded');
					
			dateLabel.addListener('click', function () {
				if ( dateLabel.getUserData('open') == true ) {
					dateLabel.setUserData('open', false);
					dateLabel.setIcon(this._arrowRightImage);
					filterToday.setVisibility('excluded');
					filterYesterday.setVisibility('excluded');
					filterWeek.setVisibility('excluded');
					filterMonth.setVisibility('excluded');
				} else {
					dateLabel.setUserData('open', true);
					dateLabel.setIcon(this._arrowBottomImage);
					filterToday.setVisibility('visible');
					filterYesterday.setVisibility('visible');
					filterWeek.setVisibility('visible');
					filterMonth.setVisibility('visible');
				}
			}, this);
		}
	}
});


