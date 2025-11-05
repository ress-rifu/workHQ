# 📱 Phone Access Fix - App Loading Issue

## ✅ Problem Identified

When scanning the QR code from your phone, the app was stuck on "Loading..." because:

1. **The backend URL was set to `localhost:5000`**
2. Your phone can't access "localhost" - that's only accessible from your computer
3. **Solution:** Use your computer's IP address instead

---

## 🔧 Fix Applied

✅ **Updated `front/.env` file:**
```env
EXPO_PUBLIC_BACKEND_API_URL=http://192.168.0.185:5000
```

✅ **Added timeout to AuthContext** - Won't hang forever if Supabase is slow

---

## 🚀 Next Steps

### **1. Restart the Frontend Server**

In the **Frontend terminal window**, press:
- **`Ctrl + C`** to stop the server
- Then run:
```bash
npx expo start --clear
```

OR just close the frontend window and run:
```powershell
cd E:\Playground\WorkHQ\front
npx expo start --clear
```

### **2. Scan QR Code Again**

- Wait for the QR code to appear
- Scan it with Expo Go on your phone
- App should now load properly!

---

## 🎯 What You'll See

1. **"WorkHQ" splash screen** with loading spinner
2. **Login screen** (since you don't have an account yet)
3. Try logging in with test credentials (after you create them in Supabase)

---

## ⚠️ Important Notes

### **If Backend IP Changes:**

If your computer gets a different IP address (e.g., after restart), you'll need to:

1. Get new IP:
```powershell
ipconfig | Select-String "IPv4"
```

2. Update `front/.env`:
```env
EXPO_PUBLIC_BACKEND_API_URL=http://NEW_IP_HERE:5000
```

3. Restart frontend with `--clear` flag

### **Make Sure Backend is Running:**

Test from your phone's browser:
- Open Safari/Chrome on your phone
- Navigate to: `http://192.168.0.185:5000/health`
- Should see: `{"status":"OK","message":"WorkHQ API is running",...}`

If it doesn't work:
- Make sure your phone and computer are on the **same WiFi network**
- Check Windows Firewall isn't blocking port 5000

### **Firewall Fix (if needed):**

If the health check doesn't work from your phone:

```powershell
# Run in PowerShell as Administrator
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000
```

---

## 🐛 Troubleshooting

### **Still Loading Forever?**

1. Check Expo terminal for error messages
2. On your phone in Expo Go, shake the device → "Reload"
3. Try clearing Expo cache:
```bash
npx expo start --clear
```

### **"Network Error" or "Cannot connect"**

1. Verify both devices on same WiFi
2. Test backend from phone browser (see above)
3. Check firewall settings

### **"Supabase" errors**

The app will now timeout after 5 seconds instead of hanging forever. Check:
1. Supabase credentials in `.env` are correct
2. Your Supabase project is active
3. Database tables are created (see START_GUIDE.md)

---

## 📝 Summary

✅ Changed backend URL from `localhost` → `192.168.0.185`  
✅ Added timeout to prevent infinite loading  
⏳ Restart frontend server  
⏳ Scan QR code again  

**The app should now load on your phone!** 🎉

