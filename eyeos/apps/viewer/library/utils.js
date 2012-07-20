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
// global variable, used by controBar.js and flowplayerInit.js
var currentPlaylistEntry = 0;
var refreshInterval = null;
var playerIsLoaded = false;
var VolumeBarControlFlag = false;

function setPauseIcon () {
	var playPauseButton = document.getElementById('play_pause_div');
	playPauseButton.setAttribute('src', 'index.php?extern=images/viewer/pause.png');
}

function setPlayIcon () {
	var playPauseButton = document.getElementById('play_pause_div');
	playPauseButton.setAttribute('src', 'index.php?extern=images/viewer/play.png');
}

// used to format the time received from getTime() flowplayer's function
function formatTime(t) {
	if (typeof t !== "undefined") {
		var sec = parseInt(t % 60, 10);
		return parseInt(t / 60, 10) + ":" +
		(sec > 9 ? sec : "0" + sec);
	} else {
		return "0:00";
	}
}

// fadeEffects, used for the Control Bar we create
function fadeEffects(observedObj, affectedObj) {
	var mouseInterval = new qx.event.Timer(1500);
	var fadeFlag = false;

	observedObj.addListener('mouseover', function() {
		if (mouseInterval.getEnabled()) {
			mouseInterval.stop();
		}

		if (fadeFlag) {
			fadeIn(affectedObj[0]);
			fadeIn(affectedObj[1]);
			fadeFlag = false;
		}
	})

	observedObj.addListener('mouseout', function() {
		if (!mouseInterval.getEnabled()) {
			mouseInterval.start();
		}
	})

	mouseInterval.addListener('interval', function () {
		mouseInterval.stop();
		fadeOut(affectedObj[0]);
		fadeOut(affectedObj[1]);
		fadeFlag = true;
	})
}

// fadeIn function, used for the fade control bar effect
function fadeIn(myControls) {
	var fadeInterval = new qx.event.Timer(1);
	var opacity = 0;

	fadeInterval.start();
	fadeInterval.addListener('interval', function() {
		if (opacity >= 0.7) {
			fadeInterval.stop();
		}
		else {
			myControls.style.opacity = opacity + 1/100;
			opacity += 1/100;
		}
	});
}

// fadeOut function, used for the fade control bar effect
function fadeOut(myControls) {
	var fadeInterval = new qx.event.Timer(1);
	var opacity = 0.7;

	fadeInterval.start();
	fadeInterval.addListener('interval', function() {
		if (opacity <= 0) {
			fadeInterval.stop();
		}
		else {
			myControls.style.opacity = opacity - 1/100;
			opacity -= 1/100;
		}
	});
}

// generic function which implements the behaviour of a mouse event
// on the volume bar.
function volumeBarMouseEvent (event, pid) {
	if (!event) var event = window.event;
	var volumeBarCursor = document.getElementById('volume_bar_cursor_div');
	var volumeBarCursorWidth = parseInt(volumeBarCursor.style.width);
	var volumeBar = document.getElementById('volume_bar_div');
	var coloredVolumeBar = document.getElementById('colored_volume_bar_div');
	var volumeBarWidth = parseInt(volumeBar.style.width);
	var layerX = event.layerX || event.offsetX;

	if (event.srcElement) {
		if (event.srcElement.id) {var target = event.srcElement.id;}
	} else {
		var target =  event.target.id;
	}

	if (target == 'volume_bar_cursor_div'){
		var volumeBarLeftOffset = getAbsoluteLeftOffset('volume_bar_div');
		layerX = event.clientX - volumeBarLeftOffset;
	}

	if ((layerX >= volumeBarCursorWidth) && (layerX <= volumeBarWidth - volumeBarCursorWidth)) {
		volumeBarCursor.style.left = '' + layerX + 'px';
		coloredVolumeBar.style.width = '' + layerX + 'px';
		$f(pid + '_viewer').setVolume( (layerX * 100) / volumeBarWidth );
	}
	else {
		if (layerX <= volumeBarCursorWidth) {
			volumeBarCursor.style.left = '' + volumeBarCursorWidth + 'px';
			coloredVolumeBar.style.width = '' + (volumeBarCursorWidth/2) + 'px';
			$f(pid + '_viewer').setVolume(0);
		}
		else {
			volumeBarCursor.style.left = '' + volumeBarWidth + 'px';
			coloredVolumeBar.style.width = '' + volumeBarWidth + 'px';
			$f(pid + '_viewer').setVolume(100);
		}
	}
}

