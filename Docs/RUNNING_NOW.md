# 🚀 WorkHQ - Now Running!

## ✅ Current Status

Both servers have been started fresh in separate windows:

### **Backend Server** ✅
- **Window:** "=== BACKEND SERVER ==="
- **Port:** 5000
- **URL:** http://192.168.0.185:5000
- **Status Check:** http://192.168.0.185:5000/health

### **Frontend Server** ✅  
- **Window:** "=== FRONTEND SERVER ==="
- **Port:** 8081 (Metro Bundler)
- **Web URL:** http://localhost:8081

---

## 📱 How to Access

### **Option 1: Web Browser** (Limited - No GPS/Maps)
1. Browser should auto-open to `http://localhost:8081`
2. Wait for bundle to compile (30-60 seconds first time)
3. **Dismiss the red error** about maps (click X)
4. See the **Login Screen**

**What works on web:**
- ✅ Login/Auth screens
- ✅ Dashboard navigation
- ✅ Leave management UI
- ✅ Payroll viewing
- ✅ Profile
- ❌ Attendance (needs GPS/Maps - mobile only)

### **Option 2: Mobile Device** (Full Features)
1. Install **Expo Go** app from App Store/Play Store
2. Look at the **Frontend window** for QR code
3. **Scan QR code** with Expo Go
4. App loads with full GPS/Maps support!

**Everything works on mobile:**
- ✅ GPS-based attendance check-in/out
- ✅ Google Maps with office locations
- ✅ All other features

---

## 🎯 Quick Actions

### **In Frontend Window:**
- Press **`w`** → Open web browser
- Press **`a`** → Open Android emulator  
- Press **`i`** → Open iOS simulator (Mac only)
- Press **`r`** → Reload app
- Press **`m`** → Toggle menu

### **Check Backend Health:**
```powershell
curl http://192.168.0.185:5000/health
```

Should return:
```json
{
  "status": "OK",
  "message": "WorkHQ API is running",
  "timestamp": "..."
}
```

---

## ⚙️ Server Locations

| Component | Directory | Command |
|-----------|-----------|---------|
| **Backend** | `E:\Playground\WorkHQ\Back` | `npm run dev` |
| **Frontend** | `E:\Playground\WorkHQ\front` | `npx expo start --clear` |

---

## 🐛 Troubleshooting

### **Backend Not Responding**
Check the Backend window for errors. Should show:
```
🚀 Server is running on http://localhost:5000
```

### **Frontend Not Loading**
Check the Frontend window. Should show:
```
Web Bundled 5628ms index.ts (206 modules)
```

### **Red Error in Browser**
The `react-native-maps` error is **NORMAL** on web. Just click **X** to dismiss it.

### **Phone Can't Connect**
Make sure:
- Phone and computer on **same WiFi**
- Backend uses **192.168.0.185** (your computer's IP)
- Windows Firewall allows port 5000

---

## 📊 API Endpoints

All backend endpoints are available at `http://192.168.0.185:5000/api/`

### **Auth:**
- `POST /api/auth/register` - Register user
- `GET /api/auth/profile` - Get profile

### **Profile:**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### **Leave:**
- `GET /api/leave/types` - Get leave types
- `GET /api/leave/balances` - Get leave balances
- `POST /api/leave/apply` - Apply for leave

### **Attendance:**
- `GET /api/attendance/locations` - Get office locations
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out

### **Payroll:**
- `GET /api/payroll/salary` - Get salary structure
- `GET /api/payroll/payslips` - Get payslips

### **HR (Admin/HR only):**
- `GET /api/hr/leave-requests` - Get all leave requests
- `PUT /api/hr/leave-requests/:id/approve` - Approve leave
- `GET /api/hr/employees` - Get all employees

---

## 🗄️ Database Setup

**Before you can login**, you need to set up the database:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run these scripts in order:
   - `Back/prisma/create-tables.sql`
   - `Back/prisma/fix-all-rls-warnings.sql`
   - `Back/prisma/add-foreign-key-indexes.sql`
   - `Back/prisma/disable-rls-for-service.sql`

3. Create test user in **Supabase Auth**
4. Insert User and Employee records

**See `START_GUIDE.md` for detailed database setup instructions.**

---

## 🎉 You're All Set!

Both servers are running. Access the app via:
- **Web:** http://localhost:8081 (dismiss maps error)
- **Mobile:** Scan QR code in Frontend window

**Next step:** Set up database to enable login! 🚀

