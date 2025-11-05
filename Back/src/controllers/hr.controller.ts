import { Request, Response } from 'express';
import { hrService } from '../services/hr.service';

export const hrController = {
  /**
   * GET /api/hr/leave-requests
   * Get all leave requests (with optional filters)
   */
  async getLeaveRequests(req: Request, res: Response) {
    try {
      const { status, employeeId } = req.query;

      const leaves = await hrService.getAllLeaveRequests(
        status as any,
        employeeId as string
      );

      return res.json({
        success: true,
        data: leaves,
      });
    } catch (error: any) {
      console.error('Get leave requests error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave requests',
      });
    }
  },

  /**
   * GET /api/hr/leave-requests/pending
   * Get pending leave requests
   */
  async getPendingLeaveRequests(req: Request, res: Response) {
    try {
      const leaves = await hrService.getPendingLeaveRequests();

      return res.json({
        success: true,
        data: leaves,
      });
    } catch (error: any) {
      console.error('Get pending leave requests error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch pending leave requests',
      });
    }
  },

  /**
   * GET /api/hr/leave-requests/:id
   * Get single leave request
   */
  async getLeaveRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const leave = await hrService.getLeaveRequestById(id);

      if (!leave) {
        return res.status(404).json({
          success: false,
          message: 'Leave request not found',
        });
      }

      return res.json({
        success: true,
        data: leave,
      });
    } catch (error: any) {
      console.error('Get leave request error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch leave request',
      });
    }
  },

  /**
   * PUT /api/hr/leave-requests/:id/approve
   * Approve leave request
   */
  async approveLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;

      const leave = await hrService.approveLeave(id, remarks);

      return res.json({
        success: true,
        message: 'Leave request approved successfully',
        data: leave,
      });
    } catch (error: any) {
      console.error('Approve leave error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to approve leave request',
      });
    }
  },

  /**
   * PUT /api/hr/leave-requests/:id/reject
   * Reject leave request
   */
  async rejectLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { remarks } = req.body;

      const leave = await hrService.rejectLeave(id, remarks);

      return res.json({
        success: true,
        message: 'Leave request rejected',
        data: leave,
      });
    } catch (error: any) {
      console.error('Reject leave error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject leave request',
      });
    }
  },

  /**
   * GET /api/hr/employees
   * Get all employees
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const employees = await hrService.getAllEmployees();

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
   * GET /api/hr/employees/:id
   * Get employee details
   */
  async getEmployeeById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const employee = await hrService.getEmployeeById(id);

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }

      return res.json({
        success: true,
        data: employee,
      });
    } catch (error: any) {
      console.error('Get employee error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee',
      });
    }
  },

  /**
   * PUT /api/hr/employees/:id
   * Update employee details
   */
  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { department, designation, salary } = req.body;

      const employee = await hrService.updateEmployee(id, {
        department,
        designation,
        salary: salary ? parseFloat(salary) : undefined,
      });

      return res.json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error: any) {
      console.error('Update employee error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update employee',
      });
    }
  },

  /**
   * GET /api/hr/employees/:id/attendance
   * Get employee attendance
   */
  async getEmployeeAttendance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const attendance = await hrService.getEmployeeAttendance(
        id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      return res.json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      console.error('Get employee attendance error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch employee attendance',
      });
    }
  },

  /**
   * GET /api/hr/stats
   * Get HR statistics
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await hrService.getHRStats();

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get HR stats error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch HR statistics',
      });
    }
  },
};

