importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBduraiUo1KRaE6Ze4z6XZNMINm79kqZjo",
  authDomain: "kanban-jira-c5bdd.firebaseapp.com",
  projectId: "kanban-jira-c5bdd",
  messagingSenderId: "606377367576",
  appId: "1:606377367576:web:6239a0dc0ad071a4bc4b6d",
});

const messaging = firebase.messaging();

/** ✅ FCM background message (when delivered by Firebase) */
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] FCM background message:", payload);

  const title = payload?.notification?.title || "FCM Notification";
  const options = {
    body: payload?.notification?.body || "",
    data: payload?.data || {},
  };

  self.registration.showNotification(title, options);
});

/** ✅ DevTools "Push" test (non-FCM) */
self.addEventListener("push", (event) => {
  console.log("[SW] DevTools push event:", event);

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "DevTools Push", body: event.data?.text?.() || "Test push" };
  }

  const title = data.title || "DevTools Push";
  const options = { body: data.body || "Test push from DevTools" };

  event.waitUntil(self.registration.showNotification(title, options));
});

/** ✅ Click action */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("http://localhost:3000/"));
});

