import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/layout';
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
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [profileRes, statsRes] = await Promise.all([
        profileService.getProfile(),
        profileService.getProfileStats(),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      } else {
        setError(profileRes.error || 'Failed to load profile');
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
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
    <Screen scrollable safe padding={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Avatar name={profile.fullName} uri={profile.avatarUrl} size="xl" />
          <Text style={styles.headerName}>{profile.fullName}</Text>
          <Text style={styles.headerEmail}>{profile.email}</Text>
          {profile.employee && (
            <View style={styles.headerBadge}>
              <Badge 
                label={profile.role} 
                variant={profile.role === 'ADMIN' ? 'error' : profile.role === 'HR' ? 'warning' : 'default'} 
              />
            </View>
          )}
        </View>
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
        {stats && (
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
        )}

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginTop: Spacing.md,
  },
  headerEmail: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  headerBadge: {
    marginTop: Spacing.md,
  },
  content: {
    padding: Spacing.md,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
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
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  logoutButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
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



