// Caractères sans ambiguïté visuelle (pas 0/O, 1/I/L)
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateSessionCode(): string {
  return Array.from({ length: 4 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('');
}
