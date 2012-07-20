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
 *	eyeos.ui.toolbar.Spinner - Styling...
 *	Extending a qx.ui.form.Spinner, to implement the eyeos
 *	look and feel behaviour.
 */
qx.Class.define('eyeos.ui.toolbar.Spinner', {
	extend : qx.ui.form.Spinner,

	construct : function(item, iconsPath, actions) {
		arguments.callee.base.call(this);
		if (item.name) {
			this.setLabel(tr(item.name));
			this.setId(item.id);
			if (!item.hideLabel) {
				this._createChildControl('label');
			}
		}
		
		if (item.image) {
			this.setIcon(iconsPath + item.image);
			this._createChildControl('icon');
		}

		this._setEyeosStyle(item, actions);
	},

	properties: {
		id: {
			init: null
		},
		
		/**
		 *	the widget's icon.
		 */
		icon: {
			init: null
		},

		/**
		 *	the widget's label.
		 */
		label: {
			init: null
		},

		/*
		 * the old value
		 */
		oldValue: {
			init: null
		}
	},

	members: {
		/**
		 *	Apply the eyeos look and feel.
		 */
		_setEyeosStyle: function(item, actions) {
			var layout = new qx.ui.layout.Dock();
			layout.setSort('x');
			this._setLayout(layout);
			this.setDecorator(null);
			this.setAllowGrowY(false);
			this.setPadding(3);

			if(item.min) {
				this.setMinimum(item.min);
			}

			if (item.cmd) {
				this.actions = actions;
				this.addListener('changeValue', new Function('foo',
					'this.blocked == true ? null : this.actions.' + item.cmd + '(foo);'));
			} else if (item.dyncmd) {
				this.actions = actions;
				this.addListener('up', new Function('foo',
					'this.actions.' + item.dyncmd + '(foo, "up");'));
				this.addListener('down', new Function('foo',
				'this.actions.' + item.dyncmd + '(foo, "down");'));
			}
		},

		_createChildControlImpl : function(id)
		{
			var control = null;

			switch(id)
			{
				case 'label':
					control = new qx.ui.basic.Label(this.getLabel());
					control.setAlignY('middle');
					control.setAlignX('center');
					control.setPadding(3);
					this._addBefore(control, this.getChildControl('textfield'), {edge: 'west'});
					break;
				case 'icon':
					control = new qx.ui.basic.Image(this.getIcon());
					control.setAlignY('middle');
					control.setAlignX('center');
					control.setPadding(3);
					this._addBefore(control, this.getChildControl('textfield'), {edge: 'west'});
					break;
				case 'textfield':
					control = new qx.ui.form.TextField();
					control.setAlignY('middle');
					control.setAlignX('center');
					control.setPadding(3);
					control.setWidth(40);
					control.setHeight(24);
//					control.setSelectable(false);
					control.setFilter(this._getFilterRegExp());
					control.setDecorator(
						new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 3, 3, 3, 3)
					);
//					control.setFocusable(false);
					control.addListener('changeValue', this._onTextChange, this);
					this._add(control, {edge: 'west'});
					break;

				case 'upbutton':
					control = new qx.ui.form.RepeatButton();
					control.setDecorator(
						new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 3, 3, 3, 3)
					);
					control.setFocusable(false);
					control.addListener('execute', this._countUp, this);
					this._add(control, {edge: 'north', flex: 1});

					control.addListener('execute', function() {
						this.fireEvent('up');
					}, this);
					break;

				case 'downbutton':
					control = new qx.ui.form.RepeatButton();
					control.setDecorator(
						new qx.ui.decoration.RoundBorderBeveled(null, '#C6C5C4', 0.7, 3, 3, 3, 3)
					);
					control.setFocusable(false);
					control.addListener('execute', this._countDown, this);
					this._add(control, {edge: 'south', flex: 1});

					control.addListener('execute', function() {
						this.fireEvent('down');
					}, this);
					break;
			}

			return control || this.base(arguments, id);
		}
	}
});