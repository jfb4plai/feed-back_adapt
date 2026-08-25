'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Email envoyé ! Vérifiez votre boîte mail pour créer un nouveau mot de passe.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">FEED-BACK ADAPT</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {mode === 'login' ? 'Connexion enseignant' : 'Mot de passe oublié'}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleReset} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.be"
            />
          </div>

          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : mode === 'login' ? 'Se connecter' : 'Envoyer le lien'}
          </button>
        </form>

        {mode === 'login' ? (
          <>
            <p className="text-center text-sm text-slate-500 mt-4">
              Pas encore de compte ?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                S&apos;inscrire
              </Link>
            </p>
            <p className="text-center text-sm mt-2">
              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                className="text-slate-400 hover:text-blue-600 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </p>
          </>
        ) : (
          <p className="text-center text-sm mt-4">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="text-blue-600 hover:underline"
            >
              ← Retour à la connexion
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
