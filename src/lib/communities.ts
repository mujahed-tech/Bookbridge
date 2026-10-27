import { supabase } from './supabase';
import type { Community, CommunityJoinRequest, CommunityMembership } from '../data/types';

type CommunityRow = { id: string; name: string; institute_name: string; description: string; location: string | null; logo_url: string | null; visibility: Community['visibility']; member_count: number; created_by: string; created_at: string };
type MembershipRow = { community_id: string; user_id: string; role: CommunityMembership['role']; status: CommunityMembership['status']; joined_at: string };
type RequestRow = { id: string; community_id: string; requester_id: string; message: string; status: CommunityJoinRequest['status']; created_at: string };

export const toCommunity = (row: CommunityRow): Community => ({ id: row.id, name: row.name, instituteName: row.institute_name, description: row.description, location: row.location ?? '', logoUrl: row.logo_url ?? undefined, visibility: row.visibility, memberCount: row.member_count, createdBy: row.created_by, createdAt: row.created_at });
const toMembership = (row: MembershipRow): CommunityMembership => ({ communityId: row.community_id, userId: row.user_id, role: row.role, status: row.status, joinedAt: row.joined_at });
const toJoinRequest = (row: RequestRow): CommunityJoinRequest => ({ id: row.id, communityId: row.community_id, requesterId: row.requester_id, message: row.message, status: row.status, createdAt: row.created_at });

export async function loadCommunities(userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const [communityResult, membershipResult, requestResult] = await Promise.all([
    supabase.from('communities').select('*').order('created_at', { ascending: false }),
    supabase.from('community_members').select('*').eq('user_id', userId),
    supabase.from('community_join_requests').select('*').eq('requester_id', userId),
  ]);
  if (communityResult.error || membershipResult.error || requestResult.error) throw new Error(communityResult.error?.message ?? membershipResult.error?.message ?? requestResult.error?.message ?? 'Could not load communities.');
  return { communities: (communityResult.data as CommunityRow[]).map(toCommunity), memberships: (membershipResult.data as MembershipRow[]).map(toMembership), joinRequests: (requestResult.data as RequestRow[]).map(toJoinRequest) };
}

export async function createCommunity(input: Pick<Community, 'name' | 'instituteName' | 'description' | 'location' | 'visibility'>, userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('communities').insert({ name: input.name, institute_name: input.instituteName, description: input.description, location: input.location || null, visibility: input.visibility, created_by: userId }).select('*').single();
  if (error || !data) throw new Error(error?.message ?? 'Could not create community.');
  return toCommunity(data as CommunityRow);
}

export async function joinCommunity(community: Community, userId: string, message = '') {
  if (!supabase) throw new Error('Supabase is not configured.');
  const result = community.visibility === 'public'
    ? await supabase.from('community_members').insert({ community_id: community.id, user_id: userId, role: 'member', status: 'approved' })
    : await supabase.from('community_join_requests').insert({ community_id: community.id, requester_id: userId, message, status: 'pending' });
  const { error } = result;
  if (error) throw new Error(error.message);
}

export async function leaveCommunity(communityId: string, userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('community_members').update({ status: 'left' }).eq('community_id', communityId).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

export async function cancelCommunityJoinRequest(communityId: string, userId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('community_join_requests').delete().eq('community_id', communityId).eq('requester_id', userId).eq('status', 'pending');
  if (error) throw new Error(error.message);
}

export async function loadCommunityMembers(communityId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('community_members').select('*').eq('community_id', communityId).eq('status', 'approved').order('joined_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MembershipRow[]).map(toMembership);
}

export async function loadCommunityJoinRequests(communityId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('community_join_requests').select('*').eq('community_id', communityId).eq('status', 'pending').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as RequestRow[]).map(toJoinRequest);
}

export async function reviewCommunityJoinRequest(requestId: string, decision: 'approved' | 'rejected') {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.rpc('review_community_join_request', { request_id: requestId, decision });
  if (error) throw new Error(error.message);
}

export async function deleteCommunity(communityId: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { error } = await supabase.from('communities').delete().eq('id', communityId);
  if (error) throw new Error(error.message);
}
