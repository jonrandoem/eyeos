/*
 * -----------------------------------------------------------------------------
 */
function initControlBar (father, pid, plist, checknum, myWindow) {
	var controlBar = createControlBarBox(father, pid);
	var mp3Infos = createMp3infosBox(father, pid);

	createProgressBarBox(controlBar, pid);
	createVolumeBarBox(controlBar, pid);
	createPlayPauseBackForwardBox(controlBar, pid, plist, checknum);
	createImportToDocuments(controlBar, pid, checknum, myWindow);

	return [controlBar, mp3Infos];
}
/*
 * -----------------------------------------------------------------------------
 */

/*
 * -----------------------------------------------------------------------------
 */
function createMp3infosBox (father, pid) {
	var Mp3infosBox = document.createElement('div');
	Mp3infosBox.setAttribute('id', 'mp3_infos_box');
	Mp3infosBox.style.position = 'absolute';
	Mp3infosBox.style.top = '2%';
	Mp3infosBox.style.right = '2%';
	Mp3infosBox.style.width = '200px';
	Mp3infosBox.style.width = '200px';
	Mp3infosBox.style.height = '180px';
	Mp3infosBox.style.backgroundColor = 'black';
	Mp3infosBox.style.border = '1.5px solid black';
	Mp3infosBox.style.MozBorderRadius = '8px';
	Mp3infosBox.style.opacity = '0.7'
	Mp3infosBox.style.visibility = 'hidden';
	Mp3infosBox.style.fontFamily = 'helvetica';
	Mp3infosBox.style.color = 'white';
	Mp3infosBox.style.zIndex = '500';
	father.getContentElement().getDomElement().appendChild(Mp3infosBox);
	return Mp3infosBox;
}
/*
 * -----------------------------------------------------------------------------
 */


/*
 * -----------------------------------------------------------------------------
 */
function createControlBarBox (father, pid) {
	var controlBarBox = document.createElement('div');
	controlBarBox.setAttribute('id', 'controls_box');
	controlBarBox.style.position = 'absolute';
	controlBarBox.style.bottom = '0px';
	controlBarBox.style.left = '0px';
	controlBarBox.style.width = '100%';
	controlBarBox.style.height = '84px';
	controlBarBox.style.backgroundColor = 'black';
	controlBarBox.style.opacity = '0.7';
	controlBarBox.style.zIndex = '500';
	father.getContentElement().getDomElement().appendChild(controlBarBox);
	return controlBarBox;
}
/*
 * -----------------------------------------------------------------------------
 */

/*
 * -----------------------------------------------------------------------------
 */
function createProgressBarBox (father, pid) {
	var progressBarBox = document.createElement('div');
	progressBarBox.setAttribute('id', 'progress_bar_box');
	progressBarBox.style.position = 'absolute';
	progressBarBox.style.bottom = '54px';
	progressBarBox.style.top = '0px';
	progressBarBox.style.width = '100%';
	progressBarBox.style.height = '30px';
	progressBarBox.style.opacity = '0.7';
	progressBarBox.style.zIndex = '500';
	progressBarBox.style.visibility = 'hidden';

	var progressBarCenter = document.createElement('center');
	var progressBarControlFlag = false;

	createExecutionTime(progressBarCenter);
	createTotalTime(progressBarCenter);
	createProgressBar(progressBarCenter, pid, progressBarControlFlag);

    progressBarBox.appendChild(progressBarCenter);
    father.appendChild(progressBarBox);
}

function createExecutionTime (father) {
	var executionTime = document.createElement('div');
	executionTime.setAttribute('id', 'execution_time_div');
	executionTime.style.position = 'absolute';
	executionTime.style.fontFamily = 'helvetica';
	executionTime.style.height = '12px';
	executionTime.style.width = '35px';
	executionTime.style.top = '10px';
	executionTime.style.bottom = '10px';
	executionTime.style.left = '5px';
	executionTime.style.color = 'white';
	father.appendChild(executionTime);
}

