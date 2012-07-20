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

qx.Class.define('desktop.actionManager', {
    type: 'singleton',
    extend: qx.core.Object,

    properties: {
        checknum: {
            init: null
        }
    },

    members: {
        uploadFile: function() {
			eyeos.execute('upload', this.getChecknum(), ['home:///Desktop/']);
		},

		openFile: function() {
			var selection = desktop.SelectionManager.getInstance().getSelection();
			eyeos.openFiles(selection, this.getChecknum());
		},


		deleteFile: function() {
			var selection = desktop.SelectionManager.getInstance().getSelection();
			var deletedPaths = [];
			for(var i in selection) {
				try {
					deletedPaths.push(selection[i].getUserData('path'));
					selection[i].destroy();
				}
				catch(e) {
					// do nothing
				}
			}
			console.log(deletedPaths);
			var dbus = eyeos.messageBus.getInstance();
			dbus.send('files', 'delete', ['home://~' + eyeos.getCurrentUserName() + '/Desktop', deletedPaths]);
			//now, do the real deletion :)
			eyeos.callMessage(this.getChecknum(), 'deleteFiles', deletedPaths, function(e) {

			}, this);
		},

		downloadFile: function() {
			var selection = desktop.SelectionManager.getInstance().getSelection();
			for(var i in selection) {
				eyeos.execute('download', this.getChecknum(), [selection[i].getUserData('path')]);
			}
			
		},

                shareURLFile: function () {
                   var selection = desktop.SelectionManager.getInstance().getSelection();
                   for(var i in selection) {
                    eyeos.execute('urlshare',  this.getChecknum(),  [selection[i].getUserData('path'),true]);
                   }

                },

		openSettings: function() {
			eyeos.execute('newusersettings', this.getChecknum());
		},

		editFile: function() {
			var selection = desktop.SelectionManager.getInstance().getSelection();
			if(selection.length > 1) {
				alert(tr('You can not rename multiple files at once'));
			}

			var file = selection[0];

			file.getChildControl('label').exclude();
			var textbox = new qx.ui.form.TextField(file.getChildControl('label').getValue());
			textbox.setTextSelection(0, file.getChildControl('label').getValue().lastIndexOf('.'));
			file._add(textbox);
			textbox.focus();

			textbox.setDraggable(true);

			textbox.addListener('dblclick', function(e) {
				e.stopPropagation();
			}, this);

			textbox.addListener('click', function(e) {
				e.stopPropagation();
			}, this);

			textbox.addListener('dragstart', function(e) {
				e.stopPropagation();
			}, this);

			textbox.addListener('dragend', function(e) {
				e.stopPropagation();
			}, this);

			textbox.addListener('drag', function(e) {
				e.stopPropagation();
			}, this);
			var checknum = this.getChecknum();
			var rename = function(e) {
				var element = e.getTarget();
				var oldname = element.getUserData('parent').getUserData('path');
				var newname = element.getValue();
				var parent = element.getUserData('parent');
				if(oldname == 'home://~'+eyeos.getCurrentUserName()+'/Desktop/'+newname) {
					parent.getChildControl('label').show();
					element.destroy();
					return;
				}
				if(newname == "" || !newname) {
					return;
				}
				if(newname == "sun will always shine in japan.txt") {
					eyeos.messageBus.getInstance().send('desktop', 'changeWallpaper', ["image","sys:///extern/images/wallpapers/nature/Fuji.jpg"]);
				}
				eyeos.callMessage(checknum, 'renameFile', [oldname,'home:///Desktop/'+newname], function (results) {
					if(results == "duplicated") {
						parent.getChildControl('label').show();
						element.destroy();
						alert("A file with the same name already exists!");
					} else {
						parent.getChildControl('label').show();
						parent.setLabel(newname);
						parent.setUserData('path', 'home://~'+eyeos.getCurrentUserName()+'/Desktop/'+newname);
						var info = parent.getUserData('info');
						info.absolutepath = 'home://~'+eyeos.getCurrentUserName()+'/Desktop/'+newname;
						parent.setUserData('info', info)
						element.destroy();
					}
				}, this);
			};
			
			textbox.addListener('blur', rename, this);
			textbox.setUserData('parent',file);
			textbox.addListener('keypress', function(e) {
				if (e.getKeyIdentifier().toLowerCase() == 'enter') {
					if(this.getValue()) {
						this.exclude();
					} 
				}
			});
		},

		newFolder: function() {
			eyeos.callMessage(this.getChecknum(), 'createFolder', ['home:///Desktop/New Folder'], function (results) {
				var dBus = eyeos.messageBus.getInstance();
				dBus.send('files', 'new', ['home://~' + eyeos.getCurrentUserName() + '/Desktop', results]);
			}, this);
		},

		newFile: function(param) {
			eyeos.callMessage(this.getChecknum(), 'createFile', ['home:///Desktop/New File.'+param], function (results) {
				var dBus = eyeos.messageBus.getInstance();
				dBus.send('files', 'new', ['home://~' + eyeos.getCurrentUserName() + '/Desktop', results]);
			}, this);
		},

		newLink: function() {
			eyeos.execute('newLink', this.getChecknum(), ['home://~' + eyeos.getCurrentUserName() + '/Desktop']);
		}
	}
});