import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListX, Clock, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import { getCategory } from '../data/categories';
import { relativeTime } from '../lib/time';
import { useStore } from '../store/store';
import { confirmBookHandover, openAcceptedRequestConversation } from '../lib/chat';

const statusMeta = { Pending: { color: '#F5A623', icon: Clock }, Accepted: { color: '#2DD4BF', icon: CheckCircle2 }, Declined: { color: '#F87171', icon: ListX }, Cancelled: { color: '#94A3B8', icon: ListX }, Completed: { color: '#7C6FFF', icon: CheckCircle2 } };

export default function MyRequests() {
  const navigate = useNavigate();
  const { requests, refresh } = useStore();
  const [error, setError] = useState('');
  const chat = async (requestId: string) => { try { navigate(`/chat/${await openAcceptedRequestConversation(requestId)}`); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not open chat.'); } };
  const confirmReceipt = async (requestId: string) => { try { await confirmBookHandover(requestId); await refresh(); setError('Receipt recorded. The donation is now complete.'); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not confirm receipt.'); } };
  return <PageTransition><ScreenHeader title="My Requests" right={<button onClick={() => navigate('/request')} className="tap flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/15"><Plus size={17} className="text-[var(--color-primary-2)]" /></button>} />
    {requests.length === 0 ? <div className="flex flex-col items-center px-8 pt-24 text-center"><ListX size={36} className="text-[var(--color-text-faint)]" /><p className="mt-4 text-[13.5px] text-[var(--color-text-dim)]">You haven't requested any books yet</p><button onClick={() => navigate('/request')} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white">Request a book</button></div> : <div className="flex flex-col gap-3 px-5 pb-8 pt-3">{error && <p className="text-sm text-rose-400">{error}</p>}{requests.map((request) => {
      const meta = statusMeta[request.status]; const Icon = meta.icon;
      return <article key={request.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left"><button onClick={() => request.bookId && navigate(`/book/${request.bookId}`)} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div><p className="text-[14px] font-semibold text-[var(--color-text)]">{request.title}</p><p className="mt-1 text-[11px] text-[var(--color-text-faint)]">{getCategory(request.category)?.name || 'Other'} · {relativeTime(request.createdAt)}</p></div><span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold" style={{ color: meta.color, backgroundColor: `${meta.color}22` }}><Icon size={11} />{request.status}</span></div>{request.notes && <p className="mt-3 text-[12px] text-[var(--color-text-dim)]">{request.notes}</p>}</button>{request.status === 'Accepted' && <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void chat(request.id)} className="tap rounded-xl bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold">Open chat</button><button disabled={!request.donorConfirmedAt} title={!request.donorConfirmedAt ? 'Waiting for the donor to confirm handover.' : undefined} onClick={() => void confirmReceipt(request.id)} className="tap rounded-xl border border-[var(--color-border)] px-3.5 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">{request.donorConfirmedAt ? "I've received the book" : 'Waiting for handover'}</button></div>}</article>;
    })}</div>}
  </PageTransition>;
}
