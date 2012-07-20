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

qx.Class.define('eyeos.calendar.view.Event', {
	extend: qx.ui.core.Widget,
	include: [qx.ui.core.MResizable],
	
	statics: {
		MODE_INLINE: 'inline',
		MODE_DETAILLED: 'detailled'
	},
	
	/**
	 * TODO
	 * 
	 * @param eventModel {eyeos.calendar.model.Event}
	 * @param time {String}
	 * @param mode {Integer}
	 */
	construct: function (eventModel, controller) {
		arguments.callee.base.call(this);
		
		this._setLayout(new qx.ui.layout.Dock());
		
		if (!eventModel) {
			this.error('Missing eventModel argument!');
		}
		this.__eventModel = eventModel;
		this.__eventModel.addListener('deleteEvent', this._onDeleteEvent, this);
		this.__eventModel.addListener('updateTime', this._onUpdateTime, this);
		this.__eventModel.addListener('updateDetails', this._onUpdateDetails, this);
		this.__eventModel.addListener('updateParentCalendar', this._onUpdateCalendar, this);
		this.__eventModel.addListener('changeColor', function(e) {
			this._applyColor(e.getData());
		}, this);
		
		if (eventModel.getSubject()) {
			this.setSubject(eventModel.getSubject());
		}
		this._onUpdateTime();
		
		this.setController(controller);
		
		this.setDraggable(true);
		this.setOpacity(0.8);

        this.setContextMenu(this.__createDeleteMenu("notGroup"));

		this.addListener('drag', function(e) {
			var myTop =  e.getDocumentTop() - this.getLayoutParent().getContainerLocation().top;
			myTop -= myTop % (eyeos.calendar.view.GridCalendar.HOUR_HEIGHT / 2);
			if(myTop < 0) {
				myTop = 0;
			} else {
				var parentHeight = this.getLayoutParent().getBounds()['height'];
				var height = this.getBounds()['height'];
				if(myTop + height > parentHeight) {
					myTop = parentHeight - height;
				}
			}
			this.setLayoutProperties({
			    top: myTop
			});
			this.getLayoutParent().updateEventTimeFromLocation(this);
		}, this);
			
		this.addListener('dragstart', function(e) {
			// Avoid popup on mouse release
			this.__simpleClick = false;
			
			// See _onUpdateTime()
			this.__isDragged = true;
			
			e.addAction('move');
			this.__originalContainer = this.getLayoutParent();
		});
		
		this.addListener('dragend', function(e) {
			this.__isDragged = false;
		});
		
		// Init color
		this._applyColor();
	},
	
	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller'
		},
	
		subject: {
			check: 'String',
			apply: '_applySubject',
			nullable: true
		},
		
		mode: {
			check: 'String',
			apply: '_applyMode',
			event: 'changeMode',
			init: 'inline'//eyeos.calendar.view.Event.MODE_INLINE
		},
		
		type: {
			check: 'String',
			init: 'event',
			apply: '_applyType',
			event: 'changeType'
		}
	},
	
	members: {
		
		__id: null,
        __originalContainer:null,
        __eventModel: null,
        __simpleClick: true,
        __isDragged: false,
		
		
        _applySubject: function(value, old) {
			if (typeof value == 'undefined') {
				value = this.__eventModel.getSubject();
			}
			if (this.getMode() == this.self(arguments).MODE_INLINE) {
				this.getChildControl('header-label').setValue(value);
			} else {
				this.getChildControl('subject-label').setValue(value);
			}
		},
      _applyMenu: function() {
			   if(this.__eventModel.getEventGroup() > 0){
					this.setContextMenu(this.__createDeleteMenu("group"));
			   } else {
					this.setContextMenu(this.__createDeleteMenu("notGroup"));
			   }
                },
	_applyMode: function(value, old) {
			if (value == this.self(arguments).MODE_DETAILLED) {
				this._showChildControl('subject-container');
				this.setResizable(true, false, true, false);
				this.setUseResizeFrame(false);
				
				this.removeListener('click', this._onClickInline, this);
				
				this.addListener('click', this._onClickDetailled, this);
				this.addListener('resize', this._onResize, this);
			} else {
				this._excludeChildControl('subject-container');
				this.setResizable(false, false, false, false);
				
				this.removeListener('click', this._onClickDetailled, this);
				
				this.addListener('click', this._onClickInline, this);
			}
			
			this._applyColor();
			this._applySubject();
                        this._applyMenu();
			
			// Update layout
			qx.ui.core.queue.Layout.add(this);
			
			this.fireDataEvent('changeMode', value, old);
		},
		
		_applyType: function(value, old) {
			//TODO
		},
		
		_applyColor: function(value) {
			if (typeof value == 'undefined') {
				value = this.__eventModel.getCalendar().getColor();
			}
			
			if (value) {
				var rgb = qx.util.ColorUtil.hex6StringToRgb(value);
				
				var fontColor = '#000000';
				//change text color from white to black depending on the background
				if (rgb[0] < 128 || rgb[1] < 128 || rgb[2] < 128) {
					fontColor = '#ffffff';
				}
				this.getChildControl('header-label').setTextColor(fontColor);
				
				//background color of the subject container is slightly brighter
				rgb = [
					(rgb[0] + 20) > 255 ? 255 : (rgb[0] + 20),
					(rgb[1] + 20) > 255 ? 255 : (rgb[1] + 20),
					(rgb[2] + 20) > 255 ? 255 : (rgb[2] + 20),
				];
				var subjectBgColor = qx.util.ColorUtil.rgbToHexString(rgb);
				
				this.getChildControl('header-bar').setBackgroundColor(value);
				this.setDecorator(new qx.ui.decoration.RoundBorderBeveled(null, value, 0, 3, 3, 3, 3));
				if (this._isChildControlVisible('subject-container')) {
					this.getChildControl('subject-container').setBackgroundColor('#' + subjectBgColor);
					this.getChildControl('subject-label').setTextColor(fontColor);
				}
			}
		},
		
		// overridden
		_createChildControlImpl : function(id) {
			var control;
			 
			switch(id) {
				case 'header-label':
					control = new qx.ui.basic.Label().set({
						font: new qx.bom.Font(11, ['Arial','sans-serif']),
						paddingLeft: 2,
						paddingRight: 2
					});
					control.setAnonymous(true);
					this.getChildControl('header-bar')._add(control, {edge: 'center'});
					break;
				
				case 'header-bar':
					control = new qx.ui.container.Composite(new qx.ui.layout.Dock()).set({
						cursor: 'move'
					});
					this._add(control, {edge: 'north'});
					break;
				
				case 'type-icon':
					//TODO
					break;
				
				case 'icon':
					//TODO
					break;
				
				case 'subject-container':
					control = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
						alignY: 'top'
					});
					control.setAnonymous(true);
					this._add(control, {edge: 'center'});
					break;
					
				case 'subject-label':
					control = new qx.ui.basic.Label().set({
						font: new qx.bom.Font(11, ['Arial','sans-serif']),
						padding: 2,
						rich: true
					});
					control.setAnonymous(true);
					this.getChildControl('subject-container')._addAt(control, 0);
					break;
			}  
		
			return control || this.base(arguments, id);
		},
		_onClickDetailled: function(e) {
			if (this.__simpleClick && e.getButton() == 'left') {
				var dialog = new eyeos.calendar.dialogs.EditEvent(this); 
				dialog.open(e);
				e.stopPropagation();
			}
			this.__simpleClick = true;
		},
		
		_onClickInline: function(e) {
			if (this.__simpleClick && e.getButton() == 'left') {
				 var dialog = new eyeos.calendar.dialogs.EditEvent(this); 
				dialog.open(e);
				e.stopPropagation();
			}
			this.__simpleClick = true;
		},
		
		_onDeleteEvent: function(e) {
			this.destroy();
		},
		
		_onResize: function(e) {
			// Avoid popup on mouse release
			this.__simpleClick = false;
		},
		
		_onUpdateCalendar: function(e) {
			this._applyColor(e.getData().getColor());
		},
		
		_onUpdateDetails: function(e) {
			this._applySubject(this.__eventModel.getSubject(), null);
			
			// Mark text size cache as invalid
			this.__invalidContentSize = true;
			
			// Update layout
			qx.ui.core.queue.Layout.add(this);
		},
		
		_onUpdateTime: function(e) {
			if (this.getMode() == this.self(arguments).MODE_DETAILLED) {
				var format = qx.locale.Date.getTimeFormat('short');
				var timeStart = new qx.util.format.DateFormat(format).format(this.__eventModel.getTimeStart());
				var timeEnd = new qx.util.format.DateFormat(format).format(this.__eventModel.getTimeEnd());
				var label = timeStart + ' - ' + timeEnd;
				this.getChildControl('subject-label').setValue(label);
				// Mark text size cache as invalid
				this.__invalidContentSize = true;
				
				// Update layout
				qx.ui.core.queue.Layout.add(this);
				
				// Necessary to prevent updating the location from the time
				// (otherwise it will be possible to drag the event on another day, but not
				// on another time range)
				if (!this.__isDragged) {
					var container = this.getLayoutParent();
					if (container instanceof eyeos.calendar.view.GridCalendar.EventsContainer) {
						container.updateLocationFromEventTime(this);
					}
				}
			}
		},
		
		getModel: function() {
			return this.__eventModel;
		},
		
		getOriginalContainer: function() {
			return this.__originalContainer;
		},
		
		
		destruct : function() {
			//TODO
		},
		setMoveable : function(value) {
			this.moveable=value;
			this.setDraggable(value);
		},
        __createDeleteMenu: function(menyType) {
            var menu = new qx.ui.menu.Menu();
			var menuLabel = new qx.ui.menu.Button(this.__eventModel.getSubject(), 'index.php?extern=images/calendar/delete_event.png').set({
				enabled: false
			});
				if (menyType == 'group'){
							menu.add(menuLabel);
							menu.add(new qx.ui.menu.Separator());
							var deleteThisOnly = new qx.ui.menu.Button(tr('Delete only this event'), 'index.php?extern=images/16x16/actions/edit-delete.png')
							menu.add(deleteThisOnly);
							deleteThisOnly.addListener('execute', function(e) {
									this.getController().deleteEvent(this.__eventModel,0);
							}, this);

							var deleteAll = new qx.ui.menu.Button(tr('Delete all events of this series'), 'index.php?extern=images/calendar/delete_all.png')
							menu.add(deleteAll);
							deleteAll.addListener('execute', function(e) {
									this.getController().deleteEvent(this.__eventModel,1);
							}, this);
				} else {
							var deleteItem = new qx.ui.menu.Button(tr('Delete'), 'index.php?extern=images/16x16/actions/edit-delete.png');
							menu.add(deleteItem);
							deleteItem.addListener('execute', function(e) {
									this.getController().deleteEvent(this.__eventModel,0);
							}, this);
				}
			return menu;
		}
	}
});