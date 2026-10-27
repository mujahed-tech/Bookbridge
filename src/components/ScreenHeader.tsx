import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title?: string;
  right?: ReactNode;
  transparent?: boolean;
  onBack?: () => void;
}

export default function ScreenHeader({ title, right, transparent = false, onBack }: ScreenHeaderProps) {
  const navigate = useNavigate();
  return (
    <div
      className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 ${
        transparent ? '' : 'glass border-b border-[var(--color-border)]'
      }`}
    >
      <button
        onClick={() => (onBack ? onBack() : navigate(-1))}
        className="tap flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]"
      >
        <ChevronLeft size={20} className="text-[var(--color-text)]" />
      </button>
      {title && <h1 className="text-[16px] font-semibold text-[var(--color-text)] truncate px-2">{title}</h1>}
      <div className="min-w-9 flex justify-end">{right}</div>
    </div>
  );
}
