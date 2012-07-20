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

qx.Class.define('eyeos.application.documents.Edit', {
	statics: {
		editUndo: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			tinyMCE.getInstanceById(tinymceId).undoManager.undo();
		},

		editRedo: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			tinyMCE.getInstanceById(tinymceId).undoManager.redo();
		},

		editCut: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var content = tinyMCE.getInstanceById(tinymceId).selection.getContent();

			if (content) {
				object.__clipboard.content = content;
				object.__clipboard.type = 'normal';
				tinyMCE.getInstanceById(tinymceId).selection.setContent('');
			}
			else {
				var node = tinyMCE.getInstanceById(tinymceId).selection.getNode();
				if (node instanceof HTMLTableCellElement) {
					tinyMCE.getInstanceById(tinymceId).plugins.table.execCommand('mceTableCutRow');
					object.__clipboard.type = 'row';
				}
			}

		},

		editCopy: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var content = tinyMCE.getInstanceById(tinymceId).selection.getContent();
			if (content) {
				object.__clipboard.content = content;
				object.__clipboard.type = 'normal';
			}
			else {
				var node = tinyMCE.getInstanceById(tinymceId).selection.getNode();
				if (node instanceof HTMLTableCellElement) {
					tinyMCE.getInstanceById(tinymceId).plugins.table.execCommand('mceTableCopyRow');
					object.__clipboard.type = 'row';
				}
			}
		},

		editPaste: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			if (object.__clipboard.type == 'row') {
				if (object.__clipboard.beforeOrAfter == false) {
					tinyMCE.getInstanceById(tinymceId).plugins.table.execCommand('mceTablePasteRowAfter');
				}
				else {
					tinyMCE.getInstanceById(tinymceId).plugins.table.execCommand('mceTablePasteRowBefore');
				}

			}
			else if (object.__clipboard.type == 'normal'){
				tinyMCE.getInstanceById(tinymceId).selection.setContent(object.__clipboard.content);
			}
		},

		editSelectAll: function(object) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			tinyMCE.getInstanceById(tinymceId).selection.select(tinyMCE.getInstanceById(tinymceId).getBody(), true);
		},

		editFindAndReplace: function(object) {
			if(!object.findAndReplace) {
				var dialog = eyeos.application.documents.WindowsAndDialogs.editFindAndReplaceDialog(object);
				object.findAndReplace = true;
				object.dialog = dialog;

				dialog.addListener('findNext', function(e) {
					dialog.notFound.setVisibility('excluded');
					dialog.allReplaced.setVisibility('excluded');
					eyeos.application.documents.Utils.searchNext(object, e.getData(), null, false, dialog.matchCase.getValue(), 'none');
				}, this);

				dialog.addListener('findPrevious', function(e) {
					dialog.notFound.setVisibility('excluded');
					dialog.allReplaced.setVisibility('excluded');
					eyeos.application.documents.Utils.searchNext(object, e.getData(), null, true, dialog.matchCase.getValue(), 'none');
				}, this);

				object.addListener('notFound', function() {
					dialog.notFound.setVisibility('visible');
				}, this);

				dialog.addListener('replace', function(e) {
					dialog.notFound.setVisibility('excluded');
					dialog.allReplaced.setVisibility('excluded');
					eyeos.application.documents.Utils.searchNext(object, e.getData()[0], e.getData()[1], false, dialog.matchCase.getValue(), 'current');
				}, this);

				dialog.addListener('replaceAll', function(e) {
					dialog.notFound.setVisibility('excluded');
					dialog.allReplaced.setVisibility('excluded');
					eyeos.application.documents.Utils.searchNext(object, e.getData()[0], e.getData()[1], false, dialog.matchCase.getValue(), 'all');
				}, this);

				object.addListener('allReplaced', function() {
					dialog.allReplaced.setVisibility('visible');
				}, this);
			} else {
				object.dialog.destroy();
				object.findAndReplace = false;
			}
		},

		editCopyPasteTextStyle: function(object, e) {
			alert('editCopyPasteTextStyle: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		editGetTextStyle: function(object, e) {
			alert('editGetTextStyle: ' + e.getTarget().getId() + ' (to be implemented...)');
		}
	}
});