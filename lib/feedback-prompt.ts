import type { Item } from './items';
import type { Classification } from './classifier';

export function buildFeedbackPrompt(params: {
  item: Item;
  wrongAnswer: string;
  correctAnswer: string;
  classification: Classification;
  mode: 'fondamental' | 'secondaire';
  lang: 'FR' | 'NL' | 'EN';
  studentCode: string;
}): string {
  const { item, wrongAnswer, correctAnswer, classification, mode, lang, studentCode } = params;
  const { type, obstacle } = classification;

  const modeInstructions = {
    fondamental: {
      FR: 'Maximum 2 phrases courtes et simples. Ton valorisant et encourageant. Vocabulaire adapté à un enfant de 6-12 ans. Commence par reconnaître l\'effort.',
      NL: 'Maximaal 2 korte zinnen. Positieve en bemoedigende toon. Woordgebruik aangepast aan een kind van 6-12 jaar.',
      EN: 'Maximum 2 short simple sentences. Warm, encouraging tone. Vocabulary adapted for a 6-12 year old child.',
    },
    secondaire: {
      FR: '3 temps SANS préambule : (1) nomme l\'erreur spécifique, (2) explique pourquoi ce raisonnement échoue ici, (3) donne la correction justifiée. Ton neutre et factuel. Maximum 4 phrases.',
      NL: '3 stappen ZONDER inleiding: (1) benoem de fout, (2) verklaar waarom dit redeneren niet werkt, (3) gecorrigeerde formule. Feitelijke toon, max 4 zinnen.',
      EN: '3 steps WITHOUT preamble: (1) name the error, (2) explain why this reasoning fails, (3) justified correction. Neutral factual tone, max 4 sentences.',
    },
  };

  const errorContext: Record<string, string> = {
    correct: 'L\'élève a trouvé la bonne réponse. Confirme brièvement et valorise chaleureusement.',
    faute: 'Légère erreur isolée, non reproductible. Message très court et encourageant, sans explication lourde.',
    épistémologique: `Erreur due à un savoir antérieur valide ailleurs mais devenu obstacle ici. Obstacle précis : ${obstacle}`,
    didactique: `Erreur due à une mauvaise lecture de la situation. Obstacle : ${obstacle}`,
    ontogénique: `Erreur liée au stade de développement cognitif. Obstacle : ${obstacle}. Sois très doux et rassurant.`,
    linguistique: `Interférence linguistique CLIL — le concept est peut-être maîtrisé en français mais la formulation en ${lang} manque. Valide le concept et donne la formulation correcte en ${lang} avec sa traduction.`,
  };

  const langInstruction = {
    FR: 'Réponds entièrement en français.',
    NL: 'Antwoord volledig in het Nederlands.',
    EN: 'Respond entirely in English.',
  };

  const questionText = item.questionText[lang] ?? item.questionText.FR;
  const instructions = (modeInstructions[mode] ?? modeInstructions.fondamental)[lang]
    ?? (modeInstructions[mode] ?? modeInstructions.fondamental).FR;

  return `Tu es FEED-BACK ADAPT, assistant pédagogique pour la Fédération Wallonie-Bruxelles.

Mode: ${mode} | Langue: ${lang} | Élève: ${studentCode}
Question: "${questionText}"
Réponse de l'élève: "${wrongAnswer}"
Réponse correcte: "${correctAnswer}"
Type d'erreur: ${type}
Contexte pédagogique: ${errorContext[type] ?? errorContext.didactique}

Instructions de format:
- ${instructions}
- ${langInstruction[lang] ?? langInstruction.FR}
- NE PAS commencer par "Voici", "Bien sûr", "En tant que", ou tout autre préambule.
- NE PAS répéter la question.
- Aller directement au feedback pédagogique.`;
}
