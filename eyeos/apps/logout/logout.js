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

function logout_application(checknum, pid, args) {
var op = new eyeos.dialogs.OptionPane(
			tr('Are you sure you want to close your eyeOS session?'),
			eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
			eyeos.dialogs.OptionPane.YES_NO_OPTION);
		op.createDialog(
			null,
			tr('Close eyeOS'),
			function (answer) {
				if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
					eyeos.callMessage(checknum, 'closeSession', null, function() {
						window.onbeforeunload = null;
						var isExternLogin = args[0];

						if(isExternLogin){
							var loginPage = args[1];
							eyeos.cleanSession();
							document.location = loginPage;
						}
						else{
							try {
									eyeos.cleanSession();
									// modify the title
									this.document.title = eyeos.getCurrentUserName() +' @ ' + eyeos.version;
							} catch (e) {
									eyeos.consoleWarn(e);
							}

							try {
								qx.core.Init.getApplication().getRoot().removeAll();
							} catch (e) {
								
							}
							

							//adding warning unsatble applications
							var labelWarning = new qx.ui.basic.Label().set({
									value: '<span style="color: #777777;font-size:20px"><strong>'+tr('Closing your eyeOS session...')+'.</strong></span>',
									rich : true,
									width: 500,
									textAlign: 'center',
									marginLeft: -250,
									marginTop: 20

							});

							labelWarning.addListener('appear', function(e) {
								document.location.reload(true);
							});
							qx.core.Init.getApplication().getRoot().add(labelWarning, {
									left : '50%',
									top: 40
							});

						}						
					});
				} else {
					eyeos.callMessage(checknum, 'close', null, function() {

					});
				}
			},
			this, true
	).open();
}