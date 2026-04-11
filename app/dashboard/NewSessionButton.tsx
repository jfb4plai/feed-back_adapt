'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  studentId: string;
  studentName: string;
}

export default function NewSessionButton({ studentId, studentName }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'show'>('idle');
  const [sessionCode, setSessionCode] = useState('');
  const [sessionUrl, setSessionUrl] = useState('');

  async function handleNewSession() {
    setState('loading');
    const res = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    const { session, error } = await res.json();
    if (error || !session) {
      alert('Erreur lors de la création de la session');
      setState('idle');
      return;
    }
    const url = `${window.location.origin}/session/${session.code}`;
    setSessionCode(session.code);
    setSessionUrl(url);
    setState('show');
  }

  if (state === 'idle') {
    return (
      <button
        onClick={handleNewSession}
        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
      >
        Nouvelle session
      </button>
    );
  }

  if (state === 'loading') {
    return <span className="text-xs text-slate-400">Création…</span>;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
        <h3 className="font-bold text-slate-800 mb-1">Session créée</h3>
        <p className="text-slate-500 text-sm mb-4">{studentName}</p>

        {/* Code 4 lettres */}
        <div className="bg-slate-50 rounded-xl py-4 mb-4">
          <p className="text-5xl font-mono font-bold text-blue-600 tracking-widest">{sessionCode}</p>
          <p className="text-xs text-slate-400 mt-1">Code de session</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <QRCodeSVG value={sessionUrl} size={160} />
        </div>

        <p className="text-xs text-slate-400 mb-5 break-all">{sessionUrl}</p>

        <div className="flex gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(sessionUrl)}
            className="flex-1 text-sm border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition-colors"
          >
            Copier le lien
          </button>
          <button
            onClick={() => setState('idle')}
            className="flex-1 text-sm bg-blue-600 text-white rounded-xl py-2 hover:bg-blue-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
