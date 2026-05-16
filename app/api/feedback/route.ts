import Anthropic from '@anthropic-ai/sdk';
import { AI_MODEL } from '@/lib/config';
import { buildFeedbackPrompt } from '@/lib/feedback-prompt';
import { classify } from '@/lib/classifier';
import { getItemById } from '@/lib/items';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Rate limiter simple — par IP, par instance serverless
const rateLimitMap = new Map<string, { count: number; start: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return Response.json({ error: 'Trop de requêtes — réessayez dans 1 minute.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { itemId, answerIndex, mode, lang, studentCode, errorCount } = body;

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
      studentCode,
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
