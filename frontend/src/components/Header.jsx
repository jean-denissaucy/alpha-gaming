// components/Header.jsx - Barre de navigation principale

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Header() {

    // Récupération des infos utilisateur et fonction de déconnexion
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Gestion de la déconnexion avec redirection
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navClass = ({ isActive }) => (
        `rounded-full px-3 py-1 text-sm font-medium transition ${isActive ? 'bg-amber-200 text-slate-900' : 'text-slate-600 hover:bg-white'
        }`
    );

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-stone-50/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">

                {/* Logo / Titre de l'application */}
                <Link to="/" className="text-lg font-semibold text-slate-900">
                    Starter Kit
                </Link>

                {/* Navigation principale (cachée sur mobile) */}
                <nav className="hidden items-center gap-2 sm:flex">
                    <NavLink to="/" className={navClass}>Accueil</NavLink>
                    {isAuthenticated && (
                        <NavLink to="/dashboard" className={navClass}>Tableau de bord</NavLink>
                    )}
                </nav>

                {/* Section utilisateur / authentification */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <span className="hidden text-sm text-slate-600 sm:inline">
                                Bonjour <span className="font-semibold text-slate-900">{user?.firstname || 'Utilisateur'}</span>
                            </span>
                            <button onClick={handleLogout} className="btn btn-outline">
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                                Connexion
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Inscription
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;