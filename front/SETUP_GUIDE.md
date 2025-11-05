# 🚀 WorkHQ Frontend Setup Guide

## ⚠️ IMPORTANT: Common Issues Fixed

This guide addresses the main issues causing Expo Go to fail:

1. **Missing Environment Variables** - App can't connect to Supabase/Backend
2. **React Version Incompatibility** - React 19 not compatible with Expo SDK 54
3. **New Architecture Issues** - Causing crashes in Expo Go
4. **Invalid package.json** - Malformed JSON causing install failures

---

## ✅ Step 1: Create Environment File

**You MUST create a `.env` file in the `front` folder:**

```bash
# Navigate to front folder
cd E:\Playground\WorkHQ\front

# Create .env file (use a text editor)
```

**Add this content to `.env`:**

```env
# Supabase Configuration (REQUIRED)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API Configuration (REQUIRED)
EXPO_PUBLIC_BACKEND_API_URL=http://192.168.0.185:3000
```

**Where to get Supabase credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - anon/public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

**Backend URL:**
- If backend running locally: `http://192.168.0.185:3000` (replace with your IP)
- Find your IP: `ipconfig` (Windows) → Look for IPv4 Address

---

## ✅ Step 2: Install Dependencies

```bash
cd E:\Playground\WorkHQ\front

# Remove old installations
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force

# Install dependencies (MUST use --legacy-peer-deps)
npm install --legacy-peer-deps
```

**Why `--legacy-peer-deps`?**
- React Native Maps and other native modules have specific peer dependency requirements
- This flag allows installation despite version mismatches

---

## ✅ Step 3: Clear All Caches

```bash
# Clear Expo cache
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Clear Metro bundler cache
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# Clear temp folders
Remove-Item -Recurse -Force $env:TEMP\metro-* -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $env:TEMP\haste-* -ErrorAction SilentlyContinue
```

---

## ✅ Step 4: Start the App

### Option A: LAN Mode (Recommended)

```bash
npx expo start --clear
```

**Then:**
1. Wait for QR code to appear
2. Make sure phone and computer are on same WiFi
3. Open Expo Go app on your phone
4. Scan the QR code

**If QR scanning doesn't work:**
1. Look at the terminal output
2. Find the line: `Metro waiting on exp://192.168.x.x:8081`
3. Open Expo Go → "Enter URL manually"
4. Type the full URL (e.g., `exp://192.168.0.185:8081`)

### Option B: Tunnel Mode (If same network doesn't work)

```bash
npx expo start --clear --tunnel
```

- Takes longer to start (~30 seconds)
- Works even if devices aren't on same network
- Requires internet connection
- Scan the QR code when ready

### Option C: Development Build (Advanced)

If Expo Go still fails, use a development build:

```bash
# Install dev client
npm install expo-dev-client --legacy-peer-deps

# Prebuild native code
npx expo prebuild --clean

# Run on Android
npx expo run:android

# Or iOS
npx expo run:ios
```

---

## 🐛 Troubleshooting

### Issue: "Failed to download remote update"

**Solution:**
```bash
# Stop Metro
Get-Process node | Stop-Process -Force

# Clear everything
Remove-Item -Recurse -Force .expo, node_modules\.cache

# Restart with explicit development mode
npx expo start --clear --dev --no-minify
```

### Issue: "Network request failed"

**Causes:**
1. Backend not running
2. Wrong IP address in `.env`
3. Firewall blocking connection

**Solutions:**

**Check Backend:**
```bash
# In a new terminal
cd E:\Playground\WorkHQ\Back
npm run dev
```

**Check IP Address:**
```bash
ipconfig
# Look for "Wireless LAN adapter Wi-Fi" → IPv4 Address
# Update EXPO_PUBLIC_BACKEND_API_URL in .env
```

**Test Connection:**
- Open phone browser
- Go to: `http://192.168.0.185:8081` (your IP)
- Should see Metro bundler page
- If not loading → Network issue

**Windows Firewall:**
```powershell
# Allow Node.js through firewall
New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
```

### Issue: "Unable to resolve module"

