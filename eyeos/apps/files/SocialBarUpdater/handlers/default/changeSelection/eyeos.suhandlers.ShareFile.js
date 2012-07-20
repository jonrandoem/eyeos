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
qx.Class.define('eyeos.suhandlers.ShareFile', {
	extend: eyeos.files.ASocialBarHandler,
	implement: [eyeos.files.ISocialBarHandler],

	statics: {
		checkHandler: function (params) {
			return eyeos.files.SUPathManager.isSharePath(params['path']);
		}
	},
	members: {
		_folderPreviewImage: 'index.php?extern=images/64x64/places/folder.png',
		_otherPreviewImage: 'index.php?extern=images/64x64/actions/document-preview.png',
		_multiplePreviewImage: 'index.php?extern=images/64x64/actions/document-multiple-preview.png',

		__shareds: null,		// Array of eyeos.socialbar.Shared

		_infoBox: null,
		_sharedWithBox: null,
		_activityBox: null,

		updateSocialBar: function () {
			this.getSocialBar().createDefaultTabs();
			this._createContentInfoTab();
			this.getSocialBar().removeTab('Share');
			this._createContentActivityTab();
		},

		_createContentInfoTab: function () {
			this._createInfoBox();
			this._createSharedWithBox();
		},

		_createContentActivityTab: function () {
			this._activityBox = new eyeos.socialbar.ActivityBox();
			this.getSocialBar().getTab('Activity').addBox(this._activityBox, 'activityBox');
			var selected = this.getParams()['selected'];
			if (selected.length != 1) {
				return;
			}
			this._activityBox.addListenerOnce('appear', function(e) {
				eyeos.callMessage(this.getParams()['checknum'], '__FileSystem_getFileMetaData', {path: selected[0].getAbsolutePath()}, function(result) {
					if (!result) {
						return;
					}
					if (result.activity && result.activity.length > 0) {
						for(var a = 0; a < result.activity.length; a++) {
							var currentActivity = result.activity[a];
							var currentActivityBox;

							switch(currentActivity.type) {
								case 'creation':
									currentActivityBox = new eyeos.socialbar.Activity(
										'Created',
										currentActivity.by,
										new Date(currentActivity.time * 1000),
										this.getParams()['checknum']
										);
									break;

								case 'edition':
									currentActivityBox = new eyeos.socialbar.Activity(
										'Modification',
										currentActivity.by,
										new Date(currentActivity.time * 1000),
										this.getParams()['checknum'],
										0
										);
									break;

								case 'startsharing':
									currentActivityBox = new eyeos.socialbar.Activity(
										'StartSharing',
										currentActivity['with'],
										new Date(currentActivity.time * 1000),
										this.getParams()['checknum']
										);
									break;

								case 'stopsharing':
									currentActivityBox = new eyeos.socialbar.Activity(
										'StopSharing',
										currentActivity['with'],
										new Date(currentActivity.time * 1000),
										this.getParams()['checknum']
										);
									break;

								default:
									currentActivityBox = new eyeos.socialbar.Activity(
										'',
										currentActivity.by,
										new Date(currentActivity.time * 1000),
										this.getParams()['checknum'],
										'(unknown activity)'
										);
							}
							this._activityBox.add(currentActivityBox);
						}
					}
				}, this);
			}, this);
		},

		_createInfoBox: function () {
			//Contruct the element
			var infoItem = eyeos.socialbar.InfoFactory.getInfoInstance(this.getParams()['selected'], {checknum: this.getParams()['checknum']});
			this._infoBox = new eyeos.socialbar.InfoBox(infoItem);

			//Add listeners
			this._infoBox.addListener('changeRating', function (e) {
				var returnSelected = this.getParams()['selected'];
				var rating = e.getData();
				var files = new Array();
				for (var i = 0; i < returnSelected.length; ++i) {
					files.push(returnSelected[i].getAbsolutePath());
				}
				files.unshift(rating);

				eyeos.callMessage(this.getParams()['checknum'], '__SocialBar_setRating', files, function (results) {
					// Update socialbar handlers data struct
					for(var i = 0; i < returnSelected.length; ++i) {
						returnSelected[i].setRating(rating);
					}

					//Send notification to files
					eyeos.messageBus.getInstance().send('socialbar', 'ratingChanged', {path: this.getParams()['path'], files: returnSelected});

				}, this);
			}, this);
			//Add to Socialbar
			this.getSocialBar().getTab('Info').addBox(this._infoBox, 'infoBox');
		},

		_createSharedWithBox: function () {
			this.__shareds  = eyeos.socialbar.SharedFactory.getSharedInstance(this.getParams()['selected']);
			this._sharedWithBox = new eyeos.socialbar.SharedWithBox(this.getParams()['checknum'], this.__shareds);

			this._sharedWithBox.addListener('deleteShare', function (e) {
				var params = {
					operation: 'Remove',
					userId: e.getData(),
					files: new Array()
				};
				var returnSelected = this.getParams()['selected'];
				for (var j = 0; j < returnSelected.length; ++j) {
					params['files'].push(returnSelected[j].getAbsolutePath());
				}

				eyeos.callMessage(this.getParams()['checknum'], '__FileSystem_changePrivilege', params, function (results) {
					var filesArray = new Array();
					var dBus = eyeos.messageBus.getInstance();
					for (var k = 0; k < results.length; ++k) {
						returnSelected[k].setShared(results[k]);
						filesArray.push(returnSelected[k]);
					}
					dBus.send('files', 'update', [this.getParams()['path'], filesArray]);
				}, this);
			}, this);

			this._sharedWithBox.addListener('changePrivilege', function (e) {
				var args = e.getData();
				var params = {
					operation: args[1],
					userId: args[0],
					files: new Array()
				};
				var returnSelected = this.getParams()['selected'];
				for (var i = 0; i < returnSelected.length; ++i) {
					params['files'].push(returnSelected[i].getAbsolutePath());
				}
				eyeos.callMessage(this.getParams()['checknum'], '__FileSystem_changePrivilege', params, function (results) {
					var filesArray = new Array();
					for (var i = 0; i < results.length; ++i) {
						returnSelected[i].setShared(results[i]);
						filesArray.push(returnSelected[i]);
					}
					var dBus = eyeos.messageBus.getInstance();
					dBus.send('files', 'update', [this.getParams()['path'], filesArray]);
				}, this);
			}, this);


			this.getSocialBar().getTab('Info').addBox(this._sharedWithBox, 'sharedwith');
		}
	}
});