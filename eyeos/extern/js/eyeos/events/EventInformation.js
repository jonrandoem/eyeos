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
 * This class is the analog of EyeosEventNotificationInformation on PHP SIDE.
 * Basically contains all the information about an event
 */
qx.Class.define('eyeos.events.EventInformation', {
	extend : qx.core.Object,

	statics: {
		/**
		 * Convert an eyeos.events.EventInformation in a Json Compatible
		 *
		 * @param eventInformation {eyeos.events.EventInformation} The eventInformation we need to convert
		 */
		toJson: function(eventInformation) {
			var results = eventInformation.getAll();
			if (results['isQuestion'] != null) {
				if (results['isQuestion'] == true) {
					results['isQuestion'] = 'true';
				} else {
					results['isQuestion'] = 'false';
				}
			}

			if (results['hasEnded'] != null) {
				if (results['hasEnded'] == true) {
					results['hasEnded'] = 'true';
				} else {
					results['hasEnded'] = 'false';
				}
			}

			return results;
		}
	},

	properties: {
		id: {
			check: 'Integer',
			init: null
		},

		answer: {
			check: 'String',
			init: null
		},

		creationDate: {
			check: 'Integer',
			init: null
		},

		type: {
			check: 'String',
			init: null
		},

		sender: {
			check: 'String',
			init: null
		},

		receiver: {
			check: 'String',
			init: null
		},

		question: {
			check: 'String',
			init: null
		},

		availableAnswers: {
			check: 'String',
			init: null
		},

		isQuestion: {
			check: 'Boolean',
			init: null
		},

		eventData: {
			init: null
		},

		hasEnded: {
			check: 'Boolean',
			init: null
		},

		messageInformation: {
			init: null
		}
	},

	construct: function (eventInformation) {
		this.base(arguments);

		if (eventInformation != null) {
			this.setAll(eventInformation);
		}

	},

	members: {

		/**
		 * Set all properties at once 
		 */
		setAll: function (eventInfo) {
			if (eventInfo['id'] != null) {
				this.setId(parseInt(eventInfo['id']));
			}
			if (eventInfo['answer'] != null) {
				this.setAnswer(eventInfo['answer']);
			}
			if (eventInfo['creationDate'] != null) {
				this.setCreationDate(parseInt(eventInfo['creationDate']));
			}
			if (eventInfo['type'] != null) {
				this.setType(eventInfo['type']);
			}
			if (eventInfo['sender'] != null) {
				this.setSender(eventInfo['sender']);
			}
			if (eventInfo['receiver'] != null) {
				this.setReceiver(eventInfo['receiver']);
			}
			if (eventInfo['question'] != null) {
				this.setQuestion(eventInfo['question']);
			}
			if (eventInfo['messageInformation'] != null) {
				this.setMessageInformation(eventInfo['messageInformation']);
			}
			if (eventInfo['availableAnswers'] != null) {
				this.setAvailableAnswers(eventInfo['availableAnswers']);
			}
			if (eventInfo['isQuestion'] != null) {
				this.setIsQuestion(eventInfo['isQuestion']);
			}
			if (eventInfo['eventData'] != null) {
				this.setEventData(eventInfo['eventData']);
			}
			if (eventInfo['hasEnded'] != null) {
				this.setHasEnded(eventInfo['hasEnded']);
			}
		},

		/**
		 * Return a collection of all the properties of the class 
		 */
		getAll: function () {
			var result = {};
			if (this.getId() != undefined) {
				result['id'] = this.getId();
			}
			if (this.getAnswer() != undefined) {
				result['answer'] = this.getAnswer();
			}
			if (this.getCreationDate() != undefined) {
				result['creationDate'] = this.getCreationDate();
			}
			if (this.getType() != undefined) {
				result['type'] = this.getType();
			}
			if (this.getSender() != undefined) {
				result['sender'] = this.getSender();
			}
			if (this.getReceiver() != undefined) {
				result['receiver'] = this.getReceiver();
			}
			if (this.getQuestion() != undefined) {
				result['question'] = this.getQuestion();
			}
			if ((this.getTranslatedInformation() != undefined) && (this.getTranslatedInformation() != null)) {
				result['messageInformation'] = this.getTranslatedInformation();
			}
			if (this.getAvailableAnswers() != undefined) {
				result['availableAnswers'] = this.getAvailableAnswers();
			}
			if (this.getIsQuestion() != undefined) {
				result['isQuestion'] = this.getIsQuestion();
			}
			if (this.getEventData() != undefined) {
				result['eventData'] = this.getEventData();
			}
			if (this.getHasEnded() != undefined) {
				result['hasEnded'] = this.getHasEnded();
			}

			return result;
		},

		getTranslatedInformation : function() {
			var infoData = qx.util.Json.parse(this.getMessageInformation());
			var translatedInformation = tr(infoData[0], infoData[1]);
			return translatedInformation;
		}
	}
});