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
 * Returns the date of the first day of this date's week.
 * 
 * @see qx.locale.Date.getWeekStart()
 * 
 * @return Date
 */
Date.prototype.getLocalizedFirstDayOfWeek = function() {
	var firstDay = qx.locale.Date.getWeekStart();
	var firstDayDate = new Date(this);
	if (firstDayDate.getDay() == 0) {
		firstDayDate.setDate(firstDayDate.getDate() - 7 - firstDayDate.getDay() + firstDay);	//date of the first day of the week (localized)
	} else {
		firstDayDate.setDate(firstDayDate.getDate() - firstDayDate.getDay() + firstDay);	//date of the first day of the week (localized)
	}
	return firstDayDate;
}

/**
 * Checks if given otherDate represents the same day as this date.
 * 
 * @return bool
 */
Date.prototype.isSameDay = function(otherDate) {
	if (otherDate == null) {
		return false;
	}
	return this.getFullYear() == otherDate.getFullYear() && this.getMonth() == otherDate.getMonth() && this.getDate() == otherDate.getDate();
}

/**
 * Returns the week ISO 8601 week number of this date.
 * 
 * @return int
 */
Date.prototype.getWeek = function() {
	// computes the day number since 0 January 0 CE (Gregorian)
	function gregdaynumber(year, month, day) {
		y = year;
		m = month + 1;
		if (month < 3)
			y = y - 1;
		if (month < 3)
			m = m + 12;
		return Math.floor(365.25 * y) - Math.floor(y / 100)
		        + Math.floor(y / 400) + Math.floor(30.6 * m) + day - 62;
	}
	
	// computes the ISO week number of the current date
	
	var isoweek;
	
	year = this.getFullYear();
	month = this.getMonth();
	day = this.getDate();
	wday = this.getDay();
	
	wday = ((wday + 6) % 7) + 1; // weekdays will be numbered 1 to 7
	yiso = year;
	
	d0 = gregdaynumber(year, 1, 0);
	wday0 = ((d0 + 4) % 7) + 1;
	
	d = gregdaynumber(year, month + 1, day);
	wniso = Math.floor((d - d0 + wday0 + 6) / 7) - Math.floor((wday0 + 3) / 7);
	
	// check whether the last few days of December belong to the next year's ISO week
	if ((month == 11) && ((day - wday) > 27)) {
		wniso = 1;
		yiso = yiso + 1;
	}
	
	// check whether the first few days of January belong to the previous year's ISO week
	if ((month == 0) && ((wday - day) > 3)) {
		d0 = gregdaynumber(year - 1, 1, 0);
		wday0 = ((d0 + 4) % 7) + 1;
		wniso = Math.floor((d - d0 + wday0 + 6) / 7)
		        - Math.floor((wday0 + 3) / 7);
		yiso = yiso - 1;
	}
	return wniso;
}

/**
 * Returns the day of the year of a given Date, starting with zero for the first day
 * 
 * @return int
 */
Date.prototype.getDayOfYear = function() {
    var year = this.getFullYear();
    
    // start with the day of month of this date, minus one
    // (first day of year is day zero)
    var dayOfYear = this.getDate()-1;
    
    var month = this.getMonth();
    
    while(month > 0)
    {
        // get the last day of the previous month
        var lastDayOfPreviousMonth = new Date(year,month,0);
        
        // add the day of month of that day
        // (which is the number of days in that month)
        dayOfYear += lastDayOfPreviousMonth.getDate();
        
        month--;
    }
    
    return dayOfYear;
};

/**
 *	Format a ISO time Date into a more readable string
 *
 *	@return string
 */
Date.prototype.prettyDate = function() {
	/*
	 * JavaScript Pretty Date
	 * Copyright (c) 2008 John Resig (jquery.com)
	 * Licensed under the MIT license.
	 */
	
	var diff = (((new Date()).getTime() - this.getTime()) / 1000);
	var day_diff = Math.floor(diff / 86400);

	if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
		return;
	var hoursDate = this.getHours() + ':' + this.getMinutes();
	return day_diff == 0 && (
		diff < 60 && 'just now' ||
		diff < 120 && '1 minute ago' ||
		diff < 3600 && Math.floor( diff / 60 ) + ' minutes ago' ||
		diff < 7200 && '1 hour ago' ||
		diff < 86400 && Math.floor( diff / 3600 ) + ' hours ago') ||
	day_diff == 1 && ('Yesterday at ' + hoursDate)||
	day_diff < 7 && (day_diff + ' days ago at' + hoursDate);
};

/**
 *	Format a ISO time Date into 'dd/mm/yy at HH:MM'
 *
 *	@return string
 */
Date.prototype.formatNumericDate = function() {
	 
	var returnDate = '';
	var day = this.getDate();

	returnDate = (day < 10)?(returnDate + '0' + day):(returnDate + day);
	returnDate = returnDate + '/';

	var month = this.getMonth() + 1;
	returnDate = (month < 10)?(returnDate + '0' + month):(returnDate + month);
	returnDate = returnDate + '/';

	var year = this.getYear();
	year = (year < 1000) ? year + 1900 : year;
	returnDate = returnDate + year + ' at ';

	var hours = this.getHours();
	returnDate = (hours < 1)?(returnDate + '0' + hours):(returnDate + hours);
	returnDate = returnDate + ':';

	var minutes = this.getMinutes();
	returnDate = (minutes < 10)?(returnDate + '0' + minutes):(returnDate + minutes);
	
	return returnDate;

};

