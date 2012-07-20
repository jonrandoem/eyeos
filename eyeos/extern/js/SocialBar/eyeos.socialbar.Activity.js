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
 * Activity is a Object that ActivityBox manage to show information.
 * An Activity is a single line on a ActivityBox.
 */

qx.Class.define('eyeos.socialbar.Activity', {
	extend: qx.ui.container.Composite,

	events: {
		changeRevision: 'qx.event.type.Data'
	},
	
	properties: {
		box: {
			check: 'eyeos.socialbar.ActivityBox'
		},
		type: {
			check: 'String'
		},
		user: {
			check: 'String'
		},
		date: {

		},
		checknum: {
			check: 'Integer'
		},
		revision: {
			check: 'Integer'
		},
		text: {
			check: 'String'
		},
		icon: {
			check: 'String'
		},
		realName: {
			check: 'String'
		},
		realDate: {
			
		},
		show: {
			check: 'Boolean',
			init: true
		}
	},
	
	/**
	 * Constructor of an Activity
	 *
     * @param type {string} Type of Activity, can be a value in [Create, Modification, Note, StartSharing, StopSharing, Other]
     * @param user {string} The user that made an activity
     * @param data {Date} Date of the Activity
	 * @param checknum {Integer} Checknum of the related application
     * @param revision {integer} The number of revision
	 * @param text {string} Text to show for 'Others' type Activity
	 * @param icon {string} Icon to show in the Activity
	 */
	construct: function (type, user, date, checknum, revision, text, icon) {
		this.base(arguments);
		this.set({
			layout: new qx.ui.layout.VBox(),
			decorator: null
		});

		this.setType(type);
		this.setUser(user);
		this.setDate(date);
		this.setChecknum(checknum);

		if (type == 'Modification') {
			this.setRevision(revision);
		}
		if (type == 'Others'){
			this.setText(text);
			this.setIcon(icon);
		}
		this._buildLayout();
	},

	members: {
		_firstRowLayout: null,
		_revisionLayout: null,
		_secondRowLayout: null,
		_infoBoxLayout: null,
		
		_buildLayout: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				padding: 5
			});

			this._buildFirstRowLayout();
			this._buildSecondRowLayout();
		},

		_buildFirstRowLayout: function () {
			this._firstRowLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			this.add(this._firstRowLayout);

			var icon = this._createIcon();
			this._firstRowLayout.add(icon);
			this._infoBoxLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
			
			this._firstRowLayout.add(this._infoBoxLayout, {flex: 1});
			
			/* Too buggy to be ready
			if (this.getType() == 'Modification'){
				this._createRevisionLayout();
			}*/
			
			this._createDateLayout();
			var infoLabel = new eyeos.socialbar.Label('', 'label', '#777777');
			this._infoBoxLayout.add(infoLabel);
			this._setInfoLabel(infoLabel);
		},

		_buildSecondRowLayout: function () {
			this._secondRowLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				decorator: null
			});
			this.add(this._secondRowLayout);
		},

		_setInfoLabel: function (infoLabel) {
			var contactManager = eyeos.contacts.ContactManager.getInstance();
			
			var onUserInfoReady = function(realname, printname) {
				this.setRealName(realname);
				var toPrint;
				switch (this.getType()) {
					case 'Modification':
						toPrint = tr('Modified by') + ' ' + printname;
						break;
					case 'Note':
						toPrint = tr('New note added by') + ' ' + printname;
						break;
					case 'StartSharing':
						toPrint = tr('Sharing with') + ' ' + printname;
						break;
					case 'StopSharing':
						toPrint = tr('Sharing stopped with') + ' ' + printname;
						break;
					case 'Others':
						toPrint = this.getText();
						break;
					case 'Created':
						toPrint = tr('Created by') + ' ' + printname;
						break;
				}
				infoLabel.setValue(toPrint);
			};
			
			// The actor of the activity is the current user
			if (this.getUser() == eyeos.getCurrentUserData().id) {
				var metadata = eyeos.getCurrentUserData().metadata;
				var realname = metadata['eyeos.user.firstname'] + ' ' + metadata['eyeos.user.lastname'];
				onUserInfoReady.call(this, realname, 'me');
			}
			// The actor is (maybe) a contact of the current user
			else {
				contactManager.getContactsByIds([this.getUser()], function(results){
					if (results[0]) {
						var metadata = results[0].getMetadataInstance();
						var name = metadata.getMeta(['eyeos.user.firstname']) + ' ' + metadata.getMeta(['eyeos.user.lastname']);
						onUserInfoReady.call(this, name, name);
					}
				}, this);
			}
		},

		_createDateLayout: function () {
			var dateLabel = new eyeos.socialbar.Label(this.__formatDate(), 'date');

			this._infoBoxLayout.add(dateLabel);
			this.setRealDate(this.getDate().formatNumericDate());
			this.setDate(this.__formatDate());
		},

		__formatDate: function () {
			var twoDay = 2 * 60 * 60 * 24 * 1000;
			diff = (((new Date()).getTime() - this.getDate().getTime()));
			if (diff <= twoDay){
				return this.getDate().prettyDate()
			} else {
				return this.getDate().formatNumericDate();
			}
		},
		_createRevisionLayout: function () {
			this._revisionLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				decorator: null
			});
			this._infoBoxLayout.add(this._revisionLayout, {flex: 1});

			var revisionLabel = new eyeos.socialbar.Label(tr('Revision') + ' ' + this.getRevision(), 'revision');
			revisionLabel.addListener('click', function(e){
				this.getBox().fireDataEvent('previewItem', this.getRevision());
			}, this);
			this._revisionLayout.add(revisionLabel, {top: 0, left: 3});

			var revisionIcon = new qx.ui.basic.Image('index.php?extern=images/back.png').set({
				alignX: 'right'
			});

			var myToolTip = new qx.ui.tooltip.ToolTip(tr('Revert to this revision')).set({
					position: 'top-left',
					backgroundColor: '#3B3E3F',
					textColor: '#FFFFFF'
			});
			revisionIcon.setToolTip(myToolTip);

			revisionIcon.addListener('click', function(e){
				//Open Dialog
				var myCaption = tr('Revert to version') + ' ' + this.getRevision();
				var myText = tr('Are you sure you want to get this version?');
				var op = new eyeos.dialogs.OptionPane(
					myText,
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE);
				var d = op.createDialog(null, myCaption, function(result) {
					this.getBox().setEnabled(true);
					if (result == eyeos.dialogs.OptionPane.YES_OPTION) {
						this.getBox().fireDataEvent('changeRevision', this.getRevision());
					}
				}, this);
				d.open();
			}, this);
			
			this._revisionLayout.add(revisionIcon, {top: 0, right: 3});

		},
		_createIcon: function () {
			var imageSrc = null;
			switch (this.getType()) {
				case 'Modification':
					imageSrc = 'index.php?extern=images/modified.png';
					break;
				case 'Note':
					imageSrc = 'index.php?extern=images/note.png';
					break;
				case 'StartSharing':
					imageSrc = 'index.php?extern=images/shared_on.png';
					break;
				case 'StopSharing':
					imageSrc = 'index.php?extern=images/shared_off.png';
					break;
				case 'Others':
					imageSrc = this.getActivity().getIcon();
					break;
				case 'Created':
					imageSrc = 'index.php?extern=images/new.png';
					break;
			}
			return new qx.ui.basic.Image(imageSrc).set({
				alignY: 'top',
				alignX: 'center',
				paddingTop: 2,
				paddingRight: 5
			});
		}
	}
});