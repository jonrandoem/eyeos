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

qx.Class.define('desktop.widget.desktop', {
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
            return "Desktop";
        },

        createWidget: function() {
            var widget = new eyeos.dashboard.Widget(tr('Desktop'), this.getId(), 'files', false, this.getChecknum()).set({
                icon: 'index.php?extern=/images/16x16/apps/system-file-manager.png'
            });

            widget.setExecuteFullAppParameters(new Array("home://~root/Desktop"));

            var widgetContainer = new qx.ui.container.Composite(new qx.ui.layout.Flow()).set({
                'allowShrinkY': false,
                padding: 5
            });
            widget.setUserData('container', widgetContainer);
            widget.addContent(widgetContainer);
            var path = 'home://~' + eyeos.getCurrentUserName() + '/Desktop';

            widgetContainer.setUserData('path', path);
            eyeos.callMessage(
                this.getChecknum(),
                "__FileSystem_browsePath",
                new Array(path, null, this._browseOptions), //???????????
                function (results) {
                    widgetContainer.removeAll();
                    var files = results.files;
                    for (var i = 0; i < files.length; ++i) {
                        this.createInnerContent(widgetContainer, files[i], false);
                    }
            }, this);

            var dbus = eyeos.messageBus.getInstance();
            var self = this;

            dbus.addListener('eyeos_files_new', function (e) {
                var sourcePath = e.getData()[0];
                var newFiles = e.getData()[1];
                if (this.getUserData('path') == sourcePath) {
                    self.createInnerContent(this, newFiles, false);
                }
            }, widgetContainer);

            dbus.addListener('eyeos_files_delete', function (e) {
                var sourcePath = e.getData()[0];
                var newFiles = e.getData()[1];
                var widgetChildrens = this.getChildren();
                var widgetPaths = new Array();

                for (var i = 0; i < widgetChildrens.length; ++i) {
                    widgetPaths.push(widgetChildrens[i].getUserData('path'));
                }

                for (var i = 0; i < newFiles.length; ++i) {
                    var index = widgetPaths.indexOf(newFiles[i]);
                    if (index != -1 && widgetChildrens[index] != undefined) {
                        widgetChildrens[index].destroy();
                    }
                }
            }, widgetContainer);

            widget.openAndPlace(document.eyeDashBoard.getFirstContainer(), 0);
            this.setInternalWidget(widget);
        },

        createInnerContent: function (widgetContainer, file, alone) {
            var checknum = this.getChecknum();
            var imageExtensions = ['JPG', 'JPEG', 'PNG', 'GIF'];
            var videoExtensions = ['FLV'];
            var musicExtensions = ['MP3', 'M4A'];
            var docExtensions = ['EDOC', 'DOC', 'TXT', 'XLS', 'ODS'];
            var zipExtensions = ['ZIP'];
            var image = null;
            if (file.type == 'folder') {
                image = 'index.php?extern=images/48x48/places/folder.png';
            } else if (docExtensions.indexOf(file.extension) != -1) {
                image = 'index.php?extern=images/48x48/mimetypes/application-msword.png';
            } else if (imageExtensions.indexOf(file.extension) != -1) {
                image = 'index.php?extern=images/48x48/mimetypes/image-x-generic.png';
            } else if (musicExtensions.indexOf(file.extension) != -1) {
                image = 'index.php?extern=images/48x48/mimetypes/audio-x-generic.png';
            } else if (videoExtensions.indexOf(file.extension) != -1) {
                image = 'index.php?extern=images/48x48/mimetypes/audio-vnd.rn-realvideo.png';
            }else if (zipExtensions.indexOf(file.extension) != -1) {
                image = 'index.php?extern=images/48x48/mimetypes/application-x-gzip.png';
            } else if(file.extension == 'LNK') {
                var info = qx.util.Json.parse(file.content);
                image = info.icon;
            }else {
                image = 'index.php?extern=images/48x48/mimetypes/application-x-zerosize.png';
            }
            var name = file.name;
            if(file.extension == 'LNK') {
                name = name.substr(0, name.length-4);
            }
            var atom = new qx.ui.basic.Atom(name, image).set({
                rich: true,
                'iconPosition': 'top',
                //'font': new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
                //'textColor': '#FFFFFF',
                'width': 76,
                'padding': 5,
                decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5)
            });

            if (alone) {
                atom.addListener('appear', function (e) {
                    var domele = this.getChildControl('label').getContainerElement().getDomElement();
                    domele.childNodes[0].style.fontFamily = 'Helvetica';
                    domele.childNodes[0].style.fontSize = '12px';
                    domele.childNodes[0].style.textShadow =  '#000000 0px 0px 1px';
                    domele.childNodes[0].style.color = '#FFFFFF';
                    domele.childNodes[0].style.fontWeight = 'bold';
                });
            }

            //			atom.getChildControl('label').set({
            //				'shadow': new qx.ui.decoration.Single(1, 'solid', '#404040')
            //			});

            atom.setUserData('path', file.absolutepath);
            if (file.type == 'folder') {
                atom.addListener('dblclick', function () {
                    eyeos.execute('files', checknum, [this.getUserData('path')]);
                });
            } else {
                var listenerFunction =  function () {
                    eyeos.openFile(this.getUserData('path'), checknum);
                };
                atom.addListener('dblclick', listenerFunction);
            }
            atom.addListener('mouseover', function () {
                this.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, '#CCCCCC', 1, 5, 5, 5, 5));
            });

            atom.addListener('mouseout', function (e) {
                if (!qx.ui.core.Widget.contains(atom, e.getRelatedTarget())) {
                    this.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, null, 1, 5, 5, 5, 5));
                }
            });
            widgetContainer.add(atom);
        }
    }
});