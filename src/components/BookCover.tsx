import type { Gradient } from '../data/types';

interface BookCoverProps {
  title: string;
  gradient: Gradient;
  className?: string;
  showTitle?: boolean;
  imageUrl?: string;
}

export default function BookCover({ title, gradient, className = '', showTitle = true, imageUrl }: BookCoverProps) {
  const [from, to] = gradient;
  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{
        background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 8px 20px -6px ${from}55`,
      }}
    >
      {imageUrl && <img src={imageUrl} alt={`Cover of ${title}`} className="absolute inset-0 h-full w-full object-cover" />}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 14px)',
        }}
      />
      {!imageUrl && <div className="absolute inset-y-0 left-0 w-[6px] bg-black/25" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
      {showTitle && (
        <div className="absolute inset-0 flex items-end p-2.5">
          <p className="text-white font-semibold leading-tight text-[11px] drop-shadow-sm line-clamp-3">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
