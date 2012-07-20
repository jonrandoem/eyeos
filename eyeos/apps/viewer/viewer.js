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

function viewer_application (checknum, pid, args) {
	new eyeos.application.Viewer(checknum, pid, args);
}

qx.Class.define('eyeos.application.Viewer', {
	extend: eyeos.system.EyeApplication,

	// calling the parent object, and setting an initial file, if one is present...
	construct: function (checknum, pid, args) {
		arguments.callee.base.call(this, 'viewer', checknum, pid);

		/* -------------------------------------------------------------------------
		 * to be removed and edited with eyeFiles!!!
		 */
		var plist = [];
		var entry = "";
		var id3 = [];
		for(var i = 0; i < args.length; i++) {
			var fileName = args[i];
			var ext = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
			if(ext == 'mp3' || ext == 'm4a') {
				entry = [
					{
						url: 'index.php/msg/'+checknum+'/getCover/'+i+'/file.jpg',
						duration: 0,
						scaling: 'orig',
						ext: ext
					},
					{
						url: 'index.php/msg/'+checknum+'/getFile/'+i+'/file.'+ext,
						filename: escape(fileName),
						image: true,
						ext: ext
					}
				]
				id3.push(fileName);
			} else if(ext == 'flv') {
				entry = [
					{
						url: 'index.php/msg/'+checknum+'/getFile/'+i+'/video.'+ext,
						filename: fileName,
						ext: ext
					}
				];
			} else if(ext == 'mov' || ext=='wma' || ext=='wav' ||ext ==  '3gp' || ext ==  '3gpp' || ext ==  '3g2' || ext ==  'mp4' || ext ==  'mpg' || ext ==  'mpv' || ext ==  'avi' || ext ==  'ogg' || ext ==  'ogv' || ext ==  'webm') {
				entry = [
					{
						url: 'index.php/msg/'+checknum+'/getFile/'+i+'/video.'+ext,
						filename: fileName,
						ext: 'convert2FLV'
					}
				];
			} else if(ext == 'jpeg' || ext == 'jpg' || ext == 'png' || ext == 'gif') {
				entry = [
					{
						url: 'index.php/msg/'+checknum+'/getFile/'+i+'/file.'+ext,
						filename: fileName,
						duration: 10,
						scaling: 'orig',
						ext: ext
					}
				]
			} else if(ext == 'html' || ext == 'txt' || ext == 'odt' || ext == 'doc') {
				entry = [
					{
						url: 'index.php/msg/'+checknum+'/getFile/'+i+'/file.'+ext,
						filename: fileName,
						ext: ext
					}
				]
			}
			plist.push(entry);
		}

		// creating the main window for the Viewer application
//		var viewerApp = new eyeos.system.EyeApplication('viewer', checknum, pid);
		var myWindow = new eyeos.ui.Window(this, 'viewer', null, true, false);
		myWindow.setMinWidth(700);
		myWindow.setMinHeight(400);
		myWindow.setLayout(new qx.ui.layout.Grow());

		// creating a composite inside the window, to contain the flash player
		var playerComposite = new qx.ui.container.Composite(new qx.ui.layout.Grow());
		playerComposite.setMinWidth(700);
		playerComposite.setMinHeight(400);
		myWindow.add(playerComposite);

		myWindow.setContentPadding(0);
		myWindow.addListener('beforeClose', function () {
			stopProgressBarBoxInterval();
		});
		myWindow.open();

		// setting the mp3's id3 tags, if there are some mp3s in the playlist.
		// we need to lock this operation, to avoid async problems with streaming.
		if(id3.length) {
			eyeos.callMessage(checknum, "getId3tags", id3, function(tags) {
				for(var i = 0; i < tags.length; ++i) {
					var fileName = tags[i][0];
					for(var x = 0; x < plist.length; ++x) {
						if(plist[x].length == 2) {
							if(decodeURIComponent((plist[x][1]['filename'] + '').replace(/\+/g, '%20')) == fileName) {
								plist[x][1]['id3tags'] = tags[i][1];
							}
						}
					}
				}
			});
		}

		

		// setting the 'id' value to the composite, so we can place the flashplayer
		var domElement = playerComposite.getContentElement();
		domElement.setAttribute('id', pid + '_viewer', true);

        domElement.addListener("appear", function() {
            if (isValidClip(getClipType(plist, currentPlaylistEntry))) {
				flowplayerInit(pid, checknum, plist, 0);
				playerIsLoaded = true;
            }
            else {
				eyeos.callMessage(checknum, "getDocument", currentPlaylistEntry, function(results) {
					var docDiv = document.createElement('div');
					docDiv.innerHTML = results[1];

					var father = document.getElementById(pid + '_viewer');
					father.appendChild(docDiv);
					father.style.overflowY = 'auto';
					document.getElementById('import_to_documents_div').style.visibility = 'visible';
				});
            }
		this._initControlBar(playerComposite, pid, plist, checknum, myWindow);

        }, this);


		// when the flash element is ready, we can build the Control Bar

	},

	members: {
		_initControlBar: function  (playerComposite, pid, plist, checknum, myWindow) {
			flashembed.domReady(function() {
				var foo = initControlBar(playerComposite, pid, plist, checknum, myWindow);

				// FadeIn and FadeOut effects
				fadeEffects(playerComposite, foo);
			});
		}
	}
});
