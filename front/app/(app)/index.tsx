import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen, SidebarToggle } from '../../components/layout';
import { Card, Avatar, Badge, LoadingSpinner, Modal, Button } from '../../components/ui';
import { Typography, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { attendanceService, TodayStatus } from '../../services/attendance.service';
import { leaveService, LeaveBalance } from '../../services/leave.service';
import { profileService, ProfileStats } from '../../services/profile.service';
import { hrService, HRStats } from '../../services/hr.service';
import { announcementService, Announcement, AnnouncementPriority } from '../../services/announcement.service';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { colors } = useTheme();

  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [hrStats, setHRStats] = useState<HRStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Track first load
  const [refreshing, setRefreshing] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<AnnouncementPriority>('NORMAL');
  const [creatingAnnouncement, setCreatingAnnouncement] = useState(false);
  
  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const startTime = performance.now();
    
    try {
      // Don't show full-screen loading on refresh, only skeleton
      if (!initialLoad) {
        setLoading(false);
      }

      // Use Promise.all for faster parallel execution (fail fast if critical data fails)
      // Wrap each call to handle errors individually without blocking others
      const [todayRes, balancesRes, statsRes, announcementsRes, hrStatsRes] = await Promise.all([
        attendanceService.getTodayStatus().catch(err => {
          console.error('Today status error:', err);
          return { success: false, error: err.message };
        }),
        leaveService.getLeaveBalances().catch(err => {
          console.error('Leave balances error:', err);
          return { success: false, error: err.message };
        }),
        profileService.getProfileStats().catch(err => {
          console.error('Profile stats error:', err);
          return { success: false, error: err.message };
        }),
        announcementService.getAnnouncements().catch(err => {
          console.error('Announcements error:', err);
          return { success: false, error: err.message };
        }),
        // Only fetch HR stats if user is HR/Admin
        isHROrAdmin 
          ? hrService.getHRStats().catch(err => {
              console.error('HR stats error:', err);
              return { success: false, error: err.message };
            })
          : Promise.resolve({ success: false }),
      ]);

      // Process results safely
      if (todayRes.success) {
        setTodayStatus(todayRes.data);
      }

      if (balancesRes.success) {
        setLeaveBalances(balancesRes.data);
      }

      if (statsRes.success) {
        setProfileStats(statsRes.data);
      }

      if (announcementsRes.success) {
        setAnnouncements(announcementsRes.data || []);
      }

      if (hrStatsRes && hrStatsRes.success) {
        setHRStats(hrStatsRes.data);
      }
      
      const endTime = performance.now();
      const loadTime = ((endTime - startTime) / 1000).toFixed(2);
      console.log(`⏱️ Dashboard loaded in ${loadTime}s`);
      
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTotalLeaveBalance = () => {
    return leaveBalances.reduce((sum, balance) => sum + balance.balanceDays, 0);
  };

  const formatWorkingHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading && initialLoad) {
    return <LoadingSpinner fullScreen />;
  }

  const getAttendanceStatus = () => {
    if (!todayStatus) return { label: 'Loading...', variant: 'default' as const };
    if (todayStatus.hasCheckedOut) return { label: 'Checked Out', variant: 'success' as const };
    if (todayStatus.hasCheckedIn) return { label: 'Checked In', variant: 'info' as const };
    return { label: 'Not Checked In', variant: 'warning' as const };
  };

  const attendanceStatus = getAttendanceStatus();

  return (
    <Screen safe padding={false}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggle />
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.email?.split('@')[0] || 'Welcome'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.notificationButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => router.push('/profile' as any)}
            >
              <Ionicons name="settings-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >

        {/* Content */}
        <View style={styles.content}>
          {/* Announcements */}
          {announcements.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Announcements</Text>
                {isHROrAdmin && (
                  <TouchableOpacity onPress={() => setShowAnnouncementModal(true)}>
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
              {announcements.slice(0, 3).map((announcement) => (
                <Card key={announcement.id} padding="md" shadow="sm" style={styles.announcementCard}>
                  <View style={styles.announcementHeader}>
                    <Text style={[styles.announcementTitle, { color: colors.text }]}>
                      {announcement.title}
                    </Text>
                    <Badge 
                      label={announcement.priority} 
                      variant={
                        announcement.priority === 'URGENT' ? 'error' :
                        announcement.priority === 'HIGH' ? 'warning' :
                        announcement.priority === 'NORMAL' ? 'info' : 'default'
                      }
                      size="sm"
                    />
                  </View>
                  <Text 
                    style={[styles.announcementContent, { color: colors.textSecondary }]} 
                    numberOfLines={2}
                  >
                    {announcement.content}
                  </Text>
                  <Text style={[styles.announcementDate, { color: colors.textTertiary }]}>
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </Text>
                </Card>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {isHROrAdmin && hrStats && (
                <Card 
                  style={styles.actionCard} 
                  shadow="sm" 
                  onPress={() => router.push('/hr' as any)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
                    <Ionicons name="briefcase" size={24} color={colors.error} />
                  </View>
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    Leave Requests
                  </Text>
                  {hrStats.pendingLeaves > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.error }]}>
                      <Text style={styles.badgeText}>{hrStats.pendingLeaves}</Text>
                    </View>
                  )}
                </Card>
              )}

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/attendance' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="location" size={24} color={colors.success} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {todayStatus?.hasCheckedIn ? 'Check Out' : 'Check In'}
                </Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/leave/apply' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.infoLight }]}>
                  <Ionicons name="calendar" size={24} color={colors.info} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Apply Leave</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/payroll/payslips' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="document-text" size={24} color={colors.warning} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Payslips</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/profile' as any)}
              >
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="person" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Profile</Text>
              </Card>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Status</Text>
            <Card padding="lg" shadow="md">
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Attendance
                </Text>
                <Badge label={attendanceStatus.label} variant={attendanceStatus.variant} />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Leave Balance
                </Text>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {getTotalLeaveBalance()} days
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Working Hours
                </Text>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {todayStatus ? formatWorkingHours(todayStatus.workingHours) : '0h 0m'}
                </Text>
              </View>
            </Card>
          </View>

          {/* Stats Cards */}
          {profileStats && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>This Month</Text>
              <View style={styles.statsGrid}>
                <Card padding="md" shadow="sm" style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {profileStats.attendanceThisMonth}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Attendance
                  </Text>
                </Card>

                <Card padding="md" shadow="sm" style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                    <Ionicons name="time" size={24} color={colors.warning} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {profileStats.pendingLeaves}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Pending
                  </Text>
                </Card>

                <Card padding="md" shadow="sm" style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                    <Ionicons name="calendar" size={24} color={colors.info} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {profileStats.totalLeaveBalance}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Leave Days
                  </Text>
                </Card>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Announcement Creation Modal */}
      {isHROrAdmin && (
        <Modal
          visible={showAnnouncementModal}
          onClose={() => {
            setShowAnnouncementModal(false);
            setAnnouncementTitle('');
            setAnnouncementContent('');
            setAnnouncementPriority('NORMAL');
          }}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Announcement</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAnnouncementModal(false);
                  setAnnouncementTitle('');
                  setAnnouncementContent('');
                  setAnnouncementPriority('NORMAL');
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter announcement title"
              placeholderTextColor={colors.textTertiary}
              value={announcementTitle}
              onChangeText={setAnnouncementTitle}
              maxLength={100}
            />

            <Text style={[styles.label, { color: colors.text }]}>Priority *</Text>
            <View style={styles.priorityContainer}>
              {[
                { value: 'LOW' as const, label: 'Low', color: colors.textSecondary },
                { value: 'NORMAL' as const, label: 'Normal', color: colors.info },
                { value: 'HIGH' as const, label: 'High', color: colors.warning },
                { value: 'URGENT' as const, label: 'Urgent', color: colors.error },
              ].map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: announcementPriority === p.value ? p.color : colors.background,
                      borderColor: p.color,
                    },
                  ]}
                  onPress={() => setAnnouncementPriority(p.value)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color: announcementPriority === p.value ? '#FFFFFF' : p.color,
                      },
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Content *</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter announcement content"
              placeholderTextColor={colors.textTertiary}
              value={announcementContent}
              onChangeText={setAnnouncementContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />

            <Text style={[styles.charCount, { color: colors.textTertiary }]}>
              {announcementContent.length}/1000 characters
            </Text>

            <Button
              title="Create Announcement"
              onPress={async () => {
                if (!announcementTitle.trim()) {
                  Alert.alert('Error', 'Please enter a title');
                  return;
                }
                if (!announcementContent.trim()) {
                  Alert.alert('Error', 'Please enter content');
                  return;
                }

                setCreatingAnnouncement(true);
                try {
                  await announcementService.createAnnouncement({
                    title: announcementTitle.trim(),
                    content: announcementContent.trim(),
                    priority: announcementPriority,
                  });
                  Alert.alert('Success', 'Announcement created successfully');
                  setShowAnnouncementModal(false);
                  setAnnouncementTitle('');
                  setAnnouncementContent('');
                  setAnnouncementPriority('NORMAL');
                  loadDashboardData();
                } catch (error) {
                  console.error('Error creating announcement:', error);
                  Alert.alert('Error', 'Failed to create announcement. Please try again.');
                } finally {
                  setCreatingAnnouncement(false);
                }
              }}
              variant="primary"
              size="lg"
              disabled={creatingAnnouncement}
              style={styles.submitButton}
            />
          </View>
        </Modal>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  userName: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  announcementCard: {
    marginBottom: 12,
    borderRadius: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  announcementContent: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 22,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: '46%',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.1,
  },
  statusValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
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
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  modalContent: {
    width: '100%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 12,
    marginTop: 20,
  },
  input: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  priorityButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
  },
  priorityText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'uppercase',
  },
  textArea: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 120,
    marginBottom: 8,
  },
  charCount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'right',
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});




