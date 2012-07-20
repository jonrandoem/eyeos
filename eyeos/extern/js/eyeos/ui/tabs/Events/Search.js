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

qx.Class.define('eyeos.ui.tabs.Events.Search', {
	extend: qx.ui.container.Composite,

	properties: {
		
	},

	construct: function (page) {
		this.base(arguments);
		this._page = page;
		
		this._buildGui();
	},

	members: {
		_page: null,
		_search: null,
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.HBox().set({
					alignX: 'right'
				}),
				height: 40,
				allowGrowY: false
			});
			
			this._search = this._createSearchBox();
			this.add(this._search);
			
		},

		/**
		 * Create the Search Box
		 *
		 * @return {qx.ui.container.Composite} The Search Box
		 */
		_createSearchBox: function (){
			var searchComposite = new qx.ui.container.Composite(new qx.ui.layout.Canvas()).set({
				backgroundColor: '#FFFFFF',
				height: 26,
				maxHeight: 26,
				allowGrowX: false,
				allowGrowY: false,
				marginTop: 4,
				marginRight: 5,
				decorator: new qx.ui.decoration.RoundBorderBeveled('#9A9A9A', null, 1, 5, 5, 5, 5)
			});

			var searchClearIcon = new qx.ui.basic.Image('index.php?extern=images/showall.png').set({
				alignY: 'middle',
				alignX: 'center',
				paddingLeft: 0,
				paddingRight: 0
			});

			var searchTextField = new qx.ui.form.TextField().set({
				backgroundColor: '#FFFFFF',
				decorator: new qx.ui.decoration.RoundBorderBeveled('#FFFFFF', '#FFFFFF', 1, 5, 5, 5, 5),
				maxWidth: 200,
				width: 200,
				marginTop: 1,
				marginBottom: 1,
				marginLeft: 1,
				marginRight: 1,
				paddingRight: 23,
				font: new qx.bom.Font(11, ['Lucida Grande', 'Verdana']),
				value: tr('Search in All'),
				textColor: '#878787'
			});

			this._searchTextField = searchTextField;
			searchClearIcon.addListener('click', function (e) {
				this.fireDataEvent('searchFilter', searchTextField.getValue());
			}, this);

			searchTextField.addListener('focusin', function () {
				if ((searchTextField.getValue() == tr('Search in All')) ||
					(searchTextField.getValue() == tr('Search in the Eyeos Network'))) {
					searchTextField.setUserData('label', searchTextField.getValue());
					searchTextField.setValue('');
					searchTextField.setTextColor('#000000');
				}
			});

			searchTextField.addListener('focusout', function () {
				searchTextField.setValue(searchTextField.getUserData('label'));
				searchTextField.setTextColor('#878787');
			});

			searchTextField.addListener('keyup', function(e){
				if(e.getKeyIdentifier() == 'Enter' || searchTextField.getValue().length == 0) {
					this.fireDataEvent('searchFilter', searchTextField.getValue());
				}
				
			}, this);


			searchComposite.add(searchTextField);
			searchComposite.add(searchClearIcon, {
				right: '2%',
				top : '15%'
			});
			return searchComposite;
		}
		
	}
});