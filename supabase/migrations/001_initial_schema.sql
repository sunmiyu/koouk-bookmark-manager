-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create users table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text default 'free' check (plan in ('free', 'pro', 'premium')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create content_items table for bookmarks
create table public.content_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null check (type in ('video', 'link', 'image', 'note')),
  title text not null,
  url text,
  content text,
  thumbnail text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mini_functions table for user's enabled mini functions
create table public.mini_functions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  function_type text not null check (function_type in ('news', 'music', 'alarm', 'expense', 'diary', 'stocks', 'commute', 'food', 'dday')),
  is_enabled boolean default true,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, function_type)
);

-- Create todo_items table
create table public.todo_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_data table for mini function data storage
create table public.user_data (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  data_type text not null, -- 'alarm', 'expense', 'diary', 'stocks', 'commute', 'dday'
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.content_items enable row level security;
alter table public.mini_functions enable row level security;
alter table public.todo_items enable row level security;
alter table public.user_data enable row level security;

-- Create RLS policies
-- Users can only see their own data
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Content items policies
create policy "Users can manage own content" on public.content_items for all using (auth.uid() = user_id);

-- Mini functions policies
create policy "Users can manage own mini functions" on public.mini_functions for all using (auth.uid() = user_id);

-- Todo items policies
create policy "Users can manage own todos" on public.todo_items for all using (auth.uid() = user_id);

-- User data policies
create policy "Users can manage own data" on public.user_data for all using (auth.uid() = user_id);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, plan)
  values (new.id, new.email, 'free');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create updated_at triggers for all tables
create trigger set_updated_at before update on public.users for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.content_items for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.mini_functions for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.todo_items for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.user_data for each row execute procedure public.set_updated_at();