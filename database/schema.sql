-- KOOUK Database Schema
-- 10개 테이블로 완전한 기능 커버

-- 1. Users 테이블 - 사용자 기본 정보 및 계정 관리
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  user_plan TEXT DEFAULT 'free' CHECK (user_plan IN ('free', 'pro', 'premium')),
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Folders 테이블 - 사용자 폴더 구조
CREATE TABLE folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📁',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Storage_Items 테이블 - 폴더 내 모든 컨텐츠
CREATE TABLE storage_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('url', 'image', 'video', 'document', 'memo')),
  content TEXT NOT NULL,
  url TEXT,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  word_count INTEGER,
  metadata JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bookmarks 테이블 - 독립적인 북마크 관리
CREATE TABLE bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Shared_Folders 테이블 - 마켓플레이스 공유 폴더
CREATE TABLE shared_folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL CHECK (category IN ('tech', 'lifestyle', 'food', 'travel', 'study', 'work', 'entertainment', 'health', 'investment', 'parenting')),
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  stats JSONB DEFAULT '{
    "views": 0,
    "likes": 0,
    "helpful": 0,
    "notHelpful": 0,
    "shares": 0,
    "downloads": 0,
    "urls": 0,
    "videos": 0,
    "documents": 0,
    "images": 0,
    "total": 0
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Folder_Imports 테이블 - 마켓플레이스에서 가져온 폴더 추적
CREATE TABLE folder_imports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  original_shared_folder_id UUID REFERENCES shared_folders(id) ON DELETE SET NULL,
  imported_folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Feedback 테이블 - 사용자 피드백 및 문의
CREATE TABLE feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'complaint')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User_Settings 테이블 - 사용자 개인 설정 및 상태
CREATE TABLE user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  last_active_tab TEXT DEFAULT 'dashboard' CHECK (last_active_tab IN ('dashboard', 'my-folder', 'marketplace', 'bookmarks')),
  selected_folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  view_mode TEXT DEFAULT 'grid' CHECK (view_mode IN ('grid', 'list')),
  sort_by TEXT DEFAULT 'recent' CHECK (sort_by IN ('recent', 'name', 'type')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ko')),
  pwa_install_dismissed_at TIMESTAMP WITH TIME ZONE,
  visit_count INTEGER DEFAULT 0,
  cross_platform_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Search_History 테이블 - 검색 기록 관리
CREATE TABLE search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_scope TEXT NOT NULL CHECK (search_scope IN ('my-folder', 'marketplace', 'bookmarks', 'all')),
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. User_Sessions 테이블 - 세션 및 디바이스 상태
CREATE TABLE user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_info JSONB DEFAULT '{}',
  session_data JSONB DEFAULT '{}',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_storage_items_user_id ON storage_items(user_id);
CREATE INDEX idx_storage_items_folder_id ON storage_items(folder_id);
CREATE INDEX idx_storage_items_type ON storage_items(type);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_category ON bookmarks(category);
CREATE INDEX idx_shared_folders_user_id ON shared_folders(user_id);
CREATE INDEX idx_shared_folders_category ON shared_folders(category);
CREATE INDEX idx_shared_folders_public ON shared_folders(is_public);
CREATE INDEX idx_folder_imports_user_id ON folder_imports(user_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 업데이트 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storage_items_updated_at BEFORE UPDATE ON storage_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookmarks_updated_at BEFORE UPDATE ON bookmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shared_folders_updated_at BEFORE UPDATE ON shared_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();