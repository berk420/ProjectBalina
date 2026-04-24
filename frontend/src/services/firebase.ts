import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const API_URL = process.env.REACT_APP_API_URL ?? 'https://balinaapi.testprocess.com.tr';

let messaging: Messaging | null = null;
let vapidKey: string | undefined;
let initialized = false;

export async function initFirebase(): Promise<void> {
  if (initialized) return;
  try {
    const res = await fetch(`${API_URL}/api/config`);
    const config = await res.json();
    vapidKey = config.vapidKey || undefined;

    const app: FirebaseApp = getApps().length
      ? getApps()[0]
      : initializeApp({
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        });

    messaging = getMessaging(app);
    initialized = true;
  } catch {
    console.warn('Firebase init failed');
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    return await getToken(messaging, { vapidKey });
  } catch (err) {
    console.error('Error getting FCM token:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
