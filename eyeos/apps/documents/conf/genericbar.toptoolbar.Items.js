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
 *	Implementing {@see eyeos.ui.genericbar.IItems}.
 */
qx.Class.define('genericbar.toptoolbar.Items', {
	extend : qx.core.Object,
	implement : [eyeos.ui.genericbar.IItems],

	construct: function() {
		arguments.callee.base.call(this);
		this.setItems(this.items);
	},

	properties: {
		items: {
			init: null
		}
	},

	members: {
		items:[{
			name: 'File',
			id: 'File',
			Group: [{
				name: 'New',
				id: 'New',
				image: 'document-new.png',
				cmd: 'fileNew'
			}, {
				name: 'Open',
				id: 'Open',
				image: 'document-open-folder.png',
				cmd: 'fileOpen'
			}, {
				name: 'Save',
				id: 'Save',
				image: 'document-save.png',
				cmd: 'fileSave'
			}]
		},
//		{
//			name: 'Print',
//			id: 'Print',
//			Group: [{
//				name: 'Preview',
//				id: 'Preview',
//				image: 'document-preview.png',
//				cmd: 'filePreview'
//			}, {
//				name: 'Print',
//				id: 'Print',
//				image: 'document-print.png',
//				cmd: 'filePrint'
//			}]
//		},
		{
			name: 'Edit',
			id: 'Edit',
			Group: [{
				name: 'Undo',
				id: 'Undo',
				image: 'edit-undo.png',
				cmd: 'editUndo'
			}, {
				name: 'Redo',
				id: 'Redo',
				image: 'edit-redo.png',
				cmd: 'editRedo'
			}]
		},
//		{
//			name: 'Various',
//			id: 'Various',
//			Group: [{
//				name: 'Comments',
//				id: 'Comments',
//				image: 'view-pim-notes.png',
//				cmd: 'insertComment'
//			}, {
//				name: 'Correct',
//				id: 'Correct',
//				image: 'tools-check-spelling.png',
//				advanced: true,
//				cmd: 'toolsCheckSpelling'
//			}, {
//				name: 'Thumbtack',
//				id: 'Thumbtack',
//				image: 'thumbtack.png',
//				advanced: true,
//				cmd: 'variousThumbtack'
//			}
//		]},
		{
			name: 'Utils',
			id: 'Utils',
			Group: [{
				name: 'Find',
				id: 'Find',
				image: 'edit-find-replace.png',
				advanced: true,
				cmd: 'editFindAndReplace'
			}, {
				name: 'Table',
				id: 'Table',
				needUpdates: true,
				image: 'Table.png',
				subMenu: [{
					name: 'Insert Table...',
					id: 'InsertTable',
					cmd: 'tableInsert'
				}, {
					name: 'Insert row above',
					id: 'InsertRowAbove',
					cmd: 'tableInsertRowAbove'
				}, {
					name: 'Insert row below',
					id: 'InsertRowBelow',
					cmd: 'tableInsertRowBelow'
				}, {
					name: 'Insert column left',
					id: 'InsertColumnLeft',
					cmd: 'tableInsertColumnLeft'
				}, {
					name: 'Insert column right',
					id: 'InsertColumnRight',
					cmd: 'tableInsertColumnRight'
				}, {
					name: 'Merge selected',
					id: 'MergeSelected',
					cmd: 'tableMergeCell'
				}, {
					name: 'Split cell',
					id: 'SplitCell',
					cmd: 'tableSplitCell'
				}, {
					name: 'Adjust table to page',
					id: 'AdjustTableToPage',
					cmd: 'tableToPageWidth'
				}
			]
			},
//			{
//				name: 'Draw',
//				id: 'Draw',
//				image: 'draw-vector.png',
//				advanced: true,
//				cmd: 'insertDraw'
//			},
			{
				name: 'Image',
				id: 'Image',
				image: 'insert-image.png',
				cmd: 'insertImage'
			}
//			{
//				name: 'Hyperlink',
//				id: 'Hyperlink',
//				image: 'insert-link.png',
//				subMenu: [{
//					name: 'Bookmark',
//					id: 'Bookmark',
//					cmd: 'insertHyperLinks'
//				}, {
//					name: 'Document',
//					id: 'Document',
//					cmd: 'insertHyperLinks'
//				}, {
//					name: 'E-mail',
//					id: 'E-mail',
//					cmd: 'insertHyperLinks'
//				}, {
//					name: 'Web page',
//					id: 'Web page',
//					cmd: 'insertHyperLinks'
//				}]
//			}
		]
		}]
	}
});
