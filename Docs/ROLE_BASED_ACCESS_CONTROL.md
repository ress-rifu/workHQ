# Role-Based Access Control Implementation

## Overview
Implemented comprehensive role-based access control (RBAC) to restrict features and navigation based on user roles: **EMPLOYEE**, **HR**, and **ADMIN**.

## User Roles

### EMPLOYEE
- **Access**: Basic employee features only
- **Can Access**:
  - Home Dashboard
  - Attendance (view/mark own attendance)
  - Leave (apply/view own leave)
  - Payroll (view own payslips)
  - Profile
- **Cannot Access**:
  - HR Management section
  - Admin Panel
  - Create/Edit Announcements
  - User Management
  - Leave Approval

### HR
- **Access**: All employee features + HR management
- **Can Access**:
  - All EMPLOYEE features
  - HR Management section
  - Leave Requests approval
  - Create/Edit Announcements
  - View all employee data
- **Cannot Access**:
  - Admin Panel
  - User Management
  - Delete Announcements
  - System Administration

### ADMIN
- **Access**: Full system access
- **Can Access**:
  - All EMPLOYEE and HR features
  - Admin Panel
  - User Management (create/edit/delete users)
  - Role Assignment
  - Location Management
  - Delete Announcements
  - System Configuration

## Implementation Details

### Frontend (React Native)

#### 1. Sidebar Navigation (`front/app/(app)/_layout.tsx`)
- **All users** now see the sidebar with role-appropriate menu items
- Sidebar dynamically filters items based on user role:
  ```typescript
  // Employee: Home, Attendance, Leave, Payroll, Profile
  // HR: Above + HR Management
  // Admin: Above + Admin Panel
  ```
- Sidebar title changes based on role:
  - EMPLOYEE: "WorkHQ" / "Employee Portal"
  - HR: "HR" / "Management"
  - ADMIN: "Admin" / "Control Panel"

#### 2. Route Guards
Added `useEffect` guards in restricted sections:

**HR Section** (`front/app/(app)/hr/_layout.tsx`)
```typescript
useEffect(() => {
  if (profile && !isHROrAdmin) {
    router.replace('/'); // Redirect employees
  }
}, [profile, isHROrAdmin, router]);
```

**Admin Section** (`front/app/(app)/admin/_layout.tsx`)
```typescript
useEffect(() => {
  if (profile && !isAdmin) {
    router.replace('/'); // Redirect non-admins
  }
}, [profile, isAdmin, router]);
```

**Announcement Creation** (`front/app/(app)/announcements/create.tsx`)
```typescript
useEffect(() => {
  if (profile && !isHROrAdmin) {
    Alert.alert(
      'Access Denied',
      'Only HR and Admin users can create announcements.',
      [{ text: 'OK', onPress: () => router.replace('/') }]
    );
  }
}, [profile, isHROrAdmin, router]);
```

#### 3. Tab Bar Configuration
- Tab bar hidden for HR and Admin users (they use sidebar navigation)
- Tab bar items conditionally rendered:
  ```typescript
  href: isHROrAdmin ? '/hr' : null,  // Hide HR tab from employees
  href: isAdmin ? '/admin' : null,   // Hide Admin tab from non-admins
  ```

#### 4. Sidebar Toggle
- **Changed**: Sidebar toggle now visible for ALL users (not just HR/Admin)
- Allows all users to access their personalized navigation menu
- Updated in:
  - `index.tsx` (Home)
  - `payroll/index.tsx`
  - `payroll/[id].tsx`
  - `profile/index.tsx`
  - `profile/edit.tsx`

### Backend (Node.js/Express)

#### 1. Authorization Middleware (`Back/src/middleware/authorize.ts`)
Existing middleware provides role checking:
```typescript
export const isAdmin = authorize(Role.ADMIN);
export const isHROrAdmin = authorize(Role.HR, Role.ADMIN);
export const isEmployee = authorize(Role.EMPLOYEE, Role.HR, Role.ADMIN);
```

#### 2. Announcement Routes (`Back/src/routes/announcement.routes.ts`)
**Updated** to use authorization middleware:
```typescript
router.get('/', announcementController.getAnnouncements);           // All authenticated
router.post('/', isHROrAdmin, announcementController.createAnnouncement);   // HR/Admin
router.put('/:id', isHROrAdmin, announcementController.updateAnnouncement); // HR/Admin
router.delete('/:id', isAdmin, announcementController.deleteAnnouncement);  // Admin only
```

#### 3. Announcement Controller
Already has role validation in controllers as a secondary check:
```typescript
if (userRole !== 'HR' && userRole !== 'ADMIN') {
  return res.status(403).json({
    success: false,
    message: 'Only HR and Admin can create announcements'
  });
}
```

#### 4. HR Routes (`Back/src/routes/hr.routes.ts`)
Already protected with role-based middleware:
```typescript
router.use(authorize(Role.HR, Role.ADMIN));
```

## Security Layers

### Multi-Layer Protection
1. **Frontend Route Guards**: Prevent navigation to unauthorized pages
2. **UI Conditional Rendering**: Hide unauthorized UI elements
3. **Backend Middleware**: Validate roles before processing requests
4. **Controller Validation**: Additional role checks in business logic

### Access Denial Flow
1. User attempts to access restricted route
2. Frontend guard checks role
3. If unauthorized:
   - Alert shown (for announcements)
   - Automatic redirect to home
4. If user bypasses frontend (API call):
   - Backend middleware returns 403 Forbidden
   - Error message displayed

## Testing Checklist

### Employee User
- [ ] Can see only: Home, Attendance, Leave, Payroll, Profile in sidebar
- [ ] Cannot navigate to `/hr/*` routes
- [ ] Cannot navigate to `/admin/*` routes
- [ ] Cannot access `/announcements/create`
- [ ] Cannot create/edit/delete announcements via API
- [ ] Can view own attendance, leave, payroll data

### HR User
- [ ] Can see: All employee items + HR Management in sidebar
- [ ] Can navigate to `/hr/*` routes
- [ ] Cannot navigate to `/admin/*` routes
- [ ] Can access `/announcements/create`
- [ ] Can create/edit announcements
- [ ] Cannot delete announcements
- [ ] Can approve/reject leave requests
- [ ] Can view all employee data

### Admin User
- [ ] Can see: All items including Admin Panel in sidebar
- [ ] Can navigate to all routes
- [ ] Can access `/admin/*` routes
- [ ] Can create/edit/delete announcements
- [ ] Can manage user accounts
- [ ] Can assign roles to users
- [ ] Full system access

## API Endpoints Protection

### Public (Authenticated Users)
- `GET /api/announcements` - View announcements

### HR and Admin Only
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `GET /api/hr/*` - HR management endpoints
- `POST /api/leaves/:id/approve` - Approve leave
- `POST /api/leaves/:id/reject` - Reject leave

### Admin Only
- `DELETE /api/announcements/:id` - Delete announcement
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users` - List all users

## Future Enhancements

1. **Permission-Based Access**: Fine-grained permissions beyond roles
2. **Role Hierarchy**: Automatic inheritance of lower role permissions
3. **Audit Logging**: Track all role-based access attempts
4. **Dynamic Roles**: Allow custom role creation
5. **Resource-Level Permissions**: Control access to specific resources
6. **API Rate Limiting**: Per-role rate limits
7. **Session Management**: Role-based session duration

## Notes

- All role checks use the `profile.role` from AuthContext
- Profile data fetched from backend on authentication
- Role stored in database and JWT token
- Frontend guards are for UX; backend always validates
- Sidebar is now visible to all users with role-filtered items
