import { Request, Response } from 'express';
import { announcementService } from '../services/announcement.service';

export const announcementController = {
  /**
   * GET /api/announcements
   * Get all active announcements
   */
  async getAnnouncements(req: Request, res: Response) {
    try {
      const announcements = await announcementService.getAnnouncements();

      return res.json({
        success: true,
        data: announcements
      });
    } catch (error: any) {
      console.error('Get announcements error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch announcements'
      });
    }
  },

  /**
   * POST /api/announcements
   * Create announcement (HR/Admin only)
   */
  async createAnnouncement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || (userRole !== 'HR' && userRole !== 'ADMIN')) {
        return res.status(403).json({
          success: false,
          message: 'Only HR and Admin can create announcements'
        });
      }

      const { title, content, priority } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      const announcement = await announcementService.createAnnouncement({
        title,
        content,
        createdBy: userId,
        priority
      });

      return res.status(201).json({
        success: true,
        data: announcement,
        message: 'Announcement created successfully'
      });
    } catch (error: any) {
      console.error('Create announcement error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create announcement'
      });
    }
  },

  /**
   * PUT /api/announcements/:id
   * Update announcement (HR/Admin only)
   */
  async updateAnnouncement(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      const { id } = req.params;

      if (userRole !== 'HR' && userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only HR and Admin can update announcements'
        });
      }

      const { title, content, priority, isActive } = req.body;

      const announcement = await announcementService.updateAnnouncement(id, {
        title,
        content,
        priority,
        isActive
      });

      return res.json({
        success: true,
        data: announcement,
        message: 'Announcement updated successfully'
      });
    } catch (error: any) {
      console.error('Update announcement error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update announcement'
      });
    }
  },

  /**
   * DELETE /api/announcements/:id
   * Delete announcement (Admin only)
   */
  async deleteAnnouncement(req: Request, res: Response) {
    try {
      const userRole = req.user?.role;
      const { id } = req.params;

      if (userRole !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only Admin can delete announcements'
        });
      }

      await announcementService.deleteAnnouncement(id);

      return res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete announcement error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete announcement'
      });
    }
  }
};
