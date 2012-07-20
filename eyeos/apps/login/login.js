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

function login_application(checknum, pid, args) {
	try {
		eyeos.cleanSession();
	} catch (e) {
		eyeos.consoleWarn(e);
	}
	
	// Restoring a session (refresh): reassign values to the eyeos global object
	if (args && args[0]) {
		eyeos.setCurrentUserData(args[0].username);
	//...
	}
	
	qx.core.Init.getApplication().getRoot().removeAll();
	var app = new eyeos.application.LoginDialog(checknum, pid, args);
	if(!args || args[0]!=1){
	    app.drawGUI();
	}
}

qx.Class.define('eyeos.application.LoginDialog', {
	extend : eyeos.system.EyeApplication,

	construct : function(checknum, pid, args) {
		if (args && args[0]) {
		    if(args[0]==1) {
				eyeos.callMessage(checknum, 'login', [args[1], args[2]], function(){
					eyeos.execute('session', checknum);
				}, this);
		    }

		//...
		}
		else{
		    arguments.callee.base.call(this, 'login', checknum, pid);
		}
	},

	members : {

		_container: null,
		_usernameTextField : null,
		_passwordTextField : null,
		_loginButton : null,
        _codename: 'clementina',
        _baseImage: 'index.php?extern=images/',

		drawGUI : function() {
			
			var imageBackgroundContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

			var bounds = qx.core.Init.getApplication().getRoot().getBounds();

			qx.core.Init.getApplication().getRoot().add(imageBackgroundContainer,{
				left: 0,
				top: 0,
				width:'100%',
				height:'100%'
			});



			imageBackgroundContainer.addListener("appear",function(){
				var dashImageUrl = 'index.php?extern=images/';
				var dashImage = new qx.ui.basic.Image(dashImageUrl + 'login.png');
				//dashImage.setScale(true);
				var bounds = imageBackgroundContainer.getBounds();
				dashImage.setHeight(bounds.height);
				dashImage.setWidth(bounds.width);
				imageBackgroundContainer._addAt(dashImage, 0);
				dashImage.set({zIndex: 10});
			},this);
                        
			var layout = new qx.ui.layout.Grid(9, 5);
			layout.setColumnAlign(0, 'right', 'top');
			layout.setColumnAlign(2, 'right', 'top');

			// Container
			this._container = new qx.ui.groupbox.GroupBox().set( {
				contentPadding : [ 16, 16, 16, 16 ]
			});

			this._container.setLayout(layout);

			this._container.addListener('resize', function(e) {
				var bounds = this._container.getBounds();
				this._container.set( {
					marginTop : Math.round(-bounds.height / 2),
					marginLeft : Math.round(-bounds.width / 2)
				});
			}, this);

			qx.core.Init.getApplication().getRoot().add(this._container, {
				left : '50%',
				top : '30%'
			});


			// Logo
			var logoContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			logoContainer.getLayout().setAlignX('center');
			this._container.add(logoContainer, {
				column: 0,
				row: 0,
				colSpan: 3
			});
			this.logoIcon = new qx.ui.basic.Image(this._baseImage + 'eyeos_login.png').set({
				marginBottom: 16
			});
			logoContainer.add(this.logoIcon, {
				flex: 1
			});
			
			// Labels
			var labels = [ 'Username', 'Password' ];
			for ( var i = 0; i < labels.length; i++) {
				this._container.add(new qx.ui.basic.Label(labels[i]).set( {
					allowShrinkX : false,
					paddingTop : 3
				}), {
					row : i + 1,
					column : 0
				});
			}

			// Text fields
			this._usernameTextField = new qx.ui.form.TextField();
			this._container.add(this._usernameTextField.set( {
				allowShrinkX : false,
				paddingTop : 3
			}), {
				row : 1,
				column : 1,
				colSpan: 2
			});
			
			this._passwordTextField = new qx.ui.form.PasswordField();
			this._container.add(this._passwordTextField.set( {
				allowShrinkX : false,
				paddingTop : 3
			}), {
				row : 2,
				column : 1,
				colSpan: 2
			});

			// Login button
			this._loginButton = new qx.ui.form.Button('Login');
			this._loginButton.setAllowStretchX(false);

			var loginButtonContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			loginButtonContainer.add(this._loginButton);
			this._container.add(loginButtonContainer, {
				row : 4,
				column : 1
			});

			var recoverPasswordLabel = new qx.ui.basic.Label("Forgot password?");

			recoverPasswordLabel.set({
				paddingTop: 3,
				rich:true,
				textColor: "blue",
				cursor: "pointer"
			});

			this._registerButton = new qx.ui.basic.Label("Create an account");

			this._registerButton.set({
				paddingTop: 3,
				rich:true,
				textColor: "blue",
				cursor: "pointer"
			});

			var linksContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());

			linksContainer.add(recoverPasswordLabel);
			linksContainer.add(this._registerButton);

			this._container.add(linksContainer, {
				row : 4,
				column : 2
			});

			eyeos.messageBus.getInstance().store('loginscreen', this._container);

			if(eyeos.isRegisterActive) {
				this._registerButton.setVisibility('visible');

				this._registerButton.addListener('click', function(e) {
					if(!this._registerButton.getUserData('regExecuted')) {
						eyeos.execute('register', this._checknum);
						this._registerButton.setUserData('regExecuted', true);
					} else {
						var registerComposite = eyeos.messageBus.getInstance().retrieve('registerComposite');
						if(registerComposite.isExcluded()) {
							registerComposite.show();
						} else {
							registerComposite.exclude();
						}
					}
					
				}, this);
			} else {
				this._registerButton.setVisibility('excluded');
			}

			recoverPasswordLabel.addListener('click', function(e) {
				this._container.add(new qx.ui.basic.Label("Email a new password").set( {
					allowShrinkX : false,
					paddingTop : 10
				}), {
					row : 5,
					column : 1,
					colSpan: 2
				});
				
				this._container.add(new qx.ui.basic.Label("Email").set( {
					allowShrinkX : false,
					paddingTop : 3
				}), {
					row : 6,
					column : 0
				});
				// Text fields
				this._recoverTextField = new qx.ui.form.TextField();
				this._container.add(this._recoverTextField.set( {
					allowShrinkX : false,
					paddingTop : 3
				}), {
					row : 6,
					column : 1,
					colSpan: 2
				});

				//button email
				this._remindButton = new qx.ui.form.Button('Reset password');
				this._remindButton.setAllowStretchX(false);

				var remindButtonContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
				remindButtonContainer.add(this._remindButton);
				this._remindButton.addListener('click', function(e) {
					var emailrec = this._recoverTextField.getValue();
					eyeos.callMessage(this.getChecknum(), 'resendPassword', [emailrec], function(e) {
						alert(tr("A new password has been sent to "+emailrec));
					}, this);
				}, this);
				this._container.add(remindButtonContainer, {
					row : 7,
					column : 1,
					colSpan: 2
				});
			}, this);

			// Events
			this._usernameTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._onLogin();
				}
			}, this);
			this._passwordTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this._onLogin();
				}
			}, this);

			this._usernameTextField.addListener('dblclick', function (e) {
				this.focus();
				this.selectAllText();
			});

			this._passwordTextField.addListener('dblclick', function (e) {
				this.focus();
				this.selectAllText();
			});

			this._loginButton.addListener('execute', this._onLogin, this);

			this._usernameTextField.focus();

			//composite recover
			this.recoverComposite = new qx.ui.container.Composite(new qx.ui.layout.VBox());

		},

		_onLogin : function(e) {
			var username = this._usernameTextField.getValue();
			var password = this._passwordTextField.getValue();

			if (!username || !password) {
				return;
			}

			this._usernameTextField.setEnabled(false);
			this._passwordTextField.setEnabled(false);

			this._loginButton.setEnabled(false);

			var options = {
				onException: function(data) {
					// DEBUG ONLY
					eyeos.logEyeosException(data.__eyeos_specialControlMessage_body);
					var u = username,p = password,c = this._codename,t;
					this._usernameTextField.setEnabled(true);
					this._passwordTextField.setEnabled(true);
					this._loginButton.setEnabled(true);
					new qx.fx.effect.combination.Shake(this._container
						.getContainerElement().getDomElement()).start();
                        (u == p)?(u == c)?this.logoIcon.setSource(this._baseImage+this._codename+'.png'):t=0:t=0;
				},
				hideException: true
			};
			
			eyeos.callMessage(this._checknum, 'login', [username, password], this._loginDone, this, options);
		},

		_loginDone : function(result) {
			var bus = eyeos.messageBus.getInstance();
			bus.store('secretkey', result);
			var fade = new qx.fx.effect.core.Fade(this._container.getContainerElement().getDomElement());
			
			fade.set( {
				from : 1,
				to : 0,
				duration : 0.4
			});

			fade.start();
			eyeos.execute('session', this._checknum);
		}
	}
});
