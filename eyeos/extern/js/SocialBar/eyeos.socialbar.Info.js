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
 * Info is a Class that will contain informations for the creation of an InfoBox
 */
qx.Class.define('eyeos.socialbar.Info', {
	extend: qx.core.Object,
	/**
	 * Constructor of an Info
	 *
	 * @param name {string} The name of the Social Box, also the title of the Social Box
	 * @param infos {array} Bi-Dimensiona array, every entry is a [key, value] array
	 * @param image {string} The Path of the image to show in Social Box
	 * @param enableRating {bool} If true, show a rating system
	 * @param name {rating} if enableRating is true, is the initial value of the rating system
	 */
	construct: function (name, infos, image, enableRating, rating) {
		this.base(arguments);
		
		if (name != null) {
			this.setName(name);
		}
		if (infos != null) {
			this.setInfos(infos);
		}

		if (image != null) {
			this.setImage(image);
		}

		if (enableRating != null) {
			this.setEnableRating(enableRating);
		}

		if (this.getEnableRating() == true && rating != null) {
			this.setRating(rating);
		}
	},

	members: {
		_name: null,
		_infos: null,
		_image: null,
		_enableRating: false,
		_rating: null,

		setName: function (value) {
			this._name = value;
		},

		getName: function () {
			return this._name;
		},
		
		setInfos: function (infos) {
			this._infos = infos;
		},

		getInfos: function (infos) {
			return this._infos;
		},

		setImage: function (image) {
			this._image = image;
		},

		getImage: function () {
			return this._image;
		},

		setEnableRating: function (value) {
			this._enableRating = value;
		},

		getEnableRating: function () {
			return this._enableRating;
		},

		setRating: function (value) {
			this._rating = value;
		},

		getRating: function () {
			return this._rating;
		}
	}
});
