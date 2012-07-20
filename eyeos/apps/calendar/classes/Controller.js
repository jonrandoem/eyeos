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

qx.Class.define('eyeos.calendar.Controller', {
	extend: qx.core.Object,
	
	construct: function(checknum) {
		arguments.callee.base.call(this);
		
		this.__checknum = checknum;
		
		this.setCalendarSelectedDate(new Date());
	},
	
	events: {
		createCalendar: 'qx.event.type.Data',
		deleteCalendar: 'qx.event.type.Data',
		createEvent: 'qx.event.type.Data',
		deleteEvent: 'qx.event.type.Data',
		loadEvents: 'qx.event.type.Data',
		changeCalendarVisibility: 'qx.event.type.Data'
	},
	
	properties: {
		calendars: {
			init: {},
			check: 'Map',
			event: 'changeCalendars'
		},
		groupcalendars: {					
			init: {},
			check: 'Map',
			event: 'changeCalendars'
		},
        remotecalendars: {
			init: {},
			check: 'Map',
			event: 'changeRemoteCalendars'
		},
		calendarMode: {
			init: eyeos.calendar.Constants.MODE_DEFAULT,
			check: eyeos.calendar.Constants.MODES,
			event: 'changeCalendarMode'
		},
		
		calendarPeriodMode: {
			init: eyeos.calendar.Constants.PERIOD_MODE_DEFAULT,
			check: eyeos.calendar.Constants.PERIOD_MODES,
			event: 'changeCalendarPeriodMode',
			apply: '_applyCalendarPeriodMode'
		},
		
		calendarCurrentPeriod: {
			init: {
				begin: new Date(),
				end: new Date()
			},
			check: 'Map',
			event: 'changeCalendarCurrentPeriod'
		},
		
		calendarSelectedDate: {
			check: 'Date',
			event: 'changeCalendarSelectedDate',
			apply: '_applyCalendarSelectedDate'
		},
        
        mainWindow: {
            init:null
        },
        maxEventLimt: {
          init:null
        }
	},
	
	members: {
        __checknum: null,
		__procVars: {},
		__registeredViewParts: null,
		
		/**
		 * @var {Map} eyeos.calendar.model.Event
		 */
		__eventModels: {},
		
		/**
		 * @var {Array} eyeos.calendar.model.Event
		 */
		__unsavedEventModels: [],
		
		
		__onCalendarChangeVisibility: function(e) {
			this.fireDataEvent('changeCalendarVisibility', e.getTarget());
		},
		
		__onCalendarEventsLoaded: function(calendar, eventsData) {
            //console.log(eventsData.length);
			for (var i = 0; i < eventsData.length; i++) {
				eventsData[i].calendar = calendar;
				var event = eyeos.calendar.model.Event.fromJson(eventsData[i]);
				this.__eventModels[event.getId()] = event;
			}
            //console.log(this.__eventModels);
			this.fireDataEvent('loadEvents', eventsData);
		},
		
		__onCalendarPreferencesSaved: function(calendar) {
			eyeos.consoleInfo('Calendar preferences saved: [' + calendar.getId() + '] "' + calendar.getName() + '"');
		},
		
		__onCalendarSaved: function(calendar, calendarData) {
			// Update model object with the values generated on the server-side
			eyeos.calendar.model.Calendar.fromJson(calendarData, calendar);
			this.getCalendars()[calendar.getId()] = calendar;
			
			calendar.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
			
			eyeos.consoleInfo('Calendar saved: [' + calendar.getId() + '] "' + calendar.getName() + '"');
			this.fireDataEvent('createCalendar', calendar);
		},
		__onRemoteCalendarSaved: function(calendar, calendarData) {
			// Update model object with the values generated on the server-side
			eyeos.calendar.model.Calendar.fromJson(calendarData, calendar);
			this.getRemotecalendars()[calendar.getId()] = calendar;
			
			calendar.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
			
			eyeos.consoleInfo('Remote Calendar saved: [' + calendar.getId() + '] "' + calendar.getName() + '"');
			this.fireDataEvent('createRemoteCalendar', calendar);
		},
		__onCalendarDeleted: function(calendar, data) {
			var calendars = {};
			for(var i = 0; i < data.length; i++) {
				var cal = eyeos.calendar.model.Calendar.fromJson(data[i])
				cal.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
				cal.addListener('changeColor', this.__onChangeCalendarPreferences, this);
				calendars[cal.getId()] = cal;
			}
			this.setCalendars(calendars);
					
			this.fireDataEvent('deleteCalendar', calendar);
			this.init();
			this.setCalendarSelectedDate(this.getCalendarSelectedDate());
		},
		__onRemoteCalendarDeleted: function(calendar, data) {
			var calendars = {};
			for(var i = 0; i < data.length; i++) {
				var cal = eyeos.calendar.model.Calendar.fromJson(data[i])
				cal.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
				cal.addListener('changeColor', this.__onChangeCalendarPreferences, this);
				calendars[cal.getId()] = cal;
			}
			this.setRemotecalendars(calendars);
					
			this.fireDataEvent('deleteRemoteCalendar', calendar);
			this.init();
			this.setCalendarSelectedDate(this.getCalendarSelectedDate());
		},
		__onEventDeleted: function(event) {
			event.fireDataEvent('deleteEvent', event);
			delete this.__eventModels[event.getId()];
		},
		
		__onEventSaved: function(event, eventDataArr,mode) {	
              if (mode == 'EDIT'){
                  var result = new Array();
                  for(var id in this.__eventModels) {
                      var eventModel = this.__eventModels[id];
                      //console.log(eventModel.getEventGroup(),event.getEventGroup());
                      if (eventModel.getEventGroup()==event.getEventGroup()){
                      //if (eventModel.getCalendar().getEventGroup() == calendarId)
                      eventModel.fireDataEvent('deleteEvent', event);
                      delete this.__eventModels[eventModel.getId()];
                      }

                  }
              }
              for (var j = 0;j<eventDataArr.length;j++){
                      var eventData = eventDataArr[j];
                      if (!eventData['id']) {
                              throw '[eyeos.calendar.Controller] __onEventSaved() Unable to assign ID to saved event: none returned!';
                      }
                      // Update model object with the values generated on the server-side
                      eventData['calendar'] = this.getCalendarById(eventData['calendarId']);
                      if (event.getId() == null){
                              eyeos.calendar.model.Event.fromJson(eventData, event);
                              this.__eventModels[event.getId()] = event;
                              this.fireDataEvent('createEvent', event);
                      } else {		//console.log('teste');
                              var eventRepeated = eyeos.calendar.model.Event.fromJson(eventData);
                              this.__eventModels[eventData['id']] = eventRepeated;
                              this.fireDataEvent('createEvent', eventRepeated);
                      }
                      //eyeos.calendar.model.Event.fromJson(eventData, event);
                      for(var i = 0; i < this.__unsavedEventModels.length; i++) {
                              if (this.__unsavedEventModels[i] === event) {
                                      this.__unsavedEventModels.splice(i, 1);
                              }
                      }
              }
					
						//console.log(this.__eventModels,'after');
			eyeos.consoleInfo('Event saved: [' + event.getId() + '] "' + event.getSubject() + '" on ' + event.getTimeStart());
		},
		
		__onUserCalendarsLoaded: function(data) {
			if (data.length == 0) {
                // Force triggering the "EventsLoaded" event
				this.__onCalendarEventsLoaded(null, []);
			}
			
			var calendars = {};
			for(var i = 0; i < data.length; i++) {
				var cal = eyeos.calendar.model.Calendar.fromJson(data[i])
				cal.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
				cal.addListener('changeColor', this.__onChangeCalendarPreferences, this);
				calendars[cal.getId()] = cal;
			}
			this.setCalendars(calendars);
			
			// Retrieve events for each calendar from the server
			for(var id in calendars) {
				eyeos.callMessage(
					this.__checknum,
					'getAllEventsFromPeriod',
					{
						calendarId: id,
						periodFrom: null,
						periodTo: null
					},
					function(id) {
						return function(eventsData) {
							var cal = calendars[id];
							eyeos.consoleInfo('[eyeos.calendar.Controller] __onUserCalendarsLoaded() Events from calendar '
								+ cal.getId() + ' have been loaded (' + eventsData.length + ' items)');
							
							// Load all the events in the cache
							this.__onCalendarEventsLoaded(cal, eventsData);
						}
					}(id),
					this
				);
			}
		},
		__onGroupCalendarsLoaded: function(data) {
			if (data.length == 0) {
				///eyeos.consoleWarn('[eyeos.calendar.Controller] __onUserCalendarsLoaded() No group  calendar found!');				
				// Force triggering the "EventsLoaded" event
				this.__onCalendarEventsLoaded(null, []);				
			}
			var calendars = {};
			for(var i = 0; i < data.length; i++) {
				//console.log(data[i]);
				var cal = eyeos.calendar.model.Calendar.fromJson(data[i])
				cal.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
				cal.addListener('changeColor', this.__onChangeCalendarPreferences, this);
				calendars[cal.getId()] = cal;
			}
			this.setGroupcalendars(calendars);			
			// Retrieve events for each calendar from the server
			for(var id in calendars) {
				eyeos.callMessage(
					this.__checknum,
					'getAllEventsFromPeriod',
					{
						calendarId: id,
						periodFrom: null,
						periodTo: null
					},
					function(id) {
						return function(eventsData) {
							var cal = calendars[id];
							eyeos.consoleInfo('[eyeos.calendar.Controller] __onGroupCalendarsLoaded() Events from calendar '
								+ cal.getId() + ' have been loaded (' + eventsData.length + ' items)');
							
							// Load all the events in the cache
							this.__onCalendarEventsLoaded(cal, eventsData);
						}
					}(id),
					this
				);
			}
		},

       __onRemoteCalendarsLoaded: function(data) {
			if (data.length == 0) {
				eyeos.consoleWarn('[eyeos.calendar.Controller] __onRemoteCalendarsLoaded() No remote  calendar found!');
				// Force triggering the "EventsLoaded" event
				this.__onCalendarEventsLoaded(null, []);
			}
			var calendars = {};
			for(var i = 0; i < data.length; i++) {
				//console.log(data[i]);
				var cal = eyeos.calendar.model.Calendar.fromJson(data[i])
				cal.addListener('changeVisibility', this.__onCalendarChangeVisibility, this);
				cal.addListener('changeColor', this.__onChangeCalendarPreferences, this);
				calendars[cal.getId()] = cal;
			}
			this.setRemotecalendars(calendars); 
			// Retrieve events for each calendar from the server
			
            for(var id in calendars) {
				eyeos.callMessage(
					this.__checknum,
					'getAllEventsFromRemoteCalendar',
					{
						calendarId: id,
						periodFrom: null,
						periodTo: null
					},
					function(id) {
						return function(eventsData) {
							var cal = calendars[id];
							eyeos.consoleInfo('[eyeos.calendar.Controller] __onRemoteCalendarsLoaded() Events from calendar '
								+ cal.getId() + ' have been loaded (' + eventsData.length + ' items)');

							// Load all the events in the cache
							this.__onCalendarEventsLoaded(cal, eventsData);
						}
					}(id),
					this
				);
			}
		},
        
		_applyCalendarPeriodMode: function(newValue, oldValue) {
			var period = this.getCalendarCurrentPeriod();
			switch(newValue) {
				case eyeos.calendar.Constants.PERIOD_MODE_DAY:
					period.begin = new Date(this.getCalendarSelectedDate());
					period.begin.setHours(0);
					period.begin.setMinutes(0);
					period.begin.setSeconds(0);
					period.begin.setMilliseconds(0);
					
					period.end = new Date(period.begin.getTime() + 86400000 - 1)		//begin + 1 day - 1 millisecond
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_WEEK:
					period.begin = this.getCalendarSelectedDate().getLocalizedFirstDayOfWeek();
					period.begin.setHours(0);
					period.begin.setMinutes(0);
					period.begin.setSeconds(0);
					period.begin.setMilliseconds(0);
					
					period.end = new Date(period.begin.getTime() + 7 * 86400000 - 1)		//begin + 7 days - 1 millisecond
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_MONTH:
					period.begin = new Date(this.getCalendarSelectedDate());
					period.begin.setDate(1);
					period.begin.setHours(0);
					period.begin.setMinutes(0);
					period.begin.setSeconds(0);
					period.begin.setMilliseconds(0);
					
					period.end = new Date(period.begin);
					period.end.setMonth(period.end.getMonth() + 1);
					period.end.setMilliseconds(-1);
					break;
					
				case eyeos.calendar.Constants.PERIOD_MODE_YEAR:
					//TODO
					break;
			}
			this.setCalendarCurrentPeriod(period);
		},
		
		_applyCalendarSelectedDate: function(newValue, oldValue) {
			var periodMode = this.getCalendarPeriodMode();
			this._applyCalendarPeriodMode(periodMode, periodMode);
		},
		
		__onChangeCalendarPreferences: function(e) {
			this.saveCalendarPreferences(e.getTarget());
		},
		
		cancelNewEvent: function(event) {
			for(var i = 0; i < this.__unsavedEventModels.length; i++) {
				if (this.__unsavedEventModels[i] === event) {
					this.__unsavedEventModels.splice(i, 1);
					event.fireEvent('deleteEvent');
					delete event;
					eyeos.consoleLog('[eyeos.calendar.Controller] cancelNewEvent() New event cancelled successfully');
					return;
				}
			}
			eyeos.consoleWarn('[eyeos.calendar.Controller] cancelNewEvent() Event not found');
		},
		
		createNewEvent: function() {
			if (this._isEmpty(this.getCalendars()) && this._isEmpty(this.getGroupcalendars())){
                            return false;
                        }
			 var event = new eyeos.calendar.model.Event();
			event.setCalendar(this.getDefaultCalendar());
			 this.__unsavedEventModels.push(event);
			 return event;
		},
		
		createNewCalendar: function(calendar) {
			if (typeof calendar.getTimezone() == 'undefined') {
				calendar.setTimezone(0);		//FIXME
			}
			var calendarData = eyeos.calendar.model.Calendar.toJson(calendar);
			eyeos.callMessage(this.__checknum, 'createCalendar', calendarData, function(calendarData) {
				this.__onCalendarSaved(calendar, calendarData);
			}, this);
		},
        createRemoteCalendar: function(calendar) {
              if (typeof calendar.getTimezone() == 'undefined') {
				calendar.setTimezone(0);		//FIXME
              }
              var calendarData = eyeos.calendar.model.Calendar.toJson(calendar);
              eyeos.callMessage(this.__checknum, 'createRemoteCalendar', calendarData, function(calendarData) {
                  this.__onRemoteCalendarSaved(calendar, calendarData);
              }, this);
        },
		deleteCalendar: function(calendar) {
			var calendarData = eyeos.calendar.model.Calendar.toJson(calendar);
			eyeos.callMessage(this.__checknum, 'deleteCalendar', calendarData, function(calendarData) {
                if (calendarData == null ){
                    eyeos.alert(tr("Primary calendar can't be deleted"));
                } else{
                    this.__onCalendarDeleted(calendar, calendarData);
                }
            }, this);
		},
		deleteRemoteCalendar: function(calendar) {
			var calendarData = eyeos.calendar.model.Calendar.toJson(calendar);
			eyeos.callMessage(this.__checknum, 'deleteRemoteCalendar', calendarData, function(calendarData) {
                
                    this.__onRemoteCalendarDeleted(calendar, calendarData);
               
            }, this);
		},
		
		deleteEvent: function(event,deleteAll) {	
			// An error during the drawing process may leave an unfinished eventview on the stage
			// so if the event has no ID, we can simply destroy the JS object without sending any
			// request to the server.
            var startTime = event.getTimeStart();
            //startTime.setHours(0);
            //startTime.setMinutes(0);
            //startTime.setSeconds(0);
            //startTime.setMilliseconds(0);
			if (event.getId() == null) {
				this.__onEventDeleted(event);
				return;
			}
			eyeos.callMessage(
				this.__checknum,
				'deleteEvent',
				{
					eventId: event.getId(), dtstart:startTime.getTime() / 1000, isDeleteAll:deleteAll, groupId:event.getEventGroup(),calendarId:event.getCalendar().getId()
				},
				function(e) {	//console.log(this.__eventModels)
                      if(deleteAll == '1' && e.length > 0){ 
                          for(var i = 0; i < e.length; i++){
                              var evn = this.__eventModels[e[i]]; 
                              this.__onEventDeleted(evn);
                          }
                      } else {
                          this.__onEventDeleted(event);
                      }
				},
				this
			);
		},
		
		dispose: function() {
			// Dispose displayed popup if any
			var displayedPopup = this.getProcVar('eyeos.calendar.view.EventPopup.instance');
			if (displayedPopup) {
				try {
					displayedPopup.destroy();
				} catch (e) {
					eyeos.consoleWarn(e);
				}
			}
			// Dispose dialogs if any
			var displayedDialogs = this.getProcVar('eyeos.calendar.dialogs.EditEvent.instances');
			if (displayedDialogs) {
				for(var i in displayedDialogs) {
					try {
						displayedDialogs[i].close();
					} catch (e) {
						eyeos.consoleWarn(e);
					}	
				}
			}
			displayedDialogs = this.getProcVar('eyeos.calendar.dialogs.Settings.instance');
			if (displayedDialogs) {
				try {
					displayedDialogs.close();
				} catch (e) {
					eyeos.consoleWarn(e);
				}
			}
		},
		
		/**
		 * 
		 * @param calendarId {String}
		 * @param periodFrom {Date}
		 * @param periodTo {Date}
		 */
		getAllEventsFromPeriod: function(calendarId, periodFrom, periodTo) {
			var result = new Array();
			for (var id in this.__eventModels) {
				var eventModel = this.__eventModels[id];
				if (eventModel.getCalendar().getId() == calendarId
					&& eventModel.getTimeStart() >= periodFrom
					&& eventModel.getTimeEnd() <= periodTo) {
					result.push(eventModel);
				}
			}
			return result;
		},
		
		getCalendarById: function(calendarId) {
			var calendars = this.getCalendars();
			if (calendars[calendarId] && calendars[calendarId] instanceof eyeos.calendar.model.Calendar) {
				return calendars[calendarId];
			}
			var calendars = this.getGroupcalendars();
			if (calendars[calendarId] && calendars[calendarId] instanceof eyeos.calendar.model.Calendar) {
				return calendars[calendarId];
			}

            var calendars = this.getRemotecalendars();
			if (calendars[calendarId] && calendars[calendarId] instanceof eyeos.calendar.model.Calendar) {
				return calendars[calendarId];
			}
            
			throw '[eyeos.calendar.Controller] getCalendarById() Unable to find calendar with ID ' + calendarId + '!';
		},
		
		getDefaultCalendar: function() {
			//TODO: could be improved a bit...
			var calendars = this.getCalendars();
			for(var id in calendars) {
				return calendars[id];
			}
            var groupcalendars = this.getGroupcalendars();
			for(var id in groupcalendars) {
				return groupcalendars[id];
			}
            var remotecalendars = this.getRemotecalendars();
			for(var id in remotecalendars) {
				return remotecalendars[id];
			}
		},
		
		/**
		 * Returns the value associated with the given key for the current Controller
		 * (i.e. the current process).
		 * 
		 * @param key {String}
		 */
		getProcVar: function(key) {
			return this.__procVars[key];
		},
		
		init: function() {
			eyeos.consoleInfo('[eyeos.calendar.Controller] init() Init started');
			//...
			
			qx.event.Timer.once(function(e) {
                eyeos.callMessage(this.__checknum, 'getMaxEventLimit', ['test'], function(maxLimit){
                    this.setMaxEventLimt(maxLimit);
                }, this);
				eyeos.callMessage(this.__checknum, 'getAllUserCalendars', null, this.__onUserCalendarsLoaded, this);
				eyeos.callMessage(this.__checknum, 'getAllGroupCalendars', null, this.__onGroupCalendarsLoaded, this);
				/*try {
					eyeos.callMessage(this.__checknum, 'getAllRemoteCalendars', null, this.__onRemoteCalendarsLoaded, this);
				} catch (error) {
					eyeos.consoleWarn(error);
				}*/
                
			}, this, 500);
			
			eyeos.consoleInfo('[eyeos.calendar.Controller] init() End');
		},
		
		saveCalendarPreferences: function(calendar) {
			if (! calendar instanceof eyeos.calendar.model.Calendar) {
				throw '[eyeos.calendar.Controller] saveCalendarPreferences() calendar must be an instance of eyeos.calendar.model.Calendar';
			}
			var calendarPrefsData = eyeos.calendar.model.Calendar.prefsToJson(calendar);
			
			eyeos.callMessage(this.__checknum, 'updateCalendarPreferences', calendarPrefsData, function() {
				this.__onCalendarPreferencesSaved(calendar);
			}, this);
		},
		
		saveEvent: function(event, callback, callbackContext) { 
			if (! event instanceof eyeos.calendar.model.Event) {
				throw '[eyeos.calendar.Controller] saveEvent() event must be an instance of eyeos.calendar.model.Event';
			}
			var eventData = eyeos.calendar.model.Event.toJson(event);
			if (event.getId() == null) {
				// The event has no ID: it must be in the unsavedEvents stack
				var unsavedEvent = null;
				for(var i = 0; i < this.__unsavedEventModels.length; i++) {
					if (this.__unsavedEventModels[i] === event) {
						unsavedEvent = event;
					}
				}
				if (unsavedEvent == null) {
					throw '[eyeos.calendar.Controller] saveEvent() Unable to save event: object not found!';
				}
				eyeos.callMessage(this.__checknum, 'createEvent', eventData, function(eventData) {
					this.__onEventSaved(event, eventData,'NEW');
					if (callback) {
						callback.call(callbackContext);
					}
				}, this, {
                          onException: function(e) {

                              if(e.__eyeos_specialControlMessage_body.name=="EyeCalendarException"){
                                      eyeos.alert(tr('Insufficent permission'));
                              }
                          },
                          timeout:0
                      }
               );
			} else {
				// The event has an ID: it's an update
                eventData['isEditAll'] = false;
                if (callback){
                    eventData['isEditAll'] = callbackContext.getIsEditAll();
                }
				eyeos.callMessage(this.__checknum, 'updateEvent', eventData, function(eventData) {
					if (callback){	
                        if(callbackContext.getIsEditAll()){ 
                                this.__onEventSaved(event,eventData,'EDIT'); //console.log(eventData);
                         } else if(eventData.length > 0){	
                                this.__onEventSaved(event,eventData,'EDIT');
                         }else {								
                                callback.call(callbackContext);
                         }
                    }
				}, this, {
                      onException: function(e) {
                            if(e.__eyeos_specialControlMessage_body.name=="EyeCalendarException"){
                                 eyeos.alert(tr('Insufficent permission'));
                            }
                      },
                      timeout:0
                });
			}
		},
		
		/**
		 * Stores the value with the given key for the current Controller
		 * (i.e. the current process).
		 * 
		 * @param key {String}
		 * @param value {var}
		 */
		setProcVar: function(key, value) {
			this.__procVars[key] = value;
		},
				
		destruct : function() {
			//TODO
			this._disposeArray('_unsavedEventModels');
			this._disposeMap('_eventModels');
		},
		 _isEmpty : function(ob) {
		   for(var i in ob){return false;}
			 return true;
		  }
	}
});