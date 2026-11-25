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
window.msNative=function(){try{return !!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins.GallerySave)}catch(e){return false}};
window.msSave=async function(blob,name,kind,btn){const P=Capacitor.Plugins.GallerySave,t0=btn&&btn.textContent;try{if(btn){btn.disabled=true;btn.textContent='সেভ হচ্ছে…'}
await P.begin({name:name,mime:(blob.type||'').split(';')[0]||'application/octet-stream',kind:kind});
const CH=1572864;for(let o=0;o<blob.size;o+=CH){const u=new Uint8Array(await blob.slice(o,o+CH).arrayBuffer());let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));await P.write({data:btoa(s)})}
await P.finish();if(btn){btn.textContent='✔ গ্যালারিতে সেভ হয়েছে';btn.disabled=false}return true}
catch(e){try{await P.abort()}catch(_){}if(btn){btn.disabled=false;btn.textContent=t0}alert('সেভ হয়নি: '+(e&&e.message||e));return false}};