function createTotalTime (father) {
	var totalTime = document.createElement('div');
	totalTime.setAttribute('id', 'total_time_div');
	totalTime.style.position = 'absolute';
	totalTime.style.fontFamily = 'helvetica';
	totalTime.style.height = '12px';
	totalTime.style.width = '35px';
	totalTime.style.top = '10px';
	totalTime.style.bottom = '10px';
	totalTime.style.right = '5px';
	totalTime.style.color = 'white';
	father.appendChild(totalTime);
}

function createProgressBar (father, pid, progressBarControlFlag) {
	var progressBar = document.createElement('div');
	progressBar.setAttribute('id', 'progress_bar_div');
	progressBar.style.MozBorderRadius = '8px';
	progressBar.style.position = 'absolute';
	progressBar.style.backgroundColor = 'transparent';
	progressBar.style.border = '1.5px solid white';
	progressBar.style.height = '12px';
	progressBar.style.top = '10px';
	progressBar.style.bottom = '10px';
	progressBar.style.left = '60px';
	progressBar.style.right = '60px';
	progressBar.style.zIndex = '501';
	father.appendChild(progressBar);

	progressBar.onmousemove = function (e) {
		if (!e) var e = window.event;
		if (progressBarControlFlag) {
			progressBarMouseEvent (e, pid);
		}
	}

	progressBar.onclick = function (e) {
		if (!e) var e = window.event;
		progressBarMouseEvent (e, pid);
	}

	progressBar.onmousedown = function (e) {
		if (!e) var e = window.event;
		progressBarControlFlag = true;
		progressBarMouseEvent (e, pid);
	}

	progressBar.onmouseup = function (e) {
		if (!e) var e = window.event;
		progressBarControlFlag = false;
		progressBarMouseEvent (e, pid);
	}

	// OnMouseOut will act only if we are not in a child div
	progressBar.onmouseout = function fixOnMouseOut(e) {
		if (!e) var e = window.event;
		var relTarg = e.relatedTarget || e.toElement; 

		if(!is_child_of(this, relTarg) && this != relTarg ) {
			progressBarControlFlag = false;
		}
	}

	createColoredProgressBar(progressBar);
	createProgressBarCursor(progressBar, progressBarControlFlag);
}

function createColoredProgressBar (father) {
	var coloredProgressBar = document.createElement('div');
	coloredProgressBar.setAttribute('id', 'colored_progress_bar_div');
	coloredProgressBar.style.position = 'absolute';
	coloredProgressBar.style.MozBorderRadius = '8px';
	coloredProgressBar.style.backgroundColor = '#949494';
	coloredProgressBar.style.height = '12px';
	coloredProgressBar.style.width = '0px';
	coloredProgressBar.style.top = '0px';
	coloredProgressBar.style.bottom = '0px';
	coloredProgressBar.style.left = '0px';
	coloredProgressBar.style.right = '0px';
	coloredProgressBar.style.zIndex = '502';
	father.appendChild(coloredProgressBar);
}

function createProgressBarCursor (father, progressBarControlFlag) {
	var progressBarCursor = document.createElement('img');
	progressBarCursor.src = 'index.php?extern=images/viewer/circle.png';
	progressBarCursor.setAttribute('id', 'progress_bar_cursor_div');
	progressBarCursor.style.position = 'absolute';
	progressBarCursor.style.width = '12px';
	progressBarCursor.style.height = '12px';
	progressBarCursor.style.top = '0px';
	progressBarCursor.style.bottom = '0px';
	progressBarCursor.style.left = '0px';
	progressBarCursor.style.zIndex = '503';
	father.appendChild(progressBarCursor);
	
	progressBarCursor.onmouseover = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/circle_x.png');
	}

	progressBarCursor.onmouseout = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/circle.png');
	}
}
/*
 * -----------------------------------------------------------------------------
 */

/*
 * -----------------------------------------------------------------------------
 */
