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

function taskbar_application(checknum, pid, args) {
    var application = new eyeos.application.Taskbar(checknum, pid);
    application.initApplication(checknum, args);
}

qx.Class.define('eyeos.application.Taskbar', {
    extend: eyeos.system.EyeApplication,

    construct: function (checknum, pid) {
        arguments.callee.base.call(this, 'taskbar', checknum, pid);
    },

    properties: {

    },

    members: {
        initApplication: function(checknum, args) {
            var bus = eyeos.messageBus.getInstance();
            var screen = bus.retrieve('screen');
            var panel = new desktop.Panel();
			panel.setUserData('isAdmin', args[0]);
			panel.setUserData('eventsWaiting', args[1]);
			panel.setUserData('checknum', checknum);
			panel.createMessageIndicator();
            screen.add(panel);
            bus.store('eyePanel', panel);
            bus.store('eyeTaskBar', panel._taskBar);
        }
    }
});

qx.Class.define('desktop.Panel', {
	extend: qx.ui.EyePanel,

	construct: function () {
		arguments.callee.base.call(this);

		this._applyPanelStyle();
		this._createShowDesktopButton();
		this._createCascadeWindowsButton();
		this._createSeparator();
		this._createTaskBar();
		this._createClock();
		this._parseCurrentWindows();

		var self = this;

		document.eyeDesktop.addListener('windowAdded', function (data) {
			self._assignWindowEvents(data.getData());
		});

		if(navigator.appName != 'Opera') {
			this.addListener('appear', function(e) {
				var domEle = this.getContainerElement().getDomElement();
				domEle.style.boxShadow = '0 2px 25px 0px black';
				domEle.style.MozBoxShadow = '0 2px 25px 0px black';
				domEle.style.webkitBoxShadow = '0 2px 25px 0px black';
			}, this);
		}

	},

	members: {
		_tags: null,
		_activeShowDesktop: false,
		_activeCascadeWindows: false,
		_cascadeWindowsButton: null,
		_acceptWindowEvents: true,
		_showDesktopButton: null,
		_taskBar: null,
		_decoratorSystemButton: null,
		_decoratorSystemButtonMouseOver: null,

		_assignWindowEvents: function (window) {
			var enableAcceptWindowEvents = function () {
				this._acceptWindowEvents = true;
			}

			document.eyeDesktop.addListener('cascadeWindowsComplete', enableAcceptWindowEvents, this);
			document.eyeDesktop.addListener('showDesktopComplete', enableAcceptWindowEvents, this);
			window.addListener('move', this._restoreButtonsState, this);
			window.addListener('resize', this._restoreButtonsState, this);
			//	window.addListener('minimize', this._restoreButtonsState, this);
			// 	window.addListener('restore', this._restoreButtonsState, this);
			//	TODO: it does not manages when a window changes his state from minimized to normal or maximized.
		},

		_applyPanelStyle: function () {
		 	// Decorators
			this._decoratorSystemButton = new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 3, 3, 3, 3);

			this._decoratorSystemButtonMouseOver = new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 3, 3, 3);
			this._decoratorSystemButtonMouseOver.setBackgroundColor('#accff0');

			var decoratorTaskBar = new qx.ui.decoration.Background().set({
				backgroundImage: 'index.php?extern=images/bgTaskBar.png'
				//backgroundRepeat: 'scale'
			});

			// Main style
			this.set({
				backgroundColor: '#202020',
				padding: 0,
				height: 38,
				maxHeight: 38,
				paddingLeft: 8,
				decorator: decoratorTaskBar
			});
		},

		_createSeparator: function () {
			var separator = new qx.ui.menu.Separator();

			separator.set({
				backgroundColor: '#6583BC',
				width: 2,
				maxWidth: 2,
				height: 29,
				maxHeight: 29,
				marginLeft: 8,
				marginRight: 8
			});

			this.add(separator);
		},

		_createCascadeWindowsButton: function () {
			this._cascadeWindowsButton = new qx.ui.form.ToggleButton('', 'index.php?extern=images/CascadeWindows.png');

			this._cascadeWindowsButton.set({
				focusable: false,
				keepFocus: true,
				padding: 0,
				height: 21,
				maxHeight: 21,
				width: 21,
				maxWidth: 21,
				decorator: this._decoratorSystemButton
			});

			var self = this;

			this._cascadeWindowsButton.addListener('click', function () {
				if (this.get('value')) {
					self._acceptWindowEvents = false;
					document.eyeDesktop.cascadeWindows();
					self._activeCascadeWindows = true;
				} else {
					document.eyeDesktop.restoreWindows();
					self._activeCascadeWindows = false;
				}
			});

			this._cascadeWindowsButton.addListener('mouseover', function () {
				this.set({
					decorator: self._decoratorSystemButtonMouseOver
				});
			});

			this._cascadeWindowsButton.addListener('mouseout', function () {
				this.set({
					decorator: self._decoratorSystemButton
				});
			});

			this.add(this._cascadeWindowsButton);
		},

		_createShowDesktopButton: function () {
			this._showDesktopButton = new qx.ui.form.ToggleButton('', 'index.php?extern=images/ShowDesktop.png');

			this._showDesktopButton.set({
				focusable: false,
				keepFocus: true,
				padding: 0,
				height: 21,
				maxHeight: 21,
				width: 21,
				maxWidth: 21,
				decorator: this._decoratorSystemButton,
				marginRight: 6
			});

			var self = this;

			this._showDesktopButton.addListener('click', function () {
				if (this.get('value')) {
					self._acceptWindowEvents = false;
					document.eyeDesktop.showDesktop();
					self._activeShowDesktop = true;
				} else {
					self._activeShowDesktop = false;
					document.eyeDesktop.restoreWindows();
				}
			});

			this._showDesktopButton.addListener('mouseover', function () {
				this.set({
					decorator: self._decoratorSystemButtonMouseOver
				});
			});

			this._showDesktopButton.addListener('mouseout', function () {
				this.set({
					decorator: self._decoratorSystemButton
				});
			});

			this.add(this._showDesktopButton);
		},

		_createTaskBar: function () {
			this._taskBar = new qx.ui.EyeTaskBar();
			this.add(this._taskBar);
		},

		createMessageIndicator: function() {
			var events = this.getUserData('eventsWaiting');
			if(events && events.length >= 0) {
				var num = events.length;
			} else {
				var num = 0;
			}
			var indicator = new qx.ui.container.Composite();
			indicator.setLayout(new qx.ui.layout.HBox());
			indicator.set({
				minWidth: 30,
				backgroundColor: '#990000',
				maxHeight: 16,
				marginTop:8,
				marginLeft: 6,
				cursor:'Pointer'
			});
			indicator.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 9, 9, 9, 9));
			indicator.addListener('click', function(e) {
				eyeos.execute('events', this.getUserData('checknum'));
			}, this);
			var label = new qx.ui.basic.Label();
			label.set({
				value: '<span style="font-family:Arial;font-size:12px;text-shadow: black 0px -1px 0px;"><strong>'+tr(num)+'</strong></span>',
				rich: true,
				textColor: 'white',
				paddingTop: 1
			});
			label.setUserData('num', num);

			var dbus = eyeos.messageBus.getInstance();
			dbus.addListener('eyeos_events_newEvent', function (e) {
				//notification should be shown here
				var infoData = qx.util.Json.parse(e.getData().messageInformation);
				var translatedInformation = tr(infoData[0], infoData[1]);
				eyeos.messageBus.getInstance().send('desktop', 'showDesktopNotification', [translatedInformation]);
				if(e.getData().isQuestion) {
					var num = parseInt(label.getUserData('num'));
					num++;
					label.setValue('<span style="font-family:Arial;font-size:12px;text-shadow: black 0px -1px 0px;"><strong>'+tr(num)+'</strong></span>');
					if(indicator.isExcluded()) {
						indicator.show();
					}
				}
				//TODO24 joca: due to incorrect handling issues, I have to hardcode this here.
				if(e.getData().type == "People_CancelRequest") {
					var num = parseInt(label.getUserData('num'));
					num--;
					if(num < 0) {
						num = 0;
					}

					if(num == 0) {
						indicator.exclude();
					}

					label.setUserData('num', num);
				}
			}, this);

			dbus.addListener('eyeos_events_updateEvent', function (e) {
				var num = parseInt(label.getUserData('num'));
				num--;
				if(num < 0) {
					num = 0;
				}

				if(num == 0) {
					indicator.exclude();
				}
				
				label.setUserData('num', num);
			}, this);

			indicator.add(new qx.ui.core.Spacer(), {flex:1});
			indicator.add(label);
			indicator.add(new qx.ui.core.Spacer(), {flex:1});
			if(num <= 0) {
				indicator.exclude();
			}
			
			this.containerMenu.addAt(indicator, 0);
		},

		_createClock : function() {
			var clock = new qx.ui.basic.Label();

			clock.set({
				paddingRight: 15,
				marginTop:5,
				rich: true,
				height: 38,
				paddingTop: 8,
				paddingLeft: 15
			});

			this.timer = new qx.event.Timer(2000);
			this.timer.addListener('interval', function(e) {
				var d = new Date();
				var a_p = "";
				var curr_hour = d.getHours();

				if (curr_hour < 12) {
					a_p = "am";
				} else {
					a_p = "pm";
				}

				if (curr_hour == 0) {
					curr_hour = 12;
				}

				if (curr_hour > 12) {
					curr_hour = curr_hour - 12;
				}


				var curr_min = d.getMinutes();
				var day = d.getDay();
				switch (day) {
					case 0:
						day = tr('Sun');
						break;
					case 1:
						day = tr('Monday');
						break;
					case 2:
						day = tr('Tue');
						break;
					case 3:
						day = tr('Wed');
						break;
					case 4:
						day = tr('Thu');
						break;
					case 5:
						day = tr('Fri');
						break;
					case 6:
						day = tr('Sat');
						break;
				}
				if(curr_min < 10) {
					curr_min = '0'+curr_min;
				}
				var hour = curr_hour + ':' + curr_min + a_p + '&nbsp;&nbsp; | &nbsp;&nbsp;' + day;
				clock.setValue('<span style="text-shadow: white 0px 1px 0px;color:#364a6a;font-size:12px;font-family:Arial;font-weight:bold">'+hour+'</span>');
			}, this);
			this.timer.start();

			clock.addListener('click', function(e) {
				if(this.chooser) {
					if(this.chooser.getUserData('shown') == true) {
						this.chooser.hide();
						this.chooser.setUserData('shown', false);
					} else {
						this.chooser.show();
						this.chooser.setUserData('shown', true);
					}
					
				} else {
					this.chooser = new qx.ui.control.DateChooser();
					qx.core.Init.getApplication().getRoot().add(this.chooser, { bottom : 38, right: 5});
					this.chooser.setUserData('shown', true);
					this.chooser.setValue(new Date());
					this.chooser.set({
						zIndex: 90000
					});
				}

			}, this);

			var separator = new qx.ui.basic.Image();
			separator.setSource('eyeos/extern/images/Separator_bar.png');
			this.add(separator);

			this.containerMenu = new qx.ui.container.Composite();
			this.containerMenu.setLayout(new qx.ui.layout.HBox());
			this.containerMenu.set({
				allowGrowX:false
			});

			var menu = new qx.ui.menu.Menu();

			//desplazamiento 4px abajo, 270 grados, color negro 80%, dispersion 9px,
			var decoratorWidgetMenu = new qx.ui.decoration.RoundBorderBeveled(null, 'transparent', 0, 5, 5, 0, 0, "0 -5px 16px -9px black");
			menu.set({
					'backgroundColor': 'white',
					'padding': 0,
					'paddingTop' : 4,
					'paddingBottom' : 4,
					'decorator': decoratorWidgetMenu,
					'marginLeft': 2,
					'minWidth': 200,
					'shadow' : false,
					'blockerColor' : 'red'
			});

			// ----- events
            var buttonEvents = new qx.ui.menu.Button('Events', 'eyeos/extern/images/22x22/actions/irc-voice.png');
            buttonEvents.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonEvents.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});

            buttonEvents.addListener('execute', function(e) {
                eyeos.execute('events', this.getUserData('checknum'));
            }, this);



			// ----- About eyeOS
            var buttonAbout = new qx.ui.menu.Button('About eyeOS', 'eyeos/extern/images/22x22/actions/help-about.png');
            buttonAbout.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonAbout.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});

            buttonAbout.addListener('execute', function(e) {
                eyeos.execute('about', this.getUserData('checknum'));
            }, this);


			// ----- Administration
            var buttonAdministration = new qx.ui.menu.Button('Administration', 'eyeos/extern/images/22x22/actions/system-run.png');
            buttonAdministration.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonAdministration.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});

            buttonAdministration.addListener('execute', function(e) {
                eyeos.execute('usermanagement', this.getUserData('checknum'));
            }, this);

			// ----- preferences
            var buttonPreferences = new qx.ui.menu.Button('Preferences', 'eyeos/extern/images/22x22/actions/configure.png');
            buttonPreferences.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonPreferences.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});

            buttonPreferences.addListener('execute', function(e) {
                eyeos.execute('newusersettings', this.getUserData('checknum'));
            }, this);

			// ----- sign out
            var buttonSignOut = new qx.ui.menu.Button('Sign out', 'eyeos/extern/images/22x22/actions/dialog-close.png');
            buttonSignOut.getChildControl('icon').set({
                'scale' : true,
                'height' : 22,
                'width' : 22
            });

			buttonSignOut.set({
				'paddingTop': 7,
				'paddingBottom': 7
			});

            buttonSignOut.addListener('execute', function(e) {
                eyeos.execute('logout', this.getUserData('checknum'));
            }, this);

			menu.add(buttonEvents);
			menu.add(new qx.ui.menu.Separator());
			menu.add(buttonAbout);
			
			if(this.getUserData('admin')) {
				menu.add(buttonAdministration);
			}
			
			menu.add(buttonPreferences);
            menu.add(buttonSignOut);

			
			menu.setOpener(this.containerMenu);

			menu.addListener('appear', function(e) {
				this.menuImage.setSource('eyeos/extern/images/eyeOS_Menu_open.png');
			}, this);

			menu.addListener('disappear', function(e) {
				this.menuImage.setSource('eyeos/extern/images/eyeOS_Menu_closed.png');
			}, this);
			
			this.menuImage = new qx.ui.basic.Image();
			this.menuImage.addListener('click', function(e) {
                e.stopPropagation();
                menu.open();
			}, this);
			
			this.menuImage.setSource('eyeos/extern/images/eyeOS_Menu_closed.png');
			this.containerMenu.add(this.menuImage)
			this.add(this.containerMenu);
			var separator = new qx.ui.basic.Image();
			separator.setSource('eyeos/extern/images/Separator_bar.png');
			this.add(separator);
			clock.addListener('resize', function(e) {
				var offset = clock.getBounds().width;
				menu.setOffsetLeft(offset);
			}, this);

			this.add(clock);
		},

		_parseCurrentWindows: function () {
			var windowList = document.eyeDesktop.getWindows();

			for (var i = windowList.length - 1; i >= 0; --i) {
				this._assignWindowEvents(windowList[i]);
			}
		},

		_restoreButtonsState: function () {
			if (this._acceptWindowEvents) {
				this._cascadeWindowsButton.set('value', false);
				this._showDesktopButton.set('value', false);
			}
		}
	}
});