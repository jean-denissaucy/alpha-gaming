// models/user.model.js
import bcrypt from 'bcrypt';
import { query } from '../config/db.js';

const User = {
    // Trouver par email
    async findByEmail(email) {
        const users = await query(
            `SELECT id, email, password, firstname, lastname, role, created_at
                FROM users
                WHERE email = ?
                LIMIT 1`,
            [String(email || '').trim().toLowerCase()]
        );

        return users[0] || null;
    },
    // Trouver par ID (sans le password)
    async findById(id) {
        const users = await query(
            `SELECT id, email, firstname, lastname, role, created_at
         FROM users
         WHERE id = ?
         LIMIT 1`,
            [id]
        );

        return users[0] || null;
    },
    async findAllForAdmin() {
        return query(`SELECT id, email, firstname, lastname, role, created_at FROM users ORDER BY created_at DESC`);
    },
    async updateById(id, { email, firstname, lastname, role }) {
        const result = await query(
            `UPDATE users SET email = ?, firstname = ?, lastname = ?, role = ? WHERE id = ?`,
            [String(email).trim().toLowerCase(), String(firstname).trim(), String(lastname).trim(), role === 'admin' ? 'admin' : 'user', id]
        );
        return result.affectedRows > 0;
    },
    async deleteById(id) {
        const result = await query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    async findFavoriteGamesByUserId(userId) {
        const rows = await query(
            `SELECT g.id, g.categorie_id, g.titre_jeu AS game_name, g.lien, c.name AS category_name
                 FROM user_favorite_games ufg
                 JOIN games g ON g.id = ufg.game_id
                 LEFT JOIN categories c ON c.id = g.categorie_id
                 WHERE ufg.user_id = ?
                 ORDER BY c.name ASC, g.titre_jeu ASC`,
            [userId]
        );

        return rows.map((row) => ({
            id: row.id,
            game_name: row.game_name,
            categorie_id: row.categorie_id,
            categorie_id: row.categorie_id,
            category: row.category_name || `Catégorie ${row.categorie_id}`,
            ...(row.link ? { link: row.link } : {})
        }));
    },
    async findAllFavoriteGames() {
        const rows = await query(
            `SELECT games.id, games.categorie_id, games.titre_jeu AS game_name, c.name AS category_name, games.lien AS link
            FROM games
            LEFT JOIN categories c ON c.id = games.categorie_id
            ORDER BY c.name ASC, games.titre_jeu ASC`
        );

        return rows.map((row) => ({
            id: row.id,
            game_name: row.game_name,
            categorie_id: row.categorie_id,
            categorie_id: row.categorie_id,
            category: row.category_name || `Catégorie ${row.categorie_id}`,
            ...(row.link ? { link: row.link } : {})
        }));
    },
    async addFavoriteGame(userId, gameId) {
        if (!userId || !gameId) return null;

        const result = await query(
            `INSERT INTO user_favorite_games (user_id, game_id)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), game_id = VALUES(game_id)`,
            [userId, gameId]
        );

        return result.insertId || null;

    },
    async removeFavoriteGame(userId, gameId) {
        if (!userId || !gameId) return false;

        const result = await query(
            `DELETE FROM user_favorite_games
            WHERE user_id = ? AND game_id = ?`,
            [userId, gameId]
        );

        return (result.affectedRows || 0) > 0;
    },
    // Créer un utilisateur
    async create({ email, password, firstname, lastname }) {
        const hashedPassword = await bcrypt.hash(password, 10);

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
            id: result.insertId,
            email: String(email || '').trim().toLowerCase(),
            firstname: String(firstname || '').trim(),
            lastname: String(lastname || '').trim()
        };

    },
    // Vérifier le mot de passe
    async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
export default User;