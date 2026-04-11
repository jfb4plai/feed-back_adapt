-- ============================================================
-- FEED-BACK ADAPT — Migration initiale
-- Tables préfixées fba_ pour éviter conflits avec autres apps
-- Projet Supabase : otiorljbujqzruulmqrs
-- ============================================================

-- ── Tables ───────────────────────────────────────────────────

create table if not exists fba_teachers (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  name text,
  school text,
  preferred_lang text default 'FR' check (preferred_lang in ('FR','NL','EN')),
  created_at timestamptz default now()
);

create table if not exists fba_students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references fba_teachers(id) on delete cascade not null,
  name text not null,
  mode text not null check (mode in ('fondamental','secondaire')),
  lang text not null check (lang in ('FR','NL','EN')),
  created_at timestamptz default now()
);

create table if not exists fba_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references fba_students(id) on delete cascade not null,
  teacher_id uuid references fba_teachers(id) on delete cascade not null,
  code text unique not null,
  mode text not null,
  lang text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  correct_count int default 0,
  total_count int default 0,
  is_active boolean default true
);

create table if not exists fba_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references fba_sessions(id) on delete cascade not null,
  item_id text not null,
  answer_text text not null,
  is_correct boolean not null,
  error_type text,
  obstacle text,
  feedback_generated text,
  responded_at timestamptz default now()
);

create table if not exists fba_error_counts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references fba_students(id) on delete cascade not null,
  item_id text not null,
  answer_index int not null,
  count int default 1,
  last_seen timestamptz default now(),
  unique(student_id, item_id, answer_index)
);

-- ── Row Level Security ────────────────────────────────────────

alter table fba_teachers enable row level security;
alter table fba_students enable row level security;
alter table fba_sessions enable row level security;
alter table fba_responses enable row level security;
alter table fba_error_counts enable row level security;

create policy "fba_teachers_own" on fba_teachers
  using (id = auth.uid());

create policy "fba_teachers_insert_own" on fba_teachers
  for insert with check (id = auth.uid());

create policy "fba_students_own" on fba_students
  using (teacher_id = auth.uid());

create policy "fba_students_insert_own" on fba_students
  for insert with check (teacher_id = auth.uid());

create policy "fba_sessions_teacher" on fba_sessions
  using (teacher_id = auth.uid());

create policy "fba_sessions_insert_teacher" on fba_sessions
  for insert with check (teacher_id = auth.uid());

create policy "fba_responses_teacher" on fba_responses
  using (
    session_id in (
      select id from fba_sessions where teacher_id = auth.uid()
    )
  );

create policy "fba_error_counts_teacher" on fba_error_counts
  using (
    student_id in (
      select id from fba_students where teacher_id = auth.uid()
    )
  );

-- ── Realtime ──────────────────────────────────────────────────

alter publication supabase_realtime add table fba_responses;
alter publication supabase_realtime add table fba_sessions;

-- ── Trigger : profil teacher automatique à l'inscription ─────

create or replace function public.fba_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.fba_teachers (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists fba_on_auth_user_created on auth.users;

create trigger fba_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.fba_handle_new_user();
