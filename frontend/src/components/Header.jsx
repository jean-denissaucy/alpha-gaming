// components/Header.jsx - Barre de navigation principale

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Newspaper, Gamepad2, ClipboardCheck, Trophy, User, Shield, LogIn, LogOut, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import BrandLogo from './BrandLogo.jsx';

function Header() {

    // Récupération des infos utilisateur et fonction de déconnexion
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    // Gestion de la déconnexion avec redirection
    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate('/login');
    };

    const navigateTo = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    // Lien actif : reprend la couleur et le padding du bouton Inscription (.btn .btn-primary).
    const navClass = ({ isActive }) => (
        isActive
            ? 'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-sky-700 to-cyan-400 px-[1.2rem] py-[0.6rem] text-sm font-bold tracking-wide text-cyan-50 shadow-[0_10px_25px_-14px_rgba(34,211,238,0.7)]'
            : 'inline-flex items-center gap-1.5 rounded-full px-[1.2rem] py-[0.6rem] text-sm font-semibold tracking-wide text-slate-300 transition hover:bg-white/10 hover:text-white'
    );

    const userLabel = user?.firstname || user?.name || 'Utilisateur';

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
                    <NavLink to="/" className={navClass}><Home className="h-4 w-4" /> Accueil</NavLink>
                    <NavLink to="/news" className={navClass}><Newspaper className="h-4 w-4" /> Actualités</NavLink>
                    <NavLink to="/games" className={navClass}><Gamepad2 className="h-4 w-4" /> Jeux</NavLink>
                    <NavLink to="/tests" className={navClass}><ClipboardCheck className="h-4 w-4" /> Test</NavLink>
                    <NavLink to="/esport" className={navClass}><Trophy className="h-4 w-4" /> Esport</NavLink>
                </nav>

                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 py-2 pl-4 pr-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-cyan-400 text-xs font-bold text-white">
                                    {(user?.firstname || user?.name || 'U').charAt(0).toUpperCase()}
                                </span>
                                <span className="max-w-[9rem] truncate">{userLabel}</span>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${menuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl">
                                        <button
                                            type="button"
                                            onClick={() => navigateTo('/profile')}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
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
                        <>
                            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white">
                                <LogIn className="h-4 w-4" /> Connexion
                            </Link>
                            <Link to="/register" className="btn btn-primary inline-flex items-center gap-2">
                                <UserPlus className="h-4 w-4" /> Inscription
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;