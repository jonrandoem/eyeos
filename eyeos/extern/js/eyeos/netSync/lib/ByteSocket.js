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

var browser=null;
if(typeof (ActiveXObject)!="undefined"){
browser="ie";
}else{
if(typeof (window.addEventStream)==="function" || typeof window.opera === 'object'){
browser="opera";
}else{
if(typeof navigator.vendor === 'string' && navigator.vendor.indexOf("Apple")!=-1){
browser="safari";
}else{
if(typeof navigator.vendor === 'string' && navigator.vendor.indexOf("Google")!=-1){
browser="chrome";
}else{
if(navigator.product=="Gecko"&&window.find&&!navigator.savePreferences){
browser="firefox";
}else{
throw new Error("couldn't detect browser");
}
}
}
}
}
(function(){
Base64={};
Base64.encode=function(_1){
var _2=[];
var _3;
var _4;
var _5;
while(_1.length){
switch(_1.length){
case 1:
_3=_1.shift();
_2.push(_6[(_3>>2)&63]);
_2.push(_6[((_3<<4)&48)]);
_2.push("=");
_2.push("=");
break;
case 2:
_3=_1.shift();
_4=_1.shift();
_2.push(_6[(_3>>2)&63]);
_2.push(_6[((_3<<4)&48)|((_4>>4)&15)]);
_2.push(_6[(_4<<2)&60]);
_2.push("=");
break;
default:
_3=_1.shift();
_4=_1.shift();
_5=_1.shift();
_2.push(_6[(_3>>2)&63]);
_2.push(_6[((_3<<4)&48)|((_4>>4)&15)]);
_2.push(_6[((_4<<2)&60)|((_5>>6)&3)]);
_2.push(_6[_5&63]);
break;
}
}
return _2.join("");
};
Base64.decode=function(_7){
if(_7.length===0){
return [];
}
if(_7.length%4!==0){
throw new Error("Invalid base64 string (must be quads)");
}
var _8=[];
for(var i=0;i<_7.length;i+=4){
var _a=_7.charAt(i);
var _b=_7.charAt(i+1);
var _c=_7.charAt(i+2);
var _d=_7.charAt(i+3);
var _e=_f[_a];
var _10=_f[_b];
var _11=_f[_c];
var _12=_f[_d];
_8.push(((_e<<2)&252)|((_10>>4)&3));
if(_c!="="){
_8.push(((_10<<4)&240)|((_11>>2)&15));
if(_d!="="){
_8.push(((_11<<6)&192)|(_12&63));
}
}
}
return _8;
};
var _6="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var _f={"=":0};
for(var i=0;i<_6.length;i++){
_f[_6[i]]=i;
}
if(typeof (window.btoa)==="undefined"){
window.btoa=function(s){
var _15=s.split("");
for(var i=0;i<_15.length;i++){
_15[i]=(_15[i]).charCodeAt();
}
return Base64.encode(_15);
};
window.atob=function(_17){
var _18=Base64.decode(_17);
for(var i=0;i<_18.length;i++){
_18[i]=String.fromCharCode(_18[i]);
}
return _18.join("");
};
}
})();
function URI(str){
str=str||"";
var _1b=0;
var _1c=str.indexOf("://");
if(_1c!=-1){
this.scheme=str.slice(0,_1c);
_1b=_1c+3;
var _1d=str.indexOf("/",_1b);
if(_1d==-1){
_1d=str.length;
str+="/";
}
var _1e=str.slice(_1b,_1d);
this.authority=_1e;
_1b=_1d;
this.host=_1e;
var _1f=_1e.indexOf(":");
if(_1f!=-1){
this.host=_1e.slice(0,_1f);
this.port=parseInt(_1e.slice(_1f+1),10);
if(isNaN(this.port)){
throw new Error("Invalid URI syntax");
}
}
}
var _20=str.indexOf("?",_1b);
if(_20!=-1){
this.path=str.slice(_1b,_20);
_1b=_20+1;
}
var _21=str.indexOf("#",_1b);
if(_21!=-1){
if(_20!=-1){
this.query=str.slice(_1b,_21);
}else{
this.path=str.slice(_1b,_21);
}
_1b=_21+1;
this.fragment=str.slice(_1b);
}else{
if(_20!=-1){
this.query=str.slice(_1b);
}else{
this.path=str.slice(_1b);
}
}
};
(function(){
var _22=URI.prototype;
_22.toString=function(){
var sb=[];
var _24=this.scheme;
if(_24!==undefined){
sb.push(_24);
sb.push("://");
sb.push(this.host);
var _25=this.port;
if(_25!==undefined){
sb.push(":");
sb.push(_25.toString());
}
}
if(this.path!==undefined){
sb.push(this.path);
}
if(this.query!==undefined){
sb.push("?");
sb.push(this.query);
}
if(this.fragment!==undefined){
sb.push("#");
sb.push(this.fragment);
}
return sb.join("");
};
var _26={"http":80,"ws":81,"https":443,"wss":815};
})();
switch(browser){
case "ie":
(function(){
if(document.createEvent===undefined){
var _27=function(){
};
_27.prototype.initEvent=function(_28,_29,_2a){
this.type=_28;
this.bubbles=_29;
this.cancelable=_2a;
};
document.createEvent=function(_2b){
if(_2b!="Events"){
throw new Error("Unsupported event name: "+_2b);
}
return new _27();
};
}
document._w_3_c_d_o_m_e_v_e_n_t_s_createElement=document.createElement;
document.createElement=function(_2c){
var _2d=this._w_3_c_d_o_m_e_v_e_n_t_s_createElement(_2c);
if(_2d.addEventListener===undefined){
var _2e={};
_2d.addEventListener=function(_2f,_30,_31){
return addEventListener(_2e,_2f,_30,_31);
};
_2d.removeEventListener=function(_32,_33,_34){
return removeEventListener(_2e,_32,_33,_34);
};
_2d.dispatchEvent=function(_35){
return dispatchEvent(_2e,_35);
};
}
return _2d;
};
if(window.addEventListener===undefined){
var _36=document.createElement("div");
var _37=(typeof (postMessage)==="undefined");
window.addEventListener=function(_38,_39,_3a){
if(_37&&_38=="message"){
_36.addEventListener(_38,_39,_3a);
}else{
window.attachEvent("on"+_38,_39);
}
};
window.removeEventListener=function(_3b,_3c,_3d){
if(_37&&_3b=="message"){
_36.removeEventListener(_3b,_3c,_3d);
}else{
window.detachEvent("on"+_3b,_3c);
}
};
window.dispatchEvent=function(_3e){
if(_37&&_3e.type=="message"){
_36.dispatchEvent(_3e);
}else{
window.fireEvent("on"+_3e.type,_3e);
}
};
}
function addEventListener(_3f,_40,_41,_42){
if(_42){
throw new Error("Not implemented");
}
var _43=_3f[_40]||{};
_3f[_40]=_43;
_43[_41]=_41;
};
function removeEventListener(_44,_45,_46,_47){
if(_47){
throw new Error("Not implemented");
}
var _48=_44[_45]||{};
delete _48[_46];
};
function dispatchEvent(_49,_4a){
var _4b=_4a.type;
var _4c=_49[_4b]||{};
for(var key in _4c){
if(typeof (_4c[key])=="function"){
try{
_4c[key](_4a);
}
catch(e){
}
}
}
};
})();
break;
case "chrome":
case "safari":
if(typeof (window.postMessage)==="undefined"&&typeof (window.dispatchEvent)==="undefined"&&typeof (document.dispatchEvent)==="function"){
window.dispatchEvent=function(_4e){
document.dispatchEvent(_4e);
};
var addEventListener0=window.addEventListener;
window.addEventListener=function(_4f,_50,_51){
if(_4f==="message"){
document.addEventListener(_4f,_50,_51);
}else{
addEventListener0.call(window,_4f,_50,_51);
}
};
var removeEventListener0=window.removeEventListener;
window.removeEventListener=function(_52,_53,_54){
if(_52==="message"){
document.removeEventListener(_52,_53,_54);
}else{
removeEventListener0.call(window,_52,_53,_54);
}
};
}
break;
case "opera":
var addEventListener0=window.addEventListener;
window.addEventListener=function(_55,_56,_57){
var _58=_56;
if(_55==="message"){
_58=function(_59){
if(_59.origin===undefined&&_59.uri!==undefined){
var uri=new URI(_59.uri);
delete uri.path;
delete uri.query;
_59.origin=uri.toString();
}
return _56(_59);
};
_56._$=_58;
}
addEventListener0.call(window,_55,_58,_57);
};
var removeEventListener0=window.removeEventListener;
window.removeEventListener=function(_5b,_5c,_5d){
var _5e=_5c;
if(_5b==="message"){
_5e=_5c._$;
}
removeEventListener0.call(window,_5b,_5e,_5d);
};
break;
}
var postMessage0=(function(){
var _5f={"http":80,"https":443};
var _60=location.protocol+"//"+location.hostname+":"+(location.port||_5f[location.protocol.substring(0,location.protocol.length-1)]);
var _61="/";
if(typeof (postMessage)!=="undefined"){
return function(_62,_63,_64){
switch(browser){
case "firefox":
case "ie":
setTimeout(function(){
_62.postMessage(_63,_64);
},0);
break;
default:
_62.postMessage(_63,_64);
break;
}
};
}else{
function MessagePipe(_65){
this.sourceToken=String(Math.random()).substring(2);
this.iframe=_65;
this.bridged=false;
this.lastWrite=-1;
this.lastRead=-1;
this.lastSyn=-1;
this.lastAck=-1;
this.queue=[];
this.escapedFragments=[];
};
var _66=MessagePipe.prototype;
_66.attach=function(_67,_68,_69,_6a,_6b,_6c){
this.target=_67;
this.targetOrigin=_68;
this.targetToken=_69;
this.reader=_6a;
this.lastFragment=_6a.location.hash;
this.writer=_6b;
this.writerURL=_6c;
if(_67==parent){
dequeue(this,true);
}
};
_66.detach=function(){
delete this.target;
delete this.targetOrigin;
delete this.reader;
delete this.lastFragment;
delete this.writer;
delete this.writerURL;
};
_66.poll=function(){
var _6d=this.reader.location.hash;
if(this.lastFragment!=_6d){
process(this,_6d.substring(1));
this.lastFragment=_6d;
}
};
_66.post=function(_6e,_6f,_70){
bridgeIfNecessary(this,_6e);
var _71=1000;
var _72=escape(_6f);
var _73=[];
while(_72.length>_71){
var _74=_72.substring(0,_71);
_72=_72.substring(_71);
_73.push(_74);
}
_73.push(_72);
this.queue.push([_70,_73]);
if(this.writer!=null&&this.lastAck>=this.lastSyn){
dequeue(this,false);
}
};
function bridgeIfNecessary(_75,_76){
if(_75.lastWrite<0&&!_75.bridged){
if(_76.parent==window){
var src=_75.iframe.src;
var _78=src.split("#");
var _79=null;
var _7a=document.getElementsByTagName("meta");
for(var i=0;i<_7a.length;i++){
if(_7a[i].name=="kaazing:resources"){
_79=_7a[i].content;
}
}
var _7c=["I",document.domain,escape(_60),_75.sourceToken,escape(_61),_79];
if(_78.length>1){
var _7d=_78[1];
_7c.push(escape(_7d));
}
_78[1]=_7c.join("!");
_76.location.replace(_78.join("#"));
_75.bridged=true;
}
}
};
function flush(_7e,_7f){
var _80=_7e.writerURL+"#"+_7f;
_7e.writer.location.replace(_80);
};
function dequeue(_81,_82){
var _83=_81.queue;
var _84=_81.lastRead;
if((_83.length>0||_82)&&_81.lastSyn>_81.lastAck){
var _85=_81.lastFrames;
var _86=_85.length-1;
var _87=_85[_86];
var _88=_87.split("!");
if(_88[2]!=_84){
_88[2]=_84;
_85[_86]=_88.join("!");
flush(_81,_85.join("!"));
}
}else{
if(_83.length>0){
var _89=_83.shift();
var _8a=_89[0];
if(_8a=="*"||_8a==_81.targetOrigin){
_81.lastWrite++;
var _8b=_89[1];
var _8c=_8b.shift();
var _8d=3;
var _88=[_81.targetToken,_81.lastWrite,_84,"F",_8c];
if(_8b.length>0){
_88[_8d]="f";
_81.queue.unshift(_89);
}
var _85=[_88.join("!")];
if(_81.resendAck){
var _8e=[_81.targetToken,_81.lastWrite-1,_84,"a"];
_85.unshift(_8e.join("!"));
}
flush(_81,_85.join("!"));
_81.lastFrames=_85;
_81.lastSyn=_81.lastWrite;
_81.resendAck=false;
}
}else{
if(_82){
_81.lastWrite++;
var _88=[_81.targetToken,_81.lastWrite,_84,"a"];
var _85=[_88.join("!")];
if(_81.resendAck){
var _8e=[_81.targetToken,_81.lastWrite-1,_84,"a"];
_85.unshift(_8e.join("!"));
}
flush(_81,_85.join("!"));
_81.lastFrames=_85;
_81.resendAck=true;
}
}
}
};
function process(_8f,_90){
var _91=_90.split("!");
var _92=_91.shift();
var _93=parseInt(_91.shift());
var _94=parseInt(_91.shift());
var _95=_91.shift();
if(_92!=_8f.sourceToken){
throw new Error("postMessage emulation tampering detected");
}
var _96=_8f.lastRead;
var _97=_96+1;
if(_93==_97){
_8f.lastRead=_97;
}
if(_93==_97||_93==_96){
_8f.lastAck=_94;
}
if(_93==_97||(_93==_96&&_95=="a")){
switch(_95){
case "f":
var _98=_91.join("!");
_8f.escapedFragments.push(_98);
dequeue(_8f,true);
break;
case "F":
var _99=_91.join("!");
if(_8f.escapedFragments!==undefined){
_8f.escapedFragments.push(_99);
_99=_8f.escapedFragments.join("");
_8f.escapedFragments=[];
}
var _9a=unescape(_99);
dispatch(_9a,_8f.target,_8f.targetOrigin);
dequeue(_8f,true);
break;
case "a":
if(_91.length>0){
process(_8f,_91.join("!"));
}else{
dequeue(_8f,false);
}
break;
default:
throw new Error("unknown postMessage emulation payload type: "+_95);
}
}
};
function dispatch(_9b,_9c,_9d){
var _9e=document.createEvent("Events");
_9e.initEvent("message",false,true);
_9e.data=_9b;
_9e.origin=_9d;
_9e.source=_9c;
dispatchEvent(_9e);
};
var _9f={};
var _a0=[];
function pollReaders(){
for(var i=0,len=_a0.length;i<len;i++){
var _a3=_a0[i];
_a3.poll();
}
setTimeout(pollReaders,20);
};
function findMessagePipe(_a4){
if(_a4==parent){
return _9f["parent"];
}else{
if(_a4.parent==window){
var _a5=document.getElementsByTagName("iframe");
for(var i=0;i<_a5.length;i++){
var _a7=_a5[i];
if(_a4==_a7.contentWindow){
return supplyIFrameMessagePipe(_a7);
}
}
}else{
throw new Error("Generic peer postMessage not yet implemented");
}
}
};
function supplyIFrameMessagePipe(_a8){
var _a9=_a8._name;
if(_a9===undefined){
_a9="iframe$"+String(Math.random()).substring(2);
_a8._name=_a9;
}
var _aa=_9f[_a9];
if(_aa===undefined){
_aa=new MessagePipe(_a8);
_9f[_a9]=_aa;
}
return _aa;
};
function postMessage0(_ab,_ac,_ad){
if(_ab==window){
if(_ad=="*"||_ad==_60){
dispatch(_ac,window,_60);
}
}else{
var _ae=findMessagePipe(_ab);
_ae.post(_ab,_ac,_ad);
}
};
postMessage0.attach=function(_af,_b0,_b1,_b2,_b3,_b4){
var _b5=findMessagePipe(_af);
_b5.attach(_af,_b0,_b1,_b2,_b3,_b4);
_a0.push(_b5);
};
postMessage0.detach=function(_b6){
var _b7=findMessagePipe(_b6);
for(var i=0;i<_a0.length;i++){
if(_a0[i]==_b7){
_a0.splice(i,1);
}
}
_b7.detach();
};
if(window!=top){
_9f["parent"]=new MessagePipe();
function pollParentOrigin(){
var _b9=location.hash;
if(document.body!=null&&_b9.length>1&&_b9.charAt(1)=="I"){
var _ba=unescape(_b9.substring(1));
var _bb=_ba.split("!");
if(_bb.shift()=="I"){
var _bc=_bb.shift();
var _bd=_bb.shift();
var _be=_bb.shift();
var _bf=_bb.shift();
var _c0=_bb.shift();
var _c1=_bb.shift();
if(_c1!==undefined){
location.hash="#"+_c1;
}
var _c2=findMessagePipe(parent);
_c2.targetToken=_be;
var _c3=_c2.sourceToken;
var _c4="parentBridge"+String(Math.random()).substring(2);
var _c5=new URI(_bd+_bf);
if(_c0){
var _c6=new URI(_c5.scheme+"://"+_c0);
if(typeof (_c6.port)!=="undefined"){
_c5.port=_c6.port;
}
_c5.host=_c6.host;
}
var _c7=_c5.toString()+"?.kr=xsp#"+escape([_bc,_c4,_60,_be,_c3,_bf,_61].join(","));
var _c8;
if(browser=="ie"){
_c8=document.createElement("<iframe id=\""+_c4+"\" name=\""+_c4+"\" src=\""+_c7+"\"></iframe>");
}else{
_c8=document.createElement("iframe");
_c8.src=_c7;
}
_c8.style.position="absolute";
_c8.style.left="-10px";
_c8.style.top="10px";
_c8.style.visibility="hidden";
_c8.style.width="0px";
_c8.style.height="0px";
document.body.appendChild(_c8);
return;
}
}
setTimeout(pollParentOrigin,20);
};
pollParentOrigin();
}
var _c9=document.getElementsByTagName("meta");
for(var i=0;i<_c9.length;i++){
if(_c9[i].name==="kaazing:postMessage"){
if("immediate"==_c9[i].content){
var _cb=function(){
var _cc=document.getElementsByTagName("iframe");
for(var i=0;i<_cc.length;i++){
var _ce=_cc[i];
if(_ce.style["KaaPostMessage"]=="immediate"){
_ce.style["KaaPostMessage"]="none";
var _cf=supplyIFrameMessagePipe(_ce);
bridgeIfNecessary(_cf,_ce.contentWindow);
}
}
setTimeout(_cb,20);
};
setTimeout(_cb,20);
}
break;
}
}
for(var i=0;i<_c9.length;i++){
if(_c9[i].name==="kaazing:postMessagePrefix"){
var _d0=_c9[i].content;
if(_d0!=null&&_d0.length>0){
if(_d0.charAt(0)!="/"){
_d0="/"+_d0;
}
_61=_d0;
}
}
}
setTimeout(pollReaders,20);
return postMessage0;
}
})();
var XMLHttpRequest0=(function(){
var _d1=new URI(location.href);
var _d2={"http":80,"https":443};
var _d3={};
var _d4={};
var _d5=0;
function XMLHttpRequest0(){
/*
if(browser=="firefox"&&typeof (Object.getPrototypeOf)=="function"){
var xhr=new XMLHttpRequest();
xhr.withCredentials=true;
return xhr;
}
*/
};
var _d7=XMLHttpRequest0.prototype;
_d7.readyState=0;
_d7.responseText="";
_d7.status=0;
_d7.statusText="";
_d7.onreadystatechange;
_d7.onerror;
_d7.onload;
_d7.onprogress;
_d7.open=function(_d8,_d9,_da){
if(!_da){
throw new Error("Asynchronous is required for cross-origin XMLHttpRequest emulation");
}
switch(this.readyState){
case 0:
case 4:
break;
default:
throw new Error("Invalid ready state");
}
if(this._id===undefined){
var id=_d5++;
_d4[id]=this;
this._id=id;
}
var uri=new URI(_d9);
var _dd=(uri.scheme!=null)?uri.scheme:_d1.scheme;
var _de=(uri.host!=null)?uri.host:_d1.host;
var _df=(uri.port!=null)?uri.port:_d1.port;
if(_df==null){
_df=_d2[_dd];
}
var _e0=_dd+"://"+_de+":"+_df;
var _e1=_d3[_e0];
if(_e1===undefined){
var _e2=document.createElement("iframe");
_e2.style.position="absolute";
_e2.style.left="-10px";
_e2.style.top="10px";
_e2.style.visibility="hidden";
_e2.style.width="0px";
_e2.style.height="0px";
var _e3=new URI(_d9);
_e3.query=".kr=xs";
_e3.path="/";
_e2.src=_e3.toString();
document.body.appendChild(_e2);
function post(_e4){
this.buffer.push(_e4);
};
function attach(id){
var _e6=this.attached[id];
if(_e6===undefined){
_e6={};
this.attached[id]=_e6;
}
if(_e6.timerID!==undefined){
clearTimeout(_e6.timerID);
delete _e6.timerID;
}
};
function detach(id){
var _e8=this.attached[id];
if(_e8!==undefined&&_e8.timerID===undefined){
var _e9=this;
_e8.timerID=setTimeout(function(){
delete _e9.attached[id];
var xhr=_d4[id];
if(xhr._pipe==_e1){
delete _d4[id];
delete xhr._id;
delete xhr._pipe;
}
postMessage0(_e1.iframe.contentWindow,["d",id].join("\uffff"),_e1.targetOrigin);
},10000);
}
};
_e1={"targetOrigin":_e0,"iframe":_e2,"buffer":[],"post":post,"attach":attach,"detach":detach,"attached":{count:0}};
_d3[_e0]=_e1;
function sendInitWhenReady(){
var _eb=_e2.contentWindow;
if(!_eb){
setTimeout(sendInitWhenReady,20);
}else{
postMessage0(_eb,"I",_e0);
}
};
sendInitWhenReady();
}
this._pipe=_e1;
this._requestHeaders={};
this._method=_d8;
this._location=_d9;
this._responseHeaders=null;
this._readyState=1;
this.status=0;
this.statusText="";
this.responseText="";
_e1.attach(this._id);
var _ec=this;
setTimeout(function(){
_ec.readyState=1;
onreadystatechange(_ec);
},0);
};
_d7.setRequestHeader=function(_ed,_ee){
if(this._readyState!==1){
throw new Error("Invalid ready state");
}
this._requestHeaders[_ed]=_ee;
};
_d7.send=function(_ef){
if(this._readyState!==1){
throw new Error("Invalid ready state");
}
if(typeof (_ef)!=="string"){
_ef="";
}
var _f0=[];
for(var _f1 in this._requestHeaders){
_f0.push(_f1+"\ufffd"+this._requestHeaders[_f1]);
}
var _f2=(this.onprogress!==undefined);
this._pipe.post(["s",this._id,this._method,this._location,_f0.join("\ufffe"),_ef,_f2].join("\uffff"));
var _f3=this;
setTimeout(function(){
_f3.readyState=2;
onreadystatechange(_f3);
},0);
};
_d7.abort=function(){
var _f4=this._pipe;
if(_f4!==undefined){
_f4.post(["a",this._id].join("\uffff"));
_f4.detach(this._id);
}
};
_d7.getResponseHeader=function(_f5){
if(this.status==0){
throw new Error("Invalid ready state");
}
var _f6=this._responseHeaders;
return _f6[_f5];
};
_d7.getAllResponseHeaders=function(){
if(this.status==0){
throw new Error("Invalid ready state");
}
return null;
};
function onreadystatechange(_f7){
if(typeof (_f7.onreadystatechange)!=="undefined"){
_f7.onreadystatechange();
}
switch(_f7.readyState){
case 3:
if(typeof (_f7.onprogress)!=="undefined"){
_f7.onprogress();
}
break;
case 4:
if(typeof (_f7.onprogress)!=="undefined"){
_f7.onprogress();
}
if(typeof (_f7.onload)!=="undefined"){
_f7.onload();
}
break;
}
};
function onmessage(_f8){
var _f9=_f8.origin;
var _fa={"http":":80","https":":443"};
var _fb=_f9.split(":");
if(_fb.length===2){
_f9+=_fa[_fb[0]];
}
var _fc=_d3[_f9];
if(_fc!==undefined&&_fc.iframe!==undefined&&_f8.source==_fc.iframe.contentWindow){
if(_f8.data=="I"){
var _fd;
while((_fd=_fc.buffer.shift())!==undefined){
postMessage0(_fc.iframe.contentWindow,_fd,_fc.targetOrigin);
}
_fc.post=function(_fe){
postMessage0(_fc.iframe.contentWindow,_fe,_fc.targetOrigin);
};
}else{
var _ff=_f8.data.split("\uffff");
if(_ff.length>2){
var type=_ff.shift();
var id=_ff.shift();
var _102=_d4[id];
if(_102!==undefined){
switch(type){
case "r":
var _103=_ff.shift();
_102.status=parseInt(_ff.shift());
_102.statusText=_ff.shift();
var _104={};
var _105=_103.split("\n");
for(var i=0;i<_105.length;i++){
var _107=_105[i];
var _108=_107.indexOf(": ");
if(_108!=-1){
_104[_107.substring(0,_108)]=_107.substring(_108+1);
}
}
_102._responseHeaders=_104;
break;
case "p":
_102.readyState=parseInt(_ff.shift());
var _109=_ff.join("\uffff");
if(_109.length>0){
_102.responseText+=_109;
}
onreadystatechange(_102);
if(_102.readyState==4){
_fc.detach(id);
}
break;
}
}
}
}
}else{
}
};
window.addEventListener("message",onmessage,false);
return XMLHttpRequest0;
})();
(function(){
var _10a=new URI(location.href);
if(browser=="ie"){
document._s_s_e_createElement=document.createElement;
document.createElement=function(name){
var _10c=this._s_s_e_createElement(name);
if(name=="eventsource"){
applyRemoteEventTargetMixin(_10c);
}
return _10c;
};
}else{
var _10d=document.createElement;
document.createElement=function(name){
var _10f=_10d.call(this,name);
if(name=="eventsource"){
applyRemoteEventTargetMixin(_10f);
}
return _10f;
};
}
window.addEventListener("load",function(_110){
var _111=document.getElementsByTagName("eventsource");
for(var i=0;i<_111.length;i++){
var _113=_111[i];
applyRemoteEventTargetMixin(_113);
}
},false);
function applyRemoteEventTargetMixin(_114){
var _115=new RemoteEventTarget(_114);
_114.addEventSource=function(src){
_115.addEventSource(src);
};
_114.removeEventSource=function(src){
_115.removeEventSource(src);
};
};
function RemoteEventTarget(_118){
this.element=_118;
this.eventSources={};
};
var _119=RemoteEventTarget.prototype;
_119.addEventSource=function(src){
var _11b=resolve(src,true);
var _11c=this.eventSources[_11b];
if(_11c===undefined){
_11c=[];
this.eventSources[_11b]=_11c;
}
var _11d=new _11e(this.element,src);
_11c.push(_11d);
_11d.connect();
};
_119.removeEventSource=function(src){
var _120=resolve(src,false);
if(_120!=null){
var _121=this.eventSources[_120];
if(_121!==undefined){
var _122=_121.pop();
if(_122!==undefined){
_122.disconnect();
}
}
}
};
function resolve(src,_124){
var _125=new URI(src);
if(_125.scheme!==undefined){
return src;
}
_125.scheme=_10a.scheme;
_125.host=_10a.host;
_125.port=_10a.port;
var _126=_125.path;
if(_126.length>0){
if(_126.charAt(0)!="/"){
var _127=_10a.path;
if(_127.length>0){
var _128=_127.lastIndexOf("/");
if(_128!=-1){
_125.path=[_127.substring(0,_128),_127].join("/");
}else{
_125.path="/"+_127;
}
}
return _125.toString();
}
}
if(_124){
throw new Error("SYNTAX_ERR");
}
return null;
};
var _11e=(function(){
function _11e(_129,src){
this.element=_129;
this.lastEventId=null;
this.immediate=false;
this.retry=3000;
this.src=src;
this.position=0;
this.lineQueue=[];
this.xhr=null;
this.reconnectTimer=null;
};
var _12b=_11e.prototype;
_12b.connect=function(){
if(this.reconnectTimer!==null){
this.reconnectTimer=null;
}
var _12c=new URI(this.src);
var _12d=[];
if(this.lastEventId!==null){
_12d.push(".ka="+this.lastEventId);
}
if(this.src.indexOf("&.kb=")===-1&&this.src.indexOf("?.kb=")===-1){
_12d.push(".kb=512");
}
switch(browser){
case "ie":
case "safari":
_12d.push(".kp=256");
break;
}
if(_12d.length>0){
if(_12c.query===undefined){
_12c.query=_12d.join("&");
}else{
_12c.query+="&"+_12d.join("&");
}
}
var xhr=this.xhr;
if(xhr===null){
this.xhr=xhr=new XMLHttpRequest0();
}
var _12f=this;
xhr.open("GET",_12c.toString(),true);
xhr.onprogress=function(){
process(_12f);
};
xhr.onload=function(){
process(_12f);
reconnect(_12f);
};
xhr.onerror=function(){
_12f.element.removeEventSource(_12f.src);
};
xhr.ontimeout=function(){
_12f.element.removeEventSource(_12f.src);
};
xhr.send(null);
};
_12b.disconnect=function(){
if(this.src!==null){
if(this.reconnectTimer!==null){
clearTimeout(this.reconnectTimer);
this.reconnectTimer=null;
}
if(this.xhr!==null){
this.xhr.onprogress=function(){
};
this.xhr.onload=function(){
};
this.xhr.onerror=function(){
};
this.xhr.abort();
}
this.position=0;
this.lineQueue=[];
this.lastEventId=null;
this.src=null;
}
};
function reconnect(_130){
_130.position=0;
if(_130.src!==null){
var _131=_130.retry;
if(_130.immediate){
_130.immediate=false;
_131=0;
}
_130.reconnectTimer=setTimeout(function(){
_130.connect();
},_131);
}
};
var _132=/[^\r\n]+|\r\n|\r|\n/g;
function process(_133){
var _134=_133.xhr.responseText;
var _135=_134.slice(_133.position);
var _136=_135.match(_132)||[];
var _137=_133.lineQueue;
var _138="";
while(_136.length>0){
var _139=_136.shift();
switch(_139.charAt(0)){
case "\r":
case "\n":
if(_138===""){
dispatch(_133);
}else{
_137.push(_138);
_138="";
}
break;
default:
_138=_139;
break;
}
}
_133.position=_134.length-_138.length;
};
function dispatch(_13a){
var data="";
var name="message";
var _13d=_13a.lineQueue;
while(_13d.length>0){
var line=_13d.shift();
var _13f=null;
var _140="";
var _141=line.indexOf(":");
if(_141==-1){
_13f=line;
_140="";
}else{
if(_141===0){
continue;
}else{
_13f=line.slice(0,_141);
var _142=_141+1;
if(line.charAt(_142)==" "){
_142++;
}
_140=line.slice(_142);
}
}
switch(_13f){
case "event":
name=_140;
break;
case "id":
_13a.lastEventId=_140;
break;
case "retry":
_140=parseInt(_140,10);
if(!isNaN(_140)){
_13a.retry=_140;
}
break;
case "data":
if(data.length>0){
data+="\n";
}
data+=_140;
break;
case "reconnect":
_13a.immediate=true;
if(_140!=""){
_13a.src=_140;
}
break;
default:
break;
}
}
if(data.length>0||(name.length>0&&name!="message")){
var e=document.createEvent("Events");
e.initEvent(name,true,true);
e.lastEventId=_13a.lastEventId;
e.data=data;
e.origin=document.domain;
if(e.source!==null){
e.source=null;
}
_13a.element.dispatchEvent(e);
}
};
return _11e;
})();
})();
if(typeof (window.WebSocket)==="undefined"){
WebSocket=(function(){
var _144=45000;
var _145={"ws":{scheme:"http",port:81},"wss":{scheme:"https",port:815}};
var _146=function(_147){
var _148=new URI(_147);
var _149=_145[_148.scheme];
if(_149===undefined){
throw new Error("SYNTAX_ERR: WebSocket location must use scheme \"ws\" or \"wss\"");
}
_148.scheme=_149.scheme;
if(_148.port===undefined){
_148.port=_149.port;
}
this._xhr=new XMLHttpRequest0();
this._seqId=0;
this._sendQueue=[];
var _14a=this;
this.closeReceived=function(evt){
doClose(_14a);
};
this.pingReceived=function(evt){
doResetTimer(_14a);
doAcknowledge(_14a,evt.lastEventId);
};
this.reconnectReceived=function(evt){
doResetTimer(_14a);
};
this.messageReceived=function(evt){
doResetTimer(_14a);
if(_14a.readyState==1){
_14a.onmessage(evt);
}else{
throw new Error("Unexpected Data");
}
};
doHandshake(this,_148);
};
var _14f=_146.prototype;
_14f.readyState=0;
_14f.onopen=function(){
};
_14f.onmessage=function(_150){
};
_14f.onclosed=function(){
};
_14f.postMessage=function(data){
if(data===null){
throw new Error("data is null");
}
var _152=[];
_152.push("data:");
_152.push(data.split("\n").join("\r\ndata:"));
_152.push("\r\nid:");
_152.push(this._seqId++);
_152.push("\r\n\r\n");
this._sendQueue.push(_152.join(""));
if(!this.sending){
doSend(this);
}
};
_14f.disconnect=function(){
switch(this.readyState){
case 1:
case 2:
this.closeReceived();
break;
}
};
function doHandshake(_153,_154){
var xhr=_153._xhr;
xhr.open("POST",_154.toString(),true);
xhr.onreadystatechange=function(){
if(xhr.readyState==4){
switch(xhr.status){
case 201:
var _156=xhr.responseText.split("\n");
_153.upstream=new URI(_156[0]).toString();
_153.downstream=(_156.length>=2)?_156[1]:_156[0];
doBind(_153);
doOpen(_153);
break;
default:
doClose(_153);
break;
}
}
};
xhr.send(null);
};
function doBind(_157){
var _158=_157.downstream;
var _159=document.createElement("eventsource");
_159.addEventListener("message",_157.messageReceived,false);
_159.addEventListener("ping",_157.pingReceived,false);
_159.addEventListener("reconnect",_157.reconnectReceived,false);
_159.addEventListener("close",_157.closeReceived,false);
_159.addEventSource(_158);
document.body.appendChild(_159);
_157._eventSource=_159;
};
function doUnbind(_15a){
var _15b=_15a._eventSource;
if(_15b!==undefined){
_15b.removeEventSource(_15a.downstream);
_15b.removeEventListener("message",_15a.messageReceived,false);
_15b.removeEventListener("ping",_15a.pingReceived,false);
_15b.removeEventListener("reconnect",_15a.reconnectReceived,false);
_15b.removeEventListener("close",_15a.closeReceived,false);
_15b.parentNode.removeChild(_15b);
delete _15a._eventSource;
}
};
function doOpen(_15c){
_15c.readyState=1;
doResetTimer(_15c);
_15c.onopen();
};
function doSend(_15d){
var _15e=_15d._sendQueue;
var _15f=_15e.length;
_15d.sending=(_15f>0);
if(_15f>0){
var xhr=_15d._xhr;
xhr.open("POST",_15d.upstream,true);
xhr.setRequestHeader("Content-Type","text/plain; charset=UTF-8");
xhr.onreadystatechange=function(){
if(xhr.readyState===4){
switch(xhr.status){
case 200:
_15e.splice(0,_15f);
setTimeout(function(){
doSend(_15d);
},0);
break;
default:
doClose(_15d);
}
}
};
xhr.send(_15e.join(""));
doResetTimer(_15d);
}
};
function doAcknowledge(_161,_162){
var _163=[];
_163.push("event:ack\r\ndata:");
_163.push(_162);
_163.push("\r\nid:");
_163.push(_161._seqId++);
_163.push("\r\n\r\n");
_161._sendQueue.push(_163.join(""));
if(!_161.sending){
doSend(_161);
}
};
function doClose(_164){
if(_164.readyState<2){
_164.readyState=2;
doUnbind(_164);
_164._xhr.abort();
_164.onclosed();
}
};
function doResetTimer(_165){
if(_165._pingTimer!==null){
clearTimeout(_165._pingTimer);
}
_165._pingTimer=setTimeout(function(){
doClose(_165);
},_144);
};
return _146;
})();
}
function Charset(){
};
(function(){
var _166=Charset.prototype;
_166.decode=function(buf){
};
_166.encode=function(text){
};
Charset.UTF8=(function(){
function UTF8(){
};
UTF8.prototype=new Charset();
var _169=UTF8.prototype;
_169.decode=function(buf){
var _16b=[];
while(buf.hasRemaining()){
var _16c=buf.remaining();
var _16d=buf.getUnsigned();
var _16e=charByteCount(_16d);
if(_16c<_16e){
buf.skip(-1);
break;
}
var _16f=null;
switch(_16e){
case 1:
_16f=_16d;
break;
case 2:
_16f=((_16d&31)<<6)|(buf.getUnsigned()&63);
break;
case 3:
_16f=((_16d&15)<<12)|((buf.getUnsigned()&63)<<6)|(buf.getUnsigned()&63);
break;
case 4:
_16f=((_16d&7)<<18)|((buf.getUnsigned()&63)<<12)|((buf.getUnsigned()&63)<<6)|(buf.getUnsigned()&63);
break;
}
_16b.push(String.fromCharCode(_16f));
}
return _16b.join("");
};
_169.encode=function(str,buf){
for(var i=0;i<str.length;i++){
var _173=str.charCodeAt(i);
if(_173<128){
buf.put(_173);
}else{
if(_173<2048){
buf.put((_173>>6)|192);
buf.put((_173&63)|128);
}else{
if(_173<65536){
buf.put((_173>>12)|224);
buf.put(((_173>>6)&63)|128);
buf.put((_173&63)|128);
}else{
if(_173<1114112){
buf.put((_173>>18)|240);
buf.put(((_173>>12)&63)|128);
buf.put(((_173>>6)&63)|128);
buf.put((_173&63)|128);
}else{
throw new Error("Invalid UTF-8 string");
}
}
}
}
}
};
function charByteCount(b){
if((b&128)===0){
return 1;
}
if((b&32)===0){
return 2;
}
if((b&16)===0){
return 3;
}
if((b&8)===0){
return 4;
}
throw new Error("Invalid UTF-8 bytes");
};
return new UTF8();
})();
})();
ByteOrder=function(){
};
(function(){
var _175=4294967296;
var _176=ByteOrder.prototype;
_176.toString=function(){
throw new Error("Abstract");
};
var _177=function(v,_179){
var _17a=[];
for(var i=0;i<_179;i++){
var val=(v>>(i*8))&255;
_17a.unshift(val);
}
return _17a;
};
var _17d=function(_17e){
var val=0;
var _180=_17e.length;
for(var i=0;i<_180;i++){
val=val*256;
val+=_17e[i];
}
return val;
};
var _182=function(x,_184){
if(x>=0){
return x;
}
var _185=Math.pow(2,_184*8)-1;
return x+_185+1;
};
var _186=function(x,_188){
if(x<0){
return x;
}
var _189=Math.pow(2,_188*8)-1;
if(x>(_189/2)){
return x-(_189+1);
}else{
return x;
}
};
_176._putValue=function(_18a,i,v,_18d){
var val=v;
val=_182(v,_18d);
if(false){
throw new Error("cannot pack 64bit integer");
var _18f=x/_175;
var _190=x%_175;
_176._putValue(_18a,_18f,4,unsigned);
_176._putValue(_18a,_190,4,true);
}else{
var _191=_177(val,_18d);
_191=this._reorder(_191);
var func=_18a.splice;
var args=[i,_18d].concat(_191);
func.apply(_18a,args);
}
};
_176._getValue=function(_194,i,_196,_197){
var _198=_194.slice(i,i+_196);
_198=this._reorder(_198);
var val=_17d(_198);
if(typeof (_197)==="undefined"||!_197){
val=_186(val,_196);
}
return val;
};
ByteOrder.BIG_ENDIAN=(function(){
var _19a=function(){
};
_19a.prototype=new ByteOrder();
var _19b=_19a.prototype;
_19b._reorder=function(_19c){
return _19c;
};
_19b.toString=function(){
return "<ByteOrder.BIG_ENDIAN>";
};
return new _19a();
})();
ByteOrder.LITTLE_ENDIAN=(function(){
var _19d=function(){
};
_19d.prototype=new ByteOrder();
var _19e=_19d.prototype;
_19e._reorder=function(_19f){
return _19f.reverse();
};
_19e.toString=function(){
return "<ByteOrder.LITTLE_ENDIAN>";
};
return new _19d();
})();
})();
function ByteBuffer(_1a0){
this.array=_1a0||[];
this._mark=-1;
this.limit=this.capacity=this.array.length;
this.order=ByteOrder.BIG_ENDIAN;
};
(function(){
ByteBuffer.allocate=function(_1a1){
var buf=new ByteBuffer();
buf.capacity=_1a1;
return buf;
};
ByteBuffer.wrap=function(_1a3){
return new ByteBuffer(_1a3);
};
var _1a4=ByteBuffer.prototype;
_1a4.autoExpand=true;
_1a4.capacity=0;
_1a4.position=0;
_1a4.limit=0;
_1a4.order=ByteOrder.BIG_ENDIAN;
_1a4.array=[];
_1a4.mark=function(){
this._mark=this.position;
return this;
};
_1a4.reset=function(){
var m=this._mark;
if(m<0){
throw new Error("Invalid mark");
}
this.position=m;
return this;
};
_1a4.compact=function(){
this.array.splice(0,this.position);
this.limit-=this.position;
this.position=0;
return this;
};
_1a4.duplicate=function(){
var buf=new ByteBuffer(this.array);
buf.position=this.position;
buf.limit=this.limit;
buf.capacity=this.capacity;
return buf;
};
_1a4.fill=function(size){
_autoExpand(this,size);
while(size-->0){
this.put(0);
}
return this;
};
_1a4.fillWith=function(b,size){
_autoExpand(this,size);
while(size-->0){
this.put(b);
}
return this;
};
_1a4.indexOf=function(b){
var _1ab=this.limit;
var _1ac=this.array;
for(var i=this.position;i<_1ab;i++){
if(_1ac[i]==b){
return i;
}
}
return -1;
};
_1a4.put=function(v){
_autoExpand(this,1);
this.putAt(this.position++,v);
return this;
};
_1a4.putAt=function(i,v){
_checkIndex(this,i);
this.array[i]=(v&255);
return this;
};
_1a4.putShort=function(v){
_autoExpand(this,2);
this.putShortAt(this.position,v);
this.position+=2;
return this;
};
_1a4.putShortAt=function(i,v){
this.order._putValue(this.array,i,v,2);
return this;
};
_1a4.putMediumInt=function(v){
_autoExpand(this,3);
this.putMediumIntAt(this.position,v);
this.position+=3;
return this;
};
_1a4.putMediumIntAt=function(i,v){
this.order._putValue(this.array,i,v,3);
return this;
};
_1a4.putInt=function(v){
_autoExpand(this,4);
this.putIntAt(this.position,v);
this.position+=4;
return this;
};
_1a4.putIntAt=function(i,v){
this.order._putValue(this.array,i,v,4);
return this;
};
_1a4.putLong=function(v){
_autoExpand(this,8);
this.putLongAt(this.position,v);
this.position+=8;
return this;
};
_1a4.putLongAt=function(i,v){
this.order._putValue(this.array,i,v,8);
return this;
};
_1a4.putString=function(v,cs){
cs.encode(v,this);
return this;
};
_1a4.putPrefixedString=function(_1bf,v,cs){
if(typeof (cs)==="undefined"||typeof (cs.encode)==="undefined"){
throw new Error("ByteBuffer.putPrefixedString: character set parameter missing");
}
if(_1bf===0){
return this;
}
_autoExpand(this,_1bf);
var len=v.length;
switch(_1bf){
case 1:
this.put(len);
break;
case 2:
this.putShort(len);
break;
case 4:
this.putInt(len);
break;
}
cs.encode(v,this);
return this;
};
_1a4.putBytes=function(v){
_autoExpand(this,v.length);
this.putBytesAt(this.position,v);
this.position+=v.length;
return this;
};
_1a4.putBytesAt=function(i,v){
for(var j=0,k=i,len=v.length;j<len;j++,k++){
this.putAt(k,v[j]);
}
return this;
};
_1a4.putBuffer=function(v){
this.putBytes(v.array.slice(v.position,v.limit));
return this;
};
_1a4.putBufferAt=function(i,v){
this.putBytesAt(i,v.array.slice(v.position,v.limit));
return this;
};
_1a4.get=function(){
return this.getAt(this.position++);
};
_1a4.getAt=function(i){
return this.order._getValue(this.array,i,1);
};
_1a4.getShort=function(){
var val=this.getShortAt(this.position);
this.position+=2;
return val;
};
_1a4.getShortAt=function(i){
return this.order._getValue(this.array,i,2);
};
_1a4.getMediumInt=function(){
var val=this.getMediumIntAt(this.position);
this.position+=3;
return val;
};
_1a4.getMediumIntAt=function(i){
return this.order._getValue(this.array,i,3);
};
_1a4.getInt=function(){
var val=this.getIntAt(this.position);
this.position+=4;
return val;
};
_1a4.getIntAt=function(i){
return this.order._getValue(this.array,i,4);
};
_1a4.getLong=function(){
var val=this.getLongAt(this.position);
this.position+=8;
return val;
};
_1a4.getLongAt=function(i){
return this.order._getValue(this.array,i,8);
};
_1a4.getUnsigned=function(){
return (this.get()&255);
};
_1a4.getUnsignedShort=function(){
var val=(this.getShort()&65535);
};
_1a4.getUnsignedMediumInt=function(){
return (this.getMediumInt()&16777215);
};
_1a4.getUnsignedInt=function(){
var val=this.order._getValue(this.array,this.position,4,true);
this.position+=4;
return val;
};
_1a4.getPrefixedString=function(_1d7,cs){
var len=0;
switch(_1d7||2){
case 1:
len=this.getUnsigned();
break;
case 2:
len=this.getUnsignedShort();
break;
case 4:
len=this.getInt();
break;
}
if(len===0){
return "";
}
var _1da=this.limit;
try{
this.limit=this.position+len;
return cs.decode(this);
}
finally{
this.limit=_1da;
}
};
_1a4.getString=function(cs){
var _1dc=this.position;
var _1dd=this.limit;
var _1de=this.array;
while(_1dc<_1dd&&_1de[_1dc]!==0){
_1dc++;
}
try{
this.limit=_1dc;
return cs.decode(this);
}
finally{
if(_1dc!=_1dd){
this.limit=_1dd;
this.position=_1dc+1;
}
}
};
_1a4.slice=function(){
return new ByteBuffer(this.array.slice(this.position,this.limit));
};
_1a4.flip=function(){
this.limit=this.position;
this.position=0;
this._mark=-1;
return this;
};
_1a4.rewind=function(){
this.position=0;
this._mark=-1;
return this;
};
_1a4.clear=function(){
this.position=0;
this.limit=this.capacity;
this._mark=-1;
return this;
};
_1a4.remaining=function(){
return (this.limit-this.position);
};
_1a4.hasRemaining=function(){
return (this.limit>this.position);
};
_1a4.skip=function(size){
this.position+=size;
return this;
};
_1a4.getHexDump=function(){
var _1e0=this.array;
var pos=this.position;
var _1e2=this.limit;
if(pos==_1e2){
return "empty";
}
var _1e3=[];
for(var i=pos;i<_1e2;i++){
var hex=(_1e0[i]||0).toString(16);
if(hex.length==1){
hex="0"+hex;
}
_1e3.push(hex);
}
return _1e3.join(" ");
};
_1a4.toString=_1a4.getHexDump;
_1a4.expand=function(_1e6){
return this.expandAt(this.position,_1e6);
};
_1a4.expandAt=function(i,_1e8){
var end=i+_1e8;
if(end>this.capacity){
this.capacity=end;
}
if(end>this.limit){
this.limit=end;
}
return this;
};
function _castToByte(v){
var _1eb=v&255;
return (_1eb>128?_1eb-256:_1eb);
};
function _autoExpand(_1ec,_1ed){
if(_1ec.autoExpand){
_1ec.expand(_1ed);
}
return this;
};
function _checkIndex(_1ee,_1ef){
if(_1ef<0||_1ef>_1ee.capacity){
throw new Error("Index out of bounds");
}
return this;
};
})();
if(typeof (window.ByteSocket)==="undefined"){
ByteSocket=(function(){
var _1f0=function(_1f1){
var _1f2=this;
var _1f3=new URI(_1f1);
var _1f4=_1f3.query;
var _1f5=(_1f4!==undefined)?_1f4.split("&"):[];
_1f5.push("encoding=base64");
_1f3.query=_1f5.join("&");
var ws=new WebSocket(_1f3.toString());
ws.onopen=function(){
_1f2.readyState=ws.readyState;
_1f2.onopen();
};
ws.onmessage=function(evt){
evt.data=fromBase64(evt.data);
_1f2.onmessage(evt);
};
ws.onclosed=function(){
_1f2.readyState=ws.readyState;
_1f2.onclosed();
};
_1f2._ws=ws;
};
var _1f8=_1f0.prototype;
_1f8.onopen=function(){
};
_1f8.onclosed=function(){
};
_1f8.onmessage=function(evt){
};
_1f8.readyState=0;
_1f8.postMessage=function(data){
if(data.constructor!==ByteBuffer){
throw new Error("Sending binary data requires using a ByteBuffer");
}
this._ws.postMessage(toBase64(data));
};
_1f8.disconnect=function(){
this._ws.disconnect();
};
function fromBase64(_1fb){
if(_1fb.length===0){
return [];
}
if(_1fb.length%4!==0){
throw new Error("Invalid base64 string (must be quads)");
}
var _1fc=new ByteBuffer();
for(var i=0;i<_1fb.length;i+=4){
var _1fe=_1fb.charAt(i);
var _1ff=_1fb.charAt(i+1);
var _200=_1fb.charAt(i+2);
var _201=_1fb.charAt(i+3);
var _202=_203[_1fe];
var _204=_203[_1ff];
var _205=_203[_200];
var _206=_203[_201];
_1fc.put(((_202<<2)&252)|((_204>>4)&3));
if(_200!="="){
_1fc.put(((_204<<4)&240)|((_205>>2)&15));
if(_201!="="){
_1fc.put(((_205<<6)&192)|(_206&63));
}
}
}
return _1fc.flip();
};
function toBase64(buf){
var _208=[];
var _209;
var _20a;
var _20b;
while(buf.hasRemaining()){
switch(buf.remaining()){
case 1:
_209=buf.getUnsigned();
_208.push(_20c[(_209>>2)&63]);
_208.push(_20c[((_209<<4)&48)]);
_208.push("=");
_208.push("=");
break;
case 2:
_209=buf.getUnsigned();
_20a=buf.getUnsigned();
_208.push(_20c[(_209>>2)&63]);
_208.push(_20c[((_209<<4)&48)|((_20a>>4)&15)]);
_208.push(_20c[(_20a<<2)&60]);
_208.push("=");
break;
default:
_209=buf.getUnsigned();
_20a=buf.getUnsigned();
_20b=buf.getUnsigned();
_208.push(_20c[(_209>>2)&63]);
_208.push(_20c[((_209<<4)&48)|((_20a>>4)&15)]);
_208.push(_20c[((_20a<<2)&60)|((_20b>>6)&3)]);
_208.push(_20c[_20b&63]);
break;
}
}
return _208.join("");
};
var _20c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
var _203={"=":0};
for(var i=0;i<_20c.length;i++){
_203[_20c[i]]=i;
}
return _1f0;
})();
}
