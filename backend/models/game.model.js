// models/game.model.js
import { query } from '../config/db.js';

// Normalise l'année de sortie reçue : null si absente, sinon entier plausible (1970–2100).
function normalizeReleaseYear(releaseYear) {
    if (releaseYear === null || releaseYear === undefined || releaseYear === '') return null;
    const parsed = Number(releaseYear);
    if (!Number.isInteger(parsed) || parsed < 1970 || parsed > 2100) return null;
    return parsed;
}

// Normalise la note reçue (admin/seed) : null si absente, sinon nombre entre 0 et 20.
// DECIMAL MySQL renvoie une string : conversion systématique en Number pour le frontend.
function normalizeNote(note) {
    if (note === null || note === undefined || note === '') return null;
    const parsed = Number(note);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 20) return null;
    return parsed;
}

// Transforme une ligne SQL en objet jeu homogène pour le frontend.
function mapGameRow(row) {
    return {
        id: row.id,
        game_name: row.game_name,
        categorie_id: row.categorie_id,
        image: row.image ? String(row.image).trim() : null,
        category: row.category_name || `Catégorie ${row.categorie_id}`,
        note: row.note === null || row.note === undefined ? null : Number(row.note),
        release_year: row.release_year === null || row.release_year === undefined ? null : Number(row.release_year),
        ...(row.link ? { link: row.link } : {})
    };
}

const Game = {

    // Récupère tous les jeux avec leur catégorie pour alimenter les pages de consultation.
    async findAll() {
        const rows = await query(
            `SELECT g.id, g.categorie_id, g.titre_jeu AS game_name, g.lien AS link, g.image, g.note, g.release_year, c.name AS category_name
             FROM games g
             LEFT JOIN categories c ON c.id = g.categorie_id
             ORDER BY c.name ASC, g.titre_jeu ASC`
        );
        return rows.map(mapGameRow);
    },

    // Récupère un jeu précis à partir de son identifiant.
    async findById(id) {
        const games = await query(
            `SELECT id, categorie_id, titre_jeu AS game_name, lien AS link, image, note, release_year
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
            image: games[0].image || null,
            note: games[0].note === null || games[0].note === undefined ? null : Number(games[0].note),
            release_year: games[0].release_year === null || games[0].release_year === undefined ? null : Number(games[0].release_year),
            ...(games[0].link ? { link: games[0].link } : {})
        };
    },

    // Renvoie les jeux associés à une catégorie donnée pour les filtres de navigation.
    async findByCategoryId(categoryId) {
        const rows = await query(
            `SELECT g.id, g.categorie_id, g.titre_jeu AS game_name, g.lien AS link, g.image, g.note, g.release_year, c.name AS category_name
             FROM games g
             LEFT JOIN categories c ON c.id = g.categorie_id
             WHERE g.categorie_id = ?
             ORDER BY g.titre_jeu ASC`,
            [categoryId]
        );
        return rows.map(mapGameRow);
    },

    // Insère un nouveau jeu dans la table games après nettoyage des valeurs reçues.
    async create({ categoryId, gameName, link, image, note, releaseYear }) {
        const result = await query(
            `INSERT INTO games (categorie_id, titre_jeu, lien, image, note, release_year)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                categoryId || null,
                String(gameName || '').trim(),
                link ? String(link).trim() : null,
                image ? String(image).trim() : null,
                normalizeNote(note),
                normalizeReleaseYear(releaseYear)
            ]
        );
r
        return {
            id: result.insertId,
            categorie_id: categoryId,
            game_name: gameName,
            link: link || null,
            image: image || null,
            note: normalizeNote(note),
            release_year: normalizeReleaseYear(releaseYear)
        };
    },

    // Met à jour les informations d'un jeu existant en base.
    async update(id, { categoryId, gameName, link, image, note, releaseYear }) {
        if (!id) return false;

        const result = await query(
            `UPDATE games
             SET categorie_id = ?, titre_jeu = ?, lien = ?, image = ?, note = ?, release_year = ?
             WHERE id = ?`,
            [
                categoryId || null,
                String(gameName || '').trim(),
                link ? String(link).trim() : null,
                image ? String(image).trim() : null,
                normalizeNote(note),
                normalizeReleaseYear(releaseYear),
                id
            ]
        );

        return (result.affectedRows || 0) > 0;
    },

    // Supprime un jeu en fonction de son identifiant.
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
