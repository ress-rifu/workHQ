# 🚀 Build Your APK NOW - Quick Start

Follow these 3 simple steps to build your WorkHQ APK.

---

## ✅ Step 1: Login to Expo (1 minute)

```bash
cd E:\Playground\WorkHQ\front
eas login
```

**Don't have an Expo account?**
- Create free account at: https://expo.dev/signup
- Or use: `eas register`

---

## ✅ Step 2: Start Build (1 minute)

**For Testing (Recommended first time):**
```bash
eas build --platform android --profile preview
```

**For Production (Play Store ready):**
```bash
eas build --platform android --profile production
```

---

## ✅ Step 3: Wait & Download (10-20 minutes)

The build runs in the cloud. You'll see:

```
✔ Build started, it may take a few minutes to complete.
📝 Build details: https://expo.dev/accounts/[your-account]/projects/workhq/builds/[build-id]
```

### Monitor Progress:
- Watch in terminal
- Or visit the URL provided

### When Complete:
You'll get a download link:
```
✔ Build finished.

🤖 Android app:
https://expo.dev/artifacts/eas/xxxxx.apk
```

**Download the APK and install on your Android device!**

---

## 📲 Install APK on Device

### Method 1: Direct Download
1. Open the download link on your Android device
2. Download the APK
3. Tap to install
4. Allow "Install from Unknown Sources" if prompted

### Method 2: Transfer via USB
1. Download APK on computer
2. Connect phone via USB
3. Copy APK to phone
4. Open file manager on phone
5. Tap APK to install

### Method 3: Share Link
1. Copy the download link
2. Send to your phone (email/WhatsApp)
3. Open on phone and download
4. Install

---

## 🎯 What You Get

### APK File:
- **Name:** WorkHQ
- **Size:** ~50-80 MB
- **Package:** com.workhq.app
- **Version:** 1.0.0

### Features Included:
✅ All app screens and functionality  
✅ Connected to Heroku backend  
✅ Supabase authentication  
✅ Location services  
✅ GPS attendance tracking  
✅ Dark/Light theme  
✅ Complete HR features  

---

## 🆘 Troubleshooting

### Issue: "eas: command not found"
```bash
npm install -g eas-cli
```

### Issue: "Not logged in"
```bash
eas login
```

### Issue: Build fails
Check logs:
```bash
eas build:list
eas build:view [BUILD_ID]
```

### Issue: APK won't install
- Enable "Install from Unknown Sources"
- Check device is Android 5.0+
- Uninstall previous version if exists

---

## 💡 Pro Tips

1. **First Build Takes Longer:** 15-20 minutes (subsequent builds: 10-15 min)
2. **Monitor Online:** Check https://expo.dev for progress
3. **Download Link Valid:** 30 days
4. **Keep Terminal Open:** Or check expo.dev for status
5. **Test Preview First:** Before building production version

---

## 🔄 Build Again (Updates)

When you make changes to your app:

```bash
# 1. Make your code changes
# 2. Commit changes (optional but recommended)
git add .
git commit -m "Update: your changes"

# 3. Build new APK
eas build --platform android --profile preview
```

Version management is automatic!

---

## 📊 Build Status Commands

```bash
# Check build status
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]

# View all projects
eas project:list
```

---

## 🎊 That's It!

Your complete build process:

```bash
cd E:\Playground\WorkHQ\front
eas login
eas build --platform android --profile preview
# Wait 10-20 minutes
# Download APK
# Install on device
```

---

## 📖 Need More Help?

- **Complete Guide:** BUILD_APK_GUIDE.md
- **Interactive Script:** `.\build-apk.ps1`
- **Expo Docs:** https://docs.expo.dev/build/setup/
- **Support:** https://expo.dev/support

---

**🚀 Ready? Run: `eas login` then `eas build --platform android --profile preview`**

