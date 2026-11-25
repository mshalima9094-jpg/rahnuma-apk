package com.rahnuma.studio;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GallerySave.class);
        super.onCreate(savedInstanceState);
    }
}
