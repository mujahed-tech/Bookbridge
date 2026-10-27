-- BookBridge accepted-request chat and donation completion upgrade.
-- Additive and safe to rerun. Run only after schema.sql and admin-and-workflow.sql.

alter table public.book_requests add column if not exists donor_confirmed_at timestamptz;
alter table public.book_requests add column if not exists receiver_confirmed_at timestamptz;

-- Add the explicit cancellation outcome required to release a reservation.
-- Existing request values remain valid. The named constraint is from schema.sql.
alter table public.book_requests drop constraint if exists book_requests_status_check;
alter table public.book_requests add constraint book_requests_status_check
  check (status in ('Pending', 'Accepted', 'Declined', 'Cancelled', 'Completed'));

-- Securely resolve an accepted reservation. The caller is checked inside the
-- function; UI visibility is therefore never the authorization mechanism.
create or replace function public.resolve_book_reservation(request_id uuid, resolution text)
returns void language plpgsql security definer set search_path = '' as $$
declare request_row public.book_requests; book_owner_id uuid; book_title text;
begin
  select * into request_row from public.book_requests where id = request_id and status = 'Accepted' and book_id is not null for update;
  if request_row.id is null then raise exception 'An accepted book request is required'; end if;
  select b.owner_id, b.title into book_owner_id, book_title from public.books as b where b.id = request_row.book_id for update;
  if resolution = 'receiver_cancel' then
    if (select auth.uid()) <> request_row.requester_id then raise exception 'Only the requester can cancel this reservation'; end if;
    update public.book_requests set status = 'Cancelled' where id = request_id;
    update public.books set status = 'Available' where id = request_row.book_id and status = 'Reserved';
    insert into public.notifications (user_id, kind, title, body, link) values (book_owner_id, 'system', 'Reservation cancelled', 'The requester cancelled their reservation for ' || coalesce(book_title, 'your book') || '.', '/book/' || request_row.book_id);
  elsif resolution = 'donor_cancel' then
    if (select auth.uid()) <> book_owner_id then raise exception 'Only the book owner can cancel this reservation'; end if;
    update public.book_requests set status = 'Cancelled' where id = request_id;
    update public.books set status = 'Available' where id = request_row.book_id and status = 'Reserved';
    insert into public.notifications (user_id, kind, title, body, link) values (request_row.requester_id, 'system', 'Reservation cancelled', 'The donor cancelled the reservation for ' || coalesce(book_title, 'this book') || '.', '/book/' || request_row.book_id);
  elsif resolution = 'given_away' then
    if (select auth.uid()) <> book_owner_id then raise exception 'Only the book owner can mark this book as given away'; end if;
    update public.book_requests set status = 'Cancelled' where id = request_id;
    update public.books set status = 'Given' where id = request_row.book_id;
    insert into public.notifications (user_id, kind, title, body, link) values (request_row.requester_id, 'system', 'Book no longer available', coalesce(book_title, 'This book') || ' was given away and is no longer available.', '/book/' || request_row.book_id);
  else
    raise exception 'Invalid reservation resolution';
  end if;
end;
$$;
revoke all on function public.resolve_book_reservation(uuid, text) from public;
grant execute on function public.resolve_book_reservation(uuid, text) to authenticated;

-- Keep future request and listing states in sync even when a request is updated
-- outside the React client. This intentionally does not rewrite existing data.
create or replace function public.sync_book_lifecycle_from_request()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.book_id is null or new.status is not distinct from old.status then return new; end if;
  if new.status = 'Accepted' then
    update public.books as b set status = 'Reserved' where b.id = new.book_id and b.status = 'Available';
  elsif new.status = 'Completed' then
    update public.books as b set status = 'Given' where b.id = new.book_id and b.status <> 'Given';
  end if;
  return new;
end;
$$;
revoke all on function public.sync_book_lifecycle_from_request() from public;
drop trigger if exists on_book_request_lifecycle_changed on public.book_requests;
create trigger on_book_request_lifecycle_changed
  after update of status on public.book_requests
  for each row execute procedure public.sync_book_lifecycle_from_request();

