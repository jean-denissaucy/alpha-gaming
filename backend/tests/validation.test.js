// Vérifie la validation et la normalisation des données d'inscription.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration, MIN_PASSWORD_LENGTH } from '../utils/validation.js';

// Une inscription complète et correctement formatée doit être acceptée.
test('validateRegistration accepts a valid registration payload', () => {
    const result = validateRegistration({
        email: '  Jane.Doe@Example.com  ',
        password: 'mot-de-passe-solide',
        firstname: '  Jane  ',
        lastname: '  Doe  '
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, []);
    assert.equal(result.values.email, 'jane.doe@example.com');
    assert.equal(result.values.firstname, 'Jane');
    assert.equal(result.values.lastname, 'Doe');
    assert.equal(result.values.password, 'mot-de-passe-solide');
});

// Le mot de passe doit respecter la longueur minimale requise.
test('validateRegistration rejects a password shorter than the minimum length', () => {
    const result = validateRegistration({
        email: 'jane@example.com',
        password: 'abc',
        firstname: 'Jane',
        lastname: 'Doe'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes(String(MIN_PASSWORD_LENGTH))));
});

// L'adresse électronique doit respecter le format attendu.
test('validateRegistration rejects an invalid email format', () => {
    const result = validateRegistration({
        email: 'not-an-email',
        password: 'mot-de-passe-solide',
        firstname: 'Jane',
        lastname: 'Doe'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.toLowerCase().includes('email')));
});

// La limite de bcrypt empêche les mots de passe de dépasser 72 octets.
test('validateRegistration rejects a password longer than 72 bytes (bcrypt limit)', () => {
    const result = validateRegistration({
        email: 'jane@example.com',
        password: 'a'.repeat(80),
        firstname: 'Jane',
        lastname: 'Doe'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('72')));
});

// Le prénom et le nom sont obligatoires et ne doivent pas dépasser la taille maximale.
test('validateRegistration rejects missing or oversized names', () => {
    const missing = validateRegistration({
        email: 'jane@example.com',
        password: 'mot-de-passe-solide',
        firstname: '',
        lastname: 'Doe'
    });
    assert.equal(missing.isValid, false);
    assert.ok(missing.errors.some((message) => message.includes('prénom')));

    const oversized = validateRegistration({
        email: 'jane@example.com',
        password: 'mot-de-passe-solide',
        firstname: 'a'.repeat(101),
        lastname: 'Doe'
    });
    assert.equal(oversized.isValid, false);
    assert.ok(oversized.errors.some((message) => message.includes('100')));
});

// Une charge utile nulle doit être rejetée proprement avec toutes les erreurs attendues.
test('validateRegistration handles null and non-object payloads without throwing', () => {
    const result = validateRegistration(null);

    assert.equal(result.isValid, false);
    assert.equal(result.errors.length, 4);
    assert.deepEqual(result.values, { email: '', password: '', firstname: '', lastname: '' });
});
