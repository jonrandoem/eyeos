
qx.Class.define('eyeos.ui.dashboard.WidgetContainer', {	
	extend: qx.ui.core.Widget,
	
	construct: function() {
		arguments.callee.base.call(this);
		this._setLayout(new qx.ui.layout.VBox(5));
		this.set({
			droppable: true,
			backgroundColor: 'green'
		});

//		this.addListener('dragover', this._onDragOver, this);
		this.addListener('dragleave', this._onDragLeave, this);
		this.addListener('drop', this._onDrop, this);
		
		// Fake widget box
		this._targetBox = new qx.ui.container.Composite().set({
			decorator: new qx.ui.decoration.Single(1, 'dashed', '#808080'),
			backgroundColor: '#E7E7E7',
			droppable: true
		});
		this._targetBox.addListener('drop', this._onDrop, this);
		this._targetBox.addListener('dragleave', this._onDragLeave, this);
	},
	
	properties: {
		
		
	},
		
	members: {
		
		_targetBox: null,
		
		
		_showTargetBox: function(height, i) {
			//console.log('SHOWING TARGETBOX AT: ' + i);
			this._remove(this._targetBox);
			this._targetBox.setHeight(height);
			if (typeof i == 'undefined') {
				this._add(this._targetBox, i);
			} else {
				this._addAt(this._targetBox, i);
			}
		},
		
		/*_onDragLeave: function(e) {
			var target = e.getTarget();
//			console.log(target, e.getRelatedTarget());
			if (target == this || qx.ui.core.Widget.contains(this, target)) {
				this._remove(this._targetBox);
			}
		},*/
		
		_onDragOver: function(e) {
			var widget = e.getRelatedTarget();
			var yMouse = e.getDocumentTop();
			
			var boxPlaced = false;
			if (widget instanceof eyeos.ui.dashboard.WidgetView) {				
				var myChildren = this._getChildren();
				for(var i = 0; i < myChildren.length && !boxPlaced; i++) {
					if (myChildren[i] != this._targetBox) {
						var location = myChildren[i].getContainerLocation();
						
						if (yMouse < location.bottom) {
							var previousChildLocation = myChildren[i - 1] ? myChildren[i - 1].getContainerLocation() : false;
							if (!previousChildLocation) {
								this._showTargetBox(widget.getHeight(), 0);
								boxPlaced = true;
							} else if (yMouse > previousChildLocation.bottom) {
								this._showTargetBox(widget.getHeight(), this._indexOf(myChildren[i]));
								boxPlaced = true;
							}
						}
					}
				}
				if (!boxPlaced) {
					this._showTargetBox(widget.getHeight());
				}
			}
		},
		
		_onDrop: function(e) {
			var widget = e.getRelatedTarget();
			var popup = widget.getLayoutParent();
			
			if (widget instanceof eyeos.ui.dashboard.WidgetView) {
				this.addWidgetAt(widget, this._indexOf(this._targetBox));
				this._remove(this._targetBox);
				popup.dispose();
			}
		},
		
		// overridden
		_remove: function(child) {
			this.base(arguments, child);
			if (child instanceof eyeos.ui.dashboard.WidgetView) {
				child.removeListener('dragover', this._onDragOver, this);
			}
		},
		
		addWidget: function(widget) {
			widget.addListener('dragover', this._onDragOver, this);
			this._add(widget);
		},
		
		addWidgetAt: function(widget, position) {
			widget.addListener('dragover', this._onDragOver, this);
			this._addAt(widget, position);
		},
		
		hideTargetBox: function() {
			this._remove(this._targetBox);
		}
	}
});