# ⚡ WorkHQ Quick Start (3 Steps)

## 🎯 TL;DR

```powershell
# 1. Create .env file with your Supabase credentials
# 2. Run setup script
cd E:\Playground\WorkHQ\front
.\setup-and-start.ps1

# 3. Scan QR code with Expo Go
```

---

## Step 1: Create `.env` File ⚠️ REQUIRED

Create `E:\Playground\WorkHQ\front\.env` with:

```env
EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
EXPO_PUBLIC_BACKEND_API_URL=https://workhq-api.vercel.app
# For local development: http://localhost:5000
```

**Get Supabase credentials:** https://supabase.com/dashboard → Your Project → Settings → API

**Backend:** Production URL already set (https://workhq-api.vercel.app). For local dev, override in `.env`

---

## Step 2: Run Setup Script

```powershell
cd E:\Playground\WorkHQ\front
.\setup-and-start.ps1
```

The script will:
- ✅ Check .env file
- ✅ Install dependencies (if needed)
- ✅ Clear all caches
- ✅ Start Expo

---

## Step 3: Connect with Expo Go

**Method A: QR Code**
1. Open Expo Go on phone
2. Scan QR code from terminal

**Method B: Manual URL**
1. Open Expo Go
2. Tap "Enter URL manually"
3. Type: `exp://YOUR_IP:8081` (replace YOUR_IP with your computer's IP from ipconfig)

**Method C: Tunnel** (if same network fails)
- Press `t` in Metro terminal
- Wait for new QR code
- Scan it

---

## 🐛 Quick Troubleshooting

**"Failed to download"**
```bash
npx expo start --clear --tunnel
```

**"Network request failed"**
1. Backend automatically uses production: `https://workhq-api.vercel.app`
2. For local backend: Set in `.env` → `EXPO_PUBLIC_BACKEND_API_URL=http://localhost:5000`
3. Test Metro: Open `http://localhost:8081` in browser

**"Unable to resolve module"**
```bash
Remove-Item -Recurse -Force node_modules, .expo
npm install --legacy-peer-deps
npx expo start --clear
```

---

## ✅ What Got Fixed

- ✅ React 19 → React 18 (compatibility)
- ✅ New Architecture disabled (Expo Go compatibility)
- ✅ Error boundary added (better error messages)
- ✅ Environment validation added
- ✅ Invalid package.json fixed

---

## 📞 Need Help?

See `SETUP_GUIDE.md` for detailed troubleshooting

