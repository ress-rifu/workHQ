import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Typography, Spacing } from '../../constants/theme';

export interface SidebarItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: string;
  badge?: number;
}

interface SidebarProps {
  title: string;
  subtitle?: string;
  items: SidebarItem[];
  onItemPress?: (item: SidebarItem) => void;
}

export function Sidebar({ title, subtitle, items, onItemPress }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark } = useTheme();
  const { isOpen, closeSidebar } = useSidebar();

  const handleItemPress = (item: SidebarItem) => {
    closeSidebar();
    if (onItemPress) {
      onItemPress(item);
    } else {
      // Use navigate for cleaner navigation without stacking
      router.navigate(item.path as any);
    }
  };

  const isActiveItem = (item: SidebarItem) => {
    // Exact match for root paths
    if (item.path === '/' || item.path === '/attendance') {
      return pathname === item.path;
    }
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={closeSidebar}
    >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.container, { backgroundColor: colors.card }]}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.headerContent}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {subtitle && (
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.backgroundTertiary }]}
                onPress={closeSidebar}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Navigation Items */}
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {items.map((item) => {
                const isActive = isActiveItem(item);
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.item,
                      { backgroundColor: isActive 
                          ? colors.primary 
                          : pressed 
                            ? isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'
                            : 'transparent' 
                      },
                    ]}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={styles.itemContent}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: isActive 
                            ? 'rgba(255,255,255,0.2)' 
                            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' 
                        }
                      ]}>
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={isActive ? '#FFFFFF' : colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.itemLabel,
                          { color: isActive ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    {item.badge !== undefined && item.badge > 0 && (
                      <View style={[styles.badge, { backgroundColor: isActive ? '#FFFFFF' : colors.error }]}>
                        <Text style={[styles.badgeText, { color: isActive ? colors.primary : '#FFFFFF' }]}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
  );
}

export function SidebarToggle() {
  const { colors } = useTheme();
  const { toggleSidebar } = useSidebar();

  return (
    <TouchableOpacity
      style={[styles.toggleButton, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={toggleSidebar}
      activeOpacity={0.8}
    >
      <Ionicons name="menu" size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  container: {
    width: 300,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    padding: 24,
    paddingTop: 52,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 20,
    gap: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.1,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
  },
});
