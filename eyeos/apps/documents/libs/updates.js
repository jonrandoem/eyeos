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

qx.Class.define('eyeos.application.documents.Updates', {
	extend: qx.core.Object,

	statics: {
		updateStatus: function(object, ed, cm, e, needAManagerBasic, needAManagerAdvanced, needUpdatesBasic, needUpdatesAdvanced) {
			this.updateAligns(e, needAManagerBasic, needAManagerAdvanced);
			this.updateBulletsNumbering(e, needAManagerBasic, needAManagerAdvanced);

			this.updateFont(object, e, needUpdatesBasic, needUpdatesAdvanced);
			 this.updateTableToolBar(object, e, needUpdatesBasic, needUpdatesAdvanced);
			 this.updateTypeBasic(object, e, needUpdatesBasic);
//			 this.updateTypeAdvanced(object, e, needUpdatesAdvanced);
		},

		updateAligns: function(e, needAManagerBasic, needAManagerAdvanced) {
			var node = e;
			while((node) && (node.nodeName != 'BODY')) {
				switch (node.getAttribute('align')) {
					case null:
					case 'left':
						this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'justifyleft', true);
						break;
					case 'center':
						this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'justifycenter', true);
						break;
					case 'right':
						this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'justifyright', true);
						break;
					case 'justify':
						this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'justifyfull', true);
						break;
				}
				node = node.parentNode;
			}
		},

		updateBulletsNumbering: function(e, needAManagerBasic, needAManagerAdvanced) {
			if (e.tagName == 'LI') {
				if (e.parentNode.tagName == 'OL') {
					this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'Ordered', true);
				}
				else if (e.parentNode.tagName == 'UL') {
					this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'Unordered', true);
				}
			}
			else {
				this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'Ordered', false);
				this.__updateNeedAManagerElements(needAManagerBasic, needAManagerAdvanced, 'Unordered', false);
			}
		},

		__updateNeedAManagerElements: function(needAManagerBasic, needAManagerAdvanced, id, value) {
			needAManagerBasic.forEach(function (button) {
				if (button.getId() == id) {
					if(value) {
						button.manager.setSelection([button]);
					} else {
						button.setValue(value);
					}
				}
			}, this);

			needAManagerAdvanced.forEach(function (button) {
				if (button.getId() == id) {
					if(value) {
						button.manager.setSelection([button]);
					} else {
						button.setValue(value);
					}
				}
			}, this);
		},

		updateTableToolBar: function(object, e, needUpdatesBasic, needUpdatesAdvanced) {
			var i = null;

			for(i = 0; i < needUpdatesBasic.length; ++i) {
				this.__updateTableToolBar(object, needUpdatesBasic[i], e);
			}

			for(i = 0; i < needUpdatesAdvanced.length; ++i) {
				this.__updateTableToolBar(object, needUpdatesAdvanced[i], e);
			}
		},


		updateTopToolBar: function(e, needUpdates) {
			var elements = needUpdates[0].getMenu().getChildren();
			for(var i = 0; i < elements.length; ++i) {
				if(elements[i].getId() != 'InsertTable') {
					this.changeTableButtonsStatus(e.nodeName, elements[i]);
				}
			}
		},

		__updateTableToolBar: function(object, element, e) {
			var node = null;
			var item = null;
			switch(element.getId()) {
				case 'tableContentAlignment':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
					}
					break;
				case 'SplitCell':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
					}
					break;
				case 'CombineTable':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
					}
					break;
				case 'toPageWidth':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}

						var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
						var iframe = document.getElementById(ed.id + '_ifr');

						element.blocked = true;
						if(iframe.contentDocument.body.offsetWidth == node.offsetWidth) {
							element.setValue(true);
						} else {
							element.setValue(false);
						}
						element.blocked = false;
					}
					break;
				case 'CellPad':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
						element.setValue(parseInt(node.getAttribute('cellpadding')));
					}
					break;
				case 'CellSpace':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
						element.setValue(parseInt(node.getAttribute('cellspacing')));
					}
					break;
				case 'Measure':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}

						if(node.style.width.indexOf('px') >= 0) {
							element.setSelection([element.getChildren()[0]]);
						} else {
							element.setSelection([element.getChildren()[1]]);
						}
					}
					break;
				case 'Width':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}

						element.blocked = true;
						if(node.style.width.indexOf('px') >= 0) {
							element.setValue(parseInt(node.offsetWidth));
						} else {
							var foo = parseInt((parseInt(node.offsetWidth) * 100) / parseInt(node.parentNode.offsetWidth));
							element.setValue(foo);
						}
						element.blocked = false;
					}
					break;
				case 'Border':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
						element.setValue(parseInt(node.getAttribute('border')));

						if(parseInt(node.getAttribute('border')) > 0) {
							node.removeAttribute('class');
						} else {
							node.setAttribute('class', 'mceItemTable');
						}
					}
					break;
				case 'text':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
						element.setColor(node.getAttribute('bordercolor'));
					}
					break;
				case 'fill':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}
						element.setColor(node.getAttribute('bgcolor'));
					}
					break;
				case 'Align':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}

						item = null;
						switch(node.getAttribute('align')) {
							case null:
							case 'left':
								element.blocked = true;
								item = element.getChildren()[0];
								element.setSelection([item]);
								element.blocked = false;
								break;
							case 'center':
								element.blocked = true;
								item = element.getChildren()[1];
								element.setSelection([item]);
								element.blocked = false;
								break;
							case 'right':
								element.blocked = true;
								item = element.getChildren()[2];
								element.setSelection([item]);
								element.blocked = false;
								break;
						}
					}
					break;
				case 'Rows':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}

						var rows = node.childNodes[0].childNodes;
						element.setValue(rows.length);
					}
					break;
				case 'Cols':
					if(this.changeTableButtonsStatus(e.nodeName, element)) {
						node = e;
						while(node.nodeName != 'TABLE') {
							node = node.parentNode;
						}

						var rowNodes = node.childNodes[0].childNodes;
						var maxCols = 0;
						for(var j = 0; j < rowNodes.length; ++j) {
							if(rowNodes[j].childNodes.length > maxCols) {
								maxCols = rowNodes[j].childNodes.length;
							}
						}
						element.setValue(maxCols);
					}
					break;
			}
		},

		changeTableButtonsStatus: function(nodeName, tableButton) {
			if((nodeName == 'TABLE') || (nodeName == 'TD') || (nodeName == 'TR') || (nodeName == 'TBODY')) {
				tableButton.setEnabled(true);
			} else {
				tableButton.setEnabled(false);
			}

			return tableButton.getEnabled();
		},

		_updateFontColor: function(object, e, needUpdatesBasic, needUpdatesAdvanced) {
			var node = e;
			var backgroundColor = null;
			var textColor = null;

			while(node.nodeName == 'SPAN') {
				if(node.style.backgroundColor) {
					backgroundColor = backgroundColor ? backgroundColor : node.style.backgroundColor;
				}

				if(node.style.color) {
					textColor = textColor ? textColor : node.style.color;
				}

				node = node.parentNode;
			}

			if(!textColor) {
				textColor = 'black';
			}

			if(!backgroundColor) {
				backgroundColor = 'white';
			}

			needUpdatesBasic.forEach(function (button) {
				if(button instanceof eyeos.ui.toolbar.ColorButton) {
					if(button.clicked) {
						button.clicked = false;
					} else {
						if(button.getId() == 'selection') {
							button.blocked = true;
							button.setColor(backgroundColor);
							button.blocked = false;
						}

						if(button.getId() == 'underline') {
							button.blocked = true;
							button.setColor(textColor);
							button.blocked = false;
						}
					}
				}
			});

			needUpdatesAdvanced.forEach(function (button) {
				if(button instanceof eyeos.ui.toolbar.ColorButton) {
					if(button.clicked) {
						button.clicked = false;
					} else {
						if(button.getId() == 'selection') {
							button.blocked = true;
							button.setColor(backgroundColor);
							button.blocked = false;
						}

						if(button.getId() == 'underline') {
							button.blocked = true;
							button.setColor(textColor);
							button.blocked = false;
						}
					}
				}
			});
		},

		// fix for IE...
		getComputedStyle: function(element, styleProperty) {
			if (element != null) {
				if (document.defaultView && document.defaultView.getComputedStyle) {
					return document.defaultView.getComputedStyle(element, null)[styleProperty];
				} else if (element.currentStyle) {
					var style = element.currentStyle[styleProperty];
					if (style == "inherit") {
						return WikEdGetStyle(element.parent, styleProperty);
					} else {
						return style;
					}
				} else {
					return element.style[styleProperty];
				}
			}
			return null;
		},

		updateFont: function(object, e, needUpdatesBasic, needUpdatesAdvanced) {
			this._updateFontColor(object, e, needUpdatesBasic, needUpdatesAdvanced);

			var fontFamily = this.getComputedStyle(e, 'fontFamily');
			var fontSize = this.getComputedStyle(e, 'fontSize');

			var node = e;
			while(node.nodeName == 'SPAN') {
				node = node.parentNode;
			}

			var index = 0;
			needUpdatesBasic.forEach(function (button) {
				if(button instanceof eyeos.ui.toolbar.SelectBox) {
					if(button.clicked) {
						button.clicked = false;
					} else {
						button.blocked = true;

						var items = button.getChildren();
						for(var i = 0; i < items.length; ++i) {
							if(items[i].getId() == fontFamily) {
								button.setSelection([items[i]]);
							}

							if(items[i].getId() + 'px' == fontSize) {
								button.setSelection([items[i]]);
							}
						}

						button.blocked = false;
					}
				}
				index++;
			}, this);

			needUpdatesAdvanced.forEach(function (button) {
				if(button instanceof eyeos.ui.toolbar.SelectBox) {
					if(button.clicked) {
						button.clicked = false;
					} else {
						button.blocked = true;

						var items = button.getChildren();
						for(var i = 0; i < items.length; ++i) {
							if(items[i].getId() == fontFamily) {
								button.setSelection([items[i]]);
							}

							if(items[i].getId() + 'px' == fontSize) {
								button.setSelection([items[i]]);
							}

							switch(node.nodeName) {
								case 'H1':
									if(items[i].getId() == 'Heading1') {
										button.setSelection([items[i]]);
									}
									break;
								case 'H2':
									if(items[i].getId() == 'Heading2') {
										button.setSelection([items[i]]);
									}
									break;
								case 'H3':
									if(items[i].getId() == 'Heading3') {
										button.setSelection([items[i]]);
									}
									break;
								case 'H4':
									if(items[i].getId() == 'Heading4') {
										button.setSelection([items[i]]);
									}
									break;
								case 'H5':
									if(items[i].getId() == 'Heading5') {
										button.setSelection([items[i]]);
									}
									break;
								case 'H6':
									if(items[i].getId() == 'Heading6') {
										button.setSelection([items[i]]);
									}
									break;
								case 'P':
									if(items[i].getId() == 'NormalParagraphText') {
										button.setSelection([items[i]]);
									}
									break;
							}
						}

						button.blocked = false;
					}
				}
			}, this);
		},

		updateTypeAdvanced: function(object, e, needUpdatesAdvanced) {
			var types = new Array();
			var node = e;
			while(node && node.tagName != 'P') {
				switch (node.tagName) {
					case 'B':
						types.push('Bold');
						break;
					case 'I':
						types.push('Italic');
						break;
					case 'U':
						types.push('Underline');
						break;
					case 'STRIKE':
						types.push('Strikethrough');
						break;
					case 'SUP':
						types.push('SuperScript');
						break;
					case 'SUB':
						types.push('SubScript');
						break;
				}
				node = node.parentNode;
			}

			for(var k = 0; k < needUpdatesAdvanced.length; ++k) {
				var button = needUpdatesAdvanced[k];
				if(button instanceof eyeos.ui.toolbar.ToggleButton) {
					var parent = button.getLayoutParent();
					if(parent.blocked) {
						parent.blocked = false;
						return;
					} else {
						if(button.blocked) {
							button.blocked = false;
						} else {
							switch (button.getId()) {
								case 'Bold':
								case 'Italic':
								case 'Underline':
								case 'Strikethrough':
								case 'SuperScript':
								case 'SubScript':
									var founded = false;
									for(var i = 0; i < types.length; ++i) {
										if(button.getId() == types[i]) {
											founded = true;
										}
									}

									if(button.getValue() != founded) {
										button.setValue(founded);
										button.blocked = true;

										var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
										tinyMCE.getInstanceById(tinymceId).execCommand(button.getId());

										// workaround: not really nice piece of code, but tinyMCE is a strange creature sometimes...
										if((button.getId() == 'Strikethrough') || (button.getId() == 'SuperScript')  || (button.getId() == 'SubScript')) {
											tinyMCE.getInstanceById(tinymceId).execCommand(button.getId());
										}

									}

									break;
							}
						}
					}
				}
			}
		},

		_findTypes: function(e) {
			var types = new Array();
			var node = e;
			while(node && node.tagName != 'P') {
				switch (node.tagName) {
					case 'B':
						types.push('Bold');
						break;
					case 'I':
						types.push('Italic');
						break;
					case 'U':
						types.push('Underline');
						break;
					case 'STRIKE':
						types.push('Strikethrough');
						break;
					case 'SUP':
						types.push('SuperScript');
						break;
					case 'SUB':
						types.push('SubScript');
						break;
				}
				node = node.parentNode;
			}

			return types;
		},

		areArraysEqual: function(array1, array2) {
			var temp = new Array();
			if ( (!array1[0]) || (!array2[0]) ) { // If either is not an array
				return false;
			}
			if (array1.length != array2.length) {
				return false;
			}
			// Put all the elements from array1 into a "tagged" array
			for (var i=0; i<array1.length; i++) {
				key = (typeof array1[i]) + "~" + array1[i];
				// Use "typeof" so a number 1 isn't equal to a string "1".
				if (temp[key]) {
					temp[key]++;
				} else {
					temp[key] = 1;
				}
			// temp[key] = # of occurrences of the value (so an element could appear multiple times)
			}
			// Go through array2 - if same tag missing in "tagged" array, not equal
			for (var i=0; i<array2.length; i++) {
				key = (typeof array2[i]) + "~" + array2[i];
				if (temp[key]) {
					if (temp[key] == 0) {
						return false;
					} else {
						temp[key]--;
					}
				// Subtract to keep track of # of appearances in array2
				} else { // Key didn't appear in array1, arrays are not equal.
					return false;
				}
			}
			// If we get to this point, then every generated key in array1 showed up the exact same
			// number of times in array2, so the arrays are equal.
			return true;
		},

		updateTypeBasic: function(object, e, needUpdatesBasic) {
			var types = null;
			
			var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
			var bookmark = tinyMCE.getInstanceById(tinymceId).selection.getBookmark();
			
			object.addListenerOnce('nodeRetrieved', function() {
//				tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmark);
			}, this);
			
			if(bookmark.start != bookmark.end) {
				//if we have a selection, we first clone the bookmark in two cloned bookmarks...
				var range = tinyMCE.getInstanceById(tinymceId).selection.getRng();
				var bookmarkStart = new Object();
				var bookmarkEnd = new Object();
				for(var field in bookmark) {
					bookmarkStart[field] = bookmark[field];
					bookmarkEnd[field] = bookmark[field];
				}
				
				bookmarkStart.end = bookmarkStart.start + 1;
				bookmarkStart.start = bookmarkStart.start + 1;
				
//				tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmarkStart);
				var typesStart = this._findTypes(tinyMCE.getInstanceById(tinymceId).selection.getNode());

				bookmarkEnd.start = bookmarkEnd.end - 1;
				bookmarkEnd.end = bookmarkEnd.end - 1;
//				tinyMCE.getInstanceById(tinymceId).selection.moveToBookmark(bookmarkEnd);
				var typesEnd = this._findTypes(tinyMCE.getInstanceById(tinymceId).selection.getNode());

				object.fireEvent('nodeRetrieved');
				if(this.areArraysEqual(typesStart, typesEnd)) {
					types = typesStart;
				} else {
					types = this._findTypes(e);
				}
			} else {
				types = this._findTypes(e);
			}
			
			for(var k = 0; k < needUpdatesBasic.length; ++k) {
				var button = needUpdatesBasic[k];
				if(button instanceof eyeos.ui.toolbar.ToggleButton) {
					var parent = button.getLayoutParent();
					if(parent.blocked) {
						parent.blocked = false;
						return;
					} else {
						switch (button.getId()) {
							case 'Bold':
							case 'Italic':
							case 'Underline':
							case 'Strikethrough':
								var founded = false;
								for(var i = 0; i < types.length; ++i) {
									if(button.getId() == types[i]) {
										founded = true;
									}
								}

								if(button.getValue() != founded) {
									button.setValue(founded);
								}
									
								break;
						}
					}
				}
			}
		}
	}
});
