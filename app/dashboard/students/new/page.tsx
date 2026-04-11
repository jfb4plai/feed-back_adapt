'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewStudentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'fondamental' | 'secondaire'>('fondamental');
  const [lang, setLang] = useState<'FR' | 'NL' | 'EN'>('FR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Non authentifié'); setLoading(false); return; }

    const { error: err } = await supabase.from('fba_students').insert({
      teacher_id: user.id,
      name: name.trim(),
      mode,
      lang,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 text-sm">← Retour</Link>
        <h1 className="text-xl font-bold text-slate-800">Nouvel élève</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prénom de l&apos;élève</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Emma"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Niveau</label>
          <div className="grid grid-cols-2 gap-2">
            {(['fondamental', 'secondaire'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-3 rounded-lg text-sm font-medium border transition-colors ${
                  mode === m
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {m === 'fondamental' ? 'Fondamental' : 'Secondaire'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Langue d&apos;enseignement</label>
          <div className="grid grid-cols-3 gap-2">
            {([['FR', 'Français'], ['NL', 'Néerlandais'], ['EN', 'Anglais']] as const).map(([code, label]) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`py-3 rounded-lg text-sm font-medium border transition-colors ${
                  lang === code
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Enregistrement…' : 'Créer l\'élève'}
        </button>
      </form>
    </div>
  );
}
