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
 * Item is a class to create derived items, like contacts, applications and groups.
 * This class create the layout, and implement generic method, like setName, setDescription,
 * setImageCommand....
 *
 *
 * Example of Usage
 * item = new eyeos.socialbar.Item();
 * item.setName('Paolino Paperino');
 * item.setDescription('sono il nipote di Paperon de Paperoni');
 * item.setDescriptionTooltip('sono il nipote di Paperon de Paperoni');
 * item.setImage('index.php?extern=images/48x48/categories/applications-toys.png');
 */


qx.Class.define('eyeos.ui.tabs.Item', {
	extend: qx.ui.container.Composite,

	properties: {
		image: {
			check: 'String',
			apply: '_applyImage'
		},
		name: {
			check: 'String',
			apply: '_applyName'
		},
		nameTooltip: {
			check: 'String',
			apply: '_applyNameTooltip'
		},
		description: {
			check: 'String',
			apply: '_applyDescription'
		},
		descriptionTooltip: {
			check: 'String',
			apply: '_applyDescriptionTooltip'
		},
		descriptionImage: {
			check: 'String',
			apply: '_applyDescriptionImage'
		},
		imageCommand: {
			check: 'String',
			apply: '_applyImageCommandWidget'
		},
		imageCommandFunction: {
			check: 'Function',
			apply: '_applyImageCommandFunction'
		},
		page: {
			init: null
		},
		keepFocused: {
			check: 'Boolean',
			init: false
		},
		selected: {
			check: 'Boolean',
			init: false,
			event: 'changeSelected'
		}
	},

	construct: function () {
		this.base(arguments);

		this._buildGui();
		this._addListeners();
	},

	members: {
		_mainContent: null,
		_imageBox: null,
		_imageWidget: null,
		_nameLabel: null,
		_nameTooltip: null,
		_descriptionLabel: null,
		_descriptionTooltip: null,
		_descriptionImage: null,
		_commandBox: null,
		_imageCommandBox: null,
		_imageCommandWidget: null,
		_menuBox: null,
		_menuButton: null,
		_menuMenu: null,
		_borderDecoratorOver: new qx.ui.decoration.RoundBorderBeveled(null,'#CCCCCC', 1, 7, 7, 7, 7),
		_borderDecoratorOut: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 7, 7, 7, 7),
		_borderDecoratorSelected: new qx.ui.decoration.RoundBorderBeveled(null,'#0684C9', 1, 7, 7, 7, 7),
		_borderCommandBoxNormal: new qx.ui.decoration.Single(1, 'solid', '#B2B2B2' ).set({
			styleTop: null,
			styleBottom : null,
			styleRight : null
		}),
		_borderCommandBoxSelected: new qx.ui.decoration.Single(1, 'solid', '#0684C9' ).set({
			styleTop: null,
			styleBottom : null,
			styleRight : null
		}),
		_borderImageCommandBoxNormal: new qx.ui.decoration.Single(1, 'solid', '#B2B2B2' ).set({
			styleTop: null,
			styleLeft : null,
			styleRight : null
		}),
		_borderImageCommandBoxSelected: new qx.ui.decoration.Single(1, 'solid', '#0684C9' ).set({
			styleTop: null,
			styleLeft : null,
			styleRight : null
		}),
		
		/**
		 * Function for show an Item like an installed Item
		 */
		showAsAdded: function (image) {
			this._imageWidget.setOpacity(0.5);
			this._imageCommandWidget.setOpacity(0.5);
			if (image) {
				var myImage = new qx.ui.basic.Image(image);
				this._imageBox.add(myImage, {right: 0, bottom: 0});
			}
		},

		/**
		 * Function for show an Item like an unInstalled Item
		 */
		showAsNormal: function (image) {
			this._imageWidget.setOpacity(1);
			this._imageCommandWidget.setOpacity(1);
			if (this._imageBox.getChildren().length > 1) {
				var imageToDel = this._imageBox.getChildren()[1];
				imageToDel.destroy();
			}
		},

		/**
		 * Show the Item in selected mode or switch to normal
		 */
		toggleShowAsSelected: function () {
			if (this.isSelected()){
				if (this.hasListener('mouseover')){
					this.removeListener('mouseover', this._mouseOverFunction, this, false);
				}
				if (this.hasListener('mouseout')){
					this.removeListener('mouseout', this._mouseOutFunction, this, false);
				}
				if (this._menuMenu.hasListener('disappear')) {
					this._menuMenu.removeListener('disappear', this._disappearFunction, this, false);
					this._menuMenu.addListener('disappear', this._disappearSelectedFunction, this);
				}
				this.setDecorator(this._borderDecoratorSelected);
				this._commandBox.setDecorator(this._borderCommandBoxSelected);
				this._imageCommandBox.setDecorator(this._borderImageCommandBoxSelected);
				this._commandBox.setVisibility('visible');
			} else {
				if (!this.hasListener('mouseover')){
					this.addListener('mouseover', this._mouseOverFunction, this);
				}
				if (!this.hasListener('mouseout')){
					this.addListener('mouseout', this._mouseOutFunction, this);
				}
				if (this._menuMenu.hasListener('disappear')) {
					this._menuMenu.removeListener('disappear', this._disappearSelectedFunction, this, false);
					this._menuMenu.addListener('disappear', this._disappearFunction, this);
				}
				this.setDecorator(this._borderDecoratorOut);
				this._commandBox.setDecorator(this._borderCommandBoxNormal);
				this._imageCommandBox.setDecorator(this._borderImageCommandBoxNormal);
				this._commandBox.setVisibility('hidden');
			}
			if (this.getPage() != null) {
				this.getPage().fireEvent('changeSelection');
			}
			
			
		},
		
		/**
		 * Function that return the Main Content
		 */
		getContent: function () {
			return this._mainContent;
		},
		 
		/**
		 * Function that create the Layout of a Item
		 */
		_buildGui: function () {
			this.set({
				layout : new qx.ui.layout.HBox(),
				decorator: this._borderDecoratorOut,
				width: 242,
				height: 58,
				allowGrowX: false,
				allowGrowY: false,
				padding: 0
			});

			// This Box is needed just for the event click on the content of the box
			this._mainContent = new qx.ui.container.Composite().set({
				decorator: null,
				layout: new qx.ui.layout.HBox()
			});
			this.add(this._mainContent, {flex: 15});

			this._imageBox = new qx.ui.container.Composite().set({
				decorator: null,
				layout: new qx.ui.layout.Canvas(),
				width: 54,
				height: 54,
				allowGrowX: false,
				allowGrowY: false
			});
			this._mainContent.add(this._imageBox);
			
			this._imageWidget = new qx.ui.basic.Image('').set({
				width: 48,
				height: 48,
				allowGrowX: false,
				allowGrowY: false,
				margin: 3,
				scale: true
			});
			this._imageBox.add(this._imageWidget, {top: 0, left: 0});

			var infoBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				allowGrowX: true,
				height: 48,
				marginTop: 4,
				marginBottom: 4,
				paddingTop: 4,
				maxWidth: 160
			});
			this._mainContent.add(infoBox, {flex: 1});

			var nameLabel = new qx.ui.basic.Label('').set({
				textAlign: 'left',
				rich: true,
				font: new qx.bom.Font(14, ['Helvetica', 'Arial']),
				textColor: 'black'
			});
			infoBox.add(nameLabel);
			this._nameLabel = nameLabel;

			var descriptionBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'bottom'
				}),
				decorator: null
			});
			infoBox.add(descriptionBox, {flex: 1});
			
			var descriptionLabel = new qx.ui.basic.Label('').set({
				paddingTop: 10,
				textAlign: 'left',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				textColor: 'gray',
				maxWidth: 160
			});
			descriptionBox.add(descriptionLabel);
			this._descriptionLabel = descriptionLabel;

			this._descriptionImage = new qx.ui.basic.Image('').set({
				paddingBottom: 2,
				paddingLeft: 2
			});
			descriptionBox.add(this._descriptionImage);
			
			this._commandBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: this._borderCommandBoxNormal,
				width: 20,
				allowGrowX: false,
				paddingRight: -5,
				marginTop: -2,
				marginBottom: -2,
				visibility: 'hidden'
			});
			this.add(this._commandBox, {flex: 1});

			this._imageCommandBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				decorator: this._borderImageCommandBoxNormal
			});
			this._commandBox.add(this._imageCommandBox, {height: '50%'});

			this._imageCommandWidget = new qx.ui.basic.Atom().set({
				paddingLeft: 1,
				cursor: 'pointer'
			});
			this._imageCommandBox.add(this._imageCommandWidget, {flex: 1});

			var menuBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				decorator: null
			});
			this._commandBox.add(menuBox, {height: '50%'});
			this._menuBox = menuBox;

			var menuMenu = new qx.ui.menu.Menu().set({
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#B2B2B2', 1, 5, 5, 5, 5),
				textColor: '#4F4F4F',
				backgroundColor: '#FFFFFF'
			});

			 //FIXME: hack done 'cause we have no other soluction, qooxdoo has a really bad menu.Menu implementation, with no father and the application root as layoutParent !!!
			menuMenu.addListener('appear', function() {
				this.setZIndex(500002);
			});
			
			this._menuMenu = menuMenu;

			var menuButton = new qx.ui.basic.Atom(null, 'index.php?extern=images/arrowPeople.png').set({
				decorator: null,
				paddingLeft: 4,
				cursor: 'pointer'
			});
			menuButton.addListener('click', function(e) {
				menuMenu.placeToWidget(menuBox);
				menuMenu.show();
			});

			menuBox.add(menuButton, {flex: 1});
			this._menuButton = menuButton;
			
			this.setContextMenu(menuMenu);
		},

		getMenuButton: function() {
			return this._menuButton;
		},

		_addListeners: function () {
			this.addListener('mouseover', this._mouseOverFunction, this);
			this.addListener('mouseout', this._mouseOutFunction, this);
			
			this._menuMenu.addListener('appear', function (e) {
				this.setKeepFocused(true);
			}, this);
			
			this._menuMenu.addListener('disappear', this._disappearFunction, this);

		},

		_disappearFunction: function (e) {
			this.setDecorator(this._borderDecoratorOut);
			this._commandBox.setVisibility('hidden');
			this.setKeepFocused(false);
		},

		_disappearSelectedFunction: function (e) {
			if (!this.isSelected()) {
				this.setDecorator(this._borderDecoratorOut);
				this._commandBox.setVisibility('hidden');
			}
			this.setKeepFocused(false);
		},

