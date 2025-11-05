import { Request, Response } from 'express';
import { profileService } from '../services/profile.service';

export const profileController = {
  /**
   * GET /api/profile
   * Get logged-in user's profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const profile = await profileService.getProfile(userId);

      return res.json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  },

  /**
   * GET /api/profile/stats
   * Get user's profile statistics
   */
  async getProfileStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const stats = await profileService.getProfileStats(userId);

      if (!stats) {
        return res.status(404).json({
          success: false,
          message: 'Profile stats not found',
        });
      }

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get profile stats error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch profile stats',
      });
    }
  },

  /**
   * PUT /api/profile
   * Update logged-in user's profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const { fullName, avatarUrl, department, designation } = req.body;

      // Validation
      if (fullName !== undefined && typeof fullName !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid fullName',
        });
      }

      if (fullName !== undefined && fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters',
        });
      }

      const updatedProfile = await profileService.updateProfile(userId, {
        fullName,
        avatarUrl,
        department,
        designation,
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  },
};

