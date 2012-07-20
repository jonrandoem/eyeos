qx.Class.define('eyeos.ui.tabs.GroupAdminWindow', {
	extend: eyeos.ui.Window,

	construct: function(checknum, id) {
		if(checknum) {
			this.setChecknum(checknum);
		}

		if(id) {
			this.setId(id);
		}

		arguments.callee.base.call(this, this, 'Group Administration');

		this.set({
			width: 700,
			height: 450,
			caption: tr('Group Administration'),
			layout: new qx.ui.layout.VBox(),
			contentPadding: 2
		});

		this.center();
		this.open();
		this.buildGUI();
		this.addListeners();
		
		this.setActiveMenu('Privacy');
		this._saveButton.focus();
		
	},

	statics: {
		// cis team 
		GENERAL: ['Privacy', 'Description', 'Configuration','Calendars'], 
		// cis team
		MEMBERS: ['Manage', 'Invite', 'Pending'],
		PRIVACY_ERROR_MSG: 'Remember that a public group will always be visible from all the other users in the eyeos system.',
		DESCRIPTION_ERROR_MSG: 'This name is already in use, please choose another one'
	},

	properties: {
		checknum: {
			init: null,
			check: 'Number'
		},

		id: {
			init: null,
			check: 'String',
			apply: '_applyId'
		},

		title: {
			init: null,
			check: 'String',
			apply: '_applyTitle'
		},

		image: {
			init: null,
			check: 'String',
			apply: '_applyImage'
		},

		privacy: {
			init: null,
			check: 'Number',
			apply: '_applyPrivacy'
		},

		description: {
			init: null,
			check: 'String',
			apply: '_applyDescription'
		},

		tags: {
			init: new Array(),
			check: 'Array',
			apply: '_applyTags'
		},
		//cis team
		calendars: {
			init: new Array(),
			check: 'Array',
			apply: '_applyCalendars'
		},
		// cis team

		activeMenu: {
			init: 'Privacy',
			check: ['Privacy', 'Description', 'Configuration', 'Manage', 'Invite', 'Pending','Calendars'], // cis team 
			event: 'changeActiveMenu'
		},

		toBeRemoved: {
			init: false,
			check: 'Boolean'
		},

		groupStatus: {
			init: false,
			check: 'Boolean'
		}
	},

	members: {
		_title: null,				// the title of the header.
		_image: null,				// the image of the header.
		_imagePath: null,			// the FSI path to the image.
		_body: null,				// the qx.ui.container.Composite containing the header and the _content composites.
		_content: null,				// the qx.ui.container.Composite containing the _menu and the _panel composites.
		_menu: null,				// the qx.ui.container.Composite containing the menu entries.
		_panel: null,				// the qx.ui.container.Composite containing the panel of the active menu entry.
		_privacyPanel: null,		// the qx.ui.container.Composite containing the panel of the Privacy menu.
		_descriptionPanel: null,	// the qx.ui.container.Composite containing the panel of the Description menu.
		_configurationPanel: null,	// the qx.ui.container.Composite containing the panel of the Configuration menu.
		_calendarPanel: null,	// the qx.ui.container.Composite containing the panel of the Calendar menu.   //cis team
		_invitePanel: null,			// the qx.ui.container.Composite containing the panel of the Invite menu.
		_managePanel: null,			// the qx.ui.container.Composite containing the panel of the Manage menu.
		_pendingPanel: null,		// the qx.ui.container.Composite containing the panel of the Pending menu.
		_privacyInfoBar: null,		// the qx.ui.container.Composite containing the privacy info top bar.
		_saveButton: null,
		_cancelButton: null,
		_invitePeopleContainer: null,
		_pendingPeopleContainer: null,
		_allPeopleContainer: null,
		_bannedPeopleContainer: null,
		_imageCharging: null,

		close: function() {
			this.setMustBeDisposed(false);
			this.setProcessAlreadyStopped(true);
			arguments.callee.base.call(this);
		},

		getApplication: function() {
			return this;
		},

		getName: function() {
			return 'Group Administration';
		},

		_applyId: function() {
			var params = {
				id: this.getId(),
				includeMeta: 'true'
			};
			
			eyeos.callMessage(this.getChecknum(), '__Workgroups_getWorkgroup', params, function (group) {
				this.setGroupStatus(group.status);
				this.setTitle(group.name);
				this.setImage('index.php?checknum=' + this.getChecknum() +
					'&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + this.getId() + '&refresh=' + new Date().getTime());
				this.setDescription(group.metadata['eyeos.workgroup.description']);
				this.setTags(group.metadata['eyeos.workgroup.tags']);
				this.setPrivacy(group.privacyMode);
				// cis team
				if(group.calendars)
				this.setCalendars(group.calendars); 
				// cis team
			}, this);
		},

		_applyTitle: function() {
			if(this._title) {
//				var param = {'name': this.getTitle()};
//				eyeos.callMessage(this.getChecknum(), '__Workgroups_isWorkgroupPresent', param, function (isPresent) {
//					if (isPresent) {
//						this.fireEvent('nameAlredyPresent');
//					}
//					else {
						this._title.setValue('<strong>' + this.getTitle() + '</strong>');
//					}
//				}, this);
			}
		},

		_applyImage: function() {
			if(this._image) {
				this._image.setSource(this.getImage());
			}
		},

		_applyPrivacy: function() {
			this._validatePrivacy();
			var manager = this._privacyPanel.getUserData('manager');

			switch(this.getPrivacy()) {
				case eyeos.ui.tabs.GroupAll.PRIVACY_OPEN:
					manager.setSelection([manager.getChildren()[0]]);
					break;
				case eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST:
					manager.setSelection([manager.getChildren()[1]]);
					break;
				case eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION:
					manager.setSelection([manager.getChildren()[2]]);
					break;
			}
		},

		_validatePrivacy: function() {
			switch(this.getPrivacy()) {
				case '<strong>Everybody can join</strong>':
					this.setPrivacy(eyeos.ui.tabs.GroupAll.PRIVACY_OPEN);
					break;
				case '<strong>Via request</strong>':
					this.setPrivacy(eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST);
					break;
				case '<strong>Via invitation</strong>':
					this.setPrivacy(eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION);
					break;
			}
		},

		_applyDescription: function() {
			//TODO
		},

		_applyTags: function() {
			//TODO
		},
		// cis team
		_applyCalendars: function() {
			//TODO
		},
		// cis team
		buildGUI: function() {
			this.buildBody();
			this.buildHeader();
			this.buildMenu();
			this.buildPanel();
			this.buildFooter();
		},

		buildBody: function() {
			this._body = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				backgroundColor: 'white'
			});
			this.add(this._body, {flex: 1});
		},

		buildHeader: function() {
			var decoration = new qx.ui.decoration.Single().set({
				width: 1,
				styleBottom: 'solid',
				colorBottom: '#A4A4A4'
			});

			var header = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 80,
				allowGrowY: false,
				backgroundColor: 'white',
				decorator: decoration
			});
			this._body.add(header);

			this._image = new qx.ui.basic.Image().set({
				width: 50,
				height: 50,
				allowGrowX: false,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle',
				margin: 10,
				scale: true
			});
			header.add(this._image);

			this._title = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(15, ['Helvetica', 'Arial']),
				allowGrowX: false,
				alignX: 'center',
				alignY: 'middle',
				rich: true
			});
			header.add(this._title);
		},

		buildMenu: function() {
			this._content = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white'
			});
			this._body.add(this._content, {flex: 1});

			var decoration = new qx.ui.decoration.Single().set({
				width: 1,
				styleRight: 'solid',
				colorRight: '#A4A4A4'
			});

			this._menu = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				backgroundColor: 'white',
				width: 100,
				allowGrowX: false,
				margin: 5,
				decorator: decoration
			});
			this._content.add(this._menu);

			var general = new qx.ui.basic.Label().set({
				value: tr('General'),
				textColor: '#A4A4A4',
				font: new qx.bom.Font(15, ['Helvetica', 'Arial']),
				alignX: 'left',
				alignY: 'middle',
				marginLeft: 3,
				rich: true
			});
			this._menu.add(general);
			this._menu.add(this._menuSeparator());

			this.self(arguments).GENERAL.forEach(function(item) {
				var menuItem = new qx.ui.basic.Label().set({
					value: item,
					textColor: '#75A015',
					font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
					alignX: 'left',
					alignY: 'middle',
					marginLeft: 8,
					rich: true
				});
				menuItem.setUserData('id', item);
				this._menu.add(menuItem);
				this._menu.add(this._menuSeparator());
			}, this);

			var tr_string = tr('Members');
			var members = new qx.ui.basic.Label().set({
				value: tr_string,
				textColor: '#A4A4A4',
				font: new qx.bom.Font(15, ['Helvetica', 'Arial']),
				alignX: 'left',
				alignY: 'middle',
				marginLeft: 3,
				rich: true
			});
			this._menu.add(members);
			this._menu.add(this._menuSeparator());

			this.self(arguments).MEMBERS.forEach(function(item) {
				var menuItem = new qx.ui.basic.Label().set({
					value: item,
					textColor: '#75A015',
					font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
					alignX: 'left',
					alignY: 'middle',
					marginLeft: 8,
					rich: true
				});
				menuItem.setUserData('id', item);
				this._menu.add(menuItem);
				this._menu.add(this._menuSeparator());
			}, this);
		},

		buildPanel: function() {
			this._panel = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				backgroundColor: 'white'
			});
			this._content.add(this._panel, {flex: 1});
		},

		buildPrivacyPanel: function() {
			this._panel.removeAll();
			
			// building the _privacyPanel, if it's not builded yet
			if(this._privacyPanel) {
				this._panel.add(this._privacyPanel);
			}
			else {
				// privacyPanel: container for all the Privacy panel menu
				this._privacyPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._privacyPanel, {flex: 1});

				// privacyInfoBar
				this._privacyInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._privacyPanel.add(this._privacyInfoBar);

				var infoBarLabel = new qx.ui.basic.Label().set({
					value:tr('The current privacy setting is: '),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 5
				});
				this._privacyInfoBar.add(infoBarLabel);

				var infoBarCategoryLabel = new qx.ui.basic.Label().set({
					font: new qx.bom.Font(14, ['Helvetica', 'Ariel']),
					rich: true,
					alignX: 'center',
					alignY: 'middle'
				});
				this._privacyInfoBar.add(infoBarCategoryLabel);

				var infoBarStatusLabel = new qx.ui.basic.Label().set({
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
					margin: 5,
					rich: true,
					alignX: 'center',
					alignY: 'bottom'
				});
				this._privacyInfoBar.add(infoBarStatusLabel);

				// privacyPanel: container for privacyPublic y privacyPrivate
				var decoration = new qx.ui.decoration.Single().set({
					width: 1,
					style: 'solid',
					color: '#A4A4A4'
				});

				var privacyPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: decoration,
					padding: 5,
					margin: 5,
					backgroundColor: 'white'
				});
				this._privacyPanel.add(privacyPanel, {flex: 1});

				// warning/errors container
				var errorBox = this._createErrorBox(tr(this.self(arguments).PRIVACY_ERROR_MSG));
				this._privacyPanel.add(errorBox);

				// privacyPublic
				var privacyPublic = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					backgroundColor: 'white',
					margin: 10
				});
				privacyPanel.add(privacyPublic, {width: '50%'});
				privacyPanel.add(new qx.ui.toolbar.Separator());

				var publicHeader = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: null,
					alignX: 'center',
					alignY: 'middle'
				});
				privacyPublic.add(publicHeader);

				var publicLabel = new qx.ui.basic.Label().set({
					value: '<strong>' + tr('Public') + '</strong>',
					font: new qx.bom.Font(14, ['Helvetica', 'Ariel']),
					textColor: '#87A015',
					rich: true
				});
				publicHeader.add(publicLabel);

				var publicDescriptionLabel = new qx.ui.basic.Label().set({
					value: '</strong>' + tr('Everybody can find it') + '</strong>',
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
					textColor: '#86818B',
					alignX: 'center',
					alignY: 'bottom',
					marginLeft: 10,
					rich: true
				});
				publicHeader.add(publicDescriptionLabel);

				var publicEverybody = new qx.ui.form.RadioButton().set({
					label: '<strong>' + tr('Everybody can join') + '</strong>',
					font: new qx.bom.Font(11, ['Helvetica', 'Ariel']),
					rich: true,
					marginTop: 10
				});
				privacyPublic.add(publicEverybody);

				var publicEverybodyDescription = new qx.ui.basic.Label().set({
					value: tr('Every user can join this group.'),
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
					textColor: '#86818B',
					alignX: 'left',
					alignY: 'middle',
					marginTop: 2,
					marginLeft: 2,
					rich: true
				});
				privacyPublic.add(publicEverybodyDescription);

				var publicRequest = new qx.ui.form.RadioButton().set({
					label: '<strong>' + tr('Via request') + '</strong>',
					font: new qx.bom.Font(11, ['Helvetica', 'Ariel']),
					rich: true,
					marginTop: 10
				});
				privacyPublic.add(publicRequest);

				var publicRequestDescription = new qx.ui.basic.Label().set({
					value: tr('The user can ask to join this group, but his account must be activated by an admin.'),
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
					textColor: '#86818B',
					alignX: 'left',
					alignY: 'middle',
					marginTop: 2,
					marginLeft: 2,
					rich: true
				});
				privacyPublic.add(publicRequestDescription);

				// privacyPrivate
				var privacyPrivate = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					backgroundColor: 'white',
					margin: 10
				});
				privacyPanel.add(privacyPrivate, {
					width: '50%'
				});

				var privateHeader = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: null,
					alignX: 'center',
					alignY: 'middle'
				});
				privacyPrivate.add(privateHeader);

				var privateLabel = new qx.ui.basic.Label().set({
					value: '<strong>' + tr('Private') + '</strong>',
					font: new qx.bom.Font(14, ['Helvetica', 'Ariel']),
					textColor: '#D33939',
					rich: true
				});
				privateHeader.add(privateLabel);

				var privateDescriptionLabel = new qx.ui.basic.Label().set({
					value: '</strong>' + tr('Invisible for everybody') + '</strong>',
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
					textColor: '#86818B',
					alignX: 'center',
					alignY: 'bottom',
					marginLeft: 10,
					rich: true
				});
				privateHeader.add(privateDescriptionLabel);

				var privateInvitation = new qx.ui.form.RadioButton().set({
					label: '<strong>' + tr('Via invitation') + '</strong>',
					font: new qx.bom.Font(11, ['Helvetica', 'Ariel']),
					rich: true,
					marginTop: 10
				});
				privacyPrivate.add(privateInvitation);

				var privateInvitationDescription = new qx.ui.basic.Label().set({
					value: tr('No one user can\'t join this group, just the admins can invite new users.'),
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
					textColor: '#86818B',
					alignX: 'left',
					alignY: 'middle',
					marginTop: 2,
					marginLeft: 2,
					rich: true
				});
				privacyPrivate.add(privateInvitationDescription);

				var manager = new qx.ui.form.RadioGroup(publicEverybody, publicRequest, privateInvitation);
				this._privacyPanel.setUserData('manager', manager);

				manager.addListener('changeSelection', function () {
					this.setPrivacy(manager.getSelection()[0].getLabel());
					var privacyWarning = this._setPrivacyInfoBar(manager.getSelection()[0].getLabel());
					if(privacyWarning == 'hidePrivacyWarning') {
						errorBox.hide();
					}
					else {
						errorBox.show();
					}
				}, this);

				this._setPrivacyInfoBar(manager.getSelection()[0].getLabel());
				errorBox.show();
			}
		},

		buildDescriptionPanel: function() {
			this._panel.removeAll();

			// building the _descriptionPanel, if it's not builded yet
			if(this._descriptionPanel) {
				this._panel.add(this._descriptionPanel);
			}
			else {
				// _descriptionPanel: container for all the Description panel menu
				this._descriptionPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._descriptionPanel, {flex: 1});

				// descriptionInfoBar
				this._descriptionInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._descriptionPanel.add(this._descriptionInfoBar);

				var infoBarLabel = new qx.ui.basic.Label().set({
					value: tr('The current group name is: '),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 5
				});
				this._descriptionInfoBar.add(infoBarLabel);

				var infoBarGroupNameLabel = new qx.ui.basic.Label().set({
					value: '<strong>' + this.getTitle() + '</strong>',
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					rich: true,
					alignX: 'center',
					alignY: 'middle'
				});
//				infoBarGroupNameLabel.addListener('mouseover', function() {
//					this.setCursor('pointer');
//				});
//				infoBarGroupNameLabel.addListener('mouseout', function() {
//					this.setCursor('default');
//				});
				this._descriptionInfoBar.add(infoBarGroupNameLabel);

				var infoBarGroupNameTextField = new qx.ui.form.TextField().set({
					value: this.getTitle(),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					alignX: 'center',
					alignY: 'middle',
					visibility: 'excluded'
				});
				this._descriptionInfoBar.add(infoBarGroupNameTextField);

//				this._descriptionInfoBar.add(new qx.ui.core.Spacer(), {flex: 1});
//				var editButton = new qx.ui.basic.Label().set({
//					value: 'Edit',
//					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
//					alignX: 'center',
//					alignY: 'middle',
//					margin: 5
//				});
//				editButton.setUserData('editable', false);
//				this._descriptionInfoBar.add(editButton);
//
//				editButton.addListener('mouseover', function() {
//					this.setCursor('pointer');
//				});
//				editButton.addListener('mouseout', function() {
//					this.setCursor('default');
//				});
//				editButton.addListener('click', function() {
//					if(editButton.getUserData('editable')) {
//						editButton.setValue('Edit');
//						editButton.setUserData('editable', false);
//						infoBarGroupNameTextField.setVisibility('excluded');
//						infoBarGroupNameLabel.setVisibility('visible');
//						infoBarGroupNameLabel.setValue('<strong>' + infoBarGroupNameTextField.getValue() + '</strong>');
//						this.setTitle(infoBarGroupNameTextField.getValue());
//					}
//					else {
//						editButton.setValue('Done');
//						editButton.setUserData('editable', true);
//						infoBarGroupNameLabel.setVisibility('excluded');
//						infoBarGroupNameTextField.setVisibility('visible');
//						infoBarGroupNameTextField.focus();
//					}
//				}, this);
//
//				infoBarGroupNameLabel.addListener('click', function() {
//					editButton.setValue('Done');
//					infoBarGroupNameLabel.setVisibility('excluded');
//					infoBarGroupNameTextField.setVisibility('visible');
//					infoBarGroupNameTextField.focus();
//				}, this);
//
//				infoBarGroupNameTextField.addListener('changeValue', function() {
//					editButton.setValue('Edit');
//					infoBarGroupNameTextField.setVisibility('excluded');
//					infoBarGroupNameLabel.setVisibility('visible');
//					infoBarGroupNameLabel.setValue('<strong>' + infoBarGroupNameTextField.getValue() + '</strong>');
//					this.setTitle(infoBarGroupNameTextField.getValue());
//				}, this);
//				infoBarGroupNameTextField.addListener('focusout', function() {
//					editButton.setValue('Edit');
//					infoBarGroupNameTextField.setVisibility('excluded');
//					infoBarGroupNameLabel.setVisibility('visible');
//					infoBarGroupNameLabel.setValue('<strong>' + infoBarGroupNameTextField.getValue() + '</strong>');
//					this.setTitle(infoBarGroupNameTextField.getValue());
//				}, this);

				// descriptionPanel: container for description and group image
				var descriptionPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: null,
					padding: 5,
					margin: 5,
					backgroundColor: 'white',
					height: 185
				});
				this._descriptionPanel.add(descriptionPanel, {flex: 1});

				// descriptionLeftPanel
				var descriptionLeftPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					backgroundColor: 'white'
				});
				descriptionPanel.add(descriptionLeftPanel, {width: '50%'});

				var descriptionLabel = new qx.ui.basic.Label().set({
					value: '<b>' + tr('Description') + '</b>',
					rich: true,
					font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
					margin: 5
				});
				descriptionLeftPanel.add(descriptionLabel);

				var descriptionTextArea = new qx.ui.form.TextArea().set({
					value: tr('to be filled with real data'),
					font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					textColor: '#969696',
					margin: 5,
					maxLength: 500,
					width: 250,
					height: 130
				});
				descriptionLeftPanel.add(descriptionTextArea, {flex: 1});
				descriptionTextArea.setUserData('firstFocus', true);

				descriptionTextArea.addListener('activate', function() {
					descriptionTextArea.setTextColor('black');
				}, this);

				descriptionTextArea.addListener('focus', function () {
					if (descriptionTextArea.getUserData('firstFocus')) {
						this.fireDataEvent('updateCounter', 500);
						descriptionTextArea.setValue('');
						descriptionTextArea.setUserData('firstFocus', false);
					}
				}, this);

				descriptionTextArea.addListener('changeValue', function () {
					this.setDescription(descriptionTextArea.getValue());
				}, this);
				
				descriptionTextArea.addListener('input', function () {
					this.fireDataEvent('updateCounter', 500 - descriptionTextArea.getValue().length);
				}, this);

				var counterLabel = new qx.ui.basic.Label().set({
					font: new qx.bom.Font(10, ['Helvetica', 'Arial']),
					textColor: '#969696',
					margin: 5
				});
				this.addListener('updateCounter', function (e) {
					switch (e.getData()) {
						case 0:
							counterLabel.setValue('No characters left.');
							break;
						case 1:
							counterLabel.setValue('One character left.');
							break;
						default:
							counterLabel.setValue(e.getData() + ' characters left.');
							break;
					}
				});
				descriptionLeftPanel.add(counterLabel);

				if(this.getDescription()) {
					descriptionTextArea.setValue(this.getDescription());
					descriptionTextArea.setTextColor('black');
					descriptionTextArea.setUserData('firstFocus', false);
				}

				// descriptionRightPanel
				var descriptionRightPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					backgroundColor: 'white',
					marginLeft: 10
				});
				descriptionPanel.add(descriptionRightPanel, {width: '50%'});

				var imageLabel = new qx.ui.basic.Label().set({
					value: '<b>' + tr('Group Image') + '</b>',
					rich: true,
					font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
					margin: 5
				});
				descriptionRightPanel.add(imageLabel);

				var groupImageBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: null,
					backgroundColor: 'white	',
					height: 80,
					allowGrowY: false,
					margin: 5
				});
				descriptionRightPanel.add(groupImageBox, {flex: 1});

				var imageBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignX: 'center',
						alignY: 'middle'
					}),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					width: 70,
					height: 70,
					allowGrowX: false,
					allowGrowY: false,
					backgroundColor: 'white'
				});
				groupImageBox.add(imageBox);

				var imageImage = new qx.ui.basic.Image().set({
					width: 50,
					height: 50,
					allowGrowX: false,
					allowGrowY: false,
					scale: true
				});
				imageBox.add(imageImage);

				this.addListener('imageFromFile', function(e) {
					if (e.getData() != '') {
						var newSource = 'index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=' + e.getData();
						imageImage.setSource(newSource);
						this.setImage(newSource);
						this._imagePath = e.getData();
					}
				}, this);

				if (this.getImage() != null) {
					imageImage.setSource(this.getImage());
				}

				var imageCommandBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 5,
					backgroundColor: 'white',
					height: 70,
					allowGrowY: false
				});
				groupImageBox.add(imageCommandBox);

				var selectLabel = new qx.ui.basic.Label().set({
					value: tr('Select photo'),
					font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
					textColor: '#297CCE',
					margin: 5
				});
				selectLabel.setCursor('pointer');
				selectLabel.addListener('click', function () {
					var fc = new eyeos.dialogs.FileChooser(this.getChecknum());
					fc.setFilters([{
						desc: 'Images',
						patterns: ['*.jpg', '*.png', '.*gif']
					}]);
					fc.browseOptions = eyeos.dialogs.FileChooser.CASE_INSENSITIVE;
					fc.setAcceptAllFile(false);
					fc.showOpenDialog(this, function(choice, path) {
						if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
							this.fireDataEvent('imageFromFile', path);
						}
					}, this);
				}, this);
				imageCommandBox.add(selectLabel);

				var cancelLabel = new qx.ui.basic.Label().set({
					value: tr('Clear photo'),
					font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
					textColor: '#297CCE',
					margin: 5
				});
				cancelLabel.setCursor('pointer');
				cancelLabel.addListener('click', function () {
					this.setImage('sys:///extern/images/empty_profile.png');
					this.fireDataEvent('imageFromFile', 'sys:///extern/images/empty_profile.png');
				}, this);
				imageCommandBox.add(cancelLabel);

				var infoLabel = new qx.ui.basic.Label().set({
					value: tr('(You can choose JPG, GIF or PNG Files)'),
					font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
					textColor: 'black',
					margin: 5
				});
				descriptionRightPanel.add(infoLabel);

				var errorBox = this._createErrorBox(tr(this.self(arguments).DESCRIPTION_ERROR_MSG));
				this._descriptionPanel.add(errorBox);

				this.addListener('nameAlredyPresent', function() {
					errorBox.show();
				});
			}
		},

		buildConfigurationPanel: function() {
			this._panel.removeAll();
			
			// building the _configurationPanel, if it's not builded yet
			if(this._configurationPanel) {
				this._panel.add(this._configurationPanel);
			}
			else {
				// _configurationPanel: container for all the Description panel menu
				this._configurationPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._configurationPanel, {flex: 1});

				// configurationInfoBar
				this._configurationInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._configurationPanel.add(this._configurationInfoBar);

				var infoBarLabel = new qx.ui.basic.Label().set({
					value: tr('Tags List - Create tags for group indexation'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 5
				});
				this._configurationInfoBar.add(infoBarLabel);

				// configurationPanel: container for group's tags
				var configurationPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 5,
					margin: 5,
					backgroundColor: 'white'
				});
				this._configurationPanel.add(configurationPanel, {flex: 1});

				var tagContainer = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					padding: 10,
					marginTop: 10,
					height: 100,
					width: 450
				});
				configurationPanel.add(tagContainer, {flex: 1});

				var firstColumn = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696').set({
						styleTop: null,
						styleBottom: null,
						styleLeft: null
					}),
					width: 175,
					height: 107,
					allowGrowX: false,
					backgroundColor: 'white'
				});
				tagContainer.add(firstColumn, {flex: 1});

				var firstColumnFirstRow = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignY: 'middle'
					}),
					decorator: null
				});
				firstColumn.add(firstColumnFirstRow);

				this._inputName = new qx.ui.form.TextField('Tag name').set({
					font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					textColor: '#969696',
					marginRight: 5,
					width: 103,
					height: 20,
					allowGrowX: false,
					allowGrowY: false
				});
				this._inputName.addListener('activate', function() {
					this._inputName.setTextColor('black');
				}, this);

				this.addListener('tagAdded', function (e) {
					this._inputName.setValue('');
				});
				this._inputName.addListener('focusin', function (e) {
					this._inputName.setValue('');
					alreadyLabel.setVisibility('hidden');
				}, this);
				firstColumnFirstRow.add(this._inputName);

				var addButton = new qx.ui.form.Button('Add').set({
					height: 12,
					allowGrowY: false
				});
				addButton.addListener('execute', function(e) {
					this._addTag();
				}, this);
				firstColumnFirstRow.add(addButton);

				var alreadyLabel = new qx.ui.basic.Label().set({
					font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
					textColor: '#BF1400',
					visibility: 'hidden'
				});
				this.addListener('tagSizeIncorrect', function () {
					alreadyLabel.setValue('Lenght of tag not allowed.');
					alreadyLabel.setVisibility('visible');
				});
				this.addListener('tagAlreadyPresent', function () {
					alreadyLabel.setValue('You already add this tag.');
					alreadyLabel.setVisibility('visible');
				});
				firstColumn.add(alreadyLabel);

				var secondColumnScroll = new qx.ui.container.Scroll();
				tagContainer.add(secondColumnScroll, {flex: 1});

				this._secondColumn = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.Flow(),
					marginTop: 10,
					padding: 5,
					allowShrinkY: false,
					allowGrowY: true,
					allowGrowX: true,
					backgroundColor: 'white'
				});
				secondColumnScroll.add(this._secondColumn, {flex: 1});
				
				this._populateTags(this.getTags());

				this.addListener('destroyTag', function(e) {
					this._deleteTag(e.getData());
				});

				var groupActivityCheckBox = new qx.ui.form.CheckBox().set({
					label: '<strong>' + tr('Block group activity') + '</strong>',
					marginTop: 15,
					rich: true,
					value: this.getGroupStatus() & eyeos.ui.tabs.GroupAll.STATUS_ACTIVITY_LOCKED
				});
				groupActivityCheckBox.addListener('changeValue', function(e) {
					var status = this.getGroupStatus();
					if (e.getData()) {
						status |= eyeos.ui.tabs.GroupAll.STATUS_ACTIVITY_LOCKED;
					} else {
						status &= ~eyeos.ui.tabs.GroupAll.STATUS_ACTIVITY_LOCKED;
					}
					this.setGroupStatus(status);
				}, this);
				configurationPanel.add(groupActivityCheckBox);

				var groupActivityLabel = new qx.ui.basic.Label().set({
					value: tr('The group activity will be blocked until you deselect this option.'),
					textColor: '#969696',
					marginTop: 2,
					marginLeft: 2
				});
				configurationPanel.add(groupActivityLabel);

				var deleteGroupCheckBox = new qx.ui.form.CheckBox().set({
					label: '<strong>' + tr('Delete group') + '</strong>',
					marginTop: 10,
					rich: true
				});
				deleteGroupCheckBox.addListener('changeValue', function() {
					this.setToBeRemoved(deleteGroupCheckBox.getValue());
				}, this);
				configurationPanel.add(deleteGroupCheckBox);

				var deleteGroupLabel = new qx.ui.basic.Label().set({
					value: tr('Deleting a group will permanently remove it from database.'),
					textColor: '#969696',
					marginTop: 2,
					marginLeft: 2
				});
				configurationPanel.add(deleteGroupLabel);
			}
		},
		// cis team
		buildCalendarPanel: function() {
			this._panel.removeAll();
			
			// building the _calendarPanel, if it's not builded yet
			if(this._calendarPanel) {
				this._panel.add(this._calendarPanel);
			}
			else {
				// _calendarPanel: container for all the Description panel menu
				this._calendarPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._calendarPanel, {flex: 1});

				// calendarInfoBar
				this._calendarInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._calendarPanel.add(this._calendarInfoBar);

				var infoBarLabel = new qx.ui.basic.Label().set({
					value: tr('Add and delete calendars for this group'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 5
				});
				this._calendarInfoBar.add(infoBarLabel);

				// calendarPanel: container for group's calendars
				var calendarPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 5,
					margin: 5,
					backgroundColor: 'white'
				});
				this._calendarPanel.add(calendarPanel, {flex: 1});

				var calendarContainer = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					padding: 10,
					marginTop: 10,
					height: 100,
					width: 450
				});
				calendarPanel.add(calendarContainer, {flex: 1});

				var firstColumn = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696').set({
						styleTop: null,
						styleBottom: null,
						styleLeft: null
					}),
					width: 175,
					height: 107,
					allowGrowX: false,
					backgroundColor: 'white'
				});
				calendarContainer.add(firstColumn, {flex: 1});
				
				var firstColumnFirstRow = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignY: 'middle'
					}),
					decorator: null
				});
				
				
				firstColumn.add(firstColumnFirstRow);
				var calendarNameLabel = new qx.ui.basic.Label().set({
					value: tr('New calendar name'),
					font: new qx.bom.Font(10, ['Helvetica', 'Ariel']).set({bold:true}),
					margin: 5
				});
				firstColumnFirstRow.add(calendarNameLabel);
				

				var firstColumnSecondRow = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox().set({
						alignY: 'middle'
					}),
					decorator: null
				});
				firstColumn.add(firstColumnSecondRow);
				
				

				this._inputName = new qx.ui.form.TextField('').set({
					font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					textColor: '#969696',
					marginRight: 5,
					width: 103,
					height: 20,
					allowGrowX: false,
					allowGrowY: false
				});
				this._inputName.addListener('activate', function() {
					this._inputName.setTextColor('black');
				}, this);

				this.addListener('calendarAdded', function (e) {
					this._inputName.setValue('');
					
				});
				this._inputName.addListener('focusin', function (e) {
					this._inputName.setValue('');
					alreadyLabel.setVisibility('hidden');
				}, this);
				firstColumnSecondRow.add(this._inputName);

				var addButton = new qx.ui.form.Button('Add').set({
					height: 12,
					allowGrowY: false
				});
				addButton.addListener('execute', function(e) {
					this._addCalendar();
				}, this);
				firstColumnSecondRow.add(addButton);

				var alreadyLabel = new qx.ui.basic.Label().set({
					font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
					textColor: '#BF1400',
					visibility: 'hidden'
				});
				this.addListener('calendarSizeIncorrect', function () {
					alreadyLabel.setValue('Lenght of calendar not allowed.');
					alreadyLabel.setVisibility('visible');
				});
				this.addListener('calendarAlreadyPresent', function () {
					alreadyLabel.setValue('You already add this calendar.');
					alreadyLabel.setVisibility('visible');
				});
				firstColumn.add(alreadyLabel);
				

				

				var secondColumnScroll = new qx.ui.container.Scroll();
				calendarContainer.add(secondColumnScroll, {flex: 1});

				this._secondColumn = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					marginTop: 10,
					padding: 5,
					allowShrinkY: false,
					allowGrowY: true,
					allowGrowX: true,
					backgroundColor: 'white'
				});
				secondColumnScroll.add(this._secondColumn, {flex: 1});
				
				this._populateCalendar(this.getCalendars());

				this.addListener('destroyCalendar', function(e) {
					this._deleteCalendar(e.getData());
				});

				
			}
		},
		// cis team
		buildManagePanel: function() {
			this._panel.removeAll();

			// building the _managePanel, if it's not builded yet
			if(this._managePanel) {
				this._panel.add(this._managePanel);
				this._buildManageAll(this._managePanel.getUserData('managePanel'));
			}
			else {
				// _managePanel: container for all the Manage panel menu
				this._managePanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._managePanel, {flex: 1});

				// manageInfoBar
				var manageInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._managePanel.add(manageInfoBar);

				// managePanel: container for manage people in the group
				var managePanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 5,
					margin: 5,
					backgroundColor: 'white'
				});
				this._managePanel.add(managePanel, {flex: 1});
				this._managePanel.setUserData('managePanel', managePanel);

				var manageButtonsLabels = ['All', 'Admins', 'Editors', 'Members', 'Banned'];
				var manageButtonsManager = new qx.ui.form.RadioGroup().set({
					allowEmptySelection: true
				});
				this._managePanel.setUserData('buttonManager', manageButtonsManager);

				manageButtonsLabels.forEach(function(label) {
					var button = new qx.ui.toolbar.RadioButton().set({
						label: tr(label),
						font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
						margin: 2,
						alignX: 'center',
						alignY: 'middle'
					});
					manageInfoBar.add(button);
					this._managePanel.setUserData(label, button);

					button.addListener('mouseover', function() {
						button.setCursor('pointer');
					}, this);

					button.addListener('mouseout', function() {
						button.setCursor('default');
					}, this);

					button.addListener('changeValue', function() {
						if(button.getValue()) {
							button.setBackgroundColor('#61676d');
							button.setTextColor('#ffffff');

							switch(button.getLabel()) {
								case tr('All'):
									this._buildManageAll(managePanel);
									break;
								case tr('Admins'):
									this._buildManageAdmins(managePanel);
									break;
								case tr('Editors'):
									this._buildManageEditors(managePanel);
									break;
								case tr('Members'):
									this._buildManageMembers(managePanel);
									break;
								case tr('Banned'):
									this._buildManageBanned(managePanel);
									break;
							}
						}
						else {
							button.setBackgroundColor('#ededed');
							button.setTextColor('#000000');
						}
					}, this);

					manageButtonsManager.add(button);
					if(button.getLabel() == tr('All')) {
						manageButtonsManager.setSelection([button]);
					}
				}, this);
			}
		},

		_buildManageAll: function(managePanel) {
			this._buildManageHeader(managePanel);
			this._populateAll();
		},

		_populateAll: function() {
			this._allPeopleContainer.removeAll();
			var param = new Array();
			param = {
				workgroupId: this.getId()
			};

			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED)) {
						var item = this._createGenericItem(result.id, result.metadata['eyeos.user.firstname'] + ' ' +
							result.metadata['eyeos.user.lastname'],
							'index.php?checknum=' + this.getChecknum() +
							'&message=__UserInfo_getAvatarPicture&params[userId]=' + result.id,
							result.role, result.status);
							if(item.getUserData('isOwner')) {
								this._allPeopleContainer.addAt(item, 0);
							}
							else {
								this._allPeopleContainer.add(item);
							}
					}
				}, this);
			}, this);
		},

		_buildManageAdmins: function(managePanel) {
			this._buildManageHeader(managePanel);
			this._populateAdmins();
		},

		_populateAdmins: function() {
			this._allPeopleContainer.removeAll();
			var param = new Array();
			param = {
				workgroupId: this.getId()
			};

			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED) &&
						(result.role == eyeos.ui.tabs.GroupAll.ROLE_ADMIN)) {
						var item = this._createGenericItem(result.id, result.metadata['eyeos.user.firstname'] + ' ' +
							result.metadata['eyeos.user.lastname'],
							'index.php?checknum=' + this.getChecknum() +
							'&message=__UserInfo_getAvatarPicture&params[userId]=' + result.id,
							result.role, result.status);
							if(item.getUserData('isOwner')) {
								this._allPeopleContainer.addAt(item, 0);
							}
							else {
								this._allPeopleContainer.add(item);
							}
					}
				}, this);
			}, this);
		},

		_buildManageEditors: function(managePanel) {
			this._buildManageHeader(managePanel);
			this._populateEditors();
		},

		_populateEditors: function() {
			this._allPeopleContainer.removeAll();
			var param = new Array();
			param = {
				workgroupId: this.getId()
			};

			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED) &&
						(result.role == eyeos.ui.tabs.GroupAll.ROLE_EDITOR)) {
						var item = this._createGenericItem(result.id, result.metadata['eyeos.user.firstname'] + ' ' +
							result.metadata['eyeos.user.lastname'],
							'index.php?checknum=' + this.getChecknum() +
							'&message=__UserInfo_getAvatarPicture&params[userId]=' + result.id,
							result.role, result.status);
							if(item.getUserData('isOwner')) {
								this._allPeopleContainer.addAt(item, 0);
							}
							else {
								this._allPeopleContainer.add(item);
							}
					}
				}, this);
			}, this);
		},

		_buildManageMembers: function(managePanel) {
			this._buildManageHeader(managePanel);
			this._populateMembers();
		},

		_populateMembers: function() {
			this._allPeopleContainer.removeAll();
			var param = new Array();
			param = {
				workgroupId: this.getId()
			};

			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					if((result.status !=  eyeos.ui.tabs.GroupAll.STATUS_INVITED) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_PENDING) &&
						(result.status !=  eyeos.ui.tabs.GroupAll.STATUS_BANNED) &&
						(result.role == eyeos.ui.tabs.GroupAll.ROLE_VIEWER)) {
						var item = this._createGenericItem(result.id, result.metadata['eyeos.user.firstname'] + ' ' +
							result.metadata['eyeos.user.lastname'],
							'index.php?checknum=' + this.getChecknum() +
							'&message=__UserInfo_getAvatarPicture&params[userId]=' + result.id,
							result.role, result.status);
							if(item.getUserData('isOwner')) {
								this._allPeopleContainer.addAt(item, 0);
							}
							else {
								this._allPeopleContainer.add(item);
							}
					}
				}, this);
			}, this);
		},

		_createGenericItem: function(id, name, image, role, status) {
			var genericItem = new qx.ui.container.Composite().set({
				height: 50,
				allowGrowY: false,
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});
			genericItem.setUserData('id', id);

			var itemImage = new qx.ui.basic.Image(image).set({
				height: 36,
				width: 36,
				allowGrowX: false,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle',
				scale: true,
				margin: 5
			});
			genericItem.add(itemImage);

			var itemName = new qx.ui.basic.Label(name).set({
				alignX: 'center',
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			genericItem.add(itemName);
			genericItem.add(new qx.ui.core.Spacer(), {flex: 1});

			if(role == eyeos.ui.tabs.GroupAll.ROLE_OWNER) {
				genericItem.setUserData('isOwner', true);
				var ownerLabel = new qx.ui.basic.Label().set({
					value: tr('Owner'),
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					height: 20,
					allowGrowY: false,
					width: 80,
					allowGrowX: false,
					textColor: '#A4A4A4'
				});
				genericItem.add(ownerLabel);

				var changeOwnerLabel = new qx.ui.basic.Label().set({
					value: tr('Change Owner'),
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					marginRight: 30,
					height: 20,
					allowGrowY: false,
					width: 100,
					allowGrowX: false,
					textColor: '#A4A4A4'
				});
				changeOwnerLabel.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				changeOwnerLabel.addListener('mouseout', function() {
					this.setCursor('default');
				});
				changeOwnerLabel.addListener('click', function() {
					this._changeOwnerGroup();
				}, this);
				genericItem.add(changeOwnerLabel);

				var leaveGroupLabel = new qx.ui.basic.Label().set({
					value: tr('Leave group'),
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					height: 20,
					allowGrowY: false,
					width: 80,
					allowGrowX: false,
					textColor: '#A4A4A4'
				});
				leaveGroupLabel.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				leaveGroupLabel.addListener('mouseout', function() {
					this.setCursor('default');
				});
				leaveGroupLabel.addListener('click', function() {
					this._leaveGroup(genericItem.getUserData('id'));
				}, this);
				genericItem.add(leaveGroupLabel);
			}
			else {
				genericItem.setUserData('isOwner', false);
				var privilegeSelectBox = new eyeos.ui.form.SelectBox([
					{name: 'Admin', id: eyeos.ui.tabs.GroupAll.ROLE_ADMIN},
					{name: 'Editor', id: eyeos.ui.tabs.GroupAll.ROLE_EDITOR},
					{name: 'Viewer', id: eyeos.ui.tabs.GroupAll.ROLE_VIEWER},
				]).set({
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					marginRight: 20,
					height: 20,
					allowGrowY: false,
					width: 80,
					allowGrowX: false,
					textColor: '#A4A4A4'
				});
				genericItem.add(privilegeSelectBox);
				genericItem.setUserData('privilege', privilegeSelectBox);

				var itemRole = null;
				switch(role) {
					case eyeos.ui.tabs.GroupAll.ROLE_ADMIN:
						itemRole = privilegeSelectBox.getChildren()[0];
						privilegeSelectBox.setSelection([itemRole]);
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_EDITOR:
						itemRole = privilegeSelectBox.getChildren()[1];
						privilegeSelectBox.setSelection([itemRole]);
						break;
					case eyeos.ui.tabs.GroupAll.ROLE_VIEWER:
						itemRole = privilegeSelectBox.getChildren()[2];
						privilegeSelectBox.setSelection([itemRole]);
						break;
				}

				var accessSelectBox = new eyeos.ui.form.SelectBox([
					{name: 'Allowed', id: eyeos.ui.tabs.GroupAll.STATUS_MEMBER},
					{name: 'Blocked', id: eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED}
				]).set({
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					marginRight: 45,
					height: 20,
					allowGrowY: false,
					width: 80,
					allowGrowX: false,
					textColor: '#A4A4A4'
				});
				genericItem.add(accessSelectBox);
				genericItem.setUserData('access', accessSelectBox);

				var itemStatus = null;
				switch(status) {
					case eyeos.ui.tabs.GroupAll.STATUS_MEMBER:
						itemStatus = accessSelectBox.getChildren()[0];
						accessSelectBox.setSelection([itemStatus]);
						break;
					case eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED:
						itemStatus = accessSelectBox.getChildren()[1];
						accessSelectBox.setSelection([itemStatus]);
						break;
				}

				var remove = new qx.ui.basic.Label().set({
					value: 'Remove',
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				remove.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				remove.addListener('mouseout', function() {
					this.setCursor('default');
				});
				remove.addListener('click', function() {
					var op = new eyeos.dialogs.OptionPane(
						'Are you sure you want to remove that member?',
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
					op.createDialog(
						null,
						'Remove: ' + name,
						function (answer) {
							if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
								var params = {
									workgroupId: this.getId(),
									userIds: new Array()
								};

								params.userIds.push(id);
								eyeos.callMessage(this.getChecknum(), '__Workgroups_deleteMemberships', params, function () {
									genericItem.destroy();
								}, this);
							}
						},this).open();
				}, this);
				genericItem.add(remove);

				genericItem.add(new qx.ui.toolbar.Separator().set({
					height:	15,
					allowGrowY: false,
					alignX: 'center',
					alignY: 'middle'
				}));

				var ban = new qx.ui.basic.Label().set({
					value: 'Ban',
					alignX: 'center',
					alignY: 'middle',
					margin: 5,
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					textColor: '#A4A4A4'
				});
				ban.addListener('mouseover', function() {
					this.setCursor('pointer');
				});
				ban.addListener('mouseout', function() {
					this.setCursor('default');
				});
				ban.addListener('click', function() {
					var op = new eyeos.dialogs.OptionPane(
						'Banning a member will prevent that person from joining your group. Are you sure you want to ban that member?',
						eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
					op.createDialog(
						null,
						'Ban: ' + name,
						function (answer) {
							if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
								var params = {
									workgroupId: this.getId(),
									membersInfo: new Array()
								};

								params.membersInfo.push({userId: id, status: eyeos.ui.tabs.GroupAll.STATUS_BANNED});
								eyeos.callMessage(this.getChecknum(), '__Workgroups_updateMembers', params, function () {
									genericItem.destroy();
								}, this);
							}
						},this).open();
				}, this);
				genericItem.add(ban);
			}

			return genericItem;
		},
		
		_leaveGroup: function(userId) {
			var op = new eyeos.dialogs.OptionPane(
				'To leave the group, first select a new owner. You may not select pending or banned members.',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);

			op.createDialog(
				null,
				'Before leaving this Group...',
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						this._changeOwnerGroup(userId, true);
					}
				},this).open();	
		},

		_changeOwnerGroup: function(userId, deleteAfter) {
			var op = new eyeos.dialogs.OptionPane(
				'Once you delegate the ownership to another user, you will can\'t change it back. Are you sure?',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				'Change Owner',
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var members = this._allPeopleContainer.getChildren();

						members.forEach(function(member) {
							if(member.getUserData('isOwner') == false) {
								member.getChildren()[5].setVisibility('excluded');
								member.getChildren()[6].setVisibility('excluded');
								member.getChildren()[7].setVisibility('excluded');

								var setAsOwner = new qx.ui.basic.Label().set({
									value: 'Set as Owner',
									alignX: 'center',
									alignY: 'middle',
									margin: 5,
									font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
									textColor: '#A4A4A4',
									marginRight: 15
								});

								setAsOwner.addListener('mouseover', function() {
									this.setCursor('pointer');
								});

								setAsOwner.addListener('mouseout', function() {
									this.setCursor('default');
								});

								setAsOwner.addListener('click', function() {
									var params = {
										id: this.getId(),
										ownerId: member.getUserData('id')
									};

									eyeos.callMessage(this.getChecknum(), '__Workgroups_updateWorkgroup', params, function () {
										this._managePanel.getUserData('buttonManager').resetSelection();
										this._managePanel.getUserData('buttonManager').setSelection([this._managePanel.getUserData('All')]);

										var bus = eyeos.messageBus.getInstance();
										bus.send('workgroup', 'changeOwner', eyeos.ui.tabs.GroupAll.ROLE_ADMIN);

										if(deleteAfter) {
											var op = new eyeos.dialogs.OptionPane(
												'Are you sure you want to leave this group?',
												eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
												eyeos.dialogs.OptionPane.YES_NO_OPTION);

											op.createDialog(
												null,
												'Leave Group',
												function (answer) {
													if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
														var toBeDeleted = new Array();

														toBeDeleted = {
															workgroupId: this.getId(),
															userIds: new Array()
														};

														toBeDeleted.userIds.push(userId);

														eyeos.callMessage(this.getChecknum(), '__Workgroups_deleteMemberships', toBeDeleted, function () {
															this._managePanel.getUserData('buttonManager').resetSelection();
															this._managePanel.getUserData('buttonManager').setSelection([this._managePanel.getUserData('All')]);
														}, this);
													}
												},this).open();
										}
									}, this);
								}, this);

								member.add(setAsOwner);
							}
							else {
								member.setVisibility('excluded');
							}
						}, this);
					}
				},this).open();
		},

		_buildManageBanned: function(managePanel) {
			managePanel.removeAll();

			var titleContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				}),
				padding: 5,
				height: 30,
				allowGrowY: false
			});
			managePanel.add(titleContainer);

			var peopleLabel = new qx.ui.basic.Label().set({
				value: tr('People'),
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
				alignX: 'center',
				alignY: 'middle',
				textColor: '#969696'
			});
			titleContainer.add(peopleLabel);

			titleContainer.add(new qx.ui.core.Spacer(), {flex: 1});

			var removeBanLabel = new qx.ui.basic.Label().set({
				value: tr('Remove ban'),
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
				alignX: 'center',
				alignY: 'middle',
				textColor: '#969696',
				width: 80,
				allowGrowX: false
			});
			titleContainer.add(removeBanLabel);

			var scroll = new qx.ui.container.Scroll();
			managePanel.add(scroll, {flex: 1});

			this._bannedPeopleContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false,
				backgroundColor: 'white'
			});
			scroll.add(this._bannedPeopleContainer, {
				flex: 1
			});
			this._populateBanned();
			this._bannedPeopleContainer.setUserData('changes', false);
		},

		_populateBanned: function() {
			this._bannedPeopleContainer.removeAll();
			var param = new Array();
			param = {
				workgroupId: this.getId(),
				status: eyeos.ui.tabs.GroupAll.STATUS_BANNED
			};

			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', param, function (results) {
				results.forEach(function(result) {
					var item = this._createBannedItem(result.metadata['eyeos.user.firstname'] + ' ' +
						result.metadata['eyeos.user.lastname'],
					'index.php?checknum=' + this.getChecknum() +
						'&message=__UserInfo_getAvatarPicture&params[userId]=' + result.id);
					item.setUserData('id', result.id);
					this._bannedPeopleContainer.add(item);
				}, this);
			}, this);
		},

		_createBannedItem: function(name, image) {
			var bannedItem = new qx.ui.container.Composite().set({
				height: 50,
				allowGrowY: false,
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});

			var itemImage = new qx.ui.basic.Image(image).set({
				height: 36,
				width: 36,
				allowGrowX: false,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle',
				scale: true,
				margin: 5
			});
			bannedItem.add(itemImage);

			var itemName = new qx.ui.basic.Label(name).set({
				alignX: 'center',
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			bannedItem.add(itemName);
			bannedItem.add(new qx.ui.core.Spacer(), {flex: 1});

			var removeBanButton = new qx.ui.form.CheckBox().set({
				alignX: 'center',
				alignY: 'middle',
				width: 80,
				paddingLeft: 30,
				allowGrowX: false
			});
			removeBanButton.addListener('changeValue', function() {
				this._bannedPeopleContainer.setUserData('changes', true);
			}, this);
			bannedItem.add(removeBanButton);

			return bannedItem;
		},

		_buildManageHeader: function(managePanel) {
			managePanel.removeAll();

			var titleContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				}),
				padding: 5,
				height: 30,
				allowGrowY: false
			});
			managePanel.add(titleContainer);

			var peopleLabel = new qx.ui.basic.Label().set({
				value: tr('People'),
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
				alignX: 'center',
				alignY: 'middle',
				textColor: '#969696'
			});
			titleContainer.add(peopleLabel);

			titleContainer.add(new qx.ui.core.Spacer(), {flex: 1});

			var privilegeLabel = new qx.ui.basic.Label().set({
				value: tr('Privilege'),
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
				alignX: 'center',
				alignY: 'middle',
				textColor: '#969696',
				width: 50,
				allowGrowX: false,
				marginRight: 55
			});
			titleContainer.add(privilegeLabel);

			var accessLabel = new qx.ui.basic.Label().set({
				value: tr('Access'),
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
				alignX: 'center',
				alignY: 'middle',
				textColor: '#969696',
				width: 50,
				allowGrowX: false,
				marginRight: 165
			});
			titleContainer.add(accessLabel);

			var scroll = new qx.ui.container.Scroll();
			managePanel.add(scroll, {flex: 1});

			this._allPeopleContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false,
				backgroundColor: 'white'
			});
			scroll.add(this._allPeopleContainer, {flex: 1});
		},

		buildInvitePanel: function() {
			this._panel.removeAll();

			// building the _invitePanel, if it's not builded yet
			if(this._invitePanel) {
				this._panel.add(this._invitePanel);
				this._populateInvites();
			}
			else {
				// _invitePanel: container for all the Invite panel menu
				this._invitePanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._invitePanel, {flex: 1});

				// inviteInfoBar
				var inviteInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._invitePanel.add(inviteInfoBar);

				var infoBarLabel = new qx.ui.basic.Label().set({
					value: tr('Select People to invite to your group'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 5,
					alignX: 'center',
					alignY: 'middle'
				});
				inviteInfoBar.add(infoBarLabel);

				var searchBox = this._createSearchBox();
				inviteInfoBar.add(new qx.ui.core.Spacer(), {flex: 1});
				inviteInfoBar.add(searchBox);

				// invitePanel: container for invite people to the group
				var invitePanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 5,
					margin: 5,
					backgroundColor: 'white'
				});
				this._invitePanel.add(invitePanel, {flex: 1});

				var contactsBox = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
					height: 140,
					margin: 5
				});
				invitePanel.add(contactsBox, {flex: 1});

				var scroll = new qx.ui.container.Scroll();
				contactsBox.add(scroll, {flex: 1});

				this._invitePeopleContainer = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.Flow(),
					marginTop: 10,
					padding: 5,
					allowShrinkY: false,
					allowGrowY: true,
					allowGrowX: true
				});
				scroll.add(this._invitePeopleContainer, {flex: 1});
				this._populateInvites();

