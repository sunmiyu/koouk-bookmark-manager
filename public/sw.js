// KOOUK Service Worker - Supabase 통합 버전
const CACHE_NAME = 'koouk-v2.0.0';
const STATIC_CACHE = 'koouk-static-v2.0.0';
const DYNAMIC_CACHE = 'koouk-dynamic-v2.0.0';
const API_CACHE = 'koouk-api-v2.0.0';

// 캐시할 정적 리소스들 - 실제 존재하는 파일들만
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192x192.png', 
  '/icon-512x512.png',
  '/koouk-logo.svg',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png'
];

// 설치 이벤트 - 안전한 캐시 설치
self.addEventListener('install', (event) => {
  console.log('🚀 KOOUK Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        console.log('📦 Caching static assets');
        
        // 각 리소스를 개별적으로 캐시 (404 에러 방지)
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
            console.log('✅ Cached:', asset);
          } catch (error) {
            console.warn('⚠️ Failed to cache:', asset, error.message);
          }
        });
        
        await Promise.all(cachePromises);
        console.log('✅ Static assets caching completed');
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
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== API_CACHE) {
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

// Fetch 이벤트 - 향상된 캐싱 전략
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Supabase API 요청 처리
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(handleSupabaseRequest(event.request));
    return;
  }
  
  // POST 요청은 캐시하지 않음 (단, 오프라인 큐에 저장)
  if (event.request.method !== 'GET') {
    if (url.origin === location.origin) {
      event.respondWith(handleNonGetRequest(event.request));
    }
    return;
  }

  // 같은 도메인의 GET 요청 처리
  if (url.origin === location.origin) {
    event.respondWith(handleSameOriginRequest(event.request));
  }
});

// Supabase 요청 처리
async function handleSupabaseRequest(request) {
  try {
    const response = await fetch(request);
    
    // 읽기 요청의 경우 성공한 응답을 캐시
    if (request.method === 'GET' && response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 오프라인 시 캐시된 데이터 반환 (GET 요청만)
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📱 오프라인: 캐시된 Supabase 데이터 반환');
        return cachedResponse;
      }
    }
    
    // 오프라인에서 변경 요청은 큐에 저장
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      await queueOfflineRequest(request);
    }
    
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '오프라인 상태입니다. 연결 시 동기화됩니다.',
        queued: ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 동일 도메인 요청 처리
async function handleSameOriginRequest(request) {
  try {
    const response = await fetch(request);
    
    // 성공적인 응답 캐시
    if (response && response.status === 200 && response.headers.get('cache-control') !== 'no-cache') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 캐시에서 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // API 요청인 경우
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'offline',
          message: '오프라인 상태입니다. 연결을 확인해주세요.'
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        }
      );
    }
    
    // HTML 페이지인 경우
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlinePage = await caches.match('/offline');
      const homePage = await caches.match('/');
      
      return offlinePage || homePage || new Response(
        '오프라인 상태입니다.', 
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }
    
    return new Response('리소스를 찾을 수 없습니다.', { status: 404 });
  }
}

// POST/PUT/DELETE 등의 요청 처리
async function handleNonGetRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // 오프라인에서는 큐에 저장
    await queueOfflineRequest(request);
    
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '요청이 오프라인 큐에 저장되었습니다. 연결 시 자동으로 처리됩니다.',
        queued: true
      }),
      {
        status: 202, // Accepted
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

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

// 오프라인 요청 큐 관리
async function queueOfflineRequest(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: [...request.headers.entries()].reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {}),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    };

    const db = await openOfflineDB();
    const transaction = db.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    
    await store.add(requestData);
    console.log('📥 오프라인 요청 큐에 저장:', request.method, request.url);
    
    return true;
  } catch (error) {
    console.error('❌ 오프라인 요청 큐 저장 실패:', error);
    return false;
  }
}

// 오프라인 요청 처리
async function processOfflineQueue() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['requests'], 'readwrite');
    const store = transaction.objectStore('requests');
    const requests = await store.getAll();

    if (requests.length === 0) {
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const requestData of requests) {
      try {
        const response = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });

        if (response.ok) {
          // 성공한 요청은 큐에서 제거
          await store.delete(requestData.id);
          processed++;
          console.log('✅ 오프라인 요청 처리 완료:', requestData.method, requestData.url);
        } else {
          failed++;
        }
      } catch (error) {
        console.error('❌ 오프라인 요청 처리 실패:', error);
        failed++;
      }
    }

    console.log(`🔄 오프라인 동기화 완료: ${processed}개 성공, ${failed}개 실패`);
    return { processed, failed };
  } catch (error) {
    console.error('❌ 오프라인 큐 처리 실패:', error);
    return { processed: 0, failed: 0 };
  }
}

// IndexedDB 초기화
async function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KooukOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('requests')) {
        const store = db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('method', 'method', { unique: false });
      }
    };
  });
}

// 유틸리티 함수들
async function syncOfflineData() {
  try {
    console.log('🔄 Syncing offline data...');
    const result = await processOfflineQueue();
    
    // 클라이언트에게 동기화 완료 알림
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: result
      });
    });
    
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