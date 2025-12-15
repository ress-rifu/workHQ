import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as ExpoLocation from 'expo-location';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, SidebarToggle } from '../../../components/layout';
import { Card, Button, Badge, LoadingSpinner, Divider } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminLocation } from '../../../services/admin.service';

const isWeb = Platform.OS === 'web';

// Conditionally import react-native-maps only on native platforms
let MapView: any = null;
let Marker: any = null;
let Circle: any = null;
let PROVIDER_GOOGLE: any = null;

if (!isWeb) {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Circle = Maps.Circle;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

export default function LocationsManagementScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const mapRef = useRef<any>(null);

  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AdminLocation | null>(null);
  const [userLocation, setUserLocation] = useState<ExpoLocation.LocationObject | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    latitude: 0,
    longitude: 0,
    radiusMeters: 100,
  });

  // Map state
  const [mapRegion, setMapRegion] = useState({
    latitude: 23.8103, // Dhaka, Bangladesh default
    longitude: 90.4125,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedMapPosition, setSelectedMapPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (profile?.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    loadLocations();
    getCurrentLocation();
  }, [profile, router]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });
      
      setUserLocation(location);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await adminService.getAllLocations();
      if (response.success && response.data) {
        setLocations(response.data);
        
        // Center map on first location if available
        if (response.data.length > 0 && !userLocation) {
          const firstLocation = response.data[0];
          setMapRegion({
            latitude: firstLocation.latitude,
            longitude: firstLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      } else {
        setError(response.error || 'Failed to load locations');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedMapPosition({ latitude, longitude });
    setFormData({
      ...formData,
      latitude,
      longitude,
    });
  };

  const handleUseCurrentLocation = async () => {
    if (!userLocation) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    const { latitude, longitude } = userLocation.coords;
    setSelectedMapPosition({ latitude, longitude });
    setFormData({
      ...formData,
      latitude,
      longitude,
    });
    
    // Center map on current location
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const handleCreateLocation = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (!selectedMapPosition && (formData.latitude === 0 || formData.longitude === 0)) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    if (formData.radiusMeters < 10 || formData.radiusMeters > 10000) {
      Alert.alert('Error', 'Radius must be between 10 and 10,000 meters');
      return;
    }

    setCreating(true);
    try {
      const response = await adminService.createLocation({
        name: formData.name.trim(),
        latitude: selectedMapPosition?.latitude || formData.latitude,
        longitude: selectedMapPosition?.longitude || formData.longitude,
        radiusMeters: formData.radiusMeters,
      });

      if (response.success) {
        Alert.alert('Success', 'Location created successfully');
        setShowCreateModal(false);
        resetForm();
        loadLocations();
      } else {
        Alert.alert('Error', response.error || 'Failed to create location');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!selectedLocation) return;

    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a location name');
      return;
    }

    if (formData.radiusMeters < 10 || formData.radiusMeters > 10000) {
      Alert.alert('Error', 'Radius must be between 10 and 10,000 meters');
      return;
    }

    setCreating(true);
    try {
      const response = await adminService.updateLocation(selectedLocation.id, {
        name: formData.name.trim(),
        latitude: selectedMapPosition?.latitude || formData.latitude,
        longitude: selectedMapPosition?.longitude || formData.longitude,
        radiusMeters: formData.radiusMeters,
      });

      if (response.success) {
        Alert.alert('Success', 'Location updated successfully');
        setShowEditModal(false);
        resetForm();
        loadLocations();
      } else {
        Alert.alert('Error', response.error || 'Failed to update location');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLocation = (location: AdminLocation) => {
    Alert.alert(
      'Delete Location',
      `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminService.deleteLocation(location.id);
              if (response.success) {
                Alert.alert('Success', 'Location deleted successfully');
                loadLocations();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete location');
              }
            } catch (err: any) {
              Alert.alert('Error', err.message || 'An error occurred');
            }
          }
        }
      ]
    );
  };

  const handleEditLocation = (location: AdminLocation) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusMeters: location.radiusMeters,
    });
    setSelectedMapPosition({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: 0,
      longitude: 0,
      radiusMeters: 100,
    });
    setSelectedMapPosition(null);
    setSelectedLocation(null);
  };

  const handleViewOnMap = (location: AdminLocation) => {
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  if (isWeb || !MapView) {
    return (
      <Screen safe padding={false}>
        <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <SidebarToggle />
              <View>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Admin</Text>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Locations</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={[styles.webMessage, { backgroundColor: colors.background }]}>
          <Ionicons name="map-outline" size={64} color={colors.primary} />
          <Text style={[styles.webMessageTitle, { color: colors.text }]}>
            {isWeb ? 'Mobile Only Feature' : 'Development Build Required'}
          </Text>
          <Text style={[styles.webMessageText, { color: colors.textSecondary }]}>
            {isWeb 
              ? 'Location management with maps is only available on mobile devices.'
              : 'Maps require a development build. Please run `npx expo run:android` or `npx expo run:ios` to use this feature.'
            }
          </Text>
        </View>
      </Screen>
    );
  }

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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Locations</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map Overview */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={mapRegion}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={isDark ? darkMapStyle : []}
          >
            {locations.map((location) => (
              <React.Fragment key={location.id}>
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={location.name}
                  description={`Radius: ${location.radiusMeters}m`}
                  pinColor={colors.primary}
                />
                <Circle
                  center={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  radius={location.radiusMeters}
                  fillColor="rgba(59, 130, 246, 0.2)"
                  strokeColor="rgba(59, 130, 246, 0.8)"
                  strokeWidth={2}
                />
              </React.Fragment>
            ))}
          </MapView>
        </View>

        <View style={styles.content}>
          {error ? (
            <Card padding="lg" shadow="sm">
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </Card>
          ) : locations.length === 0 ? (
            <Card padding="lg" shadow="sm">
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No locations found. Add your first office location.
              </Text>
            </Card>
          ) : (
            locations.map((location) => (
              <Card key={location.id} padding="md" shadow="sm" style={styles.locationCard}>
                <View style={styles.locationHeader}>
                  <View style={styles.locationInfo}>
                    <Text style={[styles.locationName, { color: colors.text }]}>
                      {location.name}
                    </Text>
                    <Text style={[styles.locationCoords, { color: colors.textSecondary }]}>
                      📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </Text>
                    <Text style={[styles.locationRadius, { color: colors.textSecondary }]}>
                      ⭕ Radius: {location.radiusMeters}m
                    </Text>
                  </View>
                </View>

                <Divider spacing="sm" />

                <View style={styles.locationActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.infoLight }]}
                    onPress={() => handleViewOnMap(location)}
                  >
                    <Ionicons name="map" size={16} color={colors.info} />
                    <Text style={[styles.actionButtonText, { color: colors.info }]}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                    onPress={() => handleEditLocation(location)}
                  >
                    <Ionicons name="pencil" size={16} color={colors.primary} />
                    <Text style={[styles.actionButtonText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
                    onPress={() => handleDeleteLocation(location)}
                  >
                    <Ionicons name="trash" size={16} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create/Edit Location Modal */}
      <Modal
        visible={showCreateModal || showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {showEditModal ? 'Edit Location' : 'Add New Location'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Map for location selection */}
              <View style={styles.modalMapContainer}>
                <MapView
                  style={styles.modalMap}
                  provider={PROVIDER_GOOGLE}
                  region={mapRegion}
                  onPress={handleMapPress}
                  showsUserLocation
                  customMapStyle={isDark ? darkMapStyle : []}
                >
                  {selectedMapPosition && (
                    <>
                      <Marker
                        coordinate={selectedMapPosition}
                        pinColor={colors.primary}
                        draggable
                        onDragEnd={(e) => {
                          const { latitude, longitude } = e.nativeEvent.coordinate;
                          setSelectedMapPosition({ latitude, longitude });
                          setFormData({ ...formData, latitude, longitude });
                        }}
                      />
                      <Circle
                        center={selectedMapPosition}
                        radius={formData.radiusMeters}
                        fillColor="rgba(59, 130, 246, 0.2)"
                        strokeColor="rgba(59, 130, 246, 0.8)"
                        strokeWidth={2}
                      />
                    </>
                  )}
                </MapView>
                <TouchableOpacity
                  style={[styles.currentLocationButton, { backgroundColor: colors.primary }]}
                  onPress={handleUseCurrentLocation}
                >
                  <Ionicons name="locate" size={20} color="#FFFFFF" />
                  <Text style={styles.currentLocationText}>Use Current Location</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Tap on the map to select a location or drag the marker
              </Text>

              <Text style={[styles.label, { color: colors.text }]}>Location Name *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="e.g., Main Office, Branch 1"
                placeholderTextColor={colors.textTertiary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={[styles.label, { color: colors.text }]}>Latitude</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="23.8103"
                placeholderTextColor={colors.textTertiary}
                value={selectedMapPosition?.latitude.toFixed(6) || formData.latitude.toString()}
                onChangeText={(text) => setFormData({ ...formData, latitude: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />

              <Text style={[styles.label, { color: colors.text }]}>Longitude</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="90.4125"
                placeholderTextColor={colors.textTertiary}
                value={selectedMapPosition?.longitude.toFixed(6) || formData.longitude.toString()}
                onChangeText={(text) => setFormData({ ...formData, longitude: parseFloat(text) || 0 })}
                keyboardType="numeric"
              />

              <Text style={[styles.label, { color: colors.text }]}>Geofence Radius (meters) *</Text>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                placeholder="100"
                placeholderTextColor={colors.textTertiary}
                value={formData.radiusMeters.toString()}
                onChangeText={(text) => setFormData({ ...formData, radiusMeters: parseInt(text) || 100 })}
                keyboardType="numeric"
              />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Employees must be within this radius to check in
              </Text>

              <Button
                title={showEditModal ? 'Update Location' : 'Create Location'}
                onPress={showEditModal ? handleUpdateLocation : handleCreateLocation}
                variant="primary"
                size="lg"
                disabled={creating}
                style={styles.submitButton}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

// Dark map style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
];

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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mapContainer: {
    height: 300,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  locationCard: {
    marginBottom: 16,
    borderRadius: 16,
  },
  locationHeader: {
    marginBottom: 12,
  },
  locationInfo: {
    gap: 6,
  },
  locationName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.3,
  },
  locationCoords: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  locationRadius: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  modalMapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  modalMap: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  currentLocationText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
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
  hint: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: 8,
    marginTop: 4,
  },
  submitButton: {
    marginTop: 24,
  },
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  webMessageTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  webMessageText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
});
