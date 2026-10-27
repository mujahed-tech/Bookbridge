import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, BookOpen, Globe, Clock, ListChecks, Send } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import BookCover from '../components/BookCover';
import Avatar from '../components/Avatar';
import { getCategory } from '../data/categories';
import { gradientFor, initialsOf } from '../lib/avatar';
import { relativeTime } from '../lib/time';
import { useStore } from '../store/store';

const statusStyles: Record<string, string> = {
  Available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Requested: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Reserved: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Given: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, session, getProfile, requests } = useStore();
  const book = books.find((item) => item.id === id);

  if (!book) return <PageTransition><div className="flex flex-col items-center px-8 pt-24 text-center"><p className="text-[14px] text-[var(--color-text-dim)]">Book not found</p><button onClick={() => navigate('/home')} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white">Back to Home</button></div></PageTransition>;

  const owner = getProfile(book.ownerId);
  const isMine = book.ownerId === session?.user.id;
  const existingRequest = requests.find((request) => request.bookId === book.id && ['Pending', 'Accepted'].includes(request.status));
  const ownerName = owner?.displayName || 'BookBridge member';
  const category = getCategory(book.category);

  return <PageTransition><div className="relative">
    <div className="relative h-[270px] overflow-hidden" style={{ background: `linear-gradient(160deg, ${book.gradient[0]}, ${book.gradient[1]})` }}>
      {book.coverUrl && <img src={book.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--color-bg)]" />
      <button onClick={() => navigate(-1)} className="tap absolute left-4 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/25"><ChevronLeft size={20} className="text-white" /></button>
      <div className="absolute -bottom-12 left-5"><BookCover title={book.title} gradient={book.gradient} imageUrl={book.coverUrl} className="h-[168px] w-[118px] shadow-2xl" /></div>
    </div>
    <div className="px-5 pb-32 pt-16">
      <div className="flex items-start justify-between gap-3"><div><h1 className="text-[20px] font-bold text-[var(--color-text)]">{book.title}</h1><p className="mt-1 text-[13.5px] text-[var(--color-text-dim)]">by {book.author}</p></div><span className={`rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${statusStyles[book.status]}`}>{book.status}</span></div>
      <div className="mt-3 flex flex-wrap gap-2">{category && <button onClick={() => navigate(`/categories/${category.id}`)} className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-[11.5px] text-[var(--color-text-dim)]">{category.name}</button>}<span className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-[11.5px] text-[var(--color-text-dim)]">{book.condition}</span></div>
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5"><Avatar initials={initialsOf(ownerName)} gradient={gradientFor(book.ownerId)} size={44} /><div><p className="text-[13.5px] font-semibold text-[var(--color-text)]">{isMine ? 'Your listing' : ownerName}</p><p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-[var(--color-text-faint)]"><MapPin size={10} />{owner?.location || book.location || 'Location not shared'}</p></div></div>
      <div className="mt-6 grid grid-cols-3 gap-2.5"><div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"><BookOpen size={16} className="mx-auto text-[var(--color-primary-2)]" /><p className="mt-1.5 text-[12.5px] font-semibold text-[var(--color-text)]">{book.pages || '—'}</p><p className="text-[10px] text-[var(--color-text-faint)]">pages</p></div><div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"><Globe size={16} className="mx-auto text-[var(--color-primary-2)]" /><p className="mt-1.5 truncate text-[12.5px] font-semibold text-[var(--color-text)]">{book.language}</p><p className="text-[10px] text-[var(--color-text-faint)]">language</p></div><div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-center"><Clock size={16} className="mx-auto text-[var(--color-primary-2)]" /><p className="mt-1.5 text-[12.5px] font-semibold text-[var(--color-text)]">{relativeTime(book.createdAt)}</p><p className="text-[10px] text-[var(--color-text-faint)]">listed</p></div></div>
      <div className="mt-6"><h2 className="text-[14.5px] font-bold text-[var(--color-text)]">About this book</h2><p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-text-dim)]">{book.description || 'No description was added.'}</p></div>
    </div>
    <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-3.5" style={{ maxWidth: 480 }}>{isMine ? <button onClick={() => navigate('/my-books')} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-3.5 text-[13.5px] font-semibold text-white"><ListChecks size={16} />My listings</button> : existingRequest ? <button onClick={() => navigate('/my-requests')} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface-2)] py-3.5 text-[13.5px] font-semibold text-[var(--color-text)]"><Clock size={16} />{existingRequest.status === 'Accepted' ? 'Request accepted' : 'Request pending'}</button> : book.status !== 'Available' ? <button disabled className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-surface-2)] py-3.5 text-[13.5px] font-semibold text-[var(--color-text-faint)]"><Clock size={16} />This book is {book.status.toLowerCase()}</button> : <button onClick={() => navigate(`/request?bookId=${book.id}`)} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-3.5 text-[13.5px] font-semibold text-white"><Send size={16} />Request this book</button>}</div>
  </div></PageTransition>;
}
