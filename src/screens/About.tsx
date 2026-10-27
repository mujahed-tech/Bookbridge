import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Recycle, HeartHandshake, Compass } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';

const stats = [
  { label: 'Books shared', value: '12,400+' },
  { label: 'Active readers', value: '3,800+' },
  { label: 'Cities', value: '46' },
];

const values = [
  { icon: Recycle, title: 'Give books a second life', text: 'Every donated book saves a story from a shelf it was never being read on.' },
  { icon: Users, title: 'Built on trust', text: 'Ratings, reviews, and verified profiles keep the community accountable.' },
  { icon: HeartHandshake, title: 'Always free', text: 'No fees, no subscriptions. Just readers helping readers.' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <ScreenHeader title="About BookBridge" />
      <div className="px-5 pb-10 pt-4">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(150deg, #7C6FFF 0%, #F5A623 100%)' }}
          >
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="mt-3 text-[19px] font-bold text-[var(--color-text)]">BookBridge</h1>
          <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[var(--color-text-dim)]">
            We connect readers who have books to give with readers who want to read them — one bridge, one book at a time.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <p className="text-[15px] font-bold text-[var(--color-text)]">{s.value}</p>
              <p className="text-[10px] text-[var(--color-text-faint)]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-3">
          {values.map((v) => (
            <div key={v.title} className="flex gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
                <v.icon size={17} className="text-[var(--color-primary-2)]" />
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--color-text)]">{v.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-text-dim)]">{v.text}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/categories')}
          className="tap mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-semibold text-white shadow-lg"
          style={{ background: 'linear-gradient(120deg, #7C6FFF, #6C5CE7)' }}
        >
          <Compass size={17} />
          Explore the library
        </button>

        <p className="mt-6 text-center text-[11px] text-[var(--color-text-faint)]">BookBridge v1.0.0 · Made for readers everywhere</p>
      </div>
    </PageTransition>
  );
}
