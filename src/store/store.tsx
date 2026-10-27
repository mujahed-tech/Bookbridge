import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Book, BookDraft, BookRequest, Notification, Profile } from '../data/types';
import { supabase } from '../lib/supabase';

const FALLBACK_GRADIENT: Book['gradient'] = ['#7C6FFF', '#3B82F6'];

type BookRow = {
  id: string;
  owner_id: string;
  title: string;
  author: string;
  category: string;
  condition: Book['condition'];
  description: string | null;
  cover_gradient: string[] | null;
  cover_url: string | null;
  location: string | null;
  language: string | null;
  pages: number | null;
  status: Book['status'];
  community_id?: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  role?: Profile['role'];
};

type RequestRow = {
  id: string;
  requester_id: string;
  book_id: string | null;
  requested_title: string | null;
  category: string | null;
  notes: string | null;
  urgency: BookRequest['urgency'];
  status: BookRequest['status'];
  created_at: string;
};

type NotificationRow = {
  id: string;
  kind: Notification['kind'];
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const toBook = (row: BookRow): Book => ({
  id: row.id,
  ownerId: row.owner_id,
  title: row.title,
  author: row.author,
  category: row.category,
  condition: row.condition,
  description: row.description ?? '',
  gradient: (row.cover_gradient?.length === 2 ? row.cover_gradient : FALLBACK_GRADIENT) as Book['gradient'],
  coverUrl: row.cover_url ?? undefined,
  location: row.location ?? '',
  language: row.language ?? 'English',
  pages: row.pages ?? 0,
  status: row.status,
  communityId: row.community_id ?? undefined,
  createdAt: row.created_at,
});

const toProfile = (row: ProfileRow): Profile => ({
  id: row.id,
  displayName: row.display_name,
  location: row.location ?? '',
  bio: row.bio ?? '',
  avatarUrl: row.avatar_url ?? undefined,
  role: row.role ?? 'member',
});

const toRequest = (row: RequestRow): BookRequest => ({
  id: row.id,
  requesterId: row.requester_id,
  bookId: row.book_id ?? undefined,
  title: row.requested_title ?? 'Untitled request',
  category: row.category ?? '',
  notes: row.notes ?? '',
  urgency: row.urgency,
  status: row.status,
  createdAt: row.created_at,
});

const toNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  kind: row.kind,
  title: row.title,
  body: row.body,
  link: row.link ?? '/home',
  read: Boolean(row.read_at),
  createdAt: row.created_at,
});

export interface NewRequestInput {
  bookId?: string;
  title: string;
  author?: string;
  category: string;
  notes: string;
  urgency: BookRequest['urgency'];
}

interface StoreShape {
  /** Every listing visible to the signed-in member, newest first. */
  books: Book[];
  /** Requests the signed-in member has made. */
  requests: BookRequest[];
  /** Requests received for books owned by the signed-in member. */
  receivedRequests: BookRequest[];
  notifications: Notification[];
  /** A notification received live while the member is online. */
  liveNotification: Notification | null;
  unreadNotifications: number;
  /** The signed-in member's own profile, or null when signed out. */
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  /** The last failed Supabase read, shown once globally instead of appearing as empty data. */
  dataError: string | null;
  isAdmin: boolean;
  /** True when Supabase credentials are missing, so the app can explain itself. */
  isOffline: boolean;

  getProfile: (id: string | undefined) => Profile | undefined;
  addBook: (draft: BookDraft) => Promise<string | null>;
  addRequest: (input: NewRequestInput) => Promise<boolean>;
  respondToRequest: (request: BookRequest, status: 'Accepted' | 'Declined') => Promise<boolean>;
  updateBookStatus: (bookId: string, status: Book['status']) => Promise<boolean>;
  deleteBook: (book: Book) => Promise<{ ok: boolean; reason?: string; warning?: string; activeStatuses?: string[] }>;
  saveProfile: (changes: Pick<Profile, 'displayName' | 'location' | 'bio'>) => Promise<boolean>;
  markNotificationsRead: (ids?: string[]) => Promise<void>;
  clearLiveNotification: () => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreShape | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<BookRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liveNotification, setLiveNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [dataError, setDataError] = useState<string | null>(null);
  const notificationIds = useRef<Set<string>>(new Set());
  const hasLoadedNotifications = useRef(false);

  const userId = session?.user.id;

