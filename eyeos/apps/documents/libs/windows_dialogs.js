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

qx.Class.define('eyeos.application.documents.WindowsAndDialogs', {
	extend: qx.core.Object,
	
	statics: {
		fileDocumentInfosWindow: function(object) {
			// creating the main window....
			var window = new qx.ui.window.Window('Document Informations').set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 400,
				width: 526,
				allowMaximize: false,
				allowMinimize: false
			});

			// placing the window at the center of the screen...
			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			// creating the main infos container...
			var infosContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 240,
				width: 525
			});
			window.add(infosContainer);

			// creating the infos groupBox...
			var infosGroupBox = new qx.ui.groupbox.GroupBox().set({
				layout: new qx.ui.layout.VBox(),
				margin: 15,
				height: 300,
				width: 490
			});
			infosContainer.add(infosGroupBox);

			var data = null;
			if(object.__currentDoc.path) {
				eyeos.callMessage(object.getApplication().getChecknum(), 'getFileInfo', object.__currentDoc.path, function(datas) {
					data = [['Owner', datas.owner], ['Created', datas.created],
							['Modified', datas.modified], ['Size', datas.size],
							['Status', datas.shared == '0' ? tr('not shared') : tr('shared')]];
					object.fireEvent('datasRetrieved');
				}, object);
			} else {
				data = [['Owner', 'empty'], ['Created', 'empty'],
						['Modified', 'empty'], ['Size', 'empty'],
						['Status', 'empty']];
				object.fireEvent('datasRetrieved');
			}

			// creating the Keys container...
 			var keysContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 220,
				width: 245
			});

			// and the Values container...
			var valuesContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 220,
				width: 245
			});

			// creating the Datas container, wich container keys and values...
			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
			infosGroupBox.add(datasContainer);
			
			datasContainer.add(keysContainer);
			datasContainer.add(valuesContainer);
			
			// creating the statistics Button, which link to the statistics window...
			var statisticsContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				height: 80,
				width: 490
			});
			infosGroupBox.add(statisticsContainer);

