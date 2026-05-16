import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NewSessionButton from './NewSessionButton';
import { ALERT_THRESHOLD } from '@/lib/config';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Élèves
  const { data: students } = await supabase
    .from('fba_students')
    .select('*')
    .eq('teacher_id', user.id)
    .order('code');

  // Sessions récentes (10 dernières)
  const { data: sessions } = await supabase
    .from('fba_sessions')
    .select('*, fba_students(code)')
    .eq('teacher_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10);

  // Alertes : erreurs persistantes ≥ seuil
  const { data: alerts } = await supabase
    .from('fba_error_counts')
    .select('*, fba_students(code, teacher_id)')
    .gte('count', ALERT_THRESHOLD)
    .order('last_seen', { ascending: false })
    .limit(20);

  const myAlerts = alerts?.filter(a => a.fba_students?.teacher_id === user.id) ?? [];

  // Statistiques globales
  const totalResponses = sessions?.reduce((s, sess) => s + (sess.total_count ?? 0), 0) ?? 0;
  const totalCorrect = sessions?.reduce((s, sess) => s + (sess.correct_count ?? 0), 0) ?? 0;
  const globalPct = totalResponses > 0 ? Math.round((totalCorrect / totalResponses) * 100) : 0;

  const langLabel: Record<string, string> = { FR: 'Français', NL: 'Néerlandais', EN: 'Anglais' };
  const modeLabel: Record<string, string> = { fondamental: 'Fond.', secondaire: 'Sec.' };

  return (
    <div className="space-y-8">

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Élèves', value: students?.length ?? 0 },
          { label: 'Sessions', value: sessions?.length ?? 0 },
          { label: 'Réponses', value: totalResponses },
          { label: 'Réussite', value: `${globalPct}%` },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {myAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
            ⚠️ Erreurs persistantes ({myAlerts.length})
          </h2>
          <div className="space-y-2">
            {myAlerts.map(alert => (
              <div key={alert.id} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-amber-800 text-sm">{alert.fba_students?.code}</span>
                  <span className="text-amber-600 text-sm"> — item {alert.item_id}</span>
                </div>
                <span className="text-amber-700 text-xs bg-amber-100 px-2 py-0.5 rounded-full">
                  {alert.count}× la même erreur
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Élèves + bouton nouvelle session */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Mes élèves</h2>
          <Link
            href="/dashboard/students/new"
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nouvel élève
          </Link>
        </div>

        {!students || students.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-slate-400 text-sm">Aucun élève encore.</p>
            <Link href="/dashboard/students/new" className="text-blue-600 text-sm hover:underline mt-1 block">
              Créer le premier élève →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {students.map(student => (
              <div key={student.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{student.code}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {modeLabel[student.mode]} · {langLabel[student.lang]}
                  </p>
                  <Link
                    href={`/dashboard/eleve/${encodeURIComponent(student.code)}`}
                    className="text-xs text-blue-600 hover:underline mt-1 block"
                  >
                    Vue détail →
                  </Link>
                </div>
                <NewSessionButton studentId={student.id} studentCode={student.code} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sessions récentes */}
      {sessions && sessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Sessions récentes</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Code</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Élève</th>
                  <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Date</th>
                  <th className="text-right px-4 py-3 text-xs text-slate-400 font-medium">Score</th>
                  <th className="text-center px-4 py-3 text-xs text-slate-400 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{session.code}</td>
                    <td className="px-4 py-3 text-slate-600">{(session.fba_students as { code: string } | null)?.code ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(session.started_at).toLocaleDateString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {session.total_count > 0
                        ? `${session.correct_count}/${session.total_count}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${session.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {session.is_active ? 'Active' : 'Terminée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
