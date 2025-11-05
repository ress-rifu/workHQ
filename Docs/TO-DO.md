# WorkHQ: Complete Build Roadmap

**Project:** WorkHQ - Enterprise HR & Workforce Management Application  
**Tech Stack:** React Native (Expo), Node.js, TypeScript, Prisma, Supabase, PostgreSQL  
**Start Date:** November 5, 2025

---

## 📋 Table of Contents

1. [Phase 1: Project Setup & Foundation](#phase-1-project-setup--foundation)
2. [Phase 2: Authentication & User Roles](#phase-2-authentication--user-roles)
3. [Phase 3: UI Foundation & Theming](#phase-3-ui-foundation--theming)
4. [Phase 4: Core Module - Profile](#phase-4-core-module---profile)
5. [Phase 5: Core Module - Leave Management](#phase-5-core-module---leave-management)
6. [Phase 6: Core Module - Attendance System](#phase-6-core-module---attendance-system)
7. [Phase 7: Core Module - Payroll](#phase-7-core-module---payroll)
8. [Phase 8: Main Dashboard & Navigation](#phase-8-main-dashboard--navigation)
9. [Phase 9: Admin/HR Features](#phase-9-adminhr-features)
10. [Phase 10: Final Polish & Testing](#phase-10-final-polish--testing)

---

## Phase 1: Project Setup & Foundation

### 🎯 Objectives
- Initialize frontend and backend projects
- Set up database connection
- Configure development environment

### Frontend Tasks (React Native)

- [ ] **1.1** Initialize Expo project with TypeScript template
  ```bash
  npx create-expo-app@latest WorkHQ --template typescript
  ```

- [ ] **1.2** Install and configure expo-router
  ```bash
  npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
  ```

- [ ] **1.3** Set up file-based routing structure
  - Create `app/` directory
  - Configure `app.json` for expo-router

- [ ] **1.4** Install and configure fonts
  ```bash
  npx expo install @expo-google-fonts/inter expo-font
  ```

- [ ] **1.5** Create `.env` file for environment variables
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `BACKEND_API_URL`

- [ ] **1.6** Install Supabase client
  ```bash
  npm install @supabase/supabase-js
  ```

### Backend Tasks (Node.js)

- [ ] **1.7** Initialize Node.js project with TypeScript
  ```bash
  mkdir workhq-backend && cd workhq-backend
  npm init -y
  npm install typescript @types/node ts-node nodemon --save-dev
  npx tsc --init
  ```

- [ ] **1.8** Install core dependencies
  ```bash
  npm install express cors dotenv
  npm install @types/express @types/cors --save-dev
  ```

- [ ] **1.9** Install Prisma
  ```bash
  npm install prisma @prisma/client --save-dev
  npx prisma init
  ```

- [ ] **1.10** Configure TypeScript for Node.js
  - Update `tsconfig.json`
  - Create `src/` directory structure

- [ ] **1.11** Set up basic Express server
  - Create `src/index.ts`
  - Configure middleware (cors, json)
  - Add health check endpoint

### Database Setup (Supabase)

- [ ] **1.12** Create new Supabase project
  - Navigate to [supabase.com](https://supabase.com)
  - Create project and note credentials

- [ ] **1.13** Configure Prisma schema
  - Update `DATABASE_URL` in `.env`
  - Configure `schema.prisma` with PostgreSQL provider

- [ ] **1.14** Test database connection
  ```bash
  npx prisma db pull
  ```

### Development Environment

- [ ] **1.15** Create `README.md` with setup instructions
- [ ] **1.16** Create `.gitignore` files for both frontend and backend
- [ ] **1.17** Initialize Git repository
- [ ] **1.18** Set up ESLint and Prettier (optional but recommended)

### ✅ Phase 1 Completion Checklist
- [ ] Frontend Expo app runs successfully
- [ ] Backend server starts without errors
- [ ] Database connection established
- [ ] Environment variables configured

---

## Phase 2: Authentication & User Roles

### 🎯 Objectives
- Implement user authentication flow
- Set up role-based access control
- Create auth screens and context

### Backend: Prisma Schema

- [ ] **2.1** Define User model in `schema.prisma`
  ```prisma
  model User {
    id              String   @id @default(uuid())
    supabase_auth_id String  @unique
    email           String   @unique
    role            UserRole @default(EMPLOYEE)
    employeeId      String?  @unique
    firstName       String?
    lastName        String?
    department      String?
    designation     String?
    contactPhone    String?
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
  }

  enum UserRole {
    ADMIN
    HR
    EMPLOYEE
  }
  ```

- [ ] **2.2** Run Prisma migration
  ```bash
  npx prisma migrate dev --name init_user_model
  ```

- [ ] **2.3** Generate Prisma Client
  ```bash
  npx prisma generate
  ```

### Backend: Auth Middleware & Endpoints

- [ ] **2.4** Create auth middleware
  - File: `src/middleware/auth.ts`
  - Verify Supabase JWT tokens
  - Attach user data to request object

- [ ] **2.5** Create role-based middleware
  - File: `src/middleware/authorize.ts`
  - Check user roles (ADMIN, HR, EMPLOYEE)

- [ ] **2.6** Create auth routes
  - File: `src/routes/auth.routes.ts`
  - `POST /api/auth/register` - Create user profile after Supabase signup
  - `GET /api/auth/profile` - Get user profile by supabase_auth_id

- [ ] **2.7** Implement user service layer
  - File: `src/services/user.service.ts`
  - Functions for CRUD operations on User model

### Frontend: Auth Screens

- [ ] **2.8** Install Supabase client dependencies (if not done)
  ```bash
  npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
  ```

- [ ] **2.9** Create Supabase client configuration
  - File: `lib/supabase.ts`
  - Initialize with environment variables

- [ ] **2.10** Create Login Screen
  - File: `app/(auth)/login.tsx`
  - Email and password inputs
  - "Forgot Password?" link
  - Login button with loading state

- [ ] **2.11** Create Forgot Password Screen
  - File: `app/(auth)/forgot-password.tsx`
  - Email input
  - Submit button
  - Password reset logic

- [ ] **2.12** Create Sign Up Screen (optional)
  - File: `app/(auth)/signup.tsx`
  - Form for new user registration

### Frontend: Authentication Context

- [ ] **2.13** Create AuthContext
  - File: `contexts/AuthContext.tsx`
  - Manage user session state
  - Store user profile (including role)
  - Provide login, logout, resetPassword functions

- [ ] **2.14** Implement session persistence
  - Use AsyncStorage to persist session
  - Auto-login on app restart if session valid

- [ ] **2.15** Create auth helpers
  - File: `lib/auth.ts`
  - `signIn(email, password)`
  - `signOut()`
  - `resetPassword(email)`
  - `getUserProfile()`

### Frontend: Routing & Navigation Guards

- [ ] **2.16** Set up route groups
  - Create `app/(auth)/` group for auth screens
  - Create `app/(app)/` group for authenticated screens

- [ ] **2.17** Implement root layout with redirect logic
  - File: `app/_layout.tsx`
  - Redirect to `(app)` if authenticated
  - Redirect to `(auth)` if not authenticated

- [ ] **2.18** Create auth layout
  - File: `app/(auth)/_layout.tsx`
  - Stack navigator for auth screens

- [ ] **2.19** Create loading/splash screen
  - File: `app/index.tsx`
  - Show while checking auth state

### ✅ Phase 2 Completion Checklist
- [ ] Users can register and login
- [ ] Session persists across app restarts
- [ ] Password reset flow works
- [ ] User profile fetched from backend after login
- [ ] Role-based access control working

---

## Phase 3: UI Foundation & Theming ✅ COMPLETE

### 🎯 Objectives
- Create design system with consistent styling
- Implement dark mode support
- Build reusable UI components

### Theme Configuration

- [ ] **3.1** Create theme constants
  - File: `constants/Theme.ts`
  - Define color palettes (light & dark)
  - Define spacing units (4, 8, 12, 16, 24, 32, 40, 48)
  - Define border radius values
  - Define shadow/elevation styles

- [ ] **3.2** Define typography system
  - File: `constants/Typography.ts`
  - Font families (Inter: Regular, Medium, SemiBold, Bold)
  - Font sizes (12, 14, 16, 18, 20, 24, 32, 40)
  - Text styles (h1, h2, h3, body, caption, label)

- [ ] **3.3** Create useTheme hook
  - File: `hooks/useTheme.ts`
  - Use `useColorScheme()` from React Native
  - Return current theme colors and dark mode flag

- [ ] **3.4** Create ThemeProvider (optional)
  - File: `contexts/ThemeContext.tsx`
  - Allow manual theme switching
  - Persist theme preference

### Reusable Components

- [ ] **3.5** Create Button component
  - File: `components/Button.tsx`
  - Variants: primary, secondary, outline, ghost
  - Sizes: small, medium, large
  - States: default, loading, disabled
  - Props: onPress, title, icon, fullWidth

- [ ] **3.6** Create Card component
  - File: `components/Card.tsx`
  - Light shadow/elevation
  - Padding variants
  - Theme-aware background

- [ ] **3.7** Create TextInput component
  - File: `components/TextInput.tsx`
  - Label support
  - Error message display
  - Icon support (left/right)
  - Variants: default, outlined
  - States: default, focused, error, disabled

- [ ] **3.8** Create Modal component
  - File: `components/Modal.tsx`
  - Animated appearance
  - Backdrop with close on tap
  - Header with title and close button
  - Footer with action buttons

- [ ] **3.9** Create SkeletonLoader component
  - File: `components/SkeletonLoader.tsx`
  - Animated shimmer effect
  - Variants: text, circle, rectangle
  - Configurable dimensions

- [ ] **3.10** Create Avatar component
  - File: `components/Avatar.tsx`
  - Support for image and initials
  - Sizes: small, medium, large
  - Online status indicator (optional)

- [ ] **3.11** Create Badge component
  - File: `components/Badge.tsx`
  - Variants: success, warning, error, info
  - Sizes: small, medium

- [ ] **3.12** Create Divider component
  - File: `components/Divider.tsx`
  - Horizontal and vertical variants

- [ ] **3.13** Create EmptyState component
  - File: `components/EmptyState.tsx`
  - Icon, title, description
  - Optional action button

- [ ] **3.14** Create LoadingSpinner component
  - File: `components/LoadingSpinner.tsx`
  - Theme-aware colors
  - Size variants

### Layout Components

- [ ] **3.15** Create Container component
  - File: `components/Container.tsx`
  - Max width and padding
  - Safe area handling

- [ ] **3.16** Create Screen component
  - File: `components/Screen.tsx`
  - Wrapper with safe area
  - Optional scroll view
  - Optional loading state

### Utility Hooks

- [ ] **3.17** Create useForm hook
  - File: `hooks/useForm.ts`
  - Form state management
  - Validation logic

- [ ] **3.18** Create useApi hook
  - File: `hooks/useApi.ts`
  - Handles API calls with loading/error states
  - Automatic error handling

### ✅ Phase 3 Completion Checklist
- [x] Theme system implemented with light/dark mode
- [x] All reusable components created and tested
- [x] Components adapt to theme changes
- [x] Typography system applied globally
- [x] Component library documented

---

## Phase 4: Core Module - Profile

### 🎯 Objectives
- Display and edit user profile information
- Implement logout functionality

### Backend: API Endpoints

- [ ] **4.1** Create profile routes
  - File: `src/routes/profile.routes.ts`
  - `GET /api/profile` - Get logged-in user's profile
  - `PUT /api/profile` - Update profile

- [ ] **4.2** Create profile controller
  - File: `src/controllers/profile.controller.ts`
  - Implement getProfile handler
  - Implement updateProfile handler
  - Add validation for updatable fields

- [ ] **4.3** Update User model if needed
  - Add additional profile fields
  - Run migration if schema changes

### Frontend: Profile Screens

- [ ] **4.4** Create ProfileScreen
  - File: `app/(app)/profile/index.tsx`
  - Fetch user profile data
  - Display user information in cards
  - Show avatar, name, employee ID, department, designation
  - Add "Edit Profile" button
  - Add "Logout" button

- [ ] **4.5** Implement profile data fetching
  - Create API service: `services/profile.service.ts`
  - Function: `getProfile()`
  - Handle loading and error states

- [ ] **4.6** Create EditProfileScreen
  - File: `app/(app)/profile/edit.tsx`
  - Form with editable fields (phone, address, etc.)
  - Validation for phone number format
  - Save button with loading state
  - Success/error feedback

- [ ] **4.7** Implement profile update
  - Add function: `updateProfile(data)`
  - Handle API call with error handling
  - Show success message on update
  - Navigate back to profile screen

- [ ] **4.8** Add logout functionality
  - Call `supabase.auth.signOut()`
  - Clear AuthContext state
  - Clear AsyncStorage
  - Navigate to login screen

### UI Enhancements

- [ ] **4.9** Add profile skeleton loader
  - Show while fetching profile data

- [ ] **4.10** Add profile photo upload (optional)
  - Use expo-image-picker
  - Upload to Supabase Storage
  - Update profile with photo URL

### ✅ Phase 4 Completion Checklist
- [ ] Profile screen displays all user information
- [ ] Users can edit their profile successfully
- [ ] Logout functionality works correctly
- [ ] Loading states and error handling implemented

---

## Phase 5: Core Module - Leave Management ✅ COMPLETE

### 🎯 Objectives
- Implement leave application system
- Display leave balances and history
- Enable leave request submission

### Backend: Prisma Schema

- [ ] **5.1** Define LeaveType model
  ```prisma
  model LeaveType {
    id          String   @id @default(uuid())
    name        String   @unique // e.g., "Casual", "Sick", "Earned"
    description String?
    createdAt   DateTime @default(now())
  }
  ```

- [ ] **5.2** Define LeaveBalance model
  ```prisma
  model LeaveBalance {
    id            String    @id @default(uuid())
    userId        String
    user          User      @relation(fields: [userId], references: [id])
    leaveTypeId   String
    leaveType     LeaveType @relation(fields: [leaveTypeId], references: [id])
    totalDays     Int
    usedDays      Int       @default(0)
    remainingDays Int
    year          Int
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
    
    @@unique([userId, leaveTypeId, year])
  }
  ```

- [ ] **5.3** Define LeaveApplication model
  ```prisma
  model LeaveApplication {
    id          String            @id @default(uuid())
    userId      String
    user        User              @relation(fields: [userId], references: [id])
    leaveTypeId String
    leaveType   LeaveType         @relation(fields: [leaveTypeId], references: [id])
    startDate   DateTime
    endDate     DateTime
    reason      String
    status      LeaveStatus       @default(PENDING)
    remarks     String?
    createdAt   DateTime          @default(now())
    updatedAt   DateTime          @updatedAt
  }

  enum LeaveStatus {
    PENDING
    APPROVED
    REJECTED
  }
  ```

- [ ] **5.4** Run Prisma migration
  ```bash
  npx prisma migrate dev --name add_leave_management
  ```

- [ ] **5.5** Seed initial leave types
  - Create seed script: `prisma/seed.ts`
  - Add default leave types (Casual, Sick, Earned, etc.)

### Backend: API Endpoints

- [ ] **5.6** Create leave routes
  - File: `src/routes/leave.routes.ts`
  - `GET /api/leave/balances` - Get user's leave balances
  - `GET /api/leave/applications` - Get user's leave applications
  - `GET /api/leave/applications/:id` - Get single leave application
  - `POST /api/leave/apply` - Submit new leave application
  - `GET /api/leave/types` - Get all leave types

- [ ] **5.7** Create leave controller
  - File: `src/controllers/leave.controller.ts`
  - Implement all handlers
  - Add validation for date ranges
  - Calculate leave days (excluding weekends/holidays)

- [ ] **5.8** Create leave service layer
  - File: `src/services/leave.service.ts`
  - Business logic for leave calculations
  - Check available balance before approval
  - Update balance when leave is approved

### Frontend: Leave Screens

- [ ] **5.9** Create LeaveDashboardScreen
  - File: `app/(app)/leave/index.tsx`
  - Display leave balance cards (grid layout)
  - Show leave type, total, used, remaining days
  - Display leave history list
  - Add "Apply for Leave" floating button

- [ ] **5.10** Create leave API service
  - File: `services/leave.service.ts`
  - `getLeaveBalances()`
  - `getLeaveApplications()`
  - `applyLeave(data)`
  - `getLeaveTypes()`

- [ ] **5.11** Create ApplyLeaveScreen
  - File: `app/(app)/leave/apply.tsx`
  - Leave type picker (dropdown)
  - Start date picker (DateTimePicker)
  - End date picker (DateTimePicker)
  - Display calculated number of days
  - Common reasons picker (radio buttons)
  - Custom reason text input
  - Submit button

- [ ] **5.12** Install date picker dependencies
  ```bash
  npx expo install @react-native-community/datetimepicker
  ```

- [ ] **5.13** Create LeaveStatusScreen
  - File: `app/(app)/leave/[id].tsx`
  - Display leave application details
  - Show status badge (Pending/Approved/Rejected)
  - Show timeline if available
  - Show HR remarks if any

### UI Components for Leave Module

- [ ] **5.14** Create LeaveBalanceCard component
  - File: `components/leave/LeaveBalanceCard.tsx`
  - Display leave type info with progress indicator

- [ ] **5.15** Create LeaveApplicationCard component
  - File: `components/leave/LeaveApplicationCard.tsx`
  - Display leave request in list format
  - Show status, dates, and type

- [ ] **5.16** Create DateRangePicker component
  - File: `components/DateRangePicker.tsx`
  - Reusable date range selector

### ✅ Phase 5 Completion Checklist
- [ ] Leave balances displayed correctly
- [ ] Users can apply for leave
- [ ] Leave history visible
- [ ] Date validation working
- [ ] Leave balance checked before submission

---

## Phase 6: Core Module - Attendance System ✅ COMPLETE

### 🎯 Objectives
- Implement GPS-based attendance check-in/out
- Set up geofencing for office locations
- Display attendance history

### Backend: Prisma Schema

- [ ] **6.1** Define OfficeLocation model
  ```prisma
  model OfficeLocation {
    id           String   @id @default(uuid())
    name         String
    address      String?
    latitude     Float
    longitude    Float
    radiusMeters Int      @default(100)
    isActive     Boolean  @default(true)
    createdAt    DateTime @default(now())
    updatedAt    DateTime @updatedAt
  }
  ```

- [ ] **6.2** Define AttendanceRecord model
  ```prisma
  model AttendanceRecord {
    id               String    @id @default(uuid())
    userId           String
    user             User      @relation(fields: [userId], references: [id])
    date             DateTime  @db.Date
    checkInTime      DateTime?
    checkOutTime     DateTime?
    checkInLatitude  Float?
    checkInLongitude Float?
    checkOutLatitude Float?
    checkOutLongitude Float?
    createdAt        DateTime  @default(now())
    updatedAt        DateTime  @updatedAt
    
    @@unique([userId, date])
  }
  ```

- [ ] **6.3** Run Prisma migration
  ```bash
  npx prisma migrate dev --name add_attendance_system
  ```

- [ ] **6.4** Seed office location data
  - Add at least one office location in seed script

### Backend: Geofencing Logic

- [ ] **6.5** Create geofencing utility
  - File: `src/utils/geofencing.ts`
  - Function: `isWithinRadius(userLat, userLng, officeLat, officeLng, radius)`
  - Use Haversine formula for distance calculation

- [ ] **6.6** Create attendance routes
  - File: `src/routes/attendance.routes.ts`
  - `GET /api/attendance/location` - Get active office location
  - `POST /api/attendance/check-in` - Check in with GPS coordinates
  - `PUT /api/attendance/check-out` - Check out with GPS coordinates
  - `GET /api/attendance/history` - Get user's attendance history
  - `GET /api/attendance/today` - Get today's attendance record

- [ ] **6.7** Create attendance controller
  - File: `src/controllers/attendance.controller.ts`
  - Validate GPS coordinates in check-in/out handlers
  - Ensure user is within geofence radius
  - Prevent duplicate check-ins for the same day
  - Calculate work hours on check-out

- [ ] **6.8** Create attendance service layer
  - File: `src/services/attendance.service.ts`
  - Business logic for attendance operations

### Frontend: Dependencies

- [ ] **6.9** Install map and location libraries
  ```bash
  npx expo install react-native-maps expo-location
  ```

### Frontend: Attendance Screens

- [ ] **6.10** Create AttendanceScreen
  - File: `app/(app)/attendance/index.tsx`
  - Request location permissions
  - Get user's current GPS coordinates
  - Fetch office location from API
  - Display MapView with office marker and radius circle
  - Display user's current location marker
  - Show distance from office
  - Check if user is within radius
  - Display "Check In" or "Check Out" button (based on today's status)
  - Disable button if out of range
  - Show modal when out of range

- [ ] **6.11** Implement location permission handling
  - Request `Location.requestForegroundPermissionsAsync()`
  - Show error if permission denied
  - Guide user to enable location services

- [ ] **6.12** Create attendance API service
  - File: `services/attendance.service.ts`
  - `getOfficeLocation()`
  - `checkIn(latitude, longitude)`
  - `checkOut(latitude, longitude)`
  - `getTodayStatus()`
  - `getAttendanceHistory()`

- [ ] **6.13** Implement check-in logic
  - Get current location
  - Validate within radius on client side
  - Call API with coordinates
  - Show success/error feedback
  - Update UI state

- [ ] **6.14** Implement check-out logic
  - Similar to check-in
  - Calculate total hours worked
  - Display summary

- [ ] **6.15** Create AttendanceHistoryScreen
  - File: `app/(app)/attendance/history.tsx`
  - Display list of attendance records
  - Show date, check-in time, check-out time, total hours
  - Add filters (month, date range)

### UI Components for Attendance

- [ ] **6.16** Create AttendanceCard component
  - File: `components/attendance/AttendanceCard.tsx`
  - Display single attendance record

- [ ] **6.17** Create MapMarker component
  - File: `components/attendance/MapMarker.tsx`
  - Custom markers for office and user location

- [ ] **6.18** Create GeofenceCircle component
  - File: `components/attendance/GeofenceCircle.tsx`
  - Visual representation of allowed radius

### ✅ Phase 6 Completion Checklist
- [ ] Map displays correctly with office location
- [ ] User location tracked accurately
- [ ] Geofencing validation works (client & server)
- [ ] Check-in/out functionality working
- [ ] Attendance history displayed
- [ ] Permission handling implemented

---

## Phase 7: Core Module - Payroll ✅ COMPLETE

### 🎯 Objectives
- Display salary structure
- View and download payslips
- Implement payslip generation

### Backend: Prisma Schema

- [ ] **7.1** Define SalaryStructure model
  ```prisma
  model SalaryStructure {
    id              String   @id @default(uuid())
    userId          String   @unique
    user            User     @relation(fields: [userId], references: [id])
    basicSalary     Float
    hra             Float    @default(0)
    allowances      Float    @default(0)
    deductions      Float    @default(0)
    grossSalary     Float
    netSalary       Float
    effectiveFrom   DateTime
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
  }
  ```

- [ ] **7.2** Define Payslip model
  ```prisma
  model Payslip {
    id              String   @id @default(uuid())
    userId          String
    user            User     @relation(fields: [userId], references: [id])
    month           Int      // 1-12
    year            Int
    basicSalary     Float
    hra             Float
    allowances      Float
    deductions      Float
    grossSalary     Float
    netSalary       Float
    workingDays     Int
    presentDays     Int
    leaveDays       Int
    fileUrl         String?  // URL to PDF if generated
    status          String   @default("GENERATED") // GENERATED, SENT, VIEWED
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    
    @@unique([userId, month, year])
  }
  ```

- [ ] **7.3** Run Prisma migration
  ```bash
  npx prisma migrate dev --name add_payroll_system
  ```

### Backend: API Endpoints

- [ ] **7.4** Create payroll routes
  - File: `src/routes/payroll.routes.ts`
  - `GET /api/payroll/salary` - Get user's salary structure
  - `GET /api/payroll/payslips` - Get all payslips for user
  - `GET /api/payroll/payslips/:id` - Get single payslip details

- [ ] **7.5** Create payroll controller
  - File: `src/controllers/payroll.controller.ts`
  - Implement handlers for all routes
  - Add calculation logic for payslip data

- [ ] **7.6** Create payroll service layer
  - File: `src/services/payroll.service.ts`
  - Calculate salary based on attendance
  - Generate payslip data

### Frontend: Payroll Screens

- [ ] **7.7** Create PayrollScreen
  - File: `app/(app)/payroll/index.tsx`
  - Display salary structure breakdown
  - Show components: Basic, HRA, Allowances, Deductions
  - Display Gross and Net salary
  - Add link to view payslips

- [ ] **7.8** Create payroll API service
  - File: `services/payroll.service.ts`
  - `getSalaryStructure()`
  - `getPayslips()`
  - `getPayslipById(id)`

- [ ] **7.9** Create PayslipListScreen
  - File: `app/(app)/payroll/payslips.tsx`
  - Display list of all payslips
  - Group by year
  - Show month, year, net salary
  - Add download/view button for each

- [ ] **7.10** Create PayslipDetailScreen
  - File: `app/(app)/payroll/[id].tsx`
  - Display full payslip details
  - Show all salary components
  - Show attendance summary
  - Add download as PDF button (optional)

### UI Components for Payroll

- [ ] **7.11** Create SalaryBreakdownCard component
  - File: `components/payroll/SalaryBreakdownCard.tsx`
  - Display individual salary components

- [ ] **7.12** Create PayslipCard component
  - File: `components/payroll/PayslipCard.tsx`
  - Display payslip in list format

### Optional: PDF Generation

- [ ] **7.13** Install PDF library (backend)
  ```bash
  npm install pdfkit
  ```

- [ ] **7.14** Create PDF generation service
  - File: `src/services/pdf.service.ts`
  - Generate payslip PDF
  - Upload to Supabase Storage
  - Return file URL

- [ ] **7.15** Implement PDF download (frontend)
  ```bash
  npx expo install expo-file-system expo-sharing
  ```

### ✅ Phase 7 Completion Checklist
- [ ] Salary structure displays correctly
- [ ] Payslips list shows all months
- [ ] Payslip details screen functional
- [ ] Calculations accurate (attendance-based)
- [ ] PDF generation working (optional)

---

## Phase 8: Main Dashboard & Navigation ✅ COMPLETE

### 🎯 Objectives
- Create main dashboard with quick actions
- Implement bottom tab navigation
- Design floating tab bar

### Frontend: Navigation Structure

- [ ] **8.1** Create main app layout with tabs
  - File: `app/(app)/_layout.tsx`
  - Use Expo Router Tabs
  - Configure tab screens: Home, Leave, Attendance, Payroll, Profile

- [ ] **8.2** Create custom floating tab bar
  - File: `components/navigation/FloatingTabBar.tsx`
  - Rounded container with shadow/elevation
  - Icon-based navigation
  - Active state indicators
  - Smooth animations

- [ ] **8.3** Style tab bar according to design system
  - Position: absolute, bottom with margin
  - Background: theme-aware with transparency/blur
  - Icons: use icon library (expo-vector-icons)

### Frontend: Dashboard Screen

- [ ] **8.4** Create Dashboard/Home Screen
  - File: `app/(app)/index.tsx`
  - Header with greeting and user name
  - Quick Check In/Out button (large, prominent)
  - Leave balance summary (horizontal scroll cards)
  - Recent attendance list (last 5 days)
  - Upcoming holidays (optional)
  - Notifications/announcements section (optional)

- [ ] **8.5** Implement dashboard data fetching
  - Fetch today's attendance status
  - Fetch leave balances
  - Fetch recent attendance records
  - Show skeleton loaders while loading

- [ ] **8.6** Implement Quick Check In/Out
  - Button on dashboard
  - On press, navigate to AttendanceScreen
  - Or show modal with location request

### UI Components for Dashboard

- [ ] **8.7** Create DashboardCard component
  - File: `components/dashboard/DashboardCard.tsx`
  - Reusable card for dashboard sections

- [ ] **8.8** Create QuickActionButton component
  - File: `components/dashboard/QuickActionButton.tsx`
  - Large button with icon and label

- [ ] **8.9** Create SummaryCard component
  - File: `components/dashboard/SummaryCard.tsx`
  - Display key metrics (leave, attendance)

### Navigation Enhancements

- [ ] **8.10** Add navigation guards
  - Redirect to login if session expires
  - Handle deep linking (optional)

- [ ] **8.11** Implement pull-to-refresh
  - Add to dashboard and list screens
  - Refresh data on pull down

- [ ] **8.12** Add navigation transitions
  - Smooth screen transitions
  - Use Expo Router's native animations

### ✅ Phase 8 Completion Checklist
- [ ] Floating tab bar displays correctly
- [ ] All tabs navigate properly
- [ ] Dashboard shows all summary data
- [ ] Quick actions functional
- [ ] Navigation smooth and intuitive

---

## Phase 9: Admin/HR Features ✅ COMPLETE

### 🎯 Objectives
- Create admin and HR role-specific endpoints
- Enable user management for admin
- Enable employee management and leave approvals for HR

### Backend: Admin Endpoints

- [ ] **9.1** Create admin routes
  - File: `src/routes/admin.routes.ts`
  - `POST /api/admin/create-hr` - Create HR user
  - `GET /api/admin/users` - Get all users
  - `PUT /api/admin/users/:id` - Update user details
  - `DELETE /api/admin/users/:id` - Soft delete user

- [ ] **9.2** Implement admin middleware
  - Verify user has ADMIN role
  - Block access for non-admins

- [ ] **9.3** Create admin controller
  - File: `src/controllers/admin.controller.ts`
  - Handle HR creation (Supabase Auth + DB)
  - User management logic

### Backend: HR Endpoints

- [ ] **9.4** Create HR routes
  - File: `src/routes/hr.routes.ts`
  - **Employee Management:**
    - `POST /api/hr/create-employee` - Create new employee
    - `GET /api/hr/employees` - Get all employees
    - `PUT /api/hr/employees/:id` - Update employee
  - **Leave Management:**
    - `GET /api/hr/leave-requests` - Get all pending leave requests
    - `GET /api/hr/leave-requests/:id` - Get specific leave request
    - `PUT /api/hr/leave-requests/:id` - Approve/reject leave
  - **Attendance Management:**
    - `GET /api/hr/attendance` - Get all employee attendance
    - `GET /api/hr/attendance/:userId` - Get specific employee attendance
  - **Office Location:**
    - `POST /api/hr/locations` - Create office location
    - `PUT /api/hr/locations/:id` - Update office location
  - **Payroll:**
    - `POST /api/hr/payroll/process` - Generate payslips for all employees
    - `PUT /api/hr/salary/:userId` - Update employee salary structure

- [ ] **9.5** Implement HR middleware
  - Verify user has HR or ADMIN role
  - Block access for regular employees

- [ ] **9.6** Create HR controller
  - File: `src/controllers/hr.controller.ts`
  - Implement all HR-specific handlers
  - Add leave approval/rejection logic
  - Add payroll processing logic

### Backend: Employee Creation Service

- [ ] **9.7** Create employee service
  - File: `src/services/employee.service.ts`
  - Function: `createEmployee(data)`
  - Create user in Supabase Auth
  - Create user record in database
  - Initialize leave balances
  - Create salary structure
  - Send welcome email (optional)

### Backend: Leave Approval Logic

- [ ] **9.8** Implement leave approval service
  - File: `src/services/leaveApproval.service.ts`
  - Validate leave request
  - Update leave status
  - Update leave balance on approval
  - Send notification to employee (optional)

### Backend: Payroll Processing

- [ ] **9.9** Create payroll processing service
  - File: `src/services/payrollProcessing.service.ts`
  - Function: `processMonthlyPayroll(month, year)`
  - Fetch all employees
  - Calculate salary based on attendance
  - Generate payslips
  - Store in database

### Admin/HR Web Portal (Optional)

- [ ] **9.10** Create admin web portal (separate project)
  - Use React or Next.js
  - Dashboard with analytics
  - User management interface
  - Leave approval interface
  - Attendance reports
  - Payroll management

### Testing Admin/HR Features

- [ ] **9.11** Test admin endpoints
  - Create test admin user
  - Test HR creation
  - Test user management

- [ ] **9.12** Test HR endpoints
  - Create test HR user
  - Test employee creation
  - Test leave approval/rejection
  - Test attendance viewing
  - Test payroll processing

### ✅ Phase 9 Completion Checklist
- [ ] Admin can create HR users
- [ ] HR can create employees
- [ ] HR can approve/reject leaves
- [ ] HR can view all attendance
- [ ] HR can process payroll
- [ ] HR can manage office locations
- [ ] Role-based access control working

---

## Phase 10: Final Polish & Testing ✅ COMPLETE

### 🎯 Objectives
- Add animations and micro-interactions
- Implement comprehensive error handling
- Test all user flows
- Performance optimization
- Prepare for deployment

### Animations & Interactions

- [ ] **10.1** Add button press animations
  - Use `Pressable` with opacity/scale feedback
  - Add ripple effect on Android

- [ ] **10.2** Add screen transition animations
  - Configure Expo Router animations
  - Add custom transitions for modals

- [ ] **10.3** Add loading animations
  - Skeleton loaders on all data-fetching screens
  - Smooth fade-in when data loads

- [ ] **10.4** Add success/error animations
  - Success checkmark animation
  - Error shake animation

- [ ] **10.5** Add list animations
  - Staggered fade-in for list items
  - Smooth delete/add animations

### Error Handling

- [ ] **10.6** Implement global error boundary
  - File: `components/ErrorBoundary.tsx`
  - Catch and display React errors gracefully

- [ ] **10.7** Add API error handling
  - Create centralized error handler
  - Map error codes to user-friendly messages
  - Show toast/alert for errors

- [ ] **10.8** Add form validation
  - Client-side validation for all forms
  - Show inline error messages
  - Disable submit until valid

- [ ] **10.9** Add network error handling
  - Detect offline state
  - Show offline banner
  - Queue requests when offline (optional)

- [ ] **10.10** Add timeout handling
  - Set reasonable timeouts for API calls
  - Show timeout error messages

### Testing: User Flows

- [ ] **10.11** Test authentication flow
  - Login with valid credentials
  - Login with invalid credentials
  - Password reset flow
  - Session persistence
  - Auto-logout on token expiry

- [ ] **10.12** Test profile management
  - View profile
  - Edit profile
  - Save changes
  - Logout

- [ ] **10.13** Test leave management
  - View leave balances
  - Apply for leave
  - Validation (date range, balance)
  - View leave history
  - View leave status

- [ ] **10.14** Test attendance system
  - Check location permissions
  - View office location on map
  - Check in (within radius)
  - Check in (outside radius - should fail)
  - Check out
  - View attendance history

- [ ] **10.15** Test payroll
  - View salary structure
  - View payslip list
  - View payslip details
  - Download payslip (if implemented)

### Testing: Edge Cases

- [ ] **10.16** Test with poor network
  - Slow 3G simulation
  - Intermittent connectivity

- [ ] **10.17** Test with location disabled
  - Proper error messages
  - Guide to enable location

- [ ] **10.18** Test with denied permissions
  - Location permission denied
  - Handle gracefully

- [ ] **10.19** Test on different devices
  - iOS (various screen sizes)
  - Android (various screen sizes)
  - Tablets (if supported)

- [ ] **10.20** Test dark mode
  - All screens render correctly
  - All components theme-aware
  - Smooth theme transitions

### Performance Optimization

- [ ] **10.21** Optimize images
  - Use optimized image formats
  - Add caching for profile photos
  - Lazy load images

- [ ] **10.22** Optimize list rendering
  - Use `FlatList` with proper optimization
  - Add `keyExtractor`
  - Add `getItemLayout` if fixed height
  - Use `removeClippedSubviews`

- [ ] **10.23** Optimize API calls
  - Implement request caching
  - Avoid unnecessary re-fetches
  - Use pagination for large lists

- [ ] **10.24** Optimize bundle size
  - Remove unused dependencies
  - Use tree-shaking
  - Analyze bundle with Expo

- [ ] **10.25** Add performance monitoring
  - Track screen render times
  - Monitor API response times
  - Use React Native Performance monitor

### Code Quality

- [ ] **10.26** Code review
  - Review all components
  - Check for code duplication
  - Ensure consistent coding style

- [ ] **10.27** Add comments
  - Document complex logic
  - Add JSDoc comments for functions
  - Add README sections

- [ ] **10.28** Security review
  - Ensure no sensitive data in client code
  - Validate all inputs on backend
  - Use HTTPS for all API calls
  - Implement rate limiting (backend)

### Documentation

- [ ] **10.29** Update README
  - Installation instructions
  - Environment variables
  - Running the app
  - Building for production

- [ ] **10.30** Create API documentation
  - Document all endpoints
  - Add request/response examples
  - Note authentication requirements

- [ ] **10.31** Create user guide (optional)
  - How to use the app
  - Screenshots/videos
  - FAQ section

### Deployment Preparation

- [ ] **10.32** Configure app.json
  - Set correct app name
  - Set version numbers
  - Configure splash screen
  - Configure app icon
  - Set permissions

- [ ] **10.33** Generate app icons
  - Use design tool or Expo's icon generator
  - Create icons for iOS and Android

- [ ] **10.34** Generate splash screen
  - Design splash screen
  - Configure in app.json

- [ ] **10.35** Set up EAS Build (Expo)
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  ```

- [ ] **10.36** Configure environment variables for production
  - Use EAS Secrets for sensitive data
  - Set up different environments (dev, staging, prod)

- [ ] **10.37** Backend deployment
  - Choose hosting (Railway, Render, AWS, etc.)
  - Set up CI/CD pipeline
  - Configure environment variables
  - Set up database backups

- [ ] **10.38** Create production builds
  - iOS: `eas build --platform ios`
  - Android: `eas build --platform android`

- [ ] **10.39** Test production builds
  - Install and test on physical devices
  - Test all critical flows

- [ ] **10.40** Submit to app stores
  - Apple App Store (iOS)
  - Google Play Store (Android)

### Post-Launch

- [ ] **10.41** Set up analytics
  - Install analytics SDK (Firebase, Amplitude, etc.)
  - Track key events

- [ ] **10.42** Set up crash reporting
  - Sentry or similar service
  - Monitor crashes in production

- [ ] **10.43** Set up monitoring
  - Backend API monitoring
  - Database monitoring
  - Uptime monitoring

- [ ] **10.44** Create feedback mechanism
  - In-app feedback form
  - Email support

### ✅ Phase 10 Completion Checklist
- [ ] All animations implemented
- [ ] Error handling comprehensive
- [ ] All user flows tested
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Production builds created
- [ ] App deployed successfully

---

## 📊 Technology Stack Reference

### Frontend
- **Framework:** React Native (Expo SDK 51+)
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **State Management:** React Context API
- **HTTP Client:** Fetch API / Axios
- **Maps:** react-native-maps
- **Location:** expo-location
- **Authentication:** @supabase/supabase-js
- **Fonts:** @expo-google-fonts/inter

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (JWT)

### Database
- **Provider:** Supabase (PostgreSQL)
- **ORM:** Prisma Client

### DevOps & Tools
- **Version Control:** Git
- **Code Editor:** VS Code (recommended)
- **API Testing:** Postman / Thunder Client
- **Build Tool:** EAS Build (Expo)

---

## 📁 Recommended Project Structure

### Frontend (React Native)
```
WorkHQ/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (app)/
│   │   ├── index.tsx (Dashboard)
│   │   ├── leave/
│   │   ├── attendance/
│   │   ├── payroll/
│   │   ├── profile/
│   │   └── _layout.tsx (Tabs)
│   ├── _layout.tsx (Root)
│   └── +not-found.tsx
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── TextInput.tsx
│   └── ...
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── leave.service.ts
│   └── ...
├── constants/
│   ├── Theme.ts
│   └── Typography.ts
├── hooks/
│   ├── useTheme.ts
│   ├── useAuth.ts
│   └── ...
├── lib/
│   └── supabase.ts
├── assets/
├── .env
├── app.json
├── package.json
└── tsconfig.json
```

### Backend (Node.js)
```
workhq-backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── types/
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 🎯 Key Milestones

- **Milestone 1:** Project setup complete (End of Phase 1)
- **Milestone 2:** Authentication working (End of Phase 2)
- **Milestone 3:** UI system ready (End of Phase 3)
- **Milestone 4:** All core modules functional (End of Phase 7)
- **Milestone 5:** Full app navigation (End of Phase 8)
- **Milestone 6:** Admin features complete (End of Phase 9)
- **Milestone 7:** Production ready (End of Phase 10)

---

## 📝 Notes

- Each