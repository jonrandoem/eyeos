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
qx.Class.define('genericbar.menubar.Items', {
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
		items: [{
			name: 'File',
			id: 'File',
			subMenu: [{
				name: 'New',
				id: 'New',
				image: 'document-new.png',
				cmd: 'fileNew'
			}, {
				name: 'Open...',
				id: 'Open',
				image: 'document-open-folder.png',
				cmd: 'fileOpen'
			}, {
				name: 'Open recent',
				id: 'OpenRecent',
				image: 'document-open-recent.png',
				cmd: 'dynamics'
			}, {
				type: 'Separator'
			}, {
				name: 'Save',
				id: 'Save',
				image: 'document-save.png',
				cmd: 'fileSave'
			}, {
				name: 'Save a copy',
				id: 'SaveaCopy',
				image: 'document-save-as.png',
				cmd: 'fileSaveAs'
			}, {
				name: 'Export',
				id: 'Export',
				image: 'document-export.png',
				subMenu: [{
					name: 'HTML',
					id: 'HTML',
					cmd: 'fileExport'
				}, {
					name: 'Open Office',
					id: 'Open Office',
					cmd: 'fileExport'
				}, {
					name: 'PDF',
					id: 'PDF',
					cmd: 'fileExport'
				}, {
					name: 'RTF',
					id: 'RTF',
					cmd: 'fileExport'
				}, {
					name: 'TXT',
					id: 'TXT',
					cmd: 'fileExport'
				}, {
					name: 'Microsoft Word',
					id: 'Doc',
					cmd: 'fileExport'
				}]
			}
//			{
//				name: 'Document Info',
//				id: 'DocumentInfo',
//				image: 'document-properties.png',
//				cmd: 'fileDocumentInfos'
//			},
//			{
//				name: 'Preview',
//				id: 'Preview',
//				image: 'document-preview.png',
//				cmd: 'filePreview'
//			},
//			{
//				name: 'Print',
//				id: 'Print',
//				image: 'document-print.png',
//				cmd: 'filePrint'
//			}
		]
		}, {
			name: 'Edit',
			id: 'Edit',
			subMenu: [{
				name: 'Undo',
				id: 'Undo',
				image: 'edit-undo.png',
				cmd: 'editUndo'
			}, {
				name: 'Redo',
				id: 'Redo',
				image: 'edit-redo.png',
				cmd: 'editRedo'
			}, {
				type: 'Separator'
			}, {
				name: 'Cut',
				id: 'Cut',
				image: 'edit-cut.png',
				cmd: 'editCut'
			}, {
				name: 'Copy',
				id: 'Copy',
				image: 'edit-copy.png',
				cmd: 'editCopy'
			}, {
				name: 'Paste',
				id: 'Paste',
				image: 'edit-paste.png',
				cmd: 'editPaste'
			}, {
				type: 'Separator'
			}, {
				name: 'Select all',
				id: 'SelectAll',
				image: 'edit-select-all.png',
				cmd: 'editSelectAll'
			}, {
				type: 'Separator'
			}, {
				name: 'Find and replace...',
				id: 'FindandReplace',
				image: 'edit-find-replace.png',
				cmd: 'editFindAndReplace'
			}
//			{
//				type: 'Separator'
//			},
//			{
//				name: 'Copy/paste text style',
//				id: 'CopyPasteTextStyle',
//				image: 'draw-brush.png',
//				cmd: 'editCopyPasteTextStyle'
//			}, {
//				name: 'Get text style',
//				id: 'GetTextStyle',
//				image: 'show-textstyle.png',
//				cmd: 'editGetTextStyle'
//			}
		]
		}, {
			name: 'View',
			id: 'View',
			subMenu: [
//				{
//				name: 'Go to the beginning',
//				id: 'GoToTheBeginning',
//				image: 'draw-arrow-up.png',
//				cmd: 'ViewGoToTheBeginning'
//			}, {
//				name: 'Go to the end',
//				id: 'GoToTheEnd',
//				image: 'draw-arrow-down.png',
//				cmd: 'viewGoToTheEnd'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Show Thumbtacks',
//				id: 'ShowThumbtacks',
//				image: 'thumbtack.png',
//				cmd: 'ViewShowThumbtack',
//				type: 'CheckBox'
//			}, {
//				type: 'Separator'
//			},
			{
				name: 'Toolbar in advanced mode',
				id: 'switchToolBarMode',
				image: 'task-complete.png',
				cmd: 'viewToolbarMode',
				type: 'SwitchButton',
				checkedLabel: 'Toolbal in basic mode'
			}, {
				type: 'Separator'
			},
//			{
//				name: 'Comments',
//				id: 'Comments',
//				image: 'task-complete.png',
//				cmd: 'viewComments',
//				type: 'CheckBox'
//			}, {
//				name: 'Header and footer',
//				id: 'HeaderAndFooter',
//				image: 'task-complete.png',
//				cmd: 'viewHeaderAndFooter',
//				type: 'CheckBox'
//			}, {
//				name: 'No printable characters',
//				id: 'NoPrintableCharacters',
//				image: 'task-complete.png',
//				cmd: 'viewNoPrintableCharacters',
//				type: 'CheckBox'
//			}, {
//				name: 'Rule',
//				id: 'Rule',
//				image: 'task-complete.png',
//				cmd: 'viewRule',
//				type: 'CheckBox'
//			},
			{
				name: 'Socialbar',
				id: 'Socialbar',
				image: 'task-complete.png',
				cmd: 'viewSocialbar',
				type: 'CheckBox',
				active: true
			}, {
				name: 'Toolbar',
				id: 'Toolbar',
				image: 'task-complete.png',
				cmd: 'viewToolbar',
				type: 'CheckBox',
				active: true
			}
//			{
//				name: 'Users in page',
//				id: 'Users in page',
//				image: 'task-complete.png',
//				cmd: 'viewUserInPage',
//				type: 'CheckBox'
//			}
		]
		}, {
			name: 'Insert',
			id: 'Insert',
			subMenu: [
//				{
//				name: 'Draw...',
//				id: 'Draw',
//				image: 'draw-vector.png',
//				cmd: 'insertDraw'
//			}, {
//				name: 'Horizontal line',
//				id: 'HorizontalLine',
//				image: 'insert-horizontal-rule.png',
//				cmd: 'insertHorizontalLine'
//			},
			{
				name: 'Image...',
				id: 'Image',
				image: 'insert-image.png',
				cmd: 'insertImage'
			}
//			{
//				name: 'Glyphs...',
//				id: 'Glyphs',
//				image: 'insert-character.png',
//				cmd: 'insertGlyphs'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Header',
//				id: 'Header',
//				image: 'header.png',
//				cmd: 'insertHeader'
//			}, {
//				name: 'Footer',
//				id: 'Footer',
//				image: 'footer.png',
//				cmd: 'insertFooter'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Block quote',
//				id: 'BlockQuote',
//				image: 'quotation.png',
//				cmd: 'insertBlockQuote'
//			}, {
//				name: 'Footnote...',
//				id: 'Footnote',
//				image: 'footnte.png',
//				cmd: 'insertFootNote'
//			}, {
//				name: 'Page number',
//				id: 'PageNumber',
//				image: 'pagenumber.png',
//				subMenu: [{
//					name: 'Left',
//					id: 'Left',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}, {
//					name: 'Center',
//					id: 'Center',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}, {
//					name: 'Right',
//					id: 'Right',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}, {
//					type: 'Separator'
//				}, {
//					name: 'Top',
//					id: 'Top',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}, {
//					name: 'Bottom',
//					id: 'Bottom',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}, {
//					type: 'Separator'
//				}, {
//					name: 'Interior',
//					id: 'Interior',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}, {
//					name: 'Exterior',
//					id: 'Exterior',
//					image: 'task-complete.png',
//					cmd: 'insertPageNumber',
//					type: 'CheckBox'
//				}
				]
//			}, {
//				name: 'Special Character',
//				id: 'SpecialCharacter',
//				image: 'specialChar.png',
//				subMenu: [{
//					name: 'Symbols',
//					id: 'Symbols',
//					subMenu: [{
//						name: 'Bullet Character',
//						id: 'BulletCharacter',
//						cmd: 'insertSymbol'
//					}, {
//						name: '©   Copyright Symbol',
//						id: 'CopyrightSymbol',
//						cmd: 'insertSymbol'
//					}, {
//						name: 'Elipsis',
//						id: 'Elipsis',
//						cmd: 'insertSymbol'
//					}, {
//						name: 'Paragraph Symbol',
//						id: 'ParagraphSymbol',
//						cmd: 'insertSymbol'
//					}, {
//						name: 'Registered Trademark',
//						id: 'RegisteredTrademark',
//						cmd: 'insertSymbol'
//					}, {
//						name: 'Section Symbol',
//						id: 'SectionSymbol',
//						cmd: 'insertSymbol'
//					}, {
//						name: 'Trademark Symbol',
//						id: 'TrademarkSymbol',
//						cmd: 'insertSymbol'
//					}]
//				}, {
//					name: 'Currency symbols',
//					id: 'CurrencySymbols',
//					subMenu: [{
//						name: 'Dash',
//						id: 'Dash',
//						cmd: 'insertCurrencySymbol'
//					}, {
//						name:'Em Dash',
//						id:'EmDash',
//						cmd: 'insertCurrencySymbol'
//					}, {
//						name: 'Hyphen',
//						id: 'Hyphen',
//						cmd: 'insertCurrencySymbol'
//					}]
//				}, {
//					name: 'Hyphen and Dashes',
//					id: 'HyphenAndDashes',
//					subMenu: [{
//						name: 'Opening quotes',
//						id: 'OpeningQuotes',
//						cmd: 'insertHyphenAndDashes'
//					}, {
//						name: 'Closing quotes',
//						id: 'ClosingQuotes',
//						cmd: 'insertHyphenAndDashes'
//					}, {
//						name: 'Simple quotes',
//						id: 'SimpleQuotes',
//						cmd: 'insertHyphenAndDashes'
//					}, {
//						name: 'Apostrophe',
//						id: 'Apostrophe',
//						cmd: 'insertHyphenAndDashes'
//					}]
//				}, {
//					name: 'Quotation Marks',
//					id: 'QuotationMarks',
//					subMenu: [{
//						name: 'Dollar',
//						id: 'Dollar',
//						cmd: 'insertQuotationMarks'
//					}, {
//						name: 'Euro',
//						id: 'Euro',
//						cmd: 'insertQuotationMarks'
//					}, {
//						name: 'Pound',
//						id: 'Pound',
//						cmd: 'insertQuotationMarks'
//					}, {
//						name: 'Yen',
//						id: 'Yen',
//						cmd: 'insertQuotationMarks'
//					}, {
//						name: 'Generic',
//						id: 'Generic',
//						cmd: 'insertQuotationMarks'
//					}]
//				}]
//			}, {
//				name: 'Table of contents',
//				id: 'TableOfContents',
//				image: 'Table-content.png',
//				cmd: 'insertTableOfContents'
//			}, {
//				name: 'Pagebreak',
//				id: 'Pagebreak',
//				image: 'page-break2.png',
//				cmd: 'insertPageBreak'
//			}, {
//				type: 'Separator'
//			},  {
//				name: 'Anchors',
//				id: 'Anchors',
//				image: 'bookmark-ancho_22.png',
//				cmd: 'insertAnchors'
//			}, {
//				name: 'Hyperlinks',
//				id: 'Hyperlinks',
//				image: 'insert-link.png',
//				cmd: 'insertHyperLinks'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Comment',
//				id: 'Comment',
//				image: 'view-pim-notes.png',
//				cmd: 'insertComment'
//			}]
		}, {
			name: 'Format',
			id: 'Format',
			subMenu: [
//				{
//				name: 'Document settings...',
//				id: 'DocumentSettings',
//				image: 'doc-settings.png',
//				cmd: 'formatDocumentSettings'
//			}, {
//				type: 'Separator'
//			},
			{
				name: 'Text',
				id: 'Text',
				image: 'preferences-desktop-font.png',
				subMenu: [{
					name: 'Font',
					id: 'Font',
					subMenu: [{
						name: 'Arial',
						id: 'Arial',
						cmd: 'formatFont'
					}, {
						name: 'Arial Black',
						id: 'Arial Black',
						cmd: 'formatFont'
					}, {
						name: 'Book Antiqua',
						id: 'Book Antiqua',
						cmd: 'formatFont'
					}, {
						name: 'Comic Sans MS',
						id: 'Comic Sans MS',
						cmd: 'formatFont'
					}, {
						name: 'Courier',
						id: 'Courier',
						cmd: 'formatFont'
					}, {
						name: 'Courier New',
						id: 'Courier New',
						cmd: 'formatFont'
					}, {
						name: 'Geneva',
						id: 'Geneva',
						cmd: 'formatFont'
					}, {
						name: 'Georgia',
						id: 'Georgia',
						cmd: 'formatFont'
					}, {
						name: 'Helvetica',
						id: 'Helvetica',
						cmd: 'formatFont'
					}, {
						name: 'Lucida Console',
						id: 'Lucida Console',
						cmd: 'formatFont'
					}, {
						name: 'Lucida Grande',
						id: 'Lucida Grande',
						cmd: 'formatFont'
					}, {
						name: 'Lucida Sans Unicode',
						id: 'Lucida Sans Unicode',
						cmd: 'formatFont'
					}, {
						name: 'Monaco',
						id: 'Monaco',
						cmd: 'formatFont'
					}, {
						name: 'MS Serif',
						id: 'MS Serif',
						cmd: 'formatFont'
					}, {
						name: 'Palatino',
						id: 'Palatino',
						cmd: 'formatFont'
					}, {
						name: 'Tahoma',
						id: 'Tahoma',
						cmd: 'formatFont'
					}, {
						name: 'Times',
						id: 'Times',
						cmd: 'formatFont'
					}, {
						name: 'Times New Roman',
						id: 'Times New Roman',
						cmd: 'formatFont'
					}, {
						name: 'Trebuchet MS',
						id: 'Trebuchet MS',
						cmd: 'formatFont'
					}, {
						name: 'Verdana',
						id: 'Verdana',
						cmd: 'formatFont'
					}]
				}, {
					name: 'Size',
					id: 'Size',
					subMenu: [{
						name: '8',
						id: '8',
						cmd: 'formatSize'
					}, {
						name: '10',
						id: '10',
						cmd: 'formatSize'
					}, {
						name: '12',
						id: '12',
						cmd: 'formatSize'
					}, {
						name: '14',
						id: '14',
						cmd: 'formatSize'
					}, {
						name: '18',
						id: '18',
						cmd: 'formatSize'
					}, {
						name: '24',
						id: '24',
						cmd: 'formatSize'
					}, {
						name: '36',
						id: '36',
						cmd: 'formatSize'
					}]
				}, {
					name: 'Type',
					id: 'Type',
					subMenu: [{
						name: 'Bold',
						id: 'Bold',
						cmd: 'formatType'
					}, {
						name: 'Italic',
						id: 'Italic',
						cmd: 'formatType'
					}, {
						name: 'Underline',
						id: 'Underline',
						cmd: 'formatType'
					}, {
						name: 'Superscript',
						id: 'Superscript',
						cmd: 'formatType'
					}, {
						name: 'Subscript',
						id: 'Subscript',
						cmd: 'formatType'
					}, {
						name: 'Strikethrough',
						id: 'Strikethrough',
						cmd: 'formatType'
					}]
				}, {
					name: 'Case',
					id: 'Case',
					subMenu: [{
						name: 'lowercase',
						id: 'lowercase',
						cmd: 'formatCase'
					}, {
						name: 'UPPERCASE',
						id: 'UPPERCASE',
						cmd: 'formatCase'
					}, {
						name: 'Title Case',
						id: 'TitleCase',
						cmd: 'formatCase'
					}, {
						name: 'Versal',
						id: 'Versal',
						cmd: 'formatCase'
					}]
				}]
			}, {
				name: 'Text style',
				id: 'Text style',
				image: 'fontforge.png',
				subMenu: [{
					name: 'Normal paragraph text',
					id: 'NormalParagraphText',
					cmd: 'formatTextStyle'
				}, {
					name: 'Heading 1 (biggest)',
					id: 'Heading1',
					cmd: 'formatTextStyle'
				}, {
					name: 'Heading 2',
					id: 'Heading2',
					cmd: 'formatTextStyle'
				}, {
					name: 'Heading 3',
					id: 'Heading3',
					cmd: 'formatTextStyle'
				}, {
					name: 'Heading 4',
					id: 'Heading4',
					cmd: 'formatTextStyle'
				}, {
					name: 'Heading 5',
					id: 'Heading5',
					cmd: 'formatTextStyle'
				}, {
					name: 'Heading 6 (smallest)',
					id: 'Heading6',
					cmd: 'formatTextStyle'
				}, {
					type: 'Separator'
				}, {
					name: 'Clear formating (back to basic settings)',
					id: 'ClearFormating',
					cmd: 'formatTextStyle'
				}]
			}, {
				name: 'Align',
				id: 'Align',
				image: 'Text-alignmnt.png',
				subMenu: [{
					name: 'Left',
					id: 'justifyleft',
					cmd: 'formatAlign'
				}, {
					name: 'Center',
					id: 'justifycenter',
					cmd: 'formatAlign'
				}, {
					name: 'Right',
					id: 'justifyright',
					cmd: 'formatAlign'
				}, {
					name: 'Justified',
					id: 'justifyfull',
					cmd: 'formatAlign'
				}]
			}
//			{
//				name: 'Bullets and numbering...',
//				id: 'BulletsAndNumbering',
//				image: 'bullnum.png',
//				cmd: 'formatBulletsAndNumbering'
//			},{
//				name: 'Indentation...',
//				id: 'Indentation',
//				image: 'Indentation.png',
//				cmd: 'formatIndentation'
//			}
		]
		}, {
			name: 'Table',
			id: 'Table',
			subMenu: [{
				name: 'Insert Table...',
				id: 'InsertTable',
				image: 'Table.png',
				cmd: 'tableInsert'
			}, {
				name: 'Insert',
				id: 'Insert',
				image: 'Table-add.png',
				subMenu: [{
					name: 'Row Above',
					id: 'RowAbove',
					cmd: 'tableInsertRowAbove'
				}, {
					name: 'Row Below',
					id: 'RowBelow',
					cmd: 'tableInsertRowBelow'
				}, {
					name: 'Column to the Left',
					id: 'ColumnToTheLeft',
					cmd: 'tableInsertColumnLeft'
				}, {
					name: 'Column to the Right',
					id: 'ColumnToTheRight',
					cmd: 'tableInsertColumnRight'
				}, {
					type: 'Separator'
				}, {
					name: 'Rows or Columns',
					id: 'RowsOrColumns',
					cmd: 'tableInsertRowsOrColumns'
				}]
			}, {
				name: 'Delete',
				id: 'Delete',
				image: 'Table-delete.png',
				subMenu: [{
					name: 'Table',
					id: 'Table',
					cmd: 'tableDelete'
				}, {
					name: 'Row',
					id: 'Row',
					cmd: 'tableDeleteRow'
				}, {
					name: 'Column',
					id: 'Column',
					cmd: 'tableDeleteColumn'
				}]
			}, {
				type: 'Separator'
			}, {
				name: 'Merge Cells',
				id: 'MergeCells',
				image: 'Table-combine.png',
				cmd: 'tableMergeCell'
			}, {
				name: 'split Cell...',
				id: 'splitCell',
				image: 'Table-split.png',
				cmd: 'tableSplitCell'
			}, {
				type: 'Separator'
			}, {
				name: 'Table Alignment',
				id: 'TableAlignment',
				image: 'Table-align.png',
				subMenu: [{
					name: 'Align Left',
					id: 'AlignLeft',
					cmd: 'tableAlign'
				},  {
					name: 'Align Center',
					id: 'AlignCenter',
					cmd: 'tableAlign'
				}, {
					name: 'Align Right',
					id: 'AlignRight',
					cmd: 'tableAlign'
				}]
			}, {
				type: 'Separator'
			}, {
				name: 'Content Alignment...',
				id: 'ContentAlignment',
				image: 'tabla-aligncell-1.png',
				cmd: 'tableContentAlignment'
			}]
		}
//		{
//			name: 'Tools',
//			id: 'Tools',
//			subMenu: [{
//				name: 'Document Language',
//				id: 'DocumentLanguage',
//				image: 'langiconclassic_r9_c21.png',
//				subMenu: [{
//					name: 'Aramaico',
//					id: 'Aramaico',
//					cmd: 'toolsDocumentLanguage'
//				}, {
//					name: 'Egipcio',
//					id: 'Egipcio',
//					cmd: 'toolsDocumentLanguage'
//				}, {
//					name: 'Guiri',
//					id: 'Guiri',
//					cmd: 'toolsDocumentLanguage'
//				}]
//			}, {
//				name: 'Check Spelling...',
//				id: 'CheckSpelling',
//				image: 'tools-check-spelling.png',
//				cmd: 'toolsCheckSpelling'
//			}, {
//				name: 'Translate...',
//				id: 'Translate',
//				image: 'translate.png',
//				cmd: 'toolsTranslate'
//			}, {
//				name: 'Statistics',
//				id: 'Statistics',
//				image: 'text-x-texinfo.png',
//				cmd: 'toolsStatistics'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Search Web',
//				id: 'SearchWeb',
//				image: 'applications-internet.png',
//				subMenu: [{
//					name: 'Search the "Wiki" for xxxx',
//					id: 'SearchTheWiki',
//					cmd: 'toolsSearchWeb'
//				}, {
//					name: 'Search the web for xxxx',
//					id: 'SearchTheWeb',
//					cmd: 'toolsSearchWeb'
//				}, {
//					name: 'Search the web for xxxx images',
//					id: 'SearchTheWebForImages',
//					cmd: 'toolsSearchWeb'
//				}]
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Thumbtacks',
//				id: 'Thumbtacks',
//				image: 'thumbtack.png',
//				cmd: 'toolsThumbtacks'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Activity History',
//				id: 'ActivityHistory',
//				image: 'activity.png',
//				cmd: 'toolsActivityHistory'
//			}]
//		}, {
//			name: 'Helps',
//			id: 'Helps',
//			subMenu: [{
//				name: 'eyeDoc Help',
//				id: 'eyeDocHelp',
//				cmd: 'helpsEyeDoc'
//			}, {
//				name: 'Learn at eyeOS Forum',
//				id: 'LearnAtForum',
//				cmd: 'helpsLearnAtForum'
//			}, {
//				name: 'Watch a video about Colaborative features',
//				id: 'WatchVideoColaborative',
//				cmd: 'helpsWatchVideoColaborative'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'Keyboard Shortcuts',
//				id: 'KeyboardShortcuts',
//				cmd: 'helpsKeyboardShortcuts'
//			}, {
//				type: 'Separator'
//			}, {
//				name: 'About',
//				id: 'About',
//				cmd: 'aboutInfos'
//			}]
//		}
	]
	}
});
