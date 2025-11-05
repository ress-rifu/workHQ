# 📱 Build WorkHQ APK - Complete Guide

This guide will help you build a production-ready APK for your WorkHQ app.

---

## 🎯 Two Methods to Build APK

### Method 1: EAS Build (Recommended - Cloud Build) ☁️
Build in the cloud using Expo's servers. No Android Studio needed!

### Method 2: Local Build (Advanced) 💻
Build locally with Android Studio. More control but requires setup.

---

## ⭐ Method 1: EAS Build (Recommended)

### Prerequisites:

1. **Expo Account** (free)
   - Sign up at: https://expo.dev

2. **EAS CLI** installed globally
   ```bash
   npm install -g eas-cli
   ```

### Step-by-Step Process:

#### Step 1: Login to Expo

```bash
cd front
eas login
```

Enter your Expo credentials.

#### Step 2: Configure EAS Build

```bash
eas build:configure
```

This will set up your project (already done - `eas.json` created).

#### Step 3: Build APK

**For Preview/Testing:**
```bash
eas build --platform android --profile preview
```

**For Production:**
```bash
eas build --platform android --profile production
```

#### Step 4: Wait for Build

- Build process takes 10-20 minutes
- You'll see progress in the terminal
- You can also monitor at: https://expo.dev/accounts/YOUR_ACCOUNT/projects/workhq/builds

#### Step 5: Download APK

Once complete, you'll get a download link:
```
✔ Build finished.

🤖 Android app:
https://expo.dev/artifacts/eas/[unique-id].apk
```

Download the APK and install it on your Android device!

---

## 💻 Method 2: Local Build (Without EAS)

### Prerequisites:

1. **Android Studio** installed
2. **Java JDK 17** or higher
3. **Android SDK** configured

### Step 1: Install Android Studio

Download from: https://developer.android.com/studio

During installation, make sure to install:
- Android SDK
- Android SDK Platform
- Android Virtual Device (optional)

### Step 2: Set Environment Variables

**Windows:**
```powershell
# Add to System Environment Variables
ANDROID_HOME = C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr

# Add to PATH:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

### Step 3: Create Native Android Project

```bash
cd front
npx expo prebuild --platform android
```

This creates the `android` folder with native code.

### Step 4: Build APK

**Option A: Using Expo**
```bash
npx expo run:android --variant release
```

**Option B: Using Gradle**
```bash
cd android
./gradlew assembleRelease
```

### Step 5: Find Your APK

The APK will be located at:
```
front/android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 Quick Start (EAS Build - Easiest)

Run these commands:

```bash
# 1. Install EAS CLI (if not installed)
npm install -g eas-cli

# 2. Navigate to frontend
cd E:\Playground\WorkHQ\front

# 3. Login to Expo
eas login

# 4. Build preview APK
eas build --platform android --profile preview
```

Wait 10-20 minutes, then download and install the APK!

---

## 📦 Build Profiles Explained

### Preview Build:
- **Purpose:** Testing and sharing
- **Signing:** Expo managed
- **Size:** ~50-80 MB
- **Use case:** Internal testing, sharing with team
- **Command:** `eas build --platform android --profile preview`

### Production Build:
- **Purpose:** Play Store release
- **Signing:** Your own keystore (more secure)
- **Size:** Optimized
- **Use case:** Public release
- **Command:** `eas build --platform android --profile production`

---

## 🔐 Signing Your APK (For Production)

### Generate Keystore:

```bash
# EAS will handle this automatically on first build
eas build --platform android --profile production

# Or generate manually:
keytool -genkeypair -v -storetype PKCS12 -keystore workhq.keystore -alias workhq -keyalg RSA -keysize 2048 -validity 10000
```

### Store Keystore Securely:
- Keep `workhq.keystore` file safe
- Never commit to Git
- Back up in secure location

---

## 🎨 Customize App (Optional)

### Update App Icon and Splash Screen

1. **Replace images** in `front/assets/`:
   - `icon.png` (1024x1024)
   - `splash-icon.png` (1024x1024)
   - `adaptive-icon.png` (1024x1024)

2. **Rebuild:**
   ```bash
   eas build --platform android --profile preview
   ```

### Update App Name

Edit `front/app.json`:
```json
{
  "expo": {
    "name": "WorkHQ - Your Company",
    "android": {
      "package": "com.yourcompany.workhq"
    }
  }
}
```

