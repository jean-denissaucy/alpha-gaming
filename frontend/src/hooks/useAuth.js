// hooks/useAuth.js - Hook personnalisé pour accéder au contexte d'authentification

import { useContext } from 'react';
import { AuthContext } from '../contexts/auth-context.js';

// Expose simplement l'état d'authentification à tous les composants du front.
export function useAuth() {
    const context = useContext(AuthContext);

    // Sécurité : ce hook ne doit être utilisé que sous le AuthProvider du projet.
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }

    return context;
}

export default useAuth;

