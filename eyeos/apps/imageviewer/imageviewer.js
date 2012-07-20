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
function imageviewer_application(checknum, pid, args) {
    var app = new eyeos.application.ImageViewer(checknum, pid, args);
    app.drawGUI();
}

qx.Class.define('eyeos.application.ImageViewer', {
    extend: eyeos.system.EyeApplication,

    construct: function(checknum, pid, args) {
        arguments.callee.base.call(this, 'imageviewer', checknum, pid);
        if(args && args[0]) {
            this.__files = args;
        } 
    },

    members: {
        __path: null,
        drawGUI: function() {
            var mainWindow = new eyeos.ui.Window(this, 'Image Viewer');
            mainWindow.setWidth(900);
            mainWindow.setHeight(660);

            var winLayout = new qx.ui.layout.HBox();
            mainWindow.setLayout(winLayout);

            var leftPane = new qx.ui.container.Composite().set({
                    decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5').set({
                       widthBottom: 0,
                       widthLeft: 0,
                       widthRight: 2,
                       widthTop: 0
                    })
            });

            leftPane.setLayout(new qx.ui.layout.HBox());

            leftPane.addListener('resize', function(e) {
                if(this.mainImage) {
                    var bounds = leftPane.getBounds();
                    var imageBounds = this.mainImage.getBounds();
                    if(bounds.width > imageBounds.width) {
                        var newMargin = (bounds.width - imageBounds.width) / 2;
                        this.mainImage.setMarginLeft(newMargin);
                    }
                }
            }, this);
            var scrollMain = new qx.ui.container.Scroll().set({
                
            });
            scrollMain.add(leftPane);

            var rightPane = new qx.ui.container.Composite().set({
                minWidth: 200,
                width: 200
            });

            rightPane.setLayout(new qx.ui.layout.VBox());

            var scrollContainer = new qx.ui.container.Scroll().set({
                minWidth: 200,
                width: 200,
                scrollbarX: 'off'
            });
            scrollContainer.add(rightPane);


            var contentPane = new qx.ui.container.Composite();
            contentPane.setLayout(new qx.ui.layout.VBox());

            var topPane = new qx.ui.container.Composite().set({
                height: 50,
                decorator: new qx.ui.decoration.Single(1, 'solid', '#C5C5C5').set({
                   widthBottom: 1,
                   widthLeft: 0,
                   widthRight: 0,
                   widthTop: 0
                })
            });

            var zoomIn = new qx.ui.basic.Atom('Zoom in', 'eyeos/extern/images/22x22/actions/zoom-in.png').set({
                rich: true,
                'iconPosition': 'top',
                //'font': new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
                //'textColor': '#FFFFFF',
                'paddingTop': 5
            });

            zoomIn.addListener('click', function(e) {
				var bounds = this.mainImage.getBounds();
				if(this.currentScale > 0) {
					this.currentScale = 1;
				}
                this.currentScale = this.currentScale / 2;
                var newWidth = parseInt(bounds.width / this.currentScale);
                var newHeight = parseInt(bounds.height / this.currentScale);
				
				var newImage = this.mainImage.clone();
				leftPane.add(newImage);
				this.mainImage.destroy();
				this.mainImage = newImage;
                this.mainImage.set({
                   width: newWidth,
                   height: newHeight
                });
            }, this);

            var zoomOut = new qx.ui.basic.Atom('Zoom Out', 'eyeos/extern/images/22x22/actions/zoom-out.png').set({
                rich: true,
                'iconPosition': 'top',
                //'font': new qx.bom.Font(12, ['Helvetica', 'Arial', 'Sans-serif']),
                //'textColor': '#FFFFFF',
                'paddingTop': 5,
                'marginLeft': 20
            });

            zoomOut.addListener('click', function(e) {
				var bounds = this.mainImage.getBounds();
				if(this.currentScale < 0) {
					this.currentScale = 1;
				}
                this.currentScale = this.currentScale * 2;
                var newWidth = parseInt(bounds.width / this.currentScale);
                var newHeight = parseInt(bounds.height / this.currentScale);

				var newImage = this.mainImage.clone();
				leftPane.add(newImage);
				this.mainImage.destroy();
				this.mainImage = newImage;
                this.mainImage.set({
                   width: newWidth,
                   height: newHeight
                });
            }, this);


            topPane.setLayout(new qx.ui.layout.HBox());
            topPane.add(new qx.ui.core.Spacer(), {flex: 1});
            topPane.add(zoomIn);
            topPane.add(zoomOut);
            topPane.add(new qx.ui.core.Spacer(), {flex: 1});
            var bottomPane = new qx.ui.container.Composite();
            bottomPane.setLayout(new qx.ui.layout.HBox());

            contentPane.add(topPane);
            contentPane.add(bottomPane, {flex: 1});
            bottomPane.add(scrollMain, {flex: 1});
            bottomPane.add(scrollContainer);
            mainWindow.add(contentPane, {flex: 1});
            mainWindow.open();

            //lets rock and roll :)
            leftPane.removeAll();
				
            this.current = 0;
			this.thubnail = [];
			for(var i = 0; i < this.__files.length; i++) {
				if(i == 0) {
					var border = 2;
					var marginTop = 10;
				} else {
					var marginTop = 0;
					var border = 0;
				}
				
				this.thubnail[i] = new qx.ui.basic.Image().set({
					padding: 5,
					marginLeft: 25,
					marginTop: marginTop,
					decorator: new qx.ui.decoration.Single(border, 'solid', 'blue')
				});

				this.thubnail[i].setUserData('number', i);
				this.thubnail[i].setSource('index.php?checknum='+this.getChecknum()+'&message=getScaledImage&params[path]='+encodeURIComponent(this.__files[i])+'&params[maxHeight]=140&params[maxWidth]=140');
		
				this.thubnail[i].addListener('click', function(e) {
					var item = e.getTarget();
					this.thubnail[this.current].setDecorator(null);
					item.setDecorator(new qx.ui.decoration.Single(2, 'solid', 'blue'));
					this.current = item.getUserData('number');
					this.mainImage.setSource('index.php?checknum='+this.getChecknum()+'&message=getFile&params='+encodeURIComponent(this.__files[this.current]));
				}, this);

				rightPane.add(this.thubnail[i]);
			}
			this.currentScale = 1;
			this.mainImage = new qx.ui.basic.Image().set({
				padding: 5,
				scale: true,
				marginTop: 10
			});
			this.mainImage.setDecorator(new qx.ui.decoration.RoundBorderBeveled('#aaaaaa', null, 1, 0, 0, 0, 0, "0 5px 16px -3px black"));
			this.mainImage.setSource('index.php?checknum='+this.getChecknum()+'&message=getFile&params='+encodeURIComponent(this.__files[0]));

			this.mainImage.addListener('resize', function(e) {
				    var bounds = scrollMain.getBounds();
                    var imageBounds = this.mainImage.getBounds();
					//check if we need to resize the image!
					if(bounds.width < imageBounds.width) {
						//tenemos que redimensionar
						var proportion =  imageBounds.height / imageBounds.width;
						// use this for debug the problem
						var newWidth = bounds.width;
						var reduction = bounds.width / imageBounds.width;
						var newHeight = parseInt(imageBounds.height * reduction);

						this.mainImage.set({
							width: newWidth,
							height: newHeight
						});
					}
					

                    var bounds = leftPane.getBounds();
                    var imageBounds = this.mainImage.getBounds();
                    if(bounds.width > imageBounds.width) {
                        var newMargin = (bounds.width - imageBounds.width) / 2;
                        this.mainImage.setMarginLeft(newMargin);
                    }
			}, this);
			leftPane.add(this.mainImage);
				
        }
    }
});