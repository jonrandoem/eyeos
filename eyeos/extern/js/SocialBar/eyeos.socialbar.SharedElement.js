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

qx.Class.define('eyeos.socialbar.SharedElement', {
	extend: qx.ui.container.Composite,

	properties: {
		box: {
			
		},
		id: {
			check: 'String'
		},
		name: {
			check: 'String'
		},
		lists: {
			check: 'String'
		},	
		listsName: {
			init: new Array()
		},
		color: {
			check: 'String',
			init: null
		//apply: '_applyColor'
		},
		icon: {
			check: 'String'
		},
		selected: {
			check: 'Boolean',
			init: false
		},
		hasListener: {
			check: 'Boolean'
		}
	},

	construct: function (box, name, id, listsId, listsName, hasListener, color) {
		this.base(arguments);
		this.setBox(box);
		this.setName(name);
		this.setId(id);
		this.setLists(listsId);
		this.setListsName(listsName);
		this.setIcon('index.php?checknum=' + box.getChecknum() + '&message=__UserInfo_getAvatarPicture&params[userId]=' + id);
		this.setHasListener(hasListener);
		
		if (color) {
			this.setColor(color);
		}
		this._buildGui();
	},

	members: {
		_layoutIcon: null,
		_layoutInfo: null,
		_labelLists: null,
		_labelName: null,
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				width: 230
			});
			this._content = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({marginTop: 5, paddingBottom: 2});
			this.add(this._content, {flex: 1});
			this._createLayoutIcon();
			this._createLayoutInfo();
			this._createLayoutActionIcon();
			if (this.getHasListener()) {
				this._addListeners();
			}
			this._auxBorder = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				height: 1,
				backgroundColor: '#A4A4A4'
			});
			this.add(this._auxBorder, {flex: 1});
		},

		_addListeners: function () {
			this.addListener('click', function (e) {
				this.toggleSelectShare();
			}, this);
		},

		toggleSelectShare: function () {
			if (!this.isSelected()) {
				//Select Item
				this.setBackgroundColor('#4089E2');
				this._labelName.setTextColor('white');
				this._labelLists.setTextColor('#B0CEF3');
				this.toggleSelected();
				for (var i = 0; i < this.getBox().getShareds().length; ++i){
					var shared = this.getBox().getShareds()[i];
					for (var j = 0; j < shared.getViewers().length; ++j) {
						if (shared.getViewers()[j].indexOf(this.getId()) != -1) {
							this.getBox().fireDataEvent('selectItem', shared.getObject());
						}
					}
					for (var j = 0; j < shared.getEditors().length; ++j) {
						if (shared.getEditors()[j].indexOf(this.getId()) != -1) {
							this.getBox().fireDataEvent('selectItem', shared.getObject());
						}
					}
				}
			} else {
				this.setBackgroundColor('white');
				this._labelName.setTextColor('gray');
				this._labelLists.setTextColor('#C5AFAF');
				for (var i = 0; i < this.getBox().getShareds().length; ++i){
					var shared = this.getBox().getShareds()[i];
					for (var j = 0; j < shared.getViewers().length; ++j) {
						if (shared.getViewers()[j].indexOf(this.getId()) != -1) {
							this.getBox().fireDataEvent('unselectItem', shared.getObject());
						}
					}
					for (var j = 0; j < shared.getEditors().length; ++j) {
						if (shared.getEditors()[j].indexOf(this.getId()) != -1) {
							this.getBox().fireDataEvent('unselectItem', shared.getObject());
						}
					}
				}
				this.toggleSelected();
			}

			this.getBox().fireEvent('_selectionChange');
		},

		_createLayoutIcon: function () {
			if (this.getColor() != null) {
				var myColor = this.getColor();
			} else {
				var myColor = '#A4A4A4';
			}
			this._layoutIcon = new qx.ui.container.Composite().set({
				decorator : new qx.ui.decoration.Single(1, 'solid', myColor),
				marginLeft: 5,
				marginBottom: 3,
				layout: new qx.ui.layout.HBox()
			});
			this._content.add(this._layoutIcon);

			var userIcon = new qx.ui.basic.Image(this.getIcon()).set({
				height: 30,
				width: 30,
				scale: true
			});
			this._layoutIcon.add(userIcon);
		},

		_createLayoutInfo: function () {
			this._layoutInfo = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				marginLeft: 3,
				marginTop: 1
			});
			this._content.add(this._layoutInfo);
			this._labelName = new eyeos.socialbar.Label(this.getName(), 'sharedName').set({
				textColor: '#666666'
			});
			this._layoutInfo.add(this._labelName);

			this._labelLists = new qx.ui.basic.Label(this.getListsName()).set({
				textColor: '#999999',
				marginTop: 3,
				font: new qx.bom.Font(12).set({
					family: ["Helvetica", "Arial", "Lucida Grande"]
				}),
				rich: false,
				maxWidth: 180
			});
			this._layoutInfo.add(this._labelLists);
		},

		_createLayoutActionIcon: function () {
			
		}
	}
});

