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

qx.Class.define('eyeos.socialbar.NoteBox', {
	extend: qx.ui.container.Composite,
	implement: eyeos.socialbar.ISocialBox,
	
	events: {
		/**
		  * Event Fired when a Note is deleted
		  */
		deleteNote: 'qx.event.type.Data',
		
		/**
		  * Event Fired when a note is created
		  */
		noteCreated: 'qx.event.type.Data'
	},
	
	properties: {
		name: {
			check: 'String'
		},
		
		numOfNotes: {
			check: 'Integer',
			init: 0
		},
		
		checknum: {
			
		}
	},
	
	construct: function (checknum) {
		this.base(arguments);
		this.setChecknum(checknum);
		this.set({
			layout: new qx.ui.layout.VBox(),
			decorator: null
		});
		
		this._buildGui();
		this._addMyListener();
	},
	
	members: {
		_labelTitle: null, //Show the number of the Note Published
		_layoutSearchBox: null, //The container of the Search Box
		_layoutContentBox: null, //The real container of notes
		_layoutContentScroll: null, //The scroll con the _layoutContentBox
		_clearButton: null, 
		_publishButton: null,
		_textField: null,
		_backgroundNote: '#FFFFFF',
		
		addNote: function (note) {
			var newNote = new eyeos.socialbar.NoteLayout(note, this);
			this._updateBackgroundColor(newNote);
			
			this._layoutContentBox.add(newNote);
			
			this.setNumOfNotes(this.getNumOfNotes() + 1);
			this._updateLabelTitle();
		},
		
		_updateBackgroundColor: function (note) {
			note.setBackgroundColor(this._backgroundNote);
			this._backgroundNote = (this._backgroundNote == '#FFFFFF')?('#E0E0E0'):('#FFFFFF');
		},
		
		_deleteNote: function () {
			this.setNumOfNotes(this.getNumOfNotes() - 1);
			this._updateLabelTitle();
			this._refreshBackgroundsNote();
		},
		
		_refreshBackgroundsNote: function () {
			var childrenList = this._layoutContentBox.getChildren();
			
			for (var i = 0; i < childrenList.length; ++i) {
				if (i == 0) {
					this._backgroundNote = childrenList[0].getBackgroundColor();
				}
				if (childrenList[i].getVisibility() == 'visible') {
					this._updateBackgroundColor(childrenList[i]);
				}
			}
		},
		
		_addMyListener: function () {
			this.addListener('deleteNote', function (e) {
				this._deleteNote();
			}, this);
			
			this._clearButton.addListener('execute', function (e) {
				this._textField.setValue('');
			}, this);
			
			this._publishButton.addListener('execute', function (e) {
				this._createNote();
			}, this);
		},
		
		_createNote: function (e) {		
			eyeos.callMessage(this.getChecknum(), '__SocialBar_getCurrentUserId', null, function (myId) {
				var myText = this._textField.getValue();
				if (myText.length > 0) {
					var newId = this._getNewId();
					var newNote = new eyeos.socialbar.Note(
						newId,
						myId,
						new Date(),
						false,
						myText
					);

					this.addNote(newNote);
					this._textField.setValue('');
					this.fireDataEvent('noteCreated', [newId, myText]);
				}
			}, this);
		},
		
		_getNewId: function () {
			var childrenList = this._layoutContentBox.getChildren();
			var maxId = 0;
			for (var i = 0; i < childrenList.length; ++i) {
				maxId = Math.max(maxId, childrenList[i].getNote().getId());
			}
			return (maxId + 1);
		},
		
		_buildGui: function () {	
			this._createTitleBox();
			this._createSearchBox();
			this._createContentBox();
			this._createCommandBox();
		},
		
		_createTitleBox: function () {
			var titleBox = new qx.ui.container.Composite().set({
				height: 40,
				allowGrowY: false,
				layout: new qx.ui.layout.Canvas(),
				decorator: new qx.ui.decoration.Single(2, 'solid', '#A4A4A4').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				})
			});
			this.add(titleBox);
			
			this._labelTitle = new qx.ui.basic.Label('').set({
				font: new qx.bom.Font(12, ['Helvetica', 'Arial']),
				rich: true,
				marginLeft: 5
			});
			this._updateLabelTitle(),
			titleBox.add(this._labelTitle, {top: 14, left: 5});
			
			this._deleteAll = new qx.ui.basic.Label(tr('delete all')).set({
				font: new qx.bom.Font(11, ['Helvetica', 'Arial']),
				textColor: '#297CD3',
				visibility: 'hidden'
			});
			this._deleteAll.setCursor('pointer');
			titleBox.add(this._deleteAll, {top: 14, right: 5});
		},
		
		_updateLabelTitle: function () {
			switch (this.getNumOfNotes()) {
				case 0:
					var newText = '<b>' + tr('0 note published') + '</b>';
					break;
				case 1:
					var newText = '<b>' + tr('1 note published') + '</b>';
					break;
				default:
					var newText = '<b>' + this.getNumOfNotes() + ' ' + tr('notes published') + '</b>';
					break;
			}
			this._labelTitle.setValue(newText);
		},
		_createSearchBox: function () {
			this._layoutSearchBox = new qx.ui.container.Composite().set({
				decorator : new qx.ui.decoration.Single(2, 'solid', '#86BADE').set({
					styleTop: null,
					styleLeft: null,
					styleRight: null
				}),
				layout: new qx.ui.layout.HBox()
			});

			var searchInput = new qx.ui.form.TextField(tr('Search')).set({
				padding: 0,
				paddingBottom: 4,
				margin: 0,
				decorator: null
			});

			searchInput.addListener('input', function (e) {
				var textValue = e.getValue();
				this._filterNoteByText(textValue);
			}, this);

			searchInput.addListener('focus', function (e) {
				this.setValue('');
			});

			this._layoutSearchBox.add(searchInput, {flex: 1});
			this.add(this._layoutSearchBox);
		},
		
		/**
		  * Filter Notes by a input text
		  */
		_filterNoteByText: function (value) {
			var childrenList = this._layoutContentBox.getChildren();
			if (value != ''){
				for(var i = 0; i < childrenList.length; ++i){
					if (childrenList[i].getNote().getText().indexOf(value) != -1
						|| childrenList[i]._author.getValue().indexOf(value) != -1)	{
						childrenList[i].setVisibility('visible');
					} else {
						childrenList[i].setVisibility('excluded');
					}
				}
				this._refreshBackgroundsNote();
			} else {
				for(var i = 0; i < childrenList.length; ++i){
					childrenList[i].setVisibility('visible');
				}
				this._refreshBackgroundsNote();
			}
		},
		
		_createContentBox: function () {
			this._layoutContentScroll = new qx.ui.container.Scroll().set({
				allowStretchY: true,
				allowStretchX: true
			});
			this.add(this._layoutContentScroll, {flex: 1});

			this._layoutContentBox = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
				allowStretchY: true
			});
			this._layoutContentScroll.add(this._layoutContentBox, {flex: 1});
		},
		
		_createCommandBox: function () {
			var commandBox = new qx.ui.container.Composite().set({
				height: 120,
				allowGrowY: false,
				layout: new qx.ui.layout.Canvas(),
				decorator: new qx.ui.decoration.Single(1, 'solid', '#4D9ACF'),
				backgroundColor: '#D9E5F4'
			});
			this.add(commandBox);
			
			this._textField = new qx.ui.form.TextField('').set({
				decorator: new qx.ui.decoration.RoundBorderBeveled('#729ECB', null, 1, 5, 5, 5, 5),
				width: 190,
				allowGrowX: false,
				height: 70,
				allowGrowY: false,
				backgroundColor: '#FFFFFF',
				maxLength: 300
			});
			
			commandBox.add(this._textField, {top: 10, left: 10});
			this._clearButton = new qx.ui.form.Button('Clear').set({
				width: 60,
				allowGrowX: false
			});
			commandBox.add(this._clearButton, {bottom: 10, left: 10});
			
			this._publishButton = new qx.ui.form.Button(tr('Publish Note')).set({
				width: 120,
				allowGrowX: false
			});
			commandBox.add(this._publishButton, {bottom: 10, right: 10});			
		}	
	}
});

