// components/Header.jsx - Barre de navigation principale

import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Newspaper, Gamepad2, ClipboardCheck, Trophy, User, Shield, LogIn, LogOut, UserPlus, ChevronDown, Menu, X, Info, Languages } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useLang } from '../hooks/useLang.js';
import BrandLogo from './BrandLogo.jsx';

// Définition des liens principaux du menu de navigation du site.
// Les libellés sont traduits via le contexte de langue (t.nav).

function Header() {

    // Récupération des infos utilisateur et fonction de déconnexion
    const { user, isAuthenticated, logout } = useAuth();
    const { lang, setLang, t, languages } = useLang();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                setMobileMenuOpen(false);
                setLangMenuOpen(false);
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
        setLangMenuOpen(false);
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

    // Navigation avec libellés traduits selon la langue active.
    const NAV_ITEMS = [
        { to: '/', label: t.nav.home, Icon: Home },
        { to: '/news', label: t.nav.news, Icon: Newspaper },
        { to: '/games', label: t.nav.games, Icon: Gamepad2 },
        { to: '/tests', label: t.nav.tests, Icon: ClipboardCheck },
        { to: '/esport', label: t.nav.esport, Icon: Trophy },
        { to: '/a-propos', label: t.nav.about, Icon: Info }
    ];

    // Libellé court de la langue courante (FR / EN) affiché dans le bouton.
    const currentLanguage = languages.find((entry) => entry.code === lang) || languages[0];

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
                        <NavLink key={item.to} to={item.to} className={navClass} end={item.to === '/'} aria-label={item.label}>
                            <item.Icon className="h-4 w-4" aria-hidden="true" /> {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Sélecteur de langue FR / EN */}
                <div className="relative hidden lg:block">
                    <button
                        type="button"
                        onClick={() => setLangMenuOpen((open) => !open)}
                        aria-expanded={langMenuOpen}
                        aria-haspopup="menu"
                        aria-label={`${t.header.language} : ${currentLanguage.label}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-[0.6rem] text-sm font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-white"
                    >
                        <Languages className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                        {currentLanguage.short}
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${langMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {langMenuOpen && (
                        <>
                            <button type="button" aria-label="Fermer le menu langue" className="fixed inset-0 z-40 cursor-default" onClick={() => setLangMenuOpen(false)} />
                            <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur-xl" role="menu">
                                {languages.map((entry) => (
                                    <button
                                        key={entry.code}
                                        type="button"
                                        onClick={() => { setLang(entry.code); setLangMenuOpen(false); }}
                                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition hover:bg-white/10 hover:text-white ${lang === entry.code ? 'text-cyan-300' : 'text-slate-200'}`}
                                        role="menuitem"
                                        aria-current={lang === entry.code ? 'true' : undefined}
                                    >
                                        <Languages className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                                        {entry.label}
                                        {lang === entry.code && <span className="ml-auto text-xs text-cyan-400" aria-hidden="true">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

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
                                            <User className="h-4 w-4 text-cyan-300" /> {t.header.profile}
                                        </button>
                                        {user?.role === 'admin' && (
                                            <button
                                                type="button"
                                                onClick={() => navigateTo('/admin')}
                                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
                                            >
                                                <Shield className="h-4 w-4 text-cyan-300" /> {t.header.admin}
                                            </button>
                                        )}
                                        <div className="my-1.5 h-px bg-slate-800" />
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
                                        >
                                            <LogOut className="h-4 w-4" /> {t.header.logout}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="hidden items-center gap-3 lg:flex">
                            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white">
                                <LogIn className="h-4 w-4" /> {t.header.login}
                            </Link>
                            <Link to="/register" className="btn btn-primary inline-flex items-center gap-2">
                                <UserPlus className="h-4 w-4" /> {t.header.register}
                            </Link>
                        </div>
                    )}

                    <button
                        type="button"
                        className="mobile-menu-toggle inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 text-cyan-200 transition hover:border-cyan-400/60 hover:bg-cyan-400/10 lg:hidden"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        aria-label={mobileMenuOpen ? t.header.closeMenu : t.header.openMenu}
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
                    <div className="mobile-account-actions">
                        {languages.map((entry) => (
                            <button
                                key={entry.code}
                                type="button"
                                onClick={() => setLang(entry.code)}
                                className={`mobile-nav-link ${lang === entry.code ? 'mobile-nav-link-active' : ''}`}
                                aria-current={lang === entry.code ? 'true' : undefined}
                            >
                                <Languages className="h-5 w-5" />
                                <span>{entry.label}</span>
                                {lang === entry.code && <span className="ml-auto text-xs text-cyan-400" aria-hidden="true">✓</span>}
                            </button>
                        ))}
                    </div>
                    {isAuthenticated ? (
                        <div className="mobile-account-actions">
                            <button type="button" onClick={() => navigateTo('/profile')} className="mobile-nav-link"><User className="h-5 w-5" /><span>Mon profil</span></button>
                            {user?.role === 'admin' && <button type="button" onClick={() => navigateTo('/admin')} className="mobile-nav-link"><Shield className="h-5 w-5" /><span>Administration</span></button>}
                            <button type="button" onClick={handleLogout} className="mobile-nav-link mobile-nav-link-danger"><LogOut className="h-5 w-5" /><span>Déconnexion</span></button>
                        </div>
                    ) : (
                        <div className="mobile-account-actions">
                            <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}><LogIn className="h-5 w-5" /><span>{t.header.login}</span></Link>
                            <Link to="/register" className="mobile-nav-link mobile-nav-link-primary" onClick={() => setMobileMenuOpen(false)}><UserPlus className="h-5 w-5" /><span>{t.header.register}</span></Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

export default Header;