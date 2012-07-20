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

qx.Class.define('eyeos.application.documents.Utils', {
	statics: {
		utf8_encode: function(argString) {
			var string = (argString+'');

			var utftext = "";
			var start, end;
			var stringl = 0;

			start = end = 0;
			stringl = string.length;
			for (var n = 0; n < stringl; n++) {
				var c1 = string.charCodeAt(n);
				var enc = null;

				if (c1 < 128) {
					end++;
				} else if (c1 > 127 && c1 < 2048) {
					enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
				} else {
					enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
				}
				if (enc !== null) {
					if (end > start) {
						utftext += string.substring(start, end);
					}
					utftext += enc;
					start = end = n+1;
				}
			}

			if (end > start) {
				utftext += string.substring(start, string.length);
			}

			return utftext;
		},

		crc32: function(str) {
			str = this.utf8_encode(str);
			var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F\n\
								 E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988\n\
								 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2\n\
								 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7\n\
								 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9\n\
								 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172\n\
								 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C\n\
								 DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59\n\
								 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423\n\
								 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924\n\
								 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106\n\
								 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433\n\
								 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D\n\
								 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E\n\
								 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950\n\
								 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65\n\
								 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7\n\
								 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0\n\
								 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA\n\
								 BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F\n\
								 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81\n\
								 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A\n\
								 EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84\n\
								 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1\n\
								 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB\n\
								 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC\n\
								 F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E\n\
								 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B\n\
								 D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55\n\
								 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236\n\
								 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28\n\
								 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D\n\
								 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F\n\
								 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38\n\
								 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242\n\
								 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777\n\
								 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69\n\
								 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2\n\
								 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC\n\
								 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9\n\
								 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693\n\
								 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94\n\
								 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

			var crc = 0;
			var x = 0;
			var y = 0;

			crc = crc ^ (-1);
			for (var i = 0, iTop = str.length; i < iTop; i++) {
				y = ( crc ^ str.charCodeAt( i ) ) & 0xFF;
				x = "0x" + table.substr( y * 9, 8 );
				crc = ( crc >>> 8 ) ^ x;
			}

			return crc ^ (-1);
		},

		getBasename: function(path, suffix) {
			var b = path.replace(/^.*[\/\\]/g, '');
			if (typeof(suffix) == 'string' && b.substr(b.length-suffix.length) == suffix) {
				b = b.substr(0, b.length-suffix.length);
			}

			return b;
		},

		sendChanges: function(isExplorer, pid, duid) {
			if(isExplorer) {
				return;
			}

			var ed = tinyMCE.get('tinymce_editor' + pid);
			if(ed.blockEx) {
				setTimeout('eyeos.application.documents.Utils.sendChanges('+pid+',"'+duid+'")',200);
				return;
			}
			ed.blockEx = 1;
			//get the editor contents
			var newContent = ed.getContent();

			var diff = dmp.diff_main(originalContent, newContent, true);

			if (diff.length > 2) {
				dmp.diff_cleanupSemantic(diff);
			}

			var patch_list = dmp.patch_make(originalContent, newContent, diff);

			var patch_text = dmp.patch_toText(patch_list);
			originalContent = newContent;
	
			//we have the patch text, send it to the server!!
			if(patch_text) {
//				console.log(patch_text);
				//if there is a change...
				var netSync = eyeos.netSync.NetSync.getInstance();
				var message = new eyeos.netSync.Message({
					type: 'documents',
					name: 'change',
					to: 'document_'+duid,
					data: patch_text
				});
				netSync.send(message);
			}
			ed.blockEx = 0;
		},

		getChanges: function(pid, checknum, path) {
//			eyeos.callMessage(checknum, 'getChanges', path, function(patch) {
//				if(patch) {
//					patch = Base64.decode(patch);
//					var patches = dmp.patch_fromText(patch);
//					var ed = tinyMCE.get('tinymce_editor' + pid);
//					var results = dmp.patch_apply(patches, ed.getContent());
//					var mceBM = ed.selection.getBookmark();
//					ed.setContent(results[0], {
//						no_events : 1
//					});
//					ed.selection.moveToBookmark(mceBM);
//					results = dmp.patch_apply(patches, originalContent);
//					originalContent = results[0];
//				}
//			});
		},

		titleCase: function (title) {
			var small = "(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|v[.]?|via|vs[.]?)";
			var punct = "([!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]*)";
			var parts = [], split = /[:.;?!] |(?: |^)["Ò]/g, index = 0;

			title = lower(title);
			while (true) {
				var m = split.exec(title);
				parts.push( title.substring(index, m ? m.index : title.length)
					.replace(/\b([A-Za-z][a-z.'Õ]*)\b/g, function(all){
						return /[A-Za-z]\.[A-Za-z]/.test(all) ? all : upper(all);
					})
					.replace(RegExp("\\b" + small + "\\b", "ig"), lower)
					.replace(RegExp("^" + punct + small + "\\b", "ig"), function(all, punct, word){
						return punct + upper(word);
					})
					.replace(RegExp("\\b" + small + punct + "$", "ig"), upper));

				index = split.lastIndex;

				if ( m ) parts.push( m[0] );
				else break;
			}

			return parts.join("").replace(/ V(s?)\. /ig, " v$1. ")
			.replace(/(['Õ])S\b/ig, "$1s")
			.replace(/\b(AT&T|Q&A)\b/ig, function(all){
				return all.toUpperCase();
			});

			function lower(word){
				return word.toLowerCase();
			}

			function upper(word){
				return word.substr(0,1).toUpperCase() + word.substr(1);
			}
		},

		searchNext : function(object, searchText, replaceText, previousOrNext, ca, a) {
			var ed = tinyMCE.getInstanceById('tinymce_editor' + object.getApplication().getPid());
			var se = ed.selection, r = se.getRng();
			var fl = 0, w = ed.getWin(), fo = 0;
			
			var s = searchText;
			var b = previousOrNext; // false = next, true = previous
			var ca = ca; // false = case-insensitive, true = case-sensitive
			var rs = replaceText;

			if (s == '')
				return;

			function fix() {
				// Correct Firefox graphics glitches
				r = se.getRng().cloneRange();
				ed.getDoc().execCommand('SelectAll', false, null);
				se.setRng(r);
			};

			function replace() {
				if (tinymce.isIE)
					ed.selection.getRng().duplicate().pasteHTML(rs); // Needs to be duplicated due to selection bug in IE
				else
					ed.getDoc().execCommand('InsertHTML', false, rs);
			};

			// IE flags
			if (ca)
				fl = fl | 4;

			switch (a) {
				case 'all':
					ed.execCommand('SelectAll');
					ed.selection.collapse(true);

					if (tinymce.isIE) {
						while (r.findText(s, b ? -1 : 1, fl)) {
							r.scrollIntoView();
							r.select();
							replace();
							fo = 1;
						}

//						tinyMCEPopup.storeSelection(); // FIXME: maybe we need it in explorer, but tinyMCEPopup seems it's not working...
					} else {
						while (w.find(s, ca, b, false, false, false, false)) {
							replace();
							fo = 1;
						}
					}
	
				if (fo)
						object.fireEvent('allReplaced');
					else
						object.fireEvent('notFound');

					return;

				case 'current':
					if (!ed.selection.isCollapsed())
						replace();

					break;
			}

			se.collapse(b);
			r = se.getRng();

			if (!s)
				return;

			if (tinymce.isIE) {
				if (r.findText(s, b ? -1 : 1, fl)) {
					r.scrollIntoView();
					r.select();
				} else
					object.fireEvent('notFound');

//				tinyMCEPopup.storeSelection(); // FIXME: maybe we need it in explorer, but tinyMCEPopup seems it's not working...
			} else {
				if (!w.find(s, ca, b, false, false, false, false))
					object.fireEvent('notFound');
				else
					fix();
			}
		}
	}
});
