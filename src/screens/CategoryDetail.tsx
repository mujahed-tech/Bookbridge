import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import BookCard from '../components/BookCard';
import { getCategory } from '../data/categories';
import { categoryIcons } from '../lib/icons';
import { BookX } from 'lucide-react';
import { useStore } from '../store/store';

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books } = useStore();
  const category = getCategory(id);
  const list = books.filter((b) => b.category === id);

  if (!category) {
    return (
      <PageTransition>
        <ScreenHeader title="Category" />
        <div className="flex flex-col items-center px-8 pt-20 text-center">
          <BookX size={40} className="text-[var(--color-text-faint)]" />
          <p className="mt-4 text-[14px] text-[var(--color-text-dim)]">Category not found</p>
          <button onClick={() => navigate('/categories')} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white">
            Back to categories
          </button>
        </div>
      </PageTransition>
    );
  }

  const Icon = categoryIcons[category.icon];

  return (
    <PageTransition>
      <ScreenHeader title={category.name} />
      <div className="px-5 pt-4">
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{ background: `linear-gradient(140deg, ${category.gradient[0]}, ${category.gradient[1]})` }}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-white">{category.name}</p>
            <p className="text-[12px] text-white/80">{list.length} books listed</p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-14 flex flex-col items-center text-center">
            <BookX size={36} className="text-[var(--color-text-faint)]" />
            <p className="mt-3 text-[13.5px] text-[var(--color-text-dim)]">No listings in this category yet</p>
            <button
              onClick={() => navigate('/request')}
              className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white"
            >
              Request one instead
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 pb-8">
            {list.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
