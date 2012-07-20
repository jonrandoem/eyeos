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

qx.Class.define('eyeos.socialbar.URLBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,

	events: {

	},

	properties: {
		checknum: {
			check: 'Integer'
		},
		name: {
			check: 'String'
		},
		shareds: {
			init: new Array()
		},
		pid: {
			check: 'Integer'
		},
        workgroupName: {
            check: 'String',
            init: null
        }
	},

	construct: function (checknum, pid, shareds, workgroupName) {
		this.base(arguments);
		this.setShareds(shareds);
		this.setChecknum(checknum);
        if (workgroupName) {
            this.setWorkgroupName(workgroupName);
        }
		this.setPid(pid);
		this._buildGui();

		this._populateURLList();
	},

	members: {

		_urlListContainer : null,
		/**
		 * Function for the creation of the Box
		 */
		_buildGui: function () {
			this.removeAll();
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});

			var topContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			topContainer.set({
				height:30

			});

			this.add(topContainer);

			var labelActive = new qx.ui.basic.Label(tr('Active Urls'));
			labelActive.setFont(new qx.bom.Font(12, ['Helvetica']));
			labelActive.setTextColor("#4B4B4B");
			topContainer.add(labelActive,{bottom:5,left:0});

			var labelAdd = new qx.ui.basic.Label('<b>' + tr('New') + '</b>');
			labelAdd.setFont(new qx.bom.Font(12, ['Helvetica']));
			labelAdd.setRich(true);
			labelAdd.setTextColor("#2A58A6");
			labelAdd.setCursor('pointer');
			topContainer.add(labelAdd,{bottom:5,right:25});

			labelAdd.addListener('click',function(){
				this._createURL();
			},this);
			
			var image = new qx.ui.basic.Image("index.php?extern=images/add4.png");
			image.setCursor('pointer');
			topContainer.add(image,{bottom:5,right:5});

			image.addListener('click',function(){
				this._createURL();
			},this);

			var scroll = new qx.ui.container.Scroll();
			scroll.set({
				marginTop:5,
				decorator: new qx.ui.decoration.Single().set({
					width: 1,
					style: 'solid',
					color: '#A4A4A4'
				})
			});
			this.add(scroll, {flex: 1});

			this._urlListContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				marginTop: 10,
				padding: 5,
				allowShrinkY: false
			});
			scroll.add(this._urlListContainer, {
				flex: 1
			});

			var bottomLayoutBox = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator : new qx.ui.decoration.Single(1, 'solid', '#86BADE'),
				backgroundColor: '#D9E5F4',
				padding: 5
			});
			this.add(bottomLayoutBox);

			var labelItems = new eyeos.socialbar.Label(tr('Sharing') + ' ' + this._createLabelItems(), 'sharedItems');
			bottomLayoutBox.add(labelItems);
			

		},

		_createURL: function() {
            var shareds = this.getShareds();
            eyeos.execute('urlshare', this.getChecknum(), [shareds[0].getObject(), true]);
		},

		_addListeners: function () {

		},

		_createLabelItems: function() {
			var shareds = this.getShareds();
			var returnString = '';
			if (shareds.length == 1){
				returnString = shareds[0].getObject();
				var auxArray = returnString.split('/');
				returnString =  auxArray[auxArray.length-1];

			} 
			return returnString;
		},

		_populateURLList: function() {
			//(box, name, id, publicationDate, hasListener, color)
			this._urlListContainer.removeAll()
			var shareds = this.getShareds();
			
			eyeos.callMessage(this.getChecknum(), '__UrlShare_getShareURLSByFilePath', shareds[0].getObject(), function (results){
				if (results != null) {
					for (var i = 0; i < results.length; i++) {
						this._urlListContainer.add(new eyeos.socialbar.URLElement(
							this,
							results[i].name,
							results[i].id,
							results[i].publicationDate,
							results[i].lastDownloadDate,
							true,
							null
						));
					}
				}
			}, this);
		}
	}

});