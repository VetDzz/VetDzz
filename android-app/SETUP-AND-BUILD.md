# 📱 Complete Setup & Build Guide for VetDz Android App

## ⚠️ Important: What You Need

To build an Android APK, you need:
1. ✅ Java JDK 17+ (for Gradle)
2. ✅ Android SDK (for building Android apps)
3. ✅ Android Build Tools

**You have 2 options:**

---

## Option 1: Use Android Studio (Recommended - Easiest)

### Step 1: Install Android Studio
Download from: https://developer.android.com/studio

### Step 2: Open Project
1. Open Android Studio
2. Click "Open"
3. Select the `android-app` folder
4. Wait for Gradle sync to complete

### Step 3: Build APK
1. Click "Build" menu
2. Select "Build Bundle(s) / APK(s)"
3. Click "Build APK(s)"
4. Wait for build to complete
5. Click "locate" to find your APK

**Done! Your APK is ready to install.**

---

## Option 2: Command Line (Advanced)

### Step 1: Install Java JDK 17
Download from: https://adoptium.net/

Verify installation:
```bash
java -version
```

### Step 2: Install Android SDK

#### Windows:
1. Download Android Command Line Tools: https://developer.android.com/studio#command-tools
2. Extract to `C:\Android\cmdline-tools`
3. Set environment variables:
```powershell
$env:ANDROID_HOME = "C:\Android"
$env:PATH += ";C:\Android\cmdline-tools\latest\bin"
```

#### Install SDK components:
```bash
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Step 3: Create local.properties
Create `android-app/local.properties`:
```properties
sdk.dir=C\:\\Android
```

### Step 4: Build APK
```bash
cd android-app

# Windows
gradlew.bat assembleDebug

# Linux/Mac
./gradlew assembleDebug
```

### Step 5: Find APK
```
android-app/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 Quick Start (If you have Android Studio)

1. Install Android Studio
2. Open `android-app` folder
3. Click Build > Build APK
4. Done!

---

## 📦 What's Included

Your Android app includes:
- ✅ WebView of your VetDz website
- ✅ Location permissions
- ✅ Pull-to-refresh
- ✅ Back button support
- ✅ Splash screen
- ✅ Material Design 3

---

## 🎨 Customize Before Building

### Change Website URL
Edit `app/src/main/java/dz/vet/vetdz/MainActivity.kt`:
```kotlin
private val webUrl = "https://your-website.com"
```

### Change App Name
Edit `app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">VetDz</string>
```

### Change App Icon
Replace icons in `app/src/main/res/mipmap-*/` folders

---

## 📱 Install APK on Phone

### Method 1: USB Cable
```bash
adb install app-debug.apk
```

### Method 2: File Transfer
1. Copy APK to phone
2. Open file manager
3. Tap APK file
4. Allow "Install from unknown sources"
5. Tap "Install"

### Method 3: Google Drive
1. Upload APK to Google Drive
2. Open Drive on phone
3. Download and install

---

## ❓ Troubleshooting

### "SDK location not found"
**Solution**: Install Android SDK or Android Studio

### "JAVA_HOME is not set"
**Solution**: Install Java JDK 17 and set JAVA_HOME

### "Build failed"
**Solution**: 
1. Make sure Android SDK is installed
2. Run: `gradlew.bat clean`
3. Try again: `gradlew.bat assembleDebug`

### "Gradle sync failed"
**Solution**: 
1. Check internet connection
2. Delete `.gradle` folder
3. Sync again

---

## 🎯 Recommended: Use Android Studio

Building Android apps from command line requires:
- Android SDK (~3 GB download)
- Build tools
- Platform tools
- Correct environment variables

**Android Studio includes everything and is much easier!**

Download: https://developer.android.com/studio

---

## 📝 Summary

**Easiest way:**
1. Install Android Studio
2. Open `android-app` folder
3. Build > Build APK
4. Install on phone

**Your VetDz Android app is ready!** 🎉

---

## 📞 Need Help?

If you encounter issues:
1. Make sure Android Studio is installed
2. Open the project in Android Studio
3. Let it download dependencies
4. Click Build > Build APK

Contact: vetdz@gmail.com
