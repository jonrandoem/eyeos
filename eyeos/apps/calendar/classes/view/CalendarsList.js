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
 * Component used to display a list of calendars in a GroupBox, each calendar
 * is a special checkbox with a menu button (colored square) aligned to the right
 * and used to quickly access and change settings or visual properties.
 * 
 * A Settings button is also displayed on the bottom left, to open the general
 * settings dialog for the type of calendars that is being displayed.
 * (user calendars, workgroup calendars, shared calendars, ...)
 * 
 * A space on the bottom right is left empty and can be used by any child class
 * to add a button or any other necessary widget.
 */
qx.Class.define('eyeos.calendar.view.CalendarsList', {
	extend: qx.ui.container.Composite,
	
	/**
	 * 
	 * @param title {String}
	 */
	construct: function (title) {
		arguments.callee.base.call(this);
		this.title=title;
		this.__init();
		
		this.setTitle(title);
	},
	
	properties: {
		title: {
			check: 'String',
			apply: '_applyTitle'
		}
	},
	
	members: {
		
		_groupBox: null,
		_buttonsGroupBox: null,
		_bottomContainer: null,
		_calendarCheckBoxes: [],
		_calendarsContainer: null,
		_settingsButton: null,
		
		
		_applyTitle: function(newValue, oldValue) {
			this._groupBox.setLegend(newValue);
		},
		
		__init: function() {
			this.setLayout(new qx.ui.layout.VBox(0));
			this.set({
				minHeight: 80
			});
			
			//
			//	MIDDLE (calendars list as checkboxes)
			//
			this._groupBox = new qx.ui.groupbox.GroupBox().set({
				contentPaddingLeft: 11,
				contentPaddingRight: 11,
				contentPaddingTop: 7,
				contentPaddingBottom: 7,
				marginBottom: 0
			});
			this._groupBox.setLayout(new qx.ui.layout.Dock());
			this.add(this._groupBox, {flex: 1});
			
			this._calendarsContainer = new qx.ui.container.SlideBar('vertical');
			this._calendarsContainer.setLayout(new qx.ui.layout.VBox(4));
			this._groupBox.add(this._calendarsContainer, {edge: 'north', flex: 1});
			
			//
			//	BOTTOM (Settings button + [?])
			//
			this._buttonsGroupBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(1,'left')).set({
				paddingTop: 2,
				paddingBottom: 2
				//marginTop: -3
			});
			
			if(this.title==tr('My Calendars')){
                this.add(this._buttonsGroupBox);
            }else if(this.title==tr('Remote Calendars')){
                this.add(this._buttonsGroupBox);
            }
//			this._settingsButton = new qx.ui.form.Button(tr('Settings')).set({
//				decorator: null,
//				cursor: 'pointer'
//			});
//			this._settingsButton.addListener('execute', this._onSettingsButtonClicked, this);
//			this._buttonsGroupBox.add(this._settingsButton, {row: 0, column: 0});
		},
		
		_onSettingsButtonClicked: function(e) {
			eyeos.consoleWarn('[eyeos.calendar.view.CalendarsList] _onSettingsButtonClicked() Should be overriden.');
		},
		
		_refresh: function(calendarsList) {
			eyeos.consoleWarn('[eyeos.calendar.view.CalendarsList] _refresh() Should be overriden.');
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});

qx.Class.define('eyeos.calendar.view.MyCalendarsList', {
	extend: eyeos.calendar.view.CalendarsList,
	implement: [eyeos.calendar.IView],
	statics: {
		SortCalendarsById: function(a, b) {
			if (a.getId() < b.getId()) {
				return -1;
			} else if (a.getId() > b.getId()) {
				return 1;
			} else {
				return 0;
			}
		}
	},
	construct: function () {
		arguments.callee.base.call(this, tr('My Calendars'));
		
		// Add "New" button on bottom-left
        var btnDecorator = new qx.ui.decoration.RoundBorderBeveled(null, "#b9b9b9", 0, 5, 5, 5, 5);
		var newCalendarButton = new qx.ui.form.Button(tr('New')).set({
		/*decorator: btnDecorator,
        backgroundColor:"#e9e9e9",
		cursor: 'pointer'*/
		});
        this._buttonsGroupBox.add(newCalendarButton);
		this.__attachNewCalendarPopup(newCalendarButton);
	},
	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller',
			apply: '_applyController'
		}
	},
	
	members: {
		
		__calendars: null,
		
		_applyController: function(value, old) { 
			value.addListener('changeCalendars', function(e) {
				this._refresh(value.getCalendars());
			}, this);
			value.addListener('createCalendar', function(e) {
				this._refresh(value.getCalendars());
			}, this);
			value.addListener('deleteCalendar', function(e) {
				this._refresh(value.getCalendars());
			}, this);
		},
		
		__attachNewCalendarPopup: function(newCalendarButton) {
			var popup = new qx.ui.popup.Popup(new qx.ui.layout.Grid(5, 5)).set({
				height: 30,
				width: 120,
				padding: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#b1afb1', 0, 5, 5, 5, 5).set({
					backgroundColor: '#ffffff'
				})
			});
			popup.getLayout().setRowAlign(0, 'left', 'middle');
			
			// Label
			popup.add(new qx.ui.basic.Label(tr('New calendar name:')), {row: 0, column: 0});
			
			// Textfield
			var textField = new qx.ui.form.TextField();
			popup.add(textField, {row: 0, column: 1});
			
			// OK Button
			var okButton = new qx.ui.form.Button(tr('Ok'));
			popup.add(okButton, {row: 0, column: 2});
			
			// Validate callback
			var onValidate = function(e) {
				var calendar = new eyeos.calendar.model.Calendar();
				calendar.setName(textField.getValue());
				this.getController().createNewCalendar(calendar);
				textField.setValue('');
				popup.hide();
			};
			
			// Assign callback
			textField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					onValidate.call(this);
				}
			}, this);
			okButton.addListener('execute', onValidate, this);
			
			popup.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'escape') {
					textField.setValue('');
					popup.hide();
				}
			});
			
			// Attach popup to button
			newCalendarButton.addListener('execute', function(e) {
				popup.placeToWidget(newCalendarButton);
		        popup.show();
		        textField.focus();
			}, this);
		},
		
		__addCheckBox: function(calendar) {
			var chkbox = new eyeos.calendar.view.CalendarsList.CheckBox(calendar).set({
				allowGrowY: false
			});
			this._calendarsContainer.add(chkbox, {flex: 1});
			this._calendarCheckBoxes.push(chkbox);
			
			// Menu
			var menu = this.__createMenu(calendar);
			chkbox.attachMenu(menu);
			
			return chkbox;
		},
		
		__createMenu: function(calendar) {
			var menu = new qx.ui.menu.Menu();
			
			var calendarLabel = new qx.ui.menu.Button(calendar.getName(), 'index.php?extern=images/16x16/actions/view-pim-calendar.png').set({
				enabled: false
			});
			menu.add(calendarLabel);
			menu.add(new qx.ui.menu.Separator());
			menu.add(new qx.ui.menu.Button(tr('Add event'), 'index.php?extern=images/16x16/actions/appointment-new.png'));
			menu.add(new qx.ui.menu.Button(tr('Settings'), 'index.php?extern=images/16x16/actions/configure.png'));
			var deleteButton= new qx.ui.menu.Button(tr('Delete Calendar'), 'index.php?extern=images/16x16/actions/edit-delete.png');
				
			deleteButton.addListener('execute', function(e) {
												 
				this.getController().deleteCalendar(calendar);		
				
			}, this);
			
			menu.add(deleteButton);
			menu.add(new qx.ui.menu.Separator());
			menu.add(new eyeos.calendar.view.CalendarColorsMenuItem(function(color) {
				calendar.setColor(color);
				this.getController().saveCalendarPreferences(calendar);
			}, this));
			
			return menu;
		},
		
		/**
		 * 
		 * @param calendarsList {Array}
		 */
		_refresh: function(calendarsList) {
			this._calendarsContainer.removeAll();
			this._calendarCheckBoxes = new Array();
			for(var id in calendarsList) {
				this.__addCheckBox(calendarsList[id]);
			}
			this.__calendars = calendarsList;
		},
		
		_onSettingsButtonClicked: function(e) {
			alert(tr('Not Implemented')+'...');
		},
		
		
		destruct : function() {
			//TODO
		}
	}
});

