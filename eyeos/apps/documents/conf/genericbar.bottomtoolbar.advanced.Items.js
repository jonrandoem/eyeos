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
qx.Class.define('genericbar.bottomtoolbar.advanced.Items', {
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
			name: 'Format',
			id: 'Format',
			Group: [{
				name: 'Font',
				id: 'Font',
				type: 'SelectBox',
				position: {
					top: 2,
					left: 10
				},
				cmd: 'formatFont',
				needUpdates: true,
				defaultId: 'Arial',
				subMenu: [{
					name: 'Arial',
					id: 'Arial'
				}, {
					name: 'Arial Black',
					id: 'Arial Black'
				}, {
					name: 'Book Antiqua',
					id: 'Book Antiqua'
				}, {
					name: 'Comic Sans MS',
					id: 'Comic Sans MS'
				}, {
					name: 'Courier',
					id: 'Courier'
				}, {
					name: 'Courier New',
					id: 'Courier New'
				}, {
					name: 'Geneva',
					id: 'Geneva'
				}, {
					name: 'Georgia',
					id: 'Georgia'
				}, {
					name: 'Helvetica',
					id: 'Helvetica'
				}, {
					name: 'Lucida Console',
					id: 'Lucida Console'
				}, {
					name: 'Lucida Grande',
					id: 'Lucida Grande'
				}, {
					name: 'Lucida Sans Unicode',
					id: 'Lucida Sans Unicode'
				}, {
					name: 'Monaco',
					id: 'Monaco'
				}, {
					name: 'MS Serif',
					id: 'MS Serif'
				}, {
					name: 'Palatino',
					id: 'Palatino'
				}, {
					name: 'Tahoma',
					id: 'Tahoma'
				}, {
					name: 'Times',
					id: 'Times'
				}, {
					name: 'Times New Roman',
					id: 'Times New Roman'
				}, {
					name: 'Trebuchet MS',
					id: 'Trebuchet MS'
				}, {
					name: 'Verdana',
					id: 'Verdana'
				}]
			}, {
				name: 'Size',
				id: 'Size',
				type: 'SelectBox',
				position: {
					top: 26,
					left: 10
				},
				cmd: 'formatSize',
				needUpdates: true,
				defaultId: '12',
				subMenu: [{
					name: '8',
					id: '8'
				}, {
					name: '10',
					id: '10'
				}, {
					name: '12',
					id: '12'
				}, {
					name: '14',
					id: '14'
				}, {
					name: '18',
					id: '18'
				}, {
					name: '24',
					id: '24'
				}, {
					name: '36',
					id: '36'
				}]
			}, {
				name: 'Style',
				id: 'Style',
				type: 'SelectBox',
				position: {
					top: 26,
					left: 130
				},
				cmd: 'formatTextStyle',
				needUpdates: true,
				subMenu:  [{
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
					name: 'Clear formating (back to basic settings)',
					id: 'ClearFormatting',
					cmd: 'formatTextStyle'
				}]
			}]
		}, {
			name: 'Color',
			id: 'Color',
			Group: [{
				name: 'underline',
				id: 'underline',
				needUpdates: true,
				position: {
					top: 2,
					left: 10
				},
				hideLabel: true,
				image: 'txt-color_icon.png',
				type: 'ColorButton',
				cmd: 'setUnderlineColor'
			}, {
				name: 'selection',
				id: 'selection',
				needUpdates: true,
				position: {
					top: 26,
					left: 10
				},
				hideLabel: true,
				image: 'txt-highlight_icon.png',
				type: 'ColorButton',
				cmd: 'setSelectionColor'
			}]
		}, {
			name: 'Type',
			id: 'Type',
			Group: [{
				name: 'Bold',
				id: 'Bold',
				position: {
					top: 2,
					left: 10
				},
				hideLabel: true,
				image: 'format-text-bold.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'Italic',
				id: 'Italic',
				position: {
					top: 2,
					left: 36
				},
				hideLabel: true,
				image: 'format-text-italic.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'Underline',
				id: 'Underline',
				position: {
					top: 2,
					left: 62
				},
				hideLabel: true,
				image: 'format-text-underline.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'Strikethrough',
				id: 'Strikethrough',
				position: {
					top: 28,
					left: 10
				},
				hideLabel: true,
				image: 'format-text-strikethrough.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'SuperScript',
				id: 'SuperScript',
				position: {
					top: 28,
					left: 36
				},
				hideLabel: true,
				image: 'format-text-superscript.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'SubScript',
				id: 'SubScript',
				position: {
					top: 28,
					left: 62
				},
				hideLabel: true,
				image: 'format-text-subscript.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}]
		}, {
			name: 'Align',
			id: 'Align',
			Group: [{
				name: 'Left',
				id: 'justifyleft',
				position: {
					top: 2,
					left: 10
				},
				hideLabel: true,
				image: 'format-justify-left.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}, {
				name: 'Center',
				id: 'justifycenter',
				position: {
					top: 28,
					left: 10
				},
				hideLabel: true,
				image: 'format-justify-center.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}, {
				name: 'Right',
				id: 'justifyright',
				position: {
					top: 2,
					left: 36
				},
				hideLabel: true,
				image: 'format-justify-right.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}, {
				name: 'Justify',
				id: 'justifyfull',
				position: {
					top: 28,
					left: 36
				},
				hideLabel: true,
				image: 'format-justify-fill.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}]
		},
//		{
//			name: 'Cases',
//			id: 'Cases',
//			Group: [{
//				name: 'Title Case',
//				id: 'TitleCase',
//				position: {
//					top: 2,
//					left: 10
//				},
//				hideLabel: true,
//				image: 'changecase_jac.png',
//				cmd: 'formatCase',
//				type: 'ToggleButton',
//				needAManager: true,
//				allowEmptySelection: true
//			}, {
//				name: 'Versal',
//				id: 'Versal',
//				position: {
//					top: 28,
//					left: 10
//				},
//				hideLabel: true,
//				image: 'versal_jac.png',
//				cmd: 'formatCase',
//				type: 'ToggleButton',
//				needAManager: true,
//				allowEmptySelection: true
//			}]
//		},
		{
			name: 'List',
			id: 'List',
			Group: [{
				name: 'Ordered',
				id: 'Ordered',
				position: {
					top: 2,
					left: 10
				},
				hideLabel: true,
				image: 'format-list-ordered.png',
				cmd: 'insertOrderedList',
				type: 'ToggleButton',
				needAManager: true,
				allowEmptySelection: true
			}, {
				name: 'Unordered',
				id: 'Unordered',
				position: {
					top: 28,
					left: 10
				},
				hideLabel: true,
				image: 'format-list-unordered.png',
				cmd: 'insertUnorderedList',
				type: 'ToggleButton',
				needAManager: true,
				allowEmptySelection: true
			}
//			{
//				name: 'Options',
//				id: 'Options',
//				position: {
//					top: 2,
//					left: 36
//				},
//				hideLabel: true,
//				image: 'bull-num-opts.png',
//				subMenu: [{
//					name: 'Show options',
//					id: 'Show options',
//					cmd: 'formatBulletsAndNumbering'
//				}]
//			}
		]
		}, {
			name: 'Margin',
			id: 'Margin',
			Group: [{
				name: 'left',
				id: 'left',
				position: {
					top: 2,
					left: 10
				},
				hideLabel: true,
				image: 'sangizq_jac.png',
				cmd: 'setMargin'
			}, {
				name: 'right',
				id: 'right',
				position: {
					top: 28,
					left: 10
				},
				hideLabel: true,
				image: 'sangdir_jac.png',
				cmd: 'setMargin'
			}, {
				name: 'top',
				id: 'top',
				position: {
					top: 2,
					left: 36
				},
				hideLabel: true,
				image: 'espacioantes_jac.png',
				cmd: 'setMargin'
			}, {
				name: 'bottom',
				id: 'bottom',
				position: {
					top: 28,
					left: 36
				},
				hideLabel: true,
				image: 'espaciodesp_jac.png',
				cmd: 'setMargin'
			}, {
				name: 'interline',
				id: 'interline',
				position: {
					top: 2,
					left: 64
				},
				hideLabel: true,
				image: 'sangizq1linea_jac.png',
				cmd: 'setMargin',
				type: 'Spinner',
				min: 1
			}]
		}, {
			name: 'RowsAndCols',
			id: 'RowsAndCols',
			advanced: true,
			Group: [{
				name: 'Rows ',
				id: 'Rows',
				position: {
					top: 2,
					left: 10
				},
				type: 'Spinner',
				dyncmd: 'setRows',
				min: 1,
				needUpdates: true

			}, {
				name: 'Cols   ',
				id: 'Cols',
				position: {
					top: 28,
					left: 10
				},
				type: 'Spinner',
				dyncmd: 'setCols',
				min: 1,
				needUpdates: true
			}, {
				name: 'CellPad     ',
				id: 'CellPad',
				position: {
					top: 2,
					left: 107
				},
				type: 'Spinner',
				cmd: 'cellPad',
				min: 0,
				needUpdates: true
			}, {
				name: 'CellSpace  ',
				id: 'CellSpace',
				position: {
					top: 28,
					left: 105
				},
				type: 'Spinner',
				cmd: 'cellSpace',
				min: 0,
				needUpdates: true
			}]
		}, {
			name: 'Width',
			id: 'Width',
			advanced: true,
			Group: [{
				name: 'Width',
				id: 'Width',
				needUpdates: true,
				position: {
					top: 2,
					left: 10
				},
				type: 'Spinner',
				cmd: 'setWidth'
			}, {
				name: 'Measure',
				id: 'Measure',
				position: {
					top: 2,
					left: 108
				},
				type: 'SelectBox',
				cmd: 'setWidthMeasure',
				needUpdates: true,
				subMenu: [{
					name: 'px',
					id: 'px'
				}, {
					name: '%',
					id: '%'
				}]
			}, {
				name: 'to page width',
				id: 'toPageWidth',
				needUpdates: true,
				position: {
					top: 34,
					left: 15
				},
				type: 'CheckBox',
				cmd: 'tableToPageWidth'
			}]
		}, {
			name: 'Border',
			id: 'Border',
			advanced: true,
			Group: [{
				name: 'Border',
				id: 'Border',
				needUpdates: true,
				position: {
					top: 2,
					left: 10
				},
				type: 'Spinner',
				cmd: 'setBorderWidth',
				min: 0
			},
//			{
//				type: 'ImageMenuButton',
//				position: {
//					top: 28,
//					left: 15
//				},
//				subMenu: [{
//					image: '1.png',
//					cmd: 'setBorder'
//				}, {
//					image: '2.png',
//					cmd: 'setBorder'
//				}, {
//					image: '3.png',
//					cmd: 'setBorder'
//				}, {
//					image: '4.png',
//					cmd: 'setBorder'
//				}, {
//					image: '5.png',
//					cmd: 'setBorder'
//				}, {
//					image: '6.png',
//					cmd: 'setBorder'
//				}, {
//					image: '7.png',
//					cmd: 'setBorder'
//				}, {
//					image: '8.png',
//					cmd: 'setBorder'
//				}, {
//					image: '9.png',
//					cmd: 'setBorder'
//				},  {
//					image: '10.png',
//					cmd: 'setBorder'
//				}, {
//					image: '11.png',
//					cmd: 'setBorder'
//				}, {
//					image: '12.png',
//					cmd: 'setBorder'
//				}]
//			}
		]
		}, {
			name: 'Colors',
			id: 'Colors',
			advanced: true,
			Group: [{
				name: 'text',
				id: 'text',
				needUpdates: true,
				position: {
					top: 2,
					left: 10
				},
				image: 'tabla-clorotraso.png',
				type: 'ColorButton',
				cmd: 'setBorderColor'
			}, {
				name: 'fill',
				id: 'fill',
				needUpdates: true,
				position: {
					top: 28,
					left: 10
				},
				image: 'tabla-colorrell.png',
				type: 'ColorButton',
				cmd: 'setFillColor'
			}]
		}, {
			name: 'CombineSplit',
			id: 'CombineSplit',
			advanced: true,
			Group: [{
				name: 'Combine table',
				id: 'CombineTable',
				needUpdates: true,
				position: {
					top: 2,
					left: 10
				},
				hideLabel: true,
				image: 'tabla-combinecell.png',
				cmd: 'tableMergeCell'
			}, {
				name: 'Split Cell',
				id: 'SplitCell',
				needUpdates: true,
				position: {
					top: 28,
					left: 10
				},
				hideLabel: true,
				image: 'tabla-splitcell.png',
				cmd: 'tableSplitCell'
			}]
		}, {
			name: 'Align',
			id: 'Align',
			advanced: true,
			Group: [{
				name: 'Align',
				id: 'Align',
				needUpdates: true,
				type: 'SelectBox',
					cmd: 'tableAlign',
				position: {
					top: 2,
					left: 15
				},
				subMenu: [{
					name: 'Align Left',
					id: 'AlignLeft'
				}, {
					name: 'Align Center',
					id: 'AlignCenter'
				}, {
					name: 'Align Right',
					id: 'AlignRight'
				}]
			}, {
				type: 'ImageMenuButton',
				id: 'tableContentAlignment',
				needUpdates: true,
				position: {
					top: 28,
					left: 15
				},
				subMenu: [{
					image: 'tabla-aligncell-1.png',
					id: 'tableContentAlignmentUpLeft',
					cmd: 'tableContentAlignmentUpLeft'
				}, {
					image: 'tabla-aligncell-2.png',
					id: 'tableContentAlignmentMiddleLeft',
					cmd: 'tableContentAlignmentMiddleLeft'
				}, {
					image: 'tabla-aligncell-3.png',
					id: 'tableContentAlignmentBottomLeft',
					cmd: 'tableContentAlignmentBottomLeft'
				}, {
					image: 'tabla-aligncell-4.png',
					id: 'tableContentAlignmentUpCenter',
					cmd: 'tableContentAlignmentUpCenter'
				}, {
					image: 'tabla-aligncell-5.png',
					id: 'tableContentAlignmentMiddleCenter',
					cmd: 'tableContentAlignmentMiddleCenter'
				}, {
					image: 'tabla-aligncell-6.png',
					id: 'tableContentAlignmentBottomCenter',
					cmd: 'tableContentAlignmentBottomCenter'
				}, {
					image: 'tabla-aligncell-7.png',
					id: 'tableContentAlignmentUpRight',
					cmd: 'tableContentAlignmentUpRight'
				}, {
					image: 'tabla-aligncell-8.png',
					id: 'tableContentAlignmentMiddleRight',
					cmd: 'tableContentAlignmentMiddleRight'
				}, {
					image: 'tabla-aligncell-9.png',
					id: 'tableContentAlignmentBottomRight',
					cmd: 'tableContentAlignmentBottomRight'
				}]
			}]
		}]
	}
});

