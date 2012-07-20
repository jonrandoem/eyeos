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
 *	eyeos.ui.toolbar.Part - Styling...
 *	Extending a qx.ui.toolbar.Part, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.toolbar.Part', {
	extend : qx.ui.toolbar.Part,

	construct : function(groupName, father) {
		arguments.callee.base.call(this);
		this.setGroupName(groupName);
		this._setEyeosStyle(father);
	},

	properties: {
		/**
		 * Used to keep a common reference between items and their toolbar.Part.
		 * Needed by the {@see eyeos.ui.toolbar.ToolBar}
		 * for switching between the two modes.
		 */
		groupName: {
			init: null,
			check: 'String'
		}
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function(father) {
			this.setDecorator(null);

			this.setDraggable(true);
			this.addListener("dragstart", function(e) {
				e.addAction("move");
			});

			this.setDroppable(true);
			this.addListener("drop", function(e) {
				var relatedTarget = this.indexOf(e.getRelatedTarget());
				var target = this.indexOf(e.getTarget());
				if (relatedTarget < target) {
					this.addAfter(e.getRelatedTarget(), e.getTarget());
				}
				else {
					this.addBefore(e.getRelatedTarget(), e.getTarget());
				}
			}, father);
		},

		/**
		 * Overriding parent's function, to change the defdault qooxdoo's
		 * separator icon.
		 */
		_createChildControlImpl : function(id) {
			var control;

			switch(id) {
				case 'handle':
					this.addSeparator();
					control = new qx.ui.core.Spacer(1, 1);
					break;
			}
			return control || this.base(arguments, id);
		}
	}
});