function createImportToDocuments (father, pid, checknum, myWindow) {
	var ImportToDocumentsBox = document.createElement('div');
	ImportToDocumentsBox.setAttribute('id', 'fullscreen_box');
	ImportToDocumentsBox.style.position = 'absolute';
	ImportToDocumentsBox.style.height = '54px';
	ImportToDocumentsBox.style.width = '150px';
	ImportToDocumentsBox.style.top = '15px';
	ImportToDocumentsBox.style.left = '42%';
	ImportToDocumentsBox.style.right = '42%';
	ImportToDocumentsBox.style.opacity = '0.7';
	ImportToDocumentsBox.style.zIndex = '500';
	ImportToDocumentsBox.style.visibility = 'hidden';

	var ImportToDocumentsCenter = document.createElement('center');

	var ImportToDocuments = document.createElement('img');
	ImportToDocuments.setAttribute('id', 'import_to_documents_div');
	ImportToDocuments.src = 'index.php?extern=images/viewer/convert-btn1.png';
	ImportToDocuments.style.marginTop = '10px';
	ImportToDocuments.style.paddingLeft = '3px';
	ImportToDocuments.style.paddingRight = '6px';
	ImportToDocumentsCenter.appendChild(ImportToDocuments);

	ImportToDocuments.onclick = function (){
		var optionPane = new eyeos.dialogs.OptionPane(
			"<b>"+tr("You need to convert this file to an eyeos office file, before start editing it. Do you want to proceed? \n This operation will overwrite the current file, and some format may be lost.")+"</b>",
			eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
			eyeos.dialogs.OptionPane.YES_NO_OPTION);
		var dialog = optionPane.createDialog(myWindow, "Viewer", function(result) {
			if (result == 0) {
				eyeos.callMessage(checknum, "importToDocuments", currentPlaylistEntry, function(path) {
					eyeos.callMessage(checknum, 'getFileInfo', path, function (fileInfo) {
						var index = path.lastIndexOf('/');
						var currentPath = path.substr(0, index + 1);

						eyeos.messageBus.getInstance().send('files', 'new', [currentPath, fileInfo]);

						eyeos.execute('documents', checknum, [path]);
						myWindow.close();
					}, this);
				}, this);
			}
		}, this);

		dialog.open();
	}

	ImportToDocuments.onmouseover = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/convert-btn.png');
	}

	ImportToDocuments.onmouseout = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/convert-btn1.png');
	}

	ImportToDocumentsBox.appendChild(ImportToDocumentsCenter);
	father.appendChild(ImportToDocumentsBox);
}

/*
 * -----------------------------------------------------------------------------
 */

/*
 * -----------------------------------------------------------------------------
 */
function createVolumeBarBox (father, pid) {
	var VolumeBarBox = document.createElement('div');
	VolumeBarBox.setAttribute('id', 'volume_bar_box');
	VolumeBarBox.style.position = 'absolute';
	VolumeBarBox.style.height = '54px';
	VolumeBarBox.style.width = '90px';
	VolumeBarBox.style.top = '30px';
	VolumeBarBox.style.bottom = '0px';
	VolumeBarBox.style.left = '50px';
	VolumeBarBox.style.opacity = '0.7';
	VolumeBarBox.style.zIndex = '500';
	VolumeBarBox.style.visibility = 'hidden';

	var volumeBarCenter = document.createElement('center');

	createVolumeLeftIcon(volumeBarCenter);
	createVolumeRightIcon(volumeBarCenter);
	createVolumeBar(volumeBarCenter, pid);

	VolumeBarBox.appendChild(volumeBarCenter);
	father.appendChild(VolumeBarBox);

	// OnMouseOut will act only if we are not in a child div
	VolumeBarBox.onmouseout = function fixOnMouseOut(e) {
		if (!e) var e = window.event;
		var relTarg = e.relatedTarget || e.toElement;

		if(!is_child_of(this, relTarg) && this != relTarg ) {
			VolumeBarControlFlag = false;
		}
	}
}


// Generic Function to check if a div is parent of the other
function is_child_of(parent, child) {
	if( child != null ) {
		while( child.parentNode ) {
			if( (child = child.parentNode) == parent ) {
				return true;
			}
		}
	}
	return false;
}

function createVolumeLeftIcon (father) {
	var volumeLeftIcon = document.createElement('img');
	volumeLeftIcon.setAttribute('id', 'volume_left_div');
	volumeLeftIcon.src = 'index.php?extern=images/viewer/vol1.png';
	volumeLeftIcon.style.position = 'absolute';
	volumeLeftIcon.style.height = '10px';
	volumeLeftIcon.style.witdh = '10px';
	volumeLeftIcon.style.left = '0px';
	volumeLeftIcon.style.top = '23px';
	father.appendChild(volumeLeftIcon);
}

