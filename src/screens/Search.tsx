import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, BookOpen } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import BookCard from '../components/BookCard';
import { categories, getCategory } from '../data/categories';
import { useStore } from '../store/store';

export default function Search() {
  const navigate = useNavigate();
  const { books } = useStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return books.filter((book) => (!activeCategory || book.category === activeCategory) && (!needle || [book.title, book.author, getCategory(book.category)?.name ?? ''].some((value) => value.toLowerCase().includes(needle))));
  }, [books, query, activeCategory]);

  return <PageTransition><div className="px-5 pt-6"><h1 className="text-[20px] font-bold text-[var(--color-text)]">Search</h1><div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"><SearchIcon size={18} className="text-[var(--color-text-faint)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search books, authors, subjects…" className="w-full bg-transparent text-[14px] text-[var(--color-text)] outline-none" />{query && <button onClick={() => setQuery('')}><X size={16} className="text-[var(--color-text-faint)]" /></button>}</div><div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1"><button onClick={() => setActiveCategory(null)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] ${!activeCategory ? 'border-[var(--color-primary)] text-[var(--color-primary-2)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)]'}`}>All</button>{categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id === activeCategory ? null : category.id)} className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] ${activeCategory === category.id ? 'border-[var(--color-primary)] text-[var(--color-primary-2)]' : 'border-[var(--color-border)] text-[var(--color-text-dim)]'}`}>{category.name}</button>)}</div></div><div className="mt-5 px-5 pb-8"><p className="mb-3 text-[13px] text-[var(--color-text-dim)]">{results.length} results</p>{results.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-5">{results.map((book) => <BookCard key={book.id} book={book} />)}</div> : <div className="mt-16 flex flex-col items-center text-center"><BookOpen size={34} className="text-[var(--color-text-faint)]" /><p className="mt-4 text-[14px] font-semibold text-[var(--color-text)]">No books found</p><button onClick={() => navigate('/request')} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white">Request a book</button></div>}</div></PageTransition>;
}
