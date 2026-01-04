-- Supabase SQL schema additions for lessons, user_lessons, daily_challenges, user_progress

create table public.lessons (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text null,
  type text not null,
  difficulty integer null default 1,
  steps jsonb not null,
  xp_reward integer null default 10,
  lesson_order integer not null,
  constraint lessons_pkey primary key (id)
) TABLESPACE pg_default;

create table public.user_lessons (
  user_id uuid not null,
  lesson_id uuid not null,
  completed boolean null default false,
  completed_at timestamp without time zone null,
  constraint user_lessons_pkey primary key (user_id, lesson_id),
  constraint user_lessons_lesson_id_fkey foreign KEY (lesson_id) references lessons (id),
  constraint user_lessons_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

create table public.daily_challenges (
  id uuid not null default extensions.uuid_generate_v4 (),
  date date not null,
  task text not null,
  lesson_id uuid null,
  xp_reward integer null default 50,
  constraint daily_challenges_pkey primary key (id),
  constraint daily_challenges_date_key unique (date),
  constraint daily_challenges_lesson_id_fkey foreign KEY (lesson_id) references lessons (id)
) TABLESPACE pg_default;

create table public.user_progress (
  user_id uuid not null,
  xp integer null default 0,
  progress double precision null default 0,
  completed_lessons uuid[] null default array[]::uuid[],
  constraint user_progress_pkey primary key (user_id),
  constraint user_progress_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;

-- Optional quizzes table for AI-generated quizzes
create table public.quizzes (
  id uuid not null default extensions.uuid_generate_v4(),
  lesson_id uuid null,
  questions jsonb not null,
  created_at timestamp without time zone default now(),
  constraint quizzes_pkey primary key (id),
  constraint quizzes_lesson_id_fkey foreign KEY (lesson_id) references lessons (id)
);

-- Typing indicator table for messaging
create table public.typing_status (
  user_id uuid not null,
  other_user_id uuid not null,
  is_typing boolean default false,
  updated_at timestamp without time zone default now(),
  constraint typing_status_pkey primary key (user_id, other_user_id),
  constraint typing_status_user_fkey foreign key (user_id) references users (id),
  constraint typing_status_other_user_fkey foreign key (other_user_id) references users (id)
);
