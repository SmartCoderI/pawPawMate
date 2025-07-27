import { useEffect } from "react";

const useAutoLocationUpdates = (mongoUser, requestLocationUpdate) => {
    useEffect(() => {
        if (!mongoUser?._id) return;

        let locationInterval;
        let permissionCleanup;

        const updateLocationAutomatically = async () => {
            try {
                await requestLocationUpdate();
                console.log('Auto location updated successfully');
            } catch (error) {
                console.log('Auto location update failed:', error);
            }
        };

        locationInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                console.log('Running Periodic Location Update');
                updateLocationAutomatically();
            }
        }, 20 * 60 * 1000); // 20 minutes

        const setupPermissionListener = async () => {
            if (!navigator.permissions) {
                console.warn('Permissions API not supported');
                return;
            }

            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                const handlePermissionChange = () => {
                    console.log('Geolocation permission changed to: ', permission.state);
                    if (permission.state === 'granted') {
                        updateLocationAutomatically();
                    }
                };
                permission.addEventListener('change', handlePermissionChange);
                permissionCleanup = () => {
                    permission.removeEventListener('change', handlePermissionChange);
                };

                // Initital check, if already granted, update location
                if (permission.state === 'granted') {
                    console.log('Permission already granted - updating location on startup');
                    updateLocationAutomatically();
                }
            } catch (error) {
                console.error('Error setting up geolocation permission listener: ', error);
            }
        };
        setupPermissionListener();

        return () => {
            if (locationInterval) clearInterval(locationInterval);
            if (permissionCleanup) permissionCleanup();
        };
    }, [mongoUser?._id, requestLocationUpdate]);
};

export default useAutoLocationUpdates;