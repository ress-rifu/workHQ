import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Screen } from '../../components/layout';
import { Button, Input, Card } from '../../components/ui';
import { Typography, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
        setLoading(false);
      } else {
        setSent(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Screen scrollable={false} safe>
        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.successLight },
              ]}
            >
              <Ionicons name="mail-outline" size={48} color={colors.success} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Check Your Email</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              We've sent password reset instructions to {email}
            </Text>

            <Button
              title="Back to Login"
              onPress={() => router.back()}
              fullWidth
              size="lg"
              style={styles.backButton}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} safe keyboardAvoiding>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backLinkText, { color: colors.primary }]}>
            Back to Login
          </Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={error}
            containerStyle={styles.inputContainer}
            required
          />

          <Button
            title="Send Reset Link"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  backLinkText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});



