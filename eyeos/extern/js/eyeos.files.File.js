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

qx.Class.define('eyeos.files.File', {
	extend: qx.core.Object,
	
	construct: function (file) {
		this.base(arguments);
		this._build(file);
	},

	properties: {
		cutted: {
			check: 'Boolean',
			init: false
		},
		
		type: {
			check: 'String'
		},

		extension: {
			check: 'String'
		},

		name: {
			check: 'String'
		},

		size: {
			check: 'String'
		},

		permissions: {
			check: 'String'
		},

		owner: {
			check: 'String'
		},

		path: {
			check: 'String'
		},

		shared: {
			check: 'Object'
		},

		absolutePath: {
			check: 'String'
		},

		rating: {
			check: 'String'
		},

		created: {
			check: 'String'
		},

		modified: {
			check: 'String'
		},
		
		contentSize: {
			init: 0,
			check: 'Integer'
		},

                content: {
                    check: 'String',
                    init: ""
                }
	},

	members: {

		_build: function (file) {
			this.setType(file.type);
			this.setName(file.name);
			this.setExtension(file.extension);
			this.setSize(file.size);
			this.setPermissions(file.permissions);
			this.setOwner(file.owner);
			this.setPath(file.path);
			this.setAbsolutePath(file.absolutepath);
			this.setShared(file.shared);
			this.setRating(file.rating);
			this.setCreated(file.created);
			this.setModified(file.modified);
                        if(file.content) {
                            this.setContent(file.content);
                        }
			if(file.sharedByContacts) {
				this.setUserData('sharedByContacts', true);
			} else {
				this.setUserData('sharedByContacts', false);
			}
			
			if (file.contentsize) {
				this.setContentSize(file.contentsize);
			}
		},
	
		getSimplifiedPath: function() {
			var path = this.getAbsolutePath();
			var regexp = new RegExp('^home://~.*?(/.*)', 'i');
			var matches = regexp.exec(path);
			if (matches && matches.length > 0) {
				path = matches[1];
			}
			return path;
		}
	}
});


