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

qx.Class.define('eyeos.application.documents.Format', {
	statics: {
		setMargin: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var content = '';
			switch(e.getTarget().getId()) {
				case 'left':
					tinyMCE.getInstanceById(tinymceId).execCommand('Indent');
					break;
				case 'right':
					tinyMCE.getInstanceById(tinymceId).execCommand('Outdent');
					break;
				case 'top':
					content = tinyMCE.getInstanceById(tinymceId).selection.getNode();
					content.innerHTML = '<br>' + content.innerHTML;
					break;
				case 'bottom':
					content = tinyMCE.getInstanceById(tinymceId).selection.getNode();
					content.innerHTML = content.innerHTML + '<br>';
					break;
				case 'interline':
					content = tinyMCE.getInstanceById(tinymceId).selection.getNode();
					content.style.lineHeight = e.getTarget().getValue();
					break;
			}
		},

		formatType: function(object, e) {
//			console.log('formatType: ' + e.getTarget().getId());
			var parent = e.getTarget().getLayoutParent();
			parent.blocked = true;
			
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();

			tinyMCE.getInstanceById(tinymceId).execCommand(e.getTarget().getId());
			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		formatSize: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();

			if (e.getTarget() instanceof eyeos.ui.menu.Button) {
				tinyMCE.getInstanceById(tinymceId).execCommand('FontSize', false, e.getTarget().getId());
			}
			else {
				if(e.getTarget().blocked) {
					// nothing to do here...
				} else {
					e.getTarget().clicked = true;
					e.getTarget().getLayoutParent().getChildren()[1].clicked = true;
					tinyMCE.getInstanceById(tinymceId).execCommand('FontSize', false, e.getData()[0].getId());
				}
			}

			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		formatFont: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();
			
			if (e.getTarget() instanceof eyeos.ui.menu.Button) {
				tinyMCE.getInstanceById(tinymceId).execCommand('FontName', false, e.getTarget().getId());
			} else {
				if(e.getTarget().blocked) {
					// nothing to do here...
				} else {
					e.getTarget().clicked = true;
					e.getTarget().getLayoutParent().getChildren()[2].clicked = true;
					tinyMCE.getInstanceById(tinymceId).execCommand('FontName', false, e.getData()[0].getId());
				}
			}

			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		formatAlign: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();

			if(tinyMCE.getInstanceById(tinymceId)) {
				tinyMCE.getInstanceById(tinymceId).execCommand(e.getTarget().getId());
			}

			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		formatCase: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();

			if(tinyMCE.getInstanceById(tinymceId)) {
				var content = null;
				switch(e.getTarget().getId()) {
					case 'lowercase':
						content = tinyMCE.getInstanceById(tinymceId).selection.getContent();
						tinyMCE.getInstanceById(tinymceId).selection.getNode().style.fontVariant = '';
						tinyMCE.getInstanceById(tinymceId).selection.setContent(content.toLowerCase());
						break;
					case 'UPPERCASE':
						content = tinyMCE.getInstanceById(tinymceId).selection.getContent();
						tinyMCE.getInstanceById(tinymceId).selection.getNode().style.fontVariant = '';
						tinyMCE.getInstanceById(tinymceId).selection.setContent(content.toUpperCase());
						break;
					case 'TitleCase':
						content = tinyMCE.getInstanceById(tinymceId).selection.getContent();
						tinyMCE.getInstanceById(tinymceId).selection.getNode().style.fontVariant = '';
						tinyMCE.getInstanceById(tinymceId).selection.setContent(eyeos.application.documents.Utils.titleCase(content));
						break;
					case 'Versal':
						content = tinyMCE.getInstanceById(tinymceId).selection.getNode();
						content.style.fontVariant = 'small-caps';
						break;
				}
			}

			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		formatTextStyle: function(object, e) {
				var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
				var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();

				var name = '';
				if(e.getTarget() instanceof eyeos.ui.menu.Button) {
					name = e.getTarget().getId();
				} else {
					name = e.getTarget().getSelection()[0].getId();
				}

				switch(name) {
					case 'NormalParagraphText':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'P');
						break;
					case 'Heading1':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'H1');
						break;
					case 'Heading2':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'H2');
						break;
					case 'Heading3':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'H3');
						break;
					case 'Heading4':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'H4');
						break;
					case 'Heading5':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'H5');
						break;
					case 'Heading6':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'H6');
						break;
					case 'ClearFormating':
						tinyMCE.getInstanceById(tinymceId).execCommand('formatBlock', false, 'DIV');
						break;
				}

				tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		formatBulletsAndNumbering: function(object, e) {
			eyeos.application.documents.WindowsAndDialogs.formatBulletsAndNumberingWindow(object, e);
		},

		insertOrderedList: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var bookmark = ed.selection.getBookmark();
			ed.execCommand('InsertOrderedList');
			ed.selection.moveToBookmark(bookmark);
		},

		insertUnorderedList: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var bookmark = ed.selection.getBookmark();
			ed.execCommand('InsertUnorderedList');
			ed.selection.moveToBookmark(bookmark);
		},

		setSelectionColor: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();
			if(e.getTarget().blocked) {
				// nothing to do here...
			} else {
				e.getTarget().clicked = true;
				tinyMCE.getInstanceById(tinymceId).execCommand('HiliteColor', false, e.getTarget().getColor());
			}

			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		setUnderlineColor: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();

			if(e.getTarget().blocked) {
				// nothing to do here...
			} else {
				e.getTarget().clicked = true;
				tinyMCE.getInstanceById(tinymceId).execCommand('ForeColor', false, e.getTarget().getColor());
			}

			tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
		},

		syncBulletsAndNumbering: function(object, e) {
//			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
//			console.log(e.tagName);
//			if(e.tagName == 'LI') {
//				switch(ed.dom.getAttrib(e.parentNode, 'type')) {
//					case 'circle-fill':
//						var childs = ed.selection.getNode().childNodes;
//						console.log(childs, childs.length);
//						if(childs[0].nodeName != 'SPAN') {
//							ed.selection.setContent('<span>&#x25CF; </<span>');
//						}
//						break;
//				}
//			}
		},

		formatDocumentSettings: function(object, e) {
			alert('viewHeaderAndFooter: ' + e.getTarget().getId() + ' (to be implemented...)');
			//eyeos.application.documents.WindowsAndDialogs.formatDocumentSettingsWindow(object, e);
		},

		formatIndentation: function(object, e) {
			alert('viewHeaderAndFooter: ' + e.getTarget().getId() + ' (to be implemented...)');
			//eyeos.application.documents.WindowsAndDialogs.formatIndentationWindow(object, e);
		}
	}
});