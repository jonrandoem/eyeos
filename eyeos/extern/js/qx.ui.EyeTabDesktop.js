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
 * eyeos Tab desktop
 */
qx.Class.define('qx.ui.EyeTabDesktop', {
	'extend': qx.ui.tabview.TabView,
	'include' :
	[
	qx.ui.core.MResizable
	],
	
	'construct': function (barPosition) {
		arguments.callee.base.call(this, barPosition);
		//this.setBackgroundColor('red');
		this.setPaddingBottom(10);
		this.setResizableLeft(false);
		this.setResizableRight(false);
		this.setResizableTop(false);
		
		//we need to store 'this' into a local variable
		//to have it available in events anonymous functions
		var me = this;
		//this function hides the tabs if needed

		if(document.addEventListener) {
				document.addEventListener("click", function hideTabs(e) {
				if (e.target) e = e.target;

				if(e.parentNode) {
					//TODO: identify the father by other way, not the z-index, this is coupling :(!!!
					if(e.style.zIndex == 500002 || e.className == 'notHideTab') {
					//we have clicked inside top part, so we DO NOT HIDE
					} else {
						hideTabs(e.parentNode);
					}
				} else {
					//we have clicked outside the top part, so WE HIDE
					//getLayoutParent() is the composite that holds the tabview
					me.hideContent();
				}
			}, false)
		} else {
				document.attachEvent("onclick", function hideTabs(e) {
				if (!e) e = window.event;

				if (e.srcElement) e = e.srcElement;

				if(e.parentNode) {
					//TODO: identify the father by other way, not the z-index, this is coupling :(!!!
					if(e.style.zIndex == 500002 || e.className == 'notHideTab') {
					//we have clicked inside top part, so we DO NOT HIDE
					} else {
						hideTabs(e.parentNode);
					}
				} else {
					//we have clicked outside the top part, so WE HIDE
					//getLayoutParent() is the composite that holds the tabview
					me.hideContent();
				}
			}, false);

			
		};
	},
	'members': {	
		'setHeight' : function(height) {
			if(document.eyeScreen.getBounds().height - document.eyeTaskBar.getBounds().height < height) {
				height = document.eyeScreen.getBounds().height - document.eyeTaskBar.getBounds().height - 5;
			}
			var selectedButton = this.getSelection()[0];
			this.getLayoutParent().setMinHeight(height);
			this.getLayoutParent().getContainerElement().setStyle('height',height+'px');
			if (selectedButton) {
				this.oldSize[selectedButton.toHashCode()] = height+'px';
			}
                        
		},
		'hideContent': function () {
                        if(this.showedOnScreen == 1) {
                            this.resetSelection();
                            this.getLayoutParent().getContainerElement().setStyle('height','32px');
                            this.getLayoutParent().getContainerElement().setStyle('overflow','hidden');
                            this.showedOnScreen = 0;
                        }
		},
		'showContent' : function () {
                        var selectedButton = this.getSelection()[0];
                        if(selectedButton) {
                            this.getLayoutParent().getContainerElement().setStyle('height',this.oldSize[selectedButton.toHashCode()]);
                            var intLength = this.oldSize[selectedButton.toHashCode()].substr(0, this.oldSize[selectedButton.toHashCode()].length-2);
                            this.getLayoutParent().setMinHeight(parseInt(intLength));
                            this.showedOnScreen = 1;
                        }

		},
		'getSlide' : function() {
			//get all the childrens of tabView, we are looking for slideBar
			//that contains the buttons
			var childrens = this._getChildren();
		    
			//TODO: replace this for a instanceof
			//inside the tabview there is a slidebar in position 0
			var slide = childrens[0];
			return slide;
		},
		'getRadioButtons' : function() {
			var slide = this.getSlide();
			var childrens = slide.getChildren();
			var radios = new Array();
			for(var i = 0; i < childrens.length; ++i) {
				if(childrens[i] instanceof qx.ui.form.RadioButton) {
					radios.push(childrens[i]);
				}
			}
			return radios;
		},
		'getRadioGroup' : function () {
			var buttons = this.getRadioButtons();
			return buttons[0].getGroup();
		},
		'processTabs' : function () {
			//we need to store 'this' into a local variable
			//to have it available in events anonymous functions
			var me = this;

                        me.oldSize = new Object();
			
			var currentButton;
			var tabViewButtons = this.getRadioButtons();
		    
			//decorator rounded top borders
			var decoratorTab = new qx.ui.decoration.RoundBorderBeveled().set({
				leftTopR: 5,
				rightTopR: 5
			});
		    
			//this sets event handlers in every button of the tabview
			//that checks if the selected tab is re-clicked, and hide the tabview.
			for(var i = 0; i < tabViewButtons.length; ++i) {
				currentButton = tabViewButtons[i];
				if (currentButton instanceof qx.ui.tabview.TabButton) {
					currentButton.addListener("execute", function () {
						if(!me.hasChangedThetab) {
							me.hideContent();
						} else {
							if(me.showedForFirstTime) {
						//TODO: code to execute the first time the tab is showed.
						}
						}
						me.showedForFirstTime = null;
						me.hasChangedThetab = null;
					});
				}
			}
		    
			//then, we set the event handlers
		    
			//we save the original size of the tabs
			this.addListener("appear", function () {
				this.getRadioGroup().setAllowEmptySelection(true);
				this.resetSelection();
				//after showing the tabs, we save the starting size of each one, that is the default
				var oldSize = me.getLayoutParent().getContainerElement().getStyle('height');
				var myPages = this.getSelectables();
				for(i=0; i < myPages.length; ++i) {
						me.oldSize[myPages[i].toHashCode()] = oldSize;
				}
				me.resetSelection();
				//then, we hide it, setting the size to 32
				me.getLayoutParent().getContainerElement().setStyle('height','32px');
				me.getLayoutParent().getContainerElement().setStyle('overflow','hidden');
				me.showedOnScreen = 0;
				me.hasAppeared = 1;
		    
			});
		    
			this.addListener("resize", function () {
                                var selectedButton = me.getSelection()[0];
				if(me.oldSize && selectedButton) { //if me.oldSize do not exists, its startup time
                                    me.oldSize[selectedButton.toHashCode()] = me.getLayoutParent().getContainerElement().getStyle('height'); //getLayoutParent()
                                    if(me.oldSize[selectedButton.toHashCode()] && me.showedOnScreen == 0) {
                                            me.getLayoutParent().getContainerElement().setStyle('height','32px');
                                            me.getLayoutParent().getContainerElement().setStyle('overflow','hidden');
                                    }
				} else {
                                    me.getLayoutParent().getContainerElement().setStyle('height','32px');
                                    me.getLayoutParent().getContainerElement().setStyle('overflow','hidden');
				}

			});

			//when changing between tabs, we restore the original size.
			this.addListener("changeSelection", function (e) {
				if(me.hasAppeared == 1) {
					me.showContent();
				}
				me.hasChangedThetab = 1;
				
				//this flag is removed by click in the button, its just to detect
				//if this is the first changeSelected, or not.
				if(me.showedOnScreen == 0) {
					me.showedForFirstTime = 1;
				}
				
				//we change the decorator of the tabs to our own (all NOT selected)
				for(var i = 0; i < tabViewButtons.length; ++i) {
					if (tabViewButtons[i] instanceof qx.ui.tabview.TabButton) {
						if(tabViewButtons[i].getValue()) {
							tabViewButtons[i].set({
								decorator: decoratorTab,
								backgroundColor: 'white'
							});
							tabViewButtons[i].setTextColor("#232D34");
                                                        //FIXME: extremly ugly hack, we need to create a tab component.
                                                        var tabDom =  tabViewButtons[i].getContainerElement().getDomElement();
														if(tabDom && tabDom.childNodes && tabDom.childNodes.length > 2) {
															tabDom.childNodes[2].style.top = '3px';
														}
						} else {
							currentButton = tabViewButtons[i];
							currentButton.set({
								decorator: decoratorTab,
								backgroundColor: '#232D34'
							});
							currentButton.setTextColor("#FFFFFF");
						}
						currentButton.setFont(new qx.bom.Font(14, ["Helvetica","Arial","Lucida Grande", "Verdana", "Sans", "FreeSans"]));
					}
				}
			});
		}
	}
});
