// Vercel serverless function entry point
import app from '../src/index';
import { VercelRequest, VercelResponse } from '@vercel/node';

// Export the Express app as a serverless function
export default app;
