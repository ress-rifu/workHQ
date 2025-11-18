import { api } from './api';

export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  priority: AnnouncementPriority;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority?: AnnouncementPriority;
}

export const announcementService = {
  /**
   * Get all announcements
   */
  async getAnnouncements() {
    return api.get<Announcement[]>('/announcements');
  },

  /**
   * Create announcement (HR/Admin only)
   */
  async createAnnouncement(data: CreateAnnouncementData) {
    return api.post<Announcement>('/announcements', data);
  },

  /**
   * Update announcement (HR/Admin only)
   */
  async updateAnnouncement(id: string, data: Partial<CreateAnnouncementData> & { isActive?: boolean }) {
    return api.put<Announcement>(`/announcements/${id}`, data);
  },

  /**
   * Delete announcement (Admin only)
   */
  async deleteAnnouncement(id: string) {
    return api.delete(`/announcements/${id}`);
  }
};
