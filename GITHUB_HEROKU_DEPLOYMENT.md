# 🚀 GitHub & Heroku Deployment Guide

This guide will help you push your code to GitHub and deploy the backend to Heroku.

---

## ✅ Already Done

- ✅ Git repository initialized
- ✅ All files committed (112 files, 31,575 lines)
- ✅ `.env` files excluded from Git (protected)
- ✅ Backend prepared for Heroku deployment
- ✅ `Procfile` created
- ✅ `package.json` configured with Heroku scripts

---

## 📦 Part 1: Push to GitHub

### Step 1: Create GitHub Repository

1. **Go to GitHub:** https://github.com/new
2. **Repository details:**
   - **Name:** `WorkHQ` (or your preferred name)
   - **Description:** `Complete HR & Workforce Management System - React Native + Node.js`
   - **Visibility:** Choose Public or Private
   - ⚠️ **Do NOT** initialize with README, .gitignore, or license
3. **Click "Create repository"**

### Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd E:\Playground\WorkHQ

# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/WorkHQ.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR-USERNAME/WorkHQ.git

# Push to GitHub
git push -u origin master
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

### Step 3: Verify

Go to your GitHub repository URL and verify all files are there (except .env files).

---

## 🌐 Part 2: Deploy Backend to Heroku

### Prerequisites

- **Heroku Account:** Sign up at https://heroku.com (free)
- **Heroku CLI:** Download from https://devcenter.heroku.com/articles/heroku-cli

### Step 1: Install Heroku CLI (if not installed)

**Windows:**
Download and run the installer from: https://devcenter.heroku.com/articles/heroku-cli

**Verify installation:**
```bash
heroku --version
```

### Step 2: Login to Heroku

```bash
heroku login
```

This will open your browser to log in.

### Step 3: Create Heroku App

```bash
cd E:\Playground\WorkHQ

# Create a new Heroku app
heroku create workhq-api

# Or with a custom name:
# heroku create your-custom-name
```

**Note:** The name must be unique across all Heroku apps. If "workhq-api" is taken, choose another name.

### Step 4: Set Environment Variables

Set all your environment variables on Heroku:

```bash
# Database URL (from Supabase)
heroku config:set DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres?schema=public"

# Supabase credentials
heroku config:set SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
heroku config:set SUPABASE_ANON_KEY="your-anon-key"
heroku config:set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Server config
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your-secure-jwt-secret-change-this"
```

**Get your values from:**
- `Back/.env` (your local file - DON'T COMMIT THIS!)
- Or from Supabase Dashboard → Settings → API

**Verify all variables are set:**
```bash
heroku config
```

### Step 5: Deploy to Heroku

There are two options:

#### Option A: Deploy from Local Git (Recommended)

```bash
# Add Heroku remote (if not already added)
heroku git:remote -a workhq-api

# Push only the Back folder to Heroku
git subtree push --prefix Back heroku master
```

#### Option B: Connect to GitHub and Deploy

```bash
# Connect Heroku to your GitHub repo
heroku git:remote -a workhq-api

# Or use Heroku Dashboard:
# 1. Go to https://dashboard.heroku.com/apps/workhq-api/deploy/github
# 2. Connect your GitHub account
# 3. Search for your repository
# 4. Enable automatic deploys (optional)
# 5. Click "Deploy Branch"
```

### Step 6: Verify Deployment

```bash
# Check if app is running
heroku logs --tail

# Open the app in browser
heroku open

# Test the health endpoint
curl https://workhq-api.herokuapp.com/health
```

You should see:
```json
{
  "status": "OK",
  "message": "WorkHQ API is running",
  "timestamp": "..."
}
```

---

## 🔧 Troubleshooting Heroku Deployment

### Issue: "Application Error"

**Check logs:**
```bash
heroku logs --tail
```

**Common causes:**
1. Missing environment variables
2. Database connection issues
3. Build errors

**Fix:**
```bash
# Verify all config vars are set
heroku config

# Restart the app
heroku restart
```

### Issue: "Cannot connect to database"

**Check DATABASE_URL:**
```bash
heroku config:get DATABASE_URL
```

Make sure it's your Supabase connection string (not local PostgreSQL).

### Issue: "Prisma client not generated"

This should be automatic via `heroku-postbuild` script, but if it fails:

```bash
# Run build manually
heroku run npm run build

# Check build logs
heroku logs --tail | grep prisma
```

### Issue: "Port binding error"

Heroku automatically assigns a port via `process.env.PORT`. Our code already handles this:
```typescript
const PORT = process.env.PORT || 5000;
```

If you see port errors, check `Back/src/index.ts` has this line.

---

## 📱 Part 3: Update Frontend

Once your backend is deployed to Heroku, update your frontend to use it:

### Step 1: Get Your Heroku URL

```bash
heroku info
```

Your app URL will be something like: `https://workhq-api.herokuapp.com`

### Step 2: Update Frontend .env

**For Production Build:**

Create `front/.env.production`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_BACKEND_API_URL=https://workhq-api.herokuapp.com
```

**For Testing with Expo Go:**

Update `front/.env`:
```env
# Keep Supabase the same
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Use Heroku backend
EXPO_PUBLIC_BACKEND_API_URL=https://workhq-api.herokuapp.com
```

### Step 3: Test

```bash
cd front
npx expo start --clear
```

Open the app and try logging in. It should now connect to your Heroku backend!

---

## 🎉 Deployment Complete!

You now have:

✅ **GitHub Repository** - Code safely backed up  
✅ **Heroku Backend** - API running 24/7 at https://workhq-api.herokuapp.com  
✅ **Frontend Updated** - Mobile app connects to cloud backend  
✅ **Supabase Database** - PostgreSQL database hosted  

---

## 📊 Your URLs

| Service | URL |
|---------|-----|
| **GitHub Repo** | `https://github.com/YOUR-USERNAME/WorkHQ` |
| **Heroku API** | `https://workhq-api.herokuapp.com` |
| **API Health** | `https://workhq-api.herokuapp.com/health` |
| **Supabase** | `https://YOUR-PROJECT.supabase.co` |

---

## 🔐 Security Checklist

- ✅ .env files NOT committed to Git
- ✅ Environment variables set on Heroku
- ✅ JWT_SECRET changed for production
- ✅ Supabase service key kept secure
- ✅ CORS configured in backend

---

## 🔄 Future Updates

### Update Backend Code

```bash
# Make changes to Back/ folder
git add .
git commit -m "Update backend: your changes"
git push origin master

# Deploy to Heroku
git subtree push --prefix Back heroku master

# Or if using GitHub auto-deploy, just push:
git push origin master
```

### Update Frontend Code

```bash
# Make changes to front/ folder
git add .
git commit -m "Update frontend: your changes"
git push origin master

# Test locally
cd front
npx expo start
```

---

## 💡 Pro Tips

1. **Enable GitHub Actions** for automated testing
2. **Set up Heroku Review Apps** for PR previews
3. **Monitor Heroku logs** with papertrail add-on
4. **Use Heroku Scheduler** for cron jobs
5. **Upgrade Heroku plan** if you need:
   - Custom domain
   - More dynos
   - Better performance

---

## 🆘 Need Help?

**Heroku Documentation:**
- Getting Started: https://devcenter.heroku.com/articles/getting-started-with-nodejs
- Config Vars: https://devcenter.heroku.com/articles/config-vars
- Logs: https://devcenter.heroku.com/articles/logging

**GitHub Documentation:**
- Creating a Repo: https://docs.github.com/en/get-started/quickstart/create-a-repo
- Pushing Code: https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository

---

**🎊 Congratulations! Your app is now deployed to the cloud!**


