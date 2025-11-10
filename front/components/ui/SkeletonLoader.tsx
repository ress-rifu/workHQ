import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radius, spacing } from '../../constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader = React.memo(function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = radius.md,
  style,
}: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const backgroundColor = colors.surfaceVariant;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity,
        },
        style,
      ]}
    />
  );
});

// Pre-built skeleton patterns for common UI elements

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard = React.memo(function SkeletonCard({
  style,
}: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width="40%" height={24} style={{ marginBottom: spacing.md }} />
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: spacing.sm }} />
      <SkeletonLoader width="80%" height={16} />
    </View>
  );
});

interface SkeletonListItemProps {
  style?: ViewStyle;
}

export const SkeletonListItem = React.memo(function SkeletonListItem({
  style,
}: SkeletonListItemProps) {
  return (
    <View style={[styles.listItem, style]}>
      <SkeletonLoader
        width={48}
        height={48}
        borderRadius={radius.full}
        style={{ marginRight: spacing.md }}
      />
      <View style={{ flex: 1 }}>
        <SkeletonLoader width="60%" height={16} style={{ marginBottom: spacing.sm }} />
        <SkeletonLoader width="40%" height={14} />
      </View>
    </View>
  );
});

interface SkeletonProfileProps {
  style?: ViewStyle;
}

export const SkeletonProfile = React.memo(function SkeletonProfile({
  style,
}: SkeletonProfileProps) {
  return (
    <View style={[styles.profile, style]}>
      {/* Avatar */}
      <View style={styles.profileHeader}>
        <SkeletonLoader
          width={80}
          height={80}
          borderRadius={radius.full}
        />
      </View>

      {/* Name */}
      <SkeletonLoader
        width="50%"
        height={24}
        style={{ marginTop: spacing.lg, alignSelf: 'center' }}
      />
      <SkeletonLoader
        width="30%"
        height={16}
        style={{ marginTop: spacing.sm, alignSelf: 'center' }}
      />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.statCard}>
            <SkeletonLoader width="100%" height={40} />
            <SkeletonLoader
              width="60%"
              height={14}
              style={{ marginTop: spacing.sm, alignSelf: 'center' }}
            />
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  profile: {
    padding: spacing.xl,
  },
  profileHeader: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xxl,
    gap: spacing.lg,
  },
  statCard: {
    width: '47%',
    padding: spacing.lg,
  },
});

