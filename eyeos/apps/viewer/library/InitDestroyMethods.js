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
// initialization of the flowplayer plugin.
function flowplayerInit(pid, checknum, plist, startIndex) {
	$f(pid + '_viewer', {
		src: 'index.php/externApplication/' + checknum + '/viewer/library/flowplayer-3.0.7.swf',
		wmode: 'opaque'
	},

	{
		clip: {
			
			onLastSecond: function() {
				if ((plist[currentPlaylistEntry].length == 1) || (this.getClip().index == 1)) {
					[currentPlaylistEntry, playlistEnded] = previousNextMouseEvent(checknum, ++currentPlaylistEntry, plist,  pid, 'auto');
					if (!playlistEnded) {
						viewerWindow.setCaption(setWindowTitle(plist, currentPlaylistEntry));
						onChangingPlaylistElementEvent(currentPlaylistEntry, plist, false);
					}
					else if (plist.length > 1) {
						this.setPlaylist(plist[currentPlaylistEntry]);
					}
				}
			},

			onBegin: function() {
				this.setVolume(50);

				if (currentPlaylistEntry == plist.length) {
					currentPlaylistEntry = 0;
				}
				if (currentPlaylistEntry < 0) {
					currentPlaylistEntry = plist.length - 1;
				}

				if ((plist[currentPlaylistEntry].length == 1) || (this.getClip().index == 1)) {
					onChangingPlaylistElementEvent(currentPlaylistEntry, plist, false);
				}

				viewerWindow.setCaption(setWindowTitle(plist, currentPlaylistEntry));
			},

			onStart: function() {
				setPauseIcon();
				setProgressBar(plist, pid, 'start');
			},

			onPause: function() {
				setPlayIcon();
				setProgressBar(plist, pid, 'stop');
			},

			onStop: function() {
				setPlayIcon();
				setProgressBar(plist, pid, 'stop');
			},

			onResume: function() {
				setPauseIcon();
				setProgressBar(plist, pid, 'start');
			}
		},

		plugins: {

			audio: {
				url: 'index.php/externApplication/' + checknum + '/viewer/library/flowplayer.audio-3.0.4.swf'
			},

			controls: null
		},

		playlist: plist[startIndex],

		canvas: {
			backgroundColor: '#000000',
			backgroundGradient: 'transparent'
		},

		screen: {
			backgruondColor: '#000000'
		},
                
		play: {
			opacity: 0
		}
	}).play();

	playerLoaded = true;
}