// controllers/game.controller.js
import Game from '../models/game.model.js';

const gameController = {
    // Récupérer tous les jeux
    async getAllGames(req, res) {
        try {
            const games = await Game.findAll();
            return res.status(200).json(games);
        } catch (error) {
            console.error('Erreur lors de la récupération des jeux:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Récupérer un jeu par son ID
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

    // Récupérer les jeux d'une catégorie
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

    // Créer un nouveau jeu
    async createGame(req, res) {
        try {
            const { categoryId, gameName, link, image } = req.body;

            // Validation minimale de sécurité
            if (!gameName) {
                return res.status(400).json({ message: 'Le nom du jeu est obligatoire.' });
            }

            const newGame = await Game.create({ categoryId, gameName, link, image });
            return res.status(201).json({
                message: 'Jeu créé avec succès.',
                game: newGame
            });
        } catch (error) {
            console.error('Erreur lors de la création du jeu:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Modifier un jeu existant
    async updateGame(req, res) {
        try {
            const { id } = req.params;
            const { categoryId, gameName, link, image } = req.body;

            if (!gameName) {
                return res.status(400).json({ message: 'Le nom du jeu est obligatoire.' });
            }

            const isUpdated = await Game.update(id, { categoryId, gameName, link, image });

            if (!isUpdated) {
                return res.status(404).json({ message: 'Jeu non trouvé ou aucune modification apportée.' });
            }

            return res.status(200).json({ message: 'Jeu mis à jour avec succès.' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du jeu:', error);
            return res.status(500).json({ message: 'Une erreur interne est survenue.' });
        }
    },

    // Supprimer un jeu
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
