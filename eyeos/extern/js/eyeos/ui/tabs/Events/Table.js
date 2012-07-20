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

qx.Class.define('eyeos.ui.tabs.Events.Table', {
	extend: qx.ui.table.Table,

	statics: {
		REPLY_ANSWER: function (id, answer, checknum) {
			var param = {
				id: id,
				answer: answer
			};
			eyeos.callMessage(checknum, '__Events_handleAnswer', param, function (result) {
				var bus = eyeos.messageBus.getInstance();
				bus.send('events', 'eventEnded', id);
			}, this);
		},
		
		DELETE_EVENT: function (id, isQuestion) {
			var bus = eyeos.messageBus.getInstance();
			bus.send('events', 'aboutToRemove', [id, isQuestion]);
		}
	},
	properties: {

	},

	construct: function (checknum) {
		this._checknum = checknum;
		var tableModel = new qx.ui.table.model.Filtered();
		tableModel.setColumns([ '', tr('Name'), tr('Method'), tr('Section'), tr('Event data'), '', '', tr('id')]);

		//Set column not editable
		tableModel.setColumnEditable(0, false);
		tableModel.setColumnEditable(1, false);
		tableModel.setColumnEditable(2, false);
		tableModel.setColumnEditable(3, false);
		tableModel.setColumnEditable(4, false);
		tableModel.setColumnEditable(5, false);
		tableModel.setColumnEditable(6, false);
		tableModel.setColumnEditable(7, false);

		//Set column Sortable
		tableModel.setColumnSortable(0, true);
		tableModel.setColumnSortable(1, true);
		tableModel.setColumnSortable(2, true);
		tableModel.setColumnSortable(3, true);
		tableModel.setColumnSortable(4, false);
		tableModel.setColumnSortable(5, false);
		tableModel.setColumnSortable(6, false);
		tableModel.setColumnSortable(7, false);

		var custom = {
			tablePaneScroller : function(obj, window) {
				return new eyeos.ui.tabs.Events.Scroller(obj);
			},
			tableColumnModel: function(obj) {
				return new qx.ui.table.columnmodel.Resize(obj);
			}
		};
		this.base(arguments, tableModel, custom);
		this.set({
			columnVisibilityButtonVisible: false,
			statusBarVisible: false,
			decorator: null,
			dataRowRenderer: new eyeos.ui.tabs.rowrendererDefault(),
			rowHeight: 25
		});

		this._buildGui();
		this._addMyListeners();

	},

	members: {
		_tableModel: null,
		_checknum: null,

		_addMyListeners: function () {
			var bus = eyeos.messageBus.getInstance();
			bus.addListener('eyeos_events_aboutToRemove', function (e) {
				var eventId = e.getData()[0];
				var isQuestion = e.getData()[1];
				if (isQuestion) {
					var op = new eyeos.dialogs.OptionPane(
						tr("You cannot delete an event without provide an action!"),
						eyeos.dialogs.OptionPane.ERROR_MESSAGE);
					var d = op.createDialog(this, tr("Invalid Action"), function(result) {
						eyeos.consoleInfo(result);
					});
					d.open();
				} else {
					this._removeEvent(eventId);
				}

			}, this);
			
			bus.addListener('eyeos_events_eventEnded', function (e) {
				var eventId = e.getData();
				this._markAsRead(eventId);
			}, this);


		},

		_buildGui: function () {
			// This ==should== not provide selection on the table
			this.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.NO_SELECTION);

			// Defining type HTML for column 5 (The buttons)
			var tcm = this.getTableColumnModel();
			tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Html());
			tcm.setDataCellRenderer(5, new qx.ui.table.cellrenderer.Html());
			tcm.setDataCellRenderer(6, new qx.ui.table.cellrenderer.Html());

			//Set column visibility
			tcm.setColumnVisible(0, true);
			tcm.setColumnVisible(1, true);
			tcm.setColumnVisible(2, true);
			tcm.setColumnVisible(3, true);
			tcm.setColumnVisible(4, true);
			tcm.setColumnVisible(5, true);
			tcm.setColumnVisible(6, true);
			tcm.setColumnVisible(7, false);

			// Defining Width with %
			var resizeBehavior = tcm.getBehavior();
			resizeBehavior.setWidth(0, '2%');
			resizeBehavior.setMinWidth(0, 20);
			resizeBehavior.setMaxWidth(0, 20);
			resizeBehavior.setWidth(1, '46%');
			resizeBehavior.setWidth(2, '8%');
			resizeBehavior.setWidth(3, '9%');
			resizeBehavior.setWidth(4, '16%');
			resizeBehavior.setWidth(5, '17%');
			resizeBehavior.setWidth(6, '2%');
			resizeBehavior.setMinWidth(6, 20);
			resizeBehavior.setMaxWidth(6, 20);
		},

		filterByText: function (filter)  {
			var tm = this.getTableModel();
			if (filter.length > 0) {
				tm.addNotRegex(filter, tr('Name'), true);
				tm.applyFilters();
			} else {
				tm.resetHiddenRows();
			}
		},

		_removeEvent: function (eventId) {
			var tableModel = this.getTableModel().getData();
			var idColumn = this.__getColumn(tableModel, 7);

			var rowEvent = idColumn.indexOf(eventId);
			if (rowEvent == -1) {
//				console.log('WARN: You tried to remove an unexisting event');
			} else {
				var param = {
					id: eventId
				};
				eyeos.callMessage(this._checknum, '__Events_deleteEvents', param, function(actions) {
					this.getTableModel().removeRows(rowEvent, 1);
					this.updateContent();
				}, this);
			}
		},

		_markAsRead: function (eventId) {
			var tableModel = this.getTableModel();
			var tableModelData = tableModel.getData();
			var idColumn = this.__getColumn(tableModelData, 7);
			var rowEvent = idColumn.indexOf(eventId);
			if (rowEvent == -1) {
//				console.log('WARN: You tried to mark as read an unexisting event');
			} else {
				tableModel.setValue(5, rowEvent, null);
				this.updateContent();
			}

		},

		__getColumn: function (table, column) {
			var myColumn = new Array();
			for (var i = 0; i < table.length; ++i) {
				myColumn.push(parseInt(table[i][column]));
			}

			return myColumn;
		},

		/**
		  * Print the Events on the Table
		  */
		printEvents: function (myEvents) {
			this._cleanTableContent();
			
			for (var i = 0; i < myEvents.length; ++i) {
				this._printSingleEvent(myEvents[i]);
			}
		},

		/**
		  * Clean the Content of the table
		  */
		_cleanTableContent: function () {
			this.getTableModel().setData(new Array());
			this.updateContent();
		},

		/**
		  * Print Single Event
		  */
		_printSingleEvent: function (event) {
			var imageCell = this._createImageCell(event);
			var nameCell = event.getMessageInformation();
			var methodCell = this._createMethodCell(event);
			var sectionCell = this._createSectionCell(event);
			var dataCell = this._createDataCell(event);
			var buttonsCell = this._createButtonsCell(event);
			var clearCell = this._createClearCell(event);

			this.getTableModel().addRows([[imageCell, nameCell, methodCell, sectionCell, dataCell, buttonsCell, clearCell, event.getId()]]);
		},

		/**
			 * Create the Html for Image
			 */
		_createImageCell: function (event) {
			var type = event.getType();
			type = type.substring(0, type.indexOf('_'));
			var path = null;
			switch (type) {
				case 'Files':
					path = 'index.php?extern=images/events/activ_files-12x12.png';
					break;
				case 'Applications':
					path = 'index.php?extern=images/events/activ_appli-12x12.png';
					break;
				case 'Dashboard':
					path = 'index.php?extern=images/events/activ_dashboard-12x12.png';
					break;
				case 'People':
					path = 'index.php?extern=images/events/activ_people-12x12.png';
					break;
				case 'Groups':
					path = 'index.php?extern=images/events/activ_groups-12x12.png';
					break;
				default:
					path = 'index.php?extern=images/events/activ_base-12x12.png';
			}
			return '<div style="text-align: center;"><IMG SRC="' + path + '" ALT="image"></div>';
		},

		/**
			 * Create the Text for Method Column
			 */
		_createMethodCell: function (event) {
			if (event.getSender() == event.getReceiver()) {
				return 'Sent by me';
			} else {
				return 'Received';
			}
		},

		/**
			 * Create the Text for Section Column
			 */
		_createSectionCell: function (event) {
			var type = event.getType();
			return type.substring(0, type.indexOf('_'));
		},

		/**
			 * Create the Text for Data Column
			 */
		_createDataCell: function (event) {
			var myDate = new Date(event.getCreationDate() * 1000);
			var days = (myDate.getDate() < 10) ? ('0' + myDate.getDate()) : myDate.getDate();
			var months = ((myDate.getMonth() + 1) < 10) ? ('0' + (myDate.getMonth() + 1)) : (myDate.getMonth() + 1);
			var years = myDate.getFullYear();
			var hours = (myDate.getHours() < 10) ? ('0' + myDate.getHours()) : (myDate.getHours());
			var minutes = (myDate.getMinutes() < 10) ? ('0' + myDate.getMinutes()) : (myDate.getMinutes());

			return days + '/' + months + '/' + years + '\t' + hours + ':' + minutes;
		},

		/**
			 * Create the HTML for Buttons Column
			 */
		_createButtonsCell: function (event) {
			if (event.getIsQuestion() == 1 && event.getHasEnded() == 0) {
				var answers = event.getAvailableAnswers().split('#');
				var returnValue = '';
				for (var i = 0; i < answers.length; ++i) {
					returnValue = returnValue + '' + this._createAnswerButton(event, answers[i]);
				}

				return '<p align = "center" style="margin: 0; padding: 0">' + returnValue + '</p>';
			} else {
				return '';
			}
		},

		_createAnswerButton: function (event, question) {
			var eventId = event.getId();
			return '<input type="button" value="' + question + '" onclick = "eyeos.ui.tabs.Events.Table.REPLY_ANSWER(' + eventId + ', \'' + question + '\', ' + this._checknum +');" style = " padding: 0px; font-family: \'Lucida Grande\', \'Verdana\', \'Arial\', \'Sans-serif\'; font-size: 11px; color: #404040">&nbsp&nbsp';
		},

		_createClearCell: function (event) {
			var eventId = event.getId();

			return  '<center>'
			+ '<div style="cursor: pointer; margin-top: 5px; width: 10px; line-height: 0px; padding: 4px" onclick = "eyeos.ui.tabs.Events.Table.DELETE_EVENT(' + eventId + ',' + event.getIsQuestion() + ');">'
			+ '<img src="index.php?extern=/images/clear.png" style = "margin: 0px; padding: 0px"></img>'
			+ '</div>'
			+ '</center>';
		}
	}
});