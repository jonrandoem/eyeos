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
function newlink_application(checknum, pid, args) {
    var app = new eyeos.application.NewLink(checknum, pid, args);
    app.drawGUI();
}

qx.Class.define('eyeos.application.NewLink', {
    extend: eyeos.system.EyeApplication,

    construct: function(checknum, pid, args) {
        arguments.callee.base.call(this, 'newLink', checknum, pid);
        if(args && args[0]) {
            this.__path = args[0];
        } else {
            this.__path = 'home:///Desktop/';
        }

    },

    members: {
        __path: null,
        __icon: 'index.php?extern=images/48x48/mimetypes/application-x-mswinurl.png',
        drawGUI: function() {
            var mainWindow = new eyeos.ui.Window(this, tr('Create new link...'));
            mainWindow.setWidth(400);
            mainWindow.setHeight(260);
            
            mainWindow.setAllowMaximize(false);
            var winLayout = new qx.ui.layout.VBox();
            mainWindow.setLayout(winLayout);

            var informationName = new qx.ui.basic.Label().set({
                value: '<b>'+tr('Name of the new link')+'</b>',
                rich: true,
                marginBottom: 6,
                marginTop: 10
            });

            var linkName = new qx.ui.form.TextField();

            var information = new qx.ui.basic.Label().set({
                value: '<b>'+tr('Web address to link (URL)')+'</b>',
                rich: true,
                marginBottom: 6,
                marginTop: 10
            });

            var linkText = new qx.ui.form.TextField('http://');

            var sizes = new qx.ui.basic.Label().set({
                value: '<b>'+tr('Size of the window')+'</b>',
                rich: true,
                marginBottom: 6,
                marginTop: 10
            });

            var bottomPane = new qx.ui.container.Composite().set({
                marginTop: 15
            });
            bottomPane.setLayout(new qx.ui.layout.HBox());

            var iconPane = new qx.ui.container.Composite();
            iconPane.setLayout(new qx.ui.layout.VBox());

            var iconText = new qx.ui.basic.Label().set({
                value: '<b>'+tr('Icon for the link')+'</b>',
                rich: true,
                marginTop: 10
            });

            iconPane.add(iconText);

            var internalIconPane = new qx.ui.container.Composite();
            internalIconPane.setLayout(new qx.ui.layout.HBox());

            this._inputImage = new qx.ui.basic.Image().set({
                    marginLeft: 5,
                    marginTop: 10,
                    padding: 7,
                    decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5')
            });

            this._inputImage.setSource(this.__icon);

            internalIconPane.add(this._inputImage);

            //just avoid another hbox + spacer here, so I will use marginTop :)
            var internalIconText = new qx.ui.basic.Label().set({
                value: '<span style="color:blue">'+tr('Select icon')+'</span>',
                rich: true,
                marginTop: 60,
                marginLeft: 5
            });

            internalIconPane.add(internalIconText);
            iconPane.add(internalIconPane);

            internalIconText.addListener('click', function() {
                var iconChooser = new eyeos.dialogs.IconChooser(this.getChecknum());
                iconChooser.showIconDialog(mainWindow, '48x48', function(e) {
                     this.__icon = e;
                     this._inputImage.setSource(e);
                }, this);
            }, this);
            
            
            var sizesPane = new qx.ui.container.Composite();
            var paneLayout = new qx.ui.layout.VBox();
            sizesPane.setLayout(paneLayout);


            var widthPane = new qx.ui.container.Composite();
            widthPane.setLayout(new qx.ui.layout.HBox());

            var widthInfo = new qx.ui.basic.Label().set({
                value: tr('Width: '),
                rich: true,
                marginBottom: 6,
                marginTop: 10
            });

            var widthText = new qx.ui.form.Spinner('700').set({
                marginLeft: 10,
                marginTop: 5,
                width: 120,
                maximum: 3000,
                minimum: 10
            });

            var heightPane = new qx.ui.container.Composite();
            heightPane.setLayout(new qx.ui.layout.HBox());

            var heightInfo = new qx.ui.basic.Label().set({
                value: tr('Height: '),
                rich: true,
                marginBottom: 6,
                marginTop: 10
            });

            var heightText = new qx.ui.form.Spinner('500').set({
                marginLeft: 10,
                marginTop: 5,
                width: 120,
                maximum: 3000,
                minimum: 10
            });


            var buttonsPane = new qx.ui.container.Composite().set({
                marginTop:20
            });
            
            var buttonsPaneLayout = new qx.ui.layout.HBox();
            buttonsPane.setLayout(buttonsPaneLayout);
            
            var btnPreview = new qx.ui.form.Button(tr('Preview'));
            var btnOk = new qx.ui.form.Button(tr('Create')).set({
                marginLeft:10
            });

            btnPreview.addListener('execute', function(){
                eyeos.execute('iframize', this.getChecknum(), [linkText.getValue(), widthText.getValue(), heightText.getValue()]);
            }, this);

            var inNewWindow = new qx.ui.form.CheckBox(tr('This link will open in new window')).set({
                marginLeft: 2
            });
            
            btnOk.addListener('execute', function() {
                //check if the link name is empty or only have whitespaces
                if(!linkName.getValue().replace(/^\s\s*/, '').replace(/\s\s*$/, '')) {
                    alert(tr("You should provide a link name!"));
                } else {
                    eyeos.callMessage(this.getChecknum(), "createLink", [linkText.getValue(), widthText.getValue(), heightText.getValue(), linkName.getValue(), this.__path, this.__icon, inNewWindow.getValue()], function(){
                        mainWindow.close();
                    });
                }

            }, this);

            mainWindow.add(informationName);
            mainWindow.add(linkName);
            mainWindow.add(information);
            mainWindow.add(linkText);
            sizesPane.add(sizes);
            mainWindow.add(bottomPane);
            bottomPane.add(iconPane, {flex: 1});
            bottomPane.add(sizesPane)
            sizesPane.add(widthPane);
            sizesPane.add(heightPane);
            widthPane.add(widthInfo);
            widthPane.add(new qx.ui.core.Spacer(), {flex: 1});
            widthPane.add(widthText);
            heightPane.add(heightInfo);
            heightPane.add(new qx.ui.core.Spacer(), {flex: 1});
            heightPane.add(heightText);
            mainWindow.add(buttonsPane);
            buttonsPane.add(inNewWindow);
            buttonsPane.add(new qx.ui.core.Spacer(), {flex: 1});
            buttonsPane.add(btnPreview);
            buttonsPane.add(btnOk);
            mainWindow.open();
        }
    }
});