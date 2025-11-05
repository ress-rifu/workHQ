import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All attendance routes require authentication
router.use(authenticate);

// GET /api/attendance/locations - Get all office locations
router.get('/locations', attendanceController.getLocations);

// GET /api/attendance/location/primary - Get primary office location
router.get('/location/primary', attendanceController.getPrimaryLocation);

// GET /api/attendance/today - Get today's attendance status
router.get('/today', attendanceController.getTodayStatus);

// POST /api/attendance/check-in - Check in
router.post('/check-in', attendanceController.checkIn);

// POST /api/attendance/check-out - Check out
router.post('/check-out', attendanceController.checkOut);

// GET /api/attendance/history - Get attendance history
router.get('/history', attendanceController.getHistory);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', attendanceController.getStats);

export default router;

