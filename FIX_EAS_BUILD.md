# 🔧 Fix EAS Build - Quick Steps

You're getting an "Invalid UUID appId" error. Here's how to fix it:

---

## 🎯 Solution: Initialize EAS Project

Run these commands **in PowerShell** (they need your input):

### Step 1: Navigate to frontend
```bash
cd E:\Playground\WorkHQ\front
```

### Step 2: Initialize EAS project
```bash
eas project:init
```

**When prompted:**
- "Would you like to create a project for @rifu/workhq?" → Press **Y** (Yes)

This will:
- Create a new EAS project
- Generate a valid project ID
- Update your `app.json` automatically

### Step 3: Build APK
```bash
eas build --platform android --profile preview
```

---

## 🚀 Complete Command Sequence

Copy and paste these one by one:

```bash
cd E:\Playground\WorkHQ\front
eas project:init
eas build --platform android --profile preview
```

When asked to create project, press **Y** and Enter.

---

## 📋 What Each Command Does

| Command | What it does |
|---------|-------------|
| `eas project:init` | Creates EAS project and gets valid ID |
| `eas build --platform android --profile preview` | Builds your APK |

---

## ⏱️ Expected Timeline

1. **Initialize project:** 10 seconds
2. **Build APK:** 10-20 minutes
3. **Download APK:** 2 minutes

Total: ~15-25 minutes

---

## ✅ After Initialization

Once `eas project:init` completes successfully, you'll see:

```
✔ Created @rifu/workhq
✔ Updated app.json
```

Your `app.json` will be automatically updated with the correct project ID.

---

## 🆘 If You Still Get Errors

### Error: "Not logged in"
```bash
eas login
```

### Error: "Project already exists"
That's fine! Just proceed to build:
```bash
eas build --platform android --profile preview
```

### Error: "Invalid credentials"
Re-login:
```bash
eas logout
eas login
```

---

## 💡 Alternative: Skip EAS Project Init

If you want to skip the init step, EAS will create the project automatically during the first build:

```bash
cd E:\Playground\WorkHQ\front
eas build --platform android --profile preview --non-interactive
```

But this might fail with the same error. Better to use `eas project:init` first.

---

## 🎯 Recommended Approach

**Just run these 3 commands:**

```powershell
cd E:\Playground\WorkHQ\front
eas project:init
eas build --platform android --profile preview
```

Press **Y** when asked to create project.

---

## 📊 What You'll See

### Step 1: Initialize
```
$ eas project:init
? Would you like to create a project for @rifu/workhq? (Y/n) Y
✔ Created @rifu/workhq
✔ Updated app.json
```

### Step 2: Build
```
$ eas build --platform android --profile preview
✔ Linked to project @rifu/workhq
✔ Using remote Android credentials
✔ Credentials valid
✔ Build started

📝 Build details: https://expo.dev/...
```

### Step 3: Complete
```
✔ Build finished.

🤖 Android app:
https://expo.dev/artifacts/eas/xxxxx.apk

Download and install on your device!
```

---

## 🎊 Next Steps After Build

1. **Download APK** from the link
2. **Transfer to phone** (USB/email/cloud)
3. **Install APK** on Android device
4. **Open WorkHQ** and login
5. **Done!** 🚀

---

**🚀 Ready? Run: `eas project:init` then answer Y**

