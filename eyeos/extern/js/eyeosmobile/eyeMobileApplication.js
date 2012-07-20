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
/**
 *
 */
function eyeosMobileApplication (name, checknum, pid, option) {
	this.name = name;
	this.checknum = checknum;
	this.pid = pid;
	this.option = option || {};
	this.pageId = name + '_application';
	
	this.page = new eyeosMobilePage(this.pageId, this.name, this.option);

	this.getName = function () {
		return this.name;
	}

	this.getChecknum = function () {
		return this.checknum;
	}

	this.getPid = function () {
		return this.name;
	}

	this.createPage = function () {
		this.page.createPage();
	}

	this.getHeader = function () {
		return this.page.getHeader();
	}

	this.getContent = function () {
		return this.page.getContent();
	}

	this.getFooter = function () {
		return this.page.getFooter();
	}

	this.getPageId = function () {
		return this.pageId;
	}

	this.getElement = function () {
		return this.page.getElement();
	}
}

/**
 * Create an eyeos Mobile Page
 * id will be the id of the new page
 * name will be the name showned in the header
 * option {
 *		footerEnabled: [true/FALSE]
 *		backButtonEnabled: [TRUE/false]
 *		customBackButton: Jquery DOM Element
 * }
 */
function eyeosMobilePage (pageId, name, option) {
	this.pageId = pageId;
	this.name = name;
	this.option = option || {};

	/**
	 * Return Header element of the page
	 */
	this.getHeader = function () {
		return $('#' + this.getPageId() + '> [data-role="header"]');
	}

	/**
	 * Return Content element of the page
	 */
	this.getContent = function () {
		return $('#' + this.getPageId() + '> [data-role="content"]');
	}
	/**
	 * Return Content element of the page
	 */
	this.getFooter = function () {
		return $('#' + this.getPageId() + '> [data-role="footer"]');
	}

	this.getPageId = function () {
		return this.pageId;
	}

	this.getElement = function () {
		return $('#' + this.getPageId());
	}
	
	/**
	 * Create Skeleton of the page and add it to <body>
	 */
	this.createPage = function (content, footer) {
		var pageDiv = this.__createPageDiv();
		var header = this.__createHeader();
		var content = this.__createContent();
		var footer = this.__createFooter();

		pageDiv.append(header);
		pageDiv.append(content);
		
		if (footer) {
			pageDiv.append(footer);
		}

		//Remove existing Pagediv (if any)
		$('#' + this.getPageId()).remove();

		//Append page to <body>
		$('body').append(pageDiv);

	}

	this.__createPageDiv = function () {
		// Generate custom theme
		var themeAttr = '';
		if (this.option && this.option['theme']) {
			themeAttr = 'data-theme="' + this.option['theme'] + '"';
		}
		
		return $('<div data-role=\'page\' id=\'' + this.pageId + '\' data-url=\'' + this.pageId + '\'' + themeAttr + '></div>');
	}

	this.__createHeader = function () {
		var backButtonEnabled = '';
		
		if (this.option !== undefined && this.option['backButtonEnabled'] == false) {
			backButtonEnabled = 'data-backbtn="false"';
		}
		var header = $('<div data-role=\'header\'' + backButtonEnabled + '><h1>' + tr(this.name) +'</h1></div>');
		return header;
	}

	this.__createContent = function () {
		return $('<div data-role=\'content\'></div>');
	}

	this.__createFooter = function () {
		if (option !== undefined && option['footerEnabled'] == true) {
			return $('<div data-role=\'footer\'></div>');
		} else {
			return null;
		}
	}
}
