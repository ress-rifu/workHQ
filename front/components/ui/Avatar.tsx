import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, BorderRadius } from '../../constants/theme';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const { colors } = useTheme();

  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };

  const textSizes = {
    xs: Typography.fontSize.xs,
    sm: Typography.fontSize.sm,
    md: Typography.fontSize.base,
    lg: Typography.fontSize.xl,
    xl: Typography.fontSize['3xl'],
  };

  const avatarSize = sizes[size];
  const fontSize = textSizes[size];

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const avatarStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  if (uri) {
    return (
      <View style={[avatarStyle, style]}>
        <Image 
          source={{ uri }} 
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      </View>
    );
  }

  return (
    <View style={[avatarStyle, style]}>
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: '#FFFFFF',
          },
        ]}
      >
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontFamily: Typography.fontFamily.semibold,
  },
});



