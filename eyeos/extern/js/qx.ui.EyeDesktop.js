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
 * eyeos Desktop
 */
qx.Class.define('qx.ui.EyeDesktop', {
	'extend': qx.ui.window.Desktop,
	
	'construct': function () {
		arguments.callee.base.apply(this, arguments);
	},
			
	'members': {
		'_cascadeWindowsSemaphore': 0,
		'_showDesktopSemaphore': 0,
		/*
		Some functions, as "showDesktop", stores the current state of the window and then,
		the method "restoreWindows", restores the saved state into each window.
		
		This variable is an object that can contain 2 keys: "methodCalls" and "properties".
		Each key contains an object.
				
		The functions that store states, inserts the properties of the window in the key "properties"
		and the future method calls in the key "methodCalls".
				
		For example, a method that stores the current position and size of each window generates
		this content for _windowListLastState:
				
		_windowLastState = {
			1234567890: {				// This is the hash code of the window
				'properties': {
					'width': X,			// X is the current width of window that has the hash code 1234567890
					'height': Y			// Y is the current height of window that has the hash code 1234567890
				},
				'methodCalls': {
					'moveTo': [Z, W]	// Z is the current left of window that has the hash code 1234567890
										// W is the current height of window that has the hash code 1234567890
				}
			}
		}
				
		When "restoreWindows" is executed, calls the "set" method of each window to set the properties
		of the last state. Also, calls each method of "methodCalls" collection.
		
		For example, in this case, restoreWindows makes these calls:
		windowWithHashCode1234567890.set({
			'width': X,
			'height': Y
		});
				
		windowWithHashCode1234567890.moveTo(Z, W);
		*/
		'_windowListLastState': {},
		
		'add': function (element) {
			arguments.callee.base.apply(this, arguments);
			
			if (element instanceof eyeos.ui.Window) {
				this.fireDataEvent('windowAdded', element);
						
//				element.addListener('maximize', function () {
//					this.set('marginTop', 32);
//				});
			
//				element.addListener('restore', function () {
//					this.set('marginTop', 0);
//				});
				
				element.addListener('move', function () {
					var bounds = this.getBounds();

					if (bounds.top < 0) {
						this.moveTo(bounds.left, 0);
					}
				});
					
				element.addListener('close', function () {
					this.remove(element);
					delete element;
				}, this);
			}
		},
				
		'restoreWindows': function () {
			var windowList = this.getWindows();
			
			if (windowList.length > 0) {
				for (var i = windowList.length - 1; i >= 0; --i) {
					var hashCode = windowList[i].toHashCode();
						
					if (this._windowListLastState[hashCode]) {
						if (this._windowListLastState[hashCode]['properties']) {
							windowList[i].set(this._windowListLastState[hashCode]['properties']);
						}
								
						if (this._windowListLastState[hashCode]['methodCalls']) {
							for (var methodName in this._windowListLastState[hashCode]['methodCalls']) {
								windowList[i][methodName].apply(windowList[i], this._windowListLastState[hashCode]['methodCalls'][methodName]);
							}
						}
					}
				}
						
				windowList[windowList.length - 1].set('active', true);
				//windowList[windowList.length - 1].focus();
			}
		},
				
		'showDesktop': function () {
			this._windowListLastState = {};
			var windowList = this.getWindows();
				
			for (var i = windowList.length - 1; i >= 0; --i) {
				var mode = windowList[i].getMode();
				
				if (mode != 'minimized') {
					if (mode == 'maximized') {
						this._windowListLastState[windowList[i].toHashCode()] = {
							'methodCalls': {
								'show': []
							}
						};
					} else {
						this._windowListLastState[windowList[i].toHashCode()] = {
							'methodCalls': {
								'restore': [],
								'show': []
							}
						};
					}
							
					++this._showDesktopSemaphore;
					var self = this;
							
					windowList[i].addListenerOnce('minimize', function () {
						--self._showDesktopSemaphore;
								
						if (self._showDesktopSemaphore == 0) {
							self.fireEvent('showDesktopComplete');
						}
					});
							
					windowList[i].blur();
					windowList[i].minimize();
				}
			}
		},
				
		'cascadeWindows': function () {
			this._windowListLastState = {};
			var windowList = this.getWindows();
			
			if (windowList.length > 0) {
				var currentXPosition = 20;
				var currentYPosition = 45;
				var distance = 25;
						
				for (var i = 0; i < windowList.length; ++i) {
					var mode = windowList[i].getMode();
					var bounds = windowList[i].getBounds();
						
					if (mode == 'normal') {
						this._windowListLastState[windowList[i].toHashCode()] = {
							'methodCalls': {
								'moveTo': [bounds.left, bounds.top]
							}
						};
					} else if (mode == 'maximized') {
						this._windowListLastState[windowList[i].toHashCode()] = {
							'methodCalls': {
								'maximize': []
							}
						};
								
						windowList[i].restore();
					} else if (mode == 'minimized') {
						this._windowListLastState[windowList[i].toHashCode()] = {
							'methodCalls': {
								'minimize': []
							}
						};
						
						windowList[i].show();
					}
					
					if (bounds.left != currentXPosition || bounds.top != currentYPosition) {
						++this._cascadeWindowsSemaphore;
						var self = this;
	
						windowList[i].addListenerOnce('move', function () {
							--self._cascadeWindowsSemaphore;
							if (self._cascadeWindowsSemaphore == 0) {
								self.fireEvent('cascadeWindowsComplete');
							}
						});
							
						windowList[i].moveTo(currentXPosition, currentYPosition);
					}
							
					currentXPosition += distance;
					currentYPosition += distance;
					
				}
				
				windowList[windowList.length - 1].set('active', true);
				windowList[windowList.length - 1].focus();
			}
		}
	}
});