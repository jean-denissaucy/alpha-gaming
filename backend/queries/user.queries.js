import { query } from '../config/db.js';

export async function findUserByEmail(email) {
    const users = await query(
        `SELECT id, email, password, firstname, lastname, created_at
         FROM users
         WHERE email = ?
         LIMIT 1`,
        [String(email || '').trim().toLowerCase()]
    );

    return users[0] || null;
}

export async function findUserById(id) {
    const users = await query(
        `SELECT id, email, firstname, lastname, created_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [id]
    );

    return users[0] || null;
}

export async function findFavoriteGamesByUserId(userId) {
    const rows = await query(
        `SELECT fg.id, fg.categorie, fg.titre_jeu AS game_name, fg.lien AS link
         FROM user_favorite_games ufg
         JOIN favorite_games fg ON fg.id = ufg.game_id
         WHERE ufg.user_id = ?
         ORDER BY fg.categorie ASC, fg.titre_jeu ASC`,
        [userId]
    );

    return rows.map((row) => ({
        id: row.id,
        game_name: row.game_name,
        category: row.categorie,
        ...(row.link ? { link: row.link } : {})
    }));
}

export async function createUserRecord({ email, hashedPassword, firstname, lastname }) {
    const result = await query(
        `INSERT INTO users (email, password, firstname, lastname)
         VALUES (?, ?, ?, ?)`,
        [
            String(email || '').trim().toLowerCase(),
            hashedPassword,
            String(firstname || '').trim(),
            String(lastname || '').trim()
        ]
    );

    return {
        insertId: result.insertId,
        firstname: String(firstname || '').trim(),
        lastname: String(lastname || '').trim()
    };
}

export async function addFavoriteGameForUser(userId, gameId) {
    if (!userId || !gameId) return null;

    const result = await query(
        `INSERT INTO user_favorite_games (user_id, game_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), game_id = VALUES(game_id)`,
        [userId, gameId]
    );

    return result.insertId || null;
}

export async function removeFavoriteGameForUser(userId, gameId) {
    if (!userId || !gameId) return false;

    const result = await query(
        `DELETE FROM user_favorite_games
         WHERE user_id = ? AND game_id = ?`,
        [userId, gameId]
    );

    return (result.affectedRows || 0) > 0;
}