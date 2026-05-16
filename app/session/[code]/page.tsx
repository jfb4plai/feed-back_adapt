'use client';

import { useEffect, useState, useCallback } from 'react';
import { getItemsForMode } from '@/lib/items';
import type { Item } from '@/lib/items';
import { useParams, useRouter } from 'next/navigation';

// Couleurs par type d'erreur
const ERROR_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  correct:         { bg: 'bg-green-50',   border: 'border-green-400',  text: 'text-green-800',  label: '' },
  faute:           { bg: 'bg-slate-50',   border: 'border-slate-300',  text: 'text-slate-700',  label: '' },
  épistémologique: { bg: 'bg-amber-50',   border: 'border-amber-400',  text: 'text-amber-800',  label: 'Obstacle épistémologique' },
  didactique:      { bg: 'bg-blue-50',    border: 'border-blue-400',   text: 'text-blue-800',   label: 'Obstacle didactique' },
  ontogénique:     { bg: 'bg-cyan-50',    border: 'border-cyan-400',   text: 'text-cyan-800',   label: 'Obstacle de développement' },
  linguistique:    { bg: 'bg-violet-50',  border: 'border-violet-400', text: 'text-violet-800', label: 'Interférence linguistique' },
};

interface SessionData {
  id: string;
  mode: 'fondamental' | 'secondaire';
  lang: 'FR' | 'NL' | 'EN';
  fba_students: { id: string; code: string };
}

export default function StudentSessionPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const [session, setSession] = useState<SessionData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'question' | 'feedback' | 'complete' | 'error'>('loading');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('correct');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  // Charger la session
  useEffect(() => {
    async function loadSession() {
      const res = await fetch(`/api/session/${code}`);
      if (!res.ok) {
        setErrorMsg('Session introuvable ou expirée. Demande le code à ton enseignant.');
        setPhase('error');
        return;
      }
      const { session } = await res.json();
      setSession(session);
      setItems(getItemsForMode(session.mode));
      setPhase('question');
    }
    loadSession();
  }, [code]);

  // Synthèse vocale
  function speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = { FR: 'fr-FR', NL: 'nl-NL', EN: 'en-GB' };
    utter.lang = langMap[session?.lang ?? 'FR'] ?? 'fr-FR';
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  }

  async function handleAnswer(answerIndex: number) {
    if (!session || isGenerating) return;
    setSelectedAnswer(answerIndex);
    setIsGenerating(true);

    const item = items[currentIndex];
    const isCorrect = item.answers[answerIndex].correct;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);

    // Appel API feedback
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: item.id,
        answerIndex,
        mode: session.mode,
        lang: session.lang,
        studentCode: session.fba_students.code,
        errorCount: 0,
      }),
    });

    const { feedback: feedbackText, classification } = await res.json();
    const type = classification?.type ?? (isCorrect ? 'correct' : 'didactique');

    setFeedback(feedbackText);
    setFeedbackType(type);

    // Enregistrer la réponse en DB
    await fetch('/api/response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session.id,
        itemId: item.id,
        answerText: item.answers[answerIndex].text,
        isCorrect,
        errorType: type,
        obstacle: classification?.obstacle ?? null,
        feedbackGenerated: feedbackText,
        studentId: session.fba_students.id,
        answerIndex,
      }),
    });

    setIsGenerating(false);
    setPhase('feedback');

    // Lire le feedback à voix haute
    if (feedbackText) speak(feedbackText);
  }

  async function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= items.length) {
      // Clôturer la session
      await fetch(`/api/session/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ended_at: new Date().toISOString(),
          correct_count: score.correct,
          total_count: score.total,
        }),
      });
      router.push(`/session/${code}/complete?score=${score.correct}&total=${items.length}&code=${encodeURIComponent(session?.fba_students.code ?? '')}`);
    } else {
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setFeedback('');
      setPhase('question');
    }
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Chargement de la session…</p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-slate-700 font-medium">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!session || items.length === 0) return null;

  const item = items[currentIndex];
  const lang = session.lang;
  const isFondamental = session.mode === 'fondamental';
  const colors = ERROR_COLORS[feedbackType] ?? ERROR_COLORS.didactique;

  return (
    <div className={`min-h-screen ${isFondamental ? 'bg-blue-50' : 'bg-slate-50'} p-4`}>
      <div className="max-w-lg mx-auto">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className={`font-semibold ${isFondamental ? 'text-blue-700' : 'text-slate-700'}`}>
              {session.fba_students.code}
            </p>
            <p className="text-xs text-slate-400">
              {currentIndex + 1} / {items.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">{item.competence[lang]}</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + (phase === 'feedback' ? 1 : 0)) / items.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="flex items-start justify-between gap-3">
            <p
              className={`${isFondamental ? 'text-2xl' : 'text-xl'} font-medium text-slate-800 leading-relaxed`}
              dangerouslySetInnerHTML={{ __html: item.question[lang] ?? item.question.FR }}
            />
            <button
              onClick={() => speak(item.questionText[lang] ?? item.questionText.FR)}
              className="shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
              title="Écouter la question"
            >
              🔊
            </button>
          </div>
        </div>

        {/* Réponses */}
        {phase === 'question' && (
          <div className={`grid ${isFondamental ? 'grid-cols-2 gap-4' : 'grid-cols-2 gap-3'}`}>
            {item.answers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isGenerating}
                className={`
                  ${isFondamental ? 'py-5 text-xl' : 'py-4 text-base'}
                  px-4 rounded-2xl border-2 border-slate-200 bg-white font-medium text-slate-700
                  hover:border-blue-400 hover:bg-blue-50 active:scale-95
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {answer.text}
              </button>
            ))}
          </div>
        )}

        {/* Génération en cours */}
        {isGenerating && (
          <div className="text-center py-6">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm mt-2">Analyse en cours…</p>
          </div>
        )}

        {/* Feedback */}
        {phase === 'feedback' && (
          <div className="space-y-4">
            {/* Réponse choisie mise en évidence */}
            <div className="grid grid-cols-2 gap-3">
              {item.answers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`
                    ${isFondamental ? 'py-5 text-xl' : 'py-4 text-base'}
                    px-4 rounded-2xl border-2 font-medium text-center
                    ${answer.correct
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : idx === selectedAnswer
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-white text-slate-400'
                    }
                  `}
                >
                  {answer.correct && <span className="mr-1">✓</span>}
                  {idx === selectedAnswer && !answer.correct && <span className="mr-1">✗</span>}
                  {answer.text}
                </div>
              ))}
            </div>

            {/* Carte feedback */}
            <div className={`rounded-2xl border-2 p-5 ${colors.bg} ${colors.border}`}>
              {colors.label && (
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${colors.text} opacity-70`}>
                  {colors.label}
                </p>
              )}
              <p className={`${isFondamental ? 'text-lg' : 'text-base'} leading-relaxed ${colors.text}`}>
                {feedback}
              </p>
              <button
                onClick={() => speak(feedback)}
                className="mt-3 text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
              >
                🔊 Réécouter
              </button>
            </div>

            {/* Bouton suivant */}
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white rounded-2xl py-4 text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all"
            >
              {currentIndex + 1 < items.length ? 'Question suivante →' : 'Terminer ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
