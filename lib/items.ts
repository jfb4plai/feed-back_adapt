export type ErrorType =
  | 'correct'
  | 'faute'
  | 'épistémologique'
  | 'didactique'
  | 'ontogénique'
  | 'linguistique';

export interface Answer {
  text: string;
  correct: boolean;
  errorType: ErrorType | null;
  obstacle: string | null;
}

export interface Item {
  id: string;
  competence: { FR: string; NL: string; EN: string };
  question: { FR: string; NL: string; EN: string };
  questionText: { FR: string; NL: string; EN: string };
  answers: Answer[];
}

// ── Items fondamental ────────────────────────────────────────

const fondamentalItems: Item[] = [
  {
    id: 'f1',
    competence: { FR: 'Valeur positionnelle', NL: 'Plaatswaarde', EN: 'Place value' },
    question: {
      FR: 'Combien vaut le chiffre <b>3</b> dans <b>304</b> ?',
      NL: 'Hoeveel is het cijfer <b>3</b> in <b>304</b> waard?',
      EN: 'What is the value of digit <b>3</b> in <b>304</b>?',
    },
    questionText: {
      FR: 'Combien vaut le chiffre 3 dans 304 ?',
      NL: 'Hoeveel is het cijfer 3 in 304 waard?',
      EN: 'What is the value of digit 3 in 304?',
    },
    answers: [
      { text: '3', correct: false, errorType: 'didactique', obstacle: 'Lit le chiffre sans considérer sa position — confond chiffre et valeur positionnelle' },
      { text: '30', correct: false, errorType: 'épistémologique', obstacle: 'Applique la règle des dizaines aux centaines — confond position des dizaines et des centaines' },
      { text: '300', correct: true, errorType: null, obstacle: null },
      { text: '3 000', correct: false, errorType: 'ontogénique', obstacle: 'Ne distingue pas encore les positions dans un nombre à 3 chiffres' },
    ],
  },
  {
    id: 'f2',
    competence: { FR: 'Addition avec retenue', NL: 'Optellen met overdracht', EN: 'Addition with carrying' },
    question: {
      FR: 'Combien font <b>27 + 15</b> ?',
      NL: 'Hoeveel is <b>27 + 15</b>?',
      EN: 'What is <b>27 + 15</b>?',
    },
    questionText: {
      FR: 'Combien font 27 + 15 ?',
      NL: 'Hoeveel is 27 + 15?',
      EN: 'What is 27 + 15?',
    },
    answers: [
      { text: '32', correct: false, errorType: 'épistémologique', obstacle: 'Oublie la retenue — 7+5=12 mais n\'ajoute pas 1 aux dizaines' },
      { text: '42', correct: true, errorType: null, obstacle: null },
      { text: '312', correct: false, errorType: 'didactique', obstacle: 'Juxtapose les résultats partiels sans comprendre la retenue' },
      { text: '41', correct: false, errorType: 'faute', obstacle: 'Erreur de calcul isolée sur 7+5 — non reproductible par nature' },
    ],
  },
  {
    id: 'f3',
    competence: { FR: 'Complémentaire à 10', NL: 'Aanvullen tot 10', EN: 'Complement to 10' },
    question: {
      FR: '<b>8</b> + <b>?</b> = 10',
      NL: '<b>8</b> + <b>?</b> = 10',
      EN: '<b>8</b> + <b>?</b> = 10',
    },
    questionText: {
      FR: '8 + ? = 10',
      NL: '8 + ? = 10',
      EN: '8 + ? = 10',
    },
    answers: [
      { text: '3', correct: false, errorType: 'ontogénique', obstacle: 'Dénombrement instable — commence à compter depuis 7 au lieu de 8' },
      { text: '18', correct: false, errorType: 'épistémologique', obstacle: 'Additionne 8 et 10 au lieu de chercher le complémentaire' },
      { text: '2', correct: true, errorType: null, obstacle: null },
      { text: '12', correct: false, errorType: 'didactique', obstacle: 'Restitue le résultat final (10+2) au lieu du complément' },
    ],
  },
  {
    id: 'f4',
    competence: { FR: 'Double d\'un nombre', NL: 'Dubbel van een getal', EN: 'Double of a number' },
    question: {
      FR: 'Quel est le double de <b>14</b> ?',
      NL: 'Wat is het dubbele van <b>14</b>?',
      EN: 'What is the double of <b>14</b>?',
    },
    questionText: {
      FR: 'Quel est le double de 14 ?',
      NL: 'Wat is het dubbele van 14?',
      EN: 'What is the double of 14?',
    },
    answers: [
      { text: '7', correct: false, errorType: 'épistémologique', obstacle: 'Confond double et moitié — divise par 2 au lieu de multiplier' },
      { text: '24', correct: false, errorType: 'didactique', obstacle: 'Ajoute 10 au lieu de doubler — procédure incorrecte : 14+10=24' },
      { text: '28', correct: true, errorType: null, obstacle: null },
      { text: '16', correct: false, errorType: 'ontogénique', obstacle: 'Double seulement les unités — erreur de décomposition' },
    ],
  },
  {
    id: 'f5',
    competence: { FR: 'Écriture des nombres', NL: 'Schrijven van getallen', EN: 'Writing numbers' },
    question: {
      FR: 'Comment écrit-on <b>quatre-vingt-douze</b> ?',
      NL: 'Hoe schrijf je <b>tweeënnegentig</b>?',
      EN: 'How do you write <b>ninety-two</b>?',
    },
    questionText: {
      FR: 'Comment écrit-on quatre-vingt-douze ?',
      NL: 'Hoe schrijf je tweeënnegentig?',
      EN: 'How do you write ninety-two?',
    },
    answers: [
      { text: '8012', correct: false, errorType: 'épistémologique', obstacle: 'Code 80 et 12 séparément et les juxtapose' },
      { text: '92', correct: true, errorType: null, obstacle: null },
      { text: '4012', correct: false, errorType: 'ontogénique', obstacle: 'Code le mot "quatre" littéralement — n\'a pas automatisé que "quatre-vingts"=80' },
      { text: '922', correct: false, errorType: 'didactique', obstacle: 'Segmentation phonologique erronée' },
    ],
  },
];

