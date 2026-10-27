import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import { loadConversations, type Conversation } from '../lib/chat';
import { useStore } from '../store/store';

export default function ChatList() {
  const navigate = useNavigate(); const { session, books, getProfile } = useStore(); const [conversations, setConversations] = useState<Conversation[]>([]); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { void loadConversations().then(setConversations).catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load messages.')).finally(() => setLoading(false)); }, []);
  const other = (conversation: Conversation) => conversation.participantOne === session?.user.id ? conversation.participantTwo : conversation.participantOne;
  return <PageTransition><ScreenHeader title="Chat" />{loading ? <div className="mx-5 mt-5 h-32 animate-pulse rounded-2xl bg-[var(--color-surface-2)]" /> : error ? <div className="px-5 pt-6 text-sm text-rose-400">{error}</div> : conversations.length ? <div className="mx-auto max-w-[760px] space-y-2 px-5 pb-8 pt-4">{conversations.map((conversation) => { const member = getProfile(other(conversation)); const book = books.find((item) => item.id === conversation.bookId); return <button key={conversation.id} onClick={() => navigate(`/chat/${conversation.id}`)} className="tap flex w-full items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary-2)]"><MessageCircle size={19} /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{member?.displayName || 'BookBridge member'}</p><p className="mt-1 truncate text-xs text-[var(--color-text-dim)]">{book?.title || 'Book conversation'}</p></div></button>; })}</div> : <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/15"><MessageCircle size={28} className="text-[var(--color-primary-2)]" /></div><h1 className="mt-5 text-[19px] font-bold text-[var(--color-text)]">No chats yet</h1><p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[var(--color-text-dim)]">When a donor accepts your request, a secure chat will appear here.</p></div>}</PageTransition>;
}
