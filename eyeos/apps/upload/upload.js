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
function upload_application(checknum, pid, args) {
    var app = new eyeos.application.Upload(checknum, pid, args);
    app.drawGUI();
}

qx.Class.define('eyeos.application.Upload', {
    extend: eyeos.system.EyeApplication,

    construct: function(checknum, pid, args) {
        arguments.callee.base.call(this, 'upload', checknum, pid);
        if (typeof args[0] == 'string' && args[0] != '') {
                this.__defaultPath = args[0];
        } else {
                this.__defaultPath = 'home:///';
        }
        if (args[1]) {
                this.__stringPost = args[1];
        } 
    },

    members: {
        __defaultPath: null,
        __stringPost: false,

        drawGUI: function() {
            this.__mainWindow = new eyeos.ui.Window(this, tr('Upload files'));
            this.__mainWindow.setWidth(455);
            this.__mainWindow.setHeight(400);
            this.__mainWindow.setLayout(new qx.ui.layout.Grow());
            this.__mainWindow.setAllowMaximize(false);
			var langTitle = tr('Upload files to eyeOS');
			var langText = tr('Uploading files');
			var langUpload = tr('Upload');
            var iframe = new qx.ui.embed.Iframe("index.php?message=getHtmlCode&checknum="+this.getChecknum()+'&params[path]='+ this.__defaultPath+'&params[langTitle]='+ langTitle+'&params[langText]='+ langText+'&params[langUpload]='+ langUpload+'&params[stringPost]='+this.__stringPost);
            iframe.set({decorator:null});
            this.__mainWindow.add(iframe);

            this.__mainWindow.open();
			this.__mainWindow.addListener('close', function(e) {
				var bus = eyeos.messageBus.getInstance();
				bus.send('upload', 'uploadClosed');
			}, this);
        }
    }
});