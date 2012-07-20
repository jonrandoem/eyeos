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

qx.Class.define('desktop.widget.favorites', {
    extend: qx.core.Object,
    implement: [desktop.widget.IWidget],

    construct: function (checknum, id) {
        this.setChecknum(checknum);
        this.setId(id);
    },

    properties: {
        checknum: {
            init: null
        },
        id: {
           init: null
        },
        settings: {
           init: null
        },
        internalWidget: {
            init:null
        }
    },

    members: {
        settings: null,

        getTitle: function() {
            return "Favorites";
        },

        createWidget: function() {
            if (this.getSettings() == null) {
                var settings = '';
            } else {
                var settings = this.getSettings();
            }

            var checknum = this.getChecknum();
            var id = this.getId();

            var widget = new eyeos.dashboard.Widget(tr('Favorite Applications'), id, '', false, checknum).set({
                icon: 'index.php?extern=/images/16x16/apps/preferences-desktop-default-applications.png'
            });

            if(settings.minimized) {
                widget.toggleMinimize();
            }

            //this.value = value;
            widget.container = new qx.ui.container.Composite(new qx.ui.layout.Flow()).set({
                allowShrinkY: false,
                padding: 5
            });
            widget.addContent(widget.container);

            // in order to avoid qooxdoo bug...
            widget.container.add(new qx.ui.container.Composite().set({
                height: 50,
                allowGrowY: false,
                width: 1,
                allowGrowX: false
            }));

            function createFavoriteItem(appName, displayName, imagePath, father) {
                //				if (item instanceof qx.ui.EyeTaskButtonFavorite) {
                // var appName = item.getLabel();
                var app = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                    alignX : 'center',
                    alignY : 'middle',
                    width : 76,
                    height: 76,
                    padding: 5,
                    decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5)
                });
                // app.setUserData('realName', item.getRealAppName());
                app.setUserData('realName', displayName);
                // var url = item.getIcon();
                //url = url +'&nocache=' + eyeos.utils.getRandomValue();
                var image = new qx.ui.basic.Image(imagePath).set({
                    width: 48,
                    alignX : 'center',
                    height: 48,
                    allowGrowX: false,
                    allowGrowY: false,
                    margin: 3
                //scale: true
                });
                app.add(image);
                var label = new qx.ui.basic.Label().set({
                    rich: true,
                    value: appName,
                    alignX : 'center',
                    paddingTop: 3,
                    marginRight: 0,
                    textAlign: 'center',
                    font: new qx.bom.Font(11, ['Lucida Grande', 'Verdana'])
                });
                app.add(label);

                app.addListener('dblclick', function() {
                    eyeos.execute(this.getUserData('realName'), checknum);
                });

                app.addListener('mouseover', function () {
                    this.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, '#CCCCCC', 1, 5, 5, 5, 5));
                });

                app.addListener('mouseout', function (e) {
                    if (!qx.ui.core.Widget.contains(app, e.getRelatedTarget())) {
                        this.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5));
                    }
                });

                father.container.add(app);
            //				}
            }

            if ((this instanceof Object) && (widget instanceof eyeos.dashboard.Widget)) {
                eyeos.callMessage(checknum, 'getFavoriteApplications', '', function (results) {
                    for (var i=0; i < results.length; ++i) {
                        var name = results[i]['name'];
                        var imagePath = results[i]['imagePath'] +'&nocache=' + eyeos.utils.getRandomValue();

                        var appName = results[i]['displayName'];

                        createFavoriteItem(appName, name, imagePath, this);
                    }
                }, widget);
            }


            var dbus = eyeos.messageBus.getInstance();
            dbus.addListener('eyeos_application_toggleFavorite', function (e) {
                var name = e.getData()[0];
                var appRealName = e.getData()[1];
                var isFavorite = e.getData()[2];
                var imagePath = e.getData()[3];

                var items = this.container.getChildren();

                if (!isFavorite) {
                    for (var i = 0; i < items.length; ++i) {
                        if ((items[i] instanceof qx.ui.container.Composite)) {
                            if (items[i].getUserData('realName') == appRealName) {
                                this.container.remove(items[i]);
                            }
                        }
                    }
                } else {
                    createFavoriteItem(name, appRealName, imagePath, this);
                }
            }, widget);

            var container = settings.column? document.eyeDashBoard.getContainer(settings.column) : document.eyeDashBoard.getContainer(1);
            var position = settings.position? parseInt(settings.position) : 0;
            widget.openAndPlace(container, position);
            
            this.setInternalWidget(widget);
        }
    }
});