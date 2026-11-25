// ===== মাদ্রাসা স্টুডিও কনফিগ — শুধু এই ফাইল GitHub-এ এডিট করলেই হবে =====
// firebase = Firebase Console > Project settings > Your apps (Web) থেকে পাওয়া মান।
// adminId = অ্যাডমিনের আইডি নাম্বার। এই নাম্বারে রেজিস্ট্রেশন করলেই অ্যাডমিন হবে।
window.MS_CONFIG={
  adminId:"01989923281",
  firebase:{
    apiKey:"AIzaSyDtFC2426tWbcr-H8GNgGNIURSP_kkSnbE",
    authDomain:"rahnuma-editor.firebaseapp.com",
    projectId:"rahnuma-editor",
    storageBucket:"rahnuma-editor.firebasestorage.app",
    messagingSenderId:"557027182533",
    appId:"1:557027182533:web:f1af1a71d0d51164406dac"
  }
};

// ===== অ্যাপ (APK) এ গ্যালারিতে সেভ =====
window.msP=function(){if(!window._msP)window._msP=Capacitor.registerPlugin('GallerySave');return window._msP};
window.msNative=function(){try{if(!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.registerPlugin))return false;if(Capacitor.isPluginAvailable&&!Capacitor.isPluginAvailable('GallerySave'))return false;return !!msP()}catch(e){return false}};
window.MS_VER='step5';
window.msSaveRaw=async function(blob,name,kind,btn){const P=msP(),t0=btn&&btn.textContent;let st='শুরু';try{if(btn){btn.disabled=true;btn.textContent='সেভ হচ্ছে…'}
st='begin';await P.begin({name:name,mime:(blob.type||'').split(';')[0]||'application/octet-stream',kind:kind});
const CH=1572864;for(let o=0;o<blob.size;o+=CH){st='write '+Math.round(o/1048576)+'MB';const u=new Uint8Array(await blob.slice(o,o+CH).arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));await P.write({data:btoa(s)})}
st='finish';await P.finish();if(btn){btn.textContent='✔ গ্যালারিতে সেভ হয়েছে';btn.disabled=false}return{ok:true}}
catch(e){try{await P.abort()}catch(_){}if(btn){btn.disabled=false;btn.textContent=t0}return{ok:false,err:'['+st+'] '+(e&&e.message||e)}}};
window.msSave=async function(blob,name,kind,btn){const r=await msSaveRaw(blob,name,kind,btn);if(!r.ok){alert('সেভ হয়নি: '+r.err);const h=document.getElementById('shh');if(h)h.textContent='সেভ হয়নি: '+r.err}return r.ok};
