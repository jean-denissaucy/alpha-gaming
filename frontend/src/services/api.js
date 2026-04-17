// services/api.js - Service pour les appels API

// URL de base de l'API backend
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Fonction générique pour effectuer des requêtes API
async function fetchAPI(endpoint, options = {}) {

    // Récupération du token JWT depuis le localStorage
    const token = localStorage.getItem('token');

    // Configuration des en-têtes avec le token si présent
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
    try {
        // Exécution de la requête HTTP
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Parsing de la réponse JSON
        const data = await response.json();

        // Gestion des erreurs HTTP
        if (!response.ok) {
            throw { status: response.status, message: data.error || 'Erreur' };
        }

        return data;
    } catch (error) {
        // Gestion des erreurs réseau (serveur inaccessible)
        if (!error.status) {
            throw { status: 0, message: 'Serveur inaccessible' };
        }
        throw error;
    }
}

// Service d'authentification avec toutes les méthodes nécessaires
export const authService = {

    // Inscription d'un nouvel utilisateur
    register: (userData) => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    // Connexion d'un utilisateur existant
    login: (email, password) => fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }),

    // Récupération du profil utilisateur (endpoint protégé)
    getProfile: () => fetchAPI('/auth/me')
};

export const newsService = {

    // Récupération des news gaming actuelles
    getLatest: (limit = 9) => fetchAPI(`/news?limit=${limit}`)
};

export const esportService = {

    // Recuperation des matchs/esports recents
    getLatest: (limit = 10) => fetchAPI(`/news/esport?limit=${limit}`)
};