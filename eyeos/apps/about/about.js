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
//TODO -> no account: crash deleting a tag...
//TODO -> delete last account: refresh right GUI...
//TODO -> accountSettings: dispose AccontObject when finished...
//TODO -> move the generic.actions function to external classes...

/**
 * eyeos.application.Mail - the eyeOS Mail Client.
 * @param checknum {Number} the process checknum
 * @param pid {Number} the process id
 * @param args {Array} the input arguments
 */
function about_application(checknum, pid, args) {
	var application = new eyeos.applications.About(checknum, pid, args);
	application.initApplication(args);
}

qx.Class.define('eyeos.applications.About', {
	extend: eyeos.system.EyeApplication,

	construct: function (checknum, pid, args) {
		arguments.callee.base.call(this, 'about', checknum, pid);
	},

	members: {
		initApplication: function(args) {
				this._window = new eyeos.ui.Window(this, tr('About eyeOS'), 'eyeos/extern/images/16x16/apps/preferences-desktop-user.png');
				this._window.setWidth(400);
				this._window.setHeight(320);

				var winLayout = new qx.ui.layout.VBox();
				this._window.setLayout(winLayout);

				this._window.open();

				var logocomposite = new qx.ui.container.Composite(new qx.ui.layout.HBox());
				var logo = new qx.ui.basic.Image();
				logo.set({
					marginTop:25,
					source: 'eyeos/extern/images/eyeos_login.png'
				});

				logocomposite.add(new qx.ui.core.Spacer(),  {flex:1});
				logocomposite.add(logo);
				logocomposite.add(new qx.ui.core.Spacer(),  {flex:1});

				var textcomposite = new qx.ui.container.Composite(new qx.ui.layout.HBox());
				var text = new qx.ui.basic.Label();
				text.set({
					marginTop:25,
					value: '<div style="font-size:20px;"><center>eyeOS '+ eyeos.version+'<br /><span style="font-size:12px">The Open Source Cloud\'s Web Desktop<br /><span style="font-size:11px">Licensed under the Affero GPL v3 License.</span></span></center></div>',
					rich: true
				});

				textcomposite.add(new qx.ui.core.Spacer(),  {flex:1});
				textcomposite.add(text);
				textcomposite.add(new qx.ui.core.Spacer(),  {flex:1});

				this._window.add(logocomposite);
				this._window.add(textcomposite);
		}
	}
});