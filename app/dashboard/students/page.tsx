import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: students } = await supabase
    .from('fba_students')
    .select('*')
    .eq('teacher_id', user.id)
    .order('name');

  const langLabel: Record<string, string> = { FR: 'Français', NL: 'Néerlandais', EN: 'Anglais' };
  const modeLabel: Record<string, string> = { fondamental: 'Fondamental', secondaire: 'Secondaire' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Mes élèves</h1>
        <Link
          href="/dashboard/students/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nouvel élève
        </Link>
      </div>

      {!students || students.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-slate-400">Aucun élève enregistré.</p>
          <Link href="/dashboard/students/new" className="text-blue-600 hover:underline text-sm mt-2 block">
            Créer le premier élève →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Nom</th>
                <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Niveau</th>
                <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Langue</th>
                <th className="text-left px-4 py-3 text-xs text-slate-400 font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                  <td className="px-4 py-3 text-slate-500">{modeLabel[student.mode] ?? student.mode}</td>
                  <td className="px-4 py-3 text-slate-500">{langLabel[student.lang] ?? student.lang}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(student.created_at).toLocaleDateString('fr-BE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
