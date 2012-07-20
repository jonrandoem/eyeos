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
 *	Implementing {@see eyeos.ui.menubar.IActions}.
 */
qx.Class.define("genericbar.both.Actions", {
	extend: qx.core.Object,
	implement : [eyeos.ui.genericbar.IActions],

	construct: function(application) {
		// calling the base construct...
		arguments.callee.base.call(this);

		// setting the calling application...
		this.setApplication(application);

		// setting the checksum for an empty file...
		this.__currentDoc.checksum = eyeos.application.documents.Utils.crc32('');
		this.__currentDoc.path = null;
	},

	statics: {
		// the max number of recent documents we'll found in openRecent...
		MAX_RECENT_DOCS: 10
	},

	properties: {
		// the application which is controlling this actions class...
		application: {
			init: null
		},

		socialBarVisible: {
			init: true,
			check: 'Boolean'
		}
	},

	members: {
		sender: 'firstTime',

		// controller flag, used for save and saveAs function...
		__closeFlag: false,

		//
		__clipboard: {
			content: '',
			type: 'normal',
			beforeOrAfter: false
		},

		// the current document checksum, used to check if the file
		// is saved or not...
		__currentDoc: {
			path: null,
			checksum: null
		},

		// it's a struct, used to declare and treat with those button
		// from menuBar or Toolbar, wich needs dynamics actions...
		__dynamics: {
			recentDocs: {
				node: null,
				subMenu: null
			}
		},

		// overriden, this function take care about switching between
		// all the dynamics cases, and do the correct action.
		dynamicsActions: function(node) {
			switch (node.getCurrentTarget().getId()) {
				case 'OpenRecent':
					if (!this.__dynamics.recentDocs.subMenu) {
						this.dynamicsReadOpenRecent(node.getCurrentTarget());
					}
					break;
			}
		},

		/***********************************************************************
		 *
		 * File Menu's Functions
		 *
		 **********************************************************************/
		fileNew: function() {
			eyeos.application.documents.File.fileNew(this);
		},

		fileOpen: function() {
			eyeos.application.documents.File.fileOpen(this);
		},

		fileOpenRecent: function(e) {
			eyeos.application.documents.File.fileOpenRecent(this, e);
		},

		fileSave: function() {
			eyeos.application.documents.File.fileSave(this);
		},

		fileSaveAs: function() {
			eyeos.application.documents.File.fileSaveAs(this);
		},

		isFileSaved: function() {
			return eyeos.application.documents.File.isFileSaved(this);
		},

		setInitialFile: function(path) {
			eyeos.application.documents.File.setInitialFile(this, path);
		},

		dynamicsWriteOpenRecent: function() {
			eyeos.application.documents.File.dynamicsWriteOpenRecent(this);
		},

		dynamicsUpdateOpenRecent: function(entry, path) {
			eyeos.application.documents.File.dynamicsUpdateOpenRecent(this, entry, path);
		},

		dynamicsReadOpenRecent: function(node, entry, path) {
			eyeos.application.documents.File.dynamicsReadOpenRecent(this, node, entry, path);
		},

		fileDocumentInfos: function(e) {
			eyeos.application.documents.File.fileDocumentInfos(this, e);
		},

		fileExport: function(e) {
			var edata = e.clone();

			if(this.isFileSaved()) {
				eyeos.application.documents.File.fileExport(this, e);
			} else {
				var optionPane = new eyeos.dialogs.OptionPane(
					"<b>"+tr("The current document need to be saved before it can be exported. Do you want to save it now?")+"</b>",
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
					eyeos.dialogs.OptionPane.YES_NO_OPTION);
				var dialog = optionPane.createDialog(this.getApplication().getWindow(), "Documents", function(result) {
					// if yes, we save it...
					if (result == 0) {
						this.fileSave();
						this.addListener('fileSaved', function() {
							eyeos.application.documents.File.fileExport(this, edata);
						}, this);
					}
				}, this);
				dialog.open();
			}
			
		},

		filePreview: function(e) {
			eyeos.application.documents.File.filePreview(this, e);
		},

		filePrint:function(e) {
			eyeos.application.documents.File.filePrint(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Edit Menu's Functions
		 *
		 **********************************************************************/
		editUndo: function() {
			eyeos.application.documents.Edit.editUndo(this);
		},

		editRedo: function() {
			eyeos.application.documents.Edit.editRedo(this);
		},

		editCut: function() {
			eyeos.application.documents.Edit.editCut(this);
		},

		editCopy: function() {
			eyeos.application.documents.Edit.editCopy(this);
		},

		editPaste: function() {
			eyeos.application.documents.Edit.editPaste(this);
		},

		editSelectAll: function() {
			eyeos.application.documents.Edit.editSelectAll(this);
		},

		editFindAndReplace: function() {
			eyeos.application.documents.Edit.editFindAndReplace(this);
		},

		editCopyPasteTextStyle: function(e) {
			eyeos.application.documents.Edit.editCopyPasteTextStyle(this, e);
		},

		editGetTextStyle: function(e) {
			eyeos.application.documents.Edit.editGetTextStyle(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * View Menu's Functions
		 *
		 **********************************************************************/
		ViewGoToTheBeginning: function(e) {
			eyeos.application.documents.View.ViewGoToTheBeginning(this, e);
		},

		viewGoToTheEnd: function(e) {
			eyeos.application.documents.View.viewGoToTheEnd(this, e);
		},

		ViewShowThumbtack: function(e) {
			eyeos.application.documents.View.ViewShowThumbtack(this, e);
		},

		viewToolbarMode: function(e) {
			eyeos.application.documents.View.viewToolbarMode(this, e);
		},

		viewComments: function(e) {
			eyeos.application.documents.View.viewComments(this, e);
		},

		viewHeaderAndFooter: function(e) {
			eyeos.application.documents.View.viewHeaderAndFooter(this, e);
		},

		viewNoPrintableCharacters: function(e) {
			eyeos.application.documents.View.viewNoPrintableCharacters(this, e);
		},

		viewRule: function(e) {
			eyeos.application.documents.View.viewRule(this, e);
		},

		viewSocialbar: function(e) {
			eyeos.application.documents.View.viewSocialbar(this, e);
		},

		viewToolbar: function(e) {
			eyeos.application.documents.View.viewToolbar(this, e);
		},

		viewUserInPage: function(e) {
			eyeos.application.documents.View.viewUserInPage(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Insert Menu's Functions
		 *
		 **********************************************************************/
		insertDraw: function(e) {
			eyeos.application.documents.Insert.insertDraw(this, e);
		},

		insertHorizontalLine: function(e) {
			eyeos.application.documents.Insert.insertHorizontalLine(this, e);
		},

		insertImage: function(e) {
			eyeos.application.documents.Insert.insertImage(this, e);
		},

		insertGlyphs: function(e) {
			eyeos.application.documents.Insert.insertGlyphs(this, e);
		},

		insertHeader: function(e) {
			eyeos.application.documents.Insert.insertHeader(this, e);
		},

		insertFooter: function(e) {
			eyeos.application.documents.Insert.insertFooter(this, e);
		},

		insertBlockQuote: function(e) {
			eyeos.application.documents.Insert.insertBlockQuote(this, e);
		},

		insertFootNote: function(e) {
			eyeos.application.documents.Insert.insertFootNote(this, e);
		},

		insertPageNumber: function(e) {
			eyeos.application.documents.Insert.insertPageNumber(this, e);
		},

		insertSymbol: function(e) {
			eyeos.application.documents.Insert.insertSymbol(this, e);
		},

		insertCurrencySymbol: function(e) {
			eyeos.application.documents.Insert.insertCurrencySymbol(this, e);
		},

		insertHyphenAndDashes: function(e) {
			eyeos.application.documents.Insert.insertHyphenAndDashes(this, e);
		},

		insertQuotationMarks: function(e) {
			eyeos.application.documents.Insert.insertQuotationMarks(this, e);
		},

		insertTableOfContents: function(e) {
			eyeos.application.documents.Insert.insertTableOfContents(this, e);
		},

		insertPageBreak: function(e) {
			eyeos.application.documents.Insert.insertPageBreak(this, e);
		},

		insertAnchors: function(e) {
			eyeos.application.documents.Insert.insertAnchors(this, e);
		},

		insertHyperLinks: function(e) {
			eyeos.application.documents.Insert.insertHyperLinks(this, e);
		},

		insertComment: function(e) {
			eyeos.application.documents.Insert.insertComment(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Format Menu's Functions
		 *
		 **********************************************************************/
		formatType: function(e) {
			eyeos.application.documents.Format.formatType(this, e);
		},

		formatSize: function(e) {
			eyeos.application.documents.Format.formatSize(this, e);
		},

		formatFont: function(e) {
			eyeos.application.documents.Format.formatFont(this, e);
		},

		formatAlign: function(e) {
			eyeos.application.documents.Format.formatAlign(this, e);
		},

		formatCase: function(e) {
			eyeos.application.documents.Format.formatCase(this, e);
		},

		formatTextStyle: function(e) {
			eyeos.application.documents.Format.formatTextStyle(this, e);
		},

		formatBulletsAndNumbering: function(e) {
			eyeos.application.documents.Format.formatBulletsAndNumbering(this, e);
		},

		insertOrderedList: function() {
			eyeos.application.documents.Format.insertOrderedList(this);
		},

		insertUnorderedList: function() {
			eyeos.application.documents.Format.insertUnorderedList(this);
		},

		syncBulletsAndNumbering: function(e) {
			eyeos.application.documents.Format.syncBulletsAndNumbering(this, e);
		},

		setMargin: function(e) {
			eyeos.application.documents.Format.setMargin(this, e);
		},

		setSelectionColor: function(e) {
			eyeos.application.documents.Format.setSelectionColor(this, e);
		},

		setUnderlineColor: function(e) {
			eyeos.application.documents.Format.setUnderlineColor(this, e);
		},

		formatDocumentSettings: function(e) {
			eyeos.application.documents.Format.formatDocumentSettings(this, e);
		},

		formatIndentation: function(e) {
			eyeos.application.documents.Format.formatIndentation(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Table Menu's Functions
		 *
		 **********************************************************************/
		tableInsert: function() {
			eyeos.application.documents.Table.tableInsert(this);
		},

		tableInsertColumnLeft: function() {
			eyeos.application.documents.Table.tableInsertColumnLeft(this);
		},

		tableInsertColumnRight: function() {
			eyeos.application.documents.Table.tableInsertColumnRight(this);
		},

		tableInsertRowAbove: function() {
			eyeos.application.documents.Table.tableInsertRowAbove(this);
		},

		tableInsertRowBelow: function() {
			eyeos.application.documents.Table.tableInsertRowBelow(this);
		},

		tableInsertRowsOrColumns: function() {
			eyeos.application.documents.Table.tableInsertRowsOrColumns(this);
		},
		
		tableDelete: function() {
			eyeos.application.documents.Table.tableDelete(this);
		},

		tableDeleteRow: function() {
			eyeos.application.documents.Table.tableDeleteRow(this);
		},

		tableDeleteColumn: function() {
			eyeos.application.documents.Table.tableDeleteColumn(this);
		},

		tableMergeCell: function() {
			eyeos.application.documents.Table.tableMergeCell(this);
		},

		tableSplitCell: function() {
			eyeos.application.documents.Table.tableSplitCell(this);
		},
		
		tableAlign: function(e) {
			eyeos.application.documents.Table.tableAlign(this, e);
		},

		tableContentAlignment: function() {
			eyeos.application.documents.Table.tableContentAlignment(this);
		},

		tableToPageWidth: function(e) {
			eyeos.application.documents.Table.tableToPageWidth(this, e);
		},

		setRows: function(e, flag) {
			eyeos.application.documents.Table.setRows(this, flag);
		},

		setCols: function(e, flag) {
			eyeos.application.documents.Table.setCols(this, flag);
		},

		cellPad: function(e) {
			eyeos.application.documents.Table.cellPad(this, e);
		},

		cellSpace: function(e) {
			eyeos.application.documents.Table.cellSpace(this, e);
		},

		setWidth: function(e) {
			eyeos.application.documents.Table.setWidth(this, e);
		},

		setWidthMeasure: function(e) {
			eyeos.application.documents.Table.setWidthMeasure(this, e);
		},

		setBorderWidth: function(e) {
			eyeos.application.documents.Table.setBorderWidth(this, e);
		},

		setBorderColor: function(e) {
			eyeos.application.documents.Table.setBorderColor(this, e);
		},

		setFillColor: function(e) {
			eyeos.application.documents.Table.setFillColor(this, e);
		},

		tableContentAlignmentUpLeft: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'top', 'left');
		},

		tableContentAlignmentMiddleLeft: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'middle', 'left');
		},

		tableContentAlignmentBottomLeft: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'bottom', 'left');
		},

		tableContentAlignmentUpCenter: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'top', 'center');
		},

		tableContentAlignmentMiddleCenter: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'middle', 'center');
		},

		tableContentAlignmentBottomCenter: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'bottom', 'center');
		},

		tableContentAlignmentUpRight: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'top', 'right');
		},

		tableContentAlignmentMiddleRight: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'middle', 'right');
		},

		tableContentAlignmentBottomRight: function() {
			eyeos.application.documents.Table.tableContentAlignmentSingle(this, 'bottom', 'right');
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Tools Menu's Functions
		 *
		 **********************************************************************/
		toolsStatistics: function(e) {
			eyeos.application.documents.Tools.toolsStatistics(this, e);
		},

		toolsDocumentLanguage: function(e) {
			eyeos.application.documents.Tools.toolsDocumentLanguage(this, e);
		},

		toolsCheckSpelling: function(e) {
			eyeos.application.documents.Tools.toolsCheckSpelling(this, e);
		},

		toolsTranslate: function(e) {
			eyeos.application.documents.Tools.toolsTranslate(this, e);
		},

		toolsSearchWeb: function(e) {
			eyeos.application.documents.Tools.toolsSearchWeb(this, e);
		},

		toolsActivityHistory: function(e) {
			eyeos.application.documents.Tools.toolsActivityHistory(this, e);
		},

		toolsThumbtacks: function(e) {
			eyeos.application.documents.Tools.toolsThumbtacks(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Help Menu's Functions
		 *
		 **********************************************************************/
		helpsEyeDoc: function(e) {
			eyeos.application.documents.Help.helpsEyeDoc(this, e);
		},

		helpsLearnAtForum: function(e) {
			eyeos.application.documents.Help.helpsLearnAtForum(this, e);
		},

		helpsWatchVideoColaborative: function(e) {
			eyeos.application.documents.Help.helpsWatchVideoColaborative(this, e);
		},

		helpsKeyboardShortcuts: function(e) {
			eyeos.application.documents.Help.helpsKeyboardShortcuts(this, e);
		},

		aboutInfos: function(e) {
			eyeos.application.documents.Help.aboutInfos(this, e);
		},
		/**********************************************************************/



		/***********************************************************************
		 *
		 * Update and Sync funcitons
		 *
		 **********************************************************************/
		updateStatus: function(ed, cm, e, needAManagerBasic, needAManagerAdvanced, needUpdatesBasic, needUpdatesAdvanced) {
			eyeos.application.documents.Updates.updateStatus(this, ed, cm, e, needAManagerBasic, needAManagerAdvanced, needUpdatesBasic, needUpdatesAdvanced);
		},

		updateTopToolBar: function(e, needUpdates) {
			eyeos.application.documents.Updates.updateTopToolBar(e, needUpdates);
		}
	}
});

