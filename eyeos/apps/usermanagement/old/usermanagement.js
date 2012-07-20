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

qx.Class.define('eyeos.application.UserManagement', {
	extend: eyeos.system.EyeApplication,

	construct: function(checknum, pid) {
		arguments.callee.base.call(this, 'UserManagement', checknum, pid);
		this._checknum=checknum;
		this._group="Administradors";
		this._pid=pid;

	},

	members: {
		_panel: null,
		_checknum: null,
		_group: null,
		_pid: null,
		_panellMostrat: null,
		_itemsPerPage:30,
		_additiveList:null,
		_label:null,
		
		drawGUI: function() {
			var mainWindow = new eyeos.ui.Window(this, 'Administració d\'usuaris');
			mainWindow.setLayout(new qx.ui.layout.VBox(0));
			mainWindow.setContentPadding(0);

			

			var background = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'center',
				alignY: 'top'
			})).set({
				width: 720,
				height: 450,
				allowGrowX: true

			});

			mainWindow.add(background, {
				flex: 1
			});

			var toolbar = new qx.ui.toolbar.ToolBar();
			background.add(toolbar);

			

			var usuarisAdministradorsButton = new qx.ui.toolbar.Button("Administradors");
			usuarisAdministradorsButton.setWidth(150);
			usuarisAdministradorsButton.setHeight(50);
			usuarisAdministradorsButton.setBackgroundColor("#F3F3F3");
			usuarisAdministradorsButton.set({
				center:true
			});

			toolbar.add(usuarisAdministradorsButton);
			
			var usuarisProfessorsButton = new qx.ui.toolbar.Button("Professors");
			usuarisProfessorsButton.setWidth(150);
			usuarisProfessorsButton.setWidth(150);
			usuarisProfessorsButton.setHeight(50);
			usuarisProfessorsButton.set({
				center:true
			});
			toolbar.add(usuarisProfessorsButton);

			var usuarisAlumnesButton = new qx.ui.toolbar.Button("Alumnes");
			usuarisAlumnesButton.setWidth(150);
			usuarisAlumnesButton.setWidth(150);
			usuarisAlumnesButton.setHeight(50);
			usuarisAlumnesButton.set({
				center:true
			});
			toolbar.add(usuarisAlumnesButton);


			usuarisProfessorsButton.addListener('click', function(e) {
				usuarisProfessorsButton.setBackgroundColor("#F3F3F3");
				usuarisAdministradorsButton.setBackgroundColor(null);
				usuarisAlumnesButton.setBackgroundColor(null);
				this._group="Professors";
				this.drawPanell();
				this.ompleLlista(-1);
				this._label.setValue("<b>Usuaris</b>");
			}, this);


			usuarisAdministradorsButton.addListener('click', function(e) {
				usuarisAdministradorsButton.setBackgroundColor("#F3F3F3");
				usuarisProfessorsButton.setBackgroundColor(null);
				usuarisAlumnesButton.setBackgroundColor(null);
				this._group="Administradors";
				this.drawPanell();
				this.ompleLlista(-1);
				this._label.setValue("<b>Aministradors</b>");
			}, this);

			usuarisAlumnesButton.addListener('click', function(e) {
				usuarisAlumnesButton.setBackgroundColor("#F3F3F3");
				usuarisProfessorsButton.setBackgroundColor(null);
				usuarisAdministradorsButton.setBackgroundColor(null);
				this._group="Alumnes";
				this.drawPanell();
				this.ompleLlista(-1);
				this._label.setValue("<b>Alumnes</b>");
			}, this);


			var content = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignX: 'left',
				alignY: 'middle'
			})).set({
				width: 720,
				height: 400,
				allowGrowX: true
			});

			background.add(content);

			var userListPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 225,
				height: 400,
				allowGrowX: true
			});

			content.add(userListPanel);

			this._label = new qx.ui.basic.Label("<b>Administradors</b>").set({
				marginLeft: 10,
				marginTop: 10,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
				textColor:"#3579BD",
				rich: true

			});
			userListPanel.add(this._label);

			var search = new qx.ui.form.TextField("Cerca...").set({
					maxLength: 50,
					width:200,
					allowGrowX:false,
					marginTop: 10,
					marginLeft: 10,
					textColor:"grey"

			});

			userListPanel.add(search);

			search.addListener('blur', function(e) {
				search.setValue("");
				search.set("textColor","grey");
				search.setValue("Cerca...");
			}, this);

			search.addListener('focus', function(e) {
				search.setValue("");
				search.set("textColor","black");
			}, this);

			search.addListener('keypress', function(e) {
				if(e.getKeyIdentifier()=="Enter") {
					this.cerca(this._group,search.getValue());
				}
			}, this);

			this._additiveList = new qx.ui.form.List;

			this._additiveList.set({
				selectionMode : "single" ,
				allowGrowX: false,
				marginLeft: 10,
				marginTop: 10,
				width: 200,
				height:250
			});			

			this._additiveList.addListener('changeSelection', function(e) {
				var item = e.getData();
				if(!item[0]) return;
				this.mostraUsuari((item[0].getUserData('id')));
			}, this);

			userListPanel.add(this._additiveList);

			var pagination = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				alignY: 'middle'
			}).set({
				marginLeft: 10,
				width: 200,
				height: 25,
				allowGrowX: false,
				backgroundColor: "#D9D9D9"

			});

			userListPanel.add(pagination);
			
			var fontPaginacio = new qx.bom.Font("12");
			fontPaginacio.set({
				bold:true

			});
			var labelAnt = new qx.ui.basic.Label("< anterior").set({
				alignY:"middle",
				marginLeft: 5,
				textColor:"#3579BD",
				font: fontPaginacio

			});
			//pagination.add(labelAnt);
			labelAnt.set("cursor","pointer");

			var labelPost = new qx.ui.basic.Label("següent >").set({
				alignY:"middle",
				marginLeft: 85,
				textColor:"#3579BD",
				font: fontPaginacio

			});
			//pagination.add(labelPost);
			labelPost.set("cursor","pointer");

			var addremovepanel = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				alignY: 'middle'
			}).set({
				marginLeft: 10,
				marginTop: 5,
				width: 100,
				height: 15,
				allowGrowX:false

			});

			userListPanel.add(addremovepanel);

			var addButton = new qx.ui.basic.Image("index.php?extern=images/usermanagement/mes.png");
			addremovepanel.add(addButton);
			addButton.set("cursor","pointer");
			addButton.addListener('click', function(e) {
				this._additiveList.resetSelection();
				this.nouUsuari();
				
			}, this);


			var removeButton = new qx.ui.basic.Image("index.php?extern=images/usermanagement/menys.png");
			removeButton.set({
				marginLeft: 5
			});
			addremovepanel.add(removeButton);
			removeButton.set("cursor","pointer");

			removeButton.addListener('click', function (e) {
				if(this._additiveList.getSelection().length==0) return;
				var optionPane = new eyeos.dialogs.OptionPane(
					"<b>Estàs segur de que vols el·liminar aquest usuari?</b>",
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
				var dialog = optionPane.createDialog(mainWindow, "Atenció!", function(result) {
					if (result == 0) {
						
						this.esborraUsuari(this._additiveList.getSelection()[0]);
					}
				}, this);
				dialog.open();
			}, this);

			var contentAllPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 495,
				height: 400,
				allowGrowX: true
			});

			content.add(contentAllPanel);

			this._panel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 495,
				height: 350,
				allowGrowX: true
			});

			contentAllPanel.add(this._panel);

			var buttonsContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 10
			});

			var botoCancel = new qx.ui.form.Button("Cancel·lar").set({
				marginLeft: 300
			});
			buttonsContainer.add(botoCancel);
			botoCancel.addListener('click', function(e){
				if(this._additiveList.getSelectables().length==0){
					this.nouUsuari();
				}
				else{
					if (this._additiveList.getSelection()[0]){
						this.mostraUsuari(this._additiveList.getSelection()[0].getUserData('id'));
					}
					else{
						this._additiveList.setSelection([this._additiveList.getSelectables()[0]]);
					}
				}
			}, this);

			var botoAccept = new qx.ui.form.Button("Acceptar").set({
				marginLeft: 5,
				width:110
			});
			buttonsContainer.add(botoAccept);
			botoAccept.addListener('click', function(e){
				this.guardaUsuari();
			}, this);

			contentAllPanel.add(buttonsContainer);

			mainWindow.open();
			this.drawPanell();
			this.ompleLlista(-1);


		},

		drawPanell: function(){
			this._panel.removeAll();
			if(!this._panellMostrat){
				this._panellMostrat=new eyeos.usermanagement.panels.Panell(this._checknum,this._pid,this._panel,this);
			}
			this._panellMostrat.drawGUI();
			

		},
		
		ompleLlista: function(currentSelection){
			this._additiveList.removeAll();
			eyeos.callMessage(this._checknum, 'getAllUsersFromGroup', [this._group,false,0], function(result) {
				for (var i=0; i<result.length; i++)
				{
					var item3 = new qx.ui.form.ListItem(result[i]['name']);
					item3.setUserData('id',result[i]['id']);
					this._additiveList.add(item3);


				};
				if(result.length>0){
					if(currentSelection==-1){
						var aSelect=this._additiveList.getSelectables()[0];
						this._additiveList.setSelection([aSelect]);
					}
					else{
						var fills = this._additiveList.getChildren();						
						for (var i=0; i<fills.length; i++)
						{
							if(fills[i].getUserData('id')==currentSelection){
								var item = fills[i];
								this._additiveList.setSelection([item]);
							}							
						}
					}
				}
				else{
					this._panellMostrat.mostraNouUsuari(this._group);
				}
			},this);

		},

		cerca: function(group,text) {
			if(text=="") {
				this.ompleLlista(-1);
			}
			else{
				this._additiveList.removeAll();
				eyeos.callMessage(this._checknum, 'search', [group,text], function(result) {
					for (var i=0; i<result.length; i++)
					{
						var item3 = new qx.ui.form.ListItem(result[i]['name']);
						item3.setUserData('id',result[i]['id']);
						this._additiveList.add(item3);
					};
					if(result.length>0){
						var aSelect=this._additiveList.getSelectables()[0];
						this._additiveList.setSelection([aSelect]);
					}
					else{
						this._panellMostrat.mostraNouUsuari(this._group);
					}
				},this);
			}
		},

		mostraUsuari: function(idUsuari){			
			this._panellMostrat.ompleUsuari(idUsuari,this._group);
		},

		nouUsuari: function(){
			this._panellMostrat.mostraNouUsuari(this._group);
		},

		esborraUsuari: function(listItem){
			var userId = listItem.getUserData('id');
			eyeos.callMessage(this._checknum, 'removeUser', [userId], function(result) {
				/*if(result){
					listItem.destroy();
					if(this._additiveList.getSelectables().length>0){
						var aSelect=this._additiveList.getSelectables()[0];
						this._additiveList.setSelection([aSelect]);
					}
					else{
						this._panellMostrat.mostraNouUsuari(this._group);
					}
				}*/
				this.nouUsuari();
				this.ompleLlista(-1);
			},this);

		},

		guardaUsuari: function(){
			this._panellMostrat.guardaUsuari();

		}


	}
});


