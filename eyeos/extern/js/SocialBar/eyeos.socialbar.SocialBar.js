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
 * SocialBar is a widget programmed for be integrated in eyeOS Applications.
 * It offers a simple way to show information about every kind of items, history
 * about the usage for that item, an interface for manage tags, share between
 * single/multiple contacts or even groups, and more...
 * Informations will be dispatched to the application trough javascripts events.
 */

qx.Class.define('eyeos.socialbar.SocialBar', {
	extend: qx.ui.tabview.TabView,

	/**
	 * Constructor of the Social Bar
	 *
	 * @param backgroundColor {string} The color of Background (normally the same of the Application)
	 */
	construct: function (backgroundColor) {
		this.base(arguments);
		this.set({
			barPosition: 'top',
			allowGrowY: true,
			allowGrowX: false,
			backgroundColor: backgroundColor,
			draggable: false,
			droppable: true,
			width: 230,
			margin: 0,
			contentPadding: -3
		});
	},

	members: {
		_backgroundColor: null,
		
		/**
		 * Add a TabPage to the Socialbar
		 *
		 * @param tabName {string} The name that will identify the Tab and showned to the Layout
		 * @param tabIconPath {string} The Path of the icon for the Tab
		 */
		addTab: function (tabName, tabIconPath) {
			var newTab = new eyeos.socialbar.SocialTab(tabName, tabIconPath, this.getBackgroundColor());
			this.add(newTab);
		},

		/**
		 * Remove a TabPage from the Socialbar
		 *
		 * @param tabName {string} The name of the tabPage to remove
		 */
		removeTab: function (tabName) {
			var tabs = this.getChildren();
			for(var i = 0; i < tabs.length; ++i){
				if (tabs[i].getName() == tabName){
					tabs[i].destroy();
				}
			}
		},

		/**
		 * Create the defaults tab for SocialBar, if you don't need special tab
		 * you should use this function for create the Tabs
		 */
		createDefaultTabs: function () {
			this.removeAllTabs();
			this.addTab('Info', 'index.php?extern=images/dialog-information.png', this.getBackgroundColor());
			this.addTab('Share', 'index.php?extern=images/share.png', this.getBackgroundColor());
			this.addTab('Activity', 'index.php?extern=images/document-open-recent.png', this.getBackgroundColor());
			this.setSelection([this.getTab('Info')]);
		},

		/**
		 * Return the handler of a tab giving a Name
		 *
		 * @param tabName {string} The name of the tabPage to obtain the handler
		 */
		getTab: function (tabName) {
			var tabs = this.getChildren();
			for (var i = 0; i < tabs.length; ++i){
				if (tabs[i].getName() == tabName){
					return tabs[i];
				}
			}

            // Check translated version of name
            for (var i = 0; i < tabs.length; ++i){
				if (tr(tabs[i].getName()) == tabName){
					return tabs[i];
				}
			}
			return null;
		},
		
		/**
		 * Return the handler of all tabsPage
		 */
		getAllTabs: function () {
			return this.getChildren();
		},

		setBackgroundColor: function (value) {
			this._backgroundColor = value;
		},

		getBackgroundColor: function () {
			return this._backgroundColor;
		},

		removeAllTabs: function () {
			var tabs = this.getAllTabs();
			while (tabs.length) {
				var tab = tabs.shift();
				if (tab instanceof eyeos.socialbar.SocialTab) {
					tab.destroy();
				}

			}
		}
	}


});