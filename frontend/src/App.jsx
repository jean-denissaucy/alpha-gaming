// App.jsx - Point d'entrée principal de l'application

// Import des dépendances React Router pour la navigation
import { Routes, Route, Navigate } from 'react-router-dom';

// Import du hook d'authentification personnalisé
import { useAuth } from './hooks/useAuth.js';

// Import des layouts (structures de page)
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import BackgroundAnimation from './components/BackgroundAnimation.jsx';

// Import des composants de protection des routes
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// Import des pages de l'application
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import News from './pages/News.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Esport from './pages/Esport.jsx';
import Games from './pages/Games.jsx';
import Tests from './pages/Tests.jsx';
import Profile from './pages/Profile.jsx';

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
                    <Route path="/news" element={<News />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/esport" element={<Esport />} />
                    <Route path="/tests" element={<Tests />} />
                    <Route path="/a-propos" element={<About />} />

                    {/* Dashboard et profil protégés - nécessitent une authentification */}
                    <Route path="/dashboard" element={
                        <PrivateRoute><Dashboard /></PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute><Profile /></PrivateRoute>
                    } />
                    <Route path="/admin" element={
                        // Double protection : connexion requise PUIS rôle admin obligatoire.
                        // Un utilisateur standard est redirigé vers son dashboard.
                        <PrivateRoute>
                            <AdminRoute><AdminDashboard /></AdminRoute>
                        </PrivateRoute>
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