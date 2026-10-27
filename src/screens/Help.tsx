import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';

const faqs = [
  {
    q: 'How does donating a book work?',
    a: "Tap the + button and choose Donate Book. Fill in the title, condition, and a short description. Your listing goes live instantly and nearby readers can request it.",
  },
  {
    q: 'Is BookBridge free to use?',
    a: 'Yes, completely. BookBridge is a community book-sharing prototype — no payments, subscriptions, or hidden fees.',
  },
  {
    q: 'How do I arrange a pickup?',
    a: 'Once a request is accepted, use the in-app chat to coordinate a time and place with the other reader directly.',
  },
  {
    q: 'What if a book never gets returned?',
    a: "Most listings on BookBridge are donations, not loans — no return expected. If it's a borrow, we recommend agreeing on a return date in chat.",
  },
  {
    q: 'Can I request a book that nobody has listed yet?',
    a: "Absolutely. Tap + → Request Book and describe what you're looking for. We'll notify you when a match appears.",
  },
];

export default function Help() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <PageTransition>
      <ScreenHeader title="Help & Support" />
      <div className="px-5 pb-10 pt-4">
        <h2 className="text-[15px] font-bold text-[var(--color-text)]">Frequently asked questions</h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="tap flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-[13.5px] font-medium text-[var(--color-text)]">{f.q}</span>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-[var(--color-text-faint)] transition-transform"
                  style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>
              {open === i && (
                <p className="px-4 pb-4 text-[12.5px] leading-relaxed text-[var(--color-text-dim)]">{f.a}</p>
              )}
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-[15px] font-bold text-[var(--color-text)]">Still need help?</h2>
        <div className="mt-3 flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/chat')}
            className="tap flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15">
              <MessageCircle size={17} className="text-[var(--color-primary-2)]" />
            </div>
            <div className="text-left">
              <p className="text-[13.5px] font-semibold text-[var(--color-text)]">Chat with the community</p>
              <p className="text-[11.5px] text-[var(--color-text-faint)]">Usually replies within a few hours</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/about')}
            className="tap flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-teal)]/15">
              <Mail size={17} className="text-[var(--color-teal)]" />
            </div>
            <div className="text-left">
              <p className="text-[13.5px] font-semibold text-[var(--color-text)]">About BookBridge</p>
              <p className="text-[11.5px] text-[var(--color-text-faint)]">Learn about our mission</p>
            </div>
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
