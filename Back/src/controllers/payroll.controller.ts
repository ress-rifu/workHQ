import { Request, Response } from 'express';
import { payrollService } from '../services/payroll.service';
import { prisma } from '../utils/prisma';

export const payrollController = {
  /**
   * GET /api/payroll/salary
   * Get employee's salary structure
   */
  async getSalaryStructure(req: Request, res: Response) {
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

      const salaryStructure = await payrollService.getSalaryStructure(employee.id);

      if (!salaryStructure) {
        return res.status(404).json({
          success: false,
          message: 'Salary structure not configured',
        });
      }

      return res.json({
        success: true,
        data: salaryStructure,
      });
    } catch (error: any) {
      console.error('Get salary structure error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch salary structure',
      });
    }
  },

  /**
   * GET /api/payroll/payslips
   * Get employee's payslips
   */
  async getPayslips(req: Request, res: Response) {
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

      const { limit } = req.query;

      const payslips = await payrollService.getPayslips(
        employee.id,
        limit ? parseInt(limit as string) : 12
      );

      return res.json({
        success: true,
        data: payslips,
      });
    } catch (error: any) {
      console.error('Get payslips error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payslips',
      });
    }
  },

  /**
   * GET /api/payroll/payslips/:id
   * Get single payslip details
   */
  async getPayslipById(req: Request, res: Response) {
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

      const payslip = await payrollService.getPayslipById(id, employee.id);

      if (!payslip) {
        return res.status(404).json({
          success: false,
          message: 'Payslip not found',
        });
      }

      return res.json({
        success: true,
        data: payslip,
      });
    } catch (error: any) {
      console.error('Get payslip error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payslip',
      });
    }
  },

  /**
   * GET /api/payroll/stats
   * Get payroll statistics
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

      const stats = await payrollService.getPayrollStats(employee.id);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Get payroll stats error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch payroll statistics',
      });
    }
  },
};