-- ---------------------------------------------------------------------------
-- ONE-TIME LEGACY STATE RECONCILIATION (safe to rerun)
-- ---------------------------------------------------------------------------
-- Earlier versions accepted a request and reserved its book in separate client
-- updates. The statements below reconcile only books that are linked to an
-- Accepted or Completed book request. They never touch pending, declined, or
-- unlinked books; they do not delete or create records or change ownership.
--
-- Completed takes priority. This prevents a historical donation from being
-- moved back to Reserved when an older Accepted request also exists for it.
update public.books as b
set status = 'Given'
where b.status is distinct from 'Given'
  and exists (
    select 1 from public.book_requests as r
    where r.book_id = b.id and r.status = 'Completed'
  );

update public.books as b
set status = 'Reserved'
where b.status is distinct from 'Reserved'
  and b.status is distinct from 'Given'
  and exists (
    select 1 from public.book_requests as r
    where r.book_id = b.id and r.status = 'Accepted'
  )
  and not exists (
    select 1 from public.book_requests as r
    where r.book_id = b.id and r.status = 'Completed'
  );

-- A conversation can only be created by one of the two participants of an accepted,
-- book-specific request. Ordering IDs prevents duplicate participant-pair rows.
create or replace function public.get_or_create_accepted_request_conversation(request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare request_row public.book_requests; book_owner_id uuid; one_id uuid; two_id uuid; conversation_id uuid;
begin
  select * into request_row from public.book_requests where id = request_id and status = 'Accepted' and book_id is not null;
  if request_row.id is null then raise exception 'An accepted book request is required'; end if;
  select b.owner_id into book_owner_id from public.books as b where b.id = request_row.book_id;
  if book_owner_id is null or (select auth.uid()) not in (book_owner_id, request_row.requester_id) then raise exception 'Not allowed to open this conversation'; end if;
  if book_owner_id::text < request_row.requester_id::text then one_id := book_owner_id; two_id := request_row.requester_id; else one_id := request_row.requester_id; two_id := book_owner_id; end if;
  insert into public.conversations (participant_one, participant_two, book_id) values (one_id, two_id, request_row.book_id)
  on conflict (participant_one, participant_two, book_id) do update set book_id = excluded.book_id
  returning id into conversation_id;
  return conversation_id;
end;
$$;
revoke all on function public.get_or_create_accepted_request_conversation(uuid) from public;
grant execute on function public.get_or_create_accepted_request_conversation(uuid) to authenticated;

-- Both participants explicitly confirm the physical handover before the listing is marked Given.
create or replace function public.confirm_book_handover(request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare request_row public.book_requests; book_owner_id uuid;
begin
  select * into request_row from public.book_requests where id = request_id and status = 'Accepted' and book_id is not null for update;
  if request_row.id is null then raise exception 'An accepted book request is required'; end if;
  select b.owner_id into book_owner_id from public.books as b where b.id = request_row.book_id for update;
  if (select auth.uid()) = book_owner_id then update public.book_requests set donor_confirmed_at = coalesce(donor_confirmed_at, now()) where id = request_id;
  elsif (select auth.uid()) = request_row.requester_id then update public.book_requests set receiver_confirmed_at = coalesce(receiver_confirmed_at, now()) where id = request_id;
  else raise exception 'Not allowed to confirm this handover'; end if;
  select * into request_row from public.book_requests where id = request_id;
  if request_row.donor_confirmed_at is not null and request_row.receiver_confirmed_at is not null then
    update public.book_requests set status = 'Completed' where id = request_id;
    update public.books set status = 'Given' where id = request_row.book_id;
  end if;
end;
$$;
revoke all on function public.confirm_book_handover(uuid) from public;
grant execute on function public.confirm_book_handover(uuid) to authenticated;

notify pgrst, 'reload schema';
