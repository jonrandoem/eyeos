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
* */

qx.Class.define('eyeos.application.usermanagement.groupInfoPage', {
	extend: qx.ui.tabview.Page,

	construct: function (checknum) {
		this.base(arguments, tr('Information'));
		this._checknum = checknum;

		this._buildGui();
	},

	members: {
		_checknum: null,
		_firstRow: null,				//Gui Element
			_image: null,				//Gui Element
			_groupName: null,			//Gui Element
			_groupPrivacy: null,		//Gui Element
		_secondRow: null,				//Gui Element
			_descriptionText: null,		//Gui Element
		_thirdRow: null,				//Gui Element
			_tagContainer: null,

		/**
		 * Update the gui providing a valid groupId
		 */
		updateGui: function (groupId) {
			var params = {
				id: groupId,
				includeMeta: 'true'
			};
			eyeos.callMessage(this._checknum, '__Workgroups_getWorkgroup', params, function (group) {
				this._image.setSource('index.php?checknum=' + this._checknum + '&message=__Workgroups_getWorkgroupPicture&params[workgroupId]=' + group['id']);
				this._groupName.setValue(group['name']);
				var privacyText = '';

				switch (group['privacyMode']) {
					case 0:
						privacyText = 'Public';
						break;
					case 1:
						privacyText = 'On request';
						break;
					case 2:
						privacyText = 'On invitation';
						break;
				}

				this._groupPrivacy.setValue(privacyText);
				this._groupOwner.setValue(group['ownerId']);
				this._descriptionText.setValue(group['metadata']['eyeos.workgroup.description'] + '');

				this._tagContainer.removeAll();
				var tags = group['metadata']['eyeos.workgroup.tags'];
				if (tags) {
					for (var i = 0; i < tags.length; ++i) {
						var tagLabel = new qx.ui.basic.Label('<b>' + tags[i] + '</b>').set({
							font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
							textColor: 'white',
							backgroundColor: '#516074',
							rich: true,
							margin: 5,
							paddingLeft: 5,
							paddingRight: 5
						});
						this._tagContainer.add(tagLabel);
					}
				}
			}, this);

		},

		_refreshGui: function () {
			this._image.setSource('');
			this._groupName.setValue('');

			this._groupPrivacy.setValue('');
			this._groupOwner.setValue('');
			this._descriptionText.setValue('');

			this._tagContainer.removeAll();
		},

		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});

			this._createFirstRow();
			this._createSecondRow();
			this._createThirdRow();
		},

		_createFirstRow: function () {
			this._firstRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			this.add(this._firstRow);

			//Image
			this._image = new qx.ui.basic.Image().set({
				width: 70,
				height: 70,
				allowGrowX: false,
				allowGrowY: false,
				scale: true,
				decorator: new qx.ui.decoration.Single(1, 'solid', 'black')
			});
			this._firstRow.add(this._image);

			//Box With name, privacy and Owner
			var mainInfoBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				margin: 10
			});

			this._firstRow.add(mainInfoBox);

			this._groupName = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(16, ['Helvetica', 'Arial'])
			});
			mainInfoBox.add(this._groupName);

			this._groupPrivacy = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial'])
			});
			mainInfoBox.add(this._groupPrivacy);

			mainInfoBox.add(new qx.ui.core.Spacer(), {flex: 1});

			this._groupOwner = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial'])
			});
			mainInfoBox.add(this._groupOwner);
		},

		_createSecondRow: function () {
			this._secondRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: new qx.ui.decoration.Single(1, 'solid', 'gray').set({
					styleBottom: null,
					styleRight: null,
					styleLeft: null
				}),
				marginTop: 10,
				paddingTop: 10
			});
			this.add(this._secondRow, {height: '36%'});

			var descriptionLabel = new qx.ui.basic.Label(tr('Description')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				textColor: 'gray'
			})
			this._secondRow.add(descriptionLabel);

			this._descriptionText = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				rich: true
			})
			this._secondRow.add(this._descriptionText);

		},

		_createThirdRow: function () {
			this._thirdRow = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
			this.add(this._thirdRow, {flex: 1});

			var tagsLabel = new qx.ui.basic.Label(tr('Tags')).set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				textColor: 'gray'
			});
			this._thirdRow.add(tagsLabel);

			var tagScroll = new qx.ui.container.Scroll();
			this._thirdRow.add(tagScroll, {flex: 1});

			this._tagContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Flow(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false,
				allowGrowY: true,
				allowGrowX: true,
				backgroundColor: 'white'
			});
			tagScroll.add(this._tagContainer, {flex: 1});
		}

	}

});