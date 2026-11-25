# Rahnuma Studio Android APK

Upload all repository files to the repository root. GitHub Actions builds a debug APK automatically on push to main/master, or manually from Actions > Build Rahnuma Studio APK > Run workflow.

Artifact: `rahnuma-studio-apk` (contains `app-debug.apk`).

Native GallerySave plugin supports Gallery media (Pictures/Rahnuma, Movies/Rahnuma, Music/Rahnuma) and Downloads/Rahnuma using Android MediaStore. On Android 10+ it does not require broad storage permissions. APK WebView download links are intercepted in config.js and saved to Downloads/Rahnuma.

Install APK and test: image save, video save, video download, audio save/download, and export playback. APK has not been device-tested in this workspace.
