


	// A collection of 1..n columns (eyeos.dashboard.WidgetContainer)


qx.Class.define('eyeos.ui.dashboard.Board', {	
	extend: qx.ui.container.Scroll,
	
	statics: {
		COLUMNS_MAX: 6
	},
	
	construct: function() {
		arguments.callee.base.call(this);
	
		this.set({
			marginTop: 32, 
			backgroundColor: '#F4F4F4',
			contentPadding: 5,
			padding: 0
		});
		
		this.set({
			backgroundColor: 'red'
		});
		
		this._glassPane = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
		this.add(this._glassPane, {flex: 1});
		
		this._content = new qx.ui.container.Composite(new qx.ui.layout.HBox(this.getGap()));
		this._content.addListener('resize', this._autoResizeContainers, this);
		this._glassPane.add(this._content, {left: 0, top: 0, width: '100%', height: '100%'});
		
		this.setColumns(1);
	},
	
	properties: {
		columns: {
			init: 0,
			check: function(v) { return v > 0 && v <= eyeos.dashboard.Board.COLUMNS_MAX},
			apply: '_applyColumns'
		},
		
		gap: {
			init: 5,
			check: 'Integer',
			apply: '_applyGap'
		}
	},
		
	members: {
		
		_containers: [],
		_content: null,
		
		/** For Drag&Drop operations */
		_glassPane: null,
		
		
		_addContainer: function(container) {
			this._content.add(container, {flex: 1});
			this._containers.push(container);
			this._autoResizeContainers();
		},
		
		_applyColumns: function(value, old) {
			var content = this.getChildren()[0];
			
			// Add new columns
			if (value > old) {
				for(var i = old; i < value; i++) {
					var c = new eyeos.ui.dashboard.WidgetContainer();
					c.addListener('dragover', this._onDragOverContainer, this);
					this._addContainer(c);
				}
			}
			// Remove columns from the right and move widgets
			else if (value < old) {
				//TODO
			}
		},
		
		_applyGap: function(value, old) {
			this._content.getLayout().setSpacing(value);
		},
		
		_autoResizeContainers: function(e) {
			var bounds = this.getBounds();
			if (bounds === null) {
				if (!this.hasListener('appear')) {
					this.addListener('appear', this._autoResizeContainers, this);
				}
			} else {
				var width = bounds.width / this._containers.length;
				width -= this.getGap() * (this._containers.length - 2);
				for(var i = 0; i < this._containers.length; i++) {
					this._containers[i].setMaxWidth(width);
				}
			}
		},
		
		_onDragLeave: function(e) {
			var target = e.getTarget();
//			console.log(target, e.getRelatedTarget());
			if (target == this || qx.ui.core.Widget.contains(this, target)) {
				for(var i = 0; i < this._containers.length; i++) {
					this._containers[i].hideTargetBox();
				}
			}
		},
		
		_onDragOverContainer: function(e) {
			var target = e.getTarget();
			for(var i = 0; i < this._containers.length; i++) {
				if (this._containers[i] != target) {
					this._containers[i].hideTargetBox();
				}
			}
		},
		
		_removeContainer: function(container) {
			//TODO
		},
		
		_removeContainerAt: function(idx) {
			//TODO
		},
		
		addWidget: function(widget, c) {
			if (!widget instanceof eyeos.ui.dashboard.WidgetView) {
				throw '[eyeos.ui.dashboard.Board] widget must be a eyeos.ui.dashboard.WidgetView';
			}
			
			if (!c) {
				c = 0;
			}
			if (c > this.getColumns()) {
				c = this.getColumns() - 1;
			}
			
			this._containers[c].addWidget(widget);
			
			
			widget.addListener('dragstart', function(e) {
				// Force keeping the original size
				var bounds = widget.getBounds();
				widget.setWidth(bounds.width);
				widget.setHeight(bounds.height);
				
				// Create a popup object to support the dragged widget
				var popup = new qx.ui.popup.Popup(new qx.ui.layout.VBox());
				popup.add(widget);
				popup.placeToMouse(e);
				popup.show();
				
				e.addAction('move');
			}, this);
			
			widget.addListener('drag', function(e) {
				widget.getLayoutParent().placeToMouse(e);
			});
			
			//TODO
		},
		
		
		destruct: function() {
			this._disposeArray('_containers');
		}
	}
});