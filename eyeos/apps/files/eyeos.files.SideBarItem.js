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

qx.Class.define('eyeos.files.SideBarTitle', {

	extend: qx.ui.container.Composite,

	construct: function (caption) {
		this.base(arguments);
		this._buildLayout(caption);
		this._addListeners();
	},

	members: {
		_clicked: false,
		
		_buildLayout: function (caption) {
			this.setLayout(new qx.ui.layout.HBox());
			var borderBottom = new qx.ui.decoration.Single(1, 'solid', '#D3D3D3').set({
				styleLeft: null,
				styleTop: null,
				styleRight: null
			});
			this.set({
				backgroundColor: '#FCFCFC',
				padding: 3,
				paddingTop: 7,
				paddingBottom: 6,
				decorator: borderBottom
			});
			this._label = new qx.ui.basic.Label(caption).set({
				maxWidth: 170,
				width: 170,
				minWidth: 170
			});
			this._label.setFont(new qx.bom.Font(13, ["Lucida Grande", "Verdana"]).set({bold: true}));
			this.add(this._label, {flex: 1});

			this._image = new qx.ui.basic.Image('index.php?extern=images/arrowPlace1.png').set({
				paddingTop: 3
			});
			this.add(this._image);
		},

		_addListeners: function () {
			this.addListener('click', function (e) {
				if (this._clicked) {
					this._clicked = false;
				} else {
					this._clicked = true;
				}
				this.fireDataEvent('changeValue', this._clicked);
			});

			this.addListener('changeValue', function () {
				if (this.isValue()) {
					this._image.setSource('index.php?extern=images/arrowPlace2.png');
				} else {
					this._image.setSource('index.php?extern=images/arrowPlace1.png');
				}
			});
		},

		isValue: function () {
			return this._clicked;
		}
	}
});

qx.Class.define('eyeos.files.SideBarItem', {

	extend: qx.ui.container.Composite,

	construct: function (label, path, manager, droppable, position) {

		this.base(arguments);
		// Reference and parent objects
		this.setAcceptsDrop(droppable);
		this.setManager(manager);
		this.setPath(path);
		this._position = position;
		this._buildLayout(label);


	},
	
	properties: {
		icon: {
			init: 'index.php?extern=images/16x16/places/folder.png',
			check: 'String',
			apply: '_applyIcon'
		},

		acceptsDrop: {
			check: 'Boolean',
			init: false
		}
	},

	members: {
		_label: null,
		_path: null,
		_icon: null,
		_manager: null,
		_currentBar: null,

		_decoratorDragOver: new qx.ui.decoration.Single(1, 'solid', '#74a100').set({backgroundColor: '#B9D07F'}),
		_decoratorMouseOut: new qx.ui.decoration.Single(1, 'solid', '#E3E3E3').set({
			styleLeft: null,
			styleTop: null,
			styleRight: null,
			backgroundColor: null
		}),
		
		_decoratorMouseOver: new qx.ui.decoration.Single(1, 'solid', '#E3E3E3').set({
			styleTop: null,
			backgroundColor: '#D0D0D0'
		}),
		
		_applyIcon: function(value, old) {
			this._icon.setSource(value);
		},

		_buildLayout: function (label) {
			this.setLayout(new qx.ui.layout.HBox());
			var labelComposite = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			this._label = new qx.ui.basic.Label(tr(label));

			this.set({
				paddingRight: 3,
				paddingBottom: 3,
				paddingLeft: 10,
				height: 25,
				minHeight: 25,
				maxHeight: 25
			});

			this.setDecorator(this._decoratorMouseOut);
			
			this._icon = new qx.ui.basic.Image(this.getIcon()).set({
				marginRight: 5,
				anonymous: true
			});
			this.add(this._icon);
			labelComposite.add(this._label);
			this.add(labelComposite, {flex: 1});

			if (this.getAcceptsDrop()) {
				this.setDroppable(true);
				this._image = new qx.ui.basic.Image('index.php?extern=images/delete.png').set({
					marginRight: 5
				});
				this._image.setVisibility('hidden');
				this.add(this._image);

				this._image.addListener('click', function(e) {
					e.stopPropagation();
				}, this);
			}
		},

		onMouseOver: function () {
			if (this.getAcceptsDrop()) {
				this._image.setVisibility('visible');
			}
			this.setDecorator(this._decoratorMouseOver);
			//this._manager.getPlaceByPosition(this._position).setBackgroundColor('#D0D0D0');
		},

		onMouseOut: function () {
			if (this.getAcceptsDrop()) {
				this._image.setVisibility('hidden');
			}
			this.setDecorator(this._decoratorMouseOut);
			//this._manager.getPlaceByPosition(this._position).setBackgroundColor(null);
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

