-- BookBridge database schema
-- Run this whole file in Supabase Dashboard -> SQL Editor -> New query.
-- It creates the data model and Row Level Security policies for the app.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  location text,
  bio text default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 200),
  author text not null check (char_length(author) between 2 and 160),
  category text not null,
  condition text not null check (condition in ('New', 'Like New', 'Good', 'Fair')),
  description text not null default '',
  cover_gradient text[] not null default array['#7C6FFF', '#3B82F6'],
  cover_url text,
  location text,
  language text not null default 'English',
  pages integer check (pages is null or pages >= 0),
  status text not null default 'Available' check (status in ('Available', 'Requested', 'Reserved', 'Given')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  requested_title text,
  category text,
  notes text default '',
  urgency text not null default 'Anytime' check (urgency in ('Anytime', 'Soon', 'Urgent')),
  status text not null default 'Pending' check (status in ('Pending', 'Accepted', 'Declined', 'Completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_one uuid not null references public.profiles(id) on delete cascade,
  participant_two uuid not null references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete set null,
  created_at timestamptz not null default now(),
  check (participant_one <> participant_two),
  unique (participant_one, participant_two, book_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists books_available_created_idx on public.books(status, created_at desc);
create index if not exists books_owner_idx on public.books(owner_id);
create index if not exists requests_requester_idx on public.book_requests(requester_id, created_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.book_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Profiles are visible to signed-in members; a user can only edit their own profile.
drop policy if exists "members can view profiles" on public.profiles;
drop policy if exists "users can create own profile" on public.profiles;
drop policy if exists "users can edit own profile" on public.profiles;
create policy "members can view profiles" on public.profiles for select to authenticated using (true);
create policy "users can create own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "users can edit own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Available listings can be seen by all signed-in users. Owners manage only their own listings.
drop policy if exists "members can view books" on public.books;
drop policy if exists "users can list own books" on public.books;
drop policy if exists "owners can edit books" on public.books;
drop policy if exists "owners can delete books" on public.books;
create policy "members can view books" on public.books for select to authenticated using (true);
create policy "users can list own books" on public.books for insert to authenticated with check (owner_id = auth.uid());
create policy "owners can edit books" on public.books for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners can delete books" on public.books for delete to authenticated using (owner_id = auth.uid());

-- A requester sees their requests; a book owner may see requests for their own book.
drop policy if exists "request participants can view requests" on public.book_requests;
drop policy if exists "users can create own requests" on public.book_requests;
drop policy if exists "requesters can edit own requests" on public.book_requests;
drop policy if exists "book owners can respond to requests" on public.book_requests;
create policy "request participants can view requests" on public.book_requests for select to authenticated using (
  requester_id = auth.uid() or exists (select 1 from public.books where books.id = book_requests.book_id and books.owner_id = auth.uid())
);
create policy "users can create own requests" on public.book_requests for insert to authenticated with check (requester_id = auth.uid());
create policy "requesters can edit own requests" on public.book_requests for update to authenticated using (requester_id = auth.uid()) with check (requester_id = auth.uid());
create policy "book owners can respond to requests" on public.book_requests for update to authenticated using (
  exists (select 1 from public.books where books.id = book_requests.book_id and books.owner_id = auth.uid())
) with check (
  exists (select 1 from public.books where books.id = book_requests.book_id and books.owner_id = auth.uid())
);

drop policy if exists "participants can view conversations" on public.conversations;
drop policy if exists "participants can create conversations" on public.conversations;
drop policy if exists "participants can view messages" on public.messages;
drop policy if exists "participants can send messages" on public.messages;
drop policy if exists "users can view own notifications" on public.notifications;
drop policy if exists "users can mark own notifications read" on public.notifications;
create policy "participants can view conversations" on public.conversations for select to authenticated using (auth.uid() in (participant_one, participant_two));
create policy "participants can create conversations" on public.conversations for insert to authenticated with check (auth.uid() in (participant_one, participant_two));
create policy "participants can view messages" on public.messages for select to authenticated using (exists (select 1 from public.conversations where conversations.id = messages.conversation_id and auth.uid() in (conversations.participant_one, conversations.participant_two)));
create policy "participants can send messages" on public.messages for insert to authenticated with check (sender_id = auth.uid() and exists (select 1 from public.conversations where conversations.id = messages.conversation_id and auth.uid() in (conversations.participant_one, conversations.participant_two)));

create policy "users can view own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "users can mark own notifications read" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Public book-cover images: anyone may view a listing image, but a member can only upload into their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('book-covers', 'book-covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "members upload own book covers" on storage.objects;
drop policy if exists "owners delete own book covers" on storage.objects;
create policy "members upload own book covers" on storage.objects for insert to authenticated with check (
  bucket_id = 'book-covers' and (storage.foldername(name))[1] = (select auth.uid()::text)
);
create policy "owners delete own book covers" on storage.objects for delete to authenticated using (
  bucket_id = 'book-covers' and owner_id = (select auth.uid()::text)
);

-- Automatically create a profile after a new person signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Notify the book owner for a specific listing, or every other member for a general book request.
create or replace function public.notify_book_owner_of_request()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  owner uuid;
  book_title text;
begin
  if new.book_id is null then
    insert into public.notifications (user_id, kind, title, body, link)
    select id, 'request', 'A student needs a book', 'Someone is looking for ' || coalesce(new.requested_title, 'a book') || '.', '/request'
    from public.profiles where id <> new.requester_id;
    return new;
  end if;
  select owner_id, title into owner, book_title from public.books where id = new.book_id;
  if owner is not null and owner <> new.requester_id then
    insert into public.notifications (user_id, kind, title, body, link)
    values (owner, 'request', 'New request for your book', 'Someone requested ' || coalesce(book_title, 'your book') || '.', '/book/' || new.book_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_book_request_created on public.book_requests;
create trigger on_book_request_created
  after insert on public.book_requests
  for each row execute procedure public.notify_book_owner_of_request();
