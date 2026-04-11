import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: teacher } = await supabase
    .from('fba_teachers')
    .select('name, school')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Barre de navigation */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-slate-800 text-sm">
              FEED-BACK ADAPT
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
              Tableau de bord
            </Link>
            <Link href="/dashboard/students" className="text-sm text-slate-500 hover:text-slate-800">
              Élèves
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 hidden sm:block">
              {teacher?.name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
