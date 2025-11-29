# APK Build Guide for WorkHQ

This guide explains how to build a production APK for the WorkHQ mobile app using Expo EAS Build.

## Prerequisites

1. **EAS CLI installed**
   ```powershell
   npm install -g eas-cli
   ```

2. **Expo account** - Sign up at https://expo.dev if you don't have one

3. **EAS Build configured** - Already done in this project (see `eas.json`)

## Environment Variables

The following environment variables are **automatically embedded** in production builds via `eas.json`:

- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `EXPO_PUBLIC_BACKEND_API_URL` - Your backend API URL (default: https://workhq-api.vercel.app)

**Note**: You don't need a `.env` file for production builds - the values in `eas.json` will be used.

## Building the APK

### 1. Login to EAS

```powershell
cd e:\Playground\workHQ\front
eas login
```

### 2. Build Production APK

```powershell
eas build --profile production --platform android
```

This will:
- Upload your code to EAS servers
- Build the APK with embedded environment variables
- Provide a download link when complete (usually takes 10-20 minutes)

### 3. Build Preview APK (for testing)

For faster testing builds:

```powershell
eas build --profile preview --platform android
```

## Downloading and Installing

1. **Download the APK**
   - After the build completes, EAS will provide a download link
   - You can also find it at https://expo.dev/accounts/rifu/projects/workhq/builds

2. **Install on Android Device**
   - Transfer the APK to your Android device
   - Enable "Install from Unknown Sources" in Settings
   - Tap the APK file to install

## Troubleshooting

### Pages Loading but Showing Errors

**Symptom**: App loads but pages show "Prisma error" or connection errors

**Causes**:
1. Backend API is not accessible
2. Backend URL is incorrect
3. Network connectivity issues

**Solutions**:

1. **Verify Backend URL**
   - Check that `EXPO_PUBLIC_BACKEND_API_URL` in `eas.json` is correct
   - Test the URL in a browser: `https://workhq-api.vercel.app/api/health`

2. **Check Backend Deployment**
   - Ensure your backend is deployed and running on Vercel
   - Check Vercel logs for any errors
   - Verify Prisma database connection in backend

3. **Test Network Connectivity**
   - Ensure your device has internet connection
   - Try accessing other apps/websites
   - Check if you're behind a firewall/VPN

### App Crashes on Startup

**Symptom**: App crashes immediately after opening

**Solutions**:
1. Check if environment variables are set in `eas.json`
2. Rebuild the APK after making changes
3. Check device logs using `adb logcat`

### Maps Not Working

**Symptom**: Attendance page shows blank map or errors

**Solutions**:
1. Verify Google Maps API key is set in `app.json`
2. Enable required APIs in Google Cloud Console:
   - Maps SDK for Android
   - Places API
3. Check API key restrictions

## Testing Checklist

Before distributing the APK, test these features:

- [ ] App launches successfully
- [ ] Login/Authentication works
- [ ] Dashboard loads
- [ ] Attendance page loads (with map)
- [ ] Leave application works
- [ ] Payroll/Payslips load
- [ ] Profile page works
- [ ] Offline mode shows appropriate messages
- [ ] Error messages are user-friendly

## Production Deployment

### Google Play Store

To publish to Google Play Store:

```powershell
eas build --profile production --platform android
eas submit --platform android
```

You'll need:
- Google Play Developer account ($25 one-time fee)
- App signing key (EAS can manage this)
- Store listing information

### Internal Distribution

For internal testing without Play Store:

1. Build with preview or production profile
2. Share the APK download link with testers
3. Testers install directly on their devices

## Updating Environment Variables

If you need to change backend URL or other config:

1. Edit `eas.json` → `build.production.env` section
2. Rebuild the APK with `eas build`
3. No code changes needed - just rebuild

## Build Profiles

This project has 3 build profiles:

- **development** - For local development with Expo Go
- **preview** - For testing APK builds quickly
- **production** - For final production APK/AAB

## Support

If you encounter issues:

1. Check EAS build logs: https://expo.dev/accounts/rifu/projects/workhq/builds
2. Review backend logs on Vercel
3. Check device logs with `adb logcat`
4. Verify all environment variables are correct

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Application Services](https://expo.dev/eas)
- [Android APK Distribution](https://docs.expo.dev/distribution/introduction/)
