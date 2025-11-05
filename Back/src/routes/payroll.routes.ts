import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All payroll routes require authentication
router.use(authenticate);

// GET /api/payroll/salary - Get salary structure
router.get('/salary', payrollController.getSalaryStructure);

// GET /api/payroll/payslips - Get all payslips
router.get('/payslips', payrollController.getPayslips);

// GET /api/payroll/payslips/:id - Get single payslip
router.get('/payslips/:id', payrollController.getPayslipById);

// GET /api/payroll/stats - Get payroll statistics
router.get('/stats', payrollController.getStats);

export default router;