function createVolumeRightIcon (father) {
	var volumeRighticon = document.createElement('img');
	volumeRighticon.setAttribute('id', 'volume_right_div');
	volumeRighticon.src = 'index.php?extern=images/viewer/vol2.png';
	volumeRighticon.style.position = 'absolute';
	volumeRighticon.style.height = '10px';
	volumeRighticon.style.witdh = '10px';
	volumeRighticon.style.right = '0px';
	volumeRighticon.style.top = '23px';
	father.appendChild(volumeRighticon);
}

function createVolumeBar (father, pid) {
	var volumeBar = document.createElement('div');
	volumeBar.setAttribute('id', 'volume_bar_div');
	volumeBar.style.position = 'absolute';
	volumeBar.style.MozBorderRadius = '8px';
	volumeBar.style.backgroundColor = 'transparent';
	volumeBar.style.border = '1.5px solid white';
	volumeBar.style.width = '60px';
	volumeBar.style.height = '6px';
	volumeBar.style.top = '24px';
	volumeBar.style.left = '10px';
	volumeBar.style.right = '10px';
	father.appendChild(volumeBar);

	volumeBar.onmousemove = function (e) {
		if (VolumeBarControlFlag) {
			volumeBarMouseEvent(e, pid);
		}
	}

	volumeBar.onclick = function (e) {
		volumeBarMouseEvent(e, pid);
	}

	volumeBar.onmousedown = function (e) {
		VolumeBarControlFlag = true;
		volumeBarMouseEvent(e, pid);
	}

	volumeBar.onmouseup = function (e) {
		VolumeBarControlFlag = false;
		volumeBarMouseEvent(e, pid);
	}


	createColoredVolumeBar(volumeBar, pid);
	createVolumeBarCursor(father, pid);
}

function createColoredVolumeBar (father, pid) {
	var coloredVolumeBar = document.createElement('div');
	coloredVolumeBar.setAttribute('id', 'colored_volume_bar_div');
	coloredVolumeBar.style.position = 'absolute';
	coloredVolumeBar.style.MozBorderRadius = '8px';
	coloredVolumeBar.style.background = '#949494';
	coloredVolumeBar.style.width = '30px';
	coloredVolumeBar.style.height = '6px';
	coloredVolumeBar.style.top = '0px';
	coloredVolumeBar.style.left = '0px';
	father.appendChild(coloredVolumeBar);
}

function createVolumeBarCursor (father, pid) {
	var volumeBarCursor = document.createElement('img');
	volumeBarCursor.setAttribute('id', 'volume_bar_cursor_div');
	volumeBarCursor.src = 'index.php?extern=images/viewer/circle.png';
	volumeBarCursor.style.position = 'absolute';
	volumeBarCursor.style.width = '12px';
	volumeBarCursor.style.height = '12px';
	volumeBarCursor.style.top = '22px';
	volumeBarCursor.style.left = '34px';
	father.appendChild(volumeBarCursor);

	volumeBarCursor.onmouseover = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/circle_x.png');
	}

	volumeBarCursor.onmouseout = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/circle.png');
	}
	volumeBarCursor.onmousemove = function (e) {
		if (!e) var e = window.event;
		if (VolumeBarControlFlag) {
			volumeBarMouseEvent(e, pid);
		}
	}

	volumeBarCursor.onclick = function (e) {
		if (!e) var e = window.event;
		volumeBarMouseEvent(e, pid);
	}

	volumeBarCursor.onmousedown = function (e) {
		if (!e) var e = window.event;
		VolumeBarControlFlag = true;
		volumeBarMouseEvent(e, pid);
	}

	volumeBarCursor.onmouseup = function (e) {
		if (!e) var e = window.event;
		VolumeBarControlFlag = false;
		volumeBarMouseEvent(e, pid);
	}
}
/*
 * -----------------------------------------------------------------------------
 */

/*
 * -----------------------------------------------------------------------------
 */
