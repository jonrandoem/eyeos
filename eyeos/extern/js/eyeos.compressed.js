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

var eyeos = {
	
	// Static constants
	
	head: document.getElementsByTagName('head')[0],
	version: '2.5.0',
	
	// Static methods
	
	/**
	 * Called on response to a request from eyeos.call() or eyeos.callMessage().
	 * This function parses the JSON response before passing it to eyeos._callbackProxyWithContent().
	 * 
	 * @param appCallback {Function} The application's function to call on success
	 * @param appCallbackContext {Object} The context of the callback function
	 * @param options {Map} The map of options passed to eyeos.call() or eyeos.callMessage()
	 * @param response {qx.io.remote.Response} The response from the server
	 */
	_callbackProxy: function(appCallback, appCallbackContext, options, response) {
		var content = response.getContent();
		content = qx.util.Json.parse(content);
		this._callbackProxyWithContent(appCallback, appCallbackContext, options, content);
	},
	
	/**
	 * Called on response to a request from eyeos.call() or eyeos.callMessage(), after decoding
	 * response's content through eyeos._callbackProxy().
	 * This function is designed to filter the response and process special "control messages"
	 * that may have been sent by the server. If no control message is found in the response's
	 * content, the specified callback is called.
	 * 
	 * @param appCallback {Function} The application's function to call on success
	 * @param appCallbackContext {Object} The context of the callback function
	 * @param options {Map} The map of options passed to eyeos.call() or eyeos.callMessage()
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
	 * @param options {Map} The map of options passed to eyeos.call() or eyeos.callMessage()
	 */
	_handleRequestFailed: function(e, originalRequest, defaultContext, options) {
		// notify user (cannot be hidden)
		eyeos.consoleError(e.getStatusCode() + ' ' + e.getState());
		var op = new eyeos.dialogs.OptionPane(
			'An error occured on the server.<br/>URL: ' + originalRequest.getUrl() + '<br/>Code: ' + e.getStatusCode() + '<br/>Status: ' + e.getState(),
			eyeos.dialogs.OptionPane.ERROR_MESSAGE
			);
		op.createDialog(null, 'Server Error').open();
		
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
		eyeos.consoleError('Request timeout: ' + originalRequest.getUrl());
		var op = new eyeos.dialogs.OptionPane(
			'A request timed out waiting for the response.<br/>URL: ' + originalRequest.getUrl(),
			eyeos.dialogs.OptionPane.ERROR_MESSAGE
			);
		op.createDialog(null, 'Request Timeout').open();
		
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
		qx.Class.define('eyeos.messageBus', {
			type: 'singleton',
			extend: qx.core.Object,

			members: {
				data: new Object,
				/**
				 * Sends a message on the system bus.
				 * 
				 * @see /doc/dbus.txt
				 * 
				 * @param type {String} The type/category of the event (can be the application name if the event is
				 *        specific to that application, or a more general name if the event is common to several
				 *        applications and is likely to be fired by any of them. (examples: "file", "calendar",
				 *        "people", "workgroup", ...)
				 * @param eventName {String} The name of the event, shortly describing the action that occured.
				 * @param eventData {var} The optional data attached to the event, allowing a listener to perform
				 *        the right action with the latest data depending on the event.
				 */
				send: function(type, eventName, eventData) {
					eyeos.consoleInfo('Sending message: ' + 'eyeos_' + type + '_' + eventName + ' / Data: ');
					eyeos.consoleInfo(eventData);
					this.fireDataEvent('eyeos_' + type + '_' + eventName, eventData);
				},

				store: function(name, data) {
					this.data[name] = data;
					//backward compatibility
					document[name] = data;
				},

				retrieve: function (name) {
					return this.data[name];
				}
			}
		});
	},

	/**
	 * Files Queue Manager for all the File Controllers
	 */

	_initFilesQueue: function () {
		qx.Class.define('eyeos.filesQueue', {
			type: 'singleton',
			
			extend: qx.core.Object,

			members: {

				/**
				 * Fills the general queue that all "Files" will read from.
				 *
				 * @param action {String} The action that will be applied for the queue, can be 'copy' or 'move'
				 * @param files {Array} Array of the item objects for creating the queue with file objects
				 * @param source {String} The source path where the "cut"/"copy"/"move" has started
				 */
				fillMoveQueue: function (action, files, source) {
					this.setMoveQueue([]);
					this.setMoveSource(source);
					this.setAction(action);
					for (var i = 0; i < files.length; ++i) {
						this.getMoveQueue().push(files[i].getFile());
					}
				},

				fillDragQueue: function (files, source) {
					this.setDragQueue([]);
					this.setDragSource(source);
					for (var i = 0; i < files.length; ++i) {
						this.getDragQueue().push(files[i].getFile());
					}
				}
			},

			properties: {
				moveSource: {
					check: 'String',
					init: null
				},
				dragSource: {
					check: 'String',
					init: null
				},
				dragQueue: {
					check: 'Array',
					init: new Array()
				},
				moveQueue: {
					check: 'Array',
					init: new Array()
				},
				action: {
					check: 'String',
					init: null
				}
			}
		});
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
			var op = new eyeos.dialogs.OptionPane(
				message,
				eyeos.dialogs.OptionPane.WARNING_MESSAGE);
			var d = op.createDialog(null, 'Alert', callback, context).set({
				modal: false
			});
			d.open();
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
		
		// Creating request
		myRequest = new qx.io.remote.Request('index.php?' + url.substr(1), 'POST', 'text/plain');
		if ( options ) {
			if ( typeof options.timeout == 'number' && (options.timeout == 0 || options.timeout > 2000) ) {
				myRequest.setTimeout(options.timeout);
			}
			if ( typeof options.async == 'boolean') {
				myRequest.setAsynchronous(options.async);
			}
		}
		
		// Setting data
		for (post in data.post) {
			if (data.post.hasOwnProperty(post)) {
				myRequest.setData(encodeURIComponent(post) + '=' + encodeURIComponent(data.post[post]));
			}
		}
		
		myRequest.addListener('completed', function (e) {
			try {
				this._callbackProxy(callback, context, options, e);
			} catch (e) {
				eyeos.consoleError(e);
			}
		}, this);
		myRequest.addListener('timeout', function (e) {
			this._handleRequestTimeoutError(e, myRequest, context, options);
		}, this);
		myRequest.addListener('failed', function (e) {
			this._handleRequestFailed(e, myRequest, context, options);
		}, this);
		
		myRequest.send();
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
		if(options && typeof options != 'undefined' && typeof options.allowQueue == 'boolean') {
			var queue = eyeos.messageQueue.getInstance();
			queue.add(checknum, message, params, callback, context, options);

			if(typeof options != 'undefined' && typeof options.releaseQueue == 'boolean') {
				var stack = queue.getStack();
				queue.cleanStack();
				var params = new Array();
				for(i in stack) {
					params.push([ stack[i][0], stack[i][1], stack[i][2] ]);
				}
				var data = {
					get: {
						groupMessages: true
					},
					post: {
						params: qx.util.Json.stringify(params)
					}
				};
				eyeos.call(data, function(response) {
					var i = 0;
					for(i in response) {
						var content = qx.util.Json.parse(response[i]);
						var appCallback = stack[i][3];
						var appCallbackContext = stack[i][4];
						if (appCallback) {
							if (appCallbackContext) {
								appCallback.call(appCallbackContext, content);
							} else {
								appCallback(content);
							}
						}
					}
				}, context);
			}
		} else {
			var data = {
				get: {
					checknum: checknum,
					message: message
				},
				post: {
					params: qx.util.Json.stringify(params)
				}
			};

			eyeos.call(data, callback, context, options);
		}
	},

	/**
	 * Function call everytime the user login, logout or refresh the page
	 */
	cleanSession: function () {
		// Delete messageBus, since its a singleton, we have to redefine it
		eyeos._initMessageBus();
		eyeos._initFilesQueue();

		// Clean Contact Manager Cache
		if (qx.Class.isDefined('eyeos.contacts.ContactManager')) {
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.refreshCache();
			eyeos.contacts.ContactManager.init();
		}

	/*
            if(eyeos.netSync) {
				try {
					var netSync = eyeos.netSync.NetSync.getInstance();
					netSync.disconnect();
				} catch (e) {
					
				}
            }
            */

	},
	
	consoleError: function(msg) {
		if (typeof console != 'undefined' && typeof console.error == 'function') {
			console.error(msg);
		}
	},
	
	consoleGroup: function(msg) {
		if (typeof console != 'undefined' && typeof console.group == 'function') {
			console.group(msg);
		}
	},
	
	consoleGroupEnd: function(msg) {
		if (typeof console != 'undefined' && typeof console.groupEnd == 'function') {
			console.groupEnd(msg);
		}
	},
	
	consoleInfo: function(msg) {
		if (typeof console != 'undefined' && typeof console.info == 'function') {
			console.info(msg);
		}
	},
	
	consoleLog: function(msg) {
		if (typeof console != 'undefined' && typeof console.log == 'function') {
			console.log(msg);
		}
	},
	
	consoleWarn: function(msg) {
		if (typeof console != 'undefined' && typeof console.warn == 'function') {
			console.warn(msg);
		}
	},

	_executeCallback: function(appCallback, appCallbackContext, e, applicationName) {
		this._deleteNotification(applicationName);
		if (appCallback) {
			if (appCallbackContext) {
				appCallback.call(appCallbackContext, e);
			} else {
				appCallback(e);
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
			eyeos.consoleWarn('[eyeos.execute()] applicationName must be a string (given: ' + typeof applicationName + ')');
		}
		if (typeof checknum != 'undefined' && typeof checknum != 'number') {
			eyeos.consoleWarn('[eyeos.execute()] checknum must be a number (given: ' + typeof checknum + ')');
		}
		if (typeof args != 'undefined' && typeof args != 'array' && typeof args != 'object') {
			eyeos.consoleWarn('[eyeos.execute()] args must be an array or a Map (given: ' + typeof args + ')');
		}
		if (typeof callback != 'undefined' && typeof callback != 'function') {
			eyeos.consoleWarn('[eyeos.execute()] callback must be a function (given: ' + typeof callback + ')');
		}
		if (typeof callbackContext != 'undefined' && callbackContext != null && typeof callbackContext != 'object') {
			eyeos.consoleWarn('[eyeos.execute()] callbackContext must be an object (given: ' + typeof callbackContext + ')');
		}
		
		applicationName = applicationName.toLowerCase();
		if(!checknum) {
			checknum = -1;
		}
		var urlArgs = encodeURIComponent(qx.util.Json.stringify(args, false));

		this._createNotification(applicationName);
		if (window[applicationName + '_application']) {
			var url = 'index.php?getApplication=' + applicationName + '&includeBody=0&checknum=' + checknum + '&args=' + urlArgs;
		} else {
			var url = 'index.php?getApplication=' + applicationName + '&checknum=' + checknum + '&args=' + urlArgs;
		}

		(new qx.io.ScriptLoader).load(url, function(e) {
			this._executeCallback(callback, callbackContext, e, applicationName);
		}, this);
	},

	_deleteNotification: function(applicationName) {
		if(applicationName != 'login' && applicationName != 'logout' && applicationName != 'session'&& applicationName != 'init' &&
			applicationName != 'desktop' && applicationName != 'register' && applicationName != 'contactmanager' && applicationName != 'netsync'
			&& applicationName != 'toptabs' && applicationName != 'taskbar' && applicationName != 'topmenu' && applicationName != 'download') {
			if(document.notifications[applicationName]) {
				document.notifications[applicationName].destroy();
			}
		}
	},

	_createNotification: function(applicationName) {
		if(applicationName != 'login' && applicationName != 'logout' && applicationName != 'session'&& applicationName != 'init' &&
			applicationName != 'desktop' && applicationName != 'register' && applicationName != 'contactmanager' && applicationName != 'netsync'
			&& applicationName != 'toptabs' && applicationName != 'taskbar' && applicationName != 'topmenu' && applicationName != 'download') {
			var image = new qx.ui.basic.Image("index.php?extern=images/app-loader.png");
			if(!document.notifications) {
				document.notifications = new Object();
			}


			var bus = eyeos.messageBus.getInstance();
			var eyeDesktop = bus.retrieve('eyeDesktop');
			var dimensions = eyeDesktop.getBounds();
			


			var logoContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			logoContainer.set({
				zIndex: 100003
			});
			document.notifications[applicationName] = logoContainer;
			logoContainer.add(image, {
				left:0,
				top:0
			});
			var imageLoader = new qx.ui.basic.Image("index.php?extern=images/loader.gif");
			logoContainer.add(imageLoader, {
				left:93,
				top: 72
			});
			eyeDesktop.add(logoContainer, {
				left: (dimensions.width / 2) - 130,
				top: (dimensions.height / 2) - 130
			});

			if(applicationName == 'newusersettings') {
				applicationName = 'Settings';
			}
			var labelName = new qx.ui.basic.Label().set({
				value: '<span style="color: #FFFFFF;font-family:Arial;font-size:13px"><strong>'+applicationName.toUpperCase()+'</strong></span>',
				rich : true,
				width: 160,
				textAlign: 'center',
				marginLeft: 28,
				marginTop: 0

			});

			logoContainer.add(labelName, {
				left:0,
				top:35
			});

			
		}
	},

	openFile: function(fileName, checknum) {
		if(typeof fileName != 'string') {
			eyeos.consoleWarn('[eyeos.openFile()] fileName must be a string (given: ' + typeof fileName + ')');
		}

		if (typeof checknum != 'undefined' && typeof checknum != 'number') {
			eyeos.consoleWarn('[eyeos.execute()] checknum must be a number (given: ' + typeof checknum + ')');
		}
		//TODO: load from user conf file
		var extensions = new Object();
		extensions['JPG'] = 'imageviewer';
		extensions['JPEG'] = 'imageviewer';
		extensions['BMP'] = 'imageviewer';
		extensions['GIF'] = 'imageviewer';
		extensions['PNG'] = 'imageviewer';
		extensions['MP3'] = 'viewer';
		extensions['FLV'] = 'viewer';
		extensions['HTM'] = 'viewer';
		extensions['HTML'] = 'viewer';
		extensions['M4A'] = 'viewer';
		extensions['WMA'] = 'viewer';
		extensions['WAV'] = 'viewer';
		extensions['MOV'] = 'viewer';
		extensions['3GP'] = 'viewer';
		extensions['3GPP'] = 'viewer';
		extensions['3G2'] = 'viewer';
		extensions['MP4'] = 'viewer';
		extensions['MPG'] = 'viewer';
		extensions['MPV'] = 'viewer';
		extensions['OGG'] = 'viewer';
		extensions['OGV'] = 'viewer';
		extensions['AVI'] = 'viewer';
		extensions['WEBM'] = 'viewer';
		extensions['EDOC'] = 'documents';
		extensions['TXT'] = 'notepad';
		extensions['LNK'] = 'openLink';
		extensions['PDF'] = 'pdfviewer';
		extensions['DOC'] = 'docviewer';
		extensions['DOCX'] = 'docviewer';
		extensions['ODT'] = 'docviewer';
		extensions['ODS'] = 'docviewer';
		extensions['OTS'] = 'docviewer';
		extensions['SXC'] = 'docviewer';
		extensions['XLS'] = 'docviewer';
		extensions['XLT'] = 'docviewer';
		extensions['XLS'] = 'docviewer';
		extensions['XLSX'] = 'docviewer';
		extensions['ODP'] = 'docviewer';
		extensions['OTP'] = 'docviewer';
		extensions['SXI'] = 'docviewer';
		extensions['STI'] = 'docviewer';
		extensions['PPT'] = 'docviewer';
		extensions['POT'] = 'docviewer';
		extensions['SXD'] = 'docviewer';
		extensions['PPTX'] = 'docviewer';
		extensions['PPSX'] = 'docviewer';
		extensions['POTM'] = 'docviewer';
		extensions['PPS'] = 'docviewer';
		extensions['FODP'] = 'docviewer';
		extensions['UOP'] = 'docviewer';
		            
		var i;
		var ext = /^.+\.([^.]+)$/.exec(fileName);
		ext = ext[1].toUpperCase();

		if(extensions[ext]) {
			eyeos.execute(extensions[ext], checknum, [fileName])
		} else {
			eyeos.execute('download', checknum, [fileName]);
		}
	},

	openFiles: function (filesToOpen, checknum) {

		if(filesToOpen.length == 1) {
			var path = filesToOpen[0].getUserData('path');
			eyeos.openFile(path, checknum);
			return;
		}
		var filesForViewer = new Array();
		var filesForDocuments = new Array();
		var filesForFemto = new Array();
		var foldersToOpen = new Array();
		var filesForImageViewer = new Array();
		var filesForDocPreview = new Array();

		var extensionsForViewer = ['MP3','FLV','HTM','HTML','M4A'];
		var extensionsForDocuments = ['EDOC'];
		var extensionsForFemto = ['TXT'];
		var extensionsForImageViewer = ['JPG', 'JPEG', 'BMP', 'GIF', 'PNG'];

		var extensionsDocPreview = ['DOC', 'DOCX', 'ODT', 'ODS', 'OTS', 'SXC', 'XLS', 'XLT', 'XLS', 'XLSX', 'ODP', 'OTP', 'SXI', 'STI', 'PPT', 'POT', 'SXD', 'PPTX',	'PPSX', 'POTM', 'PPS', 'FODP', 'UOP'];

		for (var i = 0; i < filesToOpen.length; ++i) {
			var path = filesToOpen[i].getUserData('path');
			
			var ext = /^.+\.([^.]+)$/.exec(path);
			var extension = ext[1].toUpperCase();

			if (extensionsForViewer.indexOf(extension) != -1) {
				filesForViewer.push(path);
			}
			if (extensionsForImageViewer.indexOf(extension) != -1) {
				filesForImageViewer.push(path);
			}
			if (extensionsForDocuments.indexOf(extension) != -1) {
				filesForDocuments.push(path);
			}
			if (extensionsForFemto.indexOf(extension) != -1) {
				filesForFemto.push(path);
			}

			if (extensionsDocPreview.indexOf(extension) != -1) {
				filesForDocPreview.push(path);
			}
		}

		if (filesForViewer.length >= 1) {
			eyeos.execute('viewer', checknum, filesForViewer);
		}

		if (filesForImageViewer.length >= 1) {
			eyeos.execute('imageviewer', checknum, filesForImageViewer);
		}

		if (filesForDocuments.length >= 1) {
			eyeos.execute('documents', checknum, filesForDocuments);
		}

		if (filesForFemto.length >= 1) {
			eyeos.execute('notepad', checknum, filesForFemto);
		}

		if (filesForDocPreview.length >= 1) {
			eyeos.execute('docpreview', checknum, filesForDocPreview);
		}

		for (var i = 0; i < foldersToOpen.length; ++i) {
			eyeos.execute('files', checknum, [foldersToOpen[i]]);
		}
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
					eyeos.alert('Your session has expired.', function() {
						window.onbeforeunload = null;
						document.location.reload();
					});
					return false;
				
				case '__control_enhancedData':
					var body = data['__eyeos_specialControlMessage_body'];

					// Send all events from the control message
					if (typeof body.messages == 'object' && body.messages.length) {
						for(var i = 0; i < body.messages.length; i++) {
							var message = body.messages[i];
							eyeos.messageBus.getInstance().send(message.type, message.eventName, message.eventData);
						}
					}
					// Replace body by the encapsulated body from the control message
					try {
						data = qx.util.Json.parse(body.data);
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
					eyeos.alert(msg);
					eyeos.consoleWarn('[eyeos] ' + msg);
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
		
		eyeos.consoleGroup(exception.name + ': ' + exception.message);
		if (exception.stackTrace instanceof Array) {
			for(var i = 0; i < exception.stackTrace.length; i++) {
				var exceptionText = this._getFormattedPHPException(exception.stackTrace[i]);
				stackTraceText += exceptionText + "\n\n";
				eyeos.consoleError(exceptionText);
			}
		} else {
			eyeos.consoleError(exception.name + ': ' + exception.message + ' --- ' + exception.stackTrace);
		}
		eyeos.consoleGroupEnd(exception.name + ': ' + exception.message);
		
		//error dialog box
		var op = new eyeos.dialogs.OptionPane(
			escapeHtml(exception.message),
			eyeos.dialogs.OptionPane.ERROR_MESSAGE,
			null,
			null,
			[stackTraceText]
			);
		op.createDialog(null, exception.name).open();
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
			var op = new eyeos.dialogs.OptionPane(
				message,
				eyeos.dialogs.OptionPane.INFORMATION_MESSAGE);
			var d = op.createDialog(null, 'Information', callback, context).set({
				modal: false
			});
			d.open();
		} catch (e) {
			eyeos.consoleWarn('[eyeos] Cannot display information message "' + message + '"');
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
		eyeos.consoleGroup(exception.name + ': ' + exception.message);
		if (exception.stackTrace instanceof Array) {
			for(var i = 0; i < exception.stackTrace.length; i++) {
				var exceptionText = this._getFormattedPHPException(exception.stackTrace[i]);
				eyeos.consoleError(exceptionText);
			}
		} else {
			eyeos.consoleError(exception.name + ': ' + exception.message + ' --- ' + exception.stackTrace);
		}
		eyeos.consoleGroupEnd(exception.name + ': ' + exception.message);
	},
	
	setCurrentUserData: function(data) {
		eyeos.getCurrentUserData = function() {
			return data;
		};
		eyeos.getCurrentUserName = function() {
			return data.name;
		};
	},

	bootstrap: function() {
		eyeos.preInitialization();
		eyeos.start();
	},
	
	/**
	 * Starts the eyeos system by loading all necessary scripts and executing the init process.
	 */
	start: function () {
		qx.io.remote.RequestQueue.getInstance().setDefaultTimeout(20000);
		qx.io.remote.RequestQueue.getInstance().setMaxConcurrentRequests(100);
		
		//eyeos._initMessageBus();
		eyeos.execute('init');

		// Create the messagebus
		try {
			eyeos.cleanSession();
		} catch (e) {
			eyeos.consoleWarn(e);
		}		
		
		//DEBUG
		eyeos.messageBus.getInstance().addListener('eyeos_debug_infoMessage', function(e) {
			eyeos.consoleInfo(e.getData());
			eyeos.info(e.getData());
		});
	},

	preInitialization: function() {

		qx.Class.define('eyeos.messageQueue', {
			type: 'singleton',
			extend: qx.core.Object,

			members: {
				__stack:new Array(),
				add: function(checknum, message, params, callback, context, options) {
					this.__stack.push([checknum, message, params, callback, context, options]);
				},
				getStack: function() {
					return this.__stack;
				},
				cleanStack: function() {
					this.__stack = new Array();
				}
			}
		});

		qx.Class.define('eyeos.Application', {
			extend: qx.application.Standalone,
			members: {

				main: function () {
					this.base(arguments);

					if (qx.core.Variant.isSet('qx.debug', 'on')) {
						qx.log.appender.Native;
						qx.log.appender.Console;
					}
				}
			}
		});

		qx.Class.define("qx.ui.decoration.Util",
		{
			statics :
			{
				/**
                     * Detects whether the move from decorator <code>a</code> to <code>b</code>
                     * results into modified insets.
                     *
                     * @param a {Decorator} Old decorator or <code>null</code>
                     * @param b {Decorator} New decorator or <code>null</code>
                     * @return {Boolean} Whether the insets have been modified
                     */
				insetsModified : function(a, b)
				{
					if (a == b) {
						return false;
					}

					if (a == null || b == null) {
						return true;
					}

					var manager = qx.theme.manager.Decoration.getInstance();

					var first = manager.resolve(a).getInsets();
					var second = manager.resolve(b).getInsets();

					if (first.top != second.top || first.right != second.right || first.bottom != second.bottom || first.left != second.left) {
						return true;
					}

					return false;
				},


				/**
                     * Computes and returns a set of markup to output the given
                     * image configuration.
                     *
                     * @param image {String} URL to the image to show
                     * @param repeat {String} Any supported background repeat: <code>repeat</code>,
                     *    <code>repeat-x</code>, <code>repeat-y</code>, <code>no-repeat</code> or
                     *    <code>scale</code>
                     * @param left {Integer|String?null} The horizontal offset of the image
                     *      inside of the image element. If the value is an integer it is
                     *      interpreted as pixel value otherwise the value is taken as CSS value.
                     *      CSS the values are "center", "left" and "right"
                     * @param top {Integer|String?null} The vertical offset of the image
                     *      inside of the image element. If the value is an integer it is
                     *      interpreted as pixel value otherwise the value is taken as CSS value.
                     *      CSS the values are "top", "bottom" and "center"
                     * @param styles {String} Additional styles to insert into the element
                     * @return {String} Markup which contains the given image specification
                     */
				generateBackgroundMarkup : function(image, repeat, left, top, styles)
				{
					// Support for images
					if (image)
					{
						var resolved = qx.util.AliasManager.getInstance().resolve(image);

						// Scaled image
						if (repeat == "scale")
						{
							var uri = qx.util.ResourceManager.getInstance().toUri(resolved);
							return '<img src="' + uri + '" style="vertical-align:top;' + styles + '"/>';
						}

						// Repeated image
						else
						{
							var back = qx.bom.element.Background.compile(resolved, repeat, left, top);
							return '<div style="' + back + styles + '"></div>';
						}
					}
					else
					{
						if (styles) {
							if (qx.core.Variant.isSet("qx.client", "mshtml"))
							{
								/*
                                     * Internet Explorer as of version 6 for quirks and standards mode,
                                     * or version 7 in quirks mode adds an empty string to the "div"
                                     * node. This behavior causes rendering problems, because the node
                                     * would then have a minimum size determined by the font size.
                                     * To be able to set the "div" node height to a certain (small)
                                     * value independent of the minimum font size, an "overflow:hidden"
                                     * style is added.
                                     * */
								if (qx.bom.client.Engine.VERSION < 7 || qx.bom.client.Feature.QUIRKS_MODE)
								{
									// Add additionally style
									styles += "overflow:hidden;";
								}
							}

							return '<div style="' + styles + '"></div>';
						} else {
							return "";
						}
					}
				}
			}
		});
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

/*
Copyright (c) Copyright (c) 2007, Carl S. Yestrau All rights reserved.
Code licensed under the BSD License: http://www.featureblend.com/license.txt
Version: 1.0.4
*/
var FlashDetect = new function(){
	var self = this;
	self.installed = false;
	self.raw = "";
	self.major = -1;
	self.minor = -1;
	self.revision = -1;
	self.revisionStr = "";
	var activeXDetectRules = [
	{
		"name":"ShockwaveFlash.ShockwaveFlash.7",
		"version":function(obj){
			return getActiveXVersion(obj);
		}
	},
	{
		"name":"ShockwaveFlash.ShockwaveFlash.6",
		"version":function(obj){
			var version = "6,0,21";
			try{
				obj.AllowScriptAccess = "always";
				version = getActiveXVersion(obj);
			}catch(err){}
			return version;
		}
	},
	{
		"name":"ShockwaveFlash.ShockwaveFlash",
		"version":function(obj){
			return getActiveXVersion(obj);
		}
	}
	];
	/**
     * Extract the ActiveX version of the plugin.
     *
     * @param {Object} The flash ActiveX object.
     * @type String
     */
	var getActiveXVersion = function(activeXObj){
		var version = -1;
		try{
			version = activeXObj.GetVariable("$version");
		}catch(err){}
		return version;
	};
	/**
     * Try and retrieve an ActiveX object having a specified name.
     *
     * @param {String} name The ActiveX object name lookup.
     * @return One of ActiveX object or a simple object having an attribute of activeXError with a value of true.
     * @type Object
     */
	var getActiveXObject = function(name){
		var obj = -1;
		try{
			obj = new ActiveXObject(name);
		}catch(err){
			obj = {
				activeXError:true
			};
		}
		return obj;
	};
	/**
     * Parse an ActiveX $version string into an object.
     *
     * @param {String} str The ActiveX Object GetVariable($version) return value.
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
	var parseActiveXVersion = function(str){
		var versionArray = str.split(",");//replace with regex
		return {
			"raw":str,
			"major":parseInt(versionArray[0].split(" ")[1], 10),
			"minor":parseInt(versionArray[1], 10),
			"revision":parseInt(versionArray[2], 10),
			"revisionStr":versionArray[2]
		};
	};
	/**
     * Parse a standard enabledPlugin.description into an object.
     *
     * @param {String} str The enabledPlugin.description value.
     * @return An object having raw, major, minor, revision and revisionStr attributes.
     * @type Object
     */
	var parseStandardVersion = function(str){
		var descParts = str.split(/ +/);
		var majorMinor = descParts[2].split(/\./);
		var revisionStr = descParts[3];
		return {
			"raw":str,
			"major":parseInt(majorMinor[0], 10),
			"minor":parseInt(majorMinor[1], 10),
			"revisionStr":revisionStr,
			"revision":parseRevisionStrToInt(revisionStr)
		};
	};
	/**
     * Parse the plugin revision string into an integer.
     *
     * @param {String} The revision in string format.
     * @type Number
     */
	var parseRevisionStrToInt = function(str){
		return parseInt(str.replace(/[a-zA-Z]/g, ""), 10) || self.revision;
	};
	/**
     * Is the major version greater than or equal to a specified version.
     *
     * @param {Number} version The minimum required major version.
     * @type Boolean
     */
	self.majorAtLeast = function(version){
		return self.major >= version;
	};
	/**
     * Is the minor version greater than or equal to a specified version.
     *
     * @param {Number} version The minimum required minor version.
     * @type Boolean
     */
	self.minorAtLeast = function(version){
		return self.minor >= version;
	};
	/**
     * Is the revision version greater than or equal to a specified version.
     *
     * @param {Number} version The minimum required revision version.
     * @type Boolean
     */
	self.revisionAtLeast = function(version){
		return self.revision >= version;
	};
	/**
     * Is the version greater than or equal to a specified major, minor and revision.
     *
     * @param {Number} major The minimum required major version.
     * @param {Number} (Optional) minor The minimum required minor version.
     * @param {Number} (Optional) revision The minimum required revision version.
     * @type Boolean
     */
	self.versionAtLeast = function(major){
		var properties = [self.major, self.minor, self.revision];
		var len = Math.min(properties.length, arguments.length);
		for(i=0; i<len; i++){
			if(properties[i]>=arguments[i]){
				if(i+1<len && properties[i]==arguments[i]){
					continue;
				}else{
					return true;
				}
			}else{
				return false;
			}
		}
	};
	/**
     * Constructor, sets raw, major, minor, revisionStr, revision and installed public properties.
     */
	self.FlashDetect = function(){
		if(navigator.plugins && navigator.plugins.length>0){
			var type = 'application/x-shockwave-flash';
			var mimeTypes = navigator.mimeTypes;
			if(mimeTypes && mimeTypes[type] && mimeTypes[type].enabledPlugin && mimeTypes[type].enabledPlugin.description){
				var version = mimeTypes[type].enabledPlugin.description;
				var versionObj = parseStandardVersion(version);
				self.raw = versionObj.raw;
				self.major = versionObj.major;
				self.minor = versionObj.minor;
				self.revisionStr = versionObj.revisionStr;
				self.revision = versionObj.revision;
				self.installed = true;
			}
		}else if(navigator.appVersion.indexOf("Mac")==-1 && window.execScript){
			var version = -1;
			for(var i=0; i<activeXDetectRules.length && version==-1; i++){
				var obj = getActiveXObject(activeXDetectRules[i].name);
				if(!obj.activeXError){
					self.installed = true;
					version = activeXDetectRules[i].version(obj);
					if(version!=-1){
						var versionObj = parseActiveXVersion(version);
						self.raw = versionObj.raw;
						self.major = versionObj.major;
						self.minor = versionObj.minor;
						self.revision = versionObj.revision;
						self.revisionStr = versionObj.revisionStr;
					}
				}
			}
		}
	}();
};
FlashDetect.JS_RELEASE = "1.0.4";

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\\/g, "&quot;")
        .replace(/"/g, "&#039;");
}
