import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/home'), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PageTransition className="flex min-h-[100dvh] flex-col items-center justify-between overflow-hidden px-8 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(65% 45% at 50% 18%, rgba(124,111,255,0.35) 0%, rgba(10,11,16,0) 70%), radial-gradient(55% 35% at 85% 85%, rgba(245,166,35,0.18) 0%, rgba(10,11,16,0) 70%)',
        }}
      />

      <div />

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -12 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] shadow-2xl"
          style={{
            background: 'linear-gradient(150deg, #7C6FFF 0%, #F5A623 100%)',
            boxShadow: '0 20px 50px -12px rgba(124,111,255,0.6)',
          }}
        >
          <BookOpen size={44} className="text-white" strokeWidth={2} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-[32px] font-bold tracking-tight text-[var(--color-text)]"
        >
          BookBridge
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-2 text-center text-[15px] text-[var(--color-text-dim)]"
        >
          Share stories. Bridge communities.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="relative flex w-full flex-col items-center gap-4"
      >
        <button
          onClick={() => navigate('/home')}
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold text-white shadow-lg"
          style={{ background: 'linear-gradient(120deg, #7C6FFF, #6C5CE7)' }}
        >
          Get Started
          <ArrowRight size={18} />
        </button>
        <div className="flex gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-[var(--color-primary)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-surface-3)]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-surface-3)]" />
        </div>
      </motion.div>
    </PageTransition>
  );
}
