import { prisma } from '../utils/prisma';
import { AnnouncementPriority } from '@prisma/client';

export const announcementService = {
  /**
   * Get all active announcements
   */
  async getAnnouncements(isActive: boolean = true) {
    return await prisma.announcement.findMany({
      where: { isActive },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50
    });
  },

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string) {
    return await prisma.announcement.findUnique({
      where: { id }
    });
  },

  /**
   * Create announcement (HR/Admin only)
   */
  async createAnnouncement(data: {
    title: string;
    content: string;
    createdBy: string;
    priority?: AnnouncementPriority;
  }) {
    return await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        createdBy: data.createdBy,
        priority: data.priority || 'NORMAL',
        isActive: true
      }
    });
  },

  /**
   * Update announcement
   */
  async updateAnnouncement(id: string, data: {
    title?: string;
    content?: string;
    priority?: AnnouncementPriority;
    isActive?: boolean;
  }) {
    return await prisma.announcement.update({
      where: { id },
      data
    });
  },

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string) {
    return await prisma.announcement.delete({
      where: { id }
    });
  }
};
