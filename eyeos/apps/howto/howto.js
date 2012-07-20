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
function howto_application(checknum, pid, args) {
    var app = new eyeos.application.howto(checknum, pid, args);
    app.drawGUI();
}

qx.Class.define('eyeos.application.howto', {
    extend: eyeos.system.EyeApplication,

    construct: function(checknum, pid, args) {
        arguments.callee.base.call(this, 'howto', checknum, pid);
		//Get the language of the user
		var meta = eyeos.getCurrentUserData().metadata;
		if(typeof meta['eyeos.user.language'] != undefined) {
			this.__url = 'http://resources.eyeos.org/howto/?ln='+meta['eyeos.user.language'];
		}
    },

    members: {
        __url: 'http://resources.eyeos.org/howto/',
        __customWidth: 850,
        __customHeight: 450,
        drawGUI: function() {
            var mainWindow = new eyeos.ui.Window(this,'How to use eyeOS');
			mainWindow.setContentPadding(0,0,0,0);
            mainWindow.setWidth(this.__customWidth);
            mainWindow.setHeight(this.__customHeight)
            mainWindow.setLayout(new qx.ui.layout.Grow());
            mainWindow.setAllowMaximize(false);
			mainWindow.setResizable(false);
            var iframe = new qx.ui.embed.Iframe(this.__url);
            iframe.set({decorator:null});
            mainWindow.add(iframe);

            mainWindow.open();
        }
    }
});