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

qx.Class.define('eyeos.calendar.Constants', {
	type: 'static',
	
	statics: {
		MODE_CALENDAR: 'calendar',
		MODE_AGENDA: 'agenda',
		MODE_DEFAULT: 'calendar',
		MODES: [this.MODE_CALENDAR, this.MODE_AGENDA],		
		PERIOD_MODE_DAY: 'day',
		PERIOD_MODE_WEEK: 'week',
		PERIOD_MODE_MONTH: 'month',
		PERIOD_MODE_YEAR: 'year',
		PERIOD_MODE_DEFAULT: 'week',
		PERIOD_MODES: [this.PERIOD_MODE_DAY, this.PERIOD_MODE_WEEK, this.PERIOD_MODE_MONTH, this.PERIOD_MODE_YEAR],
		
		/**
		 * Returns an abbreviated and localized form of the date, without the year.
		 * Examples:
		 * - "Nov. 23", "Nov. 24" (Locale set to en_US)
		 * - "23 nov.", "24 nov." (Locale set to fr_FR)
		 * 
		 * @param date {Boolean}
		 */
		GetAbbreviatedDate: function(date) {
			var format = qx.locale.Date.getDateFormat('medium');
			format = format.replace(/y/gi, '');
			format = qx.lang.String.clean(format.replace(',', ''));
			
			return new qx.util.format.DateFormat(format).format(date);
		},
		
		CALENDAR_DEFAULT_COLORS: [
			'#BD2429', '#D13065', '#862F87', '#5616C1', '#2B5187', '#2E4DC1', '#239B87',
			'#29814F', '#148711', '#549D00', '#989D0F', '#CAA107', '#E6760C', '#D14314',
			'#965C5D', '#795879', '#516074', '#5F6E97', '#4C7B74', '#757840', '#9E7947'
		]
	}
});