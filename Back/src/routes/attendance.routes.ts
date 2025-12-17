import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
import { authorize, isHROrAdmin } from '../middleware/authorize';
import { cachePresets } from '../middleware/cache-headers';

const router = Router();

// All attendance routes require authentication
router.use(authenticate);

// GET /api/attendance/locations - Get all office locations
router.get('/locations', cachePresets.long, attendanceController.getLocations);

// GET /api/attendance/location/primary - Get primary office location
router.get('/location/primary', cachePresets.long, attendanceController.getPrimaryLocation);

// GET /api/attendance/today - Get today's attendance status
router.get('/today', cachePresets.short, attendanceController.getTodayStatus);

// POST /api/attendance/check-in - Check in
router.post('/check-in', cachePresets.noCache, attendanceController.checkIn);

// POST /api/attendance/check-out - Check out
router.post('/check-out', cachePresets.noCache, attendanceController.checkOut);

// GET /api/attendance/history - Get attendance history
router.get('/history', cachePresets.medium, attendanceController.getHistory);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', cachePresets.medium, attendanceController.getStats);

// HR/Admin routes - Must be placed AFTER employee routes to avoid conflicts
// GET /api/attendance/employees - Get all employees list (HR/Admin only)
router.get('/employees', isHROrAdmin, cachePresets.medium, attendanceController.getAllEmployees);

// GET /api/attendance/all/monthly - Get all employees monthly attendance (HR/Admin only)
router.get('/all/monthly', isHROrAdmin, cachePresets.medium, attendanceController.getAllEmployeesMonthlyAttendance);

// GET /api/attendance/employee/:employeeId/monthly - Get employee monthly attendance (HR/Admin only)
router.get('/employee/:employeeId/monthly', isHROrAdmin, cachePresets.medium, attendanceController.getEmployeeMonthlyAttendance);

export default router;

