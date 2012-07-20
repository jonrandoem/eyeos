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

qx.Class.define('eyeos.calendar.view.EventPopup', {
	extend: qx.ui.popup.Popup,
	
	/**
	 * TODO
	 * 
	 * @param eventModel {eyeos.calendar.model.Event}
	 * @param eventView {eyeos.calendar.view.Event}
	 */
	construct: function (eventView) {
		arguments.callee.base.call(this, new qx.ui.layout.VBox(2));
		
		this.__eventModel = eventView.getModel();
		this.setController(eventView.getController());
		if (!this.getController()) {
			throw '[eyeos.calendar.view.EventPopup] construct() Missing controller in eventView.';
		}
		// cis team
		this._eventView=eventView;
		// cis team
		this.__init();
		
		this.addListener('keypress', function(e) {
			if (e.getKeyIdentifier().toLowerCase() == 'escape') {
				this.cancel();
			}
		}, this);
	},
	
	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller'
		}
	},
	
	members: {
		
		__eventModel: null,
		
		__subjectTextField: null,
		__calendarSelectBox: null,
		
		
		__init: function() {
			this.set({
				height: 170,
				width: 300,
				padding: 15,
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#b1afb1', 0, 5, 5, 5, 5).set({
					backgroundColor: '#ffffff'
				}),
				autoHide: false
			});
			
			var title = tr('Edit Event');
			if (this.__eventModel.getId() == null) {
				title = tr('New Event');
			}
		
			// FIRST LINE (title)
			var firstContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				paddingBottom: 8
			});
			this.add(firstContainer);
			firstContainer.add(new qx.ui.basic.Label(title).set({
				font: new qx.bom.Font(18, ['Sans-serif']),
				textAlign: 'center',
				textColor: '#4f565c'
				//paddingTop: -5
			}));
		
			// SECOND LINE (when, subject, calendar)
			var secondContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5)).set({
				paddingBottom: 4
			});
			secondContainer.getLayout().setColumnFlex(1, 1);
			this.add(secondContainer, {flex: 1});
			
			// Format day & time
			var dateStart = this.__eventModel.getTimeStart();
			var format = qx.locale.Date.getDateFormat('medium');
			var dayStart = new qx.util.format.DateFormat(format).format(dateStart);
			
			var timeLabel = null;
			if (this.__eventModel.isAllDay()) {
				timeLabel = dayStart + ' - ' + new qx.util.format.DateFormat(format).format(this.__eventModel.getTimeEnd());
			} else {
				format = qx.locale.Date.getTimeFormat('short');
				var timeStart = new qx.util.format.DateFormat(format).format(dateStart);
				var timeEnd = new qx.util.format.DateFormat(format).format(this.__eventModel.getTimeEnd());
				timeLabel = dayStart + ' - ' + timeStart + '-' + timeEnd;
			}
			
			// Labels & textfields
			secondContainer.add(new qx.ui.basic.Label(tr('When:')), {row: 0, column: 0});
			secondContainer.add(new qx.ui.basic.Label(timeLabel).set({
				textColor: '#4886ce'
			}), {row: 0, column: 1});
			
			secondContainer.add(new qx.ui.basic.Label(tr('Subject:')), {row: 1, column: 0});
			this.__subjectTextField = new qx.ui.form.TextField(this.__eventModel.getSubject());
			this.__subjectTextField.focus();
			this.__subjectTextField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this.saveAndClose();
				}
			}, this);
			secondContainer.add(this.__subjectTextField, {row: 1, column: 1});
			
			// Calendars list with select box
			secondContainer.add(new qx.ui.basic.Label(tr('Calendar')+':'), {row: 2, column: 0});
			var calendars = this.getController().getCalendars();
			this.__calendarSelectBox = new qx.ui.form.SelectBox();
			for(var id in calendars) {
				var item = new qx.ui.form.ListItem(calendars[id].getName()).set({
					model: calendars[id]
				});
				this.__calendarSelectBox.add(item);
				if (id == this.__eventModel.getCalendar().getId()) {
					this.__calendarSelectBox.setSelection([item]);
				}
			}
			// cis team
			var calendars = this.getController().getGroupcalendars();
		
			for(var id in calendars) {
				var item = new qx.ui.form.ListItem(calendars[id].getName()).set({
					model: calendars[id]
				});
				this.__calendarSelectBox.add(item);
				if (id == this.__eventModel.getCalendar().getId()) {
					this.__calendarSelectBox.setSelection([item]);
				}
			}
			// cis team
			this.__calendarSelectBox.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					this.saveAndClose();
				}
			}, this);
			secondContainer.add(this.__calendarSelectBox, {row: 2, column: 1});
			
			// THIRD LINE (buttons)
			var thirdContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(2, 2));
			this.add(thirdContainer);
			thirdContainer.getLayout().setColumnFlex(1, 1);
			
			var addDetailsButton = new qx.ui.form.Button(tr('Add more details'));
			addDetailsButton.addListener('execute', function(e) {
				// Commit pending values to the model
				this.__eventModel.setSubject(this.__subjectTextField.getValue());
				this.__eventModel.setCalendar(this.__calendarSelectBox.getSelection()[0].getModel());
				
				var dialog = new eyeos.calendar.dialogs.EditEvent(this.getController(), this.__eventModel);
				dialog.open();
				this.close();
			}, this);
			thirdContainer.add(addDetailsButton, {row: 0, column: 0});
			var cancelButton = new qx.ui.form.Button(tr('Cancel'));
			cancelButton.addListener('execute', function(e) {
				this.cancel();
			}, this);
			thirdContainer.add(cancelButton, {row: 0, column: 2});
			var saveButton = new qx.ui.form.Button(tr('Save'));
			saveButton.addListener('execute', function(e) {
				this.saveAndClose();
			}, this);
			thirdContainer.add(saveButton, {row: 0, column: 3});
		},
		
		cancel: function() {
			if (this.__eventModel.getId() == null) {
				this.getController().cancelNewEvent(this.__eventModel);
			}
			//cis team
			this._eventView.setMoveable(true);
			// cis team
			this.close();
		},
		
		close: function() {
			this.destroy();
			this.getController().setProcVar('eyeos.calendar.view.EventPopup.instance', null);
		},
		
		saveAndClose: function() {
			this.__eventModel.setSubject(this.__subjectTextField.getValue());
			this.__eventModel.setCalendar(this.__calendarSelectBox.getSelection()[0].getModel());
			
			this.getController().saveEvent(this.__eventModel, function() {
				// If the event belongs to a currently non-visible calendar, show it
				if (!this.__eventModel.getCalendar().isVisible()) {
					this.__eventModel.getCalendar().setVisible(true);
				}
			}, this);
			// cis team
			this._eventView.setMoveable(true);			

			var sDate=new Date();
			if(parseInt(sDate.getDay())== 0)
			{
				sDate.setDate(sDate.getDate() + 1);
			}
			this.getController().setCalendarSelectedDate(sDate);
			// cis team
			this.close();
		},
		
		show: function() {
			var displayedPopup = this.getController().getProcVar('eyeos.calendar.view.EventPopup.instance');
			if (displayedPopup) {
				try {
					displayedPopup.cancel();
				} catch (e) {
					eyeos.consoleWarn(e);
				}
			}
			this.getController().setProcVar('eyeos.calendar.view.EventPopup.instance', this);
			this.base(arguments);
			// cis team
			this._eventView.setMoveable(false);
			// cis team
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});