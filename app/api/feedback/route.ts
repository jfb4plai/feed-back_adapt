import Anthropic from '@anthropic-ai/sdk';
import { AI_MODEL } from '@/lib/config';
import { buildFeedbackPrompt } from '@/lib/feedback-prompt';
import { classify } from '@/lib/classifier';
import { getItemById } from '@/lib/items';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, answerIndex, mode, lang, studentName, errorCount } = body;

    const item = getItemById(itemId);
    if (!item) {
      return Response.json({ error: 'Item introuvable' }, { status: 400 });
    }

    const answer = item.answers[answerIndex];
    if (!answer) {
      return Response.json({ error: 'Réponse invalide' }, { status: 400 });
    }

    // Trouver la réponse correcte
    const correctAnswer = item.answers.find(a => a.correct)?.text ?? '';

    // Classer l'erreur
    const classification = classify(item, answerIndex, lang, errorCount ?? 0);

    // Si correct, feedback simple sans appel API
    if (classification.type === 'correct') {
      const messages: Record<string, string> = {
        FR: `Bravo, c'est exact ! La réponse est bien ${correctAnswer}.`,
        NL: `Goed gedaan, dat klopt! Het antwoord is inderdaad ${correctAnswer}.`,
        EN: `Well done, that's correct! The answer is ${correctAnswer}.`,
      };
      return Response.json({
        feedback: messages[lang] ?? messages.FR,
        classification,
      });
    }

    // Construire le prompt et appeler l'API Anthropic
    const prompt = buildFeedbackPrompt({
      item,
      wrongAnswer: answer.text,
      correctAnswer,
      classification,
      mode,
      lang,
      studentName,
    });

    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const feedback = (message.content[0] as { type: string; text: string }).text;

    return Response.json({ feedback, classification });
  } catch (error) {
    console.error('Feedback API error:', error);
    return Response.json({ error: 'Erreur lors de la génération du feedback' }, { status: 500 });
  }
}
