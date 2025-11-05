import { Router } from 'express';
import { leaveController } from '../controllers/leave.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All leave routes require authentication
router.use(authenticate);

// GET /api/leave/types - Get all leave types
router.get('/types', leaveController.getLeaveTypes);

// GET /api/leave/balances - Get leave balances
router.get('/balances', leaveController.getLeaveBalances);

// GET /api/leave/applications - Get leave applications
router.get('/applications', leaveController.getLeaveApplications);

// GET /api/leave/applications/:id - Get single leave application
router.get('/applications/:id', leaveController.getLeaveApplication);

// POST /api/leave/apply - Apply for leave
router.post('/apply', leaveController.applyLeave);

// PUT /api/leave/applications/:id/cancel - Cancel leave application
router.put('/applications/:id/cancel', leaveController.cancelLeave);

export default router;

