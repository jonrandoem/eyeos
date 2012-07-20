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
 *	eyeos.ui.genericbar.IActions - Interface
 *	Interface which has to be extended when we want to create a class
 *	to provide our customized {@see eyeos.ui.genericbar.IConf#actions}.
 *	{@see eyeos.ui.menubar.MenuBar#menuBarConf}.
 */
qx.Interface.define('eyeos.ui.genericbar.IActions', {

	properties: {
		/**
		 *	The {@see eyeos.ui.Window} reference,
		 *	it's useful to have this refences seen that this class
		 *	may need it for it's own actions methods.
		 */
		window: {
			init: null,
			check: 'eyeos.ui.Window'
		},

		/**
		 *	The checknum's application,
		 *	it's useful to have this refences seen that this class
		 *	may need it for it's own actions methods.
		 */
		checknum: {
			init: null
		},

		/**
		 *	The pid's application,
		 *	it's useful to have this refences seen that this class
		 *	may need it for it's own actions methods.
		 */
		pid: {
			init: null
		}
	},

	members: {
		/**
		 *	This method should implement a manager which, using a switch case,
		 *	should be able to call the appropiate method for this items which
		 *	are declared as 'dynamics' cmd defined in the
		 *	{@see eyeos.ui.genericbar.IItems} extending class.
		 */
		//dynamicsActions: function(){} //not respected!
	}
});