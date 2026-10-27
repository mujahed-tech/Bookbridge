-- BookBridge additive security and admin upgrade.
-- Run once in Supabase Dashboard -> SQL Editor. It preserves every existing table and row.

alter table public.profiles add column if not exists role text not null default 'member'
  check (role in ('member', 'admin'));

create or replace function public.is_bookbridge_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke all on function public.is_bookbridge_admin() from public;
grant execute on function public.is_bookbridge_admin() to authenticated;

drop policy if exists "users can edit own profile" on public.profiles;
create policy "users can edit own profile without role change" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select role from public.profiles where id = (select auth.uid())));
create policy "admins can manage profiles" on public.profiles for update to authenticated
  using ((select public.is_bookbridge_admin())) with check ((select public.is_bookbridge_admin()));

create policy "admins can manage books" on public.books for all to authenticated
  using ((select public.is_bookbridge_admin())) with check ((select public.is_bookbridge_admin()));
create policy "admins can view all requests" on public.book_requests for select to authenticated
  using ((select public.is_bookbridge_admin()));
create policy "admins can manage requests" on public.book_requests for update to authenticated
  using ((select public.is_bookbridge_admin())) with check ((select public.is_bookbridge_admin()));

create or replace function public.validate_book_request()
returns trigger language plpgsql security definer set search_path = '' as $$
declare listing_owner uuid;
begin
  if tg_op = 'INSERT' and new.book_id is not null then
    select owner_id into listing_owner from public.books where id = new.book_id;
    if listing_owner is null then raise exception 'The selected book no longer exists'; end if;
    if listing_owner = new.requester_id then raise exception 'You cannot request your own book'; end if;
  end if;
  if tg_op = 'UPDATE' and not public.is_bookbridge_admin() then
    if new.requester_id is distinct from old.requester_id or new.book_id is distinct from old.book_id then raise exception 'A request cannot be reassigned'; end if;
    if old.requester_id = (select auth.uid()) and new.status is distinct from old.status then raise exception 'Only the book owner can change a request status'; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.validate_book_request() from public;
drop trigger if exists validate_book_request_change on public.book_requests;
create trigger validate_book_request_change before insert or update on public.book_requests
  for each row execute procedure public.validate_book_request();

-- Let the requester know when a donation is accepted or declined.
create or replace function public.notify_requester_of_decision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status and new.status in ('Accepted', 'Declined') then
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      new.requester_id,
      case when new.status = 'Accepted' then 'accepted' else 'request' end,
      case when new.status = 'Accepted' then 'Your request was accepted' else 'Your request was declined' end,
      'Update for ' || coalesce(new.requested_title, 'your book request') || '.',
      '/my-requests'
    );
  end if;
  return new;
end;
$$;
revoke all on function public.notify_requester_of_decision() from public;
drop trigger if exists notify_requester_of_decision on public.book_requests;
create trigger notify_requester_of_decision after update of status on public.book_requests
  for each row execute procedure public.notify_requester_of_decision();

-- Choose the first administrator manually. Replace the placeholder with their auth user id.
-- update public.profiles set role = 'admin' where id = 'PASTE_ADMIN_USER_UUID_HERE';
