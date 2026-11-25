// studio.js — গজল স্টুডিও + কুরআন তেলাওয়াত স্টুডিও (UI, ভিডিও গ্রেডিং, প্রিভিউ, এক্সপোর্ট)
(function(){
const $=id=>document.getElementById(id),say=t=>{try{msg(t)}catch(e){alert(t)}},AC=window.AudioContext||window.webkitAudioContext;
const A0={nr:19,cl:15,de:23,hp:0,cr:2.5,ca:15,cs:100,gr:5,rv:7.5,rd:1.6,dm:3,df:7.5,dt:120,lu:-14,tp:-1};
const PRE={
ghazal:{t:'গজল স্টুডিও',s:'গজল, নাশিদ, হামদ, নাত ও দলীয় কণ্ঠ',p:'Studio Ghazal',ic:'music',
 a:{...A0,eq:[[250,-1.5],[800,-.75],[3000,1.1],[5000,.75],[10000,.75]]},
 v:{ex:.23,br:4,ct:9,hl:-19,sd:14,sa:6,vb:11,sp:11,nr:15,awb:1,skin:1,stab:0}},
quran:{t:'কুরআন তেলাওয়াত স্টুডিও',s:'কুরআন তেলাওয়াত, ক্বিরাত ও তিলাওয়াত — প্রাকৃতিক ভয়েস',p:'Quran Pure Voice',ic:'mic',
 a:{nr:12,cl:12,de:10,hp:80,cr:1.5,ca:20,cs:200,gr:2,rv:0,rd:0,dm:0,df:0,dt:120,lu:-16,tp:-1,eq:[[250,-.5],[800,0],[3000,.5],[5000,.5],[10000,.3]]},
 v:{ex:.15,br:3,ct:6,hl:-15,sd:10,sa:2,vb:3,sp:8,nr:12,awb:1,skin:1,stab:1}}};
const AD=[['nr','নয়েজ রিডাকশন %',0,60,1],['hp','লো-কাট ফিল্টার (Hz)',0,200,5],['cl','ভয়েস ক্ল্যারিটি %',0,50,1],['de','ডি-এসার %',0,60,1],['cr','কম্প্রেসর রেশিও',1,6,.1],['rv','রিভার্ব ওয়েট %',0,30,.5],['rd','রিভার্ব ডিকে (সে)',.3,4,.1],['dm','ডিলে মিক্স %',0,20,.5],['lu','লাউডনেস টার্গেট (LUFS)',-24,-8,.5],['tp','ট্রু-পিক সীমা (dBTP)',-3,0,.1]];
const VD=[['ex','এক্সপোজার (EV)',-1,1,.01],['br','ব্রাইটনেস',-30,30,1],['ct','কনট্রাস্ট',-30,30,1],['hl','হাইলাইটস',-50,50,1],['sd','শ্যাডোজ',-50,50,1],['sa','স্যাচুরেশন',-30,30,1],['vb','ভাইব্র্যান্স',-30,30,1],['sp','শার্পেন',0,40,1],['nr','ভিডিও নয়েজ রিডাকশন %',0,40,1]];
const S={},clone=o=>JSON.parse(JSON.stringify(o));
// ---------- WebGL গ্রেডার (সব ইফেক্ট শেডারে সত্যিকারের পিক্সেল প্রসেসিং) ----------
const FS=`precision highp float;varying vec2 v;uniform sampler2D T;uniform vec2 px;uniform float ex,br,ct,hl,sd,sa,vb,sp,nr,bp,sk;uniform vec3 wb;
float lm(vec3 c){return dot(c,vec3(.299,.587,.114));}
float skin(vec3 c){float cb=.5-.1687*c.r-.3313*c.g+.5*c.b,cr=.5+.5*c.r-.4187*c.g-.0813*c.b;return smoothstep(.27,.32,cb)*(1.-smoothstep(.48,.53,cb))*smoothstep(.49,.54,cr)*(1.-smoothstep(.66,.71,cr))*smoothstep(.12,.25,lm(c));}
vec3 S(vec2 o){return texture2D(T,v+o*px).rgb;}
void main(){vec3 c0=S(vec2(0.)),c=c0;if(bp>.5){gl_FragColor=vec4(c0,1.);return;}
float m=skin(c0)*sk;vec3 b1=(S(vec2(1.,0.))+S(vec2(-1.,0.))+S(vec2(0.,1.))+S(vec2(0.,-1.)))*.25;
if(nr>0.){vec3 a=c0;float w=1.;for(int i=0;i<8;i++){float t=float(i)*.785398;vec3 n=S(vec2(cos(t),sin(t))*1.7);vec3 d=n-c0;float q=exp(-dot(d,d)*30.);a+=n*q;w+=q;}c=mix(c0,a/w,clamp(nr*1.5*(1.-.4*m),0.,1.));}
c+=(c0-b1)*sp*2.*(1.-.5*m);c*=mix(vec3(1.),wb,1.-.7*m);
c=pow(max(c,0.),vec3(2.2))*pow(2.,ex);c=pow(c,vec3(1./2.2));c+=br*.5;c=(c-.5)*(1.+ct)+.5;
float l=lm(c);c*=1.+hl*.5*smoothstep(.5,1.,l);c+=sd*.4*(1.-smoothstep(0.,.5,l));
l=lm(c);float st=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));c=mix(vec3(l),c,1.+(sa+vb*(1.-clamp(st*2.,0.,1.)))*(1.-.5*m));
gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
function mkGL(cv){const gl=cv.getContext('webgl',{preserveDrawingBuffer:true,alpha:false});if(!gl)return null;
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o},pg=gl.createProgram();
 gl.attachShader(pg,sh(gl.VERTEX_SHADER,'attribute vec2 p;uniform vec3 tf;varying vec2 v;void main(){v=(vec2(p.x*.5+.5,.5-p.y*.5)-.5)/tf.z+.5+tf.xy;gl_Position=vec4(p,0.,1.);}'));gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pg);gl.useProgram(pg);
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const l=gl.getAttribLocation(pg,'p');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
 const tx=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(([a,b])=>gl.texParameteri(gl.TEXTURE_2D,a,b));
 const U=n=>gl.getUniformLocation(pg,n);return{draw(v,p,w){gl.viewport(0,0,cv.width,cv.height);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,v);
  for(const k of['ex','br','ct','hl','sd','sa','vb','sp','nr','bp','sk'])gl.uniform1f(U(k),p[k]||0);{const t=p.tf||[0,0,1];gl.uniform3f(U('tf'),t[0],t[1],t[2])}gl.uniform2f(U('px'),1/v.videoWidth,1/v.videoHeight);gl.uniform3f(U('wb'),w[0],w[1],w[2]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}}}
// ভিডিও প্যারামিটার → শেডার মান (স্ট্রেংথ ৭৫% = ব্যবহারকারীর মান হুবহু)
function vp(s,bypass){const v=s.cfg.v,k=s.st/75,f=x=>x/100*k;return{ex:v.ex*k,br:f(v.br),ct:f(v.ct),hl:f(v.hl),sd:f(v.sd),sa:f(v.sa),vb:f(v.vb),sp:f(v.sp),nr:f(v.nr),bp:bypass?1:0,sk:v.skin?1:0,tf:(s.stab&&s.sp&&s.spF===s.file)?(q=>[-q[0],-q[1],1.1])(MSStab.at(s.sp,s.vid.currentTime)):[0,0,1]}}
const awbC=document.createElement('canvas');awbC.width=awbC.height=16;const awbX=awbC.getContext('2d',{willReadFrequently:true});
function awb(s,vid){const now=performance.now();if(!s.cfg.v.awb)return[1,1,1];if(!s.wb||now-s.wbT>250){s.wbT=now;try{awbX.drawImage(vid,0,0,16,16);const d=awbX.getImageData(0,0,16,16).data;let r=0,g=0,b=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2]}const m=(r+g+b)/3,t=[m/r,m/g,m/b].map(q=>Math.min(1.08,Math.max(.92,q)));s.wb=s.wb?s.wb.map((o,i)=>o+(t[i]-o)*.2):t}catch(e){s.wb=[1,1,1]}}const k=s.st/75;return s.wb.map(q=>1+(q-1)*k)}
// ---------- UI ----------
function card(k){const P=PRE[k];return`<section class="card stc" id="c_${k}"><div class="ir" style="border:0"><i><svg class="i"><use href="#i-${P.ic}"/></svg></i><div><b>${P.t}</b><small>${P.s}<br>প্রিসেট: ${P.p} · স্ট্রেংথ <span id="sv_${k}">75</span>% · অডিও ✔ ভিডিও ✔</small></div></div>
<input type="file" id="f_${k}" accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.mov" hidden>
<div class="row"><button class="g" id="up_${k}">⬆ Upload Media</button><button class="b" id="go_${k}" disabled>✨ One Click Auto Enhance</button></div>
<div class="row"><button class="g" id="en_${k}">✨ Enhance</button><button class="g" id="sb_${k}">📐 Stabilise</button></div>
<div class="row"><button class="b" id="ma_${k}">🤖 Auto</button><button class="g" id="mm_${k}">🎛 Manual</button></div>
<small id="inf_${k}">MP3, WAV, MP4, MOV ইত্যাদি। মিডিয়া আপনার ডিভাইসেই প্রসেস হয়, কোথাও আপলোড হয় না।</small>
<div class="prog"><i id="pb_${k}"></i></div><small id="ps_${k}"></small>
<div id="pv_${k}" hidden><canvas id="cv_${k}" class="stcv"></canvas><div class="row"><button class="g" id="po_${k}">▶ Play Original</button><button class="g" id="pe_${k}">▶ Play Enhanced</button><button class="g" id="px_${k}">■ Stop</button></div><div class="tp"><input type="range" id="sk_${k}" min="0" max="1" step=".01" value="0"><span id="ti_${k}" style="min-width:84px;text-align:right;font-size:.8rem">0:00</span></div><small id="rp_${k}"></small></div>
<div class="row"><select id="sz_${k}" style="flex:1"><option value="0">ভিডিও সাইজ: মূল (Source)</option><option value="1080">সর্বোচ্চ 1080p</option><option value="720">সর্বোচ্চ 720p</option></select></div>
<div class="row"><button class="b" id="dl_${k}" disabled>⬇ Download Result</button><button class="g" id="rs_${k}">↺ Reset Preset</button></div>
<details id="dt_${k}" hidden style="margin-top:8px"><summary style="font-weight:700">🎛 Manual Settings (বাড়ান/কমান)</summary><div id="ad_${k}"></div></details>
<small id="lm_${k}" style="display:block;margin-top:8px"></small></section>`}
const sl=(k,sec,[key,l,a,b,st])=>`<div class="s"><span>${l}</span><input type="range" min="${a}" max="${b}" step="${st}" data-k="${k}" data-sec="${sec}" data-key="${key}" value="0"><span></span></div>`;
function advUI(k){let h='<div class="lb">স্ট্রেংথ (৭৫ = প্রিসেটের মান হুবহু)</div>'+sl(k,'st',['st','স্ট্রেংথ %',0,100,1])+'<div class="lb">🎧 অডিও</div>'+AD.filter(d=>k!='quran'||!['rv','rd','dm'].includes(d[0])).map(d=>sl(k,'a',d)).join('')+'<div class="lb">ইকিউ (dB)</div>'+[250,800,3000,5000,10000].map((f,i)=>sl(k,'eq'+i,['g',f+' Hz',-6,6,.05])).join('')+'<div class="lb">🎬 ভিডিও</div>'+VD.map(d=>sl(k,'v',d)).join('')+
 '<div class="row"><label class="aiw"><input type="checkbox" data-k="'+k+'" data-sec="v" data-key="awb"> Auto White Balance</label><label class="aiw"><input type="checkbox" data-k="'+k+'" data-sec="v" data-key="skin"> '+(k=='quran'?'Natural Skin Tone Protection':'Face Protection')+'</label></div>';$('ad_'+k).innerHTML=h}
function sync(k){const s=S[k];$('sv_'+k).textContent=s.st;document.querySelectorAll(`#ad_${k} input`).forEach(e=>{const sec=e.dataset.sec,key=e.dataset.key;let v;if(sec=='st')v=s.st;else if(sec.startsWith('eq'))v=s.cfg.a.eq[+sec[2]][1];else v=s.cfg[sec][key];if(e.type=='checkbox')e.checked=!!v;else{e.value=v;e.nextElementSibling.textContent=v}})}
function bind(k){$('ad_'+k).oninput=e=>{const t=e.target,s=S[k],sec=t.dataset.sec,key=t.dataset.key,v=t.type=='checkbox'?+t.checked:+t.value;if(sec=='st')s.st=v;else if(sec.startsWith('eq'))s.cfg.a.eq[+sec[2]][1]=v;else s.cfg[sec][key]=v;if(t.nextElementSibling)t.nextElementSibling.textContent=v;$('sv_'+k).textContent=s.st;s.dirty=1;if(s.enh)prog(k,0,'সেটিং বদলেছে — আবার "One Click Auto Enhance" চাপুন')}}
function prog(k,p,t){$('pb_'+k).style.width=Math.round(p*100)+'%';if(t!=null)$('ps_'+k).textContent=t}
const fmt=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
// ---------- ফাইল লোড / বিশ্লেষণ ----------
function free(k){const s=S[k];if(!s)return;stop(k);if(s.url)URL.revokeObjectURL(s.url);if(s.dlu)URL.revokeObjectURL(s.dlu);Object.assign(s,{url:null,dlu:null,vid:null,orig:null,enh:null,file:null,hasA:0,hasV:0,rep:null})}
async function load(k,f){const s=S[k];free(k);const co=$('inf_'+k);prog(k,0,'ফাইল বিশ্লেষণ হচ্ছে…');$('go_'+k).disabled=$('dl_'+k).disabled=true;$('pv_'+k).hidden=true;
 const url=URL.createObjectURL(f),v=document.createElement('video');v.playsInline=true;v.preload='auto';v.muted=true;v.src=url;
 const ok=await new Promise(r=>{v.onloadedmetadata=()=>r(1);v.onerror=()=>r(0);setTimeout(()=>r(0),20000)});
 s.ctx=s.ctx||new AC();let buf=null;
 try{buf=await s.ctx.decodeAudioData(await f.arrayBuffer())}catch(e){buf=null}
 const hasV=ok&&v.videoWidth>0,dur=ok&&isFinite(v.duration)?v.duration:buf?buf.duration:0;
 if(!hasV&&!buf){URL.revokeObjectURL(url);prog(k,0,'');return say('এই ফাইল পড়া যায়নি — MP3, WAV, MP4 বা MOV দিন (ব্রাউজার কোডেক সমর্থন না করলে এরকম হয়)')}
 if(dur>1500){URL.revokeObjectURL(url);prog(k,0,'');return say('ফাইলটি ২৫ মিনিটের বেশি — ফোনের মেমোরির কারণে ছোট অংশ দিন')}
 Object.assign(s,{file:f,url,vid:v,orig:buf,hasA:!!buf,hasV,dur,enh:null,rep:null});
 const ty=hasV&&buf?'ভিডিও + অডিও → দুটোই প্রসেস হবে':buf?'শুধু অডিও → অডিও প্রসেস হবে':'নিঃশব্দ ভিডিও → শুধু ভিডিও প্রসেস হবে';
 co.textContent=`${f.name} · ${fmt(dur)} · ${ty}`+(hasV?` · ${v.videoWidth}×${v.videoHeight}`:'')+(buf?` · ${buf.numberOfChannels==1?'মনো':'স্টেরিও'} ${buf.sampleRate}Hz`:'');
 prog(k,0,'প্রস্তুত — "One Click Auto Enhance" চাপুন');$('go_'+k).disabled=false;setupCv(k);preview(k,0,'orig')}
function setupCv(k){const s=S[k],cv=$('cv_'+k);$('pv_'+k).hidden=false;if(!s.hasV){cv.hidden=true;return}cv.hidden=false;const m=+$('sz_'+k).value,v=s.vid;let w=v.videoWidth,h=v.videoHeight;if(m&&Math.min(w,h)>m){const q=m/Math.min(w,h);w=Math.round(w*q);h=Math.round(h*q)}cv.width=w&~1;cv.height=h&~1;if(!s.gl)try{s.gl=mkGL(cv)}catch(e){s.gl=null}
 if(!s.gl)$('lm_'+k).textContent='⚠ এই ব্রাউজারে WebGL নেই — ভিডিও এনহ্যান্সমেন্ট সম্ভব নয় (অডিও প্রসেস হবে)'}
async function stabT(k){const s=S[k];if(!s.file)return say('আগে মিডিয়া আপলোড করুন');if(!s.hasV)return say('Stabilise শুধু ভিডিওর জন্য');const b=$('sb_'+k);if(s.stab){s.stab=0;b.className='g';draw(k,!s.done);return}
if(!s.sp||s.spF!==s.file){stop(k);try{s.sp=await MSStab.analyze(s.vid,s.dur,p=>prog(k,p,'Stabilise বিশ্লেষণ '+Math.round(p*100)+'%'));s.spF=s.file}catch(e){return say('Stabilise করা গেল না')}}
s.stab=1;b.className='b';prog(k,1,'Stabilise চালু (ফ্রেম ~১০% জুম হয়)');preview(k,0,s.done?'enh':'orig')}
function draw(k,bypass){const s=S[k];if(!s.hasV||!s.gl)return;try{s.gl.draw(s.vid,vp(s,bypass),bypass?[1,1,1]:awb(s,s.vid))}catch(e){}}
function preview(k,t,which){const s=S[k];if(s.hasV){s.vid.currentTime=t;const d=()=>draw(k,which=='orig'||!s.done);s.vid.onseeked=d;setTimeout(d,200)}}
// ---------- প্লেব্যাক (Web Audio) ----------
function stop(k){const s=S[k];if(!s||!s.play)return;s.play=0;try{s.src&&(s.src.onended=null,s.src.stop())}catch(e){}s.src=null;cancelAnimationFrame(s.raf);if(s.vid){s.vid.pause();if(s.vid.cancelVideoFrameCallback&&s.vfc)s.vid.cancelVideoFrameCallback(s.vfc)}}
function start(k,which,from,rec){const s=S[k];stop(k);const buf=s.hasA?(which=='enh'&&s.enh?s.enh:s.orig):null,ctx=s.ctx;ctx.resume();s.play=1;s.which=which;let dest=null,gl=s.hasV&&s.gl,bp=which!='enh'||!s.done;
 if(buf){const src=ctx.createBufferSource();src.buffer=buf;if(rec){dest=ctx.createMediaStreamDestination();src.connect(dest)}else src.connect(ctx.destination);s.src=src;src.onended=()=>{if(s.src===src)fin(k)};src.start(0,from)}
 s.t0=ctx.currentTime;s.from=from;
 if(s.hasV){const v=s.vid;v.muted=true;v.currentTime=from;v.play().catch(()=>{});const cb=()=>{if(!s.play)return;draw(k,bp);s.vfc=v.requestVideoFrameCallback(cb)};if(v.requestVideoFrameCallback)cb();v.onended=()=>{if(!s.hasA)fin(k)}}
 const tick=()=>{if(!s.play)return;const pos=buf?from+ctx.currentTime-s.t0:s.vid.currentTime;if(s.hasV&&!s.vid.requestVideoFrameCallback)draw(k,bp);
  if(s.hasV&&buf&&Math.abs(s.vid.currentTime-pos)>.3)s.vid.currentTime=pos;$('sk_'+k).value=pos/s.dur;$('ti_'+k).textContent=fmt(pos)+' / '+fmt(s.dur);if(rec)prog(k,Math.min(1,pos/s.dur),'এক্সপোর্ট হচ্ছে… '+Math.round(pos/s.dur*100)+'% (স্ক্রিন চালু রাখুন)');
  if(pos>=s.dur-.02&&!s.hasA&&!s.hasV)return fin(k);s.raf=requestAnimationFrame(tick)};s.raf=requestAnimationFrame(tick);return dest}
function fin(k){const s=S[k];if(!s.play)return;stop(k);if(s.mr&&s.mr.state!='inactive')setTimeout(()=>s.mr.stop(),300)}
// ---------- প্রসেসিং ----------
function runWorker(chs,sr,cfg,onp){return new Promise((res,rej)=>{let w;try{w=new Worker('studio-dsp.js')}catch(e){w=null}
 if(!w){const sc=document.createElement('script');sc.src='studio-dsp.js';sc.onload=()=>{try{res(window.SD.process(chs,sr,cfg,onp))}catch(e){rej(e)}};sc.onerror=()=>rej('studio-dsp.js লোড হয়নি');document.head.append(sc);return}
 w.onmessage=e=>{const d=e.data;if(d.err){rej(d.err);w.terminate()}else if(d.done){res(d.done);w.terminate()}else onp(d.p,d.t)};w.onerror=e=>{rej('ওয়ার্কার ত্রুটি');w.terminate()};
 w.postMessage({ch:chs,sr,cfg},chs.map(a=>a.buffer))})}
async function enhance(k){const s=S[k];if(!s.file)return say('আগে মিডিয়া আপলোড করুন');if(s.busy)return;s.busy=1;stop(k);$('go_'+k).disabled=$('dl_'+k).disabled=true;s.enh=null;let rep=[];
 try{if(s.hasA){const b=s.orig,chs=[];for(let c=0;c<Math.min(2,b.numberOfChannels);c++)chs.push(b.getChannelData(c).slice());prog(k,.02,'অডিও প্রসেসিং শুরু…');
   const cfg={...s.cfg.a,eq:s.cfg.a.eq.map(e=>e.slice()),st:s.st};if(k=='quran')cfg.rv=cfg.dm=0;
   const r=await runWorker(chs,b.sampleRate,cfg,(p,t)=>prog(k,p*.95,'অডিও: '+t+'… '+Math.round(p*100)+'%'));const R=r.rep;
   const eb=s.ctx.createBuffer(r.ch.length,r.ch[0].length,b.sampleRate);r.ch.forEach((a,i)=>eb.copyToChannel(a,i));s.enh=eb;s.rep=R;
   rep.push(`অডিও: লাউডনেস ${R.inL.toFixed(1)} → ${R.outL.toFixed(1)} LUFS · ট্রু-পিক ${R.outTP.toFixed(1)} dBTP · কম্প্রেসর সর্বোচ্চ ${R.cmx.toFixed(1)} dB · ডি-এসার সর্বোচ্চ ${(R.de||0).toFixed(1)} dB · ${R.nr} · দৈর্ঘ্য অপরিবর্তিত: ${R.len?'হ্যাঁ':'না'} · ${R.sec.toFixed(1)} সে`);
   if(k=='quran'&&R.dev<-6)rep.push('⚠ সতর্কতা: কিছু অংশের লেভেল অন্য অংশের তুলনায় ৬ dB-র বেশি কমেছে — ইফেক্ট কমিয়ে (স্ট্রেংথ/নয়েজ রিডাকশন) আবার চেষ্টা করুন');
   else rep.push(`কণ্ঠ-সুরক্ষা অডিট: সবচেয়ে বেশি আপেক্ষিক লেভেল-হ্রাস ${Math.abs(R.dev).toFixed(1)} dB`)}
  else{s.enh=null;rep.push('অডিও নেই — শুধু ভিডিও প্রসেস হবে')}
  if(s.hasV)rep.push(s.gl?'ভিডিও: গ্রেডিং প্রিভিউ ও এক্সপোর্টে প্রতিটি ফ্রেমে প্রয়োগ হবে':'ভিডিও: WebGL নেই, প্রসেস হয়নি');
  s.done=1;prog(k,1,'✔ এনহ্যান্স সম্পন্ন — Before/After শুনুন/দেখুন');$('rp_'+k).innerHTML=rep.join('<br>');$('dl_'+k).disabled=false;if(s.hasV)draw(k,false)}
 catch(e){prog(k,0,'ত্রুটি: '+(e&&e.message||e));say('প্রসেসিং ব্যর্থ: '+(e&&e.message||e))}
 s.busy=0;$('go_'+k).disabled=false}
// ---------- ডাউনলোড ----------
function wav(b){const ch=b.numberOfChannels,n=b.length,d=new DataView(new ArrayBuffer(44+n*ch*2)),w=(o,t)=>[...t].forEach((c,i)=>d.setUint8(o+i,c.charCodeAt(0)));w(0,'RIFF');d.setUint32(4,36+n*ch*2,true);w(8,'WAVEfmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,ch,true);d.setUint32(24,b.sampleRate,true);d.setUint32(28,b.sampleRate*ch*2,true);d.setUint16(32,ch*2,true);d.setUint16(34,16,true);w(36,'data');d.setUint32(40,n*ch*2,true);
 const cs=[];for(let c=0;c<ch;c++)cs.push(b.getChannelData(c));let o=44;for(let i=0;i<n;i++)for(let c=0;c<ch;c++){const v=Math.max(-1,Math.min(1,cs[c][i]));d.setInt16(o,v<0?v*32768:v*32767,true);o+=2}return new Blob([d],{type:'audio/wav'})}
function save(k,blob,ext){const s=S[k];if(s.dlu)URL.revokeObjectURL(s.dlu);s.dlu=URL.createObjectURL(blob);const a=document.createElement('a');a.href=s.dlu;a.download=(s.file.name.replace(/\.[^.]+$/,'')+'_'+k+'_enhanced.'+ext);document.body.append(a);a.click();a.remove();say('ফাইল তৈরি হয়েছে ✔ ('+(blob.size/1048576).toFixed(1)+' MB)')}
async function download(k){const s=S[k];if(!s.done)return say('আগে "One Click Auto Enhance" চালান');
 if(!s.hasV){save(k,wav(s.enh),'wav');return}
 if(typeof MediaRecorder=='undefined'||!s.gl)return say('এই ব্রাউজারে ভিডিও এক্সপোর্ট সমর্থিত নয় (Chrome ব্যবহার করুন)');
 const mts=['video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm'],mt=mts.find(t=>MediaRecorder.isTypeSupported(t));if(!mt)return say('কোনো ভিডিও এনকোডার পাওয়া যায়নি');
 const cv=$('cv_'+k),st=cv.captureStream(),ch=[];$('dl_'+k).disabled=$('go_'+k).disabled=true;
 const dest=start(k,'enh',0,true);if(dest)dest.stream.getAudioTracks().forEach(t=>st.addTrack(t));
 try{s.mr=new MediaRecorder(st,{mimeType:mt,videoBitsPerSecond:Math.round(Math.min(5e7,Math.max(2e6,cv.width*cv.height*30*.1)))})}catch(e){stop(k);$('dl_'+k).disabled=$('go_'+k).disabled=false;return say('এনকোডার চালু করা যায়নি: '+e.message)}
 s.mr.ondataavailable=e=>e.data.size&&ch.push(e.data);let wl=null;try{navigator.wakeLock&&(wl=await navigator.wakeLock.request('screen'))}catch(e){}
 s.mr.onstop=()=>{try{wl&&wl.release()}catch(e){}const ext=mt.includes('mp4')?'mp4':'webm';save(k,new Blob(ch,{type:mt.split(';')[0]}),ext);ch.length=0;s.mr=null;prog(k,1,ext=='mp4'?'✔ MP4 (H.264/AAC) তৈরি':'✔ WebM তৈরি — এই ব্রাউজার MP4 এনকোড সমর্থন করে না');$('dl_'+k).disabled=$('go_'+k).disabled=false;preview(k,0,'enh')};s.mr.start(500)}
// ---------- ইনিট ----------
for(const k of['ghazal','quran']){const host=$('v_'+k);if(!host)continue;host.innerHTML=card(k);S[k]={cfg:{a:clone(PRE[k].a),v:clone(PRE[k].v)},st:75};advUI(k);bind(k);sync(k);
 $('up_'+k).onclick=()=>$('f_'+k).click();$('f_'+k).onchange=e=>{const f=e.target.files[0];e.target.value='';f&&load(k,f)};$('go_'+k).onclick=()=>enhance(k);$('en_'+k).onclick=()=>enhance(k);$('sb_'+k).onclick=()=>stabT(k);$('dl_'+k).onclick=()=>download(k);
 $('po_'+k).onclick=()=>{const s=S[k];if(s.file)start(k,'orig',+$('sk_'+k).value*s.dur>=s.dur-.1?0:+$('sk_'+k).value*s.dur)};
 $('pe_'+k).onclick=()=>{const s=S[k];if(!s.done)return say('আগে "One Click Auto Enhance" চালান');start(k,'enh',+$('sk_'+k).value*s.dur>=s.dur-.1?0:+$('sk_'+k).value*s.dur)};
 $('px_'+k).onclick=()=>stop(k);$('sk_'+k).oninput=e=>{const s=S[k];if(!s.file)return;const w=s.which,pl=s.play;stop(k);if(pl)start(k,w,+e.target.value*s.dur);else preview(k,+e.target.value*s.dur,s.done?'enh':'orig')};
 $('sz_'+k).onchange=()=>S[k].file&&setupCv(k);
 $('rs_'+k).onclick=()=>{const s=S[k];s.cfg={a:clone(PRE[k].a),v:clone(PRE[k].v)};s.st=75;sync(k);s.done=0;s.enh=null;stop(k);$('dl_'+k).disabled=true;$('rp_'+k).textContent='';prog(k,0,'প্রিসেট রিসেট হয়েছে ('+PRE[k].p+', ৭৫%)');if(s.file)preview(k,0,'orig')};
 $('ma_'+k).onclick=()=>{$('rs_'+k).onclick();$('dt_'+k).hidden=true;$('ma_'+k).className='b';$('mm_'+k).className='g';prog(k,0,'Auto মোড — প্রিসেটের মান ব্যবহার হবে')};
 $('mm_'+k).onclick=()=>{const d=$('dt_'+k);d.hidden=false;d.open=true;$('mm_'+k).className='b';$('ma_'+k).className='g';prog(k,0,'Manual মোড — স্লাইডার বাড়ান/কমান, তারপর Enhance চাপুন')};
 const L=['• কণ্ঠ/ভিডিওর সব ইফেক্ট সত্যিকারের প্রসেসিংয়ে প্রয়োগ হয়; কোনো সিমুলেশন নেই।','• ভিডিও এক্সপোর্ট রিয়েল-টাইমে রেকর্ড হয় (ভিডিওর সমান সময় লাগে), স্ক্রিন চালু রাখুন। ফরম্যাট: ব্রাউজার সমর্থন করলে MP4 (H.264/AAC), নইলে WebM।','• "Face Protection" মুখ শনাক্ত করে না — ত্বকের রং-ভিত্তিক সুরক্ষা মাস্ক ব্যবহার করে।']
 if(k=='quran')L.push('• Stabilise বাটন: হালকা ঝাঁকুনি কমায় (ফ্রেম ~১০% জুম হয়)।','• কণ্ঠ কখনো পিচ/ভয়েস বদলায় না, শব্দ কাটে না, মিউজিক/রিভার্ব/ইকো যোগ করে না, ভয়েস ক্লোনিং নেই। নয়েজ রিডাকশন শুধু ফাইলের পরিষ্কার নয়েজ-অংশ পেলে চলে।');else L.push('• Stabilise বাটন: হালকা ঝাঁকুনি কমায় (ফ্রেম ~১০% জুম হয়)।');
 $('lm_'+k).innerHTML=L.join('<br>')}
addEventListener('pagehide',()=>{for(const k in S)free(k)});
})();
