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
 * This class defines an application's process inside the eyeos environment.
 * It represents the link between an IApplication and a Process objects (on the PHP side), with
 * the dynamic graphical object(s) running on the client side (in Javascript).
 */
qx.Class.define('eyeos.system.EyeApplication', {
    extend: qx.application.Standalone,
	
    /**
	 * Constructs a new EyeApplication object, usually representing a process running.
	 * 
	 * @param name {String} The name of the application, as defined in the PHP interface IApplication.
	 * @param checknum {Integer} The checknum of the process.
	 * @param pid {Integer} The Process Identifier associated to the process.
	 */
    construct: function(name, checknum, pid) {
		eyeos.consoleInfo("Starting new process: '" + name + "', checknum " + checknum + ", pid: " + pid);
		arguments.callee.base.apply(this, arguments);
		if(typeof checknum == "undefined" && typeof this._checknum == "undefined") {
			eyeos.consoleWarn("[eyeos.system.EyeApplication] Missing argument 'checknum'");
		}
		if(typeof pid == "undefined" && typeof this._pid == "undefined") {
			eyeos.consoleWarn("[eyeos.system.EyeApplication] Missing argument 'pid'");
		}
		if (typeof this._name == "undefined") {
			this._name = name;
		}
		if (typeof this._checknum == "undefined") {
			this._checknum = checknum;
		}
		if (typeof this._pid == "undefined") {
			this._pid = pid;
		}

		eyeos.consoleInfo("New process started: '" + this._name + "', checknum " + this._checknum + ", pid: " + this._pid);
	},

    members: {
		
		_name: undefined,
		_pid: undefined,
		_checknum: undefined,


		/**
		 * Kills the process associated to this application's instance.
		 */
		close: function() {
			eyeos.consoleInfo('Process is stopping: ' + this._name + ', checknum: ' + this._checknum + ', pid: ' + this._pid);
			
			eyeos.callMessage(this._checknum, 'close');
		},

		/**
		 * @return {Integer}
		 */
		getChecknum: function() {
			return this._checknum;
		},

		/**
		 * @return {String}
		 */
		getName: function() {
			return this._name;
		},

		/**
		 * @return {Integer}
		 */
		getPid: function() {
			return this._pid;
		},

		/**
		 * @param {Integer} The checknum of the process.
		 */
		setChecknum: function(checknum) {
			this._checknum = checknum;
		},

		/**
		 * @param {Integer} The Process Identifier associated to the process.
		 */
		setPid: function(pid) {
			this._pid = pid;
		}
    }
});