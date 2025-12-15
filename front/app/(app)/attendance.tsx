import { View, Text, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as ExpoLocation from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Screen, AppHeader, Header, SidebarToggle } from '../../components/layout';
import { Button, Card, Badge, LoadingSpinner } from '../../components/ui';
import { Typography, Spacing } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { attendanceService, Location, TodayStatus } from '../../services/attendance.service';

// Web platform check - Maps don't work on web
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

export default function AttendanceScreen() {
  const { colors } = useTheme();

  // Show web-specific message if on web
  if (isWeb) {
    return (
      <Screen hasHeader>
        <AppHeader title="Attendance" subtitle="Check In & Out" />
        <View style={[styles.webMessage, { backgroundColor: colors.background }]}>
          <Ionicons name="phone-portrait-outline" size={64} color={colors.primary} />
          <Text style={[styles.webMessageTitle, { color: colors.text }]}>
            Mobile Only Feature
          </Text>
          <Text style={[styles.webMessageText, { color: colors.textSecondary }]}>
            The Attendance system uses GPS and Maps, which are only available on mobile devices.
          </Text>
          <Text style={[styles.webMessageText, { color: colors.textSecondary }]}>
            Please use the Expo Go app on your phone to access this feature.
          </Text>
          <View style={styles.webMessageSteps}>
            <Text style={[styles.webMessageStep, { color: colors.textSecondary }]}>
              📱 1. Install Expo Go on your phone
            </Text>
            <Text style={[styles.webMessageStep, { color: colors.textSecondary }]}>
              📷 2. Scan the QR code in the terminal
            </Text>
            <Text style={[styles.webMessageStep, { color: colors.textSecondary }]}>
              📍 3. Allow location permissions
            </Text>
            <Text style={[styles.webMessageStep, { color: colors.textSecondary }]}>
              ✅ 4. Check in/out with GPS
            </Text>
          </View>
        </View>
      </Screen>
    );
  }

  // If maps not available, show mobile-only message
  if (!MapView) {
    return (
      <Screen hasHeader>
        <AppHeader title="Attendance" subtitle="Check In & Out" />
        <View style={[styles.webMessage, { backgroundColor: colors.background }]}>
          <Ionicons name="phone-portrait-outline" size={64} color={colors.primary} />
          <Text style={[styles.webMessageTitle, { color: colors.text }]}>
            Development Build Required
          </Text>
          <Text style={[styles.webMessageText, { color: colors.textSecondary }]}>
            Maps require a development build. Please run `npx expo run:android` or `npx expo run:ios` to use this feature.
          </Text>
        </View>
      </Screen>
    );
  }

  return <AttendanceScreenMobile />;
}

