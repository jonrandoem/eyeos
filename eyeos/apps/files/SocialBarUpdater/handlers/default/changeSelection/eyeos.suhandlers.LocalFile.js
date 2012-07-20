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
qx.Class.define('eyeos.suhandlers.LocalFile', {
	extend: eyeos.files.ASocialBarHandler,
	implement: [eyeos.files.ISocialBarHandler],

	statics: {
		checkHandler: function (params) {
			return eyeos.files.SUPathManager.isLocalPath(params['path']);
		}
	},
	members: {
		_folderPreviewImage: 'index.php?extern=images/64x64/places/folder.png',
		_otherPreviewImage: 'index.php?extern=images/64x64/actions/document-preview.png',
		_multiplePreviewImage: 'index.php?extern=images/64x64/actions/document-multiple-preview.png',

		__shareds: null,		// Array of eyeos.socialbar.Shared

		_infoBox: null,
		_sharedWithBox: null,
		_sharedBox: null,
		_urlBox: null,
		_urlBoxImage: 'index.php?extern=images/22x22/categories/applications-internet.png',
		_activityBox: null,

		updateSocialBar: function () {
			this.getSocialBar().createDefaultTabs();
			var fileType = this.getParams()['selected'][0].getType();
			this._createContentInfoTab();
			
			if (fileType == 'folder' && this.getParams()['selected'].length == 1) {
				this.getSocialBar().removeTab('Share');
			} else {
				this._createContentShareTab();
			}
			
			this._createContentActivityTab();
			//Show only if the selected file is not a folder
			
			if (fileType != 'folder' && this.getParams()['selected'].length == 1) {
				this.getSocialBar().addTab(tr('URL'), this._urlBoxImage , 'white');
				this._createContentUrlTab();
			}
		},

		_createContentInfoTab: function () {
			this._createInfoBox();
			this._createSharedWithBox();
		},

		_createContentUrlTab: function () {
			var sharedURLS = new eyeos.socialbar.Shared(this.getParams()['selected'][0].getAbsolutePath());
			this._urlBox = new eyeos.socialbar.URLBox(this.getParams()['checknum'], null, [sharedURLS]);
			this.getSocialBar().getTab(tr('URL')).addBox(this._urlBox, 'urlbox');
		},

		_createContentShareTab: function () {
			this._sharedBox = new eyeos.socialbar.SharedBox(this.getParams()['checknum'], this.__shareds);

			this._sharedBox.addListener('deleteShare', function (e) {
				var params = {
					operation: 'Remove',
					userId: e.getData(),
					files: new Array()
				};

				var returnSelected = this.getParams()['selected'];
				for (var j = 0; j < returnSelected.length; ++j) {
					params['files'].push(returnSelected[j].getAbsolutePath());
				}

				this._sharedBox.showLoadingImage(true);

				eyeos.callMessage(this.getParams()['checknum'], '__FileSystem_changePrivilege', params, function (results) {
					var filesArray = new Array();
					var currentPath = this.getParams()['path'];
					var dBus = eyeos.messageBus.getInstance();
					for (var k = 0; k < results.length; ++k) {
						returnSelected[k].setShared(results[k]);
						filesArray.push(returnSelected[k]);
						if (this._sharedBox.getTotalSharesUpdated() >= 1) {
							this._sharedBox.setTotalSharesUpdated(this._sharedBox.getTotalSharesUpdated() - 1);
						}
						if (this._sharedBox.getTotalSharesUpdated() == 0) {
							this._sharedBox.showLoadingImage(false);
//							returnSelected[k].updateImage();
							dBus.send('files', 'update', [currentPath, filesArray]);
							dBus.send('socialbar', 'sharesUpdated', this._sharedBox.getShareds());
						}
					}
				}, this);
			}, this);

			this._sharedBox.addListener('changePrivilege', function (e) {
				var args = e.getData();
				var params = {
					operation: args[1],
					userId: args[0],
					files: new Array()
				};

				var returnSelected = this.getParams()['selected'];
				for (var i = 0; i < returnSelected.length; ++i) {
					var absPath = returnSelected[i].getAbsolutePath();
					if(absPath.substr(0, 12) == 'workgroup://') {
						var optionPane = new eyeos.dialogs.OptionPane(
							"<b>You can't share a file that is inside a wrokgroup. To be able to access this file, the user should be member of the group.</b>",
								eyeos.dialogs.OptionPane.INFORMATION_MESSAGE,
								eyeos.dialogs.OptionPane.DEFAULT_OPTION);
						var dialog = optionPane.createDialog(this, "Unable to share this file", function(result) {
						}, this);
						dialog.open();
						return;
					}
					params['files'].push(absPath);
				}

				this._sharedBox.showLoadingImage(true);

				eyeos.callMessage(this.getParams()['checknum'], '__FileSystem_changePrivilege', params, function (results) {
					var filesArray = new Array();
					var currentPath = this.getParams()['path'];
					var dBus = eyeos.messageBus.getInstance();
					for (var i = 0; i < results.length; ++i) {
						returnSelected[i].setShared(results[i]);
						filesArray.push(returnSelected[i]);
						if (this._sharedBox.getTotalSharesUpdated() >= 1) {
							this._sharedBox.setTotalSharesUpdated(this._sharedBox.getTotalSharesUpdated() - 1);
						}
						if (this._sharedBox.getTotalSharesUpdated() == 0) {
							this._sharedBox.showLoadingImage(false);
//							returnSelected[i].updateImage();
							dBus.send('socialbar', 'sharesUpdated', this._sharedBox.getShareds());
							dBus.send('files', 'update', [currentPath, filesArray]);
						}
					}
				}, this);
			}, this);

			this.getSocialBar().getTab('Share').addBox(this._sharedBox, 'sharebox');
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