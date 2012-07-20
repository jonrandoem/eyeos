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

qx.Class.define('eyeos.dialogs.IconChooser', {
    extend: qx.core.Object,

    statics: {

    },

    construct: function (appChecknum) {
        arguments.callee.base.call(this);
        this._checknum = appChecknum;
    },

    properties: {

    },

    members: {
        //arguments
        _callback: null,
        _callbackContext: null,
        _checknum: null,
        _selected: null,
            
        showIconDialog: function(parentWindow, size, callback, callbackContext) {
            this._callback = callback;
            this._callbackContext = callbackContext;
            var window = this.getWindow(size);
            this._centerInParentWindow(window, parentWindow);
            window.open();
        },
            
        getWindow: function(size) {
            this._window = new qx.ui.window.Window(tr("Choose an icon")).set({
                showMinimize: false,
                showMaximize: false,
                width: 350,
                height: 400,
                contentPadding: 3,
                minWidth: 300,
                minHeight: 400
            });

            var windowLayout = new qx.ui.layout.VBox();
            this._window.setLayout(windowLayout);
            var categoriesBox = new qx.ui.form.ComboBox().set({
                marginLeft:10,
                marginRight:10
            });

            //get available icon categories
            var appsFound = false;
            eyeos.callMessage(this._checknum, "__Resources_getIconCategories", [size], function(result) {
                for(var i in result) {
                    if(result[i] == "apps") {
                        appsFound = true;
                    }
                    categoriesBox.add(new qx.ui.form.ListItem(result[i]));
                }
                if(appsFound) {
                   categoriesBox.setValue("apps");
                } else {
                   categoriesBox.setValue(result[0]);
                }
                
            });
            var layout = new qx.ui.layout.VBox();
//            layout.setColumnMinWidth(50);
//            layout.setRowMinHeight(50);
            var infoImageBox = new qx.ui.container.Composite(layout).set({
                allowGrowX: false,
                width:320
            });

            categoriesBox.addListener('changeValue', function(e) {
                var category = e.getData();
                infoImageBox.removeAll();
                eyeos.callMessage(this._checknum, "__Resources_getIcons", [category, size], function(result) {
                    var step = 0;
                    var currentBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                    infoImageBox.add(currentBox);
                    for(var i in result) {
                        if(step == 5) {
                            var currentBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                            infoImageBox.add(currentBox);
                            step = 0;
                        }
                        
                        var inputImage = new qx.ui.basic.Image().set({
                            padding: 5,
                            allowShrinkY : false,
                            allowShrinkX : false,
                            scale: false
                        });
                        inputImage.setSource('eyeos/extern/images/'+size+'/'+category+'/'+result[i]);
                        inputImage.addListener('click', function(e) {
                            if(this._selected) {
                                this._selected.set({
                                    decorator: new qx.ui.decoration.Single(0, 'solid', '#CCCCCC')
                                });
                            }
                            this._selected = e.getTarget();
                            this._selected.set({
                                decorator: new qx.ui.decoration.Single(1, 'solid', '#CCCCCC')
                            });
                        }, this);
                        
                        step++;
                        currentBox.add(inputImage);
                    }
                }, this);
            }, this);


            var categoryInfo = new qx.ui.basic.Label().set({
                value: '<b>'+tr('Select an icon category')+'</b>',
                rich: true,
                margin: 10
            });

            var scrollContainer = new qx.ui.container.Scroll();
                
            scrollContainer.set({
                width: 300,
                height: 265,
                marginLeft:10,
                marginRight: 12,
                marginTop:5,
                decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5')
            });

            var buttonPanel = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                marginTop: 10
            });

            var btnOk = new qx.ui.form.Button(tr('Accept')).set({
                marginRight:10
            });

            btnOk.addListener('execute', function() {
                var source = this._selected.getSource();
                if (this._callback != null) {
                    this._callback.call(this._callbackContext, source);
                    this._window.close();
                }
            }, this);
            
            buttonPanel.add(new qx.ui.core.Spacer(), {flex: 1});
            buttonPanel.add(btnOk);
            
            this._window.add(categoryInfo);
            this._window.add(categoriesBox);
            this._window.add(scrollContainer);
            scrollContainer.add(infoImageBox);          
            this._window.add(buttonPanel);
            return this._window;
        },
        _centerInParentWindow: function(myWindow, parentWindow) {
            if(parentWindow != null) {
                var parentBounds = parentWindow.getBounds();
                var myBounds = {
                    left: parseInt(parentBounds.left + ((parentBounds.width - myWindow.getWidth()) / 2)),
                    top: parseInt(parentBounds.top + ((parentBounds.height - myWindow.getHeight()) / 2))
                };
                myBounds.left = myBounds.left > 0 ? myBounds.left : 0 ;
                myBounds.top = myBounds.top > 0 ? myBounds.top : 0 ;
                myWindow.setUserBounds(myBounds.left, myBounds.top, myWindow.getWidth(), myWindow.getHeight());
            }
        }
    }
});