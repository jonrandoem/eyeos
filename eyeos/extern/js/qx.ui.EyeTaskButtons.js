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

qx.Class.define('qx.ui.EyeTaskButton', {

	extend: qx.ui.form.ToggleButton,

	properties: {
		realAppName: {
			check: 'String'
		}
	},
	
	construct: function (label, realAppName) {
		arguments.callee.base.call(this, label);

		this.setLabel('<span style="color:#333333;font-family:Arial;font-weight:bold;font-size:12px">'+label+'</span>');
		this.setRealAppName(realAppName);

		this.getChildControl('label').set({
			rich: true,
			marginLeft: 15
		});
		
//
		// This disallows the focus on the button to avoid errors with relationated window focus.
		this.set({
			focusable: false,
			keepFocus: true,
	    	padding: 3,
	    	paddingRight: 5,
	    	height: 29,
	    	maxHeight: 29,
	    	alignY: 'middle',
	    	textColor: '#000000',
			minWidth: 130,
			center: false
		});

		// SHOULD BE CHANGED FOR A PROPERTY
		this._miniButtonState = false;

		this.setFont(new qx.bom.Font(11, ['Lucida Grande', 'Verdana']));
		//this.setIcon('index.php?extern=images/notebook.png');
				
		// BUTTON DECORATORS
		this._decoratorWindowActive = new qx.ui.decoration.RoundBorderBeveled().set({
			backgroundColor: '#e8f3f8',
			leftTopR: 5,
			rightTopR: 5,
			leftBottomR: 5,
			rightBottomR: 5,
			innerColor: '#24568e'
		});
		this._decoratorWindowInactive = new qx.ui.decoration.RoundBorderBeveled().set({
		    leftTopR: 5,
		   	rightTopR: 5,
		   	leftBottomR: 5,
		   	rightBottomR: 5,
		   	innerColor: '#6a96c8',
		   	backgroundColor: '#dadfe3'
		});
		this._decoratorWindowFavorite = new qx.ui.decoration.RoundBorderBeveled().set({
			leftTopR: 3,
			rightTopR: 3,
			leftBottomR: 3,
			rightBottomR: 3
		});
		this._decoratorWindowFavoriteOver = new qx.ui.decoration.RoundBorderBeveled().set({
		   	innerColor: '#9FB6D9',
		   	leftTopR: 3,
		   	rightTopR: 3,
		   	leftBottomR: 3,
		   	rightBottomR: 3
		});
				
//		// MINIBUTTON ARROW DECORATORS
//		this._decoratorWhiteNone = new qx.ui.decoration.RoundBorderBeveled().set({
//			leftTopR: 3,
//			rightTopR: 3,
//			leftBottomR: 3,
//			rightBottomR: 3,
//			backgroundImage: 'index.php?extern=images/ArrowWhite.png',
//			backgroundRepeat: 'no-repeat'
//		});
//		this._decoratorBlueNone = new qx.ui.decoration.RoundBorderBeveled().set({
//		   	leftTopR: 3,
//		   	rightTopR: 3,
//		   	leftBottomR: 3,
//		   	rightBottomR: 3,
//		   	backgroundImage: 'index.php?extern=images/ArrowBlue.png',
//		   	backgroundRepeat: 'no-repeat'
//		});
//		this._decoratorWhiteBlue = new qx.ui.decoration.RoundBorderBeveled().set({
//		    backgroundColor: '#5b85bc',
//		    leftTopR: 3,
//		    rightTopR: 3,
//		    leftBottomR: 3,
//		    rightBottomR: 3,
//		    backgroundImage: 'index.php?extern=images/ArrowWhite.png',
//		    backgroundRepeat: 'no-repeat'
//		});
//		this._decoratorWhiteLightBlue = new qx.ui.decoration.RoundBorderBeveled().set({
//		   	backgroundColor: '#9fc3e0',
//		   	leftTopR: 3,
//		   	rightTopR: 3,
//		   	leftBottomR: 3,
//		   	rightBottomR: 3,
//		   	backgroundImage: 'index.php?extern=images/ArrowWhite.png',
//		   	backgroundRepeat: 'no-repeat'
//		});
//		this._decoratorWhiteOrange = new qx.ui.decoration.RoundBorderBeveled().set({
//		   	backgroundColor: '#dc6d2c',
//		  	leftTopR: 3,
//		   	rightTopR: 3,
//		   	leftBottomR: 3,
//		   	rightBottomR: 3,
//		   	backgroundImage: 'index.php?extern=images/ArrowWhite.png',
//		   	backgroundRepeat: 'no-repeat'
//		});
			
//		this._addMenu();
	},
		
	members: {
		_miniButton: false,
		_miniButtonStyle: false,
		_miniButtonStyleOver: false,
		_eyeMenu: null,
			
//		_addMiniButtonListeners: function () {
//			var self = this;
//
//			this._miniButton.addListener('mouseout', function () {
//				this.set({decorator: self._miniButtonStyle});
//			});
//
//			this._miniButton.addListener('mouseover', function () {
//				this.set({decorator: self._miniButtonStyleOver});
//			});
//
//			this._miniButton.addListener('click', function (e) {
//				this._miniButtonState = true;
//				e.stopPropagation();
//			}, this);
//		},
				
//		_addMenu: function () {
//
//			/**
//			 * START HARDCODED PART (should be "objectized")
//			 */
//
//			// We add and execute the menu
//		    var dcMenuButton= new qx.ui.decoration.Background().set({
//		    	backgroundColor : '#ff0000'
//		    //	backgroundImage  :'index.php?extern=images/bgTaskBar.png',
//		    //	backgroundRepeat: 'scale'
//		    });
//			var eyeMenu = new qx.ui.menu.Menu();
//			var eyeMenuDecorator = new qx.ui.decoration.Single(1, 'solid', '#4F4F4F');
//			eyeMenu.set({
//				backgroundColor: '#FFFFFF',
//				decorator: eyeMenuDecorator,
//				position: 'top-right',
//				padding: 3,
//				textColor: '#4F4F4F',
//				shadow: null
//			});
//			var eyeButtonSettings = new qx.ui.menu.Button('Settings', 'index.php?extern=/images/16x16/actions/configure.png').set({backgroundColor: '#ffffff'});
//			eyeButtonSettings.addListener('execute', function (e) {
//				eyeos.alert('Not implemented yet...');
//			});
//			//eyeMenu.add(eyeButtonSettings);
//			eyeButtonSettings.addListener('mouseover', function () {
//				this.setDecorator(dcMenuButton);
//				this.setTextColor('#4f4f4f');
//				this.setBackgroundColor('#dedede');
//			});
//			eyeButtonSettings.addListener('mouseout', function () {
//				this.setTextColor('#4f4f4f');
//				this.setBackgroundColor('#ffffff');
//			});
//
//			var eyeButtonFavorite= new qx.ui.menu.Button('Toggle favorite', 'index.php?extern=/images/16x16/actions/rating.png').set({backgroundColor: '#ffffff'});
//			eyeButtonFavorite.addListener('execute', function (e) {
//				eyeos.alert('Not implemented yet...');
//			});
//			//eyeMenu.add(eyeButtonFavorite);
//			eyeButtonFavorite.addListener('mouseover', function () {
//				this.setDecorator(dcMenuButton);
//				this.setTextColor('#4f4f4f');
//				this.setBackgroundColor('#dedede')
//			});
//			eyeButtonFavorite.addListener('mouseout', function () {
//				this.setTextColor('#4f4f4f');
//				this.setBackgroundColor('#ffffff')
//			});
//
//			var eyeButtonClose= new qx.ui.menu.Button('Close', 'index.php?extern=/images/16x16/actions/application-exit.png').set({backgroundColor: '#ffffff'});
//			eyeButtonClose.addListener('execute', function (e) {
//				if (this._window instanceof eyeos.ui.Window) {
//					this._window.close();
//				}
//			}, this);
//
//			eyeMenu.add(eyeButtonClose);
//			eyeButtonClose.addListener('mouseover', function () {
//				this.setDecorator(dcMenuButton);
//				this.setTextColor('#4f4f4f');
//				this.setBackgroundColor('#dedede')
//			});
//			eyeButtonClose.addListener('mouseout', function () {
//				this.setTextColor('#4f4f4f');
//				this.setBackgroundColor('#ffffff')
//			});
//			var self = this;
//			eyeMenu.addListener('appear', function (e) {
//				self._miniButtonState = false;
//				var bounds = this.getBounds();
//				this.setUserBounds(bounds.left, parseInt(bounds.top - 8), bounds.width, bounds.height);
//			});
//
//			eyeMenu.addListener('disappear', function (e){
//				self._miniButtonState = false;
//				this.resetUserBounds();
//			});
//			//var layoutMiniButton = new qx.ui.layout.VBox(0);
//			//var miniButton = new qx.ui.form.Composite(layoutMiniButton);
//			var miniButton = new qx.ui.form.MenuButton('', null, eyeMenu);
//			this._eyeMenu = eyeMenu;
//			miniButton.set({
//				height: 21,
//				maxHeight: 21,
//				width: 17,
//				maxWidth: 17,
//				decorator: this._decoratorWhiteNone
//			});
//
//			/**
//			 * END OF HARDCODED PART
//			 */
//
//			this._miniButton = miniButton;
//			this._addMiniButtonListeners();
//			this._add(miniButton);
//
//			this.setContextMenu(eyeMenu);
//		},
		
		_buttonWithFocus: function () {
			this._miniButtonStyle = this._decoratorWhiteNone;
			this._miniButtonStyleOver = this._decoratorWhiteBlue;

			this.set({
				textColor: '#FFFFFF',
				decorator: this._decoratorWindowActive
			});
		},

		_buttonWithoutFocus: function () {
			this._miniButtonStyle = this._decoratorBlueNone;
			this._miniButtonStyleOver = this._decoratorWhiteLightBlue;

		    this.set({
		    	textColor: '#2a60ac',
		    	decorator: this._decoratorWindowInactive
		    });
		}
	}
});
		
