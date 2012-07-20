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

qx.Class.define('eyeos.socialbar.SocialTab', {
	extend: qx.ui.tabview.Page,
	
	/**
	 * Constructor of a Social Tab
	 *
	 * @param tabName {string} The name of the tabPage, also the title of the Tab
	 * @param tabIconPath {string} The Path of the icon for the Tab
	 */
	construct: function (tabName, tabIconPath, background) {
		this.base(arguments, tr(tabName), tabIconPath);
		//this.setLabel(tr(tabName));
		this.setName(tabName);
		this.setBackgroundColor(background);
		this.getButton().set({
			iconPosition: 'top'
		});
		this.getChildControl('button').set({
			padding: 8,
			center: true
		});

		this.set({
			layout: new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			}),
			backgroundColor: background
		});
		this.printNoBoxLayout();
	},
	
	properties: {
		name: {
			check: 'String'
		},
		numBox: {
			check: 'Integer',
			init: 0
		},
		boxBackgroundColor: {
			check: 'String',
			init: '#FFFFFF'
		}
	},	

	members: {
		
		_noBox: null, 
		
		/**
		 * Add a Box to the Tab
		 *
		 * @param socialBox {ISocialBox} an Object that implements ISocialBox to add to the Tab
		 * @param name {String} (optional) a string defining the name of the box
		 */
		addBox: function(socialBox, name){
			if (qx.Class.implementsInterface(socialBox, eyeos.socialbar.ISocialBox)){
				//If no Box are present, remove the NoBox Messages
				if (this.getNumBox() == 0) {
					this._noBox.destroy();
					this.set({
						layout: new qx.ui.layout.VBox().set({
							alignX: 'left',
							alignY: 'top'
						})
					});
				}
				socialBox.setBackgroundColor(this.getBoxBackgroundColor);

				this.add(socialBox, {flex: 1});

				this.setNumBox(this.getNumBox() + 1);		
				this.setBoxBackgroundColor = (this.getBoxBackgroundColor() == '#FFFFFF')?('#E0E0E0'):('#FFFFFF');

				// We set the name if has been specified
				if (name != null && name != undefined) {
					socialBox.setName(name);
				}
			}
		},
		
		/**
		 * Return the handler of a Social Box giving a Name
		 *
		 * @param boxName {string} The name of the Social Box to obtain the handler
		 */
		getBox: function (boxName){
			var boxs = this.getChildren();
			for (var i = 0; i < boxs.length; ++i){
				if ((qx.Class.implementsInterface(boxs[i], eyeos.socialbar.ISocialBox)) && (boxs[i].getName() == boxName)){
					 return boxs[i];
				}
			}
			return null;
		},
		
		/**
		  * Clean the Tab from all Boxs presents
		  */
		cleanTab: function () {
			//Remove All tabs
			this.removeAll();
			this.setNumBox(0);
			this.printNoBoxLayout();
		},

		/**
		 * Remove a Social Box from the page
		 *
		 * @param boxName {string} The name of the Social Box to remove
		 */
		removeBox: function (boxName){
			if (this.getNumBox() > 0) {
				var boxs = this.getChildren();
				for (var i = 0; i < boxs.lenght; ++i){
					if (boxs[i].getName() == boxName){
						boxs[i].destroy();
						this.setNumBox(this.getNumBox() - 1);
					}
				}
			}
			if (this.getNumBox() == 0){
				this.printNoBoxLayout();
			}
		},
		
		/**
		  * Print a message in the Layout if no box are present
		  */
		printNoBoxLayout: function () {
			this.set({
				layout: new qx.ui.layout.VBox().set({
					alignX: 'center',
					alignY: 'middle'
				})
			});
			this._noBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				decorator: null
			});
			this.add(this._noBox);
			
			var infoImage = new qx.ui.basic.Image('index.php?extern=/images/128x128/status/dialog-information.png').set({
				alignX: 'center',
				alignY: 'middle',
				opacity: 0.5
			});
			this._noBox.add(infoImage);
			
			var infoMessage = new eyeos.socialbar.Label(tr('Select an Item to Show the Information'), 'label', 'gray').set({
				textAlign: 'center',
				alignY: 'middle'
			});
			this._noBox.add(infoMessage);
		}

	}
});