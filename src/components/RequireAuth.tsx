import { Navigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useStore } from '../store/store';

/** Keeps member data screens unavailable until a real Supabase session exists. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, isLoading, isOffline } = useStore();
  const location = useLocation();
  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><LoaderCircle className="animate-spin text-[var(--color-primary-2)]" size={28} /></div>;
  if (isOffline) return <div className="mx-auto max-w-md px-6 pt-24 text-center"><p className="font-semibold">BookBridge is not connected</p><p className="mt-2 text-sm text-[var(--color-text-dim)]">Add the public Supabase environment variables before using member features.</p></div>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
