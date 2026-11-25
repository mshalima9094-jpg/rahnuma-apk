package com.rahnuma.studio;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "GallerySave")
public class GallerySave extends Plugin {
    private OutputStream os;
    private Uri uri;
    private ContentResolver cr;

    @PluginMethod
    public void begin(PluginCall call) {
        try {
            closeQuiet();
            if (Build.VERSION.SDK_INT < 29) {
                call.reject("Android 10 বা তার উপরের ফোন লাগবে");
                return;
            }
            String name = call.getString("name", "rahnuma.mp4");
            String mime = call.getString("mime", "video/mp4");
            String kind = call.getString("kind", "video");
            Uri col;
            String dir;
            if ("audio".equals(kind)) {
                col = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI;
                dir = Environment.DIRECTORY_MUSIC;
            } else if ("image".equals(kind)) {
                col = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                dir = Environment.DIRECTORY_PICTURES;
            } else {
                col = MediaStore.Video.Media.EXTERNAL_CONTENT_URI;
                dir = Environment.DIRECTORY_MOVIES;
            }
            cr = getContext().getContentResolver();
            ContentValues v = new ContentValues();
            v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
            v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
            v.put(MediaStore.MediaColumns.RELATIVE_PATH, dir + "/Rahnuma");
            v.put(MediaStore.MediaColumns.IS_PENDING, 1);
            uri = cr.insert(col, v);
            if (uri == null) {
                call.reject("ফাইল তৈরি করা যায়নি");
                return;
            }
            os = cr.openOutputStream(uri);
            call.resolve();
        } catch (Exception e) {
            closeQuiet();
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        try {
            if (os == null) {
                call.reject("সেভ শুরু হয়নি");
                return;
            }
            String data = call.getString("data", "");
            os.write(Base64.decode(data, Base64.DEFAULT));
            call.resolve();
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void finish(PluginCall call) {
        try {
            if (os != null) {
                os.flush();
                os.close();
                os = null;
            }
            if (uri != null && cr != null) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.IS_PENDING, 0);
                cr.update(uri, v, null, null);
            }
            JSObject r = new JSObject();
            r.put("uri", uri == null ? "" : uri.toString());
            uri = null;
            call.resolve(r);
        } catch (Exception e) {
            call.reject(String.valueOf(e.getMessage()));
        }
    }

    @PluginMethod
    public void abort(PluginCall call) {
        closeQuiet();
        try {
            if (uri != null && cr != null) cr.delete(uri, null, null);
        } catch (Exception ignored) {
        }
        uri = null;
        call.resolve();
    }

    private void closeQuiet() {
        try {
            if (os != null) os.close();
        } catch (Exception ignored) {
        }
        os = null;
    }
}
