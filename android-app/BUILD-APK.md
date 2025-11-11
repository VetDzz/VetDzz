# 🔨 Build VetDz Android APK

## Prerequisites

You need Java JDK 17 installed. Check with:
```bash
java -version
```

If not installed, download from: https://adoptium.net/

## Build Steps

### 1. Navigate to android-app folder
```bash
cd android-app
```

### 2. Make gradlew executable (Linux/Mac only)
```bash
chmod +x gradlew
```

### 3. Build Debug APK (for testing)
```bash
# Windows
gradlew.bat assembleDebug

# Linux/Mac
./gradlew assembleDebug
```

### 4. Build Release APK (for production)
```bash
# Windows
gradlew.bat assembleRelease

# Linux/Mac
./gradlew assembleRelease
```

## Find Your APK

After building, find your APK at:
- **Debug**: `app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `app/build/outputs/apk/release/app-release.apk`

## Install APK on Device

### Via USB (ADB)
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Via File Transfer
1. Copy APK to your phone
2. Open file manager on phone
3. Tap the APK file
4. Allow "Install from unknown sources" if prompted
5. Tap "Install"

## Troubleshooting

### "JAVA_HOME is not set"
Set JAVA_HOME environment variable:
```bash
# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Linux/Mac
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk
```

### "SDK location not found"
Create `local.properties` file:
```properties
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### Build fails
Clean and rebuild:
```bash
gradlew.bat clean assembleDebug
```

## Quick Build Script

Save this as `build.bat` (Windows):
```batch
@echo off
echo Building VetDz Android App...
cd android-app
gradlew.bat clean assembleDebug
echo.
echo APK built successfully!
echo Location: app\build\outputs\apk\debug\app-debug.apk
pause
```

Run: `build.bat`

## Next Steps

1. Install APK on your Android device
2. Test the app
3. If everything works, build release APK
4. Sign the release APK for Google Play Store

Enjoy your VetDz Android app! 🎉
