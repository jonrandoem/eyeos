/**
 * eyeos.dashboard.Widget
 */
qx.Class.define('eyeos.dashboard.WidgetManager', {
	extend: qx.core.Object,
	type: 'singleton',

	construct: function(checknum) {
		arguments.callee.base.apply(this, arguments);

		this.setChecknum(checknum);
	},

	properties: {
		checknum: {
			init: null,
			check: 'Number'
		},

		
	},

	members: {

		/**
		 * => "This widget is usable"
		 * 
		 */
		registerWidget: function(widget) {
			var view = widget.createView();
			
			document.eyeDashBoard.getFirstContainer().addWidget(view);
		},
		
		/**
		 * 
		 */
		unregisterWidget: function(widget) {
			//TODO
		}
	}
});