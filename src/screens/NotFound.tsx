import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <PageTransition className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
      <Compass size={40} className="text-[var(--color-text-faint)]" />
      <h1 className="mt-4 text-[18px] font-bold text-[var(--color-text)]">Page not found</h1>
      <p className="mt-1.5 text-[13px] text-[var(--color-text-dim)]">This screen doesn't exist in BookBridge.</p>
      <button
        onClick={() => navigate('/home')}
        className="tap mt-6 rounded-2xl px-6 py-3 text-[14px] font-semibold text-white"
        style={{ background: 'linear-gradient(120deg, #7C6FFF, #6C5CE7)' }}
      >
        Back to Home
      </button>
    </PageTransition>
  );
}
