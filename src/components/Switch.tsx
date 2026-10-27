import { motion } from 'framer-motion';

export default function Switch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
      style={{ background: checked ? 'var(--color-primary)' : 'var(--color-surface-3)', opacity: disabled ? 0.6 : 1 }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow"
        style={{ left: checked ? 22 : 2 }}
      />
    </button>
  );
}
