import { Bell, BookOpen, CircleUserRound, LogOut, Menu, Plus, Search, Settings, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { displayNameFrom, gradientFor, initialsOf } from '../lib/avatar';
import { useStore } from '../store/store';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/home', label: 'Home' },
  { to: '/search', label: 'Explore' },
  { to: '/categories', label: 'Categories' },
  { to: '/communities', label: 'Communities' },
  { to: '/request', label: 'Requests' },
];

/** Desktop navigation only. Mobile keeps the focused bottom-tab experience. */
export default function DesktopNav() {
  const navigate = useNavigate();
  const { profile, session, unreadNotifications, notifications, receivedRequests, respondToRequest, signOut } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [requestBusy, setRequestBusy] = useState<string | null>(null);
  const name = displayNameFrom(profile?.displayName, session?.user.email);
  const respondFromBell = async (requestId: string, decision: 'Accepted' | 'Declined') => {
    const request = receivedRequests.find((item) => item.id === requestId);
    if (!request) return;
    setRequestBusy(requestId);
    await respondToRequest(request, decision);
    setRequestBusy(null);
  };

  return (
    <header className="desktop-nav sticky top-0 z-[60] hidden border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl lg:block">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-8">
        <button onClick={() => navigate('/home')} className="tap flex items-center gap-2.5" aria-label="BookBridge home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-lg shadow-[var(--color-primary)]/20"><BookOpen size={21} className="text-white" /></span>
          <span className="text-lg font-bold tracking-tight text-[var(--color-text)]">Book<span className="text-[var(--color-primary-2)]">Bridge</span></span>
        </button>
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `rounded-lg px-3.5 py-2 text-sm font-medium transition ${isActive ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]' : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]'}`}>{link.label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate('/search')} className="tap flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text-faint)]"><Search size={16} /><span className="hidden xl:inline">Search books, notes, communities…</span><span className="xl:hidden">Search</span></button>
          <button onClick={() => navigate('/donate')} className="tap flex h-10 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3.5 text-sm font-semibold text-white"><Plus size={16} /> Donate</button>
          <ThemeToggle compact />
          <div className="relative"><button onClick={() => setNotificationOpen((value) => !value)} className="tap relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]" aria-label="Notifications" aria-expanded={notificationOpen}><Bell size={17} />{unreadNotifications > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-pink)]" />}</button>{notificationOpen && <div className="absolute right-0 top-12 w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-2xl"><div className="flex items-center justify-between px-2 py-1"><strong className="text-sm">Notifications</strong><button onClick={() => { setNotificationOpen(false); navigate('/notifications'); }} className="text-xs font-semibold text-[var(--color-primary-2)]">View all</button></div>{notifications.slice(0, 4).map((notification) => { const request = notification.requestId ? receivedRequests.find((item) => item.id === notification.requestId) : undefined; return <div key={notification.id} className="rounded-lg px-2 py-2 hover:bg-[var(--color-surface-2)]"><button onClick={() => { setNotificationOpen(false); navigate(notification.link); }} className="w-full text-left"><p className="truncate text-xs font-semibold">{notification.title}</p><p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--color-text-dim)]">{notification.body}</p></button>{notification.kind === 'request' && request?.status === 'Pending' && <div className="mt-2 flex gap-2"><button disabled={requestBusy === request.id} onClick={() => void respondFromBell(request.id, 'Declined')} className="rounded-md border border-rose-400/40 px-2 py-1 text-[11px] font-semibold text-rose-400 disabled:opacity-50">Decline</button><button disabled={requestBusy === request.id} onClick={() => void respondFromBell(request.id, 'Accepted')} className="rounded-md bg-[var(--color-primary)] px-2 py-1 text-[11px] font-semibold text-white disabled:opacity-50">{requestBusy === request.id ? 'Saving…' : 'Accept'}</button></div>}</div>; })}{notifications.length === 0 && <p className="px-2 py-5 text-center text-xs text-[var(--color-text-dim)]">You're all caught up.</p>}</div>}</div>
          {session ? <button onClick={() => setMenuOpen((value) => !value)} className="tap"><Avatar initials={initialsOf(name)} gradient={gradientFor(session.user.id)} size={38} /></button> : <button onClick={() => navigate('/login')} className="tap flex h-10 items-center gap-1.5 rounded-xl border border-[var(--color-border)] px-3.5 text-sm font-semibold"><CircleUserRound size={17} /> Sign in</button>}
          {menuOpen && <div className="absolute right-8 top-[68px] w-56 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-2xl"><MenuLink icon={CircleUserRound} label="My Profile" onClick={() => navigate('/profile')} /><MenuLink icon={BookOpen} label="My Books" onClick={() => navigate('/my-books')} /><MenuLink icon={Menu} label="My Requests" onClick={() => navigate('/my-requests')} /><MenuLink icon={UsersRound} label="My Communities" onClick={() => navigate('/communities')} /><MenuLink icon={Settings} label="Settings" onClick={() => navigate('/settings')} /><div className="my-1 border-t border-[var(--color-border)]" /><MenuLink icon={LogOut} label="Log out" onClick={() => { void signOut(); setMenuOpen(false); navigate('/home'); }} muted /></div>}
        </div>
      </div>
    </header>
  );
}

function MenuLink({ icon: Icon, label, onClick, muted = false }: { icon: typeof Menu; label: string; onClick: () => void; muted?: boolean }) {
  return <button onClick={onClick} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-[var(--color-surface-2)] ${muted ? 'text-[var(--color-text-dim)]' : ''}`}><Icon size={15} /> {label}</button>;
}
