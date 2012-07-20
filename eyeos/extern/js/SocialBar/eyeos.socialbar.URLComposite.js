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

qx.Class.define('eyeos.socialbar.URLComposite', {
	extend: qx.ui.container.Composite,

	properties: {
		box: {
			init: null
		},
		checknum: {
			
		},
		url: {

		},
		sentList: {

		},
		sentGroups: {

		},
		availableList: {

		},
		mailGroups: {

		},
		isNew: {

		},
		urlId: {

		}
	},

	construct: function (checknum, urlInformation, sentList, availableList, isNew, urlId, box) {
		this.base(arguments);
		if (box) {
			this.setBox(box);
		}
		this.setChecknum(checknum);
		this.setUrl(urlInformation);
		this.setSentList(sentList);
		this.setAvailableList(availableList);
		this.setIsNew(isNew);
		this.setUrlId(urlId);
		this._buildGui();

	},

	members: {

		_layoutTitleBox: null,
		_layoutExpirationDateContentBox: null,
		_manager: null,
		_passwordField: null,
		_dateField: null,
		_layoutSendFromContentBox: null,
		_selectBox: null,
		_textFieldOther: null,
		_layoutSendToContentBox: null,
		_sentTextArea: null,
		_myContactsList: null,
		_sendTextArea: null,
		_groupsToSendList: null,

		_layoutSaveRecipientsContentBox: null,
		_mailContentBox: null,
		_ed: null,
		_enabledCheckbox: null,
		_acceptCancelButtonsBox: null,
		_infoContentBox: null,
		_subInfoBox: null,
		_selectTemplate: null,

		_ed: null,


		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				backgroundColor: '#FFFFFF'
			});

			this._createTitleBox();
			this._createInfoBox();
			this._createPasswordBox();
			this._createSubInfoBox();
			this._createExpirationDateBox();
			this._enabledBox();
			this._createSendToBox();
			this._createMailTextBox();
			this._createAcceptCancelButtons();
		},

		_createTitleBox: function () {
			this._layoutTitleBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: new qx.ui.decoration.Single(2, 'solid', '#C3C3C3').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				}),
				marginBottom: 5
			});
			this.add(this._layoutTitleBox);

			var createdUrlLabelBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				marginBottom: 5
			});
			this._layoutTitleBox.add(createdUrlLabelBox);

			var createdLabel = new qx.ui.basic.Label(tr('Created URL') + ': ');
			createdUrlLabelBox.add(createdLabel);

			var urlAddressLabel = new qx.ui.form.TextField(this.getUrl().name).set({
				textColor: "#325fa6",
				readOnly: true,
				selectable: true
			});
			//var urlAddressLabel = new qx.html.Label(this.getUrl().name+" ");

			createdUrlLabelBox.add(urlAddressLabel, {width: '45%'});

			//urlAddressLabel.setSelectable(true);

			var createdOnLabelBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()

			});
			this._layoutTitleBox.add(createdOnLabelBox);

			var createdOnLabel = new qx.ui.basic.Label(tr('Creation date') + ': ');
			createdOnLabelBox.add(createdOnLabel);
			var publicationDate = this.getUrl().publicationDate;
			var date = this.__formatStringTime(publicationDate, true);
			var dateLabel = new qx.ui.basic.Label(date);
			dateLabel.setTextColor("grey");
			createdOnLabelBox.add(dateLabel);

			if ( this.getUrl().downloadDate != null ){
				var downOnLabelBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					marginBottom: 10
				});
				this._layoutTitleBox.add(downOnLabelBox);

				var downOnLabel = new qx.ui.basic.Label(tr('Last Download') + ': ');
				downOnLabelBox.add(downOnLabel);
				var downDate = this.getUrl().downloadDate;

				var dateDown = this.__formatStringTime(downDate, true);
				var dateLabelDown = new qx.ui.basic.Label(dateDown);
				dateLabelDown.setTextColor("grey");
				downOnLabelBox.add(dateLabelDown);

			}



		},

		__formatStringTime: function(timestamp, showHours) {
			var dt = new Date(timestamp * 1000);
			var dd = dt.getDate();
			var MM = dt.getMonth() + 1;
			var yy = dt.getFullYear();

			var date = dd + '/' + MM + '/' + yy;
			if (showHours != null && showHours == true) {
				var hh = dt.getHours();
				var mm = dt.getMinutes();
				date += ' ' + hh + ':' + mm;
			}
			return date;

		},

		_createInfoBox: function() {
			this._infoContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
			this.add(this._infoContentBox);
		},

		_createSubInfoBox: function(){
			this._subInfoBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 65,
				marginLeft:30
			});
			this._infoContentBox.add(this._subInfoBox);
		},

		_createPasswordBox: function () {
			this._layoutPasswordContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 65

			});
			this._infoContentBox.add(this._layoutPasswordContentBox);

			var passwordLabel = new qx.ui.basic.Label(tr('Do you want to protect download with a password?'));
			this._layoutPasswordContentBox.add(passwordLabel);

			var noPasswordContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
			this._layoutPasswordContentBox.add(noPasswordContentBox);
			var rbNo = new qx.ui.form.RadioButton(tr('No'));
			rbNo.setUserData("val",'no');
			rbNo.setMarginLeft(10);
			noPasswordContentBox.add(rbNo);

			var siPasswordContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
			this._layoutPasswordContentBox.add(siPasswordContentBox);
			var rbSi = new qx.ui.form.RadioButton(tr('Yes, password') + ': ');
			rbSi.setUserData("val","yes");
			siPasswordContentBox.add(rbSi);
			rbSi.setMarginLeft(10);
			this._passwordField = new qx.ui.form.PasswordField();
			this._passwordField.setMaxLength(8);
			siPasswordContentBox.add(this._passwordField);
			this._passwordField.setWidth(121);
			this._passwordField.setMarginLeft(10);

			this._manager = new qx.ui.form.RadioGroup(rbNo, rbSi)
			this._manager.addListener("changeSelection", function(e){
				var selectedButton = e.getData()[0];
				if(selectedButton.getUserData('val')=='no'){
					this._passwordField.setEnabled(false);
				}
				else{
					this._passwordField.setEnabled(true);
				}
			}, this);

			if(this.getUrl().password != ""){
				this._manager.setSelection([rbSi]);
				this._passwordField.setValue(this.getUrl().password);
				this._passwordField.setEnabled(true);
			}
			else{
				this._manager.setSelection([rbNo]);
				this._passwordField.setValue("");
				this._passwordField.setEnabled(false);
			}

		},

		_createExpirationDateBox: function () {
			this._layoutExpirationDateContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 20,
				marginBottom: 10
			});
			this._subInfoBox.add(this._layoutExpirationDateContentBox);
			var expirationDateLabel = new qx.ui.basic.Label(tr('Expire date') + ': ');
			this._layoutExpirationDateContentBox.add(expirationDateLabel);
			this._dateField = new qx.ui.form.DateField();

			var expirationDate = this.getUrl().expirationDate;
			var date = new Date(expirationDate * 1000);
			this._dateField.setValue(date);
			this._dateField.setMarginLeft(27);
			this._layoutExpirationDateContentBox.add(this._dateField);
		},

		_sendFromBox: function () {
			this._layoutSendFromContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 20,
				marginBottom:10
			});
			this._subInfoBox.add(this._layoutSendFromContentBox);
			var sendFromLabel = new qx.ui.basic.Label(tr('Sender') + ': ');
			this._layoutSendFromContentBox.add(sendFromLabel);

			this._selectBox = new qx.ui.form.SelectBox();
			this._selectBox.setMarginLeft(18);
			this._selectBox.setWidth(150);
			var tempAnonim = new qx.ui.form.ListItem(tr('Anonymous'));
			tempAnonim.setUserData("val","Anonymous");
			this._selectBox.add(tempAnonim);
			var tempMail = new qx.ui.form.ListItem(this.getUrl().myemail);
			tempMail.setUserData("val",this.getUrl().myemail);
			this._selectBox.add(tempMail);
			var tempOther = new qx.ui.form.ListItem(tr('Other'));
			tempOther.setUserData("val","Other");
			this._selectBox.add(tempOther);

			this._layoutSendFromContentBox.add(this._selectBox);

			this._textFieldOther = new qx.ui.form.TextField("");
			this._textFieldOther.setWidth(150);
			this._textFieldOther.setMarginLeft(20);
			this._textFieldOther.setVisibility("hidden");

			this._layoutSendFromContentBox.add(this._textFieldOther);

			this._selectBox.addListener('changeSelection', function (e) {
				var selected = e.getData()[0];
				if(selected == tempOther){
					this._textFieldOther.setVisibility("visible");
					this._textFieldOther.setValue(sendFrom);
				}
				else {
					this._textFieldOther.setVisibility("hidden");
					this._textFieldOther.setValue("");
				}
			}, this);

			var myEmail = this.getUrl().myemail;
			var sendFrom = this.getUrl().sendFrom;
			if(sendFrom == myEmail || !sendFrom){
				this._selectBox.setSelection([tempMail]);
			}
			else if(sendFrom == "Anonymous"){
				this._selectBox.setSelection([tempAnonim]);
			}
			else {
				this._selectBox.setSelection([tempOther]);
			}
		},

		_enabledBox: function () {
			this._enabledContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 20,
				marginBottom:10
			});
			this._subInfoBox.add(this._enabledContentBox);
			var sendFromLabel = new qx.ui.basic.Label(tr('Is Url Active?'));
			this._enabledContentBox.add(sendFromLabel);

			this._enabledCheckbox= new qx.ui.form.CheckBox();
			//console.lorthis.getUrl().enabled
			this._enabledCheckbox.setValue(this.getUrl().enabled==1);
			this._enabledCheckbox.set({
				marginLeft:10
			});
			this._enabledContentBox.add(this._enabledCheckbox);
		},

		_createSentToBoxContainer: function (){
			this._layoutSendToContentBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 50,
				marginBottom: 5
			});
			this.add(this._layoutSendToContentBox);
		},

		_createSentToBoxElements: function (){
			var sentToBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 50,
				padding: 5,
				decorator: new qx.ui.decoration.Single(2, 'solid', '#C3C3C3').set({
					styleTop: null,
					styleLeft: null,
					styleBottom: null

				})
			});

			var sentToLabel = new qx.ui.basic.Label(tr('Url already sent send to') + ': ');
			sentToBox.add(sentToLabel);

			this._sentTextArea = new qx.ui.form.TextArea("");
			this._sentTextArea.setHeight(60);
			sentToBox.add(this._sentTextArea);

			if(this.getIsNew()){
				sentToBox.setVisibility("excluded");
			}
			else {
				sentToBox.setVisibility("visible");
				this._sentTextArea.setEnabled(false);
			}

			var sendToBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 50,
				padding: 5
			});

			var myContactBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 50,
				padding: 5
			});

			sendToBox.add(myContactBox);

			var contactsToSendBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 50,
				padding: 5
			});

			sendToBox.add(contactsToSendBox,{
				flex:1
			});

			var myContactsLabel = new qx.ui.basic.Label(tr('My contacts') + ': ');
			myContactBox.add(myContactsLabel);


			var scroll = new qx.ui.container.Scroll();
			scroll.set({
				height: 60,
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					style: 'solid',
					color: 'black'
				})
			});
			myContactBox.add(scroll);

			this._myContactsList = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				allowShrinkY: false,
				backgroundColor: 'white'
			});

			scroll.add(this._myContactsList, {
				flex: 1
			});


			this._populateMailList();

			/*	var myContactsTextArea = new qx.ui.form.TextArea("Introdueix les adreces separades per comes");
			myContactsTextArea.setTextColor("grey");
			myContactsTextArea.setUserData("initialText",true);
			myContactsTextArea.set({
				height:60,
				textColor:"grey"
			});
			myContactBox.add(myContactsTextArea);*/

			var sendToLabel = new qx.ui.basic.Label(tr('Url will be send to') + ': ');
			contactsToSendBox.add(sendToLabel);

			this._sendTextArea = new qx.ui.form.TextArea(tr('Insert email addresses separated by comma'));
			this._sendTextArea.setTextColor("grey");
			this._sendTextArea.setLiveUpdate(true);
			this._sendTextArea.setUserData("listEnabled",true);
			this._sendTextArea.setUserData("initialText",true);
			this._sendTextArea.set({
				height:60,
				textColor:"grey"
			});
			contactsToSendBox.add(this._sendTextArea);

			this._sendTextArea.addListener('focus', function (e){
				if(this._sendTextArea.getUserData("initialText")){
					this._sendTextArea.setValue("");
					this._sendTextArea.setTextColor("black");
					this._sendTextArea.setUserData("initialText",false);
				}
			}, this);

			this._sendTextArea.addListener('changeValue', function (e){
				if(!this._sendTextArea.getUserData("listEnabled")){
					return;
				}
				var validAddresses = this._getEnteredMailAddresses();
				var children = this._myContactsList.getChildren();
				for(var i=0;i<children.length;i++){
					var find=false;
					for(var j=0;j<validAddresses.length;j++){
						if(children[i].getLabel()==validAddresses[j]){
							children[i].setValue(true);
							find=true;
						}
					}
					if(!find){
						if(!children[i].getUserData('isGroup') && children[i].getEnabled()){
							children[i].setValue(false);
						}

					}
				}

				for(var i=0;i<children.length;i++){

					if(children[i].getUserData('isGroup')){
						var subChildren = children[i].getUserData('subCheckBoxes');
						var allActive = true;
						for(var j=0;j<subChildren.length;j++){
							if(!subChildren[j].getValue()){
								allActive=false;
							}
						}
						if(!allActive && subChildren.length>0){
							children[i].setUserData("listEnabled",false);
							children[i].setValue(false);
							children[i].setUserData("listEnabled",true);
						}
						else if (allActive && subChildren.length>0){
							children[i].setUserData("listEnabled",false);
							children[i].setValue(true);
							children[i].setUserData("listEnabled",true);
						}

					}
				}

			}, this);

			this._layoutSendToContentBox.addListener('appear', function (e){
				var bounds = this._layoutSendToContentBox.getBounds();
				if(!this.getIsNew()) {
					sentToBox.setWidth(bounds.width*0.33);
					sendToBox.setWidth(bounds.width*0.66);
				}
				this._layoutSendToContentBox.add(sentToBox,{
					flex:1
				});
				this._layoutSendToContentBox.add(sendToBox,{
					flex:1
				});
			}, this);

			sendToBox.addListener('appear', function (e){
				var bounds = sendToBox.getBounds();
				myContactBox.setWidth(bounds.width*0.45);
				contactsToSendBox.setWidth(bounds.width*0.45);

				sendToBox.add(myContactBox,{
					flex:1
				});
				sendToBox.add(contactsToSendBox,{
					flex:1
				});
			}, this);

		},

		_createSendToBox: function () {

			this._createSentToBoxContainer();
			this._createSentToBoxElements();

		},

		_populateMailList: function () {

			this._myContactsList.removeAll();
			this._groupsToSendList = new Array();

			var sentList = this.getSentList();
			this._sentTextArea.setValue(sentList.join(", "));

			var availableList = this.getAvailableList();
			for (var i=0;i<availableList.length;i++){
				var checkBox = new qx.ui.form.CheckBox(availableList[i]);
				checkBox.setUserData('isGroup',false);
				this._myContactsList.add(checkBox);
				var find = false;
				for(var j=0;j<sentList.length;j++){
					if(sentList[j]==availableList[i]){
						find=true;
					}
				}
				if(find){
					checkBox.setEnabled(false);
					checkBox.setValue(true);
				}

				var self = this;

				checkBox.addListener('changeValue', function (e){
					if(this.getValue()){
						self._addMailAddress(this.getLabel());
					}
					else {
						self._deleteMailAddress(this.getLabel());
					}
				});

			}
		},

		_refreshMailList: function(){
			eyeos.callMessage(this.getChecknum(), 'getMailList', [this.getUrlId()], function (results){
				this.setSentList(results.sentList);
				this.setAvailableList(results.availableList);
				this.setIsNew(results.isNew);
				this._populateMailList();
				this._sendTextArea.setValue(this._sendTextArea.getValue()+" ");
			}, this);
		},

		_getEnteredMailAddresses: function () {
			var text = this._sendTextArea.getValue();
			var addresses = text.split(",");
			var validAddresses = new Array();
			for(var i=0;i<addresses.length;i++){
				var addressWS = addresses[i].replace(" ","");
				var regt = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
				var re = new RegExp(regt);
				if (addressWS.match(re)) {
					validAddresses.push(addressWS);
				}
			}
			return validAddresses;
		},

		_deleteMailAddress: function (mail) {
			var index = this._sendTextArea.getValue().indexOf(mail);
			var re = new RegExp(" *"+mail+" *,*","g");
			this._sendTextArea.setValue(this._sendTextArea.getValue().replace(re,""));
		},

		_addMailAddress: function (mail) {
			if(this._sendTextArea.getUserData("initialText")){
				this._sendTextArea.setUserData("listEnabled",false);
				this._sendTextArea.setValue("");
				this._sendTextArea.setTextColor("black");
				this._sendTextArea.setUserData("initialText",false);
				this._sendTextArea.setUserData("listEnabled",true);
			}
			var index = this._sendTextArea.getValue().indexOf(mail);
			if(index==-1){
				var re = new RegExp(", *$","g");

				if(!this._sendTextArea.getValue().match(re)){
					var re2 = new RegExp("^\\s*$","g");
					if(this._sendTextArea.getValue().match(re2)){
						this._sendTextArea.setValue(this._sendTextArea.getValue()+mail+", ");
					}
					else{
						this._sendTextArea.setValue(this._sendTextArea.getValue()+", "+mail+", ");
					}

				}
				else{
					this._sendTextArea.setValue(this._sendTextArea.getValue()+mail+", ");
				}

			}
		},

		_createMailTextBox: function (){
			var bottomToolBar = new eyeos.ui.toolbar.ToolBar();

			bottomToolBar.setIconsPath('index.php?extern=images/mail/');
			bottomToolBar.setHeight(33);
			bottomToolBar.setItems(
				new eyeos.socialbar.URLWindow.toolbar.bottom.Items().getItems()
			);
			bottomToolBar.setActions(
				new eyeos.socialbar.URLWindow.toolbar.Actions(this, this.getChecknum())
			);
			bottomToolBar.createToolBar();
			this.add(bottomToolBar);

			var editorWindow = new qx.ui.container.Composite(new qx.ui.layout.HBox());

			editorWindow.setMaxHeight(200);

			this.add(editorWindow,{flex:1});
			editorWindow.addListener('appear', function(e) {

				var tinymceId = 'tinymce_editor' + Math.round(Math.random() * 100 + 1);
				e.getCurrentTarget().getContentElement().getDomElement().setAttribute('id', tinymceId);
				var self =this;
				this._ed = new tinymce.Editor(tinymceId, {
					strict_loading_mode : true,
					theme: 'advanced',
					theme_advanced_buttons1 : "",
					theme_advanced_buttons2 : "",
					theme_advanced_buttons3 : "",
					theme_advanced_toolbar_location : "",
					setup : function(ed) {
						ed.onPostRender.add(function(ed) {
							this.tinyIsReady = true;
							var editor = document.getElementById(ed.id + '_tbl').firstChild;
							editor.lastChild.style.dispay = 'none';
							var flag=true;
							ed.onNodeChange.add(function(ed, cm, e) {
								if (flag) {
									flag = false;
									if (self._selectTemplate == null) {
										ed.setContent(self.getUrl().mailText);
									} else {
										ed.setContent(self._selectTemplate.getSelection()[0].getModel());
									}

								}
							}, this);

						},this);
					}
				});
				this._ed.render();
			}, this);
		},

		_createAcceptCancelButtons: function(){
			this._acceptCancelButtonsBox =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				marginTop: 33
			});
			this.add(this._acceptCancelButtonsBox);

			this._acceptCancelButtonsBox.add(new qx.ui.core.Spacer(), {flex: 1});
			
			var buttonAccept = new qx.ui.form.Button(tr('Accept')).set({
				marginRight: 0,
				width: 100
			});
			
			var buttonCancel = new qx.ui.form.Button(tr('Cancel')).set({
				marginRight: 30
			});
			this._acceptCancelButtonsBox.add(buttonCancel);
			this._acceptCancelButtonsBox.add(buttonAccept);
			
			buttonCancel.addListener("click",function(){
				if(this.getIsNew()){
					eyeos.callMessage(this.getChecknum(), '__UrlShare_deleteURL', this.getUrlId(), function (results){
						this.fireEvent('close');
					}, this);
				}
				else {
					this.fireEvent('close');
				}
			},this);

			buttonAccept.addListener("click",function(){
				var optionPane = new eyeos.dialogs.OptionPane(
					"<b>Has d'entrar una adreça de correu vàlida</b>",
					eyeos.dialogs.OptionPane.WARNING_MESSAGE,
					eyeos.dialogs.OptionPane.DEFAULT_OPTION);
				var dialog = optionPane.createDialog(this, tr('Warning') + '!', function(result) {
					return;
				}, this);

				var passwordSelectedOption = this._manager.getSelection()[0].getUserData('val');
				var passwordField = this._passwordField.getValue();
				var password="";
				if(passwordSelectedOption=="yes"){
					password = passwordField;
				}

				if (this._dateField.getValue()) {
					var dateField = this._dateField.getValue().getTime() / 1000;
				} else {
					var op = new eyeos.dialogs.OptionPane(
						tr('Incorrect Date'),
						eyeos.dialogs.OptionPane.ERROR_MESSAGE,
						null,
						null,
						[tr('Date is not valid')]);
					var d = op.createDialog(this, tr('Date is not valid'), function(result, inputValue) {
						eyeos.consoleInfo(result);
						eyeos.consoleInfo(inputValue);
					});
					d.open();
					return;
				}

				var mailsToSend = this._getEnteredMailAddresses();
//				var sentGroups = this._groupsToSendList;
				var mailText = this._ed.getContent();
				var enabled = this._enabledCheckbox.getValue();

				var param = {
					id: this.getUrlId(),
					password: password,
					expirationDate: dateField,
					mailsToSend: mailsToSend,
					mailText: mailText,
					enabled: enabled
				};

				eyeos.callMessage(this.getChecknum(), '__UrlShare_updateURL', param, function (results){
					if (this.getBox()) {
						this.getBox()._populateURLList();
					}
					this.fireEvent('close');
				}, this);

			},this);



		}


	}
});