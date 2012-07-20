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

qx.Class.define('eyeos.socialbar.URLElement', {
	extend: qx.ui.container.Composite,

	properties: {
		box: {
			
		},
		id: {
			check: 'String'
		},
		name: {
			check: 'String'
		},
		publicationDate: {
			check: 'Integer'
		},
		downloadedDate: {
			check: 'Integer'
		},
		color: {
			check: 'String',
			init: null
		//apply: '_applyColor'
		},
		selected: {
			check: 'Boolean',
			init: false
		},
		hasListener: {
			check: 'Boolean'
		}
	},

	construct: function (box, name, id, publicationDate, downloadedDate, hasListener, color) {
		this.base(arguments);
		this.setBox(box);
		this.setName(name);
		this.setId(id);
		this.setHasListener(hasListener);
		this.setPublicationDate(publicationDate);
		this.setDownloadedDate(downloadedDate);
		if (color) {
			this.setColor(color);
		}
		this._buildGui();
	},

	members: {
		_layoutInfo: null,
		_layoutAction: null,
		_labelPublicationDate: null,
		_labelDownloadedDate: null,
		_labelName: null,
		
		_buildGui: function () {
			this.set({
				decorator : new qx.ui.decoration.Single(1, 'solid', '#A4A4A4').set({
					styleTop:null,
					styleLeft: null,
					styleRight: null
				}),
				layout: new qx.ui.layout.HBox(),
				paddingBottom: 2
			});
			this._createLayoutInfo();
			this.add(new qx.ui.core.Spacer(),{flex:1});
			this._createLayoutActionIcon();
			if (this.getHasListener()) {
				this._addListeners();
			}
		},

		_addListeners: function () {
			this.addListener('mouseover', function (e) {
				this._selectItem();
			}, this);

			this.addListener('mouseout', function (e) {
				this._unselectItem();
			}, this);

			this.addListener('click', function (e) {
				this._openURLWindow();
			}, this);


		},

		_selectItem: function () {
			this.setBackgroundColor('#4089E2');
			this._labelName.setTextColor('white');
			this._labelPublicationDate.setTextColor('#B0CEF3');
		},

		_unselectItem: function () {
			this.setBackgroundColor('white');
			this._labelName.setTextColor('gray');
			this._labelPublicationDate.setTextColor('#C5AFAF');

		},

		_openURLWindow: function () {
            eyeos.execute('urlshare', this.getBox().getChecknum(), [this.getId(), false]);
		},


		_createLayoutInfo: function () {
			this._layoutInfo = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				marginLeft: 3
			});
			this.add(this._layoutInfo);
			this._labelName = new eyeos.socialbar.Label(tr('Published on') + ' ' + this.__formatStringTime(this.getPublicationDate()), 'sharedName');
			this._layoutInfo.add(this._labelName);
			if(this.getDownloadedDate() != null && this.getDownloadedDate() != ''){
			    this._downloadedLabel = new eyeos.socialbar.Label(tr('Downloaded') + ' ' + this.__formatStringTime(this.getDownloadedDate(), true), 'downloadedName');
			    this._layoutInfo.add(this._downloadedLabel);
			}


			this._labelPublicationDate = new qx.ui.basic.Label("id: "+this.getName()).set({
				textColor: '#C5AFAF',
				rich: false,
				maxWidth: 180
			});
			this._layoutInfo.add(this._labelPublicationDate);
		},

		__formatStringTime: function(timestamp, showHours) {
			var dt = new Date(timestamp * 1000);
			var dd = dt.getDate();
			var MM = dt.getMonth() + 1;
			var yy = dt.getFullYear();

			var date = dd + '/' + MM + '/' + yy;
			if (showHours != null && showHours == true) {
				var hh = dt.getHours();
				var mm = dt.getMinutes();
				date += ' ' + hh + ':' + mm;
			}
			return date;

		},

		_createLayoutActionIcon: function () {
			this._layoutAction = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.Canvas(),
				decorator: null,
				marginLeft: 0
			});
			this.add(this._layoutAction,{right:0});
			var deleteIcon = new qx.ui.basic.Image("index.php?extern=images/16x16/actions/edit-delete.png");
			deleteIcon.setCursor("pointer");
			deleteIcon.setEnabled(false);
			this._layoutAction.add(deleteIcon,{right:0,top:6});
			deleteIcon.addListener("mouseover",function(){
				deleteIcon.setEnabled(true);
			},this);
			deleteIcon.addListener("mouseout",function(){
				deleteIcon.setEnabled(false);
			},this);
			deleteIcon.addListener("click",function(e){
				e.stopPropagation();
				var optionPane = new eyeos.dialogs.OptionPane(
					'<b>' + tr('Are you sure you want to delete this url?') + '</b>',
						eyeos.dialogs.OptionPane.WARNING_MESSAGE,
						eyeos.dialogs.OptionPane.YES_NO_OPTION);
				var dialog = optionPane.createDialog(this, tr('Warning!'), function(result) {
					if(result==0){						
						eyeos.callMessage(this.getBox().getChecknum(), '__UrlShare_deleteURL', this.getId(), function (results){
							this.destroy();
						}, this);
					}
				}, this);
				dialog.show();
				dialog.center();

				
			},this);
		}
	}
});

