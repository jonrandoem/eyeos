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

qx.Class.define('desktop.widget.notes', {
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
            return "Notes";
        },

        createWidget: function() {
            if (this.getSettings() == null) {
                var settings = '';
            } else {
                var settings = this.getSettings();
            }

            var checknum = this.getChecknum();
            var id = this.getId();

            var widget = new eyeos.dashboard.Widget(tr('Notes'), id, 'notepad', false, checknum).set({
                icon: 'index.php?extern=/images/16x16/apps/basket.png'
            });

            if(settings.minimized) {
                widget.toggleMinimize();
            }

            var widgetContainer = new qx.ui.container.Composite(new qx.ui.layout.Grow()).set({
                height: 150
            });

            widget.setUserData('container', widgetContainer);
            widget.addContent(widgetContainer);

            var content = '';
            var richWidget = new qx.ui.form.TextArea(content);
            eyeos.callMessage(checknum, 'readNotesWidget', '', function (results) {
                content = results;
                richWidget.setValue(results);
            });

            richWidget.set({
                decorator: new qx.ui.decoration.Single(1, 'solid', '#A4A4A4').set({
                    styleTop: null,
                    styleRight: null,
                    styleLeft: null,
                    styleBottom: null
                }),
                backgroundColor: 'white',
                padding: 10
            });
            var notesTimer = new qx.event.Timer(3000);
            notesTimer.addListener('interval', function(e) {
                notesTimer.stop();
                eyeos.callMessage(checknum, 'writeNotesWidget', richWidget.getValue(), function (results) {
                    });
            });
            richWidget.addListener('input', function(e) {
                notesTimer.restart();
            });
            widgetContainer.add(richWidget);

            var container = settings.column? document.eyeDashBoard.getContainer(settings.column) : document.eyeDashBoard.getContainer(1);
            var position = settings.position? parseInt(settings.position) : 0;
            widget.openAndPlace(container, position);
            
            this.setInternalWidget(widget);
        }
    }
});