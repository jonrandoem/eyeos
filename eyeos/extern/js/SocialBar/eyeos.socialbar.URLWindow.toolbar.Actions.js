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
qx.Class.define("eyeos.socialbar.URLWindow.toolbar.Actions", {
	extend: qx.core.Object,
	implement : [eyeos.ui.genericbar.IActions],

	construct: function(window, checknum) {
		arguments.callee.base.call(this);
		this.setWindow(window);
		this.setChecknum(checknum);
	},

	properties: {
		window: {
			init: null,
			check: 'eyeos.ui.Window'
		},

		checknum: {
			init: null
		},

		editorId: {
			init: null
		},

		editorElement: {
			init: null
		}
	},

	members: {
		__clipboard: null,
		mailTO: {
			id: null,
			from: null,
			to: null,
			cc: null,
			bcc: null,
			subject: null,
			htmlText: null,
			plainText: null
		},
		
		updateStatus: function(e, needAManagerBasic, needAManagerAdvanced, needUpdatesBasic, needUpdatesAdvanced) {
			this.updateAligns(e, needAManagerBasic, needAManagerAdvanced);
			this.updateBulletsNumbering(e, needAManagerBasic, needAManagerAdvanced);
			this.updateType(e, needUpdatesBasic, needUpdatesAdvanced, true);
		},

		__resetUpdateType: function(e, needUpdatesBasic, needUpdatesAdvanced, flag) {
			if (flag) {
				needUpdatesBasic.forEach(function (button) {
					switch (button.getLabel()) {
						case 'Bold':
						case 'Italic':
						case 'Underline':
						case 'Strikethrough':
							button.setValue(false);
					}
				}, this);
			}
		},

		__updateType: function(e, needUpdatesBasic, needUpdatesAdvanced, value) {
			needUpdatesBasic.forEach(function (button) {
				if (button.getLabel() == value) {
					button.setValue(true);
				}
			}, this);

			if ((e.parentNode) && (e.parentNode.tagName != 'P') &&
				(e.parentNode.tagName != 'BODY') &&(e.parentNode.tagName != 'HTML')) {
				this.updateType(e.parentNode, needUpdatesBasic, needUpdatesAdvanced, false);
			}
		},

		updateType: function(e, needUpdatesBasic, needUpdatesAdvanced, flag) {
			this.__resetUpdateType(e, needUpdatesBasic, needUpdatesAdvanced, flag);
			switch (e.tagName) {
				case 'B':
					this.__updateType(e, needUpdatesBasic, needUpdatesAdvanced, 'Bold');
					break;
				case 'I':
					this.__updateType(e, needUpdatesBasic, needUpdatesAdvanced, 'Italic');
					break;
				case 'U':
					this.__updateType(e, needUpdatesBasic, needUpdatesAdvanced, 'Underline');
					break;
				case 'STRIKE':
					this.__updateType(e, needUpdatesBasic, needUpdatesAdvanced, 'Strikethrough');
					break;
			}
		},

		__updateNeedAManagerElements: function(needAManagerBasic, needAManagerAdvanced, value, setActive) {
			needAManagerBasic.forEach(function (button) {
				if (button.getLabel() == value) {
					if (setActive) {
						button.manager.setSelection([button]);
					}
					else {
						if (button.manager.getSelection().length > 0) {
							button.manager.getSelection()[0].setValue(false);
						}
					}
				}
			}, this);

			needAManagerAdvanced.forEach(function (button) {
				if (button.getLabel() == value) {
					if (setActive) {
						button.manager.setSelection([button]);
					}
					else {
						if (button.manager.getSelection().length > 0) {
							button.manager.getSelection()[0].setValue(false);
						}
					}
				}
			}, this);
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

		updateAligns: function(e, needAManagerBasic, needAManagerAdvanced) {
			switch (e.getAttribute('align')) {
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
		},
		
		mailSend: function(e) {
			this.mailTO.plainText = tinyMCE.activeEditor.getContent({
				format : 'text'
			});
			this.mailTO.htmlText = tinyMCE.activeEditor.getContent();
			eyeos.callMessage(this.getChecknum(), 'sendMail', this.mailTO, function(results) {
				if (results) {
					this.getWindow().close();
				}
				else {
					alert('your message was not sent. Some problems occurred...');
				}
			}, this);
		},

		mailAttachment: function(e) {
		//			console.log('mailAttachment: ' + e.getTarget().getLabel());
		},

		mailSaveToDrafts: function(e) {
		//			console.log('mailSaveToDrafts: ' + e.getTarget().getLabel());
		},

		editUndo: function(e) {
			tinyMCE.activeEditor.undoManager.undo();
		},

		editRedo: function(e) {
			tinyMCE.activeEditor.undoManager.redo();
		},

		editCopy: function(e) {
			this.__clipboard = tinyMCE.activeEditor.selection.getContent();
		},

		editCut: function(e) {
			this.__clipboard = tinyMCE.activeEditor.selection.getContent();
			tinyMCE.activeEditor.selection.setContent('');
		},

		editPaste: function(e) {
			tinyMCE.activeEditor.selection.setContent(this.__clipboard);
		},

		editSelectAll: function(e) {
			tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.getBody(), true);
		},

		mailPrint: function(e) {
		//			console.log('mailPrint: ' + e.getTarget().getLabel());
		},

		formatAlign: function(e) {
			if (e.getTarget() instanceof eyeos.ui.menu.Button) {
				switch (e.getTarget().getLabel()) {
					case 'Left':
						tinyMCE.activeEditor.execCommand('justifyleft');
						break;
					case 'Right':
						tinyMCE.activeEditor.execCommand('justifyright');
						break;
					case 'Center':
						tinyMCE.activeEditor.execCommand('justifycenter');
						break;
					case 'Justify':
						tinyMCE.activeEditor.execCommand('justifyfull');
						break;
				}
			}
			else {
				tinyMCE.activeEditor.execCommand(e.getTarget().getLabel());
			}
		},

		formatType: function(e) {
			tinyMCE.activeEditor.execCommand(e.getTarget().getLabel());
		},

		insertOrderedList: function(e) {
			tinyMCE.activeEditor.execCommand('InsertOrderedList');
		},

		insertUnorderedList: function(e) {
			tinyMCE.activeEditor.execCommand('InsertUnorderedList');
		},

		setForeColor: function(e) {
			tinyMCE.activeEditor.execCommand('ForeColor', false, e.getTarget().getColor());
		},

		setBackColor: function(e) {
			tinyMCE.activeEditor.execCommand('HiliteColor', false, e.getTarget().getColor());
		},

		formatSize: function(e) {
			if (e.getTarget() instanceof eyeos.ui.menu.Button) {
				tinyMCE.activeEditor.execCommand('FontSize', false, e.getTarget().getLabel());
			}
			else {
				tinyMCE.activeEditor.execCommand('FontSize', false, e.getData()[0].getLabel());
			}
		},

		formatFont: function(e) {
			if (e.getTarget() instanceof eyeos.ui.menu.Button) {
				tinyMCE.activeEditor.execCommand('FontName', false, e.getTarget().getLabel());
			}
			else {
				tinyMCE.activeEditor.execCommand('FontName', false, e.getData()[0].getLabel());
			}
		},

		formatIndentLess: function(e) {
			tinyMCE.activeEditor.execCommand('Outdent');
		},

		formatIndentMore: function(e) {
			tinyMCE.activeEditor.execCommand('Indent');
		},

		insertImage: function(e) {
			var fc = new eyeos.dialogs.FileChooser(this.getChecknum());
			fc.showOpenDialog(this.getWindow(), function(choice, path) {
				if (choice == eyeos.dialogs.FileChooser.APPROVE_OPTION) {
					tinyMCE.activeEditor.execCommand('mceInsertContent', false, '<img src="index.php?checknum='+this.getChecknum()+'&message=getImg&params='+path+'">');
				}
			}, this);
		},

		insertLink: function(e) {
			var popup = new qx.ui.popup.Popup();
			popup.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 5, 5, 5, 5)
				);
			popup.setPadding(5);
			popup.setLayout(new qx.ui.layout.VBox());

			var linkBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			linkBox.getLayout().setSpacing(5);
			linkBox.getLayout().setAlignX('center');
			linkBox.getLayout().setAlignY('middle');
			popup.add(linkBox);

			var label = new qx.ui.basic.Label('Link:');
			linkBox.add(label);

			var link = new qx.ui.form.TextField('http://');
			linkBox.add(link);

			popup.placeToWidget(e.getTarget());
			popup.show();

			popup.addListener('disappear', function(e) {
				tinyMCE.activeEditor.execCommand('CreateLink', false, link.getValue());
			}, this);
		},

		formatPlainAdvancedText: function(e) {
			var content = null;
			if (!tinyMCE.get(this.getEditorId())) {
				content = this.getEditorElement().getChildren()[0].getValue();
				this.getEditorElement().removeAll();
				tinyMCE.execCommand('mceAddControl', false, this.getEditorId());
				tinyMCE.activeEditor.setContent(content);
			}
			else {
				content = tinyMCE.activeEditor.selection.getContent();
				tinyMCE.execCommand('mceRemoveControl', false, this.getEditorId());
				var editorPlainText = new qx.ui.form.TextArea();
				editorPlainText.setValue(content);
				this.getEditorElement().add(editorPlainText, {
					flex: 1
				});
			}
		}
	}
});
