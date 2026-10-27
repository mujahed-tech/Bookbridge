import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, HelpCircle, Info, LogOut, Moon, Bell, Mail, MapPin, Trash2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import Switch from '../components/Switch';
import ThemeToggle from '../components/ThemeToggle';

export default function Settings() {
  const navigate = useNavigate();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  return (
    <PageTransition>
      <ScreenHeader title="Settings" />
      <div className="px-5 pb-10 pt-4">
        <p className="mb-2 px-1 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
          Preferences
        </p>
        <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          <div className="flex items-center gap-3 py-3.5">
            <Moon size={17} className="text-[var(--color-primary-2)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">Appearance</span>
            <ThemeToggle compact />
          </div>
          <div className="flex items-center gap-3 py-3.5">
            <Bell size={17} className="text-[var(--color-accent)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">Push notifications</span>
            <Switch checked={pushNotifs} onChange={() => setPushNotifs((v) => !v)} />
          </div>
          <div className="flex items-center gap-3 py-3.5">
            <Mail size={17} className="text-[var(--color-teal)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">Email updates</span>
            <Switch checked={emailUpdates} onChange={() => setEmailUpdates((v) => !v)} />
          </div>
          <div className="flex items-center gap-3 py-3.5">
            <MapPin size={17} className="text-[var(--color-pink)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">Share my location</span>
            <Switch checked={locationSharing} onChange={() => setLocationSharing((v) => !v)} />
          </div>
        </div>

        <p className="mb-2 mt-6 px-1 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
          Account
        </p>
        <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          <button onClick={() => navigate('/profile/edit')} className="tap flex items-center gap-3 py-3.5 text-left">
            <User size={17} className="text-[var(--color-primary-2)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">Edit profile</span>
            <ChevronRight size={16} className="text-[var(--color-text-faint)]" />
          </button>
          <button onClick={() => navigate('/my-books')} className="tap flex items-center gap-3 py-3.5 text-left">
            <User size={17} className="text-[var(--color-accent)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">My donated books</span>
            <ChevronRight size={16} className="text-[var(--color-text-faint)]" />
          </button>
        </div>

        <p className="mb-2 mt-6 px-1 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
          Support
        </p>
        <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          <button onClick={() => navigate('/help')} className="tap flex items-center gap-3 py-3.5 text-left">
            <HelpCircle size={17} className="text-[var(--color-teal)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">Help & Support</span>
            <ChevronRight size={16} className="text-[var(--color-text-faint)]" />
          </button>
          <button onClick={() => navigate('/about')} className="tap flex items-center gap-3 py-3.5 text-left">
            <Info size={17} className="text-[var(--color-pink)]" />
            <span className="flex-1 text-[13.5px] text-[var(--color-text)]">About BookBridge</span>
            <ChevronRight size={16} className="text-[var(--color-text-faint)]" />
          </button>
        </div>

        <p className="mb-2 mt-6 px-1 text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
          Danger zone
        </p>
        <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          <button onClick={() => navigate('/')} className="tap flex items-center gap-3 py-3.5 text-left">
            <LogOut size={17} className="text-rose-400" />
            <span className="flex-1 text-[13.5px] font-medium text-rose-400">Log out</span>
          </button>
          <button onClick={() => navigate('/')} className="tap flex items-center gap-3 py-3.5 text-left">
            <Trash2 size={17} className="text-rose-400" />
            <span className="flex-1 text-[13.5px] font-medium text-rose-400">Delete account</span>
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-[var(--color-text-faint)]">BookBridge v1.0.0 · Prototype build</p>
      </div>
    </PageTransition>
  );
}
