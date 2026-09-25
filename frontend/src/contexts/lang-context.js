// contexts/lang-context.js - Contexte partagé pour la langue de l'interface (FR/EN)

import { createContext } from 'react';

// Contexte exposant la langue courante et la fonction de changement de langue.
export const LangContext = createContext(null);

// Langues disponibles dans l'application.
export const LANGUAGES = [
    { code: 'fr', label: 'Français', short: 'FR' },
    { code: 'en', label: 'English', short: 'EN' }
];