---

## 📲 Install APK on Android Device

### Method 1: Direct Download
1. Upload APK to Google Drive, Dropbox, or your server
2. Open link on Android device
3. Download and install
4. Allow "Install from Unknown Sources" if prompted

### Method 2: ADB (USB)
```bash
# Connect device via USB
# Enable USB Debugging on device

# Install APK
adb install path/to/app.apk
```

### Method 3: Email/WhatsApp
1. Send APK file to yourself
2. Download on device
3. Tap to install

---

## 🧪 Testing Your APK

### Before Release Checklist:

- [ ] App launches successfully
- [ ] Can login with Supabase credentials
- [ ] All screens load correctly
- [ ] API calls work (Heroku backend)
- [ ] Location permissions work
- [ ] Maps display correctly (if using Google Maps)
- [ ] Dark/Light theme switches
- [ ] Navigation works smoothly
- [ ] No crashes on major features

---

## 📊 Build Optimization

### Reduce APK Size:

1. **Enable Proguard** (for production):
   ```json
   // android/app/build.gradle
   buildTypes {
     release {
       minifyEnabled true
       shrinkResources true
     }
   }
   ```

2. **Use APK Splits** (multiple APKs per architecture):
   ```json
   // android/app/build.gradle
   splits {
     abi {
       enable true
       reset()
       include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
       universalApk true
     }
   }
   ```

---

## 🆘 Troubleshooting

### Issue: "eas: command not found"

**Solution:**
```bash
npm install -g eas-cli
```

### Issue: Build fails with "ANDROID_SDK_ROOT not set"

**Solution:**
Set environment variable:
```powershell
$env:ANDROID_SDK_ROOT = "C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
```

### Issue: "Gradle build failed"

**Solution:**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleRelease
```

### Issue: APK not installing on device

**Solution:**
- Enable "Install from Unknown Sources"
- Make sure device is Android 5.0+
- Check if previous version needs uninstalling

---

## 🚀 Deploy to Google Play Store

### Step 1: Create Google Play Developer Account
- Cost: $25 one-time fee
- Register at: https://play.google.com/console

### Step 2: Build Production APK
```bash
eas build --platform android --profile production
```

### Step 3: Create App Listing
1. Go to Google Play Console
2. Create new app
3. Fill in app details:
   - Title: WorkHQ
   - Short description
   - Full description
   - Screenshots
   - App icon

### Step 4: Upload APK
1. Go to Release → Production
2. Create new release
3. Upload your APK
4. Submit for review

### Step 5: Wait for Approval
- Usually takes 1-3 days
- Fix any issues reported
- Once approved, app goes live!

---

## 💡 Pro Tips

1. **Test on Multiple Devices:**
   - Different Android versions
   - Different screen sizes
   - Different manufacturers

2. **Monitor Crash Reports:**
   - Use Sentry or Crashlytics
   - Fix crashes promptly

3. **Version Your Builds:**
   - Update `version` in `app.json` for each build
   - Keep changelog

4. **Cache Builds:**
   - EAS caches dependencies
   - Subsequent builds are faster

5. **Use Internal Testing:**
   - Google Play Internal Testing
   - Share with small group first

---

## 📋 Build Commands Reference

```bash
# Preview build (testing)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production

# Local build
npx expo run:android --variant release

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]
```

---

## 🎯 Quick Comparison

| Feature | EAS Build | Local Build |
|---------|-----------|-------------|
| **Setup Time** | 5 minutes | 1-2 hours |
| **Requirements** | Internet only | Android Studio |
| **Build Time** | 10-20 minutes | 5-15 minutes |
| **Maintenance** | Expo handles it | You maintain it |
| **Cost** | Free tier available | Free (but local resources) |
| **Best For** | Most developers | Advanced/custom needs |

---

## 🎊 Recommended Approach

**For Your WorkHQ App:**

1. **Use EAS Build** for quickest results:
   ```bash
   npm install -g eas-cli
   cd front
   eas login
   eas build --platform android --profile preview
   ```

2. **Wait 10-20 minutes**

3. **Download APK** from the link provided

4. **Test on your device**

5. **Share with team/users!**

---

**🚀 Ready to build? Run: `eas build --platform android --profile preview`**

