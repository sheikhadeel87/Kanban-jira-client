import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";

export const enableNotification = async () => {
  try {
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      alert("Permission denied");
      return null;
    }

    const vapidKey =
      import.meta.env.VITE_FB_VAPID_KEY || "your-firebase-vapid-key";

    const token = await getToken(messaging, {
      vapidKey,
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

    // ✅ Save token to backend
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const authToken = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/push/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" ,
        "Authorization": `Bearer ${authToken}`,
      },
      // credentials: "include",
       body: JSON.stringify({ token, platform: "web" }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("❌ Token save failed:", res.status, json);
      alert(`Token save failed: ${json?.error || res.statusText}`);
      return null;
    }

    console.log("✅ Token saved to backend:", json);

    return token;
  } catch (err) {
    console.error("FCM Error:", err);
    alert("Failed to enable notifications: " + err.message);
    return null;
  }
};
