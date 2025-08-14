-- Koouk 데이터베이스 성능 최적화
-- 인덱스 생성 및 쿼리 최적화

-- 기본 인덱스들 (이미 생성되었을 수 있지만 안전하게 재생성)
-- Users 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_plan ON users(user_plan);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_is_verified ON users(is_verified);

-- Folders 테이블 인덱스 (자주 조회되는 필드들)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_user_id_created_at ON folders(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_user_id_sort_order ON folders(user_id, sort_order);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_name_text_search ON folders USING gin(to_tsvector('english', name));

-- Storage Items 테이블 인덱스 (가장 빈번하게 조회)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_user_id ON storage_items(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_folder_id ON storage_items(folder_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_user_folder ON storage_items(user_id, folder_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_type ON storage_items(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_created_at ON storage_items(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_updated_at ON storage_items(updated_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_tags ON storage_items USING gin(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_content_search ON storage_items USING gin(to_tsvector('english', name || ' ' || content));

-- Bookmarks 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_id_created_at ON bookmarks(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_is_favorite ON bookmarks(is_favorite);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING gin(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_url_hash ON bookmarks(md5(url));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_text_search ON bookmarks USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- Shared Folders 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_user_id ON shared_folders(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_is_public ON shared_folders(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_category ON shared_folders(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_created_at ON shared_folders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_public_created ON shared_folders(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_tags ON shared_folders USING gin(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shared_folders_text_search ON shared_folders USING gin(to_tsvector('english', title || ' ' || description));

-- User Settings 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_settings_last_active_tab ON user_settings(last_active_tab);

-- Search History 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_user_created ON search_history(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_query ON search_history(search_query);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_search_history_scope ON search_history(search_scope);

-- User Sessions 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Feedback 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Folder Imports 테이블 인덱스
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folder_imports_user_id ON folder_imports(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folder_imports_shared_folder_id ON folder_imports(shared_folder_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folder_imports_status ON folder_imports(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folder_imports_created_at ON folder_imports(created_at DESC);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_folders_user_name ON folders(user_id, name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_folder_type ON storage_items(folder_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_storage_items_user_type_created ON storage_items(user_id, type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookmarks_user_category_created ON bookmarks(user_id, category, created_at DESC);

-- 파티셔닝을 위한 준비 (대용량 데이터 대비)
-- Search History는 시간 기반 파티셔닝이 유용할 수 있음
-- 현재는 인덱스로만 최적화하고, 추후 필요시 파티셔닝 적용

-- 자동 통계 업데이트 설정
ALTER TABLE folders SET (autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE storage_items SET (autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE bookmarks SET (autovacuum_analyze_scale_factor = 0.02);
ALTER TABLE shared_folders SET (autovacuum_analyze_scale_factor = 0.02);

-- 성능 모니터링을 위한 뷰 생성
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    most_common_vals,
    most_common_freqs,
    histogram_bounds
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- 쿼리 성능 모니터링을 위한 함수
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE (
    query text,
    calls bigint,
    total_time double precision,
    mean_time double precision,
    rows bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.rows
    FROM pg_stat_statements 
    WHERE pg_stat_statements.mean_exec_time > 100 -- 100ms 이상 쿼리
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;