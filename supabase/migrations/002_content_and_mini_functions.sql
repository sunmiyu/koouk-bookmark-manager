-- 추가 콘텐츠 및 Mini Function 테이블들

-- 1. 📋 Todos Section (기존 todo_items를 확장)
-- 기존 todo_items 테이블에 컬럼 추가
ALTER TABLE public.todo_items 
ADD COLUMN date DATE DEFAULT CURRENT_DATE,
ADD COLUMN completed_at TIMESTAMP,
ADD COLUMN repeat_type TEXT DEFAULT 'none' CHECK (repeat_type IN ('none', 'weekly', 'monthly', 'yearly')),
ADD COLUMN day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
ADD COLUMN day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
ADD COLUMN day_of_year JSONB;

-- 2. 🔗 Links 테이블
CREATE TABLE public.links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  favicon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 🎥 Videos 테이블
CREATE TABLE public.videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  platform TEXT, -- 'youtube', 'vimeo', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 🖼️ Images 테이블
CREATE TABLE public.images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  url TEXT NOT NULL,
  file_path TEXT, -- Supabase Storage path
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 📄 Notes 테이블
CREATE TABLE public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 💰 Mini Functions - 가계부
CREATE TABLE public.expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. 📔 Mini Functions - 다이어리
CREATE TABLE public.diary_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mood TEXT, -- '😊', '😐', '😔', etc.
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ⏰ Mini Functions - 알람
CREATE TABLE public.alarms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  time TIME NOT NULL,
  label TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  repeat_days INTEGER[], -- [0,1,2,3,4,5,6] for Sun-Sat
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. 📅 Mini Functions - D-Day
CREATE TABLE public.dday_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_date DATE NOT NULL,
  category TEXT,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. 📈 Mini Functions - 주식 관심종목
CREATE TABLE public.stock_watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL, -- 'AAPL', '005930.KS'
  name TEXT NOT NULL,
  market TEXT, -- 'NASDAQ', 'KRX'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, symbol)
);

-- 11. 🚗 Mini Functions - 출퇴근 경로
CREATE TABLE public.commute_routes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration INTEGER, -- 분 단위
  distance INTEGER, -- 미터 단위
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) for all new tables
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dday_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commute_routes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all new tables
CREATE POLICY "Users can manage own links" ON public.links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own videos" ON public.videos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own images" ON public.images FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own diary entries" ON public.diary_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own alarms" ON public.alarms FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dday events" ON public.dday_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own stock watchlist" ON public.stock_watchlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own commute routes" ON public.commute_routes FOR ALL USING (auth.uid() = user_id);

-- Create updated_at triggers for all new tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.todo_items FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.links FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.images FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.diary_entries FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.alarms FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.dday_events FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.stock_watchlist FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.commute_routes FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();