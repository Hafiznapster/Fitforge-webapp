-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  hunter_name text,
  player_class text,
  rank text default 'E',
  level integer default 1,
  xp integer default 0,
  streak integer default 0,
  
  -- Onboarding Metrics
  weight_kg numeric,
  height_cm numeric,
  bmi numeric,
  target_calories integer,
  
  -- Preferences & Details
  supplements text[],
  fitness_goal text,
  workout_frequency text,
  workout_intensity text,
  current_plan text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Set up a trigger to automatically create a profile entry when a new user signs up via Supabase Auth
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, hunter_name, player_class)
  values (new.id, new.email, 'Hunter_' || substr(new.id::text, 1, 6), 'Fighter');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
