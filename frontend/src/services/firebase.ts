import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;
try {
  messaging = getMessaging(app);
} catch {
  console.warn('Firebase Messaging not supported in this environment');
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (err) {
    console.error('Error getting FCM token:', err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}

export { messaging };
