import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

export const adminController = {
  /**
   * POST /api/admin/users
   * Create a new user (Admin only)
   * Can create EMPLOYEE or HR users
   */
  async createUser(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { email, password, fullName, role, employeeCode, department, designation, joinDate, salary } = req.body;

      // Validation
      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and full name are required'
        });
      }

      if (!role || !['EMPLOYEE', 'HR'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role must be EMPLOYEE or HR'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Password validation
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const result = await adminService.createUser({
        email,
        password,
        fullName,
        role,
        employeeCode,
        department,
        designation,
        joinDate: joinDate ? new Date(joinDate) : undefined,
        salary
      });

      return res.status(201).json({
        success: true,
        data: result.user,
        message: result.message
      });
    } catch (error: any) {
      console.error('Create user error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  },

  /**
   * GET /api/admin/users
   * Get all users
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const users = await adminService.getAllUsers();

      return res.json({
        success: true,
        data: users
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch users'
      });
    }
  },

  /**
   * PUT /api/admin/users/:id/role
   * Update user role
   */
  async updateUserRole(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { id } = req.params;
      const { role } = req.body;

      if (!['ADMIN', 'HR', 'EMPLOYEE'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      const user = await adminService.updateUserRole(id, role);

      return res.json({
        success: true,
        data: user,
        message: 'User role updated successfully'
      });
    } catch (error: any) {
      console.error('Update role error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update user role'
      });
    }
  },

  /**
   * DELETE /api/admin/users/:id
   * Delete user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { id } = req.params;

      await adminService.deleteUser(id);

      return res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete user'
      });
    }
  },

  /**
   * GET /api/admin/locations
   * Get all locations
   */
  async getAllLocations(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const locations = await adminService.getAllLocations();

      return res.json({
        success: true,
        data: locations
      });
    } catch (error: any) {
      console.error('Get locations error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch locations'
      });
    }
  },

  /**
   * POST /api/admin/locations
   * Create location
   */
  async createLocation(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { name, latitude, longitude, radiusMeters } = req.body;

      if (!name || !latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Name, latitude, and longitude are required'
        });
      }

      const location = await adminService.createLocation({
        name,
        latitude,
        longitude,
        radiusMeters: radiusMeters || 100
      });

      return res.status(201).json({
        success: true,
        data: location,
        message: 'Location created successfully'
      });
    } catch (error: any) {
      console.error('Create location error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create location'
      });
    }
  },

  /**
   * PUT /api/admin/locations/:id
   * Update location
   */
  async updateLocation(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { id } = req.params;
      const { name, latitude, longitude, radiusMeters } = req.body;

      const location = await adminService.updateLocation(id, {
        name,
        latitude,
        longitude,
        radiusMeters
      });

      return res.json({
        success: true,
        data: location,
        message: 'Location updated successfully'
      });
    } catch (error: any) {
      console.error('Update location error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update location'
      });
    }
  },

  /**
   * DELETE /api/admin/locations/:id
   * Delete location
   */
  async deleteLocation(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { id } = req.params;

      await adminService.deleteLocation(id);

      return res.json({
        success: true,
        message: 'Location deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete location error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete location'
      });
    }
  },

  /**
   * GET /api/admin/attendance
   * Get all attendance records
   */
  async getAllAttendance(req: Request, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { startDate, endDate, employeeId } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (employeeId) filters.employeeId = employeeId as string;

      const attendance = await adminService.getAllAttendance(filters);

      return res.json({
        success: true,
        data: attendance
      });
    } catch (error: any) {
      console.error('Get attendance error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance'
      });
    }
  }
};
