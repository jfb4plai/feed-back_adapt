'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CompleteContent() {
  const params = useSearchParams();
  const score = parseInt(params.get('score') ?? '0');
  const total = parseInt(params.get('total') ?? '5');
  const name = params.get('name') ?? 'Élève';

  const pct = Math.round((score / total) * 100);

  const messages = [
    { min: 80, emoji: '🌟', text: `Excellent travail, ${name} !` },
    { min: 60, emoji: '👍', text: `Bien joué, ${name} !` },
    { min: 40, emoji: '💪', text: `Continue comme ça, ${name} !` },
    { min: 0,  emoji: '🌱', text: `On progresse, ${name} !` },
  ];

  const msg = messages.find(m => pct >= m.min) ?? messages[messages.length - 1];

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-6xl mb-4">{msg.emoji}</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{msg.text}</h1>
        <p className="text-slate-500 mb-8">Session terminée</p>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <p className="text-5xl font-bold text-blue-600 mb-1">{score}/{total}</p>
          <p className="text-slate-500">bonnes réponses</p>

          {/* Barre de score */}
          <div className="w-full bg-slate-100 rounded-full h-3 mt-4">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">{pct}%</p>
        </div>

        <p className="text-slate-500 text-sm">
          Ton enseignant peut voir tes résultats dans son tableau de bord.
        </p>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense>
      <CompleteContent />
    </Suspense>
  );
}
