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
 * This class represents an application's main window in the eyeos environment.
 */
qx.Class.define('eyeos.ui.Window', {
	extend: qx.ui.window.Window,
	
	/**
	 * @param application {eyeos.system.EyeApplication}
	 * @param caption {String}
	 * @param icon {String}
	 * @param fakeMinimize {Boolean ? false}
	 * @param fakeClose {Boolean ? false}
	 */
	construct: function(application, caption, icon, fakeMinimize, fakeClose) {
		arguments.callee.base.call(this, caption, icon);
		
		if (typeof application == 'undefined') {
			throw '[eyeos.ui.Window] Missing argument "application".';
		}
		this._application = application;
		this._fakeMinimize = fakeMinimize? true: false;
		this._fakeClose = fakeClose? true : false;
//
//		if (!document.eyeDesktop) {
//			throw '[eyeos.ui.Window] eyeDesktop has not been loaded or is not found.';
//		}
//		document.eyeDesktop.add(this);
//

                //send the window through dbus, it will be received
                //by desktop, and added to eyeDesktop
                var bus = eyeos.messageBus.getInstance();
                bus.send('interface', 'windowCreated', this);
		this.addListener('close', this._onClose, this);
		bus.addListener('eyeos_application_stop', this._onProcessStop, this);
	},
	
	properties: {
		/** @var destroy {Boolean ? true} Whether to destroy the object or not after closing. */
		destroyOnClose: {
			init: false,			//FIXME: set to TRUE when the major features will be more stable
			check: 'Boolean'
		},

		processAlreadyStopped: {
			init: false,
			check: 'Boolean'
		},

		mustBeDisposed: {
			init: true,
			check: 'Boolean'
		}
	},
			
	members: {		
		_application: null,
		_fakeClose: false,
		_fakeMinimize: false,

		
		/*_onCloseButtonClick: function(e) {
			var fade = new qx.fx.effect.core.Fade(this.getContainerElement().getDomElement()).set({
				from: 1,
				to: 0,
				duration: 0.2
			});
			fade.addListener('finish', function(){
				this._onFinalClose();
			}, this);
			
			fade.start();
			
			this._application.close();
		},
	    
		_onFinalClose: function(e) {
			this.superclass.close();
			this.getChildControl('close-button').reset();
		},*/
		
		_onClose: function(e) {
			if (!this.getProcessAlreadyStopped()) {
				this._application.close();
			}

			if(this.getMustBeDisposed()) {
				this._application.dispose();
			}
		},
		
		_onProcessStop: function(e) {
			if (e.getData().checknum == this._application.getChecknum()) {
				eyeos.messageBus.getInstance().removeListener('eyeos_application_stop', this._onProcessStop, this);
				this.setProcessAlreadyStopped(true);
				this.close();
			}
		},
		
		/**
		 * Closes or fakes closing the window.
		 */
		close: function() {
			if (this._fakeClose) {
				if (this.fireNonBubblingEvent('beforeClose', qx.event.type.Event, [false, true])) {
					var domElement = this.getContainerElement().getDomElement();
					domElement.style.visibility = 'hidden';
					this.fireDataEvent('changeActive');
				}
			} else {
				try {
					arguments.callee.base.call(this);
				} catch (e) {
					eyeos.consoleWarn(e);
				}

				if (this.isDestroyOnClose()) {
					eyeos.consoleInfo('Destroying window: ' + this.getCaption());
					this.destroy();
				}
			}
		},
		
		/**
		 * @return {eyeos.system.EyeApplication}
		 */
		getApplication: function() {
			return this._application;
		},
		
		/**
		 * @return {Integer}
		 */
		getChecknum: function() {
			return this._application.getChecknum();
		},
		
		/**
		 * Minimizes the window into the taskbar.
		 */
		minimize: function() {
			if (this._fakeMinimize) {
				if (this.fireNonBubblingEvent('beforeMinimize', qx.event.type.Event, [false, true])) {
					var domElement = this.getContainerElement().getDomElement();
					domElement.style.visibility = 'hidden';
					this.fireEvent('minimize');
					this.fireDataEvent('changeActive');
				}
			} else {
				arguments.callee.base.call(this);
			}
		},
		
		/**
		 * @param left {Integer} The X coordinate where to open the window.
		 * @param top {Integer} The Y coordinate where to open the window.
		 */
		open: function(left, top) {
			if (typeof left !== 'undefined' && typeof top !== 'undefined') {
				this.moveTo(left, top)
			} else {
				this.center();
			}
			arguments.callee.base.call(this);
		},
		
		/**
		 * Make this window appear if it was minimized.
		 */
		show: function() {
			if (this._fakeMinimize) {
				var domElement = this.getContainerElement().getDomElement();
				if (domElement) {
					domElement.style.visibility = 'visible';
					this.fireEvent('show');
				} else {
					arguments.callee.base.call(this);
				}
			} else {
				arguments.callee.base.call(this);
			}
		}
	}
});
