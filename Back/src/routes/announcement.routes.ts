import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth';
import { isHROrAdmin, isAdmin } from '../middleware/authorize';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all announcements - all authenticated users
router.get('/', announcementController.getAnnouncements);

// Create announcement (HR/Admin only)
router.post('/', isHROrAdmin, announcementController.createAnnouncement);

// Update announcement (HR/Admin only)
router.put('/:id', isHROrAdmin, announcementController.updateAnnouncement);

// Delete announcement (Admin only)
router.delete('/:id', isAdmin, announcementController.deleteAnnouncement);

export default router;
