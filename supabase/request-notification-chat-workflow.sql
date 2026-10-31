-- BookBridge request, chat and two-person donation workflow.
-- This is additive/idempotent and matches the production migration.

alter table public.notifications add column if not exists book_id uuid references public.books(id) on delete set null;
alter table public.notifications add column if not exists request_id uuid references public.book_requests(id) on delete set null;
alter table public.notifications add column if not exists conversation_id uuid references public.conversations(id) on delete set null;
alter table public.book_requests add column if not exists donor_confirmed_at timestamptz;
alter table public.book_requests add column if not exists receiver_confirmed_at timestamptz;

create unique index if not exists one_accepted_request_per_book
  on public.book_requests (book_id) where status = 'Accepted' and book_id is not null;
create unique index if not exists one_pending_request_per_user_book
  on public.book_requests (requester_id, book_id) where status = 'Pending' and book_id is not null;

-- Keep reassignment blocked, while allowing only the trusted handover RPC to
-- finish a request on the receiver's behalf. The flag is transaction-local and
-- cannot be set by the browser through the REST API.
create or replace function public.validate_book_request()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  listing_owner uuid;
  is_book_deletion_nulling boolean := false;
  is_lifecycle_update boolean := coalesce(current_setting('bookbridge.lifecycle_update', true), '') = 'on';
begin
  if tg_op = 'INSERT' and new.book_id is not null then
    select owner_id into listing_owner from public.books where id = new.book_id;
    if listing_owner is null then raise exception 'The selected book no longer exists'; end if;
    if listing_owner = new.requester_id then raise exception 'You cannot request your own book'; end if;
  end if;
  if tg_op = 'UPDATE' and not public.is_bookbridge_admin() then
    is_book_deletion_nulling := new.book_id is null and old.book_id is not null
      and not exists (select 1 from public.books where id = old.book_id);
    if new.requester_id is distinct from old.requester_id
       or (new.book_id is distinct from old.book_id and not is_book_deletion_nulling) then
      raise exception 'A request cannot be reassigned';
    end if;
    if old.requester_id = (select auth.uid())
       and new.status is distinct from old.status
       and not is_lifecycle_update then
      raise exception 'Only the book owner can change a request status';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.validate_book_request() from public;

