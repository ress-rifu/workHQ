import { Router } from 'express';
import { hrController } from '../controllers/hr.controller';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

import { Role } from '@prisma/client';

// All HR routes require authentication and HR/ADMIN role
router.use(authenticate);
router.use(authorize(Role.HR, Role.ADMIN));

// Leave Management Routes
router.get('/leave-requests', hrController.getLeaveRequests);
router.get('/leave-requests/pending', hrController.getPendingLeaveRequests);
router.get('/leave-requests/:id', hrController.getLeaveRequestById);
router.put('/leave-requests/:id/approve', hrController.approveLeave);
router.put('/leave-requests/:id/reject', hrController.rejectLeave);

// Employee Management Routes
router.get('/employees', hrController.getEmployees);
router.get('/employees/:id', hrController.getEmployeeById);
router.put('/employees/:id', hrController.updateEmployee);
router.get('/employees/:id/attendance', hrController.getEmployeeAttendance);

// Statistics
router.get('/stats', hrController.getStats);

export default router;

