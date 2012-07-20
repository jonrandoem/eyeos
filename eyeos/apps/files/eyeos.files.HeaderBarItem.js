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

qx.Class.define('eyeos.files.HeaderBarItem',  {

	extend: qx.ui.core.Widget,

	construct: function (manager, path, name, clickable, droppable) {
		this.base(arguments);
		if (droppable) {
			this.setAcceptsDrop(true);
		}
		this._clickable = clickable;
		this.setManager(manager);
		this.setPath(path);
		this._buildLayout(name);
	},

	properties: {
		acceptsDrop: {
			check: 'Boolean',
			init: false
		}
	},

	members: {

		_clickable: null,
		_manager: null,
		_file: null,
		_decoratorMouseOut: new qx.ui.decoration.Single(1, 'solid', 'transparent'),
		_decoratorMouseOver: new qx.ui.decoration.Single(1, 'solid', '#A3A3A3').set({backgroundColor: '#D3D3D3'}),
		_decoratorDragOver: new qx.ui.decoration.Single(1, 'solid', '#74a100').set({backgroundColor: '#b9d07f'}),

		_buildLayout: function (name) {
			this.set({
				droppable: false,
				padding: 5
			});

			if (this.getAcceptsDrop()) {
				this.set({droppable: true});
			}

			var layout = new qx.ui.layout.HBox();
			this._setLayout(layout);

			this._label = new qx.ui.basic.Label(tr(name));
			this._add(this._label, {flex: 1});
			if (this._clickable) {
				var image = new qx.ui.basic.Image('index.php?extern=images/arrowHeader.png').set({
					paddingTop: 3,
					paddingLeft: 7
				});
				this._add(image);
			}
			this._label.setDecorator(this._decoratorMouseOut);
		},

		getManager: function () {
			return this._manager;
		},

		setManager: function (manager) {
			this._manager = manager;
		},

		getPath: function () {
			return this._path;
		},

		setPath: function (path) {
			this._path = path;
		}
	}
});

