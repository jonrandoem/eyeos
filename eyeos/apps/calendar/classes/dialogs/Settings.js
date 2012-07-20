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

qx.Class.define('eyeos.calendar.dialogs.Settings', {
	extend: eyeos.dialogs.Dialog,
	
	/**
	 * TODO
	 * 
	 * @param eventModel {eyeos.calendar.model.Event}
	 */
	construct: function (controller) {
		this.__controller = controller;
		if (!this.__controller) {
			throw '[eyeos.calendar.dialogs.Settings] construct() Missing controller argument.';
		}
	
		arguments.callee.base.call(this, 'Settings', 'index.php?extern=images/16x16/actions/configure.png');
		
		this.addListener('keypress', function(e) {
			if (e.getKeyIdentifier().toLowerCase() == 'escape') {
				this.cancel();
			}
		}, this);
	},
	
	members: {
		
		__controller: null,
		
		__subjectTextField: null,
		__locationTextField: null,
		__startDateField: null,
		__startTimeSelectBox: null,
		__endDateField: null,
		__endTimeSelectBox: null,
		__allDayCheckBox: null,
		__repeatsSelectBox: null,
		__calendarSelectBox: null,
		__descriptionTextArea: null,
		
		__calendarsSelectBox: null,
		
		
		__getCalendarsTab: function() {
			var page = new qx.ui.tabview.Page('Calendars', 'index.php?extern=images/16x16/actions/view-pim-calendar.png');
			var layout = new qx.ui.layout.Grid();
			page.setLayout(layout);
			layout.setColumnFlex(0, 1);
			layout.setColumnWidth(1, 10);
			layout.setColumnFlex(2, 1);
			
			//...TODO...
			
			return page;
		},
		
		__getGeneralTab: function() {
			var page = new qx.ui.tabview.Page('General', 'index.php?extern=images/16x16/actions/configure.png');
			var layout = new qx.ui.layout.Grid();
			page.setLayout(layout);
			layout.setColumnFlex(0, 1);
			layout.setColumnFlex(1, 2);
			layout.setColumnAlign(0, 'left', 'middle');
			layout.setColumnAlign(1, 'left', 'middle');
			layout.setSpacingX(20);
			layout.setSpacingY(6);
			
			var row = 0;
			
			// LANGUAGE
			var languageLabel = new qx.ui.basic.Label('Language');
			page.add(languageLabel, {row: row, column: 0});
			var languageSelectBox = new qx.ui.form.SelectBox().set({
				enabled: false
			});
			page.add(languageSelectBox, {row: row, column: 1});
			
			row++;
			
			//COUNTRY
			var countryLabel = new qx.ui.basic.Label('Country');
			page.add(countryLabel, {row: row, column: 0});
			var countrySelectBox = new qx.ui.form.SelectBox().set({
				enabled: false
			});
			countrySelectBox.add(new qx.ui.form.ListItem('World!'));
			page.add(countrySelectBox, {row: row, column: 1});
			
			row++;
			
			//TIMEZONE
			var timezoneLabel = new qx.ui.basic.Label('Timezone');
			page.add(timezoneLabel, {row: row, column: 0});
			var timezoneSelectBox = new qx.ui.form.SelectBox();
			var tz = Date.getTimezones();
			for(var i = 0; i < tz.length; i++) {
				timezoneSelectBox.add(new qx.ui.form.ListItem(tz[i].label).set({
					model: tz[i].offset
				}));
			}
			page.add(timezoneSelectBox, {row: row, column: 1});
			
			row++;
			
			//DATE FORMAT
			var dateFormatLabel = new qx.ui.basic.Label('Date Format');
			page.add(dateFormatLabel, {row: row, column: 0});
			var dateFormatSelectBox = new qx.ui.form.SelectBox();
			var df = Date.getDateFormats();
			for(var i in df) {
				dateFormatSelectBox.add(new qx.ui.form.ListItem(df[i]).set({
					model: i
				}));
			}
			page.add(dateFormatSelectBox, {row: row, column: 1});
			
			row++;
			
			//TIME FORMAT
			var timeFormatLabel = new qx.ui.basic.Label('Time Format');
			page.add(timeFormatLabel, {row: row, column: 0});
			var timeFormatSelectBox = new qx.ui.form.SelectBox();
			var tf = Date.getTimeFormats();
			for(var i in tf) {
				timeFormatSelectBox.add(new qx.ui.form.ListItem(tf[i]).set({
					model: i
				}));
			}
			page.add(timeFormatSelectBox, {row: row, column: 1});
			
			row++;
			
			//SHOW WEEK-ENDS
			var showWELabel = new qx.ui.basic.Label('Show Week-ends');
			page.add(showWELabel, {row: row, column: 0});
			var showWEContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			var showWEYesRadioButton = new qx.ui.form.RadioButton('Yes');
			showWEContainer.add(showWEYesRadioButton);
			var showWENoRadioButton = new qx.ui.form.RadioButton('No');
			showWEContainer.add(showWENoRadioButton);
			var showWERadioGroup = new qx.ui.form.RadioGroup(
				showWEYesRadioButton,
				showWENoRadioButton
			);
			page.add(showWEContainer, {row: row, column: 1});
			
			row++;
			
			//DEFAULT VIEW
			var defaultViewLabel = new qx.ui.basic.Label('Default View');
			page.add(defaultViewLabel, {row: row, column: 0});
			var defaultViewSelectBox = new qx.ui.form.SelectBox();
			defaultViewSelectBox.add(new qx.ui.form.ListItem('Day'));
			defaultViewSelectBox.add(new qx.ui.form.ListItem('Week'));
			defaultViewSelectBox.add(new qx.ui.form.ListItem('Month'));
			defaultViewSelectBox.add(new qx.ui.form.ListItem('Year'));
			defaultViewSelectBox.add(new qx.ui.form.ListItem('Agenda'));
			page.add(defaultViewSelectBox, {row: row, column: 1});
			
			row++;
			
			//CUSTOM VIEW
			var customViewLabel = new qx.ui.basic.Label('Custom View');
			page.add(customViewLabel, {row: row, column: 0});
			var customViewSelectBox = new qx.ui.form.SelectBox().set({
				enabled: false
			});
			customViewSelectBox.add(new qx.ui.form.ListItem('2 Days'));
			customViewSelectBox.add(new qx.ui.form.ListItem('3 Days'));
			customViewSelectBox.add(new qx.ui.form.ListItem('4 Days'));
			customViewSelectBox.add(new qx.ui.form.ListItem('5 Days'));
			customViewSelectBox.add(new qx.ui.form.ListItem('6 Days'));
			page.add(customViewSelectBox, {row: row, column: 1});
			
			row++;
			
			//DISPLAY DECLINED EVENTS
			var displayDeclinedEventsLabel = new qx.ui.basic.Label('Display declined events').set({
				rich: true
			});
			page.add(displayDeclinedEventsLabel, {row: row, column: 0});
			var displayDeclinedEventsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			var displayDeclinedEventsYesRadioButton = new qx.ui.form.RadioButton('Yes');
			displayDeclinedEventsContainer.add(displayDeclinedEventsYesRadioButton);
			var displayDeclinedEventsNoRadioButton = new qx.ui.form.RadioButton('No');
			displayDeclinedEventsContainer.add(displayDeclinedEventsNoRadioButton);
			var displayDeclinedEventsRadioGroup = new qx.ui.form.RadioGroup(
				displayDeclinedEventsYesRadioButton,
				displayDeclinedEventsNoRadioButton
			);
			page.add(displayDeclinedEventsContainer, {row: row, column: 1});
			
			row++;
			
			//ADD INVITATIONS TO CALENDAR
			var addInvitationsLabel = new qx.ui.basic.Label('Automatically add invitations to my calendar').set({
				rich: true
			});
			page.add(addInvitationsLabel, {row: row, column: 0});
			var addInvitationsContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			var addInvitationsYesRadioButton = new qx.ui.form.RadioButton('Yes');
			addInvitationsContainer.add(addInvitationsYesRadioButton);
			var addInvitationsNoRadioButton = new qx.ui.form.RadioButton('No');
			addInvitationsContainer.add(addInvitationsNoRadioButton);
			var addInvitationsRadioGroup = new qx.ui.form.RadioGroup(
				addInvitationsYesRadioButton,
				addInvitationsNoRadioButton
			);
			page.add(addInvitationsContainer, {row: row, column: 1});
			
			return page;
		},
		
		// overridden
		_init: function() {
			this.set({
				//height: 420,
				width: 400,
				minHeight: 500,
				contentPadding: 10,
				resizable: false,
				showStatusbar: false,
				showMaximize: false,
				showMinimize: false,
				showClose: false,
				destroyOnClose: true,
				centerMethod: 'parentWindow'
			});
			var myLayout = new qx.ui.layout.VBox(5);
			this.setLayout(myLayout);
			
			//
			//	TABS
			//
			var tabView = new qx.ui.tabview.TabView('top');
			this.add(tabView, {flex: 1});
			
			tabView.add(this.__getGeneralTab());
			tabView.add(this.__getCalendarsTab());
			//tabView.add(this.__getImportTab());
			//tabView.add(this.__getExportTab());
			
			this.add(new qx.ui.menu.Separator());
			
			//
			//	BUTTONS
			//
			var buttonsContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({
				alignX: 'right'
			}));
			this.add(buttonsContainer);
			
			var applyButton = new qx.ui.form.Button(tr('Apply'));
			applyButton.setEnabled(false);
			buttonsContainer.add(applyButton);
			var cancelButton = new qx.ui.form.Button(tr('Cancel'));
			cancelButton.addListener('execute', function(e) {
				this.cancel();
			}, this);
			buttonsContainer.add(cancelButton);
			var saveButton = new qx.ui.form.Button(tr('Save'));
			saveButton.addListener('execute', function(e) {
				this.saveAndClose();
			}, this);
			buttonsContainer.add(saveButton);
		},
		
		cancel: function() {
			//TODO
			
			this.close();
		},
		
		close: function() {
			this.destroy();
			this.__controller.setProcVar('eyeos.calendar.dialogs.Settings.instance', undefined);
		},
		
		saveAndClose: function() {
			//TODO
			
			this.close();
		},
		
		open: function() {
			var displayedDialog = this.__controller.getProcVar('eyeos.calendar.dialogs.Settings.instance');
			if (displayedDialog) {
				this.destroy();
				return;
			}
			this.__controller.setProcVar('eyeos.calendar.dialogs.Settings.instance', this);
			this.base(arguments);
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});