qx.Class.define('eyeos.calendar.view.GroupCalendarsList', {
	extend: eyeos.calendar.view.CalendarsList,
	implement: [eyeos.calendar.IView],
	statics: {
		SortCalendarsById: function(a, b) {
			if (a.getId() < b.getId()) {
				return -1;
			} else if (a.getId() > b.getId()) {
				return 1;
			} else {
				return 0;
			}
		}
	},
	
	construct: function () {
		arguments.callee.base.call(this, tr('Group Calendars'));
		this.setVisibility('excluded'); // ini value, we set it to visible if group calendars are present there
		// Add "New" button on bottom-left
		/*var newCalendarButton = new qx.ui.form.Button(tr('New')).set({
			decorator: null,
			cursor: 'pointer'
		});
		this._buttonsGroupBox.add(newCalendarButton, {row: 0, column: 0});
		this.__attachNewCalendarPopup(newCalendarButton);*/
	},
	
	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller',
			apply: '_applyController'
		}
	},
	
	members: {
		
		__calendars: null,
		
		_applyController: function(value, old) {
			value.addListener('changeCalendars', function(e) {
				this._refresh(value.getGroupcalendars());
			}, this);
			value.addListener('createCalendar', function(e) {
				this._refresh(value.getGroupcalendars());
			}, this);
			value.addListener('deleteCalendar', function(e) {
				this._refresh(value.getGroupcalendars());
			}, this);
		},
		
		/*__attachNewCalendarPopup: function(newCalendarButton) {
			var popup = new qx.ui.popup.Popup(new qx.ui.layout.Grid(5, 5)).set({
				height: 30,
				width: 120,
				padding: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#b1afb1', 0, 5, 5, 5, 5).set({
					backgroundColor: '#ffffff'
				})
			});
			popup.getLayout().setRowAlign(0, 'left', 'middle');
			
			// Label
			popup.add(new qx.ui.basic.Label('New calendar name:'), {row: 0, column: 0});
			
			// Textfield
			var textField = new qx.ui.form.TextField();
			popup.add(textField, {row: 0, column: 1});
			
			// OK Button
			var okButton = new qx.ui.form.Button('Ok');
			popup.add(okButton, {row: 0, column: 2});
			
			// Validate callback
			var onValidate = function(e) {
				var calendar = new eyeos.calendar.model.Calendar();
				calendar.setName(textField.getValue());
				this.getController().createNewCalendar(calendar);
				textField.setValue('');
				popup.hide();
			};
			
			// Assign callback
			textField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					onValidate.call(this);
				}
			}, this);
			okButton.addListener('execute', onValidate, this);
			
			popup.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'escape') {
					textField.setValue('');
					popup.hide();
				}
			});
			
			// Attach popup to button
			newCalendarButton.addListener('execute', function(e) {
				popup.placeToWidget(newCalendarButton);
		        popup.show();
		        textField.focus();
			}, this);
		},*/
		
		__addCheckBox: function(calendar) {
			var chkbox = new eyeos.calendar.view.CalendarsList.CheckBox(calendar).set({
				allowGrowY: false
			});
			this._calendarsContainer.add(chkbox, {flex: 1});
			this._calendarCheckBoxes.push(chkbox);
			
			// Menu
			var menu = this.__createMenu(calendar);
			chkbox.attachMenu(menu);
			
			return chkbox;
		},
		
		__createMenu: function(calendar) {
			var menu = new qx.ui.menu.Menu();
			
			var calendarLabel = new qx.ui.menu.Button(calendar.getName(), 'index.php?extern=images/16x16/actions/view-pim-calendar.png').set({
				enabled: false
			});
			menu.add(calendarLabel);
			menu.add(new qx.ui.menu.Separator());
			menu.add(new qx.ui.menu.Button(tr('Add event'), 'index.php?extern=images/16x16/actions/appointment-new.png'));
			menu.add(new qx.ui.menu.Button(tr('Settings'), 'index.php?extern=images/16x16/actions/configure.png'));			
			menu.add(new qx.ui.menu.Separator());
			menu.add(new eyeos.calendar.view.CalendarColorsMenuItem(function(color) {
				calendar.setColor(color);
				this.getController().saveCalendarPreferences(calendar);
			}, this));
			
			return menu;
		},
		
		/**
		 * 
		 * @param calendarsList {Array}
		 */
		_refresh: function(calendarsList) {
			this._calendarsContainer.removeAll();
			this._calendarCheckBoxes = new Array();
			for(var id in calendarsList) {
				this.__addCheckBox(calendarsList[id]);
			}
			this.__calendars = calendarsList;
			// to set the visibility of group calendars
			if(this._isEmpty(this.__calendars))
				this.setVisibility('excluded');
			else
				this.setVisibility('visible');
			 //-----------------
		},
		
		_onSettingsButtonClicked: function(e) {
			alert(tr('Not Implemented')+'...');
		},

		destruct : function() {
			//TODO
		},
		_isEmpty : function(ob) {
			for(var i in ob){ return false;}
 			 return true;

		}
	}
});



