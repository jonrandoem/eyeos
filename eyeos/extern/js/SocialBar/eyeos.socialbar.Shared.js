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
 * Shared is a Object that SharedBox and Shared needs to show information.
 */

qx.Class.define('eyeos.socialbar.Shared', {
	extend: qx.core.Object,

	properties: {
		object: {
			check: 'String'
		},
		viewers: {
			init: new Array()
		},
		editors: {
			init: new Array()
		}
	},

	construct: function (object, viewers, editors) {
		this.base(arguments);
		this.setObject(object);

		if(viewers) {
			this.setViewers(viewers);
		}

		if(editors) {
			this.setEditors(editors);
		}

		this._removeViewerIfEditor();
	},

	members: {

		getPrivilegeById: function (id) {
			var editors = this.getEditors();
			if (editors.indexOf(id) != -1) {
				return tr('Editor');
			}

			var viewers = this.getViewers();
			if (viewers.indexOf(id) != -1){
				return tr('Viewer');
			}

			return null;
		},

		addEditor: function (id) {
			this.deleteViewer(id);
			var editors = this.getEditors();
			if (editors.indexOf(id) == -1){
				editors.push(id);
				this.setEditors(editors);
			}
		},

		addViewer: function(id) {
			this.deleteEditor(id);
			var viewers = this.getViewers();
			if (viewers.indexOf(id) == -1){
				viewers.push(id);
				this.setViewers(viewers);
			}
		},


		deleteViewer: function (id) {
			var viewers = this.getViewers();
			var posToRemove = viewers.indexOf(id);
			while (posToRemove != -1) {
				viewers.splice(posToRemove, 1);
				posToRemove = viewers.indexOf(id);
			}
			this.setViewers(viewers);
		},

		deleteEditor: function (id) {
			var editors = this.getEditors();
			var posToRemove = editors.indexOf(id);
			while (posToRemove != -1) {
				editors.splice(posToRemove, 1);
				posToRemove = editors.indexOf(id);
			}
			this.setEditors(editors);
		},

		deleteUser: function (id) {
			this.deleteViewer(id);
			this.deleteEditor(id);
		},
		/**
		 * Remove Viewer entry if the user is an editor
		 */
		_removeViewerIfEditor: function () {
			var viewers = this.getViewers();
			var editors = this.getEditors();
			var posToRemove = new Array();
			// Find position to element to delete
			for (var i = 0; i < viewers.length; ++i) {
				if (editors.indexOf(viewers[i]) != -1){
					posToRemove.push(i);
				}
			}

			for (i = 0; i < posToRemove.length; ++i) {
				//Delete the element
				viewers.splice(posToRemove[i], 1);

				//Update Array posToRemove with updated positions
				for(var j = i; j < posToRemove.length; ++j) {
					posToRemove[j] = posToRemove[j] - 1;
				}
			}

			this.setViewers(viewers);
			this.setEditors(editors);
		}
	}
});