  /** Loads everything the signed-in member can see. Safe to call repeatedly. */
  const loadData = useCallback(async (currentUserId: string | undefined) => {
    if (!supabase) return;
    const client = supabase;

    const [booksResult, profilesWithRoleResult] = await Promise.all([
      client.from('books').select('*').order('created_at', { ascending: false }),
      client.from('profiles').select('id, display_name, location, bio, avatar_url, role'),
    ]);

    const profilesResult = profilesWithRoleResult.error?.code === '42703'
      ? await client.from('profiles').select('id, display_name, location, bio, avatar_url')
      : profilesWithRoleResult;

    if (booksResult.error || profilesResult.error) {
      setDataError(booksResult.error?.message ?? profilesResult.error?.message ?? 'BookBridge could not load its data.');
      return;
    }
    setDataError(null);
    setBooks((booksResult.data as BookRow[] | null)?.map(toBook) ?? []);
    setProfiles((profilesResult.data as ProfileRow[] | null)?.map(toProfile) ?? []);

    if (!currentUserId) {
      setRequests([]);
      setReceivedRequests([]);
      setNotifications([]);
      setLiveNotification(null);
      notificationIds.current = new Set();
      hasLoadedNotifications.current = false;
      return;
    }

    const [requestsResult, receivedResult, notificationsResult] = await Promise.all([
      client
        .from('book_requests')
        .select('*')
        .eq('requester_id', currentUserId)
        .order('created_at', { ascending: false }),
      client.from('book_requests').select('*').order('created_at', { ascending: false }),
      client
        .from('notifications')
        .select('id, kind, title, body, link, read_at, created_at')
        .order('created_at', { ascending: false }),
    ]);

    if (requestsResult.error || receivedResult.error || notificationsResult.error) {
      setDataError(requestsResult.error?.message ?? receivedResult.error?.message ?? notificationsResult.error?.message ?? 'BookBridge could not load your member data.');
      return;
    }
    setRequests((requestsResult.data as RequestRow[] | null)?.map(toRequest) ?? []);
    setReceivedRequests((receivedResult.data as RequestRow[] | null)?.map(toRequest) ?? []);
    const loadedNotifications = (notificationsResult.data as NotificationRow[] | null)?.map(toNotification) ?? [];
    const newNotification = hasLoadedNotifications.current
      ? loadedNotifications.find((notification) => !notificationIds.current.has(notification.id))
      : undefined;

    notificationIds.current = new Set(loadedNotifications.map((notification) => notification.id));
    hasLoadedNotifications.current = true;
    setNotifications(loadedNotifications);
    if (newNotification) setLiveNotification(newNotification);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const client = supabase;
    let active = true;

    const start = async () => {
      const { data } = await client.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await loadData(data.session?.user.id);
      if (active) setIsLoading(false);
    };
    start();

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadData(nextSession?.user.id);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadData]);

  // Keeps bell notifications current when another signed-in member makes a request.
  useEffect(() => {
    if (!supabase || !userId) return;
    const timer = window.setInterval(() => loadData(userId), 10000);
    return () => window.clearInterval(timer);
  }, [userId, loadData]);

