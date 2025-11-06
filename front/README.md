# WorkHQ Mobile App

Mobile application for WorkHQ - HR Management System

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Authentication**: Supabase Auth
- **Maps**: React Native Maps
- **Location**: Expo Location

## Features

- ✅ User Authentication (Login, Forgot Password)
- 📍 GPS-based Attendance Tracking with Geofencing
- 📝 Leave Management (Apply, View Balance, History)
- 💰 Payroll Information
- 👤 Profile Management
- 🌓 Dark Mode Support
- 📱 Modern UI with Inter Font

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI (recommended: `npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `EXPO_PUBLIC_BACKEND_API_URL`: Your backend API URL

## Development

Start the development server:
```bash
npx expo start
```

### Run on Different Platforms

- **iOS**: Press `i` in the terminal or run `npm run ios`
- **Android**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`

## Project Structure

```
front/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── forgot-password.tsx
│   ├── (app)/             # Main app screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── attendance.tsx
│   │   ├── leave.tsx
│   │   ├── payroll.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Splash/Loading screen
├── components/            # Reusable components
├── contexts/              # React contexts
├── services/              # API services
├── hooks/                 # Custom hooks
├── constants/             # Theme, typography constants
├── lib/                   # Supabase client config
└── assets/               # Images, fonts, etc.
```

## Key Screens

### Authentication Flow
- **Login**: Email/password authentication
- **Forgot Password**: Password reset via email

### Main App
- **Dashboard**: Quick overview and actions
- **Attendance**: Check-in/out with GPS validation
- **Leave**: Apply for leave, view balance and history
- **Payroll**: View salary details and payslips
- **Profile**: Manage user profile and settings

## Navigation

The app uses Expo Router for file-based navigation:
- Route groups: `(auth)` and `(app)`
- Tab navigation for main app screens
- Stack navigation within route groups

## Environment Variables

Required environment variables (see `.env.example`):
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_BACKEND_API_URL`: Backend API URL

## Building for Production

### Using EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure EAS:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Build for Android:
```bash
eas build --platform android
```

## Troubleshooting

### Common Issues

**Fonts not loading**
- Make sure fonts are installed: `npx expo install @expo-google-fonts/inter expo-font`

**Location not working**
- Check permissions in `app.json`
- Install location package: `npx expo install expo-location`

**Supabase errors**
- Verify environment variables are set correctly
- Check Supabase project is active

## License

ISC

