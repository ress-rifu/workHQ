import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// GET /api/profile - Get user profile
router.get('/', profileController.getProfile);

// GET /api/profile/stats - Get profile statistics
router.get('/stats', profileController.getProfileStats);

// PUT /api/profile - Update user profile
router.put('/', profileController.updateProfile);

export default router;

