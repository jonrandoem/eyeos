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
 *
 */
qx.Class.define('eyeos.socialbar.file2InfoConverter', {
	extend: qx.core.Object,

	properties: {
		object: {
			init: null
		},
		params: {
			init: null
		}
	},
	construct: function () {
		this.base(arguments);
	},
	
	members: {
		_folderPreviewImage: 'index.php?extern=images/64x64/places/folder.png',
		_otherPreviewImage: 'index.php?extern=images/64x64/actions/document-preview.png',
		_multiplePreviewImage: 'index.php?extern=images/64x64/actions/document-multiple-preview.png',

		createInfo: function (object, params) {
			this.setObject(object);
			this.setParams(params);
			var name = this._getName();
			var previewImage = this._getPreviewImagePath();
			var infoList = this._getInfoList();
			var ratingEnabled = true;
			var ratingValue = this._getRating();
			var infoItem = new eyeos.socialbar.Info(name, infoList, previewImage, ratingEnabled, ratingValue);
			return infoItem;
		},
		_getName: function () {
			var selectedFiles = this.getObject();
			//SINGLE FILE
			if (selectedFiles.length == 1) {
				var selectedFile = selectedFiles[0];
				return selectedFile.getName();
			} else {
				return selectedFiles.length + ' ' + tr('items');
			}
		},

		_getInfoList: function () {
			var selectedFiles = this.getObject();
			//SINGLE FILE
			if (selectedFiles.length == 1) {
				var selectedFile = selectedFiles[0];
				var type = selectedFile.getType();//CIAOOOO
				var infoList = [[tr('Type'), type], [tr('Size'), this.__formatSize(selectedFile.getSize())]];
				if (selectedFile.getCreated()) {
					infoList.push([tr('Created'), selectedFile.getCreated()]);
				}
				if (selectedFile.getModified()) {
					infoList.push([tr('Modified'), selectedFile.getModified()]);
				}
				return infoList;
			} else {
				//MULTIPLE FILES
				var size = new Number();
				for (var i = 0; i < selectedFiles.length; ++i) {
					size += selectedFiles[i].getSize();
				}
				return [[tr('Type'), tr('Various')], [tr('Size'), this.__formatSize(size)]];
			}
		},

		__formatSize: function (size) {
			var unim = new Array('B', 'KB', 'MB', 'GB', 'TB', 'PB');
			var c = 0;
			while (size >= 1024) {
				c++;
				size = size / 1024;
			}
			size = eyeos.utils.number_format(size, (c ? 2 : 0), ',', '.') + ' ' + unim[c];
			return size;
		},

		_getRating: function () {
			var selectedFiles = this.getObject();
			//SINGLE FILE
			if (selectedFiles.length == 1) {
				var selectedFile = selectedFiles[0];
				return selectedFile.getRating();
			} else {
				return 0;
			}
		},


		_getPreviewImagePath: function () {
			var selectedFiles = this.getObject();

			//SINGLE FILE
			if (selectedFiles.length == 1) {
				var selectedFile = selectedFiles[0];
				var type = selectedFile.getType(); //Preview
				//Folder
				if (type == 'folder') {
					return  this._folderPreviewImage +'&nocache=' + eyeos.utils.getRandomValue()
				}
				//NormalFile
				switch (selectedFile.getExtension()) {
					case 'JPG':
					case 'JPEG':
					case 'PNG':
					case 'GIF':
						//Image
						var previewImage = 'index.php?checknum=' + this.getParams()['checknum'] + '&message=__FileSystem_getScaledImage&params[maxWidth]=70&params[maxHeight]=53&params[path]=' + selectedFile.getAbsolutePath();
						break;

					default:
						//Others
						var previewImage = this._otherPreviewImage;
						break;
				}
				return previewImage +'&nocache=' + eyeos.utils.getRandomValue();
			} else {
				//MULTIPLE FILES
				return this._multiplePreviewImage;
			}
		}
	}
});