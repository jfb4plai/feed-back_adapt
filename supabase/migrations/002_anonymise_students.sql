-- ============================================================
-- Migration 002 — Anonymisation des élèves
-- Renomme fba_students.name → fba_students.code
-- RGPD : aucun prénom d'élève mineur ne doit être stocké
-- ============================================================

ALTER TABLE fba_students RENAME COLUMN name TO code;
