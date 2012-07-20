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

qx.Class.define('eyeos.calendar.view.GridCalendar', {
	extend: qx.ui.container.Composite,
	implement: [eyeos.calendar.IView],
	
	statics: {
		COLUMN_DAYS_MAX: 7,								// 1 week
		ROW_DAYS_MAX: 6,								// 6 weeks
		COLUMN_MONTHS_MAX: 4,
		ROW_MONTHS_MAX: 3,
		
		DAILY_HOUR_FROM: 0,
		DAILY_HOUR_TO: 24,
		
		HOUR_HEIGHT: 40,
		TIMES_HEADER_WIDTH: 40,
		SCROLLBAR_WIDTH: 17
	},
	
	/**
	 * TODO
	 * 
	 */
	construct: function () {
		arguments.callee.base.call(this);
		this.__instanceId = Math.round(Math.random() * 100000);
		this._init();
		
		qx.locale.Manager.getInstance().addListener('changeLocale', function(e) {
			this.refreshDate(undefined, true);
			this.refreshEvents();
		}, this);
	},
	
	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller',
			apply: '_applyController'
		}
	},
	
	members: {
		__instanceId: null,
		
		__eventDrawingContext: null,		// {event, table, day, eventsContainer, eventsContainerListenerIds(...)}
		__eventMovingContext: null,			// {event, table, day, eventsContainer}
		__mouseMoveFlag: false,
		
		__tablesContainer: null,
		__headerComponents: null,			// {dayLabel: ..., allDayEventsContainer: ...}[]
		__headerContainers: null,
		__tables: [],						// {table: ..., headerCells: ..., bodyCells: ..., watcher: ...}[]
		
		_currentMode: null,
		_currentPeriodMode: null,
		_internalDate: null,
		_monthsTable: null,
		_rowsHeaderContainer: null,
		_rowsHeaderSpacerLeft: null,
		
		
		__buildDaysTables: function(numTables, numDaysPerTable, displayTimeMarkers, scrollable, hourFrom, hourTo, dateFrom) {
			if (typeof numTables == 'undefined') {
				numTables = 1;
			}
			if (typeof numDaysPerTable == 'undefined') {
				numDaysPerTable = 7;
			}
			if (typeof displayTimeMarkers == 'undefined') {
				displayTimeMarkers = true;
			}
			if (typeof scrollable == 'undefined') {
				scrollable = false;
			}
			if (displayTimeMarkers) {
				if (typeof hourFrom == 'undefined') {
					hourFrom = 0;
				}
				if (typeof hourTo == 'undefined') {
					hourTo = 24;
				}
			}
			
			var mainContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			
			if (displayTimeMarkers) {
				var numHoursToDisplay = hourTo - hourFrom;
				mainContainer.set({
					height: numHoursToDisplay * this.self(arguments).HOUR_HEIGHT + 4,
					minHeight: numHoursToDisplay * this.self(arguments).HOUR_HEIGHT + 4
				});
			}
			
			for(var t = 0; t < numTables; t++) {
				if (this.__tables[t]) {
					if (this.__tables[t].table.getParent()) {
						this.__tables[t].table.free();
					}
					this.__tables[t].table.dispose();
				}
				
				var date = new Date(dateFrom);
                                
				this.__tables[t] = this.__createNewDaysTable(t, displayTimeMarkers, numDaysPerTable, hourFrom, hourTo, date);
				this.__tables[t].table.setStyle('height', (100 / numTables) + '%');
				mainContainer.getContentElement().add(this.__tables[t].table);
				dateFrom.setDate(dateFrom.getDate() + numDaysPerTable);
			}
			
			if (scrollable) {
				var scrollContainer = new qx.ui.container.Scroll();
				scrollContainer.add(mainContainer);
				return scrollContainer;
			}
			return mainContainer;
		},
		
		__buildMonthsTable: function() {
			//TODO
			return new qx.ui.container.Composite(new qx.ui.layout.HBox());
		},
		
		/**
		 * 
		 * return {
		 * 		table: {qx.html.Element},
		 * 		headerCells: {qx.html.Element[]},
		 * 		bodyCells: {qx.html.Element[]},
		 * 		eventsContainers: {eyeos.calendar.view.GridCalendar.EventsContainer[]}
		 * }
		 */
		__createNewDaysTable: function(tableId, displayTimeMarkers, numDays, hourFrom, hourTo, dateFrom) {
			var htmlTable = new qx.html.Element('table');
			htmlTable.setAttribute('border', 0);
			htmlTable.setStyle('border-width', '0px');
			htmlTable.setStyle('border-collapse', 'collapse');
			htmlTable.setStyle('width', '100%');
			
			var tableBody = new qx.html.Element('tbody');
			htmlTable.add(tableBody);

			var tableSummary = {
				table: htmlTable,
				headerCells: [],
				bodyCells: [],
				eventsContainers: [],
				watcher: new qx.core.Object()		//will dispatch a "ready" even once all the events containers will be added to the stage
			};
			tableSummary.watcher.setUserData('ready', false);
			
			//
			// <TR> CONTAINER FOR BACKGROUND (here called "header")
			//
			var trHeader = new qx.html.Element('tr');
			tableBody.add(trHeader);
			
			// if we display time markers, just create a thin row (1px) containing a larger <div> displaying
			// the time lines behind the second row that will hold the real content
			if (displayTimeMarkers) {
				trHeader.setStyle('height', '1px');
				
				// <TD> SPACE FOR TIME HEADERS
				var tdTimeHeadersSpacer = new qx.html.Element('td');
				tdTimeHeadersSpacer.setStyle('width', this.self(arguments).TIMES_HEADER_WIDTH - 1 + 'px');
				trHeader.add(tdTimeHeadersSpacer);
				
				// <TD> HOUR MARKERS (solid and dotted horizontal lines)
				tableSummary.headerCells[0] = new qx.html.Element('td');
				tableSummary.headerCells[0].setAttribute('colspan', numDays);
				trHeader.add(tableSummary.headerCells[0]);
				
				// container for lines
				var hourMarkersContainer = new qx.html.Element('div');
				hourMarkersContainer.setStyle('position', 'relative');
				hourMarkersContainer.setStyle('display', 'block');
				hourMarkersContainer.setStyle('height', '0px');
				tableSummary.headerCells[0].add(hourMarkersContainer);
				
				// Create horizontal lines
				for(var i = 0; i < (hourTo - hourFrom); i++) {
					//draw background lines
					var hourMarker = new qx.html.Element('div');
					hourMarker.setStyle('border-bottom', '1px dotted #d1d1d1');
					hourMarker.setStyle('border-top', '1px solid #d1d1d1');
					hourMarker.setStyle('height', (this.self(arguments).HOUR_HEIGHT / 2 - 1) + 'px');
					hourMarker.setStyle('margin-bottom', (this.self(arguments).HOUR_HEIGHT / 2 - 1) + 'px');
					hourMarkersContainer.add(hourMarker);
				}
			} else {
				trHeader.setStyle('height', '14px');
				
				for(var i = 0; i < numDays; i++) {
					// <TD> DATE
					tableSummary.headerCells[i] = new qx.html.Element('td');
					tableSummary.headerCells[i].setStyles({
						'background-color': '#ecf2f9',
						'border-right': '1px solid #e4e4e4',
						'color': '#80878d',
						'font': '10px Arial,sans-serif',
						'line-height': '11px',
						'text-align': 'right'
					});
					trHeader.add(tableSummary.headerCells[i]);
				}
			}
			
			//
			// <TR> CONTAINER FOR DAYS CONTENTS (here called "body")
			//
			var trBody = new qx.html.Element('tr');
			tableBody.add(trBody);
			
			if (displayTimeMarkers) {
				// <TD> TIMES (00:00, 01:00, ...)
				var tdTimeHeaders = new qx.html.Element('td');
				tdTimeHeaders.setStyles({
					'border': '1px solid #d1d1d1',
					'width': this.self(arguments).TIMES_HEADER_WIDTH - 1 + 'px',
					'min-width': this.self(arguments).TIMES_HEADER_WIDTH - 1 + 'px',
					'max-width': this.self(arguments).TIMES_HEADER_WIDTH - 1 + 'px',
					'background-color': '#edf3fb',
					'vertical-align': 'top'
				});
				trBody.add(tdTimeHeaders);
				
				// Create times labels (1st column)
				for(var i = 0; i < (hourTo - hourFrom); i++) {
					// container for label (stylable but cannot contain plain text)
					var container = new qx.html.Element('div');
					if (i > 0) {
						container.setStyle('border-top', '1px solid #d1d1d1');
					} else {
						container.setStyle('margin-top', '-1px');
					}
					container.setStyle('width', '100%');
					container.setStyle('height', (this.self(arguments).HOUR_HEIGHT - 1) + 'px');
					container.setStyle('text-align', 'center');
					container.setStyle('font-size', '9px');
					tdTimeHeaders.add(container);
					
					// time label
					var timeHeader = new qx.html.Label();
					timeHeader.setRich(true);
					timeHeader.setStyle('color', '#7f868d');
					var hour = hourFrom + i;
					hour = hour < 10? '0' + hour : hour;
					timeHeader.setValue(hour +':00');
					container.add(timeHeader);
				}
			}
			
			var now = new Date();
			var date = new Date(dateFrom);
			
			// <TD> DAYS CONTENTS (column 2 to [2 or 6])
			for (var d = 0; d < numDays; d++) {
				var td = new qx.html.Element('td');
				trBody.add(td);
				td.setStyle('border-right', '1px solid #e4e4e4');
				td.setStyle('padding', '0');
				
				var elId = 'day-' + this.__instanceId + '-' + tableId + '-' + d;
				tableSummary.bodyCells[d] = new qx.html.Element('div');
				tableSummary.bodyCells[d].setAttribute('id', elId);
				tableSummary.bodyCells[d].setStyles({
					'position': 'relative',
					'display': 'block',
					'width': '100%',
					'min-width': '100%',
					'max-width': '100%'
				});
				
				if (displayTimeMarkers) {
					td.setStyles({
						'width': (100 / numDays) + '%',
						'min-width': (100 / numDays) + '%',
						'max-width': (100 / numDays) + '%',
						'height': '100%'
					});
					
					tableSummary.bodyCells[d].setStyle('height', ((hourTo - hourFrom) * this.self(arguments).HOUR_HEIGHT + 4) + 'px');
					//...
				} else {
					td.setStyles({
						'height': '100%',
						'width': (100 / numDays) + 'px',
						'min-width': (100 / numDays) + 'px',			// works?
						'max-width': (100 / numDays) + 'px',			// works?
						'border-bottom': '1px solid #e4e4e4'
					});
					tableSummary.bodyCells[d].setStyles({
						'width': '100%',
						'height': '100%'
					});
				}
				
				//deferred integration of the events container as a Qooxdoo Widget inside our HTML table
				tableSummary.bodyCells[d].addListenerOnce('appear', function(elId, day, date) {
					return function(e) {
						var mode = displayTimeMarkers ?
							eyeos.calendar.view.GridCalendar.EventsContainer.MODE_PLANNING
							: eyeos.calendar.view.GridCalendar.EventsContainer.MODE_STACK;
						
						var eventsContainer = new eyeos.calendar.view.GridCalendar.EventsContainer(
							document.getElementById(elId),
							this,
							mode
						).set({
							date: date
						});
						
						tableSummary.eventsContainers[day] = eventsContainer;
						
						if (day == numDays - 1) {
							// The last container has been created, so we can consider that the table is now ready
							tableSummary.watcher.setUserData('ready', true);
							tableSummary.watcher.fireEvent('ready');
						}
					}
				}(elId, d, new Date(date)), this);
				
				td.add(tableSummary.bodyCells[d]);
				
				// Add today marker
				if (date.isSameDay(now)) {
					var todayMarker = new qx.html.Element('div');
					todayMarker.setStyles({
						'position': 'relative',
						'display': 'block',
						'width': '100%',
						'min-width': '100%',
						'max-width': '100%',
						'height': '100%',
						'background-color': '#4886ce',
						'opacity': '0.1',
						'z-index': '-1',
						'top': '-100%'
					});
					td.add(todayMarker);
				}
				
				date.setDate(date.getDate() + 1);
			}
			
			return tableSummary;
		},
		
		/**
		 * @see this.displayEvents()
		 */
		__displayEventsInTable: function(tableNum, events) {
			for(j = 0; j < this.__tables[tableNum].eventsContainers.length; j++) {
				if (typeof this.__tables[tableNum].eventsContainers[j].displayEvents == 'undefined') {
					typeof this.__tables[tableNum].eventsContainers[j];
					eyeos.consoleError('GridCalendar.__tables[' + tableNum + '].eventsContainers[' + j + '] is undefined');
					return;
				}
				this.__tables[tableNum].eventsContainers[j].displayEvents(events);
			}
		},
		
		_applyController: function(value, old) {
			value.addListener('changeCalendarVisibility', function(e) {
				this.refreshEvents();
			}, this);
			value.addListener('loadEvents', function(e) {
				this.refreshDate(value.getCalendarSelectedDate());
				this.refreshEvents();
			}, this);
			value.addListener('changeCalendarMode', function(e) {
				this.refreshDate(value.getCalendarSelectedDate());
				this.refreshEvents();
			}, this);
			value.addListener('changeCalendarPeriodMode', function(e) {
				this.refreshDate(value.getCalendarSelectedDate());
				this.refreshEvents();
			}, this);
			value.addListener('changeCalendarCurrentPeriod', function(e) {
				this.refreshDate(value.getCalendarSelectedDate());
				this.refreshEvents();
			}, this);
			value.addListener('changeCalendarSelectedDate', function(e) {
				this.refreshDate(value.getCalendarSelectedDate());
				this.refreshEvents();
			}, this);
			value.addListener('createEvent', function(e) {
				this.displayEvents([e.getData()]);
			}, this);
			
		},
		
		_init: function() {
			this.setLayout(new qx.ui.layout.VBox(3));
			
			//
			//	FIRST ROW: Header (days header + all-day events)
			//
			var headersContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(-1));
			this._rowsHeaderSpacerLeft = new qx.ui.core.Spacer().set({
				width: this.self(arguments).TIMES_HEADER_WIDTH + 2,
				allowStretchX: false
			});
			headersContainer.add(this._rowsHeaderSpacerLeft);
			
			this.__headerComponents = new Array();
			this.__headerContainers = new Array();
			for(var i = 0; i < 7; i++) {
				var headerComponentData = {
					dayLabel: new qx.ui.basic.Label().set({
						allowGrowX: true,
						textColor: '#b2b5b8',
						backgroundColor: '#fdfdfd',
						textAlign: 'center'
					}),
					allDayEventsContainer: new qx.ui.container.Composite(new qx.ui.layout.VBox(1)).set({
						allowGrowX: true,
						minHeight: 18,
						backgroundColor: '#fdfdfd',
						decorator: new qx.ui.decoration.Beveled('#cacdce', null, 50)
					})
				};
				this.__headerComponents[i] = headerComponentData;
				this.__headerContainers[i] = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
					marginLeft: 0
				});
                                
				this.__headerContainers[i].add(headerComponentData.dayLabel, {flex: 1});
				this.__headerContainers[i].add(headerComponentData.allDayEventsContainer, {flex: 1});
				headersContainer.add(this.__headerContainers[i], {flex: 1});
			}
			this.add(headersContainer);
			
			this._rowsHeaderSpacerRight = new qx.ui.core.Spacer().set({
				width: 17,
				allowStretchX: false
			});
			headersContainer.add(this._rowsHeaderSpacerRight);
			
			
			//
			//	SECOND ROW: Body (rows header + main events grid)
			//
			this.__tablesContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			this.add(this.__tablesContainer, {flex: 1});
		},
		
		_refreshDate_calendarDayMode: function(date) {
			for(var i = 1; i < 7; i++) {
				this.__headerContainers[i].setVisibility('excluded');
			}
			this._showRowHeaderSpacers(true);
			this.__tablesContainer.removeAll();
			var dateFrom = new Date(date);
			dateFrom.setHours(0);
			dateFrom.setMinutes(0);
			dateFrom.setSeconds(0);
			dateFrom.setMilliseconds(0);
			
			this.__tablesContainer.add(this.__buildDaysTables(1, 1, true, true, 0, 24, dateFrom), {flex: 1});
			
			var weekDay = qx.locale.Date.getDayName('wide', date.getDay());
			this.__headerComponents[0].dayLabel.setValue(weekDay + ' ' + eyeos.calendar.Constants.GetAbbreviatedDate(date));
		},
		
		_refreshDate_calendarMonthMode: function(date) {
			for (var i = 1; i < 7; i++) {
                 this.__headerContainers[i].setVisibility('visible');
			}
                        
			this._showRowHeaderSpacers(false);
			this.__tablesContainer.removeAll();
			
			var iDate = new Date(date);
			iDate.setDate(1);
			iDate.setHours(0);
			iDate.setMinutes(0);
			iDate.setSeconds(0);
			iDate.setMilliseconds(0);
			iDate = iDate.getLocalizedFirstDayOfWeek();
			this.__tablesContainer.add(this.__buildDaysTables(6, 7, false, false, 0, 24, new Date(iDate)), {flex: 1});
			
			for(var week = 0; week < 6; week++) {
				for (var day = 0; day < 7; day++) {
					var cellHeader = new qx.html.Element();
					cellHeader.useMarkup('<span>' + iDate.getDate() + '</span>');
					this.__tables[week].headerCells[day].add(cellHeader);
					iDate = new Date(iDate.getTime() + 24 * 60 * 60 * 1000);			// day = day + 1
				}
			}
            for(i = 0; i < 7; i++) {
				var weekDay = qx.locale.Date.getDayName('abbreviated', iDate.getDay());
				this.__headerComponents[i].dayLabel.setValue(weekDay);
				iDate.setDate(iDate.getDate() + 1);
			}
		},
		
		_refreshDate_calendarWeekMode: function(date) {
			var dateFrom = new Date(date.getLocalizedFirstDayOfWeek());
			dateFrom.setHours(0);
			dateFrom.setMinutes(0);
			dateFrom.setSeconds(0);
			dateFrom.setMilliseconds(0);
			
			// Already in this mode? => Clear and re-use widgets
			if (this._currentPeriodMode == eyeos.calendar.Constants.PERIOD_MODE_WEEK) {
				var dateTmp = new Date(dateFrom);
				for(i = 0; i < 7; i++) {
					this.__tables[0].eventsContainers[i].clearEvents();
					this.__tables[0].eventsContainers[i].setDate(new Date(dateFrom));
					dateFrom.setDate(dateFrom.getDate() + 1);
				}
			} else {
				var i;
				for(i = 1; i < 7; i++) {
					this.__headerContainers[i].setVisibility('visible');
				}
				this._showRowHeaderSpacers(true);
				this.__tablesContainer.removeAll();
				this.__tablesContainer.add(this.__buildDaysTables(1, 7, true, true, 0, 24, dateFrom), {flex: 1});
			}
			
			var iDate = date.getLocalizedFirstDayOfWeek();
			for(i = 0; i < 7; i++) {
				var weekDay = qx.locale.Date.getDayName('abbreviated', iDate.getDay());
				this.__headerComponents[i].dayLabel.setValue(weekDay + ' ' + eyeos.calendar.Constants.GetAbbreviatedDate(iDate));
				iDate.setDate(iDate.getDate() + 1);
			}
		},
		
		_showRowHeaderSpacers: function(show) {
			//qx.ui.core.Spacer.setVisibility() does not exist so we emulate it
			if (show) {
				this._rowsHeaderSpacerLeft.setWidth(this.self(arguments).TIMES_HEADER_WIDTH + 2);
				this._rowsHeaderSpacerRight.setWidth(this.self(arguments).SCROLLBAR_WIDTH - 1);
			} else {
				this._rowsHeaderSpacerLeft.setWidth(0);
				this._rowsHeaderSpacerRight.setWidth(0);
			}
		},
		
		clearEvents: function() {
			// Clear table headers
			for(i = 0; i < this.__tables.length; i++) {
				//TODO
			}
			
			// Clear table body
			for(i = 0; i < this.__tables.length; i++) {
				for(j = 0; j < this.__tables[i].eventsContainers.length; j++) {
					this.__tables[i].eventsContainers[j].clearEvents();
				}
			}
		},
		
		/**
		 * 
		 * @param events {Array}
		 */
		displayEvents: function(events) {
			//eyeos.consoleLog('GridCalendar.displayEvents()');
			
			if (this.__tables.length == 0) {
				eyeos.consoleError('GridCalendar.__tables is empty');
			}
			for(i = 0; i < this.__tables.length; i++) {
				// Add a listener to defer events display process if the table is not ready yet
				var listenerId = this.__tables[i].watcher.addListenerOnce('ready', function(self, i) {
					return function(e) { this.__displayEventsInTable.call(self, i, events); }
				}(this, i), this);
				
				// If it's already ready, remove the previous listener and display the events right now
				if (this.__tables[i].watcher.getUserData('ready') == true) {
					this.__tables[i].watcher.removeListenerById(listenerId);
					this.__displayEventsInTable.call(this, i, events);
				}
			}
		},
		
		/**
		 * TODO
		 * 
		 * @param date {Date}
		 * @param forceRefresh {Boolean ? false}
		 */
		refreshDate: function(date, forceRefresh) {
			//
			//		...
			//
			if (typeof date == 'undefined') {
				date = this._internalDate;
			}
			// Nothing has changed, do not redraw
			if (!forceRefresh && this.getController().getCalendarMode() == this._currentMode
				&& this.getController().getCalendarPeriodMode() == this._currentPeriodMode
				&& this.getController().getCalendarSelectedDate().isSameDay(this._internalDate)) {
				return;
			} else {
				eyeos.consoleGroup('GridCalendar refresh');
				eyeos.consoleLog('Old mode: ' + this._currentMode + ' / New mode: ' + this.getController().getCalendarMode());
				eyeos.consoleLog('Old period mode: ' + this._currentPeriodMode + ' / New period mode: ' + this.getController().getCalendarPeriodMode());
				eyeos.consoleLog('Old date: ' + this._internalDate + ' / New date: ' + this.getController().getCalendarSelectedDate());
				eyeos.consoleGroupEnd('GridCalendar refresh');
			}
			switch(this.getController().getCalendarMode()) {
				case eyeos.calendar.Constants.MODE_CALENDAR:
					switch(this.getController().getCalendarPeriodMode()) {
						case eyeos.calendar.Constants.PERIOD_MODE_DAY:
							this._refreshDate_calendarDayMode(date);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
							this._refreshDate_calendarWeekMode(date);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
							this._refreshDate_calendarMonthMode(date);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
							//TODO
							eyeos.alert(tr('Year mode is not available yet')+'...');
					}
					break;
					
				case eyeos.calendar.Constants.MODE_AGENDA:
					//TODO
					eyeos.alert(tr('Agenda is not available yet')+'...');
			}
			this._internalDate = new Date(date);
			this._currentMode = this.getController().getCalendarMode();
			this._currentPeriodMode = this.getController().getCalendarPeriodMode();
		},
		
		refreshEvents: function() {
			eyeos.consoleLog('[GridCalendar] refreshEvents()');
			
			this.clearEvents();
			
			var controller = this.getController();
			var calendars = controller.getCalendars();
			for(var id in calendars) {
				if (calendars[id].isVisible()) {
					var events = this.getController().getAllEventsFromPeriod(
						id,
						controller.getCalendarCurrentPeriod().begin,
						controller.getCalendarCurrentPeriod().end
					);
					this.displayEvents(events);
					//console.log(events);
				}
			}
			
			calendars = controller.getGroupcalendars();
			for(var id in calendars) {
				if (calendars[id].isVisible()) {
					var events = this.getController().getAllEventsFromPeriod(
						id,
						controller.getCalendarCurrentPeriod().begin,
						controller.getCalendarCurrentPeriod().end
					);
					this.displayEvents(events);
					//console.log(events);
				}
			}
            
			calendars = controller.getRemotecalendars();
			for(var id in calendars) {
				if (calendars[id].isVisible()) {
					var events = this.getController().getAllEventsFromPeriod(
						id,
						controller.getCalendarCurrentPeriod().begin,
						controller.getCalendarCurrentPeriod().end
					);
					this.displayEvents(events);
					//console.log(events);
				}
			}
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});