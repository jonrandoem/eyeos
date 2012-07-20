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

function fvmMusicHandler () {
	this.checkRequest = checkRequest;
	this.createContent = createContent;
	this.getIconPath = getIconPath;

	function checkRequest (model) {
		var supportedExtensions = ['MP3', 'OGA', 'WAV', 'WMA', 'M4A'];
		if ( supportedExtensions.indexOf(model.get('extension')) != -1 ) {
			return true;
		}
		return false;
	}

	function getIconPath (model, checknum) {
		return 'index.php?extern=images/128x128/mimetypes/audio-x-generic.png';
	}

	function createContent(model, page, checknum, callback) {
		var content = $('<center></center>');
		var musicPath = 'index.php?message=getFile&mobile=1&checknum=' + checknum + '&params[path]=' + model.get('absolutepath');
		// Calculate content Dimension making height & width the side smaller
//		var pageWidth = $.mobile.activePage.children('[data-role="content"]').outerWidth() - 30;
//		var pageHeight = $.mobile.activePage.children('[data-role="content"]').outerHeight() - 30;
//		if($.mobile.activePage.children('[data-role="content"]').outerHeight() - 30 < maxSize) maxSize = $.mobile.activePage.children('[data-role="content"]').outerHeight();
		var maxSize = '90%'; //not working, in pixel neither. Maybe style='height:90%;' works better in some cases
		var poster = 'index.php?extern=images/ajax-loader-1.gif';
		var type = '';
		
		if (Modernizr.audio) {
			try {
				if(eval("Modernizr.audio."+model.get('extension').toLowerCase())) {
					eyeosmobile.console("can play this file without conversion");
				} else {
					if(Modernizr.audio.mp3) {
						musicPath += '&params[format]=MP3';
						type = 'type="audio/mpeg"';
						eyeosmobile.openErrorDialog(tr('Converting the file to MP3'));
						eyeosmobile.console("convert to mp3");
					} else if (Modernizr.audio.ogg) {
						musicPath += '&params[format]=OGG';
						type = 'type="audio/ogg"';
						eyeosmobile.openErrorDialog(tr('Converting the file to OGG'));
						eyeosmobile.console("convert to ogg");
					} else if (Modernizr.audio.m4a) {
						musicPath += '&params[format]=M4A';
						type = 'type="audio/aac"';
						eyeosmobile.openErrorDialog(tr('Converting the file to M4A'));
						eyeosmobile.console("convert to m4a");
					} else if (Modernizr.audio.wav) {
						musicPath += '&params[format]=WAV';
						type = 'type="audio/x-wav"';
						eyeosmobile.openErrorDialog(tr('Converting the file to WAV'));
						eyeosmobile.console("convert to wav");
					} else {
						eyeosmobile.console("this browser don't support any standard format");
					}
				}
			} catch (e) {
				//All supported extensions by this handler are recognized by Modernizr, but for prevent future errors & more error control try-catch introduced
				eyeosmobile.console("Modernizr don't recognize this format?"+e);
			}

			//If android workaround, don't recognize audio tag and Modernizr don't detect it
			if(navigator.userAgent.toLowerCase().indexOf("android") > -1) {
				content.append('<video controls="controls" preload="auto" autobuffer="autobuffer" width="'+ maxSize +'" onclick="this.play();" poster="'+ poster +'">\n\
									<source src="'+ musicPath +'" '+type+'/>\n\
									<p>Your browser does not support this extension.</p>\n\
								</video>');
			} else {
				//autoplay="autoplay"
				content.append('<audio controls="controls" preload="auto" autobuffer="autobuffer" width="'+ maxSize +'" onerror="eyeosmobile.openErrorDialog(tr(\'Error playing this file\'));" poster="'+ poster +'">\n\
									<source src="'+ musicPath +'" '+type+'/>\n\
									<p>Your browser does not support this extension.</p>\n\
								</audio>');
			}

		} else {
			eyeosmobile.openErrorDialog(tr('This browser don\'t support audio tag'));
		}
		
		//content.append('<a href="' + musicPath + '">Download this file</a>');

		if (typeof callback == 'function') {
			//TODO Try: callback.call instead
			callback(content);
		}
	}

	//Experimental	->	Not used now - Not implemented well in fileViewerManager
	//In the future that can be useful por do a preview
	function getIcon (model) {
		return 'index.php?extern=images/64x64/mimetypes/audio-x-generic.png';
	}

//	If modernizr its no longer used a function like that do the same
//	function browser_support_this_format(format) {
//		var compatibility = document.createElement('video').canPlayType(format);
//		eyeosmobile.console('Video compatibility: '+compatibility);
//		if(compatibility == '') return false;
//		else if(compatibility == 'probably' || compatibility == 'maybe') return true;
//		else return false;
//
//		OR
//		var myAudio = document.createElement('audio');
//		var canPlayOgg = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"');
//		var canPlayMp3 = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mpeg');
//	}
}