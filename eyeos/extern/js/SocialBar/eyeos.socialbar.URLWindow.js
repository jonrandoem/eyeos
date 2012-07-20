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

qx.Class.define('eyeos.socialbar.URLWindow', {
	extend: qx.ui.window.Window,

	properties: {
		box: {
			init: null
		}
	},

	construct: function (checknum, urlInfo, isNew, box) {
		this.base(arguments, 'URL Share');
		if (box) {
			this.setBox(box);
		}
		
		
		eyeos.callMessage(checknum, '__UrlShare_getUrlInfo', {urlId: urlInfo['id']}, function (results){
			var urlComposite = new eyeos.socialbar.URLComposite(checknum, results.urlInformation, results.sentList, results.availableList, isNew, urlInfo['id'], box);
			urlComposite.addListener('close', function (e) {
				this.close();
			}, this);
			this._buildGui(urlComposite);
		}, this);

	},

	members: {
		_buildGui: function (urlComposite) {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null,
				modal: true,
				resizable: false,
				showStatusbar: false,
				showMaximize: false,
				showMinimize: false,
				backgroundColor: '#FFFFFF',
				width: 950,
				height: 550,
				allowGrowX: true,
				allowGrowY: false
			});
			this.add(urlComposite, {flex: 1});
			this.open();
			this.center();

		}
	}
});