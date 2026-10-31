-- Safe owner-controlled book deletion.
-- Apply after schema.sql and admin-and-workflow.sql.

-- A book delete uses the book_requests foreign key's ON DELETE SET NULL action.
-- Allow only that database-driven nulling after the source book has gone away;
-- user-initiated reassignment remains blocked.
create or replace function public.validate_book_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing_owner uuid;
  is_book_deletion_nulling boolean := false;
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
    if old.requester_id = (select auth.uid()) and new.status is distinct from old.status then
      raise exception 'Only the book owner can change a request status';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.validate_book_request() from public;

create or replace function public.delete_owned_book_listing(target_book_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_book public.books;
  deleted_cover_url text;
begin
  select * into target_book from public.books where id = target_book_id for update;
  if target_book.id is null then raise exception 'Book listing not found'; end if;
  if (select auth.uid()) is distinct from target_book.owner_id then raise exception 'Only the book owner can delete this listing'; end if;
  if target_book.status = 'Given' or exists (select 1 from public.book_requests where book_id = target_book_id and status = 'Completed') then
    raise exception 'Completed donations remain in history';
  end if;
  update public.book_requests set status = 'Declined'
    where book_id = target_book_id and status in ('Pending', 'Accepted');
  delete from public.books where id = target_book_id and owner_id = (select auth.uid())
    returning cover_url into deleted_cover_url;
  if not found then raise exception 'Book listing could not be deleted'; end if;
  return deleted_cover_url;
end;
$$;
revoke all on function public.delete_owned_book_listing(uuid) from public;
grant execute on function public.delete_owned_book_listing(uuid) to authenticated;
