// Enhanced Service Worker for Koouk PWA
const CACHE_NAME = 'koouk-v1';
const OFFLINE_URL = '/';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/manifest.json',
          '/icon-192x192.png',
          '/icon-512x512.png'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Background sync for alarms
self.addEventListener('sync', (event) => {
  if (event.tag === 'alarm-check') {
    console.log('Background sync: checking alarms');
    event.waitUntil(checkAlarms());
  }
});

// Check alarms function for background sync
async function checkAlarms() {
  try {
    // Get current time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Get alarms from localStorage (service worker doesn't have access to React state)
    const alarmsData = await getAlarmsFromStorage();
    
    if (alarmsData && alarmsData.length > 0) {
      alarmsData.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime) {
          showAlarmNotification(alarm);
        }
      });
    }
  } catch (error) {
    console.error('Error checking alarms:', error);
  }
}

// Get alarms from storage (fallback method)
async function getAlarmsFromStorage() {
  try {
    const clients = await self.clients.matchAll();
    if (clients.length > 0) {
      // Try to get data from main thread
      clients[0].postMessage({ type: 'GET_ALARMS' });
    }
    
    // Fallback: try to access localStorage equivalent
    return null; // Service workers can't directly access localStorage
  } catch (error) {
    console.error('Error getting alarms:', error);
    return null;
  }
}

// Show alarm notification
function showAlarmNotification(alarm) {
  const options = {
    body: `시간이 되었습니다! (${alarm.time})`,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: `alarm-${alarm.id}`,
    requireInteraction: true,
    actions: [
      {
        action: 'dismiss',
        title: '확인'
      }
    ],
    data: {
      alarm: alarm
    }
  };

  self.registration.showNotification(`⏰ ${alarm.label}`, options);
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Basic caching strategy
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
  }
});