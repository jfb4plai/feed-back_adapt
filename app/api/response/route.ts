import { createServiceClient } from '@/lib/supabase/server';

// POST — enregistrer une réponse élève
export async function POST(req: Request) {
  try {
    const supabase = createServiceClient();
    const body = await req.json();
    const { sessionId, itemId, answerText, isCorrect, errorType, obstacle, feedbackGenerated, studentId, answerIndex } = body;

    // Enregistrer la réponse
    const { error: responseError } = await supabase
      .from('fba_responses')
      .insert({
        session_id: sessionId,
        item_id: itemId,
        answer_text: answerText,
        is_correct: isCorrect,
        error_type: errorType,
        obstacle: obstacle,
        feedback_generated: feedbackGenerated,
      });

    if (responseError) {
      return Response.json({ error: responseError.message }, { status: 500 });
    }

    // Mettre à jour les compteurs de la session
    const { data: session } = await supabase
      .from('fba_sessions')
      .select('correct_count, total_count')
      .eq('id', sessionId)
      .single();

    if (session) {
      await supabase
        .from('fba_sessions')
        .update({
          total_count: session.total_count + 1,
          correct_count: isCorrect ? session.correct_count + 1 : session.correct_count,
        })
        .eq('id', sessionId);
    }

    // Si erreur, mettre à jour error_counts pour les alertes de persistance
    let errorCount = 0;
    if (!isCorrect && studentId !== undefined && answerIndex !== undefined) {
      const { data: existing } = await supabase
        .from('fba_error_counts')
        .select('id, count')
        .eq('student_id', studentId)
        .eq('item_id', itemId)
        .eq('answer_index', answerIndex)
        .maybeSingle();

      if (existing) {
        errorCount = existing.count + 1;
        await supabase
          .from('fba_error_counts')
          .update({ count: errorCount, last_seen: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        errorCount = 1;
        await supabase
          .from('fba_error_counts')
          .insert({ student_id: studentId, item_id: itemId, answer_index: answerIndex, count: 1 });
      }
    }

    return Response.json({ success: true, errorCount });
  } catch (error) {
    console.error('Response save error:', error);
    return Response.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
