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
function desktop_application(checknum, pid, args) {
	var applicationName = 'desktop';
	var desktopApp = new eyeosMobileApplication(applicationName, checknum, pid, {
		theme: "b",
		backButtonEnabled: false
	});
	desktopApp.createPage();

	var buttonLayout = $('<a href="#" data-icon="delete" class="ui-btn-right">' + tr('Logout') + '</a>');
	buttonLayout.click(function () {
		eyeosmobile.openErrorDialog('Closing Session');
		eyeosmobile.execute('logout');
	});
	desktopApp.getHeader().append(buttonLayout);
	//args0 its the application list, it comes from desktop.php
	createContentAndChangePage(args[0]);

	function createContentAndChangePage (apps) {
		// Load All Application and changePage
		//eyeosmobile.callMessage(desktopApp.getChecknum(), 'getAllMobileApplications', null, function (apps) {
			//Create Application UL-List
			createApplicationList(desktopApp, apps);
			//ChangePage
			var pageId = desktopApp.getPageId();
			$.mobile.changePage('#' + pageId, 'pop', false, true);
		//}, this);
	}

	function createApplicationList(desktopApp, apps) {
		var mainList = $('<ul data-role="listview" data-inset="true" id="desktop_list"></ul>');
		desktopApp.getContent().append(mainList);

		for (var i = 0; i < apps.length; i++) {
			//Create Single element on the list
			var appListElement = createListAppElement(desktopApp, apps[i]);
			mainList.append(appListElement);
			if (apps[i].name == 'files') {
				//Creating People and Workgroup application (based on files)
				var peopleApplication = createPeopleApplication(desktopApp);
				mainList.append(peopleApplication);

				var workgroupApplication = createWorkgroupApplication(desktopApp);
				mainList.append(workgroupApplication);
			}
			
		}
	}

	function createPeopleApplication (desktopApp) {
		var peopleParam = {
			image: 'index.php?extern=/images/128x128/apps/system-users.png',
			displayName: tr('People'),
			description: tr('Files shared by your contacts'),
			name: 'files'
		};
		var args = new Array('share:///');
		return createListAppElement(desktopApp, peopleParam, args);
	}

	function createWorkgroupApplication (desktopApp) {
		var peopleParam = {
			image: 'index.php?extern=/images/128x128/places/network-workgroup.png',
			displayName: tr('Workgroup'),
			description: tr('Files shared by your workgroups'),
			name: 'files'
		};
		var args = new Array('workgroup:///');
		return createListAppElement(desktopApp, peopleParam, args);
	}

	function createListAppElement(desktopApp, app, arg) {
		// Create HTML ELEMENT
		var appListElement=	$('<li>\n\
								<img src="'+ app.image +'" />\n\
								<h3><a class="mobileApplication">'+ app.displayName +'</a></h3>\n\
								<p>'+ app.description +'</p>\n\
								</li>');

		// ASSIGN LISTENER ON CLICK EVENT
		var eventParam = {
			appName: app.name,
			checknum: desktopApp.getChecknum()
		};

		appListElement.click(eventParam, function () {
			eyeosmobile.execute(eventParam.appName, eventParam.checknum, arg);
			return false;
		});

		return appListElement;
	}

}
	