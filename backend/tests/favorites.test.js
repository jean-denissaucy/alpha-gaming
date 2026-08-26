import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFavoriteGames, buildFavoriteGamesPayload } from '../utils/favorites.js';

test('normalizeFavoriteGames keeps unique items and trims unsafe values', () => {
    const normalized = normalizeFavoriteGames([
        { game_name: '  DOOM: Dark Ages  ', category: ' Action ' },
        { game_name: 'DOOM: Dark Ages', category: 'Action' },
        { game_name: 'Portal 2', category: 'Puzzle' },
        { game_name: '', category: 'Other' }
    ]);

    assert.deepEqual(normalized, [
        { game_name: 'DOOM: Dark Ages', category: 'Action' },
        { game_name: 'Portal 2', category: 'Puzzle' }
    ]);
});

test('buildFavoriteGamesPayload serializes user favorites in a stable shape', () => {
    const payload = buildFavoriteGamesPayload([
        { game_name: 'DOOM: Dark Ages', category: 'Action' },
        { game_name: 'Portal 2', category: 'Puzzle' }
    ]);

    assert.deepEqual(payload, [
        { game_name: 'DOOM: Dark Ages', category: 'Action' },
        { game_name: 'Portal 2', category: 'Puzzle' }
    ]);
});
