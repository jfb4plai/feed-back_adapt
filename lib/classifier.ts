import type { Item, ErrorType } from './items';
import { ALERT_THRESHOLD } from './config';

export interface Classification {
  type: ErrorType;
  obstacle: string | null;
}

export function classify(
  item: Item,
  answerIndex: number,
  lang: 'FR' | 'NL' | 'EN',
  errorCount: number // nb de fois que cet élève a donné cette réponse sur cet item
): Classification {
  const answer = item.answers[answerIndex];
  if (!answer) return { type: 'didactique', obstacle: 'Réponse inconnue' };

  if (answer.correct) return { type: 'correct', obstacle: null };

  // Branche CLIL : première erreur en anglais sur type didactique → suspicion linguistique
  if (lang === 'EN' && answer.errorType === 'didactique' && errorCount === 1) {
    return {
      type: 'linguistique',
      obstacle: `Interférence linguistique possible — le concept peut être maîtrisé en français. ${answer.obstacle ?? ''}`,
    };
  }

  // Faute si non-reproductible (< seuil) et marquée comme faute
  if (answer.errorType === 'faute' && errorCount < ALERT_THRESHOLD) {
    return { type: 'faute', obstacle: answer.obstacle };
  }

  return {
    type: answer.errorType ?? 'didactique',
    obstacle: answer.obstacle,
  };
}
