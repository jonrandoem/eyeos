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
 * The Page for Events tabs
 *
 */

qx.Class.define('eyeos.ui.tabs.Events.Page', {
	extend: qx.ui.tabview.Page,

	statics: {
		FILTER_ALL: 0,
		FILTER_ISQUESTION: 1,
		FILTER_FROMOTHER: 2,
		FILTER_FROMME: 3,
		FILTER_FILES: 4,
		FILTER_SETTINGS: 5,
		FILTER_DASHBOARD: 6,
		FILTER_APPLICATIONS: 7,
		FILTER_PEOPLE: 8,
		FILTER_GROUPS: 9,
		FILTER_TODAY: 10,
		FILTER_YESTERDAY: 11,
		FILTER_WEEK: 12,
		FILTER_MONTH: 13
	},

	construct: function (checknum) {
		this.base(arguments, tr('Events'));

		this.getChildControl("button").addListener('click', function() {
			this.getChildControl("button").blur();
		}, this);

		this._checknum = checknum;
		
		this._buildGui();
		this._updatePageByFilter(eyeos.ui.tabs.Events.Page.FILTER_ALL);
	},

	members: {
		_checknum: null,
		_sidebar: null,
		_search: null,
		_events: null,
		_table: null,
		_mainLabel: null,
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox()
			});

			//SIDEBAR
			this._sidebar = new eyeos.ui.tabs.Events.Sidebar(this);
			this.add(this._sidebar);

			var rightContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({
					alignY: 'top'
				}),
				padding: 10
			});
			this.add(rightContainer, {flex: 1});

			//MAIN LABEL

			var firstRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				})
			});
			rightContainer.add(firstRow);

			firstRow.add(new qx.ui.core.Spacer(), {flex: 1});
			this._mainLabel = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana'])
			});
			firstRow.add(this._mainLabel);
			firstRow.add(new qx.ui.core.Spacer(), {flex: 1});
			//SEARCH
			this._search = new eyeos.ui.tabs.Events.Search();
			firstRow.add(this._search);

			//TABLE
			this._table = new eyeos.ui.tabs.Events.Table(this._checknum);
			rightContainer.add(this._table, {flex: 1});

			this._addMyListeners();
		},
		
		_addMyListeners: function () {
			this._sidebar.addListener('selectFilter', function (e) {
				this._refreshContent();
			}, this);

			this._search.addListener('searchFilter', function (e) {
				var filter = e.getData();
				this._table.filterByText(filter);
			}, this);

			var bus = eyeos.messageBus.getInstance();

            bus.addListener('eyeos_events_newEvent', function() {
				this._refreshContent();
			}, this);

            bus.addListener('eyeos_events_updateEvent', function() {
				this._refreshContent();
			}, this);
		},

		_refreshContent: function () {
			this._updatePageByFilter(this._sidebar.getSelectedFilter());
		},

		_updatePageByFilter: function (filter) {
			this._populateLayout(filter);
			this._updateMainLabel(filter);
		},

		_updateMainLabel: function (filter) {
			switch (filter) {
				case eyeos.ui.tabs.Events.Page.FILTER_ALL:
					this._mainLabel.setValue(tr('All events'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_ISQUESTION:
					this._mainLabel.setValue(tr('Pending Confirmation'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_FROMOTHER:
					this._mainLabel.setValue(tr('Received'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_FROMME:
					this._mainLabel.setValue(tr('Sent by me'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_FILES:
					this._mainLabel.setValue(tr('Files'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_SETTINGS:
					this._mainLabel.setValue(tr('Settings'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_DASHBOARD:
					this._mainLabel.setValue(tr('Dashboard'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_APPLICATIONS:
					this._mainLabel.setValue(tr('Applications'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_PEOPLE:
					this._mainLabel.setValue(tr('People'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_GROUPS:
					this._mainLabel.setValue(tr('Groups'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_TODAY:
					this._mainLabel.setValue(tr('Today'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_YESTERDAY:
					this._mainLabel.setValue(tr('Yesterday'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_WEEK:
					this._mainLabel.setValue(tr('This week'));
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_MONTH:
					this._mainLabel.setValue(tr('This month'));
				break;
			}
		},

		_populateLayout: function (filter) {
			switch (filter) {
				case eyeos.ui.tabs.Events.Page.FILTER_ALL:
					this._populateLayoutByAll();
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_ISQUESTION:
					this._populateLayoutByIsQuestion();
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_FROMOTHER:
					this._populateLayoutByReceiver(eyeos.ui.tabs.Events.Page.FILTER_FROMOTHER);
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_FROMME:
					this._populateLayoutByReceiver(eyeos.ui.tabs.Events.Page.FILTER_FROMME);
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_FILES:
					this._populateLayoutByType('Files');
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_SETTINGS:
					this._populateLayoutByType('Settings');
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_DASHBOARD:
					this._populateLayoutByType('Dashboard');
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_APPLICATIONS:
					this._populateLayoutByType('Application');
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_PEOPLE:
					this._populateLayoutByType('People');
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_GROUPS:
					this._populateLayoutByType('Groups');
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_TODAY:
					this._populateLayoutByDate(eyeos.ui.tabs.Events.Page.FILTER_TODAY);
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_YESTERDAY:
					this._populateLayoutByDate(eyeos.ui.tabs.Events.Page.FILTER_YESTERDAY);
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_WEEK:
					this._populateLayoutByDate(eyeos.ui.tabs.Events.Page.FILTER_WEEK);
				break;
				case eyeos.ui.tabs.Events.Page.FILTER_MONTH:
					this._populateLayoutByDate(eyeos.ui.tabs.Events.Page.FILTER_MONTH);
				break;
			}
		},
		
		/**
		 * PopulateLayout with all not endend events
		 */
		_populateLayoutByAll: function () {
                        //modified to stackable
			eyeos.callMessage(this._checknum, '__Events_retrieveAllEventNotifications', null, function (results) {
				this._saveEvents(results);
				this._table.printEvents(this._events);
			}, this);
		},
		
		/**
		 * PopulateLayout with all events that have a question
		 */
		_populateLayoutByIsQuestion: function () {
			eyeos.callMessage(this._checknum, '__Events_retrieveAllQuestionEvents', null, function (results) {
				this._saveEvents(results);
				this._table.printEvents(this._events);
			}, this);
		},

		/**
		 * PopulateLayout providing the type of the events
		 */
		_populateLayoutByType: function (filter) {
			var params = {
				type: filter
			};
			eyeos.callMessage(this._checknum, '__Events_retrieveAllEventsByType', params, function (results) {
				this._saveEvents(results);
				this._table.printEvents(this._events);
			}, this);
		},

		_populateLayoutByDate: function (filter) {
			var diffDays = null;
			switch (filter) {
				case eyeos.ui.tabs.Events.Page.FILTER_TODAY:
					diffDays = 1;
					break;
				case eyeos.ui.tabs.Events.Page.FILTER_YESTERDAY:
					diffDays = 2;
					break;
				case eyeos.ui.tabs.Events.Page.FILTER_WEEK:
					diffDays = 7;
					break;
				case eyeos.ui.tabs.Events.Page.FILTER_MONTH:
					diffDays = 31;
					break;
			}
			var params = {
				numberDays: diffDays
			};
			eyeos.callMessage(this._checknum, '__Events_retrieveAllEventsByDate', params, function (results) {
				this._saveEvents(results);
				this._table.printEvents(this._events);
			}, this);
		},

		_populateLayoutByReceiver: function (filter) {
			var sender = null;
			switch (filter) {
				case eyeos.ui.tabs.Events.Page.FILTER_FROMME:
					sender = 'me';
					break;
				case eyeos.ui.tabs.Events.Page.FILTER_FROMOTHER:
					sender = 'other';
					break;
			}

			var params = {
				sender: sender
			};
			eyeos.callMessage(this._checknum, '__Events_retrieveAllEventsBySender', params, function (results) {
				this._saveEvents(results);
				this._table.printEvents(this._events);
			}, this);
			
		},

		/**
		 * Save the events
		 */
		_saveEvents: function (events) {
			this._events = new Array;
			for (var i = 0; i < events.length; ++i) {
				this._events.push(new eyeos.events.Event(events[i]));
			}
		}
	}
});


