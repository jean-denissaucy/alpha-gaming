import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFavoriteGames, buildFavoriteGamesPayload, resolveUserFavoriteGames } from '../utils/favorites.js';

test('resolveUserFavoriteGames grants all favorites to a new user and keeps personal selections afterward', () => {
    const allGames = [
        { game_name: 'DOOM: Dark Ages', category: 'Action' },
        { game_name: 'Portal 2', category: 'Puzzle' },
        { game_name: 'Minecraft', category: 'Aventure' }
    ];

    assert.deepEqual(resolveUserFavoriteGames([], allGames), allGames);
    assert.deepEqual(resolveUserFavoriteGames([
        { game_name: 'DOOM: Dark Ages', category: 'Action' }
    ], allGames), [
        { game_name: 'DOOM: Dark Ages', category: 'Action' }
    ]);
});

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
