package com.rahnuma.studio;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.OutputStream;

@CapacitorPlugin(name = "GallerySave")
public class GallerySave extends Plugin {
    private OutputStream stream;
    private Uri fileUri;
    private ContentResolver resolver;

    @PluginMethod public void begin(PluginCall call) {
        try {
            closeQuiet();
            if (Build.VERSION.SDK_INT < 29) { call.reject("Android 10 বা তার উপরের ভার্সন প্রয়োজন"); return; }
            String name=call.getString("name","rahnuma-file"), mime=call.getString("mime","application/octet-stream"), kind=call.getString("kind","video");
            Uri collection; String relative;
            if ("download".equals(kind)) { collection=MediaStore.Downloads.EXTERNAL_CONTENT_URI; relative=Environment.DIRECTORY_DOWNLOADS+"/Rahnuma"; }
            else if ("audio".equals(kind)) { collection=MediaStore.Audio.Media.EXTERNAL_CONTENT_URI; relative=Environment.DIRECTORY_MUSIC+"/Rahnuma"; }
            else if ("image".equals(kind)) { collection=MediaStore.Images.Media.EXTERNAL_CONTENT_URI; relative=Environment.DIRECTORY_PICTURES+"/Rahnuma"; }
            else { collection=MediaStore.Video.Media.EXTERNAL_CONTENT_URI; relative=Environment.DIRECTORY_MOVIES+"/Rahnuma"; }
            resolver=getContext().getContentResolver(); ContentValues values=new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME,name); values.put(MediaStore.MediaColumns.MIME_TYPE,mime);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH,relative); values.put(MediaStore.MediaColumns.IS_PENDING,1);
            fileUri=resolver.insert(collection,values); if(fileUri==null){call.reject("মিডিয়া ফাইল তৈরি করা যায়নি");return;}
            stream=resolver.openOutputStream(fileUri,"w"); if(stream==null){call.reject("ফাইল লেখার স্ট্রিম খোলা যায়নি");return;} call.resolve();
        } catch(Exception ex){abortInternal();call.reject("সেভ শুরু করতে ব্যর্থ: "+ex.getMessage());}
    }
    @PluginMethod public void write(PluginCall call){try{if(stream==null){call.reject("সেভ শুরু করা হয়নি");return;}String b64=call.getString("data","");stream.write(Base64.decode(b64,Base64.DEFAULT));call.resolve();}catch(Exception ex){call.reject("ফাইল লেখা ব্যর্থ: "+ex.getMessage());}}
    @PluginMethod public void finish(PluginCall call){try{if(stream!=null){stream.flush();stream.close();stream=null;}if(fileUri!=null&&resolver!=null){ContentValues values=new ContentValues();values.put(MediaStore.MediaColumns.IS_PENDING,0);resolver.update(fileUri,values,null,null);}String saved=fileUri==null?"":fileUri.toString();fileUri=null;call.resolve(new com.getcapacitor.JSObject().put("uri",saved));}catch(Exception ex){call.reject("সেভ সম্পন্ন হয়নি: "+ex.getMessage());}}
    @PluginMethod public void abort(PluginCall call){abortInternal();call.resolve();}
    private void abortInternal(){closeQuiet();try{if(fileUri!=null&&resolver!=null)resolver.delete(fileUri,null,null);}catch(Exception ignored){}fileUri=null;}
    private void closeQuiet(){try{if(stream!=null)stream.close();}catch(Exception ignored){}stream=null;}
}