// Return the absolute left offset of a div
function getAbsoluteLeftOffset (elemID) {
	var offsetTrail = document.getElementById(elemID);
	var offsetLeft = 0;
	while (offsetTrail){
		offsetLeft += offsetTrail.offsetLeft;
		offsetTrail = offsetTrail.offsetParent;
	}
	if (navigator.userAgent.indexOf('Mac') != -1 && typeof document.body.leftMargin != 'undefined'){
		offsetLeft += document.body.leftMargin;
	}
	return offsetLeft;

}

// generic function which implements the behaviour of a mouse event
// on the progress bar.
function progressBarMouseEvent (event, pid) {
	if (!event) var event = window.event;

	if (event.srcElement) {
		if (event.srcElement.id) {var target = event.srcElement.id;}
	} else {
		var target =  event.target.id;
	}

	if (target != 'progress_bar_cursor_div'){
		var progressBarCursor = document.getElementById('progress_bar_cursor_div');
		var coloredProgressBar = document.getElementById('colored_progress_bar_div');
		var progressBar = document.getElementById('progress_bar_div');


		var layerX = event.layerX || event.offsetX;
		var cuePoint = parseInt (layerX - (parseInt(progressBarCursor.style.width) / 2));
		var duration = document.getElementById('total_time_div').getAttribute('duration_time');

		progressBarCursor.style.left = '' + cuePoint + 'px';
		coloredProgressBar.style.width = '' + layerX + 'px';
		$f(pid + '_viewer').seek( (layerX * duration) / progressBar.offsetWidth);
	} 
}

// generic function which implements the behaviour of a mouse event
// on the previous or next icon.
function previousNextMouseEvent (checknum, currentPlaylistEntry, plist, pid, mode) {
	setProgressBarVisibility('hide');
	setVolumeBarVisibility('hide');
	setId3TagsVisibility(false);
	document.getElementById('play_pause_div').style.visibility = 'hidden';

	var isClip;
	if (currentPlaylistEntry == plist.length) {
		isClip = isValidClip(getClipType(plist, 0));
	}
	else if (currentPlaylistEntry < 0) {
		isClip = isValidClip(getClipType(plist, plist.length - 1));
	}else {
		isClip = isValidClip(getClipType(plist, currentPlaylistEntry));
	}

	if (isClip) {
		if (! playerIsLoaded) {
			$f(pid + '_viewer').show();
			playerIsLoaded = true;
		}

		if (currentPlaylistEntry == plist.length) {
			currentPlaylistEntry = 0;

			if (mode == 'auto') {
				setProgressBar(plist, pid, 'stop');
				$f(pid + '_viewer').pause();
				setPlaylistControlsVisibility(plist.length, true);
				setPlayIcon();
				return [currentPlaylistEntry, true];
			}
			else if (mode == 'clicked') {
				$f(pid + '_viewer').setPlaylist(plist[currentPlaylistEntry]);
				setProgressBar(plist, pid, 'stop');
				$f(pid + '_viewer').play();
				setPauseIcon();
				return [currentPlaylistEntry, false];
			}
		}
		else {
			if (currentPlaylistEntry < 0) {
				currentPlaylistEntry = plist.length - 1;
			}
		
			if ($f(pid + '_viewer').isPlaying()) {
				$f(pid + '_viewer').setPlaylist(plist[currentPlaylistEntry]);
				setProgressBar(plist, pid, 'stop');
				$f(pid + '_viewer').play();
				setPauseIcon();
			} else {
				$f(pid + '_viewer').setPlaylist(plist[currentPlaylistEntry]);
				setProgressBar(plist, pid, 'stop');
				$f(pid + '_viewer').play();
				setPauseIcon();
				var interval = setInterval(function() {
					$f(pid + '_viewer').pause();
					setPlayIcon();
					resetProgressBarCursor();
					resetColoredProgressBar();
					setCurrentTime("undefined");
					clearInterval(interval);
				}, 500);
			}

			return [currentPlaylistEntry, false];
		}
	}
	else {

		if (currentPlaylistEntry == plist.length) {
			currentPlaylistEntry = 0;
		}
		else if (currentPlaylistEntry < 0) {
			currentPlaylistEntry = plist.length - 1;
		}
		
		$f(pid + '_viewer').pause();
		$f(pid + '_viewer').hide();
		playerIsLoaded = false;

		eyeos.callMessage(checknum, "getDocument", currentPlaylistEntry, function(text) {
			var oldDocDiv = document.getElementById('document_div');
			if (oldDocDiv) {
				father.removeChild(oldDocDiv);
			}

			var docDiv = document.createElement('div');
			docDiv.setAttribute('id', 'document_div');
			docDiv.innerHTML = text;

			var father = document.getElementById(pid + '_viewer');
			father.appendChild(docDiv);
		});

		return [currentPlaylistEntry, false];
	}
}

