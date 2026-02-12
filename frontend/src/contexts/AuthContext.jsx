// contexts/AuthContext.jsx - Contexte global pour gérer l'authentification

import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api.js';

// Création du contexte d'authentification
export const AuthContext = createContext(null);

// Provider qui enveloppe l'application et fournit l'état d'authentification
export function AuthProvider({ children }) {
    // État pour stocker les informations de l'utilisateur connecté
    const [user, setUser] = useState(null);

    // État pour gérer le chargement initial (vérification du token)
    const [loading, setLoading] = useState(true);

    // Vérification de l'authentification au chargement de l'application
    useEffect(() => {
        // Récupération du token JWT depuis le localStorage
        const token = localStorage.getItem('token');

        if (token) {
            // Si un token existe, récupération du profil utilisateur
            authService.getProfile()
                .then(data => setUser(data.user))
                .catch(() => localStorage.removeItem('token')) // Suppression du token invalide
                .finally(() => setLoading(false));
        } else {
            // Pas de token = pas d'authentification
            setLoading(false);
        }
    }, []);

    // Fonction de connexion
    const login = async (email, password) => {
        // Appel API pour se connecter
        const data = await authService.login(email, password);

        // Stockage du token JWT dans le localStorage
        localStorage.setItem('token', data.token);

        // Mise à jour de l'état utilisateur
        setUser(data.user);

        return data;
    };
    // Fonction d'inscription
    const register = async (userData) => {

        // Appel API pour créer un nouveau compte
        const data = await authService.register(userData);

        // Stockage du token JWT
        localStorage.setItem('token', data.token);

        // Mise à jour de l'état utilisateur
        setUser(data.user);

        return data;
    };
    // Fonction de déconnexion
    const logout = () => {

        // Suppression du token
        localStorage.removeItem('token');

        // Réinitialisation de l'état utilisateur
        setUser(null);
    };
    // Fourniture du contexte à tous les composants enfants
    return (
        <AuthContext.Provider value={{
            user,                      // Informations de l'utilisateur connecté
            loading,                   // État de chargement
            isAuthenticated: !!user,   // Booléen : l'utilisateur est-il connecté ?
            login,                     // Fonction de connexion
            register,                  // Fonction d'inscription
            logout                     // Fonction de déconnexion
        }}>
            {children}
        </AuthContext.Provider>
    );
}