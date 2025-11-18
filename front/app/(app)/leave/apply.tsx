import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, Header } from '../../../components/layout';
import { Button, Input, Card } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { leaveService, LeaveType } from '../../../services/leave.service';

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaveTypes();
  }, []);

  const loadLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveTypes();
      
      if (response.success && response.data) {
        setLeaveTypes(response.data);
        if (response.data.length > 0) {
          setSelectedLeaveType(response.data[0]);
        }
      } else {
        setError(response.error || 'Failed to load leave types');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) return 0;
    
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Count only weekdays (Monday-Friday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleSubmit = async () => {
    if (!selectedLeaveType) {
      Alert.alert('Error', 'Please select a leave type');
      return;
    }

    const days = calculateDays();
    
    if (days === 0) {
      Alert.alert('Error', 'No working days in the selected date range');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await leaveService.applyLeave({
        leaveTypeId: selectedLeaveType.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: reason.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Success',
          'Leave application submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to apply for leave');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Screen safe>
        <Header title="Apply for Leave" showBack />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading...
          </Text>
        </View>
      </Screen>
    );
  }

  if (error || leaveTypes.length === 0) {
    return (
      <Screen safe>
        <Header title="Apply for Leave" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'No leave types available'}
          </Text>
          <Button title="Retry" onPress={loadLeaveTypes} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  const workingDays = calculateDays();

  return (
    <Screen scrollable safe keyboardAvoiding>
      <Header title="Apply for Leave" showBack />

      <Card padding="lg" shadow="md" style={styles.card}>
        {/* Leave Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Leave Type *</Text>
          <View style={styles.leaveTypeGrid}>
            {leaveTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.leaveTypeButton,
                  {
                    backgroundColor:
                      selectedLeaveType?.id === type.id
                        ? colors.primary
                        : colors.backgroundTertiary,
                    borderColor:
                      selectedLeaveType?.id === type.id
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedLeaveType(type)}
              >
                <Text
                  style={[
                    styles.leaveTypeText,
                    {
                      color:
                        selectedLeaveType?.id === type.id
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Start Date *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>End Date *</Text>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: colors.border }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={[styles.dateText, { color: colors.text }]}>
              {formatDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Working Days Display */}
        <View
          style={[
            styles.daysDisplay,
            { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <View style={styles.daysInfo}>
            <Text style={[styles.daysValue, { color: colors.primary }]}>
              {workingDays} {workingDays === 1 ? 'Day' : 'Days'}
            </Text>
            <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>
              Working days (excluding weekends)
            </Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.section}>
          <Input
            label="Reason (Optional)"
            placeholder="Enter reason for leave"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
            style={styles.reasonInput}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            style={styles.button}
            disabled={submitting}
          />
          <Button
            title="Submit"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting || workingDays === 0}
            style={styles.button}
          />
        </View>
      </Card>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (selectedDate) {
              setStartDate(selectedDate);
              if (selectedDate > endDate) {
                setEndDate(selectedDate);
              }
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={startDate}
          onChange={(event, selectedDate) => {
            setShowEndPicker(Platform.OS === 'ios');
            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    borderRadius: 20,
    paddingVertical: 8,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  leaveTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  leaveTypeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  leaveTypeText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  dateText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    flex: 1,
  },
  daysDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
  },
  daysInfo: {
    flex: 1,
  },
  daysValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  daysLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginTop: 4,
    opacity: 0.7,
  },
  reasonInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    height: 56,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
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
    minWidth: 160,
    borderRadius: 16,
    height: 52,
  },
});



