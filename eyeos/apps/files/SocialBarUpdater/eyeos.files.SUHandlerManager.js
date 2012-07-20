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
 * SUHandlerManager is system of cache for SocialUpdater Handlers implemented by a singleton class.
 * The only role of this class is to return a data struct with current SocialBarUpdater Handlers.
 */
qx.Class.define('eyeos.files.SUHandlerManager', {
	extend: qx.core.Object,
	type : "singleton",

	properties: {
		suHandlers: {
			init: null
		},
		toRefresh: {
			check: 'Boolean',
			init: true
		}
	},

	members: {
		__isLocked: false,
		__pendingRequests: new Array(),

		/**
		 * Execute the callback function with the handlers for SocialUpdater of the user.
		 * The first time we retrieve handlers data struct from the server, we store in a
		 * cache system so next call to this function will be faster
		 *
		 * @param checknum {Integer} A valid checknum
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		getHandlers: function (checknum, callback, callbackContext) {
			if (this.isToRefresh()) {
				this.__populateHandlers(checknum, function() {
					if (typeof callback == 'function') {
						callback.call(callbackContext, this.getSuHandlers());
					}
				}, this);
			} else {
				if (typeof callback == 'function') {
					callback.call(callbackContext, this.getSuHandlers());
				}
			}
		},

		/**
		 * Populate the internal caché when is not yet charged.
		 * And import relative js classes
		 *
		 * @param checknum {Integer} The checknum of the application
		 * @param callback {Function} The function of callback
		 * @param callbackContext {Object} the callbackContext of the function callback
		 */
		__populateHandlers: function (checknum, callback, callbackContext) {
			var newRequest = {
				callback: callback,
				callbackContext: callbackContext
			};
			this.__pendingRequests.push(newRequest);


			if (this.__isLocked == true) {
				return;
			} else {
				this.__isLocked = true;
			}

			eyeos.callMessage(checknum, 'getSocialUpdaterHandlers', null, function (results) {
				(new qx.io.ScriptLoader).load('index.php?getSUHandler=1', function(e) {
					this.setToRefresh(false);
					this.__isLocked = false;

					// Eliminate .js from string and sort classes by theirs values of priority
					for (var key in results) {
						for (var i = 0; i < results[key].length; ++i) {
							results[key][i] = results[key][i].substr(0, results[key][i].lastIndexOf('.'));
						}
						results[key] = results[key].sort(this.__handlersSort);
						
					}

					//  trim.js and order here!
					this.setSuHandlers(results);

					this._processPendingRequest();
				}, this);
			}, this);
		},

		/**
		 * Sort handlers by priority
		 */
		__handlersSort: function (a, b) {
			var classA = eval('new ' + a + '();');
			var priorA = classA.getPriority();

			var classB = eval('new ' + b + '();');
			var priorB = classB.getPriority();
			return ( priorB - priorA );
		},

		/**
		  * Process all the request in pending. A process is on pending when
		  * we are executing a callmessage
		  */
		_processPendingRequest: function () {
			if (this.__isLocked != true) {
				while (this.__pendingRequests.length > 0) {
					var request = this.__pendingRequests.shift();
					try{
						if (typeof request['callback'] == 'function') {
							request['callback'].call(request['callbackContext'], this.getSuHandlers());
						}
					} catch (e){
						eyeos.consoleWarn('Unable to execute the callback while processing _processPendingRequest()\n', e);
					}
				}
			}
		}

		
	}
});