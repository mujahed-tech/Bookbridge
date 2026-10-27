import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  ChevronRight,
  BookMarked,
  ListChecks,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  Pencil,
  ShieldCheck,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Avatar from '../components/Avatar';
import { useStore } from '../store/store';
import { displayNameFrom, gradientFor, initialsOf } from '../lib/avatar';

const menuItems = [
  { icon: BookMarked, label: 'My Donated Books', path: '/my-books', color: '#7C6FFF' },
  { icon: ListChecks, label: 'My Requests', path: '/my-requests', color: '#F5A623' },
  { icon: BookMarked, label: 'Received Requests', path: '/received-requests', color: '#22D3EE' },
  { icon: Bell, label: 'Notifications', path: '/notifications', color: '#2DD4BF' },
  { icon: SettingsIcon, label: 'Settings', path: '/settings', color: '#FF6B9D' },
  { icon: HelpCircle, label: 'Help & Support', path: '/help', color: '#8B5CF6' },
  { icon: Info, label: 'About BookBridge', path: '/about', color: '#22D3EE' },
];

export default function Profile() {
  const navigate = useNavigate();
  const { session, profile, books, requests, signOut, isAdmin } = useStore();
  const displayName = displayNameFrom(profile?.displayName, session?.user.email);
  const location = profile?.location || 'Add your location';
  const bio = profile?.bio || 'Tell the BookBridge community a little about yourself.';
  const initials = initialsOf(displayName);
  const donated = session ? books.filter((book) => book.ownerId === session.user.id).length : 0;

  return (
    <PageTransition>
      <div className="flex items-center justify-between px-5 pt-6">
        <h1 className="text-[20px] font-bold text-[var(--color-text)]">Profile</h1>
        <button
          onClick={() => navigate('/settings')}
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]"
        >
          <SettingsIcon size={17} className="text-[var(--color-text)]" />
        </button>
      </div>

      <div className="mt-5 flex flex-col items-center px-5 text-center">
        <div className="relative">
          <Avatar initials={initials} gradient={gradientFor(session?.user.id)} size={88} />
          <button
            onClick={() => navigate('/profile/edit')}
            className="tap absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-primary)]"
          >
            <Pencil size={13} className="text-white" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <h2 className="text-[18px] font-bold text-[var(--color-text)]">{displayName}</h2>
        </div>
        <p className="mt-0.5 text-[12.5px] text-[var(--color-text-dim)]">{location}</p>
        <p className="mt-2.5 max-w-[280px] text-[12.5px] leading-relaxed text-[var(--color-text-faint)]">{bio}</p>

        <button
          onClick={() => navigate('/profile/edit')}
          className="tap mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-[12.5px] font-semibold text-[var(--color-text)]"
        >
          Edit Profile
        </button>
      </div>

      <div className="mx-5 mt-6 grid grid-cols-3 divide-x divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] py-4">
        <div className="flex flex-col items-center">
          <p className="text-[17px] font-bold text-[var(--color-text)]">{donated}</p>
          <p className="text-[10.5px] text-[var(--color-text-faint)]">Donated</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[17px] font-bold text-[var(--color-text)]">{requests.length}</p>
          <p className="text-[10.5px] text-[var(--color-text-faint)]">Requested</p>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-[17px] font-bold text-[var(--color-text)]">{books.length}</p>
          <p className="text-[10.5px] text-[var(--color-text-faint)]">On shelf</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col px-3 pb-8">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="tap flex items-center gap-3.5 rounded-2xl px-2.5 py-3.5 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${item.color}22` }}>
              <item.icon size={17} style={{ color: item.color }} />
            </div>
            <span className="flex-1 text-[14px] font-medium text-[var(--color-text)]">{item.label}</span>
            <ChevronRight size={17} className="text-[var(--color-text-faint)]" />
          </button>
        ))}
        {isAdmin && <button onClick={() => navigate('/admin')} className="tap flex items-center gap-3.5 rounded-2xl px-2.5 py-3.5 text-left"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/15"><ShieldCheck size={17} className="text-[var(--color-primary-2)]" /></div><span className="flex-1 text-[14px] font-medium text-[var(--color-text)]">Admin Dashboard</span><ChevronRight size={17} className="text-[var(--color-text-faint)]" /></button>}

        <button
          onClick={async () => { await signOut(); navigate('/home'); }}
          className="tap mt-2 flex items-center gap-3.5 rounded-2xl px-2.5 py-3.5 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15">
            <LogOut size={17} className="text-rose-400" />
          </div>
          <span className="flex-1 text-[14px] font-medium text-rose-400">Log Out</span>
        </button>
      </div>
    </PageTransition>
  );
}
