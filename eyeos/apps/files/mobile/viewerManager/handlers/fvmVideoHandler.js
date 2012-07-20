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

function fvmVideoHandler () {
	this.checkRequest = checkRequest;
	this.createContent = createContent;
	this.getIconPath = getIconPath;

	function checkRequest (model) {
		var supportedExtensions = ['MOV', '3GP', '3GPP', '3G2', 'MP4', 'MPG', 'MPV', 'AVI', 'OGG', 'OGV', 'WEBM'];
		if ( supportedExtensions.indexOf(model.get('extension')) != -1 ) {
			return true;
		} 
		return false;
	}

	function getIconPath (model, checknum) {
		return 'index.php?extern=images/128x128/mimetypes/application-x-mplayer2.png';
	}

	function createContent(model, page, checknum, callback) {
		// Calculate content Dimension
//		var pageWidth = $.mobile.activePage.children('[data-role="content"]').outerWidth() - 30;
//		var pageHeight = $.mobile.activePage.children('[data-role="content"]').outerHeight() - 30;
		var pageWidth = '90%';
		var movPath = 'index.php?message=getFile&mobile=1&checknum=' + checknum + '&params[path]=' + model.get('absolutepath');
		var poster = 'index.php?message=getVideoPoster&mobile=1&checknum=' + checknum + '&params[path]=' + model.get('absolutepath');
		var extension = model.get('extension').toLowerCase();
		var type = '';
		var content = $('<center></center>');
		var convert = false;
		var convertExtension = null;
		//Probably its the same codec with diferent extension
		if(extension == 'ogv') extension = 'ogg';
		if(extension == 'mov') extension = 'h264';
		//Check if the browser can reproduce video
		if (Modernizr.video) {
			try {
				//Modernizr test if the extension its supported by the browser
				//Modernizr only test: ogg webm h264, the rest of extensions throws and error
				if(eval("Modernizr.video."+extension)) {
					convertExtension = extension;
					eyeosmobile.console("This browser can play this file without conversion");
				} else {
					convert = true;
				}
			} catch (e){
				convert = true;
				eyeosmobile.consoleError("Modernizr dont catch this extension: "+e);
			}
			
			var androidfix = '';
			if(navigator.userAgent.toLowerCase().indexOf("android") > -1) {
				androidfix = 'onclick="this.play();"';
				movPath += '&params[format]=3GP';
//				type = 'type="video/mp4"';
				eyeos.openErrorDialog(tr('Android 2.3 or better required'));

			} else {
				if(convert) {
					if (Modernizr.video.h264) {
						movPath += '&params[format]=MP4';
						convertExtension = 'mp4';
						eyeosmobile.console("convert to allDev-MP4.h264.aac");
					} else if (Modernizr.video.ogg) {
						movPath += '&params[format]=OGV';
						convertExtension = 'ogg';
						eyeosmobile.console("convert to ogv");
					} else {
						eyeosmobile.console("This browser don't support any standard format");
					}
				} else {
					convertExtension = extension;
				}

				//If is android <2.2 type must be empty?
				if(convertExtension == 'ogg' && convert) {
					type = 'type=\'video/ogg; codecs="theora, vorbis"\'';
				} else if(convertExtension == 'ogg') {
					type = 'type="video/ogg"';
				} else if(convertExtension == 'mp4') {
					type = 'type="video/mp4"';
//					type = 'type=\'video/mp4; codecs="amp4v.20.8, mp4a.40.2"\'';
				} else if (convertExtension == 'webm') {
					type = 'type="video/webm"';
				} else {
					eyeosmobile.console("type attr not defined on html: "+convertExtension);
				}
			}
			
			//onerror="eyeosmobile.openErrorDialog(tr(\'Error playing this file\'));" ->	In some case that shows false errors
			//height="' + pageHeight + '"	->	Not necessary
			content.append('<video controls="controls" preload="auto" autobuffer="autobuffer" width="' + pageWidth + '" poster="'+ poster +'" '+androidfix+'>\n\
								<source src="'+ movPath +'" '+ type +'/>\n\
								<p>Your browser does not support this extension.</p>\n\
							</video>');
			//Future 2n source, when the video tag will be correctly implemented in all browsers
			//<img alt="Your browser does not support this extension" src="'+poster+'" width="'+pageWidth+'" title="Your browser does not support this extension" />\n\

		} else {
			eyeosmobile.openErrorDialog(tr('This browser don\'t support video tag'));
		}

		if (typeof callback == 'function') {
			//TODO Try: callback.call instead
			callback(content);
		}
	}

	//Experimental	->	Not used now - Not implemented well in fileViewerManager
	//In the future that can be useful por do a preview
	function getIcon (model) {
		return 'index.php?extern=images/64x64/mimetypes/application-x-mplayer2.png';
	}
}