qx.Class.define('qx.ui.EyeTaskButtonFavorite', {

	extend: qx.ui.EyeTaskButton,

	construct: function (label, realName, checknum) {
		arguments.callee.base.call(this, label, realName);
		this.setChecknum(checknum);
		this._buttonFavorite();
	},

	members: {
		_check: false,
		_checknum: null,
		_foo: false,

		_buttonFavorite: function () {

			// STYLING
			this._miniButtonStyle = this._decoratorBlueNone;
			this._miniButtonStyleOver = this._decoratorWhiteLightBlue;
			this._miniButton.set({decorator: this._miniButtonStyle});
			this.set({
				textColor: '#2a60ac',
				decorator: this._decoratorWindowFavorite
			});

			// LISTENERS
			var self = this;

			this.mouseoverid = this.addListener('mouseover', function (e) {
				this.set({decorator: self._decoratorWindowFavoriteOver});
			});

			this.mouseoutid = this.addListener('mouseout', function () {
				this.set({decorator: self._decoratorWindowFavorite})
			});

			this.clickid = this.addListener('click', function (e) {
				if (!this._miniButtonState || this._eyeMenu.getVisibility() != 'visible') {
					//FIXME: flag added to solve the "duplicating application" bug, we should improve the implementation of the taskbar!!!
					if(this._foo == false) {
						eyeos.execute(this.getRealAppName(), this.getChecknum());
						this._foo = true;
					}
				}
			}, this);
		},

		removeFavoriteState: function () {
			this.removeListenerById(this.clickid);
			this.removeListenerById(this.mouseoverid);
			this.removeListenerById(this.mouseoutid);
			this._miniButtonState = false;
		},

		setCheck: function (state) {
			this._check = state;
		},

		isCheck: function () {
			return this._check;
		},

		getChecknum: function () {
			return this._checknum;
		},

		setChecknum: function (checknum) {
			this._checknum = checknum;
		}
	}
});