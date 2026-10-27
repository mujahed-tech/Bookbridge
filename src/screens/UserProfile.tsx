import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, UserX } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import Avatar from '../components/Avatar';
import BookCard from '../components/BookCard';
import { gradientFor, initialsOf } from '../lib/avatar';
import { useStore } from '../store/store';

export default function UserProfile() {
  const { id } = useParams<{ id: string }>(); const navigate = useNavigate(); const { getProfile, books } = useStore();
  const profile = getProfile(id); const listings = books.filter((book) => book.ownerId === id);
  if (!profile) return <PageTransition><ScreenHeader title="Profile" /><div className="flex flex-col items-center px-8 pt-20 text-center"><UserX size={40} className="text-[var(--color-text-faint)]" /><p className="mt-4 text-[13.5px] text-[var(--color-text-dim)]">Member not found</p><button onClick={() => navigate('/home')} className="tap mt-4 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-[13px] font-semibold text-white">Back to Home</button></div></PageTransition>;
  return <PageTransition><ScreenHeader title={profile.displayName} /><div className="px-5 pt-4"><div className="flex flex-col items-center text-center"><Avatar initials={initialsOf(profile.displayName)} gradient={gradientFor(profile.id)} size={88} /><h1 className="mt-3 text-[18px] font-bold text-[var(--color-text)]">{profile.displayName}</h1>{profile.location && <p className="mt-1 flex items-center gap-1 text-[12px] text-[var(--color-text-dim)]"><MapPin size={12} />{profile.location}</p>}{profile.bio && <p className="mt-3 max-w-[290px] text-[12.5px] leading-relaxed text-[var(--color-text-faint)]">{profile.bio}</p>}</div><h2 className="mt-7 text-[15px] font-bold text-[var(--color-text)]">Listings ({listings.length})</h2>{listings.length ? <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 pb-8">{listings.map((book) => <BookCard key={book.id} book={book} />)}</div> : <p className="mt-3 text-[13px] text-[var(--color-text-dim)]">No active listings.</p>}</div></PageTransition>;
}
