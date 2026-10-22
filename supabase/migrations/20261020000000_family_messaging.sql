-- Run through the Supabase SQL editor or `supabase db push`.
-- Accounts are provisioned by an administrator; no browser client can create memberships.
create type public.family_role as enum ('admin', 'member');

create table public.family_memberships (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  role public.family_role not null default 'member',
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index messages_created_at_idx on public.messages (created_at desc);

create table public.message_reads (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now()
);

alter table public.family_memberships enable row level security;
alter table public.messages enable row level security;
alter table public.message_reads enable row level security;

-- Membership itself is visible only to the signed-in member. Admin provisioning uses the SQL editor/service role.
create policy "members read own profile" on public.family_memberships for select to authenticated using (id = auth.uid());
create policy "family members read messages" on public.messages for select to authenticated using (exists (select 1 from public.family_memberships m where m.id = auth.uid()));
create policy "family members send as themselves" on public.messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.family_memberships m where m.id = auth.uid()));
create policy "members manage their read marker" on public.message_reads for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Required for browser Realtime delivery. RLS still applies to each subscriber.
alter publication supabase_realtime add table public.messages;

-- After inviting/creating each user in Supabase Auth, insert their IDs in the SQL editor:
-- insert into public.family_memberships (id, display_name, role) values
--   ('AUTH_USER_UUID_FOR_MOM', 'Mom', 'admin'),
--   ('AUTH_USER_UUID_FOR_BROTHER', 'Brother', 'member');
