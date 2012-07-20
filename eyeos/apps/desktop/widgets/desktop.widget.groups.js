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

qx.Class.define('desktop.widget.groups', {
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
            return "My Groups";
        },

        createWidget: function() {
            if (this.getSettings() == null) {
                var settings = '';
            } else {
                var settings = this.getSettings();
            }

            var checknum = this.getChecknum();
            var id = this.getId();

            function createMyGroupItem (name, id) {
                // events are quiet out of control right now, we need a totally
                // revision about the events framework, how the components use it,
                // how we manage the Adapters and so on. Right now, it's a quick
                // fix to avoid duplicated events....
                var children = widgetContainer.getChildren();
                for(var foo = 0; foo < children.length; ++foo) {
                    if(children[foo].getUserData('id') == id) {
                        return;
                    }
                }

                var groupName = name;
                var group = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                    alignX : 'center',
                    alignY : 'middle',
                    width : 76,
                    height: 76,
                    padding: 5,
                    decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5)
                });
                group.setUserData('id', id);
                var image = new qx.ui.basic.Image('index.php?checknum=' + checknum + '&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + id + '&refresh=' + new Date().getTime()).set({
                    width: 48,
                    alignX : 'center',
                    height: 48,
                    allowGrowX: false,
                    allowGrowY: false,
                    margin: 3,
                    scale: true
                });
                group.add(image);
                var label = new qx.ui.basic.Label().set({
                    value: groupName,
                    alignX : 'center',
                    rich: false,
                    paddingTop: 3,
                    marginRight: 0,
                    textAlign: 'center',
                    font: new qx.bom.Font(11, ["Lucida Grande", "Verdana"])
                });
                group.add(label);

                group.addListener('mouseover', function () {
                    this.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, '#CCCCCC', 1, 5, 5, 5, 5));
                });

                group.addListener("mouseout", function(e) {
                    if (!qx.ui.core.Widget.contains(group, e.getRelatedTarget())) {
                        group.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5));
                    }
                }, this);

                group.addListener("dblclick", function () {
                    eyeos.execute('files', checknum, ['workgroup://~' + groupName], null);
                }, this);

                widgetContainer.add(group);
            }


            var widget = new eyeos.dashboard.Widget(tr('My Groups'), id, '', false, checknum).set({
                icon: 'index.php?extern=/images/16x16/apps/system-users.png'
            });

            if(settings.minimized) {
                widget.toggleMinimize();
            }

            var widgetContainer = new qx.ui.container.Composite(new qx.ui.layout.Flow()).set({
                'allowShrinkY': false,
                padding: 5
            });

            widget.setUserData('container', widgetContainer);
            widget.addContent(widgetContainer);

            /*
				 * Populate Groups
				 */

            eyeos.callMessage(checknum, '__Workgroups_getAllWorkgroupsByUser', {
                includeMeta: 'true'
            }, function (groups) {
                for (var i = 0; i < groups.length; ++i) {
                    if (groups[i].status == eyeos.ui.tabs.GroupAll.STATUS_MEMBER) {
                        createMyGroupItem(groups[i]['workgroup'].name, groups[i]['workgroup'].id);
                    }
                }
            }, this);

            /*
				 * LISTENERS
				 */

            //Adding A Group, eyeos_workgroup_Group
            var bus = eyeos.messageBus.getInstance();

            bus.addListener('eyeos_workgroup_updateGroup', function (e) {
                // removing old widget's element...
                widgetContainer.getChildren().forEach(function(child) {
                    if(child.getUserData('id') == e.getData().id) {
                        widgetContainer.remove(child);
                    }
                }, this);

                // and creating a new one with the updated parameters...
                createMyGroupItem(e.getData().title, e.getData().id);
            }, this);

            bus.addListener('eyeos_workgroup_createGroup', function (e) {
                var name = e.getData()[0];
                var id = e.getData()[1];
                createMyGroupItem(name, id);
            }, this);

            bus.addListener('eyeos_workgroup_joinGroup', function (e) {
                var name = e.getData()[0];
                var id = e.getData()[1];
                createMyGroupItem(name, id);
            }, this);

            bus.addListener('eyeos_workgroup_deleteGroup', function (e) {
                widgetContainer.getChildren().forEach(function(child) {
                    if(child.getUserData('id') == e.getData()) {
                        widgetContainer.remove(child);
                    }
                }, this);
            }, this);

            bus.addListener('eyeos_workgroup_leaveGroup', function (e) {
                widgetContainer.getChildren().forEach(function(child) {
                    if(child.getUserData('id') == e.getData()) {
                        widgetContainer.remove(child);
                    }
                }, this);
            }, this);

            var container = settings.column? document.eyeDashBoard.getContainer(settings.column) : document.eyeDashBoard.getContainer(1);
            var position = settings.position? parseInt(settings.position) : 0;
            widget.openAndPlace(container, position);
            this.setInternalWidget(widget);
        }
    }
});