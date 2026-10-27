import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const key = 'bookbridge-theme';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(key, theme);
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem(key) === 'light' ? 'light' : 'dark');
  useEffect(() => { applyTheme(theme); }, [theme]);
  const next = theme === 'dark' ? 'light' : 'dark';
  return <button onClick={() => setTheme(next)} aria-label={`Switch to ${next} theme`} className={`tap flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] ${compact ? 'h-10 w-10' : 'w-full gap-2 px-3 py-2.5 text-left text-sm'}`}><span className="text-[var(--color-primary-2)]">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</span>{!compact && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}</button>;
}
