import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ExpoLocation from 'expo-location';
import { useTheme } from '../../../contexts/ThemeContext';
import { Screen, AppHeader } from '../../../components/layout';
import { Button, Card, Badge, LoadingSpinner } from '../../../components/ui';
import { Typography, Spacing } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { attendanceService, Location, TodayStatus } from '../../../services/attendance.service';

// Web platform check - Maps don't work on web
const isWeb = Platform.OS === 'web';

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

  return <AttendanceScreenMobile />;
}

function AttendanceScreenMobile() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<ExpoLocation.LocationObject | null>(null);
  const [officeLocation, setOfficeLocation] = useState<Location | null>(null);
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [withinRadius, setWithinRadius] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    await requestLocationPermission();
    await loadOfficeLocation();
    await loadTodayStatus();
    await getCurrentLocation();
    setLoading(false);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission is required for attendance');
        Alert.alert(
          'Permission Required',
          'Please enable location services to use the attendance feature.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Permission error:', err);
      setError('Failed to request location permission');
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
      const response = await attendanceService.getTodayStatus();
      
      if (response.success && response.data) {
        setTodayStatus(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load today status:', err);
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
      Alert.alert(
        'Out of Range',
        `You are ${formatDistance(distance!)} away from the office. Please be within ${officeLocation.radiusMeters}m to check in.`
      );
      return;
    }

    try {
      setChecking(true);
      
      const response = await attendanceService.checkIn({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationId: officeLocation.id,
      });

      if (response.success) {
        Alert.alert('Success', 'Checked in successfully!');
        await loadTodayStatus();
      } else {
        Alert.alert('Error', response.error || 'Failed to check in');
      }
    } catch (err: any) {
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
      
      const response = await attendanceService.checkOut({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (response.success) {
        Alert.alert('Success', 'Checked out successfully!');
        await loadTodayStatus();
      } else {
        Alert.alert('Error', response.error || 'Failed to check out');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setChecking(false);
    }
  };

  const centerMapOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
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
    return <LoadingSpinner fullScreen />;
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
    <Screen safe padding={false} hasHeader>
      <AppHeader
        title="Attendance"
        subtitle="Check In & Out"
        rightAction={{
          icon: 'time-outline',
          onPress: () => router.push('/attendance/history' as any),
        }}
      />

      {/* Map View */}
      <View style={styles.mapContainer}>
        {officeLocation && (
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
          >
            {/* Office Location Marker */}
            <Marker
              coordinate={{
                latitude: officeLocation.latitude,
                longitude: officeLocation.longitude,
              }}
              title={officeLocation.name}
              description="Office Location"
            >
              <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
                <Ionicons name="business" size={24} color="#FFFFFF" />
              </View>
            </Marker>

            {/* Geofence Circle */}
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
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <Button
            variant="outline"
            onPress={centerMapOnOffice}
            style={[styles.mapButton, { backgroundColor: colors.background }]}
            icon={<Ionicons name="business-outline" size={20} color={colors.primary} />}
          />
          <Button
            variant="outline"
            onPress={centerMapOnUser}
            loading={loadingLocation}
            onPress={getCurrentLocation}
            style={[styles.mapButton, { backgroundColor: colors.background }]}
            icon={<Ionicons name="locate" size={20} color={colors.primary} />}
          />
        </View>
      </View>

      {/* Status Cards */}
      <View style={styles.content}>
        {/* Distance Status */}
        <Card padding="md" shadow="md" style={styles.card}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: withinRadius
                    ? colors.successLight
                    : colors.errorLight,
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

        {/* Today's Status */}
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

        {/* Action Buttons */}
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
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    gap: Spacing.sm,
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 0,
  },
  markerContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: Spacing.md,
    flex: 1,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  statusLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  statusValue: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  timeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeInfo: {
    flex: 1,
  },
  timeLabel: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  timeValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 2,
  },
  hoursDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  hoursText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semibold,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  completedCard: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  completedText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.medium,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  // Web-only styles
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  webMessageTitle: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  webMessageText: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  webMessageSteps: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
    alignSelf: 'stretch',
  },
  webMessageStep: {
    fontSize: Typography.fontSize.md,
    textAlign: 'left',
  },
});


