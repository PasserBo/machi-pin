import { useEffect, useState } from 'react';

export type GeolocationPermissionState =
  | PermissionState
  | 'unsupported'
  | 'unknown';

interface RealtimeUserLocationOptions {
  enabled?: boolean;
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

interface RealtimeUserLocationState {
  location: UserLocation | null;
  permission: GeolocationPermissionState;
  error: string | null;
}

const DEFAULT_TIMEOUT_MS = 12000;

export function useRealtimeUserLocation(
  options: RealtimeUserLocationOptions = {},
): RealtimeUserLocationState {
  const {
    enabled = true,
    enableHighAccuracy = true,
    timeout = DEFAULT_TIMEOUT_MS,
    maximumAge = 0,
  } = options;

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permission, setPermission] = useState<GeolocationPermissionState>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (!('geolocation' in navigator)) {
      setPermission('unsupported');
      return;
    }

    let watchId: number | null = null;
    let permissionStatus: PermissionStatus | null = null;
    let isUnmounted = false;

    const handlePosition = (pos: GeolocationPosition) => {
      if (isUnmounted) return;
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
      setError(null);
    };

    const handleError = (geoError: GeolocationPositionError) => {
      if (isUnmounted) return;
      if (geoError.code === geoError.PERMISSION_DENIED) {
        setPermission('denied');
      }
      setError(geoError.message || 'Unable to fetch location');
    };

    const startWatch = () => {
      watchId = navigator.geolocation.watchPosition(handlePosition, handleError, {
        enableHighAccuracy,
        timeout,
        maximumAge,
      });
    };

    const initPermissionAndWatch = async () => {
      if (navigator.permissions?.query) {
        try {
          permissionStatus = await navigator.permissions.query({
            name: 'geolocation',
          });
          if (!isUnmounted) {
            setPermission(permissionStatus.state);
          }
          permissionStatus.onchange = () => {
            if (isUnmounted || !permissionStatus) return;
            setPermission(permissionStatus.state);
          };
        } catch {
          setPermission('unknown');
        }
      }
      startWatch();
    };

    void initPermissionAndWatch();

    return () => {
      isUnmounted = true;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, enableHighAccuracy, timeout, maximumAge]);

  return { location, permission, error };
}
