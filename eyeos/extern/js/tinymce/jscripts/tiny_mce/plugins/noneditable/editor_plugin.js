/**
 * Modified noneditable tinymce plugin.
 *
 * (c) eyeOS Project
 * http://eyeos.org
 */

(function() {
	var Event = tinymce.dom.Event;

	tinymce.create('tinymce.plugins.NonEditablePlugin', {
		init : function(ed, url) {
                    //TODO: maybe we need to change this event to prevent
                    //this of executing twice.
                    ed.onLoadContent.add(function(ed, o) {
                    //style tinymce a bit
                    //FIXME: we have to find a better ms value or use a better event!
                        setTimeout(function() {
                            var iframe = document.getElementById(ed.id+'_ifr');

                            //iframe.contentWindow.addEventListener('DOMMouseScroll', wheel, false);

                            iframe.style.width = '750px';
                            iframe.style.margin = '0 auto';
							//TODO: removed custom scrollbar during testing.
                            //iframe.style.overflowY = 'hidden';
                            iframe.style.borderLeft = '1px solid #CCCCCC';
                            iframe.style.borderRight = '1px solid #CCCCCC';
                            iframe.style.paddingLeft = '30px';


                            var nonEditables = ed.dom.select('.mceNonEditable');
                            var position = iframe.contentWindow.scrollY;
                            var i = 0;
                            for(i in nonEditables) {
                                var who = nonEditables[i].className.substr(22);
                                createSelector(who,nonEditables[i]);
                            }

                            document.getElementById(ed.id+'_iframeContainer').style.overflow = 'hidden';
                            document.getElementById(ed.id+'_iframeContainer').style.backgroundColor = '#E9E9E9';

							/*
                            //create the scrollbar
                            var scrollArea = document.createElement('div');
                            scrollArea.setAttribute('id',ed.id+'_scrollArea');
                            scrollArea.style.position = 'absolute';

                            //since we are moving the scrollbar down, according to the design
                            //we need to adjust the height. 5 pixels for the offset, and 5 more
                            //because the scrollbar don't end just at the bottom port, but 5 pixels upper.'
                            scrollArea.style.height = iframe.offsetHeight-10+'px';
                            scrollArea.style.width = '7px';
                            //5px more from top, as in the design
                            scrollArea.style.top = 5+'px';

                            scrollArea.style.backgroundColor = '#BBBBBB';
                            scrollArea.style.border = '1px solid #666';
                            scrollArea.style.overflow = 'hidden';
                            scrollArea.style.MozBorderRadius = '5px';
							scrollArea.style.webkitBorderRadius = '5px';

                            //we have to substract 15 because of 7 for the width of the element, and 8 acording to
                            //design, the scrollbar is not exactly at the right border, but 8 pixels separated to left.
                            scrollArea.style.left = findPosX(document.getElementById(ed.id+'_iframeContainer'))+
                                    document.getElementById(ed.id+'_iframeContainer').offsetWidth-15+'px';

                            var scroller = document.createElement('div');
                            scroller.setAttribute('id',ed.id+'_scroller');
                            scroller.style.position = 'absolute';
                            scroller.style.width = '7px';
                            scroller.style.top = '0px';
                            scroller.style.left = '0px';
                            scroller.style.backgroundColor = '#F7F7F7';
                            scroller.style.MozBorderRadius = '5px';
							scroller.style.webkitBorderRadius = '5px';

                            scrollArea.appendChild(scroller);
                            document.getElementById(ed.id+'_iframeContainer').appendChild(scrollArea);

                            //now, we prepare the scrollbar

                            //first, we get the real height of the thing, we need to go inside the iframe,
                            //because we need the real height of the document! we can, because designMode is on
                            var documentHeight = iframe.contentDocument.body.offsetHeight;

                            //then, we get the height of the container
                            var containerHeight = iframe.offsetHeight;

                            //and the height of the scrollarea
                            var scrollAreaHeight = document.getElementById(ed.id+"_scrollArea").offsetHeight;

                            //we get the ratio between iframe - content and scrollarea - scroller
                            var scrollHeight = (containerHeight * scrollAreaHeight) / documentHeight;

                            if(scrollHeight < 15) {
                                    scrollHeight = 15;
                            }
                            scrollHeight = Math.round(scrollHeight);

                            if(scrollHeight > documentHeight) {
                                scrollHeight = 0;
                            }
                            scroller.style.height = scrollHeight + "px";

                            var s = document.getElementById(ed.id+"_scroller");

                            //we substract 2, to avoid the scroller to get into the rounded border of the scrollarea
                            //if you don't understand why, try to remove the -2, and move the scroller to the bottom part
                            //and look at the bottom rounded border of the scrollarea'
                            var scrollDist = scrollAreaHeight - scrollHeight - 2;
                            Drag.init(s,null,0,0,0,scrollDist);



                            s.onDrag = function (x, y) {
                                    y = Math.max(0,y);
                                    //we calculate the ratio between the bar and the window, we add 20
                                    //because there is some margin that i'm unable to locate, i'll try later
                                    //for the moment 20 hardcoded is ok'
                                    var position = y * (documentHeight - containerHeight + 20) / scrollDist;
                                    iframe.contentWindow.scrollTo(0, position);

                                    updateSelectors();
                                    updateNotePositions();
                            };

                            s.onDragEnd = function (x, y) {
                                    s.onDrag(x,y);
                            };
							*/
                            updateSelectors();
                            drawNotes();
                            //updateNotePositions();

                            ed.interval = setInterval(function() {
                                    updateSelectors();
                                    //updateNotePositions();
                            }, 150, ed);

							ed.intervalPing = setInterval(function() {
								var duid = ed.duid;
                                /*
								var netSync = eyeos.netSync.NetSync.getInstance();
								var message = new eyeos.netSync.Message({
									type: 'documents',
									name: 'ping',
									to: 'document_'+duid,
									data: 'ping'
								});
								netSync.send(message);
                                */
							}, 60000, ed);

                        },500);
                    });

                    t = this;
                    t.editor = ed;
                    nonEditClass = "mceNonEditable";

                    ed.onNodeChange.addToTop(function(ed, cm, n) {
						//TODO: removed scrollbar during testing
						/*
                        if(!document.getElementById(ed.id+'_scrollArea')) {
                            return;
                        }
						*/
                        var last = n;
                        while(n.tagName != 'BODY') {
                            last = n;
                            n = n.parentNode;
                        }
                        n = last;
                        ed.currentTarget = n;
                        var sc, ec;

                        ed.lastObject = n;

                        // Block if start or end is inside a non editable element
                        sc = ed.dom.getParent(ed.selection.getStart(), function(n) {
                                return ed.dom.hasClass(n, nonEditClass);
                        });


                        ec = ed.dom.getParent(ed.selection.getEnd(), function(n) {
                                return ed.dom.hasClass(n, nonEditClass);
                        });

                        var needle = /mceNonEditable [^"]*/mg;
                        var match = ed.selection.getContent().match(needle);

                        var found = false;

                        for(i in match) {
                            if(match[i] == 'mceNonEditable editor_'+ed.getParam('noneditable_username')) {
                                found = true;
                            }
                        }

                        if(found) {
                            sc = true;
                        }

						if(ed.blockEx) {
							return;
						}
                        // Block or unblock
						//var bm = ed.selection.getBookmark();
                        if (sc || ec) {
                                var who = n.className.substr(22);
                                if(who != ed.getParam('noneditable_username')) {
                                    t._setDisabled(1);
                                    return false;
                                } else {
                                    t._setDisabled(0);
                                }
                                addSelector(ed.getParam('noneditable_username'),n);
                                updateSelectors();

                        } else {
                                if(n.tagName != 'BODY') {
                                    addSelector(ed.getParam('noneditable_username'),n);
                                    updateSelectors();
                                }

                                t._setDisabled(0);
                        }
						//var iframe = document.getElementById(ed.id+'_ifr');
						//iframe.contentWindow.scrollTo(0,bm.scrollY);
                    //end of onnodechange
                    });

                    ed.onKeyDown.addToTop(t._check);
                    ed.onKeyPress.addToTop(t._check);
                    ed.onKeyUp.addToTop(t._check);
                    ed.onPaste.addToTop(t._check);
                    ed.onMouseDown.addToTop(t._checkClick);
                //end of init
		},

		getInfo : function() {
			return {
				longname : 'Collaborative non editable elements',
				author : 'eyeOS, based on the original noneditable',
				authorurl : 'http://eyeos.com',
				infourl : 'http://eyeos.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		},

                _checkClick : function(ed, e) {
                    var target = e.originalTarget;
                    if(target.className == 'mceNonEditable') {
                        t._setDisabled(1);
                    }
                },

                //Added this to check if we are deleting, and the next element is non editable
		_check : function(ed, e) {
                        var k = e.keyCode;
                        var current = ed.selection.getStart();
                        var offset = ed.selection.getRng().startOffset;

                        var beforeElement = current.previousElementSibling;
                        if(beforeElement) {
                            if(current.previousElementSibling.className == 'mceNonEditable' && k == 8 && offset == 0) {
                                return Event.cancel(e);
                            }
                        }

		},

		_block : function(ed, e) {
			var k = e.keyCode;

			// Don't block arrow keys, pg up/down, and F1-F12
			if ((k > 32 && k < 41) || (k > 111 && k < 124)) {
                            return;
                        }

                        if(e.type == 'keydown') {
//                            var warnMsg = document.createElement('div');
//                            warnMsg.setAttribute('id', 'warnMsg');
//                            warnMsg.style.backgroundColor = '#C1C1C1';
//                            warnMsg.style.position = 'absolute';
//                            warnMsg.style.width = '60px';
//                            warnMsg.style.height = '60px';
//                            warnMsg.style.fontSize = '50px';
//                            warnMsg.innerHTML = '<center>!</center>';
//                            warnMsg.style.fontFamily = 'Lucida Grande, Verdana, tahoma';
//                            warnMsg.style.fontWeight = 'bold';
//                            warnMsg.style.color = '#333333';
//                            warnMsg.style.MozBorderRadius = '10px';
//                            warnMsg.style.border = '1px solid #333333';
//
//
//                            var iframe = document.getElementById(ed.id+'_ifr');
//                            var position = iframe.contentWindow.scrollY;
//                            //10 margin
//                            warnMsg.style.top = findPosY(ed.currentTarget)+document.getElementById('content_parent').offsetTop-position+81;
//                            //30 = warnMsg width /2
//                            warnMsg.style.left = findPosX(ed.currentTarget)+ed.currentTarget.offsetWidth/2-30+'px';
//                            ed.currentTarget.appendChild(warnMsg);
//
//                            var puff = new qx.fx.effect.combination.Puff(warnMsg);
//                            puff.setModifyDisplay(false);
//
//                            puff.addListener("finish", function(){
//                                warnMsg.parentNode.removeChild(warnMsg);
//                            });
//
//
//
//                            puff.start();
                        }


			return Event.cancel(e);
		},

		_setDisabled : function(s) {
			var t = this, ed = t.editor;

			tinymce.each(ed.controlManager.controls, function(c) {
				c.setDisabled(s);
			});

			if (s !== t.disabled) {
				if (s) {
					ed.onKeyDown.addToTop(t._block);
					ed.onKeyPress.addToTop(t._block);
					ed.onKeyUp.addToTop(t._block);
					ed.onPaste.addToTop(t._block);
				} else {
					ed.onKeyDown.remove(t._block);
					ed.onKeyPress.remove(t._block);
					ed.onKeyUp.remove(t._block);
					ed.onPaste.remove(t._block);
				}

				t.disabled = s;
			}
		}
	});

	// Register plugin
	tinymce.PluginManager.add('noneditable', tinymce.plugins.NonEditablePlugin);
})();

//this two functions get the position of an element recursively
function findPosX(obj) {
        var curleft = 0;
        if (obj.offsetParent) {
                while (1) {
                        curleft+=obj.offsetLeft;
                        if (!obj.offsetParent) {
                                break;
                        }
                        obj=obj.offsetParent;
                }
        } else if (obj.x) {
                curleft+=obj.x;
        }
        return curleft;
}
function findPosY(obj) {
        var curtop = 0;
        if(!obj) {
            return curtop;
        }
        if (obj.offsetParent) {
                while (1) {
                        curtop+=obj.offsetTop;
                        if (!obj.offsetParent) {
                                break;
                        }
                        obj=obj.offsetParent;
                }
        } else if (obj.y) {
                curtop+=obj.y;
        }
        return curtop;
}

//external function to be called from intervals
function updateSelectors() {
		var i = 0;
        var ed = tinyMCE.activeEditor;
        var iframe = document.getElementById(ed.id+'_ifr');
		if(!iframe) {
			return;
		}
        var position = iframe.contentWindow.scrollY;
        var selectorLeft = document.getElementById(ed.id+'_tbl').offsetLeft+iframe.offsetWidth+iframe.offsetLeft+1+'px';

        var nonEditables = tinyMCE.activeEditor.dom.select('.mceNonEditable');

		var validIds = new Array();
		for(i in nonEditables) {
                var who = nonEditables[i].className.substr(22);
                var selector = document.getElementById(ed.id+'_selector_'+who);
				validIds.push(ed.id+'_selector_'+who);
                if(!selector) {
                    selector = addSelector(who, nonEditables[i]);
                }

				if(nonEditables[i].tagName != 'TABLE') {
					nonEditables[i].style.borderTop = '1px solid grey';
					nonEditables[i].style.borderBottom = '1px solid grey';
					//nonEditables[i].style.borderLeft = '7px solid #337722';
					//nonEditables[i].style.MozBorderRadius = '5px';
					//nonEditables[i].style.paddingLeft = '2px';
					if(nonEditables[i].tagName == 'OL' || nonEditables[i].tagName == 'UL') {
						//nonEditables[i].style.marginLeft = '11px';
					} else {
						//nonEditables[i].style.marginLeft = '-8px';
					}
				}



                //the +81 its because the selector its outside the iframe, and are differencies between the coordinates axis.
                //we have to unhardcode this, finding a way to determinate exactly where it comes from, maybe margins, offsets...
                var selectorTop = findPosY(nonEditables[i])-iframe.contentWindow.scrollY;
                //15 is the height of the selector
                if (selectorTop + 15 > document.getElementById(ed.id+'_parent').offsetHeight || selectorTop < 0) {
                        selector.style.display = 'none';
                } else {
                        selector.style.display = 'block';
                }

                selector.style.top = selectorTop+'px';
                selector.style.left = selectorLeft;
        }

		var elements = document.getElementsByClassName('eyeSelectorIndicator');

		if(elements.length > 0) {
			for(i in elements) {
				if(elements[i]) {
					var found = false;
					for(x in validIds) {
						if(elements[i].id == validIds[x]) {
							found = true;
						}
					}
					if(!found && elements[i].id && elements[i].parentNode) {
						if(elements[i])
							elements[i].parentNode.removeChild(elements[i]);
					}
				}
			}
		}

		//TODO: scrollbar removed during testing
        //update scroller height
        //first, we get the real height of the thing, we need to go inside the iframe,
        //because we need the real height of the document! we can, because designMode is on
		/*
        var documentHeight = iframe.contentDocument.body.offsetHeight;

        //then, we get the height of the container
        var containerHeight = iframe.offsetHeight;
        //and the height of the scrollarea
        var scrollAreaHeight = document.getElementById(ed.id+"_scrollArea").offsetHeight;

        //we get the ratio between iframe - content and scrollarea - scroller
        var scrollHeight = (containerHeight * scrollAreaHeight) / documentHeight;

        if(scrollHeight < 15) {
                scrollHeight = 15;
        }

        if(scrollHeight > documentHeight) {
            scrollHeight = 0;
        }

        document.getElementById(ed.id+"_scroller").style.height = Math.round(scrollHeight) + "px";

        var s = document.getElementById(ed.id+"_scroller");

        //we substract 2, to avoid the scroller to get into the rounded border of the scrollarea
        //if you don't understand why, try to remove the -2, and move the scroller to the bottom part
        //and look at the bottom rounded border of the scrollarea'
        var scrollDist = scrollAreaHeight - scrollHeight - 2;
        Drag.init(s,null,0,0,0,scrollDist);

        s.onDrag = function (x, y) {
                y = Math.max(0,y);
                //we calculate the ratio between the bar and the window, we add 20
                //because there is some margin that i'm unable to locate, i'll try later
                //for the moment 20 hardcoded is ok'
                var position = y * (documentHeight - containerHeight + 20) / scrollDist;
                iframe.contentWindow.scrollTo(0, position);

                updateSelectors();
                updateNotePositions();
        }

        s.onDragEnd = function (x, y) {
                s.onDrag(x,y);
        }
		**/
}

function removeSelector(user) {
    if(user == "" || !user) {
        return false;
    }
    var ed = tinyMCE.activeEditor;
    var selector = document.getElementById(ed.id+'_selector_'+user);

    if(selector) {
        selector.parentNode.removeChild(selector);
    }

    var nonEditables = ed.dom.select('.mceNonEditable');

    for(i in nonEditables) {
        var who = nonEditables[i].className.substr(22);

        if(who == user) {
			if(nonEditables[i].tagName != 'TABLE') {
				nonEditables[i].className = '';
				nonEditables[i].style.border = '0px solid black';
				if(nonEditables[i].tagName == 'OL' || nonEditables[i].tagName == 'UL') {
					//nonEditables[i].style.marginLeft = '16px';
				} else {
					//nonEditables[i].style.marginLeft = '0px';
				}

				//nonEditables[i].style.paddingLeft = '0px';
			}
        }
    }
}

function createSelector(user,n) {
    var ed = tinyMCE.activeEditor;
    var iframe = document.getElementById(ed.id+'_ifr');
    //creamos el indicador
    var selector = document.createElement('div');
    selector.style.backgroundColor = '#337722';
    selector.style.width = '60px';
    selector.style.height = '15px';
    selector.style.position = 'absolute';
    selector.style.MozBorderRadius = '6px';
	selector.style.webkitBorderRadius = '6px';

    selector.style.MozBorderRadiusBottomleft = '20px';
    selector.style.MozBorderRadiusTopleft = '0px';

    selector.style.webkitBorderBottomLeftRadius = '20px';
    selector.style.webkitBorderTopLeftRadius = '0px';

    selector.setAttribute('id', ed.id+'_selector_'+user);
	selector.className = 'eyeSelectorIndicator';
    selector.style.paddingLeft = '15px';
    selector.style.paddingBottom = '3px';
    selector.style.fontSize = '11px';
    selector.style.color = '#F7F7F7';
    selector.style.fontFamily = 'Verdana, Lucida Grande';
    selector.style.zIndex = '100';

    //add the name of who is editing the document
    selector.appendChild(document.createTextNode(user));

    //we need to find where the text is in the screen, however, its not enough to use findPosY
    //since we are in a iframe, we need to add the space outside the iframe.
    //we add 4 to arrange it visually.
    var selectorTop = findPosY(n)-iframe.contentWindow.scrollY;
    //we modify the selector, to put it in the calculated top
    selector.style.top = selectorTop+'px';


    //the left position is calculated by the left of the iframe, the left of the container and the width of the iframe
    //+1 for the border of the iframe
    selector.style.left = document.getElementById(ed.id+'_tbl').offsetLeft+iframe.offsetWidth+iframe.offsetLeft+1+'px';

    //if selectorTop is larger then the end of the editor, we hide it
    //15 here is the height of the selector
    if(selectorTop + 15 > document.getElementById(ed.id+'_parent').offsetHeight || selectorTop < 0) {
            selector.style.display = 'none';
    }

    document.getElementById(ed.id+'_iframeContainer').appendChild(selector);
    return selector;
}

function addSelector(user,n) {
    removeSelector(user);
    n.className = 'mceNonEditable editor_'+user;
    if(n == n.parentNode.lastChild) {
        var parag = document.createElement('p');
        parag.innerHTML = '';
        n.parentNode.appendChild(parag);
    }
    return createSelector(user,n);
}

function switchToTop(note, notes) {
    var ed = tinyMCE.activeEditor;
    var iframe = document.getElementById(ed.id+'_ifr');
    var position = iframe.contentWindow.scrollY;
    note.setAttribute('direction','top');
    var noteTop = findPosY(notes)+document.getElementById(ed.id+'_parent').offsetTop-position+81;
    note.style.top = noteTop+'px';
}

function switchToBottom(note, notes) {
    var ed = tinyMCE.activeEditor;
    var iframe = document.getElementById(ed.id+'_ifr');
    var position = iframe.contentWindow.scrollY;
    note.setAttribute('direction','bottom');
    var noteTop = findPosY(notes)+document.getElementById(ed.id+'_parent').offsetTop-position+82;
    note.style.top = noteTop-note.offsetHeight+'px';
}


function updateNotePositions() {
    var ed = tinyMCE.activeEditor;
    var iframe = document.getElementById(ed.id+'_ifr');
	if(!iframe) {
		return;
	}
    var notes = tinyMCE.activeEditor.dom.select('.mceComment');
    var blockSize = 100;
    var realHeight = iframe.contentDocument.body.offsetHeight;
    var numblocks = Math.ceil(realHeight / blockSize);
    var i = 0;

    var screenNotesDraw = new Object();

    for(i in notes) {
        var top = notes[i].offsetTop;

        var assignedBlock = Math.floor(top / blockSize);
        screenNotesDraw['note_'+notes[i].getAttribute('comment')] = 1;
        var noteBody = document.getElementById('note_'+notes[i].getAttribute('comment'));
        if(noteBody) {
            if(noteBody.parentNode.getAttribute('id') != ed.id+'_block_'+assignedBlock) {
                var newParent = document.getElementById(ed.id+'_block_'+assignedBlock);
                if(newParent) {
                    noteBody.parentNode.removeChild(noteBody);
                    newParent.appendChild(noteBody);
                }
            }
        }
    }

    var screenNotes = document.getElementsByClassName(ed.id+'_userNote');

    for(i=0;i < screenNotes.length;i++) {
        if(parseInt(screenNotesDraw[screenNotes[i].id]) != 1) {
            screenNotes[i].parentNode.removeChild(screenNotes[i]);
        }
    }

    var noteContainer = document.getElementById(ed.id+'_noteContainer');
    if(noteContainer.childNodes.length < numblocks) {
        for(i=0;i<numblocks;i++) {
            if(!document.getElementById(ed.id+'_block_'+i)) {
                var block = document.createElement('div');
                block.style.minHeight = blockSize+'px';
                block.style.width = noteContainer.offsetWidth;
                block.setAttribute('id', ed.id+'_block_'+i);

                noteContainer.appendChild(block);
            }
        }
    } else if(noteContainer.childNodes.length > numblocks) {
        while(noteContainer.childNodes.length > numblocks) {
            if(noteContainer.lastChild.childNodes.length != 0) {
                return;
            }
            noteContainer.removeChild(noteContainer.lastChild);
        }
    }
}

function hideComments() {
    var ed = tinyMCE.activeEditor;
    var container = document.getElementById(ed.id+'_noteContainer');
    if(container) {
        container.style.visibility = 'hidden';
        var notes = tinyMCE.activeEditor.dom.select('.mceComment');
        for(i in notes) {
            var note = notes[i];
            note.style.background = '#FFFFFF';
        }
    }
}

function showComments() {
    var ed = tinyMCE.activeEditor;
    var container = document.getElementById(ed.id+'_noteContainer');
    if(container) {
        container.style.visibility = 'visible';
        var notes = tinyMCE.activeEditor.dom.select('.mceComment');
        for(i in notes) {
            var note = notes[i];
            note.style.background = '#F6F5AA';
        }
    }
}

function drawNotes() {
    var ed = tinyMCE.activeEditor;
    var iframe = document.getElementById(ed.id+'_ifr');
    var notes = tinyMCE.activeEditor.dom.select('.mceComment');

    //positions of the grey container
    var positionY = 0;
    var positionX = 0;
    //we can calculate the width of the container by checking where the iframe starts
    //and substracting where the grey container starts.
    var width = findPosX(document.getElementById(ed.id+'_ifr'))-positionX;
    if(width > 250) {
        width = 250;
    } else {
        width = 155;
    }

    var height = document.getElementById(ed.id+'_iframeContainer').offsetHeight;

    var noteContainer = document.createElement('div');
    noteContainer.setAttribute('id',ed.id+'_noteContainer');
    noteContainer.style.top = positionY+'px';
    noteContainer.style.left = positionX+'px';
    noteContainer.style.position = 'absolute';
    noteContainer.style.width = width+'px';
    noteContainer.style.height = height+'px';
    noteContainer.style.overflow = 'hidden';
    noteContainer.style.marginTop = '15px';

    document.getElementById(ed.id+'_iframeContainer').appendChild(noteContainer);

    var realHeight = iframe.contentDocument.body.offsetHeight;
    var blockSize = 100;

    var numblocks = Math.ceil(realHeight / blockSize);

    var i = 0;

    for(i=0;i<numblocks;i++) {
       var block = document.createElement('div');
       block.style.minHeight = blockSize+'px';
       block.style.width = noteContainer.offsetWidth;
       block.setAttribute('id', ed.id+'_block_'+i);

       noteContainer.appendChild(block);
    }

    for(i in notes) {
        var note = notes[i];
        var noteNumber = notes[i].getAttribute('comment');

        note.style.background = '#F6F5AA';

        var noteBody = document.createElement('div');
        noteBody.style.width = width-20+'px';
        noteBody.style.backgroundColor = '#F4EF6E';
        noteBody.style.border = '1px solid #C88B00';
        noteBody.style.margin = '5px';
        noteBody.style.marginRight = '10px';
        noteBody.setAttribute('id','note_'+noteNumber);
        noteBody.className =  ed.id+'_userNote';

        var top = notes[i].offsetTop;

        var assignedBlock = Math.round(top / blockSize);

        document.getElementById(ed.id+'_block_'+assignedBlock).appendChild(noteBody);

        //paint the tittle
        var title = document.createElement('div');
        title.style.cursor = 'Pointer';

        //paint the fold/unfold button
        var img = document.createElement('img');
        img.setAttribute('src','index.php?extern=images/minus.png');
        img.style.cssFloat = 'right';
        img.style.marginTop = '0px';
        img.style.display = 'none';

        title.appendChild(img);
        title.appendChild(document.createTextNode('Comment '+noteNumber));
        title.style.fontSize = '10px';
        title.style.fontFamily = 'Verdana';
        title.style.fontWeight = 'bold';
        title.style.padding = '3px';
        title.style.borderBottom = '0px solid #D1B72E';

        noteBody.appendChild(title);

        var noteContent = document.createElement('div');
        noteContent.style.display = 'none';

        title.img = img;
        title.onclick = function(e) {
            this.nextSibling.style.display = 'block';
            this.img.style.display = 'block';
            e.preventDefault();
            if (!e) var e = window.event
            // handle event
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();

        }
        img.style.cursor = 'Pointer';
        img.onclick = function(e) {
            this.parentNode.nextSibling.style.display = 'none';
            this.style.display = 'none';
            if (!e) var e = window.event
            // handle event
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        }

        noteBody.appendChild(noteContent);

        var noteMessages = document.createElement('div');
        noteMessages.setAttribute('id','noteMessages_'+noteNumber);
        var noteControls = document.createElement('div');
        noteControls.setAttribute('id','noteControls_'+noteNumber);
        noteContent.appendChild(noteMessages);
        noteContent.appendChild(noteControls);

        fillNote(noteNumber);

        var writeArea = document.createElement('div');
        noteControls.appendChild(writeArea);

        //now, fill the noteContent with the textarea
        var tarea = document.createElement('textarea');
        tarea.style.width = noteBody.offsetWidth-2+'px';
        tarea.style.height = '40px';
        tarea.style.borderTop = '1px solid #D2B721';
        tarea.style.backgroundColor = '#F8F7BB';
        writeArea.appendChild(tarea);

        //put the 'send' button

        var sendArea = document.createElement('div');
        sendArea.style.textAlign = 'right';
        noteControls.appendChild(sendArea);

        var sendButton = document.createElement('input');
        sendButton.setAttribute('type','submit');
        sendButton.setAttribute('value','write');
        sendButton.style.border = '1px solid #717377';
        sendButton.style.backgroundColor = '#F3F3F3';
        sendButton.style.MozBorderRadius = '2';
		sendButton.style.webkitBorderRadius = '2';
        sendButton.style.margin = '5px';
        sendButton.style.right = '0px';

        sendButton.textarea = tarea;
        sendButton.noteContent = noteContent;
        sendButton.noteNumber = noteNumber;

        sendButton.onclick = function(e) {
            var text = this.textarea.value;
            this.textarea.value = '';
            var noteData = iframe.contentDocument.getElementById('noteData_'+this.noteNumber);

            if(noteData) {
                var now = new Date();
                now = now.getTime();
                var comment = document.createElement('input');
                comment.setAttribute('type','hidden');
                comment.setAttribute('who', ed.getParam('noneditable_username'));
                comment.setAttribute('date',now);
                comment.value = Base64.encode(text);

                noteData.appendChild(comment);

                fillNote(this.noteNumber, this.noteContent);
            }
        }

        sendArea.appendChild(sendButton);

    }
}

function fillNote(noteNumber) {
    var ed = tinyMCE.activeEditor;
    var noteMessages = document.getElementById('noteMessages_'+noteNumber);
    noteMessages.innerHTML = '';
    var iframe = document.getElementById(ed.id+'_ifr');
    var noteData = iframe.contentDocument.getElementById('noteData_'+noteNumber);

    if(noteData) {
        for(i in noteData.childNodes) {
            if(typeof noteData.childNodes[i].getAttribute == 'function') {
                if(noteData.childNodes[i].getAttribute('type') == 'hidden') {
                    var who = noteData.childNodes[i].getAttribute('who');
                    var myDate = new Date(parseInt(noteData.childNodes[i].getAttribute('date')));

                    var now = new Date();

                    var month = myDate.getMonth()+1;
                    if(myDate.getMonth() == now.getMonth() && myDate.getFullYear() == now.getFullYear() &&
                        myDate.getDate() && now.getDate()) {
                        var showDate = 'Today';
                    } else {
                        var showDate = myDate.getDate()+'/'+month+'/'+myDate.getFullYear();
                    }

                    var showTime = myDate.getHours()+':'+myDate.getMinutes();

                    var commentContainer = document.createElement('div');
                    noteMessages.appendChild(commentContainer);

                    var dataHeader = document.createElement('div');
                    dataHeader.style.fontSize = '10px';
                    dataHeader.style.fontFamily = 'Verdana';
                    dataHeader.style.fontWeight = 'bold';
                    dataHeader.style.padding = '3px';

                    var img = document.createElement('img');
                    img.setAttribute('src','images/del.png');
                    img.style.cssFloat = 'right';
                    img.style.marginTop = '2px';
                    img.style.display = 'none';

                    dataHeader.appendChild(img);

                    dataHeader.appendChild(document.createTextNode(who+': '+showDate + ', ' + showTime));

                    commentContainer.img = img;

                    if(who == ed.getParam('noneditable_username')) {
                        commentContainer.onmouseover = function(e) {
                            commentContainer.img.style.display = ed.id+'_block';
                        }

                        commentContainer.onmouseout = function(e) {
                            commentContainer.img.style.display = 'none';
                        }
                    }


                    var dataBody = document.createElement('div');
                    dataBody.style.fontSize = '10px';
                    dataBody.style.fontFamily = 'Verdana';
                    dataBody.style.padding = '3px';
                    dataBody.appendChild(document.createTextNode(Base64.decode(noteData.childNodes[i].value)));

                    commentContainer.appendChild(dataHeader);
                    commentContainer.appendChild(dataBody);
                }
            }
        }
    }
}


/*
 * mouse wheel handling
 */

function wheel(event){
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
                /** In Opera 9, delta differs in sign as compared to IE.
                 */
                if (window.opera)
                        delta = -delta;
        } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta)
                handle(delta);
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault)
                event.preventDefault();
	event.returnValue = false;
}

