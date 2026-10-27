import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookX, Trash2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import BookCover from '../components/BookCover';
import { useStore } from '../store/store';
import type { Book } from '../data/types';

const statusStyles: Record<string, string> = {
  Available: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Requested: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Reserved: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Given: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
};

export default function MyBooks() {
  const navigate = useNavigate();
  const { books: allBooks, session, deleteBook, receivedRequests } = useStore(); const [message, setMessage] = useState(''); const [selectedBook, setSelectedBook] = useState<Book | null>(null); const [modalError, setModalError] = useState(''); const [busy, setBusy] = useState(false);
  const books = allBooks.filter((b) => b.ownerId === session?.user.id);
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(''), 4500); return () => window.clearTimeout(timer); }, [message]);
  const remove = async () => { if (!selectedBook || busy) return; setBusy(true); setModalError(''); const result = await deleteBook(selectedBook); setBusy(false); if (result.ok) { setSelectedBook(null); setMessage(result.warning ?? 'Book listing deleted.'); } else setModalError(result.reason ?? 'Could not delete this book.'); };

  return (
    <PageTransition>
      <ScreenHeader
        title="My Donated Books"
        right={
          <button onClick={() => navigate('/donate')} className="tap flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/15">
            <Plus size={17} className="text-[var(--color-primary-2)]" />
          </button>
        }
      />

      {books.length === 0 ? (
        <div className="flex flex-col items-center px-8 pt-24 text-center">
          <BookX size={36} className="text-[var(--color-text-faint)]" />
          <p className="mt-4 text-[13.5px] text-[var(--color-text-dim)]">You haven't donated any books yet</p>
          <button onClick={() => navigate('/donate')} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white">
            Donate your first book
          </button>
        </div>
      ) : (
        <div className="mx-auto flex max-w-[900px] flex-col gap-3 px-5 pb-8 pt-3">{message && <p role="status" className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-surface-2)] p-3 text-sm text-[var(--color-text-dim)]">{message}</p>}
          {books.map((b) => { const acceptedRequest = receivedRequests.some((request) => request.bookId === b.id && request.status === 'Accepted'); const displayStatus = b.status === 'Available' && acceptedRequest ? 'Reserved' : b.status; return (
            <article key={b.id} className="flex items-center gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <button onClick={() => navigate(`/book/${b.id}`)} className="tap flex min-w-0 flex-1 items-center gap-3.5 text-left">
              <BookCover title={b.title} gradient={b.gradient} imageUrl={b.coverUrl} className="h-[76px] w-[54px] shrink-0" />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[14px] font-semibold text-[var(--color-text)]">{b.title}</p>
                <p className="truncate text-[12px] text-[var(--color-text-dim)]">by {b.author}</p>
                <span className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[displayStatus]}`}>
                  {displayStatus}
                </span>
                {acceptedRequest && b.status === 'Available' && <p className="mt-1 text-[10px] text-amber-400">Accepted request — reservation sync pending</p>}
              </div>
            </button>{displayStatus === 'Available' && <button aria-label={`Delete ${b.title}`} onClick={() => { setMessage(''); setModalError(''); setSelectedBook(b); }} className="tap rounded-xl p-2.5 text-rose-400"><Trash2 size={17} /></button>}</article>
          ); })}

          <button
            onClick={() => navigate('/donate')}
            className="tap mt-1 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--color-border)] py-4 text-[13px] font-medium text-[var(--color-text-dim)]"
          >
            <Plus size={16} />
            Donate another book
          </button>
        </div>
      )}
      {selectedBook && <DeleteBookModal book={selectedBook} busy={busy} error={modalError} onCancel={() => !busy && setSelectedBook(null)} onDelete={() => void remove()} />}
    </PageTransition>
  );
}

function DeleteBookModal({ book, busy, error, onCancel, onDelete }: { book: Book; busy: boolean; error: string; onCancel: () => void; onDelete: () => void }) {
  return <div role="dialog" aria-modal="true" aria-labelledby="delete-book-title" className="fixed inset-0 z-[100] flex items-end bg-black/65 p-3 sm:items-center sm:justify-center"><div className="w-full max-w-md rounded-3xl border border-rose-400/30 bg-[var(--color-surface)] p-5 shadow-2xl"><div className="flex gap-4"><BookCover title={book.title} gradient={book.gradient} imageUrl={book.coverUrl} className="h-24 w-16 shrink-0" /><div><p className="text-xs font-semibold uppercase tracking-wide text-rose-400">Delete book</p><h2 id="delete-book-title" className="mt-1 text-lg font-bold">Delete “{book.title}”?</h2><p className="mt-2 text-sm leading-relaxed text-[var(--color-text-dim)]">This removes the listing permanently. It cannot be undone.</p></div></div>{error && <p role="alert" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">{error}</p>}<div className="mt-6 grid grid-cols-2 gap-3"><button disabled={busy} onClick={onCancel} className="tap rounded-xl border border-[var(--color-border)] py-3 text-sm font-semibold disabled:opacity-50">Cancel</button><button disabled={busy} onClick={onDelete} className="tap rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Deleting…' : 'Delete book'}</button></div></div></div>;
}
