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

qx.Class.define('eyeos.application.documents.View', {
	statics: {
		viewHeaderAndFooter: function(object, e) {
			alert('viewHeaderAndFooter: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		viewNoPrintableCharacters: function(object, e) {
			alert('viewNoPrintableCharacters: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		viewRule: function(object, e) {
			alert('viewRule: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		viewUserInPage: function(object, e) {
			alert('viewUserInPage: ' + e.getTarget().getId() + ' (to be implemented...)');
		},
		
		ViewGoToTheBeginning: function(object, e) {
			alert('ViewGoToTheBeginning: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		viewGoToTheEnd: function(object, e) {
			alert('viewGoToTheEnd: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		ViewShowThumbtack: function(object, e) {
			alert('ViewShowThumbtack: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		viewToolbarMode: function(object, e) {
			object.getApplication().getTopToolBar().getHeader().toggleMode();
		},

		viewComments: function(object, e) {
			var container = document.getElementById('tinymce_editor' + object.getApplication().getPid() +'_noteContainer');
			if(container) {
				if(container.style.visibility == 'hidden') {
					showComments();
				} else {
					hideComments();
				}
			}
		},

		viewSocialbar: function(object, e) {
			if(object.getApplication().getEnableSocialBar()) {
				e.getTarget().setEnabled(true);
				object.setSocialBarVisible(e.getTarget().isValue());

				if(e.getTarget().isValue()) {
					object.getApplication().createEmptySocialBar();
				} else {
					object.getApplication().getSocialBar().destroy();
				}
			} else {
				e.getTarget().setEnabled(false);
			}
		},

		viewToolbar: function(object, e) {
			if(e.getTarget().isValue()) {
				var container = object.getApplication().getWindow().getUserData('container');
				var children = container.getChildren();

				if(children.length >= 2) {
					object.getApplication().createTopToolBar(object);
					object.getApplication().createBottomToolBar(object);
				}
			} else {
				object.getApplication().destroyTopToolBar();
				object.getApplication().destroyBottomToolBar();
			}			
		}
	}
});