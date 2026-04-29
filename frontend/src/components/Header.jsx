// components/Header.jsx - Barre de navigation principale

import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import BrandLogo from './BrandLogo.jsx';

function Header() {

    // Récupération des infos utilisateur et fonction de déconnexion
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Gestion de la déconnexion avec redirection
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navClass = ({ isActive }) => (
        `rounded-full px-3 py-1 text-sm font-semibold tracking-wide transition ${isActive ? 'bg-cyan-400/20 text-cyan-200' : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
    );

    const userLabel = user?.firstname || user?.name || 'Utilisateur';

    const handleSectionNavigation = (sectionId) => {
        if (location.pathname !== '/') {
            navigate(`/#${sectionId}`);
            return;
        }

        const target = document.getElementById(sectionId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.history.replaceState(null, '', `#${sectionId}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-black/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                    <Link className="flex items-center gap-3 text-lg font-bold uppercase tracking-[0.18em] text-white" to="/">
                        <BrandLogo variant="compact" className="h-11 w-11 drop-shadow-[0_0_18px_rgba(0,167,255,0.45)]" />
                        <span>Alpha-Gaming</span>
                    </Link>
                </div>

                <nav className="hidden items-center gap-2 sm:flex">
                    <NavLink to="/" className={navClass}>Accueil</NavLink>
                    <a
                        href="/presentation.html"
                        className="rounded-full px-3 py-1 text-sm font-semibold tracking-wide text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        Presentation
                    </a>
                    <button
                        type="button"
                        onClick={() => handleSectionNavigation('top-news')}
                        className="rounded-full px-3 py-1 text-sm font-semibold tracking-wide text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        Articles
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSectionNavigation('esport')}
                        className="rounded-full px-3 py-1 text-sm font-semibold tracking-wide text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                        Esport
                    </button>
                    {isAuthenticated && (
                        <NavLink to="/dashboard" className={navClass}>Tableau de bord</NavLink>
                    )}
                </nav>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <>
                            <span className="hidden text-sm text-slate-400 sm:inline">
                                Bonjour <span className="font-semibold text-white">{userLabel}</span>
                            </span>
                            <button onClick={handleLogout} className="btn btn-outline">
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white">
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