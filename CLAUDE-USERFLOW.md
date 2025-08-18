# 📊 KOOUK User Flow & System Connections Report

## 🔐 **Authentication Flow (Login/Logout)**

### **Login Process:**
1. **Entry Point**: `src/app/page.tsx` → `src/components/core/App.tsx`
2. **Authentication Check**: `useAuthCompat()` from `src/components/auth/AuthContext.tsx`
3. **No User State**: Displays `src/components/pages/Landing/LandingPage.tsx`
4. **Login Trigger**: User clicks Google OAuth login button
5. **OAuth Flow**: 
   - `AuthContext.signIn()` → Supabase OAuth with Google
   - Redirects to Google OAuth consent screen
   - Returns to `src/app/(auth)/callback/page.tsx`
6. **Callback Processing**:
   - Exchanges auth code for session
   - Validates session with `supabase.auth.getSession()`
   - Redirects back to main app (`/`)
7. **Session Establishment**:
   - `AuthContext.initializeAuth()` detects valid session
   - Loads user profile from database via `DatabaseService.getUserProfile()`
   - Sets up user settings via `DatabaseService.getUserSettings()`
   - Updates status to 'authenticated'

### **Logout Process:**
1. **Trigger**: User clicks logout (typically in sidebar/header)
2. **Immediate UI Update**: 
   - Clear user, userProfile, userSettings states
   - Set status to 'idle'
3. **Background Cleanup**:
   - `supabase.auth.signOut()` clears Supabase session
   - Clear localStorage cache (`koouk-session-cache`)
   - Clear all auth-related localStorage keys

### **Connection Pages:**
- **Loading State**: Shows KOOUK logo with spinning animation
- **Error States**: AuthErrorBoundary handles failures with retry options
- **Offline Mode**: Cached session support via `useNetworkStatus.ts`

---

## 🧭 **Main App Navigation & Tab Functions**

### **App Structure (Desktop)**
```
src/components/core/App.tsx
├── src/components/layout/KooukSidebar.tsx (Left Panel)
└── src/components/layout/KooukMainContent.tsx (Right Panel)
```

### **App Structure (Mobile)**
```
src/components/core/App.tsx
├── Header (with hamburger menu)
├── Main Content (full screen)
└── Bottom Tab Navigation
```

### **Tab System:**
1. **Storage** (`'storage'`) - My personal folders and content
2. **Bookmarks** (`'bookmarks'`) - Saved web links  
3. **Marketplace** (`'marketplace'`) - Community shared folders

---

## 📁 **My Folder Tab - Complete Flow**

### **Entry & Data Loading:**
```typescript
src/components/pages/MyFolder/MyFolderContent.tsx
├── useAuth() - Check authentication
├── DatabaseService.getUserFolders(user.id) - Load user's folders
├── Convert DB format to FolderItem format
└── Set folders state + searchEngine.updateIndex()
```

### **Folder Management:**
1. **Create Folder**:
   - Click "+" button → `setShowCreateFolderModal(true)`
   - Enter folder name → `handleConfirmCreateFolder()`
   - `DatabaseService.createFolder()` → Updates database
   - Add to local state → Select new folder

2. **Folder Selection**:
   - Click folder → `handleFolderSelect(folderId)`
   - Save to user settings → `updateUserSettings({ selected_folder_id })`
   - Switch to detail view → `setCurrentView('detail')`

3. **Content Views**:
   - **Grid View** (`FolderGrid`): Shows all folders as cards
   - **Detail View** (`FolderDetail`): Shows selected folder's contents

### **Item Management:**
1. **Add Items**:
   - Use `ContentInput` component at bottom
   - Supports: URL, memo, document, image, video
   - `handleAddItem()` → `DatabaseService.createStorageItem()`
   - Updates local folder state

2. **Delete Items**:
   - `handleItemDelete()` → `DatabaseService.deleteStorageItem()`
   - Removes from local state

### **Folder Sharing to Marketplace:**
```typescript
// Share flow: My Folder → Marketplace
handleShareFolder(sharedFolderData, folder) {
  // Convert FolderItem to SharedFolder format
  const sharedData = {
    folder_id: folder.id,
    title: sharedFolderData.title,
    description: sharedFolderData.description,
    category: sharedFolderData.category,
    tags: sharedFolderData.tags,
    is_public: true
  }
  
  // Create in shared_folders table
  DatabaseService.createSharedFolder(user.id, sharedData)
  // Now visible in Marketplace
}
```

