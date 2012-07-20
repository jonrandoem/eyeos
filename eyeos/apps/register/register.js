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
function register_application(checknum, pid, args) {
	var myApp = new eyeos.application.Register(checknum, pid);
	myApp.drawGUI();
}

qx.Class.define('eyeos.application.Register', {
    extend: eyeos.system.EyeApplication,
    
    construct: function(checknum, pid) {
	    arguments.callee.base.call(this, 'register', checknum, pid);
    },
    
    members: {
	   
    	__onRegisterCallback: function(result) {
			this._registerButton.setEnabled(true);
	    	if (result == 'success') {
				qx.core.Init.getApplication().getRoot().removeAll();
				
				// Execute "session" app and then kill our process
				eyeos.execute('session', this._checknum, null, function() {
					eyeos.callMessage(this._checknum, 'close');
				}, this);
			} else if (result == 'incomplete') {
				eyeos.alert(tr('Please fill in all fields.'));
			}
	    },
    	
    	drawGUI: function() {
		    var layout = new qx.ui.layout.Grid(9, 5);
		    layout.setColumnAlign(0, 'right', 'top');
		    layout.setColumnAlign(2, 'right', 'top');

			var loginComposite = eyeos.messageBus.getInstance().retrieve('loginscreen');
			if(!loginComposite) {
				return;
			}
			var bounds = loginComposite.getBounds();

		    // Container
			this._container = new qx.ui.groupbox.GroupBox().set( {
				contentPadding : [ 16, 16, 16, 16 ],
				width: bounds.width
			});
			eyeos.messageBus.getInstance().store('registerComposite', this._container);
//			this._container.addListener('close', this.close, this);
			
			this._container.setLayout(layout);
//			loginComposite.add(this._container, {
//				row: 5,
//				column: 2
//			});

			//we need a hack here...because there is nothing draw on the screen, but we need to calculate!
			//so, we are going through dom...
			var w = 0;
			if(document.innerWidth) {
				w=document.innerWidth;
			} else if(document.documentElement.clientWidth) {
				w=document.documentElement.clientWidth;
			} else if(document.body) {
				w=document.body.clientWidth;
			}

			w = w / 2 - (224 / 2); // 224 is register width
			
			qx.core.Init.getApplication().getRoot().add(this._container, {
				left: bounds.left,
				top: bounds.top + bounds.height
			});

			// Labels
			var labels = [tr('Name'), tr('Surname'), tr('Username'), tr('Password'), tr('Repeat password'), tr('Email')];
			for ( var i = 0; i < labels.length; i++) {
				this._container.add(new qx.ui.basic.Label(labels[i]).set( {
					allowShrinkX: false,
					paddingTop: 3
				}), {
					row: i,
					column: 0
				});
			}

			// Name textfield
			this._nameTextField = new qx.ui.form.TextField();
			this._container.add(this._nameTextField.set( {
				allowShrinkX: false,
				paddingTop: 3
			}), {
				row: 0,
				column: 1
			});

			// Surname textfield
			this._surnameTextField = new qx.ui.form.TextField();
			this._container.add(this._surnameTextField.set( {
				allowShrinkX: false,
				paddingTop: 3
			}), {
				row: 1,
				column: 1
			});

			// Username textfield
			this._usernameTextField = new qx.ui.form.TextField();
			this._container.add(this._usernameTextField.set( {
				allowShrinkX: false,
				paddingTop: 3
			}), {
				row: 2,
				column: 1
			});
			
			// Password textfield
			this._passwordTextField = new qx.ui.form.PasswordField();
			this._container.add(this._passwordTextField.set( {
				allowShrinkX: false,
				paddingTop: 3
			}), {
				row: 3,
				column: 1
			});

			// Repeat password textfield
			this._repPasswordTextField = new qx.ui.form.PasswordField();
			this._container.add(this._repPasswordTextField.set( {
				allowShrinkX: false,
				paddingTop: 3
			}), {
				row: 4,
				column: 1
			});
			
			// E-mail textfield
			this._emailTextField = new qx.ui.form.TextField();
			this._container.add(this._emailTextField.set( {
				allowShrinkX: false,
				paddingTop: 3
			}), {
				row: 5,
				column: 1
			});
			
			// Button
			this._registerButton = new qx.ui.form.Button(tr('Register'));
			this._registerButton.setAllowStretchX(false);
			this._container.add(this._registerButton, {
				row: 6,
				column: 1
			});
			
			this._registerButton.addListener('execute', function() {
				var name = this._nameTextField.getValue();
				var surname = this._surnameTextField.getValue();
				var username = this._usernameTextField.getValue();
				var password = this._passwordTextField.getValue();
				var email = this._emailTextField.getValue();

				// Check password
				if (this._passwordTextField.getValue() != this._repPasswordTextField.getValue()) {
					eyeos.alert(tr('Given passwords do not match, please try again'));
					return;
				}
				// Check e-mail address
				var re = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
				if (!email || !email.match(re)) {
					eyeos.alert(tr('Given mail is not correct.'));
					return;
				}
				this._registerButton.setEnabled(false);
				eyeos.callMessage(this._checknum, 'register', [name, surname, username, password, email], this.__onRegisterCallback, this, 				{																//options
					onException: function(data) {
						this._registerButton.setEnabled(true);
					},
					timeout: 12000
				});

			}, this);
			
			this._nameTextField.focus();

    	}
    }
});

