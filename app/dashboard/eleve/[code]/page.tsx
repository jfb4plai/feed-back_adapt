/**
 * Vue Élève — Fiche consolidée par code élève
 *
 * Données affichées (même projet Supabase otiorljbujqzruulmqrs) :
 *   - FEED-BACK ADAPT : sessions, scores, erreurs persistantes
 *   - PLAI-Quiz : sessions, résultats par quiz (si migration 002 appliquée)
 *
 * Lien sortant vers RetroActif pour les données de rétroaction.
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const retroActifUrl = 'https://retroactif.jfb4plai.com/suivi';

export default async function VueElevePage({ params }: { params: { code: string } }) {
  const { code } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // ── FBA : données élève ──────────────────────────────────────
  const { data: student } = await supabase
    .from('fba_students')
    .select('*')
    .eq('teacher_id', user.id)
    .eq('code', decodeURIComponent(code))
    .maybeSingle();

  if (!student) notFound();

  const [
    { data: fbaSessions },
    { data: topErrors },
  ] = await Promise.all([
    supabase
      .from('fba_sessions')
      .select('id, code, started_at, total_count, correct_count, is_active')
      .eq('student_id', student.id)
      .order('started_at', { ascending: false }),
    supabase
      .from('fba_error_counts')
      .select('item_id, count, last_seen')
      .eq('student_id', student.id)
      .order('count', { ascending: false })
      .limit(5),
  ]);

  // ── PLAI-Quiz : responses pour ce code (même projet, même JWT) ──
  // Dépend de la migration supabase-migration-002.sql (student_name → student_code)
  const { data: quizResponses } = await supabase
    .from('quiz_responses')
    .select('id, session_id, is_correct, quiz_sessions!inner(code, started_at, quiz_id, quiz_quizzes(title))')
    .eq('student_code', student.code)
    .order('session_id');

  // Grouper par session
  const quizBySession = new Map<string, { sessionCode: string; quizTitle: string; date: string; correct: number; total: number }>();
  for (const r of quizResponses ?? []) {
    const sess = r.quiz_sessions as { code: string; started_at: string; quiz_quizzes: { title: string } | null } | null;
    if (!sess) continue;
    if (!quizBySession.has(r.session_id)) {
      quizBySession.set(r.session_id, {
        sessionCode: sess.code,
        quizTitle: sess.quiz_quizzes?.title ?? '—',
        date: sess.started_at,
        correct: 0,
        total: 0,
      });
    }
    const entry = quizBySession.get(r.session_id)!;
    entry.total++;
    if (r.is_correct) entry.correct++;
  }
  const quizSessions = [...quizBySession.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ── Stats ────────────────────────────────────────────────────
  const totalFbaResponses = fbaSessions?.reduce((s, sess) => s + (sess.total_count ?? 0), 0) ?? 0;
  const totalFbaCorrect = fbaSessions?.reduce((s, sess) => s + (sess.correct_count ?? 0), 0) ?? 0;
  const fbaPct = totalFbaResponses > 0 ? Math.round((totalFbaCorrect / totalFbaResponses) * 100) : null;

  const modeLabel: Record<string, string> = { fondamental: 'Fondamental', secondaire: 'Secondaire' };
  const langLabel: Record<string, string> = { FR: 'Français', NL: 'Néerlandais', EN: 'Anglais' };

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-600 mb-1 block">
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Élève : {student.code}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {modeLabel[student.mode] ?? student.mode} · {langLabel[student.lang] ?? student.lang}
          </p>
        </div>
        <a
          href={retroActifUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors"
        >
          Voir dans RetroActif →
        </a>
      </div>

      {/* Stats FBA */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">FEED-BACK ADAPT</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Sessions', value: fbaSessions?.length ?? 0 },
            { label: 'Réponses', value: totalFbaResponses },
            { label: 'Réussite', value: fbaPct !== null ? `${fbaPct}%` : '—' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sessions FBA */}
        {fbaSessions && fbaSessions.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-slate-400">Code session</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-400">Date</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-400">Score</th>
                  <th className="text-center px-4 py-2 text-xs text-slate-400">Statut</th>
                </tr>
              </thead>
              <tbody>
                {fbaSessions.map(sess => (
                  <tr key={sess.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono font-bold text-slate-700">{sess.code}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {new Date(sess.started_at).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-600">
                      {sess.total_count > 0 ? `${sess.correct_count}/${sess.total_count}` : '—'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${sess.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {sess.is_active ? 'Active' : 'Terminée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Erreurs persistantes */}
        {topErrors && topErrors.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">⚠️ Erreurs persistantes</h3>
            <div className="space-y-1">
              {topErrors.map((e, i) => (
                <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
                  <span className="text-amber-800">Item {e.item_id}</span>
                  <span className="text-amber-600 text-xs bg-amber-100 px-2 py-0.5 rounded-full">{e.count}× la même erreur</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PLAI-Quiz */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">PLAI-Quiz</h2>
        {quizSessions.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-slate-400 text-sm">Aucune donnée Quiz pour ce code.</p>
            <p className="text-xs text-slate-300 mt-1">Vérifie que la migration supabase-migration-002.sql est appliquée.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-slate-400">Quiz</th>
                  <th className="text-left px-4 py-2 text-xs text-slate-400">Date</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-400">Score</th>
                </tr>
              </thead>
              <tbody>
                {quizSessions.map((qs, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-700">{qs.quizTitle}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">
                      {new Date(qs.date).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-slate-700">
                      {qs.correct}/{qs.total}
                      <span className="text-xs text-slate-400 ml-1">
                        ({qs.total > 0 ? Math.round((qs.correct / qs.total) * 100) : 0}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