/**
 * CalendarsList inner class.
 * 
 * @access protected
 */
qx.Class.define('eyeos.calendar.view.CalendarsList.CheckBox', {
	extend: qx.ui.form.CheckBox,
	
	/**
	 * 
	 * @param calendar {eyeos.calendar.model.Calendar}
	 */
	construct: function (calendar) {
		arguments.callee.base.call(this, calendar.getName());
		this.setCalendar(calendar);
		calendar.addListener('changeColor', function(e) {
			this._onChangeColor(e.getData());
		}, this);
		this._onChangeColor(calendar.getColor());
		
		// calendar to checkbox sync
		calendar.addListener('changeVisibility', function(e) {
			this.setValue(e.getData());
		}, this);
		
		// checkbox to calendar sync
		this.setValue(calendar.getVisible());
		this.addListener('changeValue', function(e) {
			calendar.setVisible(e.getData());
		}, this);
		
		this._setLayout(new eyeos.calendar.layout.CalendarsListCheckBoxLayout());
	},
	
	properties: {
		calendar: {
			init: null,
			check: 'eyeos.calendar.model.Calendar'
		}
	},
	
	members: {
		
		// overridden
		_computeSizeHint: function() {
			var hint = this.base(arguments);
			
			// Ugly hack forcing the width to a value that should not be reachable,
			// just to be able to align the menuButton to the right when layouting
			// the widget (the layout is based on qx.ui.layout.Atom, which does not
			// support flex for the content).
			/** @see eyeos.calendar.layout.CalendarsListCheckBoxLayout.renderLayout() */
			hint.width = 10000;
			
			return hint;
		},
		
		// overridden
		_createChildControlImpl : function(id) {
			var control;
		
			switch(id) {
				case 'menu-button':
					control = new qx.ui.basic.Image('index.php?extern=images/calendar/tiny_arrow_white.png').set({
						width: 13,
						height: 13,
						maxHeight: 13,
						backgroundColor: '#000'			//TODO
					});
					
					this._addAt(control, 2);
					break;	
			}
			
			return control || this.base(arguments, id);
		},
		
		_onChangeColor: function(value, old) {
			var rgb = qx.util.ColorUtil.hex6StringToRgb(value);
			
			var imageSrc = 'tiny_arrow_black.png';
			//change text color from white to black depending on the background
			if (rgb[0] < 128 || rgb[1] < 128 || rgb[2] < 128) {
				imageSrc = 'tiny_arrow_white.png';
			}
			var image = this.getChildControl('menu-button');
			
			image.setBackgroundColor(value);
			image.setSource('index.php?extern=images/calendar/' + imageSrc);
		},
		
		// overridden
		_onMouseUp : function(e) {
			this.releaseCapture();
			
			if (e.getTarget() === this.getChildControl('menu-button')) {
				this.removeState("pressed");
				this.removeState("abandoned");
				e.stopPropagation();
				return;
			}
			this.base(arguments, e);
		},
		
		attachMenu: function(menu) {
			var image = this.getChildControl('menu-button');
			image.addListener('appear', function(e) {
				menu.placeToWidget(image);
			}, this);
			menu.setOpener(image);
			
			image.addListener('click', function(e) {
				e.stopPropagation();
				menu.open();
			}, this);
		}
	}
});

