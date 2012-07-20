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

// eyeos API

var eyeosmobile = {

	// Static constants

	head: document.getElementsByTagName('head')[0],
	version: '0.1 mobile',

	// Static methods

	/**
	 * Called on response to a request from eyeosmobile.call() or eyeosmobile.callMessage().
	 * This function parses the JSON response before passing it to eyeosmobile._callbackProxyWithContent().
	 *
	 * @param appCallback {Function} The application's function to call on success
	 * @param appCallbackContext {Object} The context of the callback function
	 * @param options {Map} The map of options passed to eyeosmobile.call() or eyeosmobile.callMessage()
	 * @param response {qx.io.remote.Response} The response from the server
	 */
	_callbackProxy: function(appCallback, appCallbackContext, options, content) {
//		var content = response.getContent();
		content = $.evalJSON(content);
		this._callbackProxyWithContent(appCallback, appCallbackContext, options, content);
	},

	/**
	 * Called on response to a request from eyeosmobile.call() or eyeosmobile.callMessage(), after decoding
	 * response's content through eyeosmobile._callbackProxy().
	 * This function is designed to filter the response and process special "control messages"
	 * that may have been sent by the server. If no control message is found in the response's
	 * content, the specified callback is called.
	 *
	 * @param appCallback {Function} The application's function to call on success
	 * @param appCallbackContext {Object} The context of the callback function
	 * @param options {Map} The map of options passed to eyeosmobile.call() or eyeosmobile.callMessage()
	 * @param content {Map} The content of the response from the server
	 */
	_callbackProxyWithContent: function(appCallback, appCallbackContext, options, content) {
		var content = this.handleControlMessage(content, options, appCallbackContext);
		if (content === false) {
			return;
		}

		if (appCallback) {
			if (appCallbackContext) {
				appCallback.call(appCallbackContext, content);
			} else {
				appCallback(content);
			}
		}
	},

	/**
	 * Formats a PHP exception encoded into JSON to a single string.
	 *
	 * @param e {Map} The exception object from JSON.
	 */
	_getFormattedPHPException: function(e) {
		var report = '[' + e['exception'] + '] ';
		report += e['class']? e['class'] + e['type'] : '';
		report += e['function'] + '(): ' + e['message'] + ' --- ' + e['file'] + ' (l.' + e['line'] + ')';
		return report;
	},

	/**
	 * Handles failed requests, when the server returns a status code <> 2xx.
	 * (prints exception stack in console, calls exception callback, displays error dialog, etc.)
	 *
	 * @param e {qx.io.remote.Response} The response from the server
	 * @param originalRequest {qx.io.Request} The original request object, source of the request
	 * @param defaultContext {Object} The context of the success callback function
	 * @param options {Map} The map of options passed to eyeosmobile.call() or eyeosmobile.callMessage()
	 */
	_handleRequestFailed: function(e, originalRequest, defaultContext, options) {
		// notify user (cannot be hidden)
		eyeosmobile.consoleError(e.getStatusCode() + ' ' + e.getState());
		this.openErrorDialog('An error occured on the server.>URL: ' + originalRequest.getUrl() + '<br/>Code: ' + e.getStatusCode() + '<br/>Status: ' + e.getState());

	//execute onException callback
		if (typeof options != 'undefined') {
			if (typeof options.onException != 'undefined') {
				var controlMessage = {
					__eyeos_specialControlMessage_header: '__control_exception',
					__eyeos_specialControlMessage_body: {
						code: 0,
						name: 'Request failed',
						message: 'An error occured on the server.<br/>URL: ' + originalRequest.getUrl() + '<br/>Code: ' + e.getStatusCode() + '<br/>Status: ' + e.getState(),
						stackTrace: []
					}
				}
				if (typeof options.onExceptionContext == 'object') {
					options.onException.call(options.onExceptionContext, controlMessage);
				} else if (typeof options.onExceptionContext == 'undefined') {
					options.onException.call(defaultContext, controlMessage);
				} else {
					options.onException(controlMessage);
				}
			}
		}
	},

	/**
	 * Handles requests that timed out, when the server does not reply within the defined timeout.
	 * (prints exception stack in console, calls exception callback, displays error dialog, etc.)
	 *
	 * @param e {qx.io.remote.Response} The (incomplete) response object
	 * @param originalRequest {qx.io.Request} The original request object, source of the request
	 * @param defaultContext {Object} The context of the success callback function
	 * @param options {Map} The map of options passed to eyeos.call() or eyeos.callMessage()
	 */
	_handleRequestTimeoutError: function(e, originalRequest, defaultContext, options) {
		// notify user (cannot be hidden)
		eyeosmobile.consoleError('Request timeout: ' + originalRequest.getUrl());
		this.openErrorDialog('A request timed out waiting for the response.<br/>URL: ' + originalRequest.getUrl());

		//execute onException callback
		if (typeof options != 'undefined') {
			if (typeof options.onException != 'undefined') {
				var controlMessage = {
					__eyeos_specialControlMessage_header: '__control_exception',
					__eyeos_specialControlMessage_body: {
						code: 0,
						name: 'Request timeout',
						message: 'A request timed out waiting for the response.<br/>URL: ' + originalRequest.getUrl(),
						stackTrace: []
					}
				}
				if (typeof options.onExceptionContext == 'object') {
					options.onException.call(options.onExceptionContext, controlMessage);
				} else if (typeof options.onExceptionContext == 'undefined') {
					options.onException.call(defaultContext, controlMessage);
				} else {
					options.onException(controlMessage);
				}
			}
		}
	},

	/**
	 * Initialize the class representing the message bus on the client side.
	 */
	_initMessageBus: function() {
		// Create the messagebus
//		qx.Class.define('eyeos.messageBus', {
//			type: 'singleton',
//			extend: qx.core.Object,
//
//			members: {
//				/**
//				 * Sends a message on the system bus.
//				 *
//				 * @see /doc/dbus.txt
//				 *
//				 * @param type {String} The type/category of the event (can be the application name if the event is
//				 *        specific to that application, or a more general name if the event is common to several
//				 *        applications and is likely to be fired by any of them. (examples: "file", "calendar",
//				 *        "people", "workgroup", ...)
//				 * @param eventName {String} The name of the event, shortly describing the action that occured.
//				 * @param eventData {var} The optional data attached to the event, allowing a listener to perform
//				 *        the right action with the latest data depending on the event.
//				 */
//				send: function(type, eventName, eventData) {
//					eyeos.consoleInfo('Sending message: ' + 'eyeos_' + type + '_' + eventName + ' / Data: ');
//					eyeos.consoleInfo(eventData);
//					this.fireDataEvent('eyeos_' + type + '_' + eventName, eventData);
//				}
//			}
//		});
	},


	/**
	 * Prints an alert message on the screen using an eyeos dialog box instead of
	 * the browser's one.
	 *
	 * @param message {String} The message to display in the dialog box.
	 * @param callback {Function} The application's function to call when user clicks OK.
	 * @param context {Object} The context of the callback function.
	 */
	alert: function(message, callback, context) {
		try {
			this.openErrorDialog(message);
		} catch (e) {
			alert(message);
			if (typeof callback == 'function') {
				callback.call(context);
			}
		}
	},

	/**
	 * Sends a request to the server.
	 *
	 * @param data {Map} A map containing the GET and POST parameters with their values (see eyeos.callMessage())
	 * @param callback {Function} The application's function to call on success
	 * @param context {Object} The context of the callback function
	 * @param options {Map} The map of options defining, among others, how to handle errors and control messages
	 */
	call: function (data, callback, context, options) {
		var get, myRequest, post, url;

		// Creating url
		url = '';
		for (get in data.get) {
			if (data.get.hasOwnProperty(get)) {
				url += '&' + encodeURIComponent(get) + '=' + encodeURIComponent(data.get[get]);
			}
		}
		url += '&mobile=1';

		var self = this;
		var myRequestSetting = {
			url: 'index.php?' + url.substr(1),
			type: 'POST',
			dataType: 'text',
			success: function (content) {
				eyeosmobile.hideLoading();
				try {
					self._callbackProxy(callback, context, options, content);
				} catch (e) {
					eyeosmobile.consoleError('Exception in callbackProxyWithContent for the current request');
				}
			},
			error: function (response) {
				eyeosmobile.hideLoading();
				this._handleRequestFailed(response, myRequest, context, options);
			}
		}

		if (options && typeof options.timeout == 'number' && (options.timeout == 0 || options.timeout > 2000)) {
			myRequestSetting['timeout'] = options.timeout;
		}

		// Setting data
		for (post in data.post) {
			if (data.post.hasOwnProperty(post)) {
				myRequestSetting['data'] = encodeURIComponent(post) + '=' + encodeURIComponent(data.post[post]);
			}
		}

		$.ajax(myRequestSetting);
	},

	/**
	 * Show a loading Box
	 */
	showLoading: function () {
		$invisibleBlockClicks.css('min-height', $(".ui-page-active").height());
		$invisibleBlockClicks.appendTo($.mobile.pageContainer).show();
		$.mobile.pageLoading();
	},
	
	/**
	 * Hide loading Box
	 */
	hideLoading: function () {
		$.mobile.pageLoading(true);
		$invisibleBlockClicks.hide();
	},

	/**
	 * Sends an eyeos message request to the server.
	 *
	 * @param checknum {Integer} The checknum of the calling application
	 * @param message {String} The name of the message/signal to send to the eyeos system
	 * @param params {Map} The map of arguments/parameters to pass to the target application's function
	 * @param callback {Function} The application's function to call on success
	 * @param context {Object} The context of the callback function
	 * @param options {Map} The map of options defining, among others, how to handle errors and control messages
	 *     <p><b>Possible values are:</b>
	 *        <ul>
	 *            <li>timeout {Integer ? 5000}: The timeout for the request.</li>
	 *            <li>onException {Function}: Specifies a special function that will be called instead of the previous callback
	 *                with the exception from the returned control message.</li>
	 *            <li>onExceptionContext {Object}: Specifies the context for the previous function.
	 *                Omit this entry (or set it to <b>undefined</b>) to use the same context as for the success callback.
	 *                Set it to <b>null</b> not to use any context at all.</li>
	 *            <li>hideException {Boolean ? false}: By default, exceptions returned in control messages will be processed
	 *                using a default behaviour that guarantees the user knows an error happened. This default behaviour consists
	 *                in displaying a error dialog box and logging its trace into the debug console (if present). Set it to TRUE
	 *                to bypass this default processing. Please note that in this case you MUST specify an <i>onException</i>
	 *                callback. Otherwise this entry will be ignored.</li>
	 *        </ul>
	 *    </p>
	 */
	callMessage: function (checknum, message, params, callback, context, options) {
		eyeosmobile.showLoading();
		var data = {
			get: {
				checknum: checknum,
				message: message
			},
			post: {
				params: $.toJSON(params)
			}
		};
		eyeosmobile.call(data, callback, context, options);
	},

	/**
	 * Function call everytime the user login, logout or refresh the page
	 */
	cleanSession: function () {
		//Clean anchor on url
		var currentLocation = location.href;
		if (currentLocation.indexOf('#') != -1) {
			location.href = currentLocation.substr(0, currentLocation.indexOf('#'));
			return true;
		}
		return false;
	},

	console: function(msg) {
		if (typeof console != 'undefined' && typeof console.log == 'function') {
			console.log(msg);
		}
	},

	consoleError: function (msg) {
		eyeosmobile.console(msg);
	},

	consoleWarn: function (msg) {
		eyeosmobile.console(msg);
	},

	consoleGroup: function (msg) {
		eyeosmobile.console(msg);
	},

	consoleGroupEnd: function (msg) {
		eyeosmobile.console(msg);
	},

	eyeosMobileRequest: function (params, callback, callbackContext) {
		var urlGet = 'index.php?mobile=1';

		for (var key in params) {
			urlGet += '&' + key + '=' + params[key];
		}

		var header = document.getElementsByTagName('head')[0];
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = urlGet;
		script.onload = function () {
			if (callback) {
				if (callbackContext) {
					callback.call(callbackContext);
				} else {
					callback();
				}
			}
		}
		header.appendChild(script);
	},

	_executeCallback: function(appCallback, appCallbackContext, e, applicationName) {
		this._deleteNotification(applicationName);
		if (appCallback) {
			if (appCallbackContext) {
				appCallback.call(appCallbackContext, content);
			} else {
				appCallback(content);
			}
		}
	},

	/**
	 * Launches a new application.
	 *
	 * @param applicationName {String} The name of the application to execute
	 * @param checknum {Integer} The checknum of the calling application
	 * @param args {Map} The arguments to pass to the executed application (You may also pass an Array)
	 * @param callback {Function} The callback function to call on request complete
	 * @param callbackContext {Object} The context of the callback function
	 */
	execute: function (applicationName, checknum, args, callback, callbackContext) {
		if (typeof applicationName != 'string') {
			eyeosmobile.consoleWarn('[eyeosmobile.execute()] applicationName must be a string (given: ' + typeof applicationName + ')');
		}
		if (typeof checknum != 'undefined' && typeof checknum != 'number') {
			eyeosmobile.consoleWarn('[eyeosmobile.execute()] checknum must be a number (given: ' + typeof checknum + ')');
		}
		if (typeof args != 'undefined' && typeof args != 'array' && typeof args != 'object') {
			eyeosmobile.consoleWarn('[eyeosmobile.execute()] args must be an array or a Map (given: ' + typeof args + ')');
		}
		if (typeof callback != 'undefined' && typeof callback != 'function') {
			eyeosmobile.consoleWarn('[eyeosmobile.execute()] callback must be a function (given: ' + typeof callback + ')');
		}
		if (typeof callbackContext != 'undefined' && callbackContext != null && typeof callbackContext != 'object') {
			eyeosmobile.consoleWarn('[eyeosmobile.execute()] callbackContext must be an object (given: ' + typeof callbackContext + ')');
		}

		applicationName = applicationName.toLowerCase();
		checknum = (checknum) ? checknum : -1;

		var params = {
			getApplication: applicationName,
			checknum: checknum
		};

		if (args != undefined) {
			params['args'] = $.toJSON(args);
		}
		eyeosmobile.eyeosMobileRequest(params, null, callback, callbackContext);
	},

	getCurrentUserData: function() {
		/** @see eyeos.setCurrentUserData() */
	},

	getCurrentUserName: function() {
		/** @see eyeos.setCurrentUserData() */
	},

	/**
	 * Handle special "control messages".
	 *
	 * @param data {Map} The exception report, as decoded by eyeos._callbackProxy()
	 * @param options {Map} The map of options passed to eyeos.call() or eyeos.callMessage()
	 * @param defaultContext {Object} The default callback context when processing an exception from a control message
	 * @return {var} The (replaced) content to be processed by the callback, or FALSE to stop further processing.
	 */
	handleControlMessage: function(data, options, defaultContext) {
		while (this.isControlMessage(data)) {
			switch (data.__eyeos_specialControlMessage_header) {

				case '__control_exception':
					// no option at all => default behaviour
					if (!options) {
						this.handleEyeosException(data);
					}
					else  {
						// no "onException" callback => default behaviour
						if (typeof options.onException != 'function') {
							this.handleEyeosException(data);
						}
						else {
							// "onException" callback provided and we must hide the error
							if (!options.hideException) {
								this.handleEyeosException(data);
							}
							if (typeof options.onExceptionContext == 'object') {
								options.onException.call(options.onExceptionContext, data);
							} else if (typeof options.onExceptionContext == 'undefined') {
								options.onException.call(defaultContext, data);
							} else {
								options.onException(data);
							}
						}
					}
					return false;

				case '__control_expiration':
					eyeosmobile.alert('Your session has expired.', function() {
						eyeosmobile.execute('init');
					});
					return false;

				case '__control_enhancedData':
					var body = data['__eyeos_specialControlMessage_body'];

					// Send all events from the control message
					if (typeof body.messages == 'object' && body.messages.length) {
						for(var i = 0; i < body.messages.length; i++) {
							var message = body.messages[i];
//							eyeosmobile.messageBus.getInstance().send(message.type, message.eventName, message.eventData);
						}
					}
					// Replace body by the encapsulated body from the control message
					try {
						data = $.evalJSON(body.data);
					} catch (err) {
						data = body.data;
					}

					break;

				case '__control_refresh':
					window.location.reload();
					return false;
					break;

				default :
					var msg = 'Unknown control message received (header: "' + data['__eyeos_specialControlMessage_header'] + '")';
					eyeosmobile.alert(msg);
					eyeosmobile.consoleWarn('[eyeos] ' + msg);
			}
		}
		return data;
	},

	/**
	 * Handle error reports returned from the server (PHP exceptions).
	 * Displays an error dialog containing information about the error that was returned by the server.
	 * Reports also the same information in the debug console (Firebug, etc.), in an error message.
	 *
	 * @param controlMessageContent {Map} The map containing the header, body and options of the control message
	 */
	handleEyeosException: function(controlMessageContent) {
		var exception = controlMessageContent.__eyeos_specialControlMessage_body;
		var stackTraceText = '';

		eyeosmobile.consoleGroup(exception.name + ': ' + exception.message);
		if (exception.stackTrace instanceof Array) {
			for(var i = 0; i < exception.stackTrace.length; i++) {
				var exceptionText = this._getFormattedPHPException(exception.stackTrace[i]);
				stackTraceText += exceptionText + "\n\n";
				eyeosmobile.consoleError(exceptionText);
			}
		} else {
			eyeosmobile.consoleError(exception.name + ': ' + exception.message + ' --- ' + exception.stackTrace);
		}
		eyeosmobile.consoleGroupEnd(exception.name + ': ' + exception.message);
		this.openErrorDialog(exception.message);
	},

	/**
	 * Prints an info message on the screen using an eyeos dialog box.
	 *
	 * @param message {String} The message to display in the dialog box.
	 * @param callback {Function} The application's function to call when user clicks OK.
	 * @param context {Object} The context of the callback function.
	 */
	info: function(message, callback, context) {
		try {
//		TODO PEPPE Create OpenDialog
//			var op = new eyeos.dialogs.OptionPane(
//					message,
//					eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
//			var d = op.createDialog(null, 'Information', callback, context).set({
//				modal: false
//			});
//			d.open();
		} catch (e) {
			eyeosmobile.consoleWarn('[eyeos] Cannot display information message "' + message + '"');
		}
	},

	/**
	 * Checks if the specified data defines a control message.
	 *
	 * @param data {Map}
	 * @return {Boolean} TRUE if the specified data is a control message, FALSE otherwise
	 */
	isControlMessage: function(data) {
		return (data && data.__eyeos_specialControlMessage_header)? true : false;
	},

	/**
	 * Checks if the specified data defines an error control message.
	 *
	 * @param data {Map}
	 * @return {Boolean} TRUE if the specified data is an error control message, FALSE otherwise
	 */
	isErrorControlMessage: function(data) {
		return (data &&
				(data.__eyeos_specialControlMessage_header == '__control_exception'
				|| data.__eyeos_specialControlMessage_header == '__control_expiration'))? true : false;
	},

	/**
	 * Logs an eyeos exception (created by PHP) to the debug console.
	 *
	 * @param exception {Map}
	 */
	logEyeosException: function(exception) {
		eyeosmobile.consoleGroup(exception.name + ': ' + exception.message);
		if (exception.stackTrace instanceof Array) {
			for(var i = 0; i < exception.stackTrace.length; i++) {
				var exceptionText = this._getFormattedPHPException(exception.stackTrace[i]);
				eyeosmobile.consoleError(exceptionText);
			}
		} else {
			eyeosmobile.consoleError(exception.name + ': ' + exception.message + ' --- ' + exception.stackTrace);
		}
		eyeosmobile.consoleGroupEnd(exception.name + ': ' + exception.message);
	},

	openErrorDialog: function (message) {
		$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>" + message + "</h1></div>")
						.css({"display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100})
						.appendTo( $.mobile.pageContainer )
						.click(function(){
							$(this).remove();
						})
						.delay( 2000 )
						.fadeOut( 400, function(){
							$(this).remove();
						});
	},	
	
	setCurrentUserData: function(data) {
		eyeosmobile.getCurrentUserData = function() {
			return data;
		};
		eyeosmobile.getCurrentUserName = function() {
			return data.name;
		};
	},

	/**
	 * Starts the eyeos system by loading all necessary scripts and executing the init process.
	 */
	start: function () {
		//eyeos._initMessageBus();

		try {
			eyeosmobile.cleanSession();
		} catch (e) {
			eyeosmobile.consoleWarn(e);
		}
		eyeosmobile.execute('init');

	},

	/**
	 * Identify iPhone/iPod platform
	 */
	isiPhone: function () {
		return (
			(navigator.platform.indexOf("iPhone") != -1) ||
			(navigator.platform.indexOf("iPod") != -1)
		);
	},

	/**
	 * Identify iPad platform
	 */
	isiPad: function () {
		return navigator.platform.indexOf("iPad") != -1;
	}
};

function tr(message, tokens) {
    var finalStr;
    var i;
    if(lang[message]) {
        finalStr = lang[message];
    } else {
        finalStr = message;
    }


    if(tokens) {
        for(i in tokens) {
            finalStr = finalStr.replace("%s", tokens[i]);
        }
    }
    return finalStr;
}

lang = new Object;

if (typeof console == 'undefined') {
    console = new Object();
    console.log = function() {};
    console.debug = function() {};
    console.warn = function() {};
}

