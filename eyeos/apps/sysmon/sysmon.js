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
function sysmon_application(checknum, pid, args) {
	new eyeos.application.Sysmon(checknum, pid);
}

qx.Class.define('eyeos.application.Sysmon', {
	extend: eyeos.system.EyeApplication,
	
	statics: {
		DEFAULT_WIDTH: 500,
		DEFAULT_HEIGHT: 320
	},
	
	construct: function(checknum, pid) {
		arguments.callee.base.call(this, 'sysmon', checknum, pid);
		
		this._drawGUI();
		
		this._window.addListener('appear', function(e) {
			this._refreshProcessesList();
			eyeos.messageBus.getInstance().addListener('eyeos_application_start', this._refreshProcessesList, this);
			eyeos.messageBus.getInstance().addListener('eyeos_application_stop', this._refreshProcessesList, this);
		}, this);
		this._window.addListener('close', function(e) {
			eyeos.messageBus.getInstance().removeListener('eyeos_application_start', this._refreshProcessesList, this);
			eyeos.messageBus.getInstance().removeListener('eyeos_application_stop', this._refreshProcessesList, this);
		}, this);
	},
	
	members: {
		
		_window: null,
		_procTable: null,
		
		
		_drawGUI: function() {
			this._window = new eyeos.ui.Window(this, tr('System Monitor'), 'index.php?extern=/images/16x16/apps/utilities-system-monitor.png').set({
				width: this.self(arguments).DEFAULT_WIDTH,
				height: this.self(arguments).DEFAULT_HEIGHT,
				contentPadding: 0
			});
			var windowLayout = new qx.ui.layout.VBox(0);
			this._window.setLayout(windowLayout);
			
			//
			// TOOLBAR
			//
			var toolbar = new qx.ui.toolbar.ToolBar();
			this._window.add(toolbar);
			
			var refreshButton = new qx.ui.toolbar.Button(tr('Refresh'), 'index.php?extern=images/22x22/actions/view-refresh.png').set({
				iconPosition: 'top'
			});
			refreshButton.addListener('execute', this._refreshProcessesList, this);
			toolbar.add(refreshButton, {column: 0, row: 0});
			
			var infoButton = new qx.ui.toolbar.Button(tr('Info'), 'index.php?extern=images/22x22/status/dialog-information.png').set({
				iconPosition: 'top'
			});
			infoButton.addListener('execute', function(e) {
				alert('Nothing here yet...');
			});
			toolbar.add(infoButton, {column: 2, row: 0});
			
			
			//
			// PROCESSES TABLE
			//
			var secondBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			this._window.add(secondBox, {flex: 1});
			
			var tableModel = new qx.ui.table.model.Simple();
			tableModel.setColumns(new Array('',
					tr('Name'),
					tr('PID'),
					tr('User'),
					tr('Group'),
					tr('Time')
			));
			
			var custom = {
					tableColumnModel: function(obj) {
				return new qx.ui.table.columnmodel.Basic(obj);
			}
			};
			this._procTable = new qx.ui.table.Table(tableModel, custom).set({
				columnVisibilityButtonVisible: true,
				statusBarVisible: false,
				showCellFocusIndicator: false
			});
			
			//var iconRenderer = new qx.ui.table.cellrenderer.Image(16, 16);		// does not work
			var iconRenderer = new qx.ui.table.cellrenderer.Html();
			var tcm = this._procTable.getTableColumnModel();
			tcm.setDataCellRenderer(0, iconRenderer);
			tcm.setColumnWidth(0, 26);
			tcm.setColumnWidth(1, 100);
			tcm.setColumnWidth(2, 40);
			tcm.setColumnWidth(3, 60);
			tcm.setColumnWidth(4, 50);
			tcm.setColumnWidth(5, 200);
			
			//this._procTable.addListener('cellClick', this._onCellClick, this);
			//this._procTable.addListener('cellDblclick', this._onCellDblClick, this);
			secondBox.add(this._procTable, {flex: 1});
			
			
			//
			//	BOTTOM BAR
			//
			var thirdBox = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
			thirdBox.getLayout().setColumnFlex(0, 1);
			this._window.add(thirdBox);
			
			var killButton = new qx.ui.form.Button(tr('Kill process'), 'index.php?extern=images/22x22/actions/process-stop.png').set({
				iconPosition: 'left',
				margin: 4
			});
			killButton.addListener('execute', function(e) {
				var sel = this._procTable.getSelectionModel().getSelectedRanges();
				var pid = this._procTable.getTableModel().getData()[sel[0].minIndex][2];
				this._killProcess(pid);
			}, this);
			thirdBox.add(killButton, {column: 1, row: 0});
			
			this._window.open();
		},
	
		_killProcess: function(pid) {
			eyeos.callMessage(this.getChecknum(), '__System_killProcess', {pid: pid}, function(e) {
				var modelData = this._procTable.getTableModel().getData();
				
				for(var i = 0; i < modelData.length; i++) {
					if (modelData[i][2] == pid) {
						modelData.splice(i, 1);
						break;
					}
				}
				this._procTable.getTableModel().setData(modelData);    			
			}, this);
		},
	
		_refreshProcessesList: function() {
			this._procTable.getTableModel().removeRows(0, this._procTable.getTableModel().getRowCount());
			eyeos.callMessage(this.getChecknum(), '__System_getProcessesList', null, this._refreshProcessesListCallback, this);
		},
	
		_refreshProcessesListCallback: function(procData) {
			var model = this._procTable.getTableModel();
			var rows = new Array();
			
			for(var i = 0; i < procData.length; i++) {
				rows.push(new Array(
						'<img src="index.php?extern=images/16x16/mimetypes/application-x-executable.png" />',	//TODO display icon according to mimetype/extension
						procData[i].name,
						procData[i].pid,
						procData[i].loginContext.user,
						procData[i].loginContext.group,
						new Date(parseInt(procData[i].time) * 1000).toString()
				));
			}
			model.addRows(rows);
		}
	}
});