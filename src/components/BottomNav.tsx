import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, MessageCircle, User, Plus, X, BookPlus, BookMarked } from 'lucide-react';

const tabs = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: null, icon: Plus, label: '' },
  { path: '/chat', icon: MessageCircle, label: 'Chat' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const goTo = (path: string) => {
    setFabOpen(false);
    navigate(path);
  };

  return (
    <>
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            style={{ maxWidth: 480, margin: '0 auto' }}
          />
        )}
      </AnimatePresence>

      <div
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto lg:hidden"
        style={{ maxWidth: 480 }}
      >
        <AnimatePresence>
          {fabOpen && (
            <motion.div className="absolute bottom-[92px] left-0 right-0 flex flex-col items-center gap-3 px-6">
              <motion.button
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.9 }}
                transition={{ delay: 0.05, type: 'spring', stiffness: 400, damping: 26 }}
                onClick={() => goTo('/request')}
                className="tap flex w-full items-center gap-3 rounded-2xl glass border border-[var(--color-border)] px-5 py-4 shadow-xl"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-primary)]">
                  <BookMarked size={18} className="text-white" />
                </span>
                <span className="text-[15px] font-semibold text-[var(--color-text)]">📖 Request Book</span>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                onClick={() => goTo('/donate')}
                className="tap flex w-full items-center gap-3 rounded-2xl glass border border-[var(--color-border)] px-5 py-4 shadow-xl"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-pink)]">
                  <BookPlus size={18} className="text-white" />
                </span>
                <span className="text-[15px] font-semibold text-[var(--color-text)]">📚 Donate Book</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative glass border-t border-[var(--color-border)] px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
          <div className="flex items-center justify-between px-2">
            {tabs.map((tab) => {
              if (tab.path === null) {
                return (
                  <div key="fab" className="relative -mt-9 flex flex-1 flex-col items-center">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setFabOpen((v) => !v)}
                      className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                      style={{
                        background: 'linear-gradient(140deg, var(--color-primary), var(--color-accent))',
                        boxShadow: '0 8px 24px -6px rgba(124,111,255,0.7)',
                      }}
                    >
                      <motion.span animate={{ rotate: fabOpen ? 135 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        {fabOpen ? <X size={24} className="text-white" /> : <Plus size={24} className="text-white" />}
                      </motion.span>
                    </motion.button>
                  </div>
                );
              }
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <button
                  key={tab.path}
                  onClick={() => goTo(tab.path!)}
                  className="tap flex flex-1 flex-col items-center gap-1 py-1.5"
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.4 : 1.8}
                    className={active ? 'text-[var(--color-primary-2)]' : 'text-[var(--color-text-faint)]'}
                  />
                  <span
                    className={`text-[10px] font-medium ${
                      active ? 'text-[var(--color-primary-2)]' : 'text-[var(--color-text-faint)]'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[var(--color-primary-2)]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
