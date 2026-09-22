// components/AdminRoute.jsx - Protection des routes réservées aux administrateurs

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Composant qui protège les pages accessibles uniquement au rôle "admin".
// À utiliser TOUJOURS en plus de PrivateRoute : la vraie sécurité reste le backend,
// ce composant évite juste d'afficher l'interface admin à un utilisateur standard.
function AdminRoute({ children }) {

    // Récupération de l'état d'authentification
    const { user, isAuthenticated, loading } = useAuth();

    // Récupération de la localisation actuelle pour redirection après login
    const location = useLocation();

    // Pendant la vérification du token, on ne décide rien encore
    if (loading) {
        return <div><p>Chargement...</p></div>;
    }

    // Sécurité double : il faut être connecté ET avoir le rôle admin
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Utilisateur connecté mais non admin : redirection vers son dashboard
    // (le backend renverrait de toute façon un 403 sur chaque appel admin)
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    // Administrateur authentifié : affichage du contenu protégé
    return children;
}
export default AdminRoute;
