// Vérifie la sécurisation de la limite utilisée pour paginer les actualités.
import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeLimit } from '../controllers/news.controller.js';

// Les entiers positifs valides, y compris ceux fournis comme chaînes, sont conservés.
test('sanitizeLimit keeps a valid positive integer', () => {
    assert.equal(sanitizeLimit(20, 9, 50), 20);
    assert.equal(sanitizeLimit('20', 9, 50), 20);
    assert.equal(sanitizeLimit('1', 9, 50), 1);
});

// Les valeurs supérieures au maximum autorisé sont plafonnées.
test('sanitizeLimit clamps to the maximum allowed value', () => {
    assert.equal(sanitizeLimit(9999, 9, 50), 50);
    assert.equal(sanitizeLimit('9999', 9, 50), 50);
});

// Les valeurs invalides, nulles ou négatives utilisent la valeur de repli.
test('sanitizeLimit falls back on non-numeric, zero and negative values', () => {
    assert.equal(sanitizeLimit('abc', 9, 50), 9);
    assert.equal(sanitizeLimit('0', 9, 50), 9);
    assert.equal(sanitizeLimit('-5', 9, 50), 9);
    // Strict : une décimale n'est pas un entier valide -> fallback (pas de troncature silencieuse).
    assert.equal(sanitizeLimit('20.9', 9, 50), 9);
    assert.equal(sanitizeLimit(undefined, 9, 50), 9);
    assert.equal(sanitizeLimit(null, 9, 50), 9);
    assert.equal(sanitizeLimit('1; DROP TABLE news', 9, 50), 9);
});
