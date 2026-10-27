import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, ListChecks } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function RequestSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = (location.state as { title?: string } | null)?.title || 'Your request';

  return (
    <PageTransition className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="flex h-24 w-24 items-center justify-center rounded-full"
        style={{ background: 'linear-gradient(140deg, #7C6FFF, #6C5CE7)', boxShadow: '0 20px 50px -12px rgba(124,111,255,0.55)' }}
      >
        <CheckCircle2 size={42} className="text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-[22px] font-bold text-[var(--color-text)]"
      >
        Request sent!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-[14px] leading-relaxed text-[var(--color-text-dim)]"
      >
        We let the community know you're looking for "{title}". You'll get a notification the moment someone responds.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-9 flex w-full flex-col gap-3"
      >
        <button
          onClick={() => navigate('/my-requests')}
          className="tap flex items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-semibold text-white"
          style={{ background: 'linear-gradient(120deg, #7C6FFF, #6C5CE7)' }}
        >
          <ListChecks size={16} />
          View my requests
        </button>
        <button
          onClick={() => navigate('/home')}
          className="tap flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3.5 text-[14px] font-semibold text-[var(--color-text)]"
        >
          <Home size={16} />
          Back to Home
        </button>
      </motion.div>
    </PageTransition>
  );
}
