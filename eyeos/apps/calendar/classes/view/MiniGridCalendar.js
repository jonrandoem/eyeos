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

qx.Class.define('eyeos.calendar.view.MiniGridCalendar', {
	extend: qx.ui.core.Widget,
	
	/**
	 * TODO
	 * 
	 */
	construct: function () {
		arguments.callee.base.call(this);
		this._init();
	},
	
	members: {
		
		_dayLabels: null,
		_internalDate: null,
		_labelsGrid: null,
		_selectedDay: null,
		
		
		_init: function() {
			this._setLayout(new qx.ui.layout.Dock());
			
			this._labelsGrid = new qx.ui.container.Composite(new qx.ui.layout.Grid());
			this._add(this._labelsGrid, {edge: 'center', flex: 1});
			
			this._dayLabels = new Array();
			for(var week = 0; week < 6; week++) {								// row
				this._labelsGrid.getLayout().setRowFlex(week, 1);
				this._dayLabels[week] = new Array();
				for(var day = 0; day < 7; day++) {								// column
					this._labelsGrid.getLayout().setColumnFlex(day, 1);
					var label = new qx.ui.basic.Label().set({
						allowGrowX: true,
						allowGrowY: true,
						textAlign: 'center',
						cursor: 'pointer',
						rich: true
					});
					label.addListener('click', this._onDayClick, this);
					this._dayLabels[week][day] = label;
					this._labelsGrid.add(label, {column: day, row: week});
				}
			}
		},
		
		_onDayClick: function(e) {			
			var model = e.getTarget().getUserData('model');
			eyeos.consoleLog('[eyeos.calendar.view.MiniGridCalendar] _onDayClick(): ' + model);
			if (model != this._internalDate) {
				this.fireDataEvent('changeSelectedDate', model, this._internalDate);
			}
		},
		
		refresh: function(date) {
			if (typeof date !== 'undefined' && date !== null) {
				if (date == this._internalDate) {
					return;
				}
				this._internalDate = date;
			}
			if (this._internalDate === null) {
				throw '[eyeos.calendar.view.MiniGridCalendar] refresh(): No base date has been provided for display';
			}
			
			var weekStartDay = qx.locale.Date.getWeekStart();
			var dateModel = new Date(this._internalDate);
			dateModel.setDate(1);															//1st of current month
			dateModel = dateModel.getLocalizedFirstDayOfWeek();
			dateModel.setHours(0);
			dateModel.setMinutes(0);
			dateModel.setSeconds(0);
			dateModel.setMilliseconds(0);
			
			for(var week = 0; week < 6; week++) {								// row
				for(var day = 0; day < 7; day++) {								// column
					if (dateModel.getMonth() == this._internalDate.getMonth()) {
						if (dateModel.getDate() == this._internalDate.getDate()) {
							this._dayLabels[week][day].setValue('<span style="color: #000000; font-weight: bold">' + dateModel.getDate() + '</span>');
						} else {
							this._dayLabels[week][day].setValue('<span style="color: #000000; font-weight: normal">' + dateModel.getDate() + '</span>');
						}
					} else {
						this._dayLabels[week][day].setValue('<span style="color: #aaaaaa; font-weight: normal">' + dateModel.getDate() + '</span>');
					}
					this._dayLabels[week][day].setUserData('model', new Date(dateModel));
					dateModel = new Date(dateModel.getTime() + 24 * 60 * 60 * 1000);	// day = day + 1
				}
			}
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});