-- Every listing-specific request carries the exact record IDs and requester
-- name. General wanted-book notices keep their existing broadcast behavior.
create or replace function public.notify_book_owner_of_request()
returns trigger language plpgsql security definer set search_path = '' as $$
declare owner_id uuid; book_title text; requester_name text;
begin
  if new.book_id is null then
    insert into public.notifications (user_id, kind, title, body, link, request_id)
    select id, 'request', 'A student needs a book',
      'Someone is looking for ' || coalesce(new.requested_title, 'a book') || '.',
      '/request', new.id
    from public.profiles where id <> new.requester_id;
    return new;
  end if;
  select b.owner_id, b.title, coalesce(p.display_name, 'A BookBridge member')
    into owner_id, book_title, requester_name
  from public.books b left join public.profiles p on p.id = new.requester_id
  where b.id = new.book_id;
  if owner_id is not null and owner_id <> new.requester_id then
    insert into public.notifications (user_id, kind, title, body, link, book_id, request_id)
    values (owner_id, 'request', 'New request for your book',
      requester_name || ' requested ' || coalesce(book_title, 'your book') || '.',
      '/notifications', new.book_id, new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.notify_book_owner_of_request() from public;

-- Avoid a duplicate accepted notification when the secure RPC emits its richer
-- notification with a conversation link. Direct/admin changes still notify.
create or replace function public.notify_requester_of_decision()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(current_setting('bookbridge.suppress_request_status_notification', true), '') = 'on' then return new; end if;
  if new.status is distinct from old.status and new.status in ('Accepted', 'Declined') then
    insert into public.notifications (user_id, kind, title, body, link, book_id, request_id)
    values (new.requester_id,
      case when new.status = 'Accepted' then 'accepted' else 'request' end,
      case when new.status = 'Accepted' then 'Your request was accepted' else 'Your request was declined' end,
      'Update for ' || coalesce(new.requested_title, 'your book request') || '.',
      '/my-requests', new.book_id, new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.notify_requester_of_decision() from public;

create or replace function public.respond_to_book_request(request_id uuid, decision text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare req public.book_requests; listing public.books; one_id uuid; two_id uuid; conversation_id uuid;
begin
  select * into req from public.book_requests where id = request_id and status = 'Pending' and book_id is not null for update;
  if req.id is null then raise exception 'This pending request is no longer available'; end if;
  select * into listing from public.books where id = req.book_id for update;
  if listing.owner_id <> (select auth.uid()) then raise exception 'Only the book owner can respond'; end if;
  if decision = 'Accepted' then
    if listing.status <> 'Available' then raise exception 'This book is no longer available'; end if;
    perform set_config('bookbridge.suppress_request_status_notification', 'on', true);
    update public.book_requests set status = 'Accepted' where id = req.id;
    perform set_config('bookbridge.suppress_request_status_notification', 'off', true);
    update public.book_requests set status = 'Declined' where book_id = req.book_id and id <> req.id and status = 'Pending';
    update public.books set status = 'Reserved' where id = req.book_id;
    if listing.owner_id::text < req.requester_id::text then one_id := listing.owner_id; two_id := req.requester_id; else one_id := req.requester_id; two_id := listing.owner_id; end if;
    insert into public.conversations (participant_one, participant_two, book_id)
      values (one_id, two_id, req.book_id)
      on conflict (participant_one, participant_two, book_id) do update set book_id = excluded.book_id
      returning id into conversation_id;
    insert into public.notifications (user_id, kind, title, body, link, book_id, request_id, conversation_id)
      values (req.requester_id, 'accepted', 'Request accepted',
        coalesce(listing.title, 'Your book request') || ' was accepted. You can now chat with the donor.',
        '/chat/' || conversation_id, req.book_id, req.id, conversation_id);
    return conversation_id;
  elsif decision = 'Declined' then
    perform set_config('bookbridge.suppress_request_status_notification', 'on', true);
    update public.book_requests set status = 'Declined' where id = req.id;
    insert into public.notifications (user_id, kind, title, body, link, book_id, request_id)
      values (req.requester_id, 'system', 'Request declined',
        'The donor declined your request for ' || coalesce(listing.title, 'this book') || '.',
        '/my-requests', req.book_id, req.id);
    return null;
  end if;
  raise exception 'Invalid decision';
end;
$$;
revoke all on function public.respond_to_book_request(uuid, text) from public;
grant execute on function public.respond_to_book_request(uuid, text) to authenticated;

create or replace function public.confirm_book_handover(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare req public.book_requests; owner_id uuid; book_title text;
begin
  select * into req from public.book_requests where id = request_id and status = 'Accepted' and book_id is not null for update;
  if req.id is null then raise exception 'An accepted request is required'; end if;
  select owner_id, title into owner_id, book_title from public.books where id = req.book_id for update;
  if (select auth.uid()) = owner_id then
    update public.book_requests set donor_confirmed_at = coalesce(donor_confirmed_at, now()) where id = req.id;
    insert into public.notifications (user_id, kind, title, body, link, book_id, request_id)
      values (req.requester_id, 'donation', 'Ready for confirmation',
        'The donor marked ' || coalesce(book_title, 'the book') || ' as handed over. Confirm receipt when you have it.',
        '/my-requests', req.book_id, req.id);
  elsif (select auth.uid()) = req.requester_id then
    if req.donor_confirmed_at is null then raise exception 'Wait for the donor to confirm handover first'; end if;
    perform set_config('bookbridge.lifecycle_update', 'on', true);
    update public.book_requests set receiver_confirmed_at = coalesce(receiver_confirmed_at, now()), status = 'Completed' where id = req.id;
    update public.books set status = 'Given' where id = req.book_id;
    insert into public.notifications (user_id, kind, title, body, link, book_id, request_id)
      values (owner_id, 'donation', 'Donation completed',
        'The receiver confirmed receipt of ' || coalesce(book_title, 'your book') || '.',
        '/my-books', req.book_id, req.id);
  else raise exception 'Not allowed to confirm this handover'; end if;
end;
$$;
revoke all on function public.confirm_book_handover(uuid) from public;
grant execute on function public.confirm_book_handover(uuid) to authenticated;

notify pgrst, 'reload schema';