  useEffect(() => {
    if (!supabase || !userId) return;
    const client = supabase;
    const channel = client
      .channel(`member-notifications-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => {
        const notification = toNotification(payload.new as NotificationRow);
        notificationIds.current.add(notification.id);
        hasLoadedNotifications.current = true;
        setNotifications((previous) => previous.some((item) => item.id === notification.id) ? previous : [notification, ...previous]);
        setLiveNotification(notification);
      })
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [userId]);

  const getProfile = useCallback(
    (id: string | undefined) => (id ? profiles.find((item) => item.id === id) : undefined),
    [profiles],
  );

  const addBook = useCallback(
    async (draft: BookDraft): Promise<string | null> => {
      if (!supabase || !userId) return null;
      const { data, error } = await supabase
        .from('books')
        .insert({
          owner_id: userId,
          title: draft.title,
          author: draft.author,
          category: draft.category,
          condition: draft.condition,
          description: draft.description,
          cover_gradient: draft.gradient,
          cover_url: draft.coverUrl ?? null,
          location: draft.location || null,
          language: draft.language,
          pages: draft.pages || null,
          community_id: draft.communityId ?? null,
        })
        .select('*')
        .single();

      if (error || !data) return null;
      const saved = toBook(data as BookRow);
      setBooks((previous) => [saved, ...previous]);
      return saved.id;
    },
    [userId],
  );

  const addRequest = useCallback(
    async (input: NewRequestInput) => {
      if (!supabase || !userId) return false;
      const requestedBook = input.bookId ? books.find((book) => book.id === input.bookId) : undefined;
      if (requestedBook?.ownerId === userId) return false;
      const { data, error } = await supabase
        .from('book_requests')
        .insert({
          requester_id: userId,
          book_id: input.bookId ?? null,
          requested_title: input.title,
          category: input.category || null,
          notes: input.notes,
          urgency: input.urgency,
        })
        .select('*')
        .single();

      if (error || !data) return false;
      setRequests((previous) => [toRequest(data as RequestRow), ...previous]);
      return true;
    },
    [books, userId],
  );

  const respondToRequest = useCallback(
    async (request: BookRequest, status: 'Accepted' | 'Declined') => {
      if (!supabase || !userId) return false;
      const { error } = await supabase.from('book_requests').update({ status }).eq('id', request.id);
      if (error) return false;
      if (status === 'Accepted' && request.bookId) {
        const { error: bookError } = await supabase.from('books').update({ status: 'Reserved' }).eq('id', request.bookId);
        if (bookError) {
          await supabase.from('book_requests').update({ status: 'Pending' }).eq('id', request.id);
          return false;
        }
        setBooks((previous) => previous.map((book) => book.id === request.bookId ? { ...book, status: 'Reserved' } : book));
      }
      setReceivedRequests((previous) => previous.map((item) => item.id === request.id ? { ...item, status } : item));
      return true;
    },
    [userId],
  );

  const updateBookStatus = useCallback(
    async (bookId: string, status: Book['status']) => {
      if (!supabase || !userId) return false;
      const { error } = await supabase.from('books').update({ status }).eq('id', bookId);
      if (error) return false;
      setBooks((previous) => previous.map((book) => book.id === bookId ? { ...book, status } : book));
      return true;
    },
    [userId],
  );

  const deleteBook = useCallback(async (book: Book) => {
    if (!supabase || !userId || book.ownerId !== userId) return { ok: false, reason: 'Only the book owner can remove this listing.' };
    if (book.status !== 'Available') return { ok: false, reason: book.status === 'Given' ? 'Donated books remain in your history.' : 'Only available books without an active request can be deleted.' };
    const { data: activeRequests, error: requestError } = await supabase.from('book_requests').select('id, status').eq('book_id', book.id).in('status', ['Pending', 'Accepted']);
    if (requestError) return { ok: false, reason: `Could not verify active requests: ${requestError.message}` };
    if (activeRequests?.length) {
      const activeStatuses = [...new Set(activeRequests.map((request) => request.status))];
      return { ok: false, activeStatuses, reason: `This book has an active ${activeStatuses.join(' / ')} request. Resolve it before deleting the listing.` };
    }
    const { data: deleted, error } = await supabase.from('books').delete().eq('id', book.id).eq('owner_id', userId).select('id');
    if (error) return { ok: false, reason: `Database deletion failed: ${error.message}` };
    if (!deleted?.length) return { ok: false, reason: 'Database deletion was blocked. Confirm you are the owner and that the books delete RLS policy is enabled.' };
    setBooks((previous) => previous.filter((item) => item.id !== book.id));
    const marker = '/storage/v1/object/public/book-covers/';
    const objectPath = book.coverUrl?.includes(marker) ? decodeURIComponent(book.coverUrl.slice(book.coverUrl.indexOf(marker) + marker.length).split('?')[0]) : undefined;
    if (objectPath) {
      const { error: storageError } = await supabase.storage.from('book-covers').remove([objectPath]);
      if (storageError) return { ok: true, warning: 'Book removed. Its cover image could not be cleaned up automatically.' };
    }
    return { ok: true };
  }, [userId]);

  const saveProfile = useCallback(
    async (changes: Pick<Profile, 'displayName' | 'location' | 'bio'>) => {
      if (!supabase || !userId) return false;
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: changes.displayName,
          location: changes.location,
          bio: changes.bio,
        })
        .select('id, display_name, location, bio, avatar_url')
        .single();

      if (error || !data) return false;
      const saved = toProfile(data as ProfileRow);
      setProfiles((previous) => {
        const others = previous.filter((item) => item.id !== saved.id);
        return [saved, ...others];
      });
      return true;
    },
    [userId],
  );

  const markNotificationsRead = useCallback(
    async (ids?: string[]) => {
      const targets = ids ?? notifications.filter((item) => !item.read).map((item) => item.id);
      if (targets.length === 0) return;

      setNotifications((previous) =>
        previous.map((item) => (targets.includes(item.id) ? { ...item, read: true } : item)),
      );
      if (!supabase || !userId) return;
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', targets);
    },
    [notifications, userId],
  );

  const refresh = useCallback(() => loadData(userId), [loadData, userId]);
  const clearLiveNotification = useCallback(() => setLiveNotification(null), []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setRequests([]);
    setReceivedRequests([]);
    setNotifications([]);
    setLiveNotification(null);
  }, []);

  const profile = useMemo(() => getProfile(userId) ?? null, [getProfile, userId]);
  const isAdmin = profile?.role === 'admin';
  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const value = useMemo<StoreShape>(
    () => ({
      books,
      requests,
      receivedRequests,
      notifications,
      liveNotification,
      unreadNotifications,
      profile,
      session,
      isLoading,
      dataError,
      isAdmin,
      isOffline: !supabase,
      getProfile,
      addBook,
      addRequest,
      respondToRequest,
      updateBookStatus,
      deleteBook,
      saveProfile,
      markNotificationsRead,
      clearLiveNotification,
      refresh,
      signOut,
    }),
    [
      books,
      requests,
      receivedRequests,
      notifications,
      liveNotification,
      unreadNotifications,
      profile,
      session,
      isLoading,
      dataError,
      isAdmin,
      getProfile,
      addBook,
      addRequest,
      respondToRequest,
      updateBookStatus,
      deleteBook,
      saveProfile,
      markNotificationsRead,
      clearLiveNotification,
      refresh,
      signOut,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
