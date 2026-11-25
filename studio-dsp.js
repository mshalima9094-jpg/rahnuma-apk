// studio-dsp.js — স্টুডিও রাহনুমা অডিও ইঞ্জিন (খাঁটি JS DSP; Worker-এ চলে, Node-এ টেস্টযোগ্য)
(function(G){
const dB=x=>Math.pow(10,x/20),ld=x=>20*Math.log10(Math.max(x,1e-9));
function NSP(N){
 const H=N>>1,w=new Float32Array(N),re=new Float32Array(N),im=new Float32Array(N),inb=new Float32Array(N),ola=new Float32Array(N),
 nz=new Float32Array(H+1),sm=new Float32Array(H+1),sl=new Float32Array(H+1),gp=new Float32Array(H+1).fill(1),g=new Float32Array(H+1),
 cs=new Float32Array(H),sn=new Float32Array(H),rev=new Uint16Array(N),lg=Math.log2(N),S=this;
 S.s=0;S.wu=0;S.learn=0;S.lock=0;S.lc=0;S.acc=new Float32Array(H+1);S.onl=null;
 for(let n=0;n<N;n++)w[n]=Math.sin(Math.PI*(n+.5)/N);
 for(let k=0;k<H;k++){cs[k]=Math.cos(2*Math.PI*k/N);sn[k]=-Math.sin(2*Math.PI*k/N)}
 for(let n=0;n<N;n++){let r=0;for(let b=0;b<lg;b++)if(n&(1<<b))r|=1<<(lg-1-b);rev[n]=r}
 function fft(inv){
  for(let i=0;i<N;i++){const j=rev[i];if(j>i){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t}}
  for(let len=2;len<=N;len<<=1){const h=len>>1,st=N/len;
   for(let i=0;i<N;i+=len)for(let j=0,t=0;j<h;j++,t+=st){
    const wr=cs[t],wi=inv?-sn[t]:sn[t],a=i+j,b=a+h,xr=re[b]*wr-im[b]*wi,xi=re[b]*wi+im[b]*wr;
    re[b]=re[a]-xr;im[b]=im[a]-xi;re[a]+=xr;im[a]+=xi}}
  if(inv)for(let i=0;i<N;i++){re[i]/=N;im[i]/=N}
 }
 function hop(){
  const s=S.s;
  if(s<=0){for(let n=0;n<N;n++)ola[n]+=inb[n]*w[n]*w[n];return}
  for(let n=0;n<N;n++){re[n]=inb[n]*w[n];im[n]=0}
  fft(0);
  const beta=1+s*3,fl=Math.pow(10,-(8+s*34)/20),lrn=S.learn>0;
  for(let k=0;k<=H;k++){
   const m=Math.sqrt(re[k]*re[k]+im[k]*im[k]);sm[k]=sm[k]*.55+m*.45;const x=sm[k];
   sl[k]=sl[k]*.93+m*.07;const y=sl[k];
   if(lrn)S.acc[k]+=m;
   else if(!S.lock)nz[k]=S.wu<30?y:(y<nz[k]?nz[k]+(y-nz[k])*.12:nz[k]*1.0007);
   const ne=nz[k]*1.25,p=x*x+1e-12;
   let gg=Math.sqrt(Math.max(0,1-beta*ne*ne/p));if(gg<fl)gg=fl;if(gg>1)gg=1;
   gp[k]+=(gg-gp[k])*(gg>gp[k]?.8:.3);
  }
  S.wu++;
  if(lrn){S.lc++;if(--S.learn<=0){S.learn=0;for(let k=0;k<=H;k++)nz[k]=S.acc[k]/S.lc*.9;S.lock=1;S.onl&&S.onl()}}
  g[0]=gp[0];g[H]=gp[H];for(let k=1;k<H;k++)g[k]=(gp[k-1]+2*gp[k]+gp[k+1])*.25;
  for(let k=0;k<=H;k++){re[k]*=g[k];im[k]*=g[k];if(k>0&&k<H){re[N-k]*=g[k];im[N-k]*=g[k]}}
  fft(1);
  for(let n=0;n<N;n++)ola[n]+=re[n]*w[n];
 }
 S.run=(inp,out)=>{
  for(let p=0;p<inp.length;p+=H){
   inb.copyWithin(0,H);for(let n=0;n<H;n++)inb[H+n]=inp[p+n];
   hop();
   for(let n=0;n<H;n++)out[p+n]=ola[n];
   ola.copyWithin(0,H);ola.fill(0,H);
  }
 };
}
function bq(t,f,sr,g,q){const w=2*Math.PI*f/sr,c=Math.cos(w),s=Math.sin(w),A=Math.pow(10,g/40),al=s/(2*q);let b0,b1,b2,a0,a1,a2;
 if(t=='pk'){b0=1+al*A;b1=-2*c;b2=1-al*A;a0=1+al/A;a1=-2*c;a2=1-al/A}
 else if(t=='hp'){b0=(1+c)/2;b1=-(1+c);b2=b0;a0=1+al;a1=-2*c;a2=1-al}
 else{const k=2*Math.sqrt(A)*al;b0=A*((A+1)+(A-1)*c+k);b1=-2*A*((A-1)+(A+1)*c);b2=A*((A+1)+(A-1)*c-k);a0=(A+1)-(A-1)*c+k;a1=2*((A-1)-(A+1)*c);a2=(A+1)-(A-1)*c-k}
 return[b0/a0,b1/a0,b2/a0,a1/a0,a2/a0]}
function filt(co,x){const y=new Float32Array(x.length),[b0,b1,b2,a1,a2]=co;let z1=0,z2=0;for(let i=0;i<x.length;i++){const v=x[i],o=b0*v+z1;z1=b1*v-a1*o+z2;z2=b2*v-a2*o;y[i]=o}return y}
function pct(a,p){const st=Math.max(1,a.length>>20),b=[];for(let i=0;i<a.length;i+=st)b.push(a[i]);b.sort((x,y)=>x-y);return b[Math.min(b.length-1,Math.floor(p*b.length))]}
// ITU-R BS.1770 / EBU R128 integrated loudness
function kw(sr){let K=Math.tan(Math.PI*1681.974450955533/sr),Q=.7071752369554196,Vh=Math.pow(10,3.999843853973347/20),Vb=Math.pow(Vh,.4996667741545416),a0=1+K/Q+K*K;
 const sh=[(Vh+Vb*K/Q+K*K)/a0,2*(K*K-Vh)/a0,(Vh-Vb*K/Q+K*K)/a0,2*(K*K-1)/a0,(1-K/Q+K*K)/a0];
 K=Math.tan(Math.PI*38.13547087602444/sr);Q=.5003270373238773;a0=1+K/Q+K*K;return[sh,[1,-2,1,2*(K*K-1)/a0,(1-K/Q+K*K)/a0]]}
function lufs(ch,sr){const[sh,hp]=kw(sr);const k=ch.map(x=>filt(hp,filt(sh,x))),n=k[0].length,B=Math.round(.4*sr),H=Math.round(.1*sr),ps=new Float64Array(n+1);
 for(let i=0;i<n;i++){let s=0;for(const c of k)s+=c[i]*c[i];ps[i+1]=ps[i]+s}
 const E=[];for(let s=0;s+B<=n;s+=H)E.push((ps[s+B]-ps[s])/B);if(!E.length&&n)E.push(ps[n]/n);
 const L=e=>-.691+10*Math.log10(e+1e-12);let g=E.filter(e=>L(e)>-70);if(!g.length)return-70;
 const r=L(g.reduce((a,b)=>a+b)/g.length)-10;g=g.filter(e=>L(e)>r);return g.length?L(g.reduce((a,b)=>a+b)/g.length):-70}
// ৪× ওভারস্যাম্পলড ট্রু-পিক (dBTP)
const TT=[.25,.5,.75].map(f=>{const t=[];for(let k=-7;k<=8;k++){const d=k-f,s=Math.abs(d)<1e-9?1:Math.sin(Math.PI*d)/(Math.PI*d),w=.5+.5*Math.cos(Math.PI*d/8.5);t.push(s*w)}return t});
function tpk(ch){let best=0;for(const x of ch){let m=0;for(let i=0;i<x.length;i++){const a=Math.abs(x[i]);if(a>m)m=a}best=Math.max(best,m);const th=m*.7;
 for(let i=8;i<x.length-9;i++)if(Math.abs(x[i])>th)for(const t of TT){let s=0;for(let k=0;k<16;k++)s+=x[i+k-7]*t[k];if(Math.abs(s)>best)best=Math.abs(s)}}return ld(best)}
function nrStage(x,sr,s){const N=2048,H=1024,F=30,n=x[0].length,seg=(F+2)*H,nb=Math.floor(n/H);if(nb<seg/H*2)return{out:x,note:'ফাইল খুব ছোট — নয়েজ রিডাকশন বাদ'};
 const e=new Float64Array(nb+1);for(let b=0;b<nb;b++){let s2=0;for(const c of x)for(let i=b*H;i<(b+1)*H;i++)s2+=c[i]*c[i];e[b+1]=e[b]+s2}
 const wn=seg/H,W=[];for(let b=0;b+wn<=nb;b++)W.push(e[b+wn]-e[b]);let bi=0;for(let i=1;i<W.length;i++)if(W[i]<W[bi])bi=i;
 const med=W.slice().sort((a,b)=>a-b)[W.length>>1];
 if(!(W[bi]<med*.063))return{out:x,note:'পরিষ্কার নয়েজ-অংশ পাওয়া যায়নি — কণ্ঠ রক্ষায় নয়েজ রিডাকশন বাদ দেওয়া হয়েছে'};
 const LAT=H,out=x.map(c=>{const ns=new NSP(N);ns.s=s;ns.learn=F;ns.run(c.slice(bi*H,bi*H+seg),new Float32Array(seg));ns.run(new Float32Array(2*H),new Float32Array(2*H));
  const tot=Math.ceil((n+N)/H)*H,inp=new Float32Array(tot),o=new Float32Array(tot);inp.set(c);ns.run(inp,o);return o.slice(LAT,LAT+n)});
 return{out,note:'নয়েজ প্রোফাইল শেখা: '+(bi*H/sr).toFixed(1)+' সে থেকে'}}
function deess(x,sr,amt){const co=bq('hp',5500,sr,0,.707),h=x.map(a=>filt(co,a)),n=x[0].length,e=new Float32Array(n),at=Math.exp(-1/(.001*sr)),rl=Math.exp(-1/(.04*sr));let s=0;
 for(let i=0;i<n;i++){let m=0;for(const c of h){const a=Math.abs(c[i]);if(a>m)m=a}s=m>s?at*s+(1-at)*m:rl*s+(1-rl)*m;e[i]=s}
 const thr=pct(e,.9)*.8;if(thr<1e-5)return{out:x,mx:0};const mg=amt*.3,ga=Math.exp(-1/(.001*sr)),gr=Math.exp(-1/(.03*sr));let g=0,mx=0;
 const out=x.map((c,ci)=>{g=0;const o=new Float32Array(n);for(let i=0;i<n;i++){const r=Math.min(mg,Math.max(0,ld(e[i]/thr))*.7);g=r>g?ga*g+(1-ga)*r:gr*g+(1-gr)*r;if(g>mx)mx=g;o[i]=c[i]-h[ci][i]*(1-dB(-g))}return o});return{out,mx}}
function comp(x,sr,R,att,rel,maxGR){const n=x[0].length,B=Math.round(.05*sr),Lv=[];for(let b=0;b+B<=n;b+=B){let m=0;for(const c of x)for(let i=b;i<b+B;i++){const a=Math.abs(c[i]);if(a>m)m=a}Lv.push(ld(m))}
 if(!Lv.length||R<=1.001)return{out:x,mx:0,avg:0,thr:0};const thr=pct(Lv,.99)-maxGR/(1-1/R),ca=Math.exp(-1/(att*.001*sr)),cr=Math.exp(-1/(rel*.001*sr));let g=0,mx=0,sm=0;
 const out=x.map(c=>new Float32Array(n));for(let i=0;i<n;i++){let m=0;for(const c of x){const a=Math.abs(c[i]);if(a>m)m=a}const ov=ld(m)-thr,t=ov>0?ov*(1-1/R):0;g=t>g?ca*g+(1-ca)*t:cr*g+(1-cr)*t;if(g>mx)mx=g;sm+=g;const f=dB(-g);for(let c=0;c<x.length;c++)out[c][i]=x[c][i]*f}
 return{out,mx,avg:sm/n,thr}}
function reverb(x,sr,wet,decay){const sc=sr/44100,cd=[1116,1188,1277,1356,1422,1491,1557,1617],ad=[556,441,341,225];let nz=0;
 const out=x.map((c,ci)=>{const n=c.length,sp=ci*23,cb=cd.map(d=>{const L=Math.round((d+sp)*sc),g=Math.pow(10,-3*L/(decay*1.185*sr));nz+=ci==0?1/(1-g*g):0;return{b:new Float32Array(L),i:0,l:0,g}}),ab=ad.map(d=>({b:new Float32Array(Math.round((d+sp)*sc)),i:0})),r=new Float32Array(n);
  for(let i=0;i<n;i++){const v=c[i];let s=0;for(const q of cb){const y=q.b[q.i];q.l=y*.95+q.l*.05;q.b[q.i]=v+q.l*q.g;if(++q.i>=q.b.length)q.i=0;s+=y}
   for(const q of ab){const y=q.b[q.i];q.b[q.i]=s+y*.5;if(++q.i>=q.b.length)q.i=0;s=y-s}r[i]=s}return r});
 return x.map((c,ci)=>{const o=new Float32Array(c.length),r=out[ci];let a=0,b=0;for(let i=0;i<c.length;i++){a+=c[i]*c[i];b+=r[i]*r[i]}const nm=b>0?Math.sqrt(a/b):0;for(let i=0;i<c.length;i++)o[i]=c[i]*(1-wet)+r[i]*nm*wet;return o})}
function delay(x,sr,mix,fb,ms){const D=Math.round(ms*.001*sr);return x.map(c=>{const n=c.length,e=new Float32Array(n),o=new Float32Array(n);for(let i=0;i<n;i++){const d=i>=D?e[i-D]:0;e[i]=c[i]+fb*d;o[i]=c[i]+mix*d}return o})}
function limit(x,sr,ceilDb,ms){const n=x[0].length,L=Math.max(2,Math.round(ms*.001*sr)),ce=dB(ceilDb),gr=new Float32Array(n);
 for(let i=0;i<n;i++){let m=0;for(const c of x){const a=Math.abs(c[i]);if(a>m)m=a}gr[i]=m>ce?ce/m:1}
 const gl=new Float32Array(n),dq=new Int32Array(n+1);let h=0,t=0;for(let j=n-1;j>=0;j--){while(t>h&&gr[dq[t-1]]>=gr[j])t--;dq[t++]=j;while(dq[h]>=j+L)h++;gl[j]=gr[dq[h]]}
 let s=gl[0]*L,mn=1;const gs=new Float32Array(n);for(let i=0;i<n;i++){s+=gl[i]-(i>=L?gl[i-L]:gl[0]);gs[i]=s/L;if(gs[i]<mn)mn=gs[i]}
 return{out:x.map(c=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=c[i]*gs[i];return o}),gr:-ld(mn)}}
// প্রধান প্রসেস: c = প্রিসেট কনফিগ, c.st = স্ট্রেংথ (%; ৭৫ = প্রিসেটের মান হুবহু)
function process(chs,sr,c,P){P=P||(()=>{});const k=c.st/75,n=chs[0].length,R={},t0=Date.now();
 R.inL=lufs(chs,sr);R.inTP=tpk(chs);let x=chs.map(a=>Float32Array.from(a));
 P(.08,'নয়েজ রিডাকশন');const nr=Math.min(100,c.nr*k);if(nr>0){const r=nrStage(x,sr,nr/100);x=r.out;R.nr=r.note}else R.nr='বন্ধ';
 if(c.hp)x=x.map(a=>filt(bq('hp',c.hp,sr,0,.707),a));
 P(.25,'ইকিউ ও ভয়েস ক্ল্যারিটি');const eq=c.eq.map(e=>[e[0],e[1]*k]);if(c.cl)eq.push([3500,c.cl*k*.06]);
 for(const[f,g]of eq)if(Math.abs(g)>1e-6&&f<sr/2.2){const co=bq('pk',f,sr,g,1);x=x.map(a=>filt(co,a))}
 P(.4,'ডি-এসার');if(c.de>0){const r=deess(x,sr,Math.min(100,c.de*k));x=r.out;R.de=r.mx}
 P(.55,'কম্প্রেসর');const Re=1+(c.cr-1)*k,cm=comp(x,sr,Re,c.ca,c.cs,c.gr);x=cm.out;R.cmx=cm.mx;R.cavg=cm.avg;
 P(.7,'রিভার্ব ও ডিলে');if(c.rv>0)x=reverb(x,sr,c.rv*k/100,c.rd);if(c.dm>0)x=delay(x,sr,c.dm*k/100,c.df/100,c.dt||120);
 P(.8,'লাউডনেস ও লিমিটার');const base=x,peakC=c.tp-.5;let G=c.lu-lufs(base,sr),y=base,lm={gr:0};
 if(lufs(base,sr)>-69)for(let p=0;p<3;p++){G=Math.min(G,36);const gn=dB(G);lm=limit(base.map(a=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=a[i]*gn;return o}),sr,peakC,8);y=lm.out;const l=lufs(y,sr);if(Math.abs(l-c.lu)<.3)break;G+=c.lu-l}
 for(let p=0;p<3;p++){const tp=tpk(y);if(tp<=c.tp+.01)break;const f=dB(c.tp-tp-.05);y=y.map(a=>{const o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=a[i]*f;return o})}
 R.outL=lufs(y,sr);R.outTP=tpk(y);R.lim=lm.gr;R.gain=G;R.len=y[0].length==n;
 // কণ্ঠ-সুরক্ষা অডিট: ৫০ms ফ্রেমে প্রসেসের আগে/পরের লেভেল তুলনা (গ্লোবাল গেইন বাদ দিয়ে); বড় ঘাটতি = শব্দ ক্ষতির সংকেত
 const B=Math.round(.05*sr),rt=[],lv=[];for(let b=0;b+B<=n;b+=B){let a=0,o=0;for(let q=0;q<chs.length;q++)for(let i=b;i<b+B;i++){a+=chs[q][i]**2;o+=y[q][i]**2}lv.push(a);rt.push(ld(Math.sqrt(o/(a+1e-20))))}
 const ms=lv.slice().sort((a,b)=>a-b)[lv.length>>1],vr=rt.filter((_,i)=>lv[i]>ms*.25).sort((a,b)=>a-b);R.dev=vr.length?vr[0]-vr[vr.length>>1]:0;R.sec=(Date.now()-t0)/1000;P(1,'সম্পন্ন');return{ch:y,rep:R}}
const API={process,lufs,tpk,bq,filt,reverb,delay,limit,comp,deess,nrStage};
if(typeof module!='undefined'&&module.exports)module.exports=API;else G.SD=API;
if(typeof importScripts=='function')G.onmessage=e=>{try{const d=e.data,r=process(d.ch,d.sr,d.cfg,(p,t)=>G.postMessage({p,t}));G.postMessage({done:r},r.ch.map(a=>a.buffer))}catch(er){G.postMessage({err:String(er&&er.message||er)})}};
})(typeof self!=='undefined'?self:globalThis);
