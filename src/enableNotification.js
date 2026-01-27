import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const enableNotification = async () => {
  try {
    // Register service worker first (FIX: swReg was undefined)
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Permission denied");
      return null;
    }

    // Get VAPID key - use hardcoded if env is not set
    const vapidKey = import.meta.env.VITE_FB_VAPID_KEY || "BH7VzKvZ79IAujnrQmNu1V-l0fHJhJIRpg1E6QvK8XK4YL2LtCzGaiSlei7wZ9bR9Xk0kALYj-G-px2jRlT13Pg";
    
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      console.error("❌ No FCM token received");
      alert("Failed to get notification token");
      return null;
    }

    console.log("🔥 FCM TOKEN:", token);
    console.log("FCM TOKEN length:", token?.length);
    console.log("FCM TOKEN preview:", token.slice(0, 30));
    
    // TODO: Save token to backend/database here
    // await api.post('/notifications/save-token', { token });
    
    return token; // Return token so it can be used
  } catch (err) {
    console.error("FCM Error:", err);
    alert("Failed to enable notifications: " + err.message);
    return null;
  }
};

