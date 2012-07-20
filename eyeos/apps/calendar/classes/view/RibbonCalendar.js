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

qx.Class.define('eyeos.calendar.view.RibbonCalendar', {
	extend: qx.ui.container.Composite,
	implement: [eyeos.calendar.IView],
	
	statics: {
		NUM_ATOMS_DAY: 34,
		NUM_ATOMS_WEEK: 34,
		NUM_ATOMS_MONTH: 8,
		NUM_ATOMS_YEAR: 12,
		NUM_ATOMS_MAX: 34			//must be updated if previous values are changed
	},
	
	/**
	 * TODO
	 * 
	 */
	construct: function () {
		arguments.callee.base.call(this);
		this._init();
		
		qx.locale.Manager.getInstance().addListener('changeLocale', function(e) {
			this.refresh();
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
		
		_atomsLabels: null,
		_currentPeriod: {
			begin: 0,				//timestamp
			end: 0					//timestamp
		},
		_currentPeriodMode: null,
		_labelsGrid: null,
		_selectedDay: null,
		
		
		_applyController: function(value, old) {
			value.addListener('changeCalendarMode', function(e) {
				this.refresh();
			}, this);
			value.addListener('changeCalendarPeriodMode', function(e) {
				this.refresh();
			}, this);
			value.addListener('changeCalendarCurrentPeriod', function(e) {
				this.refresh();
			}, this);
			value.addListener('changeCalendarSelectedDate', function(e) {
				this.refresh();
			}, this);
			this.refresh();
		},
		
		_init: function() {
			this.setLayout(new qx.ui.layout.Dock());
			this.setHeight(22);
			this.setMaxHeight(22);
			this.setPadding(2);
			this.setDecorator(new qx.ui.decoration.Beveled('#4886ce', '#4886ce', 100).set({
				backgroundColor: '#4886ce'
			}));
		
			var arrowLeft = new qx.ui.basic.Atom(null, 'index.php?extern=images/arrowLeft.png').set({
				alignY: 'middle',
				center: true,
				cursor: 'pointer',
				width: 14
			});
			arrowLeft.addListener('click', this._onArrowLeftClick, this);
			this.add(arrowLeft, {edge: 'west'});
			
			var arrowRight = new qx.ui.basic.Atom(null, 'index.php?extern=images/arrowRight.png').set({
				alignY: 'middle',
				center: true,
				cursor: 'pointer',
				width: 14
			});
			arrowRight.addListener('click', this._onArrowRightClick, this);
			this.add(arrowRight, {edge: 'east'});
		
			this._labelsGrid = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			this.add(this._labelsGrid, {edge: 'center', flex: 1});
			
			this._atomsLabels = new Array();
			for(var i = 0; i < this.self(arguments).NUM_ATOMS_MAX; i++) {
				var label = new qx.ui.basic.Label().set({
					allowGrowX: true,
					textAlign: 'center',
					cursor: 'pointer',
					textColor: '#ffffff',
					rich: true
				});
				label.addListener('click', this._onAtomClick, this);
				this._atomsLabels[i] = label;
				this._labelsGrid.add(label, {flex: 1});
			}
		},
		
		_onArrowLeftClick: function(e) {
			var newDate = new Date(this.getController().getCalendarSelectedDate());
			switch(this.getController().getCalendarMode()) {
				case eyeos.calendar.Constants.MODE_CALENDAR:
					switch(this._currentPeriodMode) {
						case eyeos.calendar.Constants.PERIOD_MODE_DAY:
							newDate.setDate(newDate.getDate() - 1);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
							newDate.setDate(newDate.getDate() - 7);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
							newDate.setMonth(newDate.getMonth() - 1);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
							newDate.setFullYear(newDate.getFullYear() - 1);
					}
					break;
					
				case eyeos.calendar.Constants.MODE_AGENDA:
					//TODO
			}
			this.getController().setCalendarSelectedDate(newDate);
		},
		
		_onArrowRightClick: function(e) {
			var newDate = new Date(this.getController().getCalendarSelectedDate());
			switch(this.getController().getCalendarMode()) {
				case eyeos.calendar.Constants.MODE_CALENDAR:
					switch(this._currentPeriodMode) {
						case eyeos.calendar.Constants.PERIOD_MODE_DAY:
							newDate.setDate(newDate.getDate() + 1);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
							newDate.setDate(newDate.getDate() + 7);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
							newDate.setMonth(newDate.getMonth() + 1);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
							newDate.setFullYear(newDate.getFullYear() + 1);
					}
					break;
					
				case eyeos.calendar.Constants.MODE_AGENDA:
					//TODO
			}
			this.getController().setCalendarSelectedDate(newDate);
		},
		
		_onAtomClick: function(e) {			
			var model = e.getTarget().getUserData('model');
			eyeos.consoleLog('[eyeos.calendar.view.RibbonCalendar] _onAtomClick(): ' + model);
			if (model != this._selectedDate) {
				this.getController().setCalendarSelectedDate(model);
			}
		},
		
		_refresh_agendaMode: function(date) {
			//TODO
		},
		
		_refresh_calendarDayMode: function(date) {
			//IF we've just changed the period mode OR the new date is outside the currently displayed period THEN update the whole display
			if (this.getController().getCalendarPeriodMode() != this._currentPeriodMode || date < this._currentPeriod.begin || date > this._currentPeriod.end) {				
				var begin = new Date(date);
				begin.setDate(-1);
				
				var end = new Date(date);
				end.setMonth(end.getMonth() + 1);
				end.setDate(1);
				
				var iDate = new Date(begin);
				var i;
				for(i = 0; i < this.self(arguments).NUM_ATOMS_DAY; i++) {
					if (iDate.getMonth() == date.getMonth()) {
						if (iDate.getDate() == date.getDate()) {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + iDate.getDate() + '</span>');
							this._atomsLabels[i].setBackgroundColor('#7baae0');
						} else {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + iDate.getDate() + '</span>');
							this._atomsLabels[i].resetBackgroundColor();
						}
					} else {
						this._atomsLabels[i].setValue('<span style="color: #9bbbe0; font-weight: normal">' + iDate.getDate() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
					this._atomsLabels[i].setUserData('model', new Date(iDate));
					this._atomsLabels[i].setVisibility('visible');
					iDate = new Date(iDate.getTime() + 24 * 60 * 60 * 1000);	// day = day + 1
				}
				//hide remaining labels
				for(; i < this.self(arguments).NUM_ATOMS_MAX; i++) {
					this._atomsLabels[i].setVisibility('excluded');
				}
				
				this._currentPeriod.begin = new Date(date).setDate(1);			// 1st day of the month
				this._currentPeriod.end = new Date(date);
				this._currentPeriod.end.setMonth(date.getMonth() + 1);
				this._currentPeriod.end.setDate(-1);							// last day of the month
			} else {
				//otherwise, just update the styles of the labels
				var iDate = null;
				for(var i = 0; i < this.self(arguments).NUM_ATOMS_DAY; i++) {
					iDate = this._atomsLabels[i].getUserData('model');
					if (iDate.getMonth() == date.getMonth()) {
						if (iDate.getDate() == date.getDate()) {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + iDate.getDate() + '</span>');
							this._atomsLabels[i].setBackgroundColor('#7baae0');
						} else {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + iDate.getDate() + '</span>');
							this._atomsLabels[i].resetBackgroundColor();
						}
					} else {
						this._atomsLabels[i].setValue('<span style="color: #9bbbe0; font-weight: normal">' + iDate.getDate() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
				}
			}
		},
		
		_refresh_calendarMonthMode: function(date) {
			//IF we've just changed the period mode OR the new date is outside the currently displayed period THEN update the whole display
			if (this.getController().getCalendarPeriodMode() != this._currentPeriodMode || date < this._currentPeriod.begin || date > this._currentPeriod.end) {				
				var begin = new Date(date);
				begin.setMonth(begin.getMonth() - (this.self(arguments).NUM_ATOMS_MONTH / 2 - 1));		//~3 months before
				
				var end = new Date(date);
				end.setMonth(end.getMonth() + (this.self(arguments).NUM_ATOMS_MONTH / 2));				//~4 months after
				
				var iDate = new Date(begin);
				var i;
				for(i = 0; i < this.self(arguments).NUM_ATOMS_MONTH; i++) {
					var monthName = qx.locale.Date.getMonthName('abbreviated', iDate.getMonth());
					if (iDate.getFullYear() == date.getFullYear()) {
						if (iDate.getMonth() == date.getMonth()) {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + monthName + ' ' + iDate.getFullYear() + '</span>');
							this._atomsLabels[i].setBackgroundColor('#7baae0');
						} else {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + monthName + ' ' + iDate.getFullYear() + '</span>');
							this._atomsLabels[i].resetBackgroundColor();
						}
					} else {
						this._atomsLabels[i].setValue('<span style="color: #9bbbe0; font-weight: normal">' + monthName + ' ' + iDate.getFullYear() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
					this._atomsLabels[i].setUserData('model', new Date(iDate));
					this._atomsLabels[i].setVisibility('visible');
					iDate.setMonth(iDate.getMonth() + 1);
				}
				//hide remaining labels
				for(; i < this.self(arguments).NUM_ATOMS_MAX; i++) {
					this._atomsLabels[i].setVisibility('excluded');
				}
				
				begin.setDate(1);
				this._currentPeriod.begin = begin;
				end.setMonth(end.getMonth() + 1);
				end.setDate(-1);
				this._currentPeriod.end = end;
			} else {
				//otherwise, just update the styles of the labels
				var iDate = null;
				for(i = 0; i < this.self(arguments).NUM_ATOMS_MONTH; i++) {
					iDate = this._atomsLabels[i].getUserData('model');
					var monthName = qx.locale.Date.getMonthName('abbreviated', iDate.getMonth());
					if (iDate.getFullYear() == date.getFullYear()) {
						if (iDate.getMonth() == date.getMonth()) {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + monthName + ' ' + iDate.getFullYear() + '</span>');
							this._atomsLabels[i].setBackgroundColor('#7baae0');
						} else {
							this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + monthName + ' ' + iDate.getFullYear() + '</span>');
							this._atomsLabels[i].resetBackgroundColor();
						}
					} else {
						this._atomsLabels[i].setValue('<span style="color: #aaaaaa; font-weight: normal">' + monthName + ' ' + iDate.getFullYear() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
				}
			}
		},
		
		_refresh_calendarWeekMode: function(date) {
			//IF we've just changed the period mode OR the new date is outside the currently displayed period THEN update the whole display
			if (this.getController().getCalendarPeriodMode() != this._currentPeriodMode || date < this._currentPeriod.begin || date > this._currentPeriod.end) {
				var oneWeek =  7 * 24 * 60 * 60 * 1000;
				
				var begin = new Date(date.getTime() - (Math.floor(this.self(arguments).NUM_ATOMS_WEEK / 2) - 1) * oneWeek);	// ~16 weeks before
				var end = new Date(date.getTime() + Math.floor(this.self(arguments).NUM_ATOMS_WEEK / 2) * oneWeek);			// 17 weeks after
				
				var iDate = new Date(begin);
				var i;
				for(i = 0; i < this.self(arguments).NUM_ATOMS_WEEK; i++) {
					if (iDate.getYear() == date.getYear() && iDate.getWeek() == date.getWeek()) {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + iDate.getWeek() + '</span>');
						this._atomsLabels[i].setBackgroundColor('#7baae0');
					} else {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + iDate.getWeek() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
					this._atomsLabels[i].setUserData('model', new Date(iDate));
					this._atomsLabels[i].setVisibility('visible');
					iDate = new Date(iDate.getTime() + oneWeek);
				}
				//hide remaining labels
				for(; i < this.self(arguments).NUM_ATOMS_MAX; i++) {
					this._atomsLabels[i].setVisibility('excluded');
				}
				
				this._currentPeriod.begin = begin;
				this._currentPeriod.end = end;
			} else {
				//otherwise, just update the styles of the labels
				var iDate = null;
				for(var i = 0; i < this.self(arguments).NUM_ATOMS_WEEK; i++) {
					iDate = this._atomsLabels[i].getUserData('model');
					if (iDate.getYear() == date.getYear() && iDate.getWeek() == date.getWeek()) {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + iDate.getWeek() + '</span>');
						this._atomsLabels[i].setBackgroundColor('#7baae0');
					} else {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + iDate.getWeek() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
				}
			}
		},
		
		_refresh_calendarYearMode: function(date) {
			//IF we've just changed the period mode OR the new date is outside the currently displayed period THEN update the whole display
			if (this.getController().getCalendarPeriodMode() != this._currentPeriodMode || date < this._currentPeriod.begin || date > this._currentPeriod.end) {				
				var begin = new Date(date);
				begin.setFullYear(begin.getFullYear() - (this.self(arguments).NUM_ATOMS_YEAR / 2 - 1));		//~5 years before
				
				var end = new Date(date);
				end.setFullYear(end.getFullYear() + (this.self(arguments).NUM_ATOMS_YEAR / 2));				//~6 years after
				
				var iDate = new Date(begin);
				var i;
				for(i = 0; i < this.self(arguments).NUM_ATOMS_YEAR; i++) {
					if (iDate.getFullYear() == date.getFullYear()) {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + iDate.getFullYear() + '</span>');
						this._atomsLabels[i].setBackgroundColor('#7baae0');
					} else {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + iDate.getFullYear() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
					this._atomsLabels[i].setUserData('model', new Date(iDate));
					this._atomsLabels[i].setVisibility('visible');
					iDate.setFullYear(iDate.getFullYear() + 1);
				}
				//hide remaining labels
				for(; i < this.self(arguments).NUM_ATOMS_MAX; i++) {
					this._atomsLabels[i].setVisibility('excluded');
				}
				
				begin.setMonth(0);
				begin.setDate(1);
				this._currentPeriod.begin = begin;					//january 1st, Y-5
				end.setFullYear(end.getFullYear() + 1);
				end.setMonth(0);
				end.setDate(-1);
				this._currentPeriod.end = end;						//december 31st, Y+6
			} else {
				//otherwise, just update the styles of the labels
				var iDate = null;
				for(i = 0; i < this.self(arguments).NUM_ATOMS_YEAR; i++) {
					iDate = this._atomsLabels[i].getUserData('model');
					if (iDate.getFullYear() == date.getFullYear()) {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: bold">' + iDate.getFullYear() + '</span>');
						this._atomsLabels[i].setBackgroundColor('#7baae0');
					} else {
						this._atomsLabels[i].setValue('<span style="color: #ffffff; font-weight: normal">' + iDate.getFullYear() + '</span>');
						this._atomsLabels[i].resetBackgroundColor();
					}
				}
			}
		},
		
		refresh: function() {
			switch(this.getController().getCalendarMode()) {
				case eyeos.calendar.Constants.MODE_CALENDAR:
					switch(this.getController().getCalendarPeriodMode()) {
						case eyeos.calendar.Constants.PERIOD_MODE_DAY:
							this._refresh_calendarDayMode(this.getController().getCalendarSelectedDate());
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
							this._refresh_calendarWeekMode(this.getController().getCalendarSelectedDate());
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
							this._refresh_calendarMonthMode(this.getController().getCalendarSelectedDate());
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
							this._refresh_calendarYearMode(this.getController().getCalendarSelectedDate());
					}
					break;
					
				case eyeos.calendar.Constants.MODE_AGENDA:
					this._refresh_agendaMode(this.getController().getCalendarSelectedDate());
			}
			this._selectedDate = this.getController().getCalendarSelectedDate();
			this._currentPeriodMode = this.getController().getCalendarPeriodMode();
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});