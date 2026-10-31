import { useState } from 'react';
import { MessageCircle, BookMarked, CheckCircle2, Clock, Sparkles, Gift, BellOff } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import { relativeTime } from '../lib/time';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';

const iconMap = { message: MessageCircle, request: BookMarked, accepted: CheckCircle2, reminder: Clock, system: Sparkles, donation: Gift };
const colorMap = { message: '#7C6FFF', request: '#F5A623', accepted: '#2DD4BF', reminder: '#FF6B9D', system: '#8B5CF6', donation: '#22D3EE' };

export default function Notifications() {
  const { notifications, markNotificationsRead, receivedRequests, respondToRequest } = useStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const respond = async (notificationId: string, requestId: string, decision: 'Accepted' | 'Declined') => {
    const request = receivedRequests.find((item) => item.id === requestId);
    if (!request) return;
    setBusy(notificationId);
    if (await respondToRequest(request, decision)) await markNotificationsRead([notificationId]);
    setBusy(null);
  };
  return <PageTransition><ScreenHeader title="Notifications" right={<button onClick={() => void markNotificationsRead()} className="tap text-[11.5px] font-medium text-[var(--color-primary-2)]">Mark all</button>} />
    {notifications.length === 0 ? <div className="flex flex-col items-center px-8 pt-24 text-center"><BellOff size={36} className="text-[var(--color-text-faint)]" /><p className="mt-4 text-[13.5px] text-[var(--color-text-dim)]">You're all caught up</p></div> : <div className="flex flex-col px-3 pb-8 pt-2">{notifications.map((item) => {
      const Icon = iconMap[item.kind]; const color = colorMap[item.kind];
      const request = item.requestId ? receivedRequests.find((entry) => entry.id === item.requestId) : undefined;
      const actionable = item.kind === 'request' && request?.status === 'Pending';
      return <article key={item.id} className={`rounded-2xl px-2.5 py-3.5 ${!item.read ? 'bg-[var(--color-surface)]' : ''}`}>
        <button onClick={() => { void markNotificationsRead([item.id]); navigate(item.link); }} className="tap flex w-full items-start gap-3 text-left"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}22` }}><Icon size={17} style={{ color }} /></div><div className="min-w-0 flex-1"><p className="text-[13.5px] font-semibold text-[var(--color-text)]">{item.title}</p><p className="mt-0.5 text-[12.5px] text-[var(--color-text-dim)]">{item.body}</p><p className="mt-1 text-[11px] text-[var(--color-text-faint)]">{relativeTime(item.createdAt)}</p></div></button>
        {actionable && <div className="ml-[52px] mt-3 flex gap-2"><button disabled={busy === item.id} onClick={() => void respond(item.id, request.id, 'Declined')} className="tap rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs font-semibold text-rose-400 disabled:opacity-50">Decline</button><button disabled={busy === item.id} onClick={() => void respond(item.id, request.id, 'Accepted')} className="tap rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy === item.id ? 'Saving…' : 'Accept'}</button></div>}
      </article>;
    })}</div>}
  </PageTransition>;
}
