"use strict";(()=>{var T="openchamber.sdk";var Ge="data-oc-scrolling",ft=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${Ge}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Ge}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Ge}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Ge}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function St(e){let o=e.documentElement;if(o.hasAttribute("data-oc-scrollbar-activity"))return;o.setAttribute("data-oc-scrollbar-activity","");let n=new WeakMap;e.addEventListener("scroll",s=>{let i=s.target===e?o:s.target;if(!(i instanceof Element))return;i.hasAttribute("data-oc-scrolling")||i.setAttribute("data-oc-scrolling","");let _=n.get(i);_!==void 0&&clearTimeout(_),n.set(i,setTimeout(()=>{n.delete(i),i.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Mr=`(${St.toString()})(document);`;var Ao=/^[a-z][a-z0-9-]{0,39}$/;var bo=e=>Object(e)===e&&!Array.isArray(e),Tt=(e,o)=>Object.keys(e).every(n=>o.includes(n)),xo=e=>String(e)===e&&e.length>=1&&e.length<=60,go=e=>String(e)===e&&e.length>=1&&e.length<=80,Oo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let o=new Set;for(let n of e){if(!bo(n)||!Ao.test(n.id)||!xo(n.label)||n.disabled!==void 0&&n.disabled!==!0&&n.disabled!==!1||o.has(n.id))return!1;if(o.add(n.id),n.kind==="button"){if(!Tt(n,["kind","id","label","disabled"]))return!1;continue}if(n.kind!=="select"||!Tt(n,["kind","id","label","value","options","disabled"])||!go(n.value)||!Array.isArray(n.options)||n.options.length<1||n.options.length>16)return!1;let s=new Set;for(let i of n.options){if(!bo(i)||!Tt(i,["value","label"])||!go(i.value)||!xo(i.label)||s.has(i.value))return!1;s.add(i.value)}if(!s.has(n.value))return!1}return!0};var Ro=["{id}","{segment}","{segments+}"];var Mn=new Set(Ro);var ko=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Pn=new Set(ko);var mt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,vo=(e,o)=>{if(e.path!==o.path||e.readOnly!==o.readOnly)return!1;if(e.encoding==="text"||o.encoding==="text")return e.encoding==="text"&&o.encoding==="text"&&e.content===o.content;if(e.bytes.byteLength!==o.bytes.byteLength)return!1;for(let n=0;n<e.bytes.byteLength;n+=1)if(e.bytes[n]!==o.bytes[n])return!1;return!0};var yo=/^[A-Za-z0-9_-]{1,80}$/;var Io=["left","right","top","bottom"];var Co=(e,o=0,n={remaining:16e3})=>{if(--n.remaining<0||o>=32)return!1;if(e===null)return!0;let s=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let i of s)if(!Co(i,o+1,n))return!1;return!0},ht=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(o=>/^(0|[1-9]\d*)$/.test(o)&&Number(o)<e.length)&&e.every(ht);if(Object(e)===e){let o=Object.getPrototypeOf(e);return(o===null||o===Object.prototype)&&Object.values(e).every(ht)}return String(e)===e||Number.isFinite(e)},bt=e=>{try{return String(e.id)!==e.id||!yo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Io.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Co(e.data)||!ht(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var gt=2e3;var Uo=["file","directory","other","missing"],At=e=>!!(e&&"sessionId"in e),Ot=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Mo=/^[0-9a-f]{7,64}$/i,Rt=e=>Mo.test(e),He=500,Xe=32e3,No=16e3,Po=128,Lo=200,Do=2e3,Go=16e3,Ho=80,Xo=200,Vo=16e3;var Bo=2e3;var kt=2e4,Ve=1024,Be=2e6;var Fe=64e3,$e=8e3,vt=4e3;var yt=96e4,Pr=60*6e4;var Fo=999,$o=1e4,ye=500,Ko=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],jo=["stopped","starting","ready","failed"],Lr=new Set(Ko),zo=e=>Lr.has(e),Wo=e=>e&&zo(e)?e:"HOST_REJECTED",fe=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(fe):Object(e)===e?Object.values(e).every(fe):!1,Jo=e=>fe(e)&&JSON.stringify(e).length<=Vo,wo=e=>e?.trim().slice(0,Xo)??"",Se=e=>{let o=e.id.trim().slice(0,Po),n=e.title.trim().slice(0,Lo),s=e.url.trim().slice(0,Do),i=e.text?.trim().slice(0,Go),_=e.author?.trim().slice(0,Ho),h=e.kind==="pull"?"pull":"issue",A={providerId:e.providerId.trim(),id:o,title:n||o,url:s,kind:h};if(i&&(A.text=i),_&&(A.author=_),h==="pull"){let H=wo(e.branches?.head),W=wo(e.branches?.base);H&&W&&(A.branches={head:H,base:W})}return Jo(e.data)&&(A.data=e.data),A},It=e=>{let o=Se(e);return e.projectId&&(o.projectId=e.projectId),e.navigation&&(o.navigation=e.navigation),e.worktree&&(o.worktree=e.worktree),o},Ct=e=>{let o={text:e.text.trim().slice(0,No)};return e.send&&(o.send=!0),o},wt=e=>e===null||!Number.isFinite(e)?null:Math.min(Fo,Math.max(0,Math.round(e))),Ut=e=>Number.isFinite(e)?Math.min($o,Math.max(0,Math.ceil(e))):0;var Te=e=>e.length>0&&e.length<=Ve&&!e.includes("\0")&&!e.includes("\\");var Ke=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Bo?!1:!e.split("/").some(n=>n==="."||n===".."),Dr=new Set(jo),Mt=e=>!!(e&&"status"in e&&Dr.has(String(e.status))&&!("body"in e)),je=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Nt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Pt=e=>!!(e&&"written"in e&&e.written===!0),Lt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Gr=new Set(Uo),Dt=e=>!!(e&&"kind"in e&&"size"in e&&Gr.has(String(e.kind))&&Number.isFinite(e.size)),Gt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Hr=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Xr=e=>Object(e)===e?e:null,xt=e=>String(e)===e&&e.length>0,Vr=e=>{if(!xt(e.id))return null;if(e.ok===!0){let o={channel:T,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(o.payload=e.payload),o}return e.ok===!1&&xt(e.error)?{channel:T,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Wo(xt(e.code)?e.code:void 0)}:null},Ht=e=>{let o=Xr(e);return!o||o.channel!==T||o.v!==1?null:o.type==="result"?Vr(o):!Hr.has(String(o.type))||Object(o.payload)!==o.payload?null:o};var qo=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Br=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",p=class extends Error{code;constructor(o,n){super(n),this.name="HostRequestError",this.code=o}},Qo=()=>Promise.reject(new p("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ze=()=>Promise.reject(new p("BAD_PATH",`File path must be 1 to ${Ve} characters without NUL or backslash.`)),We=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new p("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},E=e=>(e.value+=1,`oc-${e.value}`),$t=(e={})=>{let o=e.target??("window"in globalThis?window:null);if(!o)throw new p("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let n=e.acceptSource??(t=>t===o.parent),s=e.requestTimeoutMs??kt,i=new Set,_=new Set,h=new Set,A=new Set,H=new Set,W=new Set,re=new Set,ce=new Set,de=new Set,le=new Set,pe=new Set,Z=new Set,ue=[],Ee=null,_e=null,d=new Set,S=new Set,f=null,w=null,B=!1,D=new Map,U=new Map,F=new Map,$=!1,u={value:0},l=null,J=null,ke=!1,ve=!1,ao=null,co=t=>t?{sessionId:t.id,phase:t.busy?"started":"completed"}:null,X=t=>{o.parent.postMessage(t,"*")},lo=()=>{$||o.parent===o||Z.size===0||l?.features?.lateGenerateResults!==!0||X({channel:T,v:1,type:"generate-late-listen"})},O=(t,r)=>{for(let a of t)try{a(r)}catch(c){console.error(c)}},po=t=>{if(!(t instanceof MessageEvent)||!n(t.source))return;let r=Ht(t.data);if(!r)return;if(r.type==="workspace"){let c=U.get(r.payload.subscriptionId);c&&O([c],r.payload.snapshot);return}if(r.type==="shells"){let c=F.get(r.payload.subscriptionId);c&&O([c],r.payload.snapshot);return}if(r.type==="ready"){l=r.payload,J=co(r.payload.session),O(i,r.payload),O(_,r.payload.directory),O(h,r.payload.session),J&&O(A,J),O(H,r.payload.connection),O(W,r.payload.settings),O(re,r.payload.item),r.payload.block&&O(ce,r.payload.block),lo();return}if(r.type==="service-event"){O(de,r.payload);return}if(r.type==="generate-late"){Z.size===0?ue.push(r.payload):O(Z,r.payload);return}if(r.type==="directory"){l&&(l={...l,directory:r.payload.directory}),O(_,r.payload.directory);return}if(r.type==="session"){l&&(l={...l,session:r.payload.session}),r.payload.session?J?.sessionId!==r.payload.session.id&&(J=co(r.payload.session)):J=null,O(h,r.payload.session);return}if(r.type==="session-lifecycle"){J=r.payload,O(A,r.payload);return}if(r.type==="connection"){l&&(l={...l,connection:r.payload.connection}),O(H,r.payload.connection);return}if(r.type==="settings"){l&&(l={...l,settings:r.payload.settings}),O(W,r.payload.settings);return}if(r.type==="item"){l&&(l={...l,item:r.payload.item}),O(re,r.payload.item);return}if(r.type==="status-control-event"){O(le,r.payload);return}if(r.type==="popover-closed"){O(pe,r.payload);return}if(r.type==="action"){let c=b=>{$||X({channel:T,v:1,type:"action-result",id:r.id,payload:b})},x=_e;if(!x){c({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>x(r.payload)).then(()=>c({ok:!0}),b=>{let C=(b instanceof Error?b.message:String(b)).trim();c({ok:!1,error:(C||"Action failed.").slice(0,ye)})});return}if(r.type==="file-open"){let c=r.payload;if(w&&vo(w,c))return;w=c,O(d,r.payload);return}if(r.type==="file-saved"){O(S,r.payload.version);return}if(r.type==="file-snapshot"){let c=C=>{$||X({channel:T,v:1,type:"file-snapshot-result",id:r.id,payload:C})},x=C=>c({error:(C.trim()||"Could not read the edited file.").slice(0,ye)}),b=f;if(!b){x("This extension does not edit files.");return}Promise.resolve().then(()=>b(r.payload.purpose)).then(C=>{if(mt(C)>2e7){x(`The file is over ${2e7} ${"bytes"in C?"bytes":"characters"}.`);return}if(C.version.length>256){x(`The snapshot version is over ${256} characters.`);return}c({snapshot:"bytes"in C?{bytes:C.bytes,version:C.version}:{content:C.content,version:C.version}})},C=>x(C instanceof Error?C.message:String(C)));return}if(r.type==="resolve"){let c=b=>{X({channel:T,v:1,type:"resolve-result",id:r.id,payload:b})},x=Ee;if(!x){c({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>x(r.payload)).then(b=>c({item:b?Se(b):null}),b=>{let C=(b instanceof Error?b.message:String(b)).trim();c({error:(C||"Command failed.").slice(0,ye)})});return}let a=D.get(r.id);if(a){if(clearTimeout(a.timer),D.delete(r.id),r.ok){a.resolve(r.payload);return}a.reject(new p(r.code,r.error))}};o.addEventListener("message",po),X({channel:T,v:1,type:"hello"});let L=(t,r=s)=>$||o.parent===o?Promise.reject(new p("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((a,c)=>{let x=setTimeout(()=>{D.delete(t.id),c(new p("HOST_TIMEOUT","Host did not answer in time."))},r);D.set(t.id,{resolve:a,reject:c,timer:x}),X(t)}),y=t=>L(t).then(()=>{}),I={channel:T,v:1},ut=t=>{!$&&o.parent!==o&&X(t)},uo=()=>ut({...I,type:"file-save"}),Eo=t=>{!qo(t)||!Br(t)||(t.preventDefault(),uo())},_o=t=>{!qo(t)||t.key!=="Escape"||l?.surface!=="popover"||!l.popover||(t.preventDefault(),mo(l.popover.id,"escape").catch(()=>{}))},Pe=()=>{let t=l?.surface==="popover"?l.popover:void 0;if(!t)return;let r=ke||ve;ao!==r&&(ao=r,ho(t.id,r).catch(()=>{}))},Le=()=>{l?.surface!=="popover"||ke||(ke=!0,Pe())},fo=t=>{l?.surface!=="popover"||t.relatedTarget!==null||!ke||(ke=!1,Pe())},So=()=>{l?.surface!=="popover"||ve||(ve=!0,Pe())},To=()=>{l?.surface!=="popover"||!ve||(ve=!1,Pe())},K=(t,r=1024)=>{if(!t.trim()||t.length>r)throw new p("HOST_REJECTED",`Identity must contain 1 to ${r} characters.`)},Et=async t=>{t.kind!=="projects"&&K(t.projectId);let r=await L({...I,type:"workspace-read",id:E(u),payload:t});if(!r||!("kind"in r)||!("state"in r)||r.kind!==t.kind)throw new p("HOST_REJECTED","Host did not return workspace data.");return r},_t=async(t,r)=>{t.kind!=="projects"&&K(t.projectId);let a=E(u);U.set(a,r);try{await y({...I,type:"workspace-subscribe",id:E(u),payload:{subscriptionId:a,query:t}})}catch(c){throw U.delete(a),$||X({...I,type:"workspace-unsubscribe",id:E(u),payload:{subscriptionId:a}}),c}return()=>{!U.delete(a)||$||X({...I,type:"workspace-unsubscribe",id:E(u),payload:{subscriptionId:a}})}},Ur=async(t,r)=>{t.kind==="session"&&K(t.sessionId),t.kind==="project"&&K(t.projectId);let a=E(u);F.set(a,r);try{await y({...I,type:"shells-subscribe",id:E(u),payload:{subscriptionId:a,scope:t}})}catch(c){throw F.delete(a),$||X({...I,type:"shells-unsubscribe",id:E(u),payload:{subscriptionId:a}}),c}return()=>{!F.delete(a)||$||X({...I,type:"shells-unsubscribe",id:E(u),payload:{subscriptionId:a}})}},De=async t=>{if("key"in t&&(t.key.length===0||t.key.length>128))throw new p("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!fe(t.value))throw new p("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>65536)throw new p("HOST_REJECTED","Storage value exceeds 64 KiB.");if(t.scope==="device"&&l?.features?.deviceStorage!==!0)throw new p("UNSUPPORTED","This host does not support device storage.");let r=await L({...I,type:"storage",id:E(u),payload:t});if(!r||!("storage"in r)||r.op!==t.op)throw new p("HOST_REJECTED","Host did not return storage data.");return r},mo=(t,r)=>l?.features?.popovers!==!0&&!(l?.surface==="popover"&&l.popover?.id===t)?Promise.reject(new p("UNSUPPORTED","This host does not support popovers.")):y({...I,type:"popover-close",id:E(u),payload:r?{id:t,reason:r}:{id:t}}),ho=(t,r)=>l?.features?.popovers!==!0&&!(l?.surface==="popover"&&l.popover?.id===t)?Promise.reject(new p("UNSUPPORTED","This host does not support popovers.")):y({...I,type:"popover-anchor",id:E(u),payload:{id:t,active:r}});return o.addEventListener("keydown",_o,!0),o.addEventListener("pointerover",Le),o.addEventListener("pointermove",Le),o.addEventListener("pointerout",fo),o.addEventListener("focus",So),o.addEventListener("blur",To),{onAction:t=>(_e=t,()=>{_e===t&&(_e=null)}),listProjects:async()=>{let t=await Et({kind:"projects"});if(t.kind!=="projects")throw new p("HOST_REJECTED","Expected projects.");return t},listWorktrees:async t=>{let r=await Et({kind:"worktrees",projectId:t});if(r.kind!=="worktrees")throw new p("HOST_REJECTED","Expected worktrees.");return r},listSessions:async t=>{let r=await Et({kind:"sessions",projectId:t});if(r.kind!=="sessions")throw new p("HOST_REJECTED","Expected sessions.");return r},onProjects:t=>_t({kind:"projects"},r=>{r.kind==="projects"&&t(r)}),onWorktrees:(t,r)=>_t({kind:"worktrees",projectId:t},a=>{a.kind==="worktrees"&&r(a)}),onSessions:(t,r)=>_t({kind:"sessions",projectId:t},a=>{a.kind==="sessions"&&r(a)}),onRunningShells:(t,r)=>Ur(t,r),readShellOutput:async(t,r)=>{K(t,128);let a=r?.cursor;if(a!==void 0&&(!Number.isInteger(a)||a<0))throw new p("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let c=r?.tailBytes;if(c!==void 0&&(!Number.isInteger(c)||c<1||c>65536))throw new p("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let b=await L({...I,type:"shell-output",id:E(u),payload:{shellId:t,cursor:a,tailBytes:c}});if(!b||typeof b.output!="string"||!Number.isFinite(b.cursor))throw new p("HOST_REJECTED","Host did not return shell output.");return b},stopShell:async t=>{if(K(t,128),(await L({...I,type:"shell-stop",id:E(u),payload:{shellId:t}}))?.stopped!==!0)throw new p("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async t=>{K(t),await y({...I,type:"open-session",id:E(u),payload:{sessionId:t}})},storage:{get:async(t,r)=>{let a=We(r),c={op:"get",key:t};a&&(c.scope=a);let x=await De(c);return x.op==="get"&&x.found?x.value:void 0},set:async(t,r,a)=>{let c=We(a),x={op:"set",key:t,value:r};c&&(x.scope=c),await De(x)},delete:async(t,r)=>{let a=We(r),c={op:"delete",key:t};a&&(c.scope=a),await De(c)},keys:async t=>{let r=We(t),a={op:"keys"};r&&(a.scope=r);let c=await De(a);if(c.op!=="keys")throw new p("HOST_REJECTED","Expected storage keys.");return c.keys}},onReady:t=>(i.add(t),l&&t(l),()=>{i.delete(t)}),onDirectory:t=>(_.add(t),l&&t(l.directory),()=>{_.delete(t)}),onSession:t=>(h.add(t),l&&t(l.session),()=>{h.delete(t)}),onSessionLifecycle:t=>(A.add(t),J&&t(J),()=>{A.delete(t)}),onConnection:t=>(H.add(t),l&&t(l.connection),()=>{H.delete(t)}),onSettings:t=>(W.add(t),l&&t(l.settings),()=>{W.delete(t)}),onItem:t=>(re.add(t),l&&t(l.item),()=>{re.delete(t)}),onBlock:t=>(ce.add(t),l?.block&&t(l.block),()=>{ce.delete(t)}),onServiceEvent:t=>(de.add(t),()=>{de.delete(t)}),onStatusControl:t=>(le.add(t),()=>{le.delete(t)}),onPopoverClosed:t=>(pe.add(t),()=>{pe.delete(t)}),setStatusControls:t=>l?.features?.statusControls!==!0?Promise.reject(new p("UNSUPPORTED","This host does not support status controls.")):Oo(t)?y({...I,type:"status-controls",id:E(u),payload:{controls:t}}):Promise.reject(new p("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:t=>l?.features?.popovers!==!0?Promise.reject(new p("UNSUPPORTED","This host does not support popovers.")):bt(t)?y({...I,type:"popover-open",id:E(u),payload:t}):Promise.reject(new p("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:mo,setPopoverAnchorActive:ho,onResolve:t=>(Ee=t,()=>{Ee===t&&(Ee=null)}),toast:t=>{let r=t.message.trim();return!r||r.length>He?Promise.reject(new p("HOST_REJECTED",`Toast message must contain 1 to ${He} characters.`)):t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>Xe)?Promise.reject(new p("HOST_REJECTED",`Toast copy text must contain 1 to ${Xe} characters.`)):y({channel:T,v:1,type:"toast",id:E(u),payload:{...t,message:r}})},openUrl:t=>y({channel:T,v:1,type:"open-url",id:E(u),payload:{url:t}}),openCommit:t=>Rt(t)?y({channel:T,v:1,type:"open-commit",id:E(u),payload:{sha:t}}):Promise.reject(new p("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:t=>y({channel:T,v:1,type:"block-answer",id:E(u),payload:{text:t.trim().slice(0,gt)}}),openSurface:t=>y({channel:T,v:1,type:"open-surface",id:E(u),payload:{surfaceId:t}}),writeClipboard:t=>y({channel:T,v:1,type:"clipboard-write",id:E(u),payload:{text:t}}),compose:t=>y({channel:T,v:1,type:"compose",id:E(u),payload:t}),attach:t=>y({channel:T,v:1,type:"attach",id:E(u),payload:Se(t)}),startSession:async t=>{t.projectId!==void 0&&K(t.projectId);let r=t.worktree;r&&r!==!0&&(r.kind==="existing"?K(r.directory):(r.name!==void 0&&K(r.name,200),r.baseBranch!==void 0&&K(r.baseBranch,200)));let a=await L({channel:T,v:1,type:"start-session",id:E(u),payload:It(t)},e.requestTimeoutMs??18e4);if(!At(a))throw new p("HOST_REJECTED","Host did not return a session.");return a},prompt:t=>L({channel:T,v:1,type:"prompt",id:E(u),payload:Ct(t)}).then(r=>{if(!Ot(r))throw new p("HOST_REJECTED","Host did not return a prompt result.");return r}),sessionLink:t=>y({channel:T,v:1,type:"session-link",id:E(u),payload:Se(t)}),close:()=>y({channel:T,v:1,type:"close",id:E(u)}),oauthStart:()=>y({channel:T,v:1,type:"oauth-start",id:E(u)}),oauthDisconnect:()=>y({channel:T,v:1,type:"oauth-disconnect",id:E(u)}),request:t=>(Ke(t.path)?L({channel:T,v:1,type:"request",id:E(u),payload:t}):Qo()).then(r=>{if(!je(r))throw new p("HOST_REJECTED","Host request result was empty.");return r}),serviceRequest:t=>(Ke(t.path)?L({channel:T,v:1,type:"service-request",id:E(u),payload:t}):Qo()).then(r=>{if(!je(r))throw new p("HOST_REJECTED","Host service request result was empty.");return r}),serviceStatus:()=>L({channel:T,v:1,type:"service-status",id:E(u)}).then(t=>{if(!Mt(t))throw new p("HOST_REJECTED","Host did not return service status.");return t}),readFile:t=>(Te(t)?L({channel:T,v:1,type:"file-read",id:E(u),payload:{path:t}}):ze()).then(r=>{if(!Nt(r))throw new p("HOST_REJECTED","Host did not return file content.");return r}),writeFile:(t,r)=>Te(t)?r.length>Be?Promise.reject(new p("FILE_TOO_LARGE",`Content is over ${Be} characters.`)):L({channel:T,v:1,type:"file-write",id:E(u),payload:{path:t,content:r}}).then(a=>{if(!Pt(a))throw new p("HOST_REJECTED","Host did not confirm the write.");return a}):ze(),listDir:t=>(Te(t)?L({channel:T,v:1,type:"file-list",id:E(u),payload:{path:t}}):ze()).then(r=>{if(!Lt(r))throw new p("HOST_REJECTED","Host did not return directory entries.");return r}),stat:t=>(Te(t)?L({channel:T,v:1,type:"file-stat",id:E(u),payload:{path:t}}):ze()).then(r=>{if(!Dt(r))throw new p("HOST_REJECTED","Host did not return file status.");return r}),generate:t=>{let r=t.prompt.trim(),a=t.system?.trim();if(r.length===0||r.length>Fe)return Promise.reject(new p("HOST_REJECTED",`Prompt must be 1 to ${Fe} characters.`));if(a!==void 0&&(a.length===0||a.length>$e))return Promise.reject(new p("HOST_REJECTED",`System prompt must be 1 to ${$e} characters.`));let c=t.maxOutputTokens===void 0?void 0:Math.min(vt,Math.max(1,Math.floor(t.maxOutputTokens)));if(c!==void 0&&!Number.isFinite(c))return Promise.reject(new p("HOST_REJECTED","maxOutputTokens must be a number."));let x={prompt:r};return a!==void 0&&(x.system=a),c!==void 0&&(x.maxOutputTokens=c),L({channel:T,v:1,type:"generate",id:E(u),payload:x},e.requestTimeoutMs??yt).then(b=>{if(!Gt(b))throw new p("HOST_REJECTED","Host did not return generated text.");return b})},onLateGenerateResult:t=>{Z.add(t);for(let r of ue.splice(0))O([t],r);return lo(),()=>{Z.delete(t)}},setBadge:t=>y({channel:T,v:1,type:"badge",id:E(u),payload:{count:wt(t)}}),setHeight:t=>y({channel:T,v:1,type:"resize",id:E(u),payload:{height:Ut(t)}}),onFileOpen:t=>(d.add(t),B||(B=!0,o.addEventListener("keydown",Eo,!0)),w&&t(w),()=>{d.delete(t)}),onFileSnapshot:t=>(f=t,()=>{f===t&&(f=null)}),onFileSaved:t=>(S.add(t),()=>{S.delete(t)}),reportFileChange:t=>ut({...I,type:"file-change",payload:{dirty:t.dirty,edited:t.edited}}),requestFileSave:uo,reportFileUnsupported:()=>ut({...I,type:"file-unsupported"}),dispose:()=>{for(let t of U.keys())X({...I,type:"workspace-unsubscribe",id:E(u),payload:{subscriptionId:t}});U.clear();for(let t of F.keys())X({...I,type:"shells-unsubscribe",id:E(u),payload:{subscriptionId:t}});F.clear(),$=!0,Ee=null,_e=null,f=null,d.clear(),S.clear(),B&&o.removeEventListener("keydown",Eo,!0),o.removeEventListener("message",po),o.removeEventListener("keydown",_o,!0),o.removeEventListener("pointerover",Le),o.removeEventListener("pointermove",Le),o.removeEventListener("pointerout",fo),o.removeEventListener("focus",So),o.removeEventListener("blur",To);for(let t of D.values())clearTimeout(t.timer),t.reject(new p("HOST_UNAVAILABLE","Host client was disposed."));D.clear(),i.clear(),_.clear(),h.clear(),A.clear(),H.clear(),W.clear(),re.clear(),ce.clear(),de.clear(),le.clear(),pe.clear(),Z.clear(),ue.length=0}}};var er=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var qn=new Set(er);var Fr=10*6e4;var $r=10*6e4;var Kr=10*6e4;var jr=10*6e4;var tr=["none","agent","user"];var Yn=new Set(tr);var zr=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Wr=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],or=(e,o)=>{o.style.colorScheme=e.mode;for(let[n,s]of zr)o.style.setProperty(n,e.tokens[s]);for(let[n,s,i]of Wr){let _=e.tokens[i]??"";o.style.setProperty(n,_),o.style.setProperty(s,_)}o.style.setProperty("font-family",e.tokens.font),o.style.setProperty("font-size","0.875rem"),o.style.setProperty("line-height","1.45"),o.style.setProperty("color",e.tokens.foreground)},Kt=(e,o)=>{or(e.theme,o),o.dataset&&(o.dataset.ocSurface=e.surface,o.dataset.ocTheme=e.theme.mode)};var Jr={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},g=(e,o)=>`var(--${e}, var(--oc-${Jr[e]}, ${o}))`,Q=g("surface-background","transparent"),qe=g("surface-elevated","transparent"),me=g("surface-elevated-foreground","inherit"),V=g("surface-foreground","inherit"),R=g("surface-muted-foreground","gray"),qr=g("surface-muted","transparent"),ne=g("interactive-border","currentColor"),G=g("interactive-hover","transparent"),se=g("interactive-active","transparent"),jt=g("interactive-selection","transparent"),zt=g("interactive-selection-foreground","inherit"),q=g("primary","currentColor"),Wt=g("primary-text","inherit"),Jt=g("error-text","inherit"),Qr=g("font-sans","inherit"),qt=g("font-mono","monospace"),ir=g("radius","9px"),Qt=`calc(${ir} - 2px)`,rr=`calc(${ir} - 4px)`,k=(e,o,n="transparent")=>`color-mix(in srgb, ${e} ${o}%, ${n})`,nr=`background-image: linear-gradient(${G}, ${G});`,Yt=(e,o="0.5px")=>`box-shadow: inset 0 0 0 ${o} ${e}, var(--oc-sdk-field-lift);`,Zt="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",sr="box-shadow: var(--oc-sdk-lit);",eo=`inset 0 0.5px 0 0 ${k(V,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Yr=`
:root {
  --oc-sdk-edge: ${k(V,16)};
  --oc-sdk-field-bg: ${qe};
  --oc-sdk-raised-bg: ${Q};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${k(V,14)};
  --oc-sdk-field-bg: ${k(Q,50,qe)};
  --oc-sdk-raised-bg: ${qe};
  --oc-sdk-field-lift: ${eo};
  --oc-sdk-raised-lift: ${eo};
  --oc-sdk-lit: ${eo};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Je=e=>{let o=g(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${o}; --oc-sdk-tone-text: ${g(`${e}-text`,"inherit")}; }`},Zr=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: 2px; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`,ar=`${Yr}
.oc-sdk { color: ${V}; font-family: ${Qr}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${nr} }
.oc-sdk-mono { font-family: ${qt}; }
.oc-sdk-muted { color: ${R}; }
${Je("success")}${Je("warning")}${Je("error")}${Je("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${q}; --oc-sdk-tone-text: ${Wt}; }

.oc-sdk-btn { border-radius: ${Qt}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${rr}; }
.oc-sdk-btn[data-variant="default"] { color: ${Wt}; background: ${k(q,10,Q)}; border-color: ${k(q,12)}; ${sr} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${k(q,16,Q)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${k(q,22,Q)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${qr}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${se}, ${se}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${me}; ${Zt} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${se}, ${se}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${G}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${se}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${g("status-error","red")}; color: ${Jt}; background: ${k("var(--oc-sdk-tone)",7,Q)}; border-color: ${k("var(--oc-sdk-tone)",12)}; ${sr} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${k("var(--oc-sdk-tone)",9,Q)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${k("var(--oc-sdk-tone)",11,Q)}; box-shadow: none; }

.oc-sdk-field-note { color: ${R}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Jt}; }
.oc-sdk-input { border-radius: ${Qt}; background: var(--oc-sdk-field-bg); color: ${me}; ${Yt("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${R}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Yt(k(V,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Yt(g("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${qt}; }

.oc-sdk-search-icon { color: ${R}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${q}; }
.oc-sdk-search-clear { border-radius: ${rr}; color: ${R}; }
.oc-sdk-search-clear:hover { background: ${G}; color: ${V}; }

.oc-sdk-trigger { border-radius: ${Qt}; background: var(--oc-sdk-raised-bg); color: ${me}; ${Zt} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${G}, ${G}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${se}, ${se}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${R}; }
.oc-sdk-trigger-chevron { color: ${R}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${me}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${qe}; background-clip: padding-box; color: ${me}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${G}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${jt}; color: ${zt}; }
.oc-sdk-option-check { color: ${V}; }
.oc-sdk-option[data-destructive="true"] { color: ${Jt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${k(g("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${R}; }
.oc-sdk-popup-empty { color: ${R}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${ne}; border-radius: 4px; color: ${V}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${k(V,60,ne)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${ne}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${Q}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${q}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${nr} }
.oc-sdk-check-desc { color: ${R}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${k(V,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${R}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${V}; }
.oc-sdk-tab[aria-selected="true"] { color: ${zt}; background: ${jt}; border-color: ${ne}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${me}; background: var(--oc-sdk-raised-bg); ${Zt} }
.oc-sdk-tab-count { color: ${R}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${k(V,6)}; color: ${R}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${k("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${G}; }
.oc-sdk-row[aria-selected="true"] { background: ${jt}; color: ${zt}; }
.oc-sdk-row-lead { font-family: ${qt}; color: ${R}; }
.oc-sdk-row-sub { color: ${R}; }
.oc-sdk-row-meta { color: ${R}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${R}; }

.oc-sdk-empty-body { color: ${R}; }

.oc-sdk-spinner { color: ${R}; }
.oc-sdk-spinner-ring { border-color: ${ne}; border-top-color: ${q}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${k("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${R}; }

.oc-sdk-separator { color: ${R}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${k(ne,40)}; }

.oc-sdk-progress-label { color: ${R}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${k(V,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${q}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${g("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${g("success-text","inherit")}; }

.oc-sdk-text a { color: ${Wt}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${k(ne,60)}; }
`,M=`
${ft}
${Zr}
${ar}`;var cr="oc-sdk-ui-style";var N=e=>{let o=document.getElementById(cr);if(o instanceof HTMLStyleElement){o.textContent!==e&&(o.textContent=e);return}St(document);let n=document.createElement("style");n.id=cr,n.textContent=e,document.head.appendChild(n)},P=(e,o)=>{let n=document.createElement(e);return o&&(n.className=o),n},ee=e=>{let o=P("button",e);return o.type="button",o},j=(e,o)=>{let n=o??"";e.textContent!==n&&(e.textContent=n)};var en=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},te=(e,o)=>{N(M);let n=o,s=ee("oc-sdk oc-sdk-btn"),i=en(),_=document.createElement("span");s.append(_),e.append(s);let h=()=>{s.dataset.variant=n.variant??"default",s.dataset.size=n.size??"default",s.disabled=!!n.disabled||!!n.loading,s.dataset.loading=n.loading?"true":"false",s.setAttribute("aria-busy",n.loading?"true":"false"),n.loading&&i.parentNode!==s?s.prepend(i):!n.loading&&i.parentNode===s&&i.remove(),j(_,n.label)},A=()=>{n.disabled||n.loading||n.onClick()};return s.addEventListener("click",A),h(),{update:H=>{n={...n,...H},h()},dispose:()=>{s.removeEventListener("click",A),s.remove()}}};var dr=()=>typeof navigator<"u"&&navigator.language?navigator.language:"en",lr=e=>(e??"").toLowerCase().startsWith("zh")?"zh":"en",pr=(e,o)=>o?e.replace(/\{(\w+)\}/g,(n,s)=>Object.prototype.hasOwnProperty.call(o,s)?String(o[s]):n):e,tt=(e,o)=>pr(e,o),ur=(e,o=dr())=>{let n=o||"en",s=lr(n);return{t:(_,h)=>pr(s==="zh"?_:e[_]??_,h),get language(){return s},get locale(){return n},setLocale(_){let h=_||dr(),A=lr(h);return n=h,A===s?!1:(s=A,!0)}}},to=e=>{document.documentElement.lang=e.language==="zh"?"zh-CN":"en"};var be="~/.config/opencode/agents/build.md",oo="~/.config/openchamber/prompt-override",xe=`${oo}/state.json`,ge=`${oo}/presets.json`,ie=`${oo}/backups`,Ce=`---
mode: all
---

`,ot=1e5,rt=40,nt=60,Er="\u57FA\u7EBF\u5FEB\u7167\uFF08\u4EC5\u8BB0\u5F55\uFF0C\u4E0D\u7528\u4E8E\u8FD8\u539F\uFF09",he=class extends Error{},st=(e,o)=>e.exists===o.exists&&e.content===o.content,we=e=>e.trim()===""||e.trim()===`---
mode: all
---`,_r=e=>`---
mode: all
---

${e.trim()}
`;var fr=e=>{if(!e||typeof e!="object")return!1;let o=e;return typeof o.exists=="boolean"&&typeof o.content=="string"},ln=e=>{if(!e||typeof e!="object")return!1;let o=e;return typeof o.id=="string"&&o.id.length>0&&o.id.length<=120&&typeof o.name=="string"&&o.name.trim().length>0&&o.name.length<=nt&&typeof o.content=="string"&&o.content.length<=ot&&Number.isFinite(o.createdAt)&&Number.isFinite(o.updatedAt)},Ue=tt,pn=e=>/^\d{13}-[a-f0-9-]{36}$/.test(e),Sr=(e,o=Ue)=>{if(!e.trim())throw new Error(o("\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u4E3A\u7A7A\u3002"));if(e.length>ot)throw new Error(o("\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u8D85\u8FC7 {count} \u4E2A\u5B57\u7B26\u3002",{count:ot.toLocaleString()}));if(e.includes("\0"))throw new Error(o("\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u5305\u542B\u7A7A\u5B57\u8282\u3002"))},un=(e,o=Ue)=>{let n=e.trim();if(!n)throw new Error(o("\u8BF7\u586B\u5199\u9884\u8BBE\u540D\u79F0\u3002"));if(n.length>nt)throw new Error(o("\u9884\u8BBE\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 {count} \u4E2A\u5B57\u7B26\u3002",{count:nt}));if(/[\0\r\n]/.test(n))throw new Error(o("\u9884\u8BBE\u540D\u79F0\u5305\u542B\u65E0\u6548\u5B57\u7B26\u3002"));return n},En=(e,o=Ue)=>{try{let n=JSON.parse(e);if(n.version!==1||!fr(n.baseline)||!fr(n.applied))throw new Error;if(!Number.isFinite(n.appliedAt)||typeof n.baselineLabel!="string")throw new Error;return n}catch{throw new Error(o("\u8986\u76D6\u72B6\u6001\u6587\u4EF6\u683C\u5F0F\u6709\u8BEF\uFF0C\u73B0\u6709 build.md \u672A\u4FEE\u6539\u3002\u8BF7\u4FEE\u590D state.json \u6216\u4ECE\u5907\u4EFD\u6062\u590D\u3002"))}},_n=(e,o=Ue)=>{try{let n=JSON.parse(e);if(!n||typeof n!="object"||n.version!==1||!Array.isArray(n.presets))throw new Error;if(n.presets.length>rt||!n.presets.every(ln))throw new Error;return{version:1,presets:n.presets.map(s=>({...s}))}}catch{throw new Error(o("\u9884\u8BBE\u5E93\u6587\u4EF6\u683C\u5F0F\u6709\u8BEF\uFF0C\u73B0\u6709 presets.json \u672A\u4FEE\u6539\u3002\u8BF7\u4FEE\u590D\u540E\u518D\u4FDD\u5B58\u9884\u8BBE\u3002"))}},fn=(e,o)=>o.exists?we(o.content)?"builtin":e?st(o,e.baseline)?"baseline":st(o,e.applied)?"applied":"drifted":"drifted":"missing",Sn=(e,o,n)=>e.state?e.state.baseline:o.kind==="restore"?{exists:!0,content:we(o.content)?Ce:o.content}:o.kind==="backup"?{exists:!0,content:we(o.content)?o.content:Ce}:n,Tr=(e,o=Date.now,n=()=>crypto.randomUUID(),s=Ue)=>{let i=async()=>{let d=await e.read(be);return{exists:d!==null,content:d??""}},_=async()=>e.read(xe),h=async()=>{let[d,S]=await Promise.all([i(),_()]),f=S===null?null:En(S,s);return{state:f,stateRaw:S,current:d,status:fn(f,d)}},A=async()=>{let d=await e.read(ge);return d===null?[]:_n(d,s).presets},H=async d=>{let f=JSON.stringify({version:1,presets:d},null,2);if(await e.write(ge,f),await e.read(ge)!==f)throw new Error(s("\u9884\u8BBE\u5E93\u56DE\u8BFB\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002"));return d.map(w=>({...w}))},W=async d=>{let S=un(d.name,s);Sr(d.content,s);let f=await A();if(f.find(u=>u.id!==d.id&&u.name.toLowerCase()===S.toLowerCase()))throw new Error(s("\u5DF2\u5B58\u5728\u540C\u540D\u9884\u8BBE\u201C{name}\u201D\u3002",{name:S}));let B=o(),D=d.content.trim(),U=d.id?f.findIndex(u=>u.id===d.id):-1,F;if(U>=0)F={...f[U],name:S,content:D,updatedAt:B},f[U]=F;else{if(f.length>=rt)throw new Error(s("\u9884\u8BBE\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\uFF08{count} \u4E2A\uFF09\u3002",{count:rt}));F={id:n(),name:S,content:D,createdAt:B,updatedAt:B},f.unshift(F)}return{presets:await H(f),saved:F}},re=async d=>{let S=await A(),f=S.filter(w=>w.id!==d);return f.length===S.length?S:H(f)},ce=async(d,S)=>{let f=o(),w=`${f}-${n()}`,B={version:1,id:w,createdAt:f,label:d,content:S},D=`${ie}/${w}.json`,U=JSON.stringify(B,null,2);if(await e.write(D,U),await e.read(D)!==U)throw new Error(s("\u5907\u4EFD\u6821\u9A8C\u5931\u8D25\uFF0C\u76EE\u6807\u6587\u4EF6\u672A\u4FEE\u6539\u3002"));return w},de=async(d,S)=>(Sr(S,s),{kind:"apply",before:d.current,content:_r(S),label:s("\u5E94\u7528\u8986\u76D6")}),le=async d=>({kind:"restore",before:d.current,content:Ce,label:s("\u8FD8\u539F\u4E3A\u7A7A\uFF08\u4EA4\u56DE\u9ED8\u8BA4\uFF09")}),pe=d=>({kind:"inspect",before:d.state?.applied??{exists:!0,content:Ce},content:d.current.content,label:s("\u5916\u90E8\u4FEE\u6539\u5DEE\u5F02\u5BF9\u6BD4")}),Z=async()=>(await e.list(ie)).filter(d=>/^\d{13}-[a-f0-9-]{36}\.json$/.test(d)).sort().reverse().slice(0,50).map(d=>d.slice(0,-5)),ue=async d=>{if(!pn(d))throw new Error(s("\u5907\u4EFD\u7F16\u53F7\u65E0\u6548\u3002"));let S=await e.read(`${ie}/${d}.json`);try{let f=JSON.parse(S??"");if(f.version!==1||f.id!==d||!Number.isFinite(f.createdAt)||typeof f.label!="string"||typeof f.content!="string")throw new Error;return f}catch{throw new Error(s("\u5907\u4EFD\u7F3A\u5931\u6216\u683C\u5F0F\u6709\u8BEF\uFF0C\u672A\u4FEE\u6539 build.md\u3002"))}};return{load:h,loadPresets:A,savePreset:W,deletePreset:re,reviewApply:de,reviewRestore:le,reviewDrift:pe,reviewBackup:async d=>{let S=await ue(d);return{kind:"backup",before:await i(),content:S.content,label:s("\u6062\u590D\u5907\u4EFD {time}",{time:new Date(S.createdAt).toLocaleString()}),backupId:d}},apply:async(d,S)=>{if(S.kind==="inspect")throw new Error(s("\u53EA\u8BFB\u5DEE\u5F02\u5BF9\u6BD4\u4E0D\u80FD\u76F4\u63A5\u5199\u5165\u3002"));let[f,w]=await Promise.all([i(),_()]);if(w!==d.stateRaw)throw new he(s("\u8986\u76D6\u72B6\u6001\u5DF2\u88AB\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u64CD\u4F5C\u3002"));if(!st(f,S.before))throw new he(s("build.md \u5728\u9884\u89C8\u540E\u5DF2\u88AB\u4FEE\u6539\uFF0C\u672A\u5199\u5165\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u5E76\u9884\u89C8\u5DEE\u5F02\u3002"));if(f.exists&&f.content===S.content)return h();f.exists&&await ce(s("{label}\u524D",{label:S.label}),f.content),await e.write(be,S.content);let B=await i();if(!B.exists||B.content!==S.content)throw new he(s("\u5199\u5165\u540E\u6587\u4EF6\u5185\u5BB9\u4E0E\u9884\u89C8\u4E0D\u4E00\u81F4\uFF0C\u53EF\u80FD\u6709\u5176\u4ED6\u7F16\u8F91\u5668\u540C\u65F6\u5199\u5165\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u64CD\u4F5C\u524D\u7684\u5907\u4EFD\u4ECD\u53EF\u67E5\u770B\u3002"));let D={version:1,baseline:Sn(d,S,f),applied:{exists:!0,content:S.content},appliedAt:o(),baselineLabel:d.state?.baselineLabel??Er},U=JSON.stringify(D,null,2);if(await e.write(xe,U),await e.read(xe)!==U)throw new Error(s("build.md \u5DF2\u5199\u5165\uFF0C\u4F46\u8986\u76D6\u72B6\u6001\u56DE\u8BFB\u4E0D\u4E00\u81F4\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u786E\u8BA4\uFF0C\u4E0D\u8981\u91CD\u590D\u5E94\u7528\u3002"));return h()},listBackups:Z,readBackup:ue}};var ro=tt,it=e=>e&&typeof e=="object"&&"code"in e?e.code:void 0,Tn=(e,o,n)=>e===be?n("build.md \u8986\u76D6"):e===xe?n("\u8986\u76D6\u72B6\u6001"):e===ge?n("\u9884\u8BBE\u5E93"):e===`${ie}`&&o==="list"?n("\u5907\u4EFD\u5217\u8868"):e.startsWith(`${ie}/`)?n("\u5907\u4EFD\u6587\u4EF6"):n(o==="list"?"\u6587\u4EF6\u5217\u8868":"\u6587\u4EF6"),mr=(e,o,n)=>{let s=it(e);if(s==="NOT_GRANTED")return n("\u8BF7\u5728\u8BBE\u7F6E \u2192 \u6269\u5C55\u4E2D\u5141\u8BB8\u201C\u5185\u7F6E\u63D0\u793A\u8BCD\u201D\u8BBF\u95EE build.md \u4E0E\u8986\u76D6\u6570\u636E\u76EE\u5F55\u3002");if(s==="DENIED")return n("\u6587\u4EF6\u6743\u9650\u4E0D\u8DB3\uFF0C\u8BF7\u68C0\u67E5 build.md \u6216\u8986\u76D6\u6570\u636E\u76EE\u5F55\u7684\u6743\u9650\u3002");if(s==="HOST_TIMEOUT")return n("\u5BBF\u4E3B\u54CD\u5E94\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u6587\u4EF6\u786E\u8BA4\u5B9E\u9645\u72B6\u6001\uFF0C\u518D\u7EE7\u7EED\u64CD\u4F5C\u3002");if(s==="BAD_PATH")return n("\u76EE\u6807\u8DEF\u5F84\u4E0D\u5728\u6388\u6743\u8303\u56F4\u5185\uFF0C\u6216\u7B26\u53F7\u94FE\u63A5\u6307\u5411\u4E86\u5176\u4ED6\u76EE\u5F55\u3002");if(s==="HOST_REJECTED"){let i=e instanceof Error?e.message:"";if(o&&i==="Extension operation failed.")return n("\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u542B\u4E2D\u6587\u7B49\u5B57\u7B26\uFF0C\u89E6\u53D1\u4E86 OpenChamber \u6587\u4EF6\u63A5\u53E3\u7684\u517C\u5BB9\u95EE\u9898\u3002\u53EF\u6682\u65F6\u5728\u65E0\u9879\u76EE\u4F1A\u8BDD\u4E2D\u4ECE\u53F3\u4FA7\u6253\u5F00\u201C\u5185\u7F6E\u63D0\u793A\u8BCD\u201D\u3002");if(!i||i==="Extension operation failed."||i==="File operation failed.")return n("OpenChamber \u6587\u4EF6\u63A5\u53E3\u8FD4\u56DE\u5F02\u5E38\uFF0C\u672A\u63D0\u4F9B\u5177\u4F53\u539F\u56E0\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u6301\u7EED\u5931\u8D25\u65F6\u91CD\u65B0\u52A0\u8F7D\u9762\u677F\u3002")}return e instanceof Error?e.message:n("\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002")},Ae=class extends Error{code;constructor(o,n,s,i,_=ro){let h=_(o==="write"?"\u5199\u5165":"\u8BFB\u53D6");super(_("{action} {target}\u5931\u8D25\uFF1A{reason}{suffix}",{action:h,target:Tn(n,o,_),reason:mr(s,i,_),suffix:o==="write"?_(" \u5199\u5165\u7ED3\u679C\u5C1A\u672A\u786E\u8BA4\uFF0C\u8BF7\u5148\u91CD\u65B0\u8BFB\u53D6\u5B9E\u9645\u72B6\u6001\uFF0C\u52FF\u76F4\u63A5\u91CD\u590D\u5199\u5165\u3002"):""}),{cause:s}),this.name="FileOperationError",this.code=it(s)}},hr=(e,o=ro)=>{let n=!1,s=i=>{n=/[^\u0000-\u00ff]/.test(i??"")};return e.onReady(i=>s(i.directory)),e.onDirectory(s),{async read(i){let _=n;try{return(await e.readFile(i)).content}catch(h){if(it(h)==="NOT_FOUND")return null;throw new Ae("read",i,h,_,o)}},async write(i,_){let h=n;try{await e.writeFile(i,_)}catch(A){throw new Ae("write",i,A,h,o)}},async list(i){let _=n;try{return(await e.listDir(i)).entries.filter(h=>h.kind==="file").map(h=>h.name)}catch(h){if(it(h)==="NOT_FOUND")return[];throw new Ae("list",i,h,_,o)}}}},no=(e,o=ro)=>e instanceof Ae?e.message:mr(e,!1,o);var Y=(e,o="",n)=>{let s=document.createElement(e);return s.className=o,n!==void 0&&(s.textContent=n),s},br=(e,o=n=>n)=>o(e==="builtin"?"\u672A\u8986\u76D6\uFF08\u4EA4\u56DE OpenCode \u9ED8\u8BA4\uFF09":e==="baseline"?"\u5339\u914D\u57FA\u7EBF\u5FEB\u7167":e==="applied"?"\u5DF2\u5E94\u7528\u8986\u76D6":e==="drifted"?"\u6587\u4EF6\u5DF2\u88AB\u5916\u90E8\u4FEE\u6539":"build.md \u7F3A\u5931"),xr=(e,o=n=>n)=>o(e==="builtin"?"\u672A\u8986\u76D6":e==="baseline"?"\u57FA\u7EBF":e==="applied"?"\u5DF2\u8986\u76D6":e==="drifted"?"\u5916\u90E8\u4FEE\u6539":"\u7F3A\u5931");var gr=`/* Shared foundation for OpenChamber extensions. Colors and fonts belong to the host. */
:root {
  --ext-bg: var(--surface-background, var(--oc-bg, transparent));
  --ext-space-1: 4px;
  --ext-space-2: 8px;
  --ext-space-3: 12px;
  --ext-space-4: 16px;
  --ext-space-6: 24px;
  --ext-text-small: 11px;
  --ext-text-body: 13px;
  --ext-text-title: 14px;
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
}
* {
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [data-oc-scrolling] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
@supports selector(::-webkit-scrollbar) {
  *, :hover, [data-oc-scrolling] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [data-oc-scrolling]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [data-oc-scrolling] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
html, body { margin: 0; height: 100%; background: var(--ext-bg); }
body { overflow: hidden; }
#root { height: 100%; }
[hidden] { display: none !important; }
button, input, textarea, select { font: inherit; }
.ext {
  color: var(--oc-fg);
  font-family: var(--oc-font);
  font-size: var(--ext-text-body);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.ext-container { container-type: inline-size; }
.ext :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 2px solid var(--oc-focus, CanvasText);
  outline-offset: 2px;
}
.ext button:not(:disabled) {
  transition: background-color 140ms ease-out, border-color 140ms ease-out, color 140ms ease-out, opacity 140ms ease-out, scale 120ms ease-out;
}
.ext button:not(:disabled):active { scale: 0.985; }
.ext-actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ext-space-2); }
.ext-muted { color: var(--oc-muted); font-size: var(--ext-text-small); }
.ext-notice {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--oc-radius, 6px);
  border: 1px solid color-mix(in srgb, var(--oc-info) 20%, transparent);
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
  background: color-mix(in srgb, var(--oc-info) 7%, var(--ext-bg));
  color: var(--oc-info-text);
}
.ext-notice[data-tone="success"] {
  border-color: color-mix(in srgb, var(--oc-success) 22%, transparent);
  background: color-mix(in srgb, var(--oc-success) 7%, var(--ext-bg));
  color: var(--oc-success-text);
}
.ext-notice[data-tone="warning"] {
  border-color: color-mix(in srgb, var(--oc-warning) 24%, transparent);
  background: color-mix(in srgb, var(--oc-warning) 8%, var(--ext-bg));
  color: var(--oc-warning-text);
}
.ext-notice[data-tone="error"] {
  border-color: color-mix(in srgb, var(--oc-error) 22%, transparent);
  background: color-mix(in srgb, var(--oc-error) 7%, var(--ext-bg));
  color: var(--oc-error-text);
}
.ext .oc-sdk-btn[data-size="sm"], .ext .oc-sdk-tab { font-size: 12px; }
.ext .oc-sdk-field-note { font-size: var(--ext-text-small); }
@media (prefers-reduced-motion: reduce) {
  .ext *, .ext *::before, .ext *::after { animation: none !important; transition: none !important; }
  .ext button:not(:disabled):active { scale: none; }
}
`;async function Ar(e,o){try{await e.openSurface(`plugin:${o.id}`)}catch{throw new Error(`\u672A\u80FD\u6253\u5F00\u300C${o.name}\u300D\u3002\u8BF7\u91CD\u65B0\u52A0\u8F7D\u754C\u9762\u540E\u91CD\u8BD5\u3002`)}}var Or=`.po { height: 100%; display: flex; flex-direction: column; min-width: 0; }
.po-header { flex: none; padding: 12px 16px 10px; border-bottom: 1px solid var(--oc-border); }
.po-top-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
.po-title-wrap { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; min-width: 0; }
.po-badge-slot { flex: none; display: inline-flex; }
.po-title { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.35; overflow-wrap: anywhere; }
.po-context { margin: 4px 0 10px; }
.po-refresh { flex: none; }
.po-tabs { margin-top: 6px; }
.po-tabs .oc-sdk-tabs { width: 100%; }
.po-scroll { flex: 1; min-height: 0; padding: 16px; overflow: auto; display: flex; flex-direction: column; gap: 14px; }
.po-message { margin: 0; }
.po-stack { display: grid; gap: 14px; min-width: 0; }
.po-meta { display: grid; grid-template-columns: 60px minmax(0, 1fr); gap: 6px 12px; margin: 0; font-size: 12px; align-items: center; }
.po-meta dt { color: var(--oc-muted); }
.po-meta dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.po-target-dd { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; }
.po-meta code { flex: 1; min-width: 0; overflow: hidden; font: 11px/1.5 var(--oc-mono); text-overflow: ellipsis; white-space: nowrap; }
.po-copy-inline { flex: none; }
.po-copy-inline .oc-sdk-btn[data-size="sm"] { min-height: 24px; padding: 0 6px; }
.po-hint { margin: 0; max-width: 60ch; font-size: 11px; line-height: 1.55; }
.po-footer { flex: none; padding: 12px 16px; border-top: 1px solid var(--oc-border); background: var(--ext-bg); }
.po-footer p { margin: 0 0 8px; }
.po-footer .ext-actions { justify-content: flex-end; }

/* Status section */
.po-section { padding: 2px 0 0; }
.po-section p { margin: 0; }
.po-status-row { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: baseline; gap: 12px; min-width: 0; min-height: 20px; }
.po-status-label { color: var(--oc-muted); font-size: 12px; line-height: 20px; }
.po-status-value { min-width: 0; overflow: hidden; text-align: right; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; line-height: 20px; font-weight: 600; }
.po-status-value[data-status="applied"] { color: var(--oc-success-text, var(--oc-success)); }
.po-status-value[data-status="baseline"] { color: var(--oc-info-text, var(--oc-info)); }
.po-status-value[data-status="drifted"] { color: var(--oc-warning-text, var(--oc-warning)); }
.po-status-value[data-status="missing"] { color: var(--oc-error-text, var(--oc-error)); }
.po-status-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 20px; }
.po-status-footer .ext-muted { font-variant-numeric: tabular-nums; }
.po-status-footer .ext-actions { flex: none; gap: 2px; }
.po-status-footer .oc-sdk-btn { min-height: 24px; padding: 0 4px; font-weight: 400; }

html[data-oc-surface="status"] { --ext-bg: transparent; height: auto; }
html[data-oc-surface="status"] body, html[data-oc-surface="status"] #root { height: auto; overflow: auto; background: transparent; }

@media (max-width: 320px) {
  .po-header { padding-left: 12px; padding-right: 12px; }
  .po-scroll { padding: 12px; }
  .po-footer { padding-left: 12px; padding-right: 12px; }
  .po-meta { grid-template-columns: 52px minmax(0, 1fr); }
}
`;var Rr=`.po-drift-banner {
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--oc-radius, 6px);
  border: 1px solid color-mix(in srgb, var(--oc-warning) 28%, var(--oc-border));
  background: color-mix(in srgb, var(--oc-warning) 8%, var(--ext-bg));
}
.po-drift-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--oc-warning-text, var(--oc-fg));
}
.po-preset-section {
  display: grid;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--oc-border);
  min-width: 0;
}
.po-preset-toolbar {
  gap: 4px;
}
.po-preset-error {
  margin: 0;
}
.po-inline-panel {
  display: grid;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--oc-radius, 6px);
  border: 1px solid var(--oc-border);
  background: color-mix(in srgb, var(--oc-muted) 6%, var(--ext-bg));
}
.po-danger-panel {
  border-color: color-mix(in srgb, var(--oc-error) 28%, var(--oc-border));
  background: color-mix(in srgb, var(--oc-error) 7%, var(--ext-bg));
}
.po-warning-panel {
  border-color: color-mix(in srgb, var(--oc-warning) 28%, var(--oc-border));
  background: color-mix(in srgb, var(--oc-warning) 7%, var(--ext-bg));
}
.po-inline-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}
.po-inline-actions {
  justify-content: flex-end;
}
.po-field .oc-sdk-field-label { font-size: 12px; }
.po-field .oc-sdk-input { font-size: 13px; min-height: 36px; }
.po-field textarea { min-height: 220px; max-height: 58vh; resize: vertical; line-height: 1.65; tab-size: 2; }
.po-field .oc-sdk-field-note { font-variant-numeric: tabular-nums; }
.po-editor { min-width: 0; }
.po-review-title { margin: 0; font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.po-review-note { margin: 0; padding: 8px 10px; font-size: 12px; }
.po-review-summary { margin: 0; font-variant-numeric: tabular-nums; }
.po-review-hint { margin: 0; font-size: 11px; }
.po-review-actions { justify-content: flex-end; padding-top: 10px; border-top: 1px solid var(--oc-border); }
.po-diff { max-height: 44vh; overflow: auto; border: 1px solid var(--oc-border); border-radius: var(--oc-radius, 6px); font: 11px/1.65 var(--oc-mono); }
.po-diff-line { display: grid; grid-template-columns: 32px 32px 18px minmax(0, 1fr); min-width: 0; border-left: 2px solid transparent; }
.po-diff-line span { padding: 1px 4px; color: var(--oc-muted); text-align: right; user-select: none; background: color-mix(in srgb, var(--oc-muted) 4%, transparent); }
.po-diff-line span:nth-child(3) { text-align: center; background: transparent; font-weight: 600; }
.po-diff-line code { padding: 1px 8px 1px 2px; font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; }
.po-diff-line[data-kind="add"] { border-left-color: var(--oc-success); background: color-mix(in srgb, var(--oc-success) 10%, transparent); color: var(--oc-success-text); }
.po-diff-line[data-kind="remove"] { border-left-color: var(--oc-error); background: color-mix(in srgb, var(--oc-error) 10%, transparent); color: var(--oc-error-text); }
.po-diff-gap { margin: 0; padding: 5px 12px; background: var(--oc-hover); color: var(--oc-muted); font: 11px/1.5 var(--oc-font); }
.po-preview { max-height: 42vh; margin: 0; padding: 12px; overflow: auto; border: 1px solid var(--oc-border); border-radius: var(--oc-radius, 6px); font: 11px/1.65 var(--oc-mono); white-space: pre-wrap; overflow-wrap: anywhere; }
`;var xn={\u5185\u7F6E\u63D0\u793A\u8BCD:"Build prompt","\u672A\u8986\u76D6\uFF08\u4EA4\u56DE OpenCode \u9ED8\u8BA4\uFF09":"Not overridden (using OpenCode default)",\u5339\u914D\u57FA\u7EBF\u5FEB\u7167:"Matches baseline snapshot",\u672A\u8986\u76D6:"Not overridden",\u57FA\u7EBF:"Baseline","\u5F53\u524D build.md \u8986\u76D6":"Current build.md override","build.md \u8986\u76D6\u72B6\u6001":"build.md override status","build.md \u8986\u76D6\u5907\u4EFD":"build.md override backups","build.md \u8986\u76D6":"build.md override","\u5E94\u7528\u6216\u8FD8\u539F\u90FD\u4F1A\u5148\u9884\u89C8\u5E76\u5907\u4EFD\u3002":"Apply and restore always preview the diff and back up build.md first.","\u8FD8\u539F\u4E3A\u7A7A\uFF08\u4EA4\u56DE\u9ED8\u8BA4\uFF09":"Restore empty (use default)","\u586B\u5199 system prompt\u2026":"Write the build agent system prompt\u2026","\u5199\u56DE\u7A7A stub\uFF0C\u79FB\u9664\u8986\u76D6\uFF0C\u4EA4\u56DE OpenCode \u9ED8\u8BA4\u3002":"Writes the empty stub back, removes the override and returns to the OpenCode default.","\u7A7A stub\uFF08\u9ED8\u8BA4\uFF09":"Empty stub (default)","\u975E\u7A7A\u5FEB\u7167 \xB7 {count} \u5B57\u7B26":"Non-empty snapshot \xB7 {count} characters","\u5DF2\u8FD8\u539F\u4E3A\u7A7A stub\uFF0C\u4EA4\u56DE OpenCode \u9ED8\u8BA4\u3002\u5EFA\u8BAE\u65B0\u5EFA\u4F1A\u8BDD\u786E\u8BA4\u3002":"Restored the empty stub and returned to the OpenCode default. Confirm in a new session.","\u8986\u76D6\u5DF2\u5199\u5165 build.md\u3002\u5EFA\u8BAE\u65B0\u5EFA\u4F1A\u8BDD\u786E\u8BA4\u52A0\u8F7D\u3002":"Override written to build.md. Confirm loading in a new session.","\u8FD8\u539F\u5DF2\u5199\u5165\u3002\u5EFA\u8BAE\u65B0\u5EFA\u4F1A\u8BDD\u786E\u8BA4\u3002":"Restore written. Confirm in a new session.","\u5F53\u524D build \u63D0\u793A\u8BCD":"Current build prompt","\u6B63\u5728\u8FDE\u63A5 OpenChamber\u2026":"Connecting to OpenChamber\u2026","\u5F53\u524D OpenCode \xB7 build agent":"Connected OpenCode \xB7 build agent",\u5185\u7F6E\u63D0\u793A\u8BCD\u72B6\u6001:"Built-in prompt status",\u5C1A\u672A\u5EFA\u7ACB\u57FA\u7EBF:"No baseline yet",\u76EE\u6807\u6587\u4EF6:"Target file","\u66FF\u6362 build \u7684 system prompt\uFF1BAGENTS.md \u4ECD\u8FFD\u52A0\u3002\u5F71\u54CD\u6240\u6709\u9879\u76EE\u4E0E provider\u3002":"Replaces the build system prompt; AGENTS.md is still appended. Affects every project and provider.",\u8986\u76D6\u5DEE\u5F02\u9884\u89C8:"Override diff preview","\u786E\u8BA4\u524D\u8BF7\u68C0\u67E5\u4E0B\u65B9\u5DEE\u5F02\uFF1B\u5199\u5165\u524D\u4F1A\u5907\u4EFD\u5F53\u524D build.md\u3002":"Review the diff below before confirming; the current build.md is backed up before writing.","\u5DEE\u5F02\uFF0C\u5DE6\u4FA7\u4E3A\u539F\u884C\u53F7\uFF0C\u53F3\u4FA7\u4E3A\u65B0\u884C\u53F7":"Diff; old line numbers on the left, new line numbers on the right",\u8986\u76D6\u5185\u5BB9:"Override content","build \u63D0\u793A\u8BCD\u5907\u4EFD":"Build prompt backups",\u5907\u4EFD\u5185\u5BB9:"Backup content","\u5E94\u7528\u6216\u8FD8\u539F\u90FD\u4F1A\u5148\u9884\u89C8\u5DEE\u5F02\uFF1B\u5199\u5165\u524D\u4F1A\u5907\u4EFD\u5F53\u524D build.md\u3002":"Apply and restore both preview the diff first; the current build.md is backed up before writing.",\u5237\u65B0:"Refresh",\u8FD8\u539F\u5185\u7F6E:"Restore built-in",\u5E94\u7528\u8986\u76D6:"Apply override",\u8FD4\u56DE\u7F16\u8F91:"Back to editor",\u786E\u8BA4\u5199\u5165:"Confirm write",\u9884\u89C8\u6062\u590D:"Preview restore",\u8986\u76D6:"Override",\u5907\u4EFD:"Backups","\u8986\u76D6\u5185\u5BB9 \xB7 Markdown":"Override content \xB7 Markdown","\u5728\u8FD9\u91CC\u586B\u5199 build agent \u7684 system prompt \u6B63\u6587\u2026":"Write the build agent system prompt body here\u2026",\u5907\u4EFD\u65F6\u95F4:"Backup time","\u641C\u7D22\u65F6\u95F4\u2026":"Search time\u2026",\u9009\u62E9\u5907\u4EFD:"Choose a backup",\u4F7F\u7528\u5185\u7F6E\u63D0\u793A\u8BCD:"Using the built-in prompt",\u4F7F\u7528\u57FA\u7EBF\u5185\u5BB9:"Using baseline content",\u5DF2\u5E94\u7528\u8986\u76D6:"Override applied",\u6587\u4EF6\u5DF2\u88AB\u5916\u90E8\u4FEE\u6539:"File changed externally","build.md \u7F3A\u5931":"build.md is missing",\u5185\u7F6E:"Built-in",\u5DF2\u8986\u76D6:"Overridden",\u5916\u90E8\u4FEE\u6539:"External edit",\u7F3A\u5931:"Missing","\u6B64\u64CD\u4F5C\u4F1A\u5199\u56DE\u57FA\u7EBF stub\uFF0C\u6062\u590D\u5185\u7F6E\u63D0\u793A\u8BCD\u3002":"This writes the baseline stub back and restores the built-in prompt.","\u6B64\u64CD\u4F5C\u4F1A\u5199\u56DE\u9009\u4E2D\u7684\u5907\u4EFD\u5185\u5BB9\u3002":"This writes the selected backup content back.","\u6B64\u64CD\u4F5C\u4F1A\u66FF\u6362 build.md \u7684\u6B63\u6587\uFF0C\u5F71\u54CD\u6240\u6709\u9879\u76EE\u548C provider\u3002":"This replaces the body of build.md and affects every project and provider.","\u53EA\u8BFB\u5BF9\u6BD4\uFF1A\u5DE6\u4FA7\u4E3A\u6269\u5C55\u8BB0\u5F55\u7684\u4E0A\u6B21\u72B6\u6001\uFF0C\u53F3\u4FA7\u4E3A\u78C1\u76D8\u5F53\u524D build.md\u3002":"Read-only diff: left is the last recorded state, right is the current build.md on disk.","\u65B0\u589E {added} \u884C \xB7 \u5220\u9664 {removed} \u884C":"Added: {added} \xB7 Removed: {removed}"," \xB7 \u5927\u6BB5\u53D8\u66F4\u6309\u6574\u5757\u5C55\u793A":" \xB7 large changes are shown as blocks"," \xB7 \u5185\u5BB9\u4E00\u81F4\uFF0C\u65E0\u9700\u5199\u5165":" \xB7 content is identical; no write needed"," \xB7 \u5C06\u521B\u5EFA\u6587\u4EF6":" \xB7 the file will be created","\u7701\u7565 {count} \u884C\u672A\u53D8\u66F4\u5185\u5BB9":"Unchanged lines omitted: {count}","\u9884\u89C8\u8FBE\u5230 400 \u884C\uFF0C\u540E\u7EED\u5DEE\u5F02\u672A\u5C55\u793A\u3002\u8BF7\u8FD4\u56DE\u7F16\u8F91\u6216\u5907\u4EFD\u5185\u5BB9\u68C0\u67E5\u5B8C\u6574\u6587\u672C\u3002":"The preview reached 400 lines; later differences are hidden. Return to the editor or backup content to inspect the full text.",\u6587\u4EF6\u5185\u5BB9\u4E3A\u7A7A:"File content is empty","\u6B63\u5728\u8BFB\u53D6\u2026":"Reading\u2026",\u5C1A\u672A\u8BFB\u53D6:"Not read yet","{lines} \u884C \xB7 {chars} \u5B57\u7B26 \xB7 ~{tokens} tokens":"{lines} lines \xB7 {chars} chars \xB7 ~{tokens} tokens","{count} \u5B57\u7B26":"Chars: {count}"," \xB7 \u672A\u4FDD\u5B58\u4FEE\u6539":" \xB7 unsaved changes"," \xB7 \u672A\u5E94\u7528\u5230 build.md":" \xB7 not applied to build.md","\u663E\u793A\u6700\u8FD1 {count} \u4EFD\u5907\u4EFD\uFF1B\u6062\u590D\u524D\u4E5F\u4F1A\u5907\u4EFD\u5F53\u524D\u6587\u4EF6\u3002":"Showing up to {count} recent backups; restoring also backs up the current file.","\u6682\u65E0\u5907\u4EFD\u3002\u9996\u6B21\u5E94\u7528\u6216\u8FD8\u539F\u65F6\u4F1A\u81EA\u52A8\u521B\u5EFA\u3002":"No backups yet. The first apply or restore creates one automatically.",\u786E\u8BA4\u8FD8\u539F:"Confirm restore",\u786E\u8BA4\u6062\u590D:"Confirm restore",\u5F53\u524D\u4ECD\u663E\u793A\u4E0A\u6B21\u8BFB\u53D6\u7ED3\u679C:"Still showing the last read result","\u5DF2\u8FD8\u539F\u4E3A\u5185\u7F6E\u63D0\u793A\u8BCD\u3002\u5EFA\u8BAE\u65B0\u5EFA\u4F1A\u8BDD\u786E\u8BA4\u3002":"Restored to the built-in prompt. Confirm in a new session.","\u5907\u4EFD\u6821\u9A8C\u5931\u8D25\uFF0C\u76EE\u6807\u6587\u4EF6\u672A\u4FEE\u6539\u3002":"Backup verification failed; the target file was not changed.","\u5907\u4EFD\u7F16\u53F7\u65E0\u6548\u3002":"Invalid backup ID.","\u5907\u4EFD\u7F3A\u5931\u6216\u683C\u5F0F\u6709\u8BEF\uFF0C\u672A\u4FEE\u6539 build.md\u3002":"The backup is missing or malformed; build.md was not changed.","\u6062\u590D\u5907\u4EFD {time}":"Restore backup {time}","{label}\u524D":"Before {label}","\u8986\u76D6\u72B6\u6001\u5DF2\u88AB\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u64CD\u4F5C\u3002":"The override state was changed by another window. Reload before continuing.","build.md \u5728\u9884\u89C8\u540E\u5DF2\u88AB\u4FEE\u6539\uFF0C\u672A\u5199\u5165\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u5E76\u9884\u89C8\u5DEE\u5F02\u3002":"build.md changed after the preview; nothing was written. Reload and preview the diff again.","\u5199\u5165\u540E\u6587\u4EF6\u5185\u5BB9\u4E0E\u9884\u89C8\u4E0D\u4E00\u81F4\uFF0C\u53EF\u80FD\u6709\u5176\u4ED6\u7F16\u8F91\u5668\u540C\u65F6\u5199\u5165\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u64CD\u4F5C\u524D\u7684\u5907\u4EFD\u4ECD\u53EF\u67E5\u770B\u3002":"The file content no longer matches the preview after writing; another editor may have written concurrently. Reload; the backup taken before the operation is still available.","build.md \u5DF2\u5199\u5165\uFF0C\u4F46\u8986\u76D6\u72B6\u6001\u56DE\u8BFB\u4E0D\u4E00\u81F4\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u786E\u8BA4\uFF0C\u4E0D\u8981\u91CD\u590D\u5E94\u7528\u3002":"build.md was written, but the override state did not read back consistently. Reload to confirm; do not apply again.","\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u4E3A\u7A7A\u3002":"Override text cannot be empty.","\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u8D85\u8FC7 {count} \u4E2A\u5B57\u7B26\u3002":"Override text cannot exceed {count} characters.","\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u5305\u542B\u7A7A\u5B57\u8282\u3002":"Override text cannot contain null bytes.","\u8986\u76D6\u72B6\u6001\u6587\u4EF6\u683C\u5F0F\u6709\u8BEF\uFF0C\u73B0\u6709 build.md \u672A\u4FEE\u6539\u3002\u8BF7\u4FEE\u590D state.json \u6216\u4ECE\u5907\u4EFD\u6062\u590D\u3002":"The override state file is malformed; build.md was not changed. Repair state.json or restore a backup.",\u9884\u8BBE\u5E93:"Preset library",\u63D0\u793A\u8BCD\u9884\u8BBE:"Prompt presets",\u9009\u62E9\u9884\u8BBE\u6216\u7F16\u8F91\u4E34\u65F6\u8349\u7A3F:"Choose a preset or edit a scratch draft","\u641C\u7D22\u9884\u8BBE\u2026":"Search presets\u2026",\u65B0\u5EFA\u8349\u7A3F:"New draft",\u4FDD\u5B58\u9884\u8BBE:"Save preset",\u66F4\u65B0\u9884\u8BBE:"Update preset",\u53E6\u5B58\u9884\u8BBE:"Save as preset",\u5220\u9664\u9884\u8BBE:"Delete preset",\u786E\u8BA4\u5220\u9664:"Confirm delete",\u53D6\u6D88:"Cancel",\u590D\u5236\u5168\u6587:"Copy text",\u590D\u5236\u8DEF\u5F84:"Copy path","\u5DF2\u590D\u5236\u63D0\u793A\u8BCD\u6B63\u6587\u3002":"Prompt text copied.","\u5DF2\u590D\u5236\u76EE\u6807\u6587\u4EF6\u8DEF\u5F84\u3002":"Target file path copied.","\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u526A\u8D34\u677F\u6743\u9650\u3002":"Could not copy to clipboard.",\u9884\u8BBE\u540D\u79F0:"Preset name","\u4F8B\u5982\uFF1A\u7CBE\u7B80\u6781\u901F\u6A21\u5F0F / \u4E25\u683C\u91CD\u6784\u6A21\u5F0F":"e.g. Concise fast mode / Strict refactor",\u786E\u8BA4\u4FDD\u5B58:"Save","\u8BF7\u586B\u5199\u9884\u8BBE\u540D\u79F0\u3002":"Enter a preset name.","\u9884\u8BBE\u540D\u79F0\u4E0D\u80FD\u8D85\u8FC7 {count} \u4E2A\u5B57\u7B26\u3002":"Preset name cannot exceed {count} characters.","\u9884\u8BBE\u540D\u79F0\u5305\u542B\u65E0\u6548\u5B57\u7B26\u3002":"Preset name contains invalid characters.","\u9884\u8BBE\u5E93\u6587\u4EF6\u683C\u5F0F\u6709\u8BEF\uFF0C\u73B0\u6709 presets.json \u672A\u4FEE\u6539\u3002\u8BF7\u4FEE\u590D\u540E\u518D\u4FDD\u5B58\u9884\u8BBE\u3002":"Preset library file is malformed; presets.json was not modified. Repair it before saving presets.","\u9884\u8BBE\u5E93\u56DE\u8BFB\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u8BD5\u3002":"Preset library read-back verification failed. Refresh and try again.","\u5DF2\u5B58\u5728\u540C\u540D\u9884\u8BBE\u201C{name}\u201D\u3002":'A preset named "{name}" already exists.',"\u9884\u8BBE\u6570\u91CF\u5DF2\u8FBE\u4E0A\u9650\uFF08{count} \u4E2A\uFF09\u3002":"Maximum number of presets reached ({count}).","\u9884\u8BBE\u201C{name}\u201D\u5DF2\u4FDD\u5B58\uFF08\u672A\u5199\u5165 build.md\uFF0C\u70B9\u51FB\u4E0B\u65B9\u201C\u5E94\u7528\u8986\u76D6\u201D\u53EF\u542F\u7528\uFF09\u3002":'Preset "{name}" saved (build.md unchanged; click "Apply override" below to activate).',"\u5DF2\u5220\u9664\u9884\u8BBE\u201C{name}\u201D\u3002":'Deleted preset "{name}".',"\u786E\u5B9A\u5220\u9664\u9884\u8BBE\u201C{name}\u201D\uFF1Fbuild.md \u4E0D\u4F1A\u53D7\u5F71\u54CD\u3002":'Delete preset "{name}"? build.md will not be changed.',"\u5F53\u524D\u8349\u7A3F\u6709\u672A\u4FDD\u5B58\u4FEE\u6539\u3002\u662F\u5426\u653E\u5F03\u8349\u7A3F\u5E76\u52A0\u8F7D\u6240\u9009\u5185\u5BB9\uFF1F":"You have unsaved draft edits. Discard them and load the selected text?",\u653E\u5F03\u8349\u7A3F\u5E76\u52A0\u8F7D:"Discard & load",\u7EE7\u7EED\u7F16\u8F91:"Keep editing","\u68C0\u6D4B\u5230 build.md \u5DF2\u88AB\u5916\u90E8\u4FEE\u6539\uFF0C\u6269\u5C55\u4E0D\u4F1A\u81EA\u52A8\u8986\u76D6\u3002":"build.md was modified externally. The extension will not overwrite it automatically.",\u5BF9\u6BD4\u5916\u90E8\u5DEE\u5F02:"Inspect external diff",\u8BFB\u53D6\u78C1\u76D8\u6B63\u6587:"Load disk text into draft",\u5916\u90E8\u4FEE\u6539\u5DEE\u5F02\u5BF9\u6BD4:"External modification diff","\u5DF2\u5C06\u78C1\u76D8\u5F53\u524D build.md \u6B63\u6587\u8F7D\u5165\u7F16\u8F91\u5668\u8349\u7A3F\u3002":"Loaded current disk build.md body into the editor draft.","\u53EA\u8BFB\u5DEE\u5F02\u5BF9\u6BD4\u4E0D\u80FD\u76F4\u63A5\u5199\u5165\u3002":"Read-only diff inspection cannot be written directly.","\u81EA\u7531\u8349\u7A3F\uFF08\u672A\u5173\u8054\u9884\u8BBE\uFF09":"Scratch draft (unlinked)","\u5F53\u524D\u5339\u914D\u9884\u8BBE\uFF1A{name}":"Matches preset: {name}","build \u63D0\u793A\u8BCD":"build prompt",\u8986\u76D6\u72B6\u6001:"Override state",\u5907\u4EFD\u5217\u8868:"Backup list",\u5907\u4EFD\u6587\u4EF6:"Backup file",\u6587\u4EF6\u5217\u8868:"File list",\u6587\u4EF6:"file","\u8BF7\u5728\u8BBE\u7F6E \u2192 \u6269\u5C55\u4E2D\u5141\u8BB8\u201C\u5185\u7F6E\u63D0\u793A\u8BCD\u201D\u8BBF\u95EE build.md \u4E0E\u8986\u76D6\u6570\u636E\u76EE\u5F55\u3002":'Allow "Build prompt" to access build.md and its override data directory in Settings \u2192 Extensions.',"\u6587\u4EF6\u6743\u9650\u4E0D\u8DB3\uFF0C\u8BF7\u68C0\u67E5 build.md \u6216\u8986\u76D6\u6570\u636E\u76EE\u5F55\u7684\u6743\u9650\u3002":"File permission denied. Check build.md and the override data directory permissions.","\u5BBF\u4E3B\u54CD\u5E94\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u6587\u4EF6\u786E\u8BA4\u5B9E\u9645\u72B6\u6001\uFF0C\u518D\u7EE7\u7EED\u64CD\u4F5C\u3002":"The host timed out. Reload the file to confirm the actual state before continuing.","\u76EE\u6807\u8DEF\u5F84\u4E0D\u5728\u6388\u6743\u8303\u56F4\u5185\uFF0C\u6216\u7B26\u53F7\u94FE\u63A5\u6307\u5411\u4E86\u5176\u4ED6\u76EE\u5F55\u3002":"The target path is outside the allowed scope, or a symlink points elsewhere.","\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u542B\u4E2D\u6587\u7B49\u5B57\u7B26\uFF0C\u89E6\u53D1\u4E86 OpenChamber \u6587\u4EF6\u63A5\u53E3\u7684\u517C\u5BB9\u95EE\u9898\u3002\u53EF\u6682\u65F6\u5728\u65E0\u9879\u76EE\u4F1A\u8BDD\u4E2D\u4ECE\u53F3\u4FA7\u6253\u5F00\u201C\u5185\u7F6E\u63D0\u793A\u8BCD\u201D\u3002":'The working directory contains non-Latin characters, which triggers a compatibility issue in the OpenChamber file API. Open "Build prompt" from the right sidebar in a session without a project for now.',"OpenChamber \u6587\u4EF6\u63A5\u53E3\u8FD4\u56DE\u5F02\u5E38\uFF0C\u672A\u63D0\u4F9B\u5177\u4F53\u539F\u56E0\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u6301\u7EED\u5931\u8D25\u65F6\u91CD\u65B0\u52A0\u8F7D\u9762\u677F\u3002":"The OpenChamber file API returned an error without details. Reload; if it keeps failing, reload the panel.","\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002":"The operation did not complete. Try again.","{action} {target}\u5931\u8D25\uFF1A{reason}{suffix}":"{action} {target} failed: {reason}{suffix}",\u5199\u5165:"Write",\u8BFB\u53D6:"Read"," \u5199\u5165\u7ED3\u679C\u5C1A\u672A\u786E\u8BA4\uFF0C\u8BF7\u5148\u91CD\u65B0\u8BFB\u53D6\u5B9E\u9645\u72B6\u6001\uFF0C\u52FF\u76F4\u63A5\u91CD\u590D\u5199\u5165\u3002":" The write result is not confirmed. Reload the actual state first; do not repeat the write.",\u5F53\u524D\u72B6\u6001:"Current status","\u8BFB\u53D6\u4E8E {time}":"Read at {time}",\u672A\u8BFB\u53D6:"Not read",\u7BA1\u7406:"Manage",\u7BA1\u7406\u5185\u7F6E\u63D0\u793A\u8BCD:"Manage build prompt","\u4EC5\u8868\u793A\u5F53\u524D\u8FDE\u63A5\u670D\u52A1\u5668\u7684\u6587\u4EF6\u72B6\u6001\uFF0C\u4E0D\u4EE3\u8868\u5DF2\u6709\u4F1A\u8BDD\u5DF2\u52A0\u8F7D\u89C4\u5219\u3002":"Shows only the file state on the connected server; it does not mean existing sessions have loaded the rules.","\u5185\u7F6E\u63D0\u793A\u8BCD\u57FA\u7EBF \xB7 {date}":"Built-in prompt baseline \xB7 {date}"},Oe=ur(xn),{t:dE}=Oe;var{t:v}=Oe,kr=document.createElement("style");kr.textContent=gr+Or+Rr;document.head.append(kr);var oe=$t(),gn=Tr(hr(oe,v),Date.now,()=>crypto.randomUUID(),v),Me=Y("section","ext po-section"),ae=Y("p","po-status-value",v("\u6B63\u5728\u8BFB\u53D6\u2026"));ae.setAttribute("role","status");var vr=Y("div","po-status-row"),yr=Y("span","po-status-label",v("\u5F53\u524D\u72B6\u6001"));vr.append(yr,ae);var Ne=Y("p","ext-muted","build.md");Ne.title=v("\u4EC5\u8868\u793A\u5F53\u524D\u8FDE\u63A5\u670D\u52A1\u5668\u7684\u6587\u4EF6\u72B6\u6001\uFF0C\u4E0D\u4EE3\u8868\u5DF2\u6709\u4F1A\u8BDD\u5DF2\u52A0\u8F7D\u89C4\u5219\u3002");var z=Y("p","ext-notice");z.hidden=!0;z.setAttribute("role","status");var Ir=Y("div","po-status-footer"),Re=Y("div","ext-actions");Ir.append(Ne,Re);Me.append(vr,Ir,z);document.querySelector("#root").append(Me);var at=!1,lt=!1,ct=!1,dt="",Cr=()=>{z.hidden=!0,Ar(oe,{id:"prompt-override",name:v("\u5185\u7F6E\u63D0\u793A\u8BCD")}).catch(e=>{z.hidden=!1,z.dataset.tone="error",z.textContent=e instanceof Error?e.message:no(e,v)})},so=()=>{if(Re.hidden=ct,!ct)return;let e=[{kind:"button",id:"refresh",label:v("\u5237\u65B0"),disabled:at||!lt},{kind:"button",id:"manage",label:v("\u7BA1\u7406"),disabled:!lt}],o=JSON.stringify(e);o!==dt&&(dt=o,oe.setStatusControls(e).catch(()=>{ct=!1,dt="",Re.hidden=!1}))};oe.onStatusControl(e=>{e.id==="refresh"?pt():e.id==="manage"&&Cr()});var pt=async()=>{if(!at){at=!0,io.update({loading:!0}),so();try{let e=await gn.load();ae.textContent=xr(e.status,v),ae.setAttribute("data-status",e.status),ae.title=br(e.status,v),Ne.textContent=v("\u8BFB\u53D6\u4E8E {time}",{time:new Date().toLocaleTimeString(Oe.locale,{hour:"2-digit",minute:"2-digit",hour12:!1})}),z.hidden=!0,oe.setBadge(e.status==="drifted"||e.status==="missing"?1:null).catch(()=>{})}catch(e){ae.textContent=v("\u672A\u8BFB\u53D6"),ae.removeAttribute("data-status"),Ne.textContent="build.md",z.textContent=no(e,v),z.dataset.tone="error",z.hidden=!1}finally{at=!1,io.update({loading:!1}),so(),oe.setHeight(Math.ceil(Me.getBoundingClientRect().height)).catch(()=>{})}}},io=te(Re,{label:v("\u5237\u65B0"),size:"sm",variant:"ghost",onClick:()=>{pt()}}),An=te(Re,{label:v("\u7BA1\u7406"),size:"sm",variant:"ghost",onClick:Cr}),wr=Re.lastElementChild;wr.setAttribute("aria-label",v("\u7BA1\u7406\u5185\u7F6E\u63D0\u793A\u8BCD"));new ResizeObserver(()=>{oe.setHeight(Math.ceil(Me.getBoundingClientRect().height)).catch(()=>{})}).observe(Me);oe.onReady(e=>{Kt(e,document.documentElement);let o=Oe.setLocale(e.locale);to(Oe),ct=e.features?.statusControls===!0,dt="",yr.textContent=v("\u5F53\u524D\u72B6\u6001"),Ne.title=v("\u4EC5\u8868\u793A\u5F53\u524D\u8FDE\u63A5\u670D\u52A1\u5668\u7684\u6587\u4EF6\u72B6\u6001\uFF0C\u4E0D\u4EE3\u8868\u5DF2\u6709\u4F1A\u8BDD\u5DF2\u52A0\u8F7D\u89C4\u5219\u3002"),io.update({label:v("\u5237\u65B0")}),An.update({label:v("\u7BA1\u7406")}),wr.setAttribute("aria-label",v("\u7BA1\u7406\u5185\u7F6E\u63D0\u793A\u8BCD")),so(),lt?o&&pt():(lt=!0,pt())});})();
