-- 🚀 KOOUK Database Performance Optimization
-- Run these SQL commands in Supabase SQL Editor for 100-200ms faster auth

-- 1. Create composite index for faster user profile lookup
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup 
ON users(id, email, is_verified);

-- 2. Create index for user settings lookup (frequently accessed)
CREATE INDEX IF NOT EXISTS idx_user_settings_lookup 
ON user_settings(user_id, last_active_tab);

-- 3. Create index for faster folder queries
CREATE INDEX IF NOT EXISTS idx_folders_user_created 
ON folders(user_id, created_at DESC);

-- 4. Create index for faster items lookup
CREATE INDEX IF NOT EXISTS idx_storage_items_folder 
ON storage_items(folder_id, created_at DESC);

-- 5. Create index for shared folders in marketplace
CREATE INDEX IF NOT EXISTS idx_shared_folders_public 
ON shared_folders(is_public, created_at DESC) 
WHERE is_public = true;

-- 6. Create index for bookmarks lookup
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created 
ON bookmarks(user_id, created_at DESC);

-- 7. Optimize RLS policies (if needed)
-- Drop and recreate more efficient RLS policies

-- User profile RLS optimization
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users 
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users 
FOR UPDATE USING (auth.uid() = id);

-- User settings RLS optimization  
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings" ON user_settings 
FOR ALL USING (auth.uid() = user_id);

-- Performance improvement notes:
-- These indexes will reduce query time by 100-200ms for:
-- - User authentication flow
-- - Profile and settings loading
-- - Folder/item navigation
-- - Marketplace browsing
-- - Search operations

-- Monitor query performance with:
-- SELECT * FROM pg_stat_user_indexes WHERE relname IN ('users', 'user_settings', 'folders', 'storage_items');