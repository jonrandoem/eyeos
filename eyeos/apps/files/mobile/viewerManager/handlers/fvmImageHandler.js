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

function fvmImageHandler () {
	this.checkRequest = checkRequest;
	this.createContent = createContent;
	this.getIconPath = getIconPath;

	function checkRequest (model) {
		var supportedExtensions = ['JPG', 'JPEG', 'GIF', 'PNG', 'BMP', 'XBM'];
		if ( supportedExtensions.indexOf(model.get('extension')) != -1 ) {
			return true;
		} 
		return false;
	}

	function getIconPath (model, checknum) {
		return 'index.php?extern=images/128x128/mimetypes/image-x-generic.png';
	}

	function createContent(model, page, checknum, callback) {
		// Calculate content Dimension
		var pageWidth = $.mobile.activePage.children('[data-role="content"]').outerWidth() - 30;
		var pageHeight = $.mobile.activePage.children('[data-role="content"]').outerHeight() - 30;

		var imagePath = 'index.php?message=createHtmlImagePreview&mobile=1&checknum=' + checknum + '&params[checknum]=' + checknum + '&params[maxWidth]=' + Math.max(pageWidth, pageHeight) + '&params[maxHeight]=' + Math.max(pageWidth, pageHeight) + '&params[path]=' + model.get('absolutepath');
//		var content = $('<center><img src="' + imagePath + '" style="max-height:'+pageHeight+';max-width:'+pageWidth+'"></center>');

//		page.getContent().resize(function () {
//			var maxWidth = $.mobile.activePage.children('[data-role="content"]').outerWidth() - 30;
//			var maxHeight = $.mobile.activePage.children('[data-role="content"]').outerHeight() - 30;
////			var ratio = 0;  // Used for aspect ratio
//			var image = page.getContent().children("center").children("img");
//			image.css({
//				"max-width" : maxWidth,
//				"max-height" : maxHeight
//
//			});
//			console.log("H:"+maxHeight+" W:"+maxWidth);
//			var width = image.width();    // Current image width
//			var height = image.height();  // Current image height

			// Check if the current width is larger than the max
//			if(width > maxWidth){
//				ratio = maxWidth / width;   // get ratio for scaling image
//				image.css("width", maxWidth); // Set new width
//				image.css("height", height * ratio);  // Scale height based on ratio
//				height = height * ratio;    // Reset height to match scaled image
//			}

			// Check if current height is larger than max
//			if(height > maxHeight){
//				ratio = maxHeight / height; // get ratio for scaling image
//				image.css("height", maxHeight);   // Set new height
//				image.css("width", width * ratio);    // Scale width based on ratio
//				width = width * ratio;    // Reset width to match scaled image
//			}

			// Check if current width is smaller than the max
			// Check if current height is smaller than the max
			//alert("imatge wxh: "+image.css("width")+" "+image.css("height"));
//		});

		if (typeof callback == 'function') {
			//TODO Try: callback.call instead
			callback(null, imagePath);
		}
	}

	//Experimental	->	Not used now - Not implemented well in fileViewerManager
	//In the future that can be useful por do a preview
	function getIcon (model) {
		return 'index.php?extern=images/64x64/mimetypes/image-x-generic.png';
	}
}