# 🚀 Vercel Deployment - WorkHQ Backend

## ✅ Deployment Complete

The WorkHQ backend has been successfully deployed to Vercel!

**Production URL:** `https://workhq-fiu5kf8gx-rifus-projects-7770b67a.vercel.app`

---

## 📋 What Was Done

### 1. Created Vercel Configuration
- Added `Back/vercel.json` with proper build settings
- Added `Back/.vercelignore` to exclude unnecessary files

### 2. Deployed to Vercel
```bash
cd Back
npm run build
vercel --prod --yes
```

### 3. Updated All URLs
Updated the backend URL throughout the project:
- ✅ `front/env.example` - Updated production URL
- ✅ `front/services/api.ts` - Updated fallback URL
- ✅ `Back/package.json` - Changed heroku-postbuild to vercel-build
- ✅ `Back/src/index.ts` - Updated comments for Vercel
- ✅ Documentation files updated

---

## 🔧 Setting Up Environment Variables

The backend needs these environment variables to work on Vercel:

### Required Variables
Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

Add the following:

```env
DATABASE_URL=postgresql://postgres:zptVbRfX0oAunTQj@db.rdkgfezrowfnlrbtiekn.supabase.co:5432/postgres?pgbouncer=true
SUPABASE_URL=https://rdkgfezrowfnlrbtiekn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTUyNzEsImV4cCI6MjA3NzQ3MTI3MX0.UV_PmsUcpsrOmM5bn4Y8xrlFJCRvHX1dJOieykXwDIs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg5NTI3MSwiZXhwIjoyMDc3NDcxMjcxfQ.UEJ8QSiFsVrbwmVG3s4kl3asuurFkaFvGl8jjHVtBR4
JWT_SECRET=local-dev-secret-change-in-production-12345
NODE_ENV=production
PORT=5000
```

**Important:** After adding environment variables, redeploy:
```bash
cd Back
vercel --prod --yes
```

---

## 🧪 Testing the Deployment

### Test Health Endpoint
```bash
curl https://workhq-fiu5kf8gx-rifus-projects-7770b67a.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "WorkHQ API is running",
  "timestamp": "2025-11-17T..."
}
```

### Test API Endpoints
```bash
# Get leave types
curl https://workhq-fiu5kf8gx-rifus-projects-7770b67a.vercel.app/api/leave/types

# Other endpoints require authentication
```

---

## 🔄 Redeploying

### Method 1: CLI (Recommended)
```bash
cd Back
npm run build
vercel --prod --yes
```

### Method 2: Git Push
If you connect the project to GitHub in Vercel:
- Every push to main branch auto-deploys
- Pull requests create preview deployments

---

## 📱 Using in Frontend

The frontend has already been updated to use the Vercel URL:

### For Production Builds
The `front/env.example` and `front/services/api.ts` now point to:
```
https://workhq-fiu5kf8gx-rifus-projects-7770b67a.vercel.app
```

### For Local Development
Override with environment variable:
```env
# front/.env
EXPO_PUBLIC_BACKEND_API_URL=http://localhost:5000
```

---

## 🎯 Vercel Dashboard Features

Access your deployment at: https://vercel.com

### Key Features:
- **Deployments:** View all deployments and logs
- **Functions:** Monitor API response times
- **Logs:** Real-time function logs
- **Analytics:** Traffic and performance metrics
- **Domains:** Add custom domain
- **Environment Variables:** Manage secrets

---

## 🔍 Monitoring

### View Logs
```bash
vercel logs workhq-fiu5kf8gx-rifus-projects-7770b67a.vercel.app
```

### Check Deployment Status
```bash
vercel ls
```

---

## ⚠️ Important Notes

### Serverless Functions
Vercel runs your app as serverless functions:
- **Cold start:** First request may be slower (~1-2 seconds)
- **Timeout:** 10 seconds for free tier, 60 seconds for pro
- **Memory:** 1024MB default

### Database Connections
- Use Supabase connection pooling URL for Vercel
- Serverless functions need efficient connection handling
- Prisma is configured for this

### Limitations (Free Tier)
- 100GB bandwidth/month
- 100 hours of serverless function execution
- 6000 builds/month
- No custom domains (requires pro)

---

## 🚀 Next Steps

1. **Set Environment Variables** in Vercel Dashboard
2. **Test All Endpoints** to ensure they work
3. **Update Frontend .env** if needed
4. **Build Mobile App** with production backend URL
5. **Monitor Performance** in Vercel Dashboard

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel CLI Docs:** https://vercel.com/docs/cli
- **Community:** https://github.com/vercel/vercel/discussions

---

## ✅ Deployment Checklist

- [x] Created vercel.json configuration
- [x] Built backend successfully
- [x] Deployed to Vercel
- [x] Got production URL
- [x] Updated frontend URLs
- [x] Updated documentation
- [ ] Set environment variables in Vercel Dashboard
- [ ] Test all API endpoints
- [ ] Build mobile app with production URL
- [ ] Monitor for 24 hours

**Status:** Backend deployed, environment variables need to be set in Vercel Dashboard! 🎉

