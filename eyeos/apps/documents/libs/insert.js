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

qx.Class.define('eyeos.application.documents.Insert', {
	statics: {
		insertDraw: function(object, e) {
			alert('insertDraw: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertHorizontalLine: function(object, e) {
			alert('insertHorizontalLine: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertImage: function(object, e) {
			var fc = new eyeos.dialogs.FileChooser(object.getApplication().getChecknum());
			fc.showOpenDialog(object.getApplication().getWindow(), function(choice, path) {
				if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
					console.log(path);
					tinyMCE.execInstanceCommand('tinymce_editor' + object.getApplication().getPid(), "mceInsertContent", true, '<img src="index.php?checknum='+object.getApplication().getChecknum()+'&message=getImg&params='+path+'">');
				}
			}, object);
		},

		insertGlyphs: function(object, e) {
			alert('insertGlyphs: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertHeader: function(object, e) {
			alert('insertHeader: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertFooter: function(object, e) {
			alert('insertFooter: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertBlockQuote: function(object, e) {
			alert('insertBlockQuote: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertFootNote: function(object, e) {
			alert('insertFootNote: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertPageNumber: function(object, e) {
			alert('insertPageNumber: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertSymbol: function(object, e) {
			alert('insertSymbol: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertCurrencySymbol: function(object, e) {
			alert('insertCurrencySymbol: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertHyphenAndDashes: function(object, e) {
			alert('insertHyphenAndDashes: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertQuotationMarks: function(object, e) {
			alert('insertQuotationMarks: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertTableOfContents: function(object, e) {
			alert('insertTableOfContents: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertPageBreak: function(object, e) {
			alert('insertPageBreak: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertAnchors: function(object, e) {
			alert('insertAnchors: ' + e.getTarget().getId() + ' (to be implemented...)');
		},

		insertHyperLinks: function(object, e) {
			alert('insertHyperLinks: ' + e.getTarget().getId() + ' (to be implemented...)');
		},
		
		insertComment: function(object, e) {
			var i = 0;
			var content = tinyMCE.activeEditor.selection.getContent().toString();
			if(content.indexOf('class="mceComment') != -1 || content == "") {
				return false;
			}

			var notes = tinyMCE.activeEditor.dom.select('.mceComment');
			var lastId = 0;
			for(i in notes) {
				var note = notes[i];
				var noteId = parseInt(note.getAttribute('comment'));
				if(lastId < noteId) {
					lastId = noteId;
				}
			}

			lastId = parseInt(lastId)+1;
			tinyMCE.activeEditor.selection.setContent(
				'<span style="background:#F6F5AA" class="mceComment" comment="'+lastId+'">'+content+'</span>'
			);

			var noteData = document.createElement('div');
			noteData.setAttribute('id','noteData_'+lastId);

			var iframe = document.getElementById(tinyMCE.activeEditor.id+'_ifr');

			var internalNoteData = iframe.contentDocument.getElementById('internalNoteData');

			if(!internalNoteData) {
				internalNoteData = document.createElement('div');
				internalNoteData.setAttribute('id','internalNoteData');
				internalNoteData.style.display = 'none';
				iframe.contentDocument.body.insertBefore(internalNoteData,iframe.contentDocument.body.firstChild);
			}
			internalNoteData.appendChild(noteData);

			var container = document.getElementById('tinymce_editor' + object.getApplication().getPid() +'_noteContainer');
			container.parentNode.removeChild(container);

			drawNotes();
			return true;
		}
	}
});