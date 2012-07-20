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

qx.Class.define('eyeos.calendar.view.SimplePeriodDisplay', {
	extend: qx.ui.container.Composite,
	implement: [eyeos.calendar.IView],
	
	/**
	 * TODO
	 */
	construct: function () {
		arguments.callee.base.call(this);
		this._initGUI();
		
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
		
		_label: null,
		
		
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
		
		_initGUI: function() {
			this.setLayout(new qx.ui.layout.HBox());
			this.setAllowGrowY(false);
			
			this._label = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(12, ['Sans-serif']).set({
					bold :true
				}),
				textColor: '#4f565c'
			});
			this.add(this._label);
		},
		
		refresh: function() {
			var date = this.getController().getCalendarSelectedDate();
			switch(this.getController().getCalendarMode()) {
				case eyeos.calendar.Constants.MODE_CALENDAR:
					switch(this.getController().getCalendarPeriodMode()) {
						case eyeos.calendar.Constants.PERIOD_MODE_DAY:
							this._label.setValue(new qx.util.format.DateFormat(qx.locale.Date.getDateFormat('long')).format(date));
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
							var format = qx.locale.Date.getDateFormat('medium');
							var firstDayDate = date.getLocalizedFirstDayOfWeek();
							var lastDayDate = new Date(firstDayDate.getTime() + 6 * 24 * 60 * 60 * 1000);
							
							var firstDay = new qx.util.format.DateFormat(format).format(firstDayDate);
							var lastDay = new qx.util.format.DateFormat(format).format(lastDayDate);
							this._label.setValue(firstDay + ' - ' + lastDay);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
							var month = qx.locale.Date.getMonthName('wide', date.getMonth());
							var year = date.getFullYear();
							this._label.setValue(month + ' ' + year);
							break;
							
						case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
							this._label.setValue(date.getFullYear());
					}
					break;
					
				case eyeos.calendar.Constants.MODE_AGENDA:
					this._label.setValue(date.getFullYear());
			}
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});