**Solution:**
```bash
# Clear watchman (if installed)
watchman watch-del-all

# Clear metro
npx expo start --clear

# If still fails, reinstall
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

### Issue: App loads but crashes immediately

**Check:**
1. Look at Expo Go logs (shake phone → "Debug Remote JS")
2. Check Metro terminal for errors
3. Verify `.env` variables are correct

**Common causes:**
- Missing Supabase credentials
- Backend not accessible
- Malformed JSON in responses

### Issue: "Expo Go is not compatible"

Your app might be using features not supported in Expo Go.

**Solution: Build development client**
```bash
npm install expo-dev-client --legacy-peer-deps
npx expo prebuild
npx expo run:android  # or run:ios
```

---

## 📱 Testing on Different Platforms

### Android Emulator (on same computer)

```bash
# Start emulator first
# Then run:
npx expo start --android
```

### iOS Simulator (Mac only)

```bash
npx expo start --ios
```

### Physical Device

**Requirements:**
- Expo Go app installed
- Same WiFi network (LAN mode)
- OR internet connection (Tunnel mode)

---

## 🎯 Expected Behavior After Fix

**In Metro Terminal:**
```
✅ Metro waiting on exp://192.168.0.185:8081
✅ Logs for your project will appear below.
```

**In Expo Go App:**
```
1. Connecting to Metro... ✅
2. Downloading JavaScript bundle... ✅
3. Opening WorkHQ... ✅
4. Login Screen Appears! 🎉
```

**In Browser Console (if web):**
```
🚀 WorkHQ App Starting...
📱 Expo Public Config: {
  supabaseUrl: '✅ Set',
  supabaseKey: '✅ Set',
  backendUrl: 'http://192.168.0.185:3000'
}
✅ Fonts loaded: true
```

---

## 🔍 Verification Checklist

Before running, verify:

- [ ] `.env` file exists in `front` folder
- [ ] `.env` has all 3 variables set (not placeholder values)
- [ ] Backend is running (`npm run dev` in Back folder)
- [ ] `node_modules` folder exists
- [ ] No errors in package.json (fixed "undefined" line)
- [ ] Phone and computer on same WiFi (if using LAN)
- [ ] Expo Go app is latest version
- [ ] No VPN active (can interfere)

---

## 📊 What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| **React Version** | 19.2.0 ❌ | 18.2.0 ✅ |
| **React Native** | 0.81.5 ❌ | 0.76.6 ✅ |
| **New Arch** | Enabled ❌ | Disabled ✅ |
| **Invalid JSON** | "undefined" line ❌ | Removed ✅ |
| **Error Handling** | None ❌ | ErrorBoundary ✅ |
| **Env Validation** | Silent fail ❌ | Clear warnings ✅ |

---

## 💡 Quick Commands Reference

**Full Reset & Start:**
```powershell
# In front folder
Remove-Item -Recurse -Force node_modules, .expo, package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install --legacy-peer-deps
npx expo start --clear
```

**Check Status:**
```bash
# Check node/npm versions
node -v  # Should be 18.x or 20.x
npm -v   # Should be 9.x or 10.x

# Check if backend is running
curl http://192.168.0.185:3000/api/health
```

**Stop Everything:**
```powershell
# Kill all Node processes
Get-Process node | Stop-Process -Force
```

---

## 🆘 Still Having Issues?

**Provide this information for help:**

1. **Node/npm versions:**
   ```bash
   node -v
   npm -v
   ```

2. **Expo Go version:**
   - Open Expo Go → Settings → Check version

3. **Error messages:**
   - Take screenshot of terminal error
   - Take screenshot of Expo Go error

4. **Environment check:**
   ```bash
   cat .env  # (remove actual credentials before sharing)
   ```

5. **Metro logs:**
   - Copy any red error messages from terminal

6. **Connection test:**
   - Can you open `http://192.168.0.185:8081` in phone browser?

---

## 🎉 Success!

If you see the WorkHQ login screen, you're ready to go! 🚀

**Next Steps:**
1. Test login with your credentials
2. Check backend logs for API requests
3. Explore the app features

**Enjoy WorkHQ! 👔**

