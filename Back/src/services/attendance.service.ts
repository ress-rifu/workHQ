import { prisma } from '../utils/prisma';
import { AttendanceType } from '@prisma/client';
import { calculateDistance, isWithinRadius } from '../utils/geofencing';

interface CheckInData {
  latitude: number;
  longitude: number;
  locationId: string;
}

interface CheckOutData {
  latitude: number;
  longitude: number;
}

export const attendanceService = {
  /**
   * Get active office locations
   */
  async getActiveLocations() {
    return await prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get primary/default office location
   */
  async getPrimaryLocation() {
    const locations = await prisma.location.findMany({
      take: 1,
      orderBy: { name: 'asc' },
    });
    return locations[0] || null;
  },

  /**
   * Get today's attendance status for an employee
   */
  async getTodayStatus(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      include: {
        location: true,
      },
    });

    const checkIn = attendance.find((a) => a.type === 'CHECKIN');
    const checkOut = attendance.find((a) => a.type === 'CHECKOUT');

    return {
      hasCheckedIn: !!checkIn,
      hasCheckedOut: !!checkOut,
      checkIn,
      checkOut,
      workingHours: this.calculateWorkingHours(checkIn?.timestamp, checkOut?.timestamp),
    };
  },

  /**
   * Calculate working hours between check-in and check-out
   */
  calculateWorkingHours(checkInTime?: Date, checkOutTime?: Date): number {
    if (!checkInTime || !checkOutTime) return 0;

    const diff = checkOutTime.getTime() - checkInTime.getTime();
    return diff / (1000 * 60 * 60); // Convert to hours
  },

  /**
   * Validate if user is within geofence radius
   */
  async validateGeofence(
    userLat: number,
    userLon: number,
    locationId: string
  ): Promise<{ valid: boolean; distance: number; location: any }> {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new Error('Location not found');
    }

    const distance = calculateDistance(
      userLat,
      userLon,
      location.latitude,
      location.longitude
    );

    const valid = isWithinRadius(
      userLat,
      userLon,
      location.latitude,
      location.longitude,
      location.radiusMeters
    );

    return { valid, distance, location };
  },

  /**
   * Check in
   */
  async checkIn(employeeId: string, data: CheckInData) {
    const { latitude, longitude, locationId } = data;

    // Check if already checked in today
    const todayStatus = await this.getTodayStatus(employeeId);
    if (todayStatus.hasCheckedIn) {
      throw new Error('You have already checked in today');
    }

    // Validate geofence
    const { valid, distance, location } = await this.validateGeofence(
      latitude,
      longitude,
      locationId
    );

    if (!valid) {
      throw new Error(
        `You are ${Math.round(distance)}m away from the office. Please be within ${location.radiusMeters}m to check in.`
      );
    }

    // Create check-in record
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        type: 'CHECKIN',
        latitude,
        longitude,
        locationId,
        timestamp: new Date(),
      },
      include: {
        location: true,
      },
    });

    return attendance;
  },

  /**
   * Check out
   */
  async checkOut(employeeId: string, data: CheckOutData) {
    const { latitude, longitude } = data;

    // Check if checked in today
    const todayStatus = await this.getTodayStatus(employeeId);
    if (!todayStatus.hasCheckedIn) {
      throw new Error('You must check in before checking out');
    }

    if (todayStatus.hasCheckedOut) {
      throw new Error('You have already checked out today');
    }

    // Create check-out record (less strict on location)
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        type: 'CHECKOUT',
        latitude,
        longitude,
        locationId: todayStatus.checkIn?.locationId,
        timestamp: new Date(),
      },
      include: {
        location: true,
      },
    });

    return attendance;
  },

  /**
   * Get attendance history for an employee
   */
  async getAttendanceHistory(
    employeeId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 30
  ) {
    const where: any = { employeeId };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      include: {
        location: true,
      },
    });

    // Group by date
    const grouped = this.groupAttendanceByDate(attendance);
    return grouped;
  },

  /**
   * Group attendance records by date
   */
  groupAttendanceByDate(attendance: any[]) {
    const grouped: Record<string, any> = {};

    attendance.forEach((record) => {
      const date = record.timestamp.toISOString().split('T')[0];
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          checkIn: null,
          checkOut: null,
          workingHours: 0,
        };
      }

      if (record.type === 'CHECKIN') {
        grouped[date].checkIn = record;
      } else if (record.type === 'CHECKOUT') {
        grouped[date].checkOut = record;
      }
    });

    // Calculate working hours for each day
    Object.values(grouped).forEach((day: any) => {
      if (day.checkIn && day.checkOut) {
        day.workingHours = this.calculateWorkingHours(
          day.checkIn.timestamp,
          day.checkOut.timestamp
        );
      }
    });

    // Convert to array and sort by date descending
    return Object.values(grouped).sort((a: any, b: any) => 
      b.date.localeCompare(a.date)
    );
  },

  /**
   * Get attendance statistics
   */
  async getAttendanceStats(employeeId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth();
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const checkIns = attendance.filter((a) => a.type === 'CHECKIN');
    const checkOuts = attendance.filter((a) => a.type === 'CHECKOUT');

    return {
      totalDays: checkIns.length,
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      month: targetMonth + 1,
      year: targetYear,
    };
  },
};

