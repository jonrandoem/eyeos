/*

				                   ____  _____
				  ___  __  _____  / __ \/ ___/
				 / _ \/ / / / _ \/ / / /\__ \
				/  __/ /_/ /  __/ /_/ /___/ /
				\___/\__, /\___/\____//____/
				    /____/        2.0 Future

               Cloud Computing Operating System
                        www.eyeos.org

                  eyeos is released under the
		GNU Affero General Public License Version 3 (AGPL3)
         provided with this release in the file "LICENSE"
        or via web at http://gnu.org/licenses/agpl-3.0.txt

        Copyright 2005-2009 eyeos Team (team@eyeos.org)
*/

function usermanagement_application(checknum, pid, user) {
	var app = new eyeos.application.UserManagement(checknum, pid);
	app.drawGUI();
}

/**
 * TODO :
 * 1) Check email on JS with RE	(DONE)
 * 2) Filed FROM for the mail : Global variable on settings.php OR mail address of the admin	(DONE)
 * 3) FILL Documentation about exception
 * 4) When we delete a principal, we shoul also delete contacts and further reference to this user
 */
qx.Class.define('eyeos.application.UserManagement', {
	extend: eyeos.system.EyeApplication,

	construct: function(checknum, pid) {
		arguments.callee.base.call(this, 'UserManagement', checknum, pid);
		this._checknum=checknum;
		this._pid=pid;
	},

	members: {
		_checknum: null,				// Checknum of the application
		_pid: null,						// Pid of the application

		_mainWindow: null,				// Main Window of the Application
		
		drawGUI: function() {
			this._mainWindow = new eyeos.ui.Window(this, tr('Administration')).set({
				layout: new qx.ui.layout.VBox(0),
				contentPadding: 0,
				width: 800,
				height: 480,
				allowGrowX: false,
				allowGrowY: false
			});

			var tabView = new qx.ui.tabview.TabView();
			this._mainWindow.add(tabView, {flex: 1});

			tabView.add(new eyeos.application.usermanagement.userpage(tr('eyeOS Users'), null, this._checknum));
			tabView.add(new eyeos.application.usermanagement.grouppage(tr('eyeOS Groups'), null, this._checknum));
			tabView.add(new eyeos.application.usermanagement.system(tr('eyeOS System'), null, this._checknum));

			this._mainWindow.open();
		}
	}
});


