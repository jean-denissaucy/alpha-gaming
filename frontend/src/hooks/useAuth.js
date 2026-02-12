// hooks/useAuth.js - Hook personnalisé pour accéder au contexte d'authentification

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

// Hook qui permet d'utiliser le contexte d'authentification dans n'importe quel composant
export function useAuth() {
    const context = useContext(AuthContext);

    // Vérification que le hook est bien utilisé dans un AuthProvider
    if (!context) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }

    return context;
}

export default useAuth;

