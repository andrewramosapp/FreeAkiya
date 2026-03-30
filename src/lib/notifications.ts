import { Platform } from 'react-native';
import { registerPushToken } from './api';

// Lazy-load expo-notifications so it doesn't crash in Expo Go / simulators
// where the native ExpoPushTokenManager module isn't available.
async function getNotifications() {
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

export async function setupNotificationHandler() {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications(email: string): Promise<string | null> {
  // Check if running on a real device (not simulator)
  try {
    const Device = await import('expo-device');
    if (!Device.isDevice) return null;
  } catch {
    return null; // expo-device not available
  }

  const Notifications = await getNotifications();
  if (!Notifications) return null; // native module not available (Expo Go)

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'CheapAkiya',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (token && email) {
      await registerPushToken(email, token);
    }
    return token;
  } catch {
    return null; // silently fail — notifications are non-critical
  }
}
