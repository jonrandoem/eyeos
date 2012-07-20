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
 * SocialBarUpdater allows files to simply update socialbar information with a
 * system of handler.
 * Default handler set is on handler/default, for custom projects is possible to
 * add an handler set under /handler.
 *
 * NB: It's not possible to specify more than a custom handler set.
 */

qx.Class.define('eyeos.files.SUManager', {
	extend: qx.core.Object,

	properties: {
		checknum: {
			init: null
		},
		handlers: {
			init: null
		},
		socialBar: {
			init: null,
			check: 'Object'
		}
	},

	construct: function (socialBar, checknum) {
		this.base(arguments);
		this.setSocialBar(socialBar);
		this.setChecknum(checknum);
	},

	members: {
		/**
		 * Files selected are changed, retrieve handlers and execute updateSocialBar
		 * for correct handler
		 */
		selectionChanged: function (params) {
			if (this.getHandlers() != null) {
				this._doSelectionChanged(params);
			} else {
				eyeos.files.SUHandlerManager.getInstance().getHandlers(this.getChecknum(), function (results) {
					this.setHandlers(results);
					this._doSelectionChanged(params);
				}, this);
			}
		},

		_doSelectionChanged: function (params) {
			var className = this._getCorrectHandlerClass('changeSelection', params);
			var handlerClass = eval(className);
			var handler = new handlerClass(this.getSocialBar(), params);
			handler.updateSocialBar();
		},
		
		/**
		 * Current Path changed, retrieve hanlders and execute updateSocialBar for
		 * correct handler
		 */
		directoryChanged: function (params) {
			if (this.getHandlers() != null) {
				this._doDirectoryChanged(params);
			} else {
				eyeos.files.SUHandlerManager.getInstance().getHandlers(this.getChecknum(), function (results) {
					this.setHandlers(results);
					this._doDirectoryChanged(params);
				}, this);
			}
		},

		_doDirectoryChanged: function (params) {
			var className = this._getCorrectHandlerClass('changeDirectory', params);;
			var handlerClass = eval(className);
			var handler = new handlerClass(this.getSocialBar(), params);
			handler.updateSocialBar();
		},

		_getCorrectHandlerClass: function (key, params) {
			var handlers = this.getHandlers()[key];
			if (handlers == undefined || handlers == null || handlers.length < 1) {
				throw "No Handler folder for " + key + ".";
			}

			for (var i= 0; i < handlers.length; ++i) {
				var className = handlers[i];
				var classRef = eval(className);
				if (qx.Class.implementsInterface(classRef, eyeos.files.ISocialBarHandler)) {
					var method = new Function("params", "return " + className + ".checkHandler(params)");
					if (method.call(this, params)) {
						return className;
					}
				}
				
			}
			throw "No Handler for " + key + " with params" + params;
		}
	}
});