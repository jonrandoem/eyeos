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
 * eyeos.dashboard.Widget
 *
 * Our Widget object
 */

qx.Class.define('eyeos.dashboard.Widget', {

	'extend': qx.ui.core.Widget,

	'construct': function (title, id, application, blocked, checknum) {
		arguments.callee.base.apply(this, arguments);
		//this.setFont(new qx.bom.Font(12, ["Lucida Grande", "Verdana"]));
		this.setApplication(application);
		this.setChecknum(checknum);
		this.setTitle(title);
		this.setId(id);
		this.setBlocked(blocked);
		
		this._buildLayout(title);
		this._addListeners();
	},

	'properties': {
		application: {
			check: 'String'
		},

		checknum: {
			check: 'Number'
		},

		executeFullAppParameters: {
			init: null
		},

		icon: {
			init: 'index.php?extern=images/widgetIcon.png',
			nullable: false,
			check: 'String',
			apply: '_applyIcon'
		},

		blocked: {
			check: 'Boolean',
			init: false
		},

		savedBounds: {
			check: 'Object'
		},

		title: {
			init: null
		},

		id: {
			init: null
		}
	},

	'members': {

		'_currentContainer': false,
		'_isMinimized': false,
		'_lastWidgetOver': false,

		/**
		 * Widget Layout items
		 */
		'_widgetCaption': false,
		'_widgetContent': false,
		'_widgetMenu': false,
		'_widgetMain': false,
		'_widgetMenuButtonSettings': false,
		'_widgetMenuButtonFullApp': false,
		'_widgetMenuButtonBackground': false,
		'_widgetSettingsPanel': false,
		'_widgetSettingsPanelForm': false,
		'_widgetSettingsPanelButtonCancel': false,
		'_widgetSettingsPanelButtonSave': false,
		'_widgetTitlebar': false,
		'_widgetTitlebarButtons': false,
		'_widgetTitlebarButtonMenu': false,
		'_widgetTitlebarButtonMinimize': false,
		'_widgetTitlebarButtonClose': false,
		'_widgetBackground': false,
		'_widgetBorderActive': new qx.ui.decoration.Single(2, 'solid', '#9DC1E1'),
		'_widgetBorderInactive': new qx.ui.decoration.Single(2, 'solid', '#E6E6E6'),
		'_widgetBorderInactiveBackground': new qx.ui.decoration.Single(2, 'solid', '#F4F4F4'),

		'_addListeners': function () {

			var self = this;

			// Caption Listener
			if (this.getBlocked() != true) {
				this._widgetCaption.addListener('mouseover', function (e) {
					this.setDraggable(true);
					this.setCursor('move');
				}, this);

				this._widgetCaption.addListener('mouseout', function (e) {
						if (!qx.ui.core.Widget.contains(this._widgetCaption, e.getRelatedTarget())) {
							this.setDraggable(false);
							this.setCursor('default');
						}
				
				}, this);

				// Titlebar Listeners
				this._widgetTitlebar.addListener('mouseover', function (e) {
					this.setVisibleTitlebarButtons(true);
					this._widgetTitlebar.setBackgroundColor('#ebebeb');
				}, this);

				this._widgetTitlebar.addListener('mouseout', function (e) {
					if (!qx.ui.core.Widget.contains(this._widgetTitlebar, e.getRelatedTarget())) {
						this.setVisibleTitlebarButtons(false);
						this._widgetTitlebar.setBackgroundColor('#ffffff');
					}
				}, this);

				this._widgetTitlebarButtonMenu.addListener('mouseover', function (e) {
					if (!self._widgetMenu.isVisible()) {
						this.set({'icon': 'index.php?extern=images/Arrow.png'});
					}
				});

				this._widgetTitlebarButtonMenu.addListener('mouseout', function (e) {
					if (!qx.ui.core.Widget.contains(this._widgetitlebarButtonMenu, e.getRelatedTarget())) {
						if (!self._widgetMenu.isVisible()) {
							this.set({
								'icon': 'index.php?extern=images/Arrow50.png'
							});
						}
					}
				});

				this._widgetTitlebarButtonMenu.addListener('click', function (e) {
					this.set({'icon': 'index.php?extern=images/ArrowPush.png'});
				});

				this._widgetTitlebarButtonMinimize.addListener('mouseover', function (e) {
					if (self._isMinimized) {
						this.set({'icon': 'index.php?extern=images/Max.png'});
					} else {
						this.set({'icon': 'index.php?extern=images/Min.png'});
					}
				});

				this._widgetTitlebarButtonMinimize.addListener('mouseout', function (e) {
					if (!qx.ui.core.Widget.contains(this._widgetTitlebarButtonMinimize, e.getRelatedTarget())) {
						if (self._isMinimized) {
							this.set({
								'icon': 'index.php?extern=images/Max50.png'
							});
						} else {
							this.set({
								'icon': 'index.php?extern=images/Min50.png'
							});
						}
					}
				});

				this._widgetTitlebarButtonMinimize.addListener('execute', function (e) {
					this.toggleMinimize();
				}, this);

				this._widgetTitlebarButtonClose.addListener('mouseover', function (e) {
					this.set({'icon': 'index.php?extern=images/Close.png'});
				});

				this._widgetTitlebarButtonClose.addListener('mouseout', function (e) {
					if (!qx.ui.core.Widget.contains(this._widgetTitlebarButtonClose, e.getRelatedTarget())) {
						this.set({'icon': 'index.php?extern=images/Close50.png'});
					}
				});

				this._widgetTitlebarButtonClose.addListener('execute', function (e) {
					//HERE
					this.close();
				}, this);

				// Menu Listeners
				this._widgetMenu.addListener('mouseover', function (e) {
					this.setVisibleTitlebarButtons(true);
				}, this);

				this._widgetMenu.addListener('disappear', function (e) {
					this.setVisibleTitlebarButtons(false);
				}, this);

				this._widgetMenuButtonSettings.addListener('execute', function (e) {
					this.setVisibleSettingsPanel(true);
					this.setVisibleTitlebarButtons(false);
				}, this);

				this._widgetSettingsPanelButtonCancel.addListener('execute', function (e) {
					this.setVisibleSettingsPanel(false);
				}, this);

				this._widgetSettingsPanelButtonSave.addListener('execute', function (e) {
					this.setVisibleSettingsPanel(false);
				}, this);

				this._widgetMenuButtonBackground.addListener('execute', function (e) {
					this.toggleBackground();
				}, this);

				this._widgetMenu.addListener('disappear', function (e) {
					if (!this._widgetBackground) {
						var borderDecorator = new qx.ui.decoration.Single(2, 'solid', '#E6E6E6');
						this.setDecorator(borderDecorator);
					}
					this._widgetTitlebarButtonMenu.set({'icon': 'index.php?extern=images/Arrow50.png'});
				}, this);

				if(this.getApplication() != '') {
					this._widgetMenuButtonFullApp.addListener('execute', function (e) {
						if(this.getExecuteFullAppParameters()) {
							eyeos.execute(this.getApplication(), this.getChecknum(), this.getExecuteFullAppParameters());
						} else {
							eyeos.execute(this.getApplication(), this.getChecknum());
						}
						
					}, this);
				}
			}
		},

		'_applyIcon': function(value, old) {
			if (this._widgetCaption != false) {
				this._widgetCaption.setIcon(value);
			}
		},

		'_buildLayout': function (title) {

			/**
			 * Main Layout
			 */
			var borderDecorator = new qx.ui.decoration.Single(2, 'solid', '#E6E6E6');
			this._setLayout(new qx.ui.layout.VBox(0));
			this.set({
				'backgroundColor': '#FFFFFF',
				'droppable': true,
				decorator: null
			});

			this._widgetMain = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));

			if (!this.getBlocked()) {

				this.set({'decorator': borderDecorator});
				/**
				 * Widget Titlebar
				 */
				this._widgetTitlebar = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
				this._widgetTitlebar.set({'height': 23, 'padding': 2, 'paddingLeft': 5, 'paddingRight': 6});
				this._widgetCaption = new qx.ui.basic.Atom(title, this.getIcon());
				this._widgetCaption.set({
					'paddingTop': 0,
					'gap': 5,
					'height': 14
				});
				this._widgetTitlebar.add(this._widgetCaption, {flex: 1});
				this._add(this._widgetTitlebar);

				/**
				 * Widget Menu
				 */
				this._widgetMenu = new qx.ui.menu.Menu();
				this._decoratorWidgetMenu = new qx.ui.decoration.Single(1, 'solid', '#9EB6DB');
				this._widgetMenu.set({
					'backgroundColor': '#F3F7FF',
					'padding': 0,
					'decorator': this._decoratorWidgetMenu,
					'shadow': null
				});
				this._widgetMenuButtonSettings = new qx.ui.menu.Button('Settings', 'index.php?extern=/images/16x16/actions/configure.png');
				this._applyMenuButtonDecoration(this._widgetMenuButtonSettings);

				if(this.getApplication() != '') {
					this._widgetMenuButtonFullApp = new qx.ui.menu.Button('Open full app', 'index.php?extern=/images/16x16/actions/window-duplicate.png');
					this._applyMenuButtonDecoration(this._widgetMenuButtonFullApp);
					this._widgetMenu.add(this._widgetMenuButtonFullApp);
				}

				this._widgetMenuButtonBackground = new qx.ui.menu.Button('Background', 'index.php?extern=/images/16x16/actions/games-config-background.png');
				this._applyMenuButtonDecoration(this._widgetMenuButtonBackground);
				this._widgetMenu.add(this._widgetMenuButtonSettings);
				this._widgetMenu.add(this._widgetMenuButtonBackground);

				/**
				 * Widget Titlebar buttons
				 */
				this._widgetTitlebarButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
				this._widgetTitlebarButtonMenu = new qx.ui.form.MenuButton(null, 'index.php?extern=images/Arrow50.png', this._widgetMenu);
				this._widgetTitlebarButtonMenu.set({'decorator': null, 'width': 16, 'margin': 0, 'padding': 0, 'marginRight': 3});
				this._widgetTitlebarButtonMinimize = new qx.ui.form.Button(null, 'index.php?extern=images/Min50.png');
				this._widgetTitlebarButtonMinimize.set({'decorator': null, 'width': 16, 'margin': 0, 'padding': 0, 'marginRight': 3});
				this._widgetTitlebarButtonClose = new qx.ui.form.Button(null, 'index.php?extern=images/Close50.png');
				this._widgetTitlebarButtonClose.set({'decorator': null, 'width': 16, 'margin': 0, 'padding': 0});
				this._widgetTitlebarButtons._add(this._widgetTitlebarButtonMenu);
				this._widgetTitlebarButtons._add(this._widgetTitlebarButtonMinimize);
				this._widgetTitlebarButtons._add(this._widgetTitlebarButtonClose);
				this._widgetTitlebar.add(this._widgetTitlebarButtons);
				this.setVisibleTitlebarButtons(false);

				this._widgetSettingsPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
				var borderAll = new qx.ui.decoration.RoundBorderBeveled().set({
					'leftTopR': 3,
					'rightTopR': 3,
					'leftBottomR': 3,
					'rightBottomR': 3
				});

				this._widgetSettingsPanel.set({
					'height': 50,
					'padding': 5,
					'backgroundColor': '#e6e6e6',
					'decorator': borderAll
				});

				var grid = new qx.ui.layout.Grid();
				grid.setSpacing(5);
				grid.setColumnAlign(0, "left", "middle")

				this._widgetSettingsPanelForm = new qx.ui.container.Composite(grid);
				var settingsPanelButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, 'right'));
				this._widgetSettingsPanelButtonCancel = new qx.ui.form.Button('Cancel');
				this._widgetSettingsPanelButtonSave = new qx.ui.form.Button('Save');
				settingsPanelButtons.add(this._widgetSettingsPanelButtonCancel);
				settingsPanelButtons.add(this._widgetSettingsPanelButtonSave);
				this._widgetSettingsPanel.add(this._widgetSettingsPanelForm);
				this._widgetSettingsPanel.add(settingsPanelButtons);
				this._widgetMain.add(this._widgetSettingsPanel);
				this.setVisibleSettingsPanel(false);
			}

			// MAIN INNER LAYOUT (Includes widget content and Settings)
			
			/**
			 * Settings Panel
			 * BUG: Qooxdoo says that "qx.ui.form.Form()" it's not a constructor though it's listed on the API
			 * - this is a serious problem due to most windows should work with forms and we shouldn't care about layouting -
			 */

			/**
			 * Content
			 */

			this._widgetContent = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
			this._widgetMain.add(this._widgetContent);
			this._add(this._widgetMain);
		},

		'_applyMenuButtonDecoration': function (element) {
			element.set({
				'padding': 2,
				'textColor': '#535758',
				'backgroundColor': '#F3F7FF'
			})

			element.addListener('mouseover', function (e) {
				this.set({
					'decorator': null,
					'textColor': '#535758',
					'backgroundColor': '#CDE0ED'
				});
			});

			element.addListener('mouseout', function (e) {
				if (!qx.ui.core.Widget.contains(element, e.getRelatedTarget())) {
					this.set({
						'decorator': null,
						'backgroundColor': '#F3F7FF'
					});
				}
			});
		},

		'setBorderActive': function (value) {
			if (!this.getBlocked()) {
				if (value) {
					this.setDecorator(this._widgetBorderActive);
				} else {
					if (this._widgetBackground) {
						this.setDecorator(this._widgetBorderInactiveBackground);
					} else {
						this.setDecorator(this._widgetBorderInactive);
					}
				}
			}
		},

		'setVisibleTitlebarButtons': function (value) {
			if (value) {
				this._widgetTitlebarButtons.show();
			} else {
				this._widgetTitlebarButtons.hide();
			}
		},

		'setVisibleSettingsPanel': function (value) {
			if (value) {
				this._widgetSettingsPanel.setVisibility('visible');
			} else {
				this._widgetSettingsPanel.setVisibility('excluded');
			}
		},

		'addSettings': function (element) {
			this._widgetSettingsPanelForm.add(element);
		},

		'addContent': function (element) {
			this._widgetContent.add(element);
		},

		'minimize': function () {
			this._widgetMain.setVisibility('excluded');
		},

		'restore': function () {
			this._widgetMain.setVisibility('visible');
		},

		'close': function () {
			this.destroy();
		},

		'setCurrentContainer': function (element) {
			this._currentContainer = element;
		},

		'getCurrentContainer': function (element) {
			return this._currentContainer;
		},

		'getTitle': function () {
			if (this._widgetCaption != false) {
				return this._widgetCaption.getLabel();
			}
		},

		'setTitle': function (title) {
			if (this._widgetCaption != false) {
				this._widgetCaption.setLabel(title);
			}
		},

		'toggleBackground': function () {
			if (this._widgetBackground) {
				this.set({
					'backgroundColor': '#FFFFFF'
				});
				this._widgetBackground = false;
			} else {
				this.set({
					'backgroundColor': null
				});
				this._widgetBackground = true;
				this.setBorderActive(false);
			}
		},

		'toggleMinimize': function () {
			if (this._isMinimized) {
				this._widgetTitlebarButtonMinimize.set({'icon': 'index.php?extern=images/Min.png'});
				this.restore();
				this._isMinimized = false;
			} else {
				this._widgetTitlebarButtonMinimize.set({'icon': 'index.php?extern=images/Max.png'});
				this.minimize();
				this._isMinimized = true;
			}

			var positions = document.eyeDashBoard.getAllWidgetsPositions();
			eyeos.callMessage(this.getChecknum(), 'savePositionsWidget', positions);
		},

		'openAndPlace': function (container, position) {
			var container = container;
			if (container == undefined) {
				container = document.eyeDashBoard.getLastContainer();
			}
			container.addWidget(this, position);
		}
	}
});