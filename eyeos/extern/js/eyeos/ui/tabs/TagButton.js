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

qx.Class.define('eyeos.ui.tabs.ToolButton', {
	
	extend: qx.ui.toolbar.Button,
	
	construct: function (caption, command, page) {
		arguments.callee.base.call(this, caption);
		this._associatedPage = page;
		this.setOwnCommand(command);
	},
	
	members: {
		_command: null,
		
		setOwnCommand: function (command) {
			this._command = command;
			this.addListener("execute", function (e) {
				eval("this."+command);
			}, this._associatedPage);
		}
	}

});

qx.Class.define("eyeos.ui.tabs.TagButton", {
	
	extend: qx.ui.container.Composite,
	
	construct: function (caption, id, checknum, page, editable) {
		this.base(arguments);
		this._id = id;
		this._editable = editable;
		this._decoratorMouseClick = new qx.ui.decoration.Single(1, 'solid', '#0088CD').set({
			'styleLeft': null,
			'styleTop': null,
			'styleRight': null
		});
		this._decoratorMouseOver = new qx.ui.decoration.Single(1, 'solid', '#D6D6D6').set({
			'styleLeft': null,
			'styleTop': null,
			'styleRight': null
		});
		this._decoratorMouseOut = new qx.ui.decoration.Single(1, 'solid', '#D6D6D6').set({
			'styleLeft': null,
			'styleTop': null,
			'styleRight': null
		});
		
		this.setChecknum(checknum);
		this._associatedPage = page;

		//this._numOfItems = numOfItems;

		this._buildLayout(caption/*, this._numOfItems*/);
		this._addListeners();
		this.setDecorator(this._decoratorMouseOut);
	},
	
	members: {
		_eventSemaphore: false,
		_id: null,
		_checknum: null,
		_label: null,
		_icon: null,
		_input: null,
		_buttonEdit: null,
		_buttonDelete: null,
		_buttonCancel: null,
		_buttonSave: null,
		_buttonsMenu: null,
		_menuIsActive: false,
		_commandsButton: null,
		_decoratorMouseOver: null,
		_decoratorMouseOut: null,
		_clicked: false,
		_associatedPage: null,
		//	_numOfItems: null,
		
		_buildLayout: function (caption/*, numItems*/) {
			
			// Layouting for every togglebutton
			this.set({
				decorator: this._decoratorMouseOut,
				width: 170,
				allowGrowX: false,
				padding: 2,
				marginBottom: 3,
				marginTop: 3
			});
		
			this.setLayout(new qx.ui.layout.HBox());
			
			// Inside we create the label, input and all the sort of buttons which will hide/show proceeding appropriately
			var content = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			var label = new qx.ui.basic.Label(caption).set({
				font: new qx.bom.Font(12, ['Lucida Grande', 'Verdana']),
				paddingLeft: 15,
				alignX: "left",
				textColor: '#858585',
				width: 115,
				allowGrowX: false
			});
			var input = new qx.ui.form.TextField(caption).set({
				alignX: "left",
				width: 115,
				allowGrowX: false
			});
			content.add(label);
			content.add(input);

			this.add(content, {
				flex: 1
			});


			//Skipe creation of commands where tag is 'All' or 'Pending'
			if (this._id > 0 && (!this._associatedPage.getLabel() == 'Groups')){
				var commandsMenu = new qx.ui.menu.Menu();
				var commandDelete = new qx.ui.menu.Button('Delete list', '', '');
				var commandEdit = new qx.ui.menu.Button('Edit list', '', '');
				var commandUp = new qx.ui.menu.Button('Move up', '', '');
				var commandDown = new qx.ui.menu.Button('Move down', '', '');

				commandsMenu.add(commandDelete);
				commandsMenu.add(commandEdit);
				commandsMenu.add(commandUp);
				commandsMenu.add(commandDown);

				commandDelete.addListener('execute', function(e){
					this._associatedPage.deleteTag(this._id, this._label);
				}, this);

				commandEdit.addListener('execute', function(e){
					this.showEditionMode();
				}, this);

				commandUp.addListener('execute', function(e){
					//!!! TODO muove il tag sopra
				});

				commandDown.addListener('execute', function(e){
					// !!! TODO muove il tag sotto
				});

				this._commandsButton = new qx.ui.form.MenuButton('', 'index.php?extern=images/arrowPeople.png', commandsMenu).set({
					width: 15,
					maxWidth: 15,
					minWidth: 15,
					height: 15,
					maxHeight: 15,
					minHeight: 15,
					padding: 1,
					allowGrowX: false,
					allowGrowY: false,
					alignX: 'right',
					marginRight: 5,
					marginBottom: 2
				});

				this.add(this._commandsButton);
				this._commandsButton.setVisibility('hidden');
			}






			//	    var cmpNumOfItems = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			//	    var labelNumItems = new qx.ui.basic.Label(numItems).set({
			//		textColor: '#858585',
			//		alignX: "right",
			//		marginLeft : 20
			//	    });
			//	    cmpNumOfItems.add(labelNumItems);
			//	    this.add(cmpNumOfItems);
			//cmpNumOfItems.setVisibility(excluded);
		
			var buttonsContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			this.add(buttonsContainer);

			var buttonsMenu = new eyeos.ui.menu.Menu();
			var buttons = new qx.ui.form.MenuButton(null, 'index.php?extern=images/Arrow.png', buttonsMenu).set({
				width: 16,
				height: 16,
				paddingLeft: -4,
				paddingRight: -4,
				paddingTop: -2,
				paddingBottom: -2
			});
			buttonsContainer.add(buttons);

			var buttonEdit = new qx.ui.menu.Button('Edit', 'index.php?extern=images/16x16/actions/document-edit.png').set({
				alignX: 'center',
				alignY: 'middle',
				width: 16
			});
			buttonsMenu.add(buttonEdit);

			var buttonDelete = new qx.ui.menu.Button('Delete', 'index.php?extern=images/16x16/actions/edit-delete.png').set({
				alignX: 'center',
				alignY: 'middle',
				width: 16
			});
			buttonsMenu.add(buttonDelete);

			var buttonSave = new qx.ui.menu.Button('Save', 'index.php?extern=images/16x16/actions/document-save.png').set({
				alignX: 'center',
				alignY: 'middle',
				width: 16
			});
			buttonsMenu.add(buttonSave);

			var buttonCancel = new qx.ui.menu.Button('Cancel', 'index.php?extern=images/16x16/actions/dialog-cancel.png').set({
				alignX: 'center',
				alignY: 'middle',
				width: 16
			});
			buttonsMenu.add(buttonCancel);
			
			
			input.setVisibility('excluded');
			buttonSave.setVisibility('excluded');
			buttonCancel.setVisibility('excluded');
			buttons.setVisibility('excluded');

			this._label = label;
			this._input = input;
			this._content = content;
			this._buttonEdit = buttonEdit;
			this._buttonDelete = buttonDelete;
			this._buttonSave = buttonSave;
			this._buttonCancel = buttonCancel;
			this._buttons = buttons;
			this._buttonsMenu = buttonsMenu;
		//	    this._cmpNumOfItems = cmpNumOfItems;
		//	    this._labelNumItems = labelNumItems;
		},
		
		_addListeners: function () {
			
			// When the button is clicked the mouseover style shouldn't work
			this.addListener('mouseover', function (e) {
				if (!this._clicked) {
					this.set({
						decorator: this._decoratorMouseOver,
						backgroundColor: "#F2F2F2",
						textColor: '#858585'
					});
					this._label.setTextColor('#858585');
					if (this._commandsButton != null){
						this._commandsButton.setVisibility('visible');
					}
				//		    this._labelNumItems.setTextColor('#FCFCFC');
				}
				if (this._id != 0 && this._id != -1 && this._editable) {
					this._buttons.setVisibility('visible');
				//	this._cmpNumOfItems.setVisibility("excluded");
				}
			});


			this._buttonsMenu.addListener('appear', function() {
				this._menuIsActive = true;
			}, this);

			this._buttonsMenu.addListener('disappear', function() {
				this._menuIsActive = false;
			}, this);
			// When the button is clicked the mouse style shouldn't work
			// If editing is "on" and we lose the mouse event the style should remain
			this.addListener('mouseout', function (e) {
				if (!qx.ui.core.Widget.contains(this, e.getRelatedTarget())) {
					if (!this._clicked && !this._editing) {
						this.set({
							decorator: this._decoratorMouseOut,
							backgroundColor: null,
							textColor: '#858585'
						});
						this._label.setTextColor('#858585');
						if (this._commandsButton != null){
							this._commandsButton.setVisibility('hidden');
						}
					//		    this._labelNumItems.setTextColor('#858585');
					}
					if (!this._editing) {
						if(!this._menuIsActive) {
							this._buttons.setVisibility("hidden");
						}
					//		    this._cmpNumOfItems.setVisibility("visible");
					}
				}
			});
			//
			//			// Filter the list
			this.addListener('click', function (e) {
				if (!this._clicked && !this._editing) {
					this._associatedPage.filterContentPerTag(this._id);
					this.select();
				}
			});
			
			if (this._id != 0  && this._id != -1 && this._editable) {
				// Delete, Edit (with Cancel and Save)
				this.addListener("dblclick", function(){
					this.showEditionMode();
				}, this);

				this._buttonDelete.addListener("execute", function(e){
					this._associatedPage.deleteTag(this._id, this._label);
				}, this);
			
				this._buttonEdit.addListener("execute", function(e){
					this.showEditionMode();
				}, this);
			
//				this._buttonCancel.addListener("execute", function(e){
//					this.cancelEditionMode();
//				}, this);
//
//				this._buttonSave.addListener("click", function(e){
//					this.save();
//					this._semaphore = true;
//					e.stopPropagation();
//				}, this);
			}
		},
		
		cancelEditionMode: function () {
			this._input.setVisibility('excluded');
			this._buttonSave.setVisibility('excluded');
			this._buttonCancel.setVisibility('excluded');
			this._label.show();
			this._buttonEdit.show();
			this._buttonDelete.show();

			// We set the flags to false
			this._editing = false;
			this._semaphore = false;

			// We get all the tags inside the page
			var tags = this._associatedPage.getTags();
			var result = null;
			for (var i in tags) {
				if (tags[i].id == this.getId()) {
					result = tags[i];
				}
			}
			this._input.setValue(result.name);
		},
		
		showEditionMode: function () {
			// We hide the non-edit elements and we set the flag that we're editing
			this._buttonDelete.setVisibility('excluded');
			this._label.setVisibility('excluded');
			this._input.setVisibility('visible');
			this._buttonSave.setVisibility('excluded');
			this._buttonCancel.setVisibility('excluded');
			this._buttonEdit.setVisibility('excluded');

			// We need to change the value of the input
			this._input.setValue(this._label.getValue());
			
			this._editing = true;
			this._semaphore = true;
			
			this.set({
				decorator: this._decoratorMouseOver,
				backgroundColor: "#0088CD",
				textColor: '#FCFCFC'
			});
			
			// This is a workaround cause the second time you call "selectAllText" Firefox throws an exception
			this._input.focus();
			this._input.addListener('focusin', function(e) {
				this.selectAllText();
			});

			this._input.addListener('focusout', function(e) {
				if(!this._eventSemaphore) {
					this._eventSemaphore = true;
					this.saveIt();
				}
			}, this);
			
			this._input.addListener('keypress', function(e) {
				if(e.getKeyIdentifier() == 'Escape') {
					this.cancelEditionMode();
				}
				
				if(e.getKeyIdentifier() == 'Enter') {
					if(!this._eventSemaphore) {
						this._eventSemaphore = true;
						this.saveIt();
					}
				}
			}, this);
//
//			this._input.addListener('changeValue', function(e) {
//				this.save();
//				e.stopPropagation();
//			}, this);
			
		},
		
		saveIt: function () {
			if (this._semaphore) {
				var value = this._input.getValue();

				if ( (value != undefined)
						&& (value.length > 0)
						&& (value.length > value.count(' ') ) ) {

					var params = [this.getId(), value];

					// We need to cancel the edition mode before it's too late! (due to asynchronous problems)
					this.cancelEditionMode();

					eyeos.callMessage(this._checknum, 'editTag', params, function (results) {
						
						//Update Label
						var oldLabel = this._label.getValue();
						this._label.setValue(value);
						
						//Update Page
						var tagsPage = this._associatedPage.getTags();
						for (var i = 0; i < tagsPage.length; ++i){
							if (tagsPage[i].id == this.getId()){
								tagsPage[i].name = params[1];
							}
						}
						
						this._associatedPage.setTags(tagsPage);
						this._associatedPage.populateActionToolbar();
						
						//Update Contacts
						var contacts = this._associatedPage._layoutItems.getChildren();
						for (var i = 0; i < contacts.length; ++i){
							if (contacts[i] instanceof eyeos.ui.tabs.ContactAll){
								contacts[i].updateMenu();
								contacts[i]._updateDescription();
							}
						}
						
						//Send Event to Event Framework
						var event = new eyeos.events.Event({
							type: 'People_EditedList',
							eventData: {
								oldListName: oldLabel,
								newListName: value
							}
						});
						var eventJson = eyeos.events.Event.toJson(event);
						eyeos.callMessage(this._checknum, '__Events_sendEventByType', eventJson);		
						this._eventSemaphore = false;
					}, this);
				} else {
					var op = new eyeos.dialogs.OptionPane(
						"Invalid Tag Name: Tag name cannot be empty or composed only by spaces!",
						eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					var d = op.createDialog(this._associatedPage, "InvalidTagName", function(result) {
						eyeos.callMessage(this.getChecknum(), "removeTag", this.getId(), function() {
							this.destroy();
						}, this);
					}, this);
					d.open();
				}
			}
		},
		
		setChecknum: function (checknum) {
			this._checknum = checknum;
		},
		
		getChecknum: function () {
			return this._checknum;
		},
		
		getId: function () {
			return this._id;
		},
		
		getLabel: function () {
			return this._label.getValue();
		},
		
		setLabel: function (label) {
			return this._label.setValue(label);
		},

		//	setNumOfItems : function(numOfItems) {
		//	    this._numOfItems = numOfItems;
		//	    this._labelNumItems.setValue(numOfItems);
		//	},
		//
		//	getNumOfItems : function() {
		//	    return this._numOfItems;
		//	},
		
		select: function () {
			this._clicked = true;

			if (this != this._associatedPage._activeTagToolbarButton) {
				this._associatedPage.resetTagList();
			}
			
			this._associatedPage._activeTagToolbarButton = this;
			
			this.set({
				backgroundColor: "#0088CD",
				decorator: this._decoratorMouseClick
			});
			
			this._label.setTextColor('#FCFCFC');
		//	    this._labelNumItems.setTextColor('#FCFCFC');
		},
		
		unselect: function () {
			this.set({
				backgroundColor: null,
				textColor: "#858585",
				decorator: this._decoratorMouseOut
			});
			this._label.setTextColor('#858585');
			//	    this._labelNumItems.setTextColor('#858585');
			this._clicked = false;
			if (this._commandsButton != null){
				this._commandsButton.setVisibility('hidden');
			}
		}
	}
});