//				var secondTitleLabel = new qx.ui.basic.Label('<b>Add a personal message</b>').set({
//					font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
//					rich: true,
//					margin: 5
//				});
//				invitePanel.add(secondTitleLabel);
//
//				var messageInput = new qx.ui.form.TextArea().set({
//					font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
//					decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
//					textColor: '#969696',
//					marginTop: 5,
//					marginBottom: 10,
//					maxLength: 500,
//					height: 50,
//					allowGrowY: false
//				});
//
//				messageInput.addListener('activate', function() {
//					messageInput.setTextColor('black');
//				}, this);
//
//				messageInput.addListener('changeValue', function(e) {
//					this.setMessage(messageInput.getValue());
//				}, this);
//				invitePanel.add(messageInput);
			}
		},

		buildPendingPanel: function() {
			this._panel.removeAll();

			// building the _pendingPanel, if it's not builded yet
			if(this._pendingPanel) {
				this._panel.add(this._pendingPanel);
                this._populatePendings();
			}
			else {
				// _pendingPanel: container for all the Pending panel menu
				this._pendingPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 10,
					backgroundColor: 'white'
				});
				this._panel.add(this._pendingPanel, {flex: 1});

				// pendingInfoBar
				var pendingInfoBar = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.RoundBorderBeveled(null, null, 0.7, 5, 5, 5, 5),
					paddingTop: 2,
					paddingBottom: 2,
					backgroundColor: '#ededed'
				});
				this._pendingPanel.add(pendingInfoBar);

				var infoBarLabel = new qx.ui.basic.Label().set({
					value: tr('Please, accept or reject the solicitations below:'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					margin: 5,
					alignX: 'center',
					alignY: 'middle'
				});
				pendingInfoBar.add(infoBarLabel);

				// pendingPanel: container for pending people of the group
				var pendingPanel = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					decorator: null,
					padding: 5,
					margin: 5,
					backgroundColor: 'white'
				});
				this._pendingPanel.add(pendingPanel, {flex: 1});

				var titleContainer = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.HBox(),
					decorator: new qx.ui.decoration.Single().set({
						width: 1,
						styleBottom: 'solid',
						colorBottom: '#A4A4A4'
					}),
					padding: 5,
					height: 30,
					allowGrowY: false
				});
				pendingPanel.add(titleContainer);

				var peopleLabel = new qx.ui.basic.Label().set({
					value: tr('People'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					alignX: 'center',
					alignY: 'middle',
					textColor: '#969696'
				});
				titleContainer.add(peopleLabel);

				titleContainer.add(new qx.ui.core.Spacer(), {flex: 1});

				var acceptLabel = new qx.ui.basic.Label().set({
					value: tr('Accept'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					alignX: 'center',
					alignY: 'middle',
					textColor: '#969696',
					width: 50
				});
				titleContainer.add(acceptLabel);

				var rejectLabel = new qx.ui.basic.Label().set({
					value: tr('Reject'),
					font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
					alignX: 'center',
					alignY: 'middle',
					textColor: '#969696',
					width: 50
				});
				titleContainer.add(rejectLabel);

				var scroll = new qx.ui.container.Scroll();
				pendingPanel.add(scroll, {flex: 1});

				this._pendingPeopleContainer = new qx.ui.container.Composite().set({
					layout: new qx.ui.layout.VBox(),
					marginTop: 10,
					padding: 5,
					allowShrinkY: false,
					backgroundColor: 'white'
				});
				scroll.add(this._pendingPeopleContainer, {flex: 1});
				this._populatePendings();
			}
		},

		_createInvitedItem: function(id, name, image) {
			var pendingItem = new qx.ui.container.Composite().set({
				height: 50,
				allowGrowY: false,
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});

			var itemImage = new qx.ui.basic.Image(image).set({
				height: 36,
				width: 36,
				allowGrowX: false,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle',
				scale: true,
				margin: 5
			});
			pendingItem.add(itemImage);

			var itemName = new qx.ui.basic.Label(name).set({
				alignX: 'center',
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			pendingItem.add(itemName);
			pendingItem.add(new qx.ui.core.Spacer(), {flex: 1});

                        var label = new qx.ui.basic.Label().set({
                            value: 'already invited by a member, waiting for his response.',
				alignX: 'center',
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel']),
                                textColor: '#969696'
			});
                        pendingItem.add(label);

			pendingItem.setUserData('userId', id);
			return pendingItem;
		},

		_createPendingItem: function(id, name, image) {
			var pendingItem = new qx.ui.container.Composite().set({
				height: 50,
				allowGrowY: false,
				layout: new qx.ui.layout.HBox(),
				backgroundColor: 'white',
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					styleBottom: 'solid',
					colorBottom: '#A4A4A4'
				})
			});

			var itemImage = new qx.ui.basic.Image(image).set({
				height: 36,
				width: 36,
				allowGrowX: false,
				allowGrowY: false,
				alignX: 'center',
				alignY: 'middle',
				scale: true,
				margin: 5
			});
			pendingItem.add(itemImage);

			var itemName = new qx.ui.basic.Label(name).set({
				alignX: 'center',
				alignY: 'middle',
				margin: 5,
				font: new qx.bom.Font(12, ['Helvetica', 'Ariel'])
			});
			pendingItem.add(itemName);
			pendingItem.add(new qx.ui.core.Spacer(), {flex: 1});

			var accept = new qx.ui.form.RadioButton().set({
				alignX: 'center',
				alignY: 'middle',
				paddingRight: 30
			});
			accept.setUserData('action', 'accept');
			pendingItem.add(accept);

			var reject = new qx.ui.form.RadioButton().set({
				alignX: 'center',
				alignY: 'middle',
				paddingRight: 25
			});
			reject.setUserData('action', 'reject');
			pendingItem.add(reject);

			var manager = new qx.ui.form.RadioGroup().set({
				allowEmptySelection: true
			});
			manager.add(accept, reject);

			pendingItem.setUserData('manager', manager);
			pendingItem.setUserData('userId', id);
			return pendingItem;
		},

		buildFooter: function() {
			var footer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				height: 40,
				allowGrowY: false,
				backgroundColor: '#ededed',
				decorator: null
			});
			this._body.add(footer);
			footer.add(new qx.ui.core.Spacer(), {flex: 1});

			this._cancelButton = new qx.ui.form.Button().set({
				label: tr('Close'),
				height: 20,
				allowGrowY: false,
				width: 90,
				allowGrowX: false,
				font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
				alignX: 'center',
				alignY: 'middle',
				marginRight: 5
			});
			footer.add(this._cancelButton);

			this._saveButton = new qx.ui.form.Button().set({
				label: tr('Save changes'),
				height: 20,
				allowGrowY: false,
				width: 150,
				allowGrowX: false,
				font: new qx.bom.Font(13, ['Helvetica', 'Arial']),
				alignX: 'center',
				alignY: 'middle',
				marginLeft: 5,
				marginRight: 5
			});
			footer.add(this._saveButton);
		},

		addListeners: function() {
			this.addListener('appear', function() {
				document.eyeDesktopTabs.hideContent();
			});

			this.addListener('disappear', function() {
				document.eyeDesktopTabs.showContent();
				var group = document.eyeDesktopTabs.getChildren()[2];
				document.eyeDesktopTabs.setSelection([group]);
			});

			this.addListener('changeActiveMenu', function() {
				this._changeActiveMenu(this.getActiveMenu());
			});

			var menuItems = this._getMenuItems();
			menuItems.forEach(function(item) {
				item.addListener('mouseover', function() {
					item.setCursor('pointer');
				}, this);

				item.addListener('mouseout', function() {
					item.setCursor('default');
				}, this);

				item.addListener('click', function() {
					this.setActiveMenu(item.getValue());
				}, this)
			}, this);

			this._cancelButton.addListener('click', function() {
				this.close();
			}, this);

			this._saveButton.addListener('click', function() {
				this.saveAndClose();
			}, this);
		},

		saveAndClose: function() {
			if(this.getToBeRemoved()) {
				this._deleteGroup();
			}
			else {
				this._saveGeneral();
				this._saveMembers();
			}
		},

		_deleteGroup: function() {
			var op = new eyeos.dialogs.OptionPane(
				'Are you sure you want to delete this group? All data will be lost.',
				eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
				eyeos.dialogs.OptionPane.YES_NO_OPTION);
			op.createDialog(
				null,
				'Delete Group',
				function (answer) {
					if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
						var params = {
							workgroupId: this.getId()
						};

						eyeos.callMessage(this.getChecknum(), '__Workgroups_deleteWorkgroup', params, function () {
							// Send Event to MessageBus
							var bus = eyeos.messageBus.getInstance();
							bus.send('workgroup', 'deleteGroup', this.getId());

							//Close the window
							this.close();
						}, this);
					}
				},this).open();
		},

		_saveGeneral: function() {
			
			var params = {
				id: this.getId(),
				privacyMode: this.getPrivacy(),
				metadata: {
					'eyeos.workgroup.description': this.getDescription(),
					'eyeos.workgroup.tags': this.getTags()
				},
				status: this.getGroupStatus()
			};

			eyeos.callMessage(this.getChecknum(), '__Workgroups_updateWorkgroup', params, function () {
				if(this._imagePath) {
					var params = {
						workgroupId: this.getId(),
						filePath: this._imagePath
					};

					eyeos.callMessage(this.getChecknum(), '__Workgroups_setWorkgroupPicture', params, function () {
						this._sendUpdates();
					}, this);
				} else {
					this._sendUpdates();
				}
				// cis team
					/*var paramsCal = {
							workgroupId: this.getId(),
							Calendars: this.getCalendars()
						};
					eyeos.callMessage(this.getChecknum(), '__Workgroups_createGroupCalendar', paramsCal, function (group) {
							if(group.calendars)
							this.setCalendars(group.calendars); // team cis
						}, this);*/
				// cis team
				
			}, this);
		},

