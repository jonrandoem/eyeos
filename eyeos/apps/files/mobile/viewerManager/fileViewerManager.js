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
 * SINGLETON CLASS: use it with getInstance()
 */
function fileViewerManager () {
	this.getIconPath = getIconPath;
	this.loadHandlers = loadHandlers;
	this.getCorrectHandler = getCorrectHandler;
	this.createContent = createContent;

	this.handlers = null;

	/**
	 * Load handlers to show content for each type of file
	 */
	function loadHandlers (handlers) {
		this.handlers = handlers;
	}

	/**
	 * Create Content for the model and execute the callback function
	 */
	function createContent (model, page, checknum, callback) {
		var handler = this.getCorrectHandler(model);

		if (handler) {
			handler.createContent(model, page, checknum, callback);
		} else {
			eyeosmobile.openErrorDialog('No Preview available for this file');
		}
	}

	/**
	 * Return an instance of the handler for relative model if possible,
	 * null otherwise
	 */
	 function getCorrectHandler (model) {
		 for (var i = 0; i < this.handlers.length; ++i) {
			 var handler = eval('new ' + this.handlers[i] + '()');
			 if (handler.checkRequest(model)) {
				return handler;
			 }
		 }

		 return null;
	 }
	 
	/**
	 * Return the icon relative to a model
	 */
	function getIconPath (model, checknum) {
		if (model.get('type') == 'folder') {
			return 'index.php?extern=images/128x128/mimetypes/inode-directory.png';
		}
		var handler = this.getCorrectHandler(model);

		if (handler != null) {
			return handler.getIconPath(model, checknum);
		} else {
			// Default Image
			return 'index.php?extern=images/128x128/mimetypes/application-x-zerosize.png';
		}
	}
}

fileViewerManager.instance = null; // Will contain the one and only instance of the class

// This function ensures that I always use the same instance of the object
fileViewerManager.getInstance = function() {
        if (fileViewerManager.instance == null) {
                fileViewerManager.instance = new fileViewerManager();
        }

        return fileViewerManager.instance;
}
// Now it's possible to use it like a static class
fileViewerManager.prototype.getInstance = fileViewerManager.getInstance;