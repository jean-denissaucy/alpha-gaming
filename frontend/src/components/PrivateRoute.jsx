// components/PrivateRoute.jsx - Composant de protection des routes privées

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Composant qui protège les routes nécessitant une authentification
function PrivateRoute({ children }) {

    // Récupération de l'état d'authentification
    const { isAuthenticated, loading } = useAuth();

    // Récupération de la localisation actuelle pour redirection après login
    const location = useLocation();

    // Affichage d'un loader pendant la vérification de l'authentification
    if (loading) {
        return <div><p>Chargement...</p></div>;
    }

    // Si non authentifié, redirection vers la page de login
    // On sauvegarde la page demandée pour y rediriger après connexion
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si authentifié, affichage du contenu protégé
    return children;
}
export default PrivateRoute;