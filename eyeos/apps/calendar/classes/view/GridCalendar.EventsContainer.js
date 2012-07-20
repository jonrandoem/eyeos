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
 * GridCalendar inner class.
 * MUST NOT BE USED OUTSIDE ITS GRIDCALENDAR.
 * 
 */
qx.Class.define('eyeos.calendar.view.GridCalendar.EventsContainer', {
	extend: qx.ui.root.Inline,
	
	statics: {
		MODE_PLANNING: 'planning',
		MODE_STACK: 'stack',
		
		/** Percent */
		EVENTS_MAX_WIDTH: '90',
		
		SortEvents: function(a, b) {
			if(a.getBounds().top < b.getBounds().top) {
				return -1;
			} else if(a.getBounds().top > b.getBounds().top) {
				return 1;
			} else {
				return 0;
			}
		}
	},
	
	/**
	 * TODO
	 * 
	 */
	construct: function (el, gridCalendar, mode) {
		arguments.callee.base.call(this, el, true, true);
		this.__gridCalendar = gridCalendar;
		this.__controller = gridCalendar.getController();
		this.__mode = mode;
		
		this.set({
			backgroundColor: 'transparent'
			// ...
		});
		
		// STACK MODE
		if (mode == this.self(arguments).MODE_STACK) {	
			this.setLayout(new qx.ui.layout.VBox(1));
			
			// a simple click allows to add an event
			this.addListener('click', function(e) {
				if(e.getButton() == 'left') {
				    this.__onMouseClick(e);
				}
			}, this);
		}
		// PLANNING MODE
		else {
			this.setLayout(new qx.ui.layout.Canvas());
			
			// in this mode we can draw an event from a start time (mousedown) to an end time (mouseup)
			this.addListener('mousedown', function(e) {
				if(e.getButton() == 'left' && e.getTarget() instanceof eyeos.calendar.view.GridCalendar.EventsContainer) {
				    this.__onMouseDown(e);
				}
			}, this);
			
			this.addListener('dragover', function(e) {
				var widget = e.getRelatedTarget();
				this.add(widget);
			}, this);
			
			this.addListener('drop', this.__onDropEvent, this);
			
			this.setDroppable(true);
		}
	},
	
	properties: {
		date: {
			init: new Date(),
			check: 'Date'
		}
	},
	
	members: {
		/**
		 * The calendar controller.
		 * @var {eyeos.calendar.Controller}
		 */
		__controller: null,
		/**
		 * The parent GridCalendar
		 * @var {eyeos.calendar.view.GridCalendar}
		 */
		__gridCalendar: null,
		
		__mode: null,
		
		/**
		 * @see this.__startDrawingEvent()
		 * @var {Map}
		 */
		__eventDrawingContext: null,			// {event, eventsContainerListenerIds(...)}
		
		/**
		 * @see this.__onMouseMove()
		 * @var {Boolean}
		 */
		__mouseMoveFlag: false,
		
		
		/**
		 * @param top {Integer} The position in pixels.
		 * @param round {Boolean ? true} TRUE to round result to the closest half-hour, FALSE otherwise.
		 * @return {Date}
		 */
		__getTimeFromLocation: function(top, round) {
			var res = this.getDate().getTime() + Math.floor(top / (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2)) * 1800000;
			if (round || typeof round == 'undefined') {
				res -= res % 1800000;
			}
			return new Date(res);
		},
		
		__onDropEvent: function(e) {
			// relayout target (this)
			this.autoLayoutEvents();
			var eventView = e.getRelatedTarget();
		    if (eventView instanceof eyeos.calendar.view.Event) {
		    	// Persistent listeners (for resizing)
				eventView.addListener('resize', this.__onEventResize, this);
				eventView.addListener('losecapture', this.__onEventLoseCapture, this);
		    	
		    	// Update dropped event
		    	this.updateEventTimeFromLocation(eventView);
		    	eyeos.consoleInfo('Event ' + eventView.getModel().getId() + ' dropped on date: ' + this.getDate());
		    	this.__controller.saveEvent(eventView.getModel());
		    }
		},
		
		/**
		 * 
		 * @param event {qx.event.type.Event}
		 */
		__onEventLoseCapture: function(e) {
			var eventView = e.getTarget();
			eyeos.consoleInfo('Event ' + eventView.getModel().getId() + ' resized: ' + eventView.getModel().getTimeStart() + '/' + eventView.getModel().getTimeEnd());
			this.__controller.saveEvent(eventView.getModel());
		},
		
		/**
		 * 
		 * @param event {qx.event.type.Data}
		 */
		__onEventResize: function(e) {
			var eventView = e.getTarget();
			
			// The resize event is also triggered on drop, so we need to check first if the
			// source of the event is a child of the current EventContainer before updating
			// its time.
			if (eventView.getModel().getTimeStart().isSameDay(this.getDate())) {
				var halfHour = (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2);
				
				// Force widget's top and bottom to be aligned on a half-hour line
				
				// TOP
				var currentTop = e.getData().top;
				var newTop = currentTop < 0 ? 0 : currentTop;
				var modulo = newTop % halfHour;
				if (modulo != 0) {
					if (modulo < halfHour / 2) {
						newTop -= modulo;
					} else {
						newTop += halfHour - modulo;
					}
				}
				if (newTop != currentTop) {
					eventView.setLayoutProperties({top: newTop});
				}
				
				// HEIGHT
				if (currentTop >= 0) {
					var newHeight = eventView.getHeight();
					modulo = newHeight % halfHour;
					if (modulo != 0) {
						if (modulo <= halfHour / 2) {
							newHeight -= modulo;
						} else {
							newHeight += halfHour - modulo;
						}
						eventView.setHeight(newHeight);
					}
				}
				this.updateEventTimeFromLocation(eventView);
			}
		},
		
		/**
		 * 
		 * @param event {qx.event.type.Mouse}
		 */
		__onMouseClick: function(e) {	
            // Close event popup if any
			var displayedPopup = this.__controller.getProcVar('eyeos.calendar.view.EditEvent.instance');
			if (displayedPopup) {
				try {
					displayedPopup.cancel();
				} catch (e) {
					eyeos.consoleWarn(e);
				}
			}
			// Start drawing process
			this.__startDrawingEvent(e.getDocumentTop() - this.getContainerLocation().top);
            this.__stopDrawingEvent(e);
		},
		
		/**
		 * 
		 * @param event {qx.event.type.Mouse}
		 */
		__onMouseDown: function(e) {
			// Close event popup if any
			var displayedPopup = this.__controller.getProcVar('eyeos.calendar.view.EditEvent.instance');
			if (displayedPopup) {
				try {
					displayedPopup.cancel();
				} catch (e) {
					eyeos.consoleWarn(e);
				}
			}
			// Start drawing process
			this.__startDrawingEvent(e.getDocumentTop() - this.getContainerLocation().top);
		},
		
		/**
		 * 
		 * @param event {qx.event.type.Mouse}
		 */
		__onMouseMove: function(e) {
			if (!this.__mouseMoveFlag) {
				// Check that the drawing context is set for safety
				if (this.__eventDrawingContext != null) {
                      var loc = this.__eventDrawingContext.eventView.getContainerLocation();
                      var delta = e.getDocumentTop() - loc.bottom;
                      // the mouse is below the event container => expand the event to its location (duration ++)
                      if (delta > 0) {
                          var newHeight = this.__eventDrawingContext.eventView.getHeight() + delta;
                          newHeight -= newHeight % (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2);
                          if (newHeight == this.__eventDrawingContext.eventView.getHeight()) {
                              return;
                          }
                          this.__eventDrawingContext.eventView.setHeight(newHeight);
                      }
                      // the mouse is above the bottom of the event container
                      else {
						delta = loc.top - e.getDocumentTop();
						//the mouse is above the event container => shift the event to its location (startTime --)
						if (delta > 0) {
							var newY = e.getDocumentTop() - this.getContainerLocation().top;
							newY -= newY % (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2);
							if (newY == this.__eventDrawingContext.eventView.getBounds().top) {
								return;
							}
							this.__eventDrawingContext.eventView.setLayoutProperties({top: newY});
						}
						//the mouse is inside the event container => reduce the height of the event to its location (duration --)
						else {
							var newHeight = Math.abs(delta);
							newHeight -= newHeight % (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2);
							if (newHeight < (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2) || newHeight == this.__eventDrawingContext.eventView.getHeight()) {
								return;
							}
							this.__eventDrawingContext.eventView.setHeight(newHeight);
						}
					}
				}
				this.__mouseMoveFlag = true;
				qx.event.Timer.once(function(e) {
					this.__mouseMoveFlag = false;
				}, this, 100);
			}
		},
		
		__onMouseOut: function(e) {	
			var loc = this.getContainerLocation();
			if (e.getDocumentLeft() < loc.left || e.getDocumentLeft() > loc.right) {
				this.__stopDrawingEvent(e);
				
			}
		},
		
		__onMouseUp: function(e) {
			this.__stopDrawingEvent(e);
			
		},
		
		__startDrawingEvent: function(top) {
			top -= (top % (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2));		//align event on a half-hour line
			
			// Initialize a new model object
			var eventModel = this.__controller.createNewEvent();
                        if (!eventModel){
                            return false;
                        }
                        eventModel.set({
				calendar: this.__controller.getDefaultCalendar(),
				timeStart: new Date(this.getDate())
			});
			
			// Initialize a new view object
			var eventView = new eyeos.calendar.view.Event(eventModel, this.__controller).set({
				mode: eyeos.calendar.view.Event.MODE_DETAILLED,
				height: eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2 - 1,
				minHeight: eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2 - 1
			});
			// Context
			this.__eventDrawingContext = {
				eventView: eventView,
				eventMouseMoveListenerId: null,
				thisMouseMoveListenerId: null,
				eventMouseOutListenerId: null,
				eventMouseUpListenerId: null,
				thisMouseUpListenerId: null
			};
			
			// Persistent listeners (for resizing)
			eventView.addListener('resize', this.__onEventResize, this);
			eventView.addListener('losecapture', this.__onEventLoseCapture, this);
			// Temporary listeners for drawing process
			this.__eventDrawingContext.eventMouseMoveListenerId = eventView.addListener('mousemove', this.__onMouseMove, this);
			this.__eventDrawingContext.eventMouseUpListenerId = eventView.addListener('mouseup', this.__onMouseUp, this);
			this.__eventDrawingContext.eventMouseOutListenerId = eventView.addListener('mouseout', this.__onMouseOut, this);
			this.__eventDrawingContext.thisMouseMoveListenerId = this.addListener('mousemove', this.__onMouseMove, this);
			this.__eventDrawingContext.thisMouseUpListenerId = this.addListener('mouseup', this.__onMouseUp, this);
			
			// Add event view to container
			this.add(eventView, {
				left: 0,
				top: top,
				width: '100%'
			});
		},
		
		__stopDrawingEvent: function(e) { 
            //e.stopPropagation();
			if (this.__eventDrawingContext != null) {
				this.autoLayoutEvents();
				var dialog = new eyeos.calendar.dialogs.EditEvent(this.__eventDrawingContext.eventView);
				dialog.open(e);
				// Delete drawing context data
				this.__eventDrawingContext.eventView.removeListenerById(this.__eventDrawingContext.eventMouseMoveListenerId);
				this.removeListenerById(this.__eventDrawingContext.thisMouseMoveListenerId);
				this.__eventDrawingContext.eventView.removeListenerById(this.__eventDrawingContext.eventMouseOutListenerId);
				this.__eventDrawingContext.eventView.removeListenerById(this.__eventDrawingContext.eventMouseUpListenerId);
				this.removeListenerById(this.__eventDrawingContext.thisMouseUpListenerId);
				delete this.__eventDrawingContext;
            }
		},
		
		// overridden
		_afterRemoveChild: function(widget) {
			if (widget instanceof eyeos.calendar.view.Event) {
    			// Relayout source container
				this.autoLayoutEvents();
	    	
	    		// Remove resize listeners on source container
				widget.removeListener('resize', this.__onEventResize, this);
				widget.removeListener('losecapture', this.__onEventLoseCapture, this);
		    }
		},
		
		// overridden
	    _createContainerElement : function() {
			var root = this.base(arguments);
			var domElement = root.getDomElement();
			domElement.style.width = '100%';
			domElement.style.minWidth = '100%';
			domElement.style.maxWidth = '100%';
			domElement.style.height = '100%';
			domElement.style.minHeight = '100%';
			domElement.style.maxHeight = '100%';
			return root;
		},
		
		// overridden
		_remove: function(widget) {
			this.base(arguments, widget);
			this.autoLayoutEvents();
		},
		
		autoLayoutEvents: function() {
			if (this.__mode == this.self(arguments).MODE_PLANNING) {
				var eventList = this.getChildren();
				eventList.sort(eyeos.calendar.view.GridCalendar.EventsContainer.SortEvents);
				for(var i = 0; i < eventList.length; i++) {
					var chain = new Array();
					var currentEvent = eventList[i];
					var nextEvent = eventList[parseInt(i) + 1];
					chain.push(currentEvent);
					while(nextEvent && nextEvent.getBounds().top < currentEvent.getBounds().top + currentEvent.getBounds().height) {
						chain.push(nextEvent);
						i++;
						currentEvent = eventList[i];
						nextEvent = eventList[parseInt(i) + 1];
					}
					var percent = this.self(arguments).EVENTS_MAX_WIDTH / chain.length;
					for(var x = 0; x < chain.length; x++) {
						chain[x].setLayoutProperties({
							width: percent + '%'
						});
						
						var eventLeft = percent * parseInt(x);
						
						chain[x].setLayoutProperties({
							left: eventLeft + '%'
						});
					}
			    }
			}
		},
		
		clearEvents: function() {
			this.removeAll();
		},
		
		displayEvents: function(events) {
			//eyeos.consoleLog('GridCalendar.EventsContainer.displayEvents()');
			var lastEventView = null;
			for(var i = 0; i < events.length; i++) {
				var event = events[i];
				// Prevent displaying twice the same event
				if (this.hasEvent(event)) {
                      continue;
				}
                if (! event.getTimeStart().isSameDay(this.getDate())) {
                      continue;
				} else {
					//eyeos.consoleLog('Event ' + event.getId() + ' "' + event.getSubject() + '" matches container\'s date (' + this.getDate() + '), displaying.');
				}
				if (this.__mode == this.self(arguments).MODE_STACK) {
					// Initialize a new view object
					var eventView = new eyeos.calendar.view.Event(event, this.__controller).set({
						mode: eyeos.calendar.view.Event.MODE_INLINE
					});
					this.add(eventView);
				} else {
					// Initialize new event view
					var eventView = new eyeos.calendar.view.Event(event, this.__controller).set({
						mode: eyeos.calendar.view.Event.MODE_DETAILLED,
						minHeight: eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2 - 1
					});
					
					// Add event view to container
					this.add(eventView, {
						left: 0,
						width: this.self(arguments).EVENTS_MAX_WIDTH + '%'
					});
					
					this.updateLocationFromEventTime(eventView);
					
					// Persistent listeners (for resizing)
					eventView.addListener('resize', this.__onEventResize, this);
					eventView.addListener('losecapture', this.__onEventLoseCapture, this);
					
					lastEventView = eventView;
				}
			}
			// Relayout container once the last event has been rendered
			if (lastEventView != null) {
				lastEventView.addListenerOnce('appear', function(e) {
					this.autoLayoutEvents();
				}, this);
			}
		},
		
		/**
		 * 
		 * @param event {eyeos.calendar.model.Event}
		 */
		hasEvent: function(event) {
			var Event = eyeos.calendar.view.Event;
			
			var children = this.getChildren();
			var alreadyDisplayed = false;
			for(var j = 0; j < children.length; j++) {
				if (children[j] instanceof Event && children[j].getModel() === event) {
					return true;
					break;
				}
			}
			return false;
		},
		
		// overridden
	    renderLayout : function(left, top, width, height) {	
			this.base(arguments, left, top, width, height);
			
			// Force container dimension style to 100%
			if(this.getContainerElement!=null || this.getContainerElement!='' ){
				var container = this.getContainerElement();
				container.setStyle('width', '100%');
				container.setStyle('height', '100%');
			}
			
			// Force content dimension style to 100%
			if(this.getContentElement!=null || this.getContentElement!=''){
				var content = this.getContentElement();
				content.setStyle('width', '100%');
				content.setStyle('height', '100%');
			}
	    },
		
		updateEventTimeFromLocation: function(eventView) {
			var bounds = eventView.getBounds();
			var top = bounds.top < 0 ? 0 : bounds.top;
			var start = this.__getTimeFromLocation(top);
			var end = this.__getTimeFromLocation(top + bounds.height);
			
			//eyeos.consoleInfo('Updating event ' + eventView.getModel().getId() + ' from location (Start=' + start + ' / End= ' + end + ')');
			
			eventView.getModel().set({
				timeStart: start,
				timeEnd: end
			});
		},
		
		updateLocationFromEventTime: function(eventView) {
			var event = eventView.getModel();
			var halfHourStart = (event.getTimeStart().getTime() % 86400000) / 1800000;
			halfHourStart -= event.getTimeStart().getTimezoneOffset() / 30;
			halfHourStart %= 48;
			var halfHourEnd = (event.getTimeEnd().getTime() % 86400000) / 1800000;
			halfHourEnd -= event.getTimeEnd().getTimezoneOffset() / 30;
			halfHourEnd %= 48;
			var top = halfHourStart * (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2);
			var height = halfHourEnd * (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2) - top;
			
			//eyeos.consoleLog(event.getId() + ' " at [halfHourStart=' + halfHourStart + ', halfHourEnd=' + halfHourEnd + ']');
			//eyeos.consoleLog('Displaying event ' + event.getId() + ' " at [top=' + top + ', height=' + height + ']');
			
			eventView.setHeight(height);
			eventView.setLayoutProperties({top: top});
		},

		destruct : function() {
			//TODO
		}
	}
});