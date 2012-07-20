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
 * eyeos.ui.dashboard.WidgetView
 */
qx.Class.define('eyeos.ui.dashboard.WidgetView', {
	extend: qx.ui.core.Widget,
	type: 'abstract',

	construct: function() {
		arguments.callee.base.apply(this, arguments);

		this.create();
		this.addListeners();
	},

	properties: {
		title: {
			init: 'Eyeos WidgetView',
			check: 'String',
			event: 'changeTitle',
			apply: '_applyTitle'
		},

		icon: {
			init:'index.php?extern=images/widgetIcon.png',
			check: 'String',
			event: 'changeIcon',
			apply: '_applyIcon'
		},

		background: {
			init: '#ffffff',
			check: 'String'
		},

		settings: {
			init: new qx.ui.container.Composite(new qx.ui.layout.VBox(0)),
			check: 'qx.ui.container.Composite'
		},

		content: {
			init: new qx.ui.container.Composite(new qx.ui.layout.VBox(0)),
			check: 'qx.ui.container.Composite'
		},

		minimized: {
			init: false,
			check: 'Boolean',
			apply: '_applyMinimized'
		}
	},

	members: {
		_titleBarContainer: null,		// the qx.ui.container.Composite containing the titleBar
		_titleBar: null,				// the atom, containing title and icon of the view
		_titleBarMenu: null,			// the qx.ui.menu.Menu containing the menu of the view
		_titleBarButtons: null,			// the qx.ui.container.Composite containing the buttons of the view
		_settingsButtons: null,			// the qx.ui.container.Composite containing the buttons of the settings panel
		_settingsPanel: null,			// the qx.ui.container.Composite contaning the settings panel
		_widgetMainContainer: null,		// the qx.ui.container.Composite containing the main widget container,
										// which contains the _settingsPanel and the this.getContent()

		_applyTitle: function() {
			this._titleBar.setLabel(this.getTitle());
		},

		_applyIcon: function() {
			this._titleBar.setIcon(this.getIcon());
		},

		create: function() {
			this._createLayout();
			this._createTitleBar();

			this._widgetMainContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
			this._add(this._widgetMainContainer);
			this.createSettings();
			this._widgetMainContainer.add(this.getContent());
		},

		_createLayout: function() {
			this._setLayout(new qx.ui.layout.VBox());
			this.setDecorator(new qx.ui.decoration.Single(2, 'solid', '#E6E6E6'));
			this.setBackgroundColor('#FFFFFF');
			this.setDroppable(true);
		},

		_createTitleBar: function() {
			this._titleBarContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
			this._titleBarContainer.set({
				height: 23,
				padding: 2,
				paddingLeft: 5,
				paddingRight: 6
			});

			this._titleBar = new qx.ui.basic.Atom(this.getTitle(), this.getIcon());
			this._titleBar.set({
				paddingTop: 0,
				gap: 5,
				height: 14
			});
			this._titleBarContainer.add(this._titleBar, {flex: 1});

			this._add(this._titleBarContainer);

			this._createTitleBarMenu();
			this._createTitleBarButtons();
		},

		_createTitleBarMenu: function() {
			this._titleBarMenu = new qx.ui.menu.Menu().set({
				backgroundColor: '#F3F7FF',
				padding: 0,
				decorator: new qx.ui.decoration.Single(1, 'solid', '#9EB6DB'),
				shadow: null
			});
			
			var titleBarMenuSettings = new qx.ui.menu.Button('Settings', 'index.php?extern=/images/16x16/actions/configure.png');
			this._applyTitleBarMenuDecoration(titleBarMenuSettings);
			this._titleBarMenu.add(titleBarMenuSettings);

			var titleBarMenuFullApp = new qx.ui.menu.Button('Open full app', 'index.php?extern=/images/16x16/actions/window-duplicate.png');
			this._applyTitleBarMenuDecoration(titleBarMenuFullApp);
			this._titleBarMenu.add(titleBarMenuFullApp);

			var titleBarMenuBackground = new qx.ui.menu.Button('Background', 'index.php?extern=/images/16x16/actions/games-config-background.png');
			this._applyTitleBarMenuDecoration(titleBarMenuBackground);
			this._titleBarMenu.add(titleBarMenuBackground);
		},

		_createTitleBarButtons: function() {
			this._titleBarButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));

			var titleBarMenuButton = new qx.ui.form.MenuButton(null, 'index.php?extern=images/Arrow50.png', this._titleBarMenu);
			titleBarMenuButton.set({
				decorator: null,
				width: 16,
				margin: 0,
				padding: 0,
				marginRight: 3
			});

			var titleBarMinimizeButton = new qx.ui.form.Button(null, 'index.php?extern=images/Min50.png');
			titleBarMinimizeButton.set({
				decorator: null,
				width: 16,
				margin: 0,
				padding: 0,
				marginRight: 3
			});

			var titleBarCloseButton = new qx.ui.form.Button(null, 'index.php?extern=images/Close50.png');
			titleBarCloseButton.set({
				decorator: null,
				width: 16,
				margin: 0,
				padding: 0
			});

			this._titleBarButtons._add(titleBarMenuButton);
			this._titleBarButtons._add(titleBarMinimizeButton);
			this._titleBarButtons._add(titleBarCloseButton);

			this._titleBarContainer.add(this._titleBarButtons);
			this._setTitleBarButtonsVisibility(false);
		},

		createSettings: function() {
			var decorator = new qx.ui.decoration.RoundBorderBeveled().set({
				leftTopR: 10,
				rightTopR: 10,
				leftBottomR: 10,
				rightBottomR: 10
			});

			this._settingsPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
				height: 50,
				padding: 5,
				backgroundColor: '#e6e6e6',
				decorator: decorator
			});

			this.setSettings(new qx.ui.container.Composite(new qx.ui.layout.VBox(0)));
			this._settingsPanel.add(this.getSettings());

			this._settingsButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, 'right'));
			this._settingsPanel.add(this._settingsButtons);

			var cancelButton = new qx.ui.form.Button('Cancel');
			this._settingsButtons.add(cancelButton);

			var saveButton = new qx.ui.form.Button('Save');
			this._settingsButtons.add(saveButton);

			this._widgetMainContainer.add(this._settingsPanel);
			this._setSettingsPanelVisbility(false);
		},

		_setSettingsPanelVisbility: function (visible) {
			if (visible) {
				this._settingsPanel.setVisibility('visible');
			} else {
				this._settingsPanel.setVisibility('excluded');
			}
		},

		_setTitleBarButtonsVisibility: function (visible) {
			if (visible) {
				this._titleBarButtons.show();
			} else {
				this._titleBarButtons.hide();
			}
		},

		_applyTitleBarMenuDecoration: function (item) {
			item.set({
				padding: 2,
				textColor: '#535758',
				backgroundColor: '#F3F7FF'
			})

			item.addListener('mouseover', function () {
				this.set({
					decorator: null,
					textColor: '#535758',
					backgroundColor: '#CDE0ED'
				});
			});

			item.addListener('mouseout', function () {
				this.set({
					decorator: null,
					backgroundColor: '#F3F7FF'
				});
			});
		}, 
		
		addListeners: function() {
			/*
			 * titleBar Events
			 */
			this._titleBar.addListener('mouseover', function () {
				this.setDraggable(true);
				this.setCursor('move');
			}, this);

			this._titleBar.addListener('mouseout', function () {
				this.setDraggable(false);
				this.setCursor('default');
			}, this);

			/*
			 * titleBarContainer Events
			 */
			this._titleBarContainer.addListener('mouseover', function () {
				this._setTitleBarButtonsVisibility(true);
				this._titleBarContainer.setBackgroundColor('#ebebeb');
			}, this);

			this._titleBarContainer.addListener('mouseout', function (e) {
				if(!qx.ui.core.Widget.contains(this._titleBarContainer, e.getRelatedTarget())) {
					this._setTitleBarButtonsVisibility(false);
					this._titleBarContainer.setBackgroundColor('#ffffff');
				}
			}, this);

			/*
			 * titleBarMenuButton Events
			 */
			var titleBarMenuButton = this._titleBarButtons.getChildren()[0];

			titleBarMenuButton.addListener('mouseover', function () {
				if (!this._titleBarMenu.isVisible()) {
					titleBarMenuButton.setIcon('index.php?extern=images/Arrow.png');
				}
			}, this);

			titleBarMenuButton.addListener('mouseout', function () {
				if (!this._titleBarMenu.isVisible()) {
					titleBarMenuButton.setIcon('index.php?extern=images/Arrow50.png');
				}
			}, this);

			titleBarMenuButton.addListener('click', function () {
				titleBarMenuButton.setIcon('index.php?extern=images/ArrowPush.png');
			}, this);

			/*
			 * titleBarMinimizeButton Events
			 */
			var titleBarMinimizeButton = this._titleBarButtons.getChildren()[1];

			titleBarMinimizeButton.addListener('mouseover', function (e) {
				if (self._isMinimized) {
					this.setIcon('index.php?extern=images/Max.png');
				} else {
					this.setIcon('index.php?extern=images/Min.png');
				}
			});

			titleBarMinimizeButton.addListener('mouseout', function (e) {
				if (self._isMinimized) {
					this.setIcon('index.php?extern=images/Max50.png');
				} else {
					this.setIcon('index.php?extern=images/Min50.png');
				}
			});

			titleBarMinimizeButton.addListener('execute', function () {
				this.toggleMinimized();
			}, this);

			/*
			 * titleBarCloseButton Events
			 */
			var titleBarCloseButton = this._titleBarButtons.getChildren()[2];

			titleBarCloseButton.addListener('mouseover', function () {
				this.setIcon('index.php?extern=images/Close.png');
			});

			titleBarCloseButton.addListener('mouseout', function () {
				this.setIcon('index.php?extern=images/Close50.png');
			});

			titleBarCloseButton.addListener('execute', function () {
				this.close();
			}, this);

			/*
			 * titleBarMenu Events
			 */
			this._titleBarMenu.addListener('mouseover', function () {
				this._setTitleBarButtonsVisibility(true);
			}, this);

			this._titleBarMenu.addListener('disappear', function () {
				this._setTitleBarButtonsVisibility(false);
			}, this);

			/*
			 * titleBarMenuSettings Events
			 */
			var titleBarMenuSettings = this._titleBarMenu.getChildren()[0];

			titleBarMenuSettings.addListener('execute', function () {
				this._setSettingsPanelVisbility(true);
				this._setTitleBarButtonsVisibility(false);
			}, this);

			/*
			 * cancelButton Settings Events
			 */
			var cancelButton = this._settingsButtons.getChildren()[0];

			cancelButton.addListener('execute', function () {
				this._setSettingsPanelVisbility(false);
			}, this);

			/*
			 * saveButton Settings Events
			 */
			var saveButton = this._settingsButtons.getChildren()[1];

			saveButton.addListener('execute', function () {
				this._setSettingsPanelVisbility(false);
			}, this);

			/*
			 * titleBarMenuBackground Events
			 */
			var titleBarMenuBackground = this._titleBarMenu.getChildren()[2];

			titleBarMenuBackground.addListener('execute', function () {
				this._toggleBackground();
			}, this);

			/*
			 * titleBarMenuFullApp Events
			 */
			var titleBarMenuFullApp = this._titleBarMenu.getChildren()[1];

			titleBarMenuFullApp.addListener('execute', function () {
//				if(this.getApplication()) {
//					eyeos.execute(this.getApplication(), this.getChecknum());
//				}
				this.fireEvent('executeApplication');
			}, this);
		},

		_applyMinimized: function() {
			var titleBarMinimizeButton = this._titleBarButtons.getChildren()[1];

			if (this.getMinimized()) {
				titleBarMinimizeButton.setIcon('index.php?extern=images/Min.png');
				this.restore();
			} else {
				titleBarMinimizeButton.setIcon('index.php?extern=images/Max.png');
				this.minimize();
			}
		},

		_toggleBackground: function () {
			if (this.getBackground() == 'transparent') {
				this.setBackgroundColor(this.getBackground());
			} else {
				this.setBackgroundColor('transparent');
			}
			this._setBorderActive();
		},

		_setBorderActive: function () {
			if (this.getBackground() != 'transparent') {
				this.setDecorator(new qx.ui.decoration.Single(2, 'solid', '#F4F4F4'));
			} else {
				this.setDecorator(new qx.ui.decoration.Single(2, 'solid', '#E6E6E6'));
			}
		},

		minimize: function() {
			this._widgetMainContainer.setVisibility('excluded');
		},

		restore: function() {
			this._widgetMainContainer.setVisibility('visible');
		},

		close: function() {
			this.destroy();
		}
	}
});