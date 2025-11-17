# ⚠️ IMPORTANT: Vercel Setup - Next Steps

## 🎉 Good News!
Backend is deployed and running on Vercel at: **https://workhq-api.vercel.app**

## ⚠️ Action Required: Set Environment Variables

The backend is deployed but will show errors until environment variables are set.

### Quick Setup (5 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on project: **workhq-api**
   - Go to **Settings** → **Environment Variables**

2. **Add these 6 variables:**

Copy and paste each one:

**DATABASE_URL:**
```
postgresql://postgres:zptVbRfX0oAunTQj@db.rdkgfezrowfnlrbtiekn.supabase.co:5432/postgres?pgbouncer=true
```

**SUPABASE_URL:**
```
https://rdkgfezrowfnlrbtiekn.supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTUyNzEsImV4cCI6MjA3NzQ3MTI3MX0.UV_PmsUcpsrOmM5bn4Y8xrlFJCRvHX1dJOieykXwDIs
```

**SUPABASE_SERVICE_ROLE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5NTI3MSwiZXhwIjoyMDc3NDcxMjcxfQ.UEJ8QSiFsVrbwmVG3s4kl3asuurFkaFvGl8jjHVtBR4
```

**JWT_SECRET:**
```
local-dev-secret-change-in-production-12345
```

**NODE_ENV:**
```
production
```

3. **For each variable:**
   - Click **"Add New"**
   - Name: (copy from above)
   - Value: (copy from above)
   - Environment: Select **Production**, **Preview**, AND **Development** (check all 3)
   - Click **"Save"**

4. **Redeploy:**
   - After adding all variables
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **"..."** (three dots)
   - Click **"Redeploy"**
   - Wait ~30 seconds

5. **Test:**
   ```bash
   curl https://workhq-api.vercel.app/health
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

## ✅ What's Already Done

### Backend:
- ✅ Deployed to Vercel
- ✅ Production URL: https://workhq-api.vercel.app
- ✅ Fixed serverless function issues
- ✅ Configured for production

### Frontend:
- ✅ Updated `front/env.example` with Vercel URL
- ✅ Updated `front/services/api.ts` with Vercel URL
- ✅ Ready to build with production backend

### Documentation:
- ✅ Updated all docs with Vercel URLs
- ✅ Removed old Heroku references
- ✅ Created deployment guides

---

## 📱 After Setting Environment Variables

### Test the Backend:
```bash
# Health check
curl https://workhq-api.vercel.app/health

# Get leave types (requires auth)
curl https://workhq-api.vercel.app/api/leave/types
```

### Build Mobile App:
```bash
cd front

# For testing
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

The app will automatically use the production backend URL: `https://workhq-api.vercel.app`

---

## 🔍 If You Get Errors

### "FUNCTION_INVOCATION_FAILED"
- Environment variables not set → Follow steps above

### "Cannot connect to database"
- Check DATABASE_URL is correct
- Ensure Supabase project is active
- Verify connection pooling URL is used

### "Authentication errors"
- Check SUPABASE_SERVICE_ROLE_KEY is correct
- Verify JWT_SECRET is set

---

## 📊 Summary

**✅ COMPLETED:**
- Backend deployed to Vercel
- All URLs updated across project
- Serverless function configured
- Documentation updated

**⏳ TODO (5 minutes):**
- Set 6 environment variables in Vercel Dashboard
- Redeploy
- Test endpoints
- Build mobile app

---

## 🎯 Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project:** https://vercel.com/rifus-projects-7770b67a/workhq-api
- **Production API:** https://workhq-api.vercel.app
- **Health Check:** https://workhq-api.vercel.app/health

---

**You're almost done! Just need to set those environment variables and you'll be fully deployed! 🚀**

