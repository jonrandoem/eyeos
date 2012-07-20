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

qx.Class.define('eyeos.socialbar.SharedBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,

	events: {
		/**
		 * Fired when a item should appear selected on the application
		 */
		selectItem: 'qx.event.type.Data',
		/**
		 * Fired when a item should appear deselected on the application
		 */
		unselectItem: 'qx.event.type.Data',
		/**
		 * Fired when an user change privilege
		 */
		changePrivilege: 'qx.event.type.Data',
		/**
		 * Fired when a item is not anymore share by a item
		 */
		deleteShare: 'qx.event.type.Data',
		/**
		 * Fired when shareWindow delete a share and the ShareBox need to delete
		 * the contacts/groups from list
		 */
		deleteItemFromLayout: 'qx.event.type.Data'
	},

	properties: {
		contacts: {
			init: new Array()
		},
		groups: {
			init: new Array()
		},
		shareds: {
			init: new Array()
		},
		checknum: {
			check: 'Integer'
		},
		name: {
			check: 'String',
			init: null
		},
		totalSharesUpdated: {
			check: 'Integer',
			init: 0
		},
		context: {
			check: ['People', 'Groups']
		}
	},

	construct: function (checknum, shareds) {
		this.base(arguments);
		this.setShareds(shareds);
		this.setChecknum(checknum);
		this._buildGui();
	},

	members: {
		_firstLayoutBox: null,
			_peopleContextButton: null,
			_groupsContextButton: null,
		
		_secondLayoutBox: null,
			_layoutSearchBox: null,
		
		_thirdLayoutBox: null,
			_layoutContentBox: null,
		_fourthLayoutBox: null,
			_buttonShare: null,
			_buttonCancel: null,
		
		/**
		 * Function for the creation of the Box
		 */
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				context: 'People',
				margin: 0,
				padding: 0
			});
			//this._createFirstLayoutBox();
			//FIXME: share with groups does not work yet, so we hide this functinality for the moment...
			this._createSecondLayoutBox();
			this._createThirdLayoutBox();
			this._createFourthLayoutBox();

			this._addListeners();
		},

		_addListeners: function () {
			this.addListener('_selectionChange', function () {
				this.__updateButtons();
			}, this);

			this._thirdLayoutBox.addListener('appear', function (e) {
				this._updateCanvasDimensions();
			}, this);

			this._thirdLayoutBox.addListener('resize', function (e) {
				this._updateCanvasDimensions();
			}, this);

			this.addListener('totalSharesUpdated', function (e) {
				this.setTotalSharesUpdated(e.getData());
			});

			var bus = eyeos.messageBus.getInstance();
			bus.addListener('eyeos_people_confirmContact', function(e) {
				if (this.getContext() == 'People') {
					this._populateContentBox();
				}
			}, this);
			
			bus.addListener('eyeos_people_deleteContact', function(e) {
				if (this.getContext() == 'People') {
					this._populateContentBox();
				}
			}, this);
		},

		_updateCanvasDimensions: function () {
			var bounds = this._thirdLayoutBox.getBounds();
			this._scroll.set({width: bounds.width, height: bounds.height});
			this._feedBackBox.set({width: bounds.width, height: bounds.height});
		},

		/**
		 * Create the first part of the Layout : the context Buttons :
		 * People and Groups
		 */
		_createFirstLayoutBox: function () {
			this._firstLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				padding: 5,
				allowGrowY: false
			});
			this.add(this._firstLayoutBox, {
				flex: 1
			});

			this._peopleContextButton = new eyeos.socialbar.ContextButton('People').set({
				marginRight: -2
			});
			this._firstLayoutBox.add(this._peopleContextButton, {
				width: '50%'
			});
			this._groupsContextButton = new eyeos.socialbar.ContextButton('Groups').set({
				marginLeft: -2
			});

			this._firstLayoutBox.add(this._groupsContextButton, {
				width: '50%'
			});

			this._peopleContextButton.addListener('changeContext', function (e) {
				this._groupsContextButton.changeContext();
				this.setContext('People');
				this._populateContentBox();
			}, this);

			this._groupsContextButton.addListener('changeContext', function (e) {
				this._peopleContextButton.changeContext();
				this.setContext('Groups');
				this._populateContentBox();
			}, this);

		},
		/**
		 * Create the second part of the Layout : the Search Box
		 */
		_createSecondLayoutBox: function () {
			this._auxBorder = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				height: 1,
				backgroundColor: '#A4A4A4'
			});
			this._auxBorder2 = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				height: 1,
				backgroundColor: '#86BADE'
			});
			this._secondLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				margin: 0,
				padding: 0
			});

			var searchInput = new qx.ui.form.TextField(tr('Search')).set({
				padding: 0,
				decorator: null,
				paddingTop: 3,
				paddingBottom: 3,
				paddingLeft: 3,
				margin: 0
			});

			searchInput.addListener('input', function (e) {
				var textValue = e.getValue();
				this._filterContentByName(textValue.toLowerCase());
			}, this);

			searchInput.addListener('focus', function (e) {
				this.setValue('');
			});
			this._secondLayoutBox.add(this._auxBorder, {flex: 1});
			this._secondLayoutBox.add(searchInput, {flex: 1});
			this._secondLayoutBox.add(this._auxBorder2, {flex: 1});
			this.add(this._secondLayoutBox);
		},

		_filterContentByName: function (filter) {
			if (this.getContext() == 'People') {
				var contacts = this._layoutContentBox.getChildren();
				for (var i = 0; i < contacts.length; ++i) {
					var isInListsName = false;
					for (var j = 0; j < contacts[i].getListsName().length; ++j){
						isInListsName = isInListsName
							|| (contacts[i].getListsName()[j].toLowerCase().indexOf(filter) != -1);
					}
					if (
						(contacts[i].getName().toLowerCase().indexOf(filter) != -1)
						|| isInListsName
						) {
						contacts[i].setVisibility('visible');
					} else {
						contacts[i].setVisibility('excluded');
					}
				}
			}
		},
		/**
		 * Create the Third part of the Layout where contacts or groups are showned
		 * depending of the context
		 */
		_createThirdLayoutBox: function () {
			this._thirdLayoutBox = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			this._feedBackBox = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({backgroundColor: '#F0F0F0', opacity: 0.5, width: 300, height: 300});
			this._feedBackImage = new qx.ui.basic.Image('index.php?extern=images/ajax-loader-1.gif');
			this._feedBackBox.add(this._feedBackImage, {left: '40%', top: '40%'});
			this._feedBackBox.setVisibility('excluded');
			this._scroll = new qx.ui.container.Scroll().set({allowGrowY: true});
			this._layoutContentBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				allowStretchY: true
			});
			this._scroll.add(this._layoutContentBox, {flex: 1});
			this._thirdLayoutBox.add(this._scroll, {flex: 1});
			this._thirdLayoutBox.add(this._feedBackBox);
			this.add(this._thirdLayoutBox, {flex: 1});
			this._populateContentBox();
		},

		_populateContentBox: function () {
			this._layoutContentBox.removeAll();
			if (this.getContext() == 'People') {
				this._populateContacts();
			} else {
				this._populateGroups();
			}
		},

