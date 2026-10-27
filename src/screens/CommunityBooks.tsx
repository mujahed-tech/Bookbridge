import { BookOpen, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import BookCard from '../components/BookCard';
import { useStore } from '../store/store';

export default function CommunityBooks() {
  const { id = '' } = useParams<{ id: string }>(); const navigate = useNavigate(); const { books } = useStore(); const list = books.filter((book) => book.communityId === id);
  return <PageTransition><ScreenHeader title="Community books" right={<button onClick={() => navigate(`/donate?communityId=${id}`)} className="tap flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]"><Plus size={18} /></button>} /><div className="mx-auto max-w-[900px] px-5 pb-10 pt-5">{list.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">{list.map((book) => <BookCard key={book.id} book={book} />)}</div> : <div className="py-20 text-center"><BookOpen className="mx-auto text-[var(--color-primary-2)]" size={34} /><h1 className="mt-4 font-semibold">No community books yet</h1><p className="mt-2 text-sm text-[var(--color-text-dim)]">Share the first book only with this community.</p><button onClick={() => navigate(`/donate?communityId=${id}`)} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold">List a community book</button></div>}</div></PageTransition>;
}
