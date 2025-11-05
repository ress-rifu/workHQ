import { Request, Response } from 'express';
import { leaveService } from '../services/leave.service';
import { prisma } from '../utils/prisma';

export const leaveController = {
  /**
   * GET /api/leave/types
   * Get all leave types
   */
  async getLeaveTypes(req: Request, res: Response) {
    try {
      const leaveTypes = await leaveService.getLeaveTypes();

      return res.json({
        success: true,
        data: leaveTypes,
      });
    } catch (error: any) {
      console.error('Get leave types error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave types',
      });
    }
  },

  /**
   * GET /api/leave/balances
   * Get leave balances for logged-in user
   */
  async getLeaveBalances(req: Request, res: Response) {
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

      const balances = await leaveService.getLeaveBalances(employee.id);

      return res.json({
        success: true,
        data: balances,
      });
    } catch (error: any) {
      console.error('Get leave balances error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave balances',
      });
    }
  },

  /**
   * GET /api/leave/applications
   * Get leave applications for logged-in user
   */
  async getLeaveApplications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const status = req.query.status as string | undefined;

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

      const applications = await leaveService.getLeaveApplications(
        employee.id,
        status as any
      );

      return res.json({
        success: true,
        data: applications,
      });
    } catch (error: any) {
      console.error('Get leave applications error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave applications',
      });
    }
  },

  /**
   * GET /api/leave/applications/:id
   * Get a single leave application
   */
  async getLeaveApplication(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

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

      const application = await leaveService.getLeaveApplication(id, employee.id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Leave application not found',
        });
      }

      return res.json({
        success: true,
        data: application,
      });
    } catch (error: any) {
      console.error('Get leave application error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave application',
      });
    }
  },

  /**
   * POST /api/leave/apply
   * Apply for leave
   */
  async applyLeave(req: Request, res: Response) {
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

      const { leaveTypeId, startDate, endDate, reason } = req.body;

      // Validation
      if (!leaveTypeId || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Leave type, start date, and end date are required',
        });
      }

      const leave = await leaveService.applyLeave(employee.id, {
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      });

      return res.status(201).json({
        success: true,
        message: 'Leave application submitted successfully',
        data: leave,
      });
    } catch (error: any) {
      console.error('Apply leave error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to apply for leave',
      });
    }
  },

  /**
   * PUT /api/leave/applications/:id/cancel
   * Cancel a leave application
   */
  async cancelLeave(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

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

      const leave = await leaveService.cancelLeave(id, employee.id);

      return res.json({
        success: true,
        message: 'Leave application cancelled successfully',
        data: leave,
      });
    } catch (error: any) {
      console.error('Cancel leave error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to cancel leave',
      });
    }
  },
};

