import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import type { Book } from '../data/types';
import { relativeTime } from '../lib/time';
import BookCover from './BookCover';

export default function BookCard({ book, width }: { book: Book; width?: number }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/book/${book.id}`)}
      className={`tap flex flex-col text-left ${width ? 'shrink-0' : 'w-full'}`}
      style={width ? { width } : undefined}
    >
      <BookCover title={book.title} gradient={book.gradient} imageUrl={book.coverUrl} className="aspect-[3/4] w-full" />
      <p className="mt-2 truncate text-[13px] font-semibold text-[var(--color-text)]">{book.title}</p>
      <p className="truncate text-[11.5px] text-[var(--color-text-dim)]">{book.author}</p>
      <div className="mt-1 flex items-center gap-1">
        <Clock size={11} className="shrink-0 text-[var(--color-text-faint)]" />
        <span className="truncate text-[11px] text-[var(--color-text-faint)]">
          {relativeTime(book.createdAt)} · {book.condition}
        </span>
      </div>
    </button>
  );
}