/**
 * CalendarsList checkbox, representing a Calendar.
 * 
 * @access protected
 */
qx.Class.define('eyeos.calendar.layout.CalendarsListCheckBoxLayout', {
	extend : qx.ui.layout.Atom,
	
	construct: function () {
		arguments.callee.base.call(this);
	},
	
	members: {
		
		connectToWidget: function(widget) {
			if (! widget instanceof eyeos.calendar.view.CalendarsList.CheckBox) {
				throw '[eyeos.calendar.layout.CalendarsListCheckBoxLayout] This layout only works with instances of eyeos.calendar.layout.CalendarsList.CheckBox';
			}
			this.base(arguments, widget);
		},
		
		// overridden
    	renderLayout: function(availWidth, availHeight) {
			this.base(arguments, availWidth, availHeight);
			
			// Align menuButton to the right
			var menuButton = this._getLayoutChildren()[2];
			var originalBounds = menuButton.getBounds();
			var newLeft = availWidth - originalBounds.width;
			menuButton.renderLayout(newLeft, originalBounds.top, originalBounds.width, originalBounds.height);
		}
	}
});

/**
 * CalendarsList checkbox, representing a Calendar.
 * 
 * @access protected
 */
qx.Class.define('eyeos.calendar.view.CalendarColorsMenuItem', {
	extend : qx.ui.container.Composite,
	statics: {
		SEPARATOR_SIZE: 3
	},
	construct: function (onClickCallback, onClickCallbackContext) {
		arguments.callee.base.call(this);
		if (!onClickCallback) {
			throw '[eyeos.calendar.view.CalendarColorsMenuItem] construct() Missing onClickCallback argument';
		}
		this.__callback = onClickCallback;
		this.__callbackContext = onClickCallbackContext;
		
		this._setLayout(new qx.ui.layout.Grid(this.self(arguments).SEPARATOR_SIZE, this.self(arguments).SEPARATOR_SIZE));
		
		this._init();
	},
	
	properties: {
		// overridden
		appearance: {
			refine: true,
			init: "menu-button"
		}
	},
	
	members: {
		__callback: null,
		__callbackContext: null,
		__childrenSizes: [0, 0, 0, 0],
		
		
		_init: function() {
			var color = eyeos.calendar.Constants.CALENDAR_DEFAULT_COLORS;
			
			var c = 0;
			for(var i = 0; i < 3 ; i++) {
				for(var j = 0; j < 7 ; j++, c++) {
					var widget = new qx.ui.core.Widget().set({
						width: 15,
						height: 15,
						backgroundColor: color[c],
						cursor: 'pointer'
					});
					widget.addListener('mousedown', function(color) {
						return function(e) {
							this.__callback.call(this.__callbackContext, color);
						}
					}(color[c]), this);
					
					this.add(widget, {row: i, column: j});
				}
			}
			
			this.__childrenSizes[1] = 6 * 15;
		},
		
		getChildrenSizes: function() {
			return this.__childrenSizes;
		}
	}
});

