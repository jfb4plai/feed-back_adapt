import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateSessionCode } from '@/lib/session-code';

// POST — créer une nouvelle session
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { studentId } = await req.json();

    // Récupérer les infos de l'élève
    const { data: student, error: studentError } = await supabase
      .from('fba_students')
      .select('*')
      .eq('id', studentId)
      .eq('teacher_id', user.id)
      .single();

    if (studentError || !student) {
      return Response.json({ error: 'Élève introuvable' }, { status: 404 });
    }

    // Générer un code unique
    let code = generateSessionCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('fba_sessions')
        .select('id')
        .eq('code', code)
        .maybeSingle();
      if (!existing) break;
      code = generateSessionCode();
      attempts++;
    }

    // Clore les sessions actives précédentes de cet élève
    await supabase
      .from('fba_sessions')
      .update({ is_active: false, ended_at: new Date().toISOString() })
      .eq('student_id', studentId)
      .eq('is_active', true);

    // Créer la session
    const { data: session, error } = await supabase
      .from('fba_sessions')
      .insert({
        student_id: studentId,
        teacher_id: user.id,
        code,
        mode: student.mode,
        lang: student.lang,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ session });
  } catch (error) {
    console.error('Session create error:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// GET — lister les sessions de l'enseignant connecté
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: sessions, error } = await supabase
      .from('fba_sessions')
      .select(`
        *,
        fba_students (id, name, mode, lang)
      `)
      .eq('teacher_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ sessions });
  } catch (error) {
    console.error('Session list error:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