function createPlayPauseBackForwardBox (father, pid, plist, checknum) {
	var playPauseBackForwardBox = document.createElement('div');
	playPauseBackForwardBox.setAttribute('id', 'play_pause_back_forward_box');
	playPauseBackForwardBox.style.position = 'absolute';
	playPauseBackForwardBox.style.height = '54px';
	playPauseBackForwardBox.style.top = '30px';
	playPauseBackForwardBox.style.left = '30%';
	playPauseBackForwardBox.style.right = '30%';
	playPauseBackForwardBox.style.opacity = '0.7';
	playPauseBackForwardBox.style.zIndex = '500';

	var playPauseBackForwardCenter = document.createElement('center');

	createPreviousElementIcon(playPauseBackForwardCenter, pid, plist, checknum);
	CreatePlayPauseIcon(playPauseBackForwardCenter, pid);
	createNextElementIcon(playPauseBackForwardCenter, pid, plist, checknum);

	playPauseBackForwardBox.appendChild(playPauseBackForwardCenter);
	father.appendChild(playPauseBackForwardBox);
}

function createPreviousElementIcon (father, pid, plist, checknum) {
	var previousElementIcon = document.createElement('img');
	previousElementIcon.setAttribute('id', 'previous_element_div');
	previousElementIcon.src = 'index.php?extern=images/viewer/previous.png';
	previousElementIcon.style.marginRight = '10px';
	previousElementIcon.style.marginBottom = '10px';
	previousElementIcon.style.visibility = 'hidden';
	father.appendChild(previousElementIcon);

	previousElementIcon.onclick = function (){
		[currentPlaylistEntry, foo] = previousNextMouseEvent(checknum, --currentPlaylistEntry, plist,  pid, 'clicked');
	}

	previousElementIcon.onmouseover = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/previous_x.png');
	}

	previousElementIcon.onmouseout = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/previous.png');
	}
}

function createNextElementIcon (father, pid, plist, checknum) {
	var nextElementIcon = document.createElement('img');
	nextElementIcon.setAttribute('id', 'next_element_div');
	nextElementIcon.src = 'index.php?extern=images/viewer/next.png';
	nextElementIcon.style.marginLeft = '10px';
	nextElementIcon.style.marginBottom = '10px';
	nextElementIcon.style.visibility = 'hidden';
	father.appendChild(nextElementIcon);

	nextElementIcon.onclick = function (){
		[currentPlaylistEntry, foo] = previousNextMouseEvent(checknum, ++currentPlaylistEntry, plist,  pid, 'clicked');
	}

	nextElementIcon.onmouseover = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/next_x.png');
	}

	nextElementIcon.onmouseout = function (){
		this.setAttribute('src', 'index.php?extern=images/viewer/next.png');
	}
}

function CreatePlayPauseIcon (father, pid) {
	var playPauseIcon = document.createElement('img');
	playPauseIcon.setAttribute('id', 'play_pause_div');
	playPauseIcon.src = 'index.php?extern=images/viewer/pause.png';
	playPauseIcon.style.width = '45px';
	playPauseIcon.style.height = '45px';
	playPauseIcon.style.top = '2px';
	playPauseIcon.style.bottom = '2px';
	playPauseIcon.style.marginLeft = '15px';
	playPauseIcon.style.marginRight = '15px';
	playPauseIcon.style.visibility = 'hidden';
	father.appendChild(playPauseIcon);

	playPauseIcon.onclick = function (){
		if ($f(pid + '_viewer').isPlaying()) {
			$f(pid + '_viewer').pause();
			this.setAttribute('src', 'index.php?extern=images/viewer/play_x.png');
		} else {
			$f(pid + '_viewer').play();
			this.setAttribute('src', 'index.php?extern=images/viewer/pause_x.png');
		}

	}

	playPauseIcon.onmouseover = function (){
		if (this.getAttribute('src') == 'index.php?extern=images/viewer/play.png') {
			this.setAttribute('src', 'index.php?extern=images/viewer/play_x.png');
		} else {
			this.setAttribute('src', 'index.php?extern=images/viewer/pause_x.png');
		}
	}

	playPauseIcon.onmouseout = function (){
		if (this.getAttribute('src') == 'index.php?extern=images/viewer/play_x.png') {
			this.setAttribute('src', 'index.php?extern=images/viewer/play.png');
		} else {
			this.setAttribute('src', 'index.php?extern=images/viewer/pause.png');
		}
	}
}