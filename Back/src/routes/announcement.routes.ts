import { Router } from 'express';
import { announcementController } from '../controllers/announcement.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all announcements
router.get('/', announcementController.getAnnouncements);

// Create announcement (HR/Admin only)
router.post('/', announcementController.createAnnouncement);

// Update announcement (HR/Admin only)
router.put('/:id', announcementController.updateAnnouncement);

// Delete announcement (Admin only)
router.delete('/:id', announcementController.deleteAnnouncement);

export default router;
