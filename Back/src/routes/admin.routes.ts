import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/authorize';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// User management
router.post('/users', adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Location management
router.get('/locations', adminController.getAllLocations);
router.post('/locations', adminController.createLocation);
router.put('/locations/:id', adminController.updateLocation);
router.delete('/locations/:id', adminController.deleteLocation);

// Attendance monitoring
router.get('/attendance', adminController.getAllAttendance);

export default router;
