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
 * The main class for the pages on the desktop.
 * 
 * It extends the original Page adding special methods to manage the "Actions", "Tags" and the "Items" , it's the responsible also for
 * managing the tags (adding, editing, deleting) and also the items as well as the relations between them.
 * 
 * @param {String} caption - The title (caption) of the page
 * @param {Array} tags - Each one of the Tag objects
 * @param {Array} actions - Each one of the Tag actions
 */

qx.Class.define('eyeos.ui.tabs.Page', {
	
	extend: qx.ui.tabview.Page,
	
	construct: function (caption, checknum, editable, tags) {
		this.base(arguments, caption);
		
		this.getChildControl("button").addListener('click', function() {
			this.getChildControl("button").blur();
		}, this);

		this._editable = editable;
		this._page = caption;
		this.setTags(tags);
		this.setChecknum(checknum);
		this._buildLayout();
		this._addListeners();
	},
	
	members: {
		_context: 'All',	//Can be 'All' or 'Add'
		_page: null,
		_actions: null,
		_tags: null,
		_layoutContent: null,
		_layoutActionToolbar: null,
		_layoutContentScroll: null,
		_layoutTagToolbar: null,
		_layoutItems: null,
		_layoutSearch: null,	
		_layoutScroll: null,
		_activeTagToolbarButton: null,
		_searchTextField: null,
		_activeSearching: false, //if = true, contacts not show, show Search Contacts
		_needToRefreshLayoutItem: false,
		_actionsMenuOrButton: null,
		_selectedTag: 0,
		__contacts: null,
		_imageCharging: null,

		/**
		 * Adds all the listeners to the page
		 */
		_addListeners: function () {
			var bus = eyeos.messageBus.getInstance();
                        
			bus.addListener('eyeos_people_confirmContact', function (e) {
				this._eventConfirmContact(e.getData());
			}, this);

			bus.addListener('eyeos_people_deleteContact', function (e) {
				this._eventDeleteContact(e.getData());
			}, this);

            bus.addListener('eyeos_people_requestRelationship', function (e) {
				this._eventRequestRelationship(e.getData());
			}, this);

			bus.addListener('eyeos_NSGroup_deletedWorkgroup', function (e) {
				if (this._page == tr('Groups')) {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_NSGroup_nameChanged', function (e) {
				if (this._page == tr('Groups') && this._context == 'All') {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_NSGroup_pendingWorkgroup', function (e) {
				if (this._page == tr('Groups')) {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_NSGroup_bannedFromWorkgroup', function (e) {
				if (this._page == tr('Groups') && this._context == 'All') {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_NSGroup_confirmMembership', function (e) {
				if (this._page == tr('Groups')) {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_NSGroup_memberWorkgroup', function (e) {
				if (this._page == tr('Groups')) {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_NSGroup_invitedWorkgroup', function (e) {
				if (this._page == tr('Groups')) {
					this.populate();
				}
			}, this);

			bus.addListener('eyeos_workgroup_createGroup', function (e) {
				if (this._page == tr('Groups') && this._context == 'All') {
					var groupId = e.getData()[1];
					eyeos.callMessage(this.getChecknum(), '__Workgroups_getWorkgroup', {
						id: groupId,
						includeMeta: 'true'
					}, function (result) {
						var group = new eyeos.ui.tabs.GroupAll(
							result.name,
							result.id,
							result['metadata']['eyeos.workgroup.description'],
							result.status,
							result.role,
							result.privacyMode,
							result['metadata']['eyeos.workgroup.tags'],
							this
							);
						this._cleanEmptyTabMessage();
						this._layoutItems.add(group);
					}, this);
				}
			}, this);

			this.addListener('resize', function (e) {
				var bounds = this.getBounds();
				this._layoutScroll.set({
					height: parseInt(bounds.height - 20)
				});
			});

			this.addListener('changeSelection', function (e) {
				this._setActionsStatus();
			}, this);

			
		},

		/**
		 * Function executed when the event 'eyeos_people_confirmContact'
		 * is fired from the messageBus
		 **/
		_eventConfirmContact: function (contactModel) {
			// context All, All tag selected => add the contact
			if (this._page == tr('People') && this._context == 'All' && this._selectedTag == 0) {
				this._cleanEmptyTabMessage();
				var contact = new eyeos.ui.tabs.ContactAll(contactModel, this);
				this._layoutItems.add(contact);
            }
		},

        _eventRequestRelationship: function (contactModel) {
            if (this._page == tr('People') && this._context == 'All' && this._selectedTag == -1) {
                this._cleanEmptyTabMessage();
				var contact = new eyeos.ui.tabs.ContactPending(contactModel, this);
				this._layoutItems.add(contact);
			}
        },

		/**
		 * Clean the Tab from the empty tab label 
		 */
		_cleanEmptyTabMessage: function () {
			//If the first element on the layout is a label remove it 
			var element = this._layoutItems.getChildren()[0];
			if (element instanceof qx.ui.basic.Label) {
				this._layoutItems.removeAll();
			}
		},

		/**
		 * Function executed when the event 'eyeos_people_deleteContact'
		 * is fired from the messageBus
		 **/
        _eventDeleteContact: function (contactId) {
            if (this._page == tr('People') && this._context == 'All') {
                var childrenList = this._layoutItems.getChildren();
                for (var i = 0; i < childrenList.length; i++) {
                    if (childrenList[i] instanceof eyeos.ui.tabs.ContactAll || childrenList[i] instanceof eyeos.ui.tabs.ContactPending) {
                        if (childrenList[i].getId() == contactId){
                            childrenList[i].destroy();
                        }
                    }
                }
            }
        },

		_setActionsStatus: function() {
			//Retrieve all the items
			var myItems = this._layoutItems.getChildren();
			var counter = 0;

			for (var i = 0; i < myItems.length; ++i) {
				if (myItems[i] instanceof eyeos.ui.tabs.ContactAll && myItems[i].isSelected()) {
					counter++;

					if(counter == 2) {
						break;
					}
				}
			}

			if(counter >= 2) {
				this._actionsMenuOrButton.setEnabled(true);
			} else {
				this._actionsMenuOrButton.setEnabled(false);
			}
			
		},
		
		/**
		 * Builds the layout
		 */

		_buildLayout: function () {

			// Main Layout
			this.setLayout(new qx.ui.layout.HBox(0));

			// Main Container
			this._layoutContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
			this.add(this._layoutContent, {
				flex: 1
			});
			
			// Tag Toolbar
			this._layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true,
				width: 195,
				allowGrowX: false
			});
			this.add(this._layoutContentScroll);
			
			this._layoutTagToolbar =  new qx.ui.container.Composite(new qx.ui.layout.VBox(0)).set({
				width: 170,
				allowGrowX: false,
				marginRight: 20
			});
			this._layoutContentScroll.add(this._layoutTagToolbar);
			
			// The "Action" toolbar
			this._layoutActionToolbar = new qx.ui.toolbar.ToolBar();
			this._layoutActionToolbar.set({
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5),
				backgroundColor: '#E0E0E0',
				padding: 0,
				margin: 0,
				height: 40

			});
			this._layoutContent.add(this._layoutActionToolbar);

			// Main Content (Items such as Contacts, Applications, Groups ...)
			this._layoutScroll = new qx.ui.container.Scroll();

			
			this._layoutItems = new qx.ui.container.Composite(new qx.ui.layout.Flow(7, 7)).set({
				allowShrinkY: false,
				padding: 5
			});
			
			this._layoutItems.setVisibility("visible");
			this._layoutScroll.add(this._layoutItems);
			this._layoutContent.add(this._layoutScroll, {
				"flex": 1
			});
		},

		populate: function () {
			this.populateTagToolbar();
			this.populateLayoutItem();
			this.updateActionToolbar();
		},

		updateActionToolbar: function () {
			if (this._actionsMenuOrButton) {
				if (this._context == 'Add' && this._page == tr('People')){
					this._actionsMenuOrButton.setVisibility('excluded');
				} else {
					this._actionsMenuOrButton.setVisibility('visible');
				}
			}
		},
		/**
		 * Builds the "action" toolbar
		 *
		 * @param actions {array} All the data (name & command) for the future action buttons (Add, edit, delete, search ...) of our toolbar
		 */
		populateActionToolbar: function () {
			this._layoutActionToolbar.removeAll();
			// This will delete all the previous actions' buttons if they exist
			//var childrenList = this._layoutActionToolbar.getChildren();
			//for (var i = 0; i < childrenList.length; ++i) {
			//	childrenList[i].destroy();
			//}
			var actions = this.getActions();
			// Create Context Switch Buttons with the first 2 actions
			var contextButtons = this._createContextButtons(actions[0], actions[1], this);
			this._layoutActionToolbar.add(contextButtons);
			actions = actions.slice(2);
			
			// Create Menu for Multiple choice actions
			if (actions.length > 0) {
				this._actionsMenuOrButton = this._createActions(actions, this.getTags());
				this._layoutActionToolbar.add(this._actionsMenuOrButton);
			}
			// Create Search
			var searchBox = this._createSearchBox();
			this._layoutActionToolbar.addSpacer();
			this._layoutActionToolbar.add(searchBox);
			
			//Update Action Toolbar
			this.updateActionToolbar();
		},

		/**
		 *Create the Switch Context Buttons
		 *
		 * @params params {array} Array with 2 elements, each elements contains a name and an action
		 * @return {string} The container with the Swtich Context Buttons
		 */
		_createContextButtons: function (firstAction, secondAction) {
			var mainContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
			mainContainer.set({
				backgroundColor: '#DADADA',
				width: 200,
				allowGrowX: false
			});

			var firstButton = new qx.ui.basic.Atom();
			var secondButton = new qx.ui.basic.Atom();

			firstButton.set({
				font: new qx.bom.Font(14, ["Helvetica", "Verdana"]).set({
					bold: true
				}),
				label: firstAction.name,
				icon: 'index.php?extern=images/arrowTag.png',
				center: true,
				iconPosition: 'bottom',
				show: 'both',
				backgroundColor: '#DADADA',
				textColor: '#666666',
				paddingLeft: 10,
				paddingRight: 10,
				paddingTop: 10,
				allowGrowX: true,
				allowStretchY: false
			});

			firstButton.addListener("click", function (e) {
				if (firstButton.getShow() == "label"){
					firstButton.setShow("both");
					firstButton.setFont(new qx.bom.Font(14, ["Helvetica", "Verdana"]).set({
						bold: true
					}));

					secondButton.setShow("label");
					secondButton.setFont(new qx.bom.Font(14, ["Helvetica", "Verdana"]));
					this._context = 'All';
					this.populate();
					this._searchTextField.setValue(tr('Search in All'));
				}
			}, this);


			secondButton.set({
				font: new qx.bom.Font(14, ["Helvetica", "Verdana"]),
				label: secondAction.name,
				icon: 'index.php?extern=images/arrowTag.png',
				center: true,
				iconPosition: "bottom",
				show: "label",
				backgroundColor: "#DADADA",
				textColor: "#666666",
				paddingLeft: 10,
				paddingRight: 20,
				paddingTop: 10,
				allowGrowX: true,
				allowStretchY: false
			});

			secondButton.addListener("click", function (e) {
				if (secondButton.get("show") == "label"){
					secondButton.setShow("both");
					secondButton.setFont(new qx.bom.Font(14, ["Helvetica", "Verdana"]).set({
						bold: true
					}));

					firstButton.setShow("label");
					firstButton.setFont(new qx.bom.Font(14, ["Helvetica", "Verdana"]));
					this._context = 'Add';
					this.populate();
					this._searchTextField.setValue(tr('Search in the Eyeos Network'));
				}
			}, this);


			mainContainer.add(firstButton);
			mainContainer.add(secondButton);

			return mainContainer;
		},


		/**
		 *Create the Menu or the butoon for Actions
		 *
		 * @params actions {array} Array with actions
		 * @return {string} the menu or the button with actions
		 */
		_createActions: function (actions){
			//Put just a Button
			if (actions.length == 1) {
				var myButton = new qx.ui.form.Button(actions[0].name, actions[0].icon).set({
					allowGrowY: false,
					alignY: 'middle'
				});
				myButton.addListener('execute', new Function(actions[0].command), this);
				return myButton;
			} else {
				var menu = new qx.ui.menu.Menu();
				menu.addListener('appear', function () {
					this.setZIndex(500002);
				});

				for (var i=0; i < actions.length; ++i) {
					if (actions[i].command != '') {
						var subMenu = new qx.ui.menu.Button(actions[i].name, actions[i].icon);
						subMenu.addListener('execute', new Function(actions[i].command), this);
						menu.add(subMenu);
					} else {
						var allTags = this._tags;
						var tagsMenu = new qx.ui.menu.Menu();
						tagsMenu.addListener('appear', function() {
							if (allTags != null) {
								var enabledTags = new Object();

								// for each tag in the tag list...
								for(var i = 0; i < allTags.length; ++i) {
									// if the tag is a valid one...
									var currentTag = allTags[i].id;
									if(currentTag > 0) {
										// we retrieve the contacts...
										var contacts = this._layoutItems.getChildren();

										// and we finally check which one of them
										// has the currentTag...
										contacts.forEach(function(contact) {
											var hasCurrentTag = false;
											contact.getTags().forEach(function(tag) {
												if(currentTag === tag) {
													hasCurrentTag = true;
												}
											}, this);
											if((enabledTags[currentTag] === undefined) || (enabledTags[currentTag] === true)) {
												enabledTags[currentTag] = hasCurrentTag;
											}
										}, this);
									}
								}

								// now we can iterate on the tag element, and set enabled
								// or disabled each one of them...
								var tags = tagsMenu.getChildren();
								for(var element in enabledTags ) {
									tags.forEach(function(tag) {
										if(tag.getUserData('id') == element) {
											tag.setValue(enabledTags[element]);
										}
									}, this);
								}
							}
						}, this);

						if (allTags != null) {
							for (var j = 0; j < allTags.length; ++j) {
								// Skip over 'All' and 'Pending'
								if (allTags[j].id > 0) {
									var subTagsMenu = new qx.ui.menu.CheckBox(allTags[j].name);
									subTagsMenu.setValue(true);
									subTagsMenu.setUserData('id', allTags[j].id);

									subTagsMenu.addListener('mousedown', function (e) {
										this.setTagToSelected(e.getTarget().getUserData('id'), !e.getTarget().getValue());
									}, this);
									tagsMenu.add(subTagsMenu);
								}
							}

							var tagsMenuButton = new qx.ui.menu.Button(actions[i].name, null, null, tagsMenu);
							menu.add(tagsMenuButton);
						}
					}
				}
			}
			
			var buttonMenu = new qx.ui.form.MenuButton(tr('Actions'), "index.php?extern=/images/arrowPlace2.png", menu);
			buttonMenu.set({
				backgroundColor: '#E5E5E5',
				textColor: '#666666',
				decorator: new qx.ui.decoration.RoundBorderBeveled('#9A9A9A', null, 1, 5, 5, 5, 5),
				iconPosition: 'right',
				marginLeft: 40,
				marginTop: 5,
				marginBottom: 5,
				enabled: false
			});
			buttonMenu.addListener('mouseover', function() {
				this._setActionsStatus();
			}, this);
			
			return buttonMenu;
		},
		
		/*
		 * Delete Contantacts on multiple selection
		 */
		deleteContacts: function () {
			var op = new eyeos.dialogs.OptionPane(
				tr('Are you sure you want to delete these contacts?'),
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(null, tr('Delete Contacts'), function (answer) {
				if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
					this.__contacts = this._layoutItems.getChildren();
					for (var i = 0; i < this.__contacts.length; ++i){
						if (this.__contacts[i] instanceof eyeos.ui.tabs.ContactAll && this.__contacts[i].isSelected()) {
							eyeos.callMessage(this.getChecknum(), 'removeContact', this.__contacts[i].getId(), function (results) {
								this.__contacts[i].destroy();
							}, this);
						}
					}
					//This should NOT be necessary, but for some reasons the contacts is not destroyed
					this.populateLayoutItem();
				}
			},
			this, true
			).open();
		},
		/**
		 * This function open a Window for the creation of a new Group
		 */
		createNewGroup: function () {
			document.eyeDesktopTabs.hideContent();
             var newWindow = new eyeos.ui.tabs.NewGroupWindow(this.getChecknum());

			var bus = eyeos.messageBus.getInstance();
			bus.addListener('eyeos_groups_newGroupWindowDone', function() {
				document.eyeDesktopTabs.showContent();
				var group = document.eyeDesktopTabs.getChildren()[2];
				document.eyeDesktopTabs.setSelection([group]);
			});
		},
		
		/**
		 * Set tag to Selected items
		 *
		 * @params tagId {string}
		 */
		setTagToSelected: function(tagId, status) {
			var childrenList = this._layoutItems.getChildren();
			for (var i = 0; i < childrenList.length; ++i) {
				if (childrenList[i] instanceof eyeos.ui.tabs.ContactAll && childrenList[i].isSelected()) {
					if (status) {
						childrenList[i]._addTagToItem(tagId);
					}
					else {
						childrenList[i]._removeTagToItem(tagId);
					}
				}
			}
		},
		/**
		 *Create the Search Box
		 *
		 * @return {string} The Search Box
		 */
		_createSearchBox: function (){
			var searchComposite = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
				backgroundColor: '#FFFFFF',
				height: 26,
				maxHeight: 26,
				allowGrowX: false,
				allowGrowY: false,
				marginTop: 4,
				marginRight: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled('#9A9A9A', null, 1, 5, 5, 5, 5)
			});

			var searchClearIcon = new qx.ui.basic.Image('index.php?extern=images/showall.png').set({
				alignY: 'middle',
				alignX: 'center',
				paddingLeft: 0,
				paddingRight: 0
			});

			var searchTextField = new qx.ui.form.TextField().set({
				backgroundColor: '#FFFFFF',
				decorator: new qx.ui.decoration.RoundBorderBeveled('#FFFFFF', '#FFFFFF', 1, 5, 5, 5, 5),
				maxWidth: 200,
				width: 200,
				marginTop: 1,
				marginBottom: 1,
				marginLeft: 1,
				marginRight: 1,
				paddingRight: 23,
				font: new qx.bom.Font(11, ['Lucida Grande', 'Verdana']),
				value: tr('Search in All'),
				textColor: '#878787'
			});

			this._searchTextField = searchTextField;
			searchClearIcon.addListener('click', function (e) {
				this.showResultsSearch(searchTextField.getValue());
				this._searchTextField.resetValue();
				this._searchTextField.setTextColor('#878787');
				this._searchTextField.setValue(tr('Search'));
			}, this);

			searchTextField.addListener('focusin', function () {
				if ((searchTextField.getValue() == tr('Search in All')) ||
					(searchTextField.getValue() == tr('Search in the Eyeos Network'))) {
					searchTextField.setUserData('label', searchTextField.getValue());
					searchTextField.setValue('');
					searchTextField.setTextColor('#000000');
				}
			});

			searchTextField.addListener('focusout', function () {
				searchTextField.setValue(searchTextField.getUserData('label'));
				searchTextField.setTextColor('#878787');
			});

			
			searchTextField.addListener('click', function () {
				//searchTextField.selectAllText();
			});


			searchTextField.addListener("keyup", function(e){
				if(e.getKeyIdentifier() == "Enter") {
					this.showResultsSearch(searchTextField.getValue());
					//this._searchTextField.resetValue();
					this._searchTextField.setTextColor('#878787');
					//this._searchTextField.setValue(tr('Search'));
				}
			}, this);
	    
			searchComposite.add(searchTextField);
			searchComposite.add(searchClearIcon, {
				right: '2%',
				top : '15%'
			});
			return searchComposite;
		},
		
		/**
		 * Builds the "tag" toolbar
		 */
		populateTagToolbar: function () {		
			this._layoutTagToolbar.removeAll();

			if (this._page == tr('Applications')){
				this._populateTagToolbarApplications();
			}

			if (this._page == tr('People')){
				this._populateTagToolbarPeople();
			}

			if (this._page == tr('Groups')){
				this._populateTagToolbarGroups();
			}
		},
		
		_populateTagToolbarPeople: function() {
			var mainListsTitleBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(0).set({
				alignY: 'middle',
				alignX: 'right'
			})).set({
				backgroundColor: '#E0E0E0',
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5),
				height: 41,
				maxHeight: 41
			});
			var mainTitle = new qx.ui.basic.Label(tr('Lists')).set({
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				alignY: 'middle',
				margin: 10
			});

			mainListsTitleBox.add(mainTitle);
			this._layoutTagToolbar.add(mainListsTitleBox);
			var allList = new eyeos.ui.tabs.TagButton('All' + ' ' + this._page, 0, this.getChecknum(), this, false);
			this._layoutTagToolbar.add(allList);
			allList.select();

			if (this._context == 'All'){
				var recentList = new eyeos.ui.tabs.TagButton(tr('Recently Added'), -2, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(recentList);
			

				var pendingList = new eyeos.ui.tabs.TagButton(tr('Pending'), -1, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(pendingList);
				var pendingListRefreshFunction = function() {
					eyeos.contacts.ContactManager.getInstance().getAllContacts('pending', function (data) {
						if (data.length > 0) {
							pendingList.setLabel(tr('Pending') + ' (' + data.length + ')');
						} else {
							pendingList.setLabel(tr('Pending'));
						}
					}, this);
				};
				
				pendingListRefreshFunction.call(this);

				eyeos.messageBus.getInstance().addListener('eyeos_people_requestRelationship', pendingListRefreshFunction, this);
				eyeos.messageBus.getInstance().addListener('eyeos_people_confirmContact', pendingListRefreshFunction, this);
				eyeos.messageBus.getInstance().addListener('eyeos_people_deleteContact', pendingListRefreshFunction, this);
				eyeos.messageBus.getInstance().addListener('eyeos_people_deletePending', pendingListRefreshFunction, this);

				//Create Custom Lists
				var customListsTitleBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(0).set({
					alignY: 'middle',
					alignX: 'right'
				})).set({
					backgroundColor: '#E0E0E0',
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5),
					height: 41,
					maxHeight: 41
				});
				var customAuxBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
				var customTitle = new qx.ui.basic.Label(tr('My Lists')).set({
					font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
					alignY: 'middle',
					margin: 10
				});
				var customAddButton = new qx.ui.form.Button(null, 'index.php?extern=images/cross.png').set({
					padding : 3,
					marginRight: 10,
					allowGrowX: false,
					allowGrowY: false
				});

				customAuxBox.add(customTitle);
				customListsTitleBox.add(customAuxBox, {
					flex: 1
				});

				customListsTitleBox.add(customAddButton);
				//			customListsTitleBox.add(customTitle);
				//			customListsTitleBox.add(customAddButtom);

				this._layoutTagToolbar.add(customListsTitleBox, {
					flex : 1
				});

				// For every tag we create a "ToggleButton" containing the name and the id of the tag
				for (var i = 0; i < this._tags.length; ++i) {
					// Skip 'All' and 'Pending'
					if (this._tags[i].id > 0) {
						var item = new eyeos.ui.tabs.TagButton(this._tags[i].name, this._tags[i].id, this.getChecknum(), this, this._editable);
						// We use "setUserData" for comodity, it's built-in on qooxdoo
						item.setUserData("tag", this._tags[i].name);
						this._layoutTagToolbar.add(item);
					}
				}

				customAddButton.addListener('click', function(e) {
					this.createTag();
				}, this);
			}		
		},
		_populateTagToolbarApplications: function () {
			// Create Main Lists
			var mainListsTitleBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(0).set({
				alignY: 'middle',
				alignX: 'right'
			})).set({
				backgroundColor: '#E0E0E0',
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5),
				height: 41,
				maxHeight: 41
			});

			var mainTitle = new qx.ui.basic.Label(tr('Lists')).set({
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				alignY: 'middle',
				margin: 10
			});
			mainListsTitleBox.add(mainTitle);
			this._layoutTagToolbar.add(mainListsTitleBox);

			var allList = new eyeos.ui.tabs.TagButton(tr('All applications'), 0, this.getChecknum(), this, false);
			this._layoutTagToolbar.add(allList);

			allList.select();

			if (this._context == 'All') {
				var recentList = new eyeos.ui.tabs.TagButton(tr('Recently Added'), -2, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(recentList);
				
				var officeTagButton = new eyeos.ui.tabs.TagButton(tr('Office'), 'Office', this.getChecknum(), this, false);
				this._layoutTagToolbar.add(officeTagButton);
				
				var utilsTagButton = new eyeos.ui.tabs.TagButton(tr('Utils'), 'Utils', this.getChecknum(), this, false);
				this._layoutTagToolbar.add(utilsTagButton);
			}
		},

		_populateTagToolbarGroups: function () {
			this._layoutTagToolbar.removeAll();
			// Create Main Lists
			var mainListsTitleBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(0).set({
				alignY: 'middle',
				alignX: 'right'
			})).set({
				backgroundColor: '#E0E0E0',
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5),
				height: 41,
				maxHeight: 41
			});

			var mainTitle = new qx.ui.basic.Label(tr('Lists')).set({
				font: new qx.bom.Font(14, ['Lucida Grande', 'Verdana']),
				alignY: 'middle',
				margin: 10
			});
			mainListsTitleBox.add(mainTitle);
			this._layoutTagToolbar.add(mainListsTitleBox);

			if (this._context == 'All') {
				var allGroupsTagB = new eyeos.ui.tabs.TagButton(tr('Groups') + ' ', -1, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(allGroupsTagB);
				allGroupsTagB.select();

				var OwnerTagB = new eyeos.ui.tabs.TagButton(tr('Owner'), 0, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(OwnerTagB);

				var AdminTagB = new eyeos.ui.tabs.TagButton(tr('Admin'), 1, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(AdminTagB);

				var EditorTabB = new eyeos.ui.tabs.TagButton(tr('Editor'), 2, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(EditorTabB);

				var MemberTabB = new eyeos.ui.tabs.TagButton(tr('Viewer'), 3, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(MemberTabB);
			} else {
				var allGroupsTagB = new eyeos.ui.tabs.TagButton(tr('All results') + ' ', -1, this.getChecknum(), this, false);
				this._layoutTagToolbar.add(allGroupsTagB);
				allGroupsTagB.select();
			}
		},


		/**
		 * Populate the Layout with Items depending on context and page
		 *
		 */
		populateLayoutItem: function() {
			if (this._layoutItems.hasChildren()) {
				this._layoutItems.removeAll();
			}

			this._showChargingImage();

			if (this._page == tr('People') && this._context == 'All'){
				var contactManager = eyeos.contacts.ContactManager.getInstance();
				contactManager.getAllContacts('accepted', function(results){;
					this._destroyChargingImage();
                                        
					if (results.length > 0) {
						for (var i = 0; i < results.length; ++i) {
							var contact = new eyeos.ui.tabs.ContactAll(results[i], this);
							this._layoutItems.add(contact);
						}
					} else {
                                                this._layoutItems.addListener("appear",function() {
                                                    if(!this.labelPeople) {
                                                        var width = this._layoutItems.getBounds() != null ? this._layoutItems.getBounds().width : 0;
                                                        this.labelPeople = new qx.ui.basic.Label().set({
                                                                value: '<b>' + tr('The People tab is still empty') + '</b>.<br><span style="font-size: 13px;">' + tr('At this time you don\'t have any contacts in your eyeOS network. Go to "Add Contacts", look for them and start increasing your network today.') + '</span>',
                                                                rich : true,
                                                                width: 400,
                                                                textColor: '#8E8E8E',
                                                                marginLeft: Math.round((width / 2) - 200),
                                                                textAlign: 'center',
                                                                marginTop: 30,
                                                                font: new qx.bom.Font(16, ['Lucida Grande', 'Verdana'])
                                                        });
                                                        this._layoutItems.add(this.labelPeople);
                                                    }
                                                }, this);
					}
				}, this);
			//				eyeos.callMessage(this._checknum, 'getAllContacts', null, function (results) {
			//					this._destroyChargingImage();
			//					for (var i = 0; i < results.length; ++i) {
			//						var contact = new eyeos.ui.tabs.ContactAll(
			//						results[i].userName,
			//						results[i].userId,
			//						results[i].listsName,
			//						results[i].lists,
			//						this
			//					);
			//
			//						this._layoutItems.add(contact);
			//					}
			//				}, this);
			}

			if (this._page == tr('People') && this._context == 'Add'){
				this._destroyChargingImage();
			//				eyeos.callMessage(this._checknum, 'searchPeople', '', function (results) {
			//					for (var i = 0; i < results.length; ++i) {
			//						var contact = new eyeos.ui.tabs.ContactAdd(
			//						results[i].realName,
			//						results[i].userId,
			//						results[i].description,
			//						this
			//					);
			//						this._layoutItems.add(contact);
			//					}
			//				}, this);
			}

			if (this._page == tr('Applications') && this._context == 'All'){
                                //modified to stackable
				eyeos.callMessage(this._checknum, 'getAllInstalledApplications', null, function (applicationItems) {
					this._destroyChargingImage();
					if (applicationItems.length > 0) {
						for (var i = 0; i < applicationItems.length; ++i) {
							if(applicationItems[i].listable == 1) {
								var app = new eyeos.ui.tabs.Application(
									applicationItems[i].displayName,
									applicationItems[i].app,
									applicationItems[i].shortDescription,
									applicationItems[i].image,
									applicationItems[i].favorite,
									this
									);

								var self = this;
								app.addListener('toggleFavorite', function(e) {
									var bus = eyeos.messageBus.getInstance();
									bus.send('application', 'toggleFavorite', [this.getName(), this.getRealName(), this.getFavorite(), this.getImagePath()]);
								//self.fireDataEvent('toggleFavorite', [this.getRealName(), this.getFavorite()]);
								});

								this._layoutItems.add(app);
							}
						}
					}
					else {
						var width = this._layoutItems.getBounds() != null ? this._layoutItems.getBounds().width : 0;
						var label = new qx.ui.basic.Label().set({
							value: '<b>' + tr('There are not applications installed') + '</b>.<br><span style="font-size: 13px;">' + tr('To add one, please, go to the “Add Aplications” tab and press the + button. Enjoy!') + '</span>',
							rich : true,
							width: 400,
							textColor: '#8E8E8E',
							marginLeft: Math.round((width / 2) - 200),
							textAlign: 'center',
							marginTop: 30,
							font: new qx.bom.Font(16, ['Lucida Grande', 'Verdana'])
						});
						this._layoutItems.add(label);
					}
					
				}, this);
			}

			if (this._page == tr('Applications') && this._context == 'Add') {
				eyeos.callMessage(this._checknum, 'getAllApplications', null, function (applicationItems) {
					this._destroyChargingImage();
					
					for (var i = 0; i < applicationItems.length; ++i) {
						if (applicationItems[i].listable == 1) {
							var app = new eyeos.ui.tabs.Application(
								applicationItems[i].displayName,
								applicationItems[i].app,
								applicationItems[i].shortDescription,
								applicationItems[i].image,
								applicationItems[i].installed,
								this
								);

							this._layoutItems.add(app);
						}
					}
					

				}, this);
			}

			if (this._page == tr('Groups') && this._context == 'All'){
                                //modified to stackable
				eyeos.callMessage(this._checknum, '__Workgroups_getAllWorkgroupsByUser', {
					includeMeta: 'true'
				}, function (groups) {
					this._destroyChargingImage();
					if (groups.length > 0) {
						for (var i = 0; i < groups.length; ++i) {
							var group = new eyeos.ui.tabs.GroupAll(
								groups[i]['workgroup'].name,
								groups[i]['workgroup'].id,
								groups[i]['workgroup']['metadata']['eyeos.workgroup.description'],
								groups[i].status,
								groups[i].role,
								groups[i]['workgroup'].privacyMode,
								groups[i]['workgroup']['metadata']['eyeos.workgroup.tags'],
								this
								);
							this._layoutItems.add(group);
						}
					} else {
                                            this._layoutItems.addListener("appear",function() {
                                                if(!this.labelGroup) {
                                                    var width = this._layoutItems.getBounds() != null ? this._layoutItems.getBounds().width : 0

                                                    this.labelGroup = new qx.ui.basic.Label().set({
                                                            value: '<b>' + tr('The Groups tab is still empty') + '</b>.<br><span style="font-size: 13px;">' + tr('You are not inside any eyeOS group. You can create a new group to share files with your contacts or join any Open group from the "Add Groups" section.') + '</span>',
                                                            rich : true,
                                                            width: 400,
                                                            textColor: '#8E8E8E',
                                                            marginLeft: Math.round((width / 2) - 200),
                                                            textAlign: 'center',
                                                            marginTop: 30,
                                                            font: new qx.bom.Font(16, ['Lucida Grande', 'Verdana'])
                                                    });
                                                    this._layoutItems.add(this.labelGroup);
                                                }
                                            }, this);
					}
				}, this);
			}

			if (this._page == tr('Groups') && this._context == 'Add'){
				eyeos.callMessage(this._checknum, 'getCurrentUserId', null, function (myId) {
					eyeos.callMessage(this._checknum, '__Workgroups_getAllWorkgroups', {
						includeMeta: 'true'
					}, function (groups) {
						this._destroyChargingImage();
						for (var i = 0; i < groups.length; ++i) {
							if ((groups[i]['workgroup'].privacyMode != eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION)
								&& (groups[i].status == eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER)
								&& (groups[i]['workgroup'].ownerId) != myId){
								var group = new eyeos.ui.tabs.GroupAdd(
									groups[i]['workgroup'].name,
									groups[i]['workgroup']['metadata']['eyeos.workgroup.description'],
									groups[i]['workgroup'].id,
									groups[i].status,
									groups[i].role,
									groups[i]['workgroup'].privacyMode,
									groups[i]['workgroup']['metadata']['eyeos.workgroup.tags'],
									this
									);
								this._layoutItems.add(group);
							}
						}
					}, this);
				}, this);
			}
			
		},

		
		_showChargingImage: function () {
			if (this._layoutItems.getBounds()){
				if (this._imageCharging == null) {
					var width = this._layoutItems.getBounds() != null ? this._layoutItems.getBounds().width : 0;
					var height = this._layoutItems.getBounds() != null ? this._layoutItems.getBounds().height : 0;
					this._imageCharging = new qx.ui.basic.Image('index.php?extern=images/loading.gif').set({
						marginLeft: Math.round((width / 2) - 16),
						marginTop: Math.round((height / 2) - 16)
					});
				}
				
				this._layoutItems.add(this._imageCharging);

			}
		},
		
		_destroyChargingImage: function () {
			if (this._layoutItems.getBounds() && this._imageCharging != null){
				this._layoutItems.removeAll();
			}
		},
		
		/**
		 * Create a new Tag/Category
		 */
		createTag: function () {

			// We throw a simple dialog to fill with the future "tag"
			//var inputDialog = new eyeos.dialogs.Input("Create new tag", "Please type the name of the tag that you want to add");
			
			// If the user clicks "Accept" the confirmTrue will be activated
			//	    inputDialog.addListener("confirmTrue", function (e) {
			//		eyeos.callMessage(this.getChecknum(), "createTag", e.getData(), function (results) {
			//		    // TODO (Results return an array of objects but it's just one result
			//		    var tagToAdd = {
			//			id: results[0].id,
			//			userId: results[0].userId,
			//			name: results[0].name
			//		    };
			//		    this._tags.push(tagToAdd);
			//		    var item = new eyeos.ui.tabs.TagButton(tagToAdd.name, tagToAdd.id, this.getChecknum(), this, this._editable);
			//		    // We use "setUserData" for comodity, it's built-in on qooxdoo
			//		    item.setUserData("tag", tagToAdd.name);
			//		    this._layoutTagToolbar.add(item);
			//		}, this);
			//	    }, this);

			eyeos.callMessage(this.getChecknum(), "createTag", '', function (results) {
				// TODO (Results return an array of objects but it's just one result
				var tagToAdd = {
					id: '' + results[0].id + '',
					userId: results[0].userId,
					name: results[0].name
				};
				this._tags.push(tagToAdd);
				
				var item = new eyeos.ui.tabs.TagButton(tagToAdd.name, tagToAdd.id, this.getChecknum(), this, this._editable);
				// We use "setUserData" for comodity, it's built-in on qooxdoo
				item.setUserData("tag", tagToAdd.name);
				this._layoutTagToolbar.add(item);
				item.showEditionMode();
				
				//Update Contacts
				var allContacts = this._layoutItems.getChildren();
				for (var i = 0; i < allContacts.length; ++i) {
					if (allContacts[i] instanceof eyeos.ui.tabs.Item) {
						allContacts[i].updateMenu();
					}
				}
				
				//Send Event to Event Framework
				var event = new eyeos.events.Event({
					type: 'People_CreatedList',
					eventData: results[0].id
				});
				var eventJson = eyeos.events.Event.toJson(event);
				eyeos.callMessage(this.getChecknum(), '__Events_sendEventByType', eventJson);
			}, this);

		},

		/**
		 * Filter Content results for Tag ID
		 *
		 * @param tagId {integer} The Id Value for the Tag/Category to filter
		 * */
		filterContentPerTag: function (tagId) {
			// Locate and select the "Tag" from the TagBar to show the one that's currently selected
			var childrenList = this._layoutTagToolbar.getChildren();
			for (var i = 0; i < childrenList.length; ++i) {
				if (childrenList[i] instanceof eyeos.ui.tabs.TagButton && childrenList[i].getId() == parseInt(tagId)) {
					childrenList[i].select();
					i = parseInt(childrenList.length + 1);
				}
			}
			this._selectedTag = tagId;
			switch (this._page) {
				case tr('Applications'):
					this._filterContentPerTagApplications(tagId);
					break;
				case tr('People'):
					this._filterContentPerTagPeople(tagId);
					break;
				case tr('Groups'):
					this._filterContentPerTagGroups(tagId);
					break;
				case tr('Events'):
					this._filterContentPerTagEvents(tagId);
					break;
			}
		},
		
		_filterContentPerTagApplications: function (tagId) {
			this._layoutItems.removeAll();
			if (tagId == 0){
				this.populateLayoutItem();
			} else 	if (tagId == -2){
				eyeos.callMessage(this._checknum, 'getAllRecentlyInstalledApplications', null, function(apps) {
					//Make Visible Recent Applications
					if (apps && apps.length) {
						for (var i = 0; i < apps.length; ++i){
							if(apps[i].listable == 1) {
								var app = new eyeos.ui.tabs.Application(
									apps[i].displayName,
									apps[i].app,
									apps[i].shortDescription,
									apps[i].image,
									apps[i].favorite,
									this
									);
								this._layoutItems.add(app);
							}
						}
					}
					
				}, this);
			} else {
				eyeos.callMessage(this._checknum, 'getAllApplications', {
					category: tagId
				}, function(apps) {
					for (var i = 0; i < apps.length; ++i){
						if(apps[i].listable == 1) {
							var app = new eyeos.ui.tabs.Application(
								apps[i].displayName,
								apps[i].app,
								apps[i].shortDescription,
								apps[i].image,
								apps[i].favorite,
								this
								);
							this._layoutItems.add(app);
						}
					}
				}, this);

			}
		},
		
		_filterContentPerTagPeople: function (tagId) {
			if ((this._needToRefreshLayoutItem == true)
				&& (tagId != -1)
				&& (tagId != -2)){
				
				this._layoutItems.removeAll();
				var contactManager = eyeos.contacts.ContactManager.getInstance();
				contactManager.getAllContacts('accepted', function(results){
					for (var i = 0; i < results.length; ++i) {
						var contact = new eyeos.ui.tabs.ContactAll(results[i], this);
						this._layoutItems.add(contact);
					}
					this._needToRefreshLayoutItem = false;
				}, this);
			//				eyeos.callMessage(this._checknum, 'getAllContacts', null, function (results) {
			//					for (var i = 0; i < results.length; ++i) {
			//						var contact = new eyeos.ui.tabs.ContactAll(
			//						results[i].userName,
			//						results[i].userId,
			//						results[i].listsName,
			//						results[i].lists,
			//						this
			//					);
			//
			//					this._layoutItems.add(contact);
			//					}
			//					this._needToRefreshLayoutItem = false;
			//				}, this);
			}

			if (tagId == 0 && this._needToRefreshLayoutItem == false){
				var allApps = this._layoutItems.getChildren();
				for (var i = 0; i < allApps.length; ++i) {
					allApps[i].setVisibility('visible');
				}
			}
			
			if (tagId == -1) {
				this._layoutItems.removeAll();
				eyeos.contacts.ContactManager.getInstance().getAllContacts('pending', function(results){
					for (var i = 0; i < results.length; ++i) {
						var contact = new eyeos.ui.tabs.ContactPending(results[i], this);
						this._layoutItems.add(contact);
					}
					this._needToRefreshLayoutItem = true;
				}, this);
			}
			if (tagId == -2) {
				this._layoutItems.removeAll();
				eyeos.contacts.ContactManager.getInstance().getRecentlyAddedContacts(2, function(results){
					for (var i = 0; i < results.length; ++i) {
						var contact = new eyeos.ui.tabs.ContactAll(results[i], this);
						this._layoutItems.add(contact);
					}
					this._needToRefreshLayoutItem = true;
				}, this);
			}

			if ((tagId != 0) && (tagId != -1) && (tagId != -2)){
				var childrenList = this._layoutItems.getChildren();
				for (var i = 0; i < childrenList.length; ++i) {
					var itemsLists = childrenList[i].getTags();
					if (itemsLists != null){
						if (itemsLists.indexOf(tagId) != -1) {
							childrenList[i].setVisibility('visible');
						} else {
							childrenList[i].setVisibility('excluded');
						}
					}
				}
			}
			
		},
		_filterContentPerTagGroups: function (tagId) {
			var allGroups = this._layoutItems.getChildren();
			var i = 0;

			if (tagId == -1) { //show all
				for (i = 0; i < allGroups.length; ++i) {
					allGroups[i].setVisibility('visible');
				}
			} else { //Filter by tag
				for (i = 0; i < allGroups.length; ++i) {
					if(allGroups[i] instanceof eyeos.ui.tabs.GroupAll) {
						var itemsId = allGroups[i].getRole();

						if (itemsId != null){
							if (itemsId == tagId) {
								allGroups[i].setVisibility('visible');
							} else {
								allGroups[i].setVisibility('excluded');
							}
						}
					}

				}
			}
		},
		_filterContentPerTagEvents: function (tagId) {
			
		},

		/**
		 * Remove the Tag/Category using tagId
		 *
		 * @params tagId {integer} The Id Value for the Tag/Category to delete
		 */
		deleteTag: function (tagId) {
			// We locate the tag to get the name
			var name = null;
			for (var i = 0; i < this._tags.length; ++i) {
				if (this._tags[i].id == tagId) {
					name = this._tags[i].name;
				}
			}

			// Confirming that the tag should be really removed
			var op = new eyeos.dialogs.OptionPane(
				tr('Are you sure that you want to delete the list') + ' ' + name + '?',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(null, tr('Delete list'), function (answer) {
				if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
					// Locate and destroy the TagButton
					this._removeTag(tagId, name);
				}
			},
			this, true
			).open();
		},

		_removeTag: function (tagId, tagName) {
			eyeos.callMessage(this._checknum, "removeTag", tagId, function () {
				var i = 0;
				// Delete the TagButton
				var childrenList = this._layoutTagToolbar.getChildren();
				for (i = 0; i < childrenList.length; ++i) {
					if ((childrenList[i] instanceof eyeos.ui.tabs.TagButton) && (childrenList[i].getId() == tagId))  {
						this._layoutTagToolbar.remove(childrenList[i]);
						break;
					}
				}

				// Locate and hide the items that contained that tag
				var contactList = this._layoutItems.getChildren();
				for (i = 0; i < contactList.length; ++i) {
					if (contactList[i] instanceof eyeos.ui.tabs.Item){
						if (contactList[i].getTags().indexOf(tagId) != -1){
							contactList[i]._removeTagToItem(tagId);
						}
					}
				}

				//Update Tags Page
				var tagsPage = this.getTags();
				for (i = 0; i < tagsPage.length; ++i) {
					if (tagsPage[i].id == tagId){
						var posToDelete = i;
					}
				}
				tagsPage.splice(posToDelete, 1);
				this.setTags(tagsPage);

				//Update Action Toolbar
				this.populateActionToolbar();
				
				//Send Event to Event Framework
				var event = new eyeos.events.Event({
					type: 'People_DeletedList',
					eventData: {
						listId: parseInt(tagId),
						listName: tagName
					}
				});
				var eventJson = eyeos.events.Event.toJson(event);
				eyeos.callMessage(this._checknum, '__Events_sendEventByType', eventJson);
			}, this);
		},


		/**
		 * Show Results of the Search giving an input string
		 *
		 * @params input {string} The pattern of the search
		 * 
		 */
		showResultsSearch: function(input) {
			switch (this._page){
				case tr('People'):
					this._showResultsPeople(input);
					break
				case tr('Applications'):
					this._showResultsApplications(input);
					break
				case tr('Groups'):
					this._showResultsGroups(input);
					break
			}
		},

		/**
		 * Show Results of the Search omn People Tabs giving an input string
		 *
		 * @params input {string} The pattern of the search
		 *
		 */
		_showResultsPeople: function(input) {
			if (this._context == 'All'){
				this._layoutItems.removeAll();
				this._showChargingImage();
				var contactManager = eyeos.contacts.ContactManager.getInstance();
				contactManager.searchContactsByName(input, function(results){
					this._destroyChargingImage();
					if (results.length > 0) {
						for (var i = 0; i < results.length; ++i) {
							if (results[i].getState() == 'accepted') {
								var contact = new eyeos.ui.tabs.ContactAll(results[i], this);
								this._layoutItems.add(contact);
							}
						}
					} else {
						/* !!!TODO Need to Change the Graphics */
						var labelNoResults = new qx.ui.basic.Label().set({
							alignX: "left",
							value: tr("Sorry, no results"),
							marginTop: 15
						});
						this._layoutItems.add(labelNoResults);
					}

				}, this);
			}

			if (this._context == 'Add'){
				this._layoutItems.removeAll();
				this._showChargingImage();
				eyeos.callMessage(this._checknum, 'searchPeople', input, function (results) {
					this._destroyChargingImage();
					if (results.length > 0){
						for (var i = 0; i < results.length; ++i) {
							var contact = new eyeos.ui.tabs.ContactAdd(
								results[i].realName,
								results[i].userId,
								results[i].description,
								this,
								results[i].state
								);
							this._layoutItems.add(contact);
						}
					}else {
						var labelNoResults = new qx.ui.basic.Label().set({
							alignX: "left",
							value: tr("Sorry, no results"),
							marginTop: 15
						});
						this._layoutItems.add(labelNoResults);
					}
				}, this);
			}

		//			this._searchTextField.resetValue();
		//			this._searchTextField.setTextColor('#878787');
		//			this._searchTextField.setValue(tr('Search'));
	    
		},

		/**
		 * Show Results of the Search on Applications Tabs giving an input string
		 *
		 * @params input {string} The pattern of the search
		 *
		 */
		_showResultsApplications: function (input){
			if (this._context == 'Add'){
				this._layoutItems.removeAll();
				this._showChargingImage();
				eyeos.callMessage(this._checknum, 'searchApplication', input, function (applicationItems){
					this._destroyChargingImage();
					if (applicationItems.length > 0) {
						//i need list of contacts, for hide in the search results
						for (var i = 0; i < applicationItems.length; ++i) {
							if (applicationItems[i].listable == 1) {
								var app = new eyeos.ui.tabs.Application(
									applicationItems[i].displayName,
									applicationItems[i].app,
									applicationItems[i].shortDescription,
									applicationItems[i].image,
									applicationItems[i].installed,
									this
									);
								this._layoutItems.add(app);
							}
						}
					} else {
						/* !!!TODO Need to Change the Graphics */
						var labelNoResults = new qx.ui.basic.Label().set({
							alignX: "left",
							value: tr("Sorry, no results"),
							marginTop: 15
						});
						this._layoutItems.add(labelNoResults);
					}
				}, this);
			}

			if (this._context == 'All'){
				this._layoutItems.removeAll();
				this._showChargingImage();
				eyeos.callMessage(this._checknum, 'searchApplication', input, function (applicationItems){
					this._destroyChargingImage();
					if (applicationItems.length > 0) {
						//i need list of contacts, for hide in the search results
						for (var i = 0; i < applicationItems.length; ++i) {
							if (applicationItems[i].listable == 1 && applicationItems[i].installed == 1) {
								var app = new eyeos.ui.tabs.Application(
									applicationItems[i].displayName,
									applicationItems[i].app,
									applicationItems[i].shortDescription,
									applicationItems[i].image,
									applicationItems[i].installed,
									this
									);
								this._layoutItems.add(app);
							}
						}
					} else {
						var labelNoResults = new qx.ui.basic.Label().set({
							alignX: "left",
							value: tr("Sorry, no results"),
							marginTop: 15
						});
						this._layoutItems.add(labelNoResults);
					}
				}, this);
			}

		//			this._searchTextField.resetValue();
		//			this._searchTextField.setTextColor('#878787');
		//			this._searchTextField.setValue(tr('Search'));
	    
		},
		
		_showResultsGroups: function (input) {
			if (this._context == 'All'){
				this._layoutItems.removeAll();
				this._showChargingImage();
				eyeos.callMessage(this._checknum, 'getCurrentUserId', null, function (myId) {
					eyeos.callMessage(this._checknum, '__Workgroups_searchWorkgroups', {
						userId: myId,
						pattern: input
					}, function (groups) {
						this._destroyChargingImage();
						if(groups.length > 0) {
							for (var i = 0; i < groups.length; ++i) {
								var group = new eyeos.ui.tabs.GroupAll(
									groups[i]['workgroup'].name,
									groups[i]['workgroup'].id,
									groups[i]['workgroup']['metadata']['eyeos.workgroup.description'],
									groups[i].status,
									groups[i].role,
									groups[i]['workgroup'].privacyMode,
									groups[i]['workgroup']['metadata']['eyeos.workgroup.tags'],
									this
									);
								this._layoutItems.add(group);
							}
						} else {
							var labelNoResults = new qx.ui.basic.Label().set({
								alignX: "left",
								value: tr("Sorry, no results"),
								marginTop: 15
							});
							this._layoutItems.add(labelNoResults);
						}
					}, this);
				}, this);
			} else {
				this._layoutItems.removeAll();
				this._showChargingImage();
				eyeos.callMessage(this._checknum, 'getCurrentUserId', null, function (myId) {
					eyeos.callMessage(this._checknum, '__Workgroups_searchWorkgroups', {
						pattern: input
					}, function (groups) {
						this._destroyChargingImage();
						if(groups.length > 0) {
							for (var i = 0; i < groups.length; ++i) {
								if ((groups[i]['workgroup'].privacyMode != eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION)
									&& (groups[i].status == eyeos.ui.tabs.GroupAll.STATUS_NOT_MEMBER)
									&& (groups[i]['workgroup'].ownerId) != myId){
									var group = new eyeos.ui.tabs.GroupAdd(
										groups[i]['workgroup'].name,
										groups[i]['workgroup']['metadata']['eyeos.workgroup.description'],
										groups[i]['workgroup'].id,
										groups[i].status,
										groups[i].role,
										groups[i]['workgroup'].privacyMode,
										groups[i]['workgroup']['metadata']['eyeos.workgroup.tags'],
										this
										);
									this._layoutItems.add(group);
								}
							}
						} else {
							var labelNoResults = new qx.ui.basic.Label().set({
								alignX: "left",
								value: tr("Sorry, no results"),
								marginTop: 15
							});
							this._layoutItems.add(labelNoResults);
						}
					}, this);
				}, this);
			}
		//			this._searchTextField.resetValue();
		//			this._searchTextField.setTextColor('#878787');
		//			this._searchTextField.setValue(tr('Search'));
		},

		/**
		 * Add contacts to Layout ignoring elements in filter array
		 *
		 * @params contacts {array} Contains the contacts to add
		 * @params filter	{array} Contacts the if of the contacts to filter
		 */
		__addContactsToLayout: function(contacts, filter){
			this._layoutItems.removeAll();
			for (var i = 0; i < contacts.length; ++i) {
				for (var j = 0; j < filter.length; ++j) {
					if (contacts[i].getName().indexOf(filter[j]) != -1){
						this._layoutItems.add(contacts[i]);
					}
				}
			}
		},

		/**
		 * Resets the previous selection of activeTagToolbarButton
		 */
		resetTagList: function () {
			//
			if (this._activeTagToolbarButton != null) {
				this._activeTagToolbarButton.unselect();
			}
		},

		getTagNameById: function (idTag) {
			var allTags = this.getTags();
			for (var i = 0; i < allTags.length; ++i) {
				if (allTags[i].id == idTag) {
					return allTags[i].name;
				}
			}
			return null;
		},
		
		getItemLayout: function () {
			return this._layoutItems;
		},
		
		setActions: function (actions) {
			this._actions = actions;
		},

		getActions: function () {
			return this._actions;
		},
		
		getTags: function () {
			return this._tags;
		},
		
		setTags: function (tags) {
			this._tags = tags
		},
		
		setChecknum: function (checknum) {
			this._checknum = checknum;
		},
		
		getChecknum: function () {
			return this._checknum;
		},

		getContext: function () {
			return this._context;
		}
	}
});
