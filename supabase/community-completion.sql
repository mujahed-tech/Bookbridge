-- BookBridge Community completion upgrade.
-- Run after community-and-notes.sql. It only adds policies, functions, and triggers.

-- A requester may cancel their own pending private-community request; no one can alter another request.
-- PostgreSQL has no CREATE POLICY IF NOT EXISTS, so guard the operation explicitly.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'community_join_requests'
      and policyname = 'requesters cancel pending join requests'
  ) then
    create policy "requesters cancel pending join requests" on public.community_join_requests for delete to authenticated
      using (requester_id = (select auth.uid()) and status = 'pending');
  end if;
end;
$$;

-- Community admins can read the member list; normal members continue to see only their own membership.
-- This uses the existing "members see relevant memberships" policy, which already includes community admins.

create or replace function public.notify_community_join_decision()
returns trigger language plpgsql security definer set search_path = '' as $$
declare community_name text;
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    select name into community_name from public.communities where id = new.community_id;
    insert into public.notifications (user_id, kind, title, body, link)
    values (
      new.requester_id,
      case when new.status = 'approved' then 'accepted' else 'system' end,
      case when new.status = 'approved' then 'Community request approved' else 'Community request declined' end,
      coalesce(community_name, 'The community') || case when new.status = 'approved' then ' approved your membership request.' else ' declined your membership request.' end,
      '/communities/' || new.community_id
    );
  end if;
  return new;
end;
$$;
revoke all on function public.notify_community_join_decision() from public;
drop trigger if exists on_community_join_request_reviewed on public.community_join_requests;
create trigger on_community_join_request_reviewed after update of status on public.community_join_requests
  for each row execute procedure public.notify_community_join_decision();

notify pgrst, 'reload schema';
