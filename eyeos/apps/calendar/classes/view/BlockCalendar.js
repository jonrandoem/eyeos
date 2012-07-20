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

qx.Class.define('eyeos.calendar.view.BlockCalendar', {
	extend: qx.ui.container.Composite,
	implement: [eyeos.calendar.IView],
	
	statics: {
		PeriodModeButtonDecorator_pressed: new qx.ui.decoration.RoundBorderBeveled(null, '#d5d5d5', 0, 5, 5, 5, 5).set({
			backgroundColor: '#e3e3e3'
		}),
		PeriodModeButtonDecorator_released: new qx.ui.decoration.RoundBorderBeveled(null, '#cbcbcb', 0, 5, 5, 5, 5)
	},
	
	/**
	 * TODO
	 */
	construct: function () {
		arguments.callee.base.call(this);
		this._initGUI();
		
		qx.locale.Manager.getInstance().addListener('changeLocale', function(e) {
			this._refresh();
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
		
		_atomsGrid: null,
		_currentAtomDisplay: null,
		_currentAtomDisplay_topLabel: null,
		_currentAtomDisplay_middleLabel: null,
		_currentAtomDisplay_bottomLabel: null,
		_currentMonthLabel: null,
		_dayWeekDisplayContainer: null,
		_internalDate: null,
		_miniGridCalendar: null,
		_periodMode: null,
		_periodModeButtons: null,
		
		_applyController: function(value, old) {
			value.addListener('changeCalendarSelectedDate', function(e) {
				this._refresh(value.getCalendarSelectedDate());
			}, this);
			this._refresh(value.getCalendarSelectedDate());
		},
		
		_initGUI: function() {
			this.addListener('appear', function(e) {
				var bounds = this.getBounds();
				this.setMinHeight(bounds.height);
				this.setMaxHeight(bounds.height);
			}, this);
			
			this.setLayout(new qx.ui.layout.VBox(1));
			this.setHeight(160);
			//
			//	MONTH SELECTOR
			//
			var monthSelector = new qx.ui.container.Composite(new qx.ui.layout.HBox(2)).set({
				font: new qx.bom.Font(12, ['Sans-serif']),
				padding: 2
			});
			// Previous (<<)
			var previousMonthLabel = new qx.ui.basic.Label('«').set({
				font: new qx.bom.Font(14, ['Sans-serif']),
				paddingLeft: 4
			});
			previousMonthLabel.setCursor('pointer');
			previousMonthLabel.addListener('click', this._onPreviousMonthClick, this);
			monthSelector.add(previousMonthLabel);
			
			// Current (name + year)
			this._currentMonthLabel = new qx.ui.basic.Label().set({
				textAlign: 'center',
				allowGrowX: true,
				font: new qx.bom.Font(12, ['Sans-serif'])
			});
			this._currentMonthLabel.setCursor('pointer');
			this._currentMonthLabel.addListener('click', this._onCurrentMonthClick, this);
			monthSelector.add(this._currentMonthLabel, {flex: 1});
			
			// Next (>>)
			var nextMonthLabel = new qx.ui.basic.Label('»').set({
				font: new qx.bom.Font(14, ['Sans-serif']),
				paddingRight: 4
			});
			nextMonthLabel.setCursor('pointer');
			nextMonthLabel.addListener('click', this._onNextMonthClick, this);
			monthSelector.add(nextMonthLabel);
			this.add(monthSelector);
			
			
			//
			//	PERIOD ATOM SELECTOR
			//
			var atomSelector = new qx.ui.container.Composite(new qx.ui.layout.Dock()).set({
				backgroundColor: '#4886ce',
				decorator: new qx.ui.decoration.Beveled('#4886ce', '#4886ce', 100),
				padding: 1
			});
			this._atomsGrid = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			atomSelector.add(this._atomsGrid, {edge: 'center', flex: 1});
			this._refreshAtomsGrid();
			this.add(atomSelector);
			
			
			//
			//	CURRENT ATOM DISPLAY
			//
			this._currentAtomDisplay = new qx.ui.container.Composite(new qx.ui.layout.VBox(2)).set({
				backgroundColor: '#d6e6f8',
				decorator: new qx.ui.decoration.Beveled('#b1d2ec', '#b1d2ec', 100),
				padding: 1,
				maxHeight: 120,
				alignX: 'center',
				allowGrowY: true
			});
			
			// DAY/WEEK DISPLAY
			this._dayWeekDisplayContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
				padding: 4
			});
			this._dayWeekDisplayContainer.getLayout().setAlignX('center');
			this._currentAtomDisplay_topLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(18, ['Sans-serif']),
				textAlign: 'center',
				textColor: '#4f565c'
			});
			this._dayWeekDisplayContainer.add(this._currentAtomDisplay_topLabel, {flex: 1});
			this._currentAtomDisplay_middleLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(72, ['Sans-serif']),
				textAlign: 'center',
				textColor: '#4f565c',
				margin: -10
			});
			this._dayWeekDisplayContainer.add(this._currentAtomDisplay_middleLabel, {flex: 1});
			this._currentAtomDisplay_bottomLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(16, ['Sans-serif']),
				textAlign: 'center',
				textColor: '#4f565c',
				paddingTop: -10
			});
			this._dayWeekDisplayContainer.add(this._currentAtomDisplay_bottomLabel, {flex: 1});
			this._currentAtomDisplay.add(this._dayWeekDisplayContainer, {flex: 1});
			
			// MINIGRID DISPLAY
			this._miniGridCalendar = new eyeos.calendar.view.MiniGridCalendar();
			this._miniGridCalendar.addListener('changeSelectedDate', this._onMiniGridChangeDate, this);
			this._miniGridCalendar.setVisibility('excluded');
			this._currentAtomDisplay.add(this._miniGridCalendar, {flex: 1});
			
			this.add(this._currentAtomDisplay, {flex: 1});
			
			
			//
			//	PERIOD MODE SELECTOR
			//
			var periodModeSelector = new qx.ui.container.Composite(new qx.ui.layout.HBox(4)).set({
				backgroundColor: '#f8f8f8',
				decorator: new qx.ui.decoration.Beveled('#f8f8f8', '#f8f8f8', 100),
				padding: 2
			});
			var dayButton = new qx.ui.form.Button(tr('Day')).set({
				decorator: this.self(arguments).PeriodModeButtonDecorator_released,
				cursor: 'pointer'
			});
			dayButton.addListener('execute', function(e) {
				this._onPeriodModeChange(eyeos.calendar.Constants.PERIOD_MODE_DAY);
			}, this);
			periodModeSelector.add(dayButton, {flex: 1});
			var weekButton = new qx.ui.form.Button(tr('Week')).set({
				decorator: this.self(arguments).PeriodModeButtonDecorator_released,
				cursor: 'pointer'
			});
			weekButton.addListener('execute', function(e) {
				this._onPeriodModeChange(eyeos.calendar.Constants.PERIOD_MODE_WEEK);
			}, this);
			periodModeSelector.add(weekButton, {flex: 1});
			var monthButton = new qx.ui.form.Button(tr('Month')).set({
				decorator: this.self(arguments).PeriodModeButtonDecorator_released,
				cursor: 'pointer'
			});
			monthButton.addListener('execute', function(e) {
				this._onPeriodModeChange(eyeos.calendar.Constants.PERIOD_MODE_MONTH);
			}, this);
			periodModeSelector.add(monthButton, {flex: 1});
			this._periodModeButtons = {
				'day': dayButton,
				'week': weekButton,
				'month': monthButton
			};
		},
		
		_onAtomClick: function(e) {			
			var model = e.getTarget().getUserData('model');
			eyeos.consoleLog('[eyeos.calendar.view.BlockCalendar] _onAtomClick(): ' + model);
			this.getController().setCalendarSelectedDate(model);
		},
		
		_onCurrentMonthClick: function(e) {
			eyeos.consoleLog('CURRENT MONTH CLICK');
			eyeos.consoleLog('DISPLAY MONTH: ' + e.getTarget().getValue());
			
			// Selected date: first day of the selected month
			this.getController().setCalendarSelectedDate(this._internalDate);
			
			// Current Period: first day of the month / last day of the month
			var firstDayOfMonth = new Date(this._internalDate);
			firstDayOfMonth.setDate(1);
			this.getController().setCalendarCurrentPeriod({
				begin: firstDayOfMonth,
				end: new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0)
			});
		},
		
		_onMiniGridChangeDate: function(e) {
			this.getController().setCalendarSelectedDate(e.getData());
		},
		
		_onNextMonthClick: function(e) {
			var nextMonth = new Date(this._internalDate.getFullYear(), this._internalDate.getMonth() + 1, this._internalDate.getDate());
			this._refresh(nextMonth);
		},
		
		_onPeriodModeChange: function(newMode) {
			this.setPeriodMode(newMode);
		},
		
		_onPreviousMonthClick: function(e) {
			var previousMonth = new Date(this._internalDate.getFullYear(), this._internalDate.getMonth() - 1, this._internalDate.getDate());
			this._refresh(previousMonth);
		},
		
		_refresh: function(date) {
			if (this._periodMode == null) {
				this._periodMode = this.getController().getCalendarPeriodMode();
			}
			if (date) {
				this._internalDate = date;
			}
			
			this._refreshPeriodModeButtons();
			this._refreshMonthSelector();
			this._refreshAtomsGrid();
			this._refreshCurrentAtomDisplay();
			//...
		},
		
		/*
		 * TODO: TO BE OPTIMIZED
		 * Destroying and re-creating objects everytime is not efficient, better re-use them by
		 * changing their label and visibility.
		 */
		_refreshAtomsGrid: function() {
			this._atomsGrid.removeAll();
			var atomsData = new Array();
			switch (this._periodMode) {
				//
				//	DAY or MONTH MODE (display days of the week) 
				//
				case eyeos.calendar.Constants.PERIOD_MODE_DAY:
				case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
					var day = qx.locale.Date.getWeekStart();
					var dateModel = this._internalDate.getLocalizedFirstDayOfWeek();
					for (var i = 0; i < 7; i++) {
						atomsData.push({
							label: qx.locale.Date.getDayName('abbreviated', day).substring(0, 1).toUpperCase(),
							model: new Date(dateModel)
						});
						dateModel.setDate(dateModel.getDate() + 1);
						day = (day + 1) % 7;
					}
					break;
				
				//
				//	WEEK MODE (display numbers of weeks, 2 before / current one / 2 after)
				//
				case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
					var oneDay = 24 * 60 * 60 * 1000;
					var atomsData = new Array(
						{
							label: new Date(this._internalDate.getTime() - 14 * oneDay).getWeek(),
							model: new Date(this._internalDate.getTime() - 14 * oneDay)
						},
						{
							label: new Date(this._internalDate.getTime() - 7 * oneDay).getWeek(),
							model: new Date(this._internalDate.getTime() - 7 * oneDay)
						},
						{
							label: this._internalDate.getWeek(),
							model: new Date(this._internalDate)
						},
						{
							label: new Date(this._internalDate.getTime() + 7 * oneDay).getWeek(),
							model: new Date(this._internalDate.getTime() + 7 * oneDay)
						},
						{
							label: new Date(this._internalDate.getTime() + 14 * oneDay).getWeek(),
							model: new Date(this._internalDate.getTime() + 14 * oneDay)
						}
					);
					break;
			}
			//display atoms labels
			for (var i = 0; i < atomsData.length; i++) {
				var newAtomLabel = new qx.ui.basic.Label().set({
					value: new String(atomsData[i].label),
					textColor: '#ffffff',
					font: new qx.bom.Font(12, ['Sans-serif']),
					allowGrowX: true,
					textAlign: 'center'
				});
				newAtomLabel.setUserData('model', (typeof atomsData[i].model !== 'undefined')? atomsData[i].model : atomsData[i].label);
				newAtomLabel.setCursor('pointer');
				newAtomLabel.addListener('click', this._onAtomClick, this);
				this._atomsGrid.add(newAtomLabel, {flex: 1});
				day = (day + 1) % 6;
			}
		},
		
		_refreshCurrentAtomDisplay: function() {
			switch (this._periodMode) {
				case eyeos.calendar.Constants.PERIOD_MODE_DAY:
					this._miniGridCalendar.setVisibility('excluded');
					this._dayWeekDisplayContainer.setVisibility('visible');
					this._currentAtomDisplay_topLabel.setValue(qx.locale.Date.getDayName('wide', this._internalDate.getDay()));
					this._currentAtomDisplay_middleLabel.setValue(new String(this._internalDate.getDate()));
					this._currentAtomDisplay_bottomLabel.setValue(qx.locale.Date.getMonthName('wide', this._internalDate.getMonth()));
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
					this._miniGridCalendar.setVisibility('excluded');
					this._dayWeekDisplayContainer.setVisibility('visible');
					this._currentAtomDisplay_topLabel.setValue('Week');
					this._currentAtomDisplay_middleLabel.setValue(new String(this._internalDate.getWeek()));
					this._currentAtomDisplay_bottomLabel.setValue('');
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
					this._miniGridCalendar.setVisibility('visible');
					this._dayWeekDisplayContainer.setVisibility('excluded');
					this._miniGridCalendar.refresh(new Date(this._internalDate));
					break;
			}
		},
		
		_refreshMonthSelector: function() {
			this._currentMonthLabel.setValue(
				qx.locale.Date.getMonthName('wide', this._internalDate.getMonth()) + ' ' + this._internalDate.getFullYear()
			);
		},
		
		_refreshPeriodModeButtons: function() {
			switch(this._periodMode) {
				case eyeos.calendar.Constants.PERIOD_MODE_DAY:
					this._periodModeButtons['day'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_pressed);
					this._periodModeButtons['week'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_released);
					this._periodModeButtons['month'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_released);
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
					this._periodModeButtons['day'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_released);
					this._periodModeButtons['week'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_pressed);
					this._periodModeButtons['month'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_released);
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
					this._periodModeButtons['day'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_released);
					this._periodModeButtons['week'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_released);
					this._periodModeButtons['month'].setDecorator(this.self(arguments).PeriodModeButtonDecorator_pressed);
			}
		},
		
		setPeriodMode: function(newMode) {
			if (newMode != this._periodMode) {
				this._periodMode = newMode;
				if (this._internalDate != null) {
					this._refresh();
				}
			}
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});