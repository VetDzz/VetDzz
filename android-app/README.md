# 📱 VetDz Android App

Native Android application for VetDz veterinary platform.

## 🚀 Quick Start

### Option 1: Android Studio (Recommended)
1. Install [Android Studio](https://developer.android.com/studio)
2. Open this folder in Android Studio
3. Wait for Gradle sync
4. Click **Build > Build APK**
5. Install APK on your device

### Option 2: Command Line
```bash
# Make sure you have Android SDK installed
cd android-app
gradlew.bat assembleDebug  # Windows
./gradlew assembleDebug     # Linux/Mac
```

## 📋 Requirements

- Java JDK 17+
- Android SDK (included with Android Studio)
- Android device with API 24+ (Android 7.0+)

## 📂 Project Structure

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/dz/vet/vetdz/
│   │   │   └── MainActivity.kt          # Main activity
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── activity_main.xml    # Main layout
│   │   │   ├── values/
│   │   │   │   ├── strings.xml          # App strings
│   │   │   │   ├── colors.xml           # Colors
│   │   │   │   └── themes.xml           # Themes
│   │   │   └── mipmap-*/                # App icons
│   │   └── AndroidManifest.xml          # Manifest
│   └── build.gradle.kts                 # App config
├── build.gradle.kts                     # Project config
├── settings.gradle.kts                  # Settings
└── README.md                            # This file
```

## ✨ Features

- ✅ Full-screen WebView
- ✅ Location permissions
- ✅ Pull-to-refresh
- ✅ Hardware back button
- ✅ Offline detection
- ✅ Material Design 3
- ✅ Splash screen ready

## 🎨 Customization

### Change Website URL
Edit `app/src/main/java/dz/vet/vetdz/MainActivity.kt`:
```kotlin
private val webUrl = "https://your-website.com"
```

### Change App Name
Edit `app/src/main/res/values/strings.xml`

### Change Colors
Edit `app/src/main/res/values/colors.xml`

### Change Icon
Replace files in `app/src/main/res/mipmap-*/`

## 🔨 Build Commands

```bash
# Debug APK (for testing)
gradlew.bat assembleDebug

# Release APK (for production)
gradlew.bat assembleRelease

# Clean build
gradlew.bat clean

# Install on connected device
gradlew.bat installDebug
```

## 📱 Install APK

### Via ADB
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Via File Transfer
1. Copy APK to phone
2. Open file manager
3. Tap APK and install

## 📖 Documentation

- [Complete Setup Guide](SETUP-AND-BUILD.md)
- [Build Instructions](BUILD-APK.md)

## 🐛 Troubleshooting

See [SETUP-AND-BUILD.md](SETUP-AND-BUILD.md) for detailed troubleshooting.

## 📄 License

© 2025 VetDz. All rights reserved.
