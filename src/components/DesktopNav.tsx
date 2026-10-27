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
  const { profile, session, unreadNotifications, signOut } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = displayNameFrom(profile?.displayName, session?.user.email);

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
          <button onClick={() => navigate('/notifications')} className="tap relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"><Bell size={17} />{unreadNotifications > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-pink)]" />}</button>
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
