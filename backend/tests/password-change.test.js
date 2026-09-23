import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordChange, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '../utils/validation.js';

test('validatePasswordChange accepts a valid password change', () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien-mot-de-passe',
        newPassword: 'nouveau-mot-de-passe'
    });

    assert.equal(result.isValid, true);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.values, { currentPassword: 'ancien-mot-de-passe', newPassword: 'nouveau-mot-de-passe' });
});

test('validatePasswordChange rejects a missing current password', () => {
    const result = validatePasswordChange({ newPassword: 'nouveau-mot-de-passe' });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('actuel est requis')));
});

test(`validatePasswordChange rejects a new password shorter than ${MIN_PASSWORD_LENGTH} characters`, () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien-mot-de-passe',
        newPassword: 'abc'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes(String(MIN_PASSWORD_LENGTH))));
});

test(`validatePasswordChange rejects a new password longer than ${MAX_PASSWORD_LENGTH} bytes (bcrypt limit)`, () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien-mot-de-passe',
        newPassword: 'a'.repeat(80)
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('72')));
});

test('validatePasswordChange rejects an identical new password', () => {
    const result = validatePasswordChange({
        currentPassword: 'mot-de-passe-commun',
        newPassword: 'mot-de-passe-commun'
    });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('différent')));
});

test('validatePasswordChange does not compare when the current password is missing', () => {
    // Sans mot de passe actuel, l'erreur « différent » ne doit pas masquer l'erreur « requis ».
    const result = validatePasswordChange({ currentPassword: '', newPassword: '' });

    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((message) => message.includes('actuel est requis')));
    assert.ok(result.errors.some((message) => message.includes('nouveau mot de passe est requis')));
    assert.ok(!result.errors.some((message) => message.includes('différent')));
});

test('validatePasswordChange handles null and non-object payloads without throwing', () => {
    const result = validatePasswordChange(null);

    assert.equal(result.isValid, false);
    assert.equal(result.errors.length, 2);
    assert.deepEqual(result.values, { currentPassword: '', newPassword: '' });
});

test('validatePasswordChange preserves spaces inside passwords (no trim)', () => {
    const result = validatePasswordChange({
        currentPassword: 'ancien avec espaces ',
        newPassword: ' nouveau avec espaces'
    });

    assert.equal(result.isValid, true);
    assert.equal(result.values.currentPassword, 'ancien avec espaces ');
    assert.equal(result.values.newPassword, ' nouveau avec espaces');
});
