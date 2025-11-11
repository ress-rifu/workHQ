import { Router } from 'express';
import { leaveController } from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth';
import { cachePresets } from '../middleware/cache-headers';

const router = Router();

// All leave routes require authentication
router.use(authenticate);

// GET /api/leave/types - Get all leave types
router.get('/types', cachePresets.veryLong, leaveController.getLeaveTypes);

// GET /api/leave/balances - Get leave balances
router.get('/balances', cachePresets.medium, leaveController.getLeaveBalances);

// GET /api/leave/applications - Get leave applications
router.get('/applications', cachePresets.short, leaveController.getLeaveApplications);

// GET /api/leave/applications/:id - Get single leave application
router.get('/applications/:id', cachePresets.short, leaveController.getLeaveApplication);

// POST /api/leave/apply - Apply for leave
router.post('/apply', cachePresets.noCache, leaveController.applyLeave);

// PUT /api/leave/applications/:id/cancel - Cancel leave application
router.put('/applications/:id/cancel', cachePresets.noCache, leaveController.cancelLeave);

export default router;

