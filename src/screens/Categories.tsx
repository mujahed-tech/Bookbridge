import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { categories } from '../data/categories';
import { categoryIcons } from '../lib/icons';
import { useStore } from '../store/store';

export default function Categories() {
  const navigate = useNavigate();
  const { books } = useStore();
  return (
    <PageTransition>
      <div className="px-5 pt-6">
        <h1 className="text-[20px] font-bold text-[var(--color-text)]">Categories</h1>
        <p className="mt-1 text-[13px] text-[var(--color-text-dim)]">Browse books by genre</p>

        <div className="mt-5 grid grid-cols-2 gap-3.5 pb-8">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon];
            const count = books.filter((book) => book.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/categories/${cat.id}`)}
                className="tap relative overflow-hidden rounded-2xl p-4 text-left"
                style={{ background: `linear-gradient(150deg, ${cat.gradient[0]}22, ${cat.gradient[1]}11)`, border: '1px solid var(--color-border)' }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(140deg, ${cat.gradient[0]}, ${cat.gradient[1]})` }}
                >
                  <Icon size={19} className="text-white" />
                </div>
                <p className="mt-3 text-[14px] font-semibold text-[var(--color-text)]">{cat.name}</p>
                <p className="mt-0.5 text-[11.5px] text-[var(--color-text-faint)]">
                  {count === 1 ? '1 book' : `${count} books`}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