qx.Class.define('eyeos.usermanagement.panels.Panell', {

	extend: qx.core.Object,

	construct: function(checknum, pid, parentPanel,app ) {
		this.base(arguments);
		this._checknum=checknum;
		this._panel=parentPanel;
		this._app=app;

	},

	members: {
		_panel: null,
		_checknum: null,
		_panel: null,
		_group: null,
		_idUsuari: null,
		_nomBox: null,
		_cognomBox: null,
		_emailBox: null,
		_usernameBox: null,
		_passwordContainer: null,
		_passwordInfo: null,
		_availableWorkgroupsList: null,
		_selectedWorkgroupList: null,
		_tabView: null,
		_app:null,
		_avatar: null,
		_nifBox: null,
		_addressBox: null,
		_telefonBox: null,
		_telefonMobilBox: null,
		_telefonAddicionalBox: null,
		

		drawGUI: function() {
			this._tabView = new qx.ui.tabview.TabView();
			this._tabView.set({
				width:475,
				height:340,
				marginTop:10
			});
			this._panel.add(this._tabView);

			var page1 = new qx.ui.tabview.Page("Informació");
			page1.setLayout(new qx.ui.layout.VBox());
			this._tabView.add(page1);
			this.dibuixaTabCompta(page1);

			var page2 = new qx.ui.tabview.Page("Informació");
			page2.setLayout(new qx.ui.layout.VBox());
			this._tabView.add(page2);
			this.dibuixaTabInformacioAddicional(page2);
			

			var page3 = new qx.ui.tabview.Page("Grups de Treball");
			page3.setLayout(new qx.ui.layout.VBox());
			this._tabView.add(page3);
			this.dibuixaTabWorkgroups(page3);


		},

		dibuixaTabCompta: function (page){

			var accountPanel = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 495,
				height: 400,
				allowGrowX: true

			});

			page.add(accountPanel);

			var avatarPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 80 ,
				height: 400,
				allowGrowX: true
			});

			accountPanel.add(avatarPanel);

			var informacioPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 475,
				height: 400,
				allowGrowX: true
			});

			accountPanel.add(informacioPanel);

			var avatarContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				height:60,
				width:50

			});
			
			this._avatar = new qx.ui.basic.Image().set({
				scale: true,
				maxWidth: 60,
				maxHeight: 60,
				allowShrinkX: true,
				allowShrinkY: true
			});
			avatarContainer.add(this._avatar);
			avatarPanel.add(avatarContainer);

			var nomContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				//marginTop: 35
			});

			var nomLabel = new qx.ui.basic.Label("<b>Nom:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true
			});

			nomContainer.add(nomLabel);

			this._nomBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					marginLeft: 80,
					tabIndex: 1
			});

			nomContainer.add(this._nomBox);

			informacioPanel.add(nomContainer);

			var cognomContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15
			});

			var cognomLabel = new qx.ui.basic.Label("<b>Cognoms:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true
			});

			cognomContainer.add(cognomLabel);

			this._cognomBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					marginLeft: 54,
					tabIndex: 2
			});

			cognomContainer.add(this._cognomBox);

			informacioPanel.add(cognomContainer);

			var emailContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15
			});

			var emailLabel = new qx.ui.basic.Label("<b>E-mail:</b>").set({
				textColor: "#7D8084",
				rich: true
			});

			emailContainer.add(emailLabel);

			this._emailBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					marginLeft: 71,
					tabIndex: 3
			});

			emailContainer.add(this._emailBox);

			informacioPanel.add(emailContainer);

			var ifill = new qx.ui.basic.Image("index.php?extern=images/usermanagement/linia.png");
			ifill.setScale(true);
			ifill.set({
				marginTop:20,
				height:2
			});
			informacioPanel.add(ifill);


			var usernameContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 25
			});

			var usernameLabel = new qx.ui.basic.Label("<b>Nom d'usuari:</b>").set({
				textColor: "#7D8084",
				rich: true
			});

			usernameContainer.add(usernameLabel);



			this._usernameBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					marginLeft: 33,
					enabled: true,
					tabIndex: 4
			});

			usernameContainer.add(this._usernameBox);

			informacioPanel.add(usernameContainer);

			this._passwordContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15,
				visibility: 'hidden'
			});

			var passwordLabel = new qx.ui.basic.Label("<b>Contrasenya:</b>").set({
				textColor: "#7D8084",
				rich: true

			});

			this._passwordContainer.add(passwordLabel);

			var botoReenviar = new qx.ui.form.Button("Reinicialitzar").set({
				marginLeft: 39
			});
			this._passwordContainer.add(botoReenviar);

			botoReenviar.addListener("click",function(){
				eyeos.callMessage(this._checknum, 'resetPassword', [this._idUsuari], function(result) {

				},this);
			},this);

			informacioPanel.add(this._passwordContainer);

			this._passwordInfo = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15,
				visibility: 'excluded'
			});

			var infoImage = new qx.ui.basic.Image('index.php?extern=images/16x16/status/dialog-information.png');

			this._passwordInfo.add(infoImage);

			var passwordInfoLabel = new qx.ui.basic.Label("<b>La contrasenya generada aleatòriament serà enviada<br> a l'usuari per correu electrònic</b>").set({
				textColor: "#7D8084",
				rich: true,
				marginLeft:10
			});

			this._passwordInfo.add(passwordInfoLabel);

			informacioPanel.add(this._passwordInfo);

		},

		dibuixaTabInformacioAddicional: function (page){

			var accountPanel = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 495,
				height: 400,
				allowGrowX: true

			});

			page.add(accountPanel);


			var informacioPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 475,
				height: 400,
				allowGrowX: true
			});

			accountPanel.add(informacioPanel);
			
			var nifContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				//marginTop: 35
			});

			var nifLabel = new qx.ui.basic.Label("<b>NIF:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true,
				width: 90
			});

			nifContainer.add(nifLabel);

			this._nifBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					tabIndex: 1
			});

			nifContainer.add(this._nifBox);

			informacioPanel.add(nifContainer);

			var addressContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'top'
			})).set({
				marginTop: 15
			});

			var addressLabel = new qx.ui.basic.Label("<b>Adreça:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true,
				width: 90
			});

			addressContainer.add(addressLabel);

			this._addressBox = new qx.ui.form.TextArea("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					tabIndex: 2,
					height: 55
			});

			addressContainer.add(this._addressBox);

			informacioPanel.add(addressContainer);

			var telefonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15
			});

			var telefonLabel = new qx.ui.basic.Label("<b>Telèfon:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true,
				width: 90
			});

			telefonContainer.add(telefonLabel);

			this._telefonBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					tabIndex: 3
			});

			telefonContainer.add(this._telefonBox);

			informacioPanel.add(telefonContainer);

			var telefonMobilContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15
			});

			var telefonMobilLabel = new qx.ui.basic.Label("<b>Telèfon Mòbil:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true,
				width: 90
			});

			telefonMobilContainer.add(telefonMobilLabel);

			this._telefonMobilBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					tabIndex: 4
			});

			telefonMobilContainer.add(this._telefonMobilBox);

			informacioPanel.add(telefonMobilContainer);

			var telefonAddicionalContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignY: 'middle'
			})).set({
				marginTop: 15
			});

			var telefonAddicionalLabel = new qx.ui.basic.Label("<b>Telèfon Addicional:</b>").set({
				//marginLeft: 15,
				textColor: "#7D8084",
				rich: true,
				width: 90
			});

			telefonAddicionalContainer.add(telefonAddicionalLabel);

			this._telefonAddicionalBox = new qx.ui.form.TextField("").set({
					maxLength: 50,
					width:220,
					allowGrowX:false,
					tabIndex: 5
			});

			telefonAddicionalContainer.add(this._telefonAddicionalBox);

			informacioPanel.add(telefonAddicionalContainer);

		},

		dibuixaTabWorkgroups: function (page){
			var workgroupsPanel = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 495,
				height: 260,
				allowGrowX: true
			});

			page.add(workgroupsPanel);

			var availableGroupsPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 180,
				height: 250,
				allowGrowX: false

			});

			workgroupsPanel.add(availableGroupsPanel);

			var fontTipus = new qx.bom.Font("13");
			fontTipus.set({
				bold:true

			});

			var label = new qx.ui.basic.Label("Grups disponibles").set({
				font: fontTipus,
				textColor:"#3579BD"

			});
			availableGroupsPanel.add(label);

			var scroll = new qx.ui.container.Scroll();
			scroll.set({
				marginTop:10,
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					style: 'solid',
					color: '#A4A4A4'
				})
			});
			availableGroupsPanel.add(scroll, {flex: 1});

			this._availableWorkgroupsList = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false
				//backgroundColor: 'yellow'

			});
			scroll.add(this._availableWorkgroupsList, {
				flex: 1
			});


			var rowsPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'center',
				alignY: 'top'
			})).set({
				width: 90,
				height: 300,
				allowGrowX: false

			});

			workgroupsPanel.add(rowsPanel);

			var rowsButtonPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'center',
				alignY: 'middle'
			})).set({
				width: 90,
				height: 100,
				allowGrowX: false,
				marginTop:90

			});

			rowsPanel.add(rowsButtonPanel);

			var botoRemove = new qx.ui.form.Button("<<");
			botoRemove.set({
				width:50,
				height:30,
				allowGrowX: false
			});
			rowsButtonPanel.add(botoRemove);

			botoRemove.addListener('click', function(e){
				var selected=this._selectedWorkgroupsList.getUserData('selectedItem');
				if(selected && selected.toHashCode()!=undefined ){
					this.passarGrupADisponible(selected);
				}
				else{
					return;
				}


			}, this);


			var botoAdd = new qx.ui.form.Button(">>");
			botoAdd.set({
				width:50,
				height:30,
				marginTop:5,
				allowGrowX: false
			});
			rowsButtonPanel.add(botoAdd);

			botoAdd.addListener('click', function(e){
				var selected=this._availableWorkgroupsList.getUserData('selectedItem');
				if(selected && selected.toHashCode()!=undefined ){
					this.passarGrupASelected(selected,eyeos.ui.tabs.GroupAll.ROLE_VIEWER);
				}
				else{
					return;
				}
			}, this);


			var selectedGroupsPanel = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
				alignX: 'left',
				alignY: 'top'
			})).set({
				width: 180,
				height: 260,
				allowGrowX: false

			});

			workgroupsPanel.add(selectedGroupsPanel);

			var label = new qx.ui.basic.Label("Grups de l'usuari").set({
				font: fontTipus,
				textColor:"#3579BD"

			});
			selectedGroupsPanel.add(label);


			var scrollSelected = new qx.ui.container.Scroll();
			scrollSelected.set({
				marginTop:10,
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					style: 'solid',
					color: '#A4A4A4'
				})
			});
			selectedGroupsPanel.add(scrollSelected, {flex: 1});

			this._selectedWorkgroupsList = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false

			});
			scrollSelected.add(this._selectedWorkgroupsList, {
				flex: 1
			});
		},
		
		ompleUsuari: function (idUsuari,group){

			this._idUsuari=idUsuari;
			this._group=group;
			eyeos.callMessage(this._checknum, 'getInformacioSimpleUsuari', [idUsuari], function(result) {
				this._nomBox.set('value',result.name);
				this._cognomBox.set('value',result.surname);
				this._emailBox.setEnabled(true);
				this._emailBox.set('value',result.mail);
				this._usernameBox.set('value',result.username);
				this._usernameBox.set("enabled",false);
				this._passwordContainer.set('visibility','visible');
				this._passwordInfo.set('visibility','excluded');
				var path = 'index.php?checknum=' + this._checknum + '&message=__UserInfo_getAvatarPicture&params[userId]=' + this._idUsuari;
				this._avatar.setSource(path);
				this._avatar.setVisibility("visible");


				//Info extended
				this._nifBox.set("value",result.nif);
				this._addressBox.set("value",result.address);
				this._telefonBox.set("value",result.phone);
				this._telefonMobilBox.set("value",result.mobilePhone);
				this._telefonAddicionalBox.set("value",result.additionalPhone);



//TODO: Quan no estigui acoblat  fer que es pugui canviar el mail dels visitants				
			},this);

			/*eyeos.callMessage(this._checknum, 'getAvatarPicture', [idUsuari], function(result) {
				this._avatar.setSource(result);
			},this);*/
			this.ompleLlistaGrupsDisponibles(idUsuari,group);
			this.ompleLlistaGrupsSelected(idUsuari,group);
			//this._tabView.setSelection(this._tabView.getChildren()[0]);

		},

		mostraNouUsuari: function (group){
			this._group=group;
			this._idUsuari=null;
			this._nomBox.set("value","");
			this._cognomBox.set("value","");
			this._emailBox.set("value","");
			this._usernameBox.set("value","");
			this._usernameBox.set('enabled',true);
			this._passwordContainer.set('visibility','excluded');
			this._passwordInfo.set('visibility','visible');
			this._emailBox.setEnabled(true);
			this._tabView.setSelection(this._tabView.getChildren()[0]);
			this.ompleLlistaGrupsDisponibles(null,group);
			this.ompleLlistaGrupsSelected(null,group);
			this._avatar.setVisibility("hidden");



			//Info extended
			this._nifBox.set("value","");
			this._addressBox.set("value","");
			this._telefonBox.set("value","");
			this._telefonMobilBox.set("value","");
			this._telefonAddicionalBox.set("value","");



			//this._selectedWorkgroupsList.removeAll();
			this._nomBox.focus();
		},

		ompleLlistaGrupsDisponibles: function(idUsuari,group){
			this._selectedWorkgroupsList.setUserData('selectedItem',null);
			this._availableWorkgroupsList.setUserData('selectedItem',null);
			eyeos.callMessage(this._checknum, 'getAvailableWorkgroups', [idUsuari,group] , function(result) {
				this._availableWorkgroupsList.removeAll();
				for(var i=0;i<result.length;i++){
					this._availableWorkgroupsList.add(this.creaGrupDisponibleItem(result[i][0],result[i][1]));
				}

				this.addListener('selected', function(e){
					var oldSelectedAvailableItem = this._availableWorkgroupsList.getUserData('selectedItem');
					

					if(oldSelectedAvailableItem && oldSelectedAvailableItem.toHashCode()!=undefined && e.getData().toHashCode()!=oldSelectedAvailableItem.toHashCode()) {
						oldSelectedAvailableItem.setBackgroundColor(null);
					}
					var oldSelectedSelectedItem = this._selectedWorkgroupsList.getUserData('selectedItem');
					if(oldSelectedSelectedItem && oldSelectedSelectedItem.toHashCode()!=undefined && e.getData().toHashCode()!=oldSelectedSelectedItem.toHashCode()) {
						oldSelectedSelectedItem.setBackgroundColor(null);
						this._selectedWorkgroupsList.setUserData('selectedItem',null);
					}
					this._availableWorkgroupsList.setUserData('selectedItem', e.getData());
				}, this);
			},this);
		},


		ompleLlistaGrupsSelected: function(idUsuari,group){
			this._selectedWorkgroupsList.setUserData('selectedItem',null);
			this._availableWorkgroupsList.setUserData('selectedItem',null);	
			eyeos.callMessage(this._checknum, 'getUserWorkgroups', [idUsuari,this._group] , function(result) {
				this._selectedWorkgroupsList.removeAll();
				for(var i=0;i<result.length;i++){
					this._selectedWorkgroupsList.add(this.creaGrupSelectedItem(result[i][0],result[i][1],result[i][2],result[i][3]));
				}
				this.addListener('selectedSelectedItem', function(e){
					var oldSelectedSelectedItem = this._selectedWorkgroupsList.getUserData('selectedItem');
					
					if(oldSelectedSelectedItem && oldSelectedSelectedItem.toHashCode()!=undefined && e.getData().toHashCode()!=oldSelectedSelectedItem.toHashCode()) {
						oldSelectedSelectedItem.setBackgroundColor(null);
					}
					var oldSelectedAvailableItem = this._availableWorkgroupsList.getUserData('selectedItem');
					if(oldSelectedAvailableItem && oldSelectedAvailableItem.toHashCode()!=undefined && e.getData().toHashCode()!=oldSelectedAvailableItem.toHashCode()) {
						oldSelectedAvailableItem.setBackgroundColor(null);
						this._availableWorkgroupsList.setUserData('selectedItem',null);
					}
					this._selectedWorkgroupsList.setUserData('selectedItem', e.getData());
				}, this);
			},this);
		},


		creaGrupDisponibleItem: function(idWorkgroup,nomWorkgroup){
			var grupDisponibleItem = new qx.ui.container.Composite().set({
				height: 50,
				allowGrowY: false,
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				focusable:true,
				decorator: new qx.ui.decoration.Single().set({
					widthBottom: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});
			//Aquí es podria posar la imatge del grup

			var itemName = new qx.ui.basic.Label(nomWorkgroup).set({
				alignX: 'center',
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			grupDisponibleItem.add(itemName);

			grupDisponibleItem.addListener('click', function(e) {
				grupDisponibleItem.set({
					backgroundColor: "#DAE7F4"
				});
				this.fireDataEvent("selected", grupDisponibleItem);
			}, this);

			grupDisponibleItem.setUserData('workgroupId', idWorkgroup);
			grupDisponibleItem.setUserData('workgroupName', nomWorkgroup);
			return grupDisponibleItem;
		},

		creaGrupSelectedItem: function(idWorkgroup,nomWorkgroup,rol,blocked){
			var grupSelectedItem = new qx.ui.container.Composite().set({
				height: 50,
				allowGrowY: false,
				layout: new qx.ui.layout.VBox(),
				backgroundColor: 'white',
				focusable:true,
				decorator: new qx.ui.decoration.Single().set({
					widthBottom: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});

			if(!blocked){
				var itemName = new qx.ui.basic.Label(nomWorkgroup).set({
					alignX: 'left',
					alignY: 'middle',
					marginLeft: 5,
					marginTop:2,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
				});
				grupSelectedItem.add(itemName);
				var rolPanel=new qx.ui.container.Composite().set({
					height: 20,
					layout: new qx.ui.layout.HBox()

				});
				grupSelectedItem.add(rolPanel);

				var privilegeSelectBox = new eyeos.ui.form.SelectBox([
						{name: 'Administrador', id: eyeos.ui.tabs.GroupAll.ROLE_ADMIN},
						{name: 'Editor', id: eyeos.ui.tabs.GroupAll.ROLE_EDITOR},
						{name: 'Membre', id: eyeos.ui.tabs.GroupAll.ROLE_VIEWER},
					]).set({
						marginLeft: 5,
						allowGrowY: false,
						width: 130,
						allowGrowX: false,
						textColor: '#A4A4A4',
						backgroundColor: 'white'
					});
				rolPanel.add(privilegeSelectBox);
				privilegeSelectBox.setSelection([privilegeSelectBox.getChildren()[rol-1]]);
				grupSelectedItem.addListener('click', function(e) {
					grupSelectedItem.set({
						backgroundColor: "#DAE7F4"
					});
					this.fireDataEvent("selectedSelectedItem", grupSelectedItem);
				}, this);
			}
			else {
				
				grupSelectedItem.set({
					backgroundColor: "#eeeeee",
					layout: new qx.ui.layout.HBox()
				});
				//Aquí es podria posar la imatge del grup
				var itemName = new qx.ui.basic.Label(nomWorkgroup).set({
					alignX: 'left',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: "#888888"
				});
				grupSelectedItem.add(itemName);

			}

			//Aquí es podria posar la imatge del grup

			grupSelectedItem.setUserData('workgroupId', idWorkgroup);
			grupSelectedItem.setUserData('workgroupName', nomWorkgroup);
			grupSelectedItem.setUserData('blocked', blocked);
			
			return grupSelectedItem;
		},

		passarGrupASelected: function(listItem,rol){
			var workgroupId=listItem.getUserData('workgroupId');
			var workgroupName=listItem.getUserData('workgroupName');
			listItem.destroy(workgroupId);
			this._availableWorkgroupsList.setUserData('selectedItem',null);
			
			var nouListItem=this.creaGrupSelectedItem(workgroupId,workgroupName,rol);
			nouListItem.set({
				backgroundColor: "#DAE7F4"
			});
			
			this._selectedWorkgroupsList.add(nouListItem);

			nouListItem.focus();
			this._selectedWorkgroupsList.setUserData('selectedItem',nouListItem);

		},

		passarGrupADisponible: function(listItem){
			var workgroupId=listItem.getUserData('workgroupId');
			var workgroupName=listItem.getUserData('workgroupName');
			listItem.destroy();
			this._selectedWorkgroupsList.setUserData('selectedItem',null);
			var nouListItem=this.creaGrupDisponibleItem(workgroupId,workgroupName);
			nouListItem.set({
				backgroundColor: "#DAE7F4"
			});
			this._availableWorkgroupsList.add(nouListItem);
			
			nouListItem.focus();
			this._availableWorkgroupsList.setUserData('selectedItem',nouListItem);
		},

		guardaUsuari: function(){
			if(this._nomBox.getValue()=="" || this._cognomBox.getValue()=="" || this._emailBox.getValue()=="" || this._usernameBox.getValue()==""){
				var optionPane = new eyeos.dialogs.OptionPane(
					"<b>Has d'omplir tots els valors</b>",
						eyeos.dialogs.OptionPane.INFORMATION_MESSAGE,
						eyeos.dialogs.OptionPane.DEFAULT_OPTION);
				var dialog = optionPane.createDialog(this._panel, "Atenció!", function(result) {
				}, this);
				dialog.open();
				return;
			}


			var llistaItems = this._selectedWorkgroupsList.getChildren();
			var arrayWorkgroups = new Array(llistaItems.length);
			for(var i = 0; i< llistaItems.length;i++){
				var listItem = llistaItems[i];
				var workgroupId=listItem.getUserData('workgroupId');
				var blocked=listItem.getUserData('blocked');
				var role="";
				if(!blocked) {
					var children = listItem.getChildren();
					for(var j=0;j<children.length;j++){
						if(children[j] instanceof qx.ui.container.Composite){
							var innerChildren = children[j].getChildren();
							for(var k=0;k<innerChildren.length;k++){
								if(innerChildren[k] instanceof eyeos.ui.form.SelectBox){
									role=innerChildren[k].getSelection()[0].id;
								}
							}
						}
					}
				}
				else{
					role = eyeos.ui.tabs.GroupAll.ROLE_EDITOR;
				}
				arrayWorkgroups[i]=[workgroupId,role];
			}
			eyeos.callMessage(this._checknum, 'saveUser', [this._idUsuari,this._nomBox.getValue(),this._cognomBox.getValue(),this._emailBox.getValue(),this._usernameBox.getValue(),this._nifBox.getValue(),this._addressBox.getValue(),this._telefonBox.getValue(),this._telefonMobilBox.getValue(),this._telefonAddicionalBox.getValue(),this._group,arrayWorkgroups] , function(result) {
				if(result){
					this._tabView.setSelection(this._tabView.getChildren()[0]);
					this._app.ompleLlista(result);
				}
			}, this);
		}
	}
});