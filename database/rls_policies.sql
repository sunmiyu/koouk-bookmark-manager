-- Row Level Security (RLS) 정책 설정
-- 사용자는 자신의 데이터만 접근 가능

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users 테이블 정책
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Folders 테이블 정책
CREATE POLICY "Users can manage own folders" ON folders FOR ALL USING (auth.uid() = user_id);

-- Storage_Items 테이블 정책
CREATE POLICY "Users can manage own storage items" ON storage_items FOR ALL USING (auth.uid() = user_id);

-- Bookmarks 테이블 정책
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- Shared_Folders 테이블 정책 (공개 폴더는 모두 볼 수 있음)
CREATE POLICY "Users can view public shared folders" ON shared_folders FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own shared folders" ON shared_folders FOR ALL USING (auth.uid() = user_id);

-- Folder_Imports 테이블 정책
CREATE POLICY "Users can manage own folder imports" ON folder_imports FOR ALL USING (auth.uid() = user_id);

-- Feedback 테이블 정책
CREATE POLICY "Users can manage own feedback" ON feedback FOR ALL USING (auth.uid() = user_id);

-- User_Settings 테이블 정책
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Search_History 테이블 정책
CREATE POLICY "Users can manage own search history" ON search_history FOR ALL USING (auth.uid() = user_id);

-- User_Sessions 테이블 정책
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);