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
qx.Class.define('genericbar.bottomtoolbar.basic.Items', {
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
			name: 'Format',
			id: 'Format',
			Group: [{
				name: 'Font',
				id: 'Font',
				type: 'SelectBox',
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
				image: 'fontforge-16.png',
				hideLabel: true,
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
				hideLabel: true,
				image: 'txt-color_icon.png',
				type: 'ColorButton',
				cmd: 'setUnderlineColor'
			}, {
				name: 'selection',
				id: 'selection',
				needUpdates: true,
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
				hideLabel: true,
				image: 'format-text-bold.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'Italic',
				id: 'Italic',
				hideLabel: true,
				image: 'format-text-italic.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'Underline',
				id: 'Underline',
				hideLabel: true,
				image: 'format-text-underline.png',
				cmd: 'formatType',
				type: 'ToggleButton',
				needUpdates: true
			}, {
				name: 'Strikethrough',
				id: 'Strikethrough',
				hideLabel: true,
				image: 'format-text-strikethrough.png',
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
				hideLabel: true,
				image: 'format-justify-left.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}, {
				name: 'center',
				id: 'justifycenter',
				hideLabel: true,
				image: 'format-justify-center.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}, {
				name: 'Right',
				id: 'justifyright',
				hideLabel: true,
				image: 'format-justify-right.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}, {
				name: 'Justify',
				id: 'justifyfull',
				hideLabel: true,
				image: 'format-justify-fill.png',
				cmd: 'formatAlign',
				type: 'ToggleButton',
				needAManager: true
			}]
		}, {
			name: 'List',
			id: 'List',
			Group: [{
				name: 'Ordered',
				id: 'Ordered',
				hideLabel: true,
				image: 'format-list-ordered.png',
				cmd: 'insertOrderedList',
				type: 'ToggleButton',
				needAManager: true,
				allowEmptySelection: true
			}, {
				name: 'Unordered',
				id: 'Unordered',
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
//				hideLabel: true,
//				image: 'bull-num-opts.png',
//				subMenu: [{
//					name: 'Show options',
//					id: 'ShowOptions',
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
				hideLabel: true,
				image: 'sangizq_jac.png',
				cmd: 'setMargin'
			}, {
				name: 'right',
				id: 'right',
				hideLabel: true,
				image: 'sangdir_jac.png',
				cmd: 'setMargin'
			}]
		}, {
			name: 'RowsAndCols',
			id: 'RowsAndCols',
			advanced: true,
			Group: [{
				name: 'Rows',
				id: 'Rows',
				type: 'Spinner',
				dyncmd: 'setRows',
				min: 1,
				needUpdates: true
			}, {
				name: 'Cols',
				id: 'Cols',
				type: 'Spinner',
				dyncmd: 'setCols',
				min: 1,
				needUpdates: true
			}]
		}, {
			name: 'Width',
			id: 'Width',
			advanced: true,
			Group: [{
				name: 'Width',
				id: 'Width',
				type: 'Spinner',
				cmd: 'setWidth',
				needUpdates: true
			}, {
				name: 'Measure',
				id: 'Measure',
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
			}]
		}, {
			name: 'Border',
			id: 'Border',
			advanced: true,
			Group: [{
				name: 'Border',
				id: 'Border',
				needUpdates: true,
				type: 'Spinner',
				cmd: 'setBorderWidth',
				min: 0
			},
//			{
//				type: 'ImageMenuButton',
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
				image: 'tabla-clorotraso.png',
				type: 'ColorButton',
				cmd: 'setBorderColor'
			}, {
				name: 'fill',
				id: 'fill',
				needUpdates: true,
				image: 'tabla-colorrell.png',
				type: 'ColorButton',
				cmd: 'setFillColor'
			}]
		}, {
			name: 'Align',
			id: 'Align',
			advanced: true,
			Group: [{
				name: 'Align',
				id: 'Align',
				type: 'SelectBox',
				cmd: 'tableAlign',
				needUpdates: true,
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
					top: 26,
					left: 5
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

