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

qx.Class.define('qx.ui.EyeTaskBar', {
	extend: qx.ui.container.SlideBar,
			
	construct: function () {
		arguments.callee.base.call(this);
		var windowList = document.eyeDesktop.getWindows();
			
		for (var i = 0; i < windowList.length; ++i) {
			this.addWindow(windowList[i]);
		}
				
		document.eyeDesktop.addListener('windowAdded', function (data) {
			this.addWindow(data.getData());
		}, this);
	},
			
	members: {
		
		_taskButtons: {},

		add: function(item) {
			arguments.callee.base.call(this, item);
			this.fireDataEvent('favoriteAdded', item);
		},

		remove: function(item) {
			arguments.callee.base.call(this, item);
			this.fireDataEvent('favoriteRemoved', item);
		},

		addTaskButton: function (taskButton) {
			if (taskButton instanceof qx.ui.EyeTaskButtonFavorite) {
				this._taskButtons[taskButton.toHashCode()] = taskButton;
			}
			this.add(taskButton);
		},
				
		addWindow: function (window) {
			/**
			 * The taskbar receives when a new window is created.
			 * 
			 * If the application is in our favorites we loop through the current task favorite buttons and locate 
			 * the one that matches the application name, if this button has opened a window we create a new one,
			 * if it's not we should convert the "fav button" that is currently in our taskbar. In both cases the
			 * resulting button will be stored on this._taskButtons[hashCode]
			 * 
			 * Then the listeners are added
			 */
			var hashCode = window.toHashCode();
			var flag = false;
			var windowApplicationName = window.getApplication().getName();
			if (document.eyeFavorites != undefined && document.eyeFavorites.indexOf(windowApplicationName) != -1) {
				for (var i in this._taskButtons) {
					if (this._taskButtons[i] instanceof qx.ui.EyeTaskButtonFavorite && this._taskButtons[i].getRealAppName() == windowApplicationName) {
						if (this._taskButtons[i].isCheck()) {
							this._taskButtons[hashCode] = new qx.ui.EyeTaskButton(window.getCaption(), windowApplicationName).set({
								icon: this._taskButtons[i].getIcon()
							});
							break;
						} else {
							flag = true;
							this._taskButtons[hashCode] = this._taskButtons[i];
							this._taskButtons[hashCode].removeFavoriteState();
							this._taskButtons[hashCode]._buttonWithFocus();
							this._taskButtons[hashCode].setCheck(true);
							delete this._taskButtons[i];
							break;
						}
					}
				}	
			} else {
				//console.log('No favorite I create a new button');
				this._taskButtons[hashCode] = new qx.ui.EyeTaskButton(window.getCaption(), windowApplicationName);
			}
			this._taskButtons[hashCode]._window = window;
			//window._taskButton = this._taskButtons[hashCode];
			
			var self = this;
			
			window.addListener('close', function () {
				this.removeWindow(window);
			}, this);
			
			/**
			 * Due to the bug of qooxdoo with the window "focusin" here is a basic solution which selects/unselects a
			 * button in the taskbar if the related window changes its active state.
			 */
			
			window.addListener('changeActive', function () {
				if (this._taskButtons[hashCode]) {
					if (window.get('active')) {
						this.selectTaskButton(this._taskButtons[hashCode]);
					} else {
						this.unselectTaskButton(this._taskButtons[hashCode]);
					}
				}
			}, this);

			// click behavior
			this._taskButtons[hashCode].clickEvent = this._taskButtons[hashCode].addListener('click', function (e) {
				if (this.get('value')) {
					// Restore the window (maybe is minimized)
					window.show();
					// Give the focus to the window
					window.set('active', true);
					window.focus();
				} else {
					if (window.get('allowMinimize')) {
						window.minimize();
					}
				}
			});
			
			/**
			 * We store this event in a variable due to we'll have to remove it to avoid false selections when closing windows
			 */
			this._taskButtons[hashCode].checkedEvent = this._taskButtons[hashCode].addListener('changeValue', function (e) {
				if (this.isValue()) {
					this._buttonWithFocus();
				} else {
					this._buttonWithoutFocus();
				}
			});
				
			if (!flag) {
				this.addTaskButton(this._taskButtons[hashCode]);
			}
					
			///
			/// TO-DO
			///
					
			/*window.addListener('minimize', function (e) {
				//console.log(document.eyeDesktop.get('activeWindow').getCaption());
			});*/
			
			/*window.addListener('focusin', function () {	// There is a bug in qooxdoo: if you have two windows and close the window that HAS the focus, the second window gets the focus, but does not fire "focusin" event.
				this.selectTaskButton(button);
			}, this);
		
			window.addListener('focusout', function () {
				this.unselectTaskButton(button);
			}, this);*/						
		},
								
		removeTaskButton: function (taskButton) {
			this.remove(taskButton);
		},
		
		removeWindow: function (window) {
			var hashCode = window.toHashCode();
			if (this._taskButtons[hashCode]) {
				if (this._taskButtons[hashCode] instanceof qx.ui.EyeTaskButtonFavorite) {
					this._taskButtons[hashCode].removeListenerById(this._taskButtons[hashCode].checkedEvent);
					this._taskButtons[hashCode].removeListenerById(this._taskButtons[hashCode].clickEvent);

					this._taskButtons[hashCode].setCheck(false);
					this._taskButtons[hashCode]._foo = false; //FIXME: flag added to solve the "duplicating application" bug, we should improve the implementation of the taskbar!!!
					this._taskButtons[hashCode]._buttonFavorite();
					this._taskButtons[hashCode]._window = null;
				} else {
					this.removeTaskButton(this._taskButtons[hashCode]);
					delete this._taskButtons[hashCode];
				}
			}
		},
			
		selectTaskButton: function (taskButton) {
			taskButton.set('value', true);
		},
		
		unselectTaskButton: function (taskButton) {
			taskButton.set('value', false);
		}
	}
});