'use client';

import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
    >
      Déconnexion
    </button>
  );
}
