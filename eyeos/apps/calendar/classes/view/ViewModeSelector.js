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

qx.Class.define('eyeos.calendar.view.ViewModeSelector', {
	extend: qx.ui.container.Composite,
	implement: [eyeos.calendar.IView],
	
	statics: {
		ButtonDecorator_pressed: new qx.ui.decoration.Beveled('#4886ce', '#4886ce', 100).set({
			backgroundColor: '#4886ce'
		}),
		ButtonDecorator_released: new qx.ui.decoration.Beveled(null, null, 100).set({
			backgroundColor: null
		}),
		ButtonTextColor_pressed: '#ffffff',
		ButtonTextColor_released: '#4886ce'
	},
	
	construct: function () {
		arguments.callee.base.call(this);
		this._init();
	},
	
	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller',
			apply: '_applyController'
		}
	},
	
	members: {
		
		_agendaButton: null,
		_currentMode: null,
		_currentPeriodMode: null,
		_dayButton: null,
		_monthButton: null,
		_weekButton: null,
		_yearButton: null,
		
		
		_applyController: function(value, old) {
			value.addListener('changeCalendarMode', function(e) {
				this._changeMode(value.getCalendarMode(), value.getCalendarPeriodMode());
			}, this);
			value.addListener('changeCalendarPeriodMode', function(e) {
				this._changeMode(value.getCalendarMode(), value.getCalendarPeriodMode());
			}, this);
			this._changeMode(value.getCalendarMode(), value.getCalendarPeriodMode());
		},
		
		_init: function() {
			this.setLayout(new qx.ui.layout.HBox(4, 'center'));
			this.getLayout().setAlignY('top');
			// cis team
			this._goPreviousButton = new qx.ui.basic.Image('index.php?extern=images/calendar/go-previous.png').set({
						marginTop:5,																						
						width: 13,
						height: 13,
						scale: true,
						cursor: 'pointer'
					});
			this._goPreviousButton.addListener('click', this._onArrowLeftClick, this);
			this.add(this._goPreviousButton);
			// Period mode buttons
			this._dayButton = new qx.ui.form.Button(tr('Day')).set({
				allowGrowY: false,
				decorator: this.self(arguments).ButtonDecorator_released,
				textColor: this.self(arguments).ButtonTextColor_released,
				cursor: 'pointer'
			});
			this._dayButton.addListener('execute', function(e) {
				this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_CALENDAR);
				this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_DAY);
			}, this);
			this.add(this._dayButton);
			this._weekButton = new qx.ui.form.Button(tr('Week')).set({
				allowGrowY: false,
				decorator: this.self(arguments).ButtonDecorator_released,
				textColor: this.self(arguments).ButtonTextColor_released,
				cursor: 'pointer'
			});
			this._weekButton.addListener('execute', function(e) {
				this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_CALENDAR);
				this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_WEEK);
			}, this);
			this.add(this._weekButton);
			this._monthButton = new qx.ui.form.Button(tr('Month')).set({
				allowGrowY: false,
				decorator: this.self(arguments).ButtonDecorator_released,
				textColor: this.self(arguments).ButtonTextColor_released,
				cursor: 'pointer'
			});
			this._monthButton.addListener('execute', function(e) {
				this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_CALENDAR);
				this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_MONTH);
			}, this);
			this.add(this._monthButton);
/*
			this._yearButton = new qx.ui.form.Button(tr('Year')).set({
				allowGrowY: false,
				decorator: this.self(arguments).ButtonDecorator_released,
				textColor: this.self(arguments).ButtonTextColor_released,
				cursor: 'pointer'
			});
			this._yearButton.addListener('execute', function(e) {
				this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_CALENDAR);
				this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_YEAR);
			}, this);
			this.add(this._yearButton);
			
			// "Agenda" mode button
			this._agendaButton = new qx.ui.form.Button(tr('Agenda')).set({
				allowGrowY: false,
				decorator: this.self(arguments).ButtonDecorator_released,
				textColor: this.self(arguments).ButtonTextColor_released,
				cursor: 'pointer'
			});
			this._agendaButton.addListener('execute', function(e) {
				this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_AGENDA);
			}, this);
			this.add(this._agendaButton);
 */
			this._goNextButton = new qx.ui.basic.Image('index.php?extern=images/calendar/go-next.png').set({
						marginTop:5,																						
						width: 13,
						height: 13,
						scale: true,
						cursor: 'pointer'
					});
		
			this._goNextButton.addListener('click', this._onArrowRightClick, this);
			this.add(this._goNextButton);
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

		_changeMode: function(mode, periodMode) {
			if (mode != this._currentMode || periodMode != this._currentPeriodMode) {
				this._dayButton.setDecorator(this.self(arguments).ButtonDecorator_released);
				this._dayButton.setTextColor(this.self(arguments).ButtonTextColor_released);
				this._weekButton.setDecorator(this.self(arguments).ButtonDecorator_released);
				this._weekButton.setTextColor(this.self(arguments).ButtonTextColor_released);
				this._monthButton.setDecorator(this.self(arguments).ButtonDecorator_released);
				this._monthButton.setTextColor(this.self(arguments).ButtonTextColor_released);
/*
                this._yearButton.setDecorator(this.self(arguments).ButtonDecorator_released);
				this._yearButton.setTextColor(this.self(arguments).ButtonTextColor_released);
				this._agendaButton.setDecorator(this.self(arguments).ButtonDecorator_released);
				this._agendaButton.setTextColor(this.self(arguments).ButtonTextColor_released);
*/
				switch(mode) {
					case eyeos.calendar.Constants.MODE_CALENDAR:
						switch(periodMode) {
							case eyeos.calendar.Constants.PERIOD_MODE_DAY:
								this._dayButton.setDecorator(this.self(arguments).ButtonDecorator_pressed);
								this._dayButton.setTextColor(this.self(arguments).ButtonTextColor_pressed);
								break;
								
							case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
								this._weekButton.setDecorator(this.self(arguments).ButtonDecorator_pressed);
								this._weekButton.setTextColor(this.self(arguments).ButtonTextColor_pressed);
								break;
								
							case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
								this._monthButton.setDecorator(this.self(arguments).ButtonDecorator_pressed);
								this._monthButton.setTextColor(this.self(arguments).ButtonTextColor_pressed);
								break;
								
							case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
                                /*
								this._yearButton.setDecorator(this.self(arguments).ButtonDecorator_pressed);
								this._yearButton.setTextColor(this.self(arguments).ButtonTextColor_pressed);
                                */
                       }
						break;
						
					case eyeos.calendar.Constants.MODE_AGENDA:
                                            //cis team
                       /*
						this._agendaButton.setDecorator(this.self(arguments).ButtonDecorator_pressed);
						this._agendaButton.setTextColor(this.self(arguments).ButtonTextColor_pressed);
                       */
				}
				this._currentMode = mode;
				this._currentPeriodMode = periodMode;
			}
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});