import { createServiceClient } from '@/lib/supabase/server';

// GET — données de session par code (accès élève sans login)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createServiceClient();

    const { data: session, error } = await supabase
      .from('fba_sessions')
      .select(`
        *,
        fba_students (id, name, mode, lang)
      `)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !session) {
      return Response.json({ error: 'Session introuvable ou expirée' }, { status: 404 });
    }

    return Response.json({ session });
  } catch (error) {
    console.error('Session fetch error:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH — clôturer une session
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = createServiceClient();
    const body = await req.json();

    const updateData: Record<string, unknown> = { is_active: false };
    if (body.ended_at) updateData.ended_at = body.ended_at;
    if (body.correct_count !== undefined) updateData.correct_count = body.correct_count;
    if (body.total_count !== undefined) updateData.total_count = body.total_count;

    const { error } = await supabase
      .from('fba_sessions')
      .update(updateData)
      .eq('code', code.toUpperCase());

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Session patch error:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
