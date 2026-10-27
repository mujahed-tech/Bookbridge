import { useState } from 'react';
import { Check, X, Inbox } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import { getCategory } from '../data/categories';
import { relativeTime } from '../lib/time';
import { useStore } from '../store/store';
import { confirmBookHandover } from '../lib/chat';

export default function ReceivedRequests() {
  const { receivedRequests, books, getProfile, respondToRequest } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const respond = async (id: string, decision: 'Accepted' | 'Declined') => {
    const request = receivedRequests.find((item) => item.id === id);
    if (!request) return;
    setBusy(id); setError('');
    if (!await respondToRequest(request, decision)) setError('Could not update this request. Run the updated Supabase schema, then try again.');
    setBusy(null);
  };
  const confirmHandover = async (id: string) => { if (!window.confirm('Confirm that you handed over this book? The donation completes only after the receiver also confirms.')) return; try { await confirmBookHandover(id); setError('Handover recorded. The donation completes after the receiver confirms receipt.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not confirm handover.'); } };
  return <PageTransition><ScreenHeader title="Received Requests" />{receivedRequests.length === 0 ? <div className="flex flex-col items-center px-8 pt-24 text-center"><Inbox size={36} className="text-[var(--color-text-faint)]" /><p className="mt-4 text-[13.5px] text-[var(--color-text-dim)]">No requests for your books yet</p></div> : <div className="flex flex-col gap-3 px-5 pb-8 pt-4">{error && <p className="text-[12.5px] text-rose-400">{error}</p>}{receivedRequests.map((request) => { const requester = getProfile(request.requesterId); const book = books.find((item) => item.id === request.bookId); const pending = request.status === 'Pending'; return <div key={request.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[14px] font-semibold text-[var(--color-text)]">{request.title}</p><p className="mt-1 text-[12px] text-[var(--color-text-dim)]">Requested by {requester?.displayName || 'BookBridge member'}</p><p className="mt-1 text-[11px] text-[var(--color-text-faint)]">{getCategory(request.category)?.name || 'Other'} · {relativeTime(request.createdAt)}</p></div><span className="rounded-full bg-[var(--color-primary)]/15 px-2.5 py-1 text-[10.5px] font-semibold text-[var(--color-primary-2)]">{request.status}</span></div>{book && <p className="mt-3 text-[12px] text-[var(--color-text-dim)]">Your listing: {book.title}</p>}{request.notes && <p className="mt-2 rounded-xl bg-[var(--color-surface-2)] p-3 text-[12px] text-[var(--color-text-dim)]">{request.notes}</p>}{pending && <div className="mt-4 grid grid-cols-2 gap-2"><button disabled={busy === request.id} onClick={() => respond(request.id, 'Declined')} className="tap flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/40 py-2.5 text-[12.5px] font-semibold text-rose-400 disabled:opacity-50"><X size={15} />Decline</button><button disabled={busy === request.id} onClick={() => respond(request.id, 'Accepted')} className="tap flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-50"><Check size={15} />Accept</button></div>}{request.status === 'Accepted' && <button onClick={() => void confirmHandover(request.id)} className="tap mt-4 rounded-xl border border-[var(--color-border)] px-3.5 py-2 text-xs font-semibold">Confirm handover</button>}</div>; })}</div>}</PageTransition>;
}
