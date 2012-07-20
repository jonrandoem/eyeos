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

function fvmDocumentHandler() {
	/* Essentials functions in a handler, this lines make this functions publics */
	this.checkRequest = checkRequest;
	this.createContent = createContent;
	this.getIconPath = getIconPath;

	function checkRequest (model) {
		var supportedExtensions = ['TXT', 'DOC', 'DOCX',
									'ODT', 'ODS', 'OTS', 'SXC', 'STC', 'XLS', 'XLT', 'XLSX', 'FODS', 'UOS',
									'ODP', 'OTP', 'SXI', 'STI', 'PPT', 'POT', 'SXD', 'PPTX', 'PPSX', 'POTM', 'PPS', 'FODP', 'UOP',
									'EDOC','PDF'];
		if ( supportedExtensions.indexOf(model.get('extension')) != -1 ) {
			return true;
		}
		return false;
	}

	function getIconPath (model, checknum) {
		var extension = model.get('extension');

		switch (extension) {
			case 'TXT':
			case 'DOC':
			case 'DOCX':
			case 'ODT':
				return 'index.php?extern=images/128x128/mimetypes/application-msword.png'
			case 'ODS':
			case 'OTS':
			case 'SXC':
			case 'STC':
			case 'XLS':
			case 'XLT':
			case 'XLSX':
			case 'FODS':
			case 'UOS':
				return 'index.php?extern=images/128x128/mimetypes/application-vnd.ms-excel.png'
			case 'ODP':
			case 'OTP':
			case 'SXI':
			case 'STI':
			case 'PPT':
			case 'POT':
			case 'SXD':
			case 'PPTX':
			case 'PPSX':
			case 'POTM':
			case 'PPS':
			case 'FODP':
			case 'UOP':
				return 'index.php?extern=images/128x128/mimetypes/application-vnd.ms-powerpoint.png'
			case 'PDF':
				return 'index.php?extern=images/128x128/mimetypes/application-pdf.png'
			case 'EDOC':
				return 'index.php?extern=images/128x128/mimetypes/application-x-mswrite.png'
		}
	}

	function createContent(model, page, checknum, callback) {
		eyeosmobile.callMessage(checknum, 'convertDocumentToImagesHash', {path: model.get('absolutepath')}, function (result) {
			// Data Struct necessary to handle dynamic loading while scrolling
			var pageWidth = $.mobile.activePage.children('[data-role="content"]').innerWidth() -30;
			
			page.getContent().data('loadInfo', {
				images: result['images'],
				previews: result['previews'],
				index: 0,
				hash: result['hash'],
				pageWidth: pageWidth,
				containerId: "container_"+result['hash']
			});


			fvmDocumentHandler.createContainer(page);
			fvmDocumentHandler.loadNextPages(page, checknum);
			fvmDocumentHandler.addInfinityScroll(page, checknum);

			// Change to this page when first page is loaded
			page.getContent().bind('firstPageLoaded', function () {
				if (typeof callback == 'function') {
					//TODO Try: callback.call instead
					callback('');
				}
			});
			
		}, this);
	}
}

/***	Internal functions	***/



/**
 * This function load next 3 pages (if possible)
 * So if multiple events call this function simultaneously, only one will be executed
 */
fvmDocumentHandler.loadNextPages = function (page, checknum) {
	var loadInfo = page.getContent().data('loadInfo');
	if ((loadInfo['index'] >= loadInfo['images'].length) || ($(page.getPageId() + '_loadImageClass').length != 0)) {
		return;
	}

	//Show next 3 pages (if possible)
	for (var i = 0; i < 3; ++i) {
		if (loadInfo['index'] < loadInfo['images'].length) {

			//Show a Message to the user (only if the page was full loaded)
			if ($.mobile.activePage.attr('id') == page.getPageId()) {
				eyeosmobile.openErrorDialog(tr('Loading new pages'));
			}
			//Create & insert the page into the content
			fvmDocumentHandler.createPage(page,checknum);
			//Update loadInfo
			loadInfo['index'] = loadInfo['index'] + 1;
			page.getContent().data('loadInfo', loadInfo);
		}
	}
}
// Now it's possible to use it like a static class
fvmDocumentHandler.prototype.loadNextPages = fvmDocumentHandler.loadNextPages;

//Create the container of all the pages
fvmDocumentHandler.createContainer = function (page) {
	var loadInfo = page.getContent().data('loadInfo');
	var containerId = loadInfo['containerId'];
	var centerStyle = 'width: 100%';

	var container = $('<center id="' + containerId + '" style="' + centerStyle + '"></center>');
	page.getContent().append(container);
}


/**
 * Create the document preview
 * BootStrap:
 *	1.-Create IDs
 *	2.-Create Styles
 *	3.-Create Page
 *	4.-Insert the page into the container
 *	5.-Include image listeners events (for loader & click)
 *
 *	@params:
 *		page->jQuery Object->The actual  page
 *		checknum->eyeOS system checknum for call files.php
 *	@return: void
 *		Insert the page directly into page
 */
