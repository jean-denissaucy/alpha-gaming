// models/game.model.js
import { query } from '../config/db.js';

const Game = {
    // Trouver tous les jeux (avec le nom de leur catégorie)
    async findAll() {
        const rows = await query(
            `SELECT g.id, g.categorie_id, g.titre_jeu AS game_name, g.lien AS link, c.name AS category_name
             FROM games g
             LEFT JOIN categories c ON c.id = g.categorie_id
             ORDER BY c.name ASC, g.titre_jeu ASC`
        );        return rows.map((row) => ({
            id: row.id,
            game_name: row.game_name,
            categorie_id: row.categorie_id,
            category: row.category_name || `Catégorie ${row.categorie_id}`,
            ...(row.link ? { link: row.link } : {})
        }));
    },

    // Trouver un jeu par son ID
    async findById(id) {
        const games = await query(
            `SELECT id, categorie_id, titre_jeu AS game_name, lien AS link
             FROM games
             WHERE id = ?
             LIMIT 1`,
            [id]
        );

        if (!games[0]) return null;

        return {
            id: games[0].id,
            game_name: games[0].game_name,
            categorie_id: games[0].categorie_id,
            ...(games[0].link ? { link: games[0].link } : {})
        };
    },

    // Trouver les jeux appartenant à une catégorie spécifique
    async findByCategoryId(categoryId) {
        const rows = await query(
            `SELECT g.id, g.categorie_id, g.titre_jeu AS game_name, g.lien AS link, c.name AS category_name
             FROM games g
             LEFT JOIN categories c ON c.id = g.categorie_id
             WHERE g.categorie_id = ?
             ORDER BY g.titre_jeu ASC`,
            [categoryId]
        );        return rows.map((row) => ({
            id: row.id,
            game_name: row.game_name,
            categorie_id: row.categorie_id,
            category: row.category_name || `Catégorie ${row.categorie_id}`,
            ...(row.link ? { link: row.link } : {})
        }));
    },

    // Créer un nouveau jeu
    async create({ categoryId, gameName, link }) {
        const result = await query(
            `INSERT INTO games (categorie_id, titre_jeu, lien)
             VALUES (?, ?, ?)`,
            [
                categoryId || null,
                String(gameName || '').trim(),
                link ? String(link).trim() : null
            ]
        );

        return {
            id: result.insertId,
            categorie_id: categoryId,
            game_name: gameName,
            link: link || null
        };
    },

    // Mettre à jour un jeu
    async update(id, { categoryId, gameName, link }) {
        if (!id) return false;

        const result = await query(
            `UPDATE games
             SET categorie_id = ?, titre_jeu = ?, lien = ?
             WHERE id = ?`,
            [
                categoryId || null,
                String(gameName || '').trim(),
                link ? String(link).trim() : null,
                id
            ]
        );

        return (result.affectedRows || 0) > 0;
    },

    // Supprimer un jeu
    async delete(id) {
        if (!id) return false;

        const result = await query(
            `DELETE FROM games
             WHERE id = ?`,
            [id]
        );

        return (result.affectedRows || 0) > 0;
    }
};

export default Game;
