# 🚀 Quick Deployment Commands

Quick reference for deploying WorkHQ to GitHub and Heroku.

---

## 📦 GitHub Deployment

### 1. Create GitHub Repository
Go to: https://github.com/new

### 2. Push to GitHub

```bash
# Navigate to project
cd E:\Playground\WorkHQ

# Add remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/WorkHQ.git

# Push code
git push -u origin master
```

✅ **Done!** Your code is now on GitHub.

---

## 🌐 Heroku Deployment

### 1. Login to Heroku

```bash
heroku login
```

### 2. Create Heroku App

```bash
# Create app with custom name
heroku create workhq-api

# Or let Heroku generate a name
heroku create
```

### 3. Set Environment Variables

```bash
# Set all variables (get values from Back/.env)
heroku config:set \
  DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres" \
  SUPABASE_URL="https://PROJECT.supabase.co" \
  SUPABASE_ANON_KEY="your-anon-key" \
  SUPABASE_SERVICE_ROLE_KEY="your-service-key" \
  NODE_ENV=production \
  JWT_SECRET="your-production-secret"
```

### 4. Deploy Backend

```bash
# Add Heroku remote
heroku git:remote -a workhq-api

# Deploy (only Back folder)
git subtree push --prefix Back heroku master
```

### 5. Verify Deployment

```bash
# Check logs
heroku logs --tail

# Open in browser
heroku open

# Test health endpoint
curl https://workhq-api.herokuapp.com/health
```

✅ **Done!** Your backend is live on Heroku.

---

## 📱 Update Frontend

### Edit `front/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_BACKEND_API_URL=https://workhq-api.herokuapp.com
```

### Restart Expo

```bash
cd front
npx expo start --clear
```

---

## 🔄 Future Updates

### Update and Redeploy

```bash
# Make changes
git add .
git commit -m "Your update message"
git push origin master

# Deploy to Heroku
git subtree push --prefix Back heroku master
```

---

## 🛠️ Useful Commands

### GitHub

```bash
# Check status
git status

# View remotes
git remote -v

# Pull latest
git pull origin master

# Create new branch
git checkout -b feature-name
```

### Heroku

```bash
# View apps
heroku apps

# View config
heroku config

# View logs (live)
heroku logs --tail

# Run command on Heroku
heroku run npm run generate

# Restart app
heroku restart

# Check app info
heroku info

# Scale dynos
heroku ps:scale web=1

# Open dashboard
heroku open

# SSH into dyno
heroku run bash
```

### Database (Prisma on Heroku)

```bash
# Generate Prisma client
heroku run npx prisma generate

# Check database
heroku run npx prisma db pull

# View database URL
heroku config:get DATABASE_URL
```

---

## 🆘 Troubleshooting

### Heroku App Won't Start

```bash
# Check logs
heroku logs --tail

# Check config vars
heroku config

# Restart app
heroku restart

# Rebuild
git commit --allow-empty -m "Rebuild"
git subtree push --prefix Back heroku master
```

### Can't Push to Heroku

```bash
# Check Heroku remote
git remote -v

# Re-add remote
heroku git:remote -a workhq-api

# Force push (use carefully!)
git push heroku master --force
```

### Database Connection Fails

```bash
# Verify DATABASE_URL
heroku config:get DATABASE_URL

# Test from Heroku dyno
heroku run node
# Then in Node REPL:
# require('dotenv').config()
# console.log(process.env.DATABASE_URL)
```

---

## 🔐 Security Notes

- ✅ Never commit .env files
- ✅ Use strong JWT_SECRET in production
- ✅ Keep Supabase service role key secret
- ✅ Regularly rotate secrets
- ✅ Enable 2FA on GitHub and Heroku

---

## 📊 Your Deployment

| Item | Value |
|------|-------|
| **GitHub** | `https://github.com/YOUR-USERNAME/WorkHQ` |
| **Heroku App** | `workhq-api` |
| **API URL** | `https://workhq-api.herokuapp.com` |
| **Health Check** | `https://workhq-api.herokuapp.com/health` |

---

**For detailed instructions, see `GITHUB_HEROKU_DEPLOYMENT.md`**


