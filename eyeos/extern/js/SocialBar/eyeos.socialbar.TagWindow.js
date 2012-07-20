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
qx.Class.define('eyeos.socialbar.TagWindow', {
	extend: qx.ui.window.Window,

	properties: {
		box: {

		},
		tags: {
			init: new Array()
		},
		relations: {
			init: new Array()
		}
	},
	
	construct: function (box, tags, relations) {
		this.base(arguments, tr('Edit Tag'));
		this.setBox(box);
		this.setTags(tags);
		this.setRelations(relations);

		this._maxId = Math.max.apply(Math, tags.getIds());
		this._buildGui();
	},



	members: {
		__layoutTitleBox: null,
		_mainSelectForm: null,
		_layoutContentBox: null,
		_firstColumnContent: null,
		_secondColumnContent: null,
		_thirdColumnContent: null,
		_layoutButtonBox: null,
		_toDeleteTag: new Array(),
		_toDeleteItemFromBox : new Array(),
		_maxId: 0,
		
		_buildGui: function () {
			this.open();
			this.set({
				layout: new qx.ui.layout.VBox(),
				height: 350,
				width: 450,
				allowGrowX: false,
				allowGrowY: false,
				decorator: null,
				modal: true,
				resizable: false,
				showStatusbar: false,
				showMaximize: false,
				showMinimize: false,
				movable: false,
				backgroundColor: '#FFFFFF'
			});

			this._createTitleBox();
			this._createNewTaButton();
			this._createContentBox();
			this._createButtonBox();
			this.center();
			
		},

		/**
		 * Create the Layout with the Button for add a New Tag
		 */
		_createNewTaButton: function () {
			var addNew = new qx.ui.form.Button(tr('New Tag')).set({
				allowGrowX: false,
				marginTop : 30,
				marginLeft: 10
			});
			this.add(addNew);

			addNew.addListener('execute', this._addNewTag, this);
		},

		_createTitleBox: function () {
			this._layoutTitleBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single(2, 'solid', '#A4A4A4').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				}),
				padding: 10
			});
			this.add(this._layoutTitleBox);
			var textLabel = tr('Manage Tags');
			var label = new eyeos.socialbar.Label(textLabel, 'titleWindow');
			this._layoutTitleBox.add(label);
			
		},

		_createContentBox: function () {
			this._layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true,
				margin: 10
			});
			this.add(this._layoutContentScroll, {flex: 1});

			this._layoutContentBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				layout: new qx.ui.layout.HBox(10),
				decorator: null,
				padding: 5
			});
			this._layoutContentScroll.add(this._layoutContentBox, {flex: 1});

			this._firstColumnContent = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				alignX: 'left',
				alignY: 'middle'
			});

			this._layoutContentBox.add(this._firstColumnContent);
			
			this._secondColumnContent = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				alignX: 'center',
				alignY: 'middle'
			});

			this._layoutContentBox.add(this._secondColumnContent);

			this._thirdColumnContent = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				alignX: 'center',
				alignY: 'middle'
			});

			this._layoutContentBox.add(this._thirdColumnContent);
			
			this._createContentHeader();
			this._createContentBody();

		},
		
		_createContentHeader: function () {
			var firstLabel = new eyeos.socialbar.Label(tr('Tag'), 'windowLabel');
			this._firstColumnContent.add(firstLabel);
			
			var secondBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			this._secondColumnContent.add(secondBox);
			
			var secondLabel = new eyeos.socialbar.Label(tr('Color') + ':', 'windowLabel').set({
				paddingRight: 10
			});
			secondBox.add(secondLabel);			
			
			var removeLabel = new eyeos.socialbar.Label(tr('Remove'), 'windowLabel');
			this._thirdColumnContent.add(removeLabel);
			
		},
		
		_createContentBody: function () {
			var item = new eyeos.socialbar.Tag(
				this.getTags().getIds(),
				this.getTags().getNames(),
				this.getTags().getColors()
			);
				
			for (var i = 0; i < item.getIds().length; ++i) {
				//Create the First Column content
				var valueBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignX: 'left',
						alignY: 'middle'
					}),
					decorator: null,
					height: 35,
					width: 150,
					allowGrowY: false,
					allowGrowX: false
				});
				this._firstColumnContent.add(valueBox);

				var labelNewTag = new eyeos.socialbar.Label(item.getNames()[i], 'label').set({
					alignX: 'left',
					visibility: 'visible'
				});
				labelNewTag.setUserData('initialValue', item.getNames()[i]);
				labelNewTag.setUserData('modified', false);

				labelNewTag.addListener('changeValue', function (e) {
					if (this.getValue() != this.getUserData('initialValue')) {
						this.setUserData('modified', true);
					}
				});
				valueBox.add(labelNewTag);

				var inputNewTag = new qx.ui.form.TextField(item.getNames()[i]).set({
					alignX: 'left',
					visibility: 'excluded'
				});
				valueBox.add(inputNewTag);

				inputNewTag.addListener('focusout', function(e){
					var label = this.getLayoutParent().getChildren()[0];
					label.setValue(this.getValue());
					this.setVisibility('exluded');
					label.setVisibility('visible');
				});
				
				inputNewTag.addListener('keyup', function(e){
					var label = this.getLayoutParent().getChildren()[0];
					if(e.getKeyIdentifier() == 'Enter') {
						label.setValue(this.getValue());
						this.setVisibility('exluded');
						label.setVisibility('visible');
					}
					if(e.getKeyIdentifier() == 'Escape') {
						this.setVisibility('exluded');
						label.setVisibility('visible');
						this.setValue(label.getValue());
					}
				});

				labelNewTag.addListener('dblclick', function (e) {
					var input = this.getLayoutParent().getChildren()[1];
					input.setVisibility('visible');
					input.focus();
					this.setVisibility('excluded');
				});

				//Second Column
				var color = item.getColors()[i];
				var selectFormBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignX: 'center',
						alignY: 'middle'
					}),
					height: 35
				});
				this._secondColumnContent.add(selectFormBox);
				var selectForm = this.__createSelectForm(color);
				selectForm.setUserData('modified', false);
				selectFormBox.add(selectForm, {
					flex: 1
				});

				//ThirdColumn
				var removeIconBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignX: 'center',
						alignY: 'middle'
					}),
					height: 35
				});

				this._thirdColumnContent.add(removeIconBox);

				var removeIcon = new qx.ui.basic.Image('index.php?extern=images/clear.png').set({
					padding: 10
				});
				removeIconBox.add(removeIcon);

				var itemsToRemove = [valueBox, selectFormBox, removeIconBox];
				removeIcon.setUserData('relatedElements', itemsToRemove);
				removeIcon.setUserData('id', item.getIds()[i]);

				removeIcon.addListener ('click', function (e) {
					var removeRef = e.getTarget();
					var toRemove = removeRef.getUserData('relatedElements');
					
					var elToDelete = removeRef.getUserData('id');
					this._toDeleteTag.push(elToDelete);
					
					//Say to SharedBox to delete the item from Layout if Accept is pressed
					this._toDeleteItemFromBox.push(elToDelete);
					
					// Remove the Row from shareWindow
					for (var i = 0; i < toRemove.length; ++i) {
						toRemove[i].destroy();
					}

				} , this);
			}
		},
		
		_createButtonBox: function () {
			this._layoutButtonBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'right'
				}),
				decorator: null
			});
			this.add(this._layoutButtonBox);

			var buttonCancel = new qx.ui.form.Button(tr('Cancel')).set({
				paddingRight: 10,
				paddingLeft: 10,
				marginRight: 10
			});

			buttonCancel.addListener('click', function (e){
				this.close();
			}, this);
			this._layoutButtonBox.add(buttonCancel);

			var buttonAccept = new qx.ui.form.Button(tr('Accept')).set({
				paddingRight: 20,
				paddingLeft: 20,
				marginRight: 10
			});

			buttonAccept.addListener('click', function (e){
				//Deleting Share queue
				for (var i = 0; i < this._toDeleteTag.length; ++i){
					this.getBox().fireDataEvent('deleteTag', this._toDeleteTag[i]);
				}

				//Delete also from parent Layout
				for (i = 0; i < this._toDeleteItemFromBox.length; ++i){
					this.getBox().fireDataEvent('deleteItemFromLayout', this._toDeleteItemFromBox[i]);
				}

				//Modification to value
				var allSelectBox = this._secondColumnContent.getChildren();
				var allLabelBox = this._firstColumnContent.getChildren();
				var allRemoveBox = this._thirdColumnContent.getChildren();
				
				for (i = 1; i < allSelectBox.length; ++i){
					var select = allSelectBox[i].getChildren()[0];
					var label = allLabelBox[i].getChildren()[0];
					var remove = allRemoveBox[i].getChildren()[0];

					//Create New Tagç
					if ((remove instanceof qx.ui.basic.Image) && (remove.getUserData('id') == -1)) {
						this.getBox().fireDataEvent('createNewTag', [this._maxId+1, label.getValue(), select.getValue()]);
						this._maxId = this._maxId + 1;
					} else {
						//Update Tag Color
						if (select instanceof qx.ui.form.SelectBox) {
							if (select.getUserData('modified')) {
								this.getBox().fireDataEvent('setTagColor', [remove.getUserData('id'), selectBox.getValue()]);
							}
						}
						//Update Name
						if (label instanceof eyeos.socialbar.Label) {
							if (label.getUserData('modified')) {
								this.getBox().fireDataEvent('setTagName', [remove.getUserData('id'), label.getValue()]);
							}
						}
					}
				}
				this.close();
			}, this);
			this._layoutButtonBox.add(buttonAccept);
		},
		
		__createSelectForm: function (color) {
			var itemSelectForm = new qx.ui.form.SelectBox().set({
				decorator: null,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle'
			});
			
			var yellow = new qx.ui.form.ListItem(tr('yellow'));
			var red = new qx.ui.form.ListItem(tr('red'));
			var blue = new qx.ui.form.ListItem(tr('blue'));
			var orange = new qx.ui.form.ListItem(tr('orange'));
			var green = new qx.ui.form.ListItem(tr('green'));
			var purple = new qx.ui.form.ListItem(tr('purple'));

			
			itemSelectForm.add(red);
			itemSelectForm.add(yellow);
			itemSelectForm.add(blue);
			itemSelectForm.add(orange);
			itemSelectForm.add(green);
			itemSelectForm.add(purple);
			
			itemSelectForm.setValue(color);
			itemSelectForm.setUserData('initialValue', color)

			itemSelectForm.addListener('changeValue', function (e) {
				if (e.getData() != this.getUserData('initialValue')) {
					this.setUserData('modified', true);
				} else {
					this.setUserData('modified', false);
				}
					
			});

			return itemSelectForm;
		},

		/**
		 * Add new Row to the Content for add a New Tag
		 */
		_addNewTag: function () {
			//First Column
			var valueBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				decorator: null,
				height: 35,
				width: 150,
				allowGrowY: false,
				allowGrowX: false
			});
			this._firstColumnContent.addAt(valueBox, 1);

			var labelNewTag = new eyeos.socialbar.Label('', 'label').set({
				alignX: 'left',
				visibility: 'excluded'
			});
			valueBox.add(labelNewTag);

			var inputNewTag = new qx.ui.form.TextField().set({
				alignX: 'left',
				visibility: 'visible'
			});
			inputNewTag.focus();
			valueBox.addAt(inputNewTag);

			inputNewTag.addListener('focusout', function(e){
				var label = this.getLayoutParent().getChildren()[0];
				label.setValue(this.getValue());
				this.setVisibility('exluded');
				label.setVisibility('visible');
			});
			inputNewTag.addListener('keyup', function(e){
				if(e.getKeyIdentifier() == 'Enter') {
					labelNewTag.setValue(inputNewTag.getValue());
					inputNewTag.setVisibility('exluded');
					labelNewTag.setVisibility('visible');
				}
				if(e.getKeyIdentifier() == 'Escape') {
					inputNewTag.setVisibility('exluded');
					labelNewTag.setVisibility('visible');
					inputNewTag.setValue(labelNewTag.getValue());
					inputNewTag.focus();
				}
			}, this);

			labelNewTag.addListener('dblclick', function (e) {
				inputNewTag.setVisibility('visible');
				inputNewTag.focus();
				labelNewTag.setVisibility('excluded');
			});


			//Second Column
			var selectFormBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				height: 35
			});
			this._secondColumnContent.addAt(selectFormBox, 1);
			var selectForm = this.__createSelectForm('red');
			selectFormBox.add(selectForm, {
				flex: 1
			});

			//Third Column
			var removeIconBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				height: 35
			});

			this._thirdColumnContent.addAt(removeIconBox, 1);

			var removeIcon = new qx.ui.basic.Image('index.php?extern=images/clear.png').set({
				padding: 10
			});
			removeIconBox.add(removeIcon);

			var itemsToRemove = [valueBox, selectFormBox, removeIconBox];
			removeIcon.setUserData('relatedElements', itemsToRemove);
			removeIcon.setUserData('id', -1);
			removeIcon.addListener ('click', function (e) {
				var removeRef = e.getTarget();
				var toRemove = removeRef.getUserData('relatedElements');
				// Remove the Row from shareWindow
				for (var i = 0; i < toRemove.length; ++i) {
					toRemove[i].destroy();
				}
			}, this);
		}
	}
});

