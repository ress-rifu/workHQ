import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, Header } from '../../../components/layout';
import { Card, Badge, LoadingSpinner, Button } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { attendanceService, AttendanceDay, AttendanceStats } from '../../../services/attendance.service';

export default function AttendanceHistoryScreen() {
  const { colors } = useTheme();

  const [history, setHistory] = useState<AttendanceDay[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [historyRes, statsRes] = await Promise.all([
        attendanceService.getHistory({ limit: 30 }),
        attendanceService.getStats(),
      ]);

      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (!historyRes.success || !statsRes.success) {
        setError(historyRes.error || statsRes.error || 'Failed to load attendance data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
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

  const getStatusBadge = (day: AttendanceDay) => {
    if (day.checkIn && day.checkOut) {
      return <Badge label="Complete" variant="success" size="sm" />;
    } else if (day.checkIn) {
      return <Badge label="In Progress" variant="warning" size="sm" />;
    } else {
      return <Badge label="Incomplete" variant="default" size="sm" />;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <Screen safe>
        <Header title="Attendance History" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Button title="Retry" onPress={loadData} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable safe padding={false}>
      <Header title="Attendance History" showBack />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalDays}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Days This Month
              </Text>
            </Card>

            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.checkIns}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Check Ins
              </Text>
            </Card>

            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.errorLight }]}>
                <Ionicons name="log-out-outline" size={24} color={colors.error} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.checkOuts}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Check Outs
              </Text>
            </Card>
          </View>
        )}

        {/* History List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Attendance
          </Text>

          {history.length === 0 ? (
            <Card padding="lg" shadow="sm">
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No attendance records yet
                </Text>
              </View>
            </Card>
          ) : (
            history.map((day, index) => (
              <Card key={day.date} padding="md" shadow="sm" style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDateContainer}>
                    <Text style={[styles.historyDate, { color: colors.text }]}>
                      {formatDate(day.date)}
                    </Text>
                    <Text style={[styles.historyFullDate, { color: colors.textSecondary }]}>
                      {new Date(day.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  {getStatusBadge(day)}
                </View>

                <View style={styles.historyTimes}>
                  <View style={styles.timeEntry}>
                    <View style={styles.timeIconContainer}>
                      <Ionicons
                        name="log-in"
                        size={20}
                        color={day.checkIn ? colors.success : colors.textTertiary}
                      />
                    </View>
                    <View style={styles.timeDetails}>
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                        Check In
                      </Text>
                      <Text
                        style={[
                          styles.timeValue,
                          { color: day.checkIn ? colors.text : colors.textTertiary },
                        ]}
                      >
                        {day.checkIn ? formatTime(day.checkIn.timestamp) : '--:--'}
                      </Text>
                      {day.checkIn?.location && (
                        <Text style={[styles.locationText, { color: colors.textTertiary }]}>
                          <Ionicons name="location" size={12} /> {day.checkIn.location.name}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={[styles.timeDivider, { backgroundColor: colors.border }]} />

                  <View style={styles.timeEntry}>
                    <View style={styles.timeIconContainer}>
                      <Ionicons
                        name="log-out"
                        size={20}
                        color={day.checkOut ? colors.error : colors.textTertiary}
                      />
                    </View>
                    <View style={styles.timeDetails}>
                      <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                        Check Out
                      </Text>
                      <Text
                        style={[
                          styles.timeValue,
                          { color: day.checkOut ? colors.text : colors.textTertiary },
                        ]}
                      >
                        {day.checkOut ? formatTime(day.checkOut.timestamp) : '--:--'}
                      </Text>
                      {day.checkOut?.location && (
                        <Text style={[styles.locationText, { color: colors.textTertiary }]}>
                          <Ionicons name="location" size={12} /> {day.checkOut.location.name}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {day.workingHours > 0 && (
                  <View
                    style={[
                      styles.workingHoursContainer,
                      { backgroundColor: colors.backgroundTertiary },
                    ]}
                  >
                    <Ionicons name="time-outline" size={16} color={colors.primary} />
                    <Text style={[styles.workingHoursText, { color: colors.text }]}>
                      {formatHours(day.workingHours)} worked
                    </Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  historyCard: {
    marginBottom: 20,
    borderRadius: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  historyDateContainer: {
    flex: 1,
  },
  historyDate: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  historyFullDate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 2,
  },
  historyTimes: {
    flexDirection: 'row',
    gap: 16,
  },
  timeEntry: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  timeIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDetails: {
    flex: 1,
  },
  timeLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.1,
  },
  timeValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  locationText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 4,
    opacity: 0.7,
  },
  timeDivider: {
    width: 1,
    height: '100%',
  },
  workingHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  workingHoursText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.1,
  },
  emptyState: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
});