//		// Generic Function to check if a div is parent of the other
//		is_child_of: function (parent, child) {
//			if( child != null ) {
//				while( child.parentNode ) {
//					if( (child = child.parentNode) == parent ) {
//						return true;
//					}
//				}
//			}
//			return false;
//		},

		_mouseOverFunction: function (e) {
			this.setDecorator(this._borderDecoratorOver);
			this._commandBox.setVisibility('visible');
		},

		_mouseOutFunction: function (event) {
			// !this.isKeepFocused() &&
			if(this.isKeepFocused()) {
				return;
			}

			if (!qx.ui.core.Widget.contains(this, event.getRelatedTarget())) {
					this.setDecorator(this._borderDecoratorOut);
					this._commandBox.setVisibility('hidden');
			}
		},

		/**
		 * Function to add a Menu Button to the Menu of CommandBox
		 */
		addToMenu: function (menuButton) {
			this._menuMenu.add(menuButton);
		},

		/**
		 * Function that clean the Menu so we can add new elemetns
		 */
		cleanMenu: function () {
			this._menuMenu.removeAll();
		},
		/**
		 * Function for set image properties
		 */
		_applyImage: function (newSrc, oldSrc) {
			this._imageWidget.setSource(newSrc);
		},
		
		/**
		 * Function for set name properties
		 */
		_applyName: function (newValue, oldValue) {
			var value = '<b>' + newValue + '</b>';
			this._nameLabel.setValue(value);
		},

		/**
		 * Function for set descriptionTooltip properties
		 * It create a new ToolTip and attach to Name Label
		 */
		_applyNameTooltip: function (newValue, oldValue) {
			this._nameTooltip = new qx.ui.tooltip.ToolTip(newValue).set({
				position: 'bottom-right',
				backgroundColor: '#FFFFFF',
				textColor: '#000000',
				rich: true
			});
			this._nameLabel.setToolTip(this._nameTooltip);
		},
		
		/**
		 * Function for set Description properties
		 */
		_applyDescription: function (newValue, oldValue) {
			this._descriptionLabel.setValue(newValue);
		},
		
		/**
		 * Function for set descriptionTooltip properties
		 * It create a new ToolTip and attach to description Label
		 */
		_applyDescriptionTooltip: function (newValue, oldValue) {
			if (this._descriptionTooltip != null) {
				this._descriptionTooltip.setLabel(newValue);
			} else {
				this._descriptionTooltip = new qx.ui.tooltip.ToolTip(newValue).set({
					//position: 'bottom-right',
					backgroundColor: '#FFFFFF',
					textColor: '#000000',
					rich: true,
					//opacity: 0.5,
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, 'gray', 0.5, 3, 3, 3, 3),
					//width: 200,
					allowGrowX: false,
					hideTimeout: 20000
				});
				this._descriptionLabel.setToolTip(this._descriptionTooltip);
				this._descriptionLabel.setCursor('pointer');
			}

		},
		/**
		 * Function for set image in the description
		 */
		_applyDescriptionImage: function (newSrc, oldSrc) {
			this._descriptionImage.setSource(newSrc);
		},
		
		/**
		 * Function for set imageCommand properties
		 */
		_applyImageCommandWidget: function (newSrc, oldSrc) {
			this._imageCommandWidget.setIcon(newSrc);
		},

		/**
		 * Function for set click Events for ImageCommandWidget
		 */
		_applyImageCommandFunction: function (newFunc, oldFunc) {
			if (this._imageCommandBox.hasListener('click')){
				this._imageCommandBox.removeListener('click', oldFunc, this, false);
			}
			this._imageCommandBox.addListener('click', newFunc, this);
		}, 
		
		cleanContentListener: function () {
			if (this.getContent().hasListener('click')) {
				this.getContent().removeListener('click', this._openShare, this);
			}
		}
	}
});