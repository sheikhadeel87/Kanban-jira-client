import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBduraiUo1KRaE6Ze4z6XZNMINm79kqZjo",
  authDomain: "kanban-jira-c5bdd.firebaseapp.com",
  projectId: "kanban-jira-c5bdd",
  storageBucket: "kanban-jira-c5bdd.firebasestorage.app",
  messagingSenderId: "606377367576",
  appId: "1:606377367576:web:6239a0dc0ad071a4bc4b6d",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

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

