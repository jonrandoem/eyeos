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
 * TagBox is a box that show informations about tags of selected items and give
 * to the user the possibility to manage them.
 * To build a TagBox you need 2 objects from the class eyeos.socialbar.Tag and
 * eyeos.socialbar.Relation that contain info about tag of the system and relation
 * between tag and objects.
 */

qx.Class.define('eyeos.socialbar.TagBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,

	properties: {
		name: {
			check: 'String'
		},
		checknum: {
			check: 'Integer'
		},
		tag: {
			init: new Array()
		},
		relation: {
			init: new Array()
		},
		allItems: {
			init: new Array()
		}
	},
	
	events: {
		/**
		 * Fired when a tag is selected, return the id of the Tag
		 */
		selectTag: 'qx.event.type.Data',
		/**
		 * Fired when a tag is deselected, return the id of the Tag
		 */
		unselectTag: 'qx.event.type.Data',
		/**
		 * Fired when a tag is assigned to all Objects
		 */
		assignTag: 'qx.event.type.Data',
		/**
		 * Fired when a tag is deassigned from all Objects
		 */
		unassignTag: 'qx.event.type.Data',
		/**
		  * Fired when a tag change the color
		  */
		deleteTag: 'qx.event.type.Data',
		/**
		  * Fired when we need to delete a tag also from Layout
		  */
		deleteItemFromLayout: 'qx.event.type.Data',
		/**
		 * Fired when we need to change a color in the Tag
		 */
		setTagColor: 'qx.event.type.Data',

		/**
		  * Fired when we need to change the name of the Tag
		  */
		setTagName: 'qx.event.type.Data',

		/**
		  * Fired When a New Tag is Created
		  */
		createNewTag: 'qx.event.type.Data'
	},
	
	construct: function (tag, relation){
		this.base(arguments);
		
		if (tag instanceof eyeos.socialbar.Tag) {
			this.setTag(tag);
		} else {
		// Eccezione
		}

		if (relation instanceof eyeos.socialbar.Relation) {
			this.setRelation(relation);
			this.setAllItems(this.__unique(relation.getObjects()));
		} else {
		// Eccezione
		}
		this._buildGui();
		this.addMyListeners();
	},

	members: {
		_firstLayoutBox: null,
		_secondLayoutBox: null,
		_thirdLayoutBox: null,
		
		addMyListeners: function () {
			this.addListener('deleteItemFromLayout', function (e) {
				this._deleteTagLayout(e.getData());
			});

			this.addListener('setTagColor', function (e) {
				var params = e.getData();
				this._changeTagColor(params[0], params[1]);
			});

			this.addListener('setTagName', function (e) {
				var params = e.getData();
				this._changeTagName(params[0], params[1]);
			})

			this.addListener('createNewTag', function (e) {
				var params = e.getData(); //id, name, color
				this._addNewTag(params[0], params[1], params[2]);
			});
		},
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				padding: 5
			});

			this._buildFirstLayoutBox();
			this._buildSecondLayoutBox();
			this._buildThirdLayoutBox();
			
		},

		_buildFirstLayoutBox: function () {
			this._firstLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			this.add(this._firstLayoutBox);
			
			var labelTitle = new eyeos.socialbar.Label('<b>' + tr('Tags') + '</b>', 'label');
			labelTitle.setTextAlign('left');
			this._firstLayoutBox.add(labelTitle);

			//Spacer
			this._firstLayoutBox.add(new qx.ui.core.Spacer(), {flex: 1});
			
			var labelManage = new eyeos.socialbar.Label(tr('manage'), 'link');
			labelManage.set({
				allowGrowX: true,
				TextAlign: 'right'
			});
			labelManage.setCursor('pointer');
			labelManage.addListener('click', function (e) {
				new eyeos.socialbar.TagWindow(this, this.getTag(), this.getRelation());
			}, this);
			this._firstLayoutBox.add(labelManage);
		},

		_buildSecondLayoutBox: function () {
			var tagBox = this;
			this._secondLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Flow(),
				allowGrowY: true,
				decorator: null,
				marginTop: 10,
				backgroundColor: tagBox.getBackgroundColor()
			});
			this.add(this._secondLayoutBox);

			// This is a fake element to avoid a bug in qooxdoo
			var fakeSpacer = new qx.ui.core.Spacer(1,1);
			this._secondLayoutBox.add(fakeSpacer);
			
			this._buildTagList(this.getTag(), this.getRelation());

		},

		_buildTagList: function (tag, relation) {
			var tagsId = tag.getIds();
			var selectedId = this.__unique(relation.getIds());

			if (!tagsId){
				var noTagsLabel = new eyeos.socialbar.Label(tr('no tags assigned'), 'notag');
				this._secondLayoutBox.add(noTagsLabel);
			} else {
				for (var i = 0; i < selectedId.length; ++i){

					// Creating Label for Tag
					var tagBox = this;
					var id = selectedId[i];
					var name = tag.getNameById(selectedId[i]);
					var color = tag.getColorById(selectedId[i]);
					var tagLabel = new eyeos.socialbar.Label(name, 'tag', color, id);
					
					tagLabel.addListener('click', function (e) {
						this.selectedLabel(tagBox);
					});

					tagLabel.addListener('mouseover', function (e) {
						this.onMouseOver();
					});

					
					tagLabel.addListener('mouseout', function (e) {
						this.onMouseOut();
					});

					this._secondLayoutBox.add(tagLabel);

					// Eventually adding a comma
					if (i < (selectedId.length - 1)) {
						var commaLabel = new eyeos.socialbar.Label(',', 'comma');
						commaLabel.setMarginRight(5);
						this._secondLayoutBox.add(commaLabel);
					}
				}
			}
			
			
		},
		
		_updateSecondLayoutBox: function (action, id, name, color) {
			if (action == 'add'){
				if (this._secondLayoutBox.getChildren().length > 1) {
					var commaLabel = new eyeos.socialbar.Label(',', 'comma');
					commaLabel.setMarginRight(5);
					this._secondLayoutBox.add(commaLabel);
				}
				var tagLabel = new eyeos.socialbar.Label(this.getTag().getNameById(id), 'tag', this.getTag().getColorById(id), id);
				var tagBox = this;
				tagLabel.addListener('click', function (e) {
					this.selectedLabel(tagBox);
				});

				tagLabel.addListener('mouseover', function (e) {
					this.onMouseOver();
				});

				tagLabel.addListener('mouseout', function (e) {
					this.onMouseOut();
				});

				this._secondLayoutBox.add(tagLabel);
			} else {
				var posPresent = this._isPresentIdTagOnSecondLayout(id);
				if (posPresent != -1){
					this._secondLayoutBox.removeAt(posPresent);
					if (posPresent == 1) {
						if (this._secondLayoutBox.getChildren().length > 1) {
							this._secondLayoutBox.removeAt(1);
						}
					} else {
						this._secondLayoutBox.removeAt(posPresent - 1);
					}
				}		
			}
		},

		_isPresentIdTagOnSecondLayout: function (id){
			var tags = this._secondLayoutBox.getChildren();
			for (var i = 0; i < tags.length; ++i){
				if (tags[i] instanceof eyeos.socialbar.Label && tags[i].getType() == 'tag' && tags[i].getId() == id) {
					return i;
				}
			}
			return -1;
		},
		
		_buildThirdLayoutBox: function () {
			this._thirdLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				paddingTop: 5
			});
			this.add(this._thirdLayoutBox);

			var ids = this.getTag().getIds();
			var names = this.getTag().getNames();
			var tagMenu = new qx.ui.menu.Menu();

			for (var i = 0; i < ids.length; ++i){
				var menuButton = new eyeos.socialbar.MenuButton(names[i], this._isPresentTagOnRelation(ids[i]), null);
				menuButton.setSelected((this._isPresentTagOnRelation(ids[i])==null)?false:true);
				menuButton.setUserData('id', ids[i]);
				var self = this;
				menuButton.addListener('execute',  function(e) {
					if (this.getSelected()) {
						self.deSelectTag(this.getUserData('id'));
						this.setSelected(false);
						this._applyIcon(null);
						self._updateSecondLayoutBox('del', this.getUserData('id'));
					} else {
						self.selectTag(this.getUserData('id'));
						this.setSelected(true);					
						this._applyIcon('index.php?extern=images/tick.png');
						self._updateSecondLayoutBox('add', this.getUserData('id'));
					}
				});
				tagMenu.add(menuButton);
			}

			var tagMenuButton = new qx.ui.form.MenuButton(tr('Add Tag'), 'index.php?extern=images/arrowPeople.png', tagMenu);
			tagMenuButton.setIconPosition('right');
			this._thirdLayoutBox.add(tagMenuButton);
			
		},
		
		selectTag: function (idTag) {
			var relations = new eyeos.socialbar.Relation(new Array(this.getRelation().getIds()), new Array(this.getRelation().getObjects()));
			for (var i = 0; i < this.getAllItems().length; ++i) {
				// Check if the Items already has this ID
				var isPresent = false;
				// Take the first position of relation with Objects : allItems[i]
				var indexOfItem = relations.getObjects().indexOf(this.getAllItems()[i]);
				while (indexOfItem != -1) {
					// If this relation involved idTag
					if (relations.getObjects()[indexOfItem] == idTag) {
						isPresent = true;
					}
					
					// Delete relations checked
					relations.getObjects().splice(indexOfItem, 1);
					relations.getIds().splice(indexOfItem, 1);
					
					// Update indexOfItem					
					indexOfItem = relations.getObjects().indexOf(idTag);
				}
				
				if (!isPresent) {
					//Add the tag to the relation
					this.getRelation().getObjects().push(this.getAllItems()[i]);
					this.getRelation().getIds().push(idTag);
								
					//Send Events
					this.fireDataEvent('assignTag', [this.getAllItems()[i], idTag]);
				}
			}
		},
		
		deSelectTag: function (idTag) {
			var relation = new eyeos.socialbar.Relation(this.getRelation().getIds(), this.getRelation().getObjects());
			var indexOfObjectToDeselect = relation.getIds().indexOf(idTag);
			while (indexOfObjectToDeselect != -1) {
				//Launch event
				this.fireDataEvent('unassignTag', [relation.getObjects()[indexOfObjectToDeselect], idTag]);

				//Update Relations
				this.getRelation().getIds().splice(indexOfObjectToDeselect, 1);
				this.getRelation().getObjects().splice(indexOfObjectToDeselect, 1);
				
				//Search new Index
				indexOfObjectToDeselect = relation.getIds().indexOf(idTag);
			}
		},

		_isPresentTagOnRelation: function(id) {
			var relationIds = this.getRelation().getIds();
			for(var i = 0; i < relationIds.length; ++i){
				if (relationIds[i] == id) {
					return 'index.php?extern=images/tick.png';
				}
			}
			return null;
		},
		__unique: function (array) {
			var result = Array();
			for(var i = 0; i < array.length; ++i) {
				for(var j = i + 1; j < array.length; ++j) {
					// If this[i] is found later in the array
					if (array[i] === array[j])
						j = ++i;
				}
				result.push(array[i]);
			}
			return result;
		},

		/**
	 * Update Layout and Data Struct when a Tag is removed by the TagWindow
	 */
		_deleteTagLayout: function (idTag) {

			//Delete tag from Tag
			var posToDelete = this.getTag().getIds().indexOf(idTag);
			this.getTag().getIds().splice(posToDelete, 1);
			this.getTag().getNames().splice(posToDelete, 1);
			this.getTag().getColors().splice(posToDelete, 1);

			//Delete tag from Relation
			posToDelete = this.getRelation().getIds().indexOf(idTag);
			while (posToDelete != -1) {
				this.getRelation().getIds().splice(posToDelete, 1);
				this.getRelation().getObjects().splice(posToDelete, 1);

				posToDelete = this.getRelation().getIds().indexOf(idTag);
			}

			//Delete Element from tag lists
			var items = this._secondLayoutBox.getChildren();
			for (var i = 0; i < items.length; ++i) {
				if ((items[i].getType() == 'tag') && (items[i].getId() == idTag)) {
					items[i].destroy();
					//Delete also the comma
					if (items.length > (i + 1)) {
						items[i].destroy();
					} else {
						if (this._secondLayoutBox.getChildren().length > 0){
							items[i-1].destroy();
						}
					}
				}
			}
		
			//Delete tag from Menu
			var myMenuButton = this._thirdLayoutBox.getChildren();
			var myMenu = myMenuButton[0].getMenu();
			var myMenuChildren = myMenu.getChildren();
			for (i = 0; i < myMenuChildren.length; ++i) {
				if (myMenuChildren[i].getUserData('id') == idTag) {
					myMenuChildren[i].destroy();
				}
			}
		},

		/**
		 * Update Layout and Data Struct when a Tag change color in the TagWindow
		 */
		_changeTagColor: function (idTag, colorTag) {
			//Update Tag in Tag Object
			var posToChange = this.getTag().getIds().indexOf(idTag);
			this.getTag().getColors()[posToChange] = colorTag;

			//Update Layout Color
			var allLabels = this._secondLayoutBox.getChildren();
			for (var i = 0; i < allLabels.length; ++i) {
				if (allLabels[i].getType() == 'tag' && allLabels[i].getId() == idTag) {
					if (!allLabels[i].isSelected()) {
						allLabels[i].set({
							backgroundColor: this.getLayoutParent().getBackgroundColor(),
							textColor: colorTag,
							color: colorTag
						});
					} else {
						allLabels[i].set({
							backgroundColor: colorTag,
							textColor: 'white',
							color: colorTag
						});
					}
					allLabels[i].updateAppearance();
				}
			}
		},

		/**
		 * Update the Layout and the internal Data Struct with new informations
		 */

		_changeTagName: function (idTag, newName) {
			//Update Tag in Tag Object
			var posToChange = this.getTag().getIds().indexOf(idTag);
			this.getTag().getNames()[posToChange] = newName;

			//Update tag in Layout
			var allLabels = this._secondLayoutBox.getChildren();
			for (var i = 0; i < allLabels.length; ++i) {
				if (allLabels[i].getType() == 'tag' && allLabels[i].getId() == idTag) {
					allLabels[i].setValue(newName);
				}
			}

			//Update Tag in Menu
			var myMenuButton = this._thirdLayoutBox.getChildren();
			var myMenu = myMenuButton[0].getMenu();

			var allMenus = myMenu.getChildren();

			for (i = 0; i < allMenus.length; ++i) {
				if (allMenus[i].getUserData('id') == idTag ) {
					allMenus[i].setLabel(newName);
				}
			}
		},

		_addNewTag: function (id, name, color) {
			//Update Struct
			this.getTag().getIds().push(id);
			this.getTag().getNames().push(name);
			this.getTag().getColors().push(color);

			//Add tag to Menu
			var myMenuButton = this._thirdLayoutBox.getChildren();
			var myMenu = myMenuButton[0].getMenu();
			
			var menuButton = new eyeos.socialbar.MenuButton(name, false, null);
			menuButton.setSelected(false);
			menuButton.setUserData('id', id);
			var self = this;
			menuButton.addListener('execute',  function(e) {
				if (this.getSelected()) {
					self.deSelectTag(this.getUserData('id'));
					this.setSelected(false);
					this._applyIcon(null);
					self._updateSecondLayoutBox('del', this.getUserData('id'));
				} else {
					self.selectTag(this.getUserData('id'));
					this.setSelected(true);
					this._applyIcon('index.php?extern=images/tick.png');
					self._updateSecondLayoutBox('add', this.getUserData('id'));
				}
			});
			myMenu.add(menuButton);
		}
	}
});