//		showLoadingImage: function (value) {
//			if (value && this._feedBackBox.getVisibility() != 'visible') {
//				this._feedBackBox.setVisibility('visible');
//
//				qx.event.Timer.once(function () {
//					this._feedBackImage.setSource('index.php?extern=images/ok.gif');
//					qx.event.Timer.once(function () { this.showLoadingImage(false); }, this, 1500);
//				}, this, 2000);
//
//			} else if (!value && this._feedBackBox.getVisibility() == 'visible') {
//				this._feedBackImage.setSource('index.php?extern=images/ajax-loader-1.gif');
//				this._feedBackBox.setVisibility('excluded');
//			}
//		},

		showLoadingImage: function (value) {
			if (value && this._feedBackBox.getVisibility() != 'visible') {
				this._feedBackBox.setVisibility('visible');
			} else if (!value && this._feedBackBox.getVisibility() == 'visible') {
				this._feedBackImage.setSource('index.php?extern=images/ok.gif');
				qx.event.Timer.once(function () {
					this._feedBackImage.setSource('index.php?extern=images/ajax-loader-1.gif');
					this._feedBackBox.setVisibility('excluded');
					this.fireEvent('showLoadingImageDone');
				}, this, 2000);
			}
		},

		_populateContacts: function () {
			this._layoutContentBox._removeAll();
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.getAllContacts('accepted', function(results){
				for (var i = 0; i < results.length; ++i) {
					var myContact = results[i];
					var metadata = myContact.getMetadataInstance();
					var name = metadata.getMeta(['eyeos.user.firstname']) + ' ' + metadata.getMeta(['eyeos.user.lastname']);
					this._layoutContentBox.add(new eyeos.socialbar.SharedElement(
						this,
						name,
						myContact.getId(),
						myContact.getLists(),
						myContact.getListsName(),
						true,
						null
					));
				}
			}, this);
		},

		_populateGroups: function () {
			
		},
		/**
		 * Create the Fourth part of the Layout, the commands to share or cancel
		 */
		_createFourthLayoutBox: function () {
			this._fourthLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator : new qx.ui.decoration.Single(1, 'solid', '#86BADE'),
				backgroundColor: '#D9E5F4',
				padding: 5
			});
			this.add(this._fourthLayoutBox);

			var labelItems = new eyeos.socialbar.Label(tr('Sharing') + ' ' + this._createLabelItems(), 'sharedItems');
			this._fourthLayoutBox.add(labelItems);

			var buttonLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(5),
				decorator : null,
				marginTop: 5
			});
			this._fourthLayoutBox.add(buttonLayoutBox);
			this._buttonCancel = new qx.ui.form.Button(tr('Cancel')).set({
				enabled: false
			});
			buttonLayoutBox.add(this._buttonCancel);
			
			this._buttonShare = new qx.ui.form.Button(tr('Share')).set({
				enabled: false
			});
			buttonLayoutBox.add(this._buttonShare, {flex: 1});

			this._buttonCancel.addListener('execute', function (e) {
				//Deselect all items
				var items = this._layoutContentBox.getChildren();
				for (var i = 0; i < items.length; ++i) {
					if (items[i].isSelected()) {
						items[i].toggleSelectShare();
					}
				}
				//Disable Buttons
				this._buttonShare.setEnabled(false);
				this._buttonCancel.setEnabled(false);
			}, this);

			this._buttonShare.addListener('execute', function (e) {
				var items = this._layoutContentBox.getChildren();
				var selectedItems = new Array();

				for (var i = 0; i < items.length; ++i) {
					if (items[i].isSelected()){
						selectedItems.push(items[i].getId());
					}
				}

				var shareWindow = new eyeos.socialbar.ShareWindow(this, this.getShareds(), selectedItems);
				// When the Share windows is closed, deselect all the previous contacts
				shareWindow.addListener('close', function (e) {
					var items = this._layoutContentBox.getChildren();
					for (var i = 0; i < items.length; ++i) {
						if (items[i].isSelected()){
							items[i].toggleSelectShare();
						}
					}
				}, this);
			}, this);
		},

		_createLabelItems: function() {
			var shareds = this.getShareds();
			var returnString = '';
			if (shareds.length == 1){
				returnString = shareds[0].getObject();
			} else {
				returnString = '' + shareds.length + ' ' + tr('items');
			}
			return returnString;
		},

		__updateButtons: function () {
			var items = this._layoutContentBox.getChildren();
			for (var i = 0; i < items.length; ++i) {
				if (items[i].isSelected()){
					this._buttonShare.setEnabled(true);
					this._buttonCancel.setEnabled(true);
					return;
				}
			}
			this._buttonShare.setEnabled(false);
			this._buttonCancel.setEnabled(false);
		},

		deleteUserShare: function (id) {
//			Delete reference to this user in the internal Data structure
			var myShareds = this.getShareds();
			for (var i = 0; i < myShareds.length; ++i) {
					myShareds[i].deleteUser(id);
			}
			this.setShareds(myShareds);

			//FIRE EVENT
			this.fireDataEvent('deleteShare', id);
		},

		changeUserPrivilege: function (id, privilege) {
			//Update reference to this user in the internal Data structure
			var myShareds = this.getShareds();
			for (var i = 0; i < myShareds.length; ++i) {
				if (privilege == 'Viewer'){
					myShareds[i].addViewer(id);
				} else if (privilege == 'Editor') {
					myShareds[i].addEditor(id);
				}
			}
			this.setShareds(myShareds);

			//FIRE EVENT
			this.fireDataEvent('changePrivilege', [id, privilege]);
		},

		_updateBodyContent: function () {

		}
	}

});