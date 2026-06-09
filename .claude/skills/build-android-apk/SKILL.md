---
name: build-android-apk
description: Build a standalone Android release APK and install it on a connected device. Use when the user asks to build/install the APK, ship a test build, or run the app on a real Android device without Metro.
---

# Build & install Android APK

Standalone build that does NOT need Metro running on host (JS bundle is embedded). `release` is signed with the **debug** keystore (see `android/app/build.gradle`), so it installs on any device without configuring a real signing config.

## Prerequisites (host-specific, verified on this machine)

- **JDK**: system `java` is missing. Use the JBR bundled with Android Studio:
  `/Applications/Android Studio.app/Contents/jbr/Contents/Home`
- **adb**: not on PATH. Use absolute path: `~/Library/Android/sdk/platform-tools/adb`
- **Package name**: `com.airsoftnav` (MainActivity: `com.airsoftnav/.MainActivity`)

## Steps

1. Confirm a device is connected:

   ```bash
   ~/Library/Android/sdk/platform-tools/adb devices
   ```

   Need at least one line `<serial>  device`. If empty: USB debugging off, cable issue, or `adb` daemon not authorized — ask the user.

2. Build release APK (from `android/`):

   ```bash
   cd android && JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleRelease
   ```

   Cold build ≈ 5–10 min, warm ≈ 30–60 s. Use Bash `timeout: 600000`. Output:
   `android/app/build/outputs/apk/release/app-release.apk` (~97 MB).

3. Install on device (use `-s <serial>` if multiple connected):

   ```bash
   ~/Library/Android/sdk/platform-tools/adb -s <serial> install -r \
     android/app/build/outputs/apk/release/app-release.apk
   ```

   `-r` reinstalls keeping data. Expect `Success`.

4. Launch (optional):

   ```bash
   ~/Library/Android/sdk/platform-tools/adb -s <serial> shell monkey \
     -p com.airsoftnav -c android.intent.category.LAUNCHER 1
   ```

5. Verify foreground:

   ```bash
   ~/Library/Android/sdk/platform-tools/adb -s <serial> shell dumpsys window | grep mFocusedApp
   ```

   Should show `com.airsoftnav/.MainActivity`.

## Common failures

- **"Unable to locate a Java Runtime"** → forgot to set `JAVA_HOME`. The system `/usr/bin/java` is a stub.
- **`adb: command not found`** → use the absolute path above; do not `brew install android-platform-tools` (project already has SDK).
- **`INSTALL_FAILED_UPDATE_INCOMPATIBLE`** → previously installed with a different signature (e.g. user installed Play Store version). Uninstall first: `adb -s <serial> uninstall com.airsoftnav`.
- **Gradle complains about Gradle 9.0 deprecations** → ignore, current version is 8.13 and warnings are non-fatal.

## Logs from running app

```bash
~/Library/Android/sdk/platform-tools/adb -s <serial> logcat -v color \
  --pid=$(~/Library/Android/sdk/platform-tools/adb -s <serial> shell pidof com.airsoftnav)
```

For JS errors specifically, grep for `ReactNativeJS` or `AndroidRuntime`.
