import { Request, Response } from 'express';
import { createUser, getUserProfile, updateUserProfile } from '../services/auth.service';
import { Role } from '@prisma/client';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role, employeeCode, department, designation, joinDate, salary } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Email, password, and full name are required'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Invalid email format'
      });
      return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      res.status(400).json({
        error: 'Validation error',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    const result = await createUser({
      email,
      password,
      fullName,
      role: role || Role.EMPLOYEE,
      employeeCode,
      department,
      designation,
      joinDate: joinDate ? new Date(joinDate) : undefined,
      salary
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message || 'Failed to register user'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
      return;
    }

    const profile = await getUserProfile(req.user.id);

    res.status(200).json({
      user: profile
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
};

/**
 * Update current user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
      return;
    }

    const { fullName, avatarUrl } = req.body;

    const updatedUser = await updateUserProfile(req.user.id, {
      fullName,
      avatarUrl
    });

    res.status(200).json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
};

/**
 * Get user by ID (admin only)
 * GET /api/auth/users/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await getUserProfile(id);

    res.status(200).json({
      user
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message
    });
  }
};

