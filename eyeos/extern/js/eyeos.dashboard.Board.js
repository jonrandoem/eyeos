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
* must display the words "Powered by eyeos" and rdashboardetain the original copyright notice.
*/

/**
 * eyeos.dashboard.Board
 * 
 * This is the main layout of the dashboard which holds the containers and it's responsible for building the listeners
 * to these ones when adding them to the board. The number of containers it's dynamic and can be switched by the user 
 * so this class also implements methods to set the container number and also for rebuilding the entire layout.
 * 
 */

qx.Class.define('eyeos.dashboard.Board', {
			
	'extend': qx.ui.container.Scroll,
			
	'construct': function (containers) {
		arguments.callee.base.call(this);
	
		this.set({
			//			'backgroundColor': 'red',
			'contentPadding': 5,
			'padding': 0,
			'zIndex': 20
		});

		this._dashboardLayer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
		this._transparentLayer = new qx.ui.container.Composite(new qx.ui.layout.VBox(0), {
			'droppable': false
		});
		this._transparentLayer.add(this._dashboardLayer, {
			'flex': 1
		});
		this.add(this._transparentLayer, {
			'flex': 1
		});
		if (containers != undefined) {
			this.setContainerNumber(containers);
		}
		this._screenWidth = screen.width;
		this.build();
	},

	'properties':{
		desktopMode:{
			init:null
		}
	},
		
	'members': {
	
		'_containers': 2,
		'_dashboardLayer': false,
		'_transparentLayer': false,
		'widgets': Array(),
		
		
		'addContainer': function (element) {
			this._dashboardLayer.add(element, {
				'flex': 1
			});
			this._addListeners(element);
		},
		
		'getContainer': function (position) {
			return this._dashboardLayer.getChildren()[parseInt(position - 1)];
		},
		
		'getFirstContainer' : function () {
			return this.getContainer(1);
		},
		
		'getLastContainer' : function () {
			return this.getContainer(this._dashboardLayer.getChildren().length);
		},
		
		'getContainerNumber': function () {
			return this._containers;
		},
				
		'setContainerNumber': function (quantity) {
			this._containers = quantity;
		},

		'removeAllWidgets': function () {
			var columns = this._dashboardLayer.getChildren();
			for (var i = 0; i < columns.length; ++i) {
				columns[i].removeAll();
			}
		},
		
		'getAllWidgets': function () {
			var columns = this._dashboardLayer.getChildren();
			
			for (var i = 0; i < columns.length; ++i) {
				var widgets = columns[i].getWidgets();
				if (widgets != undefined) {
					this.widgets[i] = Array();
					for (var f = 0; f < widgets.length; ++f) {
						if (widgets[f] instanceof eyeos.dashboard.Widget) {
							this.widgets[i].push(widgets[f]);
						}
					}
				}
			}
			return this.widgets;
		},
		'getAllWidgetsPositions': function () {
			var result = new Array();
			var columns = this._dashboardLayer.getChildren();

			for (var col = 0; col < columns.length; ++col) {
				var widgets = columns[col].getWidgets();
				for (var pos = 0; pos < widgets.length; ++pos) {
					var widget = {
						id :  widgets[pos].getId(),
						column : col + 1,
						position : pos,
						minimized: widgets[pos]._isMinimized
					};
					result.push(widget);
				}
			}
			return result;
		},

		'_addListeners': function (element) {
			if(this.getDesktopMode() == 'dashboard') {
				if (!element.hasListener('drop')) {
					element.addListener('drop', function(e){
						var widget = e.getRelatedTarget();
						var checknumWidget = widget.getChecknum();
						if (widget instanceof eyeos.dashboard.Widget) {
							this.addWidgetAt(widget);
							this.removeNextTargetBox();
							widget.resetUserBounds();
							widget.setVisibleTitlebarButtons(false);
							widget.setBorderActive(false);

							var params = document.eyeDashBoard.getAllWidgetsPositions();
							eyeos.callMessage(checknumWidget, 'savePositionsWidget', params, function () {
								});
						}
					
					});

					element.addListener('dragover', function(e){
						var widget = e.getRelatedTarget();
						if (widget != null && widget instanceof eyeos.dashboard.Widget) {
							if (!this.getNextTargetBox()) {
								this.drawNextTargetBox(widget, this.getChildren());
								widget.getCurrentContainer().removeNextTargetBox();
								widget.setCurrentContainer(this);
							} else {
								widget._lastWidgetOver = false;
							}
						}
					});
				}
			}
		},
		
		'build': function(rebuildFlag){
			
			if (screen.width != this._screenWidth) {
				this._screenWidth = screen.width;
			}
			
			this._minWidth = parseInt((this._screenWidth / this.getContainerNumber()) / 2);
			this._maxWidth = parseInt(this._screenWidth / this.getContainerNumber());
			
			for (var i = 0; i < this._containers; ++i) {
				var container = new eyeos.dashboard.Container();
				container.set({
					'minWidth': this._minWidth,
					'width': this._maxWidth,
					'maxWidth': this._maxWidth
				});
				this.addContainer(container);
				if (this.widgets[i] != undefined && this.widgets[i].length > 0) {
					for (var f = 0; f < this.widgets[i].length; ++f) {
						container.addWidget(this.widgets[i][f]);
					}
					delete this.widgets[i];
				}
			}
		
			// If there are widgets that couldn't be placed yet cause the column they were has been deleted we'll add them
			// to the last available container.
			if (rebuildFlag) {
				container = this.getLastContainer();
				for (var i = 0; i < this.widgets.length; ++i) {
					if (this.widgets[i] != undefined && this.widgets[i].length > 0) {
						for (var f = 0; f < this.widgets[i].length; ++f) {
							container.addWidget(this.widgets[i][f]);
							this.widgets[i][f].setCurrentContainer(container);
						}
						delete this.widgets[i];
					}
				}
			}
		},
		
		'rebuild': function(containers){
			this.getAllWidgets();
			this._dashboardLayer._removeAll();
			this.build(true);
		},
		
		'addTestWidget': function (widget, position) {
			var widget = new eyeos.dashboard.Widget();
			widget.setTitle('test #'+parseInt(Math.round(Math.random() * 100)));
			var testWidget = new qx.ui.basic.Label('This is a test widget');
			var testWidget2 = new qx.ui.basic.Label('This is just for test');
			widget.addContent(testWidget);
			widget.addSettings(testWidget2);
			this.getLastContainer().addWidget(widget);
		}
	}
});