//			var statisticsButton = new qx.ui.form.Button().set({
//				label: 'Statistics',
//				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
//				height: 30,
//				width: 95
//			});
//			statisticsContainer.add(statisticsButton, {top: 25, bottom: 25, left: 25, right: 370});
//
//			statisticsButton.addListener('click', function() {
//				eyeos.application.documents.Tools.toolsStatistics(object);
//			});

			// creating the bottom container, with the controls buttons...
			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 526
			});
			window.add(bottomContainer);

			// controls buttons: doneButton...
			var doneButton = new qx.ui.form.Button().set({
				label: 'Done',
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 30,
				width: 190
			});
			bottomContainer.add(doneButton,  {top: 8, bottom: 8, left: 315, right: 15});
			
			doneButton.addListener('click', function() {
				window.close();
			});

			window.open();

			object.addListener('datasRetrieved', function() {
				for (var i = 0; i < data.length; ++i) {
					var keyLabel = new qx.ui.basic.Label(data[i][0] + ': ');
					keyLabel.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
					keyLabel.setMarginLeft(25);
					keyLabel.setMarginTop(10);
					keyLabel.setMarginBottom(10);
					keyLabel.setAlignX('left');
					keyLabel.setAlignY('middle');
					keysContainer.add(keyLabel);

					var valueLabel = new qx.ui.basic.Label(data[i][1]);
					valueLabel.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
					valueLabel.setMarginLeft(25);
					valueLabel.setMarginTop(10);
					valueLabel.setMarginBottom(10);
					valueLabel.setAlignX('center');
					valueLabel.setAlignY('middle');
					valuesContainer.add(valueLabel);
				}
			}, object);
		},

		toolsStatisticsWindow: function(object) {
			// creating the main window....
			var window = new qx.ui.window.Window('Statistics').set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 400,
				width: 526,
				allowMaximize: false,
				allowMinimize: false
			});

			// placing the window at the center of the screen...
			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);
			
			// creating the main infos container...
			var infosContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 340,
				width: 525
			});
			window.add(infosContainer);

			// creating the infos groupBox...
			var infosGroupBox = new qx.ui.groupbox.GroupBox().set({
				layout: new qx.ui.layout.VBox(),
				margin: 15,
				height: 300,
				width: 490
			});
			infosContainer.add(infosGroupBox);

			// to be fixed with real datas!!!
			var datas = [['Pages', 'asd', 'dsa'], ['Words', 'asd', 'dsa'],
			['Characters (no spaces)', 'asd', 'dsa'], ['Characters (with spaces)', 'asd', 'dsa'],
			['Paragraphs', 'asd', 'dsa'], ['Lines', 'asd', 'dsa'],
			['Average sentences per paragraph', 'asd', 'dsa'], ['Average words per sentence', 'asd', 'dsa'],
			['Average characters per word', 'asd', 'dsa'], ['Average words per page', 'asd', 'dsa']];

			// creating the Keys container...
 			var keysContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 220,
				width: 245
			});

			// and the Values Selection container...
			var valuesSelectionContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 220,
				width: 100
			});

			var valuesSelectionHeader = new qx.ui.basic.Label('Selection').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				alignX: 'center',
				alignY: 'middle',
				marginTop: 10,
				marginBottom: 10
			});
			valuesSelectionContainer.add(valuesSelectionHeader);

			var valuesDocumentContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 220,
				width: 100
			});

			var valuesDocumentHeader = new qx.ui.basic.Label('Document').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				alignX: 'center',
				alignY: 'middle',
				marginTop: 10,
				marginBottom: 10
			});
			valuesDocumentContainer.add(valuesDocumentHeader);
			
			for (var i = 0; i < datas.length; ++i) {
				var keyLabel = new qx.ui.basic.Label(datas[i][0] + ': ').set({
					font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
					marginLeft: 25,
					marginTop: 10,
					marginBottom: 10,
					alignX: 'left',
					alignY: 'middle'
				});
				keysContainer.add(keyLabel);

				var valueSelectionLabel = new qx.ui.basic.Label(datas[i][1]).set({
					font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
					marginTop: 10,
					marginBottom: 10,
					alignX: 'center',
					alignY: 'middle'
				});
				valuesSelectionContainer.add(valueSelectionLabel);

				var valueDocumentLabel = new qx.ui.basic.Label(datas[i][2]).set({
					font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
					marginTop: 10,
					marginBottom: 10,
					alignX: 'center',
					alignY: 'middle'
				});
				valuesDocumentContainer.add(valueDocumentLabel);
			}
			
			// creating the Datas container, wich container keys and values...
			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
			infosGroupBox.add(datasContainer);

			datasContainer.add(keysContainer);
			datasContainer.add(valuesSelectionContainer);
			datasContainer.add(valuesDocumentContainer);

			// creating the bottom container, with the controls buttons...
			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 526
			});
			window.add(bottomContainer);

			// controls buttons: doneButton...
			var doneButton = new qx.ui.form.Button().set({
				label: 'Done',
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 30,
				width: 190
			});
			bottomContainer.add(doneButton,  {top: 8, bottom: 8, left: 315, right: 15});

			doneButton.addListener('click', function() {
				window.close();
			});

			window.open();
		},

		tableInsertWindow: function(object) {
			// creating the main window....
			var window = new qx.ui.window.Window(tr('Insert Table')).set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 400,
				width: 526,
				allowMaximize: false,
				allowMinimize: false
			});

			// placing the window at the center of the screen...
			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			// creating the main infos container...
			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				height: 355,
				width: 526
			});
			window.add(datasContainer);

			// creating the size groupBox...
			var sizeGroupBox = new qx.ui.groupbox.GroupBox(tr('Size')).set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 60,
				margin: 10
			});
			datasContainer.add(sizeGroupBox);

			var rowsSpinner = new eyeos.ui.form.Spinner('Rows', 'Rows').set({
				marginRight: 30,
				minimum: 2
			});
			sizeGroupBox.add(rowsSpinner);

			var columnsSpinner = new eyeos.ui.form.Spinner('Columns', 'Columns').set({
				minimum: 2
			});
			sizeGroupBox.add(columnsSpinner);

			// creating the width groupBox...
			var widthGroupBox = new qx.ui.groupbox.GroupBox(tr('Width')).set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 60,
				margin: 10
			});
			datasContainer.add(widthGroupBox);

			var customRadioButton = new qx.ui.form.RadioButton();
			widthGroupBox.add(customRadioButton);

			var customWidthSpinner = new eyeos.ui.form.Spinner('', '').set({
				marginRight: 8,
				value: 10
			});
			widthGroupBox.add(customWidthSpinner);

			var customSelectBox = new eyeos.ui.form.SelectBox([{name: 'px', id: 'px'}, {name: '%', id: 'px'}]).set({
				marginRight: 8
			});
			widthGroupBox.add(customSelectBox);

			var toWidthRadioButton = new qx.ui.form.RadioButton(tr('Adjust to page width'));
			widthGroupBox.add(toWidthRadioButton);

			var widthGroupManager = new qx.ui.form.RadioGroup(customRadioButton, toWidthRadioButton);
			widthGroupManager.addListener('changeSelection', function() {
				customWidthSpinner.toggleEnabled();
				customSelectBox.toggleEnabled();
			}, object);

			var layoutGroupBox = new qx.ui.groupbox.GroupBox(tr('layout')).set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 60,
				margin: 10
			});
			datasContainer.add(layoutGroupBox);

			var paddingSpinner = new eyeos.ui.form.Spinner('Padding', 'Padding').set({
				marginRight: 30
			});
			layoutGroupBox.add(paddingSpinner);

			var spacingSpinner = new eyeos.ui.form.Spinner('Spacing', 'Spacing');
			layoutGroupBox.add(spacingSpinner);

			var borderGroupBox = new qx.ui.groupbox.GroupBox(tr('Border')).set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 60,
				margin: 10
			});
			datasContainer.add(borderGroupBox);

			var sizeSpinner = new eyeos.ui.form.Spinner('Size', 'Size').set({
				marginRight: 30
			});
			borderGroupBox.add(sizeSpinner);

			var borderColorLabel = new qx.ui.basic.Label(tr('Color')).set({
				marginRight: 8
			});
			borderGroupBox.add(borderColorLabel);

			var borderColorButton = new eyeos.ui.form.ColorButton().set({
				color: 'black'
			});
			borderGroupBox.add(borderColorButton);

			var backgroundGroupBox = new qx.ui.groupbox.GroupBox(tr('Background')).set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 60,
				margin: 10
			});
			datasContainer.add(backgroundGroupBox);

			var backgroundColorLabel = new qx.ui.basic.Label(tr('Color')).set({
				marginRight: 8
			});
			backgroundGroupBox.add(backgroundColorLabel);

			var backgroundColorButton = new eyeos.ui.form.ColorButton().set({
				color: 'white'
			});
			backgroundGroupBox.add(backgroundColorButton);

			var dafaultsContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
			datasContainer.add(dafaultsContainer);

			var makeDefault = new qx.ui.form.CheckBox(tr('Make default')).set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				margin: 10
			});
			dafaultsContainer.add(makeDefault);

			var restoreDefault = new qx.ui.basic.Label(tr('Restore default')).set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				margin: 10,
				cursor: 'pointer',
				marginLeft: 50
			});
			dafaultsContainer.add(restoreDefault);

			restoreDefault.addListener('mouseover', function() {
				restoreDefault.setDecorator(new qx.ui.decoration.Single().set({
					styleBottom: 'solid',
					widthBottom: 1,
					colorBottom: '#808080'
				}));
			});

			restoreDefault.addListener('mouseout', function() {
				restoreDefault.setDecorator(new qx.ui.decoration.Single().set({
					styleBottom: 'solid',
					widthBottom: 1,
					colorBottom: null
				}));
			});

			restoreDefault.addListener('click', function() {
				var optionPane = new eyeos.dialogs.OptionPane(
					"<b>"+tr("Are you sure you want to restore all the default settings?")+"</b>",
					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
					eyeos.dialogs.OptionPane.YES_NO_CANCEL_OPTION);
				var dialog = optionPane.createDialog(object.getApplication().getWindow(), "Documents", function(result) {
					if (result == 1) {
						var datasObj = {
							cols: '2',
							rows: '2',
							border: '1',
							bordercolor: 'black',
							bgcolor: 'white',
							cellpadding: '2',
							cellspacing: '2',
							width: '10',
							width_type: 'px'
						};

						var params = {
							setting_file: 'tableInsert',
							datas: qx.util.Json.stringify(datasObj)
						};

						eyeos.callMessage(object.getApplication().getChecknum(), 'writeDefaultSettings', params, function() {
						}, object);

						columnsSpinner.setValue(2);
						rowsSpinner.setValue(2);
						sizeSpinner.setValue(1);
						borderColorButton.setColor('black');
						backgroundColorButton.setColor('white');
						paddingSpinner.setValue(2);
						spacingSpinner.setValue(2);
						customWidthSpinner.setValue(10);
						widthGroupManager.setSelection([customRadioButton]);
						customSelectBox.setSelection([customSelectBox.getChildren()[0]]);
					}
				}, object);
				dialog.open();
			}, object);

			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 526
			});
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button(tr('Cancel')).set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 190,
				height: 30
			});

			cancelButton.addListener('click', function() {
				window.close();
			});

			bottomContainer.add(cancelButton,  {top: 8, bottom: 8, left: 115});

			var acceptButton = new qx.ui.form.Button(tr('Accept')).set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 190,
				height: 30
			});

			bottomContainer.add(acceptButton,  {top: 8, bottom: 8, left: 315, right: 15});

			acceptButton.addListener('click', function() {
				var insertTableObj = new Object();
				insertTableObj.elements = new Array();
				insertTableObj.elements['cols'] = {value: columnsSpinner.getValue().toString()};
				insertTableObj.elements['rows'] = {value: rowsSpinner.getValue().toString()};
				insertTableObj.elements['border'] = {value: sizeSpinner.getValue().toString()};
				insertTableObj.elements['id'] = {value: 'table'};
				insertTableObj.elements['style'] = {value: ''};
				insertTableObj.elements['bordercolor'] = {value: borderColorButton.getColor()};
				insertTableObj.elements['bgcolor'] = {value: backgroundColorButton.getColor()};
				insertTableObj.elements['cellpadding'] = {value: paddingSpinner.getValue().toString()};
				insertTableObj.elements['cellspacing'] = {value: spacingSpinner.getValue().toString()};
				insertTableObj.elements['height'] = {value: '5'};

				if (customWidthSpinner.getEnabled()) {
					if (customSelectBox.getSelection()[0].getLabel() == 'px') {
						insertTableObj.elements['width'] = {value: customWidthSpinner.getValue().toString()  + 'px'};
					}
					else {
						insertTableObj.elements['width'] = {value: customWidthSpinner.getValue().toString() + '%'};
					}
				}
				else {
					var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
					var iframe = document.getElementById(ed.id + '_ifr');
					insertTableObj.elements['width'] = {value: iframe.contentDocument.body.offsetWidth.toString()};
				}

				insertTable(insertTableObj, object.getApplication().getPid(), 'insert');
				window.close();

				if(makeDefault.isValue()) {
					var datasObj = {cols: columnsSpinner.getValue().toString(),
									rows: rowsSpinner.getValue().toString(),
									border: sizeSpinner.getValue().toString(),
									bordercolor: borderColorButton.getColor(),
									bgcolor: backgroundColorButton.getColor(),
									cellpadding: paddingSpinner.getValue().toString(),
									cellspacing: spacingSpinner.getValue().toString(),
									width: customRadioButton.isValue() ? customWidthSpinner.getValue() : 'full',
									width_type: customSelectBox.getSelection()[0].getLabel()
								};
					var params = {setting_file: 'tableInsert', datas: qx.util.Json.stringify(datasObj)};
					eyeos.callMessage(object.getApplication().getChecknum(), 'writeDefaultSettings', params, function() {
					}, object);
				}
			}, object);

			window.addListener('appear', function() {
				eyeos.callMessage(object.getApplication().getChecknum(), 'readDefaultSettings', 'tableInsert', function(datas) {
					if(datas) {
						datas = qx.util.Json.parse(datas);

						columnsSpinner.setValue(parseInt(datas.cols));
						rowsSpinner.setValue(parseInt(datas.rows));
						sizeSpinner.setValue(parseInt(datas.border));
						borderColorButton.setColor(datas.bordercolor);
						backgroundColorButton.setColor(datas.bgcolor);
						paddingSpinner.setValue(parseInt(datas.cellpadding));
						spacingSpinner.setValue(parseInt(datas.cellspacing));

						if(datas.width != 'full') {
							customWidthSpinner.setValue(parseInt(datas.width));
							widthGroupManager.setSelection([customRadioButton]);

							if(datas.width_type == 'px') {
								customSelectBox.setSelection([customSelectBox.getChildren()[0]]);
							} else {
								customSelectBox.setSelection([customSelectBox.getChildren()[1]]);
							}
						} else {
							widthGroupManager.setSelection([toWidthRadioButton]);
						}
					}
				}, object);
			}, object);

			window.open();
		},

		tableSplitCellWindow: function(object) {
			// creating the main window....
			var window = new qx.ui.window.Window('Split Cell').set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 155,
				width: 400,
				allowMaximize: false,
				allowMinimize: false
			});

			// placing the window at the center of the screen...
			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			// creating the main infos container...
			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 110,
				width: 400
			});
			window.add(datasContainer);

			var label = new qx.ui.basic.Label('Split In:');
			datasContainer.add(label, {top: 10, left: 10});

			var rowsRadioButton = new qx.ui.form.RadioButton('Rows');
			datasContainer.add(rowsRadioButton, {top: 30, left: 10});

			var columnsRadioButton = new qx.ui.form.RadioButton('Columns');
			datasContainer.add(columnsRadioButton, {top: 50, left: 10});

			var radioButtonManager = new qx.ui.form.RadioGroup(rowsRadioButton, columnsRadioButton);

			var quantityGroupBox = new qx.ui.groupbox.GroupBox().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 42,
				width: 120,
				margin: 10
			});
			datasContainer.add(quantityGroupBox, {top: 10, left: 80});

			var quantitySpinner = new eyeos.ui.form.Spinner('Quantity', 'Quantity').set({
				minimum: 2
			});
			quantityGroupBox.add(quantitySpinner);

			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 400
			});
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button('Cancel').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 190,
				height: 30
			});
			bottomContainer.add(cancelButton,  {top: 8, bottom: 8, left: 115});

			cancelButton.addListener('click', function() {
				window.close();
			});

			var acceptButton = new qx.ui.form.Button('Accept').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 190,
				height: 30
			});

			acceptButton.addListener('click', function() {
				if(radioButtonManager.getSelection()[0].getLabel() == 'Rows') {
					window.fireDataEvent('done', {type: 'rows', value: parseInt(quantitySpinner.getValue())});
				} else {
					window.fireDataEvent('done', {type: 'cols', value: parseInt(quantitySpinner.getValue())});
				}
				
				window.close();
			});

			bottomContainer.add(acceptButton,  {top: 8, bottom: 8, left: 315, right: 15});
			window.open();
			return window;
		},

		tableInsertRowsOrColumnsWindow: function(object) {
			var window = new qx.ui.window.Window('Insert Rows or Columns').set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 155,
				width: 400,
				allowMaximize: false,
				allowMinimize: false
			});

			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 110,
				width: 400
			});
			window.add(datasContainer);

			var insertLabel = new qx.ui.basic.Label('Insert:');
			datasContainer.add(insertLabel, {top: 10, left: 10});

			var rowsRadioButton = new qx.ui.form.RadioButton('Rows');
			datasContainer.add(rowsRadioButton, {top: 30, left: 10});

			var columnsRadioButton = new qx.ui.form.RadioButton('Columns');
			datasContainer.add(columnsRadioButton, {top: 50,left: 10});

			var positionLabel = new qx.ui.basic.Label('Position:');
			datasContainer.add(positionLabel, {top: 80, left: 10});

			var aboveBeforeRadioButton = new qx.ui.form.RadioButton('Above Selection');
			datasContainer.add(aboveBeforeRadioButton, {top: 100, left: 10});

			var belowAfterRadioButton = new qx.ui.form.RadioButton('Below Selection');
			belowAfterRadioButton.setMarginBottom(10);
			datasContainer.add(belowAfterRadioButton, {top: 120, left: 10});

			var positionManager = new qx.ui.form.RadioGroup(aboveBeforeRadioButton, belowAfterRadioButton);

			var rowsColsManager = new qx.ui.form.RadioGroup(rowsRadioButton, columnsRadioButton);
			rowsColsManager.addListener('changeSelection', function(e) {
				if (aboveBeforeRadioButton.getLabel() == 'Above Selection') {
					aboveBeforeRadioButton.setLabel('Before Selection');
					belowAfterRadioButton.setLabel('After Selection');
				}
				else {
					aboveBeforeRadioButton.setLabel('Above Selection');
					belowAfterRadioButton.setLabel('Below Selection');
				}
			}, object);

			var quantityGroupBox = new qx.ui.groupbox.GroupBox().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'left',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 42,
				width: 120,
				margin: 10
			});
			datasContainer.add(quantityGroupBox, {top: 10, left: 80});

			var quantitySpinner = new eyeos.ui.form.Spinner('Quantity', 'Quantity').set({
				minimum: 1
			});
			quantityGroupBox.add(quantitySpinner);

			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 400
			});
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button('Cancel').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 190,
				height: 30
			});
			bottomContainer.add(cancelButton,  {top: 8, bottom: 8, left: 115});

			cancelButton.addListener('click', function() {
				window.close();
			});

			var acceptButton = new qx.ui.form.Button('Accept').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 190,
				height: 30
			});
			bottomContainer.add(acceptButton,  {top: 8, bottom: 8, left: 315, right: 15});

			acceptButton.addListener('click', function() {
				var i;
				if (rowsColsManager.getSelection()[0].getLabel() == 'Rows') {
					if (positionManager.getSelection()[0].getLabel() == 'Above Selection') {
						for (i = 0; i < quantitySpinner.getValue(); ++i) {
							object.tableInsertRowAbove();
						}
					}
					else {
						for (i = 0; i < quantitySpinner.getValue(); ++i) {
							object.tableInsertRowBelow();
						}
					}
				}
				else {
					if (positionManager.getSelection()[0].getLabel() == 'Before Selection') {
						for (i = 0; i < quantitySpinner.getValue(); ++i) {
							object.tableInsertColumnLeft();
						}
					}
					else{
						for (i = 0; i < quantitySpinner.getValue(); ++i) {
							object.tableInsertColumnRight();
						}
					}
				}
				window.close();
			}, object);

			window.open();
		},

		tableContentAlignmentWindow: function(object) {
			var window = new qx.ui.window.Window('Content Alignment').set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 300,
				width: 300,
				allowMaximize: false,
				allowMinimize: false
			});

			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 255,
				width: 300
			});
			window.add(datasContainer);

			var horizontalLabel = new qx.ui.basic.Label('Horizontal').set({
				margin: 10
			});
			datasContainer.add(horizontalLabel);

			var horizontalBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'center',
					alignY: 'middle'
				}),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial'])
			});
			datasContainer.add(horizontalBox);

			var leftButton = new qx.ui.toolbar.RadioButton('left', 'index.php?extern=images/documents/Content-align-1.png').set({
				show: 'icon',
				margin: 10
			});
			horizontalBox.add(leftButton);

			leftButton.getChildControl('icon').setWidth(73);
			leftButton.getChildControl('icon').setHeight(73);
			leftButton.getChildControl('icon').setAllowGrowX(false);
			leftButton.getChildControl('icon').setAllowGrowY(false);

			var centerButton = new qx.ui.toolbar.RadioButton('center', 'index.php?extern=images/documents/Content-align-2.png').set({
				show: 'icon',
				margin: 10
			});
			horizontalBox.add(centerButton);

			centerButton.getChildControl('icon').setWidth(73);
			centerButton.getChildControl('icon').setHeight(73);
			centerButton.getChildControl('icon').setAllowGrowX(false);
			centerButton.getChildControl('icon').setAllowGrowY(false);

			var rightButton = new qx.ui.toolbar.RadioButton('right', 'index.php?extern=images/documents/Content-align-3.png').set({
				show: 'icon',
				margin: 10
			});
			horizontalBox.add(rightButton);

			rightButton.getChildControl('icon').setWidth(73);
			rightButton.getChildControl('icon').setHeight(73);
			rightButton.getChildControl('icon').setAllowGrowX(false);
			rightButton.getChildControl('icon').setAllowGrowY(false);

			var horizontalGroup = new qx.ui.form.RadioGroup(leftButton, centerButton, rightButton).set({
				allowEmptySelection: false
			});

			datasContainer.add(new qx.ui.menu.Separator());

			var verticalLabel = new qx.ui.basic.Label('Vertical').set({
				margin: 10
			});
			datasContainer.add(verticalLabel);

			var verticalBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox(),
				alignX: 'center',
				alignY: 'middle',
				font: new qx.bom.Font('12', ['Helvetica', 'Arial'])
			});
			datasContainer.add(verticalBox);

			var topButton = new qx.ui.toolbar.RadioButton('top', 'index.php?extern=images/documents/Content-align-4.png').set({
				show: 'icon',
				margin: 10
			});
			verticalBox.add(topButton);

			topButton.getChildControl('icon').setWidth(73);
			topButton.getChildControl('icon').setHeight(73);
			topButton.getChildControl('icon').setAllowGrowX(false);
			topButton.getChildControl('icon').setAllowGrowY(false);

			var middleButton = new qx.ui.toolbar.RadioButton('middle', 'index.php?extern=images/documents/Content-align-5.png').set({
				show: 'icon',
				margin: 10
			});
			verticalBox.add(middleButton);

			middleButton.getChildControl('icon').setWidth(73);
			middleButton.getChildControl('icon').setHeight(73);
			middleButton.getChildControl('icon').setAllowGrowX(false);
			middleButton.getChildControl('icon').setAllowGrowY(false);		

			var bottomButton = new qx.ui.toolbar.RadioButton('bottom', 'index.php?extern=images/documents/Content-align-6.png').set({
				show: 'icon',
				margin: 10
			});
			verticalBox.add(bottomButton);

			bottomButton.getChildControl('icon').setWidth(73);
			bottomButton.getChildControl('icon').setHeight(73);
			bottomButton.getChildControl('icon').setAllowGrowX(false);
			bottomButton.getChildControl('icon').setAllowGrowY(false);

			var verticalGroup = new qx.ui.form.RadioGroup(topButton, middleButton, bottomButton).set({
				allowEmptySelection: false
			});

			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 300
			});
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button('Cancel').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 60,
				height: 30
			});
			bottomContainer.add(cancelButton,  {top: 8, bottom: 8, left: 115});

			cancelButton.addListener('click', function() {
				window.close();
			});
			
			var acceptButton = new qx.ui.form.Button('Accept').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 60,
				height: 30
			});
			bottomContainer.add(acceptButton,  {top: 8, bottom: 8, right: 15});

			acceptButton.addListener('click', function() {
				var tinymceId = 'tinymce_editor' + object.getApplication().getPid();
				var element = tinyMCE.getInstanceById(tinymceId).selection;
				if (element.getNode() instanceof HTMLTableCellElement) {
					var parent = element.getNode().parentNode;
					while (parent.tagName != 'TBODY') {
						parent = parent.parentNode;
					}

					// could it be just for selected item? Ask to the oracle tinyMCE....
					for (var i = 0; i < parent.childNodes.length; ++i) {
						var tr = parent.childNodes[i];
						for (var j = 0; j < tr.childNodes.length; ++j) {
							tr.childNodes[j].setAttribute('align', horizontalGroup.getSelection()[0].getLabel());
							tr.childNodes[j].setAttribute('valign', verticalGroup.getSelection()[0].getLabel());
						}
					}
				}
				window.close();
			}, object);

			window.open();
		},

		formatBulletsAndNumberingWindow: function(object, e) {
			var window = new qx.ui.window.Window('Bullets and Numbering').set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 0,
				height: 400,
				width: 500,
				allowMaximize: false,
				allowMinimize: false
			});

			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			var datasContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				height: 355,
				width: 400
			});
			window.add(datasContainer);

			var tabs = new qx.ui.tabview.TabView().set({
				margin: 5
			});
			datasContainer.add(tabs);

			var bulletsTab = new qx.ui.tabview.Page("Bullets").set({
				layout: new qx.ui.layout.Grid(),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial'])
			});
			tabs.add(bulletsTab);

			var bulletsNoneButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/none.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsNoneButton, {row: 0, column: 0});

			bulletsNoneButton.setUserData('type', 'none');
			bulletsNoneButton.getChildControl('icon').setWidth(73);
			bulletsNoneButton.getChildControl('icon').setHeight(73);
			bulletsNoneButton.getChildControl('icon').setAllowGrowX(false);
			bulletsNoneButton.getChildControl('icon').setAllowGrowY(false);

			var bulletsCircleFillButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Bullets-1.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsCircleFillButton, {row: 0, column: 1});

			bulletsCircleFillButton.setUserData('type', 'circle-fill');
			bulletsCircleFillButton.getChildControl('icon').setWidth(73);
			bulletsCircleFillButton.getChildControl('icon').setHeight(73);
			bulletsCircleFillButton.getChildControl('icon').setAllowGrowX(false);
			bulletsCircleFillButton.getChildControl('icon').setAllowGrowY(false);			

			var bulletsCircleEmptyButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Bullets-2.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsCircleEmptyButton, {row: 0, column: 2});

			bulletsCircleEmptyButton.setUserData('type', 'circle-empty');
			bulletsCircleEmptyButton.getChildControl('icon').setWidth(73);
			bulletsCircleEmptyButton.getChildControl('icon').setHeight(73);
			bulletsCircleEmptyButton.getChildControl('icon').setAllowGrowX(false);
			bulletsCircleEmptyButton.getChildControl('icon').setAllowGrowY(false);	

			var bulletsSquareFillButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Bullets-3.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsSquareFillButton, {row: 1, column: 1});

			bulletsSquareFillButton.setUserData('type', 'square-fill');
			bulletsSquareFillButton.getChildControl('icon').setWidth(73);
			bulletsSquareFillButton.getChildControl('icon').setHeight(73);
			bulletsSquareFillButton.getChildControl('icon').setAllowGrowX(false);
			bulletsSquareFillButton.getChildControl('icon').setAllowGrowY(false);

			var bulletsSquareEmptyButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Bullets-4.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsSquareEmptyButton, {row: 1, column: 2});

			bulletsSquareEmptyButton.setUserData('type', 'square-empty');
			bulletsSquareEmptyButton.getChildControl('icon').setWidth(73);
			bulletsSquareEmptyButton.getChildControl('icon').setHeight(73);
			bulletsSquareEmptyButton.getChildControl('icon').setAllowGrowX(false);
			bulletsSquareEmptyButton.getChildControl('icon').setAllowGrowY(false);

			var bulletsDiamantFillButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Bullets-5.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsDiamantFillButton, {row: 2, column: 1});

			bulletsDiamantFillButton.setUserData('type', 'diamant-fill');
			bulletsDiamantFillButton.getChildControl('icon').setWidth(73);
			bulletsDiamantFillButton.getChildControl('icon').setHeight(73);
			bulletsDiamantFillButton.getChildControl('icon').setAllowGrowX(false);
			bulletsDiamantFillButton.getChildControl('icon').setAllowGrowY(false);

			var bulletsDiamantEmptyButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Bullets-6.png').set({
				show: 'icon',
				margin: 10
			});
			bulletsTab.add(bulletsDiamantEmptyButton, {row: 2, column: 2});

			bulletsDiamantEmptyButton.setUserData('type', 'diamant-empty');
			bulletsDiamantEmptyButton.getChildControl('icon').setWidth(73);
			bulletsDiamantEmptyButton.getChildControl('icon').setHeight(73);
			bulletsDiamantEmptyButton.getChildControl('icon').setAllowGrowX(false);
			bulletsDiamantEmptyButton.getChildControl('icon').setAllowGrowY(false);

			var bulletsGroup = new qx.ui.form.RadioGroup(bulletsNoneButton, bulletsCircleFillButton, bulletsCircleEmptyButton,
				bulletsSquareFillButton, bulletsSquareEmptyButton, bulletsDiamantFillButton, bulletsDiamantEmptyButton);
			bulletsGroup.setAllowEmptySelection(false);

			var numberingTab = new qx.ui.tabview.Page("Numbering").set({
				layout: new qx.ui.layout.Grid(),
				font: new qx.bom.Font('12', ['Helvetica', 'Arial'])
			});
			tabs.add(numberingTab);

			var mumberingNoneButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/none.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(mumberingNoneButton, {row: 0, column: 0});

			mumberingNoneButton.getChildControl('icon').setWidth(73);
			mumberingNoneButton.getChildControl('icon').setHeight(73);
			mumberingNoneButton.getChildControl('icon').setAllowGrowX(false);
			mumberingNoneButton.getChildControl('icon').setAllowGrowY(false);

			var numbering123DotsButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-1.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numbering123DotsButton, {row: 0, column: 1});

			numbering123DotsButton.getChildControl('icon').setWidth(73);
			numbering123DotsButton.getChildControl('icon').setHeight(73);
			numbering123DotsButton.getChildControl('icon').setAllowGrowX(false);
			numbering123DotsButton.getChildControl('icon').setAllowGrowY(false);

			var numbering123ClassicButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-2.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numbering123ClassicButton, {row: 1, column: 1});

			numbering123ClassicButton.getChildControl('icon').setWidth(73);
			numbering123ClassicButton.getChildControl('icon').setHeight(73);
			numbering123ClassicButton.getChildControl('icon').setAllowGrowX(false);
			numbering123ClassicButton.getChildControl('icon').setAllowGrowY(false);

			var numberingABCDotsButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-3.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingABCDotsButton, {row: 0, column: 2});

			numberingABCDotsButton.getChildControl('icon').setWidth(73);
			numberingABCDotsButton.getChildControl('icon').setHeight(73);
			numberingABCDotsButton.getChildControl('icon').setAllowGrowX(false);
			numberingABCDotsButton.getChildControl('icon').setAllowGrowY(false);

			var numberingABCClassicButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-4.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingABCClassicButton, {row: 1, column: 2});

			numberingABCClassicButton.getChildControl('icon').setWidth(73);
			numberingABCClassicButton.getChildControl('icon').setHeight(73);
			numberingABCClassicButton.getChildControl('icon').setAllowGrowX(false);
			numberingABCClassicButton.getChildControl('icon').setAllowGrowY(false);

			var numberingAbcDotsButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-5.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingAbcDotsButton, {row: 0, column: 3});

			numberingAbcDotsButton.getChildControl('icon').setWidth(73);
			numberingAbcDotsButton.getChildControl('icon').setHeight(73);
			numberingAbcDotsButton.getChildControl('icon').setAllowGrowX(false);
			numberingAbcDotsButton.getChildControl('icon').setAllowGrowY(false);

			var numberingAbcClassicButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-6.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingAbcClassicButton, {row: 1, column: 3});
			
			numberingAbcClassicButton.getChildControl('icon').setWidth(73);
			numberingAbcClassicButton.getChildControl('icon').setHeight(73);
			numberingAbcClassicButton.getChildControl('icon').setAllowGrowX(false);
			numberingAbcClassicButton.getChildControl('icon').setAllowGrowY(false);

			var numberingRomanUpcaseDotsButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-7.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingRomanUpcaseDotsButton, {row: 2, column: 1});

			numberingRomanUpcaseDotsButton.getChildControl('icon').setWidth(73);
			numberingRomanUpcaseDotsButton.getChildControl('icon').setHeight(73);
			numberingRomanUpcaseDotsButton.getChildControl('icon').setAllowGrowX(false);
			numberingRomanUpcaseDotsButton.getChildControl('icon').setAllowGrowY(false);

			var numberingRomanUpcaseClassicButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-8.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingRomanUpcaseClassicButton, {row: 3, column: 1});

			numberingRomanUpcaseClassicButton.getChildControl('icon').setWidth(73);
			numberingRomanUpcaseClassicButton.getChildControl('icon').setHeight(73);
			numberingRomanUpcaseClassicButton.getChildControl('icon').setAllowGrowX(false);
			numberingRomanUpcaseClassicButton.getChildControl('icon').setAllowGrowY(false);

			var numberingRomanDowncaseDotsButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-9.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingRomanDowncaseDotsButton, {row: 2, column: 2});
			
			numberingRomanDowncaseDotsButton.getChildControl('icon').setWidth(73);
			numberingRomanDowncaseDotsButton.getChildControl('icon').setHeight(73);
			numberingRomanDowncaseDotsButton.getChildControl('icon').setAllowGrowX(false);
			numberingRomanDowncaseDotsButton.getChildControl('icon').setAllowGrowY(false);

			var numberingRomanDowncaseClassicButton = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/Numbering-10.png').set({
				show: 'icon',
				margin: 10
			});
			numberingTab.add(numberingRomanDowncaseClassicButton, {row: 3, column: 2});

			numberingRomanDowncaseClassicButton.getChildControl('icon').setWidth(73);
			numberingRomanDowncaseClassicButton.getChildControl('icon').setHeight(73);
			numberingRomanDowncaseClassicButton.getChildControl('icon').setAllowGrowX(false);
			numberingRomanDowncaseClassicButton.getChildControl('icon').setAllowGrowY(false);

			var numberingGroup = new qx.ui.form.RadioGroup(mumberingNoneButton, numbering123DotsButton,
				numbering123ClassicButton, numberingABCDotsButton, numberingABCClassicButton,
				numberingAbcDotsButton, numberingAbcClassicButton, numberingRomanUpcaseDotsButton,
				numberingRomanUpcaseClassicButton, numberingRomanDowncaseDotsButton, numberingRomanDowncaseClassicButton);

			numberingGroup.setAllowEmptySelection(false);

			bulletsTab.addListener('activate', function() {
				numberingGroup.setSelection([mumberingNoneButton]);
			});

			numberingTab.addListener('activate', function() {
				bulletsGroup.setSelection([bulletsNoneButton]);
			});

			var bottomContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				backgroundColor: '#D9E5F4',
				height: 45,
				width: 500
			});
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button('Cancel').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 60,
				height: 30
			});
			bottomContainer.add(cancelButton,  {top: 8, bottom: 8, left: 115});

			cancelButton.addListener('click', function() {
				window.close();
			});

			var acceptButton = new qx.ui.form.Button('Accept').set({
				font: new qx.bom.Font('12', ['Helvetica', 'Arial']),
				width: 60,
				height: 30
			});
			bottomContainer.add(acceptButton,  {top: 8, bottom: 8, right: 15});

			acceptButton.addListener('click', function() {
				var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());

				switch(bulletsGroup.getSelection()[0].getUserData('type')) {
					case 'none':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'none');
						break;
					case 'circle-fill':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'circle-fill');
						ed.selection.setContent('<span>&#x25CF; </<span>');
						break;
					case 'circle-empty':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'circle-empty');
						ed.selection.setContent('<span>&#x25CB; </<span>');
						break;
					case 'square-fill':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'square-fill');
						ed.selection.setContent('<span>&#x25A0; </<span>');
						break;
					case 'square-empty':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'square-empty');
						ed.selection.setContent('<span>\u25A2 </<span>');
						break;
					case 'diamant-fill':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'diamant-fill');
						ed.selection.setContent('<span>&#x25C6; </<span>');
						break;
					case 'diamant-empty':
						object.insertUnorderedList();
						ed.selection.getNode().parentNode.style.listStyleType = 'none';
						ed.dom.setAttrib(ed.selection.getNode().parentNode, 'type', 'diamant-empty');
						ed.selection.setContent('<span>&#x25C7; </<span>');
						break;
				}
				window.close();
			});

			window.open();
		},

		editFindAndReplaceDialog: function(object) {
			var container = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				height: 60,
				allowGrowY: false,
				font: new qx.bom.Font('11', ['Helvetica', 'Arial']),
				backgroundColor: '#F2F2F3'
			});

			var parent = object.getApplication().getWindow().getUserData('container');
			if(parent.getChildren().length == 2) {
				parent.addAt(container, 1);
			} else {
				parent.addAt(container, 3);
			}
			

			var findLabel = new qx.ui.basic.Label('Find: ').set({
				margin: 5,
				marginTop: 8
			});
			container.add(findLabel, {top: 0, bottom: 0, left: 5, right: 0});

			var findTextField = new qx.ui.form.TextField('').set({
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 5, 5, 5, 5),
				margin: 5,
				backgroundColor: 'white',
				width: 200
			});
			container.add(findTextField, {top: 0, bottom: 0, left: 42});

			var findPreviousButton = new qx.ui.form.Button('Find previous').set({
				width: 100,
				height: 8
			});
			container.add(findPreviousButton, {top: 32, bottom: 5, left: 45});

			findPreviousButton.addListener('click', function() {
				if(findTextField.getValue()) {
					container.fireDataEvent('findPrevious', findTextField.getValue());
				}
			}, this);

			var findNextButton = new qx.ui.form.Button('Find next').set({
				width: 100,
				height: 8
			});
			container.add(findNextButton, {top: 32, bottom: 5, left: 150});

			findNextButton.addListener('click', function() {
				if(findTextField.getValue()) {
					container.fireDataEvent('findNext', findTextField.getValue());
				}
			}, this);

			var replaceLabel = new qx.ui.basic.Label('Replace: ').set({
				margin: 5,
				marginTop: 8
			});
			container.add(replaceLabel, {top: 0, bottom: 0, left: 290, right: 0});

			var replaceTextField = new qx.ui.form.TextField('').set({
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 5, 5, 5, 5),
				margin: 5,
				backgroundColor: 'white',
				width: 200
			});
			container.add(replaceTextField, {top: 0, bottom: 0, left: 342});

			var replaceButton = new qx.ui.form.Button('Replace').set({
				width: 100,
				height: 8
			});
			container.add(replaceButton, {top: 32, bottom: 5, left: 345});

			replaceButton.addListener('click', function() {
				if(replaceTextField.getValue()) {
					container.fireDataEvent('replace', [findTextField.getValue(), replaceTextField.getValue()]);
				}
			}, this);

			var replaceAllButton = new qx.ui.form.Button('Replace All').set({
				width: 100,
				height: 8
			});
			container.add(replaceAllButton, {top: 32, bottom: 5, left: 450});

			replaceAllButton.addListener('click', function() {
				if(replaceTextField.getValue()) {
					container.fireDataEvent('replaceAll', [findTextField.getValue(), replaceTextField.getValue()]);
				}
			}, this);

			var closeButton = new qx.ui.basic.Label('X').set({
				cursor: 'pointer'
			});

			container.addListener('mouseover', function() {
				closeButton.show();
			}, this);

			container.addListener('mouseout', function() {
				closeButton.hide();
			}, this);

			closeButton.addListener('click', function() {
				container.destroy();
				object.findAndReplace = false;
			}, object);

			var matchCase = new qx.ui.form.CheckBox('Match case');
			container.add(matchCase, {top: 32, bottom: 5, left: 570});

			var notFound = new qx.ui.basic.Label('End of document reached.').set({
				visibility: 'excluded',
				textColor: 'red'
			});
			container.add(notFound, {top: 18, bottom: 20, left: 700});

			var allReplaced = new qx.ui.basic.Label('All replaced!').set({
				visibility: 'excluded',
				textColor: 'blue'
			});
			container.add(allReplaced, {top: 18, bottom: 20, left: 700});

			container.matchCase = matchCase;
			container.notFound = notFound;
			container.allReplaced = allReplaced;
			container.add(closeButton, {top: 5, right: 5});
			return container;
		},

	formatDocumentSettingsWindow: function(object, e) {
			var window = new qx.ui.window.Window(tr('Document Settings'));
			window.setLayout(new qx.ui.layout.VBox());
			window.setContentPadding(0);
			window.setHeight(480);
			window.setWidth(400);
			window.setAllowMaximize(false);
			window.setAllowMinimize(false);
			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			var datasContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			datasContainer.setHeight(435);
			datasContainer.setWidth(400);
			window.add(datasContainer);

			var tabView = new qx.ui.tabview.TabView();
			tabView.setMargin(5);
			datasContainer.add(tabView);

			var pagesTab = new qx.ui.tabview.Page(tr("Pages"));
			pagesTab.setLayout(new qx.ui.layout.VBox());
			pagesTab.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			tabView.add(pagesTab);

			pagesTab.add(new qx.ui.basic.Label(tr('Measure')));
			var measureSelectBox = new eyeos.ui.form.SelectBox([{
				name: 'px', id: 'px'
			}, {
				name: '%', id: '%'
			}]);
			measureSelectBox.setAllowGrowX(false);
			measureSelectBox.setWidth(150);
			measureSelectBox.setMarginBottom(15);
			pagesTab.add(measureSelectBox);
			pagesTab.add(new qx.ui.basic.Label(tr('Page Size')));
			var pageSizeSelectBox = new eyeos.ui.form.SelectBox([{
				name: 'A4 (210 x 297 mm)',
				id: 'A4'
			}, {
				name: 'letter (216 x 279 mm)',
				id: 'letter'
			}, {
				name: 'lega (216 x 279 mm)',
				id: 'lega'
			}]);
			pageSizeSelectBox.setAllowGrowX(false);
			pageSizeSelectBox.setWidth(150);
			pageSizeSelectBox.setMarginBottom(15);
			pagesTab.add(pageSizeSelectBox);

			var orientationBox = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			orientationBox.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			orientationBox.setMarginBottom(15);
			orientationBox.add(new qx.ui.basic.Label(tr('Orientation')), {
				top: 0,
				left: 0
			});
			pagesTab.add(orientationBox);

			var portraitImage = new qx.ui.basic.Image('index.php?extern=images/documents/page-orientation-portrt-32.png');
			orientationBox.add(portraitImage, {
				top: 20,
				left: 100
			});

			var landscapeImage = new qx.ui.basic.Image('index.php?extern=images/documents/page-orientation-landscp-32.png');
			landscapeImage.hide();
			orientationBox.add(landscapeImage, {
				top: 20,
				left: 100
			});

			var portraitCheckBox = new qx.ui.form.RadioButton(tr('Portrait'));
			orientationBox.add(portraitCheckBox, {
				top: 20,
				left: 0
			});

			var landscapeCheckBox = new qx.ui.form.RadioButton(tr('Landscape'));
			orientationBox.add(landscapeCheckBox, {
				top: 40,
				left: 0
			});

			var orientationManager = new qx.ui.form.RadioGroup(portraitCheckBox, landscapeCheckBox);
			orientationManager.addListener("changeSelection", function(e) {
				if (e.getData()[0].getLabel() == tr('Landscape') ) {
					portraitImage.hide();
					landscapeImage.show();
				}
				else {
					landscapeImage.hide();
					portraitImage.show();
				}
			});

			var marginGroupBox = new qx.ui.groupbox.GroupBox(tr('Margin'));
			marginGroupBox.setLayout(new qx.ui.layout.VBox());
			marginGroupBox.setWidth(180);
			marginGroupBox.setAllowGrowX(false);

			var topSpinner = new eyeos.ui.form.Spinner('Top', 'Top');
			topSpinner.setAllowGrowX(false);
			marginGroupBox.add(topSpinner);

			var bottomSpinner = new eyeos.ui.form.Spinner('Bottom', 'Bottom');
			bottomSpinner.setAllowGrowX(false);
			marginGroupBox.add(bottomSpinner);

			var leftSpinner = new eyeos.ui.form.Spinner('Left', 'Left');
			leftSpinner.setAllowGrowX(false);
			marginGroupBox.add(leftSpinner);

			var rightSpinner = new eyeos.ui.form.Spinner('Right', 'Right');
			rightSpinner.setAllowGrowX(false);
			marginGroupBox.add(rightSpinner);

			pagesTab.add(marginGroupBox);

			var pagesMakeDefault = new qx.ui.form.CheckBox(tr('Make default'));
			pagesMakeDefault.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			pagesMakeDefault.setMarginTop(10);
			pagesTab.add(pagesMakeDefault);

			var typeTab = new qx.ui.tabview.Page(tr("Type"));
			typeTab.setLayout(new qx.ui.layout.VBox());
			typeTab.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			tabView.add(typeTab);

			typeTab.add(new qx.ui.basic.Label(tr('Font')));
			var typeFontSelectBox = new eyeos.ui.form.SelectBox([{
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
				}]);

			typeFontSelectBox.setAllowGrowX(false);
			typeFontSelectBox.setWidth(150);
			typeFontSelectBox.setMarginBottom(10);
			typeTab.add(typeFontSelectBox);

			typeTab.add(new qx.ui.basic.Label(tr('Size')));
			var sizeSelectBox = new eyeos.ui.form.SelectBox([{
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
				}]);
			sizeSelectBox.setWidth(60);
			sizeSelectBox.setAllowGrowX(false);
			sizeSelectBox.setMarginBottom(10);
			typeTab.add(sizeSelectBox);

			typeTab.add(new qx.ui.basic.Label(tr('Line Spacing')));
			var typeLineSpacingSelectBox = new eyeos.ui.form.SelectBox([{
				name: 'normal',
				id: 'normal'
			}, {
				name: 'single spaced',
				id: 'singleSpaced'
			}, {
				name: '1.5 spaced',
				id: '1.5Spaced'
			}, {
				name: 'doble spaced',
				id: 'dobleSpaced'
			}, {
				name: 'trile spaced',
				id: 'trileSpaced'
			}]);

			typeLineSpacingSelectBox.setAllowGrowX(false);
			typeLineSpacingSelectBox.setWidth(150);
			typeLineSpacingSelectBox.setMarginBottom(10);
			typeTab.add(typeLineSpacingSelectBox);


			typeTab.add(new qx.ui.basic.Label(tr('Text direction')));
			var leftToRightCheckBox = new qx.ui.form.RadioButton(tr('Left to right'));
			leftToRightCheckBox.setMargin(10);
			typeTab.add(leftToRightCheckBox, {
				top: 20,
				left: 0
			});
			var rightToLeftCheckBox = new qx.ui.form.RadioButton(tr('Right to left'));
			rightToLeftCheckBox.setMargin(10);
			typeTab.add(rightToLeftCheckBox, {
				top: 40,
				left: 0
			});
			var textDirectionManager = new qx.ui.form.RadioGroup(leftToRightCheckBox, rightToLeftCheckBox);

			var typeMakeDefault = new qx.ui.form.CheckBox(tr('Make default'));
			typeMakeDefault.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			typeMakeDefault.setMarginTop(70);
			typeTab.add(typeMakeDefault);

			var backgroundTab = new qx.ui.tabview.Page(tr("Background"));
			backgroundTab.setLayout(new qx.ui.layout.VBox());
			backgroundTab.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			tabView.add(backgroundTab);

			var noFillCheckBox = new qx.ui.form.RadioButton(tr('No Fill'));
			noFillCheckBox.setMargin(10);
			backgroundTab.add(noFillCheckBox);
			var colorCheckBox = new qx.ui.form.RadioButton(tr('Color'));
			colorCheckBox.setMargin(10);
			backgroundTab.add(colorCheckBox);

			var colorLabel = new qx.ui.basic.Label();
			colorLabel.setBackgroundColor('#FFF');
			colorLabel.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#000', 0.7, 5, 5, 5, 5)
				);
			colorLabel.setAllowGrowX(false);
			colorLabel.setAllowGrowY(false);
			colorLabel.setWidth(22);
			colorLabel.setHeight(22);

			var selectPopup = new qx.ui.control.ColorPopup();
			selectPopup.addListener('changeValue', function(e) {
				colorLabel.setBackgroundColor(e.getData());
			});

			var selectButton = new qx.ui.form.Button(tr('Selector'));
			selectButton.setWidth(100);
			selectButton.setAllowGrowX(false);
			selectButton.setEnabled(false);
			selectButton.setMarginRight(5);
			selectButton.setMarginLeft(12);
			selectButton.setMarginBottom(10);
			selectButton.addListener('execute', function() {
				selectPopup.placeToWidget(selectButton);
				selectPopup.show();
			});

			var colorSelectorBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			backgroundTab.add(colorSelectorBox);
			colorSelectorBox.add(selectButton);
			colorSelectorBox.add(colorLabel);

			var fillColorManager = new qx.ui.form.RadioGroup(noFillCheckBox, colorCheckBox);
			fillColorManager.addListener("changeSelection", function(e) {
				if (e.getData()[0].getLabel() == tr('Color') ) {
					selectButton.setEnabled(true);
				}
				else {
					selectButton.setEnabled(false);
				}
			});

			var gradientGroupBox = new qx.ui.groupbox.GroupBox(tr('Gradient'));
			gradientGroupBox.setLayout(new qx.ui.layout.Canvas());
			gradientGroupBox.setWidth(260);
			gradientGroupBox.setAllowGrowX(false);
			backgroundTab.add(gradientGroupBox);

			var horizontalCheckbox = new qx.ui.form.RadioButton(tr('Horizontal'));
			gradientGroupBox.add(horizontalCheckbox, {
				top: 5,
				left: 5
			});
			var verticalCheckbox = new qx.ui.form.RadioButton(tr('Vertical'));
			gradientGroupBox.add(verticalCheckbox, {
				top: 25,
				left: 5
			});
			var gradientManager = new qx.ui.form.RadioGroup(horizontalCheckbox, verticalCheckbox);

			gradientGroupBox.add(new qx.ui.basic.Label(tr('Color')+' 1'), {
				top: 5,
				left: 120
			});
			var colorOneLabel = new qx.ui.basic.Label();
			colorOneLabel.setBackgroundColor('#FFF');
			colorOneLabel.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#000', 0.7, 5, 5, 5, 5)
				);
			colorOneLabel.setAllowGrowX(false);
			colorOneLabel.setAllowGrowY(false);
			colorOneLabel.setWidth(22);
			colorOneLabel.setHeight(22);

			var selectOnePopup = new qx.ui.control.ColorPopup();
			selectOnePopup.addListener('changeValue', function(e) {
				colorOneLabel.setBackgroundColor(e.getData());
			});

			var selectOneButton = new qx.ui.form.Button('Selector');
			selectOneButton.setWidth(100);
			selectOneButton.setAllowGrowX(false);
			selectOneButton.setMarginRight(5);
			selectOneButton.setMarginLeft(12);
			selectOneButton.setMarginBottom(10);
			selectOneButton.addListener('execute', function() {
				selectOnePopup.placeToWidget(selectOneButton);
				selectOnePopup.show();
			});
			var colorOneSelectorBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			gradientGroupBox.add(colorOneSelectorBox, {
				top: 20,
				left: 110
			});
			colorOneSelectorBox.add(selectOneButton);
			colorOneSelectorBox.add(colorOneLabel);

			gradientGroupBox.add(new qx.ui.basic.Label(tr('Color')+' 2'), {
				top: 55,
				left: 120
			});
			var colorTwoLabel = new qx.ui.basic.Label();
			colorTwoLabel.setBackgroundColor('#FFF');
			colorTwoLabel.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#000', 0.7, 5, 5, 5, 5)
				);
			colorTwoLabel.setAllowGrowX(false);
			colorTwoLabel.setAllowGrowY(false);
			colorTwoLabel.setWidth(22);
			colorTwoLabel.setHeight(22);

			var selectTwoPopup = new qx.ui.control.ColorPopup();
			selectTwoPopup.addListener('changeValue', function(e) {
				colorTwoLabel.setBackgroundColor(e.getData());
			});

			var selectTwoButton = new qx.ui.form.Button('Selector');
			selectTwoButton.setWidth(100);
			selectTwoButton.setAllowGrowX(false);
			selectTwoButton.setMarginRight(5);
			selectTwoButton.setMarginLeft(12);
			selectTwoButton.setMarginBottom(10);
			selectTwoButton.setEnabled(false);
			selectTwoButton.addListener('execute', function() {
				selectTwoPopup.placeToWidget(selectTwoButton);
				selectTwoPopup.show();
			});
			var colorTwoSelectorBox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			gradientGroupBox.add(colorTwoSelectorBox, {
				top: 75,
				left: 110
			});
			colorTwoSelectorBox.add(selectTwoButton);
			colorTwoSelectorBox.add(colorTwoLabel);

			var onecolorCheckbox = new qx.ui.form.RadioButton(tr('One Color'));
			gradientGroupBox.add(onecolorCheckbox, {
				top: 60,
				left: 5
			});
			var twocolorsCheckbox = new qx.ui.form.RadioButton(tr('Two Colors'));
			gradientGroupBox.add(twocolorsCheckbox, {
				top: 80,
				left: 5
			});
			var colorsManager = new qx.ui.form.RadioGroup(onecolorCheckbox, twocolorsCheckbox);
			colorsManager.addListener("changeSelection", function(e) {
				if (e.getData()[0].getLabel() == tr('Two Colors')) {
					selectTwoButton.setEnabled(true);
				}
				else {
					selectTwoButton.setEnabled(false);
				}
			});

			var sliderValue = new qx.ui.basic.Label();
			sliderValue.setWidth(20);
			sliderValue.setHeight(14);
			sliderValue.hide();
			sliderValue.setAllowGrowX(false);
			sliderValue.setAllowGrowX(true);
			sliderValue.setPaddingTop(2);

			var slider = new eyeos.ui.form.Slider();
			sliderValue.setValue(slider.getValue());
			slider.addListener("changeValue", function(e) {
				sliderValue.setValue(this.getValue().toString());
			});
			slider.setEnabled(false);
			gradientGroupBox.add(slider.createSliderGroup(), {
				top: 130,
				left: 120
			});

			var transparency = new qx.ui.form.CheckBox(tr('Transparency')+':');
			transparency.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			transparency.setMargin(10);
			transparency.addListener('changeValue', function() {
				if (this.getValue()) {
					slider.setEnabled(true);
					sliderValue.show();
				}
				else {
					slider.setEnabled(false);
					sliderValue.hide();
				}
			});
			gradientGroupBox.add(transparency, {
				top: 100,
				left: 110
			});
			gradientGroupBox.add(sliderValue, {
				top: 110,
				left: 220
			});

			var backgroundMakeDefault = new qx.ui.form.CheckBox(tr('Make default'));
			backgroundMakeDefault.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			backgroundMakeDefault.setPaddingTop(50);
			backgroundMakeDefault.setPaddingLeft(8);
			backgroundTab.add(backgroundMakeDefault);

			var watermarkTab = new qx.ui.tabview.Page(tr("Watermark"));
			watermarkTab.setLayout(new qx.ui.layout.Canvas());
			watermarkTab.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			tabView.add(watermarkTab);

			var noWatermarkCheckBox = new qx.ui.form.RadioButton(tr('No watermark'));
			noWatermarkCheckBox.setMargin(10);
			watermarkTab.add(noWatermarkCheckBox, {
				top: 5,
				left: 5
			});

			var imageCheckBox = new qx.ui.form.RadioButton(tr('Image'));
			imageCheckBox.setMargin(10);
			watermarkTab.add(imageCheckBox, {
				top: 25,
				left: 5
			});

			var browseButton = new qx.ui.form.Button(tr('Browse'));
			browseButton.setWidth(100);
			browseButton.setAllowGrowX(false);
			browseButton.setEnabled(false);
			browseButton.setMarginRight(5);
			browseButton.setMarginLeft(12);
			browseButton.setMarginBottom(10);
			browseButton.addListener('execute', function() {
				//				console.log('to be implemented');
				});
			watermarkTab.add(browseButton, {
				top: 53,
				left: 5
			});

			var textCheckBox = new qx.ui.form.RadioButton(tr('Text'));
			textCheckBox.setMargin(10);
			watermarkTab.add(textCheckBox, {
				top: 75,
				left: 5
			});

			var textArea = new qx.ui.form.TextField();
			textArea.setDecorator(
				new qx.ui.decoration.RoundBorderBeveled(null, '#000', 0.7, 5, 5, 5, 5)
				);
			textArea.setWidth(260);
			textArea.setEnabled(false);
			textArea.setAllowGrowX(false);
			watermarkTab.add(textArea, {
				top: 103,
				left: 16
			});

			var sliderWaterValue = new qx.ui.basic.Label();
			sliderWaterValue.setWidth(20);
			sliderWaterValue.setHeight(14);
			sliderWaterValue.hide();
			sliderWaterValue.setAllowGrowX(false);
			sliderWaterValue.setAllowGrowX(true);
			sliderWaterValue.setPaddingTop(2);

			var sliderWater = new eyeos.ui.form.Slider();
			sliderWaterValue.setValue(sliderWater.getValue());
			sliderWater.addListener("changeValue", function(e) {
				sliderWaterValue.setValue(this.getValue().toString());
			});
			sliderWater.setEnabled(false);

			var transparencyWater = new qx.ui.form.CheckBox(tr('Transparency:'));
			transparencyWater.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			transparencyWater.setMargin(10);
			transparencyWater.setEnabled(false);
			transparencyWater.addListener('changeValue', function() {
				if (this.getValue()) {
					sliderWater.setEnabled(true);
					sliderWaterValue.show();
				}
				else {
					sliderWater.setEnabled(false);
					sliderWaterValue.hide();
				}
			});

			var watermarkGroupBox = new qx.ui.groupbox.GroupBox();
			watermarkGroupBox.setLayout(new qx.ui.layout.Canvas());
			watermarkGroupBox.setWidth(260);
			watermarkGroupBox.setAllowGrowX(false);
			watermarkGroupBox.setEnabled(false);
			watermarkTab.add(watermarkGroupBox, {
				top: 125,
				left: 16
			});

			var watermarkFontSelectBox = new eyeos.ui.form.SelectBox([{
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
				}]);
			watermarkGroupBox.add(watermarkFontSelectBox, {
				top: 0,
				left: 0
			});
			var watermarkSizeSelectBox = new eyeos.ui.form.SelectBox([{
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
				}]);
			watermarkSizeSelectBox.setWidth(60);
			watermarkSizeSelectBox.setAllowGrowX(false);
			watermarkGroupBox.add(watermarkSizeSelectBox, {
				top: 0,
				left: 125
			});

			var bold = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/format-text-bold.png');
			watermarkGroupBox.add(bold, {
				top: 30,
				left: 0
			});
			var italic = new qx.ui.toolbar.RadioButton(null, 'index.php?extern=images/documents/format-text-italic.png');
			watermarkGroupBox.add(italic, {
				top: 30,
				left: 30
			});
			var label = new qx.ui.basic.Label(tr('Color'));
			label.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			watermarkGroupBox.add(label, {
				top: 40,
				left: 70
			});
			var color = new eyeos.ui.form.ColorButton();
			watermarkGroupBox.add(color, {
				top: 35,
				left: 100
			});

			var sliderTextWaterValue = new qx.ui.basic.Label();
			sliderTextWaterValue.setWidth(20);
			sliderTextWaterValue.setHeight(14);
			sliderTextWaterValue.hide();
			sliderTextWaterValue.setAllowGrowX(false);
			sliderTextWaterValue.setAllowGrowX(true);
			sliderTextWaterValue.setPaddingTop(2);

			var sliderTextWater = new eyeos.ui.form.Slider();
			sliderTextWaterValue.setValue(sliderTextWater.getValue());
			sliderTextWater.addListener("changeValue", function(e) {
				sliderTextWaterValue.setValue(this.getValue().toString());
			});
			sliderTextWater.setEnabled(false);

			var transparencyTextWater = new qx.ui.form.CheckBox(tr('Transparency:'));
			transparencyTextWater.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			transparencyTextWater.setMargin(10);
			transparencyTextWater.addListener('changeValue', function() {
				if (this.getValue()) {
					sliderTextWater.setEnabled(true);
					sliderTextWaterValue.show();
				}
				else {
					sliderTextWater.setEnabled(false);
					sliderTextWaterValue.hide();
				}
			});

			watermarkGroupBox.add(sliderTextWater.createSliderGroup(), {
				top: 90,
				left: 30
			});
			watermarkGroupBox.add(transparencyTextWater, {
				top: 60,
				left: 0
			});
			watermarkGroupBox.add(sliderTextWaterValue, {
				top: 70,
				left: 110
			});

			watermarkTab.add(sliderWater.createSliderGroup(), {
				top: 55,
				left: 150
			});
			watermarkTab.add(transparencyWater, {
				top: 25,
				left: 120
			});
			watermarkTab.add(sliderWaterValue, {
				top: 35,
				left: 230
			});

			var watermarkManager = new qx.ui.form.RadioGroup(noWatermarkCheckBox, imageCheckBox, textCheckBox);
			watermarkManager.addListener('changeSelection', function(e) {
				if (e.getData()[0].getLabel() == tr('Image') ) {
					browseButton.setEnabled(true);
					transparencyWater.setEnabled(true);
					textArea.setEnabled(false);
					watermarkGroupBox.setEnabled(false);
				}
				else if (e.getData()[0].getLabel() == tr('Text') ) {
					textArea.setEnabled(true);
					browseButton.setEnabled(false);
					transparencyWater.setEnabled(false);
					watermarkGroupBox.setEnabled(true);
				}
			});

			var watermarkMakeDefault = new qx.ui.form.CheckBox(tr('Make default'));
			watermarkMakeDefault.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			watermarkMakeDefault.setMargin(10);
			watermarkTab.add(watermarkMakeDefault, {
				bottom: 0,
				left: 5
			});

			var bottomContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			bottomContainer.setBackgroundColor('#D9E5F4');
			bottomContainer.setHeight(45);
			bottomContainer.setWidth(526);
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button(tr('Cancel'));
			cancelButton.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			cancelButton.addListener('click', function() {
				window.close();
			});
			cancelButton.setWidth(120);
			cancelButton.setHeight(30);
			bottomContainer.add(cancelButton,  {
				top: 8,
				bottom: 8,
				left: 115
			});

			var acceptButton = new qx.ui.form.Button(tr('Accept'));
			acceptButton.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			acceptButton.addListener('click', function() {
				window.close();
			});
			acceptButton.setWidth(120);
			acceptButton.setHeight(30);
			bottomContainer.add(acceptButton,  {
				top: 8,
				bottom: 8,
				left: 315,
				right: 15
			});

			window.open();
		},

		formatIndentationWindow: function(object, e) {
			var window = new qx.ui.window.Window('Indentation');
			window.setLayout(new qx.ui.layout.VBox());
			window.setContentPadding(0);
			window.setHeight(400);
			window.setWidth(400);
			window.setAllowMaximize(false);
			window.setAllowMinimize(false);
			var left = (object.getApplication().getWindow().getBounds().width/2) - (window.getWidth()/2) + object.getApplication().getWindow().getBounds().left;
			var top = (object.getApplication().getWindow().getBounds().height/2) - (window.getHeight()/2) + object.getApplication().getWindow().getBounds().top;
			window.moveTo(left, top);

			var datasContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			datasContainer.setHeight(335);
			datasContainer.setWidth(400);
			window.add(datasContainer);

			var bleedGroupBox = new qx.ui.groupbox.GroupBox('Bleed');
			bleedGroupBox.setLayout(new qx.ui.layout.Canvas());
			bleedGroupBox.setWidth(300);
			bleedGroupBox.setMargin(10);
			bleedGroupBox.setAllowGrowX(false);
			datasContainer.add(bleedGroupBox);

			var firstLineSpinner = new eyeos.ui.form.Spinner('1º line', 'line_1');
			firstLineSpinner.setAllowGrowX(false);
			bleedGroupBox.add(firstLineSpinner, {
				top: 0,
				left: 0
			});

			var leftSpinner = new eyeos.ui.form.Spinner('Left', 'Left');
			leftSpinner.setAllowGrowX(false);
			bleedGroupBox.add(leftSpinner, {
				top: 30,
				left: 0
			});

			var rightSpinner = new eyeos.ui.form.Spinner('Right', 'Right');
			rightSpinner.setAllowGrowX(false);
			bleedGroupBox.add(rightSpinner, {
				top: 30,
				left: 110
			});

			var paragraphGroupBox = new qx.ui.groupbox.GroupBox('Paragraph spaces');
			paragraphGroupBox.setLayout(new qx.ui.layout.HBox());
			paragraphGroupBox.setWidth(300);
			paragraphGroupBox.setMargin(10);
			paragraphGroupBox.setAllowGrowX(false);
			datasContainer.add(paragraphGroupBox);

			var beforeSpinner = new eyeos.ui.form.Spinner('Before', 'Before');
			beforeSpinner.setAllowGrowX(false);
			paragraphGroupBox.add(beforeSpinner);

			var afterSpinner = new eyeos.ui.form.Spinner('After', 'After');
			afterSpinner.setAllowGrowX(false);
			afterSpinner.setMarginLeft(5);
			paragraphGroupBox.add(afterSpinner);

			var preview = new qx.ui.form.CheckBox('Preview');
			preview.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			preview.setMarginTop(120);
			preview.setMarginLeft(10);
			datasContainer.add(preview);

			var bottomContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			bottomContainer.setBackgroundColor('#D9E5F4');
			bottomContainer.setHeight(45);
			bottomContainer.setWidth(526);
			window.add(bottomContainer);

			var cancelButton = new qx.ui.form.Button('Cancel');
			cancelButton.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			cancelButton.addListener('click', function() {
				window.close();
			});
			cancelButton.setWidth(120);
			cancelButton.setHeight(30);
			bottomContainer.add(cancelButton,  {
				top: 8,
				bottom: 8,
				left: 115
			});

			var acceptButton = new qx.ui.form.Button('Accept');
			acceptButton.setFont(new qx.bom.Font('12', ['Helvetica', 'Arial']));
			acceptButton.addListener('click', function() {
				window.close();
			});
			acceptButton.setWidth(120);
			acceptButton.setHeight(30);
			bottomContainer.add(acceptButton,  {
				top: 8,
				bottom: 8,
				left: 315,
				right: 15
			});

			window.open();
		}
	}
});
