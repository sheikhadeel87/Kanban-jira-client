import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error(
    "[Firebase] VITE_FIREBASE_API_KEY is missing. Check ui/.env and restart the dev server (npm run dev)."
  );
}

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;


export const getRealFcmToken = async () => {
  const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const fcmToken = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FB_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  });

  console.log("✅ REAL FCM TOKEN:", fcmToken);
  console.log("✅ length:", fcmToken?.length);
  return fcmToken;
}

