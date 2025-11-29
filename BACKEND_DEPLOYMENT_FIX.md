# Backend Deployment Fix Guide

## Problem

You're experiencing connection issues even with internet because the **backend is not properly deployed or accessible**. The "Prisma error" happens when the mobile app can't reach the backend API.

## Solution: Deploy Backend to Vercel

### Step 1: Verify Backend Deployment

1. **Check if backend is deployed**:
   - Go to https://vercel.com/dashboard
   - Look for your WorkHQ backend project
   - Check deployment status

2. **Test backend health**:
   ```powershell
   # Open PowerShell and test
   curl https://workhq-api.vercel.app/health
   ```
   
   **Expected response**:
   ```json
   {
     "status": "OK",
     "message": "WorkHQ API is running",
     "database": "Connected",
     "timestamp": "2025-11-29T..."
   }
   ```

### Step 2: Deploy/Redeploy Backend

```powershell
cd e:\Playground\workHQ\Back

# Install Vercel CLI if not installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables on Vercel

Your backend needs these environment variables set on Vercel:

1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | Your Supabase connection string | From Supabase Dashboard |
| `DIRECT_URL` | Your Supabase direct connection | From Supabase Dashboard |
| `SUPABASE_URL` | https://rdkgfezrowfnlrbtiekn.supabase.co | From your env |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | From your env |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | From Supabase Dashboard |
| `JWT_SECRET` | Any random secure string | Generate new |
| `NODE_ENV` | production | Set manually |

#### Get Supabase Connection Strings

1. Go to https://supabase.com/dashboard
2. Select your project: `rdkgfezrowfnlrbtiekn`
3. Go to **Settings** → **Database**
4. Copy **Connection String** (Transaction mode) → This is `DATABASE_URL`
5. Copy **Connection String** (Session mode) → This is `DIRECT_URL`

**Important**: Replace `[YOUR-PASSWORD]` in the connection strings with your actual database password!

### Step 4: Verify Deployment

After deploying, test these endpoints:

```powershell
# 1. Health check
curl https://workhq-api.vercel.app/health

# 2. Root endpoint
curl https://workhq-api.vercel.app/

# 3. API endpoint (should return 401 without auth)
curl https://workhq-api.vercel.app/api/profile
```

### Step 5: Update Frontend if Needed

If your backend URL is different, update `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_BACKEND_API_URL": "https://YOUR-ACTUAL-BACKEND-URL.vercel.app"
      }
    }
  }
}
```

## Common Issues & Fixes

### Issue: "Service Unavailable" or "Database Disconnected"

**Cause**: Backend can't connect to database

**Fix**:
1. Check `DATABASE_URL` and `DIRECT_URL` in Vercel environment variables
2. Verify database password is correct (no `[YOUR-PASSWORD]` placeholder)
3. Check Supabase database is running
4. Redeploy: `vercel --prod`

### Issue: "404 Not Found" on all API endpoints

**Cause**: Vercel routing not configured

**Fix**:
1. Ensure `vercel.json` exists in backend folder
2. Check `api/index.ts` exists
3. Redeploy: `vercel --prod`

### Issue: Backend works locally but not on Vercel

**Cause**: Missing environment variables or build errors

**Fix**:
1. Check Vercel deployment logs for errors
2. Verify all environment variables are set
3. Run `npm run vercel-build` locally to test build
4. Check `package.json` has correct `vercel-build` script

### Issue: "Prisma Client not found"

**Cause**: Prisma not generated during build

**Fix**:
1. Ensure `vercel-build` script includes `prisma generate`
2. Check `package.json`:
   ```json
   {
     "scripts": {
       "vercel-build": "npx prisma generate && tsc -p tsconfig.json"
     }
   }
   ```
3. Redeploy: `vercel --prod`

## Quick Deployment Checklist

- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged into Vercel: `vercel login`
- [ ] Environment variables set on Vercel dashboard
- [ ] Database connection strings correct (no placeholders)
- [ ] Backend deployed: `vercel --prod`
- [ ] Health check passes: `curl https://workhq-api.vercel.app/health`
- [ ] Frontend `eas.json` has correct backend URL
- [ ] APK rebuilt with correct backend URL

## After Backend is Deployed

1. **Test backend**:
   ```powershell
   curl https://workhq-api.vercel.app/health
   ```

2. **Rebuild APK**:
   ```powershell
   cd e:\Playground\workHQ\front
   eas build --profile production --platform android
   ```

3. **Install and test** the new APK on your device

## Need Help?

If backend still doesn't work:

1. **Check Vercel logs**:
   - Go to https://vercel.com/dashboard
   - Click on your deployment
   - View **Functions** logs

2. **Check Supabase status**:
   - Go to https://supabase.com/dashboard
   - Verify your project is active
   - Check database is running

3. **Test locally first**:
   ```powershell
   cd e:\Playground\workHQ\Back
   npm install
   npm run dev
   ```
   Then test: `curl http://localhost:5000/health`

## Summary

The APK issue is likely because:
1. ✅ **Frontend is fixed** - Environment variables now embedded
2. ❌ **Backend is not deployed** - Need to deploy to Vercel
3. ❌ **Database not connected** - Need to set environment variables

**Next step**: Deploy the backend to Vercel following this guide!
