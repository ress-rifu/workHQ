import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import leaveRoutes from './routes/leave.routes';
import attendanceRoutes from './routes/attendance.routes';
import payrollRoutes from './routes/payroll.routes';
import hrRoutes from './routes/hr.routes';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'WorkHQ API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to WorkHQ API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      api: '/api'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/hr', hrRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 API Routes:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - GET  /api/auth/profile`);
  console.log(`   - GET  /api/profile`);
  console.log(`   - GET  /api/profile/stats`);
  console.log(`   - PUT  /api/profile`);
  console.log(`   - GET  /api/leave/types`);
  console.log(`   - GET  /api/leave/balances`);
  console.log(`   - GET  /api/leave/applications`);
  console.log(`   - POST /api/leave/apply`);
  console.log(`   - GET  /api/attendance/locations`);
  console.log(`   - GET  /api/attendance/today`);
  console.log(`   - POST /api/attendance/check-in`);
  console.log(`   - POST /api/attendance/check-out`);
  console.log(`   - GET  /api/payroll/salary`);
  console.log(`   - GET  /api/payroll/payslips`);
  console.log(`   - GET  /api/payroll/payslips/:id`);
  console.log(`   - GET  /api/hr/leave-requests (HR/ADMIN)`);
  console.log(`   - PUT  /api/hr/leave-requests/:id/approve (HR/ADMIN)`);
  console.log(`   - GET  /api/hr/employees (HR/ADMIN)`);
});

export default app;

