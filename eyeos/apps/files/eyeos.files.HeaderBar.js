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

qx.Class.define('eyeos.files.HeaderBar', {
	
	extend: qx.ui.container.Composite,

	construct: function (manager) {
		this.base(arguments);
		this.setViewManager(manager);
		this.setDragging(false);
		this._buildLayout();
	},

	properties: {
		controller: {
			check: 'Object'
		},

		dragging: {
			check: 'Boolean'
		},

		viewManager: {
			check: 'Object'
		}
	},

	members: {
		
		_layoutBase: null,
		
		_buildLayout: function () {
			this.setLayout(new qx.ui.layout.VBox());
			var borderBottom = new qx.ui.decoration.Single(1, 'solid', '#D3D3D3').set({
				styleLeft: null,
				styleTop: null,
				styleRight: null
			});
			this.set({
				backgroundColor: '#FFFFFF',
				padding: 5
			});
			this._mainTitle = new qx.ui.basic.Label().set({
				paddingLeft: 5
			});
			this._mainTitle.setFont(new qx.bom.Font(16, ["Lucida Grande", "Verdana"]).set({bold: true}));
			this._layoutBase = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			this._layoutBottom = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				marginLeft: 15,
				marginRight: 15,
				paddingTop: 5,
				decorator: borderBottom
			});
			this.add(this._mainTitle, {flex: 1});
			this.add(this._layoutBase, {flex: 1});
			this.add(this._layoutBottom, {flex: 1});

			this.addListener('dragover', function (e) {
				this.setDragging(true);
			});

			this.addListener('dragleave', function (e) {
				this.setDragging(false);
			});
		},

		_addItem: function (item) {
			this._layoutBase.add(item);
			this._addListenersToItem(item);
		},

		_addListenersToItem: function (item) {

			var self = this;

			/**
			 * Click events
			 */
			if (item._clickable) {
				
				item.addListener('click',  function () {
					if (!this._dropped) {
						this.getManager().getViewManager().getController().getModel().setCurrentPath(['path', this.getPath()]);
						this.getManager().getViewManager().getController()._browse(true);
					} else {
						this._dropped = false;
					}
				});

				item.addListener('mouseover', function () {
					if (!self.isDragging()) {
						this._label.setDecorator(this._decoratorMouseOver);
					}
				});

				item.addListener('mouseout', function (e) {
					if (!qx.ui.core.Widget.contains(item, e.getRelatedTarget())) {
						if (!self.isDragging()) {
							this._label.setDecorator(this._decoratorMouseOut);
						}
					}
				});

				if (item.getAcceptsDrop()) {
				
					item.addListener('dragover', function (e) {
						self.setDragging(true);
						var movingFile = e.getRelatedTarget();
						if (movingFile != null && movingFile instanceof eyeos.files.IconViewItem) {
							this._label.setDecorator(this._decoratorDragOver);
						}
					});

					item.addListener('dragleave', function (e) {
						this._label.setDecorator(this._decoratorMouseOut);
					});

					item.addListener('dragend', function (e) {
						self.setDragging(false);
						this._label.setDecorator(this._decoratorMouseOut);
						this.resetAllSelected('dragend');
						this.resetAllSelected('all');
					});

					item.addListener('drop', function (e) {
						if (e.getRelatedTarget() instanceof eyeos.files.IconViewItem) {
							this._dropped = true;
							self.setDragging(false);
							this.getManager().getViewManager().getController().specialMove(this.getPath());
							this._label.setDecorator(this._decoratorMouseOut);
						}
					});
				}
			}
		},

		showBrowse: function (input) {
			this._layoutBase.removeAll();

			if (this.getViewManager().getModel().getCurrentPath()[0] == 'path') {
				var path = this.getViewManager().getModel().getCurrentPath()[1];
				var urlParts = eyeos.utils.ParseUri.parse(path);
				
				var pathParts = this.getViewManager().getModel().getCurrentPath()[1].split('/');
				var displayPathParts = qx.lang.Array.clone(pathParts);
				
				if (urlParts['host'] && urlParts['host'].substring(0, 1) == '~') {
					displayPathParts[2] = urlParts['host'].substring(1);
				}
				
				var rootItemLabel;
				var firstVisiblePathPart = 2;
				switch (pathParts[0]) {
					case 'home:':
						rootItemLabel = tr('Home');
						firstVisiblePathPart = 3;
						this._base = pathParts[0] + '//' + pathParts[2];
						break;
						
					case 'workgroup:':
						rootItemLabel = tr('Groups');
						this._base = pathParts[0] + '//';
						break;	
					
					case 'share:':
						rootItemLabel = tr('People');
						this._base = pathParts[0] + '//';
						break;
					
					case 'sys:':
						rootItemLabel = tr('System');
						break;
					
					case 'file:':
						rootItemLabel = '/';
						break;
				}

				/* We avoid to make droppable the first "Home" */
				if (pathParts.length == 3) {
					var item = new eyeos.files.HeaderBarItem(this, this._base, rootItemLabel, false);
				} else if (pathParts.length > 3 && pathParts[pathParts.length - 1] == '') {
					var item = new eyeos.files.HeaderBarItem(this, this._base, rootItemLabel, true, false);
				} else {
					var item = new eyeos.files.HeaderBarItem(this, this._base, rootItemLabel, true, true);
				}

				this._addItem(item);

				var clickable = true;
				var droppable = true;
				var futureFolder = '';
				var futureName = rootItemLabel;
				
				for (var i = firstVisiblePathPart; i < pathParts.length; i++) {
					if (pathParts[i] != '') {
						//Workgroup special case: We avoid to insert an intial '/'
						//in the futureFolder
						if (this._base == 'workgroup://' && futureFolder == '') {
							futureFolder += pathParts[i];
						} else {
							futureFolder += '/' + pathParts[i];
						}
						
						futureName = displayPathParts[i];

						if (i == pathParts.length - 1 || pathParts[i + 1] == '') {
							clickable = false;
							droppable = false;
						}
						
						var item = new eyeos.files.HeaderBarItem(this, this._base + futureFolder, displayPathParts[i], clickable, droppable);
						this._addItem(item);
					}
				}
			
				this.setTitle(futureName);
				this.getViewManager().setCaption('Files - ' + futureName);				
			}
			
		},

		setTitle: function (title) {
			this._mainTitle.setValue(tr(title));
		}
	}
});

