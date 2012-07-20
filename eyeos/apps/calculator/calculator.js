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

function calculator_application(checknum, pid, args) {
	var app = new eyeos.application.Calculator(checknum, pid);
	app.drawGUI();
}

qx.Class.define("eyeos.application.Calculator", {
	extend: eyeos.system.EyeApplication,

	construct: function(checknum, pid) {
		arguments.callee.base.call(this,"Calculator", checknum, pid);
	},

	members: {

		drawGUI: function() {
			var mainWindow = new eyeos.ui.Window(this, tr("Calculator"), 'index.php?extern=/images/16x16/apps/accessories-calculator.png');
			mainWindow.setLayout(new qx.ui.layout.VBox(3));
			mainWindow.setAllowMaximize(false);
			
			var buttonContainer = new qx.ui.container.Composite();
			var grid = new qx.ui.layout.Grid(3, 3);
			buttonContainer.setLayout(grid);
			mainWindow.add(buttonContainer, {flex:6});
			
			firstInit = 0;
			
			var display = new qx.ui.basic.Label("0").set({
				allowGrowX: true,
				allowGrowY: true,
				textAlign : "right",
				font: "bold",
				decorator: "main"
			});
			//mainWindow.add(display, {flex: 1});
			buttonContainer.add(display,{column: 0, row: 0});
			grid.setColumnFlex(0, 100);
			grid.setRowFlex(0, 100);
			display.setLayoutProperties({colSpan: 4});
			
			var b1 = new qx.ui.form.Button("1");
			buttonContainer.add(b1, {column: 0, row: 2});
			grid.setColumnFlex(0, 100);
			grid.setRowFlex(2, 100);
			
			b1.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("1");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 1)));
				}
			});
			
			var b2 = new qx.ui.form.Button("2");
			buttonContainer.add(b2, {column: 1, row: 2});
			grid.setColumnFlex(1, 100);
			grid.setRowFlex(2, 100);
			
			b2.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("2");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 2)));
				}
			});
			
			var b3 = new qx.ui.form.Button("3");
			buttonContainer.add(b3, {column: 2, row: 2});
			grid.setColumnFlex(2, 100);
			grid.setRowFlex(2, 100);
			
			b3.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("3");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 3)));
				}
			});
			
			var b4 = new qx.ui.form.Button("4");
			buttonContainer.add(b4, {column: 0, row: 3});
			grid.setColumnFlex(0, 100);
			grid.setRowFlex(3, 100);
			
			b4.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("4");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 4)));
				}
			});
			
			var b5 = new qx.ui.form.Button("5");
			buttonContainer.add(b5, {column: 1, row: 3});
			grid.setColumnFlex(1, 100);
			grid.setRowFlex(3, 100);
			
			b5.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("5");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 5)));
				}
			});
			
			var b6 = new qx.ui.form.Button("6");
			buttonContainer.add(b6, {column: 2, row: 3});
			grid.setColumnFlex(2, 100);
			grid.setRowFlex(3, 100);
			
			b6.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("6");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 6)));
				}
			});
			
			var b7 = new qx.ui.form.Button("7");
			buttonContainer.add(b7, {column: 0, row: 4});
			grid.setColumnFlex(0, 100);
			grid.setRowFlex(4, 100);
			
			b7.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("7");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 7)));
				}
			});
			
			var b8 = new qx.ui.form.Button("8");
			buttonContainer.add(b8, {column: 1, row: 4});
			grid.setColumnFlex(1, 100);
			grid.setRowFlex(4, 100);
			
			b8.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("8");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 8)));
				}
			});
			
			var b9 = new qx.ui.form.Button("9");
			buttonContainer.add(b9, {column: 2, row: 4});
			grid.setColumnFlex(2, 100);
			grid.setRowFlex(4, 100);
			
			b9.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("9");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10 + 9)));
				}
			});
			
			var b0 = new qx.ui.form.Button("0");
			buttonContainer.add(b0, {column: 0, row: 5});
			grid.setColumnFlex(0, 100);
			grid.setRowFlex(5, 100);
			
			b0.addListener("execute", function () {
				if(display.getValue() == "0") {
					display.setValue("0");
				} else {
					display.setValue(String(parseFloat(display.getValue() * 10)));
				}
			});
			
			var bC = new qx.ui.form.Button("C");
			buttonContainer.add(bC, {column: 1, row: 5});
			grid.setColumnFlex(1, 100);
			grid.setRowFlex(5, 100);
			
			bC.addListener("execute", function () {
				display.setValue("0");
				currentOperation = "nothing";
				lastNumber = "0";
			});
			
			var bSum = new qx.ui.form.Button("+");
			buttonContainer.add(bSum, {column: 3, row: 2});
			grid.setColumnFlex(3, 100);
			grid.setRowFlex(2, 100);
			
			bSum.addListener("execute", function () {
				lastNumber = parseInt(display.getValue());
				currentOperation = "sum";
				display.setValue("0");
			});
			
			var bRest = new qx.ui.form.Button("-");
			buttonContainer.add(bRest, {column: 3, row: 3});
			grid.setColumnFlex(3, 100);
			grid.setRowFlex(3, 100);
			
			bRest.addListener("execute", function () {
				lastNumber = parseInt(display.getValue());
				currentOperation = "rest";
				display.setValue("0");
			});
			
			var bMult = new qx.ui.form.Button("*");
			buttonContainer.add(bMult, {column: 3, row: 4});
			grid.setColumnFlex(3, 100);
			grid.setRowFlex(3, 100);
			
			bMult.addListener("execute", function () {
				lastNumber = parseInt(display.getValue());
				currentOperation = "mult";
				display.setValue("0");
			});
			
			var bDiv = new qx.ui.form.Button("/");
			buttonContainer.add(bDiv, {column: 3, row: 5});
			grid.setColumnFlex(3, 100);
			grid.setRowFlex(4, 100);
			
			bDiv.addListener("execute", function () {
				lastNumber = parseInt(display.getValue());
				currentOperation = "div";
				display.setValue("0");
			});
			
			var bEqual = new qx.ui.form.Button("=");
			buttonContainer.add(bEqual, {column: 2, row: 5});
			grid.setColumnFlex(3, 100);
			grid.setRowFlex(5, 100);
			
			bEqual.addListener("execute", function () {
				if (currentOperation == "sum") {
					display.setValue(String(lastNumber + parseInt(display.getValue())));
				} else if (currentOperation == "rest") {
					display.setValue(String(lastNumber - parseInt(display.getValue())));
				} else if (currentOperation == "mult") {
					display.setValue(String(lastNumber * parseInt(display.getValue())));
				} else if (currentOperation == "div") {
					if (lastNumber == 0){
						display.setValue("0");
					} else {
						display.setValue(String(lastNumber / parseInt(display.getValue())));
					}
				}
			});
			
			mainWindow.addListener("resize", function() {
				if (firstInit == 0) {
					mainWindow.addListener("activate", function(){
						firstInit = 1;
					});
				} else {
					var changeFontSize = display.getBounds();
					var stringSize = changeFontSize["height"] + "px sans-serif bold";
					display.setFont(new qx.bom.Font.fromString(stringSize));
				}
			});
			
			mainWindow.open();
		}
	}
});