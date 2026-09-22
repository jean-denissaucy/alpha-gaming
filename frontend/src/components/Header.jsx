// components/Header.jsx - Barre de navigation principale

import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Newspaper, Gamepad2, ClipboardCheck, Trophy, User, Shield, LogIn, LogOut, UserPlus, ChevronDown, Menu, X, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import BrandLogo from './BrandLogo.jsx';

// Définition des liens principaux du menu de navigation du site.
const NAV_ITEMS = [
    { to: '/', label: 'Accueil', Icon: Home },
    { to: '/news', label: 'Actualités', Icon: Newspaper },
    { to: '/games', label: 'Jeux', Icon: Gamepad2 },
    { to: '/tests', label: 'Test', Icon: ClipboardCheck },
    { to: '/esport', label: 'Esport', Icon: Trophy },
    { to: '/a-propos', label: 'À propos', Icon: Info }
];

function Header() {

    // Récupération des infos utilisateur et fonction de déconnexion
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('mobile-menu-open', mobileMenuOpen);
        return () => document.body.classList.remove('mobile-menu-open');
    }, [mobileMenuOpen]);

    // Gestion de la déconnexion avec redirection vers la page de login.
    const handleLogout = () => {
        setMenuOpen(false);
        setMobileMenuOpen(false);
        logout();
        navigate('/login');
    };

    const navigateTo = (path) => {
        setMenuOpen(false);
        setMobileMenuOpen(false);
        navigate(path);
    };

    // Style différent pour le lien actif pour indiquer clairement la page courante.
    const navClass = ({ isActive }) => (
        isActive
            ? 'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-sky-700 to-cyan-400 px-[1.2rem] py-[0.6rem] text-sm font-bold tracking-wide text-cyan-50 shadow-[0_10px_25px_-14px_rgba(34,211,238,0.7)]'
            : 'inline-flex items-center gap-1.5 rounded-full px-[1.2rem] py-[0.6rem] text-sm font-semibold tracking-wide text-slate-300 transition hover:bg-white/10 hover:text-white'
    );

    const userLabel = user?.firstname || user?.name || 'Utilisateur';
    const userInitial = (user?.firstname || user?.name || 'U').charAt(0).toUpperCase();
    const mobileNavClass = ({ isActive }) => isActive ? 'mobile-nav-link mobile-nav-link-active' : 'mobile-nav-link';

    return (
        <header className="site-header sticky top-0 z-40 border-b border-cyan-400/20 bg-black/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                    <Link className="min-w-0 flex items-center gap-3 text-lg font-bold uppercase tracking-[0.18em] text-white" to="/" onClick={() => setMobileMenuOpen(false)}>
                        <BrandLogo variant="compact" className="h-11 w-11 shrink-0 drop-shadow-[0_0_18px_rgba(0,167,255,0.45)]" />
                        <span className="header-brand-name truncate">Alpha-Gaming</span>
                    </Link>
                </div>

                <nav className="hidden items-center gap-2 lg:flex" aria-label="Navigation principale">
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.to} to={item.to} className={navClass} end={item.to === '/'}>
                            <item.Icon className="h-4 w-4" /> {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="relative hidden lg:block">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-expanded={menuOpen}
                                aria-haspopup="menu"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 py-2 pl-4 pr-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-cyan-400 text-xs font-bold text-white">
                                    {userInitial}
                                </span>
                                <span className="max-w-[9rem] truncate">{userLabel}</span>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {menuOpen && (
                                <>
                                    <button type="button" aria-label="Fermer le menu profil" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl" role="menu">
                                        <button
                                            type="button"
                                            onClick={() => navigateTo('/profile')}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                                            role="menuitem"
                                        >
                                            <User className="h-4 w-4 text-cyan-300" /> Mon profil
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button
                                                type="button"
                                                onClick={() => navigateTo('/admin')}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                                            >
                                                <Shield className="h-4 w-4 text-cyan-300" /> Administration
                                            </button>
                                        )}
                                        <div className="my-1.5 h-px bg-slate-800" />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                                        >
                                            <LogOut className="h-4 w-4" /> Déconnexion
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="hidden items-center gap-3 lg:flex">
                            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white">
                                <LogIn className="h-4 w-4" /> Connexion
                            </Link>
                            <Link to="/register" className="btn btn-primary inline-flex items-center gap-2">
                                <UserPlus className="h-4 w-4" /> Inscription
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        className="mobile-menu-toggle inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/10 lg:hidden"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-navigation"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div id="mobile-navigation" className="mobile-navigation lg:hidden" aria-label="Navigation mobile">
                    <nav className="mobile-nav-list">
                        {NAV_ITEMS.map((item) => (
                            <NavLink key={item.to} to={item.to} className={mobileNavClass} end={item.to === '/'} onClick={() => setMobileMenuOpen(false)}>
                                <item.Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mobile-navigation-divider" />
                    {isAuthenticated ? (
                        <div className="mobile-account-actions">
                            <button type="button" onClick={() => navigateTo('/profile')} className="mobile-nav-link"><User className="h-5 w-5" /><span>Mon profil</span></button>
                            {user?.role === 'admin' && <button type="button" onClick={() => navigateTo('/admin')} className="mobile-nav-link"><Shield className="h-5 w-5" /><span>Administration</span></button>}
                            <button type="button" onClick={handleLogout} className="mobile-nav-link mobile-nav-link-danger"><LogOut className="h-5 w-5" /><span>Déconnexion</span></button>
                        </div>
                    ) : (
                        <div className="mobile-account-actions">
                            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}><LogIn className="h-5 w-5" /><span>Connexion</span></Link>
                            <Link to="/register" className="mobile-nav-link mobile-nav-link-primary" onClick={() => setMobileMenuOpen(false)}><UserPlus className="h-5 w-5" /><span>Inscription</span></Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

export default Header;