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

qx.Class.define('desktop.widget.events', {
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
            return "Events";
        },

        createWidget: function() {
            if (this.getSettings() == null) {
                var settings = '';
            } else {
                var settings = this.getSettings();
            }

            var checknum = this.getChecknum();
            var id = this.getId();

             var widget = new eyeos.dashboard.Widget(tr('Events'), id, '', false, checknum).set({
                icon: 'index.php?extern=/images/events/activity_16x16.png'
            });

            if(settings.minimized) {
                widget.toggleMinimize();
            }

            var buttonsLayout = new qx.ui.container.Composite().set({
                layout: new qx.ui.layout.HBox(),
                backgroundColor: '#eeeeee',
                marginTop: 10,
                marginLeft: 10,
                marginRight: 10,
                padding: 3
            });
            widget.addContent(buttonsLayout);

            var widgetScroll = new qx.ui.container.Scroll().set({
                height: 160,
                allowGrowY: false
            });
            widget.addContent(widgetScroll, {
                flex: 1
            });

            var widgetContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                padding: 5
            });

            if (settings && settings.items) {
                var numberOfItems = parseInt(settings.items);
            } else {
                var numberOfItems = 5;
            }

            widget.setUserData('container', widgetContainer);
            widgetScroll.add(widgetContainer);

            var actualButtonSelected = 'All';

            createButtons(checknum);
            createSettingsForm();
            createContent(widgetContainer, actualButtonSelected, numberOfItems);
            addListeners();

            function addListeners() {
                var bus = eyeos.messageBus.getInstance();

                bus.addListener('eyeos_events_newEvent', function() {
                    createContent(widgetContainer, actualButtonSelected, numberOfItems);
                }, this);

                bus.addListener('eyeos_events_updateEvent', function() {
                    createContent(widgetContainer, actualButtonSelected, numberOfItems);
                }, this);
            }

            function createSettingsForm() {
                var form = widget._widgetSettingsPanelForm;
                var itemsLabel = new qx.ui.basic.Label(tr('number of items'));
                form.add(itemsLabel, {
                    row: 0,
                    column: 0
                });

                var itemsSpinner = new qx.ui.form.Spinner(1, numberOfItems, 20);
                form.add(itemsSpinner, {
                    row: 0,
                    column: 1
                });

                form.setUserData('settings_items', itemsSpinner);

                widget._widgetSettingsPanelButtonSave.addListener('execute', function() {
                    var params = new Array();
                    var settings = new Array();

                    settings = {
                        items: widget._widgetSettingsPanelForm.getUserData('settings_items').getValue()
                    };

                    params = {
                        widget: 'events',
                        settings: settings
                    };

                    eyeos.callMessage(checknum, 'saveSettingsWidget', params, function() {
                        numberOfItems = settings['items'];
                        createContent(widgetContainer, null, numberOfItems);
                    });
                });
                widget._widgetSettingsPanelButtonCancel.addListener('execute', function() {
                    itemsSpinner.setValue(numberOfItems);
                });

            }

            function createButtons (checknum) {
                buttonsLayout.removeAll();
                //	decorator rounded all borders
                var borderAll = new qx.ui.decoration.RoundBorderBeveled().set({
                    leftTopR: 3,
                    rightTopR: 3,
                    leftBottomR: 3,
                    rightBottomR: 3
                });

                createButton('All');
                createButton('Pending');
                createButton('Files');
                createButton('People');
                createButton('Groups');

                function createButton (name) {

                    var button = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
                    button.set({
                        decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5)
                    })
                    button.setHeight(18);
                    button.setMaxHeight(18);
                    var buttonLabel = new qx.ui.basic.Label(tr(name));
                    buttonLabel.setPadding(2);
                    buttonLabel.setFont(new qx.bom.Font(11, ["Lucida Grande", "Verdana"]));
                    button.add(buttonLabel);
                    if (actualButtonSelected == name) {
                        button.setBackgroundColor("#61676d");
                        buttonLabel.setTextColor('#ffffff');

                    } else {
                        buttonLabel.setTextColor("#000000");
                        button.addListener("mouseout", function (e) {
                            if (!qx.ui.core.Widget.contains(button, e.getRelatedTarget())) {
                                button.setBackgroundColor("#eeeeee");
                                buttonLabel.setTextColor('#000000');
                            }
                        });
                    }

                    button.addListener("mouseover", function () {
                        button.setBackgroundColor("#61676d");
                        buttonLabel.setTextColor('#ffffff');
                    });

                    button.addListener("click", function () {
                        actualButtonSelected = name;
                        createButtons(checknum);
                        createContent(widgetContainer, actualButtonSelected, numberOfItems);
                    });

                    buttonsLayout.add(button);
                }

                //create clear All button
                buttonsLayout.add(new qx.ui.core.Spacer(), {
                    flex: 1
                });

                var clearAllButton = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
                clearAllButton.set({
                    decorator: borderAll,
                    alignX: 'right'
                })
                clearAllButton.setHeight(18);
                clearAllButton.setMaxHeight(18);
                var clearAllLabel = new qx.ui.basic.Label(tr("clear"));
                clearAllLabel.setTextColor("#000000");
                clearAllLabel.setPadding(2);
                clearAllLabel.setFont(new qx.bom.Font(11, ["Lucida Grande", "Verdana"]));
                clearAllButton.add(clearAllLabel);
                clearAllButton.addListener("mouseover", function () {
                    clearAllButton.setBackgroundColor("#61676d");
                    clearAllLabel.setTextColor('#ffffff');
                });
                clearAllButton.addListener("mouseout", function (e) {
                    if (!qx.ui.core.Widget.contains(clearAllButton, e.getRelatedTarget())) {
                        clearAllButton.setBackgroundColor("#eeeeee");
                        clearAllLabel.setTextColor('#000000');
                    }
                });

                clearAllButton.addListener("click", function () {
                    var childrens = widgetContainer.getChildren();
                    var arrayItems = new Array();
                    for (var i = 0; i < childrens.length; ++i) {
                        if (childrens[i].getUserData('isQuestion') == 0 || childrens[i].getUserData('hasEnded') == 1) {
                            arrayItems.push(parseInt(childrens[i].getUserData('id')));
                        }
                    }
                    var params = {
                        'id': arrayItems
                    };
                    eyeos.callMessage(checknum,	"__Events_deleteEvents", params, function (results) {
                        createContent(widgetContainer, actualButtonSelected, numberOfItems);
                    });
                }, this);

                buttonsLayout.add(clearAllButton);
            }

            function createContent(widgetContainer, action, numberItems) {
                if (numberItems == null) {
                    numberItems = parseInt(settings.items);
                }
                //delete all items
                widgetContainer.removeAll();

                if (action == null || action == 'All') {
                    var params = {
                        from: 0,
                        to: parseInt(numberItems)
                    };
                    eyeos.callMessage(checknum,	"__Events_retrieveAllEventNotifications", params, function (results) {
                        for (var i = 0; i < results.length; ++i) {
                            createItem(results[i], i);
                        }
                    });
                } else {
                    var params = {
                        from: 0,
                        to: parseInt(numberItems),
                        type: action
                    }
                    eyeos.callMessage(checknum,	"__Events_retrieveAllEventsByType", params, function (results) {
                        for (var i = 0; i < results.length; ++i) {
                            createItem(results[i], i);
                        }
                    });
                }
            }

            function createItem(result, num) {
                var backColor = num%2 == 0 ? '#FFFFFF' : '#F0F0F0';
                var type = result.type;

                type = type.substring(0, type.indexOf('_'));
                var item = new qx.ui.container.Composite().set({
                    layout: new qx.ui.layout.VBox(),
                    marginRight: 5,
                    paddingRight: 5,
                    marginLeft: 5,
                    paddingLeft: 5,
                    paddingBottom: 5,
                    backgroundColor: backColor,
                    alignY: 'middle'
                });
                item.setUserData('id', result.id);
                item.setUserData('availableAnswers', result.availableAnswers);
                item.setUserData('isQuestion', result.isQuestion);
                item.setUserData('hasEnded', result.hasEnded);

                var cmpDate = new qx.ui.container.Composite().set({
                    layout: new qx.ui.layout.HBox()
                });
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

                var eventIcon = new qx.ui.basic.Image(path).set({
                    alignY : 'middle',
                    alignX : 'left',
                    paddingLeft : 3,
                    paddingRight : 3,
                    paddingTop : 0
                });
                var dt = new Date(result.creationDate * 1000);
                function checkTime(i)
                {
                    if (i<10)
                    {
                        i="0" + i;
                    }
                    return i;
                }

                var labelDate = new qx.ui.basic.Label().set({
                    value: dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear() + " " + dt.getHours() + ":" + checkTime(dt.getMinutes()),
                    rich: false,
                    paddingTop: 3,
                    marginRight: 0,
                    textAlign: 'right',
                    font: new qx.bom.Font(11, ["Lucida Grande", "Verdana"])
                });
                var buttons = new qx.ui.container.Composite(new qx.ui.layout.HBox(10)).set({
                    marginLeft: 20
                });
                if (result.isQuestion && !result.hasEnded) {
                    var actionsButtons = result.availableAnswers.split('#');
                    if (actionsButtons.length > 0) {
                        for (var i = 0; i < actionsButtons.length; ++i) {
                            var text = actionsButtons[i];
                            var button = new qx.ui.form.Button(text).set({
                                paddingTop: 0,
                                paddingBottom: 0,
                                paddingLeft: 2,
                                paddingRight: 2
                            });

                            button.addListener("click", function () {
                                var params = {
                                    id: parseInt(result.id),
                                    answer: this.getLabel()
                                };
                                eyeos.callMessage(checknum,	"__Events_handleAnswer", params, function (results) {
                                    createContent(widgetContainer, name);
                                });
                            });

                            buttons.add(button);
                        }
                    }
                }

                var deleteIcon = new qx.ui.basic.Image('index.php?extern=images/clear.png').set({
                    alignY : 'middle',
                    alignX : 'right',
                    paddingLeft : 3,
                    paddingRight : 0,
                    paddingTop : 0
                });
                deleteIcon.hide();
                deleteIcon.addListener("click", function () {
                    if (result.isQuestion == 0 || result.hasEnded == 1) {
                        var params = {
                            'id' : parseInt(result.id)
                        };
                        eyeos.callMessage(checknum,	"__Events_deleteEvents", params, function (results) {
                            createContent(widgetContainer, actualButtonSelected, numberOfItems);
                        });
                    } else {
                        alert(tr('Can\'t delete the event'));
                    }
                }, this);

                cmpDate.add(eventIcon);
                cmpDate.add(labelDate);
                cmpDate.add(buttons);
                cmpDate.add(new qx.ui.core.Spacer(), {
                    flex: 1
                });
                cmpDate.add(deleteIcon);
                var infoData = qx.util.Json.parse(result.messageInformation);
                var translatedInformation = tr(infoData[0], infoData[1]);
                var labelSubject = new qx.ui.basic.Label().set({
                    value: translatedInformation,
                    rich: false,
                    paddingTop: 3,
                    paddingLeft: 17,
                    //marginRight: 8,
                    font: new qx.bom.Font(11, ["Lucida Grande", "Verdana"])
                });
                item.addListener('mouseover', function () {
                    deleteIcon.show();
                });
                item.addListener('mouseout', function () {
                    deleteIcon.hide();
                });
                item.add(cmpDate);
                item.add(labelSubject);
                widgetContainer.add(item);
            }

            var container = settings.column? document.eyeDashBoard.getContainer(settings.column) : document.eyeDashBoard.getContainer(1);
            var position = settings.position? parseInt(settings.position) : 0;
            widget.openAndPlace(container, position);

            this.setInternalWidget(widget);
        }
    }
});