import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen } from '../../../components/layout';
import { Card, Button, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { announcementService } from '../../../services/announcement.service';

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [loading, setLoading] = useState(false);

  const unauthorized = Boolean(
    profile && profile.role !== 'HR' && profile.role !== 'ADMIN'
  );

  // Only HR or ADMIN can access this screen
  useEffect(() => {
    if (unauthorized) {
      router.replace('/' as any);
    }
  }, [unauthorized, router]);

  if (unauthorized) {
    return null;
  }

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: colors.textSecondary },
    { value: 'NORMAL', label: 'Normal', color: colors.info },
    { value: 'HIGH', label: 'High', color: colors.warning },
    { value: 'URGENT', label: 'Urgent', color: colors.error },
  ];

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    setLoading(true);
    try {
      await announcementService.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        priority,
      });
      Alert.alert('Success', 'Announcement created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating announcement:', error);
      Alert.alert('Error', 'Failed to create announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Screen>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Announcement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card padding="lg" shadow="sm" style={styles.card}>
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
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Text style={[styles.label, { color: colors.text }]}>Priority *</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: priority === p.value ? p.color : colors.background,
                    borderColor: p.color,
                  },
                ]}
                onPress={() => setPriority(p.value)}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color: priority === p.value ? '#FFFFFF' : p.color,
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
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={1000}
          />

          <Text style={[styles.charCount, { color: colors.textTertiary }]}>
            {content.length}/1000 characters
          </Text>

          <Button
            title="Create Announcement"
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            disabled={loading}
            style={styles.submitButton}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
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
    minHeight: 160,
  },
  charCount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
  },
});
