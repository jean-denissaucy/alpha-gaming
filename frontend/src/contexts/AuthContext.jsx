// contexts/AuthContext.jsx - Contexte global pour gérer l'authentification

import { useState, useEffect } from 'react';
import { authService } from '../services/api.js';
import { AuthContext } from './auth-context.js';

// Provider qui enveloppe l'application et fournit l'état d'authentification
export function AuthProvider({ children }) {
    // Stocke les infos du profil utilisateur connecté.
    const [user, setUser] = useState(null);

    // Indique si la vérification initiale du token est en cours.
    const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));

    // Au démarrage, on tente de restaurer la session à partir du token local.
    useEffect(() => {
        let isMounted = true;

        // Récupération du token JWT depuis le localStorage.
        const token = localStorage.getItem('token');

        if (!token) {
            return () => {
                isMounted = false;
            };
        }

        // Si un token existe, récupération du profil utilisateur
        authService.getProfile()
            .then(data => {
                if (!isMounted) return;
                setUser(data?.user || data?.data?.user || null);
            })
            .catch(() => {
                if (!isMounted) return;
                localStorage.removeItem('token');
                setUser(null);
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Connexion utilisateur : enregistre le token et met à jour le profil courant.
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        const authData = {
            ...(data?.data || {}),
            ...(data?.user ? { user: data.user } : {}),
            ...(data?.token ? { token: data.token } : {})
        };
        if (!authData.token || !authData.user) {
            throw { status: 502, message: 'Réponse d’authentification invalide du serveur' };
        }
        localStorage.setItem('token', authData.token);
        setUser(authData.user);
        return authData;
    };

    // Inscription utilisateur : même logique que la connexion après création du compte.
    const register = async (userData) => {
        const data = await authService.register(userData);
        const authData = {
            ...(data?.data || {}),
            ...(data?.user ? { user: data.user } : {}),
            ...(data?.token ? { token: data.token } : {})
        };
        if (!authData.token || !authData.user) {
            throw { status: 502, message: 'Réponse d’authentification invalide du serveur' };
        }
        localStorage.setItem('token', authData.token);
        setUser(authData.user);
        return authData;
    };
    // Déconnexion : supprime le token local et remet l'utilisateur courant à null.
    const logout = () => {

        // Suppression du token.
        localStorage.removeItem('token');

        // Réinitialisation de l'état utilisateur.
        setUser(null);
    };
    // Fournit le contexte complet à tous les composants enfants.
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