# 🚀 Deploy WorkHQ Backend to Heroku - Step by Step

Follow these exact steps to deploy your backend to Heroku.

---

## ✅ Step 1: Login to Heroku

Open PowerShell and run:

```powershell
heroku login
```

Press any key when prompted. A browser window will open. Log in to your Heroku account.

**Verify login:**
```powershell
heroku auth:whoami
```

You should see your email address.

---

## ✅ Step 2: Create Heroku App

```powershell
cd E:\Playground\WorkHQ
heroku create workhq-api
```

**If the name is taken, try:**
```powershell
heroku create workhq-api-yourname
# or
heroku create  # Let Heroku generate a random name
```

**Note the app URL** - it will be something like: `https://workhq-api.herokuapp.com`

---

## ✅ Step 3: Set Environment Variables

Run these commands **one by one**, replacing the values with your actual credentials from `Back/.env`:

```powershell
# Database URL (from Supabase)
heroku config:set DATABASE_URL="postgresql://postgres:zptVbRfX0oAunTQj@db.rdkgfezrowfnlrbtiekn.supabase.co:5432/postgres"

# Supabase URL
heroku config:set SUPABASE_URL="https://rdkgfezrowfnlrbtiekn.supabase.co"

# Supabase Anon Key
heroku config:set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTUyNzEsImV4cCI6MjA3NzQ3MTI3MX0.UV_PmsUcpsrOmM5bn4Y8xrlFJCRvHX1dJOieykXwDIs"

# Supabase Service Role Key (from your Back/.env)
heroku config:set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Node Environment
heroku config:set NODE_ENV="production"

# JWT Secret (create a new strong one for production!)
heroku config:set JWT_SECRET="production-secret-$(Get-Random)-change-this-to-something-secure"
```

**Verify all variables are set:**
```powershell
heroku config
```

---

## ✅ Step 4: Add Heroku Remote

```powershell
cd E:\Playground\WorkHQ
heroku git:remote -a workhq-api
```

Replace `workhq-api` with your actual app name if different.

**Verify remote:**
```powershell
git remote -v
```

You should see both `origin` (GitHub) and `heroku`.

---

## ✅ Step 5: Deploy to Heroku

**This deploys only the `Back` folder to Heroku:**

```powershell
git subtree push --prefix Back heroku master
```

This will:
- Push your backend code to Heroku
- Install dependencies
- Run build scripts
- Generate Prisma client
- Start the server

**Wait for the build to complete** (2-3 minutes).

---

## ✅ Step 6: Verify Deployment

```powershell
# Check if app is running
heroku logs --tail

# Open app in browser
heroku open

# Test health endpoint
curl https://workhq-api.herokuapp.com/health
```

**Expected response:**
```json
{
  "status": "OK",
  "message": "WorkHQ API is running",
  "timestamp": "2025-11-05T..."
}
```

---

## ✅ Step 7: Update Frontend

Edit `front/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://rdkgfezrowfnlrbtiekn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTUyNzEsImV4cCI6MjA3NzQ3MTI3MX0.UV_PmsUcpsrOmM5bn4Y8xrlFJCRvHX1dJOieykXwDIs
EXPO_PUBLIC_BACKEND_API_URL=https://workhq-api.herokuapp.com
```

Replace `workhq-api` with your actual Heroku app name.

**Restart Expo:**
```powershell
cd front
npx expo start --clear
```

---

## 🎉 Deployment Complete!

Your backend is now live at: **https://workhq-api.herokuapp.com**

Test it:
- Health check: `https://workhq-api.herokuapp.com/health`
- API docs: `https://workhq-api.herokuapp.com/`

---

## 🔧 Troubleshooting

### Issue: "Application Error" on Heroku

**Check logs:**
```powershell
heroku logs --tail
```

**Common fixes:**
```powershell
# Restart app
heroku restart

# Check config vars
heroku config

# Rebuild
git commit --allow-empty -m "Rebuild"
git subtree push --prefix Back heroku master
```

### Issue: Database connection fails

**Verify DATABASE_URL:**
```powershell
heroku config:get DATABASE_URL
```

Make sure it matches your Supabase connection string.

### Issue: Prisma errors

**Regenerate Prisma client:**
```powershell
heroku run npx prisma generate
```

### Issue: Can't push to Heroku

**Check if remote exists:**
```powershell
git remote -v
```

**Re-add if missing:**
```powershell
heroku git:remote -a workhq-api
```

---

## 📊 Your Deployment Info

| Item | Value |
|------|-------|
| **App Name** | workhq-api (or your custom name) |
| **App URL** | https://workhq-api.herokuapp.com |
| **Health Check** | https://workhq-api.herokuapp.com/health |
| **Region** | us (default) |

---

## 🔄 Future Updates

To update your deployed app:

```powershell
# 1. Make changes to Back/ folder
# 2. Commit changes
git add .
git commit -m "Update backend"

# 3. Push to Heroku
git subtree push --prefix Back heroku master
```

---

## 💡 Useful Commands

```powershell
# View logs (live)
heroku logs --tail

# View app info
heroku info

# Open app in browser
heroku open

# View config variables
heroku config

# Set a config variable
heroku config:set KEY=value

# Restart app
heroku restart

# Run commands on Heroku
heroku run bash
heroku run npx prisma generate

# Scale dynos
heroku ps:scale web=1

# View dyno status
heroku ps
```

---

## 🎊 Success!

Once deployed, your app will be accessible 24/7 at your Heroku URL!

Your mobile app (Expo Go) will now connect to the cloud backend instead of localhost.

**Next Steps:**
1. Test all API endpoints
2. Create test users in Supabase
3. Test the mobile app with Heroku backend
4. Monitor logs for any issues

---

**Need help?** Check the logs: `heroku logs --tail`

