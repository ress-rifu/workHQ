import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Avatar, Badge, Button, Divider, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { profileService, User, ProfileStats } from '../../../services/profile.service';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load profile first (critical)
      const profileRes = await profileService.getProfile();
      
      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
        
        // Load stats in background (non-critical)
        // If it fails, we still show the profile
        setStatsLoading(true);
        profileService.getProfileStats().then(statsRes => {
          if (statsRes.success && statsRes.data) {
            setStats(statsRes.data);
          } else {
            console.warn('Failed to load profile stats:', statsRes.error);
          }
        }).catch(err => {
          console.warn('Stats request error:', err);
        }).finally(() => {
          setStatsLoading(false);
        });
      } else {
        setError(profileRes.error || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('Profile load error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !profile) {
    return (
      <Screen safe>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Failed to load profile'}
          </Text>
          <Button title="Retry" onPress={loadProfile} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen safe padding={false}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggle />
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>Your Profile</Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                {profile?.fullName || authUser?.email?.split('@')[0] || 'Profile'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.primaryLight }]}
              onPress={() => router.push('/profile/edit' as any)}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceVariant : colors.background }]}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={22} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.surface }]}>
          <Avatar name={profile.fullName} uri={profile.avatarUrl} size="xl" />
          <Text style={[styles.heroName, { color: colors.text }]}>{profile.fullName}</Text>
          <Text style={[styles.heroEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
          {profile.employee && (
            <View style={[styles.roleBadge, { 
              backgroundColor: profile.role === 'ADMIN' ? colors.errorLight : 
                              profile.role === 'HR' ? colors.warningLight : 
                              colors.primaryLight 
            }]}>
              <Text style={[styles.roleText, { 
                color: profile.role === 'ADMIN' ? colors.error : 
                       profile.role === 'HR' ? colors.warning : 
                       colors.primary 
              }]}>
                {profile.role}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
        {/* Employee Info Card */}
        {profile.employee && (
          <Card padding="lg" shadow="md" style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Employee Information
            </Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="card" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Employee ID
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.employee.employeeCode}
              </Text>
            </View>

            <Divider spacing="md" />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="briefcase" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Department
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.employee.department || 'Not set'}
              </Text>
            </View>

            <Divider spacing="md" />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="ribbon" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Designation
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {profile.employee.designation || 'Not set'}
              </Text>
            </View>

            <Divider spacing="md" />

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Join Date
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(profile.employee.joinDate).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        )}

        {/* Stats Cards */}
        {statsLoading ? (
          <View style={styles.statsGrid}>
            <Card padding="md" shadow="sm" style={styles.statCard}>
              <LoadingSpinner size="small" />
              <Text style={[styles.statLabel, { color: colors.textSecondary, marginTop: Spacing.sm }]}>
                Loading stats...
              </Text>
            </Card>
          </View>
        ) : stats ? (
          <View style={styles.statsGrid}>
            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.totalLeaveBalance}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Leave Balance
              </Text>
            </Card>

            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.info} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.attendanceThisMonth}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                This Month
              </Text>
            </Card>

            <Card padding="md" shadow="sm" style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="time-outline" size={24} color={colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.pendingLeaves}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Pending Leaves
              </Text>
            </Card>
          </View>
        ) : null}

        {/* Settings Card */}
        <Card padding="lg" shadow="md" style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Settings</Text>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/profile/edit' as any)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Edit Profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <Divider spacing="md" />

          <TouchableOpacity style={styles.settingRow} onPress={toggleTheme}>
            <View style={styles.settingLeft}>
              <Ionicons 
                name={isDark ? 'moon' : 'sunny'} 
                size={20} 
                color={colors.primary} 
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          fullWidth
          size="lg"
          icon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />}
          style={styles.logoutButton}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    opacity: 0.6,
  },
  userName: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  heroName: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.4,
  },
  heroEmail: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    opacity: 0.7,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
    alignSelf: 'center',
  },
  roleText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 24,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    lineHeight: 28,
  },
  retryButton: {
    minWidth: 120,
  },
});



