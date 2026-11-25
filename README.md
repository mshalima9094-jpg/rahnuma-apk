# Rahnuma Studio – APK Fix Package

This package is prepared using the files supplied in the conversation. No absent `studio.js` or `studio-dsp.js` source was fabricated; the missing `studio.js` reference has been removed from the HTML.


## Build APK from GitHub
1. Upload/extract all package contents into the root of a GitHub repository (including `.github/workflows/build-apk.yml`).
2. Commit to `main` (or `master`) branch.
3. Open repository **Actions** → **Build Rahnuma Studio APK**. Wait for a green completed run.
4. Open the run and download artifact `rahnuma-studio-fixed-apk`; extract it to get `app-debug.apk`.

## Native save support
- Gallery save: Android 10+ MediaStore, Movies/Rahnuma, Pictures/Rahnuma, Music/Rahnuma.
- Download action in the video export panel: Downloads/Rahnuma.
- GallerySave plugin is included and registered by the workflow.

## Important limitations
- This is a wrapper/build and save-path repair based on the available source files. Since the original missing `studio.js` and `studio-dsp.js` files were not supplied, the existing editing engine was not reconstructed.
- The build was not run in this local environment; GitHub Actions must be used to compile and verify the APK.
- Native save APIs target Android 10 (API 29) and newer.
- Video export performance/stutter can depend on Android WebView, device memory, video size, and codec support. This package adds the native save pathway but cannot guarantee smooth rendering for every source clip.
