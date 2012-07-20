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

qx.Class.define('eyeos.socialbar.InfoBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,

	properties: {
		name: {
			check: 'String',
			init: null
		},
		checknum: {
			check: 'Integer'
		}
	},

	
	events: {
		/**
		 * Fired when a user change the rating
		 */
		changeRating: 'qx.event.type.Data'
	},

	/**
	 * Constructor of a InfoBox
	 *
	 * @param Info {Info} Info Object with all the related information
	 */
	construct: function (Info) {
		this.base(arguments);
		this.set({
			marginTop: 20,
			marginLeft: 10,
			marginRight: 10,
			layout: new qx.ui.layout.HBox(),
			decorator: null
		});
		if (Info instanceof eyeos.socialbar.Info){
			this._buildGui(Info);
		}
	},

	members: {
		_layoutImageBox: null,
		_layoutImage: null,
		_layoutInfoBox: null,
		_layoutRatingBox: null,
		_emptyStar: 'index.php?extern=images/rate_off.png',
		_fullStar: 'index.php?extern=images/rate_on.png',

		/**
		 * Create the View of a InfoBox
		 *
		 * @param Info {Info} Info Object with all the related information
		 */
		_buildGui: function (Info) {
			this._buildImageBox(Info);
			this._buildInfoBox(Info);

			if (Info.getEnableRating()){
				this._buildRatingBox(Info);
			}
		},

		/**
		 * Create the View for the Image container (just the image)
		 *
		 * @param Info {Info} Info Object with all the related information
		 */
		_buildImageBox: function (Info) {
			this._layoutImageBox = new eyeos.ui.widgets.Image(Info.getImage()).set({
				width: 70,
				height: 70,
				marginRight: 12,
				scale: true,
				forceRatio: 'auto'
			});
			this.add(this._layoutImageBox);
		},

		/**
		 * Create the View of the information Container (info and rating system
		 * if enabled)
		 *
		 * @param Info {Info} Info Object with all the related information
		 */
		_buildInfoBox: function (Info) {
			this._layoutInfoBox = new qx.ui.container.Composite().set({
				allowGrowX: false,
				allowGrowY: true,
				layout: new qx.ui.layout.VBox()
			});

			this.add(this._layoutInfoBox, {flex: 1});

			var titleLabel = new qx.ui.basic.Label().set({
				textColor: '#333333',
				value: Info.getName(),
				font: new qx.bom.Font(14).set({
					family: ["Helvetica", "Arial", "Lucida Grande"],
					bold: true
				}),
				margin: 2
			});
			this._layoutInfoBox.add(titleLabel);
			
			var infoList = Info.getInfos();
			var grayHtml = '<span style=\'text-align:left; font-family: "Helvetica", "Arial", "Lucida Grande"; font-size: 12px; color: #AAAAAA\'; margin: 0; padding: 0\'>';
			var blackHtml = '<span style=\'text-align:left; font-family: "Helvetica", "Arial", "Lucida Grande"; font-size: 12px; color: #666666\'; margin: 0; padding: 0\'>';
			for(var i = 0; i < infoList.length; ++i){
				this._layoutInfoBox.add(new qx.ui.basic.Label().set({
					value: grayHtml + infoList[i][0] + ': </span>' + blackHtml + infoList[i][1] + '</span>',
					rich: true,
					padding: 0,
					margin: 0
				}));
			}
			
		},

		/**
		 * Create the View of the Rating System
		 *
		 * @param Info {Info} Info Object with all the related information
		 */
		_buildRatingBox: function (Info) {
			this._layoutRatingBox = new qx.ui.container.Composite().set({
				allowGrowX: true,
				allowGrowY: true,
				margin: 0,
				layout: new qx.ui.layout.HBox()
			});
			this._layoutRatingBox.addListener('mouseout', function(e){
				this._updateRating(Info.getRating());
			}, this);
				
			this._layoutInfoBox.add(this._layoutRatingBox);

			this._layoutRatingBox.add(new qx.ui.basic.Label().set({
				value: '<span style=\'text-align:left; color: #AAAAAA; font-family: "Helvetica", "Arial", "Lucida Grande"; font-size: 12px; margin: 0; padding: 0\'>' + tr('Ratings') + ': </span>',
				rich: true,
				padding: 0,
				margin: 0
			}));

			var self = this;
			
			for (var i = 1; i <= 5; ++i) {
				var item = new qx.ui.basic.Image(this._emptyStar);
				item.setUserData('rating', i);
				

				item.addListener('mouseover', function (e) {
					self._updateRating(this.getUserData('rating'));
				});

				item.addListener('click', function (e) {
					var userRate = this.getUserData('rating');
					Info.setRating(userRate);
					self._updateRating(userRate);
					self.fireDataEvent('changeRating', userRate);
					
				});
				this._layoutRatingBox.add(item);
			}

			this._updateRating(Info.getRating());
		},

		/**
		 * Update the Rating System View when something happen (mouseover on a star)
		 *
		 * @param Info {Info} Info Object with all the related information
		 */
		_updateRating: function (starNum) {
			var elements = this._layoutRatingBox.getChildren();
			starNum = parseInt(starNum);
			for(var i = 1; i < starNum + 1; ++i){ //Full Star
				elements[i].setSource(this._fullStar);
			}

			for(i = starNum + 1; i < elements.length; ++i) { //Empty star
				elements[i].setSource(this._emptyStar);
			}

		}
	}
});