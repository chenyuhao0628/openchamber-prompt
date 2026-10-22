"use strict";(()=>{var p="openchamber.sdk";var pe="data-oc-scrolling",Pe=`
:root {
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 40%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 65%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${pe}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${pe}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${pe}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${pe}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function De(e){let n=e.documentElement;if(n.hasAttribute("data-oc-scrollbar-activity"))return;n.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",s=>{let m=s.target===e?n:s.target;if(!(m instanceof Element))return;m.hasAttribute("data-oc-scrolling")||m.setAttribute("data-oc-scrolling","");let u=r.get(m);u!==void 0&&clearTimeout(u),r.set(m,setTimeout(()=>{r.delete(m),m.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var lo=`(${De.toString()})(document);`;var xt=["file","directory","other","missing"],Fe=e=>!!(e&&"sessionId"in e),Be=e=>!!(e&&"sent"in e&&!("sessionId"in e));var ht=/^[0-9a-f]{7,64}$/i,Xe=e=>ht.test(e),ue=500,fe=32e3,bt=16e3,St=128,_t=200,gt=2e3,Tt=16e3,kt=80,At=200,wt=16e3;var yt=2e3;var ze=2e4,me=1024,Ee=2e6;var xe=64e3,he=8e3,je=4e3;var Ve=9e4;var vt=999,Rt=1e4,be=500,Ot=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Ct=["stopped","starting","ready","failed"],po=new Set(Ot),It=e=>po.has(e),Ut=e=>e&&It(e)?e:"HOST_REJECTED",ee=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(ee):Object(e)===e?Object.values(e).every(ee):!1,Mt=e=>ee(e)&&JSON.stringify(e).length<=wt,Et=e=>e?.trim().slice(0,At)??"",te=e=>{let n=e.id.trim().slice(0,St),r=e.title.trim().slice(0,_t),s=e.url.trim().slice(0,gt),m=e.text?.trim().slice(0,Tt),u=e.author?.trim().slice(0,kt),v=e.kind==="pull"?"pull":"issue",k={providerId:e.providerId.trim(),id:n,title:r||n,url:s,kind:v};if(m&&(k.text=m),u&&(k.author=u),v==="pull"){let M=Et(e.branches?.head),P=Et(e.branches?.base);M&&P&&(k.branches={head:M,base:P})}return Mt(e.data)&&(k.data=e.data),k},Ke=e=>{let n=te(e);return e.projectId&&(n.projectId=e.projectId),e.navigation&&(n.navigation=e.navigation),e.worktree&&(n.worktree=e.worktree),n},We=e=>{let n={text:e.text.trim().slice(0,bt)};return e.send&&(n.send=!0),n},Je=e=>e===null||!Number.isFinite(e)?null:Math.min(vt,Math.max(0,Math.round(e))),Ye=e=>Number.isFinite(e)?Math.min(Rt,Math.max(0,Math.ceil(e))):0;var oe=e=>e.length>0&&e.length<=me&&!e.includes("\0")&&!e.includes("\\");var Se=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>yt?!1:!e.split("/").some(r=>r==="."||r===".."),uo=new Set(Ct),qe=e=>!!(e&&"status"in e&&uo.has(String(e.status))&&!("body"in e)),_e=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Qe=e=>!!(e&&"content"in e&&String(e.content)===e.content),Ze=e=>!!(e&&"written"in e&&e.written===!0),et=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),fo=new Set(xt),tt=e=>!!(e&&"kind"in e&&"size"in e&&fo.has(String(e.kind))&&Number.isFinite(e.size)),ot=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),mo=new Set(["workspace","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action"]),Eo=e=>Object(e)===e?e:null,$e=e=>String(e)===e&&e.length>0,xo=e=>{if(!$e(e.id))return null;if(e.ok===!0){let n={channel:p,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(n.payload=e.payload),n}return e.ok===!1&&$e(e.error)?{channel:p,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Ut($e(e.code)?e.code:void 0)}:null},nt=e=>{let n=Eo(e);return!n||n.channel!==p||n.v!==1?null:n.type==="result"?xo(n):!mo.has(String(n.type))||Object(n.payload)!==n.payload?null:n};var a=class extends Error{code;constructor(n,r){super(r),this.name="HostRequestError",this.code=n}},Lt=()=>Promise.reject(new a("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ge=()=>Promise.reject(new a("BAD_PATH",`File path must be 1 to ${me} characters without NUL or backslash.`)),E=e=>(e.value+=1,`oc-${e.value}`),rt=(e={})=>{let n=e.target??("window"in globalThis?window:null);if(!n)throw new a("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(t=>t===n.parent),s=e.requestTimeoutMs??ze,m=new Set,u=new Set,v=new Set,k=new Set,M=new Set,P=new Set,F=new Set,Q=null,Z=null,c=new Map,x=new Map,h=!1,i={value:0},d=null,O=null,B=t=>t?{sessionId:t.id,phase:t.busy?"started":"completed"}:null,j=t=>{n.parent.postMessage(t,"*")},C=(t,o)=>{for(let l of t)try{l(o)}catch(S){console.error(S)}},mt=t=>{if(!(t instanceof MessageEvent)||!r(t.source))return;let o=nt(t.data);if(!o)return;if(o.type==="workspace"){let S=x.get(o.payload.subscriptionId);S&&C([S],o.payload.snapshot);return}if(o.type==="ready"){d=o.payload,O=B(o.payload.session),C(m,o.payload),C(u,o.payload.directory),C(v,o.payload.session),O&&C(k,O),C(M,o.payload.connection),C(P,o.payload.settings),C(F,o.payload.item);return}if(o.type==="directory"){d&&(d={...d,directory:o.payload.directory}),C(u,o.payload.directory);return}if(o.type==="session"){d&&(d={...d,session:o.payload.session}),o.payload.session?O?.sessionId!==o.payload.session.id&&(O=B(o.payload.session)):O=null,C(v,o.payload.session);return}if(o.type==="session-lifecycle"){O=o.payload,C(k,o.payload);return}if(o.type==="connection"){d&&(d={...d,connection:o.payload.connection}),C(M,o.payload.connection);return}if(o.type==="settings"){d&&(d={...d,settings:o.payload.settings}),C(P,o.payload.settings);return}if(o.type==="item"){d&&(d={...d,item:o.payload.item}),C(F,o.payload.item);return}if(o.type==="action"){let S=T=>{h||j({channel:p,v:1,type:"action-result",id:o.id,payload:T})},N=Z;if(!N){S({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>N(o.payload)).then(()=>S({ok:!0}),T=>{let He=(T instanceof Error?T.message:String(T)).trim();S({ok:!1,error:(He||"Action failed.").slice(0,be)})});return}if(o.type==="resolve"){let S=T=>{j({channel:p,v:1,type:"resolve-result",id:o.id,payload:T})},N=Q;if(!N){S({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>N(o.payload)).then(T=>S({item:T?te(T):null}),T=>{let He=(T instanceof Error?T.message:String(T)).trim();S({error:(He||"Command failed.").slice(0,be)})});return}let l=c.get(o.id);if(l){if(clearTimeout(l.timer),c.delete(o.id),o.ok){l.resolve(o.payload);return}l.reject(new a(o.code,o.error))}};n.addEventListener("message",mt),j({channel:p,v:1,type:"hello"});let I=(t,o=s)=>h||n.parent===n?Promise.reject(new a("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((l,S)=>{let N=setTimeout(()=>{c.delete(t.id),S(new a("HOST_TIMEOUT","Host did not answer in time."))},o);c.set(t.id,{resolve:l,reject:S,timer:N}),j(t)}),R=t=>I(t).then(()=>{}),V={channel:p,v:1},K=(t,o=1024)=>{if(!t.trim()||t.length>o)throw new a("HOST_REJECTED",`Identity must contain 1 to ${o} characters.`)},Ne=async t=>{t.kind!=="projects"&&K(t.projectId);let o=await I({...V,type:"workspace-read",id:E(i),payload:t});if(!o||!("kind"in o)||!("state"in o)||o.kind!==t.kind)throw new a("HOST_REJECTED","Host did not return workspace data.");return o},Ge=async(t,o)=>{t.kind!=="projects"&&K(t.projectId);let l=E(i);x.set(l,o);try{await R({...V,type:"workspace-subscribe",id:E(i),payload:{subscriptionId:l,query:t}})}catch(S){throw x.delete(l),h||j({...V,type:"workspace-unsubscribe",id:E(i),payload:{subscriptionId:l}}),S}return()=>{!x.delete(l)||h||j({...V,type:"workspace-unsubscribe",id:E(i),payload:{subscriptionId:l}})}},le=async t=>{if("key"in t&&(t.key.length===0||t.key.length>128))throw new a("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(t.op==="set"&&!ee(t.value))throw new a("HOST_REJECTED","Storage values must be JSON.");if(t.op==="set"&&new TextEncoder().encode(JSON.stringify(t.value)).length>65536)throw new a("HOST_REJECTED","Storage value exceeds 64 KiB.");let o=await I({...V,type:"storage",id:E(i),payload:t});if(!o||!("storage"in o)||o.op!==t.op)throw new a("HOST_REJECTED","Host did not return storage data.");return o};return{onAction:t=>(Z=t,()=>{Z===t&&(Z=null)}),listProjects:async()=>{let t=await Ne({kind:"projects"});if(t.kind!=="projects")throw new a("HOST_REJECTED","Expected projects.");return t},listWorktrees:async t=>{let o=await Ne({kind:"worktrees",projectId:t});if(o.kind!=="worktrees")throw new a("HOST_REJECTED","Expected worktrees.");return o},listSessions:async t=>{let o=await Ne({kind:"sessions",projectId:t});if(o.kind!=="sessions")throw new a("HOST_REJECTED","Expected sessions.");return o},onProjects:t=>Ge({kind:"projects"},o=>{o.kind==="projects"&&t(o)}),onWorktrees:(t,o)=>Ge({kind:"worktrees",projectId:t},l=>{l.kind==="worktrees"&&o(l)}),onSessions:(t,o)=>Ge({kind:"sessions",projectId:t},l=>{l.kind==="sessions"&&o(l)}),openSession:async t=>{K(t),await R({...V,type:"open-session",id:E(i),payload:{sessionId:t}})},storage:{get:async t=>{let o=await le({op:"get",key:t});return o.op==="get"&&o.found?o.value:void 0},set:async(t,o)=>{await le({op:"set",key:t,value:o})},delete:async t=>{await le({op:"delete",key:t})},keys:async()=>{let t=await le({op:"keys"});if(t.op!=="keys")throw new a("HOST_REJECTED","Expected storage keys.");return t.keys}},onReady:t=>(m.add(t),d&&t(d),()=>{m.delete(t)}),onDirectory:t=>(u.add(t),d&&t(d.directory),()=>{u.delete(t)}),onSession:t=>(v.add(t),d&&t(d.session),()=>{v.delete(t)}),onSessionLifecycle:t=>(k.add(t),O&&t(O),()=>{k.delete(t)}),onConnection:t=>(M.add(t),d&&t(d.connection),()=>{M.delete(t)}),onSettings:t=>(P.add(t),d&&t(d.settings),()=>{P.delete(t)}),onItem:t=>(F.add(t),d&&t(d.item),()=>{F.delete(t)}),onResolve:t=>(Q=t,()=>{Q===t&&(Q=null)}),toast:t=>{let o=t.message.trim();return!o||o.length>ue?Promise.reject(new a("HOST_REJECTED",`Toast message must contain 1 to ${ue} characters.`)):t.copy&&t.copy!==!0&&(!t.copy.text.length||t.copy.text.length>fe)?Promise.reject(new a("HOST_REJECTED",`Toast copy text must contain 1 to ${fe} characters.`)):R({channel:p,v:1,type:"toast",id:E(i),payload:{...t,message:o}})},openUrl:t=>R({channel:p,v:1,type:"open-url",id:E(i),payload:{url:t}}),openCommit:t=>Xe(t)?R({channel:p,v:1,type:"open-commit",id:E(i),payload:{sha:t}}):Promise.reject(new a("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),openSurface:t=>R({channel:p,v:1,type:"open-surface",id:E(i),payload:{surfaceId:t}}),writeClipboard:t=>R({channel:p,v:1,type:"clipboard-write",id:E(i),payload:{text:t}}),compose:t=>R({channel:p,v:1,type:"compose",id:E(i),payload:t}),attach:t=>R({channel:p,v:1,type:"attach",id:E(i),payload:te(t)}),startSession:async t=>{t.projectId!==void 0&&K(t.projectId);let o=t.worktree;o&&o!==!0&&(o.kind==="existing"?K(o.directory):(o.name!==void 0&&K(o.name,200),o.baseBranch!==void 0&&K(o.baseBranch,200)));let l=await I({channel:p,v:1,type:"start-session",id:E(i),payload:Ke(t)},e.requestTimeoutMs??18e4);if(!Fe(l))throw new a("HOST_REJECTED","Host did not return a session.");return l},prompt:t=>I({channel:p,v:1,type:"prompt",id:E(i),payload:We(t)}).then(o=>{if(!Be(o))throw new a("HOST_REJECTED","Host did not return a prompt result.");return o}),sessionLink:t=>R({channel:p,v:1,type:"session-link",id:E(i),payload:te(t)}),close:()=>R({channel:p,v:1,type:"close",id:E(i)}),oauthStart:()=>R({channel:p,v:1,type:"oauth-start",id:E(i)}),oauthDisconnect:()=>R({channel:p,v:1,type:"oauth-disconnect",id:E(i)}),request:t=>(Se(t.path)?I({channel:p,v:1,type:"request",id:E(i),payload:t}):Lt()).then(o=>{if(!_e(o))throw new a("HOST_REJECTED","Host request result was empty.");return o}),serviceRequest:t=>(Se(t.path)?I({channel:p,v:1,type:"service-request",id:E(i),payload:t}):Lt()).then(o=>{if(!_e(o))throw new a("HOST_REJECTED","Host service request result was empty.");return o}),serviceStatus:()=>I({channel:p,v:1,type:"service-status",id:E(i)}).then(t=>{if(!qe(t))throw new a("HOST_REJECTED","Host did not return service status.");return t}),readFile:t=>(oe(t)?I({channel:p,v:1,type:"file-read",id:E(i),payload:{path:t}}):ge()).then(o=>{if(!Qe(o))throw new a("HOST_REJECTED","Host did not return file content.");return o}),writeFile:(t,o)=>oe(t)?o.length>Ee?Promise.reject(new a("FILE_TOO_LARGE",`Content is over ${Ee} characters.`)):I({channel:p,v:1,type:"file-write",id:E(i),payload:{path:t,content:o}}).then(l=>{if(!Ze(l))throw new a("HOST_REJECTED","Host did not confirm the write.");return l}):ge(),listDir:t=>(oe(t)?I({channel:p,v:1,type:"file-list",id:E(i),payload:{path:t}}):ge()).then(o=>{if(!et(o))throw new a("HOST_REJECTED","Host did not return directory entries.");return o}),stat:t=>(oe(t)?I({channel:p,v:1,type:"file-stat",id:E(i),payload:{path:t}}):ge()).then(o=>{if(!tt(o))throw new a("HOST_REJECTED","Host did not return file status.");return o}),generate:t=>{let o=t.prompt.trim(),l=t.system?.trim();if(o.length===0||o.length>xe)return Promise.reject(new a("HOST_REJECTED",`Prompt must be 1 to ${xe} characters.`));if(l!==void 0&&(l.length===0||l.length>he))return Promise.reject(new a("HOST_REJECTED",`System prompt must be 1 to ${he} characters.`));let S=t.maxOutputTokens===void 0?void 0:Math.min(je,Math.max(1,Math.floor(t.maxOutputTokens)));if(S!==void 0&&!Number.isFinite(S))return Promise.reject(new a("HOST_REJECTED","maxOutputTokens must be a number."));let N={prompt:o};return l!==void 0&&(N.system=l),S!==void 0&&(N.maxOutputTokens=S),I({channel:p,v:1,type:"generate",id:E(i),payload:N},e.requestTimeoutMs??Ve).then(T=>{if(!ot(T))throw new a("HOST_REJECTED","Host did not return generated text.");return T})},setBadge:t=>R({channel:p,v:1,type:"badge",id:E(i),payload:{count:Je(t)}}),setHeight:t=>R({channel:p,v:1,type:"resize",id:E(i),payload:{height:Ye(t)}}),dispose:()=>{for(let t of x.keys())j({...V,type:"workspace-unsubscribe",id:E(i),payload:{subscriptionId:t}});x.clear(),h=!0,Q=null,Z=null,n.removeEventListener("message",mt);for(let t of c.values())clearTimeout(t.timer),t.reject(new a("HOST_UNAVAILABLE","Host client was disposed."));c.clear(),m.clear(),u.clear(),v.clear(),k.clear(),M.clear(),P.clear(),F.clear()}}};var Ht=["browser.open","browser.snapshot","browser.click","browser.type","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize"];var Yo=new Set(Ht);var Pt=["none","agent","user"];var Qo=new Set(Pt);var ho=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Dt=(e,n)=>{n.style.colorScheme=e.mode;for(let[r,s]of ho)n.style.setProperty(r,e.tokens[s]);n.style.setProperty("font-family",e.tokens.font),n.style.setProperty("font-size","0.875rem"),n.style.setProperty("line-height","1.45"),n.style.setProperty("color",e.tokens.foreground)},st=(e,n)=>{Dt(e.theme,n),n.dataset&&(n.dataset.ocSurface=e.surface,n.dataset.ocTheme=e.theme.mode)};var $t="oc-sdk-ui-style";var A=e=>{let n=document.getElementById($t);if(n instanceof HTMLStyleElement){n.textContent!==e&&(n.textContent=e);return}De(document);let r=document.createElement("style");r.id=$t,r.textContent=e,document.head.appendChild(r)},w=(e,n)=>{let r=document.createElement(e);return n&&(r.className=n),r},X=e=>{let n=w("button",e);return n.type="button",n},G=(e,n)=>{let r=n??"";e.textContent!==r&&(e.textContent=r)};var bo={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},b=(e,n)=>`var(--${e}, var(--oc-${bo[e]}, ${n}))`,W=b("surface-background","transparent"),Te=b("surface-elevated","transparent"),ae=b("surface-elevated-foreground","inherit"),ce=b("surface-foreground","inherit"),_=b("surface-muted-foreground","gray"),So=b("surface-muted","transparent"),L=b("interactive-border","currentColor"),U=b("interactive-hover","transparent"),J=b("interactive-active","transparent"),it=b("interactive-selection","transparent"),at=b("interactive-selection-foreground","inherit"),Xt=b("interactive-focus-ring","currentColor"),H=b("primary","currentColor"),ct=b("primary-text","inherit"),dt=b("error-text","inherit"),_o=b("font-sans","inherit"),lt=b("font-mono","monospace"),Ft=b("radius","9px"),g=(e,n,r="transparent")=>`color-mix(in srgb, ${e} ${n}%, ${r})`,Bt=`box-shadow: 0 0 0 2px ${Xt};`,ke=e=>{let n=b(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${n}; --oc-sdk-tone-text: ${b(`${e}-text`,"inherit")}; }`},y=`
${Pe}
.oc-sdk { box-sizing: border-box; color: ${ce}; font-family: ${_o}; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }
.oc-sdk :focus-visible { outline: none; ${Bt} }
.oc-sdk-mono { font-family: ${lt}; }
.oc-sdk-muted { color: ${_}; }
${ke("success")}${ke("warning")}${ke("error")}${ke("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${H}; --oc-sdk-tone-text: ${ct}; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 36px; padding: 0 14px; border: 1px solid transparent; border-radius: ${Ft}; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="sm"] { height: 32px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { height: 24px; padding: 0 8px; font-size: 0.75rem; border-radius: 6px; }
.oc-sdk-btn[data-variant="default"] { color: ${ct}; background: ${g(H,10,W)}; border-color: ${g(H,12)}; }
.oc-sdk-btn[data-variant="default"]:hover { background: ${g(H,16,W)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${g(H,22,W)}; }
.oc-sdk-btn[data-variant="secondary"] { background: ${So}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="outline"] { background: ${Te}; color: ${ae}; border-color: ${L}; }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${U}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${J}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${b("status-error","red")}; color: ${dt}; background: ${g("var(--oc-sdk-tone)",7,W)}; border-color: ${g("var(--oc-sdk-tone)",12)}; }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${g("var(--oc-sdk-tone)",9,W)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${g("var(--oc-sdk-tone)",11,W)}; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; color: ${_}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${dt}; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 36px; padding: 0 12px; border: 0; border-radius: ${Ft}; background: ${Te}; color: ${ae}; font-size: 0.875rem; line-height: 1.45; appearance: none; box-shadow: inset 0 0 0 1px ${g(L,60)}; transition: background 150ms ease-out, box-shadow 150ms ease-out; }
textarea.oc-sdk-input { height: auto; padding: 8px 12px; resize: vertical; }
.oc-sdk-input::placeholder { color: ${_}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { box-shadow: inset 0 0 0 2px ${Xt}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input { box-shadow: inset 0 0 0 1px ${b("status-error","red")}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { box-shadow: inset 0 0 0 2px ${b("status-error","red")}; }
.oc-sdk-input[data-mono="true"] { font-family: ${lt}; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: ${_}; pointer-events: none; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${H}; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; color: ${_}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }
.oc-sdk-search-clear:hover { background: ${U}; color: ${ce}; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; width: 100%; min-width: 0; height: 32px; padding: 0 8px 0 10px; border: 1px solid ${L}; border-radius: 6px; background: ${Te}; color: ${ae}; font-size: 0.8125rem; text-align: left; transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${U}, ${U}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${J}, ${J}); }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-value[data-empty="true"] { color: ${_}; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; color: ${_}; }
.oc-sdk-popup { --surface-foreground: ${ae}; position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid ${g(L,60)}; border-radius: 12px; background: ${Te}; color: ${ae}; box-shadow: 0 8px 24px ${g(ce,12)}; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 32px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option[data-active="true"] { background: ${U}; }
.oc-sdk-option[aria-selected="true"] { background: ${it}; color: ${at}; }
.oc-sdk-option[data-destructive="true"] { color: ${dt}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${g(b("status-error","red"),10)}; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; color: ${_}; }
.oc-sdk-option-check { flex: 0 0 auto; width: 12px; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; color: ${_}; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid ${L}; border-radius: 4px; color: ${H}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${g(H,65,L)}; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; border-radius: 9999px; background: ${L}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 9999px; background: ${W}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${H}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Bt} }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; color: ${_}; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; border-radius: 10px; max-width: 100%; overflow: auto; }
.oc-sdk-tabs[data-track="true"] { background: ${g(ce,4)}; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 8px; font-size: 0.8125rem; font-weight: 500; color: ${_}; white-space: nowrap; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ce}; }
.oc-sdk-tab[aria-selected="true"] { color: ${at}; background: ${it}; border-color: ${L}; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${_}; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 9999px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; background: ${U}; color: ${_}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${g("var(--oc-sdk-tone)",15)}; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; border-radius: 6px; text-align: left; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${U}; }
.oc-sdk-row[aria-selected="true"] { background: ${it}; color: ${at}; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ${lt}; font-size: 0.75rem; color: ${_}; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: ${_}; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; color: ${_}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; color: ${_}; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; color: ${_}; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; color: ${_}; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid ${L}; border-top-color: ${H}; border-radius: 9999px; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid ${g("var(--oc-sdk-tone)",40)}; border-radius: 8px; background: ${g("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { font-size: 0.8125rem; color: ${_}; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; color: ${_}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; background: ${g(L,40)}; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: ${_}; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; border-radius: 9999px; background: ${L}; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; border-radius: 9999px; background: var(--oc-sdk-tone, ${H}); transform-origin: left; transition: transform 200ms ease-out; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text a { color: ${ct}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; border-radius: 8px; border: 1px solid ${g(L,60)}; }
`;var go=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},z=(e,n)=>{A(y);let r=n,s=X("oc-sdk oc-sdk-btn"),m=go(),u=document.createElement("span");s.append(u),e.append(s);let v=()=>{s.dataset.variant=r.variant??"default",s.dataset.size=r.size??"default",s.disabled=!!r.disabled||!!r.loading,s.dataset.loading=r.loading?"true":"false",s.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&m.parentNode!==s?s.prepend(m):!r.loading&&m.parentNode===s&&m.remove(),G(u,r.label)},k=()=>{r.disabled||r.loading||r.onClick()};return s.addEventListener("click",k),v(),{update:M=>{r={...r,...M},v()},dispose:()=>{s.removeEventListener("click",k),s.remove()}}};var re="~/.config/opencode/agents/build.md",jt="~/.config/openchamber/prompt-override",se=`${jt}/state.json`,Y=`${jt}/backups`,Re=`---
mode: all
---

`,pt=1e5,Vt="\u5185\u7F6E\u63D0\u793A\u8BCD\u57FA\u7EBF \xB7 2026-10-21",ne=class extends Error{},Oe=(e,n)=>e.exists===n.exists&&e.content===n.content,de=e=>e.trim()===""||e.trim()===`---
mode: all
---`,Kt=e=>`---
mode: all
---

${e.trim()}
`;var Wt=e=>{if(!e||typeof e!="object")return!1;let n=e;return typeof n.exists=="boolean"&&typeof n.content=="string"},Oo=e=>/^\d{13}-[a-f0-9-]{36}$/.test(e),Co=e=>{if(!e.trim())throw new Error("\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u4E3A\u7A7A\u3002");if(e.length>pt)throw new Error(`\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u8D85\u8FC7 ${pt.toLocaleString("zh-CN")} \u4E2A\u5B57\u7B26\u3002`);if(e.includes("\0"))throw new Error("\u8986\u76D6\u6587\u672C\u4E0D\u80FD\u5305\u542B\u7A7A\u5B57\u8282\u3002")},Io=e=>{try{let n=JSON.parse(e);if(n.version!==1||!Wt(n.baseline)||!Wt(n.applied))throw new Error;if(!Number.isFinite(n.appliedAt)||typeof n.baselineLabel!="string")throw new Error;return n}catch{throw new Error("\u8986\u76D6\u72B6\u6001\u6587\u4EF6\u683C\u5F0F\u6709\u8BEF\uFF0C\u73B0\u6709 build.md \u672A\u4FEE\u6539\u3002\u8BF7\u4FEE\u590D state.json \u6216\u4ECE\u5907\u4EFD\u6062\u590D\u3002")}},Uo=(e,n)=>n.exists?e?Oe(n,e.baseline)?de(e.baseline.content)?"builtin":"baseline":Oe(n,e.applied)?"applied":"drifted":de(n.content)?"builtin":"drifted":"missing",Mo=(e,n,r)=>e.state?e.state.baseline:n.kind==="restore"?{exists:!0,content:de(n.content)?Re:n.content}:n.kind==="backup"?{exists:!0,content:de(n.content)?n.content:Re}:r,Jt=(e,n=Date.now,r=()=>crypto.randomUUID())=>{let s=async()=>{let c=await e.read(re);return{exists:c!==null,content:c??""}},m=async()=>e.read(se),u=async()=>{let[c,x]=await Promise.all([s(),m()]),h=x===null?null:Io(x);return{state:h,stateRaw:x,current:c,status:Uo(h,c)}},v=async(c,x)=>{let h=n(),i=`${h}-${r()}`,d={version:1,id:i,createdAt:h,label:c,content:x},O=`${Y}/${i}.json`,B=JSON.stringify(d,null,2);if(await e.write(O,B),await e.read(O)!==B)throw new Error("\u5907\u4EFD\u6821\u9A8C\u5931\u8D25\uFF0C\u76EE\u6807\u6587\u4EF6\u672A\u4FEE\u6539\u3002");return i},k=async(c,x)=>(Co(x),{kind:"apply",before:c.current,content:Kt(x),label:"\u5E94\u7528\u8986\u76D6"}),M=async c=>{let x=c.state?.baseline.exists?c.state.baseline.content:Re;return{kind:"restore",before:c.current,content:x,label:"\u8FD8\u539F\u5185\u7F6E"}},P=async()=>(await e.list(Y)).filter(c=>/^\d{13}-[a-f0-9-]{36}\.json$/.test(c)).sort().reverse().slice(0,50).map(c=>c.slice(0,-5)),F=async c=>{if(!Oo(c))throw new Error("\u5907\u4EFD\u7F16\u53F7\u65E0\u6548\u3002");let x=await e.read(`${Y}/${c}.json`);try{let h=JSON.parse(x??"");if(h.version!==1||h.id!==c||!Number.isFinite(h.createdAt)||typeof h.label!="string"||typeof h.content!="string")throw new Error;return h}catch{throw new Error("\u5907\u4EFD\u7F3A\u5931\u6216\u683C\u5F0F\u6709\u8BEF\uFF0C\u672A\u4FEE\u6539 build.md\u3002")}};return{load:u,reviewApply:k,reviewRestore:M,reviewBackup:async c=>{let x=await F(c);return{kind:"backup",before:await s(),content:x.content,label:`\u6062\u590D\u5907\u4EFD ${new Date(x.createdAt).toLocaleString("zh-CN")}`,backupId:c}},apply:async(c,x)=>{let[h,i]=await Promise.all([s(),m()]);if(i!==c.stateRaw)throw new ne("\u8986\u76D6\u72B6\u6001\u5DF2\u88AB\u5176\u4ED6\u7A97\u53E3\u4FEE\u6539\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u540E\u518D\u64CD\u4F5C\u3002");if(!Oe(h,x.before))throw new ne("build.md \u5728\u9884\u89C8\u540E\u5DF2\u88AB\u4FEE\u6539\uFF0C\u672A\u5199\u5165\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u5E76\u9884\u89C8\u5DEE\u5F02\u3002");if(h.exists&&h.content===x.content)return u();h.exists&&await v(`${x.label}\u524D`,h.content),await e.write(re,x.content);let d=await s();if(!d.exists||d.content!==x.content)throw new ne("\u5199\u5165\u540E\u6587\u4EF6\u5185\u5BB9\u4E0E\u9884\u89C8\u4E0D\u4E00\u81F4\uFF0C\u53EF\u80FD\u6709\u5176\u4ED6\u7F16\u8F91\u5668\u540C\u65F6\u5199\u5165\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u64CD\u4F5C\u524D\u7684\u5907\u4EFD\u4ECD\u53EF\u67E5\u770B\u3002");let O={version:1,baseline:Mo(c,x,h),applied:{exists:!0,content:x.content},appliedAt:n(),baselineLabel:c.state?.baselineLabel??Vt},B=JSON.stringify(O,null,2);if(await e.write(se,B),await e.read(se)!==B)throw new Error("build.md \u5DF2\u5199\u5165\uFF0C\u4F46\u8986\u76D6\u72B6\u6001\u56DE\u8BFB\u4E0D\u4E00\u81F4\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\u786E\u8BA4\uFF0C\u4E0D\u8981\u91CD\u590D\u5E94\u7528\u3002");return u()},listBackups:P,readBackup:F}};var Ce=e=>e&&typeof e=="object"&&"code"in e?e.code:void 0,Lo=(e,n)=>e===re?"build \u63D0\u793A\u8BCD":e===se?"\u8986\u76D6\u72B6\u6001":e===`${Y}`&&n==="list"?"\u5907\u4EFD\u5217\u8868":e.startsWith(`${Y}/`)?"\u5907\u4EFD\u6587\u4EF6":n==="list"?"\u6587\u4EF6\u5217\u8868":"\u6587\u4EF6",Yt=(e,n=!1)=>{let r=Ce(e);if(r==="NOT_GRANTED")return"\u8BF7\u5728\u8BBE\u7F6E \u2192 \u6269\u5C55\u4E2D\u5141\u8BB8\u201C\u5185\u7F6E\u63D0\u793A\u8BCD\u201D\u8BBF\u95EE build.md \u4E0E\u8986\u76D6\u6570\u636E\u76EE\u5F55\u3002";if(r==="DENIED")return"\u6587\u4EF6\u6743\u9650\u4E0D\u8DB3\uFF0C\u8BF7\u68C0\u67E5 build.md \u6216\u8986\u76D6\u6570\u636E\u76EE\u5F55\u7684\u6743\u9650\u3002";if(r==="HOST_TIMEOUT")return"\u5BBF\u4E3B\u54CD\u5E94\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6\u6587\u4EF6\u786E\u8BA4\u5B9E\u9645\u72B6\u6001\uFF0C\u518D\u7EE7\u7EED\u64CD\u4F5C\u3002";if(r==="BAD_PATH")return"\u76EE\u6807\u8DEF\u5F84\u4E0D\u5728\u6388\u6743\u8303\u56F4\u5185\uFF0C\u6216\u7B26\u53F7\u94FE\u63A5\u6307\u5411\u4E86\u5176\u4ED6\u76EE\u5F55\u3002";if(r==="HOST_REJECTED"){let s=e instanceof Error?e.message:"";if(n&&s==="Extension operation failed.")return"\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u542B\u4E2D\u6587\u7B49\u5B57\u7B26\uFF0C\u89E6\u53D1\u4E86 OpenChamber \u6587\u4EF6\u63A5\u53E3\u7684\u517C\u5BB9\u95EE\u9898\u3002\u53EF\u6682\u65F6\u5728\u65E0\u9879\u76EE\u4F1A\u8BDD\u4E2D\u4ECE\u53F3\u4FA7\u6253\u5F00\u201C\u5185\u7F6E\u63D0\u793A\u8BCD\u201D\u3002";if(!s||s==="Extension operation failed."||s==="File operation failed.")return"OpenChamber \u6587\u4EF6\u63A5\u53E3\u8FD4\u56DE\u5F02\u5E38\uFF0C\u672A\u63D0\u4F9B\u5177\u4F53\u539F\u56E0\u3002\u8BF7\u91CD\u65B0\u8BFB\u53D6\uFF1B\u6301\u7EED\u5931\u8D25\u65F6\u91CD\u65B0\u52A0\u8F7D\u9762\u677F\u3002"}return e instanceof Error?e.message:"\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002"},ie=class extends Error{code;constructor(n,r,s,m){let u=n==="write"?"\u5199\u5165":"\u8BFB\u53D6";super(`${u} ${Lo(r,n)}\u5931\u8D25\uFF1A${Yt(s,m)}${n==="write"?" \u5199\u5165\u7ED3\u679C\u5C1A\u672A\u786E\u8BA4\uFF0C\u8BF7\u5148\u91CD\u65B0\u8BFB\u53D6\u5B9E\u9645\u72B6\u6001\uFF0C\u52FF\u76F4\u63A5\u91CD\u590D\u5199\u5165\u3002":""}`,{cause:s}),this.name="FileOperationError",this.code=Ce(s)}},qt=e=>{let n=!1,r=s=>{n=/[^\u0000-\u00ff]/.test(s??"")};return e.onReady(s=>r(s.directory)),e.onDirectory(r),{async read(s){let m=n;try{return(await e.readFile(s)).content}catch(u){if(Ce(u)==="NOT_FOUND")return null;throw new ie("read",s,u,m)}},async write(s,m){let u=n;try{await e.writeFile(s,m)}catch(v){throw new ie("write",s,v,u)}},async list(s){let m=n;try{return(await e.listDir(s)).entries.filter(u=>u.kind==="file").map(u=>u.name)}catch(u){if(Ce(u)==="NOT_FOUND")return[];throw new ie("list",s,u,m)}}}},ut=e=>e instanceof ie?e.message:Yt(e);var $=(e,n="",r)=>{let s=document.createElement(e);return s.className=n,r!==void 0&&(s.textContent=r),s},Qt=e=>e==="builtin"?"\u4F7F\u7528\u5185\u7F6E\u63D0\u793A\u8BCD":e==="baseline"?"\u4F7F\u7528\u57FA\u7EBF\u5185\u5BB9":e==="applied"?"\u5DF2\u5E94\u7528\u8986\u76D6":e==="drifted"?"\u6587\u4EF6\u5DF2\u88AB\u5916\u90E8\u4FEE\u6539":"build.md \u7F3A\u5931",Zt=e=>e==="builtin"?"\u5185\u7F6E":e==="baseline"?"\u57FA\u7EBF":e==="applied"?"\u5DF2\u8986\u76D6":e==="drifted"?"\u5916\u90E8\u4FEE\u6539":"\u7F3A\u5931";var eo=`/* Shared foundation for OpenChamber extensions. Colors and fonts belong to the host. */
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
}
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: var(--ext-bg); }
body { overflow: hidden; }
#root { height: 100%; }
[hidden] { display: none !important; }
button, input, textarea, select { font: inherit; }
.ext { color: var(--oc-fg); font-family: var(--oc-font); font-size: var(--ext-text-body); line-height: 1.5; }
.ext button:focus-visible, .ext [tabindex]:focus-visible { outline: 2px solid var(--oc-focus); outline-offset: 2px; }
.ext-actions { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ext-space-2); }
.ext-muted { color: var(--oc-muted); font-size: var(--ext-text-small); }
.ext-notice { margin: 0; padding: 10px 12px; border-radius: var(--oc-radius, 6px); font-size: 12px; overflow-wrap: anywhere; background: color-mix(in srgb, var(--oc-info) 7%, var(--ext-bg)); color: var(--oc-info-text); }
.ext-notice[data-tone="success"] { background: color-mix(in srgb, var(--oc-success) 7%, var(--ext-bg)); color: var(--oc-success-text); }
.ext-notice[data-tone="warning"] { background: color-mix(in srgb, var(--oc-warning) 8%, var(--ext-bg)); color: var(--oc-warning-text); }
.ext-notice[data-tone="error"] { background: color-mix(in srgb, var(--oc-error) 7%, var(--ext-bg)); color: var(--oc-error-text); }
.ext .oc-sdk-btn[data-size="sm"], .ext .oc-sdk-tab { font-size: 12px; }
.ext .oc-sdk-field-note { font-size: var(--ext-text-small); }
@media (prefers-reduced-motion: reduce) {
  .ext *, .ext *::before, .ext *::after { animation: none !important; transition: none !important; }
}
`;var to=`.po { height: 100%; display: flex; flex-direction: column; min-width: 0; }
.po-header { flex: none; padding: 12px 16px 8px; border-bottom: 1px solid var(--oc-border); }
.po-kicker-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.po-kicker { margin: 0; }
.po-title { margin: 0; font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.po-context { margin: 3px 0 10px; }
.po-refresh { flex: none; }
.po-tabs { margin-top: 8px; }
.po-tabs .oc-sdk-tabs { width: 100%; }
.po-scroll { flex: 1; min-height: 0; padding: 16px; overflow: auto; scrollbar-gutter: stable; }
.po-message { margin: 0 0 12px; }
.po-stack { display: grid; gap: 16px; min-width: 0; }
.po-meta { display: grid; grid-template-columns: 64px minmax(0, 1fr); gap: 6px 12px; margin: 0; font-size: 12px; }
.po-meta dt { color: var(--oc-muted); }
.po-meta dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.po-meta code { display: block; overflow: hidden; font: 11px/1.5 var(--oc-mono); text-overflow: ellipsis; white-space: nowrap; }
.po-hint { margin: 0; max-width: 60ch; font-size: 11px; line-height: 1.55; }
.po-footer { flex: none; padding: 12px 16px; border-top: 1px solid var(--oc-border); background: var(--ext-bg); }
.po-footer p { margin: 0 0 8px; }
.po-footer .ext-actions { justify-content: flex-end; }
.po-status-row { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: baseline; gap: 12px; min-width: 0; min-height: 20px; }
.po-status-label { color: var(--oc-muted); font-size: 12px; }
.po-status-value { min-width: 0; overflow: hidden; text-align: right; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 500; }
.po-status-value[data-status="applied"] { color: var(--oc-success-text); }
.po-status-value[data-status="baseline"] { color: var(--oc-info-text); }
.po-status-value[data-status="drifted"] { color: var(--oc-warning); }
.po-status-value[data-status="missing"] { color: var(--oc-error-text); }
.po-section { padding: 4px 0 0; }
.po-section p { margin: 0; }
.po-status-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.po-status-footer .ext-actions { flex: none; gap: 4px; }
.po-status-footer .oc-sdk-btn { min-height: 28px; padding: 0 6px; font-weight: 400; }
html[data-oc-surface="status"] { --ext-bg: color-mix(in srgb, var(--surface-muted, transparent) 40%, var(--surface-background, transparent)); height: auto; }
html[data-oc-surface="status"] body, html[data-oc-surface="status"] #root { height: auto; overflow: auto; }
@media (max-width: 320px) {
  .po-header { padding-left: 12px; padding-right: 12px; }
  .po-scroll { padding: 12px; }
  .po-footer { padding-left: 12px; padding-right: 12px; }
  .po-meta { grid-template-columns: 56px minmax(0, 1fr); }
  .po-status-row { grid-template-columns: auto minmax(0, 1fr); }
}
`;var oo=`.po-field .oc-sdk-field-label { font-size: 12px; }
.po-field .oc-sdk-input { font-size: 13px; min-height: 36px; }
.po-field textarea { min-height: 220px; max-height: 60vh; resize: vertical; line-height: 1.65; tab-size: 2; }
.po-field .oc-sdk-field-note { font-variant-numeric: tabular-nums; }
.po-editor { min-width: 0; }
.po-review-title { margin: 0; font-size: 14px; overflow-wrap: anywhere; }
.po-review-note { margin: 0; padding: 8px 10px; font-size: 12px; }
.po-review-summary { margin: 0; font-variant-numeric: tabular-nums; }
.po-review-hint { margin: 0; font-size: 11px; }
.po-review-actions { padding-top: 10px; border-top: 1px solid var(--oc-border); }
.po-diff { max-height: 42vh; overflow: auto; border: 1px solid var(--oc-border); border-radius: var(--oc-radius); font: 11px/1.65 var(--oc-mono); }
.po-diff-line { display: grid; grid-template-columns: 30px 30px 16px minmax(0, 1fr); min-width: 0; }
.po-diff-line span { padding: 1px 3px; color: var(--oc-muted); text-align: right; user-select: none; }
.po-diff-line code { padding: 1px 8px 1px 0; font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; }
.po-diff-line[data-kind="add"] { background: color-mix(in srgb, var(--oc-success) 10%, transparent); color: var(--oc-success-text); }
.po-diff-line[data-kind="remove"] { background: color-mix(in srgb, var(--oc-error) 10%, transparent); color: var(--oc-error-text); }
.po-diff-gap { margin: 0; padding: 5px 12px; background: var(--oc-hover); color: var(--oc-muted); font: 11px/1.5 var(--oc-font); }
.po-preview { max-height: 40vh; margin: 0; padding: 12px; overflow: auto; border: 1px solid var(--oc-border); border-radius: var(--oc-radius); font: 11px/1.65 var(--oc-mono); white-space: pre-wrap; overflow-wrap: anywhere; }
`;var so=document.createElement("style");so.textContent=eo+to+oo;document.head.append(so);var Me=rt(),Po=Jt(qt(Me)),Ie=$("section","ext po-section"),q=$("p","po-status-value","\u6B63\u5728\u8BFB\u53D6\u2026");q.setAttribute("role","status");var io=$("div","po-status-row");io.append($("span","po-status-label","\u5F53\u524D\u72B6\u6001"),q);var Ue=$("p","ext-muted","build.md");Ue.title="\u4EC5\u8868\u793A\u5F53\u524D\u8FDE\u63A5\u670D\u52A1\u5668\u7684\u6587\u4EF6\u72B6\u6001\uFF0C\u4E0D\u4EE3\u8868\u5DF2\u6709\u4F1A\u8BDD\u5DF2\u52A0\u8F7D\u89C4\u5219\u3002";var D=$("p","ext-notice");D.hidden=!0;D.setAttribute("role","status");var ao=$("div","po-status-footer"),Le=$("div","ext-actions");ao.append(Ue,Le);Ie.append(io,ao,D);document.querySelector("#root").append(Ie);var ft=!1,no=!1,co=async()=>{if(!ft){ft=!0,ro.update({loading:!0});try{let e=await Po.load();q.textContent=Zt(e.status),q.setAttribute("data-status",e.status),q.title=Qt(e.status),Ue.textContent=`\u8BFB\u53D6\u4E8E ${new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"})}`,D.hidden=!0}catch(e){q.textContent="\u672A\u8BFB\u53D6",q.removeAttribute("data-status"),Ue.textContent="build.md",D.textContent=ut(e),D.dataset.tone="error",D.hidden=!1}finally{ft=!1,ro.update({loading:!1})}}},ro=z(Le,{label:"\u5237\u65B0",size:"sm",variant:"ghost",onClick:()=>{co()}});z(Le,{label:"\u7BA1\u7406",size:"sm",variant:"ghost",onClick:()=>{Me.openSurface("plugin:prompt-override").catch(e=>{D.hidden=!1,D.dataset.tone="error",D.textContent=ut(e)})}});Le.lastElementChild.setAttribute("aria-label","\u7BA1\u7406\u5185\u7F6E\u63D0\u793A\u8BCD");new ResizeObserver(()=>{Me.setHeight(Math.ceil(Ie.getBoundingClientRect().height)).catch(()=>{})}).observe(Ie);Me.onReady(e=>{st(e,document.documentElement),no||(no=!0,co())});})();
