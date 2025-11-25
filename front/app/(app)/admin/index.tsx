import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Button, Badge, LoadingSpinner, Divider } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser, CreateUserData } from '../../../services/admin.service';

export default function AdminScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    fullName: '',
    role: 'EMPLOYEE',
    employeeCode: '',
    department: '',
    designation: '',
    salary: undefined,
  });

  useEffect(() => {
    if (profile?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    loadUsers();
  }, [profile, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await adminService.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'ADMIN' | 'HR' | 'EMPLOYEE') => {
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.success) {
        Alert.alert('Success', 'User role updated successfully');
        loadUsers();
      } else {
        Alert.alert('Error', response.error || 'Failed to update role');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setCreating(true);
    try {
      const response = await adminService.createUser({
        ...formData,
        employeeCode: formData.employeeCode || undefined,
        department: formData.department || undefined,
        designation: formData.designation || undefined,
        salary: formData.salary || undefined,
      });

      if (response.success) {
        Alert.alert('Success', 'User created successfully');
        setShowCreateModal(false);
        setFormData({
          email: '',
          password: '',
          fullName: '',
          role: 'EMPLOYEE',
          employeeCode: '',
          department: '',
          designation: '',
          salary: undefined,
        });
        loadUsers();
      } else {
        Alert.alert('Error', response.error || 'Failed to create user');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminService.deleteUser(userId);
              if (response.success) {
                Alert.alert('Success', 'User deleted successfully');
                loadUsers();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete user');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred');
            }
          }
        }
      ]
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'HR': return 'warning';
      default: return 'default';
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
            <SidebarToggle />
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Admin</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Management</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor: colors.border }]}
            onPress={() => router.push('/admin/locations' as any)}
          >
            <Ionicons name="location" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/admin/locations' as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="location" size={24} color={colors.primary} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Locations</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/admin/attendance' as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="time" size={24} color={colors.success} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Attendance</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/hr/leaves' as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="calendar" size={24} color={colors.warning} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Leave Requests</Text>
              </Card>

              <Card 
                style={styles.actionCard} 
                shadow="sm" 
                onPress={() => router.push('/announcements/create' as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.infoLight }]}>
                  <Ionicons name="megaphone" size={24} color={colors.info} />
                </View>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Announce</Text>
              </Card>
            </View>
          </View>

          {/* User Management */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>User Management</Text>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateModal(true)}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
            
            {error ? (
              <Card padding="lg" shadow="sm">
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </Card>
            ) : users.length === 0 ? (
              <Card padding="lg" shadow="sm">
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No users found
                </Text>
              </Card>
            ) : (
              users.map((user) => (
                <Card key={user.id} padding="md" shadow="sm" style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {user.fullName}
                      </Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                        {user.email}
                      </Text>
                      {user.employee && (
                        <>
                          <Text style={[styles.userDetails, { color: colors.textSecondary }]}>
                            Code: {user.employee.employeeCode}
                          </Text>
                          {user.employee.department && (
                            <Text style={[styles.userDetails, { color: colors.textSecondary }]}>
                              Dept: {user.employee.department}
                            </Text>
                          )}
                          {user.employee.designation && (
                            <Text style={[styles.userDetails, { color: colors.textSecondary }]}>
                              Role: {user.employee.designation}
                            </Text>
                          )}
                          {user.employee.salary && (
                            <Text style={[styles.userDetails, { color: colors.success }]}>
                              Salary: ${user.employee.salary.toLocaleString()}
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                    <Badge 
                      label={user.role} 
                      variant={getRoleBadgeVariant(user.role) as any}
                    />
                  </View>

                  <Divider spacing="sm" />

                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[styles.roleButton, { backgroundColor: colors.errorLight }]}
                      onPress={() => handleUpdateRole(user.id, 'ADMIN')}
                      disabled={user.role === 'ADMIN'}
                    >
                      <Text style={[styles.roleButtonText, { color: colors.error }]}>Admin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, { backgroundColor: colors.warningLight }]}
                      onPress={() => handleUpdateRole(user.id, 'HR')}
                      disabled={user.role === 'HR'}
                    >
                      <Text style={[styles.roleButtonText, { color: colors.warning }]}>HR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, { backgroundColor: colors.primaryLight }]}
                      onPress={() => handleUpdateRole(user.id, 'EMPLOYEE')}
                      disabled={user.role === 'EMPLOYEE'}
                    >
                      <Text style={[styles.roleButtonText, { color: colors.primary }]}>Employee</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(user.id, user.fullName)}
                    >
                      <Ionicons name="trash" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Create User Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create New User</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter full name"
                placeholderTextColor={colors.textTertiary}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter email"
                placeholderTextColor={colors.textTertiary}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor={colors.textTertiary}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />

              <Text style={[styles.label, { color: colors.text }]}>Role *</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalRoleButton,
                    formData.role === 'EMPLOYEE' && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'EMPLOYEE' })}
                >
                  <Text style={[styles.modalRoleButtonText, { color: formData.role === 'EMPLOYEE' ? colors.primary : colors.textSecondary }]}>
                    Employee
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalRoleButton,
                    formData.role === 'HR' && { backgroundColor: colors.warningLight }
                  ]}
                  onPress={() => setFormData({ ...formData, role: 'HR' })}
                >
                  <Text style={[styles.modalRoleButtonText, { color: formData.role === 'HR' ? colors.warning : colors.textSecondary }]}>
                    HR
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Employee Code</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter employee code"
                placeholderTextColor={colors.textTertiary}
                value={formData.employeeCode}
                onChangeText={(text) => setFormData({ ...formData, employeeCode: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Department</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter department"
                placeholderTextColor={colors.textTertiary}
                value={formData.department}
                onChangeText={(text) => setFormData({ ...formData, department: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Designation</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter designation"
                placeholderTextColor={colors.textTertiary}
                value={formData.designation}
                onChangeText={(text) => setFormData({ ...formData, designation: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Salary</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="Enter salary"
                placeholderTextColor={colors.textTertiary}
                value={formData.salary?.toString() || ''}
                onChangeText={(text) => setFormData({ ...formData, salary: text ? parseFloat(text) : undefined })}
                keyboardType="numeric"
              />

              <Button
                title="Create User"
                onPress={handleCreateUser}
                variant="primary"
                size="lg"
                disabled={creating}
                style={styles.createButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    letterSpacing: -0.8,
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
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
  },
  userCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  userEmail: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  userDetails: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
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
    marginBottom: 4,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  modalRoleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalRoleButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  createButton: {
    marginTop: 24,
  },
});
