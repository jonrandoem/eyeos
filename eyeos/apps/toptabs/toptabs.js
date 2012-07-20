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

function toptabs_application(checknum, pid, args) {
    var application = new eyeos.application.Toptabs(checknum, pid);
    application.initApplication(checknum, args);
}

qx.Class.define('eyeos.application.Toptabs', {
    extend: eyeos.system.EyeApplication,

    construct: function (checknum, pid) {
        arguments.callee.base.call(this, 'toptabs', checknum, pid);
    },

    properties: {

    },

    members: {
        initApplication: function(checknum, args) {
            var bus = eyeos.messageBus.getInstance();
            var user = bus.retrieve('user');
            var screen = bus.retrieve('screen');
            var eyeDesktop = bus.retrieve('eyeDesktop');

            var isAdmin = args[0];
            
            //	Container TabView
            var containtTabs = new qx.ui.container.Composite(new qx.ui.layout.Grow());
            containtTabs.set ({
                'zIndex' : 500002
            });

            //add containTabs to eyeDesktop.
            //it is added to eyeDesktop instead of screen because tabs can be on top of windows.
            //window are places inside eyeDesktop because is the desktop manager.
            //the height 50% is because tabs fill half of the screen when displayed, not more.
            eyeDesktop.add(containtTabs, {
                width:"100%",
                height: "50%"
            });

            var tabView = new qx.ui.EyeTabDesktop();
            bus.store('eyeDesktopTabs', tabView);
            
           //	Tab 1
            var applicationsActions = [
            {
                name: tr("Added")

            },
            {
                name: tr("Add Applications")
            }
            ];

            var tagsApplications = [
            {
                id : 0,
                name : tr('All')
            },
            {
                id : -2,
                name : tr('Recent Installed')
            }
            ];

            var pgApplications = new eyeos.ui.tabs.Page(tr('Applications'), checknum, false);
            tabView.add(pgApplications);
            pgApplications.setTags(tagsApplications);
            pgApplications.setActions(applicationsActions);
            pgApplications.populate();
            pgApplications.populateActionToolbar();
            pgApplications.getChildControl("button").blur();

            //	Tab 2
            //	var pgWidgets = new qx.ui.tabview.Page(tr('Widgets'));
            //	tabView.add(pgWidgets);

            //	Tab 3 PEOPLE
            var peopleActions = [
            {
                name: tr('Added')

            },
            {
                name: tr('Add Contacts')
            },
            {
                name: tr('Add to List'),
                command: ''
            },
            {
                name: tr('Delete contacts'),
                icon: 'index.php?extern=/images/16x16/actions/list-remove.png',
                command: 'this.deleteContacts()'
            }
            ];

            var pgPeople = new eyeos.ui.tabs.Page(tr("People"), checknum, true);
            tabView.add(pgPeople);
            //modified to stackable
            eyeos.callMessage(checknum, 'getAllTags', null, function (results) {
                var tagAll = {
                    'id': 0,
                    'name': tr('All')
                };
                var pending = {
                    'id' : -1,
                    'name' : tr('Pending')
                }
                results.unshift(tagAll);
                results.unshift(pending);

                pgPeople.setTags(results);
                pgPeople.setActions(peopleActions);
                pgPeople.populate();
                pgPeople.populateActionToolbar();
            }, this);


            //	Tab 4
            var pgGroups = new eyeos.ui.tabs.Page(tr('Groups'), checknum, false);
            tabView.add(pgGroups);
            var tagGroups = new Array();
            tagGroups.push({
                id: -1,
                name: tr('All Groups')
            });
            tagGroups.push({
                id: 0,
                name: tr('Owner')
            });
            tagGroups.push({
                id: 1,
                name: tr('Admin')
            });
            tagGroups.push({
                id: 2,
                name: tr('Editor')
            });
            tagGroups.push({
                id: 3,
                name: tr('Member')
            });

            var actionsGroup = [
            {
                name: tr('Added')

            },
            {
                name: tr('Add Groups')
            },
            {
                name: tr('Create New Group'),
                command: 'this.createNewGroup()'
            }
            ];
            //	pgGroups.setActions(actionsGroup);
            pgGroups.setTags(tagGroups);
            pgGroups.setActions(actionsGroup);
            pgGroups.populate();
            pgGroups.populateActionToolbar();

            // EVENTS tab

            var pgEvents = new eyeos.ui.tabs.Events.Page(checknum);
            tabView.add(pgEvents);

            // --------------------------------------


            //	process the tabs
            tabView.processTabs();

            //	Add tabView to container
            containtTabs.add(tabView);

            //	decorator rounded top borders
            var border = new qx.ui.decoration.RoundBorderBeveled().set({
                leftTopR: 5,
                rightTopR: 5
            });
            //	decorator rounded all borders
            var borderAll = new qx.ui.decoration.RoundBorderBeveled().set({
                leftTopR: 3,
                rightTopR: 3,
                leftBottomR: 3,
                rightBottomR: 3
            });

            //	infoUser
            var cmpInfoUser= new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
            cmpInfoUser.set({
                decorator: borderAll
            })
            cmpInfoUser.setHeight(18);
            cmpInfoUser.setMaxHeight(18);
            cmpInfoUser.setMarginBottom(3);
            var infoUser = new qx.ui.basic.Label("<b>"+user+"</b>");
            infoUser.setTextColor("#FFFFFF");
            infoUser.setPadding(2);
            infoUser.setFont(new qx.bom.Font(11, ["Helvetica","Arial","Lucida Grande", "Verdana", "Sans", "FreeSans"]));
            cmpInfoUser.add(infoUser);
            infoUser.set({
                rich:true
            });

            // administration
            var cmpAdministration= new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
            cmpAdministration.set({
                decorator: borderAll,
                visibility: 'excluded'
            });
            cmpAdministration.setHeight(18);
            cmpAdministration.setMaxHeight(18);
            cmpAdministration.setMarginBottom(3);
            var infoAdministration = new qx.ui.basic.Label(tr('Administration'));
            infoAdministration.setTextColor("#FFFFFF");
            infoAdministration.setPadding(2);
            infoAdministration.setFont(new qx.bom.Font().set({
                'family': ["Helvetica","Arial","Lucida Grande", "Verdana", "Sans", "FreeSans"],
                'size': 11
            }));
            cmpAdministration.add(infoAdministration);

            cmpAdministration.addListener("mouseover", function () {
                cmpAdministration.setBackgroundColor("#61676d");
            }, this);

            cmpAdministration.addListener("mouseout", function (e) {
                if (!qx.ui.core.Widget.contains(cmpAdministration, e.getRelatedTarget())) {
                    cmpAdministration.setBackgroundColor("#232D34");
                }
            }, this);

            cmpAdministration.addListener("click", function () {
                eyeos.execute('usermanagement', checknum);
                tabView.hideContent();
            }, this);

            //modified to stackable
            if(isAdmin) {
                cmpAdministration.setVisibility('visible');
            }

            //	Settings
            var cmpSettings= new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
            cmpSettings.set({
                decorator: borderAll
            })
            cmpSettings.setHeight(18);
            cmpSettings.setMaxHeight(18);
            cmpSettings.setMarginBottom(3);
            var Settings = new qx.ui.basic.Label(tr("Settings"));
            Settings.setTextColor("#FFFFFF");
            Settings.setPadding(2);
            Settings.setFont(new qx.bom.Font(11, ["Helvetica","Arial","Lucida Grande", "Verdana", "Sans", "FreeSans"]));
            cmpSettings.add(Settings);
            cmpSettings.addListener("mouseover", function () {
                cmpSettings.setBackgroundColor("#61676d");
            });
            cmpSettings.addListener("mouseout", function (e) {
                if (!qx.ui.core.Widget.contains(cmpSettings, e.getRelatedTarget())) {
                    cmpSettings.setBackgroundColor("#232D34");
                }
            });

            cmpSettings.addListener("click", function () {
                eyeos.execute('newusersettings',checknum);
                document.eyeDesktopTabs.hideContent();
            }, this);

            //Sign Out
            var cmpSignOut= new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
            //cmpHelp.setBackgroundColor("#61676d");
            cmpSignOut.set({
                decorator: borderAll
            })
            cmpSignOut.setHeight(18);
            cmpSignOut.setMaxHeight(18);
            cmpSignOut.setMarginBottom(3);
            var signOut = new qx.ui.basic.Label(tr("Sign out"));
            signOut.setTextColor("#FFFFFF");
            signOut.setPadding(2);
            signOut.setFont(new qx.bom.Font(11, ["Helvetica","Arial","Lucida Grande", "Verdana", "Sans", "FreeSans"]));
            cmpSignOut.add(signOut);
            cmpSignOut.addListener("mouseover", function () {
                cmpSignOut.setBackgroundColor("#61676d");
            });
            cmpSignOut.addListener("mouseout", function (e) {
                if (!qx.ui.core.Widget.contains(cmpSignOut, e.getRelatedTarget())) {
                    cmpSignOut.setBackgroundColor("#232D34");
                }
            });

            cmpSignOut.addListener("click", function () {
                var op = new eyeos.dialogs.OptionPane(tr("Are you sure you want to close your session?"), eyeos.dialogs.OptionPane.QUESTION_MESSAGE);
                op.createDialog(null, tr("Close Session"), function(result) {
                    if(result == eyeos.dialogs.OptionPane.YES_OPTION) {
                        var timer = qx.util.TimerManager.getInstance();
                        //                        timer.stop(this._timerId);
                        var userId = eyeos.getCurrentUserData().id;
                        eyeos.execute('logout', -1, userId);
                    }
                }, this).open();
            }, this);

            //Composite that contain search, infoUser, etc...
            var layoutCmp = new qx.ui.layout.HBox(5);
            var cmpTabs = new qx.ui.container.Composite(layoutCmp);
            layoutCmp.setAlignX("right");
            layoutCmp.setAlignY("bottom");
            cmpTabs.setHeight(32);
            cmpTabs.setMaxHeight(32);
            tabView.getSlide().add(cmpTabs, {
                flex: 1
            });
            tabView.getSlide().setBackgroundColor("#232D34");
            cmpTabs.add(cmpInfoUser);
            cmpTabs.add(cmpAdministration);
            cmpTabs.add(cmpSettings);
            cmpTabs.add(cmpSignOut);

            bus.store('eyeTabs', tabView);
        }
    }
});