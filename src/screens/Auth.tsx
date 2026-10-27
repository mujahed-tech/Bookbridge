import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!supabase || !email.trim() || password.length < 6 || (mode === 'signup' && name.trim().length < 2)) return;
    setLoading(true);
    setMessage('');
    const result = mode === 'signup'
      ? await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim() } } })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm it, then sign in.');
      return;
    }
    navigate((location.state as { from?: string } | null)?.from || '/home', { replace: true });
  };

  return (
    <PageTransition>
      <div className="px-5 pb-10 pt-14">
        <button onClick={() => navigate(-1)} className="text-[13px] text-[var(--color-text-dim)]">← Back</button>
        <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
          <BookOpen className="text-white" size={28} />
        </div>
        <h1 className="mt-5 text-[24px] font-bold text-[var(--color-text)]">{mode === 'signin' ? 'Welcome back' : 'Join BookBridge'}</h1>
        <p className="mt-2 text-[13.5px] text-[var(--color-text-dim)]">Sign in to list a book, request one, and manage your profile.</p>

        <div className="mt-7 flex rounded-xl bg-[var(--color-surface-2)] p-1">
          {(['signin', 'signup'] as const).map((item) => (
            <button key={item} onClick={() => { setMode(item); setMessage(''); }} className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${mode === item ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-dim)]'}`}>
              {item === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {mode === 'signup' && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] outline-none" />}
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email address" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] outline-none" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password (at least 6 characters)" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-[14px] text-[var(--color-text)] outline-none" />
        </div>
        {message && <p className="mt-4 text-[12.5px] text-[var(--color-text-dim)]">{message}</p>}
        <button onClick={submit} disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] py-4 text-[14px] font-semibold text-white disabled:opacity-50">
          {mode === 'signin' ? <LogIn size={17} /> : <UserPlus size={17} />}
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </div>
    </PageTransition>
  );
}
