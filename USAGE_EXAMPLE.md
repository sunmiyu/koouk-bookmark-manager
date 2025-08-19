# 🚀 분리된 Hook 사용법

## 기존 (복잡한 방식)
```javascript
// ❌ 모든 것이 하나의 Hook에 섞여있음
const { 
  user, 
  userProfile, 
  userSettings, 
  status, 
  loading, 
  error,
  updateUserSettings,
  refreshUserData 
} = useAuth()
```

## 새로운 방식 (단일 책임)
```javascript
// ✅ 각각 분리된 책임
const { user, loading } = useAuth()                    // 인증만
const { profile } = useUserProfile(user?.id)           // 프로필만  
const { settings, updateSettings } = useUserSettings(user?.id) // 설정만
```

## 실제 사용 예시

### 1. 간단한 컴포넌트
```javascript
function UserDashboard() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome {user.email}!</div>
}
```

### 2. 프로필이 필요한 컴포넌트
```javascript
function UserProfile() {
  const { user } = useAuth()
  const { profile, loading, updateProfile } = useUserProfile(user?.id)
  
  if (loading) return <div>Loading profile...</div>
  
  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.email}</p>
      <button onClick={() => updateProfile({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  )
}
```

### 3. 설정이 필요한 컴포넌트
```javascript
function UserSettings() {
  const { user } = useAuth()
  const { settings, updateSettings } = useUserSettings(user?.id)
  
  return (
    <div>
      <h2>Theme: {settings?.theme}</h2>
      <button 
        onClick={() => updateSettings({ theme: 'dark' })}
      >
        Switch to Dark Mode
      </button>
    </div>
  )
}
```

### 4. 모든 것이 필요한 복잡한 컴포넌트
```javascript
function CompleteUserPage() {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading } = useUserProfile(user?.id)
  const { settings, updateSettings } = useUserSettings(user?.id)
  
  const isLoading = authLoading || profileLoading
  
  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return (
    <div>
      <h1>Welcome {profile?.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Current theme: {settings?.theme}</p>
      
      <button onClick={() => updateSettings({ theme: 'dark' })}>
        Toggle Theme
      </button>
    </div>
  )
}
```

## 장점

### 1. 단일 책임 원칙
- `useAuth`: 인증만 담당
- `useUserProfile`: 프로필만 담당  
- `useUserSettings`: 설정만 담당

### 2. 선택적 로딩
- 인증이 필요한 곳: `useAuth()`만 사용
- 프로필이 필요한 곳: `useAuth()` + `useUserProfile()` 사용
- 설정이 필요한 곳: `useAuth()` + `useUserSettings()` 사용

### 3. 독립적 에러 처리
```javascript
const { user } = useAuth()
const { profile, error: profileError } = useUserProfile(user?.id)
const { settings, error: settingsError } = useUserSettings(user?.id)

// 각각 독립적으로 에러 처리 가능
if (profileError) {
  console.log('Profile error:', profileError)
}

if (settingsError) {
  console.log('Settings error:', settingsError)
}
```

### 4. 성능 최적화
```javascript
// 프로필이 필요 없는 페이지에서는 로드하지 않음
function SimpleAuthPage() {
  const { user, loading } = useAuth() // 프로필/설정 로드 안함
  
  return <div>Simple auth check</div>
}

// 필요한 곳에서만 로드
function ProfilePage() {
  const { user } = useAuth()
  const { profile } = useUserProfile(user?.id) // 여기서만 프로필 로드
  
  return <div>Profile: {profile?.name}</div>
}
```

## 마이그레이션 가이드

### Before (기존)
```javascript
const { user, userProfile, userSettings, updateUserSettings } = useAuth()
```

### After (새로운)
```javascript
const { user } = useAuth()
const { profile } = useUserProfile(user?.id)
const { settings, updateSettings } = useUserSettings(user?.id)
```

### 점진적 마이그레이션
1. 새로운 Hook들 추가
2. 컴포넌트 하나씩 새로운 방식으로 변경
3. 기존 복잡한 AuthProvider 제거