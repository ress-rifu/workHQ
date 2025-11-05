# 🚀 WorkHQ - Quick Start Guide

## ✅ Current Status

**Backend:** ✅ RUNNING on http://localhost:5000  
**Frontend:** ✅ RUNNING (Expo Dev Server)

---

## 📱 Access the App

### **Option 1: Physical Device (Recommended)**
1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Look for the **QR code** in the Frontend terminal window
3. Scan the QR code with:
   - **iOS:** Camera app → Opens in Expo Go
   - **Android:** Expo Go app → Scan QR Code
4. App will load on your device

### **Option 2: Emulator**
In the **Frontend terminal window**, press:
- **`a`** - Open on Android emulator
- **`i`** - Open on iOS simulator (Mac only)

### **Option 3: Web Browser** (Limited features)
In the **Frontend terminal window**, press:
- **`w`** - Open in web browser
- ⚠️ **Note:** GPS/Maps features won't work on web

---

## ⚠️ Important: Database Setup Required

Before you can use the app, you **MUST** set up the database:

### **Step 1: Create Database Tables**

Go to **Supabase Dashboard** → **SQL Editor** and run these scripts **in order**:

1. **Create Tables:**
   ```sql
   -- File: Back/prisma/create-tables.sql
   -- This creates all database tables
   ```

2. **Apply RLS Policies:**
   ```sql
   -- File: Back/prisma/fix-all-rls-warnings.sql
   -- This sets up Row Level Security
   ```

3. **Add Indexes:**
   ```sql
   -- File: Back/prisma/add-foreign-key-indexes.sql
   -- This adds performance indexes
   ```

4. **Grant Service Role Access:**
   ```sql
   -- File: Back/prisma/disable-rls-for-service.sql
   -- This allows backend to bypass RLS
   ```

### **Step 2: Add Test Data**

**Create Leave Types:**
```sql
INSERT INTO "LeaveType" (id, name, description, "maxPerYear", "isPaid") VALUES
  (gen_random_uuid(), 'Casual Leave', 'For personal matters', 12, true),
  (gen_random_uuid(), 'Sick Leave', 'For medical reasons', 12, true),
  (gen_random_uuid(), 'Earned Leave', 'Accrued annual leave', 24, true);
```

**Create Office Location:**
```sql
INSERT INTO "Location" (id, name, latitude, longitude, "radiusMeters") VALUES
  (gen_random_uuid(), 'Head Office', 28.6139, 77.2090, 100);
-- ⚠️ Replace with your actual office coordinates!
```

### **Step 3: Create Test User**

1. **In Supabase Dashboard:**
   - Go to **Authentication** → **Users**
   - Click **"Add user"** → **"Create new user"**
   - Email: `test@workhq.com`
   - Password: `Test@123` (or your choice)
   - **Copy the User ID** (UUID shown after creation)

2. **In SQL Editor:**
```sql
-- Replace 'SUPABASE_AUTH_USER_ID' with the UUID from step 1
INSERT INTO "User" (id, "supabaseAuthId", email, "fullName", role) VALUES
  (gen_random_uuid(), 'SUPABASE_AUTH_USER_ID', 'test@workhq.com', 'Test User', 'EMPLOYEE')
RETURNING id;
-- ⚠️ Copy the returned 'id' for next step

-- Replace 'USER_ID' with the id from above
INSERT INTO "Employee" (id, "userId", "employeeCode", salary, "joinDate") VALUES
  (gen_random_uuid(), 'USER_ID', 'EMP001', 50000, CURRENT_DATE)
RETURNING id;
-- ⚠️ Copy the returned 'id' for next step

-- Replace 'EMPLOYEE_ID' with the id from above
INSERT INTO "LeaveBalance" ("employeeId", "leaveTypeId", "balanceDays") 
SELECT 
  'EMPLOYEE_ID',
  id,
  15
FROM "LeaveType";
```

---

## 🎮 Using the App

Once database is set up, login with:
- **Email:** `test@workhq.com`
- **Password:** (what you set in Supabase)

### **Features to Test:**

1. **Dashboard** - View overview and quick actions
2. **Attendance** 
   - View office location on map
   - Check-in/out (requires GPS)
   - View attendance history
3. **Leave**
   - View leave balances
   - Apply for leave
   - View leave history
4. **Payroll**
   - View salary structure
   - View payslips (after HR generates them)
5. **Profile**
   - View employee details
   - Toggle dark mode
   - Logout

---

## 🔧 Troubleshooting

### **Backend Not Responding**
```bash
# Check if backend is running
curl http://localhost:5000/health

# If not, restart in the Backend terminal window
cd E:\Playground\WorkHQ\Back
npm run dev
```

### **Frontend Not Loading**
```bash
# Restart in the Frontend terminal window
cd E:\Playground\WorkHQ\front
npx expo start
```

### **"Cannot connect to server" Error**
- Make sure backend is running on port 5000
- Check `front/.env` has correct `EXPO_PUBLIC_BACKEND_API_URL`
- For physical device, use your computer's IP instead of localhost

### **"No office location found" Error**
- Make sure you created a Location in the database (Step 2 above)
- Check the coordinates are valid

### **Login Not Working**
- Verify user exists in Supabase Auth
- Verify User and Employee records exist in database
- Check Backend terminal for error messages

---

## 🗺️ Google Maps Setup (Optional)

For full map functionality:

1. Get Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project and enable Maps SDK
   - Create API key

2. Update `front/app.json`:
   ```json
   {
     "expo": {
       "ios": {
         "config": {
           "googleMapsApiKey": "YOUR_API_KEY_HERE"
         }
       },
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "YOUR_API_KEY_HERE"
           }
         }
       }
     }
   }
   ```

3. Restart frontend server

---

## 📂 Project Structure

```
WorkHQ/
├── Back/              # Backend API (Port 5000)
│   ├── src/
│   ├── prisma/
│   └── .env
├── front/             # React Native App (Expo)
│   ├── app/
│   ├── components/
│   ├── services/
│   └── .env
└── Docs/
```

---

## 🎯 Next Steps

1. ✅ Both servers running
2. ⏳ Complete database setup (above)
3. ⏳ Create test user
4. ⏳ Login and test features
5. 📱 Deploy to app stores (when ready)

---

## 📞 Support

- **Backend Logs:** Check the Backend terminal window
- **Frontend Logs:** Check the Frontend terminal window
- **Database:** Supabase Dashboard → Logs

---

**🎉 Enjoy using WorkHQ!**

