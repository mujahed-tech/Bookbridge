import type { Gradient } from '../data/types';

interface AvatarProps {
  initials: string;
  gradient: Gradient;
  size?: number;
  className?: string;
  ring?: boolean;
}

export default function Avatar({ initials, gradient, size = 44, className = '', ring = false }: AvatarProps) {
  const [from, to] = gradient;
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${
        ring ? 'ring-2 ring-[var(--color-bg)]' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(140deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}