---

## 🛍️ **Marketplace Tab - Complete Flow**

### **Data Loading:**
```typescript
src/components/pages/Marketplace/MarketPlace.tsx
├── DatabaseService.getPublicSharedFolders() - Public content
├── DatabaseService.getUserSharedFolders(user.id) - User's shares
├── Convert to SharedFolder format
└── Apply filters + sorting
```

### **Two Views:**
1. **Browse Market Place**:
   - Shows all public shared folders
   - Category filters (tech, lifestyle, food, etc.)
   - Sort options (popular, recent, helpful)

2. **My Shared Folders**:
   - Shows folders the user has shared
   - Edit/manage own shared content

### **Content Card System:**
```typescript
// SharedFolderCard component structure
SharedFolder {
  id: string,
  title: string,
  description: string,
  author: { name, avatar, verified },
  category: ShareCategory,
  stats: { likes, downloads, views },
  folder: FolderItem, // The actual content
  coverImage?: string
}
```

### **Import Flow (Marketplace → My Folder):**
```typescript
// Content conversion: SharedFolder → FolderItem
handleImportFolder(sharedFolder) {
  // Extract the folder content from SharedFolder
  const folderToImport = sharedFolder.folder
  
  // Create new folder in user's collection
  const newFolder = await DatabaseService.createFolder(user.id, {
    name: sharedFolder.title,
    // Copy folder structure and items
  })
  
  // Copy all storage items
  for (item of folderToImport.children) {
    await DatabaseService.createStorageItem(user.id, {
      folder_id: newFolder.id,
      name: item.name,
      type: item.type,
      content: item.content,
      // Copy all item properties
    })
  }
  
  // Update local My Folder state
  // User sees imported content in My Folder tab
}
```

---

## 📚 **Bookmarks Tab - Complete Flow**

### **Entry & Data Loading:**
```typescript
src/components/pages/Bookmarks/Bookmarks.tsx
├── useAuth() - Check authentication
├── DatabaseService.getUserBookmarks(user.id) - Load user's bookmarks
├── Convert DB format to Bookmark format
└── Apply category filters and search
```

### **Bookmark Management:**
1. **Add Bookmark**:
   - Click "+" button → Prompt for URL and title
   - Create bookmark object with metadata
   - `DatabaseService.createBookmark()` → Updates database
   - Add to local state

2. **Category System**:
   - **Most Used**: Top 10 by usage count
   - **Categories**: work, personal, entertainment, news, etc.
   - Dynamic filtering and search

3. **Bookmark Actions**:
   - **Open**: `window.open()` + increment usage count
   - **Favorite**: Toggle star status
   - **Delete**: Remove from database and local state

---

## 📊 **Content Card Type Conversions**

### **Database Schema Connections:**
```
Database Tables:
├── users (user profiles)
├── folders (user's personal folders)
├── storage_items (content within folders)
├── shared_folders (marketplace listings)
└── bookmarks (saved web links)
```

### **Type Conversion Matrix:**

| Source | Target | Conversion Process | File Location |
|--------|--------|-------------------|---------------|
| **DB Folder** → **FolderItem** | Maps DB schema to UI types | `MyFolderContent.tsx:71-100` |
| **FolderItem** → **SharedFolder** | Adds sharing metadata | `MyFolderContent.tsx:379-429` |
| **SharedFolder** → **FolderItem** | Extracts folder content | `MarketPlace.tsx:351-361` |
| **DB Bookmark** → **Bookmark** | Maps bookmark schema | `Bookmarks.tsx:51-64` |

### **Content Type Support:**
- **URL** (`'url'`): Web links with metadata extraction
- **Memo** (`'memo'`): Short text notes  
- **Document** (`'document'`): Long-form text content
- **Image** (`'image'`): Photos with thumbnails
- **Video** (`'video'`): Videos (especially YouTube) with previews

---

## 🔗 **Key Connection Points**

### **1. My Folder ↔ Marketplace**
```typescript
// Sharing flow
My Folder FolderItem → Share Modal → SharedFolder → Database
                                                   ↓
                                            Marketplace Display

// Import flow  
Marketplace SharedFolder → Import → Extract FolderItem → Copy to User's DB
                                                        ↓
                                                My Folder Display
```

