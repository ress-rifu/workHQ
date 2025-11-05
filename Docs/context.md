# WorkHQ — Complete System Design & Implementation Document

## Overview

WorkHQ is a full-fledged HR Management System designed to streamline attendance tracking, leave management, payroll preview, and employee profiles. The system integrates Google Maps-based attendance validation using geofencing, and is powered by Supabase Auth for authentication. The project follows a modern architecture with Node.js backend, Prisma ORM, Supabase as the database layer, and React Native frontend built with Expo.

---

## Key Modules

1. **Attendance System (Google Maps Integration)**

   * Employees can check in/out within a geofenced radius of pre-pinned office locations.
   * Attendance data includes timestamps, coordinates, and verification.
   * Admins/HR can monitor and export attendance logs.

2. **Leave Management System**

   * Leave types include Annual, Sick, Casual, Maternity, Paternity, and Unpaid.
   * Employees can apply for leave with reasons and date ranges.
   * HR/Admin can approve or reject leave requests.
   * Leave balance auto-updates per employee.

3. **User Authentication (Supabase Auth)**

   * Role-based login system using Supabase Auth.
   * JWT tokens used for API access control.
   * Admin creates HR users, HR manages employees.

4. **Payroll Module**

   * Displays monthly salary details, deductions, and net pay.
   * Downloadable or viewable payslip previews.

5. **Profile Management**

   * View and update personal details.
   * Profile photo and basic info linked with Supabase Auth profile.

---

## Roles and Permissions

| Role         | Responsibilities                                                             |
| ------------ | ---------------------------------------------------------------------------- |
| **Admin**    | Create HR users, manage organization settings, view reports, manage payroll. |
| **HR**       | Manage employees, approve/reject leaves, view attendance.                    |
| **Employee** | Check attendance, apply for leave, view profile, view payroll.               |

**Key Rules:**

* Admin can create HR.
* HR cannot create Admins.
* Employees only manage their own data.

---

## Tech Stack

* **Frontend:** React Native, Expo, TypeScript, Expo Router
* **Backend:** Node.js, Fastify/Express, TypeScript
* **Database:** Supabase PostgreSQL (Prisma ORM)
* **Auth:** Supabase Auth (JWT-based)
* **Maps:** Google Maps API for geofencing
* **Styling:** Inter Font, light/dark themes, modern UI revamp

---

## Database Design (Prisma Schema)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  HR
  EMPLOYEE
}

enum AttendanceType {
  CHECKIN
  CHECKOUT
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  fullName  String
  role      Role     @default(EMPLOYEE)
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  employee  Employee?
}

model Employee {
  id            String   @id @default(uuid())
  userId        String   @unique
  employeeCode  String   @unique
  department    String?
  designation   String?
  joinDate      DateTime
  salary        Float?
  user          User     @relation(fields: [userId], references: [id])
  attendance    Attendance[]
  leaves        Leave[]
  leaveBalances LeaveBalance[]
  payrolls      Payroll[]
}

model Location {
  id           String   @id @default(uuid())
  name         String
  latitude     Float
  longitude    Float
  radiusMeters Int      @default(100)
  createdAt    DateTime @default(now())
}

model Attendance {
  id           String   @id @default(uuid())
  employeeId   String
  type         AttendanceType
  timestamp    DateTime @default(now())
  latitude     Float?
  longitude    Float?
  locationId   String?
  employee     Employee @relation(fields: [employeeId], references: [id])
  location     Location? @relation(fields: [locationId], references: [id])
}

model LeaveType {
  id         String  @id @default(uuid())
  name       String
  maxPerYear Float?
  isPaid     Boolean @default(true)
}

model Leave {
  id           String    @id @default(uuid())
  employeeId   String
  leaveTypeId  String
  startDate    DateTime
  endDate      DateTime
  days         Float
  reason       String?
  status       LeaveStatus @default(PENDING)
  appliedAt    DateTime     @default(now())
  decidedBy    String?
  employee     Employee     @relation(fields: [employeeId], references: [id])
  leaveType    LeaveType    @relation(fields: [leaveTypeId], references: [id])
}

model LeaveBalance {
  id           String   @id @default(uuid())
  employeeId   String
  leaveTypeId  String
  balanceDays  Float     @default(0)
  employee     Employee  @relation(fields: [employeeId], references: [id])
  leaveType    LeaveType @relation(fields: [leaveTypeId], references: [id])
}

model Payroll {
  id           String   @id @default(uuid())
  employeeId   String
  salaryMonth  DateTime
  grossSalary  Float
  deductions   Float
  netSalary    Float
  payslipUrl   String?
  employee     Employee  @relation(fields: [employeeId], references: [id])
}
```

---

## Frontend Design System

### Global Theme

* Font: Inter
* Spacing: 8px grid
* Colors:

  * Primary: `#0B5FFF`
  * Background (light): `#FFFFFF`
  * Background (dark): `#0B1220`
  * Text: `#0B1B2B`
  * Success: `#16A34A`, Warning: `#F59E0B`, Danger: `#EF4444`

### Components

* **Button** — Primary, Secondary, Outline
* **Input** — Text, DatePicker, Dropdown
* **Card** — Elevated container for lists and details
* **Modal** — Center & bottom sheet styles
* **Skeleton Loader** — For shimmer placeholders
* **MapView Wrapper** — Integrates location and geofence checks

---

## API Endpoints

**Auth**

* Managed by Supabase; frontend uses Supabase SDK.

**Users**

* `POST /api/admin/hr` → Create HR (Admin only)
* `GET /api/users/:id` → Get profile
* `PUT /api/users/:id` → Update profile

**Attendance**

* `POST /api/attendance/check` → Check-in/out
* `GET /api/attendance/history` → Attendance history

**Leave**

* `POST /api/leave/apply` → Apply for leave
* `PUT /api/leave/:id/approve` → Approve/Reject leave
* `GET /api/leave/balance/:id` → Fetch leave balances

**Payroll**

* `GET /api/payroll/:employeeId` → View payroll details

---

## Attendance Geofencing Logic

```ts
function isWithinRadius(lat1, lon1, lat2, lon2, radiusMeters) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radiusMeters;
}
```

---

## Project Folder Structure

```
/workhq
  /apps
    /mobile (React Native)
      /src
        /components
        /screens
        /theme
        /services
        /hooks
  /packages
    /server (Node.js)
      /src
        /routes
        /controllers
        /middleware
        /services
      /prisma
  /infra
    prisma/schema.prisma
  .env
  README.md
```

---

## Development Scripts

```bash
# Backend
npm run dev          # Start backend in dev mode
npm run build        # Compile backend
npm run migrate      # Prisma migration
npm run seed         # Seed data

# Frontend
expo start           # Launch mobile app
expo run:android     # Run on Android
expo run:ios         # Run on iOS
```

---

## Security & Access

* JWT validation for all backend requests.
* Supabase RLS active for sensitive tables.
* Rate limiting for attendance API.
* No sensitive keys exposed on frontend.

---

## Deployment

* **Frontend:** Expo EAS / Vercel
* **Backend:** Render / Supabase Edge Functions
* **Database:** Supabase Postgres

---

## Future Enhancements

* Automated attendance reminders.
* Leave accrual system per policy.
* Payroll export (CSV, PDF).
* Integrate biometric login.

---

**End of Document — WorkHQ System Design & Implementation Specification**
