// App.jsx - Point d'entrée principal de l'application

// Import des dépendances React Router pour la navigation
import { lazy, Suspense } from 'react';
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
import AccessibilityWidget from './components/AccessibilityWidget.jsx';

// Import des pages de l'application
const Home = lazy(() => import('./pages/Home.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const News = lazy(() => import('./pages/News.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const Esport = lazy(() => import('./pages/Esport.jsx'));
const Games = lazy(() => import('./pages/Games.jsx'));
const Tests = lazy(() => import('./pages/Tests.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

function App() {

    // Récupération de l'état de chargement depuis le contexte d'authentification
    const { loading } = useAuth();

    // Affichage d'un écran de chargement pendant la vérification de l'authentification
    // role=status : le message de chargement est annoncé aux lecteurs d'écran (RGAA 7.3)
    if (loading) return <div role="status"><p>Chargement...</p></div>;

    return (
        <>
            <BackgroundAnimation />
            {/* Bouton flottant « Accessibilité » : options RGAA activables par l'utilisateur */}
            <AccessibilityWidget />
            <Suspense fallback={<div role="status"><p>Chargement...</p></div>}>
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
            </Suspense>
        </>
    );
}
export default App;