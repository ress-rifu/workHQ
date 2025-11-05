import { Router } from 'express';
import { register, getProfile, updateProfile, getUserById } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { isAdmin } from '../middleware/authorize';

const router = Router();

/**
 * Public routes
 */
// Register new user (requires admin role for full registration)
router.post('/register', register);

/**
 * Protected routes (require authentication)
 */
// Get current user profile
router.get('/profile', authenticate, getProfile);

// Update current user profile
router.put('/profile', authenticate, updateProfile);

// Get user by ID (admin only)
router.get('/users/:id', authenticate, isAdmin, getUserById);

export default router;