function AttendanceScreenMobile() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { profile } = useAuth();
  const mapRef = useRef<any>(null);

  const isHROrAdmin = profile?.role === 'HR' || profile?.role === 'ADMIN';

  const [location, setLocation] = useState<ExpoLocation.LocationObject | null>(null);
  const [officeLocation, setOfficeLocation] = useState<Location | null>(null);
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [withinRadius, setWithinRadius] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Initializing...');

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const initStart = Date.now();

      // Step 1: Request permission first (required)
      setLoadingStep('Requesting location permission...');
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        setPermissionDenied(true);
        return;
      }

      // Step 2: Load everything in parallel for speed
      setLoadingStep('Loading office location and your position...');
      const parallelStart = Date.now();
      const [officeRes, statusRes, locationRes] = await Promise.all([
        attendanceService.getPrimaryLocation().catch(err => {
          console.error('Office location error:', err);
          return { success: false, error: err.message, data: null };
        }),
        attendanceService.getTodayStatus().catch(err => {
          console.error('Today status error:', err);
          return { success: false, error: err.message, data: null };
        }),
        // Use BALANCED accuracy for faster initial load (upgrade later if needed)
        ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        }).catch(err => {
          console.error('Location error:', err);
          return null;
        }),
      ]);
      if (__DEV__) console.log(`⚡ Parallel calls: ${Date.now() - parallelStart}ms`);

      // Process results
      setLoadingStep('Processing location data...');
      if (officeRes.success && officeRes.data) {
        setOfficeLocation(officeRes.data);

        // Calculate distance if we have location
        if (locationRes) {
          setLocation(locationRes);
          const dist = getDistanceFromLatLonInMeters(
            locationRes.coords.latitude,
            locationRes.coords.longitude,
            officeRes.data.latitude,
            officeRes.data.longitude
          );
          setDistance(dist);
          setWithinRadius(dist <= officeRes.data.radiusMeters);
        }
      } else {
        setError(officeRes.error || 'No office location found');
      }

      if (statusRes.success && statusRes.data) {
        setTodayStatus(statusRes.data);
      }

      if (locationRes) {
        setLocation(locationRes);
      } else {
        // Don't set error for location if it's not critical - just log warning
        console.warn('Location not available, but continuing...');
      }

      setLoading(false);
      if (__DEV__) console.log(`⚡ Attendance initialization: ${Date.now() - initStart}ms`);
    } catch (err: any) {
      console.error('❌ Attendance initialization error:', err);
      setError(err.message || 'Failed to initialize attendance');
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      // First check current permission status
      const { status: currentStatus } = await ExpoLocation.getForegroundPermissionsAsync();

      if (currentStatus === 'granted') {
        return true;
      }

      // Request permission
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission is required for attendance tracking');

        // Check if we can ask again or if it's permanently denied
        const canAskAgain = status !== 'denied';

        Alert.alert(
          'Location Permission Required',
          'WorkHQ needs access to your location to track attendance. This ensures you are at the office when checking in.',
          canAskAgain
            ? [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Grant Permission', onPress: () => requestLocationPermission() }
            ]
            : [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
        );
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Permission error:', err);
      setError('Failed to request location permission');
      Alert.alert(
        'Error',
        'Unable to request location permission. Please check your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  const loadOfficeLocation = async () => {
    try {
      const response = await attendanceService.getPrimaryLocation();

      if (response.success && response.data) {
        setOfficeLocation(response.data);
      } else {
        setError(response.error || 'No office location found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load office location');
    }
  };

  const loadTodayStatus = async () => {
    try {
      console.log('🔄 Loading today status...');
      const response = await attendanceService.getTodayStatus();

      if (response.success && response.data) {
        console.log('✅ Today status loaded:', {
          hasCheckedIn: response.data.hasCheckedIn,
          hasCheckedOut: response.data.hasCheckedOut,
          checkInTime: response.data.checkIn?.timestamp,
          checkOutTime: response.data.checkOut?.timestamp,
        });
        setTodayStatus(response.data);
      }
    } catch (err: any) {
      console.error('❌ Failed to load today status:', err);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);

      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      setLocation(loc);

      if (officeLocation) {
        calculateDistance(loc);
      }
    } catch (err: any) {
      console.error('Get location error:', err);
      setError('Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const calculateDistance = (userLoc: ExpoLocation.LocationObject) => {
    if (!officeLocation) return;

    const dist = getDistanceFromLatLonInMeters(
      userLoc.coords.latitude,
      userLoc.coords.longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    console.log('📍 Location Debug:');
    console.log('  Your location:', userLoc.coords.latitude.toFixed(6), userLoc.coords.longitude.toFixed(6));
    console.log('  Office location:', officeLocation.latitude.toFixed(6), officeLocation.longitude.toFixed(6));
    console.log('  Distance:', Math.round(dist), 'm');
    console.log('  Radius:', officeLocation.radiusMeters, 'm');
    console.log('  Within range:', dist <= officeLocation.radiusMeters);

    setDistance(dist);
    setWithinRadius(dist <= officeLocation.radiusMeters);
  };

  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const handleCheckIn = async () => {
    if (!location || !officeLocation) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    if (!withinRadius) {
      const debugInfo = __DEV__
        ? `\n\nDebug Info:\nYour: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}\nOffice: ${officeLocation.latitude.toFixed(6)}, ${officeLocation.longitude.toFixed(6)}`
        : '';

      Alert.alert(
        'Out of Range',
        `You are ${formatDistance(distance!)} away from the office. Please be within ${officeLocation.radiusMeters}m to check in.${debugInfo}`
      );
      return;
    }

    try {
      setChecking(true);
      console.log('⏰ Attempting check-in...');

      const response = await attendanceService.checkIn({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationId: officeLocation.id,
      });

      if (response.success) {
        console.log('✅ Check-in successful!', response.data);
        Alert.alert('Success', 'Checked in successfully!');

        // Reload today's status to update UI
        await loadTodayStatus();

        console.log('🔄 UI should now show check-in time');
      } else {
        console.error('❌ Check-in failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to check in');
      }
    } catch (err: any) {
      console.error('❌ Check-in error:', err);
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    try {
      setChecking(true);
      console.log('⏰ Attempting check-out...');

      const response = await attendanceService.checkOut({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (response.success) {
        console.log('✅ Check-out successful!', response.data);
        Alert.alert('Success', 'Checked out successfully!');

        // Reload today's status to update UI
        await loadTodayStatus();

        console.log('🔄 UI should now show check-out time');
      } else {
        console.error('❌ Check-out failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to check out');
      }
    } catch (err: any) {
      console.error('❌ Check-out error:', err);
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setChecking(false);
    }
  };

  const centerMapOnOffice = () => {
    if (officeLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: officeLocation.latitude,
        longitude: officeLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  if (loading) {
    return (
      <Screen safe>
        <Header title="Attendance" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>{loadingStep}</Text>
        </View>
      </Screen>
    );
  }

  if (permissionDenied) {
    return (
      <Screen safe>
        <Header title="Attendance" />
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Location Permission Required</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            WorkHQ needs access to your location to track attendance and verify you are at the office.
          </Text>
          <View style={styles.errorActions}>
            <Button
              title="Grant Permission"
              onPress={async () => {
                setPermissionDenied(false);
                setLoading(true);
                await initialize();
              }}
              style={styles.retryButton}
            />
            <Button
              title="Open Settings"
              variant="outline"
              onPress={() => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }}
              style={styles.retryButton}
            />
          </View>
        </View>
      </Screen>
    );
  }

  if (error && !officeLocation) {
    return (
      <Screen safe>
        <Header title="Attendance" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Button title="Retry" onPress={initialize} style={styles.retryButton} />
        </View>
      </Screen>
    );
  }

  const canCheckIn = !todayStatus?.hasCheckedIn && withinRadius && !checking;
  const canCheckOut = todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut && !checking;

  return (
    <Screen safe padding={false}>
      <View style={[styles.fixedHeader, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <SidebarToggle />
            <View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Attendance</Text>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Check In & Out</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { borderColor: colors.border }]}
              onPress={() => router.push('/attendance-history' as any)}
            >
              <Ionicons name="time-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mapContainer}>
          {officeLocation ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: officeLocation.latitude,
                longitude: officeLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              customMapStyle={isDark ? darkMapStyle : undefined}
              onMapReady={() => {
                console.log('✅ Map loaded successfully');
              }}
            >
              <Marker
                coordinate={{
                  latitude: officeLocation.latitude,
                  longitude: officeLocation.longitude,
                }}
                title={officeLocation.name}
                description="Office Location"
              >
                <View
                  style={[
                    styles.markerContainer,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.background,
                    },
                  ]}
                >
                  <Ionicons name="business" size={24} color="#FFFFFF" />
                </View>
              </Marker>

              <Circle
                center={{
                  latitude: officeLocation.latitude,
                  longitude: officeLocation.longitude,
                }}
                radius={officeLocation.radiusMeters}
                fillColor={withinRadius ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)'}
                strokeColor={withinRadius ? colors.success : colors.error}
                strokeWidth={2}
              />
            </MapView>
          ) : (
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
                Loading map...
              </Text>
            </View>
          )}

          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={centerMapOnOffice}
              activeOpacity={0.7}
            >
              <Ionicons name="business" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mapButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
              activeOpacity={0.7}
            >
              {loadingLocation ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="locate" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Card padding="md" shadow="md" style={styles.card}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusIcon,
                  {
                    backgroundColor: withinRadius ? colors.successLight : colors.errorLight,
                  },
                ]}
              >
                <Ionicons
                  name={withinRadius ? 'checkmark-circle' : 'close-circle'}
                  size={24}
                  color={withinRadius ? colors.success : colors.error}
                />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                  Distance from Office
                </Text>
                <Text style={[styles.statusValue, { color: colors.text }]}>
                  {distance !== null ? formatDistance(distance) : 'Calculating...'}
                </Text>
                <Badge
                  label={withinRadius ? 'Within Range' : 'Out of Range'}
                  variant={withinRadius ? 'success' : 'error'}
                  size="sm"
                />
              </View>
            </View>
          </Card>

          {todayStatus && (
            <Card padding="md" shadow="md" style={styles.card}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Status</Text>

              <View style={styles.timeRow}>
                <View style={styles.timeItem}>
                  <Ionicons name="log-in-outline" size={20} color={colors.success} />
                  <View style={styles.timeInfo}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                      Check In
                    </Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {todayStatus.checkIn
                        ? new Date(todayStatus.checkIn.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '--:--'}
                    </Text>
                  </View>
                </View>

                <View style={styles.timeItem}>
                  <Ionicons name="log-out-outline" size={20} color={colors.error} />
                  <View style={styles.timeInfo}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                      Check Out
                    </Text>
                    <Text style={[styles.timeValue, { color: colors.text }]}>
                      {todayStatus.checkOut
                        ? new Date(todayStatus.checkOut.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '--:--'}
                    </Text>
                  </View>
                </View>
              </View>

              {todayStatus.workingHours > 0 && (
                <View style={[styles.hoursDisplay, { backgroundColor: colors.backgroundTertiary }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <Text style={[styles.hoursText, { color: colors.text }]}>
                    {todayStatus.workingHours.toFixed(1)} hours worked
                  </Text>
                </View>
              )}
            </Card>
          )}

          {canCheckIn && (
            <Button
              title="Check In"
              onPress={handleCheckIn}
              loading={checking}
              disabled={!canCheckIn}
              fullWidth
              size="lg"
              icon={<Ionicons name="log-in-outline" size={24} color="#FFFFFF" />}
              style={styles.actionButton}
            />
          )}

          {canCheckOut && (
            <Button
              title="Check Out"
              variant="danger"
              onPress={handleCheckOut}
              loading={checking}
              disabled={!canCheckOut}
              fullWidth
              size="lg"
              icon={<Ionicons name="log-out-outline" size={24} color="#FFFFFF" />}
              style={styles.actionButton}
            />
          )}

          {todayStatus?.hasCheckedOut && (
            <Card padding="lg" shadow="sm" style={styles.completedCard}>
              <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
              <Text style={[styles.completedText, { color: colors.text }]}>
                Attendance complete for today!
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

// Dark map style
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

const styles = StyleSheet.create({
  fixedHeader: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    opacity: 0.65,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    paddingBottom: 160,
    paddingTop: 12,
    gap: 24,
  },
  mapContainer: {
    height: 360,
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 16,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    minHeight: 360,
  },
  mapPlaceholderText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 12,
  },
  mapButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  markerContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingTop: 24,
    flex: 1,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    gap: 6,
  },
  statusLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.1,
  },
  statusValue: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    letterSpacing: 0.2,
  },
  timeValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  hoursDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
  },
  hoursText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.1,
  },
  actionButton: {
    marginBottom: 16,
    borderRadius: 16,
    height: 56,
  },
  completedCard: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  completedText: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 20,
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 8,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.1,
    maxWidth: 320,
  },
  errorActions: {
    marginTop: 16,
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  retryButton: {
    borderRadius: 16,
    height: 52,
  },
  // Web-only styles
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 20,
  },
  webMessageTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  webMessageText: {
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  webMessageSteps: {
    marginTop: 24,
    gap: 16,
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  webMessageStep: {
    fontSize: Typography.fontSize.lg,
    textAlign: 'left',
    lineHeight: 28,
    letterSpacing: 0.1,
  },
});

