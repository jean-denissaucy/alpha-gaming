// services/api.js - Service pour les appels API

import { getApiCandidates } from './apiConfig.js';

// URL de base de l'API backend
const API_URLS = getApiCandidates(import.meta.env, window.location);

// Fonction générique pour effectuer des requêtes API
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };

    const fallbackResponse = {
        success: true,
        data: {
            message: 'Mode hors ligne activé'
        }
    };

    try {
        let lastError = null;

        for (const baseUrl of API_URLS) {
            try {
                const response = await fetch(`${baseUrl}${endpoint}`, {
                    ...options,
                    headers
                });

                let payload = null;
                const text = await response.text();

                if (text) {
                    try {
                        payload = JSON.parse(text);
                    } catch {
                        payload = { raw: text };
                    }
                }

                if (!response.ok) {
                    const message = payload?.error || payload?.message || 'Erreur serveur';
                    throw { status: response.status, message };
                }

                return payload;
            } catch (error) {
                lastError = error;
            }
        }

        if (lastError?.status) {
            throw lastError;
        }

        return fallbackResponse;
    } catch (error) {
        if (error?.status) {
            throw error;
        }

        return fallbackResponse;
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

export const testService = {

    // Recuperation des tests rapides depuis la base de donnees
    getLatest: (limit = 9) => fetchAPI(`/news/tests-rapides?limit=${limit}`)
};