### **2. Database Service Connections**
```typescript
// All components use DatabaseService for consistency
MyFolderContent → DatabaseService.getUserFolders()
MarketPlace → DatabaseService.getPublicSharedFolders()
Bookmarks → DatabaseService.getUserBookmarks()

// Cross-tab data sharing via database
User shares folder → shared_folders table → Visible to all users
```

### **3. State Management Flow**
```typescript
// Authentication State (Global)
AuthContext → All components receive user state

// Local State (Component-specific)
MyFolderContent: folders[], selectedFolderId, currentView
MarketPlace: sharedFolders[], filteredFolders[], currentView  
Bookmarks: bookmarks[], filteredBookmarks[], selectedCategory
```

---

## ⚡ **Performance & UX Optimizations**

### **Loading States:**
- Skeleton loading for all major components
- Progressive loading with chunked data requests
- Cached session handling for offline support

### **Error Recovery:**
- Comprehensive error boundaries
- Retry mechanisms for failed operations
- User-friendly error messages with guidance

### **Real-time Updates:**
- Local state updates immediately (optimistic UI)
- Database operations happen in background
- Conflict resolution for concurrent edits

---

## 📱 **Mobile vs Desktop Differences**

### **Navigation:**
- **Desktop**: Persistent sidebar with tab navigation
- **Mobile**: Collapsible menu + bottom tab bar

### **Content Display:**
- **Desktop**: Side-by-side folder tree and content
- **Mobile**: Single view with navigation transitions

### **Input Methods:**
- **Desktop**: Mouse hover states, keyboard shortcuts
- **Mobile**: Touch gestures, optimized tap targets

---

## 🛠️ **Available Tools in `_backup` Folder**

### **Key Available Components:**
- 🔧 **Core utilities**: `errorHandler.ts`, `fileProcessor.ts`, `storage.ts`
- 🎨 **UI Components**: `BigNoteModal.tsx`, `EditSharedFolderModal.tsx`, `ShareFolderModal.tsx`
- 📱 **Mobile components**: `MobileHeader.tsx`, `QuickAccessBar.tsx`, `TopNavigation.tsx` 
- 🔍 **Search tools**: `SearchInterface.tsx`, `search-engine.ts`
- 📊 **Analytics**: `analytics.ts`, `GoogleAnalytics.tsx`, `useAnalytics.ts`
- ⚡ **Performance**: `fastAuth.ts`, `useOptimizedAuth.ts`, `useCrossPlatformState.ts`
- 📱 **PWA features**: `InstallPrompt.tsx`, `ServiceWorkerRegistration.tsx`, `SharedContentHandler.tsx`
- 🎯 **Original configs**: All original package.json, tailwind, eslint configs in `dependencies/`

### **Usage Principle:**
**Always check `_backup` folder first when needing tools or components** - this folder contains battle-tested, working solutions that can be copied and adapted rather than building from scratch.

---

## 🎯 **Critical Success Flows**

### **Happy Path: New User Journey**
1. **Landing** → **Google OAuth** → **Callback Success** → **Dashboard**
2. **Create First Folder** → **Add Content** → **Organize Items**
3. **Discover Marketplace** → **Import Useful Folders** → **Share Own Content**
4. **Regular Usage**: Switch between tabs, manage content, build library

### **Error Handling:**
- **Network Issues**: Offline mode + cached sessions
- **Auth Failures**: Clear error messages + retry options  
- **Database Errors**: Graceful fallbacks + user notifications
- **Performance**: Skeleton loading + progressive enhancement

### **Cross-Platform Consistency:**
- **State Sync**: All data changes immediately reflected across tabs
- **Mobile Optimization**: Touch-friendly interface with proper tap targets
- **Accessibility**: Keyboard navigation + screen reader support

---

*This comprehensive flow shows how KOOUK creates a seamless experience where users can organize personal content in My Folder, share valuable collections to the Marketplace, and import useful content from the community - all with proper type conversions and database synchronization maintaining data integrity across the entire system.*

---

**📝 Document Status**: ✅ Complete - All major user flows documented with code references  
**🔄 Last Updated**: 2025-08-18  
**👥 Audience**: Claude Code AI assistants and developers working on KOOUK project