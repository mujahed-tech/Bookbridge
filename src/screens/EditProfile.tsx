import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScreenHeader from '../components/ScreenHeader';
import Avatar from '../components/Avatar';
import type { Gradient } from '../data/types';
import { useStore } from '../store/store';
import { displayNameFrom, initialsOf } from '../lib/avatar';

const avatarGradients: Gradient[] = [
  ['#7C6FFF', '#F5A623'],
  ['#FF6B9D', '#7C6FFF'],
  ['#2DD4BF', '#3B82F6'],
  ['#8B5CF6', '#EC4899'],
  ['#F5A623', '#FF6B9D'],
];

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, session, saveProfile } = useStore();
  const [name, setName] = useState(displayNameFrom(profile?.displayName, session?.user.email));
  const [location, setLocation] = useState(profile?.location || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [gradient, setGradient] = useState<Gradient>(avatarGradients[0]);
  const [message, setMessage] = useState('');
  const handleSave = async () => {
    const saved = await saveProfile({ displayName: name.trim(), location: location.trim(), bio: bio.trim() });
    if (saved) navigate('/profile');
    else setMessage('Could not save your profile. Please sign in and try again.');
  };

  return (
    <PageTransition>
      <ScreenHeader title="Edit Profile" />
      <div className="px-5 pb-28 pt-4">
        <div className="flex flex-col items-center">
          <Avatar initials={initialsOf(name)} gradient={gradient} size={92} />
          <div className="mt-3 flex gap-2">
            {avatarGradients.map((g, i) => (
              <button
                key={i}
                onClick={() => setGradient(g)}
                className="tap h-7 w-7 rounded-full border-2"
                style={{ background: `linear-gradient(140deg, ${g[0]}, ${g[1]})`, borderColor: gradient[0] === g[0] ? '#fff' : 'transparent' }}
              />
            ))}
          </div>
        </div>
        {message && <p className="mt-4 text-[12.5px] text-rose-400">{message}</p>}

        <div className="mt-7 flex flex-col gap-4">
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-[12.5px] font-medium text-[var(--color-text-dim)]">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="mt-1.5 w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 mx-auto glass border-t border-[var(--color-border)] px-5 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3.5"
        style={{ maxWidth: 480 }}
      >
        <button
          onClick={handleSave}
          className="tap flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14.5px] font-semibold text-white shadow-lg"
          style={{ background: 'linear-gradient(120deg, #7C6FFF, #6C5CE7)' }}
        >
          <Check size={17} />
          Save Changes
        </button>
      </div>
    </PageTransition>
  );
}
