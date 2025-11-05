import { View, Text, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, Header } from '../../../components/layout';
import { Button, Input, Card, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { profileService, User } from '../../../services/profile.service';

export default function EditProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
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
    <Screen scrollable safe keyboardAvoiding>
      <Header title="Edit Profile" showBack />

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
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: Spacing.md,
  },
  input: {
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  button: {
    flex: 1,
  },
});



