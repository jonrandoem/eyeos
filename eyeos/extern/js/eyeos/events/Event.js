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
 * Event is a class to store information about an event. An event has different
 * properties stored in EventInformation.
 * This class is the analog of EyeosEventNotification on PHP SIDE
 */
qx.Class.define('eyeos.events.Event', {
	extend : qx.core.Object,

	statics: {
		/**
		 * Convert an eyeos.events.Event in a Json Compatible
		 *
		 * @param event {eyeos.events.Event} The event we need to convert
		 */
		toJson: function(event) {
			return {
				eventInformation: eyeos.events.EventInformation.toJson(event.getEventInformation())
			};
		}
	},
	
	properties: {
		eventInformation: {
			check: 'eyeos.events.EventInformation'
		}
	},

	construct: function (eventInformation) {
		this.base(arguments);
		this.setEventInformation(new eyeos.events.EventInformation());

		
		if (eventInformation != null) {
			this.getEventInformation().setAll(eventInformation);
		}
	},
	members: {
		setAnswer: function (answer) {
			this.getEventInformation().setAnswer(answer);
		},
		getIsQuestion: function () {
			return this.getEventInformation().getIsQuestion();
		},
		getMessageInformation: function () {
			return this.getEventInformation().getTranslatedInformation();
		},
		getType: function () {
			return this.getEventInformation().getType();
		},
		getSender: function () {
			return this.getEventInformation().getSender();
		},
		getReceiver: function () {
			return this.getEventInformation().getReceiver();
		},
		getCreationDate: function () {
			return this.getEventInformation().getCreationDate();
		},
		getQuestion: function () {
			return this.getEventInformation().getQuestion();
		},
		getAvailableAnswers: function () {
			return this.getEventInformation().getAvailableAnswers();
		},
		getId: function () {
			return this.getEventInformation().getId();
		},
		getHasEnded: function () {
			return this.getEventInformation().getHasEnded();
		}
	}
	
});