function isValidClip (clipType) {
	if ((clipType == 'jpeg') || (clipType == 'jpg') || (clipType == 'png') || (clipType == 'gif') ||
		(clipType == 'flv') || (clipType == 'mp3') || (clipType == 'm4a') || (clipType == 'convert2FLV')) {
		return true;
	}
	return false;
}

// just taking the type of the current clip
function getClipType (plist, currentPlaylistEntry) {
	if (plist && plist[currentPlaylistEntry] && plist[currentPlaylistEntry][0] && plist[currentPlaylistEntry][0].ext) {
		return plist[currentPlaylistEntry][0].ext;
	}
	return null;
}

// shows or hides the next/previous playlist controls in case
// of single file or multiple files.
function setPlaylistControlsVisibility (size, playlistEnded) {
	if (( size == 1) || playlistEnded) {
		document.getElementById('next_element_div').style.visibility = 'hidden';
		document.getElementById('previous_element_div').style.visibility = 'hidden';
	}
	else {
		document.getElementById('next_element_div').style.visibility = 'visible';
		document.getElementById('previous_element_div').style.visibility = 'visible';
	}
}

// shows or hides the play/pause controls in case
// of image or media files.
function setPlayPauseControlsVisibility (clipType, plist) {
	if (clipType == 'image') {
		if (plist.length == 1) {
			document.getElementById('play_pause_div').style.visibility = 'hidden';
		}
		else {
			document.getElementById('play_pause_div').style.visibility = 'visible';
		}
	}
	else if (clipType == 'media') {
		document.getElementById('play_pause_div').style.visibility = 'visible';
	}
}


// just hide or show the progress bar visibility.
function setProgressBarVisibility (flag) {
	if (flag == 'hide') {
		document.getElementById('progress_bar_box').style.visibility = 'hidden';
	}
	if (flag == 'show') {
		document.getElementById('progress_bar_box').style.visibility = 'visible';
	}
}

// just hide or show the volume bar visibility.
function setVolumeBarVisibility (flag) {
	if (flag == 'hide') {
		document.getElementById('volume_bar_box').style.visibility = 'hidden';
	}
	if (flag == 'show') {
		document.getElementById('volume_bar_box').style.visibility = 'visible';
	}
}

// just hide or show the volume bar visibility.
function setImportToDocumentsVisibility (flag) {
	if (flag == 'hide') {
		document.getElementById('import_to_documents_div').style.visibility = 'hidden';
	}
	if (flag == 'show') {
		document.getElementById('import_to_documents_div').style.visibility = 'visible';
	}
}

function setDocumentControlBarVisibility () {
	setImportToDocumentsVisibility('show');
}

// function which takes care about hide or show the needed elements
// for an image file.
function setImageControlBarVisibility (plist) {
	setImportToDocumentsVisibility('hide');
	setProgressBarVisibility('hide');
	setVolumeBarVisibility('hide');
	setPlayPauseControlsVisibility('image', plist);
	setId3TagsVisibility(false);
}

// function which takes care about hide or show the needed elements
// for a video or music file.
function setVideoMusicControlBarVisibility (plist) {
	setProgressBarVisibility('show');
	setVolumeBarVisibility('show');
	setId3TagsVisibility(false);
	setPlayPauseControlsVisibility('media', plist);
}

// to be implemented with contents library!!
function setId3TagsInfos (plist) {
	var id3Tags = plist[currentPlaylistEntry][1].id3tags;
	setId3TagsVisibility(true);

	var mp3Infos = document.getElementById('mp3_infos_box');
	while (mp3Infos.hasChildNodes()) {
		mp3Infos.removeChild(mp3Infos.firstChild);
	}

	addMp3Info(mp3Infos, 'Artist: ', id3Tags.artist);
	addMp3Info(mp3Infos, 'Album: ', id3Tags.album);
	addMp3Info(mp3Infos, 'Title: ', id3Tags.title);
	addMp3Info(mp3Infos, 'Gender: ', id3Tags.gender);
	addMp3Info(mp3Infos, 'Year: ', id3Tags.year);
}

function addMp3Info (mp3Infos, tag, label) {
	if (label.length != 0) {
		var paragraph = document.createElement('p');
		paragraph.style.paddingLeft = '10px';
		paragraph.style.paddingRight = '10px';

		var tagStyle = document.createElement('b');
		tagStyle.appendChild(document.createTextNode(tag));
		paragraph.appendChild(tagStyle);

		var labelStyle = document.createTextNode(label);
		paragraph.appendChild(labelStyle);
		mp3Infos.appendChild(paragraph);
	}
}

