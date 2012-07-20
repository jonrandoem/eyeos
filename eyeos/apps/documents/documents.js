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
 * eyeos.application.Documents - the eyeOS Word Processor.
 * @param checknum {Number} the process checknum
 * @param pid {Number} the process id
 * @param arg {Array} the input arguments, filePath it's expected to be at args[0], if present.
 */
function documents_application(checknum, pid, args) {
	// dmp stands for diff patch match, its a external library,
	// and it seems that need to be in a global bar...
	dmp = new diff_match_patch();
	
	var application = new eyeos.application.Documents(checknum, pid, args);
	application.setIconsPath('index.php?extern=images/documents/');
	application.initWithSplashScreen();
}

// Defining the main Application's Class...
qx.Class.define('eyeos.application.Documents', {
	extend: eyeos.system.EyeApplication,

	// calling the parent object, and setting an initial file, if one is present...
	construct: function (checknum, pid, args) {
		arguments.callee.base.call(this, 'documents', checknum, pid);
		
		if (args && args[0]) {
			this.setFilePath(args[0]);
		}

		if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
			this.setExplorer(false);
		} else {
			this.setExplorer(true);
		}
	},

	properties: {
		// if we are under Internet Explorer browser...
		explorer: {
			init: false,
			check: 'Boolean'
		},

		// the application's window
		window: {
			init: null,
			check: 'eyeos.ui.Window'
		},

		// the application's menuBar
		menuBar: {
			init: null,
			check: 'eyeos.ui.menubar.MenuBar'
		},

		// the application's topToolBar
		topToolBar: {
			init: null,
			check: 'eyeos.ui.toolbar.ToolBar'
		},

		// the application's bottomToolBarBasic
		bottomToolBarBasic: {
			init: null,
			check: 'eyeos.ui.toolbar.ToolBar'
		},

		// the application's bottomToolBarAdvanced
		bottomToolBarAdvanced: {
			init: null,
			check: 'eyeos.ui.toolbar.ToolBar'
		},

		// the application's iconsPath
		iconsPath: {
			init: null,
			check: 'String'
		},

		// the application's current filePath
		filePath: {
			init: null,
			check: 'String'
		},

		// the application's current filePath
		duid: {
			init: null,
			check: 'String'
		},

		// the tinyMCE instance...
		tinyMCE: {
			init: null
		},

		// the documents socialBar
		socialBar: {
			init: null
		},

		currentUser: {
			init:null,
			check: 'String'
		},

		EnableSocialBar: {
			init: true,
			event: 'changeEnableSocialBar'
		}
	},

	members: {
        
        /**
        * get current username from server and start the application
        *
        * @author        Jordi Rubio
        * @access        private
        * @package       eyeDocs
        * @param         qx.ui.basic.Image               image
        * @since         1.0
        */
        _getUserAndStart: function(image) {
            eyeos.callMessage(this.getChecknum(), 'getCurrentUsername', null, function(username) {
                this.addListener('tinyCompleted', function() {
                    this.getWindow().setAllowClose(true);
                    this.getWindow().setEnabled(true);
                }, this);
                this.initApplication(username, image);
            }, this);
        },
        
        /**
        * show splash screen and call _getUserAndStart
        *
        * @author        Jordi Rubio
        * @access        public
        * @package       eyeDocs
        * @since         1.0
        */
		initWithSplashScreen: function() {
            
			var image = new qx.ui.basic.Image("index.php?appName=documents&appFile=splash.png&checknum=" + this.getChecknum()).set({
				zIndex: 100002
			});

			var dimensions = document.eyeDesktop.getBounds();
			if(dimensions) {
				document.eyeDesktop.add(image, {
					left: (dimensions.width / 2) - 352,
					top: (dimensions.height / 2) - 181
				});
				
				image.addListener('appear', function (e) {
                    this._getUserAndStart(image);
				}, this);
			} else {
                this._getUserAndStart(image);
			}
            
		},

		_checkMonitorBouds: function() {
			var bounds = this.getWindow().getBounds();
			if((bounds.height <= 768) && (bounds.width <= 1024)) {
				this.setEnableSocialBar(false);
			} else {
				this.setEnableSocialBar(true);
			}
		},

        /**
        * start draw of main interface
        *
        * @author        Jordi Rubio
        * @access        private
        * @package       eyeDocs
        * @param         string                         username
        * @param         qx.ui.basic.Image              image
        * @since         1.0
        */
		initApplication: function(username, image) {
			originalContent = "";
            // set current user on this
			this.setCurrentUser(username);

            // construct main window
			this.setWindow(new eyeos.ui.Window(this, 'Documents', 'index.php?extern=/images/16x16/apps/okteta.png', true).set({
				contentPadding: 0,
				layout: new qx.ui.layout.HBox()
			}));

            var container = new qx.ui.container.Composite(new qx.ui.layout.VBox());
			this.getWindow().setUserData('container', container);
			this.getWindow().add(container, {flex: 1});

			// adding the main listeners to the Application's window...
			this.getWindow().addListener('appear', function() {
				this.getWindow().setCaption('Documents - '+ tr('Unnamed Document'));
				this._checkMonitorBouds();

				// creating the actions class...
				var actions = new genericbar.both.Actions(this);

				// creating the menuBar....
				this.createMenuBar(actions);

				// creating the topToolBar...
				this.createTopToolBar(actions);

				// creating the bottomToolBars...
				this.createBottomToolBar(actions);

				// creating the tinyMCE editor...
				this.createEditor(username, image);

				// creating the socialBar...
				if(this.getEnableSocialBar()) {
					this.createEmptySocialBar();
				} else {
					this.getMenuBar().getActions().setSocialBarVisible(false);
				}
			}, this);

			this.getWindow().addListener('beforeClose', function(e) {

				var tinymceId = 'tinymce_editor' + this.getPid();
                
				if(!this.isExplorer()) {
					removeSelector(this.getCurrentUser());
				}

				var ed = tinyMCE.get('tinymce_editor' + this.getPid());
				eyeos.application.documents.Utils.sendChanges(this.isExplorer(), this.getPid(),this.getDuid());
				// if the file is not saved...
				if(!this.isDisposed()) {
					if (!this.getMenuBar().getActions().isFileSaved()) {
						e.preventDefault();
						// we ask the user if he want to save the file...
						var optionPane = new eyeos.dialogs.OptionPane(
							"<b>"+tr("Do you want to save the file before closing?")+"</b>",
							eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
							eyeos.dialogs.OptionPane.YES_NO_CANCEL_OPTION);
						var dialog = optionPane.createDialog(this.getWindow(), "Documents", function(result) {
							// if the user does not want to save the file, we reset the needed intervals
							// for the collaborative plugin, we save the openRecent entries, and we close the application...
							if (result == 0) {
								//unsubscribe here
								var object = this.getMenuBar().getActions();
								var netSync = eyeos.netSync.NetSync.getInstance();
								clearInterval(tinyMCE.getInstanceById(tinymceId).interval);
								clearInterval(tinyMCE.getInstanceById(tinymceId).intervalPing);
								clearInterval(this.getMenuBar().getActions().interval);
								clearInterval(this.getMenuBar().getActions().intervalGet);

								this.getMenuBar().getActions().__currentDoc.checksum =
								eyeos.application.documents.Utils.crc32(tinyMCE.getInstanceById(tinymceId).getContent());
								this.getMenuBar().getActions().dynamicsWriteOpenRecent();
								this.getWindow().close();
							}
							// if the user does want to save the file, we save it...
							else if (result == 1) {
								this.getMenuBar().getActions().__closeFlag = true;
								this.getMenuBar().getActions().fileSave();
							}
						}, this);

						dialog.open();
					}
					// if the file is saved, we reset the needed intervals
					// for the collaborative plugin, and we save the openRecent entries,
					// without saving the current file...
					else {
						//unsubscribe here
						var object = this.getMenuBar().getActions();
						var netSync = eyeos.netSync.NetSync.getInstance();
						netSync.unsubscribe('document_'+object.__currentDoc.duid);
						clearInterval(tinyMCE.getInstanceById(tinymceId).interval);
						clearInterval(tinyMCE.getInstanceById(tinymceId).intervalPing);
						clearInterval(this.getMenuBar().getActions().interval);
						clearInterval(this.getMenuBar().getActions().intervalGet);
						this.getMenuBar().getActions().dynamicsWriteOpenRecent();
					}
				}
			}, this);

			this.getWindow().maximize();
			this.getWindow().setAllowClose(false);
			this.getWindow().setEnabled(false);
			this.getWindow().open();
		},

		createMenuBar: function(actions) {
			this.setMenuBar(new eyeos.ui.menubar.MenuBar().set({
				iconsPath: this.getIconsPath(),
				items: new genericbar.menubar.Items().getItems(),
				actions: actions
			}));

			this.getMenuBar().createMenuBar();
			this.getWindow().getUserData('container').addAt(this.getMenuBar(), 0);
		},

		createTopToolBar: function(actions) {
			this.setTopToolBar(new eyeos.ui.toolbar.ToolBar().set({
				height: 55,
				iconsPath: this.getIconsPath(),
				items: new genericbar.toptoolbar.Items().getItems(),
				actions: actions,
				header: new eyeos.ui.toolbar.Header(this.getIconsPath() + 'application-switch.png')
			}));

			this.getTopToolBar().createToolBar();
			this.getWindow().getUserData('container').addAt(this.getTopToolBar(), 1);
		},

		destroyTopToolBar: function() {
			this.getWindow().getUserData('container').remove(this.getTopToolBar());
			this.getTopToolBar().destroy();
		},

		createBottomToolBar: function(actions) {
			this.createBottomToolBarBasicModel(actions);
			this.createBottomToolBarAdvancedModel(actions);

			// adding the listener to switch between the basic and the advanced mode...
			this.getTopToolBar().getHeader().addListener('changeMode', function(e) {
				if (e.getTarget().getMode()) {
					this.getWindow().getUserData('container').remove(this.getBottomToolBarBasic());
					this.getWindow().getUserData('container').addAt(this.getBottomToolBarAdvanced(), 2);
				}
				else {
					this.getWindow().getUserData('container').remove(this.getBottomToolBarAdvanced());
					this.getWindow().getUserData('container').addAt(this.getBottomToolBarBasic(), 2);
				}
			}, this);
		},

		destroyBottomToolBar:function() {
			this.getWindow().getUserData('container').remove(this.getBottomToolBarBasic());
			this.getBottomToolBarBasic().destroy();
			this.getWindow().getUserData('container').remove(this.getBottomToolBarAdvanced());
			this.getBottomToolBarAdvanced().destroy();
		},

		createBottomToolBarBasicModel: function(actions) {
			this.setBottomToolBarBasic(new eyeos.ui.toolbar.ToolBar().set({
				height: 30,
				mode: 'switching',
				iconsPath: this.getIconsPath(),
				items: new genericbar.bottomtoolbar.basic.Items().getItems(),
				actions: actions,
				header: new eyeos.ui.toolbar.ImageHeader(this.getIconsPath() + 'draw-text.png', this.getIconsPath() + 'view-file-columns.png')
			}));

			this.getBottomToolBarBasic().createToolBar();
			this.getWindow().getUserData('container').addAt(this.getBottomToolBarBasic(), 2);
		},

		createBottomToolBarAdvancedModel: function(actions) {
			this.setBottomToolBarAdvanced(new eyeos.ui.toolbar.ToolBar().set({
				height: 60,
				layout: 'custom',
				mode: 'switching',
				iconsPath: this.getIconsPath(),
				items: new genericbar.bottomtoolbar.advanced.Items().getItems(),
				actions: actions,
				header: new eyeos.ui.toolbar.LabelHeader('Text', 'Table')
			}));

			this.getBottomToolBarAdvanced().createToolBar();
		},

		// fix for IE...
		getElementsByClassName: function(cl) {
			var retnode = [];
			var myclass = new RegExp('\\b'+cl+'\\b');
			var elem = document.getElementsByTagName('*');
			for (var i = 0; i < elem.length; i++) {
				var classes = elem[i].className;
				if (myclass.test(classes)) retnode.push(elem[i]);
			}
			return retnode;
		},

		nonEditableAlert: function() {
//			this.addListener('loadCompleted', function() {
//				var optionPane = new eyeos.dialogs.OptionPane(
//					"<b>"+tr("Collaborative feature is not available on Internet Explorer. Do you want to use the classic Documents editor?")+"</b>",
//					eyeos.dialogs.OptionPane.QUESTION_MESSAGE,
//					eyeos.dialogs.OptionPane.OK_CANCEL_OPTION);
//
//					var dialog = optionPane.createDialog(this.getWindow(), "Documents", function(result) {
//						if (result == eyeos.dialogs.OptionPane.OK_OPTION) {
//							// nothing to do here...
//						}
//						else if (result == eyeos.dialogs.OptionPane.CANCEL_OPTION) {
//							this.getWindow().close();
//						}
//					}, this);
//
//					dialog.open();
//			}, this);
		},

		createEditor: function(username, image) {
			// adding tinyMCE to the container...
			this.setTinyMCE(new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
				margin: 5
			}));
			this.getWindow().getUserData('container').add(this.getTinyMCE(), {flex: 1});

			// and once tinyMCE appears on the screen...
			this.getTinyMCE().addListener('appear', function(e) {
				// setting an id to the tinyMCE editor...
				var tinymceId = 'tinymce_editor' + this.getPid();
				e.getCurrentTarget().getContentElement().getDomElement().setAttribute('id', tinymceId);

				// creating a new instance of tinyMCE Editor, with all we need...
				var o = this;
				o.stopListen = 0;
				o.activated = 0;
				
				var plugins = 'table, safari, spellchecker, searchreplace';
				if(!this.isExplorer()) {
					plugins = plugins + ', noneditable';
				} else {
					this.nonEditableAlert();
				}

				var ed = new tinymce.Editor(tinymceId, {
					strict_loading_mode : true,
					theme: 'advanced',
					plugins: plugins,
					spellchecker_languages : '+English=en',
					theme_advanced_buttons1 : "",
					theme_advanced_buttons2 : "",
					theme_advanced_buttons3 : "",
					theme_advanced_buttons3_add : 'tablecontrols',
					noneditable_username : username,
					valid_elements : "@[comment|who|date|id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|"
					+ "onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|"
					+ "onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|"
					+ "name|href|target|title|class|onfocus|onblur],strong/b,em/i,strike,u,"
					+ "#p[id|dir|class|align|style],#ol[type|compact],#ul[type|compact],#li,br,img[longdesc|usemap|"
					+ "src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,"
					+ "-blockquote,-table[border=0|cellspacing|cellpadding|width|frame|rules|"
					+ "height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|"
					+ "height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,"
					+ "#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor"
					+ "|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,"
					+ "-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face"
					+ "|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],"
					+ "object[classid|width|height|codebase|*],param[name|value|_value],embed[type|width"
					+ "|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,"
					+ "button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|"
					+ "valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],"
					+ "input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value],"
					+ "kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],"
					+ "q[cite],samp,select[disabled|multiple|name|size],small,"
					+ "textarea[cols|rows|disabled|name|readonly],tt,var,big",
					preformatted : true,
					fix_table_elements: 0,

					setup : function(ed) {
						var iframe = null;
						// and once the tinyMCE is rendered...
						ed.onPostRender.add(function(ed) {
							iframe = document.getElementById(ed.id+'_ifr');
							
//							// setting initial fontFamily and fontSize...
//							ed.selection.getNode().style.fontFamily = 'Arial';
//							ed.selection.getNode().style.fontSize = '12px';
							
							// firing the tinyCompleted event...
							o.fireEvent('tinyCompleted');

							// removing tinyMCE elements, which are not needed here...
							var editor = document.getElementById(ed.id + '_tbl').firstChild;
							editor.lastChild.style.dispay = 'none';
							
							// setting an id to the iframe container...
							iframe.parentNode.setAttribute('id',ed.id+'_iframeContainer');
							var toBeRemoved = o.getElementsByClassName('mceLast')[1];
							toBeRemoved.parentNode.removeChild(toBeRemoved);

							// loading the table utils...
							(new qx.io.ScriptLoader).load('index.php?extern=js/tinymce/jscripts/tiny_mce/plugins/table/js/table.js');
							
							// if there's any initial File, then we set it, if not
							// we just set the checksum to an empty string...
							if (o.getFilePath()) {
								o.getMenuBar().getActions().setInitialFile(o.getFilePath());
							} else {
								o.getMenuBar().getActions().__currentDoc.checksum = eyeos.application.documents.Utils.crc32('');
							}

							// once finished, we can destroy the splashScreen image...
							image.destroy();

							// adding an event to dinamically resize the tinyMCE, conforming
							// with the bounds of the qooxdoo composite...
							o.getTinyMCE().addListener('resize', function() {
								 var size = this.getTinyMCE().getBounds();
								 var table = document.getElementById('tinymce_editor' + this.getPid() + '_tbl');
								 if(table) {
//									table.style.width = size['width']+'px';
									table.style.height = size['height']+'px';
								 }

								 var iframe = document.getElementById('tinymce_editor' + this.getPid() + '_ifr');
								 if(iframe) {
//									iframe.style.width = size['width']+'px';
									iframe.style.height = size['height']+'px';
								 }
							}, o);
						});

						ed.onKeyPress.add(function(ed) {
							if(!o.stopListen) {
								clearTimeout(this.intervalSend);
								this.intervalSend = setTimeout('eyeos.application.documents.Utils.sendChanges('+o.isExplorer()+','+o.getPid()+',"'+o.getDuid()+'")', 2000);
							}
						}, this);

						ed.onChange.add(function(ed) {
							o.activated = 1;
							if(!o.stopListen) {
								clearTimeout(this.intervalSend);								
								this.intervalSend = setTimeout('eyeos.application.documents.Utils.sendChanges('+o.isExplorer()+','+o.getPid()+',"'+o.getDuid()+'")', 2000);
							}
						}, this);

						ed.onActivate.add(function(ed) {

						});

						var bus = eyeos.messageBus.getInstance();
						bus.addListener('eyeos_documents_change', function(e) {
							applyBusChanges(e, o);
						}, o);

						o.fireEvent('loadCompleted');
					}
				});

				// calling the updating and managing function, which provides
				// a status update for each button which requires it...
				// (like Bold, Italic, etc, which needs to be updated in the GUI,
				// depending on where the caret is placed... )
				var interval = null;
				ed.onNodeChange.add(function(ed, cm, e) {
					if(!o.stopListen) {
						//clearTimeout(this.intervalSend);
						eyeos.application.documents.Utils.sendChanges(o.isExplorer(), o.getPid(),o.getDuid());
					}

					var self = this;
					clearTimeout(interval);
					interval = setTimeout(function() {
						self.getMenuBar().getActions().updateStatus(ed, cm,
							e, self.getBottomToolBarBasic().getNeedAManager(),
							self.getBottomToolBarAdvanced().getNeedAManager(),
							self.getBottomToolBarBasic().getNeedUpdates(),
							self.getBottomToolBarAdvanced().getNeedUpdates()
						);
						
						self.getMenuBar().getActions().updateTopToolBar(e, self.getTopToolBar().getNeedUpdates());
						self.getMenuBar().getActions().syncBulletsAndNumbering(e);
					}, 300);
				}, this);

				// finally, we canr ender the tinyMCE...
				ed.render();
			}, this);
		},

		drawSocialBar: function(name, infoList, imagePath, ratingEnabled, ratingValue, sharedViewers, sharedEditors) {
			if(this.getSocialBar()) {
				this.getSocialBar().destroy();
			}

			this.setSocialBar(new eyeos.socialbar.SocialBar('#F3F3F3').set({
				marginTop: 50,
				marginLeft: 2
			}));

			this.getSocialBar().createDefaultTabs();
			var infoItem = new eyeos.socialbar.Info(name, infoList, imagePath, ratingEnabled, parseInt(ratingValue));

			// InfoBox...
			var infoBox = new eyeos.socialbar.InfoBox(infoItem);
			this.getSocialBar().getTab('Info').addBox(infoBox);

			infoBox.addListener('changeRating', function (e) {
				var params = new Array(this.getFilePath(), e.getData());
				eyeos.callMessage(this.getChecknum(), 'setFileRating', params, function() {
					eyeos.callMessage(this.getChecknum(), 'getFileInfo', this.getFilePath(), function (fileInfo) {
						var file = new eyeos.files.File(fileInfo);
						var index = this.getFilePath().lastIndexOf('/');
						var currentPath = this.getFilePath().substr(0, index);
						eyeos.messageBus.getInstance().send('files', 'update', [currentPath, [file]]);
					}, this);
				}, this);
			}, this);

			// SharedWithBox...
			var sharedWith = new eyeos.socialbar.Shared('document', sharedViewers || [], sharedEditors || []);
			var sharedWithBox = new eyeos.socialbar.SharedWithBox(this._checknum, [sharedWith]);
			this.getSocialBar().getTab('Info').addBox(sharedWithBox);

			sharedWithBox.addListener('changePrivilege', function (e) {
//				console.log('changing privileges...');
				var params = new Array(e.getData()[1], e.getData()[0], this.getFilePath());

				eyeos.callMessage(this.getChecknum(), 'changePrivilege', params, function () {
					eyeos.callMessage(this.getChecknum(), 'getFileInfo', this.getFilePath(), function (fileInfo) {
						var file = new eyeos.files.File(fileInfo);
						var index = this.getFilePath().lastIndexOf('/');
						var currentPath = this.getFilePath().substr(0, index);
						eyeos.messageBus.getInstance().send('files', 'update', [currentPath, [file]]);
					}, this);
				}, this);
			}, this);

			sharedWithBox.addListener('deleteShare', function (e) {
				var params = new Array('Remove', e.getData(), this.getFilePath());
				eyeos.callMessage(this.getChecknum(), 'changePrivilege', params, function () {
					eyeos.callMessage(this.getChecknum(), 'getFileInfo', this.getFilePath(), function (fileInfo) {
						var file = new eyeos.files.File(fileInfo);
						var index = this.getFilePath().lastIndexOf('/');
						var currentPath = this.getFilePath().substr(0, index);
						eyeos.messageBus.getInstance().send('files', 'update', [currentPath, [file]]);
					}, this);
				}, this);
			}, this);

			if(this.getFilePath()) {
				// SharedBox...
				var shared = new eyeos.socialbar.Shared('document', sharedViewers || [], sharedEditors || []);
				var sharedBox = new eyeos.socialbar.SharedBox(this._checknum, [shared]);
				this.getSocialBar().getTab('Share').addBox(sharedBox);

				sharedBox.addListener('changePrivilege', function (e) {
					sharedBox.showLoadingImage(true);
					var params = new Array(e.getData()[1], e.getData()[0], this.getFilePath());

					eyeos.callMessage(this.getChecknum(), 'changePrivilege', params, function () {
						eyeos.callMessage(this.getChecknum(), 'getFileInfo', this.getFilePath(), function (fileInfo) {
							var file = new eyeos.files.File(fileInfo);
							var index = this.getFilePath().lastIndexOf('/');
							var currentPath = this.getFilePath().substr(0, index);
							eyeos.messageBus.getInstance().send('files', 'update', [currentPath, [file]]);
							sharedBox.showLoadingImage(false);

							sharedBox.addListener('showLoadingImageDone', function() {
								this.updateSocialBar(this.getFilePath());
							}, this);
						}, this);
					}, this);
				}, this);

				sharedBox.addListener('deleteShare', function (e) {
					sharedBox.showLoadingImage(true);
					var params = new Array('Remove', e.getData(), this.getFilePath());

					eyeos.callMessage(this.getChecknum(), 'changePrivilege', params, function () {
						eyeos.callMessage(this.getChecknum(), 'getFileInfo', this.getFilePath(), function (fileInfo) {
							var file = new eyeos.files.File(fileInfo);
							var index = this.getFilePath().lastIndexOf('/');
							var currentPath = this.getFilePath().substr(0, index);
							eyeos.messageBus.getInstance().send('files', 'update', [currentPath, [file]]);
							sharedBox.showLoadingImage(false);

							sharedBox.addListener('showLoadingImageDone', function() {
								this.updateSocialBar(this.getFilePath());
							}, this);
						}, this);
					}, this);
				}, this);
			}

			this.getWindow().add(this.getSocialBar());
		},

		createEmptySocialBar: function() {
			if(this.getFilePath()) {
				this.updateSocialBar(this.getFilePath());
			} else {
				var name = 'Untitled Document';
				var infoList = [['Type', 'Text document']];
				var imagePath = 'index.php?extern=images/64x64/actions/document-preview.gif';
				var ratingEnabled = false;
				var ratingValue = 0;
				this.drawSocialBar(name, infoList, imagePath, ratingEnabled, ratingValue, [], []);
			}
		},

		updateSocialBar: function(path) {
			eyeos.callMessage(this.getChecknum(), 'getFileInfo', path, function(info) {
				var name = eyeos.application.documents.Utils.getBasename(path);

				var infoList = [['Type', 'Text document'], ['Size', info.size]];
				if(parseInt(info.created) != 0) {
					infoList.push(['Created', info.created]);
				}

				if(parseInt(info.modified) != 0) {
					infoList.push(['Modified', info.modified]);
				}

				var imagePath = 'index.php?extern=images/64x64/actions/document-preview.gif';
				var ratingEnabled = true;
				var ratingValue = info.rating;
				var sharedViewers = info.viewers;
				var sharedEditors = info.editors;
				this.drawSocialBar(name, infoList, imagePath, ratingEnabled, ratingValue, sharedViewers, sharedEditors);
			}, this);
		}
	}
});

