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

/**
 * The Window showen when a User want to create a New Group
 */

qx.Class.define('eyeos.ui.tabs.NewGroupWindow', {
	extend: qx.ui.window.Window,

	statics: {
		ROLE_OWNER: '0',
		ROLE_ADMIN: '1',
		ROLE_EDITOR: '2',
		ROLE_VIEWER: '3',
		PRIVACY_OPEN: '0',
		PRIVACY_ONREQUEST: '1',
		PRIVACY_ONINVITATION: '2'
	},

	properties: {
		checknum: {

		},
		myStatus: {
			check: ['Privacy', 'Description', 'Configuration', 'Invitation', 'Final'],
			init: 'Privacy'
		},
		privacy: {
			check: [0, 1, 2],
			init: 0
		},
		name: {
			check: 'String',
			init: null,
			apply: '_applyName'
		},
		description: {
			check: 'String',
			init: ''
		},
		image: {
			check: 'String',
			init: null
		},
		tags: {
			init: new Array()
		},
		contacts: {
			init: new Array()
		},
		message: {
			check: 'String',
			init: ''
		},
		wellCreated: {
			check: 'Boolean',
			init: false
		}
	},

	construct: function (checknum) {
		this.base(arguments);
		this.setChecknum(checknum);
		this._firstFocus = true;
		
		this.set({
			layout: new qx.ui.layout.VBox(),
			//decorator: null, <= woah?
			//modal: true,
			resizable: false,
			showStatusbar: false,
			showMaximize: false,
			showMinimize: false,
			//TODO delete comment and disable maximize
			//showClose: false,
			//movable: false,
			backgroundColor: '#FFFFFF',
			width: 520,
			height: 340
		});

		this.center();
		this.open();

		this._buildGui();
		this.setTags(new Array());

		// FIXME: workaround, must be solved better...
		var bus = eyeos.messageBus.getInstance();
		bus.addListener('eyeos_fileChooser_hideModal', function() {
			this.setVisibility('hidden');
		}, this);
		bus.addListener('eyeos_fileChooser_showModal', function() {
			this.setVisibility('visible');
		}, this);

		this.addListener('close', function() {
			bus.send('groups', 'newGroupWindowDone');
		}, this);
	},

	members: {
		_headerLayout: null,
		_privacyHeader: null,
		_headerArrow1: null,
		_descriptionHeader: null,
		_headerArrow2: null,
		_configurationHeader: null,
		_headerArrow3: null,
		_invitationHeader: null,
		_headerArrow4: null,
		_bodyLayout: null,
		_secondColumn: null, 	//Just for Configuration Page to populate Tags
		_inputName: null, 		//Just for Configuration Page to populate Tags
		_contaxtFlow: null, 	//Just for Invitation Page to populate Contacts
		_footerLayout: null,
		_nextButton: null,
		_previousButton: null,
		_cancelButton: null,

		_arrow0: 'index.php?extern=/images/seta-0.png',
		_arrow1: 'index.php?extern=/images/seta-1.png',
		_arrow2: 'index.php?extern=/images/seta-2.png',
		_arrow3: 'index.php?extern=/images/seta-3.png',
		_arrow4: 'index.php?extern=/images/seta-4.png',
		
		_headerFont: new qx.bom.Font(12, ['Helvetica', 'Arial']).set({
			bold: true
		}),
		
		_buildGui: function () {
			this._buildHeader();
			this._buildBody();
			this._buildFooter();
			this._addMyListeners();

			this._changeState('Privacy');
		},

		_buildHeader: function () {
			this._headerLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				decorator: null,
				height: 40,
				allowGrowY: false
			});
			this.add(this._headerLayout, {
				flex: 1
			});

			var createHeader = new qx.ui.basic.Label(tr('Creating a new workgroup')).set({
				font: this._headerFont,
				textColor: 'white',
				backgroundColor: '#939393',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(createHeader, {
				flex: 1
			});

			this._headerArrow1 = new qx.ui.basic.Image(this._arrow2);
			this._headerLayout.add(this._headerArrow1);

			this._privacyHeader = new qx.ui.basic.Label(tr('Privacy')).set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._privacyHeader, {
				flex: 1
			});

			this._headerArrow2 = new qx.ui.basic.Image(this._arrow0);
			this._headerLayout.add(this._headerArrow2);

			this._descriptionHeader = new qx.ui.basic.Label(tr('Description')).set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._descriptionHeader, {
				flex: 1
			});

			this._headerArrow3 = new qx.ui.basic.Image(this._arrow0);
			this._headerLayout.add(this._headerArrow3);

			this._configurationHeader = new qx.ui.basic.Label(tr('Configuration')).set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._configurationHeader, {
				flex: 1
			});

			this._headerArrow4 = new qx.ui.basic.Image(this._arrow0);
			this._headerLayout.add(this._headerArrow4);
			
			this._invitationHeader = new qx.ui.basic.Label(tr('Invitation')).set({
				font: this._headerFont,
				textColor: '#86818B',
				backgroundColor: '#E2E2E2',
				allowGrowY: true,
				textAlign: 'center',
				allowGrowX: true,
				paddingTop: 13
			});
			this._headerLayout.add(this._invitationHeader, {
				flex: 1
			});
		},

		_buildBody: function () {
			this._bodyLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				allowGrowY: true
			});

			this.add(this._bodyLayout, {
				flex: 1
			});
		},

		_buildFooter: function () {
			this._footerLayout =  new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'right'
				}),
				decorator: null,
				allowGrowY: false
			});
			this.add(this._footerLayout, {
				flex: 1
			});

			//Cancel Button
			this._cancelButton = new qx.ui.form.Button(tr('Cancel')).set({
				width: 73,
				marginRight: 20
			});
			this._footerLayout.add(this._cancelButton);

			//Previous Button
			this._previousButton = new qx.ui.form.Button(tr('Previous')).set({
				width: 73,
				marginRight: 5
			});
			this._footerLayout.add(this._previousButton);

			//Next/Accept Button
			this._nextButton = new qx.ui.form.Button(tr('Next')).set({
				width: 73
			});
			this._footerLayout.add(this._nextButton);
		},

		_addMyListeners: function () {
			//Footer Listener
			this._cancelButton.addListener('execute', this._close, this);
			this._previousButton.addListener('execute', this._previousState, this);
			this._nextButton.addListener('execute', this._nextState, this);
		},

		_close: function() {
			this.close();
			this.dispose();
		},

		// overriding...
		close: function() {
			this.base(arguments);
			this.dispose();
		},

		/**
		 * Update the layout and Data for new Status
		 */
		_changeState: function (newStatus) {
			this.setMyStatus(newStatus);
			this._updateHeader();
			this._updateBody();
			this._updateFooter();
		},

		/**
		 * Update header layout based on the status
		 */
		_updateHeader: function () {
			this._resetHeader();

			switch (this.getMyStatus()) {
				case 'Privacy':
					this._headerArrow1.setSource(this._arrow1);
					this._privacyHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow2.setSource(this._arrow3);
					break;
				case 'Description':
					this._descriptionHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow2.setSource(this._arrow4);
					this._headerArrow3.setSource(this._arrow3);
					break;
				case 'Configuration':
					this._configurationHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow3.setSource(this._arrow4);
					this._headerArrow4.setSource(this._arrow3);
					break;
				case 'Invitation':
					this._invitationHeader.set({
						backgroundColor: '#9FC1D4',
						textColor: 'black'
					});
					this._headerArrow4.setSource(this._arrow4);
					break;
				case 'Final':
					break;
			}
		},

		/*
		 * Reset Header Layout
		 */
		_resetHeader: function () {
			this._privacyHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow1.setSource(this._arrow2);

			this._descriptionHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow2.setSource(this._arrow0);
			this._configurationHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow3.setSource(this._arrow0);
			this._invitationHeader.set({
				backgroundColor: '#E2E2E2',
				textColor: '#86818B'
			});
			this._headerArrow4.setSource(this._arrow0);
		},

		/*
		 * Update the Body depending of the State
		 */
		_updateBody: function () {
			this._resetBody();
			switch (this.getMyStatus()) {
				case 'Privacy':
					this._updateBodyPrivacy();
					break;
				case 'Description':
					this._updateBodyDescription();
					break;
				case 'Configuration':
					this._updateBodyConfiguration();
					break;
				case 'Invitation':
					this._updateBodyInvitation();
					break;
				case 'Final':
					this._updateBodyFinal();
			}
		},

		_resetBody: function () {
			this._bodyLayout.removeAll();
		},
		
		/**
		 * Update the Body for state Privacy
		 */
		_updateBodyPrivacy: function () {
			var mainContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null,
				paddingTop: 20,
				paddingLeft: 10,
				paddingRight: 10,
				paddingBottom: 20
			});
			this._bodyLayout.add(mainContainer);

			// LEFT CONTAINER
			var leftContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
			mainContainer.add(leftContainer, {
				width: '50%'
			});

			var titleBoxLeft = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			leftContainer.add(titleBoxLeft);
			
			var privacyLabelLeft = new qx.ui.basic.Label('<b>'+tr('Public')+'</b>').set({
				font: new qx.bom.Font(14, ['Helvetica', 'Ariel']),
				textColor: '#87A015',
				rich: true
			});
			titleBoxLeft.add(privacyLabelLeft);

			var descrLabelLeft = new qx.ui.basic.Label('</b>'+tr('Everybody can find it')+'</b>').set({
				font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
				textColor: '#86818B',
				alignY: 'bottom',
				marginLeft: 5,
				rich: true
			});
			titleBoxLeft.add(descrLabelLeft);

			var publicRadio = new qx.ui.form.RadioButton('<b>'+tr('Everybody can join')+'</b>').set({
				font: new qx.bom.Font(11, ['Helvetica', 'Ariel']),
				rich: true,
				marginTop: 10
			});
			publicRadio.setUserData('radioValue', eyeos.ui.tabs.NewGroupWindow.PRIVACY_OPEN);
			leftContainer.add(publicRadio);

			var descrPublic = new qx.ui.basic.Label().set({
				value: tr('Every user can join this group.'),
				font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
				textColor: '#86818B',
				alignX: 'left',
				alignY: 'middle',
				paddingLeft: 10,
				marginLeft: 10,
				rich: true
			});
			leftContainer.add(descrPublic);

			var descrPublic_ = new qx.ui.basic.Label('');
			leftContainer.add(descrPublic_);

			var requestRadio = new qx.ui.form.RadioButton('<b>'+tr('Via request')+'</b>').set({
				font: new qx.bom.Font(11, ['Helvetica', 'Ariel']),
				rich: true
			});
			requestRadio.setUserData('radioValue', eyeos.ui.tabs.NewGroupWindow.PRIVACY_ONREQUEST);
			leftContainer.add(requestRadio);

			var descrRequest = new qx.ui.basic.Label().set({
				value: tr('The user can ask to join this group, but his account must be activated by an admin.'),
				font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
				textColor: '#86818B',
				alignX: 'left',
				alignY: 'middle',
				paddingLeft: 10,
				marginLeft: 10,
				rich: true
			});
			leftContainer.add(descrRequest);

			var descrRequest_ = new qx.ui.basic.Label('');
			leftContainer.add(descrRequest_);


			// RIGHT CONTAINER
			var rightContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
			mainContainer.add(rightContainer, {
				width: '50%'
			});

			var titleBoxRight = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			rightContainer.add(titleBoxRight);

			var privacyLabelRight = new qx.ui.basic.Label('<b>'+tr('Private')+'</b>').set({
				font: new qx.bom.Font(14, ['Helvetica', 'Ariel']),
				textColor: '#D33939',
				rich: true
			});
			titleBoxRight.add(privacyLabelRight);

			var descrLabelRight = new qx.ui.basic.Label('</b>'+tr('Invisible for everybody')+'</b>').set({
				font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
				textColor: '#86818B',
				alignY: 'bottom',
				marginLeft: 5,
				rich: true
			});
			titleBoxRight.add(descrLabelRight);

			var privateRadio = new qx.ui.form.RadioButton('<b>'+tr('Via Invitation')+'</b>').set({
				font: new qx.bom.Font(11, ['Helvetica', 'Ariel']),
				rich: true,
				marginTop: 10
			});
			privateRadio.setUserData('radioValue', eyeos.ui.tabs.NewGroupWindow.PRIVACY_ONINVITATION);
			rightContainer.add(privateRadio);

			var descrPrivate = new qx.ui.basic.Label().set({
				value: '</strong>' + tr('Invisible for everybody.') + '</strong>',
				font: new qx.bom.Font(10, ['Helvetica', 'Ariel']),
				textColor: '#86818B',
				alignX: 'left',
				alignY: 'middle',
				paddingLeft: 10,
				marginLeft: 10,
				rich: true
			});
			rightContainer.add(descrPrivate);

			var descrPrivate_ = new qx.ui.basic.Label('');
			rightContainer.add(descrPrivate_);

			// Add all radio buttons to the manager
			var manager = new qx.ui.form.RadioGroup(publicRadio, requestRadio, privateRadio);

			// Update Radio Group Selection depending on Privacy value
			switch (this.getPrivacy()) {
				case eyeos.ui.tabs.NewGroupWindow.PRIVACY_OPEN:
					manager.setSelection([publicRadio]);
					break;
				case eyeos.ui.tabs.NewGroupWindow.PRIVACY_ONREQUEST:
					manager.setSelection([requestRadio]);
					break;
				case eyeos.ui.tabs.NewGroupWindow.PRIVACY_ONINVITATION:
					manager.setSelection([privateRadio]);
					break;
			}
			// When Selection change, update the properties Privacy
			manager.addListener('changeSelection', function (e) {
				this.setPrivacy(manager.getSelection()[0].getUserData('radioValue'));
			}, this);
			
		},

		/**
		 * Update the Body for state Description
		 */
		_updateBodyDescription: function () {
			var mainContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				paddingTop: 20,
				paddingLeft: 10,
				paddingRight: 10,
				paddingBottom: 20
			});
			this._bodyLayout.add(mainContainer, {
				flex: 1
			});

			// First Row
			var firstRowContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				decorator: null,
				allowGrowX: false,
				marginRight: 5
			});
			mainContainer.add(firstRowContainer);

			var nameLabel = new qx.ui.basic.Label('<b>'+tr('Name')+'</b>').set({
				rich: true,
				font: new qx.bom.Font(11, ['Helvetica', 'Arial'])
			});
			firstRowContainer.add(nameLabel, {
				top: 0,
				left: 0
			});

			var nameValue = (this.getName() != null) ? this.getName() : tr('Choose a name for your workgroup');
			var nameInput = new qx.ui.form.TextField(nameValue).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
				textColor: '#969696',
				marginTop: 10,
				width: 263,
				allowGrowX: false
			});
			nameInput.addListener('activate', function() {
				nameInput.setTextColor('black');
			}, this);

			firstRowContainer.add(nameInput, {
				top: 15,
				left: 0
			});
			nameInput.setUserData('firstFocus', true);			
			nameInput.foo = this;
			nameInput.addListener('focus', function (e) {
				errorLabel.setVisibility('hidden');
				
				if (this.foo._firstFocus) {
					this.set({
						value: '',
						textColor: '#969696'
					});
					this.setUserData('firstFocus', false);
					this.foo._firstFocus = false;
				}
			});
			nameInput.addListener('focusout', function (e) {
				this.setName(nameInput.getValue());
			}, this);
			this._nameInput = nameInput;

			var errorLabel = new qx.ui.basic.Label(tr('Name already present.')).set({
				visibility: 'hidden',
				textColor: '#BF1400',
				font: new qx.bom.Font(12, ['Helvetica', 'Arial'])
			});
			firstRowContainer.add(errorLabel, {
				top: 28,
				left: 268
			});
			this.addListener('nameAlredyPresent', function (e) {
				errorLabel.setVisibility('visible');
			}, this);

			// Second Row
			var secondRowContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			mainContainer.add(secondRowContainer);

			// Second Row --> First Column
			var firstColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				width: 263,
				allowGrowX: false,
				marginRight: 5
			});
			secondRowContainer.add(firstColumn);

			var descrLabel = new qx.ui.basic.Label('<b>'+tr('Description')+'</b>').set({
				rich: true,
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				marginTop: 10
			});
			firstColumn.add(descrLabel);

			var descrValue = (this.getDescription() != null) ? this.getDescription() : tr('Some words about your workgroup.');
			var descrInput = new qx.ui.form.TextArea(descrValue).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
				textColor: '#969696',
				marginTop: 10,
				maxLength: 500
			});
			descrInput.addListener('activate', function() {
				descrInput.setTextColor('black');
			}, this);

			descrInput.setUserData('firstFocus', true);
			descrInput.addListener('focus', function (e) {
				if (descrInput.getUserData('firstFocus')){
					this.fireDataEvent('updateCounter', 500);
					descrInput.setUserData('firstFocus', false);
				}
			}, this);
			descrInput.addListener('changeValue', function (e) {
				this.setDescription(descrInput.getValue());
			}, this);
			descrInput.addListener('input', function (e) {
				this.fireDataEvent('updateCounter', 500 - descrInput.getValue().length);
			}, this);
			firstColumn.add(descrInput);

			var counterLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(10, ['Helvetica', 'Arial']),
				textColor: '#969696'
			});
			this.addListener('updateCounter', function (e) {
				switch (e.getData()) {
					case 0:
						counterLabel.setValue(tr('No characters left.'));
						break;
					case 1:
						counterLabel.setValue(tr('One character left.'));
						break;
					default:
						counterLabel.setValue(e.getData() + tr(' characters left.'));
						break;
				}
			});
			firstColumn.add(counterLabel);

			// Second Row --> Second Column
			var secondColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				marginLeft: 5
			});
			secondRowContainer.add(secondColumn, {
				flex: 1
			});

			var imageLabel = new qx.ui.basic.Label('<b>'+tr('Image')+'</b>').set({
				rich: true,
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				marginTop: 10
			});
			secondColumn.add(imageLabel);
			

			// Second Row --> Second Column -->Group ImageBox
			var groupImageBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			secondColumn.add(groupImageBox, {
				flex: 1
			});

			var imageBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
				marginTop: 10,
				paddingTop: 10,
				paddingBottom: 10,
				paddingRight: 10,
				paddingLeft: 10,
				width: 70,
				height: 70,
				allowGrowX: false,
				allowGrowY: false
			});
			groupImageBox.add(imageBox);
			
			var imageImage = new qx.ui.basic.Image().set({
				width: 48,
				height: 48,
				allowGrowX: false,
				allowGrowY: false,
				scale: true
			});
			imageImage.setSource('index.php?extern=images/workgroup-empty.png');
			this.addListener('updateImage', function(e) {
				var oldSource = e.getData();
				if (oldSource != '' || oldSource != null) {
					var newSource = 'index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_getScaledImage&params[path]=' + e.getData()+'&params[maxHeight]=48&params[maxWidth]=48';
					imageImage.setSource(newSource);
				}
			});
			if (this.getImage() != null) {
				this.fireDataEvent('updateImage', this.getImage());
			}
			imageBox.add(imageImage);

			var imageCommandBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				padding: 3
			});
			groupImageBox.add(imageCommandBox);

			var selectLabel = new qx.ui.basic.Label(tr('Select photo')).set({
				font: new qx.bom.Font(10, ['Helvetica', 'Arial']),
				textColor: '#297CCE',
				marginTop: 10,
				marginLeft: 5
			});
			selectLabel.setCursor('pointer');
			
			selectLabel.addListener('click', function (e) {
				//Opening File Chooser
				var fc = new eyeos.dialogs.FileChooser(this.getChecknum());
				fc.setFilters([{
					desc: 'Images',
					patterns: ['*.jpg', '*.png', '*.gif']
				}]);
				fc.browseOptions = eyeos.dialogs.FileChooser.CASE_INSENSITIVE;
				fc.setAcceptAllFile(false);
				fc.showOpenDialog(this, function(choice, path) {
					if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
						//Set Properties Image
						this.setImage(path);
						// Update Layout
						this.fireDataEvent('updateImage', path);
					}
				}, this);
			}, this);
			imageCommandBox.add(selectLabel);

			var cancelLabel = new qx.ui.basic.Label(tr('Clear photo')).set({
				font: new qx.bom.Font(10, ['Helvetica', 'Arial']),
				textColor: '#297CCE',
				marginTop: 7,
				marginLeft: 5
			});
			cancelLabel.setCursor('pointer');
			cancelLabel.addListener('click', function (e) {
				imageImage.setSource('index.php?checknum=' + this.getChecknum() + '&message=__FileSystem_readFile&params[path]=sys:///extern/images/workgroup-empty.png');
			}, this);
			imageCommandBox.add(cancelLabel);

			var infoLabel = new qx.ui.basic.Label(tr('(You can choose JPG, GIF or PNG Files)')).set({
				font: new qx.bom.Font(10, ['Helvetica', 'Arial']),
				textColor: 'black',
				marginTop: 5,
				marginLeft: 2
			});
			secondColumn.add(infoLabel);
		},


		/**
		 * Update the Body for state Configuration
		 */
		_updateBodyConfiguration: function () {
			var mainContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				paddingTop: 20,
				paddingLeft: 10,
				paddingRight: 10,
				paddingBottom: 20
			});
			this._bodyLayout.add(mainContainer, {
				flex: 1
			});

			var titleLabel = new qx.ui.basic.Label('<b>'+tr('Create tags for group indexation')+'</b>').set({
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				rich: true
			});
			mainContainer.add(titleLabel);

			// Main Container --> tagContainer
			var tagContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
				padding: 10,
				marginTop: 10,
				height: 107,
				width: 447,
				allowGrowY: false,
				allowGrowX: false
			});
			mainContainer.add(tagContainer);

			var clearTagLabel = new qx.ui.basic.Label('<b>'+tr('Clear all tags')+'</b>').set({
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				rich: true,
				paddingTop: 10,
				textColor: '#297CCE'
			});
			mainContainer.add(clearTagLabel);

			clearTagLabel.addListener('mouseover', function() {
				clearTagLabel.setCursor('pointer');
			}, this);

			clearTagLabel.addListener('mouseout', function() {
				clearTagLabel.setCursor('default');
			}, this);

			clearTagLabel.addListener('click', function() {
				this._deleteAllTags();
			}, this);

			// Main Container --> tagContainer --> firstColumn
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
				allowGrowY: false
			});
			tagContainer.add(firstColumn);

			// Main Container --> tagContainer --> firstColumn --> First Row

			var firstColumnFirstRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				decorator: null
			});
			firstColumn.add(firstColumnFirstRow);
			
			this._inputName = new qx.ui.form.TextField(tr('Tag name')).set({
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

			// Main Container --> tagContainer --> firstColumn
			var alreadyLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				textColor: '#BF1400',
				visibility: 'hidden'
			});
			this.addListener('tagSizeIncorrect', function (e) {
				alreadyLabel.setValue(tr('Lenght of tag not allowed.'));
				alreadyLabel.setVisibility('visible');
			});
			this.addListener('tagAlreadyPresent', function (e) {
				alreadyLabel.setValue(tr('You already add this tag.'));
				alreadyLabel.setVisibility('visible');
			});
			firstColumn.add(alreadyLabel);

			// Main Container --> tagContainer --> secondColumnScroll
			var secondColumnScroll = new qx.ui.container.Scroll();
			tagContainer.add(secondColumnScroll, {
				flex: 1
			});
			
			this._secondColumn = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Flow(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false,
				allowGrowY: true,
				allowGrowX: true
			});
			secondColumnScroll.add(this._secondColumn);
			
			this._populateTags(this.getTags());
			this.addListener('destroyTag', function(e) {
				this._deleteTag(e.getData());
			});
		},

		_addTag: function () {
			var toAdd = escapeHtml(this._inputName.getValue());
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

		_deleteAllTags: function () {
			var tagItems = this._secondColumn.removeAll();
			this.setTags(new Array());
		},
		
		_populateTags: function (tags){
			for (var i = 0; i < tags.length; ++i) {
				var newTag = new eyeos.ui.tabs.GroupTag(tags[i], this);
				this._secondColumn.add(newTag);
			}
		},
		/**
		 * Update the Body for state Invitation
		 */
		_updateBodyInvitation: function () {
			var mainContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				width: 600,
				allowGrowX: false
			});
			this._bodyLayout.add(mainContainer, {
				flex: 1
			});

			// mainContainer --> First Row
			var firstRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				decorator: null
			});
			mainContainer.add(firstRow);

			var firstTitleLabel = new qx.ui.basic.Label('<b>'+tr('Select people to invite to your workgroup')+'</b>').set({
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				rich: true
			});
			firstRow.add(firstTitleLabel, {
				top: 10,
				left: 0
			});

			var searchBox = this._createSearchBox();
			firstRow.add(searchBox, {
				top: 1,
				right: 0
			});

			var contaxtBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
				height: 135,
				allowGrowY: false,
				marginTop: 10
			});
			mainContainer.add(contaxtBox);

			var contaxtScroll = new qx.ui.container.Scroll();
			contaxtBox.add(contaxtScroll, {
				flex: 1
			});

			this._contaxtFlow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Flow(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false,
				allowGrowY: true,
				allowGrowX: true
			});
			contaxtScroll.add(this._contaxtFlow, {
				flex: 1
			});

			this._populateContacts();

		//			var secondTitleLabel = new qx.ui.basic.Label('<b>Add a personal message</b>').set({
		//				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
		//				rich: true,
		//				marginTop: 5
		//			});
		//			mainContainer.add(secondTitleLabel, {top: 10, left: 0});
		//
		//			var messageInput = new qx.ui.form.TextArea().set({
		//				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
		//				decorator: new qx.ui.decoration.Single(1, 'solid', '#969696'),
		//				textColor: '#969696',
		//				marginTop: 5,
		//				marginBottom: 10,
		//				maxLength: 500,
		//				height: 50,
		//				allowGrowY: false
		//			});
		//
		//			messageInput.addListener('activate', function() {
		//				messageInput.setTextColor('black');
		//			}, this);
		//
		//			messageInput.addListener('changeValue', function(e) {
		//				this.setMessage(messageInput.getValue());
		//			}, this);
		//			mainContainer.add(messageInput);
			
		},

		_populateContacts: function () {
			this._contaxtFlow.removeAll();
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.getAllContacts('accepted', function(friends) {
				for (var i = 0; i < friends.length; ++i) {
					var contact = new eyeos.ui.tabs.AdminInviteContact(friends[i], this);
					this._contaxtFlow.add(contact);
				}
			}, this);
		//			eyeos.callMessage(this.getChecknum(), 'getAllContacts', null, function (results) {
		//				for (var i = 0; i < results.length; ++i) {
		//					var contact = new eyeos.ui.tabs.ContactAll(
		//						results[i].userName,
		//						results[i].userId,
		//						results[i].listsName,
		//						results[i].lists,
		//						this
		//					);
		//					contact.cleanMenu();
		//					this._contaxtFlow.add(contact);
		//				}
		//			}, this);
		},

		_createSearchBox: function (){
			var searchComposite = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
				backgroundColor: '#FFFFFF',
				height: 26,
				maxHeight: 26,
				allowGrowX: false,
				allowGrowY: false,
				marginTop: 4,
				marginRight: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled('#9A9A9A', null, 1, 5, 5, 5, 5)
			});

			var searchClearIcon = new qx.ui.basic.Image('index.php?extern=images/showall.png').set({
				alignY: 'middle',
				alignX: 'center',
				paddingLeft: 0,
				paddingRight: 0
			});

			var searchTextField = new qx.ui.form.TextField('Search').set({
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
				value: tr('Search in your Contacts')
			});

			this._searchTextField = searchTextField;
			searchClearIcon.addListener('click', function (e) {
				this._filterContacts(searchTextField.getValue());
			}, this);

			searchTextField.addListener('focusin', function () {
				if (searchTextField.getValue() == tr('Search in your Contacts')) {
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

			searchTextField.addListener('keyup', function(e){
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
			var childrenList = this._contaxtFlow.getChildren();
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

		_updateBodyFinal: function () {
			this._deleteAllTags();
			var mainContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				decorator: null,
				width: 600,
				allowGrowX: false
			});
			this._bodyLayout.add(mainContainer, {
				flex: 1
			});

			var image = new qx.ui.basic.Image().set({
				marginRight: 10
			});
			mainContainer.add(image);

			var textLabel = new qx.ui.basic.Label().set({
				font: new qx.bom.Font(14, ['Helvetica', 'Arial'])
			});
			mainContainer.add(textLabel);

			if (this.isWellCreated()){
				image.setSource('index.php?extern=/images/48x48/actions/mail-mark-notjunk.png');
				textLabel.setValue(tr('Well done! Your workgroup has been created.'));
			} else {
				image.setSource('index.php?extern=/images/48x48/status/dialog-warning.png');
				textLabel.setValue(tr('An error occured while attemting to create your workgroup'));
			}
		},
		
		/**
		 * Update the footer depending of the State
		 */
		_updateFooter: function () {
			switch (this.getMyStatus()) {
				case 'Privacy':
					this._previousButton.set({
						enabled: false
					});
					break;
				case 'Description':
					this._previousButton.set({
						enabled: true
					});
					break;
				case 'Configuration':
					this._nextButton.set({
						label: 'Next'
					});
					break;
				case 'Invitation':
					this._nextButton.set({
						label: 'Create'
					});
					break;
				case 'Final':
					this._nextButton.set({
						label: 'Close'
					});
					this._previousButton.set({
						enabled: false
					});
					this._cancelButton.set({
						enabled: false
					});
					break;
			}
		},

		/**
		 * Event Function when is this._previousButton pressed
		 */
		_previousState: function () {
			switch (this.getMyStatus()) {
				case 'Description':
					this._changeState('Privacy');
					break;
				case 'Configuration':
					this._changeState('Description');
					break;
				case 'Invitation':
					this._changeState('Configuration');
					break;
			}
		},

		/**
		 * Event Function when is this._nextButton pressed
		 */
		_nextState: function () {
			switch (this.getMyStatus()) {
				case 'Privacy':
					this._changeState('Description');
					break;
				case 'Description':
					var trim = '';
					if (this.getName()) {
						trim = this.getName().replace(/^\s+|\s+$/g,"");
					}

					if (!trim) {
						alert(tr('Name of the group already present, empty or illegal character'));
					} else if(trim.length <= 2 || trim.length > 40) {
						alert(tr('The name of the group should contain at least 3 characters and a maximum of 40'));
					}else {

						this.setName(this._nameInput.getValue());

						var param = {
							'name': this.getName()
						};

						eyeos.callMessage(this.getChecknum(), '__Workgroups_isWorkgroupPresent', param, function (results) {
							if (results) {
								this.fireEvent('nameAlredyPresent');
								this.setName('');
							} else {
								this._changeState('Configuration');
							}
						}, this);
					}
					break;
				case 'Configuration':
					this._changeState('Invitation');
					break;
				case 'Invitation':
					this._finish();
					break;
				case 'Final':
					this._close();
					break;
			}
		},

		/**
		 * Check if all data is correct and create new Group
		 */
		_finish: function () {
			if (this.getName() == '') {
				eyeos.alert(tr('To create new workgroup you should insert a valid name'));
			} else {
				//Update Name
				param = {
					name: this.getName(),
					privacyMode: this.getPrivacy()
				};
				eyeos.callMessage(this.getChecknum(), '__Workgroups_createWorkgroup', param, function (newGroupId) {
					// METADATA
					var params = {
						id: newGroupId,
						metadata: {
							'eyeos.workgroup.description': this.getDescription()
						}
					};
					eyeos.callMessage(this.getChecknum(), '__Workgroups_updateWorkgroup', params, function (results) {}, this);

					//Update Image
					if (this.getImage() != null){
						var param = {
							workgroupId: newGroupId,
							filePath: this.getImage()
						};
						eyeos.callMessage(this.getChecknum(), '__Workgroups_setWorkgroupPicture', param, function (results) {}, this);
					}
					
					//Update Tags
					if (this.getTags() != null){
						var arrayTags = this.getTags();
						var params = {
							id: newGroupId,
							metadata: {
								'eyeos.workgroup.tags': arrayTags
							}
						};
						
						eyeos.callMessage(this.getChecknum(), '__Workgroups_updateWorkgroup', params, function (results) {}, this);
					}
					
					//INVITE PEOPLE
					var contacts = this._contaxtFlow.getChildren();
					if (contacts.length > 0){
						var params = {
							workgroupId: newGroupId,
							membersInfo: Array()
						};
						for (var i = 0; i < contacts.length; ++i){
							if (contacts[i].isSelected()){
								params.membersInfo.push({
									userId: contacts[i].getId(),
									role: contacts[i].getRole()
								});
							}
						}
						eyeos.callMessage(this.getChecknum(), '__Workgroups_inviteUsers', params, function (results) {}, this);
					}
					var bus = eyeos.messageBus.getInstance();
					bus.send('workgroup', 'createGroup', [this.getName(), newGroupId]);
					this.setWellCreated(true);
					this._changeState('Final');
				}, this, function () {
					this.setWellCreated(false);
					this._changeState('Final');
				}, this );
			}
			
		},
		/**
		 * Set Method for Name Properties, check if GroupName is disponible and
		 * eventually set the Name with the new Value, otherwise an event is sendend
		 * to comunicate this information to the user
		 */
		_applyName: function (newValue, oldValue) {
			if (newValue != '') {
				var param = {
					'name': newValue
				};
				eyeos.callMessage(this.getChecknum(), '__Workgroups_isWorkgroupPresent', param, function (results) {
					if (results) {
						this.fireEvent('nameAlredyPresent');
						this.setName('');
					}
				}, this);
			}
		}
		
	}
});