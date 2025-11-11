import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth';
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

export default router;