fvmDocumentHandler.createPage = function(page,checknum) {

	var loadInfo = page.getContent().data('loadInfo');

/**	1.-Create IDs	*/
	var newPageId = page.getPageId() + '_page_' + loadInfo['index'];
	var imageId = page.getPageId() + '_image_' + loadInfo['index'];
	var loadingImageId = page.getPageId() + '_loadImage_' + loadInfo['index'];
	var loadingImageClass = page.getPageId() + '_loadImageClass';
	var container = "#"+loadInfo['containerId'];

/**	2.-Create Styles	*/
	var newPageStyle =		'display:		none;'+
							'margin-bottom:	15px;'+
							'max-width:		98%;'+
							'width:			98%;';

	var imgStyle =			'border:		1px solid #B3B3B3;'+
							'width:			100%;';
	var openPageStyle =		'float:			right;';
	var shadowStyle =		'width:			100%;'+
							'height:		5px;';

	var shadowLeftStyle =	'display:		inline-block;'+
							'height:		5px;'+
							'width:			2%';
	var shadowCenterStyle = 'display:		inline-block;'+
							'background:	url(index.php?extern=images/mobile/files/Center.png) repeat-x;'+
							'height:		5px;'+
							'width:			96%';
	var shadowRightStyle =	'display:		inline-block;'+
							'height:		5px;'+
							'width:			2%';

/**	3.-Create Page	*/

	var newPage = $('<center id="' + newPageId + '" style="' + newPageStyle + '"></center>');
	//Open Page
	$('<img style="' + openPageStyle + '" src="index.php?extern=images/mobile/files/Text.png" />').appendTo(newPage);

	//Image of the page
	var src = 'index.php?message=getScaledImageByHash&mobile=1&checknum=' + checknum + '&params[maxWidth]=' + loadInfo['pageWidth'] + '&params[filename]=' + loadInfo['previews'][loadInfo['index']]+'&params[hash]=' + loadInfo['hash'];
	var imagePage = $('<img id="'+ imageId +'" style="' + imgStyle + '" src="' + src + '" />').appendTo(newPage);

	//Shadows
	var shadowContent = $('<div style="' + shadowStyle + '"></div>').appendTo(newPage);
	$('<img style="' + shadowLeftStyle  + '" src="index.php?extern=images/mobile/files/Left.png"/>').appendTo(shadowContent);
	$('<div style="' + shadowCenterStyle + '"/></div>').appendTo(shadowContent);
	$('<img style="' + shadowRightStyle + '" src="index.php?extern=images/mobile/files/Right.png"/>').appendTo(shadowContent);

	//Loading Image
	var loadingImage = $('<center id="' + loadingImageId + '" class="' + loadingImageClass + '"><img src="index.php?extern=images/ajax-loader-1.gif" /></center>');

/**	4.-Insert the page into the container	*/
	$(container).append(loadingImage);
	$(container).append(newPage);
	
/**	5.-Include image listeners events (for loader & click)	*/
	imagePage.load(function () {
		//Remove Loading image
		var imageId = $(this).attr('id');
		var id = imageId.substr(imageId.lastIndexOf('_') + 1);
		$('#' + page.getPageId() + '_loadImage_' + id).remove();

		//If this is the first page trigger event to change page
		if (id == 0) {
			page.getContent().trigger('firstPageLoaded');
		}
		//Show the Page
		$(this).parent().fadeIn();
	});

	var fullHtmlPreviewLink = 'index.php?message=createHtmlFullDocumentPreview&mobile=1&checknum=' + checknum + '&params[checknum]=' + checknum + '&params[hash]=' + loadInfo['hash'] + '&params[filename]=' + loadInfo['images'][loadInfo['index']] + '&params[index]=' + loadInfo['index'] + '&params[pagescount]=' + loadInfo['images'].length;
	newPage.data('fullHtmlPreviewLink',fullHtmlPreviewLink).click(function() {
		window.open($(this).data('fullHtmlPreviewLink'));
	});
}


/**
 * Add listener to scroll, so its possible to detect when we reach end of document
 * and try to load next pages (if any) with loadNextPages
 */
fvmDocumentHandler.addInfinityScroll = function (page, checknum) {
	$(window).scroll(function () {
		if ($.mobile.activePage.attr('id') == page.getPageId()) {
			if ($(window).scrollTop() == $(document).height() - $(window).height()){
				fvmDocumentHandler.loadNextPages(page, checknum);
			}
		}
	});

	page.getContent().scrollstop(function () {
		var platformOffset = 0;

		if (eyeosmobile.isiPhone()) {
			platformOffset = 60;
		}

		if (eyeosmobile.isiPad()) {
			platformOffset = 50;
		}
		
		if ($.mobile.activePage.attr('id') == page.getPageId()) {
			if ($(window).scrollTop() == $(document).height() - $(window).height() - platformOffset){
				fvmDocumentHandler.loadNextPages(page, checknum);
			}
		}
	});
}
fvmDocumentHandler.prototype.addInfinityScroll = fvmDocumentHandler.addInfinityScroll;