function handle(delta) {
        var ed = tinyMCE.activeEditor;
        var iframe = document.getElementById(ed.id+'_ifr');

        if (delta < 0) {
             iframe.contentWindow.scrollBy(0,40);
             document.getElementById(ed.id+'_noteContainer').scrollTop = iframe.contentWindow.scrollY;
        } else {
             iframe.contentWindow.scrollBy(0,-40);
             document.getElementById(ed.id+'_noteContainer').scrollTop = iframe.contentWindow.scrollY;
        }
        updateSelectors();
        updateNotePositions();

        var y = iframe.contentWindow.scrollY;


        var scrollAreaHeight = document.getElementById(ed.id+"_scrollArea").offsetHeight;
        var scrollHeight = document.getElementById(ed.id+'_scroller').style.height.substr(0,document.getElementById(ed.id+'_scroller').style.height.length-2);
        var scrollDist = scrollAreaHeight - scrollHeight - 2;
        var documentHeight = iframe.contentDocument.body.offsetHeight
        var containerHeight = iframe.offsetHeight;

        //we calculate the ratio between the bar and the window, we add 20
        //because there is some margin that i'm unable to locate, i'll try later
        //for the moment 20 hardcoded is ok'
        var position = y * scrollDist / (documentHeight - containerHeight + 20) ;
        document.getElementById(ed.id+'_scroller').style.top = position + 'px';


  }

  /**************************************************
 * dom-drag.js
 * 09.25.2001
 * www.youngpup.net
 **************************************************
 * 10.28.2001 - fixed minor bug where events
 * sometimes fired off the handle, not the root.
 *
 * Copyright 2001, Aaron Boodman
 *   This code is public domain. Please use it for good, not evil.
 *
 **************************************************/