Date.getTimezones = function() {
	return [
		{label: tr("(GMT -12:00 hours) Eniwetok, Kwajalein"), offset: -12},
		{label: tr("(GMT -11:00 hours) Midway Island, Samoa"), offset: -11},
		{label: tr("(GMT -10:00 hours) Hawaii"), offset: -10},
		{label: tr("(GMT -9:00 hours) Alaska"), offset: -9},
		{label: tr("(GMT -8:00 hours) Pacific Time (US & Canada)"), offset: -8},
		{label: tr("(GMT -7:00 hours) Mountain Time (US & Canada)"), offset: -7},
		{label: tr("(GMT -6:00 hours) Central Time (US & Canada), Mexico City"), offset: -6},
		{label: tr("(GMT -5:00 hours) Eastern Time (US & Canada), Bogota, Lima, Quito"), offset: -5},
		{label: tr("(GMT -4:00 hours) Atlantic Time (Canada), Caracas, La Paz"), offset: -4},
		{label: tr("(GMT -3:30 hours) Newfoundland"), offset: -3.5},
		{label: tr("(GMT -3:00 hours) Brazil, Buenos Aires, Georgetown"), offset: -3},
		{label: tr("(GMT -2:00 hours) Mid-Atlantic"), offset: -2},
		{label: tr("(GMT -1:00 hours) Azores, Cape Verde Islands"), offset: -1},
		{label: tr("(GMT) Western Europe Time, London, Lisbon, Casablanca, Monrovia"), offset: 0},
		{label: tr("(GMT +1:00 hours) CET(Central Europe Time), Brussels, Copenhagen, Madrid, Paris"), offset: 1},
		{label: tr("(GMT +2:00 hours) EET(Eastern Europe Time), Kaliningrad, South Africa"), offset: 2},
		{label: tr("(GMT +3:00 hours) Baghdad, Kuwait, Riyadh, Moscow, St. Petersburg, Volgograd, Nairobi"), offset: 3},
		{label: tr("(GMT +3:30 hours) Tehran"), offset: 3.5},
		{label: tr("(GMT +4:00 hours) Abu Dhabi, Muscat, Baku, Tbilisi"), offset: 4},
		{label: tr("(GMT +4:30 hours) Kabul"), offset: 4.5},
		{label: tr("(GMT +5:00 hours) Ekaterinburg, Islamabad, Karachi, Tashkent"), offset: 5},
		{label: tr("(GMT +5:30 hours) Bombay, Calcutta, Madras, New Delhi"), offset: 5.5},
		{label: tr("(GMT +6:00 hours) Almaty, Dhaka, Colombo"), offset: 6},
		{label: tr("(GMT +7:00 hours) Bangkok, Hanoi, Jakarta"), offset: 7},
		{label: tr("(GMT +8:00 hours) Beijing, Perth, Singapore, Hong Kong, Chongqing, Urumqi, Taipei"), offset: 8},
		{label: tr("(GMT +9:00 hours) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"), offset: 9},
		{label: tr("(GMT +9:30 hours) Adelaide, Darwin"), offset: 9.5},
		{label: tr("(GMT +10:00 hours) EAST(East Australian Standard), Guam, Papua New Guinea, Vladivostok"), offset: 10},
		{label: tr("(GMT +11:00 hours) Magadan, Solomon Islands, New Caledonia"), offset: 11},
		{label: tr("(GMT +12:00 hours) Auckland, Wellington, Fiji, Kamchatka, Marshall Island"), offset: 12}
	];
};

Date.getDateFormats = function() {
	return {
		'dd-mm-yyyy': tr('dd-mm-yyyy'),
		'dd-mm-yy': tr('dd-mm-yy'),
		'dd/mm/yyyy': tr('dd/mm/yyyy'),
		'dd/mm/yy': tr('dd/mm/yy'),
		'dd.mm.yyyy': tr('dd.mm.yyyy'),
		'dd.mm.yy': tr('dd.mm.yy'),
		'mm-dd-yyyy': tr('mm-dd-yyyy'),
		'mm-dd-yy': tr('mm-dd-yy'),
		'mm/dd/yyyy': tr('mm/dd/yyyy'),
		'mm/dd/yy': tr('mm/dd/yy'),
		'mm.dd.yy': tr('mm.dd.yy'),
		'mm.dd.yyyy': tr('mm.dd.yyyy'),
		'yyyy-mm-dd': tr('yyyy-mm-dd'),
		'yyyy/mm/dd': tr('yyyy/mm/dd'),
		'yyyy.mm.dd': tr('yyyy.mm.dd')
	};
};

Date.getTimeFormats = function() {
	return {
		'hh:MM': tr('hh:MM (12 hours w/ leading zero)'),
		'h:MM': tr('h:MM (12 hours)'),
		'hh:MM t': tr('hh:MM t (12 hours w/ leading zero + time marker)'),
		'h:MM t': tr('h:MM t (12 hours + time marker)'),
		'hh:MM tt': tr('hh:MM tt (12 hours w/ leading zero + long time marker)'),
		'h:MM tt': tr('h:MM tt (12 hours + long time marker)'),
		'HH:MM': tr('HH:MM (24 hours w/ leading zero)'),
		'H:MM': tr('H:MM (24 hours)')
	};
};

/**
 * Count the occurence of a char inside a string
 */
String.prototype.count=function(s1) {
	return (this.length - this.replace(new RegExp(s1,"g"), '').length) / s1.length;
}