function setId3TagsVisibility (flag) {
	var mp3Infos = mp3Infos = document.getElementById('mp3_infos_box');

	if (flag) {
		mp3Infos.style.visibility = 'visible';
	}
	else {
		mp3Infos.style.visibility = 'hidden';
	}
}

// generic function which implements the behaviour of a
// changing playlist event
function onChangingPlaylistElementEvent (currentPlaylistEntry, plist, playlistEnded) {
	setPlaylistControlsVisibility(plist.length, playlistEnded);
		
	switch (getClipType(plist, currentPlaylistEntry)) {
		case 'jpg':
		case 'jpeg':
		case 'gif':
		case 'png':
			setImageControlBarVisibility(plist);
			break;
		case 'doc':
		case 'txt':
		case 'html':
		case 'odt':
			setDocumentControlBarVisibility(plist);
			break;
		case 'flv':
		case 'convert2FLV':
			setVideoMusicControlBarVisibility(plist);
		case 'mp3':
		case 'm4a':
			setVideoMusicControlBarVisibility(plist);
			setId3TagsInfos(plist);
			break;
	}
}
	
// generic function which set the totalTime in case of video or mp3.
function setTotalTime (plist, pid) {
	var duration;

	if (plist[currentPlaylistEntry].length == 1) {
		duration = parseInt($f(pid + '_viewer').getClip().fullDuration, 10);
	}
	else {
		duration = plist[currentPlaylistEntry][1].id3tags.duration;
	}
	
	var totalTime = document.createTextNode(formatTime(duration));
	var totalTimeElement = document.getElementById('total_time_div');
	totalTimeElement.setAttribute('duration_time', duration);

	if (totalTimeElement.hasChildNodes()) {
		totalTimeElement.removeChild(totalTimeElement.firstChild);
	}
	totalTimeElement.appendChild(totalTime);

	return duration;
}

// generic function which set the currentTime in case of video or mp3.
function setCurrentTime (pid) {
	var time;
	if (pid !== "undefined") {
		time = $f(pid + '_viewer').getTime();
	}
	
	var currentTime = document.createTextNode(formatTime(time));
	var currentTimeElement = document.getElementById('execution_time_div');

	if (currentTimeElement.hasChildNodes()) {
		currentTimeElement.removeChild(currentTimeElement.firstChild);
	}
	currentTimeElement.appendChild(currentTime);
	return time;
}

// generic function which set the Progressbar moving interval.
function setProgressBarCursorMove (time, duration) {
	var progressBarCursor = document.getElementById('progress_bar_cursor_div');
	var offsetWidth = document.getElementById('progress_bar_div').offsetWidth -
	progressBarCursor.offsetWidth;
	
	var nextCurrentTime = parseInt (time * ( offsetWidth / duration));
	progressBarCursor.style.left = '' + nextCurrentTime + 'px';

	var coloredProgressBarButton = document.getElementById('colored_progress_bar_div');
	var nextColoredWidth = parseInt (nextCurrentTime + (progressBarCursor.offsetWidth / 2));
	coloredProgressBarButton.style.width = '' + nextColoredWidth + 'px';
}

// generic function which takes care about all the progressBar refreshing.
function setProgressBar (plist, pid, interval) {
	switch (interval) {
		case 'start':
			duration = setTotalTime(plist, pid);
			startProgressBarBoxInterval(pid, duration);
			break;
		case 'stop':
			stopProgressBarBoxInterval();
			break;
	}
}

function startProgressBarBoxInterval (pid, duration) {
	refreshInterval = setInterval(function () {
		var time = setCurrentTime(pid);
		setProgressBarCursorMove(time, duration);
	}, 500);
}

function stopProgressBarBoxInterval () {
	clearInterval(refreshInterval);
}

// to set the window title
function setWindowTitle (plist, currentPlaylistEntry) {
	var filename;
	if (plist[currentPlaylistEntry].length == 1) {
		filename = plist[currentPlaylistEntry][0].filename.split('/');
	}
	else {
		filename = plist[currentPlaylistEntry][1].filename.split('/');
	}
	
	return 'Viewer - ' + filename[filename.length-1];
}

function resetProgressBarCursor () {
	var progressBarCursor = document.getElementById('progress_bar_cursor_div');
	progressBarCursor.style.left = '0px';
}

function resetColoredProgressBar () {
	var progressBarCursor = document.getElementById('colored_progress_bar_div');
	progressBarCursor.style.width = '0px';
}