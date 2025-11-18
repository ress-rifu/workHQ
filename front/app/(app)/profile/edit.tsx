import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Button, Input, Card, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { profileService, User } from '../../../services/profile.service';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { profile: authProfile } = useAuth();
  
  const isHROrAdmin = authProfile?.role === 'HR' || authProfile?.role === 'ADMIN';
  
  const [profile, setProfile] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
        setFullName(response.data.fullName);
        setDepartment(response.data.employee?.department || '');
        setDesignation(response.data.employee?.designation || '');
      } else {
        setError(response.error || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (fullName.trim().length < 2) {
      Alert.alert('Error', 'Full name must be at least 2 characters');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await profileService.updateProfile({
        fullName: fullName.trim(),
        department: department.trim() || undefined,
        designation: designation.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Screen safe padding={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {isHROrAdmin ? (
              <SidebarToggle />
            ) : (
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.iconButton, { borderColor: colors.border }]}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Profile</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card padding="lg" shadow="md" style={styles.card}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
          leftIcon="person-outline"
          containerStyle={styles.input}
          required
        />

        <Input
          label="Email"
          placeholder="Email"
          value={profile?.email}
          editable={false}
          leftIcon="mail-outline"
          containerStyle={styles.input}
          hint="Email cannot be changed"
        />

        {profile?.employee && (
          <>
            <Input
              label="Department"
              placeholder="Enter your department"
              value={department}
              onChangeText={setDepartment}
              leftIcon="briefcase-outline"
              containerStyle={styles.input}
            />

            <Input
              label="Designation"
              placeholder="Enter your designation"
              value={designation}
              onChangeText={setDesignation}
              leftIcon="ribbon-outline"
              containerStyle={styles.input}
            />
          </>
        )}

        {error && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
            disabled={saving}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.button}
          />
        </View>
      </Card>
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 8,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    height: 52,
  },
});



