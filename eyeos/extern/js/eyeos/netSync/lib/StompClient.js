/**
 * The contents of this file are subject to the Common Public Attribution 
 * License Version 1.0 (the "License"); you may not use this file except 
 * in compliance with the License. You may obtain a copy of the License 
 * at http://www.kaazing.org/CPAL.
 * 
 * The License is based on the Mozilla Public License Version 1.1 but 
 * Sections 14 and 15 have been added to cover use of software over a 
 * computer network and provide for limited attribution for the Original 
 * Developer.
 * 
 * In addition, Exhibit A has been modified to be consistent with Exhibit B.
 * 
 * Software distributed under the License is distributed on an "AS IS" 
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See 
 * the License for the specific language governing rights and limitations 
 * under the License.
 * 
 * The Original Code is Kaazing Gateway. The Initial Developer of the 
 * Original Code is Kaazing Corporation.
 *  
 * All portions of the code written by Kaazing Corporation are 
 * Copyright (c) 2007-2009 Kaazing Corporation. All Rights Reserved.
 */

function StompClient(){
};
(function(){
var _1=StompClient.prototype;
_1.onopen=function(_2){
};
_1.onmessage=function(_3,_4){
};
_1.onreceipt=function(_5){
};
_1.onerror=function(_6,_7){
};
_1.onclosed=function(){
};
_1.connect=function(_8,_9){
var _a=this;
_9=_9||{};
var _b=new ByteSocket(_8);
_b.onopen=function(){
if(typeof (_9.resolve)!="function"){
_writeFrame(_a,"CONNECT",{"login":_9.username,"passcode":_9.password});
}else{
_9.resolve(function(_c){
_writeFrame(_a,"CONNECT",{"login":_c.username,"passcode":_c.password});
});
}
};
_b.onmessage=function(_d){
_readFragment(_a,_d);
};
_b.onclosed=function(_e){
_a.onclosed();
};
_a._socket=_b;
_a._buffer=new ByteBuffer();
};
_1.disconnect=function(){
_writeFrame(this,"DISCONNECT",{});
};
_1.send=function(_f,_10,_11,_12,_13){
var _14=_13||{};
_14.destination=_10;
_14.transaction=_11;
_14.receipt=_12;
_writeFrame(this,"SEND",_14,_f);
};
_1.subscribe=function(_15,_16,_17,_18){
var _19=_18||{};
_19.destination=_15;
_19.ack=_16;
_19.receipt=_17;
_writeFrame(this,"SUBSCRIBE",_19);
};
_1.unsubscribe=function(_1a,_1b,_1c){
var _1d=_1c||{};
_1d.destination=_1a;
_1d.receipt=_1b;
_writeFrame(this,"UNSUBSCRIBE",_1d);
};
_1.begin=function(id,_1f,_20){
var _21=_20||{};
_21.transaction=id;
_21.receipt=_1f;
_writeFrame(this,"BEGIN",_21);
};
_1.commit=function(id,_23,_24){
var _25=_24||{};
_25.transaction=id;
_25.receipt=_23;
_writeFrame(this,"COMMIT",_25);
};
_1.abort=function(id,_27,_28){
var _29=_28||{};
_29.transaction=id;
_29.receipt=_27;
_writeFrame(this,"ABORT",_29);
};
_1.ack=function(_2a,_2b,_2c,_2d){
var _2e=_2d||{};
_2e["message-id"]=_2a;
_2e.transaction=_2b;
_2e.receipt=_2c;
_writeFrame(this,"ACK",_2e);
};
function _readFragment(_2f,evt){
var _31=_2f._buffer;
_31.skip(_31.remaining());
_31.putBuffer(evt.data);
_31.flip();
outer:
while(_31.hasRemaining()){
var _32={headers:{}};
if(_31.getAt(_31.position)==_33){
_31.skip(1);
}
_31.mark();
var _34=_31.indexOf(_33);
if(_34==-1){
_31.reset();
break;
}
var _35=_31.limit;
_31.limit=_34;
_32.command=_31.getString(Charset.UTF8);
_31.skip(1);
_31.limit=_35;
while(true){
var _36=_31.indexOf(_33);
if(_36==-1){
_31.reset();
break outer;
}
if(_36>_31.position){
var _35=_31.limit;
_31.limit=_36;
var _37=_31.getString(Charset.UTF8);
_31.limit=_35;
var _38=_37.search(":");
_32.headers[_37.slice(0,_38)]=_37.slice(_38+1);
_31.skip(1);
}else{
_31.skip(1);
var _39=Number(_32.headers["content-length"]);
var _3a=(_32.headers["content-type"]||"").split(/;\s?charset=/);
if(_32.command!="ERROR"&&!isNaN(_39)&&_3a[0]!="text/plain"){
if(_31.remaining()<_39+1){
_31.reset();
break outer;
}
var _35=_31.limit;
_31.limit=_31.position+_39;
_32.body=_31.slice();
_31.limit=_35;
_31.skip(_39);
if(_31.hasRemaining()){
_31.skip(1);
}
}else{
var _3b=_31.indexOf(_3c);
if(_3b==-1){
_31.reset();
break outer;
}
var _3d=(_3a[1]||"utf-8").toLowerCase();
if(_3d!="utf-8"&&_3d!="us-ascii"){
throw new Error("Unsupported character set: "+_3d);
}
_32.body=_31.getString(Charset.UTF8);
}
switch(_32.command){
case "CONNECTED":
_2f.onopen(_32.headers);
break;
case "MESSAGE":
_2f.onmessage(_32.headers,_32.body);
break;
case "RECEIPT":
_2f.onreceipt(_32.headers);
break;
case "ERROR":
_2f.onerror(_32.headers,_32.body);
break;
default:
throw new Error("Unrecognized STOMP command '"+_32.command+"'");
}
break;
}
}
}
_31.compact();
};
function _writeFrame(_3e,_3f,_40,_41){
var _42=new ByteBuffer();
_42.putString(_3f,_43);
_42.put(_33);
for(var key in _40){
var _45=_40[key];
if(typeof (_45)=="string"){
_42.putString(key,_43);
_42.put(_46);
_42.putString(_45,_43);
_42.put(_33);
}
}
if(_41&&typeof (_41.remaining)=="function"){
_42.putString("content-length",_43);
_42.put(_46);
_42.put(_47);
_42.putString(String(_41.remaining()),_43);
_42.put(_33);
}
_42.put(_33);
switch(typeof (_41)){
case "string":
_42.putString(_41,_43);
break;
case "object":
_42.putBuffer(_41);
break;
}
_42.put(_3c);
_42.flip();
_3e._socket.postMessage(_42);
};
var _3c=0;
var _33=10;
var _46=58;
var _47=32;
var _43=Charset.UTF8;
})();
