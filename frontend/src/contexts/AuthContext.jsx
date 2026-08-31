// contexts/AuthContext.jsx - Contexte global pour gérer l'authentification

import { useState, useEffect } from 'react';
import { authService } from '../services/api.js';
import { AuthContext } from './auth-context.js';

// Provider qui enveloppe l'application et fournit l'état d'authentification
export function AuthProvider({ children }) {
    // État pour stocker les informations de l'utilisateur connecté
    const [user, setUser] = useState(null);

    // État pour gérer le chargement initial (vérification du token)
    const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));

    // Vérification de l'authentification au chargement de l'application
    useEffect(() => {
        let isMounted = true;

        // Récupération du token JWT depuis le localStorage
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

    // Fonction de connexion
    const login = async (email, password) => {
        const data = await authService.login(email, password);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        localStorage.setItem('token', data.token);
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