_sendUpdates: function() {
			var bus = eyeos.messageBus.getInstance();
			var params = {
				id: this.getId(),
				image: this.getImage(),
				title: this.getTitle()
			};
            var	privacyText = this.getPrivacy();
            console.log('PRIVACY ' + privacyText);
            switch(privacyText) {
				case '<strong>' + tr('Everybody can join') + '</strong>':
                    params['privacy'] = eyeos.ui.tabs.GroupAll.PRIVACY_OPEN;
                    break;
				case '<strong>' + tr('Via request') + '</strong>':
					params['privacy'] = eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST;
					break;
				case '<strong>' + tr('Via invitation') + '</strong>':
					params['privacy'] = eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION;
					break;
                case eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION:
                    params['privacy'] = eyeos.ui.tabs.GroupAll.PRIVACY_ONINVITATION;
					break;
                case eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST:
                    params['privacy'] = eyeos.ui.tabs.GroupAll.PRIVACY_ONREQUEST;
					break;
                case eyeos.ui.tabs.GroupAll.PRIVACY_OPEN:
                    params['privacy'] = eyeos.ui.tabs.GroupAll.PRIVACY_OPEN;
					break;
			}

			bus.send('workgroup', 'updateGroup', params);
		},

		_saveMembers: function() {
			if(this._allPeopleContainer) {
				this._saveManage();
			}

			if(this._bannedPeopleContainer) {
				this._saveBanned();
			}

			if(this._invitePeopleContainer) {
				this._saveInvites();
			}

			if(this._pendingPeopleContainer) {
				this._savePendings();
			}
		},

		_saveManage: function() {
			var members = this._allPeopleContainer.getChildren();
			members.shift();

			var params = {
				workgroupId: this.getId(),
				membersInfo: new Array()
			};

			members.forEach(function(member) {
				var role = null;
				var status = null;
				switch(member.getUserData('privilege').getSelection()[0].getLabel()) {
					case tr('Admin'):
						role = eyeos.ui.tabs.GroupAll.ROLE_ADMIN;
						break;
					case tr('Editor'):
						role = eyeos.ui.tabs.GroupAll.ROLE_EDITOR;
						break;
					case tr('Viewer'):
						role = eyeos.ui.tabs.GroupAll.ROLE_VIEWER;
						break;
				}
				switch(member.getUserData('access').getSelection()[0].getLabel()) {
					case 'Allowed':
						status = eyeos.ui.tabs.GroupAll.STATUS_MEMBER;
						break;
					case 'Blocked':
						status = eyeos.ui.tabs.GroupAll.STATUS_SUSPENDED;
						break;
				}

				params.membersInfo.push({
					userId: member.getUserData('id'),
					status: status,
					role: role
				});
			});

			eyeos.callMessage(this.getChecknum(), '__Workgroups_updateMembers', params, function () {
				this._managePanel.getUserData('buttonManager').resetSelection();
				this._managePanel.getUserData('buttonManager').setSelection([this._managePanel.getUserData('All')]);
			}, this);
		},

		_saveBanned: function() {
			if(this._bannedPeopleContainer.getUserData('changes')) {
				var banned = this._bannedPeopleContainer.getChildren();
				var op = new eyeos.dialogs.OptionPane(
					'Are you sure you want to remove the banned condition for those members?',
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
					eyeos.dialogs.OptionPane.YES_NO_OPTION);
				op.createDialog(
					null,
					'Remove ban',
					function (answer) {
						if (answer == eyeos.dialogs.OptionPane.YES_OPTION) {
							var params = {
								workgroupId: this.getId(),
								membersInfo: new Array()
							};

							var toBeDestroyed = new Array();
							banned.forEach(function(item) {
								if(item.getChildren()[3].getValue()) {
									params.membersInfo.push({
										userId: item.getUserData('id'),
										status: eyeos.ui.tabs.GroupAll.STATUS_MEMBER
									});
									toBeDestroyed.push(item);
								}
							}, this);

							eyeos.callMessage(this.getChecknum(), '__Workgroups_updateMembers', params, function () {
								toBeDestroyed.forEach(function(item) {
									item.destroy();
								}, this);
							}, this);
						}
					},this).open();
			}
		},

		_saveInvites: function() {
			var contacts = this._invitePeopleContainer.getChildren();

			if (contacts.length) {
				var params = {
					workgroupId: this.getId(),
					membersInfo: new Array()
				};

				for (var i = 0; i < contacts.length; ++i) {
					if (contacts[i].isSelected()) {
						if(contacts[i].hasPrivilege()) {
							// will the members be automagically accepted??
							// params.membersInfo.push({userId: contacts[i].getId(), role: contacts[i].getRole(), status: eyeos.ui.tabs.AdminInviteContact.STATUS_MEMBER});
							// if they won't, then:
							params.membersInfo.push({userId: contacts[i].getId(), role: contacts[i].getRole()});
						} else {
							var optionPane = new eyeos.dialogs.OptionPane(
								"<b>Please select a privilege for each user invited.</b>",
									eyeos.dialogs.OptionPane.WARNING_MESSAGE,
									eyeos.dialogs.OptionPane.DEFAULT_OPTION);
							var dialog = optionPane.createDialog(this, "User Privileges");
							dialog.open();
							return;
						}
					}
				}
				
				eyeos.callMessage(this.getChecknum(), '__Workgroups_inviteUsers', params, function () {
					this._populateInvites();
				}, this);
			}
		},

		_savePendings: function() {
			var items = this._pendingPeopleContainer.getChildren();
			var accepted = new Array();
			var rejected = new Array();
			var acceptedMembers = new Array();
			var rejectedMembers = new Array();
			var toBeDestroyed = new Array();

			accepted = {
				workgroupId: this.getId(),
				membersInfo: acceptedMembers
			};

			rejected = {
				workgroupId: this.getId(),
				userIds: rejectedMembers
			};

			items.forEach(function(item) {
				if(item.getUserData('manager').getSelection().length) {
					var action = item.getUserData('manager').getSelection()[0].getUserData('action');
					switch(action) {
						case 'accept':
							var status = eyeos.ui.tabs.GroupAll.STATUS_MEMBER;
							acceptedMembers.push({userId: item.getUserData('userId'), status: status});
							break;
						case 'reject':
							rejectedMembers.push(item.getUserData('userId'));
							break;
					}
					toBeDestroyed.push(item);
				}
			}, this);

			if(acceptedMembers.length) {
				eyeos.callMessage(this.getChecknum(), '__Workgroups_updateMembers', accepted, function () {
				}, this);
			}

			if(rejectedMembers.length) {
				eyeos.callMessage(this.getChecknum(), '__Workgroups_deleteMemberships', rejected, function () {
				}, this);
			}

			if(toBeDestroyed.length) {
				var foo = this._pendingPeopleContainer.getChildren().length;
				toBeDestroyed.forEach(function(item) {
					item.destroy();
				}, this);
				this._setPendingNumber(foo - toBeDestroyed.length);
			}
		},

		_changeActiveMenu: function(menu) {
			this._changeBoldMenu(menu);
			
			switch(menu) {
				case 'Privacy':
					this.buildPrivacyPanel();
					break;
				case 'Description':
					this.buildDescriptionPanel();
					break;
				case 'Configuration':
					this.buildConfigurationPanel();
						break;
				case 'Manage':
					this.buildManagePanel();
					break;
				case 'Invite':
					this.buildInvitePanel();
					break;
				case 'Pending':
					this.buildPendingPanel();
					break;
				case 'Calendars':	// cis team 
					this.buildCalendarPanel();
					break;	
				default:
					if(menu.substr(0,7) == 'Pending') {
						this.buildPendingPanel();
					}
			}
		},

		_changeBoldMenu: function(active) {
			var menuItems = this._getMenuItems();
			menuItems.forEach(function(menu) {
				if(menu.getValue() != active) {
					menu.setValue(menu.getUserData('id'));
				}
				else {
					menu.setValue('<strong>' + menu.getValue() + '</strong>');
				}	
			}, this);
		},

		_menuSeparator: function() {
			var menuSeparator = new qx.ui.menu.Separator().set({
				backgroundColor: '#A4A4A4',
				alignX: 'center',
				alignY: 'middle',
				marginRight: 10,
				marginLeft:	-2
			});
			
			return menuSeparator;
		},

		_getMenuItems: function() {
			var menuItems = new Array();

			this._menu.getChildren().forEach(function(child) {
				if(child instanceof qx.ui.basic.Label) {
					if((child.getValue() != tr('General'))  && (child.getValue() != tr('Members'))) {
						menuItems.push(child);
					}
				}
			}, this);

			return menuItems;
		},

		_setPendingNumber: function(number) {
			var menuItems = this._getMenuItems();
			menuItems.forEach(function(item) {
				if(item.getValue().substr(0, 24) == '<strong>Pending</strong>') {
					item.setValue('<strong>Pending</strong>(' + number + ')');
					item.setUserData('id', 'Pending(' + number + ')');
				}
			}, this);
		},

		_setPrivacyInfoBar: function(value) {
			var infoBarCategoryLabel = this._privacyInfoBar.getChildren()[1];
			var infoBarStatusLabel = this._privacyInfoBar.getChildren()[2];
			var errorBox = '';

			switch(value) {
				case '<strong>Everybody can join</strong>':
				case '<strong>Via request</strong>':
					infoBarCategoryLabel.setValue('<strong>Public</strong>');
					infoBarCategoryLabel.setTextColor('#87A015');
					errorBox = 'showPrivacyWarning';
					break;
				case '<strong>Via invitation</strong>':
					infoBarCategoryLabel.setValue('<strong>Private</strong>');
					infoBarCategoryLabel.setTextColor('#D33939');
					errorBox = 'hidePrivacyWarning';
					break;
			}

			infoBarStatusLabel.setValue(' - ' + value);
			return errorBox;
		},

		_createErrorBox: function(errorMsg) {
			var decoration = new qx.ui.decoration.Single().set({
				width: 1,
				style: 'solid',
				color: '#A4A4A4'
			});
				
			var errorBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: decoration,
				margin: 5,
				backgroundColor: 'white',
				visibility: false
			});

			var errorImage = new qx.ui.basic.Image().set({
				source: 'index.php?extern=/images/dialog-warning.png',
				scale: true,
				alignX: 'center',
				alignY: 'middle',
				margin: 5
			});
			errorBox.add(errorImage);

			var errorLabel = new qx.ui.basic.Label().set({
				value: '<strong>Warning:</strong> ' + errorMsg,
				textColor: '#86818B',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				rich: true,
				alignX: 'center',
				alignY: 'middle',
				margin: 5
			});
			errorBox.add(errorLabel);

			return errorBox;
		},

		_addTag: function () {
			var toAdd = this._inputName.getValue();
			if (toAdd.length == 0 || toAdd.length > 20) {
				this.fireEvent('tagSizeIncorrect');
				return;
			}

			//check if already present
			var tags = this.getTags();
			var isPresent = false;
			for (var i = 0; i < tags.length; ++i) {
				if (tags[i] == toAdd) {
					isPresent = true;
				}
			}

			if (!isPresent) {
				var newTag = new eyeos.ui.tabs.GroupTag(toAdd, this);
				this._secondColumn.add(newTag);
				this.getTags().push(toAdd);
				this.fireEvent('tagAdded');
			} else {
				this.fireEvent('tagAlreadyPresent');
			}
		},
		
		_deleteTag: function (name) {
			var tags = this.getTags();
			for (var i = 0; i < tags.length; ++i) {
				if (tags[i] == name) {
					var indexToDelete = i;
				}
			}

			this.getTags().splice(indexToDelete, 1);
		},

		_populateTags: function (tags) {
			for (var i = 0; i < tags.length; ++i) {
				var newTag = new eyeos.ui.tabs.GroupTag(tags[i], this);
				this._secondColumn.add(newTag);
			}
		},
		// cis team
		_addCalendar: function () {
			var toAdd = this._inputName.getValue();
			if (toAdd.length == 0 || toAdd.length > 20) {
				this.fireEvent('calendarSizeIncorrect');
				return;
			}

			//check if already present
			var calendars = this.getCalendars();
			var isPresent = false;
			for (var i = 0; i < calendars.length; ++i) {
				if (calendars[i] == toAdd) {
					isPresent = true;
				}
			}

			if (!isPresent) {
				var obj = {
						name: toAdd,
						id:0,
						update:0
					};
				var newCalendar = new eyeos.ui.tabs.GroupCalendar(obj, this);
				this._secondColumn.add(newCalendar);
				this.getCalendars().push(obj);
				// cis team
					var paramsCal = {
							workgroupId: this.getId(),
							name: this._inputName.getValue()
						};
					eyeos.callMessage(this.getChecknum(), '__Workgroups_createGroupCalendar', paramsCal, function () {
							
						}, this);
				// cis team
				this.fireEvent('calendarAdded');
			} else {
				this.fireEvent('calendarAlreadyPresent');
			}
		},
		_deleteCalendar: function (name) {
			var calendars = this.getCalendars();
			var paramsCal = {calendarId: "0"};
			for (var i = 0; i < calendars.length; ++i) {
				
				if (calendars[i].name == name) {
					var indexToDelete = i;
					calendars[i] = {
						name: calendars[i].name,
						id:calendars[i].id,
						update:2						
					};					
					paramsCal = {calendarId: calendars[i].id};
				}
			}
			//console.log(calendars);
			
		eyeos.callMessage(this.getChecknum(), '__Workgroups_deleteCalendar', paramsCal, function () {
				//if(group.calendars)
				//this.setCalendars(group.calendars); // team cis
			}, this);
			this.setCalendars(calendars)
			this.getCalendars().splice(indexToDelete, 1);
			//console.log(this.getCalendars());
		},

		_populateCalendar: function (calendars) {
			for (var i = 0; i < calendars.length; ++i) {
				
				var newCalendar = new eyeos.ui.tabs.GroupCalendar(calendars[i], this);
				this._secondColumn.add(newCalendar);
			}
		},
		// cis team
		_populateInvites: function () {
			this._invitePeopleContainer.removeAll();
			
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.getAllContacts('accepted', function(friends) {
				var param = new Array();
				param = {workgroupId: this.getId()};
				eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', param, function (members) {
					for (var i = 0; i < friends.length; ++i) {
						for (var j = 0; j < members.length; ++j) {
							if(friends[i].getId() == members[j].id) {
								friends[i].setUserData('invited', true);
								break;
							}
						}
					}

					friends.forEach(function(friend) {
						if(!friend.getUserData('invited')) {
							var contact = new eyeos.ui.tabs.AdminInviteContact(friend, this);
							this._invitePeopleContainer.add(contact);
						} else {
							friend.setUserData('invited', false);
						}
					}, this);
				}, this);
			}, this);
		},

		_populatePendings: function() {
			this._pendingPeopleContainer.removeAll();
			var paramPending = new Array();
			paramPending = {
				workgroupId: this.getId(),
				status: eyeos.ui.tabs.GroupAll.STATUS_PENDING
			};
			
			eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', paramPending, function (resultsPending) {
                            var paramInvited = new Array();
                                paramInvited = {
                                    workgroupId: this.getId(),
                                    status: eyeos.ui.tabs.GroupAll.STATUS_INVITED
                                };

                                eyeos.callMessage(this.getChecknum(), '__Workgroups_getAllMembersFromWorkgroup', paramInvited, function (resultsInvited) {
                                    this._setPendingNumber(resultsPending.length + resultsInvited.length);
                                    
                                    resultsInvited.forEach(function(invited) {
                                            var item = this._createInvitedItem(invited.id, invited.metadata['eyeos.user.firstname'] + ' ' +
                                                    invited.metadata['eyeos.user.lastname'],
                                            'index.php?checknum=' + this.getChecknum() +
                                                    '&message=__UserInfo_getAvatarPicture&params[userId]=' + invited.id);
                                            this._pendingPeopleContainer.add(item);
                                    }, this);
                                }, this);

				// this._setPendingNumber(resultsPending.length);
				resultsPending.forEach(function(pending) {
					var item = this._createPendingItem(pending.id, pending.metadata['eyeos.user.firstname'] + ' ' +
						pending.metadata['eyeos.user.lastname'],
					'index.php?checknum=' + this.getChecknum() +
						'&message=__UserInfo_getAvatarPicture&params[userId]=' + pending.id);
					this._pendingPeopleContainer.add(item);
				}, this);
			}, this);
		},

		_createSearchBox: function (){
			var searchComposite = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
				backgroundColor: '#FFFFFF',
				height: 26,
				maxHeight: 26,
				allowGrowX: false,
				allowGrowY: false,
				decorator: new qx.ui.decoration.RoundBorderBeveled('#9A9A9A', null, 1, 5, 5, 5, 5),
				alignX: 'center',
				alignY: 'middle',
				margin: 5
			});

			var searchClearIcon = new qx.ui.basic.Image('index.php?extern=images/showall.png').set({
				alignY: 'middle',
				alignX: 'center',
				paddingLeft: 0,
				paddingRight: 0
			});

			var searchTextField = new qx.ui.form.TextField().set({
				backgroundColor: '#FFFFFF',
				decorator: new qx.ui.decoration.RoundBorderBeveled('#FFFFFF', '#FFFFFF', 1, 5, 5, 5, 5),
				maxWidth: 200,
				width: 200,
				marginTop: 1,
				marginBottom: 1,
				marginLeft: 1,
				marginRight: 1,
				paddingRight: 23,
				font: new qx.bom.Font(11, ['Lucida Grande', 'Verdana']),
				value: 'Search in People',
				textColor: '#878787'
			});

			searchClearIcon.addListener('click', function (e) {
				this._filterContacts(searchTextField.getValue());
			}, this);

			searchTextField.addListener('focusin', function () {
				if (searchTextField.getValue() == 'Search in People') {
					searchTextField.setUserData('label', searchTextField.getValue());
					searchTextField.setValue('');
					searchTextField.setTextColor('#000000');
				}
			});

			searchTextField.addListener('focusout', function () {
				this.setValue(searchTextField.getUserData('label'));
				this.setTextColor('#878787');
			});

			searchTextField.addListener('keyinput', function(e){
				var value = null;
				
				if(searchTextField.getValue()) {
					value = searchTextField.getValue() + e.getChar();
				}
				else {
					value = e.getChar();
				}

				this._filterContacts(value);
			}, this);

			searchTextField.addListener('keyup', function(e) {
				if((e.getKeyIdentifier() == 'Backspace') || (e.getKeyIdentifier() == 'Enter')) {
					this._filterContacts(e.getTarget().getValue());
				}
			}, this);

			searchComposite.add(searchTextField);
			searchComposite.add(searchClearIcon, {
				right: '2%',
				top : '15%'
			});
			return searchComposite;
		},

		_filterContacts: function (input) {
			var childrenList = this._invitePeopleContainer.getChildren();
			input = input.toLowerCase();
			for (var i = 0; i < childrenList.length; ++i){
				var contactName = childrenList[i].getName().toLowerCase();
				if (contactName.indexOf(input) != -1){
					childrenList[i].setVisibility('visible');
				} else {
					childrenList[i].setVisibility('excluded');
				}
			}
		},

		_showChargingImage: function () {
			if (this._invitePeopleContainer.getBounds()){
				if (this._imageCharging == null) {
					this._imageCharging = new qx.ui.basic.Image('index.php?extern=images/loading.gif').set({
						marginLeft: Math.round((this._invitePeopleContainer.getBounds().width / 2) - 16),
						marginTop: Math.round((this._invitePeopleContainer.getBounds().height / 2) - 16)
					});
				}

				this._invitePeopleContainer.add(this._imageCharging);

			}
		},

		_destroyChargingImage: function () {
			if (this._invitePeopleContainer.getBounds() && this._imageCharging != null){
				this._invitePeopleContainer.removeAll();
			}
		}
	}
});
