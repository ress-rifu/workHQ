# Quick Reference - Building APK

## Build Production APK

```powershell
cd e:\Playground\workHQ\front
eas build --profile production --platform android
```

## Build Preview APK (Faster for Testing)

```powershell
eas build --profile preview --platform android
```

## Check Build Status

Visit: https://expo.dev/accounts/rifu/projects/workhq/builds

## Common Issues & Quick Fixes

### "Prisma error" or Connection Errors

**Cause**: Backend not accessible or environment variables missing

**Fix**:
1. Verify backend URL in `eas.json` is correct
2. Test backend: `https://workhq-api.vercel.app/api/health`
3. Check Vercel deployment status
4. Rebuild APK after fixing

### Pages Load but Show Errors

**Cause**: Backend API issues

**Fix**:
1. Check backend deployment on Vercel
2. Verify database connection (Prisma)
3. Check backend logs for errors
4. Test API endpoints manually

### App Crashes on Startup

**Cause**: Missing environment variables

**Fix**:
1. Check `eas.json` has all required env vars
2. Rebuild APK: `eas build --profile production --platform android`

### Maps Not Working

**Cause**: Google Maps API key issue

**Fix**:
1. Verify API key in `app.json`
2. Enable Maps SDK for Android in Google Cloud Console
3. Check API key restrictions

## Environment Variables (in eas.json)

Required for production builds:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_BACKEND_API_URL`

## Testing Checklist

- [ ] App launches
- [ ] Login works
- [ ] Dashboard loads
- [ ] Attendance (with map) works
- [ ] Leave application works
- [ ] Payroll loads
- [ ] Profile works
- [ ] Offline shows proper messages

## Support

- Build logs: https://expo.dev/accounts/rifu/projects/workhq/builds
- Backend logs: https://vercel.com/dashboard
- Full guide: See `APK_BUILD_GUIDE.md`
