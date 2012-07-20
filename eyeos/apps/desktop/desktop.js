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

function desktop_application(checknum, pid, args) {
    var application = new eyeos.application.Desktop(checknum, pid);
    application.initApplication(checknum, args);

    tinyMCE_GZ.init({
        theme: 'advanced',
        plugins: 'table, safari, spellchecker, searchreplace, noneditable',
        languages : 'en',
        disk_cache : true,
        debug : false
    }, function () {
        tinyMCE.init({
            strict_loading_mode : true,
            theme: 'advanced',
            plugins: 'table, safari, spellchecker, searchreplace, noneditable',
            spellchecker_languages : '+English=en',
            theme_advanced_buttons1 : "",
            theme_advanced_buttons2 : "",
            theme_advanced_buttons3 : "",
            theme_advanced_buttons3_add : 'tablecontrols',
            preformatted : true,
            fix_table_elements: 0
        });
    });

	//load audio files
	document.audio = document.createElement('audio');
	document.audio.setAttribute('src', 'eyeos/extern/chat.ogg');
}

qx.Class.define('eyeos.application.Desktop', {
    extend: eyeos.system.EyeApplication,

    construct: function (checknum, pid) {
        arguments.callee.base.call(this, 'desktop', checknum, pid);

		this.addListeners();
    },

    properties: {

    },

    members: {

		addListeners: function () {
			var bus = eyeos.messageBus.getInstance();
			bus.addListener('eyeos_netsync_forceRefresh', function () {
				var optionPane = new eyeos.dialogs.OptionPane(
					"<b>" + tr('There was a problem with your connection, we recommend you to save your work and refresh the page\n\n\
								Do you want to refresh the page now?') + "</b>",
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
					eyeos.dialogs.OptionPane.OK_CANCEL_OPTION);

					var dialog = optionPane.createDialog(this, tr('Connection Problem'), function(result) {
						if (result == eyeos.dialogs.OptionPane.OK_OPTION) {
							window.location.reload()
						}
					}, this);

					dialog.open();
			}, this);
		},

        initApplication: function(checknum, args) {
            //in the __run of desktop.php, user is appended into args[0]
            var user = args[0];
            var files = args[1];

			document.title = eyeos.getCurrentUserName() +' @ eyeOS ' + eyeos.version;

            //we create a composite called screen. this is a top level layer
            //filling all the screen.
            //it have vbox layout because inside screen there is desktop and at the bottom
            //there is the taskbar
            var screen = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
			screen.setBackgroundColor('#f2f2f2');

			//add screen to the root of the browser
            qx.core.Init.getApplication().getRoot().add(screen , {
                edge: 0
            });
			
            //inside screen, we create desktop, that is a normal qx.ui.window.Manager, see qooxdoo
            //reference to get and idea of what eyeDesktop does
            var eyeDesktop = new qx.ui.EyeDesktop(new qx.ui.window.Manager());

            //by default, eyeDesktop should be grey
            eyeDesktop.setBackgroundColor('#f2f2f2');

            //we add eyeDesktop to screen, with flex 1, so it will fill the maximum of screen
            //as it can.
            screen.add(eyeDesktop, {
                flex: 1
            });

            //when a new eyeWindow is created, a message thorugh dbus is send in eyeos.ui.Window
            //with category interface and eventName windowCreated
            var bus = eyeos.messageBus.getInstance();
            bus.addListener('eyeos_interface_windowCreated', function (e) {
                //get the received window and add it to eyeDesktop
                var window = e.getData();
                eyeDesktop.add(window);
            }, this);

            //we need to store screen and eyeDesktop inside dbus, using store
            //so other parts of the system can access them.
            bus.store('screen', screen);
            bus.store('eyeDesktop', eyeDesktop);
            bus.store('user', user);

            //we create the dashboard
            //dashboard is created ever, even if the user has selected classic desktop
            //because classic desktop is dashboard with a single fullscreen widget
            var dashboard = new eyeos.dashboard.Board();

            eyeDesktop.add(dashboard, {
                edge: 0
            });

            //notifications part
            var notificationsPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox());
            notificationsPanel.set({
                zIndex: 9000000
            });

            bus.store('notificationsPanel', notificationsPanel);

            bus.addListener('eyeos_desktop_showDesktopNotification', function (e) {
                var text = e.getData()[0];
				if(e.getData().length > 1 && e.getData()[1]) {
					var type = e.getData()[1];
				} else {
					var type = 'info';
				}

                var notification = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                    width: 200,
                    minHeight: 50,
                    backgroundColor: '#232D34',
                    //	decorator rounded all borders
                    decorator: new qx.ui.decoration.RoundBorderBeveled().set({
                        leftTopR: 5,
                        rightTopR: 5,
                        leftBottomR: 5,
                        rightBottomR: 5
                    }),
                    opacity: 0,
                    marginBottom: 10
                });

				if (navigator.appName == 'Microsoft Internet Explorer') {
					notification.setDecorator(null);
				}
				
                var informationName = new qx.ui.basic.Label().set({
                    value: '<b style="color:white">'+escapeHtml(tr(text))+'</b>',
                    rich: true,
                    padding: 10
                });
                notification.add(informationName, {
                    flex: true
                });

				if(type == 'wait') {
					var icon = new qx.ui.basic.Image();
					icon.setSource('eyeos/extern/images/Loading_animation.gif');
					icon.set({
						marginLeft: 10,
						marginBottom: 10
					});
					notification.add(icon);
				}

                notificationsPanel.addAt(notification, 0);

                var timer = new qx.event.Timer(30);
                timer.addListener("interval", function() {
                    var currentOpacity = notification.getOpacity();
                    if(parseFloat(currentOpacity) >= '1') {
                        timer.stop();
                        //we wait 5 secons, and start the second timer
						if(type == 'info') {
							qx.event.Timer.once(function(e) {
								var timerfinal = new qx.event.Timer(30);
								timerfinal.addListener("interval", function() {
									var currentOpacity = notification.getOpacity();
									if(parseFloat(currentOpacity) < 0.1) {
										timerfinal.stop();
										notification.destroy();
									}
									notification.setOpacity(parseFloat(currentOpacity)-0.1)
								}, this);
								timerfinal.start();
							}, this, 5000);
						} else {
							if(!this.wait) {
								this.wait = {};
							}
							this.wait[e.getData()[2]] = notification;
						}

                    }
                    notification.setOpacity(parseFloat(currentOpacity)+0.1)
                }, this)

                timer.start();

            }, this);

            bus.addListener('eyeos_desktop_removeDesktopNotification', function (e) {
                var id = e.getData()[0];
				this.wait[id].destroy();
            }, this);
            
            eyeDesktop.add(notificationsPanel, {
                right: 10,
                bottom: 20
            });

            //detect browser window resize
            eyeDesktop.addListener('resize', function() {
                var bounds = eyeDesktop.getBounds();

                if (this._imageContainer != undefined && this._dashImage != undefined) {
                    this._imageContainer.set({
                        width: bounds.width,
                        height: bounds.height
                    });
                    //
                    this._dashImage.set({
                        width: bounds.width,
                        height: bounds.height
                    });
                }
            }, this);

            //store the user metadata inside a object for later usage
            var meta = eyeos.getCurrentUserData().metadata;

            //when eyeDesktop appeared, its time to load wallpaper and launch autorun applications
            eyeDesktop.addListener("appear",function(){
                // BACKGROUND & WALLPAPER
                this._imageContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
                this._dashImage = new qx.ui.basic.Image().set({
					
                });

                if (meta['eyeos.user.desktop.wallpaperMode'] == undefined) {
                    this._dashImage.setBackgroundColor('#F4F4F4');
                } else {
                    if (meta['eyeos.user.desktop.wallpaperMode'] == 'color') {
                        var colors = meta['eyeos.user.desktop.backgroundColors'];
                        for (var i in colors) {
                            if (colors[i] == 'true') {
                                this._dashImage.setBackgroundColor(i);
                            }
                        }
                    } else {
                        this._dashImage.setBackgroundColor('white');
                        var splitted = meta['eyeos.user.desktop.wallpaper'].split('/');
                        if(meta['eyeos.user.desktop.wallpaper']) {
                            if (splitted[0] == 'sys:') {
                                this._dashImage.setSource('index.php?extern=images/wallpapers/' + splitted[splitted.length - 2] + '/' + splitted[splitted.length - 1]);
                            } else {
                                this._dashImage.setSource('index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=' + meta['eyeos.user.desktop.wallpaper']);
                            }
                        } else {
                            this._dashImage.setSource('index.php?extern=images/wallpapers/nature/default.jpg');
                        }

                    }
                }

				if(this._dashImage.getSource() == 'index.php?extern=images/wallpapers/nature/default.jpg') {
					this._dashImage.addListener('loaded', function(e) {
						var ele = e.getTarget().getContentElement();
						ele.setStyle('backgroundPosition', 'bottom right');
					}, this);
				}

                var bounds = eyeDesktop.getBounds();
                //
                this._imageContainer.set({
                    width: bounds.width,
                    height: bounds.height,
                    allowGrowX: true,
                    allowStretchX: true,
                    allowStretchY: true,
                    allowGrowY: true
                });
                //
                this._dashImage.set({
                    width: bounds.width,
                    height: bounds.height,
                    allowGrowX: true,
                    allowStretchX: true,
                    allowStretchY: true,
                    allowGrowY: true
                });
                this._imageContainer.add(this._dashImage);
                eyeDesktop.add(this._imageContainer);
                this._dashImage.set({
                    zIndex: 10
                });


                // LOGIN APPLICATIONS

                if (meta['eyeos.user.applications.onLogin'] != undefined) {
                    var onLoginApps = meta['eyeos.user.applications.onLogin'];
                    for (var i in onLoginApps) {
                        if (onLoginApps[i] == 'true') {
                            eyeos.execute(i, this.getChecknum());
                        }
                    }
                }


				// Welcome Message

				if(meta['eyeos.user.desktop.showWelcome'] == undefined || meta['eyeos.user.desktop.showWelcome'] != 'false' ) {
					eyeos.execute('welcomepage', this.getChecknum());
				}

            },this);

            bus.store('eyeDashBoard', dashboard);

            //it is needed to check what have the user configured.
            //if the user have classic desktop, set the columns to 1, rebouild dashboard (apply)
            //and then remove all widgets
            //if the user have dashboard selected, set columns to the value desired by the user
            //and rebuild
            if (eyeos.getCurrentUserData().metadata['eyeos.desktop.mode'] != undefined) {
                var widgetManager = desktop.WidgetManager.getInstance();
                if (eyeos.getCurrentUserData().metadata['eyeos.desktop.mode'] == 'classic') {
                    dashboard.setDesktopMode('classic');
                    dashboard.setContainerNumber(1);
                    dashboard.rebuild();
                    dashboard.removeAllWidgets();
                    widgetManager.createDesktopWidgetAlone(this.getChecknum(), files);
                } else {
                    dashboard.setDesktopMode('dashboard');
                    dashboard.setContainerNumber(eyeos.getCurrentUserData().metadata['eyeos.desktop.dashboard.nbcolumns']);
                    dashboard.rebuild();
                    widgetManager.loadWidgets(this.getChecknum());
                }
            }
            
            var dbus = eyeos.messageBus.getInstance();
            var self = this;
            dbus.addListener('eyeos_desktop_changesDashboard', function (e) {
                var widgetManager = desktop.WidgetManager.getInstance();
                if (e.getData()[0] == 'classic') {
                    this.setDesktopMode('classic');
                    this.setContainerNumber(1);
                    this.rebuild();
                    this.removeAllWidgets();
                    widgetManager.createDesktopWidgetAlone(self.getChecknum());
                } else {
                    this.setDesktopMode('dashboard');
                    this.setContainerNumber(e.getData()[2]);
                    this.rebuild();
                    if (e.getData()[1] != e.getData()[0]) {
                        this.removeAllWidgets();
                        var widgetManager = desktop.WidgetManager.getInstance();
                        widgetManager.loadWidgets(self.getChecknum());
                    }
                }
            }, dashboard);

            //when the wallpaper is changed, we need to refresh the desktop
            //to show the selected walpaper/color
            dbus.addListener('eyeos_desktop_changeWallpaper', function (e) {
                var mode = e.getData()[0];
                var item = e.getData()[1];

                if (mode != undefined && item != undefined) {
                    if (mode == 'color') {
                        this._dashImage.setSource(null);
                        this._dashImage.setBackgroundColor(item);
                    } else {
                        this._dashImage.setBackgroundColor('transparent');
                        var splitted = item.split('/');
                        if (splitted[0] == 'sys:') {
                            this._dashImage.setSource('index.php?extern=images/wallpapers/' + splitted[splitted.length - 2] + '/' + splitted[splitted.length - 1]);
                        } else {
                            this._dashImage.setSource('index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=' + item);
                        }
                    }
                }
            }, this);

			desktop.actionManager.getInstance().setChecknum(this.getChecknum());
			desktop.chatManager.getInstance().setChecknum(this.getChecknum());
			desktop.chatManager.getInstance().registerListeners(this);

			window.onbeforeunload = function(e) {
				return "You are about to leave your eyeOS session, are you sure you want to continue?";
			};

			eyeos.execute('taskbar', this.getChecknum());
			eyeos.execute('topmenu', this.getChecknum());
        }
    }
});