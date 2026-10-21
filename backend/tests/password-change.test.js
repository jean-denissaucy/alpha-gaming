// Vérifie la validation des demandes de changement de mot de passe.
import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordChange, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../utils/validation.js';

// Un mot de passe actuel et un nouveau mot de passe valides doivent être acceptés.
test('validatePasswordChange accepts a valid password change', () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien-mot-de-passe',
        newPassword: 'nouveau-mot-de-passe'
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.values, { currentPassword: 'ancien-mot-de-passe', newPassword: 'nouveau-mot-de-passe' });
});

// Le mot de passe actuel est obligatoire pour autoriser le changement.
test('validatePasswordChange rejects a missing current password', () => {
    const result = validatePasswordChange({ newPassword: 'nouveau-mot-de-passe' });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('actuel est requis')));
});

// Le nouveau mot de passe doit respecter la longueur minimale configurée.
test(`validatePasswordChange rejects a new password shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien-mot-de-passe',
        newPassword: 'abc'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes(String(MIN_PASSWORD_LENGTH))));
});

// La longueur maximale est limitée par la contrainte de bcrypt à 72 octets.
test(`validatePasswordChange rejects a new password longer than ${MAX_PASSWORD_LENGTH} bytes (bcrypt limit)`, () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien-mot-de-passe',
        newPassword: 'a'.repeat(80)
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('72')));
});

// Le nouveau mot de passe doit être différent de l'ancien.
test('validatePasswordChange rejects an identical new password', () => {
    const result = validatePasswordChange({
        currentPassword: 'mot-de-passe-commun',
        newPassword: 'mot-de-passe-commun'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('différent')));
});

// La comparaison des mots de passe ne doit pas être effectuée si le mot de passe actuel manque.
test('validatePasswordChange does not compare when the current password is missing', () => {
    // Sans mot de passe actuel, l'erreur « différent » ne doit pas masquer l'erreur « requis ».
    const result = validatePasswordChange({ currentPassword: '', newPassword: '' });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('actuel est requis')));
    assert.ok(result.errors.some((message) => message.includes('nouveau mot de passe est requis')));
    assert.ok(!result.errors.some((message) => message.includes('différent')));
});

// Une charge utile nulle doit produire des erreurs de validation sans lever d'exception.
test('validatePasswordChange handles null and non-object payloads without throwing', () => {
    const result = validatePasswordChange(null);

    assert.equal(result.isValid, false);
    assert.equal(result.errors.length, 2);
    assert.deepEqual(result.values, { currentPassword: '', newPassword: '' });
});

// Les espaces internes ou placés volontairement dans les mots de passe sont conservés.
test('validatePasswordChange preserves spaces inside passwords (no trim)', () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien avec espaces ',
        newPassword: ' nouveau avec espaces'
    });

    assert.equal(result.isValid, true);
    assert.equal(result.values.currentPassword, 'ancien avec espaces ');
    assert.equal(result.values.newPassword, ' nouveau avec espaces');
});