//eyeos note: this code is absolutely public domain, as stated by the author.
//its easy to replace it for another lgpl or bsd library, or create our own, but
//its ok to use it for the moment.

var Drag = {

	obj : null,

	init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
	{
		o.onmousedown	= Drag.start;

		o.hmode			= bSwapHorzRef ? false : true ;
		o.vmode			= bSwapVertRef ? false : true ;

		o.root = oRoot && oRoot != null ? oRoot : o ;

		if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) o.root.style.left   = "0px";
		if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) o.root.style.top    = "0px";
		if (!o.hmode && isNaN(parseInt(o.root.style.right ))) o.root.style.right  = "0px";
		if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) o.root.style.bottom = "0px";

		o.minX	= typeof minX != 'undefined' ? minX : null;
		o.minY	= typeof minY != 'undefined' ? minY : null;
		o.maxX	= typeof maxX != 'undefined' ? maxX : null;
		o.maxY	= typeof maxY != 'undefined' ? maxY : null;

		o.xMapper = fXMapper ? fXMapper : null;
		o.yMapper = fYMapper ? fYMapper : null;

		o.root.onDragStart	= new Function();
		o.root.onDragEnd	= new Function();
		o.root.onDrag		= new Function();
	},

	start : function(e)
	{
		var o = Drag.obj = this;
		e = Drag.fixE(e);
		var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
		o.root.onDragStart(x, y);

		o.lastMouseX	= e.clientX;
		o.lastMouseY	= e.clientY;

		if (o.hmode) {
			if (o.minX != null)	o.minMouseX	= e.clientX - x + o.minX;
			if (o.maxX != null)	o.maxMouseX	= o.minMouseX + o.maxX - o.minX;
		} else {
			if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
			if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
		}

		if (o.vmode) {
			if (o.minY != null)	o.minMouseY	= e.clientY - y + o.minY;
			if (o.maxY != null)	o.maxMouseY	= o.minMouseY + o.maxY - o.minY;
		} else {
			if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
			if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
		}

		document.onmousemove	= Drag.drag;
		document.onmouseup		= Drag.end;

		return false;
	},

	drag : function(e)
	{
		e = Drag.fixE(e);
		var o = Drag.obj;

		var ey	= e.clientY;
		var ex	= e.clientX;
		var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
		var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
		var nx, ny;

		if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
		if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
		if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
		if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

		nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
		ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

		if (o.xMapper)		nx = o.xMapper(y)
		else if (o.yMapper)	ny = o.yMapper(x)

		Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
		Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
		Drag.obj.lastMouseX	= ex;
		Drag.obj.lastMouseY	= ey;

		Drag.obj.root.onDrag(nx, ny);
		return false;
	},

	end : function()
	{
		document.onmousemove = null;
		document.onmouseup   = null;
		Drag.obj.root.onDragEnd(	parseInt(Drag.obj.root.style[Drag.obj.hmode ? "left" : "right"]),
									parseInt(Drag.obj.root.style[Drag.obj.vmode ? "top" : "bottom"]));
		Drag.obj = null;
	},

	fixE : function(e)
	{
		if (typeof e == 'undefined') e = window.event;
		if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
		if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
		return e;
	}
};

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var Base64 = {

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		input = Base64._utf8_encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Base64._utf8_decode(output);

		return output;

	},

	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	}

}