function applyBusChanges(e, self) {
	if(self.isExplorer()) {
		return;
	}

	try {
		var message = e.getData();
		var userId = message['from'];
		var username = eyeos.getCurrentUserData().id;
		if(!self) {
			self = this;
        }
        if(username != userId) {
			var patch = message['data'];
			var patches = dmp.patch_fromText(patch);
			var ed = tinyMCE.get('tinymce_editor' + self.getPid());
			if(ed.blockEx) {
				setTimeout(function() {
					applyBusChanges(e, self);
				},100);
				return;
			}
			//var bm = ed.selection.getBookmark();
			eyeos.application.documents.Utils.sendChanges(self.isExplorer(), self.getPid(),self.getDuid());
			ed.blockEx = 1;
			self.stopListen = 1;

			if(self.activated) {
				var LOCATION_TOKEN = "EYEOS_PLACEHOLDER_TOKEN";
				ed.execCommand('mceInsertContent', false, LOCATION_TOKEN);
			}
			var iframe = document.getElementById(ed.id+'_ifr');
			//iframe.contentWindow.scrollTo(0,bm.scrollY);
			var results = dmp.patch_apply(patches, ed.getContent());
			ed.setContent(results[0], {no_events : 1});
			//iframe.contentWindow.scrollTo(0,bm.scrollY);
			if(self.activated) {
				var ob = new Object();
				ob.getApplication = function () {
					return self;
				};

				var first = 0;
				ob.fireEvent = function(e) {
					first++;
					if(e == "notFound" && first == 1) {
						first = -1;
						eyeos.application.documents.Utils.searchNext(ob, LOCATION_TOKEN, '<span id="eyeosplaceholder"></span>', false, true, 'all');
					}
				};


				eyeos.application.documents.Utils.searchNext(ob, " "+LOCATION_TOKEN, '<span id="eyeosplaceholder"></span>&nbsp;', false, true, 'all');
				var element = iframe.contentDocument.getElementById('eyeosplaceholder');
				element.parentNode.removeChild(element);
			}
			self.stopListen = 0;
			originalContent = ed.getContent();
			ed.blockEx = 0;
			updateSelectors();
			//iframe.contentWindow.scrollTo(0,bm.scrollY);
		}
	} catch (x) {
//		console.log(x);
	}

}