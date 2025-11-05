# 🚀 WorkHQ Deployment Guide

## Pre-Deployment Checklist

### ✅ Backend
- [x] All API endpoints tested
- [x] Database schema finalized
- [x] RLS policies optimized
- [x] Foreign keys indexed
- [x] Environment variables configured
- [x] Error handling implemented
- [x] Authentication working
- [x] Authorization middleware in place

### ✅ Frontend
- [x] All screens implemented
- [x] Navigation working
- [x] Theme system functional
- [x] API integration complete
- [x] Loading states implemented
- [x] Error handling in place
- [x] Dark mode working

---

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Sign up at Railway.app**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Railway project**
   ```bash
   cd Back
   railway init
   ```

3. **Set environment variables**
   ```bash
   railway variables set DATABASE_URL="your_supabase_pooling_url"
   railway variables set DIRECT_URL="your_supabase_direct_url"
   railway variables set SUPABASE_URL="your_supabase_url"
   railway variables set SUPABASE_SERVICE_ROLE_KEY="your_key"
   railway variables set SUPABASE_ANON_KEY="your_anon_key"
   railway variables set JWT_SECRET="your_secret"
   railway variables set NODE_ENV="production"
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get deployment URL**
   ```bash
   railway domain
   ```

### Option 2: Render

1. **Create account at Render.com**

2. **Create new Web Service**
   - Connect your GitHub repository
   - Set build command: `cd Back && npm install && npm run build`
   - Set start command: `cd Back && npm start`

3. **Add environment variables** (same as above)

4. **Deploy** - Render will automatically deploy

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   cd Back
   heroku create workhq-api
   ```

3. **Set environment variables**
   ```bash
   heroku config:set DATABASE_URL="your_url"
   # ... set all other variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Database Setup (Supabase)

### 1. Create Tables

Run the SQL scripts in order:

```sql
-- 1. Create tables
-- Run: Back/prisma/create-tables.sql

-- 2. Apply RLS policies
-- Run: Back/prisma/fix-all-rls-warnings.sql

-- 3. Add indexes
-- Run: Back/prisma/add-foreign-key-indexes.sql

-- 4. Grant service role bypass
-- Run: Back/prisma/disable-rls-for-service.sql
```

### 2. Create Initial Data

**Create Leave Types:**
```sql
INSERT INTO "LeaveType" (id, name, description) VALUES
  (gen_random_uuid(), 'Casual Leave', 'For personal matters'),
  (gen_random_uuid(), 'Sick Leave', 'For medical reasons'),
  (gen_random_uuid(), 'Earned Leave', 'Accrued leave'),
  (gen_random_uuid(), 'Maternity Leave', 'For maternity'),
  (gen_random_uuid(), 'Paternity Leave', 'For paternity');
```

**Create Office Location:**
```sql
INSERT INTO "Location" (id, name, latitude, longitude, "radiusMeters") VALUES
  (gen_random_uuid(), 'Head Office', 28.6139, 77.2090, 100);
```

### 3. Create Admin User

1. **Create user in Supabase Auth Dashboard**
   - Go to Authentication > Users
   - Add user manually
   - Note the User ID

2. **Create User and Employee records:**
```sql
-- Replace 'auth-user-id' with actual Supabase Auth User ID
INSERT INTO "User" (id, "supabaseAuthId", email, "fullName", role) VALUES
  (gen_random_uuid(), 'auth-user-id', 'admin@workhq.com', 'Admin User', 'ADMIN');

-- Get the User ID from above insert
INSERT INTO "Employee" (id, "userId", "employeeCode", salary, "joinDate") VALUES
  (gen_random_uuid(), 'user-id-from-above', 'EMP001', 50000, CURRENT_DATE);
```

---

## Frontend Deployment

### Option 1: EAS Build (Recommended for Production)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   cd front
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Update environment variables**
   - Create `eas.json` with environment variables
   - Or use EAS Secrets

5. **Build for Android**
   ```bash
   eas build --platform android --profile production
   ```

6. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

7. **Submit to stores**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

### Option 2: Expo Development Build

For testing:
```bash
cd front
npx expo start
```

---

## Environment Variables

### Backend Production

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?pgbouncer=true
DIRECT_URL=postgresql://user:pass@host:5432/db
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_strong_random_secret
PORT=5000
NODE_ENV=production
```

### Frontend Production

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_BACKEND_API_URL=https://your-api.railway.app/api
```

---

## Google Maps Configuration

### 1. Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create credentials (API Key)
5. Restrict API key to your app

### 2. Update app.json

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY"
        }
      }
    }
  }
}
```

---

## Testing

### Backend Testing

```bash
cd Back
npm run dev

# Test endpoints
curl http://localhost:5000/health
```

### Frontend Testing

```bash
cd front
npx expo start

# Run on device
npx expo start --android
npx expo start --ios
```

---

## Monitoring & Maintenance

### 1. Backend Monitoring

- Set up error tracking (Sentry)
- Monitor API response times
- Database query performance
- Server uptime

### 2. Database Maintenance

- Regular backups (Supabase automatic)
- Monitor query performance
- Check unused indexes
- Optimize slow queries

### 3. App Updates

- Monitor app crashes
- User feedback
- Performance metrics
- App store reviews

---

## Security Checklist

- [x] HTTPS enabled
- [x] Environment variables secured
- [x] JWT tokens validated
- [x] RLS policies enabled
- [x] Input validation
- [x] Rate limiting (recommended)
- [x] CORS configured
- [x] SQL injection prevention (Prisma)

---

## Troubleshooting

### Backend Issues

**Connection Timeout**
- Check DATABASE_URL format
- Verify Supabase project is active
- Check connection pooling settings

**Authentication Errors**
- Verify JWT_SECRET is set
- Check SUPABASE_SERVICE_ROLE_KEY
- Ensure middleware is applied correctly

### Frontend Issues

**Map Not Loading**
- Verify Google Maps API key
- Check API key restrictions
- Ensure Maps SDK is enabled

**API Calls Failing**
- Check BACKEND_API_URL
- Verify backend is running
- Check CORS settings

---

## Performance Tips

### Backend
1. Use connection pooling (already configured)
2. Add caching layer (Redis) for frequent queries
3. Optimize database queries
4. Use CDN for static assets

### Frontend
1. Implement image caching
2. Use FlatList optimization
3. Lazy load heavy screens
4. Minimize re-renders

---

## Backup & Recovery

### Database Backups

Supabase provides automatic backups:
- Daily backups (retained for 7 days)
- Manual backups via dashboard
- Point-in-time recovery (paid plans)

### Manual Backup

```bash
# Export database
pg_dump "your_database_url" > backup.sql

# Restore
psql "your_database_url" < backup.sql
```

---

## Post-Deployment

1. **Test all features**
   - Authentication
   - Attendance check-in/out
   - Leave application
   - Payroll viewing
   - Profile management

2. **Monitor for 24 hours**
   - Check error logs
   - Monitor API response times
   - Verify database performance

3. **User Training**
   - Create user documentation
   - Conduct training sessions
   - Provide support channels

---

## Support & Resources

- **Expo Docs:** https://docs.expo.dev/
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Railway Docs:** https://docs.railway.app/

---

## Success Metrics

Track these KPIs:
- App uptime (target: 99.9%)
- API response time (target: <500ms)
- User adoption rate
- Feature usage statistics
- Error rate (target: <1%)

---

🎉 **Your WorkHQ application is ready for production!**

