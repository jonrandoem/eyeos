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
 *	Implementing {@see eyeos.ui.menubar.IActions}.
 */
qx.Class.define('eyeos.calendar.Actions', {
	extend: qx.core.Object,
	implement : [eyeos.ui.genericbar.IActions],

	construct: function(window, checknum, application, controller) {
		arguments.callee.base.call(this);
		this.setWindow(window);
		this.setChecknum(checknum);
		this.setApplication(application);
		this.setController(controller);
	},

	properties: {
		window: {
			init: null,
			check: 'eyeos.ui.Window'
		},
		checknum: {
			init: null,
			check: 'Integer'
		},
		application: {
			init: null,
			check: 'eyeos.system.EyeApplication'
		},
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller'
		},
		
		/**
		 * @see eyeos.ui.genericbar.IActions.pid
		 */
		pid: {
			init: null
		}
	},

	members: {
		/**
		 * @see eyeos.ui.genericbar.IActions.dynamicsActions()
		 */
		dynamicsActions: function() {},
		
		// ====================================================================
		// 		CALENDAR
		// ====================================================================
		
		newEvent: function() {
			var model = this.getController().createNewEvent();
			
			var dialog = new eyeos.calendar.dialogs.EditEvent(this.getController(), model);
			dialog.open();
		},
		
		newCalendar: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		addCalendar: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		share: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		sync: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		importFile: function() {
			eyeos.alert(tr('Not available yet...'));
		},

		exportFile: function() {
			eyeos.alert(tr('Not available yet...'));
		},

		close: function() {
			this.getWindow().close();
		},

		print: function() {
			eyeos.alert(tr('Not available yet...'));
		},
	
		// ====================================================================
		// 		EDIT
		// ====================================================================
	
		// TODO Copy/Cut/Paste/...
		// => How??
		
		duplicateEvent: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		editEvent: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		//---------
		
		selectAll: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		specialCharacters: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
		//---------
		
		searchEvent: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
	
		// ====================================================================
		// 		VIEW
		// ====================================================================
	
		viewDay: function() {
			this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_DAY);
		},
		
		viewWeek: function() {
			this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_WEEK);
		},
		
		viewMonth: function() {
			this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_MONTH);
		},
		
		viewYear: function() {
			this.getController().setCalendarPeriodMode(eyeos.calendar.Constants.PERIOD_MODE_YEAR);
		},
		
		viewAgenda: function() {
			this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_AGENDA);
		},
		
		//---------
		
//		viewAgenda: function() {
//			this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_AGENDA);
//		},
//		
//		viewAgenda: function() {
//			this.getController().setCalendarMode(eyeos.calendar.Constants.MODE_AGENDA);
//		},
		
		//---------
		
		goToToday: function() {
			this.getController().setCalendarSelectedDate(new Date());
		},
		
		timeFilter: function() {
			eyeos.alert(tr('Not available yet...'));
		},
		
	
		// ====================================================================
		// 		TOOLS
		// ====================================================================
	
		settings: function() {
			var dialog = new eyeos.calendar.dialogs.Settings(this.getController());
			dialog.open();
		},
		
		addressBook: function() {
			eyeos.alert(tr('Not available yet...'));
		}
	}
});

