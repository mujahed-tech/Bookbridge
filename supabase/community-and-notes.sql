-- BookBridge Community + Notes upgrade (additive; does not delete existing data).
-- Run AFTER schema.sql and admin-and-workflow.sql in Supabase SQL Editor.

alter table public.profiles add column if not exists role text not null default 'member'
  check (role in ('member', 'admin'));
create or replace function public.is_bookbridge_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_bookbridge_admin() from public;
grant execute on function public.is_bookbridge_admin() to authenticated;

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  institute_name text not null check (char_length(institute_name) between 2 and 160),
  description text not null default '' check (char_length(description) <= 2000),
  location text,
  logo_url text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  member_count integer not null default 0 check (member_count >= 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'approved' check (status in ('approved', 'left')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.community_join_requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '' check (char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (community_id, requester_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 200),
  description text not null default '' check (char_length(description) <= 4000),
  subject text not null check (char_length(subject) between 2 and 120),
  course text not null check (char_length(course) between 2 and 120),
  class_year text not null check (char_length(class_year) between 1 and 80),
  file_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  file_size bigint check (file_size is null or file_size >= 0),
  mime_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discussion_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null default 'discussion' check (kind in ('discussion', 'announcement')),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discussion_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.discussion_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  content_type text not null check (content_type in ('note', 'post', 'reply')),
  content_id uuid not null,
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (reporter_id, content_type, content_id)
);

alter table public.books add column if not exists community_id uuid references public.communities(id) on delete set null;
create index if not exists communities_visibility_idx on public.communities(visibility, created_at desc);
create index if not exists community_members_user_idx on public.community_members(user_id, status);
create index if not exists notes_community_created_idx on public.notes(community_id, created_at desc);
create index if not exists notes_search_idx on public.notes(community_id, course, class_year, subject);
create index if not exists posts_community_created_idx on public.discussion_posts(community_id, created_at desc);
create index if not exists books_community_idx on public.books(community_id, created_at desc);

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_join_requests enable row level security;
alter table public.notes enable row level security;
alter table public.discussion_posts enable row level security;
alter table public.discussion_replies enable row level security;
alter table public.content_reports enable row level security;

create or replace function public.is_community_member(target_community uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select public.is_bookbridge_admin()) or exists (
    select 1 from public.community_members where community_id = target_community and user_id = (select auth.uid()) and status = 'approved'
  );
$$;
create or replace function public.is_community_admin(target_community uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select public.is_bookbridge_admin()) or exists (
    select 1 from public.community_members where community_id = target_community and user_id = (select auth.uid()) and status = 'approved' and role = 'admin'
  );
$$;
create or replace function public.can_view_community(target_community uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select public.is_bookbridge_admin()) or exists (
    select 1 from public.communities where id = target_community and visibility = 'public'
  ) or (select public.is_community_member(target_community));
$$;
revoke all on function public.is_community_member(uuid) from public;
revoke all on function public.is_community_admin(uuid) from public;
revoke all on function public.can_view_community(uuid) from public;
grant execute on function public.is_community_member(uuid), public.is_community_admin(uuid), public.can_view_community(uuid) to authenticated;

create or replace function public.add_community_creator()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.community_members (community_id, user_id, role, status) values (new.id, new.created_by, 'admin', 'approved');
  return new;
end;
$$;
create or replace function public.sync_community_member_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then update public.communities set member_count = greatest(member_count - 1, 0) where id = old.community_id and old.status = 'approved'; return old; end if;
  if tg_op = 'INSERT' then update public.communities set member_count = member_count + 1 where id = new.community_id and new.status = 'approved'; return new; end if;
  if old.status <> new.status then update public.communities set member_count = greatest(member_count + case when new.status = 'approved' then 1 else -1 end, 0) where id = new.community_id; end if;
  return new;
end;
$$;
drop trigger if exists on_community_created on public.communities;
create trigger on_community_created after insert on public.communities for each row execute procedure public.add_community_creator();
drop trigger if exists on_community_member_changed on public.community_members;
create trigger on_community_member_changed after insert or update or delete on public.community_members for each row execute procedure public.sync_community_member_count();

create policy "members can discover communities" on public.communities for select to authenticated using (true);
create policy "members can create communities" on public.communities for insert to authenticated with check (created_by = (select auth.uid()));
create policy "community admins manage communities" on public.communities for update to authenticated using ((select public.is_community_admin(id))) with check ((select public.is_community_admin(id)));
create policy "community admins delete communities" on public.communities for delete to authenticated using ((select public.is_community_admin(id)));

create policy "members see relevant memberships" on public.community_members for select to authenticated using (user_id = (select auth.uid()) or (select public.is_community_admin(community_id)));
create policy "members join public communities" on public.community_members for insert to authenticated with check (user_id = (select auth.uid()) and role = 'member' and status = 'approved' and exists (select 1 from public.communities where id = community_id and visibility = 'public'));
create policy "members leave own communities" on public.community_members for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and role = 'member' and status = 'left');
create policy "community admins manage members" on public.community_members for all to authenticated using ((select public.is_community_admin(community_id))) with check ((select public.is_community_admin(community_id)));

create policy "requesters and admins see join requests" on public.community_join_requests for select to authenticated using (requester_id = (select auth.uid()) or (select public.is_community_admin(community_id)));
create policy "members request private access" on public.community_join_requests for insert to authenticated with check (requester_id = (select auth.uid()) and status = 'pending' and exists (select 1 from public.communities where id = community_id and visibility = 'private'));
create policy "community admins process join requests" on public.community_join_requests for update to authenticated using ((select public.is_community_admin(community_id))) with check ((select public.is_community_admin(community_id)));

create or replace function public.review_community_join_request(request_id uuid, decision text)
returns void language plpgsql security definer set search_path = '' as $$
declare request_row public.community_join_requests;
begin
  if decision not in ('approved', 'rejected') then raise exception 'Invalid join-request decision'; end if;
  select * into request_row from public.community_join_requests where id = request_id for update;
  if request_row.id is null or not public.is_community_admin(request_row.community_id) then raise exception 'Not allowed to review this request'; end if;
  update public.community_join_requests set status = decision, reviewed_by = (select auth.uid()), reviewed_at = now() where id = request_id;
  if decision = 'approved' then
    insert into public.community_members (community_id, user_id, role, status) values (request_row.community_id, request_row.requester_id, 'member', 'approved')
    on conflict (community_id, user_id) do update set status = 'approved';
  end if;
end;
$$;
revoke all on function public.review_community_join_request(uuid, text) from public;
grant execute on function public.review_community_join_request(uuid, text) to authenticated;

create policy "view community notes" on public.notes for select to authenticated using ((select public.can_view_community(community_id)));
create policy "members upload notes" on public.notes for insert to authenticated with check (uploaded_by = (select auth.uid()) and (select public.is_community_member(community_id)));
create policy "authors and admins update notes" on public.notes for update to authenticated using (uploaded_by = (select auth.uid()) or (select public.is_community_admin(community_id))) with check (uploaded_by = (select auth.uid()) or (select public.is_community_admin(community_id)));
create policy "authors and admins delete notes" on public.notes for delete to authenticated using (uploaded_by = (select auth.uid()) or (select public.is_community_admin(community_id)));

create policy "view community posts" on public.discussion_posts for select to authenticated using ((select public.can_view_community(community_id)));
create policy "members create discussions" on public.discussion_posts for insert to authenticated with check (author_id = (select auth.uid()) and ((kind = 'discussion' and (select public.is_community_member(community_id))) or (kind = 'announcement' and (select public.is_community_admin(community_id)))));
create policy "authors and admins update posts" on public.discussion_posts for update to authenticated using (author_id = (select auth.uid()) or (select public.is_community_admin(community_id))) with check (author_id = (select auth.uid()) or (select public.is_community_admin(community_id)));
create policy "authors and admins delete posts" on public.discussion_posts for delete to authenticated using (author_id = (select auth.uid()) or (select public.is_community_admin(community_id)));
create policy "view replies with posts" on public.discussion_replies for select to authenticated using (exists (select 1 from public.discussion_posts where id = post_id and (select public.can_view_community(community_id))));
create policy "members reply" on public.discussion_replies for insert to authenticated with check (author_id = (select auth.uid()) and exists (select 1 from public.discussion_posts where id = post_id and (select public.is_community_member(community_id))));
create policy "authors delete replies" on public.discussion_replies for delete to authenticated using (author_id = (select auth.uid()) or exists (select 1 from public.discussion_posts where id = post_id and (select public.is_community_admin(community_id))));

create policy "reporters and admins view reports" on public.content_reports for select to authenticated using (reporter_id = (select auth.uid()) or (select public.is_community_admin(community_id)));
create policy "members create reports" on public.content_reports for insert to authenticated with check (reporter_id = (select auth.uid()) and (select public.is_community_member(community_id)));
create policy "admins resolve reports" on public.content_reports for update to authenticated using ((select public.is_community_admin(community_id))) with check ((select public.is_community_admin(community_id)));

drop policy if exists "members can view books" on public.books;
create policy "members view allowed books" on public.books for select to authenticated using (community_id is null or (select public.can_view_community(community_id)));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-notes', 'community-notes', false, 10485760, array['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = 10485760;
create policy "members upload community note files" on storage.objects for insert to authenticated with check (bucket_id = 'community-notes' and (storage.foldername(name))[2] = (select auth.uid()::text) and (select public.is_community_member((storage.foldername(name))[1]::uuid)));
create policy "allowed members download community note files" on storage.objects for select to authenticated using (bucket_id = 'community-notes' and (select public.can_view_community((storage.foldername(name))[1]::uuid)));
create policy "authors and admins delete community note files" on storage.objects for delete to authenticated using (bucket_id = 'community-notes' and ((storage.foldername(name))[2] = (select auth.uid()::text) or (select public.is_community_admin((storage.foldername(name))[1]::uuid))));

-- Make the newly created relations available to the Supabase Data API immediately.
notify pgrst, 'reload schema';
