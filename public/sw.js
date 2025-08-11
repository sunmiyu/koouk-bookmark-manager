// KOOUK Service Worker - 최신 PWA 표준
const CACHE_NAME = 'koouk-v1.2.0';
const STATIC_CACHE = 'koouk-static-v1.2.0';
const DYNAMIC_CACHE = 'koouk-dynamic-v1.2.0';

// 캐시할 정적 리소스들
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png', 
  '/icon-512x512.png',
  // 핵심 페이지들
  '/',
  '/marketplace',
  // 오프라인 페이지
  '/offline'
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('🚀 KOOUK Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Cache installation failed:', error);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('🔄 KOOUK Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch 이벤트 - 네트워크 우선 전략
self.addEventListener('fetch', (event) => {
  // POST 요청은 캐시하지 않음
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // 같은 도메인의 요청만 처리
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공적인 응답인 경우 캐시에 저장
        if (response && response.status === 200) {
          const responseClone = response.clone();
          
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서 찾기
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // API 요청인 경우 JSON 응답
            if (url.pathname.startsWith('/api/')) {
              return new Response(
                JSON.stringify({
                  error: 'Offline mode',
                  message: '오프라인 상태입니다. 연결을 확인해주세요.'
                }),
                {
                  headers: { 'Content-Type': 'application/json' },
                  status: 503
                }
              );
            }
            
            // HTML 페이지인 경우 오프라인 페이지 반환
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline') || 
                     caches.match('/') ||
                     new Response('오프라인 상태입니다.', { 
                       headers: { 'Content-Type': 'text/plain; charset=utf-8' } 
                     });
            }
            
            return new Response('리소스를 찾을 수 없습니다.', { status: 404 });
          });
      })
  );
});

// 백그라운드 동기화 (향후 확장용)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 백그라운드에서 데이터 동기화 로직
      syncOfflineData()
    );
  }
});

// 푸시 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'KOOUK에서 새로운 알림이 있습니다',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: '확인하기',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '닫기', 
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('KOOUK', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 공유 받기 처리
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_RECEIVED') {
    console.log('📤 Share received:', event.data.payload);
    
    // 공유받은 데이터를 처리하는 로직
    event.waitUntil(
      handleSharedContent(event.data.payload)
    );
  }
});

// 유틸리티 함수들
async function syncOfflineData() {
  try {
    console.log('🔄 Syncing offline data...');
    // 오프라인에서 저장된 데이터를 서버와 동기화
    return true;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return false;
  }
}

async function handleSharedContent(content) {
  try {
    console.log('📝 Processing shared content:', content);
    // 공유받은 콘텐츠를 로컬 스토리지에 임시 저장
    // 사용자가 앱을 열 때 처리하도록 함
    return true;
  } catch (error) {
    console.error('❌ Share handling failed:', error);
    return false;
  }
}

// 성능 최적화: 중요하지 않은 리소스는 나중에 캐시
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

console.log('🎉 KOOUK Service Worker loaded successfully!');