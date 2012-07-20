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
 * eyeos.dashboard.Container
 * 
 * This is the space for the widget holders called "containers". Everytime the user adds a widget to a container all the
 * drag&drop listeners are built. It's also the responsible for drawing, moving and removing the nextTargetBox showing the 
 * future position of the moving widget. The containers have methods to addWidget and addWidgetAt so you can add it at
 * the last available position or place it on a determinated one. 
 * 
 */

qx.Class.define('eyeos.dashboard.Container', {
			
	'extend': qx.ui.container.Composite,
			
	'construct': function () {
		arguments.callee.base.call(this);
		this.setLayout(new qx.ui.layout.VBox(5));
		this.set({
			'droppable': true
		});
	},
			
	'members': {
		
		'_nextTargetBox': false,
		
		'_addListeners': function (element) {
			
			if (!element.hasListener('drag')) {
			
				element.addListener('mouseover', function(e){
					if (!this.getBlocked()) {
						this.setBorderActive(true);
					}
				});
				
				element.addListener('mouseout', function(e){
					if (!this.getBlocked()) {
						if (!qx.ui.core.Widget.contains(element, e.getRelatedTarget())) {
							if (!element._widgetMenu.isVisible()) {
								this.setBorderActive(false);
							}
						}
					}
				});
				
				element.addListener('dragstart', function(e){
					if (!this.getBlocked()) {
						//e.addAction('move');
						this.setSavedBounds(this.getBounds());
						var bounds = this.getSavedBounds();
						var container = this.getCurrentContainer();
						this.setUserBounds(parseInt(e.getDocumentLeft() - bounds.width / 2), parseInt(e.getDocumentTop() - 30), bounds.width, bounds.height);
						this.setOpacity(0.85);
						container.drawNextTargetBox(this, container.indexOf(this));
						document.eyeDashBoard._transparentLayer.add(this);
						var rootChildrens = qx.core.Init.getApplication().getRoot().getChildren();
						for (var i = rootChildrens.length - 1; i >= 0; --i) {
							if (rootChildrens[i] instanceof qx.ui.core.DragDropCursor) {
								rootChildrens[i].getContentElement().resetSource();
							//TO-DO: The 'replaced' image gets stuck sometimes
							//rootChildrens[i].getContentElement().setSource('qx/decoration/Modern/menu/checkbox.gif');
							}
						}
					}
				});
				
				element.addListener('drag', function(e) {
					if (!this.getBlocked()) {
						this.setUserBounds(parseInt(e.getDocumentLeft() - this.getSavedBounds().width / 2), parseInt(e.getDocumentTop() - 30), this.getSavedBounds().width, this.getSavedBounds().height);
					}
				});
				
				element.addListener('dragover', function(e){
					if (!this.getBlocked()) {
						var movingWidget = e.getRelatedTarget();
						if (movingWidget != null && movingWidget instanceof eyeos.dashboard.Widget) {
							var newContainer = this.getLayoutParent();
							var oldContainer = movingWidget.getCurrentContainer();
						
							if (!newContainer.getNextTargetBox()) {
								newContainer.drawNextTargetBox(movingWidget, 0);
								oldContainer.removeNextTargetBox();
								movingWidget.setCurrentContainer(newContainer);
							} else {
								if(movingWidget._lastWidgetOver == this) {
									return;
								} else if (!movingWidget._lastWidgetOver) {
									newContainer.moveNextTargetBox(newContainer.indexOf(this));
									movingWidget._lastWidgetOver = this;
								} else {
									movingWidget._lastWidgetOver = false;
								}
							}
						}
					}
				});
				
				element.addListener('dragend', function(e){
					if (!this.getBlocked()) {
						var container = e.getRelatedTarget();
						if (!container) {
							container = this.getCurrentContainer();
							this.resetUserBounds();
							container.addWidgetAt(this);
							container.removeNextTargetBox();
						}
						this.set({
							'opacity': 1,
							'draggable': false,
							'cursor': 'default'
						});
					}
				// callmessage(guardaconfWidgetsPos)
				});
				
				element.addListener('drop', function(e){
					if (!this.getBlocked()) {
						var widgetDropped = e.getRelatedTarget();
						if (widgetDropped instanceof eyeos.dashboard.Widget) {
							var container = widgetDropped.getCurrentContainer();
							container.addWidgetAt(widgetDropped);
							container.removeNextTargetBox();
							widgetDropped.resetUserBounds();
							widgetDropped.setVisibleTitlebarButtons(false);
							widgetDropped.setBorderActive(false);
						}
					}
				});
			}
		},
		
		'addWidget': function (element, position) {
			if(position !== null) {
				this.addAt(element, position);
			} else {
				this.add(element);
			}
			
			element.setCurrentContainer(this);
			this._addListeners(element);
		},

		'addWidgetAt': function (element, position) {
			this._addAt(element, this.indexOf(this._nextTargetBox));
		},
		
		'getWidgets': function () {
			return this.getChildren();
		},

		'drawNextTargetBox': function (element, index) {
			var bounds = element.getBounds();
			var nextTargetBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
			var nextTargetDecorator = new qx.ui.decoration.Single(1, 'dashed', '#808080');
			nextTargetBox.set({
				'height': bounds.height,
				'backgroundColor': '#E7E7E7',
				'decorator': nextTargetDecorator
			});
			this._nextTargetBox = nextTargetBox;
			this._addAt(nextTargetBox, index);
		},
			
		'getNextTargetBox': function () {
			return this._nextTargetBox;
		},
	
		'moveNextTargetBox': function (index) {
			this._addAt(this._nextTargetBox, index)
		},
		
		'removeNextTargetBox': function () {
			if (this._nextTargetBox) {
				this.remove(this._nextTargetBox);
				this._nextTargetBox = false;
			}
		}
	}
});
