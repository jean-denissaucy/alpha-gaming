// App.jsx - Point d'entrée principal de l'application

// Import des dépendances React Router pour la navigation
import { Routes, Route, Navigate } from 'react-router-dom';

// Import du hook d'authentification personnalisé
import { useAuth } from './hooks/useAuth.js';

// Import des layouts (structures de page)
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import BackgroundAnimation from './components/BackgroundAnimation.jsx';

// Import du composant de protection des routes
import PrivateRoute from './components/PrivateRoute.jsx';

// Import des pages de l'application
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Esport from './pages/Esport.jsx';
import Presentation from './pages/Presentation.jsx';

function App() {

    // Récupération de l'état de chargement depuis le contexte d'authentification
    const { loading } = useAuth();

    // Affichage d'un écran de chargement pendant la vérification de l'authentification
    if (loading) return <div><p>Chargement...</p></div>;

    return (
        <>
            <BackgroundAnimation />
            <Routes>
                {/* Routes publiques avec Header + Footer */}
                <Route element={<MainLayout />}>

                    {/* Page d'accueil accessible à tous */}
                    <Route path="/" element={<Home />} />
                    <Route path="/esport" element={<Esport />} />
                    <Route path="/presentation" element={<Presentation />} />

                    {/* Dashboard protégé - nécessite une authentification */}
                    <Route path="/dashboard" element={
                        <PrivateRoute><Dashboard /></PrivateRoute>
                    } />
                    <Route path="/admin" element={
                        <PrivateRoute><AdminDashboard /></PrivateRoute>
                    } />
                </Route>

                {/* Routes d'authentification avec Header + Footer */}
                <Route element={<AuthLayout />}>

                    {/* Page de connexion */}
                    <Route path="/login" element={<Login />} />

                    {/* Page d'inscription */}
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Redirection de toutes les routes inconnues vers l'accueil */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}
export default App;