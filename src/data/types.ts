// Shared data model for BookBridge.
// These types mirror the Supabase tables defined in supabase/schema.sql.

export type Gradient = [string, string];

export type BookCondition = 'New' | 'Like New' | 'Good' | 'Fair';
export type BookStatus = 'Available' | 'Requested' | 'Reserved' | 'Given';

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name, resolved through lib/icons.ts
  gradient: Gradient;
}

/** A member of the community — one row of public.profiles. */
export interface Profile {
  id: string;
  displayName: string;
  location: string;
  bio: string;
  avatarUrl?: string;
  role?: 'member' | 'admin';
}

/** A listing — one row of public.books. */
export interface Book {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  category: string;
  condition: BookCondition;
  description: string;
  gradient: Gradient;
  coverUrl?: string;
  location: string;
  language: string;
  pages: number;
  status: BookStatus;
  communityId?: string;
  createdAt: string; // ISO timestamp, formatted for display by lib/time.ts
}

/** What the donate form collects. The database fills in id, owner and timestamps. */
export interface BookDraft {
  title: string;
  author: string;
  category: string;
  condition: BookCondition;
  description: string;
  gradient: Gradient;
  coverUrl?: string;
  location: string;
  language: string;
  pages: number;
  communityId?: string;
}

export type RequestStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled' | 'Completed';
export type RequestUrgency = 'Anytime' | 'Soon' | 'Urgent';

/** A wanted book — one row of public.book_requests. */
export interface BookRequest {
  id: string;
  requesterId: string;
  bookId?: string;
  title: string;
  author?: string;
  category: string;
  notes: string;
  urgency: RequestUrgency;
  status: RequestStatus;
  donorConfirmedAt?: string;
  receiverConfirmedAt?: string;
  createdAt: string;
}

/** One row of public.messages. */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

/** One row of public.conversations, joined with its other participant. */
export interface Conversation {
  id: string;
  otherUserId: string;
  bookId?: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

export type NotificationKind =
  | 'message'
  | 'request'
  | 'accepted'
  | 'reminder'
  | 'system'
  | 'donation';

/** One row of public.notifications. */
export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link: string;
  bookId?: string;
  requestId?: string;
  conversationId?: string;
  read: boolean;
  createdAt: string;
}

export type CommunityVisibility = 'public' | 'private';
export type CommunityRole = 'admin' | 'member';
export type MembershipStatus = 'approved' | 'left';

export interface Community {
  id: string;
  name: string;
  instituteName: string;
  description: string;
  location: string;
  logoUrl?: string;
  visibility: CommunityVisibility;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

export interface CommunityMembership {
  communityId: string;
  userId: string;
  role: CommunityRole;
  status: MembershipStatus;
  joinedAt: string;
}

export interface CommunityJoinRequest {
  id: string;
  communityId: string;
  requesterId: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CommunityNote {
  id: string;
  communityId: string;
  uploadedBy: string;
  title: string;
  description: string;
  subject: string;
  course: string;
  classYear: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface DiscussionPost {
  id: string;
  communityId: string;
  authorId: string;
  kind: 'discussion' | 'announcement';
  body: string;
  createdAt: string;
}