// ── Items secondaire ─────────────────────────────────────────

const secondaireItems: Item[] = [
  {
    id: 's1',
    competence: { FR: 'Addition de fractions', NL: 'Optellen van breuken', EN: 'Adding fractions' },
    question: {
      FR: 'Que vaut <b>1/2 + 1/3</b> ?',
      NL: 'Wat is <b>1/2 + 1/3</b>?',
      EN: 'What is <b>1/2 + 1/3</b>?',
    },
    questionText: {
      FR: 'Que vaut 1/2 + 1/3 ?',
      NL: 'Wat is 1/2 + 1/3?',
      EN: 'What is 1/2 + 1/3?',
    },
    answers: [
      { text: '2/5', correct: false, errorType: 'épistémologique', obstacle: 'Additionne numérateurs ET dénominateurs séparément — transfert de la règle des entiers' },
      { text: '5/6', correct: true, errorType: null, obstacle: null },
      { text: '2/6', correct: false, errorType: 'didactique', obstacle: 'Réduit au dénominateur commun mais garde les numérateurs originaux sans les adapter' },
      { text: '1/6', correct: false, errorType: 'faute', obstacle: 'Erreur arithmétique sur les numérateurs — soustrait au lieu d\'additionner' },
    ],
  },
  {
    id: 's2',
    competence: { FR: 'Équation du 1er degré', NL: 'Eerstegraadsvergelijking', EN: 'Linear equation' },
    question: {
      FR: 'Si <b>x + 5 = 12</b>, alors x = ?',
      NL: 'Als <b>x + 5 = 12</b>, wat is x?',
      EN: 'If <b>x + 5 = 12</b>, then x = ?',
    },
    questionText: {
      FR: 'Si x + 5 = 12, alors x = ?',
      NL: 'Als x + 5 = 12, dan x = ?',
      EN: 'If x + 5 = 12, then x = ?',
    },
    answers: [
      { text: '17', correct: false, errorType: 'épistémologique', obstacle: 'Additionne 12 et 5 — mauvaise interprétation du passage des membres' },
      { text: '7', correct: true, errorType: null, obstacle: null },
      { text: '2.4', correct: false, errorType: 'didactique', obstacle: 'Divise 12 par 5 — confond le "+" avec une multiplication' },
      { text: '60', correct: false, errorType: 'faute', obstacle: 'Multiplie 12 par 5 — inattention sur l\'opération' },
    ],
  },
  {
    id: 's3',
    competence: { FR: 'Probabilités classiques', NL: 'Klassieke kansrekening', EN: 'Classical probability' },
    question: {
      FR: 'On lance un dé. P(nombre pair) = ?',
      NL: 'We gooien een dobbelsteen. P(even getal) = ?',
      EN: 'We roll a die. P(even number) = ?',
    },
    questionText: {
      FR: 'P(nombre pair) avec un dé à 6 faces ?',
      NL: 'P(even getal) met een dobbelsteen?',
      EN: 'P(even number) with a 6-sided die?',
    },
    answers: [
      { text: '1/6', correct: false, errorType: 'épistémologique', obstacle: 'Compte une seule face paire — confond "un nombre pair" avec "la valeur 2"' },
      { text: '1/2', correct: true, errorType: null, obstacle: null },
      { text: '1/3', correct: false, errorType: 'didactique', obstacle: 'Compte seulement 2 faces paires (2 et 4) — oublie 6' },
      { text: '3', correct: false, errorType: 'ontogénique', obstacle: 'Donne le nombre de cas favorables sans calculer la fraction' },
    ],
  },
  {
    id: 's4',
    competence: { FR: 'Aire d\'un carré', NL: 'Oppervlakte vierkant', EN: 'Area of a square' },
    question: {
      FR: 'Aire d\'un carré de côté <b>5 cm</b> = ?',
      NL: 'Oppervlakte vierkant, zijde <b>5 cm</b> = ?',
      EN: 'Area of square with side <b>5 cm</b> = ?',
    },
    questionText: {
      FR: 'Aire d\'un carré de côté 5 cm ?',
      NL: 'Oppervlakte vierkant, zijde 5 cm?',
      EN: 'Area of a square with side 5 cm?',
    },
    answers: [
      { text: '20 cm²', correct: false, errorType: 'épistémologique', obstacle: 'Calcule le périmètre (4×5=20) au lieu de l\'aire — confond périmètre et aire' },
      { text: '25 cm²', correct: true, errorType: null, obstacle: null },
      { text: '10 cm²', correct: false, errorType: 'didactique', obstacle: 'Additionne deux côtés (5+5=10) — formule incomplète' },
      { text: '5 cm²', correct: false, errorType: 'faute', obstacle: 'Recopie la donnée — inattention' },
    ],
  },
  {
    id: 's5',
    competence: { FR: 'Carré d\'un nombre négatif', NL: 'Kwadraat negatief getal', EN: 'Square of a negative number' },
    question: {
      FR: 'Que vaut <b>(-2)²</b> ?',
      NL: 'Wat is <b>(-2)²</b>?',
      EN: 'What is <b>(-2)²</b>?',
    },
    questionText: {
      FR: 'Que vaut (-2)² ?',
      NL: 'Wat is (-2)²?',
      EN: 'What is (-2)²?',
    },
    answers: [
      { text: '-4', correct: false, errorType: 'épistémologique', obstacle: 'Conserve le signe négatif — la règle "négatif×négatif=positif" n\'est pas internalisée' },
      { text: '4', correct: true, errorType: null, obstacle: null },
      { text: '-2', correct: false, errorType: 'faute', obstacle: 'Ignore l\'exposant' },
      { text: '2', correct: false, errorType: 'didactique', obstacle: 'Ignore le signe ET l\'exposant' },
    ],
  },
];

// ── Export ───────────────────────────────────────────────────

export const ITEMS: Record<string, Item[]> = {
  fondamental: fondamentalItems,
  secondaire: secondaireItems,
};

export function getItemsForMode(mode: 'fondamental' | 'secondaire'): Item[] {
  return ITEMS[mode] ?? [];
}

export function getItemById(id: string): Item | undefined {
  return [...fondamentalItems, ...secondaireItems].find(i => i.id === id);
}
