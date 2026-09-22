// controllers/game.controller.js
import Game from '../models/game.model.js';

// Vérifie que categoryId est un entier positif valide (évite les erreurs de clé étrangère obscures en 500).
function isValidCategoryId(categoryId) {
    const parsed = Number(categoryId);
    return Number.isInteger(parsed) && parsed > 0;
}

const gameController = {
    // Récupère la liste complète des jeux avec leur catégorie pour le front office.
    async getAllGames(req, res) {
        try {
            const games = await Game.findAll();
            return res.status(200).json(games);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Récupère un jeu précis en fonction de son identifiant.
    async getGameById(req, res) {
        try {
            const { id } = req.params;
            const game = await Game.findById(id);

            if (!game) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }

            return res.status(200).json(game);
        } catch (error) {
            console.error('Erreur lors de la récupération du jeu:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Filtre les jeux selon la catégorie demandée.
    async getGamesByCategoryId(req, res) {
        try {
            const { categoryId } = req.params;
            const games = await Game.findByCategoryId(categoryId);

            return res.status(200).json(games);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux par catégorie:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Crée un jeu avec les données reçues dans le corps de la requête.
    async createGame(req, res) {
        try {
            const { categoryId, gameName, link, image } = req.body;

            // Validation minimale de sécurité
            if (!gameName || !String(gameName).trim()) {
                return res.status(400).json({ message: 'Le nom du jeu est obligatoire.' });
            }
            if (String(gameName).trim().length > 150) {
                return res.status(400).json({ message: 'Le nom du jeu ne doit pas dépasser 150 caractères.' });
            }
            if (!isValidCategoryId(categoryId)) {
                return res.status(400).json({ message: 'La catégorie du jeu est invalide.' });
            }

            const newGame = await Game.create({ categoryId: Number(categoryId), gameName, link, image });
            return res.status(201).json({
                message: 'Jeu créé avec succès.',
                game: newGame
            });
        } catch (error) {
            console.error('Erreur lors de la création du jeu:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Met à jour les informations d'un jeu existant.
    async updateGame(req, res) {
        try {
            const { id } = req.params;
            const { categoryId, gameName, link, image } = req.body;

            if (!gameName || !String(gameName).trim()) {
                return res.status(400).json({ message: 'Le nom du jeu est obligatoire.' });
            }
            if (String(gameName).trim().length > 150) {
                return res.status(400).json({ message: 'Le nom du jeu ne doit pas dépasser 150 caractères.' });
            }
            if (!isValidCategoryId(categoryId)) {
                return res.status(400).json({ message: 'La catégorie du jeu est invalide.' });
            }

            const isUpdated = await Game.update(id, { categoryId: Number(categoryId), gameName, link, image });

            if (!isUpdated) {
                return res.status(404).json({ message: 'Jeu non trouvé ou aucune modification apportée.' });
            }

            return res.status(200).json({ message: 'Jeu mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du jeu:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Supprime un jeu après vérification de son existence.
    async deleteGame(req, res) {
        try {
            const { id } = req.params;
            const isDeleted = await Game.delete(id);

            if (!isDeleted) {
                return res.status(404).json({ message: 'Jeu non trouvé.' });
            }

            return res.status(200).json({ message: 'Jeu supprimé avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la suppression du jeu:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    }
};

export default gameController;
