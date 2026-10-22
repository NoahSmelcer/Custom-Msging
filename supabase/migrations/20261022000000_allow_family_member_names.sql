-- Authorized family members may read display names so message senders can be identified.
-- This does not expose auth credentials or permit membership changes.
drop policy if exists "members read own profile" on public.family_memberships;
create or replace function public.is_family_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.family_memberships where id = auth.uid()) $$;

create policy "family members read names" on public.family_memberships
  for select to authenticated
  using (public.is_family_member());