qx.Class.define('eyeos.calendar.view.RemoteCalendarsList', {
	extend: eyeos.calendar.view.CalendarsList,
	implement: [eyeos.calendar.IView],
	statics: {
		SortCalendarsById: function(a, b) {
			if (a.getId() < b.getId()) {
				return -1;
			} else if (a.getId() > b.getId()) {
				return 1;
			} else {
				return 0;
			}
		}
	},

	construct: function () {
		arguments.callee.base.call(this, tr('Remote Calendars'));
		//this.setVisibility('excluded'); // ini value, we set it to visible if group calendars are present there
		// Add "New" button on bottom-left
		var newCalendarButton = new qx.ui.form.Button(tr('New')).set({
		/*decorator: btnDecorator,
        backgroundColor:"#e9e9e9",
		cursor: 'pointer'*/
		});
		this._buttonsGroupBox.add(newCalendarButton, {row: 0, column: 0});
		this.__attachNewCalendarPopup(newCalendarButton);
	},

	properties: {
		controller: {
			init: null,
			check: 'eyeos.calendar.Controller',
			apply: '_applyController'
		}
	},

	members: {

		__calendars: null,

		_applyController: function(value, old) { 
			value.addListener('changeRemoteCalendars', function(e) {
				this._refresh(value.getRemotecalendars());
			}, this);
			value.addListener('createRemoteCalendar', function(e) { 
				this._refresh(value.getRemotecalendars());
			}, this);
			value.addListener('deleteRemoteCalendar', function(e) {
				this._refresh(value.getRemotecalendars());
			}, this);
		},

		__attachNewCalendarPopup: function(newCalendarButton) {
			var popup = new qx.ui.popup.Popup(new qx.ui.layout.Grid(5, 5)).set({
				height: 30,
				width: 120,
				padding: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled(null, '#b1afb1', 0, 5, 5, 5, 5).set({
					backgroundColor: '#ffffff'
				})
			});
			popup.getLayout().setRowAlign(0, 'left', 'middle');

			// Label
			//popup.add(new qx.ui.basic.Label('New calendar name:'), {row: 0, column: 0});

			// Textfield
			var textName = new qx.ui.form.TextField().set({
                placeholder:"Name"
            });
			popup.add(textName, {row: 0, column: 1});

            var textUserName = new qx.ui.form.TextField().set({
                placeholder: 'User Name'
            });
			popup.add(textUserName, {row: 1, column: 1});

            var textPassword = new qx.ui.form.PasswordField().set({
                placeholder: 'Password'
            });
			popup.add(textPassword, {row: 2, column: 1});

            var textCalendarId = new qx.ui.form.TextField().set({
                placeholder: 'Calendar Id'
            });
			popup.add(textCalendarId, {row: 3, column: 1});

			// OK Button
			var okButton = new qx.ui.form.Button('Ok');
			popup.add(okButton, {row: 4, column: 2});

			// Validate callback
			var onValidate = function(e) {
				var calendar = new eyeos.calendar.model.Calendar();
				calendar.setName(textName.getValue());
                calendar.setUsername(textUserName.getValue());
                calendar.setPassword(textPassword.getValue());
                calendar.setId(textCalendarId.getValue());
				this.getController().createRemoteCalendar(calendar);
				textName.setValue('');
                textUserName.setValue('');
                textPassword.setValue('');
                textCalendarId.setValue('');
				popup.hide();
			};

			// Assign callback
           /*
			textField.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					onValidate.call(this);
				}
			}, this);
            */
			okButton.addListener('execute', onValidate, this);

			popup.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'escape') {
					textName.setValue('');
                    textUserName.setValue('');
                    textPassword.setValue('');
                    textCalendarId.setValue('');
					popup.hide();
				}
			});

			// Attach popup to button
			newCalendarButton.addListener('execute', function(e) {
				popup.placeToWidget(newCalendarButton);
		        popup.show();
		        textName.focus();
			}, this);
		},

		__addCheckBox: function(calendar) { 
			var chkbox = new eyeos.calendar.view.CalendarsList.CheckBox(calendar).set({
				allowGrowY: false
			});
			this._calendarsContainer.add(chkbox, {flex: 1});
			this._calendarCheckBoxes.push(chkbox);

			// Menu
			var menu = this.__createMenu(calendar);
			chkbox.attachMenu(menu);

			return chkbox;
		},

		__createMenu: function(calendar) {
			var menu = new qx.ui.menu.Menu();

			var calendarLabel = new qx.ui.menu.Button(calendar.getName(), 'index.php?extern=images/16x16/actions/view-pim-calendar.png').set({
				enabled: false
			});
			menu.add(calendarLabel);
			menu.add(new qx.ui.menu.Separator());
			menu.add(new qx.ui.menu.Button(tr('Add event'), 'index.php?extern=images/16x16/actions/appointment-new.png'));
			menu.add(new qx.ui.menu.Button(tr('Settings'), 'index.php?extern=images/16x16/actions/configure.png'));
			var deleteButton= new qx.ui.menu.Button(tr('Delete Calendar'), 'index.php?extern=images/16x16/actions/edit-delete.png');
				
			deleteButton.addListener('execute', function(e) {
												 
				this.getController().deleteRemoteCalendar(calendar);		
				
			}, this);
			
			menu.add(deleteButton);
			menu.add(new qx.ui.menu.Separator());
			menu.add(new eyeos.calendar.view.CalendarColorsMenuItem(function(color) {
				calendar.setColor(color);
				this.getController().saveCalendarPreferences(calendar);
			}, this));

			return menu;
		},

		/**
		 *
		 * @param calendarsList {Array}
		 */
		_refresh: function(calendarsList) {  //console.log(calendarsList);
			this._calendarsContainer.removeAll();
			this._calendarCheckBoxes = new Array();
			for(var id in calendarsList) { 
				this.__addCheckBox(calendarsList[id]);
			}
			this.__calendars = calendarsList;
			
			// we need to show the remote calendar box always so that user can add new calendars
			// to set the visibility of remote calendars
			/*if(this._isEmpty(this.__calendars))
				this.setVisibility('excluded');
			else
				this.setVisibility('visible');*/
			 //-----------------
		},

		_onSettingsButtonClicked: function(e) {
			alert(tr('Not Implemented')+'...');
		},

		destruct : function() {
			//TODO
		},
		_isEmpty : function(ob) {
			for(var i in ob){ return false;}
 			 return true;

		}
	}
});
