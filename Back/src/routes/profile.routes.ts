import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';
import { cachePresets } from '../middleware/cache-headers';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// GET /api/profile - Get user profile
router.get('/', cachePresets.medium, profileController.getProfile);

// GET /api/profile/stats - Get profile statistics
router.get('/stats', cachePresets.short, profileController.getProfileStats);

// PUT /api/profile - Update user profile
router.put('/', cachePresets.noCache, profileController.updateProfile);

export default router;

