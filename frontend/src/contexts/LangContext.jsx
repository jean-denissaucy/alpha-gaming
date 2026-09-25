// contexts/LangContext.jsx - Contexte global pour la langue de l'interface (français / anglais)

import { useEffect, useMemo, useState } from 'react';
import { LangContext, LANGUAGES } from './lang-context.js';

// Traductions des textes de l'interface (navigation, connexion, pied de page).
const TRANSLATIONS = {
    fr: {
        nav: {
            home: 'Accueil',
            news: 'Actualités',
            games: 'Jeux',
            tests: 'Test',
            esport: 'Esport',
            about: 'À propos'
        },
        header: {
            login: 'Connexion',
            register: 'Inscription',
            profile: 'Mon profil',
            admin: 'Administration',
            logout: 'Déconnexion',
            openMenu: 'Ouvrir le menu',
            closeMenu: 'Fermer le menu',
            closeProfileMenu: 'Fermer le menu profil',
            mainNav: 'Navigation principale',
            mobileNav: 'Navigation mobile',
            language: 'Langue'
        },
        footer: {
            tagline: 'PlayStation, Xbox, Nintendo, PC et Esport en continu'
        }
    },
    en: {
        nav: {
            home: 'Home',
            news: 'News',
            games: 'Games',
            tests: 'Tests',
            esport: 'Esport',
            about: 'About'
        },
        header: {
            login: 'Log in',
            register: 'Sign up',
            profile: 'My profile',
            admin: 'Administration',
            logout: 'Log out',
            openMenu: 'Open menu',
            closeMenu: 'Close menu',
            closeProfileMenu: 'Close profile menu',
            mainNav: 'Main navigation',
            mobileNav: 'Mobile navigation',
            language: 'Language'
        },
        footer: {
            tagline: 'PlayStation, Xbox, Nintendo, PC and Esport news around the clock'
        }
    }
};

// Provider qui enveloppe l'application et fournit la langue courante.
export function LangProvider({ children }) {
    // Langue restaurée depuis le localStorage (français par défaut).
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('lang');
        return saved === 'en' ? 'en' : 'fr';
    });

    // Traductions correspondant à la langue active (objet stable entre les rendus).
    const t = useMemo(() => TRANSLATIONS[lang], [lang]);

    // Changement de langue : persiste le choix et met à jour l'attribut lang du document
    // (important pour les lecteurs d'écran - RGAA 8.3).
    const changeLang = (code) => {
        const next = code === 'en' ? 'en' : 'fr';
        setLang(next);
        localStorage.setItem('lang', next);
    };

    // Synchronise l'attribut lang de <html> avec la langue choisie.
    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    return (
        <LangContext.Provider value={{ lang, setLang: changeLang, t, languages: LANGUAGES }}>
            {children}
        </LangContext.Provider>
    );
}