qx.Class.define('eyeos.socialbar.NoteLayout', {
	extend: qx.ui.container.Composite,
	
	properties: {
		note: {
			
		}, 
		noteBox: {
			
		}
	}, 
	
	construct: function (note, box) {
		this.base(arguments);
		
		if (note instanceof eyeos.socialbar.Note){
			this.setNote(note);
		}
		this.setNoteBox(box);

		this._buildGui();
	},
	
	members: {
		_emptyStarImage: 'index.php?extern=images/rate_off.png',
		_fullStarImage: 'index.php?extern=images/rate_on.png',
		_closeImage: 'index.php?extern=images/clear.png',
		
		_headerLayout: null,
			_star: null, 			//The Basic Image of the Star
			_author: null, 			//The Label for the Author
			_date: null, 			//The Label for Date
			_deleteButton: null, 	//The Delete Button
		
		_buildGui: function () {
			this.set({
				layout: new qx.ui.layout.VBox(),
				decorator: null
			});
					
			this._createHeader();
			this._createBody();
			this._addMyListeners();
		},
		
		_addMyListeners: function () {
			this._deleteButton.addListener('mouseover', function () {
				this._deleteButton.setOpacity(1);
			}, this);
			
			this._deleteButton.addListener('mouseout', function () {
				this._deleteButton.setOpacity(0);
			}, this);
			
			this._deleteButton.addListener('click', function () {
				this._deleteNote();
			}, this);
			
			this._star.addListener('click', function () {
				this._toggleStar();
			}, this);
		},
		
		_toggleStar: function () {
			if (this.getNote().isFavorite()) {
				this.getNoteBox().fireDataEvent('noteFavoriteChange', [this.getNote().getId(), false]);
				this.getNote().setFavorite(false);
			} else {
				this.getNoteBox().fireDataEvent('noteFavoriteChange', [this.getNote().getId(), true]);
				this.getNote().setFavorite(true);
			}
			this._updateStar();
		},
		_deleteNote: function () {
			this.destroy();
			this.getNoteBox().fireDataEvent('deleteNote', this.getNote().getId());
		},
		
		_createHeader: function () {
			this._headerLayout = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({
					alignY: 'middle'
				}),
				decorator: null,
				padding: 3
			});
			this.add(this._headerLayout);

			//Star
			this._createStar();
			//Author
			this._createAuthor();
			//Date
			this._createDate();
			
			//Just a Spacer
			this._headerLayout.add(new qx.ui.core.Spacer(), {flex: 1});
			
			//Delete Button
			this._createDeleteButton();
		},
		
		_createStar: function () {
			this._star = new qx.ui.basic.Image().set({
				marginLeft: 5
			});
			this._star.setCursor('pointer');
			this._headerLayout.add(this._star);
			this._updateStar();
		},
		
		_updateStar: function () {
			if (this.getNote().getFavorite()) {
				this._star.setSource(this._fullStarImage);
			} else {
				this._star.setSource(this._emptyStarImage);
			}
		},
		
		_createAuthor: function () {
			this._author = new qx.ui.basic.Label().set({
				marginLeft: 5,
				font: new qx.bom.Font(11, ['Helvetica', 'Arial'])
			});
				
			this._headerLayout.add(this._author);
			this._updateAuthor();
		},
		
		_updateAuthor: function () {
			var authorId = this.getNote().getAuthor();

			var contactManager = eyeos.contacts.ContactManager.getInstance();
			contactManager.getContactsByIds([authorId], function(results){
				if (results[0]) {
					var metadata = results[0].getMetadataInstance();
					var name = metadata.getMeta(['eyeos.user.firstname']) + ' ' + metadata.getMeta(['eyeos.user.lastname']);
					this._author.setValue(name);
				}
			}, this);
		},
		
		_createDate: function () {
			this._date = new eyeos.socialbar.Label(null, 'date').set({
				marginLeft: 5				
			});
			this._headerLayout.add(this._date);
			this._updateDate();
		},
		
		_updateDate: function (date) {
			this._date.setValue(this.__formatDate());
		},
		
		__formatDate: function () {
			var twoDay = 2 * 60 * 60 * 24 * 1000;
			var diff = (((new Date()).getTime() - this.getNote().getDate().getTime()));
			if (diff <= twoDay){
				return this.getNote().getDate().prettyDate()
			} else {
				return this.getNote().getDate().formatNumericDate();
			}
		},
		
		_createDeleteButton: function () {
			this._deleteButton = new qx.ui.basic.Image(this._closeImage).set({
				opacity: 0,
				marginRight: 5
			});
			this._deleteButton.setCursor('pointer');
			this._headerLayout.add(this._deleteButton);
		},
		
		_createBody: function () {
			this._bodyLayout = new qx.ui.basic.Label('').set({
				rich: true,
				padding: 5
				//wrap: false
			});
			this.add(this._bodyLayout);
			this._updateBodyLabel();
		},
		
		_updateBodyLabel: function () {
			this._bodyLayout.setValue(this.getNote().getText());
		}
	}
});