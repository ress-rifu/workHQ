import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Badge, LoadingSpinner, Button } from '../../../components/ui';
import { Typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  attendanceService, 
  AttendanceDay, 
  EmployeeListItem, 
  MonthlyAttendanceDay 
} from '../../../services/attendance.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function AttendanceHistoryScreen() {
  const { colors } = useTheme();
  const { profile } = useAuth();

  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendanceDay[]>([]);
  const [recentHistory, setRecentHistory] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEmployee || !isHROrAdmin) {
      loadMonthlyData();
    }
  }, [currentDate, selectedEmployee]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      if (isHROrAdmin) {
        // Load employees list for HR/Admin
        const empRes = await attendanceService.getAllEmployees();
        if (empRes.success && empRes.data) {
          setEmployees(empRes.data);
        }
      }

      // Load own history
      await loadMonthlyData();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyData = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      if (isHROrAdmin && selectedEmployee) {
        // Load selected employee's attendance
        const res = await attendanceService.getEmployeeMonthlyAttendance(
          selectedEmployee.id,
          month,
          year
        );
        if (res.success && res.data) {
          setMonthlyAttendance(res.data);
        }
      } else {
        // Load own attendance history
        const historyRes = await attendanceService.getHistory({ limit: 60 });
        if (historyRes.success) {
          const data = historyRes.data;
          if (data && 'data' in data) {
            // Has pagination structure
            setRecentHistory((data as any).data || []);
          } else if (Array.isArray(data)) {
            setRecentHistory(data);
          }
        }
      }
    } catch (err: any) {
      console.error('Load monthly data error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMonthlyData();
  }, [currentDate, selectedEmployee]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (day: number): MonthlyAttendanceDay | AttendanceDay | undefined => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (isHROrAdmin && selectedEmployee) {
      return monthlyAttendance.find(a => a.date === dateStr);
    } else {
      return recentHistory.find(a => a.date === dateStr);
    }
  };

  const getStatusColor = (attendance: MonthlyAttendanceDay | AttendanceDay | undefined, day: number) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Future date
    if (checkDate > today) {
      return 'transparent';
    }

    // Weekend
    if (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
      return colors.textTertiary;
    }

    if (!attendance) {
      // No record - absent (only for past working days)
      return colors.error;
    }

    if ('status' in attendance) {
      // MonthlyAttendanceDay with status
      switch (attendance.status) {
        case 'present':
          return colors.success;
        case 'late':
          return colors.warning;
        case 'absent':
          return colors.error;
        default:
          return colors.error;
      }
    } else {
      // AttendanceDay - check if has check-in
      if (attendance.checkIn) {
        // Check if late (after 9 AM)
        const checkInTime = new Date(attendance.checkIn.timestamp);
        const lateThreshold = new Date(checkInTime);
        lateThreshold.setHours(9, 0, 0, 0);
        
        if (checkInTime > lateThreshold) {
          return colors.warning;
        }
        return colors.success;
      }
      return colors.error;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days: JSX.Element[] = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const attendance = getAttendanceForDate(day);
      const statusColor = getStatusColor(attendance, day);
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === currentDate.getMonth() && 
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <View key={day} style={styles.calendarDay}>
          <View style={[
            styles.dayContainer,
            isToday && { borderColor: colors.primary, borderWidth: 2 }
          ]}>
            <Text style={[styles.dayText, { color: colors.text }]}>{day}</Text>
            {statusColor !== 'transparent' && (
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            )}
          </View>
        </View>
      );
    }

    return days;
  };

  // Get last 10 days of history
  const getLast10DaysHistory = () => {
    if (isHROrAdmin && selectedEmployee) {
      return monthlyAttendance.slice(0, 10);
    }
    return recentHistory.slice(0, 10);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Screen safe padding={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggle />
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Attendance</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>History</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Employee Selector for HR/Admin */}
        {isHROrAdmin && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.employeeSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowEmployeeList(!showEmployeeList)}
            >
              <View style={styles.employeeSelectorContent}>
                <Ionicons name="person" size={20} color={colors.primary} />
                <Text style={[styles.employeeSelectorText, { color: colors.text }]}>
                  {selectedEmployee ? selectedEmployee.user.fullName : 'Select Employee'}
                </Text>
              </View>
              <Ionicons 
                name={showEmployeeList ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            {showEmployeeList && (
              <Card style={styles.employeeList} shadow="md">
                <TouchableOpacity
                  style={[
                    styles.employeeItem,
                    !selectedEmployee && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => {
                    setSelectedEmployee(null);
                    setShowEmployeeList(false);
                  }}
                >
                  <Text style={[styles.employeeItemText, { color: colors.text }]}>
                    My Attendance
                  </Text>
                </TouchableOpacity>
                {employees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      styles.employeeItem,
                      selectedEmployee?.id === emp.id && { backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => {
                      setSelectedEmployee(emp);
                      setShowEmployeeList(false);
                    }}
                  >
                    <Text style={[styles.employeeItemText, { color: colors.text }]}>
                      {emp.user.fullName}
                    </Text>
                    <Text style={[styles.employeeItemSubtext, { color: colors.textSecondary }]}>
                      {emp.employeeCode} • {emp.department || 'No Dept'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Card>
            )}
          </View>
        )}

        {/* Legend */}
        <View style={styles.section}>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Late</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.textTertiary }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Weekend</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Card padding="md" shadow="sm" style={styles.calendarCard}>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: colors.text }]}>
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {DAYS.map((day) => (
                <View key={day} style={styles.dayHeader}>
                  <Text style={[styles.dayHeaderText, { color: colors.textSecondary }]}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {renderCalendar()}
            </View>
          </Card>
        </View>

        {/* Recent History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>

          {getLast10DaysHistory().length === 0 ? (
            <Card padding="lg" shadow="sm">
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No attendance records found
                </Text>
              </View>
            </Card>
          ) : (
            getLast10DaysHistory().map((day, index) => (
              <Card key={day.date || index} padding="md" shadow="sm" style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDateContainer}>
                    <Text style={[styles.historyDate, { color: colors.text }]}>
                      {new Date(day.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Badge 
                    label={
                      'status' in day 
                        ? day.status.charAt(0).toUpperCase() + day.status.slice(1)
                        : day.checkIn && day.checkOut 
                          ? 'Complete' 
                          : day.checkIn 
                            ? 'In Progress' 
                            : 'Absent'
                    } 
                    variant={
                      'status' in day
                        ? day.status === 'present' ? 'success' : day.status === 'late' ? 'warning' : 'error'
                        : day.checkIn && day.checkOut 
                          ? 'success' 
                          : day.checkIn 
                            ? 'warning' 
                            : 'error'
                    } 
                    size="sm" 
                  />
                </View>

                <View style={styles.historyTimes}>
                  <View style={styles.timeEntry}>
                    <Ionicons
                      name="log-in"
                      size={18}
                      color={day.checkIn ? colors.success : colors.textTertiary}
                    />
                    <Text style={[styles.timeText, { color: day.checkIn ? colors.text : colors.textTertiary }]}>
                      {day.checkIn ? formatTime(day.checkIn.timestamp) : '--:--'}
                    </Text>
                  </View>
                  <View style={styles.timeEntry}>
                    <Ionicons
                      name="log-out"
                      size={18}
                      color={day.checkOut ? colors.error : colors.textTertiary}
                    />
                    <Text style={[styles.timeText, { color: day.checkOut ? colors.text : colors.textTertiary }]}>
                      {day.checkOut ? formatTime(day.checkOut.timestamp) : '--:--'}
                    </Text>
                  </View>
                  {day.workingHours > 0 && (
                    <View style={styles.timeEntry}>
                      <Ionicons name="time" size={18} color={colors.primary} />
                      <Text style={[styles.timeText, { color: colors.primary }]}>
                        {formatHours(day.workingHours)}
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  employeeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  employeeSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  employeeSelectorText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  employeeList: {
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 300,
  },
  employeeItem: {
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  employeeItemText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  employeeItemSubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  calendarCard: {
    borderRadius: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  historyCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDateContainer: {
    flex: 1,
  },
  historyDate: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  historyTimes: {
    flexDirection: 'row',
    gap: 20,
  },
  timeEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
});
