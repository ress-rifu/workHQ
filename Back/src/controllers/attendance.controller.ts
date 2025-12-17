import { Request, Response } from 'express';
import { attendanceService } from '../services/attendance.service';
import { prisma } from '../utils/prisma';

export const attendanceController = {
  /**
   * GET /api/attendance/locations
   * Get active office locations
   */
  async getLocations(req: Request, res: Response) {
    try {
      const locations = await attendanceService.getActiveLocations();

      return res.json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      console.error('Get locations error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch locations',
      });
    }
  },

  /**
   * GET /api/attendance/location/primary
   * Get primary office location
   */
  async getPrimaryLocation(req: Request, res: Response) {
    try {
      const location = await attendanceService.getPrimaryLocation();

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'No office location found',
        });
      }

      return res.json({
        success: true,
        data: location,
      });
    } catch (error: any) {
      console.error('Get primary location error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch primary location',
      });
    }
  },

  /**
   * GET /api/attendance/today
   * Get today's attendance status
   */
  async getTodayStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get employee record
      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee record not found',
        });
      }

      const status = await attendanceService.getTodayStatus(employee.id);

      return res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      console.error('Get today status error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch today status',
      });
    }
  },

  /**
   * POST /api/attendance/check-in
   * Check in with GPS coordinates
   */
  async checkIn(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get employee record
      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee record not found',
        });
      }

      const { latitude, longitude, locationId } = req.body;

      // Validation
      if (!latitude || !longitude || !locationId) {
        return res.status(400).json({
          success: false,
          message: 'Latitude, longitude, and locationId are required',
        });
      }

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates',
        });
      }

      const attendance = await attendanceService.checkIn(employee.id, {
        latitude,
        longitude,
        locationId,
      });

      return res.status(201).json({
        success: true,
        message: 'Checked in successfully',
        data: attendance,
      });
    } catch (error: any) {
      console.error('Check in error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to check in',
      });
    }
  },

  /**
   * POST /api/attendance/check-out
   * Check out with GPS coordinates
   */
  async checkOut(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get employee record
      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee record not found',
        });
      }

      const { latitude, longitude } = req.body;

      // Validation
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required',
        });
      }

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates',
        });
      }

      const attendance = await attendanceService.checkOut(employee.id, {
        latitude,
        longitude,
      });

      return res.status(201).json({
        success: true,
        message: 'Checked out successfully',
        data: attendance,
      });
    } catch (error: any) {
      console.error('Check out error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to check out',
      });
    }
  },

  /**
   * GET /api/attendance/history
   * Get attendance history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get employee record
      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee record not found',
        });
      }

      const { startDate, endDate, limit } = req.query;

      const history = await attendanceService.getAttendanceHistory(
        employee.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? parseInt(limit as string) : 30
      );

      return res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Get history error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance history',
      });
    }
  },

  /**
   * GET /api/attendance/stats
   * Get attendance statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Get employee record
      const employee = await prisma.employee.findUnique({
        where: { userId },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee record not found',
        });
      }

      const { month, year } = req.query;

      const stats = await attendanceService.getAttendanceStats(
        employee.id,
        month ? parseInt(month as string) - 1 : undefined,
        year ? parseInt(year as string) : undefined
      );

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get stats error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance stats',
      });
    }
  },

  /**
   * GET /api/attendance/employees
   * Get all employees list (HR/Admin only)
   */
  async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await attendanceService.getAllEmployees();

      return res.json({
        success: true,
        data: employees,
      });
    } catch (error: any) {
      console.error('Get employees error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employees',
      });
    }
  },

  /**
   * GET /api/attendance/employee/:employeeId/monthly
   * Get monthly attendance for a specific employee (HR/Admin only)
   */
  async getEmployeeMonthlyAttendance(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      const now = new Date();
      const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
      const targetYear = year ? parseInt(year as string) : now.getFullYear();

      const attendance = await attendanceService.getEmployeeMonthlyAttendance(
        employeeId,
        targetMonth,
        targetYear
      );

      return res.json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      console.error('Get employee monthly attendance error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee attendance',
      });
    }
  },

  /**
   * GET /api/attendance/all/monthly
   * Get all employees' monthly attendance (HR/Admin only)
   */
  async getAllEmployeesMonthlyAttendance(req: Request, res: Response) {
    try {
      const { month, year } = req.query;

      const now = new Date();
      const targetMonth = month ? parseInt(month as string) - 1 : now.getMonth();
      const targetYear = year ? parseInt(year as string) : now.getFullYear();

      const attendance = await attendanceService.getAllEmployeesMonthlyAttendance(
        targetMonth,
        targetYear
      );

      return res.json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      console.error('Get all employees monthly attendance error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance data',
      });
    }
  },
};

