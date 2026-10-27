import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/store';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useStore();
  if (isLoading) return null;
  if (!isAdmin) return <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center"><ShieldAlert size={34} className="text-amber-400" /><h1 className="mt-4 font-bold">Administrator access required</h1><p className="mt-2 max-w-sm text-sm text-[var(--color-text-dim)]">This area is limited to accounts marked as administrators in Supabase.</p><Navigate to="/profile" replace /></div>;
  return <>{children}</>;
}
