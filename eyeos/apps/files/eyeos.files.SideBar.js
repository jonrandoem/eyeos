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

qx.Class.define('eyeos.files.Sidebar', {
	
	extend: qx.ui.container.Composite,

	construct: function (label, items, controller, acceptNewItems) {
		this.base(arguments);
		this._label = label;
		this._items = items;
		this.setController(controller);
		this.setAcceptNewItems(acceptNewItems);
		this._buildLayout(label);

		this._title.addListener('changeValue', function (e) {
			if (this._title.isValue()) {
				this._layoutBase.setVisibility('excluded');
			} else {
				this._layoutBase.setVisibility('visible');
			}
		}, this);
	},

	properties: {
		acceptNewItems: {
			type: 'Boolean',
			init: true
		}
	},

	members: {
		_controller: null,
		_label: null,
		_items: null,
		_dragging: false,
		_layoutBase: this,

		_buildLayout: function (label, items) {
			this.setLayout(new qx.ui.layout.VBox());
			this.set({
				alignY: 'top',
				width: 200,
				maxWidth: 200
			});
			this._title = new eyeos.files.SideBarTitle(this._label);
			this.add(this._title);
			this._layoutBase = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			this.add(this._layoutBase);
			this._rebuild();
		},

		_rebuild: function () {
			this._layoutBase.removeAll();
			var newPlace = new eyeos.files.SideBarNewPlace(this, this.getAcceptNewItems(), 0);
			this._addPlace(newPlace);
			for (var i = 0; i < this._items.length; ++i) {
				var item = new eyeos.files.SideBarItem(this._items[i].label, this._items[i].path, this, this.getAcceptNewItems(), i)
				if (this._items[i].icon) {
					item.set({
						icon: this._items[i].icon
					});
				}
				newPlace = new eyeos.files.SideBarNewPlace(this, this.getAcceptNewItems(), parseInt(i + 1));
				this._addItem(item);
				this._addPlace(newPlace);
			}
		},

		_addItem: function (item) {
			this._layoutBase.add(item, {flex: 1});
			this._addListenersToItem(item);
			item._currentBar = this;
		},

		_addPlace: function (place) {
			this._layoutBase.add(place, {flex: 1});
			this._addListenersToPlace(place);
		},

		_addListenersToPlace: function (place) {
			
			var self = this;

			if (place.getAcceptsDrop()) {
				place.addListener('dragover', function (e) {
					self.setDragging(true);
					this.setDecorator(this._decoratorDragOver);
				});

				place.addListener('dragleave', function (e) {
					this.setDecorator(this._decoratorMouseOut);
				});

				place.addListener('dragend', function (e) {
					self.setDragging(false);
					this.setDecorator(this._decoratorMouseOut);
				});

				place.addListener('drop', function (e) {
					if (e.getRelatedTarget() instanceof eyeos.files.IconViewItem && e.getRelatedTarget().getFile().getType() == 'folder') {
						self.setDragging(false);
						self.addNewPlace(e.getRelatedTarget(), this._position);
					}
					this.setDecorator(this._decoratorMouseOut);
				});
			}
		},

		_addListenersToItem: function (item) {

			var self = this;

			item.addListener('click', function () {
				if (!self.isDragging()) {
					self.getController().getModel().setCurrentPath(['path', this.getPath()]);
					self.getController()._browse(true);
				}
			});

			item.addListener('mouseover', function () {
				if (!self.isDragging()) {
					this.onMouseOver();
				}
			});

			item.addListener('mouseout', function (e) {
					if (!qx.ui.core.Widget.contains(item, e.getRelatedTarget())) {
						this.onMouseOut();
					}
			});

			if (item.getAcceptsDrop()) {
				item.addListener('dragover', function (e) {
					self.setDragging(true);
					this.setDecorator(this._decoratorDragOver);
				});

				item.addListener('dragleave', function (e) {
					this.setDecorator(this._decoratorMouseOut);
				});

				item.addListener('dragend', function (e) {
					self.setDragging(false);
					this.setDecorator(this._decoratorMouseOut);
				});

				item.addListener('drop', function (e) {
					var movingFile = e.getRelatedTarget();
					if (movingFile != null && movingFile instanceof eyeos.files.IconViewItem) {
						self.setDragging(false);
						this._clicked = true;

						this.setDecorator(this._decoratorMouseOut);
						
						if (movingFile.getFile().getType() == 'folder' && movingFile.getFile().getAbsolutePath() != this.getPath() && movingFile.getFile().getPath() != this.getPath()) {
							self.getController().specialMove(this.getPath());
						}

						if (movingFile.getFile().getType() != 'folder' && movingFile.getFile().getPath() != this.getPath()) {
							self.getController().specialMove(this.getPath());
						}
					}
				});

				item._image.addListener('click', function () {
					self.removePlace(this);
				}, item);
			}

		},

		addNewPlace: function (place, position) {
			var placeToAdd = true;
			var items = this._items;
			for (var i = 0; i < items.length; ++i) {
				if (items[i].path == place.getFile().getAbsolutePath()) {
					placeToAdd = false;
					i = parseInt(this._items.length + 1);
				}
			}

			if (placeToAdd) {
				var myObject = {
					label: place.getFile().getName(),
					path: place.getFile().getAbsolutePath()
				}

				var newArray = new Array();
				
				for (var i = 0; i < this._items.length; ++i) {
					if (i == position) {
						newArray.push(myObject);	
					}
					newArray.push(this._items[i]);
				}

				if (position >= this._items.length) {
					newArray.push(myObject);
				}

				this._items = newArray;
			}

			this._rebuild();
		},

		getPlaceByPosition: function (id) {
			var childrenList = this._layoutBase.getChildren();
			for (var i = 0; i < childrenList.length; ++i) {
				if (childrenList[i] instanceof eyeos.files.SideBarNewPlace && childrenList[i]._position == parseInt(id - 1)) {
					return childrenList[i];
				}
			}
		},

		removePlace: function (place) {
			for (var i = 0; i < this._items.length; ++i) {
				if (this._items[i].path == place.getPath()) {
					this._items.splice(i, 1);
					place.destroy();
					this._rebuild();
					i = parseInt(this._items.length + 1);
				}
			}
		},

		getController: function () {
			return this._controller;
		},

		setController: function (controller) {
			this._controller = controller;
		},

		getLayoutBase: function () {
			return this._layoutBase;
		},

		setDragging: function (value) {
			this._dragging = value;
		},

		isDragging: function (value) {
			return this._dragging;
		}
	}
});


