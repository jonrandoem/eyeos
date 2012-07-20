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

qx.Class.define('eyeos.application.documents.Table', {
	statics: {
		tableInsert: function(object) {
			eyeos.application.documents.WindowsAndDialogs.tableInsertWindow(object);
		},

		tableInsertColumnLeft: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableInsertColBefore');
		},

		tableInsertColumnRight: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableInsertColAfter');
		},

		tableInsertRowAbove: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableInsertRowBefore');
		},

		tableInsertRowBelow: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableInsertRowAfter');
		},

		tableInsertRowsOrColumns: function(object) {
			eyeos.application.documents.WindowsAndDialogs.tableInsertRowsOrColumnsWindow(object);
		},

		tableDelete: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' +object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableDelete');
		},

		tableDeleteRow: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableDeleteRow');
		},

		tableDeleteColumn: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableDeleteCol');
		},

		tableMergeCell: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			ed.plugins.table.execCommand('mceTableMergeCells');
		},

		tableSplitCell: function(object) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());

			var focusElm = ed.selection.getNode();
			var tdElm = ed.dom.getParent(focusElm, "td,th");
			var trElm = ed.dom.getParent(focusElm, "tr");

			var spandata = this.__getColRowSpan(object, tdElm);

			var colspan = spandata["colspan"];
			var rowspan = spandata["rowspan"];

			if((colspan > 1) || (rowspan > 1)) {
				ed.plugins.table.execCommand('mceTableSplitCells');
			} else {
				if(tdElm) {
					var window = eyeos.application.documents.WindowsAndDialogs.tableSplitCellWindow(object);
					window.addListener('done', function(e) {
						var doc = ed.contentWindow.document;
						var elements = e.getData().value;

						var tdElmPos = null;
						for(var i = 0; i < trElm.childNodes.length; ++i) {
							if(trElm.childNodes[i] == tdElm) {
								tdElmPos = i;
							}
						}

						var rowsToBeRemoved = new Array();
						for(i = 1; i < elements; ++i) {
							if(e.getData().type == 'rows') {
								this.tableInsertRowBelow(object);
								rowsToBeRemoved.push(ed.selection.getNode().parentNode);
							} else {
								this.tableInsertColumnRight(object);
							}
						}

						if(rowsToBeRemoved.length) {
							for(i = 0; i < rowsToBeRemoved.length; ++i) {
								var childs = rowsToBeRemoved[i].childNodes;
								var child_length = childs.length - 1;
								for(j = 0; j < child_length; ++j) {
									rowsToBeRemoved[i].removeChild(childs[0]);
								}
							}

							for(k = 0; k < trElm.childNodes.length; ++k) {
								if(trElm.childNodes[k] != tdElm) {
									ed.dom.setAttrib(trElm.childNodes[k], 'rowspan', elements);
									ed.dom.setAttrib(trElm.childNodes[k], 'colspan', 1);
								}
							}
						} else {
							var rows = trElm.parentNode.childNodes;
							var colsToBeRemoved = new Array();
							for(var j = 0; j < rows.length; ++j) {
								var cells = rows[j].childNodes;
								if(cells[tdElmPos] != tdElm) {
									var start = tdElmPos + 1;
									var end = start + elements - 1;
									for(var k = start; k < end; ++k) {
										colsToBeRemoved.push(cells[k]);
									}
								}
							}

							for(i = 0; i < colsToBeRemoved.length; ++i) {
								colsToBeRemoved[i].parentNode.removeChild(colsToBeRemoved[i]);
							}

							var table = trElm.parentNode;
							for(i = 0; i < table.childNodes.length; ++i) {
								var row = table.childNodes[i];
								var cell = row.childNodes[tdElmPos];
								if(cell != tdElm) {
									ed.dom.setAttrib(cell, 'colspan', elements);
									ed.dom.setAttrib(cell, 'rowspan', 1);
								}
							}
						}

						var tableElm = ed.dom.getParent(ed.selection.getNode(), "table");
						ed.addVisual(tableElm);
						ed.nodeChanged();
					}, this);
				}
			}
		},

		__getColRowSpan: function(object, td) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var colspan = ed.dom.getAttrib(td, 'colspan');
			var rowspan = ed.dom.getAttrib(td, 'rowspan');

			colspan = colspan == "" ? 1 : parseInt(colspan);
			rowspan = rowspan == "" ? 1 : parseInt(rowspan);

			return {colspan : colspan, rowspan : rowspan};
		},

		tableAlign: function(object, e) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var element = tinyMCE.getInstanceById(tinymceId).selection;

			if (element.getNode() instanceof HTMLTableCellElement) {
				var parent = element.getNode().parentNode;
				while (parent.tagName != 'TABLE') {
					parent = parent.parentNode;
				}

				var value = '';
				if(e.getTarget() instanceof eyeos.ui.toolbar.SelectBox) {
					value = e.getTarget().getSelection()[0].getId();
				} else {
					value = e.getTarget().getId();
				}
				
				switch (value) {
					case 'AlignLeft':
						parent.setAttribute('align', 'left');
						break;
					case 'AlignCenter':
						parent.setAttribute('align', 'center');
						break;
					case 'AlignRight':
						parent.setAttribute('align', 'right');
						break;
				}
			}
		},

		tableContentAlignment: function(object) {
			eyeos.application.documents.WindowsAndDialogs.tableContentAlignmentWindow(object);
		},

		tableToPageWidth: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var iframe = document.getElementById(ed.id + '_ifr');
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				if(((e.getTarget() instanceof eyeos.ui.toolbar.CheckBox) && (e.getTarget().isValue())) || (e.getTarget() instanceof eyeos.ui.menu.Button)) {
					var width = iframe.contentDocument.body.offsetWidth;
					this._oldWidth = (ed.dom.getStyle(node, 'width'));
					ed.dom.setStyle(node, 'width', width);
				} else {
					ed.dom.setStyle(node, 'width', this._oldWidth);
				}
			}
		},

		setRows: function(object, flag) {
			if(flag == 'up') {
				this.tableInsertRowBelow(object);
			} else {
				this.tableDeleteRow(object);
			}
		},

		setCols: function(object, flag) {
			if(flag == 'up') {
				this.tableInsertColumnRight(object);
			} else {
				this.tableDeleteColumn(object);
			}
		},

		cellPad: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				ed.dom.setAttrib(node, 'cellpadding', e.getTarget().getValue());
			}
		},

		cellSpace: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				ed.dom.setAttrib(node, 'cellspacing', e.getTarget().getValue());
			}
		},

		setWidth: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				var measure = null;
			
				if(e.getTarget() instanceof eyeos.ui.toolbar.SelectBox) {
					measure = e.getTarget().getSelection()[0].getId();
					var value = e.getTarget().getLayoutParent().getChildren()[1].getValue();
					if(measure == 'px') {
						ed.dom.setStyle(node, 'width',  value.toString() + 'px');
					}	else {
						ed.dom.setStyle(node, 'width',  value.toString() + '%');
					}
				} else {
					measure = e.getTarget().getLayoutParent().getChildren()[2].getValue();
					if(measure == 'px') {
						ed.dom.setStyle(node, 'width',  e.getTarget().getValue().toString() + 'px');
					}	else {
						ed.dom.setStyle(node, 'width',  e.getTarget().getValue().toString() + '%');
					}
				}
			}
		},

		setWidthMeasure: function(object, e) {
			var measure = e.getTarget();
			var bros = measure.getLayoutParent().getChildren();
			for(var i = 0; i < bros.length; ++i) {
				if(bros[i] instanceof eyeos.ui.toolbar.Spinner) {
					if(measure.getSelection()[0].getId() == 'px') {
						var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
						bros[i].setMaximum(parseInt(document.getElementById(ed.id + '_tbl').offsetWidth));
					} else {
						bros[i].setMaximum(100);
					}
				}
			}
			this.setWidth(object, e);
		},

		setBorderWidth: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				ed.dom.setAttrib(node, 'border',  e.getTarget().getValue().toString());
				var tableElm = ed.dom.getParent(ed.selection.getNode(), "table");
				ed.addVisual(tableElm);
				ed.nodeChanged();
			}
		},

		setBorderColor: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				ed.dom.setAttrib(node, 'bordercolor',  e.getTarget().getColor());
			}
		},

		setFillColor: function(object, e) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var node = ed.selection.getNode();

			while((node.nodeName != 'TABLE') && (node.nodeName != 'BODY')) {
				node = node.parentNode;
			}

			if(node.nodeName == 'TABLE') {
				ed.dom.setAttrib(node, 'bgcolor',  e.getTarget().getColor());
			}
		},

		tableContentAlignmentSingle: function(object, vertical_align, horizontal_align) {
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var element = tinyMCE.getInstanceById(tinymceId).selection;

			if (element.getNode() instanceof HTMLTableCellElement) {
				var parent = element.getNode().parentNode;
				while (parent.tagName != 'TBODY') {
					parent = parent.parentNode;
				}

				for (var i = 0; i < parent.childNodes.length; ++i) {
					var tr = parent.childNodes[i];
					for (var j = 0; j < tr.childNodes.length; ++j) {
						tr.childNodes[j].setAttribute('align', horizontal_align);
						tr.childNodes[j].setAttribute('valign', vertical_align);
					}
				}
			}
		}
	}
});
