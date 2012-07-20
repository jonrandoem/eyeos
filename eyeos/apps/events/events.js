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
function events_application(checknum, pid, args) {
    var app = new eyeos.application.Events(checknum, pid, args);
    app.drawGUI();
}

qx.Class.define('eyeos.application.Events', {
    extend: eyeos.system.EyeApplication,

    construct: function(checknum, pid, args) {
        arguments.callee.base.call(this, 'events', checknum, pid);
    },

    members: {
		_pageEventsContent: null,
		_pagePeopleContent: null,
		_pageGroupsContent: null,
		_pageShareContent: null,
		_listener: null,

		close: function () {
			var dBus = eyeos.messageBus.getInstance();
			dBus.removeListenerById(this._listener);
			
			this.base(arguments);
		},
		
        drawGUI: function() {
            var mainWindow = new eyeos.ui.Window(this, tr('Events'));
            mainWindow.setWidth(700);
            mainWindow.setHeight(500);

            var winLayout = new qx.ui.layout.VBox();
            mainWindow.setLayout(winLayout);

			this._tabView = new qx.ui.tabview.TabView('left');
			this._tabView.set({
				'marginBottom' : 0,
				'paddingBottom' : 0
			});
			mainWindow.add(this._tabView, {flex:1});

			var pageEvents = new qx.ui.tabview.Page(tr('All Events'));
			pageEvents.setLayout(new qx.ui.layout.VBox());
			pageEvents.setDecorator(new qx.ui.decoration.RoundBorderBeveled('#999999', null, 1, 15, 15, 15, 15));

			this._pageEventsContent = new qx.ui.container.Composite();
			this._pageEventsContent.setLayout(new qx.ui.layout.VBox());
			var scroller = new qx.ui.container.Scroll(this._pageEventsContent);
			pageEvents.add(scroller, {flex: 1});

			this._tabView.add(pageEvents);

			var pagePeople = new qx.ui.tabview.Page(tr('People'));
			pagePeople.setLayout(new qx.ui.layout.VBox());
			pagePeople.setDecorator(new qx.ui.decoration.RoundBorderBeveled('#999999', null, 1, 15, 15, 15, 15));

			this._pagePeopleContent = new qx.ui.container.Composite();
			this._pagePeopleContent.setLayout(new qx.ui.layout.VBox());
			scroller = new qx.ui.container.Scroll(this._pagePeopleContent);
			pagePeople.add(scroller, {flex: 1});
			this._tabView.add(pagePeople);

			var pageGroups = new qx.ui.tabview.Page(tr('Groups'));
			pageGroups.setLayout(new qx.ui.layout.VBox());
			pageGroups.setDecorator(new qx.ui.decoration.RoundBorderBeveled('#999999', null, 1, 15, 15, 15, 15));

			this._pageGroupsContent = new qx.ui.container.Composite();
			this._pageGroupsContent.setLayout(new qx.ui.layout.VBox());
			scroller = new qx.ui.container.Scroll(this._pageGroupsContent);
			pageGroups.add(scroller, {flex: 1});
			this._tabView.add(pageGroups);

//			var pageApplications = new qx.ui.tabview.Page(tr('Applications'));
//			pageApplications.setLayout(new qx.ui.layout.VBox());
//			this._tabView.add(pageApplications);

			var pageShare = new qx.ui.tabview.Page(tr('Share'));
			pageShare.setLayout(new qx.ui.layout.VBox());
			pageShare.setDecorator(new qx.ui.decoration.RoundBorderBeveled('#999999', null, 1, 15, 15, 15, 15));

			this._pageShareContent = new qx.ui.container.Composite();
			this._pageShareContent.setLayout(new qx.ui.layout.VBox());
			scroller = new qx.ui.container.Scroll(this._pageShareContent);
			pageShare.add(scroller, {flex: 1});
			this._tabView.add(pageShare);

			this.refreshContent();

			var bus = eyeos.messageBus.getInstance();
			this._listener = bus.addListener('eyeos_events_newEvent', function(e) {
				this.refreshContent();
//				this.fillPage(pageEventsContent, [e.getData()], true);
			}, this);
			
			mainWindow.open();
        },

		refreshContent: function () {
			var numberItems = 50;
			var params = {
				from: 0,
				to: parseInt(numberItems)
			};

			eyeos.callMessage(this.getChecknum(),	"__Events_retrieveAllEventNotifications", params, function (results) {
				this.fillPage(this._pageEventsContent, results);
			}, this);

			var params = {
				from: 0,
				to: parseInt(numberItems),
				type: 'People'
			}

			eyeos.callMessage(this.getChecknum(),	"__Events_retrieveAllEventsByType", params, function (results) {
				this.fillPage(this._pagePeopleContent, results);
			}, this);

			var params = {
				from: 0,
				to: parseInt(numberItems),
				type: 'Groups'
			}

			eyeos.callMessage(this.getChecknum(),	"__Events_retrieveAllEventsByType", params, function (results) {
				this.fillPage(this._pageGroupsContent, results);
			}, this);

			var params = {
				from: 0,
				to: parseInt(numberItems),
				type: 'Share'
			}

			eyeos.callMessage(this.getChecknum(),	"__Events_retrieveAllEventsByType", params, function (results) {
				this.fillPage(this._pageShareContent, results);
			}, this);
		},

		fillPage: function(page, events, first) {
			page._removeAll();
			for (var i = 0; i < events.length; i++) {
				var result = events[i];
                var item = new qx.ui.container.Composite().set({
                    layout: new qx.ui.layout.HBox(),
                    paddingBottom: 5,
					height: 46,
					padding:0,
                    //backgroundColor: backColor,
                    alignY: 'middle'
                });

				item.addListener('appear', function() {
					this.getContainerElement().getDomElement().style.borderBottom = '1px dotted #999999';
				});
				
				
				item.setUserData('id', result.id);
                item.setUserData('availableAnswers', result.availableAnswers);
                item.setUserData('isQuestion', result.isQuestion);
                item.setUserData('hasEnded', result.hasEnded);
				
				var type = result.type;

				type = type.substring(0, type.indexOf('_'));
                var path = 'index.php?extern=images/events/activ_base-12x12.png';
                if (type == 'Files') {
                    path = 'index.php?extern=images/events/activ_files-12x12.png'
                }
                else if (type == 'Dashboard') {
                    path = 'index.php?extern=images/events/activ_dashboard-12x12.png'
                }
                else if (type == 'Applications') {
                    path = 'index.php?extern=images/events/activ_appli-12x12.png'
                }
                else if (type == 'People') {
                    path = 'index.php?extern=images/events/activ_people-12x12.png'
                }
                else if (type == 'Groups') {
                    path = 'index.php?extern=images/events/activ_groups-12x12.png'
                }
				else if (type == 'Share') {
					path = 'index.php?extern=images/events/activ_people-12x12.png'
				}
				
                var eventIcon = new qx.ui.basic.Image(path).set({
                    alignY : 'middle',
                    alignX : 'left',
                    paddingLeft : 3,
                    paddingRight : 3,
                    paddingTop : 0
                });
				item.add(eventIcon);

                var infoData = qx.util.Json.parse(result.messageInformation);
                var translatedInformation = tr(infoData[0], infoData[1]);
                var labelSubject = new qx.ui.basic.Label().set({
                    value: translatedInformation,
                    rich: false,
                    alignY : 'middle',
                    paddingLeft: 17,
                    //marginRight: 8,
                    font: new qx.bom.Font(12, ["Arial","Lucida Grande", "Verdana", "Sans"])
                });

				item.add(labelSubject);
				item.add(new qx.ui.core.Spacer(), {flex:1});
				//its a question?!
				
                if (result.isQuestion && !result.hasEnded) {
                    var actionsButtons = result.availableAnswers.split('#');
                    if (actionsButtons.length > 0) {
                        for (var x = 0; x < actionsButtons.length; x++) {
                            var text = actionsButtons[x];
							if(text == 'Confirm') {
								var marginRight = 20;
							} else {
								var marginRight = 10;
							}
                            var button = new qx.ui.container.Composite().set({
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 2,
                                paddingRight: 2,
								alignY : 'middle',
								marginRight: marginRight
                            });
							button.setUserData('id', result.id);
							button.setUserData('answer', text);
							button.setLayout(new qx.ui.layout.HBox());
							//icon
							if(text == 'Confirm') {
								var image = 'eyeos/extern/images/16x16/actions/dialog-ok-apply.png';
							} else {
								var image = 'eyeos/extern/images/16x16/actions/dialog-close.png';
							}
							var buttonIcon = new qx.ui.basic.Image(image).set({
								alignY : 'middle',
								alignX : 'left',
								paddingLeft : 3,
								paddingRight : 3,
								paddingTop : 0
							});

							button.add(buttonIcon);
				
							//text
							var buttonLabel = new qx.ui.basic.Label(text);
							buttonLabel.set({
								alignY : 'middle',
								//marginRight: 8,
								font: new qx.bom.Font(12, ["Arial","Lucida Grande", "Verdana", "Sans"])
							});

							button.add(buttonLabel);
							var checknum = this.getChecknum();
                            button.addListener("click", function () {
                                var params = {
                                    id: parseInt(this.getUserData('id')),
                                    answer: this.getUserData('answer')
                                };
                                eyeos.callMessage(checknum,	"__Events_handleAnswer", params, function (results) {
									this.getLayoutParent().exclude();
                                }, this);
                            });

                            item.add(button);
                        }
                    }
                }
				if(first) {
					page.addAt(item, 0);
				} else {
					page.add(item);
				}
				
			}
		}
    }
});