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

qx.Class.define('eyeos.calendar.dialogs.EditEvent', {
	extend: eyeos.dialogs.Dialog,
	
	/**
	 * TODO
	 * 
	 * @param eventModel {eyeos.calendar.model.Event}
	 */
	construct: function (eventView) {
        this.__eventView = eventView;
		this.__eventModel = eventView.getModel();
		this.__controller = eventView.getController();
        this.__eventContextMenu = this.__eventView.getContextMenu();
		if (!this.__controller) {
			throw '[eyeos.calendar.dialogs.EditEvent] construct() Missing controller argument.';
		}
		var title = tr('Event Details');
         if (this.__eventModel.getId() == null) {
				title = tr('New Event');
		 }
		arguments.callee.base.call(this, title, 'index.php?extern=images/16x16/actions/appointment-new.png');
		
		this.addListener('keypress', function(e) {
			if (e.getKeyIdentifier().toLowerCase() == 'escape') {
				this.cancel();
			}
		}, this);
	},
	properties: {
		isEditAll: {
			init: false
		}
        },
	members: {
		
          __controller: null,
          __eventModel: null,

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
          __eventView: null,

          __saveChanges: function() {
              var startTime = this.__startDateField.getValue();
              startTime.setHours(0);
              startTime.setMinutes(0);
              startTime.setSeconds(0);
              startTime.setMilliseconds(0);
              startTime.setMinutes(30 * this.__startTimeSelectBox.getSelection()[0].getModel());

              var endTime = this.__startDateField.getValue();
              endTime.setHours(0);
              endTime.setMinutes(0);
              endTime.setSeconds(0);
              endTime.setMilliseconds(0);
              endTime.setMinutes(30 * this.__endTimeSelectBox.getSelection()[0].getModel());

              if (endTime.getTime() <= startTime.getTime()) {
                  eyeos.alert(tr('Please specify a correct time range.'));
                  return;
              }

              this.__eventModel.setSubject(this.__subjectTextField.getValue());
              this.__eventModel.setLocation(this.__locationTextField.getValue());
              this.__eventModel.setTimeStart(startTime);
              this.__eventModel.setTimeEnd(endTime);
              this.__eventModel.setAllDay(this.__allDayCheckBox.getValue());
              this.__eventModel.setRepetition(this.__repeatsSelectBox.getSelection()[0].getModel());
              this.__eventModel.setRepeatType(this._getRepeatType(this.__repeatsSelectBox.getSelection()[0].getModel()));
              this.__eventModel.setFinalType(this._getFinalType(this.__finalSelectBox.getSelection()[0].getModel()));
              if (this.__finalSelectBox.getSelection()[0].getModel()=="OnTheDate"){
                      var finalValue = this.__finalDateField.getValue();
                      finalValue.setHours(0);
                      finalValue.setMinutes(0);
                      finalValue.setSeconds(0);
                      finalValue.setMilliseconds(0);
                      if (finalValue.getTime() < startTime.getTime()) {
                              eyeos.alert(tr('Please specify a correct repeat time range.'));
                              return;
                      }
                      this.__eventModel.setFinalValue(finalValue.getTime() / 1000);
              } else if  (this.__finalSelectBox.getSelection()[0].getModel()=="After"){
                      this.__eventModel.setFinalValue(this.__timesTextField.getValue());
              } else {
                       this.__eventModel.setFinalValue("0");
              }
              this.__eventModel.setCalendar(this.__calendarSelectBox.getSelection()[0].getModel());
              this.__eventModel.setDescription(this.__descriptionTextArea.getValue());

              this.__controller.saveEvent(this.__eventModel, function() {
                  // If the event belongs to a currently non-visible calendar, show it
                  if (!this.__eventModel.getCalendar().isVisible()) {
                      this.__eventModel.getCalendar().setVisible(true);
                  }
              }, this);
           },
           _getRepeatType:function(fulVal){
                      switch(fulVal){
                          case 'EveryDay':
                             return 'd'
                              break;
                          case 'EveryWeek':
                              return 'w'
                              break;
                         case 'EveryMonth':
                              return 'm'
                              break;
                         case 'EveryYear':
                              return 'y'
                              break;
                        default:
                            return 'n';
                      }
          },
          _getFinalType:function(fulVal){
                      switch(fulVal){
                          case 'None':
                              return 1;
                              break;
                          case 'OnTheDate':
                              return 2;
                              break;
                         case 'After':
                              return 3;
                              break;
                      }
        },
          // overridden
        _init: function() {
              this.set({
                  width: 340,
                  contentPadding: 10,
                  resizable: false,
                  showStatusbar: false,
                  showMaximize: false,
                  showMinimize: false,
                  showClose: false,
                  destroyOnClose: true/* ,
                  centerMethod: 'parentWindow'*/
              });
              var myLayout = new qx.ui.layout.Grid(5, 5);
              myLayout.setColumnFlex(1, 1);
              this.setLayout(myLayout);
              var eventTimeStart = this.__eventModel.getTimeStart();
              var eventTimeEnd = this.__eventModel.getTimeEnd();
              var rowIdx = 0;
              // Title
              var titleLabel = new qx.ui.basic.Label(this.__eventModel.getSubject()).set({
                  font: new qx.bom.Font(18, ['Arial', 'sans-serif'])
              });
              this.add(titleLabel, {row: rowIdx++, column: 1});
              this.add(new qx.ui.menu.Separator(), {row: rowIdx++, column: 0, colSpan: 2});
              // Subject
              this.add(new qx.ui.basic.Label(tr('Subject:')), {row: rowIdx, column: 0});
              this.__subjectTextField = new qx.ui.form.TextField(this.__eventModel.getSubject());
              this.__subjectTextField.addListener('input', function(e) {
                  titleLabel.setValue(e.getData());
              }, this);
              this.__subjectTextField.focus();
              this.add(this.__subjectTextField, {row: rowIdx++, column: 1});
              // Location
              this.add(new qx.ui.basic.Label(tr('Location:')), {row: rowIdx, column: 0});
              this.__locationTextField = new qx.ui.form.TextField(this.__eventModel.getLocation());
              this.add(this.__locationTextField, {row: rowIdx++, column: 1});
              // When
              this.add(new qx.ui.basic.Label(tr('When')+':'), {row: rowIdx, column: 0});
              var whenFieldsContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
              this.add(whenFieldsContainer, {row: rowIdx++, column: 1});
              this.__startDateField = new qx.ui.form.DateField();
              this.__startDateField.setValue(eventTimeStart);
              whenFieldsContainer.add(this.__startDateField, {row: 0, column: 0});
              this.__startTimeSelectBox = new qx.ui.form.SelectBox().set({
                  width: 90,
                  enabled:(!this.__eventModel.getAllDay())
              });
              for(var i = 0; i < 48; i++) {		// Display hh:mm
                  var hours = Math.floor(i / 2) > 9 ? Math.floor(i / 2) : '0' + Math.floor(i / 2);
                  var minutes = ((i % 2) * 30 > 9 ? (i % 2) * 30 : '0' + (i % 2) * 30);
                  var time = hours + ':' + minutes;

                  var item = new qx.ui.form.ListItem(time).set({
                      model: i
                  });
                  this.__startTimeSelectBox.add(item);
                  if (eventTimeStart.getHours() == hours && eventTimeStart.getMinutes() == minutes) {
                      this.__startTimeSelectBox.setSelection([item]);
                      this.__startItem=i;
                  }
              }
              this.__startTimeSelectBox.addListener("changeSelection", function(e) {
                      var itemDiff=this.__endItem - this.__startItem;
                      if (itemDiff>0){
                          var startItem=this.__startTimeSelectBox.getSelection()[0].getModel();
                          var NewItem=startItem+itemDiff;
                          /*var selectedItem = new qx.ui.form.ListItem(time).set({
                          model: NewItem
                          });*/
                          this.__endTimeSelectBox.setModelSelection([NewItem]);
                      }
              }, this);
              whenFieldsContainer.add(this.__startTimeSelectBox, {row: 0, column: 1});
              // --- TEMPORARY IMPLEMENTATION
              this.__endDateField = new qx.ui.form.DateField().set({
                  enabled: false
              });
              this.__endDateField.setValue(eventTimeEnd);
              this.__startDateField.addListener('changeValue', function(e) {
                  this.__endDateField.setValue(e.getData());
              }, this);
              // --- TEMPORARY IMPLEMENTATION
              whenFieldsContainer.add(this.__endDateField, {row: 1, column: 0});
              this.__endTimeSelectBox = new qx.ui.form.SelectBox().set({
                  width: 90,
                  enabled:(!this.__eventModel.getAllDay())
              });
              for(var i = 0; i < 48; i++) {		// Display hh:mm
                  var hours = Math.floor(i / 2) > 9 ? Math.floor(i / 2) : '0' + Math.floor(i / 2);
                  var minutes = ((i % 2) * 30 > 9 ? (i % 2) * 30 : '0' + (i % 2) * 30);
                  var time = hours + ':' + minutes;
                  var item = new qx.ui.form.ListItem(time).set({
                      model: i
                  });
                  this.__endTimeSelectBox.add(item);
                  if (eventTimeEnd.getHours() == hours && eventTimeEnd.getMinutes() == minutes) {
                      this.__endTimeSelectBox.setSelection([item]);
                      this.__endItem=i;
                  }
                  this.__lastEndTime=item;
              }
              whenFieldsContainer.add(this.__endTimeSelectBox, {row: 1, column: 1});
              this.__allDayCheckBox = new qx.ui.form.CheckBox(tr('All Day')).set({
                  enabled: true
              });
              this.__allDayCheckBox.setValue(this.__eventModel.getAllDay());
              if(this.__eventModel.getAllDay()) {
                      this.__startTimeSelectBox.setEnabled(false);
                      this.__endTimeSelectBox.setEnabled(false);
                      this.__startTimeSelectBox.resetSelection();
                      this.__endTimeSelectBox.setSelection([this.__lastEndTime]);
              }
              this.__allDayCheckBox.addListener('execute', function(e) {
                  if(this.__allDayCheckBox.getValue()){
                      this.__startTimeSelectBox.setEnabled(false);
                      this.__endTimeSelectBox.setEnabled(false);
                      this.__startTimeSelectBox.resetSelection();
                      this.__endTimeSelectBox.setSelection([this.__lastEndTime]);
                  }else{
                      this.__startTimeSelectBox.setEnabled(true);
                      this.__endTimeSelectBox.setEnabled(true);
                  }
              }, this);
              whenFieldsContainer.add(this.__allDayCheckBox, {row: 0, column: 2});
              //Repeats
              this.add(new qx.ui.basic.Label(tr('Repeats:')), {row: rowIdx, column: 0});
              this.__repeatsSelectBox = new qx.ui.form.SelectBox().set({
                  enabled: true,
                  allowGrowX: false
              });
              // repeats options
              this.__repeatsSelectBoxItem1 = new qx.ui.form.ListItem(tr("None")).set({model:'None'});
              this.__repeatsSelectBox.add(this.__repeatsSelectBoxItem1);
              this.__repeatsSelectBoxItem2 = new qx.ui.form.ListItem(tr("Every Day")).set({model:'EveryDay'});
              this.__repeatsSelectBox.add(this.__repeatsSelectBoxItem2);
              this.__repeatsSelectBoxItem3 = new qx.ui.form.ListItem(tr("Every Week")).set({model:'EveryWeek'});
              this.__repeatsSelectBox.add(this.__repeatsSelectBoxItem3);
              this.__repeatsSelectBoxItem4 = new qx.ui.form.ListItem(tr("Every Month")).set({model:'EveryMonth'});
              this.__repeatsSelectBox.add(this.__repeatsSelectBoxItem4);
              this.__repeatsSelectBoxItem5 = new qx.ui.form.ListItem(tr("Every Year")).set({model:'EveryYear'});
              this.__repeatsSelectBox.add(this.__repeatsSelectBoxItem5);
              this.__repeatsSelectBox.resetSelection();
              switch(this.__eventModel.getRepeatType())
              {
                  case 'n':
                          this.__repeatsSelectBox.setSelection([this.__repeatsSelectBoxItem1]);
                          break;
                  case 'd':
                          this.__repeatsSelectBox.setSelection([this.__repeatsSelectBoxItem2]);
                          break;
                 case 'w':
                          this.__repeatsSelectBox.setSelection([this.__repeatsSelectBoxItem3]);
                          break;
                 case 'm':
                          this.__repeatsSelectBox.setSelection([this.__repeatsSelectBoxItem4]);
                          break;
                 case 'y':
                          this.__repeatsSelectBox.setSelection([this.__repeatsSelectBoxItem5]);
                          break;
              }
              this.add(this.__repeatsSelectBox, {row: rowIdx++, column: 1});
              //final
              this.add(new qx.ui.basic.Label(tr('Final:')), {row: rowIdx, column: 0});
              this.__finalSelectBox = new qx.ui.form.SelectBox().set({
                  enabled: true,
                  allowGrowX: false
              });
              // final options
              this.__finalSelectBoxItem1 = new qx.ui.form.ListItem(tr("None")).set({model:'None'});
              this.__finalSelectBox.add(this.__finalSelectBoxItem1);
              this.__finalSelectBoxItem2 = new qx.ui.form.ListItem(tr("On The Date")).set({model:'OnTheDate'});
              this.__finalSelectBox.add(this.__finalSelectBoxItem2);
              this.__finalSelectBoxItem3 = new qx.ui.form.ListItem(tr("After")).set({model:'After'});
              this.__finalSelectBox.add(this.__finalSelectBoxItem3);
              this.__finalDateField = new qx.ui.form.DateField();
              this.__finalDateField.setValue(eventTimeStart);
              this.__timesTextField = new qx.ui.form.TextField().set({width:40});
              this.__timesTextField.addListener("keypress", function(e) {
                   if (isNaN(e.getKeyIdentifier()) && e.getKeyIdentifier() !='Backspace' && e.getKeyIdentifier() !='Delete' && e.getKeyIdentifier() !='Left' && e.getKeyIdentifier() !='Right' ){
                          e.stop();
                          return false;
                    }
                    var val = parseInt(this.__timesTextField.getValue());
                    if (!val) {
                        val = 0;
                    }
                    var val = parseInt( val * 10 + parseInt(e.getKeyIdentifier()));
                    if (val > parseInt(this.__controller.getMaxEventLimt())){
                          this.__timesTextField.setValue(this.__controller.getMaxEventLimt().toString());
                          e.stop();
                    }
              }, this);
              
              var timesLabel = new qx.ui.basic.Label(tr('times (max: '+this.__controller.getMaxEventLimt().toString()+')'));
              var finalSubFieldsContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
              switch(parseInt(this.__eventModel.getFinalType()))
              {
                  case 1:
                          this.__finalSelectBox.setSelection([this.__finalSelectBoxItem1]);
                          break;
                  case 2:
                          this.__finalSelectBox.setSelection([this.__finalSelectBoxItem2]);
                          var eventFinalTime = new Date( );
                          eventFinalTime.setTime( this.__eventModel.getFinalValue() * 1000 );
                          this.__finalDateField.setValue(eventFinalTime);
                          finalSubFieldsContainer.add(this.__finalDateField,{row: 0, column: 1});
                          break;
                  case 3:
                          this.__finalSelectBox.setSelection([this.__finalSelectBoxItem3]);
                          this.__timesTextField.setValue(this.__eventModel.getFinalValue());
                          finalSubFieldsContainer.add(this.__timesTextField,{row: 0, column: 1});
                          finalSubFieldsContainer.add(timesLabel,{row: 0, column: 2});
                          break;
              }
              this.__finalSelectBox.addListener("changeSelection", function(e) {
                  finalSubFieldsContainer.removeAll();
                  if(this.__finalSelectBox.getSelection()[0].getModel() == 'OnTheDate')
                      finalSubFieldsContainer.add(this.__finalDateField,{row: 0, column: 1});
                  else if(this.__finalSelectBox.getSelection()[0].getModel() == 'After'){
                      finalSubFieldsContainer.add(this.__timesTextField,{row: 0, column: 1});
                      finalSubFieldsContainer.add(timesLabel,{row: 0, column: 2});
                  }
              }, this);
              this.finalFieldsContainer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
              this.finalFieldsContainer.add(this.__finalSelectBox,{row: 0, column: 0});
              this.finalFieldsContainer.add(finalSubFieldsContainer,{row: 0, column: 1});
              this.add(this.finalFieldsContainer, {row: rowIdx++, column: 1});
              this.setVisibilityOfFinal();
              this.__repeatsSelectBox.addListener("changeSelection", function(e) {
                  this.setVisibilityOfFinal();
              }, this);
              this.add(new qx.ui.menu.Separator(), {row: rowIdx++, column: 0, colSpan: 2});
              // Calendar
              this.add(new qx.ui.basic.Label(tr('Calendar')+':'), {row: rowIdx, column: 0});
              this.__calendarSelectBox = new qx.ui.form.SelectBox().set({
                  allowGrowX: false
              });
              var calendars = this.__controller.getCalendars();
              for(var id in calendars) {
                  var item = new qx.ui.form.ListItem(calendars[id].getName()).set({
                      model: calendars[id]
                  });
                  this.__calendarSelectBox.add(item);
                  if (id == this.__eventModel.getCalendar().getId()) {
                      this.__calendarSelectBox.setSelection([item]);
                  }
              }
			  // add group calendars
              var groupCalendars = this.__controller.getGroupcalendars();
              for(var id in groupCalendars) {
                  var item = new qx.ui.form.ListItem(groupCalendars[id].getName()).set({
                      model: groupCalendars[id]
                  });
                  this.__calendarSelectBox.add(item);
                  if (id == this.__eventModel.getCalendar().getId()) {
                      this.__calendarSelectBox.setSelection([item]);
                  }
              }
			  // add remote calendars
              var remoteCalendars = this.__controller.getRemotecalendars();
              for(var id in remoteCalendars) {
                  var item = new qx.ui.form.ListItem(remoteCalendars[id].getName()).set({
                      model: remoteCalendars[id]
                  });
                  this.__calendarSelectBox.add(item);
                  if (id == this.__eventModel.getCalendar().getId()) {
                      this.__calendarSelectBox.setSelection([item]);
                  }
              }
			  
              this.add(this.__calendarSelectBox, {row: rowIdx++, column: 1});
              // Description
              this.add(new qx.ui.basic.Label(tr('Description')+':'), {row: rowIdx, column: 0});
              this.__descriptionTextArea = new qx.ui.form.TextArea(this.__eventModel.getDescription()).set({
                  wrap: true
              });
              this.add(this.__descriptionTextArea, {row: rowIdx++, column: 1});
              this.add(new qx.ui.menu.Separator(), {row: rowIdx++, column: 0, colSpan: 2});
              // Buttons
              myLayout.setRowAlign(rowIdx, 'right', 'bottom');
              var buttonsContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({
                  alignX: 'right'
              }));
              this.add(buttonsContainer, {row: rowIdx, column: 0, colSpan: 2});
              var deleteButton = new qx.ui.form.Button(tr('Delete'));
              deleteButton.addListener('click', function(e) {
                    if (this.__eventModel.getEventGroup() > 0){
                            var menu = this.__createDeleteMenu("group");
                            menu.setOpener(deleteButton);
                            e.stopPropagation();
                            menu.open();
                    } else {
                        this.__controller.deleteEvent(this.__eventModel,0);
                        this.cancel();
                    }
              }, this);
              buttonsContainer.add(deleteButton);
              buttonsContainer.add(new qx.ui.core.Spacer(180));
              /*var applyButton = new qx.ui.form.Button(tr('Apply'));
              applyButton.addListener('execute', function(e) {
                  this.__saveChanges();
              }, this);
              buttonsContainer.add(applyButton);*/
              var cancelButton = new qx.ui.form.Button(tr('Cancel'));
              cancelButton.addListener('execute', function(e) {
                  this.cancel();
              }, this);
              buttonsContainer.add(cancelButton);
              var saveButton = new qx.ui.form.Button(tr('Save'));
              saveButton.addListener('execute', function(e) {
                      if (this.__eventModel.getEventGroup()>0){
                              var menu = this.__createEditMenu("group");
                              menu.setOpener(saveButton);
                              e.stopPropagation();
                              menu.open();
                     } else {
                          this.saveAndClose();
                          var sDate=this.__startDateField.getValue();
                          if(parseInt(sDate.getDay())== 0)
                          {
                              sDate.setDate(sDate.getDate() + 1);
                          }
                          this.__controller.setCalendarSelectedDate(sDate);
                    }
              }, this);
              buttonsContainer.add(saveButton);
              this.isRemoteEvent();
        },
        isRemoteEvent: function() {
			if(this.__eventModel.getId() != null) {
				  var idArr = this.__eventModel.getId().split('_');
				  if(idArr[0] == 'eyeID') {
					  return true;
				  } else {
						this.__startDateField.set({enabled:false});
						this.__repeatsSelectBox.set({enabled:false});
						this.__finalSelectBox.set({enabled:false});
						this.__finalDateField.set({enabled:false});
						this.__timesTextField.set({enabled:false});
				  }
			}
        },
        setVisibilityOfFinal: function() {
              if(this.__repeatsSelectBox.getSelection()[0].getModel() != 'None')
                      this.finalFieldsContainer.setVisibility('visible');
              else
                  this.finalFieldsContainer.setVisibility('excluded');
        },
        cancel: function() {
              if (this.__eventModel.getId() == null) {
                  this.__controller.cancelNewEvent(this.__eventModel);
              }
              var sDate=this.__startDateField.getValue();
              if(parseInt(sDate.getDay())== 0)
              {
                  sDate.setDate(sDate.getDate() + 1);
              }
              this.__controller.setCalendarSelectedDate(sDate);
              this.close();
        },
        close: function() {
              
              if (this.__eventModel.getId() == null) {
                  this.__controller.cancelNewEvent(this.__eventModel);
              }
              this.destroy();
              var displayedDialogs = this.__controller.getProcVar('eyeos.calendar.dialogs.EditEvent.instances');
              delete displayedDialogs[this.toHashCode()];
              this.__controller.setProcVar('eyeos.calendar.dialogs.EditEvent.instances', displayedDialogs);
              this.__eventView.setDraggable(true);
              this.__eventView.setResizable(true, false, true, false);
        },
        saveAndClose: function() {
              this.__saveChanges();
              this.close();
        },
        open: function(e) {
              this.__eventView.setMoveable(false);
              var displayedDialogs = this.__controller.getProcVar('eyeos.calendar.dialogs.EditEvent.instances');

              if (!displayedDialogs) {
                  displayedDialogs = {};
              }else{
                  var displayedDialogs = this.__controller.getProcVar('eyeos.calendar.dialogs.EditEvent.instances');
                  if (displayedDialogs) {
                      for(var i in displayedDialogs) {
                          try {
                              displayedDialogs[i].close();
                          } catch (e) {
                              eyeos.consoleWarn(e);
                          }
                      }
                  }
              }
              displayedDialogs[this.toHashCode()] = this;
              this.__controller.setProcVar('eyeos.calendar.dialogs.EditEvent.instances', displayedDialogs);
              this.base(arguments);
              if(this.__controller.getProcVar('eyeos.calendar.dialogs.EditEvent.instances')){
                  var parentBounds = this.__controller.getMainWindow().getBounds();
                  var windowMid = parentBounds.left + ( parentBounds.width / 2);
                  var topMargin = 30;
                  var leftMargin = 50;
                  var rightMargin = 20;
                  var containerLocation = this.__eventView.getContainerLocation();
                  this.addListener('appear', function() {
                      if(this.__controller.getCalendarPeriodMode() == "day" ){
                          if(e.getDocumentLeft() > windowMid ){ // if clicked in right of mid
                              this.moveTo((e.getDocumentLeft() - ( this.getWidth() + leftMargin )), (parentBounds.top + topMargin)  );	// Move Left
                          }else{
                              this.moveTo(( e.getDocumentLeft() + rightMargin ), (parentBounds.top + topMargin) ); // Move Right
                          }
                      //}else if(this.__controller.getCalendarPeriodMode() == "month" ) {
                      //	if(e.getDocumentLeft() > windowMid ){ // if clicked in right of mid
                      //		this.moveTo((e.getDocumentLeft() -  this.getWidth()-90), (parentBounds.top + topMargin)  );	// Move Left
                      //	}else{
                      //		this.moveTo(( e.getDocumentLeft()+90  ), (parentBounds.top + topMargin) ); // Move Right
                      //	}

                      } else{

                          if(containerLocation.left > windowMid ){ // if clicked in right of mid
                              this.moveTo((containerLocation.left - ( this.getWidth() + leftMargin )), (parentBounds.top + topMargin)  );	// Move Left
                          }else{
                              this.moveTo(( containerLocation.right + rightMargin ), (parentBounds.top + topMargin) ); // Move Right
                          }
                      }

                  }, this);
              }
              //this.__eventView.setMoveable(false);
              this.__eventView.setDraggable(false);
              this.__eventView.setResizable(false, false, false, false);
        },
        __createDeleteMenu: function(menyType) {
              var menu = new qx.ui.menu.Menu();
              if (menyType == 'group'){
                      menu.add(new qx.ui.menu.Separator());
                      var deleteThisOnly = new qx.ui.menu.Button(tr('Delete only this event'), 'index.php?extern=images/16x16/actions/edit-delete.png')
                      menu.add(deleteThisOnly);
                      deleteThisOnly.addListener('execute', function(e) {
                              this.__controller.deleteEvent(this.__eventModel,0);
                              this.cancel();
                      }, this);
                       menu.add(new qx.ui.menu.Separator());
                      var deleteAll = new qx.ui.menu.Button(tr('Delete all events of this series'), 'index.php?extern=images/calendar/delete_all.png')
                      menu.add(deleteAll);
                      deleteAll.addListener('execute', function(e) {
                              this.__controller.deleteEvent(this.__eventModel,1);
                              this.cancel();
                      }, this);
                       menu.add(new qx.ui.menu.Separator());
              }
              return menu;
        },
        __createEditMenu: function(menyType) {
              var menu = new qx.ui.menu.Menu();
              if (menyType == 'group') {
                      menu.add(new qx.ui.menu.Separator());
                      var deleteThisOnly = new qx.ui.menu.Button(tr('Edit only this event'), 'index.php?extern=images/calendar/edit_event.png')
                      menu.add(deleteThisOnly);
                      deleteThisOnly.addListener('execute', function(e) {
                              this.setIsEditAll(false);
                              this.saveAndClose();
                              var sDate=this.__startDateField.getValue();
                              if(parseInt(sDate.getDay())== 0)
                              {
                                  sDate.setDate(sDate.getDate() + 1);
                              }
                              this.__controller.setCalendarSelectedDate(sDate);
                      }, this);
                      menu.add(new qx.ui.menu.Separator());
                      var deleteAll = new qx.ui.menu.Button(tr('Edit all events of this series'), 'index.php?extern=images/calendar/edit_all.png')
                      menu.add(deleteAll);
                      deleteAll.addListener('execute', function(e) {
                              this.setIsEditAll(true);
                              this.saveAndClose();
                              var sDate=this.__startDateField.getValue();
                              if(parseInt(sDate.getDay())== 0)
                              {
                                  sDate.setDate(sDate.getDate() + 1);
                              }
                              this.__controller.setCalendarSelectedDate(sDate);
                       }, this);
                       menu.add(new qx.ui.menu.Separator());
              }
              return menu;
        },
        destruct : function() {
              //TODO
        }
    }
});